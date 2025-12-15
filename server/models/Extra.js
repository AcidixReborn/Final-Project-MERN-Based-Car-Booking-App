// Mongoose ODM for MongoDB schema definition
const mongoose = require('mongoose');

// Extra schema definition for booking add-ons (insurance, GPS, child seats, etc.)
const extraSchema = new mongoose.Schema({
  // Display name of the extra service
  name: {
    type: String,
    required: [true, 'Please provide extra name'],
    unique: true,
    trim: true
  },
  // Detailed description of what the extra includes
  description: {
    type: String,
    required: [true, 'Please provide description'],
    trim: true
  },
  // Daily cost for this extra service
  pricePerDay: {
    type: Number,
    required: [true, 'Please provide price per day'],
    min: [0, 'Price cannot be negative']
  },
  // Category for grouping extras in the UI
  category: {
    type: String,
    enum: ['protection', 'convenience', 'child-safety', 'other'],
    default: 'other'
  },
  // Icon name/identifier for UI display
  icon: {
    type: String,
    default: ''
  },
  // Whether this extra is currently available for booking
  available: {
    type: Boolean,
    default: true
  },
  // Maximum number of this extra that can be added to a booking
  maxQuantity: {
    type: Number,
    default: 1,
    min: 1
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

// Export the Extra model for use in controllers
module.exports = mongoose.model('Extra', extraSchema);
