// Mongoose ODM for MongoDB schema definition
const mongoose = require('mongoose');

// AuditLog schema for tracking all user and system actions for compliance
const auditLogSchema = new mongoose.Schema({
  // Reference to the user who performed the action (null for system actions)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // User's email at time of action (for historical reference)
  userEmail: {
    type: String
  },
  // Type of action performed - categorized by feature area
  action: {
    type: String,
    required: true,
    enum: [
      // Auth actions - login, logout, registration
      'LOGIN',
      'LOGOUT',
      'REGISTER',
      'PASSWORD_CHANGE',
      'LOGIN_FAILED',

      // Booking actions - CRUD operations on bookings
      'BOOKING_CREATE',
      'BOOKING_UPDATE',
      'BOOKING_CANCEL',
      'BOOKING_COMPLETE',

      // Payment actions - Stripe payment events
      'PAYMENT_INITIATED',
      'PAYMENT_SUCCESS',
      'PAYMENT_FAILED',
      'PAYMENT_REFUND',

      // Car actions - vehicle management
      'CAR_CREATE',
      'CAR_UPDATE',
      'CAR_DELETE',
      'CAR_VIEW',

      // Review actions - ratings and comments
      'REVIEW_CREATE',
      'REVIEW_UPDATE',
      'REVIEW_DELETE',

      // User management actions - admin operations
      'USER_CREATE',
      'USER_UPDATE',
      'USER_DELETE',
      'USER_DEACTIVATE',
      'USER_ACTIVATE',

      // Admin actions - dashboard and reports
      'ADMIN_ACCESS',
      'REPORT_GENERATED',
      'SETTINGS_UPDATE',

      // Other system actions
      'API_REQUEST',
      'ERROR'
    ]
  },
  // Resource category the action was performed on
  resource: {
    type: String,
    required: true,
    enum: ['auth', 'booking', 'payment', 'car', 'review', 'user', 'admin', 'system']
  },
  // ID of the specific resource affected
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  // Additional context/metadata about the action
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  // State before the change (for update/delete operations)
  previousValue: {
    type: mongoose.Schema.Types.Mixed
  },
  // State after the change (for create/update operations)
  newValue: {
    type: mongoose.Schema.Types.Mixed
  },
  // Client IP address for security tracking
  ipAddress: {
    type: String
  },
  // Browser/client user agent string
  userAgent: {
    type: String
  },
  // HTTP method used
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  },
  // API endpoint that was called
  endpoint: {
    type: String
  },
  // HTTP response status code
  statusCode: {
    type: Number
  },
  // Whether the action was successful
  success: {
    type: Boolean,
    default: true
  },
  // Error message if action failed
  errorMessage: {
    type: String
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

// Index for querying logs by user
auditLogSchema.index({ userId: 1, createdAt: -1 });
// Index for querying logs by action type
auditLogSchema.index({ action: 1, createdAt: -1 });
// Index for querying logs by resource type
auditLogSchema.index({ resource: 1, createdAt: -1 });
// Index for general chronological queries
auditLogSchema.index({ createdAt: -1 });

// TTL index - automatically delete logs older than 90 days (optional, disabled by default)
// auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Static method to create a new audit log entry
auditLogSchema.statics.log = async function(data) {
  try {
    const logEntry = new this(data);
    await logEntry.save();
    return logEntry;
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw - logging should not break the application
  }
};

// Static method to retrieve logs for a specific user
auditLogSchema.statics.getByUser = function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .exec();
};

// Static method to retrieve logs by action type
auditLogSchema.statics.getByAction = function(action, limit = 50) {
  return this.find({ action })
    .sort({ createdAt: -1 })
    .limit(limit)
    .exec();
};

// Static method to retrieve logs within a date range
auditLogSchema.statics.getByDateRange = function(startDate, endDate, limit = 100) {
  return this.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .exec();
};

// Export the AuditLog model for use in middleware and controllers
module.exports = mongoose.model('AuditLog', auditLogSchema);
