// Express framework for creating router
const express = require('express');
// Create Express router instance for payment routes
const router = express.Router();
// Import payment controller functions
const {
  createPaymentIntent, // Handler for creating Stripe payment intent
  confirmPayment,      // Handler for confirming payment completion
  handleWebhook,       // Handler for Stripe webhook events
  getPaymentStatus,    // Handler for getting payment status
  processRefund        // Admin handler for processing refunds
} = require('../controllers/paymentController');
// Authentication middleware to protect routes
const { protect } = require('../middleware/auth');
// Admin authorization middleware
const { admin } = require('../middleware/admin');
// Validation middleware
const { validate, mongoIdParam } = require('../middleware/validator');

// ============================================
// WEBHOOK ROUTE - Special handling for Stripe
// ============================================

// POST /api/payments/webhook - Handle Stripe webhook events
// IMPORTANT: Uses raw body parser (not JSON) for signature verification
// Handles: payment_intent.succeeded, payment_intent.payment_failed
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// ============================================
// PROTECTED ROUTES - Authentication required
// ============================================

// POST /api/payments/create-intent - Create a Stripe payment intent
// Body: { bookingId }
// Returns: { clientSecret, paymentIntentId, amount }
router.post('/create-intent', protect, createPaymentIntent);

// POST /api/payments/confirm - Confirm payment was successful
// Body: { bookingId, paymentIntentId }
// Updates booking status to confirmed
router.post('/confirm', protect, confirmPayment);

// GET /api/payments/:bookingId/status - Get payment status for a booking
// Returns: { bookingId, paymentStatus, stripeStatus, amount }
router.get('/:bookingId/status', protect, mongoIdParam, validate, getPaymentStatus);

// ============================================
// ADMIN ROUTES - Authentication + Admin role required
// ============================================

// POST /api/payments/:bookingId/refund - Process a refund for a booking
// Only works for paid bookings, cancels booking on success
router.post('/:bookingId/refund', protect, admin, mongoIdParam, validate, processRefund);

// Export router for use in server.js
module.exports = router;
