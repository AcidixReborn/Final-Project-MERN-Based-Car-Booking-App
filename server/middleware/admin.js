// Admin role authorization middleware
// Checks if authenticated user has admin privileges
// IMPORTANT: Must be used AFTER the protect middleware
const admin = (req, res, next) => {
  // Return 401 if no user attached (protect middleware not run)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  // Return 403 if user is not an admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  // User is admin, proceed to next middleware/controller
  next();
};

// Role-based authorization middleware factory
// Accepts list of allowed roles and returns middleware function
// Usage: authorize('admin', 'manager') allows both roles
const authorize = (...roles) => {
  // Return middleware function that checks user's role
  return (req, res, next) => {
    // Return 401 if no user attached to request
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    // Return 403 if user's role is not in allowed roles array
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }

    // User has required role, proceed to next middleware
    next();
  };
};

// Export admin and authorize middleware functions
module.exports = { admin, authorize };
