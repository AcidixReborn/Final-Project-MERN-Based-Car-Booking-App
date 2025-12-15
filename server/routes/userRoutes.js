const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  getUserStats
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { validate, mongoIdParam } = require('../middleware/validator');

// Protected routes
router.get('/stats', protect, getUserStats);

// Public routes
router.get('/:id', mongoIdParam, validate, getUserProfile);

module.exports = router;
