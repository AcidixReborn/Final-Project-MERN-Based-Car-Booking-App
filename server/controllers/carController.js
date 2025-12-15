const Car = require('../models/Car');
const Booking = require('../models/Booking');
const { asyncHandler } = require('../middleware/errorHandler');
const { createAuditLog } = require('../middleware/auditLogger');

// @desc    Get all cars
// @route   GET /api/cars
// @access  Public
const getAllCars = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    sort = '-createdAt',
    type,
    transmission,
    fuelType,
    minPrice,
    maxPrice,
    seats,
    available
  } = req.query;

  // Build query
  const query = {};

  if (type) query.type = type.toLowerCase();
  if (transmission) query.transmission = transmission.toLowerCase();
  if (fuelType) query.fuelType = fuelType.toLowerCase();
  if (seats) query.seats = { $gte: parseInt(seats) };
  if (available !== undefined) query.available = available === 'true';

  // Price range
  if (minPrice || maxPrice) {
    query.pricePerDay = {};
    if (minPrice) query.pricePerDay.$gte = parseFloat(minPrice);
    if (maxPrice) query.pricePerDay.$lte = parseFloat(maxPrice);
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Execute query
  const cars = await Car.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  const total = await Car.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      cars,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  });
});

// @desc    Get single car by ID
// @route   GET /api/cars/:id
// @access  Public
const getCarById = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);

  if (!car) {
    return res.status(404).json({
      success: false,
      message: 'Car not found'
    });
  }

  res.status(200).json({
    success: true,
    data: { car }
  });
});

// @desc    Search cars with availability check
// @route   GET /api/cars/search
// @access  Public
const searchCars = asyncHandler(async (req, res) => {
  const {
    startDate,
    endDate,
    type,
    transmission,
    minPrice,
    maxPrice,
    seats,
    page = 1,
    limit = 12
  } = req.query;

  // Build base query
  const query = { available: true };

  if (type) query.type = type.toLowerCase();
  if (transmission) query.transmission = transmission.toLowerCase();
  if (seats) query.seats = { $gte: parseInt(seats) };

  if (minPrice || maxPrice) {
    query.pricePerDay = {};
    if (minPrice) query.pricePerDay.$gte = parseFloat(minPrice);
    if (maxPrice) query.pricePerDay.$lte = parseFloat(maxPrice);
  }

  // Get all cars matching criteria
  let cars = await Car.find(query);

  // If dates provided, filter out cars with overlapping bookings
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Find cars that have overlapping bookings
    const overlappingBookings = await Booking.find({
      status: { $in: ['pending', 'confirmed', 'active'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    }).distinct('car');

    // Filter out cars with overlapping bookings
    cars = cars.filter(car =>
      !overlappingBookings.some(bookedCarId =>
        bookedCarId.toString() === car._id.toString()
      )
    );
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const total = cars.length;
  const paginatedCars = cars.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.status(200).json({
    success: true,
    data: {
      cars: paginatedCars,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  });
});

// @desc    Check car availability for dates
// @route   GET /api/cars/:id/availability
// @access  Public
const checkAvailability = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const carId = req.params.id;

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'Please provide start and end dates'
    });
  }

  const car = await Car.findById(carId);
  if (!car) {
    return res.status(404).json({
      success: false,
      message: 'Car not found'
    });
  }

  if (!car.available) {
    return res.status(200).json({
      success: true,
      data: {
        available: false,
        reason: 'Car is not available for booking'
      }
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Check for overlapping bookings
  const overlappingBooking = await Booking.findOne({
    car: carId,
    status: { $in: ['pending', 'confirmed', 'active'] },
    $or: [
      { startDate: { $lte: end }, endDate: { $gte: start } }
    ]
  });

  res.status(200).json({
    success: true,
    data: {
      available: !overlappingBooking,
      reason: overlappingBooking ? 'Car is already booked for these dates' : null
    }
  });
});

// @desc    Get featured cars
// @route   GET /api/cars/featured
// @access  Public
const getFeaturedCars = asyncHandler(async (req, res) => {
  const cars = await Car.find({ available: true })
    .sort({ averageRating: -1, totalReviews: -1 })
    .limit(6);

  res.status(200).json({
    success: true,
    data: { cars }
  });
});

// @desc    Create a new car
// @route   POST /api/cars
// @access  Private/Admin
const createCar = asyncHandler(async (req, res) => {
  const car = await Car.create(req.body);

  await createAuditLog(req, 'CAR_CREATE', 'car', { brand: car.brand, model: car.model }, car._id);

  res.status(201).json({
    success: true,
    message: 'Car created successfully',
    data: { car }
  });
});

// @desc    Update a car
// @route   PUT /api/cars/:id
// @access  Private/Admin
const updateCar = asyncHandler(async (req, res) => {
  let car = await Car.findById(req.params.id);

  if (!car) {
    return res.status(404).json({
      success: false,
      message: 'Car not found'
    });
  }

  const previousValue = car.toObject();
  car = await Car.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  await createAuditLog(req, 'CAR_UPDATE', 'car', {
    updatedFields: Object.keys(req.body),
    previousValue,
    newValue: car.toObject()
  }, car._id);

  res.status(200).json({
    success: true,
    message: 'Car updated successfully',
    data: { car }
  });
});

// @desc    Delete a car
// @route   DELETE /api/cars/:id
// @access  Private/Admin
const deleteCar = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);

  if (!car) {
    return res.status(404).json({
      success: false,
      message: 'Car not found'
    });
  }

  // Check if car has active bookings
  const activeBookings = await Booking.countDocuments({
    car: car._id,
    status: { $in: ['pending', 'confirmed', 'active'] }
  });

  if (activeBookings > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete car with active bookings'
    });
  }

  await createAuditLog(req, 'CAR_DELETE', 'car', { brand: car.brand, model: car.model }, car._id);

  await car.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Car deleted successfully'
  });
});

// @desc    Get car types
// @route   GET /api/cars/types
// @access  Public
const getCarTypes = asyncHandler(async (req, res) => {
  const types = await Car.distinct('type');
  const typeCounts = await Car.aggregate([
    { $match: { available: true } },
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);

  res.status(200).json({
    success: true,
    data: { types, typeCounts }
  });
});

module.exports = {
  getAllCars,
  getCarById,
  searchCars,
  checkAvailability,
  getFeaturedCars,
  createCar,
  updateCar,
  deleteCar,
  getCarTypes
};
