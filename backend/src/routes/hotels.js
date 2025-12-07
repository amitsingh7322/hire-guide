// ============================================
// Hotel Routes - COMPLETE
// src/routes/hotels.js
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const db = require('../models/db');
const hotelController = require('../controllers/hotelController');

// ===== PUBLIC ROUTES =====

// Search hotels
router.get('/search', hotelController.searchHotels);

// Get hotel by ID
router.get('/:id', hotelController.getHotelById);

// ===== PROTECTED ROUTES (Hotel Owner) =====

// Get owner's hotel profile
router.get(
  '/profile/me',
  authenticate,
  authorize('hotel_owner'),
  hotelController.getOwnerHotelProfile
);

// Create hotel profile
router.post(
  '/profile',
  authenticate,
  authorize('hotel_owner'),
  hotelController.createHotel
);

// Update hotel profile
router.put(
  '/:id/profile',
  authenticate,
  authorize('hotel_owner'),
  hotelController.updateHotel
);

// Delete hotel
router.delete(
  '/:id',
  authenticate,
  authorize('hotel_owner'),
  hotelController.deleteHotel
);

// Get owner's all hotels
router.get(
  '/owner/all',
  authenticate,
  authorize('hotel_owner'),
  hotelController.getOwnerHotels
);

// ===== BOOKING ROUTES =====

// Get hotel's bookings (for owner dashboard)
router.get(
  '/:id/bookings',
  authenticate,
  authorize('hotel_owner'),
  hotelController.getHotelBookings
);

// Update booking status (confirm/reject/cancel)
router.put(
  '/:hotelId/bookings/:bookingId',
  authenticate,
  authorize('hotel_owner'),
  hotelController.updateBookingStatus
);

// Create booking (tourist creates)
router.post(
  '/:id/book',
  authenticate,
  authorize('tourist'),
  hotelController.createHotelBooking
);

// Get user's bookings
router.get(
  '/user/my-bookings',
  authenticate,
  hotelController.getUserBookings
);

// Get hotel booking details
router.get(
  '/bookings/:id',
  authenticate,
  hotelController.getHotelBookingDetails
);

// ===== REVIEW ROUTES =====

// Add review to hotel
router.post(
  '/:id/reviews',
  authenticate,
  authorize('tourist'),
  hotelController.addHotelReview
);

// Get hotel reviews
router.get(
  '/:id/reviews',
  hotelController.getHotelReviews
);

module.exports = router;
