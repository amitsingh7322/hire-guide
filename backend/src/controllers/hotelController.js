const db = require('../models/db');
const { body, validationResult } = require('express-validator');

// Search hotels with filters
exports.searchHotels = async (req, res) => {
  try {
    const {
      city,
      pinCode,
      propertyType,
      minPrice,
      maxPrice,
      minRating,
      amenities,
      checkInDate,
      checkOutDate,
      numberOfRooms = 1,
      sortBy = 'rating',
      page = 1,
      limit = 20,
    } = req.query;

    let query = `
      SELECT 
        h.*,
        p.first_name, p.last_name, p.phone as owner_phone,
        CASE 
          WHEN $1::date IS NOT NULL AND $2::date IS NOT NULL THEN
            h.available_rooms - COALESCE((
              SELECT SUM(number_of_rooms)
              FROM hotel_bookings hb
              WHERE hb.hotel_id = h.id
                AND hb.status NOT IN ('cancelled', 'refunded')
                AND (
                  (hb.check_in_date, hb.check_out_date) OVERLAPS ($1::date, $2::date)
                )
            ), 0)
          ELSE h.available_rooms
        END as currently_available_rooms
      FROM hotels h
      JOIN profiles p ON h.owner_id = p.id
      WHERE h.is_verified = true
    `;

    const params = [checkInDate, checkOutDate];
    let paramCount = 3;

    // Location filters
    if (city) {
      query += ` AND LOWER(h.city) = LOWER($${paramCount})`;
      params.push(city);
      paramCount++;
    }

    if (pinCode) {
      query += ` AND h.pin_code = $${paramCount}`;
      params.push(pinCode);
      paramCount++;
    }

    // Property type filter
    if (propertyType) {
      query += ` AND h.property_type = $${paramCount}`;
      params.push(propertyType);
      paramCount++;
    }

    // Price filters
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

    // Rating filter
    if (minRating) {
      query += ` AND h.rating >= $${paramCount}`;
      params.push(minRating);
      paramCount++;
    }

    // Amenities filter
    if (amenities) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
      query += ` AND h.amenities && $${paramCount}::text[]`;
      params.push(amenitiesArray);
      paramCount++;
    }

    // Room availability filter
    if (numberOfRooms > 1) {
      query += ` HAVING currently_available_rooms >= $${paramCount}`;
      params.push(numberOfRooms);
      paramCount++;
    }

    // Sorting
    if (sortBy === 'rating') {
      query += ` ORDER BY h.rating DESC, h.total_reviews DESC`;
    } else if (sortBy === 'price_low') {
      query += ` ORDER BY h.price_per_night ASC`;
    } else if (sortBy === 'price_high') {
      query += ` ORDER BY h.price_per_night DESC`;
    }

    // Pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      success: true,
      hotels: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Search hotels error:', error);
    res.status(500).json({ error: 'Failed to search hotels' });
  }
};

// Get hotel by ID with availability
exports.getHotelById = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkInDate, checkOutDate } = req.query;

    const result = await db.query(
      `SELECT 
        h.*,
        p.first_name, p.last_name, p.phone as owner_phone, p.email as owner_email,
        COALESCE(json_agg(DISTINCT jsonb_build_object(
          'id', hr.id,
          'rating', hr.rating,
          'comment', hr.comment,
          'images', hr.images,
          'created_at', hr.created_at,
          'tourist_name', pt.first_name || ' ' || pt.last_name,
          'tourist_avatar', pt.avatar_url
        )) FILTER (WHERE hr.id IS NOT NULL), '[]') as reviews,
        CASE 
          WHEN $2::date IS NOT NULL AND $3::date IS NOT NULL THEN
            h.available_rooms - COALESCE((
              SELECT SUM(number_of_rooms)
              FROM hotel_bookings hb
              WHERE hb.hotel_id = h.id
                AND hb.status NOT IN ('cancelled', 'refunded')
                AND (hb.check_in_date, hb.check_out_date) OVERLAPS ($2::date, $3::date)
            ), 0)
          ELSE h.available_rooms
        END as currently_available_rooms
       FROM hotels h
       JOIN profiles p ON h.owner_id = p.id
       LEFT JOIN hotel_reviews hr ON h.id = hr.hotel_id
       LEFT JOIN profiles pt ON hr.tourist_id = pt.id
       WHERE h.id = $1
       GROUP BY h.id, p.first_name, p.last_name, p.phone, p.email`,
      [id, checkInDate, checkOutDate]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    res.json({ success: true, hotel: result.rows });
  } catch (error) {
    console.error('Get hotel error:', error);
    res.status(500).json({ error: 'Failed to fetch hotel' });
  }
};

// Create hotel listing (hotel_owner only)
exports.createHotel = [
  body('name').trim().notEmpty().withMessage('Hotel name is required'),
  body('propertyType').isIn(['hotel', 'guesthouse', 'homestay', 'resort', 'apartment']),
  body('city').trim().notEmpty(),
  body('pricePerNight').isFloat({ min: 0 }),
  body('totalRooms').isInt({ min: 1 }),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        name, description, propertyType, address, city, state, pinCode,
        latitude, longitude, pricePerNight, totalRooms, amenities,
        contactPhone, contactEmail, checkInTime, checkOutTime, cancellationPolicy
      } = req.body;

      const result = await db.query(
        `INSERT INTO hotels (
          owner_id, name, description, property_type, address, city, state, pin_code,
          latitude, longitude, price_per_night, total_rooms, available_rooms,
          amenities, contact_phone, contact_email, check_in_time, check_out_time,
          cancellation_policy
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *`,
        [
          req.user.id, name, description, propertyType, address, city, state, pinCode,
          latitude, longitude, pricePerNight, totalRooms, amenities,
          contactPhone, contactEmail, checkInTime, checkOutTime, cancellationPolicy
        ]
      );

      res.status(201).json({
        success: true,
        hotel: result.rows,
        message: 'Hotel created successfully. Pending verification.',
      });
    } catch (error) {
      console.error('Create hotel error:', error);
      res.status(500).json({ error: 'Failed to create hotel' });
    }
  }
];

// Update hotel
exports.updateHotel = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const hotel = await db.query(
      'SELECT owner_id FROM hotels WHERE id = $1',
      [id]
    );

    if (hotel.rows.length === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    if (hotel.rows.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updates = req.body;
    const allowedFields = [
      'name', 'description', 'address', 'price_per_night', 'total_rooms',
      'available_rooms', 'amenities', 'images', 'contact_phone', 'contact_email',
      'check_in_time', 'check_out_time', 'cancellation_policy'
    ];

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id);
    const query = `
      UPDATE hotels 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);

    res.json({
      success: true,
      hotel: result.rows,
    });
  } catch (error) {
    console.error('Update hotel error:', error);
    res.status(500).json({ error: 'Failed to update hotel' });
  }
};

// Delete hotel
exports.deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM hotels WHERE id = $1 AND owner_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hotel not found or not authorized' });
    }

    res.json({
      success: true,
      message: 'Hotel deleted successfully',
    });
  } catch (error) {
    console.error('Delete hotel error:', error);
    res.status(500).json({ error: 'Failed to delete hotel' });
  }
};

// Get owner's hotels
exports.getOwnerHotels = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT h.*, 
              COUNT(DISTINCT hb.id) as total_bookings,
              AVG(hr.rating) as avg_rating
       FROM hotels h
       LEFT JOIN hotel_bookings hb ON h.id = hb.hotel_id
       LEFT JOIN hotel_reviews hr ON h.id = hr.hotel_id
       WHERE h.owner_id = $1
       GROUP BY h.id
       ORDER BY h.created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      hotels: result.rows,
    });
  } catch (error) {
    console.error('Get owner hotels error:', error);
    res.status(500).json({ error: 'Failed to fetch hotels' });
  }
};

module.exports = exports;
