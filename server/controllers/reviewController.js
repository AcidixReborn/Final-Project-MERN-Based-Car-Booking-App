// Review model for database operations on car ratings/comments
const Review = require('../models/Review');
// Car model for verifying car exists before review
const Car = require('../models/Car');
// Booking model for verifying user has rented the car (verified reviews)
const Booking = require('../models/Booking');
// Async handler to catch errors and pass to error middleware
const { asyncHandler } = require('../middleware/errorHandler');
// Audit logging utility for tracking review actions
const { createAuditLog } = require('../middleware/auditLogger');

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  // Destructure review data from request body
  const { carId, rating, title, comment, bookingId } = req.body;

  // Verify car exists before allowing review
  const car = await Car.findById(carId);
  if (!car) {
    return res.status(404).json({
      success: false,
      message: 'Car not found'
    });
  }

  // Check if user already reviewed this car (one review per user per car)
  const existingReview = await Review.findOne({
    user: req.user._id,
    car: carId
  });

  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: 'You have already reviewed this car'
    });
  }

  // Check if user has completed booking for this car (verified review badge)
  let isVerifiedBooking = false;
  if (bookingId) {
    // Check specific booking provided
    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user._id,
      car: carId,
      status: 'completed'
    });
    isVerifiedBooking = !!booking;
  } else {
    // Check if user has any completed booking for this car
    const anyBooking = await Booking.findOne({
      user: req.user._id,
      car: carId,
      status: 'completed'
    });
    isVerifiedBooking = !!anyBooking;
  }

  // Create new review document
  const review = await Review.create({
    user: req.user._id,
    car: carId,
    booking: bookingId || null,
    rating,
    title,
    comment,
    isVerifiedBooking
  });

  // Populate user details for response
  await review.populate('user', 'name avatar');

  // Log review creation to audit trail
  await createAuditLog(req, 'REVIEW_CREATE', 'review', { carId, rating }, review._id);

  // Return created review
  res.status(201).json({
    success: true,
    message: 'Review submitted successfully',
    data: { review }
  });
});

// @desc    Get reviews for a car
// @route   GET /api/reviews/car/:carId
// @access  Public
const getCarReviews = asyncHandler(async (req, res) => {
  // Get pagination and sort parameters
  const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

  // Calculate pagination values
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Fetch reviews for specified car with user details
  const reviews = await Review.find({ car: req.params.carId })
    .populate('user', 'name avatar')
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  // Get total review count for pagination
  const total = await Review.countDocuments({ car: req.params.carId });

  // Calculate rating distribution (how many 5-star, 4-star, etc.)
  const ratingStats = await Review.aggregate([
    { $match: { car: require('mongoose').Types.ObjectId.createFromHexString(req.params.carId) } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } }
  ]);

  // Return reviews with stats and pagination
  res.status(200).json({
    success: true,
    data: {
      reviews,
      ratingStats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  });
});

// @desc    Get user's reviews
// @route   GET /api/reviews/my
// @access  Private
const getMyReviews = asyncHandler(async (req, res) => {
  // Fetch all reviews by current user with car details
  const reviews = await Review.find({ user: req.user._id })
    .populate('car', 'brand model year images')
    .sort('-createdAt');

  // Return user's reviews
  res.status(200).json({
    success: true,
    data: { reviews }
  });
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
  // Destructure updatable fields from request body
  const { rating, title, comment } = req.body;

  // Find review by ID
  let review = await Review.findById(req.params.id);

  // Return 404 if review not found
  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  // Verify user owns this review
  if (review.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this review'
    });
  }

  // Update only provided fields
  if (rating) review.rating = rating;
  if (title !== undefined) review.title = title;
  if (comment) review.comment = comment;

  // Save updated review (triggers post-save hook to recalculate car rating)
  await review.save();

  // Populate user details for response
  await review.populate('user', 'name avatar');

  // Log review update to audit trail
  await createAuditLog(req, 'REVIEW_UPDATE', 'review', { rating }, review._id);

  // Return updated review
  res.status(200).json({
    success: true,
    message: 'Review updated successfully',
    data: { review }
  });
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  // Find review by ID
  const review = await Review.findById(req.params.id);

  // Return 404 if review not found
  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  // Verify user owns review or is admin
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this review'
    });
  }

  // Store car ID for audit log before deletion
  const carId = review.car;

  // Log review deletion to audit trail
  await createAuditLog(req, 'REVIEW_DELETE', 'review', { carId }, review._id);

  // Delete review (triggers post-delete hook to recalculate car rating)
  await review.deleteOne();

  // Return success response
  res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  });
});

// @desc    Get recent reviews (for homepage)
// @route   GET /api/reviews/recent
// @access  Public
const getRecentReviews = asyncHandler(async (req, res) => {
  // Fetch recent positive reviews (4+ stars) for homepage testimonials
  const reviews = await Review.find({ rating: { $gte: 4 } })
    .populate('user', 'name avatar')
    .populate('car', 'brand model year images')
    .sort('-createdAt')
    .limit(6);

  // Return recent reviews
  res.status(200).json({
    success: true,
    data: { reviews }
  });
});

// Export all review controller functions
module.exports = {
  createReview,      // Create new review
  getCarReviews,     // Get reviews for specific car
  getMyReviews,      // Get current user's reviews
  updateReview,      // Update own review
  deleteReview,      // Delete own review (or admin)
  getRecentReviews   // Get recent positive reviews for homepage
};
