const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const {
  uploadAvatar,
  uploadHotelImages,
  uploadVehicleImages,
  uploadVerificationDocs,
  uploadReviewImages,
} = require('../middleware/upload');
const db = require('../models/db');

// Upload avatar
router.post('/avatar', authenticate, uploadAvatar, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    await db.query(
      'UPDATE profiles SET avatar_url = $1 WHERE id = $2',
      [avatarUrl, req.user.id]
    );

    res.json({
      success: true,
      avatarUrl,
      message: 'Avatar uploaded successfully',
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// Upload hotel images
router.post('/hotel-images', authenticate, uploadHotelImages, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const imageUrls = req.files.map(file => `/uploads/hotels/${file.filename}`);

    res.json({
      success: true,
      images: imageUrls,
      message: `${imageUrls.length} images uploaded successfully`,
    });
  } catch (error) {
    console.error('Upload hotel images error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// Upload vehicle images
router.post('/vehicle-images', authenticate, uploadVehicleImages, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const imageUrls = req.files.map(file => `/uploads/vehicles/${file.filename}`);

    res.json({
      success: true,
      images: imageUrls,
      message: `${imageUrls.length} images uploaded successfully`,
    });
  } catch (error) {
    console.error('Upload vehicle images error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// Upload verification documents
router.post('/verification-docs', authenticate, uploadVerificationDocs, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const docUrls = req.files.map(file => `/uploads/documents/${file.filename}`);

    res.json({
      success: true,
      documents: docUrls,
      message: `${docUrls.length} documents uploaded successfully`,
    });
  } catch (error) {
    console.error('Upload documents error:', error);
    res.status(500).json({ error: 'Failed to upload documents' });
  }
});

// Upload review images
router.post('/review-images', authenticate, uploadReviewImages, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const imageUrls = req.files.map(file => `/uploads/reviews/${file.filename}`);

    res.json({
      success: true,
      images: imageUrls,
      message: `${imageUrls.length} images uploaded successfully`,
    });
  } catch (error) {
    console.error('Upload review images error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

module.exports = router;
