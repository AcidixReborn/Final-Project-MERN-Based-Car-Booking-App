// AuditLog model for persisting log entries to database
const AuditLog = require('../models/AuditLog');

// Extract client IP address from request
// Handles proxied requests and various header formats
const getClientIP = (req) => {
  return req.ip ||
         // X-Forwarded-For header may contain comma-separated IPs; take first one
         req.headers['x-forwarded-for']?.split(',')[0] ||
         // Fallback to socket remote address
         req.connection?.remoteAddress ||
         // Default if no IP can be determined
         'unknown';
};

// Middleware to log all API requests
// Captures request/response details for audit trail
const requestLogger = async (req, res, next) => {
  // Array of paths to skip logging (health checks, static files)
  const skipPaths = ['/api/health', '/favicon.ico'];
  // Skip logging for excluded paths
  if (skipPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  // Store original res.end function for later restoration
  const originalEnd = res.end;
  // Record request start time for response time calculation
  const startTime = Date.now();

  // Override res.end to capture response status after completion
  res.end = function(chunk, encoding) {
    // Restore original end function
    res.end = originalEnd;
    // Call original end with arguments
    res.end(chunk, encoding);

    // Determine if this request should be logged
    // Log all non-GET requests, or GET requests to admin/auth paths
    const shouldLog = req.method !== 'GET' ||
                      req.path.includes('/admin') ||
                      req.path.includes('/auth');

    if (shouldLog) {
      // Prepare log data object with request/response details
      const logData = {
        userId: req.user?._id,           // User ID if authenticated
        userEmail: req.user?.email,       // User email if authenticated
        action: 'API_REQUEST',            // Generic API request action type
        resource: getResourceFromPath(req.path), // Determine resource category
        details: {
          method: req.method,             // HTTP method (GET, POST, etc.)
          path: req.path,                 // Request path
          query: req.query,               // Query string parameters
          responseTime: Date.now() - startTime // Response time in milliseconds
        },
        ipAddress: getClientIP(req),      // Client IP address
        userAgent: req.headers['user-agent'], // Browser/client user agent
        method: req.method,               // HTTP method (duplicate for schema)
        endpoint: req.path,               // API endpoint path
        statusCode: res.statusCode,       // HTTP response status code
        success: res.statusCode < 400     // True if request was successful
      };

      // Log asynchronously - don't block the response
      AuditLog.log(logData).catch(console.error);
    }
  };

  // Continue to next middleware
  next();
};

// Determine resource type from request path
// Maps URL paths to resource categories for audit log filtering
const getResourceFromPath = (path) => {
  if (path.includes('/auth')) return 'auth';         // Authentication operations
  if (path.includes('/booking')) return 'booking';   // Booking operations
  if (path.includes('/payment')) return 'payment';   // Payment operations
  if (path.includes('/car')) return 'car';           // Car/vehicle operations
  if (path.includes('/review')) return 'review';     // Review operations
  if (path.includes('/user')) return 'user';         // User management operations
  if (path.includes('/admin')) return 'admin';       // Admin dashboard operations
  return 'system';                                   // Default system category
};

// Helper function to create specific audit log entries
// Used by controllers to log specific actions with custom details
const createAuditLog = async (req, action, resource, details = {}, resourceId = null) => {
  try {
    await AuditLog.log({
      userId: req.user?._id,            // User performing the action
      userEmail: req.user?.email,        // User's email for historical reference
      action,                            // Action type (BOOKING_CREATE, etc.)
      resource,                          // Resource category
      resourceId,                        // ID of affected resource
      details,                           // Additional context/metadata
      ipAddress: getClientIP(req),       // Client IP address
      userAgent: req.headers['user-agent'], // Client user agent
      method: req.method,                // HTTP method used
      endpoint: req.path,                // API endpoint called
      success: true                      // Marks action as successful
    });
  } catch (error) {
    // Log error but don't throw - audit logging should not break the app
    console.error('Error creating audit log:', error);
  }
};

// Helper function to log errors to audit trail
// Called by error handler middleware for failed operations
const logError = async (req, error, action = 'ERROR') => {
  try {
    await AuditLog.log({
      userId: req.user?._id,             // User ID if authenticated
      userEmail: req.user?.email,         // User email if authenticated
      action,                             // Action type (usually 'ERROR')
      resource: getResourceFromPath(req.path), // Resource where error occurred
      details: {
        error: error.message,             // Error message
        // Include stack trace only in development for debugging
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      ipAddress: getClientIP(req),        // Client IP address
      userAgent: req.headers['user-agent'], // Client user agent
      method: req.method,                 // HTTP method of failed request
      endpoint: req.path,                 // Endpoint where error occurred
      success: false,                     // Mark as failed
      errorMessage: error.message         // Store error message separately
    });
  } catch (err) {
    // Log secondary error but don't throw
    console.error('Error logging error:', err);
  }
};

// Export audit logging functions for use in middleware and controllers
module.exports = {
  requestLogger,    // Express middleware for automatic request logging
  createAuditLog,   // Helper for custom audit entries
  logError,         // Helper for error logging
  getClientIP       // Utility to extract client IP
};
