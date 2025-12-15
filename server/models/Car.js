// Mongoose ODM for MongoDB schema definition
const mongoose = require('mongoose');

// Car schema definition with comprehensive vehicle details
const carSchema = new mongoose.Schema({
  // Car manufacturer name (e.g., Toyota, BMW)
  brand: {
    type: String,
    required: [true, 'Please provide car brand'],
    trim: true
  },
  // Car model name (e.g., Camry, X5)
  model: {
    type: String,
    required: [true, 'Please provide car model'],
    trim: true
  },
  // Manufacturing year with range validation
  year: {
    type: Number,
    required: [true, 'Please provide car year'],
    min: [1990, 'Year must be 1990 or later'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  // Vehicle category for filtering and pricing
  type: {
    type: String,
    required: [true, 'Please provide car type'],
    enum: ['economy', 'suv', 'luxury', 'sports', 'van', 'truck'],
    lowercase: true
  },
  // Daily rental rate in dollars
  pricePerDay: {
    type: Number,
    required: [true, 'Please provide price per day'],
    min: [0, 'Price cannot be negative']
  },
  // Passenger capacity
  seats: {
    type: Number,
    required: [true, 'Please provide number of seats'],
    min: [1, 'Must have at least 1 seat'],
    max: [15, 'Cannot have more than 15 seats']
  },
  // Gearbox type (automatic or manual)
  transmission: {
    type: String,
    required: [true, 'Please provide transmission type'],
    enum: ['automatic', 'manual'],
    lowercase: true
  },
  // Engine fuel type
  fuelType: {
    type: String,
    required: [true, 'Please provide fuel type'],
    enum: ['gasoline', 'diesel', 'electric', 'hybrid'],
    lowercase: true
  },
  // Odometer reading in miles
  mileage: {
    type: Number,
    default: 0
  },
  // Array of image URLs for the car gallery
  images: [{
    type: String
  }],
  // Array of feature strings (e.g., GPS, Bluetooth)
  features: [{
    type: String
  }],
  // Detailed car description for listings
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  // Availability flag for booking
  available: {
    type: Boolean,
    default: true
  },
  // Current storage location
  location: {
    type: String,
    default: 'Main Office'
  },
  // Vehicle registration plate (unique identifier)
  licensePlate: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  // Calculated average from all reviews
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  // Count of reviews for this car
  totalReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

// Text index for full-text search on brand, model, and description
carSchema.index({ brand: 'text', model: 'text', description: 'text' });
// Compound index for efficient filtering queries
carSchema.index({ type: 1, pricePerDay: 1, available: 1 });

// Virtual property to get formatted car name (year brand model)
carSchema.virtual('fullName').get(function() {
  return `${this.year} ${this.brand} ${this.model}`;
});

// Configure schema to include virtual fields in JSON output
carSchema.set('toJSON', { virtuals: true });
carSchema.set('toObject', { virtuals: true });

// Export the Car model for use in controllers
module.exports = mongoose.model('Car', carSchema);
