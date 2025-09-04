// src/middleware/auth.js
const jwt = require('jsonwebtoken');

/**
 * authenticateToken
 * - Expects Authorization: Bearer <token>
 * - Verifies JWT and attaches req.user = { id, role }
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user info to request for downstream routes
    // If you don’t encode role in JWT, default to 'user'
    req.user = {
      id: decoded.id,
      role: decoded.role || 'user'
    };
    return next();
  } catch (err) {
    return res.status(401).json({
      message: 'Invalid or expired token'
    });
  }
};

/**
 * requireAdmin
 * - Allows access only if req.user.role === 'admin'
 */
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      message: 'Admin access required'
    });
  }
  next();
};

/**
 * requireAdminOrModerator
 * - Allows access if role is 'admin' or 'moderator'
 * - If you don’t have 'moderator' users yet, you can treat only 'admin' as elevated role.
 */
const requireAdminOrModerator = (req, res, next) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'moderator') {
    return res.status(403).json({
      message: 'Admin/Moderator access required'
    });
  }
  next();
};

module.exports = { authenticateToken, requireAdmin, requireAdminOrModerator };
