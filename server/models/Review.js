const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Please provide a comment'],
    trim: true,
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  isVerifiedBooking: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Prevent duplicate reviews from same user for same car
reviewSchema.index({ user: 1, car: 1 }, { unique: true });

// Static method to calculate average rating for a car
reviewSchema.statics.calculateAverageRating = async function(carId) {
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
    if (stats.length > 0) {
      await this.model('Car').findByIdAndUpdate(carId, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews
      });
    } else {
      await this.model('Car').findByIdAndUpdate(carId, {
        averageRating: 0,
        totalReviews: 0
      });
    }
  } catch (err) {
    console.error('Error calculating average rating:', err);
  }
};

// Update car rating after saving a review
reviewSchema.post('save', async function() {
  await this.constructor.calculateAverageRating(this.car);
});

// Update car rating after removing a review
reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.car);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
