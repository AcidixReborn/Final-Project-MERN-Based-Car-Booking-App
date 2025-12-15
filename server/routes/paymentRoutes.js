const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  getPaymentStatus,
  processRefund
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { validate, mongoIdParam } = require('../middleware/validator');

// Webhook route (must be before express.json() middleware - handled in server.js)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);
router.get('/:bookingId/status', protect, mongoIdParam, validate, getPaymentStatus);

// Admin routes
router.post('/:bookingId/refund', protect, admin, mongoIdParam, validate, processRefund);

module.exports = router;
