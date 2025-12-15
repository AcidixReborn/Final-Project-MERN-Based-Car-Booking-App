// Express framework for creating router
const express = require('express');
// Create Express router instance for user routes
const router = express.Router();
// Import user controller functions
const {
  getUserProfile, // Handler for getting a user's public profile
  getUserStats    // Handler for getting current user's statistics
} = require('../controllers/userController');
// Authentication middleware to protect routes
const { protect } = require('../middleware/auth');
// Validation middleware
const { validate, mongoIdParam } = require('../middleware/validator');

// ============================================
// PROTECTED ROUTES - Authentication required
// ============================================

// GET /api/users/stats - Get current user's statistics
// Returns: bookingStats, totalSpent, totalBookings, reviewCount, favoriteCarType
// Note: Must be defined before /:id to avoid route conflict
router.get('/stats', protect, getUserStats);

// ============================================
// PUBLIC ROUTES - No authentication required
// ============================================

// GET /api/users/:id - Get a user's public profile
// Returns only: name, avatar, memberSince, reviewCount
router.get('/:id', mongoIdParam, validate, getUserProfile);

// Export router for use in server.js
module.exports = router;
