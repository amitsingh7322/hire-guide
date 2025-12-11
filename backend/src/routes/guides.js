// ============================================
// Guide Routes - COMPLETE
// src/routes/guides.js
// ============================================

const express = require('express');
const router = express.Router();
const guideController = require('../controllers/guideController');
const { authenticate, authorize } = require('../middlewares/auth');

// ===== PUBLIC ROUTES =====

// Search guides
router.get('/search', guideController.searchGuides);

// ===== PROTECTED ROUTES (Guide Only) =====

// Get guide dashboard
router.get(
  '/dashboard',
  authenticate,
  authorize('guide'),
  guideController.getGuideDashboard
);

// Get guide's bookings
router.get(
  '/bookings',
  authenticate,
  authorize('guide'),
  guideController.getGuideBookings
);

// Create guide profile
router.post(
  '/profile',
  authenticate,
  authorize('guide'),
  guideController.createGuideProfile
);

// Update guide profile
router.put(
  '/:id/profile',
  authenticate,
  authorize('guide'),
  guideController.updateGuideProfile
);

// Get guide details (self)
router.get('/profile', 
  authenticate,
  authorize('guide'),
  guideController.getGuideByUserId);

// Get guide by ID
router.get('/:id', guideController.getGuideById);

// Delete guide profile
router.delete(
  '/:id',
  authenticate,
  authorize('guide'),
  guideController.deleteGuideProfile
);

// Update booking status
router.put(
  '/bookings/:bookingId',
  authenticate,
  authorize('guide'),
  guideController.updateBookingStatus
);

// ===== BOOKING ROUTES (Tourist) =====

// Create tour booking
router.post(
  '/:guideId/book',
  authenticate,
  authorize('tourist'),
  guideController.createTourBooking
);

// Get user's tour bookings
router.get(
  '/user/my-bookings',
  authenticate,
  guideController.getUserTourBookings
);

// ===== MESSAGING ROUTES =====

// Send message to guide
router.post(
  '/:guideId/message',
  authenticate,
  guideController.sendMessage
);

// Get messages with guide
router.get(
  '/:guideId/messages',
  authenticate,
  guideController.getMessages
);

// Mark message as read
router.put(
  '/messages/:messageId/read',
  authenticate,
  guideController.markMessageRead
);

// get guide booking details
router.get(
  '/bookings/:id',
  authenticate,
  guideController.getGuideBookingDetails
);

// ===== REVIEW ROUTES =====

// Add review to guide
router.post(
  '/:guideId/reviews',
  authenticate,
  authorize('tourist'),
  guideController.addGuideReview
);

// Get guide reviews
router.get(
  '/:guideId/reviews',
  guideController.getGuideReviews
);

module.exports = router;
