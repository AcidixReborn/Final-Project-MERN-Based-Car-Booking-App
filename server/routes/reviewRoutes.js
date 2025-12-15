// Express framework for creating router
const express = require('express');
// Create Express router instance for review routes
const router = express.Router();
// Import review controller functions
const {
  createReview,     // Handler for creating a new review
  getCarReviews,    // Handler for getting reviews for a specific car
  getMyReviews,     // Handler for getting current user's reviews
  updateReview,     // Handler for updating a review
  deleteReview,     // Handler for deleting a review
  getRecentReviews  // Handler for getting recent positive reviews
} = require('../controllers/reviewController');
// Authentication middleware to protect routes
const { protect } = require('../middleware/auth');
// Validation middleware and rule sets
const { validate, reviewRules, mongoIdParam } = require('../middleware/validator');

// ============================================
// PUBLIC ROUTES - No authentication required
// ============================================

// GET /api/reviews/recent - Get recent positive reviews (4+ stars)
// Used for homepage testimonials section
router.get('/recent', getRecentReviews);

// GET /api/reviews/car/:carId - Get all reviews for a specific car
// Query params: page, limit, sort
// Includes rating distribution statistics
router.get('/car/:carId', getCarReviews);

// ============================================
// PROTECTED ROUTES - Authentication required
// ============================================

// POST /api/reviews - Create a new review for a car
// Body: { carId, rating, title, comment, bookingId }
// User can only review each car once
router.post('/', protect, reviewRules, validate, createReview);

// GET /api/reviews/my - Get current user's reviews
// Includes car details for each review
router.get('/my', protect, getMyReviews);

// PUT /api/reviews/:id - Update an existing review
// Body: { rating, title, comment }
// Only the review owner can update
router.put('/:id', protect, mongoIdParam, validate, updateReview);

// DELETE /api/reviews/:id - Delete a review
// Only the review owner or admin can delete
router.delete('/:id', protect, mongoIdParam, validate, deleteReview);

// Export router for use in server.js
module.exports = router;
