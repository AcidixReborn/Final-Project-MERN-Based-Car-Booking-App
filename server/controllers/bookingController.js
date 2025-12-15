// Booking model for database operations on rental reservations
const Booking = require('../models/Booking');
// Car model for fetching vehicle details and pricing
const Car = require('../models/Car');
// Extra model for booking add-ons (insurance, GPS, etc.)
const Extra = require('../models/Extra');
// Async handler to catch errors and pass to error middleware
const { asyncHandler } = require('../middleware/errorHandler');
// Audit logging utility for tracking booking actions
const { createAuditLog } = require('../middleware/auditLogger');

// Helper function to calculate booking price
// Computes total cost including base rate, extras, and taxes
const calculateBookingPrice = async (carId, startDate, endDate, extraIds = []) => {
  // Fetch car to get daily rate
  const car = await Car.findById(carId);
  if (!car) throw new Error('Car not found');

  // Calculate rental duration in days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

  // Validate minimum rental period
  if (totalDays < 1) throw new Error('Booking must be at least 1 day');

  // Calculate base price (daily rate × days)
  const basePrice = car.pricePerDay * totalDays;

  // Calculate extras cost
  let extrasTotal = 0;
  const extras = [];

  // Process each selected extra add-on
  if (extraIds && extraIds.length > 0) {
    // Fetch all selected extras that are available
    const extraDocs = await Extra.find({ _id: { $in: extraIds }, available: true });
    for (const extra of extraDocs) {
      // Calculate cost for this extra (daily rate × days)
      const extraCost = extra.pricePerDay * totalDays;
      extrasTotal += extraCost;
      // Add extra to booking extras array
      extras.push({
        extra: extra._id,
        name: extra.name,
        pricePerDay: extra.pricePerDay,
        quantity: 1
      });
    }
  }

  // Calculate tax (10% of subtotal)
  const taxRate = 0.10;
  const subtotal = basePrice + extrasTotal;
  const taxAmount = subtotal * taxRate;
  const totalPrice = subtotal + taxAmount;

  // Return pricing breakdown
  return {
    pricing: {
      basePrice,
      extrasTotal,
      taxAmount: Math.round(taxAmount * 100) / 100,
      totalDays
    },
    extras,
    totalPrice: Math.round(totalPrice * 100) / 100
  };
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
  // Destructure booking details from request body
  const { carId, startDate, endDate, extras: extraIds, pickupLocation, dropoffLocation, notes } = req.body;

  // Verify car exists
  const car = await Car.findById(carId);
  if (!car) {
    return res.status(404).json({
      success: false,
      message: 'Car not found'
    });
  }

  // Check car is marked as available for booking
  if (!car.available) {
    return res.status(400).json({
      success: false,
      message: 'Car is not available for booking'
    });
  }

  // Parse dates for overlap checking
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Check for conflicting bookings in the requested date range
  const overlappingBooking = await Booking.findOne({
    car: carId,
    status: { $in: ['pending', 'confirmed', 'active'] },
    $or: [
      { startDate: { $lte: end }, endDate: { $gte: start } }
    ]
  });

  // Reject if car already booked for these dates
  if (overlappingBooking) {
    return res.status(400).json({
      success: false,
      message: 'Car is already booked for these dates'
    });
  }

  // Calculate total price including extras and tax
  const priceData = await calculateBookingPrice(carId, startDate, endDate, extraIds);

  // Create new booking document
  const booking = await Booking.create({
    user: req.user._id,
    car: carId,
    startDate: start,
    endDate: end,
    pickupLocation: pickupLocation || 'Main Office',
    dropoffLocation: dropoffLocation || 'Main Office',
    extras: priceData.extras,
    pricing: priceData.pricing,
    totalPrice: priceData.totalPrice,
    notes,
    status: 'pending',
    paymentStatus: 'pending'
  });

  // Populate car details for response
  await booking.populate('car', 'brand model year type images pricePerDay');

  // Log booking creation to audit trail
  await createAuditLog(req, 'BOOKING_CREATE', 'booking', {
    carId,
    startDate,
    endDate,
    totalPrice: priceData.totalPrice
  }, booking._id);

  // Return created booking
  res.status(201).json({
    success: true,
    message: 'Booking created successfully',
    data: { booking }
  });
});

// @desc    Get user's bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
  // Get query parameters for filtering and pagination
  const { status, page = 1, limit = 10 } = req.query;

  // Build query for current user's bookings
  const query = { user: req.user._id };
  if (status) query.status = status;

  // Calculate pagination values
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Fetch bookings with car details, sorted by newest first
  const bookings = await Booking.find(query)
    .populate('car', 'brand model year type images pricePerDay')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  // Get total count for pagination
  const total = await Booking.countDocuments(query);

  // Return paginated bookings list
  res.status(200).json({
    success: true,
    data: {
      bookings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  });
});

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = asyncHandler(async (req, res) => {
  // Fetch booking with car and user details
  const booking = await Booking.findById(req.params.id)
    .populate('car', 'brand model year type images pricePerDay features')
    .populate('user', 'name email phone');

  // Return 404 if booking not found
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Verify user owns this booking or is admin
  if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this booking'
    });
  }

  // Return booking details
  res.status(200).json({
    success: true,
    data: { booking }
  });
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = asyncHandler(async (req, res) => {
  // Get cancellation reason from request body
  const { reason } = req.body;

  // Find booking by ID
  const booking = await Booking.findById(req.params.id);

  // Return 404 if booking not found
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Verify user owns this booking or is admin
  if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this booking'
    });
  }

  // Prevent cancellation of already completed or cancelled bookings
  if (['completed', 'cancelled'].includes(booking.status)) {
    return res.status(400).json({
      success: false,
      message: `Cannot cancel a ${booking.status} booking`
    });
  }

  // Update booking status to cancelled
  booking.status = 'cancelled';
  booking.cancellationReason = reason || 'Cancelled by user';
  booking.cancelledAt = new Date();

  await booking.save();

  // Log cancellation to audit trail
  await createAuditLog(req, 'BOOKING_CANCEL', 'booking', { reason }, booking._id);

  // Return updated booking
  res.status(200).json({
    success: true,
    message: 'Booking cancelled successfully',
    data: { booking }
  });
});

// @desc    Update booking status (Admin)
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
const updateBookingStatus = asyncHandler(async (req, res) => {
  // Get new status from request body
  const { status } = req.body;
  // Valid status transitions
  const validStatuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];

  // Validate status value
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status'
    });
  }

  // Find booking by ID
  const booking = await Booking.findById(req.params.id);

  // Return 404 if booking not found
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Store previous status for audit log
  const previousStatus = booking.status;
  booking.status = status;

  // Set cancellation details if status is cancelled
  if (status === 'cancelled') {
    booking.cancelledAt = new Date();
    booking.cancellationReason = 'Cancelled by admin';
  }

  await booking.save();

  // Log status update to audit trail
  await createAuditLog(req, 'BOOKING_UPDATE', 'booking', {
    previousStatus,
    newStatus: status
  }, booking._id);

  // Return updated booking
  res.status(200).json({
    success: true,
    message: 'Booking status updated',
    data: { booking }
  });
});

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = asyncHandler(async (req, res) => {
  // Get query parameters for filtering and pagination
  const { status, page = 1, limit = 20, startDate, endDate } = req.query;

  // Build query object
  const query = {};
  if (status) query.status = status;

  // Add date range filter if provided
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Calculate pagination values
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Fetch bookings with car and user details
  const bookings = await Booking.find(query)
    .populate('car', 'brand model year type')
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  // Get total count for pagination
  const total = await Booking.countDocuments(query);

  // Return paginated bookings list
  res.status(200).json({
    success: true,
    data: {
      bookings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  });
});

// @desc    Calculate booking price preview
// @route   POST /api/bookings/calculate
// @access  Public
const calculatePrice = asyncHandler(async (req, res) => {
  // Get booking parameters from request body
  const { carId, startDate, endDate, extras } = req.body;

  try {
    // Calculate pricing breakdown
    const priceData = await calculateBookingPrice(carId, startDate, endDate, extras);
    // Get car details for response
    const car = await Car.findById(carId).select('brand model pricePerDay');

    // Return price preview
    res.status(200).json({
      success: true,
      data: {
        car: {
          id: car._id,
          name: `${car.brand} ${car.model}`,
          pricePerDay: car.pricePerDay
        },
        ...priceData
      }
    });
  } catch (error) {
    // Return error message if calculation fails
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Export all booking controller functions
module.exports = {
  createBooking,        // Create new booking
  getMyBookings,        // Get current user's bookings
  getBookingById,       // Get single booking details
  cancelBooking,        // Cancel a booking
  updateBookingStatus,  // Admin: update booking status
  getAllBookings,       // Admin: get all bookings
  calculatePrice        // Calculate booking price preview
};
