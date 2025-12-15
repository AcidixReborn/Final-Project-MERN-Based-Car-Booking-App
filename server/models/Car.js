const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: [true, 'Please provide car brand'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Please provide car model'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Please provide car year'],
    min: [1990, 'Year must be 1990 or later'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  type: {
    type: String,
    required: [true, 'Please provide car type'],
    enum: ['economy', 'suv', 'luxury', 'sports', 'van', 'truck'],
    lowercase: true
  },
  pricePerDay: {
    type: Number,
    required: [true, 'Please provide price per day'],
    min: [0, 'Price cannot be negative']
  },
  seats: {
    type: Number,
    required: [true, 'Please provide number of seats'],
    min: [1, 'Must have at least 1 seat'],
    max: [15, 'Cannot have more than 15 seats']
  },
  transmission: {
    type: String,
    required: [true, 'Please provide transmission type'],
    enum: ['automatic', 'manual'],
    lowercase: true
  },
  fuelType: {
    type: String,
    required: [true, 'Please provide fuel type'],
    enum: ['gasoline', 'diesel', 'electric', 'hybrid'],
    lowercase: true
  },
  mileage: {
    type: Number,
    default: 0
  },
  images: [{
    type: String
  }],
  features: [{
    type: String
  }],
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  available: {
    type: Boolean,
    default: true
  },
  location: {
    type: String,
    default: 'Main Office'
  },
  licensePlate: {
    type: String,
    unique: true,
    sparse: true
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search functionality
carSchema.index({ brand: 'text', model: 'text', description: 'text' });
carSchema.index({ type: 1, pricePerDay: 1, available: 1 });

// Virtual for full car name
carSchema.virtual('fullName').get(function() {
  return `${this.year} ${this.brand} ${this.model}`;
});

// Ensure virtuals are included in JSON output
carSchema.set('toJSON', { virtuals: true });
carSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Car', carSchema);
