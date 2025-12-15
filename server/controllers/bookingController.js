const Booking = require('../models/Booking');
const Car = require('../models/Car');
const Extra = require('../models/Extra');
const { asyncHandler } = require('../middleware/errorHandler');
const { createAuditLog } = require('../middleware/auditLogger');

// Helper function to calculate booking price
const calculateBookingPrice = async (carId, startDate, endDate, extraIds = []) => {
  const car = await Car.findById(carId);
  if (!car) throw new Error('Car not found');

  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

  if (totalDays < 1) throw new Error('Booking must be at least 1 day');

  const basePrice = car.pricePerDay * totalDays;

  // Calculate extras
  let extrasTotal = 0;
  const extras = [];

  if (extraIds && extraIds.length > 0) {
    const extraDocs = await Extra.find({ _id: { $in: extraIds }, available: true });
    for (const extra of extraDocs) {
      const extraCost = extra.pricePerDay * totalDays;
      extrasTotal += extraCost;
      extras.push({
        extra: extra._id,
        name: extra.name,
        pricePerDay: extra.pricePerDay,
        quantity: 1
      });
    }
  }

  // Calculate tax (10%)
  const taxRate = 0.10;
  const subtotal = basePrice + extrasTotal;
  const taxAmount = subtotal * taxRate;
  const totalPrice = subtotal + taxAmount;

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
  const { carId, startDate, endDate, extras: extraIds, pickupLocation, dropoffLocation, notes } = req.body;

  // Check car exists and is available
  const car = await Car.findById(carId);
  if (!car) {
    return res.status(404).json({
      success: false,
      message: 'Car not found'
    });
  }

  if (!car.available) {
    return res.status(400).json({
      success: false,
      message: 'Car is not available for booking'
    });
  }

  // Check for overlapping bookings
  const start = new Date(startDate);
  const end = new Date(endDate);

  const overlappingBooking = await Booking.findOne({
    car: carId,
    status: { $in: ['pending', 'confirmed', 'active'] },
    $or: [
      { startDate: { $lte: end }, endDate: { $gte: start } }
    ]
  });

  if (overlappingBooking) {
    return res.status(400).json({
      success: false,
      message: 'Car is already booked for these dates'
    });
  }

  // Calculate pricing
  const priceData = await calculateBookingPrice(carId, startDate, endDate, extraIds);

  // Create booking
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

  // Populate car details
  await booking.populate('car', 'brand model year type images pricePerDay');

  await createAuditLog(req, 'BOOKING_CREATE', 'booking', {
    carId,
    startDate,
    endDate,
    totalPrice: priceData.totalPrice
  }, booking._id);

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
  const { status, page = 1, limit = 10 } = req.query;

  const query = { user: req.user._id };
  if (status) query.status = status;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const bookings = await Booking.find(query)
    .populate('car', 'brand model year type images pricePerDay')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Booking.countDocuments(query);

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
  const booking = await Booking.findById(req.params.id)
    .populate('car', 'brand model year type images pricePerDay features')
    .populate('user', 'name email phone');

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Check if user owns booking or is admin
  if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this booking'
    });
  }

  res.status(200).json({
    success: true,
    data: { booking }
  });
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Check if user owns booking or is admin
  if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this booking'
    });
  }

  // Check if booking can be cancelled
  if (['completed', 'cancelled'].includes(booking.status)) {
    return res.status(400).json({
      success: false,
      message: `Cannot cancel a ${booking.status} booking`
    });
  }

  // Update booking
  booking.status = 'cancelled';
  booking.cancellationReason = reason || 'Cancelled by user';
  booking.cancelledAt = new Date();

  await booking.save();

  await createAuditLog(req, 'BOOKING_CANCEL', 'booking', { reason }, booking._id);

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
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status'
    });
  }

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  const previousStatus = booking.status;
  booking.status = status;

  if (status === 'cancelled') {
    booking.cancelledAt = new Date();
    booking.cancellationReason = 'Cancelled by admin';
  }

  await booking.save();

  await createAuditLog(req, 'BOOKING_UPDATE', 'booking', {
    previousStatus,
    newStatus: status
  }, booking._id);

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
  const { status, page = 1, limit = 20, startDate, endDate } = req.query;

  const query = {};
  if (status) query.status = status;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const bookings = await Booking.find(query)
    .populate('car', 'brand model year type')
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Booking.countDocuments(query);

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
  const { carId, startDate, endDate, extras } = req.body;

  try {
    const priceData = await calculateBookingPrice(carId, startDate, endDate, extras);
    const car = await Car.findById(carId).select('brand model pricePerDay');

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
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
  getAllBookings,
  calculatePrice
};
