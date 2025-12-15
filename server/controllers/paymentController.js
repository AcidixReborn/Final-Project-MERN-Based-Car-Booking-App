const Booking = require('../models/Booking');
const { asyncHandler } = require('../middleware/errorHandler');
const { createAuditLog } = require('../middleware/auditLogger');

// Initialize Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Create payment intent
// @route   POST /api/payments/create-intent
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;

  // Find booking
  const booking = await Booking.findById(bookingId).populate('car', 'brand model');

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Check if user owns booking
  if (booking.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to pay for this booking'
    });
  }

  // Check if already paid
  if (booking.paymentStatus === 'paid') {
    return res.status(400).json({
      success: false,
      message: 'Booking is already paid'
    });
  }

  // Create payment intent with Stripe
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(booking.totalPrice * 100), // Stripe expects cents
    currency: 'usd',
    metadata: {
      bookingId: booking._id.toString(),
      userId: req.user._id.toString(),
      carName: `${booking.car.brand} ${booking.car.model}`
    },
    description: `Car Booking: ${booking.car.brand} ${booking.car.model}`
  });

  // Update booking with payment intent ID
  booking.paymentIntentId = paymentIntent.id;
  await booking.save();

  await createAuditLog(req, 'PAYMENT_INITIATED', 'payment', {
    bookingId: booking._id,
    amount: booking.totalPrice,
    paymentIntentId: paymentIntent.id
  }, booking._id);

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
  const { bookingId, paymentIntentId } = req.body;

  // Find booking
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Verify payment with Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status === 'succeeded') {
    // Update booking
    booking.paymentStatus = 'paid';
    booking.paymentId = paymentIntent.id;
    booking.status = 'confirmed';
    await booking.save();

    await createAuditLog(req, 'PAYMENT_SUCCESS', 'payment', {
      bookingId: booking._id,
      amount: booking.totalPrice,
      paymentIntentId
    }, booking._id);

    res.status(200).json({
      success: true,
      message: 'Payment successful',
      data: { booking }
    });
  } else {
    await createAuditLog(req, 'PAYMENT_FAILED', 'payment', {
      bookingId: booking._id,
      paymentIntentId,
      status: paymentIntent.status
    }, booking._id);

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
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handleSuccessfulPayment(paymentIntent);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await handleFailedPayment(failedPayment);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
});

// Helper function for successful payment
const handleSuccessfulPayment = async (paymentIntent) => {
  const bookingId = paymentIntent.metadata.bookingId;

  if (bookingId) {
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

// Helper function for failed payment
const handleFailedPayment = async (paymentIntent) => {
  const bookingId = paymentIntent.metadata.bookingId;

  if (bookingId) {
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
  const booking = await Booking.findById(req.params.bookingId);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Check authorization
  if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  let stripeStatus = null;
  if (booking.paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(booking.paymentIntentId);
      stripeStatus = paymentIntent.status;
    } catch (error) {
      console.error('Error fetching payment intent:', error);
    }
  }

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
  const booking = await Booking.findById(req.params.bookingId);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  if (booking.paymentStatus !== 'paid') {
    return res.status(400).json({
      success: false,
      message: 'Cannot refund unpaid booking'
    });
  }

  // Process refund with Stripe
  const refund = await stripe.refunds.create({
    payment_intent: booking.paymentIntentId
  });

  if (refund.status === 'succeeded') {
    booking.paymentStatus = 'refunded';
    booking.status = 'cancelled';
    await booking.save();

    await createAuditLog(req, 'PAYMENT_REFUND', 'payment', {
      bookingId: booking._id,
      refundId: refund.id
    }, booking._id);

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: { refundId: refund.id }
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Refund failed'
    });
  }
});

module.exports = {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  getPaymentStatus,
  processRefund
};
