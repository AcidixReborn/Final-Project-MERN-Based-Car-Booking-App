const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
  getAllBookings,
  calculatePrice
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { validate, bookingRules, mongoIdParam } = require('../middleware/validator');

// Public route for price calculation
router.post('/calculate', calculatePrice);

// Protected routes
router.post('/', protect, bookingRules, validate, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/:id', protect, mongoIdParam, validate, getBookingById);
router.put('/:id/cancel', protect, mongoIdParam, validate, cancelBooking);

// Admin routes
router.get('/', protect, admin, getAllBookings);
router.put('/:id/status', protect, admin, mongoIdParam, validate, updateBookingStatus);

module.exports = router;
