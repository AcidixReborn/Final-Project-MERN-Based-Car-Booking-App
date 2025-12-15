const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userEmail: {
    type: String
  },
  action: {
    type: String,
    required: true,
    enum: [
      // Auth actions
      'LOGIN',
      'LOGOUT',
      'REGISTER',
      'PASSWORD_CHANGE',
      'LOGIN_FAILED',

      // Booking actions
      'BOOKING_CREATE',
      'BOOKING_UPDATE',
      'BOOKING_CANCEL',
      'BOOKING_COMPLETE',

      // Payment actions
      'PAYMENT_INITIATED',
      'PAYMENT_SUCCESS',
      'PAYMENT_FAILED',
      'PAYMENT_REFUND',

      // Car actions
      'CAR_CREATE',
      'CAR_UPDATE',
      'CAR_DELETE',
      'CAR_VIEW',

      // Review actions
      'REVIEW_CREATE',
      'REVIEW_UPDATE',
      'REVIEW_DELETE',

      // User management actions
      'USER_CREATE',
      'USER_UPDATE',
      'USER_DELETE',
      'USER_DEACTIVATE',
      'USER_ACTIVATE',

      // Admin actions
      'ADMIN_ACCESS',
      'REPORT_GENERATED',
      'SETTINGS_UPDATE',

      // Other
      'API_REQUEST',
      'ERROR'
    ]
  },
  resource: {
    type: String,
    required: true,
    enum: ['auth', 'booking', 'payment', 'car', 'review', 'user', 'admin', 'system']
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  previousValue: {
    type: mongoose.Schema.Types.Mixed
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  },
  endpoint: {
    type: String
  },
  statusCode: {
    type: Number
  },
  success: {
    type: Boolean,
    default: true
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

// TTL index - automatically delete logs older than 90 days (optional)
// auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Static method to create audit log entry
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

// Static method to get logs by user
auditLogSchema.statics.getByUser = function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .exec();
};

// Static method to get logs by action
auditLogSchema.statics.getByAction = function(action, limit = 50) {
  return this.find({ action })
    .sort({ createdAt: -1 })
    .limit(limit)
    .exec();
};

// Static method to get logs by date range
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

module.exports = mongoose.model('AuditLog', auditLogSchema);
