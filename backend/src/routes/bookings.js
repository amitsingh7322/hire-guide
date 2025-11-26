// ============================================
// Booking Routes
// src/routes/bookings.js
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const db = require('../models/db');
const { calculateDynamicPrice } = require('../utils/pricing');

// Create booking
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      guideId, bookingDate, durationHours, numberOfPeople,
      vehicleId, specialRequests
    } = req.body;

    // Get guide details
    const guideResult = await db.query(
      'SELECT hourly_rate FROM guides WHERE id = $1',
      [guideId]
    );

    if (guideResult.rows.length === 0) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    const guide = guideResult.rows[0];

    // Calculate pricing
    const guideAmount = calculateDynamicPrice(
      guide.hourly_rate,
      new Date(bookingDate),
      numberOfPeople,
      durationHours
    );

    let vehicleAmount = 0;
    if (vehicleId) {
      const vehicleResult = await db.query(
        'SELECT rental_rate_per_day FROM vehicles WHERE id = $1',
        [vehicleId]
      );
      if (vehicleResult.rows.length > 0) {
        vehicleAmount = vehicleResult.rows[0].rental_rate_per_day;
      }
    }

    const totalAmount = guideAmount + vehicleAmount;
    const platformFee = Math.round(totalAmount * 0.1); // 10% platform fee

    // Create booking
    const result = await db.query(
      `INSERT INTO bookings (
        tourist_id, guide_id, booking_type, booking_date, duration_hours,
        number_of_people, vehicle_id, guide_amount, vehicle_amount,
        platform_fee, total_amount, special_requests
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        req.user.id, guideId, vehicleId ? 'both' : 'guide', bookingDate,
        durationHours, numberOfPeople, vehicleId, guideAmount, vehicleAmount,
        platformFee, totalAmount + platformFee, specialRequests
      ]
    );

    res.status(201).json({
      success: true,
      booking: result.rows[0],
      payment: {
        amount: totalAmount + platformFee,
        currency: 'INR',
      },
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get user bookings
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT b.*, 
              g.city as guide_city,
              pg.first_name || ' ' || pg.last_name as guide_name,
              pg.phone as guide_phone
       FROM bookings b
       JOIN guides g ON b.guide_id = g.id
       JOIN profiles pg ON g.user_id = pg.id
       WHERE b.tourist_id = $1
       ORDER BY b.booking_date DESC`,
      [req.user.id]
    );

    res.json({ success: true, bookings: result.rows });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Update booking status
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await db.query(
      `UPDATE bookings 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND (tourist_id = $3 OR guide_id IN (
         SELECT id FROM guides WHERE user_id = $3
       ))
       RETURNING *`,
      [status, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ success: true, booking: result.rows[0] });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

module.exports = router;

