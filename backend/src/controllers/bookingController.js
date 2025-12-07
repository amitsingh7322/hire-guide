const db = require('../models/db');
const { body, validationResult } = require('express-validator');

// Get user bookings (as tourist or guide)
exports.getUserBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, role } = req.query;

    if (role === 'guide') {
      // Get bookings where user is guide
      const guideResult = await db.query(
        'SELECT id FROM guides WHERE user_id = $1',
        [req.user.id]
      );

      if (guideResult.rows.length === 0) {
        return res.json({ success: true, bookings: [], pagination: {} });
      }

      const guideId = guideResult.rows.id;
      let query = `
        SELECT tb.*, p.first_name, p.last_name, p.email, p.phone, p.avatar_url
        FROM tour_bookings tb
        JOIN profiles p ON tb.tourist_id = p.id
        WHERE tb.guide_id = $1
      `;

      const params = [guideId];
      if (status) {
        query += ` AND tb.status = $2`;
        params.push(status);
      }

      query += ` ORDER BY tb.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, (page - 1) * limit);

      const result = await db.query(query, params);
      return res.json({
        success: true,
        bookings: result.rows,
        pagination: { page: parseInt(page), limit: parseInt(limit) },
      });
    } else {
      // Get bookings where user is tourist
      let query = `
        SELECT tb.*, g.city, p.first_name, p.last_name, p.email, p.phone, p.avatar_url
        FROM tour_bookings tb
        JOIN guides g ON tb.guide_id = g.id
        JOIN profiles p ON g.user_id = p.id
        WHERE tb.tourist_id = $1
      `;

      const params = [req.user.id];
      if (status) {
        query += ` AND tb.status = $2`;
        params.push(status);
      }

      query += ` ORDER BY tb.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, (page - 1) * limit);

      const result = await db.query(query, params);
      return res.json({
        success: true,
        bookings: result.rows,
        pagination: { page: parseInt(page), limit: parseInt(limit) },
      });
    }
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// Get booking details
exports.getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const result = await db.query(
      `SELECT tb.*, g.city, p.first_name, p.last_name
       FROM tour_bookings tb
       JOIN guides g ON tb.guide_id = g.id
       JOIN profiles p ON g.user_id = p.id
       WHERE tb.id = $1`,
      [bookingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ success: true, booking: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
};

// Create booking
exports.createBooking = [
  body('guide_id').notEmpty().withMessage('Guide ID required'),
  body('start_date').notEmpty().withMessage('Start date required'),
  body('end_date').notEmpty().withMessage('End date required'),
  body('number_of_people').isInt({ min: 1 }).withMessage('At least 1 person'),
  body('total_price').isFloat({ min: 0 }).withMessage('Valid price required'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { guide_id, start_date, end_date, number_of_people, total_price, notes } = req.body;

      const result = await db.query(
        `INSERT INTO tour_bookings (guide_id, tourist_id, start_date, end_date, number_of_people, total_price, notes, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [guide_id, req.user.id, start_date, end_date, number_of_people, total_price, notes]
      );

      res.status(201).json({
        success: true,
        booking: result.rows,
        message: 'Booking created successfully',
      });
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({ error: 'Failed to create booking' });
    }
  },
];

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'rejected', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await db.query(
      `UPDATE tour_bookings
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, bookingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ success: true, booking: result.rows });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const result = await db.query(
      `UPDATE tour_bookings
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND tourist_id = $2
       RETURNING *`,
      [bookingId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ success: true, message: 'Booking cancelled' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};

// Get guide dashboard stats
exports.getGuideDashboardStats = async (req, res) => {
  try {
    const guideResult = await db.query(
      'SELECT id FROM guides WHERE user_id = $1',
      [req.user.id]
    );

    if (guideResult.rows.length === 0) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    const guideId = guideResult.rows.id;

    const stats = await db.query(
      `SELECT 
        COUNT(*) as total_bookings,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'completed' THEN total_price ELSE 0 END) as total_revenue
       FROM tour_bookings
       WHERE guide_id = $1`,
      [guideId]
    );

    res.json({ success: true, stats: stats.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

module.exports = exports;
