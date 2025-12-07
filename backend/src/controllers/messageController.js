const db = require('../models/db');
const { body, validationResult } = require('express-validator');

exports.getAllMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT m.*, 
              sender.first_name as sender_first_name, sender.last_name as sender_last_name,
              recipient.first_name as recipient_first_name, recipient.last_name as recipient_last_name
       FROM messages m
       JOIN profiles sender ON m.sender_id = sender.id
       JOIN profiles recipient ON m.recipient_id = recipient.id
       WHERE m.sender_id = $1 OR m.recipient_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    res.json({ success: true, messages: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT m.*
       FROM messages m
       WHERE (m.sender_id = $1 AND m.recipient_id = $2) 
          OR (m.sender_id = $2 AND m.recipient_id = $1)
       ORDER BY m.created_at DESC
       LIMIT $3 OFFSET $4`,
      [req.user.id, userId, limit, offset]
    );

    res.json({ success: true, messages: result.rows.reverse() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
};

exports.sendMessage = [
  body('recipient_id').notEmpty().withMessage('Recipient required'),
  body('message').trim().notEmpty().withMessage('Message required'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { recipient_id, message } = req.body;

      const result = await db.query(
        `INSERT INTO messages (sender_id, receiver_id, message, is_read, created_at)
         VALUES ($1, $2, $3, false, CURRENT_TIMESTAMP)
         RETURNING *`,
        [req.user.id, recipient_id, message]
      );

      res.status(201).json({ success: true, message: result.rows });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  },
];

exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const result = await db.query(
      `UPDATE messages SET is_read = true WHERE id = $1 RETURNING *`,
      [messageId]
    );

    res.json({ success: true, message: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    await db.query(
      `UPDATE messages SET is_read = true WHERE recipient_id = $1 AND sender_id = $2`,
      [req.user.id, userId]
    );

    res.json({ success: true, message: 'All marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    await db.query(`DELETE FROM messages WHERE id = $1`, [messageId]);

    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

module.exports = exports;
