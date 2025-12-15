const AuditLog = require('../models/AuditLog');

// Get client IP address
const getClientIP = (req) => {
  return req.ip ||
         req.headers['x-forwarded-for']?.split(',')[0] ||
         req.connection?.remoteAddress ||
         'unknown';
};

// Middleware to log all API requests
const requestLogger = async (req, res, next) => {
  // Skip logging for certain routes
  const skipPaths = ['/api/health', '/favicon.ico'];
  if (skipPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  // Store original end function
  const originalEnd = res.end;
  const startTime = Date.now();

  // Override end function to capture response
  res.end = function(chunk, encoding) {
    res.end = originalEnd;
    res.end(chunk, encoding);

    // Only log non-GET requests or important GETs
    const shouldLog = req.method !== 'GET' ||
                      req.path.includes('/admin') ||
                      req.path.includes('/auth');

    if (shouldLog) {
      const logData = {
        userId: req.user?._id,
        userEmail: req.user?.email,
        action: 'API_REQUEST',
        resource: getResourceFromPath(req.path),
        details: {
          method: req.method,
          path: req.path,
          query: req.query,
          responseTime: Date.now() - startTime
        },
        ipAddress: getClientIP(req),
        userAgent: req.headers['user-agent'],
        method: req.method,
        endpoint: req.path,
        statusCode: res.statusCode,
        success: res.statusCode < 400
      };

      // Log asynchronously - don't block the response
      AuditLog.log(logData).catch(console.error);
    }
  };

  next();
};

// Determine resource type from request path
const getResourceFromPath = (path) => {
  if (path.includes('/auth')) return 'auth';
  if (path.includes('/booking')) return 'booking';
  if (path.includes('/payment')) return 'payment';
  if (path.includes('/car')) return 'car';
  if (path.includes('/review')) return 'review';
  if (path.includes('/user')) return 'user';
  if (path.includes('/admin')) return 'admin';
  return 'system';
};

// Helper function to create specific audit log entries
const createAuditLog = async (req, action, resource, details = {}, resourceId = null) => {
  try {
    await AuditLog.log({
      userId: req.user?._id,
      userEmail: req.user?.email,
      action,
      resource,
      resourceId,
      details,
      ipAddress: getClientIP(req),
      userAgent: req.headers['user-agent'],
      method: req.method,
      endpoint: req.path,
      success: true
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
};

// Helper function to log errors
const logError = async (req, error, action = 'ERROR') => {
  try {
    await AuditLog.log({
      userId: req.user?._id,
      userEmail: req.user?.email,
      action,
      resource: getResourceFromPath(req.path),
      details: {
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      ipAddress: getClientIP(req),
      userAgent: req.headers['user-agent'],
      method: req.method,
      endpoint: req.path,
      success: false,
      errorMessage: error.message
    });
  } catch (err) {
    console.error('Error logging error:', err);
  }
};

module.exports = {
  requestLogger,
  createAuditLog,
  logError,
  getClientIP
};
