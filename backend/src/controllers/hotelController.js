const db = require('../models/db');
const { body, validationResult } = require('express-validator');

// ===== SEARCH & GET =====

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

    if (propertyType) {
      query += ` AND h.property_type = $${paramCount}`;
      params.push(propertyType);
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

    if (amenities) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
      query += ` AND h.amenities && $${paramCount}::text[]`;
      params.push(amenitiesArray);
      paramCount++;
    }

    if (sortBy === 'rating') {
      query += ` ORDER BY h.rating DESC, h.total_reviews DESC`;
    } else if (sortBy === 'price_low') {
      query += ` ORDER BY h.price_per_night ASC`;
    } else if (sortBy === 'price_high') {
      query += ` ORDER BY h.price_per_night DESC`;
    }

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
        total: result.rowCount,
      },
    });
  } catch (error) {
    console.error('Search hotels error:', error);
    res.status(500).json({ error: 'Failed to search hotels' });
  }
};

// Get hotel by ID
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

    res.json({ success: true, hotel: result.rows[0] });
  } catch (error) {
    console.error('Get hotel error:', error);
    res.status(500).json({ error: 'Failed to fetch hotel' });
  }
};

// ===== PROFILE MANAGEMENT =====

// Get owner's hotel profile
exports.getOwnerHotelProfile = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT h.* FROM hotels h 
       WHERE h.owner_id = $1 
       LIMIT 1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hotel profile not found' });
    }

    res.json({ success: true, hotel: result.rows[0] });
  } catch (error) {
    console.error('Get hotel profile error:', error);
    res.status(500).json({ error: 'Failed to fetch hotel profile' });
  }
};

// Create hotel
const normalizeNumber = (val) =>
  val === '' || val === undefined || val === null ? null : Number(val);

exports.createHotel = [
  body('name').trim().notEmpty().withMessage('Hotel name is required'),
  body('propertyType').isIn(['hotel', 'guesthouse', 'homestay', 'resort', 'apartment']),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('pricePerNight').notEmpty().withMessage('Price is required'),
  body('totalRooms').notEmpty().withMessage('Total rooms is required'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        name,
        description,
        propertyType,
        address,
        city,
        state,
        pinCode,
        latitude,
        longitude,
        pricePerNight,
        totalRooms,
        availableRooms = totalRooms,
        amenities = [],
        contactPhone,
        contactEmail,
        checkInTime,
        checkOutTime,
        cancellationPolicy,
      } = req.body;

      const lat = normalizeNumber(latitude);
      const long = normalizeNumber(longitude);
      const price = normalizeNumber(pricePerNight);
      const rooms = normalizeNumber(totalRooms);
      const available = normalizeNumber(availableRooms) || rooms;

      const result = await db.query(
        `
        INSERT INTO hotels (
          owner_id, name, description, property_type, address, city, state, pin_code,
          latitude, longitude, price_per_night, total_rooms, available_rooms,
          amenities, contact_phone, contact_email, check_in_time, check_out_time,
          cancellation_policy, created_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18, $19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING *
        `,
        [
          req.user.id,
          name,
          description,
          propertyType,
          address,
          city,
          state,
          pinCode,
          lat,
          long,
          price,
          rooms,
          available,
          amenities,
          contactPhone,
          contactEmail,
          checkInTime,
          checkOutTime,
          cancellationPolicy,
        ]
      );

      return res.status(201).json({
        success: true,
        hotel: result.rows,
        message: 'Hotel created successfully. Pending verification.',
      });
    } catch (error) {
      console.error('Create hotel error:', error);
      return res.status(500).json({ error: 'Failed to create hotel' });
    }
  },
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
      'name',
      'description',
      'address',
      'city',
      'state',
      'pin_code',
      'price_per_night',
      'total_rooms',
      'available_rooms',
      'amenities',
      'images',
      'contact_phone',
      'contact_email',
      'check_in_time',
      'check_out_time',
      'cancellation_policy',
    ];

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach((key) => {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(snakeKey)) {
        updateFields.push(`${snakeKey} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    const query = `
      UPDATE hotels 
      SET ${updateFields.join(', ')}
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
      return res
        .status(404)
        .json({ error: 'Hotel not found or not authorized' });
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
              COUNT(DISTINCT CASE WHEN hb.status = 'confirmed' THEN hb.id END) as confirmed_bookings,
              COALESCE(SUM(CASE WHEN hb.status = 'confirmed' THEN hb.total_price ELSE 0 END), 0) as total_revenue,
              COALESCE(AVG(hr.rating), 0) as avg_rating
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

// ===== BOOKING MANAGEMENT =====

// Get hotel's bookings
exports.getHotelBookings = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const hotel = await db.query(
      'SELECT owner_id FROM hotels WHERE id = $1',
      [id]
    );

    if (hotel.rows.length === 0 || hotel.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const result = await db.query(
      `SELECT 
        hb.*,
        p.first_name as guest_first_name,
        p.last_name as guest_last_name,
        p.email as guest_email,
        p.phone as guest_phone,
        h.name as hotel_name
       FROM hotel_bookings hb
       JOIN profiles p ON hb.tourist_id = p.id
       JOIN hotels h ON hb.hotel_id = h.id
       WHERE hb.hotel_id = $1
       ORDER BY hb.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      bookings: result.rows[0],
    });
  } catch (error) {
    console.error('Get hotel bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// Create hotel booking
exports.createHotelBooking = [
  body('checkInDate').notEmpty().withMessage('Check-in date is required'),
  body('checkOutDate').notEmpty().withMessage('Check-out date is required'),
  body('numberOfRooms').isInt({ min: 1 }).withMessage('At least 1 room required'),
  body('totalPrice').isFloat({ min: 0 }).withMessage('Total price is required'),
  body('numberOfGuests').isInt({ min: 1 }).withMessage('Number of guests is required'),
  body('totalNights').isInt({ min: 1 }).withMessage('Number of nights is required'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { checkInDate, checkOutDate, numberOfRooms, totalPrice, notes, numberOfGuests, totalNights } =
        req.body;

      // Check room availability - ✅ ALSO GET price_per_night
      const availability = await db.query(
        `SELECT 
          h.available_rooms,
          h.price_per_night,
          COALESCE(SUM(number_of_rooms), 0) as booked_rooms
        FROM hotels h
        LEFT JOIN hotel_bookings hb ON h.id = hb.hotel_id
          AND hb.status NOT IN ('cancelled', 'refunded')
          AND (hb.check_in_date, hb.check_out_date) OVERLAPS ($2::date, $3::date)
        WHERE h.id = $1
        GROUP BY h.id, h.available_rooms, h.price_per_night`,
        [id, checkInDate, checkOutDate]
      );

      if (availability.rows.length === 0) {
        return res.status(404).json({ error: 'Hotel not found' });
      }

      const available =
        availability.rows[0].available_rooms -
        availability.rows[0].booked_rooms;
      if (available < numberOfRooms) {
        return res.status(400).json({
          error: `Only ${available} rooms available for selected dates`,
        });
      }

      // ✅ EXTRACT price_per_night
      const pricePerNight = availability.rows[0].price_per_night;

      // ✅ FIXED INSERT with all required fields
      const booking = await db.query(
        `INSERT INTO hotel_bookings (
          hotel_id,
          tourist_id,
          check_in_date,
          check_out_date,
          number_of_rooms,
          number_of_guests,
          total_nights,
          price_per_night,
          total_amount,
          status,
          special_requests,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *`,
        [
          id,                    // $1 hotel_id
          req.user.id,           // $2 tourist_id
          checkInDate,           // $3 check_in_date
          checkOutDate,          // $4 check_out_date
          numberOfRooms,         // $5 number_of_rooms
          numberOfGuests,        // $6 number_of_guests
          totalNights,           // $7 total_nights
          pricePerNight,         // $8 price_per_night
          totalPrice,            // $9 total_amount
          notes || null,         // $10 special_requests
        ]
      );

      res.status(201).json({
        success: true,
        booking: booking.rows,
        message: 'Booking request sent successfully',
      });
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({ error: 'Failed to create booking' });
    }
  },
];


// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { hotelId, bookingId } = req.params;
    const { status } = req.body;

    if (!['confirmed', 'cancelled', 'refunded'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Verify hotel ownership
    const hotel = await db.query(
      'SELECT owner_id FROM hotels WHERE id = $1',
      [hotelId]
    );

    if (hotel.rows.length === 0 || hotel.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const result = await db.query(
      `UPDATE hotel_bookings 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND hotel_id = $3
       RETURNING *`,
      [status, bookingId, hotelId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({
      success: true,
      booking: result.rows[0],
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
};

// Get user's bookings
exports.getUserBookings = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        hb.*,
        h.name as hotel_name,
        h.city,
        h.price_per_night,
        p.first_name as owner_first_name,
        p.last_name as owner_last_name
       FROM hotel_bookings hb
       JOIN hotels h ON hb.hotel_id = h.id
       JOIN profiles p ON h.owner_id = p.id
       WHERE hb.tourist_id = $1
       ORDER BY hb.created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      bookings: result.rows,
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// ===== REVIEWS =====

// Add review
exports.addHotelReview = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('comment').trim().notEmpty().withMessage('Comment is required'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { rating, comment, images } = req.body;

      const result = await db.query(
        `INSERT INTO hotel_reviews (
          hotel_id, tourist_id, rating, comment, images, created_at
        )
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        RETURNING *`,
        [id, req.user.id, rating, comment, images || []]
      );

      // Update hotel average rating
      await db.query(
        `UPDATE hotels 
         SET rating = (SELECT AVG(rating) FROM hotel_reviews WHERE hotel_id = $1),
             total_reviews = (SELECT COUNT(*) FROM hotel_reviews WHERE hotel_id = $1)
         WHERE id = $1`,
        [id]
      );

      res.status(201).json({
        success: true,
        review: result.rows,
      });
    } catch (error) {
      console.error('Add review error:', error);
      res.status(500).json({ error: 'Failed to add review' });
    }
  },
];

// Get reviews
exports.getHotelReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT 
        hr.*,
        p.first_name, p.last_name, p.avatar_url
       FROM hotel_reviews hr
       JOIN profiles p ON hr.tourist_id = p.id
       WHERE hr.hotel_id = $1
       ORDER BY hr.created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    res.json({
      success: true,
      reviews: result.rows,
      pagination: { page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

module.exports = exports;
