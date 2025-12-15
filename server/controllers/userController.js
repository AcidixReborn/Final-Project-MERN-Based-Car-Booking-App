const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get user profile (public info)
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('name avatar createdAt');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Get user's review count
  const reviewCount = await Review.countDocuments({ user: req.params.id });

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
  const userId = req.user._id;

  // Get booking counts by status
  const bookingStats = await Booking.aggregate([
    { $match: { user: userId } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Get total spent
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

  // Get review count
  const reviewCount = await Review.countDocuments({ user: userId });

  // Get favorite car type
  const favoriteType = await Booking.aggregate([
    { $match: { user: userId, status: { $ne: 'cancelled' } } },
    {
      $lookup: {
        from: 'cars',
        localField: 'car',
        foreignField: '_id',
        as: 'carDetails'
      }
    },
    { $unwind: '$carDetails' },
    { $group: { _id: '$carDetails.type', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 }
  ]);

  res.status(200).json({
    success: true,
    data: {
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

module.exports = {
  getUserProfile,
  getUserStats
};
