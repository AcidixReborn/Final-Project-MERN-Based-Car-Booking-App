// Express framework for creating router
const express = require('express');
// Create Express router instance for booking routes
const router = express.Router();
// Import booking controller functions
const {
  createBooking,       // Handler for creating a new booking
  getMyBookings,       // Handler for getting current user's bookings
  getBookingById,      // Handler for getting a specific booking
  cancelBooking,       // Handler for cancelling a booking
  updateBookingStatus, // Admin handler for updating booking status
  getAllBookings,      // Admin handler for getting all bookings
  calculatePrice       // Handler for calculating booking price preview
} = require('../controllers/bookingController');
// Authentication middleware to protect routes
const { protect } = require('../middleware/auth');
// Admin authorization middleware
const { admin } = require('../middleware/admin');
// Validation middleware and rule sets
const { validate, bookingRules, mongoIdParam } = require('../middleware/validator');

// ============================================
// PUBLIC ROUTES - No authentication required
// ============================================

// POST /api/bookings/calculate - Calculate booking price preview
// Body: { carId, startDate, endDate, extras[] }
// Returns pricing breakdown without creating a booking
router.post('/calculate', calculatePrice);

// ============================================
// PROTECTED ROUTES - Authentication required
// ============================================

// POST /api/bookings - Create a new booking
// Body: { carId, startDate, endDate, extras[], pickupLocation, dropoffLocation, notes }
router.post('/', protect, bookingRules, validate, createBooking);

// GET /api/bookings/my - Get current user's bookings with pagination
// Query params: status, page, limit
router.get('/my', protect, getMyBookings);

// GET /api/bookings/:id - Get a specific booking by ID
// Only accessible by booking owner or admin
router.get('/:id', protect, mongoIdParam, validate, getBookingById);

// PUT /api/bookings/:id/cancel - Cancel a booking
// Body: { reason } (optional)
router.put('/:id/cancel', protect, mongoIdParam, validate, cancelBooking);

// ============================================
// ADMIN ROUTES - Authentication + Admin role required
// ============================================

// GET /api/bookings - Get all bookings with filters and pagination
// Query params: status, page, limit, startDate, endDate
router.get('/', protect, admin, getAllBookings);

// PUT /api/bookings/:id/status - Update booking status
// Body: { status } (pending, confirmed, active, completed, cancelled)
router.put('/:id/status', protect, admin, mongoIdParam, validate, updateBookingStatus);

// Export router for use in server.js
module.exports = router;
