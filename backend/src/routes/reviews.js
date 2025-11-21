// ============================================
// Review Routes
// src/routes/reviews.js
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const db = require('../models/db');

// Get guide reviews
router.get('/guide/:guideId', async (req, res) => {
  try {
    const { guideId } = req.params;

    const result = await db.query(
      `SELECT r.*, p.first_name || ' ' || p.last_name as tourist_name, p.avatar_url
       FROM reviews r
       JOIN profiles p ON r.tourist_id = p.id
       WHERE r.guide_id = $1
       ORDER BY r.created_at DESC`,
      [guideId]
    );

    res.json({ success: true, reviews: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Create review (after completed booking)
router.post('/', authenticate, async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    // Verify booking exists and is completed
    const bookingResult = await db.query(
      'SELECT guide_id FROM bookings WHERE id = $1 AND tourist_id = $2 AND status = $3',
      [bookingId, req.user.id, 'completed']
    );

    if (bookingResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or incomplete booking' });
    }

    const guideId = bookingResult.rows[0].guide_id;

    // Create review
    const result = await db.query(
      `INSERT INTO reviews (booking_id, guide_id, tourist_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [bookingId, guideId, req.user.id, rating, comment]
    );

    // Update guide rating
    await db.query(
      `UPDATE guides 
       SET rating = (
         SELECT AVG(rating) FROM reviews WHERE guide_id = $1
       ),
       total_reviews = (
         SELECT COUNT(*) FROM reviews WHERE guide_id = $1
       )
       WHERE id = $1`,
      [guideId]
    );

    res.status(201).json({ success: true, review: result.rows[0] });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

module.exports = router;

