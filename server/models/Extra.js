const mongoose = require('mongoose');

const extraSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide extra name'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide description'],
    trim: true
  },
  pricePerDay: {
    type: Number,
    required: [true, 'Please provide price per day'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    enum: ['protection', 'convenience', 'child-safety', 'other'],
    default: 'other'
  },
  icon: {
    type: String,
    default: ''
  },
  available: {
    type: Boolean,
    default: true
  },
  maxQuantity: {
    type: Number,
    default: 1,
    min: 1
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Extra', extraSchema);
