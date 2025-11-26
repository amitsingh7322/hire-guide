// ============================================
// Hotel Routes
// src/routes/hotels.js
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const db = require('../models/db');

// Search hotels
router.get('/search', async (req, res) => {
  try {
    const { city, minPrice, maxPrice, minRating, propertyType, page = 1, limit = 20 } = req.query;

    let query = `
      SELECT h.*, p.first_name, p.last_name, p.phone
      FROM hotels h
      JOIN profiles p ON h.owner_id = p.id
      WHERE h.is_verified = true
    `;

    const params = [];
    let paramCount = 1;

    if (city) {
      query += ` AND LOWER(h.city) = LOWER($${paramCount})`;
      params.push(city);
      paramCount++;
    }

    if (minPrice) {
      query += ` AND h.price_per_night >= $${paramCount}`;
      params.push(minPrice);
      paramCount++;
    }

    if (maxPrice) {
      query += ` AND h.price_per_night <= $${paramCount}`;
      params.push(maxPrice);
      paramCount++;
    }

    if (minRating) {
      query += ` AND h.rating >= $${paramCount}`;
      params.push(minRating);
      paramCount++;
    }

    if (propertyType) {
      query += ` AND h.property_type = $${paramCount}`;
      params.push(propertyType);
      paramCount++;
    }

    query += ` ORDER BY h.rating DESC, h.total_reviews DESC`;

    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      success: true,
      hotels: result.rows,
      pagination: { page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    console.error('Search hotels error:', error);
    res.status(500).json({ error: 'Failed to search hotels' });
  }
});

// Get hotel by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT h.*, p.first_name, p.last_name, p.phone, p.email,
              COALESCE(json_agg(DISTINCT jsonb_build_object(
                'id', hr.id,
                'rating', hr.rating,
                'comment', hr.comment,
                'created_at', hr.created_at,
                'tourist_name', pt.first_name || ' ' || pt.last_name
              )) FILTER (WHERE hr.id IS NOT NULL), '[]') as reviews
       FROM hotels h
       JOIN profiles p ON h.owner_id = p.id
       LEFT JOIN hotel_reviews hr ON h.id = hr.hotel_id
       LEFT JOIN profiles pt ON hr.tourist_id = pt.id
       WHERE h.id = $1
       GROUP BY h.id, p.first_name, p.last_name, p.phone, p.email`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    res.json({ success: true, hotel: result.rows[0] });
  } catch (error) {
    console.error('Get hotel error:', error);
    res.status(500).json({ error: 'Failed to fetch hotel' });
  }
});

// Create hotel (hotel_owner role required)
router.post('/', authenticate, authorize('hotel_owner'), async (req, res) => {
  try {
    const {
      name, description, propertyType, address, city, state, pinCode,
      latitude, longitude, pricePerNight, totalRooms, amenities,
      contactPhone, contactEmail, checkInTime, checkOutTime
    } = req.body;

    const result = await db.query(
      `INSERT INTO hotels (
        owner_id, name, description, property_type, address, city, state, pin_code,
        latitude, longitude, price_per_night, total_rooms, available_rooms,
        amenities, contact_phone, contact_email, check_in_time, check_out_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        req.user.id, name, description, propertyType, address, city, state, pinCode,
        latitude, longitude, pricePerNight, totalRooms, amenities,
        contactPhone, contactEmail, checkInTime, checkOutTime
      ]
    );

    res.status(201).json({ success: true, hotel: result.rows[0] });
  } catch (error) {
    console.error('Create hotel error:', error);
    res.status(500).json({ error: 'Failed to create hotel' });
  }
});

module.exports = router;

