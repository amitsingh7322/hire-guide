const db = require('../models/db');

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    await db.query(
      'UPDATE profiles SET avatar_url = $1 WHERE id = $2',
      [avatarUrl, req.user.id]
    );

    res.json({ success: true, avatarUrl, message: 'Avatar uploaded' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
};

exports.uploadHotelImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const imageUrls = req.files.map(file => `/uploads/hotels/${file.filename}`);

    res.json({
      success: true,
      images: imageUrls,
      message: `${imageUrls.length} images uploaded`,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload images' });
  }
};

exports.uploadVehicleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const imageUrls = req.files.map(file => `/uploads/vehicles/${file.filename}`);

    res.json({
      success: true,
      images: imageUrls,
      message: `${imageUrls.length} images uploaded`,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload images' });
  }
};

exports.uploadVerificationDocs = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const docUrls = req.files.map(file => `/uploads/documents/${file.filename}`);

    res.json({
      success: true,
      documents: docUrls,
      message: `${docUrls.length} documents uploaded`,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload documents' });
  }
};

exports.uploadReviewImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const imageUrls = req.files.map(file => `/uploads/reviews/${file.filename}`);

    res.json({
      success: true,
      images: imageUrls,
      message: `${imageUrls.length} images uploaded`,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload images' });
  }
};

module.exports = exports;
