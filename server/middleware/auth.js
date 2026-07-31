import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Route protection middleware to verify JWT token.
 * Extracts the token, decodes it, and attaches the user model to the request object.
 */
export const protect = async (req, res, next) => {
  let token;

  // Retrieve token from Authorization header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'wellfit_super_secret_jwt_key_123456');

      // Fetch user from DB and attach to request (excluding password)
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'User belonging to this token no longer exists' });
      }

      next();
    } catch (error) {
      console.error('Authentication JWT validation error:', error.message);
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

/**
 * Role authorization middleware.
 * Verifies that the logged-in user matches one of the specified roles.
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user is set by the 'protect' middleware
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: You do not have permission to perform this action (${roles.join(' or ')} only)`,
      });
    }
    next();
  };
};
