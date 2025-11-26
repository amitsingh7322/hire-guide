
// ============================================
// Guide Routes
// src/routes/guides.js
// ============================================

const express = require('express');
const router = express.Router();
const guideController = require('../controllers/guideController');
const { authenticate, authorize } = require('../middlewares/auth');

// Public routes
router.get('/search', guideController.searchGuides);
router.get('/:id', guideController.getGuideById);

// Protected routes (Guide role required)
router.post('/', authenticate, authorize('guide'), guideController.createGuideProfile);
router.put('/:id', authenticate, authorize('guide'), guideController.updateGuideProfile);

module.exports = router;

