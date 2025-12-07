// ============================================
// Booking Routes - UPDATED
// src/routes/bookings.js
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const bookingController = require('../controllers/bookingController');

// Get user bookings (both as tourist and guide)
router.get('/', authenticate, bookingController.getUserBookings);

// Get single booking details
router.get('/:bookingId', authenticate, bookingController.getBookingDetails);

// Create booking (tourist)
router.post('/', authenticate, authorize('tourist'), bookingController.createBooking);

// Update booking status (guide accepts/rejects/cancels)
router.patch('/:bookingId/status', authenticate, authorize('guide'), bookingController.updateBookingStatus);

// Cancel booking (tourist)
router.delete('/:bookingId', authenticate, bookingController.cancelBooking);

// Get guide's bookings with stats
router.get('/guide/dashboard/stats', authenticate, authorize('guide'), bookingController.getGuideDashboardStats);

module.exports = router;
