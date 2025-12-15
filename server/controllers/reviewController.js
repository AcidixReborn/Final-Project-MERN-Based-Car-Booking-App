const Review = require('../models/Review');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const { asyncHandler } = require('../middleware/errorHandler');
const { createAuditLog } = require('../middleware/auditLogger');

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { carId, rating, title, comment, bookingId } = req.body;

  // Check if car exists
  const car = await Car.findById(carId);
  if (!car) {
    return res.status(404).json({
      success: false,
      message: 'Car not found'
    });
  }

  // Check if user already reviewed this car
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

  // Check if user has a completed booking for this car (verified review)
  let isVerifiedBooking = false;
  if (bookingId) {
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

  // Create review
  const review = await Review.create({
    user: req.user._id,
    car: carId,
    booking: bookingId || null,
    rating,
    title,
    comment,
    isVerifiedBooking
  });

  await review.populate('user', 'name avatar');

  await createAuditLog(req, 'REVIEW_CREATE', 'review', { carId, rating }, review._id);

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
  const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const reviews = await Review.find({ car: req.params.carId })
    .populate('user', 'name avatar')
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  const total = await Review.countDocuments({ car: req.params.carId });

  // Calculate rating distribution
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
  const reviews = await Review.find({ user: req.user._id })
    .populate('car', 'brand model year images')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    data: { reviews }
  });
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;

  let review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  // Check if user owns the review
  if (review.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this review'
    });
  }

  // Update review
  if (rating) review.rating = rating;
  if (title !== undefined) review.title = title;
  if (comment) review.comment = comment;

  await review.save();

  await review.populate('user', 'name avatar');

  await createAuditLog(req, 'REVIEW_UPDATE', 'review', { rating }, review._id);

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
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  // Check if user owns the review or is admin
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this review'
    });
  }

  const carId = review.car;

  await createAuditLog(req, 'REVIEW_DELETE', 'review', { carId }, review._id);

  await review.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  });
});

// @desc    Get recent reviews (for homepage)
// @route   GET /api/reviews/recent
// @access  Public
const getRecentReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ rating: { $gte: 4 } })
    .populate('user', 'name avatar')
    .populate('car', 'brand model year images')
    .sort('-createdAt')
    .limit(6);

  res.status(200).json({
    success: true,
    data: { reviews }
  });
});

module.exports = {
  createReview,
  getCarReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  getRecentReviews
};
