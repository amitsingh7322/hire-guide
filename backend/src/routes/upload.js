// ============================================
// Upload Routes
// src/routes/upload.js
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const uploadController = require('../controllers/uploadController');
const {
  uploadAvatar,
  uploadHotelImages,
  uploadVehicleImages,
  uploadVerificationDocs,
  uploadReviewImages,
} = require('../middleware/upload');

// Avatar upload
router.post(
  '/avatar',
  authenticate,
  uploadAvatar,
  uploadController.uploadAvatar
);

// Hotel images
router.post(
  '/hotel-images',
  authenticate,
  uploadHotelImages,
  uploadController.uploadHotelImages
);

// Vehicle images
router.post(
  '/vehicle-images',
  authenticate,
  uploadVehicleImages,
  uploadController.uploadVehicleImages
);

// Verification documents
router.post(
  '/verification-docs',
  authenticate,
  uploadVerificationDocs,
  uploadController.uploadVerificationDocs
);

// Review images
router.post(
  '/review-images',
  authenticate,
  uploadReviewImages,
  uploadController.uploadReviewImages
);

module.exports = router;
