const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../models/db');

// Register new user
exports.register = [
  // Validation
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('role').isIn(['tourist', 'guide', 'hotel_owner']).optional(),
  
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, firstName, lastName, phone, role = 'tourist' } = req.body;

      // Check if user exists
      const existingUser = await db.query(
        'SELECT id FROM profiles WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const userResult = await db.query(
        `INSERT INTO profiles (email, password_hash, first_name, last_name, phone)
         VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name`,
        [email, passwordHash, firstName, lastName, phone]
      );
      const user = userResult.rows[0];

      // Assign role
      await db.query(
        'INSERT INTO user_roles (user_id, role) VALUES ($1, $2)',
        [user.id, role]
      );

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,  
          role,
        },
        token,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
];

// Login user
exports.login = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Get user
      const userResult = await db.query(
        `SELECT p.*, array_agg(ur.role) as roles
         FROM profiles p
         LEFT JOIN user_roles ur ON p.id = ur.user_id
         WHERE p.email = $1
         GROUP BY p.id`,
        [email]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      console.log("userResult:", userResult.rows[0]);
      const user = userResult.rows[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      // FIXED: Convert array to single role
      const roleArray = Array.isArray(user.roles)
        ? user.roles.filter(r => r !== null)
        : typeof user.roles === 'string'
          ? user.roles.replace(/[{}"]/g, '').split(',').filter(r => r && r !== 'NULL')
          : [];

      const role = roleArray[0] || 'tourist'; // Get first role
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: role
        },
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
];

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.id, p.email, p.first_name, p.last_name, p.phone, p.avatar_url,
              array_agg(ur.role) as roles
       FROM profiles p
       LEFT JOIN user_roles ur ON p.id = ur.user_id
       WHERE p.id = $1
       GROUP BY p.id`,
      [req.user.id]
    );

    const user = result.rows;
    res.json({
      success: true,
      user: {
        ...user,
        roles: user.roles.filter(r => r !== null),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};
