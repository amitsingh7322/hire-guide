// ============================================
// Message Routes - UPDATED
// src/routes/messages.js
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const messageController = require('../controllers/messageController');

// Get all messages for user
router.get('/', authenticate, messageController.getAllMessages);

// Get conversation with specific user
router.get('/conversation/:userId', authenticate, messageController.getConversation);

// Send message
router.post('/', authenticate, messageController.sendMessage);

// Mark message as read
router.put('/:messageId/read', authenticate, messageController.markAsRead);

// Mark all messages from user as read
router.put('/user/:userId/read-all', authenticate, messageController.markAllAsRead);

// Delete message
router.delete('/:messageId', authenticate, messageController.deleteMessage);

module.exports = router;
