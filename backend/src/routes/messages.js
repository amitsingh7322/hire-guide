// ============================================
// Message Routes
// src/routes/messages.js
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const db = require('../models/db');

// Get user messages
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT m.*, 
              ps.first_name || ' ' || ps.last_name as sender_name,
              pr.first_name || ' ' || pr.last_name as receiver_name
       FROM messages m
       JOIN profiles ps ON m.sender_id = ps.id
       JOIN profiles pr ON m.receiver_id = pr.id
       WHERE m.sender_id = $1 OR m.receiver_id = $1
       ORDER BY m.created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, messages: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get messages for a specific booking
router.get('/booking/:bookingId', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const result = await db.query(
      `SELECT m.*, 
              ps.first_name || ' ' || ps.last_name as sender_name,
              ps.avatar_url as sender_avatar
       FROM messages m
       JOIN profiles ps ON m.sender_id = ps.id
       WHERE m.booking_id = $1
       ORDER BY m.created_at ASC`,
      [bookingId]
    );

    res.json({ success: true, messages: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

module.exports = router;