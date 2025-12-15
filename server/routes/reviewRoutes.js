const express = require('express');
const router = express.Router();
const {
  createReview,
  getCarReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  getRecentReviews
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { validate, reviewRules, mongoIdParam } = require('../middleware/validator');

// Public routes
router.get('/recent', getRecentReviews);
router.get('/car/:carId', getCarReviews);

// Protected routes
router.post('/', protect, reviewRules, validate, createReview);
router.get('/my', protect, getMyReviews);
router.put('/:id', protect, mongoIdParam, validate, updateReview);
router.delete('/:id', protect, mongoIdParam, validate, deleteReview);

module.exports = router;
