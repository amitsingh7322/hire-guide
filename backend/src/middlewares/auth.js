const jwt = require('jsonwebtoken');
const db = require('../models/db');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const parts = authHeader.split(' ');

    // Must be: ["Bearer", "token"]
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    const token = parts[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await db.query(
      'SELECT id, email, first_name, last_name FROM profiles WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = result.rows[0];
    return next();
  } catch (error) {
    console.log('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      const result = await db.query(
        'SELECT role FROM user_roles WHERE user_id = $1',
        [req.user.id]
      );

      const userRoles = result.rows.map(r => r.role);
      const hasRole = roles.some(role => userRoles.includes(role));

      if (!hasRole) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

     return next();
    } catch (error) {
      return res.status(500).json({ error: 'Authorization failed' });
    }
  };
};

module.exports = { authenticate, authorize };
