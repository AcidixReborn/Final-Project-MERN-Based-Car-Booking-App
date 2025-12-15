// Booking model for updating payment status on reservations
const Booking = require('../models/Booking');
// Async handler to catch errors and pass to error middleware
const { asyncHandler } = require('../middleware/errorHandler');
// Audit logging utility for tracking payment actions
const { createAuditLog } = require('../middleware/auditLogger');

// Initialize Stripe SDK with secret key from environment variables
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Create payment intent
// @route   POST /api/payments/create-intent
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res) => {
  // Get booking ID from request body
  const { bookingId } = req.body;

  // Find booking and populate car details for payment description
  const booking = await Booking.findById(bookingId).populate('car', 'brand model');

  // Return 404 if booking not found
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Verify user owns this booking
  if (booking.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to pay for this booking'
    });
  }

  // Prevent double payment
  if (booking.paymentStatus === 'paid') {
    return res.status(400).json({
      success: false,
      message: 'Booking is already paid'
    });
  }

  // Create Stripe payment intent with booking amount
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(booking.totalPrice * 100), // Convert to cents for Stripe
    currency: 'usd',
    metadata: {
      bookingId: booking._id.toString(),
      userId: req.user._id.toString(),
      carName: `${booking.car.brand} ${booking.car.model}`
    },
    description: `Car Booking: ${booking.car.brand} ${booking.car.model}`
  });

  // Store payment intent ID on booking for later verification
  booking.paymentIntentId = paymentIntent.id;
  await booking.save();

  // Log payment initiation to audit trail
  await createAuditLog(req, 'PAYMENT_INITIATED', 'payment', {
    bookingId: booking._id,
    amount: booking.totalPrice,
    paymentIntentId: paymentIntent.id
  }, booking._id);

  // Return client secret for frontend Stripe integration
  res.status(200).json({
    success: true,
    data: {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: booking.totalPrice
    }
  });
});

// @desc    Confirm payment
// @route   POST /api/payments/confirm
// @access  Private
const confirmPayment = asyncHandler(async (req, res) => {
  // Get booking and payment intent IDs from request body
  const { bookingId, paymentIntentId } = req.body;

  // Find booking by ID
  const booking = await Booking.findById(bookingId);

  // Return 404 if booking not found
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Verify payment status with Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  // If payment succeeded, update booking status
  if (paymentIntent.status === 'succeeded') {
    // Update booking payment status and confirm reservation
    booking.paymentStatus = 'paid';
    booking.paymentId = paymentIntent.id;
    booking.status = 'confirmed';
    await booking.save();

    // Log successful payment to audit trail
    await createAuditLog(req, 'PAYMENT_SUCCESS', 'payment', {
      bookingId: booking._id,
      amount: booking.totalPrice,
      paymentIntentId
    }, booking._id);

    // Return success with updated booking
    res.status(200).json({
      success: true,
      message: 'Payment successful',
      data: { booking }
    });
  } else {
    // Log failed payment attempt to audit trail
    await createAuditLog(req, 'PAYMENT_FAILED', 'payment', {
      bookingId: booking._id,
      paymentIntentId,
      status: paymentIntent.status
    }, booking._id);

    // Return failure with payment status
    res.status(400).json({
      success: false,
      message: `Payment not successful. Status: ${paymentIntent.status}`
    });
  }
});

// @desc    Handle Stripe webhook
// @route   POST /api/payments/webhook
// @access  Public (Stripe)
const handleWebhook = asyncHandler(async (req, res) => {
  // Get Stripe signature from headers for verification
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature to ensure request is from Stripe
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    // Log signature verification failure
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  // Handle different Stripe event types
  switch (event.type) {
    case 'payment_intent.succeeded':
      // Process successful payment
      const paymentIntent = event.data.object;
      await handleSuccessfulPayment(paymentIntent);
      break;

    case 'payment_intent.payment_failed':
      // Process failed payment
      const failedPayment = event.data.object;
      await handleFailedPayment(failedPayment);
      break;

    default:
      // Log unhandled event types for debugging
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Acknowledge receipt of webhook
  res.status(200).json({ received: true });
});

// Helper function for successful payment webhook processing
// Updates booking status when payment succeeds via webhook
const handleSuccessfulPayment = async (paymentIntent) => {
  // Extract booking ID from payment metadata
  const bookingId = paymentIntent.metadata.bookingId;

  if (bookingId) {
    // Find and update booking if not already marked as paid
    const booking = await Booking.findById(bookingId);
    if (booking && booking.paymentStatus !== 'paid') {
      booking.paymentStatus = 'paid';
      booking.paymentId = paymentIntent.id;
      booking.status = 'confirmed';
      await booking.save();

      console.log(`Booking ${bookingId} payment confirmed via webhook`);
    }
  }
};

// Helper function for failed payment webhook processing
// Updates booking payment status when payment fails
const handleFailedPayment = async (paymentIntent) => {
  // Extract booking ID from payment metadata
  const bookingId = paymentIntent.metadata.bookingId;

  if (bookingId) {
    // Find and update booking payment status to failed
    const booking = await Booking.findById(bookingId);
    if (booking) {
      booking.paymentStatus = 'failed';
      await booking.save();

      console.log(`Booking ${bookingId} payment failed via webhook`);
    }
  }
};

// @desc    Get payment status
// @route   GET /api/payments/:bookingId/status
// @access  Private
const getPaymentStatus = asyncHandler(async (req, res) => {
  // Find booking by ID from URL parameter
  const booking = await Booking.findById(req.params.bookingId);

  // Return 404 if booking not found
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Verify user owns booking or is admin
  if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  // Get current Stripe payment status if payment intent exists
  let stripeStatus = null;
  if (booking.paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(booking.paymentIntentId);
      stripeStatus = paymentIntent.status;
    } catch (error) {
      console.error('Error fetching payment intent:', error);
    }
  }

  // Return payment status information
  res.status(200).json({
    success: true,
    data: {
      bookingId: booking._id,
      paymentStatus: booking.paymentStatus,
      stripeStatus,
      amount: booking.totalPrice
    }
  });
});

// @desc    Process refund
// @route   POST /api/payments/:bookingId/refund
// @access  Private/Admin
const processRefund = asyncHandler(async (req, res) => {
  // Find booking by ID from URL parameter
  const booking = await Booking.findById(req.params.bookingId);

  // Return 404 if booking not found
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Verify booking was paid before allowing refund
  if (booking.paymentStatus !== 'paid') {
    return res.status(400).json({
      success: false,
      message: 'Cannot refund unpaid booking'
    });
  }

  // Process refund through Stripe
  const refund = await stripe.refunds.create({
    payment_intent: booking.paymentIntentId
  });

  // If refund succeeded, update booking status
  if (refund.status === 'succeeded') {
    booking.paymentStatus = 'refunded';
    booking.status = 'cancelled';
    await booking.save();

    // Log refund to audit trail
    await createAuditLog(req, 'PAYMENT_REFUND', 'payment', {
      bookingId: booking._id,
      refundId: refund.id
    }, booking._id);

    // Return success with refund ID
    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: { refundId: refund.id }
    });
  } else {
    // Return failure if refund didn't succeed
    res.status(400).json({
      success: false,
      message: 'Refund failed'
    });
  }
});

// Export all payment controller functions
module.exports = {
  createPaymentIntent,  // Create Stripe payment intent
  confirmPayment,       // Confirm payment completion
  handleWebhook,        // Handle Stripe webhook events
  getPaymentStatus,     // Get payment status for booking
  processRefund         // Admin: process refund
};
