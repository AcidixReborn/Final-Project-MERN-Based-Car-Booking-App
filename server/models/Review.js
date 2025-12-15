// Mongoose ODM for MongoDB schema definition
const mongoose = require('mongoose');

// Review schema definition for car ratings and comments
const reviewSchema = new mongoose.Schema({
  // Reference to the user who wrote the review
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Reference to the car being reviewed
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  // Optional reference to the booking (for verified reviews)
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  // Star rating from 1 to 5
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  // Optional review title/headline
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  // Detailed review comment
  comment: {
    type: String,
    required: [true, 'Please provide a comment'],
    trim: true,
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  // Flag indicating review is from a verified rental
  isVerifiedBooking: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

// Unique compound index to prevent duplicate reviews from same user for same car
reviewSchema.index({ user: 1, car: 1 }, { unique: true });

// Static method to calculate and update average rating for a car
reviewSchema.statics.calculateAverageRating = async function(carId) {
  // Aggregate all reviews for this car to calculate average
  const stats = await this.aggregate([
    {
      $match: { car: carId }
    },
    {
      $group: {
        _id: '$car',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    // Update the car's rating fields based on aggregation results
    if (stats.length > 0) {
      await this.model('Car').findByIdAndUpdate(carId, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews
      });
    } else {
      // Reset to zero if no reviews exist
      await this.model('Car').findByIdAndUpdate(carId, {
        averageRating: 0,
        totalReviews: 0
      });
    }
  } catch (err) {
    console.error('Error calculating average rating:', err);
  }
};

// Post-save hook to recalculate car rating after a new review
reviewSchema.post('save', async function() {
  await this.constructor.calculateAverageRating(this.car);
});

// Post-delete hook to recalculate car rating after a review is removed
reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.car);
  }
});

// Export the Review model for use in controllers
module.exports = mongoose.model('Review', reviewSchema);
