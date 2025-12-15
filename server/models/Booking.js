const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide end date']
  },
  pickupLocation: {
    type: String,
    default: 'Main Office'
  },
  dropoffLocation: {
    type: String,
    default: 'Main Office'
  },
  extras: [{
    extra: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Extra'
    },
    name: String,
    pricePerDay: Number,
    quantity: {
      type: Number,
      default: 1
    }
  }],
  pricing: {
    basePrice: {
      type: Number,
      required: true
    },
    extrasTotal: {
      type: Number,
      default: 0
    },
    taxAmount: {
      type: Number,
      default: 0
    },
    totalDays: {
      type: Number,
      required: true
    }
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentId: {
    type: String
  },
  paymentIntentId: {
    type: String
  },
  stripeSessionId: {
    type: String
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  cancellationReason: {
    type: String
  },
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Validate that end date is after start date
bookingSchema.pre('validate', function(next) {
  if (this.startDate && this.endDate) {
    if (this.endDate <= this.startDate) {
      next(new Error('End date must be after start date'));
    }
  }
  next();
});

// Calculate total days virtual
bookingSchema.virtual('duration').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return 0;
});

// Index for efficient queries
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ car: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });

// Ensure virtuals are included in JSON output
bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Booking', bookingSchema);
