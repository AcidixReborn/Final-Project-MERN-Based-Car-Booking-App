// Mongoose ODM for MongoDB schema definition
const mongoose = require('mongoose');

// Booking schema definition for car rental reservations
const bookingSchema = new mongoose.Schema({
  // Reference to the user who made the booking
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Reference to the booked car
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  // Rental period start date
  startDate: {
    type: Date,
    required: [true, 'Please provide start date']
  },
  // Rental period end date
  endDate: {
    type: Date,
    required: [true, 'Please provide end date']
  },
  // Location where customer picks up the car
  pickupLocation: {
    type: String,
    default: 'Main Office'
  },
  // Location where customer returns the car
  dropoffLocation: {
    type: String,
    default: 'Main Office'
  },
  // Array of selected extras/add-ons (insurance, GPS, etc.)
  extras: [{
    extra: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Extra'
    },
    name: String,           // Extra name for display
    pricePerDay: Number,    // Price per day for this extra
    quantity: {
      type: Number,
      default: 1
    }
  }],
  // Pricing breakdown object
  pricing: {
    basePrice: {            // Car rental base cost (pricePerDay * days)
      type: Number,
      required: true
    },
    extrasTotal: {          // Total cost of all extras
      type: Number,
      default: 0
    },
    taxAmount: {            // Calculated tax amount
      type: Number,
      default: 0
    },
    totalDays: {            // Number of rental days
      type: Number,
      required: true
    }
  },
  // Final total price including all costs and taxes
  totalPrice: {
    type: Number,
    required: true
  },
  // Booking lifecycle status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  // Payment processing status
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  // Stripe payment ID for reference
  paymentId: {
    type: String
  },
  // Stripe PaymentIntent ID for tracking
  paymentIntentId: {
    type: String
  },
  // Stripe Checkout Session ID
  stripeSessionId: {
    type: String
  },
  // Customer notes or special requests
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  // Reason provided when booking is cancelled
  cancellationReason: {
    type: String
  },
  // Timestamp when booking was cancelled
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

// Pre-validation middleware to ensure end date is after start date
bookingSchema.pre('validate', function(next) {
  if (this.startDate && this.endDate) {
    if (this.endDate <= this.startDate) {
      next(new Error('End date must be after start date'));
    }
  }
  next();
});

// Virtual property to calculate rental duration in days
bookingSchema.virtual('duration').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return 0;
});

// Index for user's booking queries
bookingSchema.index({ user: 1, status: 1 });
// Index for car availability checks (date overlap queries)
bookingSchema.index({ car: 1, startDate: 1, endDate: 1 });
// Index for admin booking list queries
bookingSchema.index({ status: 1, createdAt: -1 });

// Configure schema to include virtual fields in JSON output
bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

// Export the Booking model for use in controllers
module.exports = mongoose.model('Booking', bookingSchema);
