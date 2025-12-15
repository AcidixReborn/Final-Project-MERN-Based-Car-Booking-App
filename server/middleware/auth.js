// JSON Web Token library for token verification and generation
const jwt = require('jsonwebtoken');
// User model for looking up authenticated users
const User = require('../models/User');

// Protect routes - require authentication middleware
// Verifies JWT token and attaches user object to request
const protect = async (req, res, next) => {
  // Variable to store extracted token from header
  let token;

  // Check for token in Authorization header with Bearer scheme
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Extract token from "Bearer <token>" format
    token = req.headers.authorization.split(' ')[1];
  }

  // Return 401 if no token was provided
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token signature and decode payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from database using ID from token payload
    req.user = await User.findById(decoded.id).select('-password');

    // Return 401 if user no longer exists in database
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return 401 if user account has been deactivated
    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    // User authenticated successfully, proceed to next middleware
    next();
  } catch (error) {
    // Log authentication error for debugging
    console.error('Auth middleware error:', error.message);
    // Return 401 for any token verification errors
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Optional authentication middleware - attaches user if token exists but doesn't require it
// Useful for routes that behave differently for authenticated vs anonymous users
const optionalAuth = async (req, res, next) => {
  // Variable to store extracted token
  let token;

  // Check for Bearer token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Extract token from header
    token = req.headers.authorization.split(' ')[1];
  }

  // If token exists, try to verify and attach user
  if (token) {
    try {
      // Decode and verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Attach user to request if token is valid
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Token invalid - set user to null but don't block request
      req.user = null;
    }
  }

  // Always proceed to next middleware regardless of auth status
  next();
};

// Generate JWT token for a user ID
// Returns signed token with configured expiration time
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    // Token expires after JWT_EXPIRE env var or 7 days by default
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Export authentication middleware functions
module.exports = { protect, optionalAuth, generateToken };
