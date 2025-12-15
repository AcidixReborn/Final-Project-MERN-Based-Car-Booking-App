// User model for database operations on user accounts
const User = require('../models/User');
// Booking model for retrieving user booking statistics
const Booking = require('../models/Booking');
// Review model for counting user reviews
const Review = require('../models/Review');
// Async handler to catch errors and pass to error middleware
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get user profile (public info)
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = asyncHandler(async (req, res) => {
  // Fetch user with only public fields (name, avatar, join date)
  const user = await User.findById(req.params.id).select('name avatar createdAt');

  // Return 404 if user not found
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Get count of reviews written by this user
  const reviewCount = await Review.countDocuments({ user: req.params.id });

  // Return public profile data
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        avatar: user.avatar,
        memberSince: user.createdAt,
        reviewCount
      }
    }
  });
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
const getUserStats = asyncHandler(async (req, res) => {
  // Get current user's ID from auth middleware
  const userId = req.user._id;

  // Aggregate booking counts grouped by status (pending, confirmed, completed, etc.)
  const bookingStats = await Booking.aggregate([
    { $match: { user: userId } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Aggregate total amount spent on paid bookings
  const spendingStats = await Booking.aggregate([
    { $match: { user: userId, paymentStatus: 'paid' } },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: '$totalPrice' },
        bookingCount: { $sum: 1 }
      }
    }
  ]);

  // Get count of reviews written by user
  const reviewCount = await Review.countDocuments({ user: userId });

  // Find user's most frequently booked car type
  const favoriteType = await Booking.aggregate([
    { $match: { user: userId, status: { $ne: 'cancelled' } } },
    {
      // Join with cars collection to get car type
      $lookup: {
        from: 'cars',
        localField: 'car',
        foreignField: '_id',
        as: 'carDetails'
      }
    },
    { $unwind: '$carDetails' },
    // Group by car type and count
    { $group: { _id: '$carDetails.type', count: { $sum: 1 } } },
    // Sort by count descending to get most popular
    { $sort: { count: -1 } },
    // Limit to top result
    { $limit: 1 }
  ]);

  // Return compiled user statistics
  res.status(200).json({
    success: true,
    data: {
      // Convert booking stats array to object with status as keys
      bookingStats: bookingStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      totalSpent: spendingStats[0]?.totalSpent || 0,
      totalBookings: spendingStats[0]?.bookingCount || 0,
      reviewCount,
      favoriteCarType: favoriteType[0]?._id || null
    }
  });
});

// Export user controller functions
module.exports = {
  getUserProfile,  // Get public user profile
  getUserStats     // Get authenticated user's statistics
};
