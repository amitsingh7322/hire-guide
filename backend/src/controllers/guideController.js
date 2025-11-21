const db = require('../models/db');
const { calculateDynamicPrice } = require('../utils/pricing');

// Search guides
exports.searchGuides = async (req, res) => {
  try {
    const {
      city,
      pinCode,
      latitude,
      longitude,
      maxDistance = 50, // km
      minPrice,
      maxPrice,
      minRating,
      languages,
      specialties,
      hasVehicle,
      sortBy = 'rating', // rating, price, distance
      page = 1,
      limit = 20,
    } = req.query;

    let query = `
      SELECT 
        g.*,
        p.first_name, p.last_name, p.avatar_url, p.phone,
        COALESCE(json_agg(DISTINCT v.*) FILTER (WHERE v.id IS NOT NULL), '[]') as vehicles,
        COUNT(DISTINCT v.id) as vehicle_count
      FROM guides g
      JOIN profiles p ON g.user_id = p.id
      LEFT JOIN vehicles v ON g.id = v.guide_id AND v.available = true
      WHERE g.is_verified = true AND g.availability_status = true
    `;

    const params = [];
    let paramCount = 1;

    // Location filters
    if (city) {
      query += ` AND LOWER(g.city) = LOWER($${paramCount})`;
      params.push(city);
      paramCount++;
    }

    if (pinCode) {
      query += ` AND g.pin_code = $${paramCount}`;
      params.push(pinCode);
      paramCount++;
    }

    // Price filters
    if (minPrice) {
      query += ` AND g.hourly_rate >= $${paramCount}`;
      params.push(minPrice);
      paramCount++;
    }

    if (maxPrice) {
      query += ` AND g.hourly_rate <= $${paramCount}`;
      params.push(maxPrice);
      paramCount++;
    }

    // Rating filter
    if (minRating) {
      query += ` AND g.rating >= $${paramCount}`;
      params.push(minRating);
      paramCount++;
    }

    // Language filter
    if (languages) {
      const langArray = Array.isArray(languages) ? languages : [languages];
      query += ` AND g.languages && $${paramCount}::text[]`;
      params.push(langArray);
      paramCount++;
    }

    // Specialty filter
    if (specialties) {
      const specArray = Array.isArray(specialties) ? specialties : [specialties];
      query += ` AND g.specialties && $${paramCount}::text[]`;
      params.push(specArray);
      paramCount++;
    }

    query += ` GROUP BY g.id, p.first_name, p.last_name, p.avatar_url, p.phone`;

    // Vehicle filter
    if (hasVehicle === 'true') {
      query += ` HAVING COUNT(DISTINCT v.id) > 0`;
    }

    // Sorting
    if (sortBy === 'rating') {
      query += ` ORDER BY g.rating DESC, g.total_reviews DESC`;
    } else if (sortBy === 'price') {
      query += ` ORDER BY g.hourly_rate ASC`;
    }

    // Pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(DISTINCT g.id) as total
      FROM guides g
      WHERE g.is_verified = true AND g.availability_status = true
    `;
    const countResult = await db.query(countQuery);

    res.json({
      success: true,
      guides: result.rows.map(guide => ({
        ...guide,
        location: {
          city: guide.city,
          state: guide.state,
          pinCode: guide.pin_code,
          coordinates: {
            lat: parseFloat(guide.latitude),
            lng: parseFloat(guide.longitude),
          },
        },
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows.total),
        totalPages: Math.ceil(countResult.rows.total / limit),
      },
    });
  } catch (error) {
    console.error('Search guides error:', error);
    res.status(500).json({ error: 'Failed to search guides' });
  }
};

// Get guide by ID
exports.getGuideById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT 
        g.*,
        p.first_name, p.last_name, p.email, p.phone, p.avatar_url,
        COALESCE(json_agg(DISTINCT v.*) FILTER (WHERE v.id IS NOT NULL), '[]') as vehicles,
        COALESCE(json_agg(DISTINCT jsonb_build_object(
          'id', r.id,
          'rating', r.rating,
          'comment', r.comment,
          'created_at', r.created_at,
          'tourist_name', pt.first_name || ' ' || pt.last_name,
          'tourist_avatar', pt.avatar_url
        )) FILTER (WHERE r.id IS NOT NULL), '[]') as reviews
       FROM guides g
       JOIN profiles p ON g.user_id = p.id
       LEFT JOIN vehicles v ON g.id = v.guide_id
       LEFT JOIN reviews r ON g.id = r.guide_id
       LEFT JOIN profiles pt ON r.tourist_id = pt.id
       WHERE g.id = $1
       GROUP BY g.id, p.first_name, p.last_name, p.email, p.phone, p.avatar_url`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    const guide = result.rows;

    res.json({
      success: true,
      guide: {
        ...guide,
        location: {
          city: guide.city,
          state: guide.state,
          pinCode: guide.pin_code,
          address: guide.address,
          coordinates: {
            lat: parseFloat(guide.latitude),
            lng: parseFloat(guide.longitude),
          },
        },
      },
    });
  } catch (error) {
    console.error('Get guide error:', error);
    res.status(500).json({ error: 'Failed to fetch guide' });
  }
};

// Create guide profile (for guides)
exports.createGuideProfile = async (req, res) => {
  try {
    const {
      bio, address, city, state, pinCode, latitude, longitude,
      hourlyRate, dailyRate, experienceYears, specialties, languages,
      certifications
    } = req.body;

    // Check if user already has a guide profile
    const existing = await db.query(
      'SELECT id FROM guides WHERE user_id = $1',
      [req.user.id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Guide profile already exists' });
    }

    const result = await db.query(
      `INSERT INTO guides (
        user_id, bio, address, city, state, pin_code,
        latitude, longitude, hourly_rate, daily_rate, experience_years,
        specialties, languages, certifications
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        req.user.id, bio, address, city, state, pinCode,
        latitude, longitude, hourlyRate, dailyRate, experienceYears,
        specialties, languages, certifications
      ]
    );

    res.status(201).json({
      success: true,
      guide: result.rows,
    });
  } catch (error) {
    console.error('Create guide profile error:', error);
    res.status(500).json({ error: 'Failed to create guide profile' });
  }
};

// Update guide profile
exports.updateGuideProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verify ownership
    const guide = await db.query(
      'SELECT user_id FROM guides WHERE id = $1',
      [id]
    );

    if (guide.rows.length === 0) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    if (guide.rows.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Build update query dynamically
    const allowedFields = [
      'bio', 'address', 'city', 'state', 'pin_code', 'latitude', 'longitude',
      'hourly_rate', 'daily_rate', 'experience_years', 'specialties',
      'languages', 'certifications', 'availability_status'
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
      UPDATE guides 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);

    res.json({
      success: true,
      guide: result.rows,
    });
  } catch (error) {
    console.error('Update guide profile error:', error);
    res.status(500).json({ error: 'Failed to update guide profile' });
  }
};

module.exports = exports;
