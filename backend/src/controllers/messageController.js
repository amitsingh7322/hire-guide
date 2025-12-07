const db = require('../models/db');
const { body, validationResult } = require('express-validator');

exports.getAllMessages = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `
  WITH convo AS (
    SELECT 
      CASE 
        WHEN sender_id = $1 THEN receiver_id
        ELSE sender_id
      END AS user_id,
      sender_id,
      receiver_id
    FROM messages
    WHERE sender_id = $1 OR receiver_id = $1
  )
  SELECT DISTINCT 
    c.user_id,

    -- User name
    (SELECT CONCAT(p.first_name, ' ', p.last_name)
     FROM profiles p
     WHERE p.id = c.user_id
    ) AS user_name,

    -- User email
    (SELECT p.email
     FROM profiles p
     WHERE p.id = c.user_id
    ) AS user_email,

    -- Last message between both users
    (SELECT m.message
     FROM messages m
     WHERE (m.sender_id = $1 OR m.receiver_id = $1)
       AND (m.sender_id = c.user_id OR m.receiver_id = c.user_id)
     ORDER BY m.created_at DESC
     LIMIT 1
    ) AS last_message,

    -- Last message time
    (SELECT MAX(m.created_at)
     FROM messages m
     WHERE (m.sender_id = $1 OR m.receiver_id = $1)
       AND (m.sender_id = c.user_id OR m.receiver_id = c.user_id)
    ) AS last_message_time,

    -- Unread count (messages from them → me)
    (SELECT COUNT(*)
     FROM messages m
     WHERE m.receiver_id = $1
       AND m.sender_id = c.user_id
       AND m.is_read = false
    ) AS unread_count

  FROM convo c
  ORDER BY last_message_time DESC
  `,
      [userId]
    );



    res.json({
      success: true,
      conversations: result.rows.map(row => ({
        user_id: row.user_id,
        userName: row.user_name,
        userEmail: row.user_email,
        lastMessage: row.last_message,
        lastMessageTime: row.last_message_time,
        unreadCount: Number(row.unread_count) || 0
      }))
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};


exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Fetch messages between users
    const result = await db.query(
      `
      SELECT m.*,
             sender.first_name AS sender_name,
             receiver.first_name AS receiver_name
      FROM messages m
      JOIN profiles sender ON m.sender_id = sender.id
      JOIN profiles receiver ON m.receiver_id = receiver.id
      WHERE (m.sender_id = $1 AND m.receiver_id = $2)
         OR (m.sender_id = $2 AND m.receiver_id = $1)
      ORDER BY m.created_at DESC
      LIMIT $3 OFFSET $4
      `,
      [req.user.id, userId, limit, offset]
    );

    // Mark messages as read (messages sent to ME from THEM)
    await db.query(
      `
      UPDATE messages
      SET is_read = true
      WHERE receiver_id = $1 
        AND sender_id = $2
        AND is_read = false
      `,
      [req.user.id, userId]
    );

    // Format output
    const formatted = result.rows
      .reverse()
      .map(row => ({
        id: row.id,
        sender_id: row.sender_id,
        receiver_id: row.receiver_id,
        content: row.message,
        message: row.message,
        is_read: row.is_read,
        created_at: row.created_at
      }));

    return res.json({
      success: true,
      messages: formatted
    });

  } catch (error) {
    console.error("Conversation fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch conversation" });
  }
};



exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Insert message
    const result = await db.query(
      `
      INSERT INTO messages (sender_id, receiver_id, message, is_read, created_at)
      VALUES ($1, $2, $3, false, CURRENT_TIMESTAMP)
      RETURNING id, sender_id, receiver_id, message, is_read, created_at
      `,
      [req.user.id, receiverId, content]
    );

    const msg = result.rows[0];

    return res.status(201).json({
      success: true,
      message: {
        id: msg.id,
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        content: msg.message,
        message: msg.message,
        is_read: msg.is_read,
        created_at: msg.created_at
      }
    });

  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({ error: "Failed to send message" });
  }
};



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
