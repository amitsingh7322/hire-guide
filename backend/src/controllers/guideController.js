const db = require('../models/db');
const { body, validationResult } = require('express-validator');
const { calculateDynamicPrice } = require('../utils/pricing');

// ===== SEARCH & GET =====

// Search guides
exports.searchGuides = async (req, res) => {
  try {
    const {
      city,
      pinCode,
      latitude,
      longitude,
      maxDistance = 50,
      minPrice,
      maxPrice,
      minRating,
      languages,
      specialties,
      hasVehicle,
      sortBy = 'rating',
      page = 1,
      limit = 20,
    } = req.query;

    let query = `
      SELECT 
        g.*,
        p.first_name, p.last_name, p.avatar_url, p.phone,
        COUNT(DISTINCT r.id) as review_count,
        COALESCE(AVG(r.rating), 0) as avg_rating
      FROM guides g
      JOIN profiles p ON g.user_id = p.id
      LEFT JOIN guide_reviews r ON g.id = r.guide_id
      WHERE g.is_verified = true
    `;

    const params = [];
    let paramCount = 1;

    if (city) {
      query += ` AND LOWER(g.city) = LOWER($${paramCount})`;
      params.push(city);
      paramCount++;
    }

    if (pinCode) {
      query += ` AND g.pin_code = $${paramCount}`;
      params.push(pinCode);
      paramCount++;
    }

    if (minPrice) {
      query += ` AND g.hourly_rate >= $${paramCount}`;
      params.push(minPrice);
      paramCount++;
    }

    if (maxPrice) {
      query += ` AND g.hourly_rate <= $${paramCount}`;
      params.push(maxPrice);
      paramCount++;
    }

    if (minRating) {
      query += ` AND COALESCE(AVG(r.rating), 0) >= $${paramCount}`;
      params.push(minRating);
      paramCount++;
    }

    if (languages) {
      const langArray = Array.isArray(languages) ? languages : [languages];
      query += ` AND g.languages && $${paramCount}::text[]`;
      params.push(langArray);
      paramCount++;
    }

    if (specialties) {
      const specArray = Array.isArray(specialties) ? specialties : [specialties];
      query += ` AND g.specialties && $${paramCount}::text[]`;
      params.push(specArray);
      paramCount++;
    }

    query += ` GROUP BY g.id, p.first_name, p.last_name, p.avatar_url, p.phone`;

    if (sortBy === 'rating') {
      query += ` ORDER BY avg_rating DESC, review_count DESC`;
    } else if (sortBy === 'price') {
      query += ` ORDER BY g.hourly_rate ASC`;
    } else {
      query += ` ORDER BY g.created_at DESC`;
    }

    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      success: true,
      guides: result.rows.map(guide => ({
        ...guide,
        location: {
          city: guide.city,
          state: guide.state,
          pinCode: guide.pin_code,
        },
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Search guides error:', error);
    res.status(500).json({ error: 'Failed to search guides' });
  }
};

// Get guide by ID
exports.getGuideById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT 
        g.*,
        p.first_name, p.last_name, p.email, p.phone, p.avatar_url,
        COALESCE(json_agg(DISTINCT jsonb_build_object(
          'id', r.id,
          'rating', r.rating,
          'comment', r.comment,
          'created_at', r.created_at,
          'tourist_name', pt.first_name || ' ' || pt.last_name,
          'tourist_avatar', pt.avatar_url
        )) FILTER (WHERE r.id IS NOT NULL), '[]') as reviews
       FROM guides g
       JOIN profiles p ON g.user_id = p.id
       LEFT JOIN guide_reviews r ON g.id = r.guide_id
       LEFT JOIN profiles pt ON r.tourist_id = pt.id
       WHERE g.id = $1
       GROUP BY g.id, p.first_name, p.last_name, p.email, p.phone, p.avatar_url`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    const guide = result.rows[0];

    res.json({
      success: true,
      guide: {
        ...guide,
        location: {
          city: guide.city,
          state: guide.state,
          pinCode: guide.pin_code,
          address: guide.address,
        },
      },
    });
  } catch (error) {
    console.error('Get guide error:', error);
    res.status(500).json({ error: 'Failed to fetch guide' });
  }
};

// ===== PROFILE MANAGEMENT =====

// Create guide profile
exports.createGuideProfile = async (req, res) => {
  try {
    const {
      bio,
      address,
      city,
      state,
      pinCode,
      latitude,
      longitude,
      hourlyRate,
      dailyRate,
      experienceYears,
      specialties,
      languages,
      certifications,
    } = req.body;

    // Check if user already has a guide profile
    const existing = await db.query(
      'SELECT id FROM guides WHERE user_id = $1',
      [req.user.id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Guide profile already exists' });
    }

    const result = await db.query(
      `INSERT INTO guides (
        user_id, bio, address, city, state, pin_code,
        latitude, longitude, hourly_rate, daily_rate, experience_years,
        specialties, languages, certifications, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        req.user.id,
        bio,
        address,
        city,
        state,
        pinCode,
        latitude,
        longitude,
        hourlyRate,
        dailyRate,
        experienceYears,
        specialties,
        languages,
        certifications,
      ]
    );

    res.status(201).json({
      success: true,
      guide: result.rows,
      message: 'Guide profile created successfully',
    });
  } catch (error) {
    console.error('Create guide profile error:', error);
    res.status(500).json({ error: 'Failed to create guide profile' });
  }
};

// Update guide profile
exports.updateGuideProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verify ownership
    const guide = await db.query(
      'SELECT user_id FROM guides WHERE id = $1',
      [id]
    );

    if (guide.rows.length === 0) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    if (guide.rows.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const allowedFields = [
      'bio',
      'address',
      'city',
      'state',
      'pin_code',
      'latitude',
      'longitude',
      'hourly_rate',
      'daily_rate',
      'experience_years',
      'specialties',
      'languages',
      'certifications',
      'is_verified',
    ];

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach((key) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(snakeKey)) {
        updateFields.push(`${snakeKey} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    const query = `
      UPDATE guides 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);

    res.json({
      success: true,
      guide: result.rows,
    });
  } catch (error) {
    console.error('Update guide profile error:', error);
    res.status(500).json({ error: 'Failed to update guide profile' });
  }
};

// Delete guide profile
exports.deleteGuideProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM guides WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: 'Guide not found or not authorized' });
    }

    res.json({
      success: true,
      message: 'Guide profile deleted successfully',
    });
  } catch (error) {
    console.error('Delete guide error:', error);
    res.status(500).json({ error: 'Failed to delete guide' });
  }
};

// ===== DASHBOARD =====

// Get guide dashboard with stats
exports.getGuideDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch guide profile
    const guideResult = await db.query(
      `SELECT 
        g.*,
        p.first_name, p.last_name, p.phone, p.email
       FROM guides g
       JOIN profiles p ON g.user_id = p.id
       WHERE g.user_id = $1`,
      [userId]
    );

    if (guideResult.rows.length === 0) {
      return res.status(404).json({ error: 'Guide profile not found' });
    }

    const guide = guideResult.rows[0];

    // Fetch bookings - FIX: Corrected field names
    const bookingsResult = await db.query(
      `SELECT 
        tb.id,
        tb.guide_id,
        tb.tourist_id,
        tb.start_date,
        tb.end_date,
        tb.number_of_people,
        tb.total_price,
        tb.status,
        tb.notes,
        tb.created_at,
        tb.updated_at,
        p.first_name as tourist_first_name,
        p.last_name as tourist_last_name,
        p.email as tourist_email,
        p.phone as tourist_phone
       FROM tour_bookings tb
       JOIN profiles p ON tb.tourist_id = p.id
       WHERE tb.guide_id = $1
       ORDER BY tb.created_at DESC`,
      [guide.id]
    );

    // Calculate stats - FIX: Changed from bookingsResult.rows to bookingsResult.rows
    const bookings = bookingsResult.rows;
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(
      (b) => b.status === 'confirmed'
    ).length;
    const pendingRequests = bookings.filter(
      (b) => b.status === 'pending'
    ).length;
    const totalRevenue = bookings
      .filter((b) => b.status === 'confirmed')
      .reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);

    const upcomingBookings = bookings.filter((b) => {
      const endDate = new Date(b.end_date);
      return endDate >= new Date();
    }).length;

    res.json({
      success: true,
      guide: {
        ...guide,
        stats: {
          totalBookings,
          confirmedBookings,
          pendingRequests,
          totalRevenue,
          upcomingBookings,
        },
      },
      bookings: bookings.slice(0, 10),
    });
  } catch (error) {
    console.error('Get guide dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
};

// Get guide's bookings with pagination
exports.getGuideBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    // Get guide ID
    const guideResult = await db.query(
      'SELECT id FROM guides WHERE user_id = $1',
      [userId]
    );

    if (guideResult.rows.length === 0) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    // FIX: Changed from guideResult.rows.id to guideResult.rows.id
    const guideId = guideResult.rows.id;

    let query = `
      SELECT 
        tb.id,
        tb.guide_id,
        tb.tourist_id,
        tb.start_date,
        tb.end_date,
        tb.number_of_people,
        tb.total_price,
        tb.status,
        tb.notes,
        tb.created_at,
        tb.updated_at,
        p.first_name as tourist_first_name,
        p.last_name as tourist_last_name,
        p.email as tourist_email,
        p.phone as tourist_phone
       FROM tour_bookings tb
       JOIN profiles p ON tb.tourist_id = p.id
       WHERE tb.guide_id = $1
    `;

    const params = [guideId];
    let paramCount = 2;

    if (status) {
      query += ` AND tb.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ` ORDER BY tb.created_at DESC`;

    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      success: true,
      bookings: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get guide bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!['pending', 'confirmed', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get guide ID
    const guideResult = await db.query(
      'SELECT id FROM guides WHERE user_id = $1',
      [userId]
    );

    if (guideResult.rows.length === 0) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    // FIX: Changed from guideResult.rows.id to guideResult.rows.id
    const guideId = guideResult.rows[0].id;

    // Update booking
    const result = await db.query(
      `UPDATE tour_bookings 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND guide_id = $3
       RETURNING *`,
      [status, bookingId, guideId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({
      success: true,
      booking: result.rows[0],
      message: `Booking ${status} successfully`,
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
};

// ===== BOOKING CREATION =====

// Create tour booking (Tourist books a guide)
exports.createTourBooking = [
  body('start_date').notEmpty().withMessage('Start date is required'),
  body('end_date').notEmpty().withMessage('End date is required'),
  body('number_of_people')
    .isInt({ min: 1 })
    .withMessage('At least 1 person required'),
  body('total_price')
    .isFloat({ min: 0 })
    .withMessage('Total price is required'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { guideId } = req.params;
      const { start_date, end_date, number_of_people, total_price, notes } =
        req.body;

      // Verify guide exists
      const guideExists = await db.query(
        'SELECT id FROM guides WHERE id = $1',
        [guideId]
      );

      if (guideExists.rows.length === 0) {
        return res.status(404).json({ error: 'Guide not found' });
      }

      // Create booking
      const booking = await db.query(
        `INSERT INTO tour_bookings (
          guide_id, tourist_id, start_date, end_date,
          number_of_people, total_price, status, notes, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *`,
        [
          guideId,
          req.user.id,
          start_date,
          end_date,
          number_of_people,
          total_price,
          notes,
        ]
      );

      res.status(201).json({
        success: true,
        booking: booking.rows,
        message: 'Booking request sent successfully',
      });
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({ error: 'Failed to create booking' });
    }
  },
];

// Get user's tour bookings
exports.getUserTourBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    let query = `
      SELECT 
        tb.*,
        g.city as guide_city,
        g.daily_rate,
        g.hourly_rate,
        p.first_name as guide_first_name,
        p.last_name as guide_last_name,
        p.phone as guide_phone,
        p.avatar_url as guide_avatar
       FROM tour_bookings tb
       JOIN guides g ON tb.guide_id = g.id
       JOIN profiles p ON g.user_id = p.id
       WHERE tb.tourist_id = $1
    `;

    const params = [req.user.id];
    let paramCount = 2;

    if (status) {
      query += ` AND tb.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ` ORDER BY tb.created_at DESC`;

    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      success: true,
      bookings: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// ===== MESSAGING =====

// Send message
exports.sendMessage = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message cannot be empty'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { guideId } = req.params;
      const { message } = req.body;

      // Verify guide exists
      const guideExists = await db.query(
        'SELECT user_id FROM guides WHERE id = $1',
        [guideId]
      );

      if (guideExists.rows.length === 0) {
        return res.status(404).json({ error: 'Guide not found' });
      }

      const recipientId = guideExists.rows.user_id;

      // Create message
      const result = await db.query(
        `INSERT INTO messages (
          sender_id, recipient_id, message, is_read, created_at
        )
        VALUES ($1, $2, $3, false, CURRENT_TIMESTAMP)
        RETURNING *`,
        [req.user.id, recipientId, message]
      );

      res.status(201).json({
        success: true,
        message: result.rows,
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  },
];

// Get messages with specific guide
exports.getMessages = async (req, res) => {
  try {
    const { guideId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Get guide's user_id
    const guideResult = await db.query(
      'SELECT user_id FROM guides WHERE id = $1',
      [guideId]
    );

    if (guideResult.rows.length === 0) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    const guideUserId = guideResult.rows.user_id;

    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT 
        m.*,
        sender.first_name as sender_first_name,
        sender.last_name as sender_last_name,
        sender.avatar_url as sender_avatar
       FROM messages m
       JOIN profiles sender ON m.sender_id = sender.id
       WHERE (m.sender_id = $1 AND m.recipient_id = $2)
          OR (m.sender_id = $2 AND m.recipient_id = $1)
       ORDER BY m.created_at DESC
       LIMIT $3 OFFSET $4`,
      [req.user.id, guideUserId, limit, offset]
    );

    res.json({
      success: true,
      messages: result.rows.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Mark message as read
exports.markMessageRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const result = await db.query(
      `UPDATE messages 
       SET is_read = true
       WHERE id = $1 AND recipient_id = $2
       RETURNING *`,
      [messageId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({
      success: true,
      message: result.rows,
    });
  } catch (error) {
    console.error('Mark message read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
};

// Get single guide booking details
exports.getGuideBookingDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log('=== DEBUG: Guide Booking Details ===');
    console.log('Booking ID from URL:', id);
    console.log('User ID from token:', userId);

    // Step 1: Check if booking exists at all
    const checkBooking = await db.query(
      `SELECT id, tourist_id, guide_id FROM bookings WHERE id = $1`,
      [id]
    );
    console.log('Booking exists?', checkBooking.rows.length > 0);
    if (checkBooking.rows.length > 0) {
      console.log('Booking data:', checkBooking.rows);
      console.log('Booking tourist_id matches?', checkBooking.rows.tourist_id === userId);
    }

    // Step 2: Run the full query
    const result = await db.query(
      `SELECT 
        b.id,
        b.guide_id,
        b.booking_date,
        b.duration_hours,
        b.number_of_people,
        b.guide_amount,
        b.vehicle_amount,
        b.platform_fee,
        b.total_amount,
        b.status,
        b.special_requests,
        b.created_at,
        b.updated_at,
        g.id as guide_id_check,
        g.hourly_rate,
        g.daily_rate,
        g.bio,
        g.address,
        g.city,
        p.first_name as guide_first_name,
        p.last_name as guide_last_name,
        p.email as guide_email,
        p.phone as guide_phone
       FROM bookings b
       JOIN guides g ON b.guide_id = g.id
       JOIN profiles p ON g.user_id = p.id
       WHERE b.id = $1 AND b.tourist_id = $2`,
      [id, userId]
    );

    console.log('Full query returned rows:', result.rows.length);

    if (result.rows.length === 0) {
      console.log('Query returned no results. Possible reasons:');
      console.log('1. Booking ID does not exist');
      console.log('2. User ID does not match booking tourist_id');
      console.log('3. Guide does not exist or profile not linked');
      
      return res.status(404).json({ 
        success: false, 
        error: 'Booking not found',
        debug: {
          bookingId: id,
          userId: userId,
          bookingExists: checkBooking.rows.length > 0
        }
      });
    }

    const booking = result.rows;
    console.log('Successfully fetched booking:', booking.id);

    res.json({
      success: true,
      booking: {
        id: booking.id,
        guide_id: booking.guide_id,
        guide_first_name: booking.guide_first_name,
        guide_last_name: booking.guide_last_name,
        guide_email: booking.guide_email,
        guide_phone: booking.guide_phone,
        description: booking.bio,
        address: booking.address,
        city: booking.city,
        booking_date: booking.booking_date,
        duration_hours: booking.duration_hours,
        number_of_people: booking.number_of_people,
        hourly_rate: booking.hourly_rate,
        daily_rate: booking.daily_rate,
        guide_amount: booking.guide_amount,
        vehicle_amount: booking.vehicle_amount,
        platform_fee: booking.platform_fee,
        total_amount: booking.total_amount,
        status: booking.status,
        special_requests: booking.special_requests,
        confirmation_code: booking.id.slice(0, 8).toUpperCase(),
        created_at: booking.created_at,
        updated_at: booking.updated_at,
      }
    });
  } catch (error) {
    console.error('Error fetching guide booking:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch booking details' 
    });
  }
};


// ===== REVIEWS =====

// Add review to guide
exports.addGuideReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be 1-5'),
  body('comment').trim().notEmpty().withMessage('Comment is required'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { guideId } = req.params;
      const { rating, comment } = req.body;

      // Verify guide exists
      const guideExists = await db.query(
        'SELECT id FROM guides WHERE id = $1',
        [guideId]
      );

      if (guideExists.rows.length === 0) {
        return res.status(404).json({ error: 'Guide not found' });
      }

      const result = await db.query(
        `INSERT INTO guide_reviews (
          guide_id, tourist_id, rating, comment, created_at
        )
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        RETURNING *`,
        [guideId, req.user.id, rating, comment]
      );

      // Update guide's average rating
      await db.query(
        `UPDATE guides 
         SET rating = (SELECT AVG(rating) FROM guide_reviews WHERE guide_id = $1),
             total_reviews = (SELECT COUNT(*) FROM guide_reviews WHERE guide_id = $1)
         WHERE id = $1`,
        [guideId]
      );

      res.status(201).json({
        success: true,
        review: result.rows,
      });
    } catch (error) {
      console.error('Add review error:', error);
      res.status(500).json({ error: 'Failed to add review' });
    }
  },
];

// Get guide reviews
exports.getGuideReviews = async (req, res) => {
  try {
    const { guideId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT 
        gr.*,
        p.first_name, p.last_name, p.avatar_url
       FROM guide_reviews gr
       JOIN profiles p ON gr.tourist_id = p.id
       WHERE gr.guide_id = $1
       ORDER BY gr.created_at DESC
       LIMIT $2 OFFSET $3`,
      [guideId, limit, offset]
    );

    res.json({
      success: true,
      reviews: result.rows,
      pagination: { page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

module.exports = exports;
