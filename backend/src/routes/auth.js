// ============================================
// Authentication Routes
// src/routes/auth.js
// ============================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;