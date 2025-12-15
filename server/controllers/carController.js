// Car model for database operations on vehicle records
const Car = require('../models/Car');
// Booking model for checking car availability
const Booking = require('../models/Booking');
// Async handler to catch errors and pass to error middleware
const { asyncHandler } = require('../middleware/errorHandler');
// Audit logging utility for tracking admin actions
const { createAuditLog } = require('../middleware/auditLogger');

// @desc    Get all cars
// @route   GET /api/cars
// @access  Public
const getAllCars = asyncHandler(async (req, res) => {
  // Destructure query parameters with defaults for pagination and filtering
  const {
    page = 1,           // Current page number (default: 1)
    limit = 12,         // Items per page (default: 12)
    sort = '-createdAt',// Sort order (default: newest first)
    type,               // Filter by car type
    transmission,       // Filter by transmission type
    fuelType,           // Filter by fuel type
    minPrice,           // Minimum price filter
    maxPrice,           // Maximum price filter
    seats,              // Minimum seats filter
    available           // Availability filter
  } = req.query;

  // Build MongoDB query object from filters
  const query = {};

  // Add filters to query if provided
  if (type) query.type = type.toLowerCase();
  if (transmission) query.transmission = transmission.toLowerCase();
  if (fuelType) query.fuelType = fuelType.toLowerCase();
  if (seats) query.seats = { $gte: parseInt(seats) };
  if (available !== undefined) query.available = available === 'true';

  // Add price range filter if min or max price provided
  if (minPrice || maxPrice) {
    query.pricePerDay = {};
    if (minPrice) query.pricePerDay.$gte = parseFloat(minPrice);
    if (maxPrice) query.pricePerDay.$lte = parseFloat(maxPrice);
  }

  // Calculate pagination values
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Execute query with sorting and pagination
  const cars = await Car.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  // Get total count for pagination info
  const total = await Car.countDocuments(query);

  // Return paginated car list
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
  // Find car by ID from URL parameter
  const car = await Car.findById(req.params.id);

  // Return 404 if car not found
  if (!car) {
    return res.status(404).json({
      success: false,
      message: 'Car not found'
    });
  }

  // Return car details
  res.status(200).json({
    success: true,
    data: { car }
  });
});

// @desc    Search cars with availability check
// @route   GET /api/cars/search
// @access  Public
const searchCars = asyncHandler(async (req, res) => {
  // Destructure search parameters from query string
  const {
    startDate,      // Booking start date for availability check
    endDate,        // Booking end date for availability check
    type,           // Car type filter
    transmission,   // Transmission filter
    minPrice,       // Minimum price filter
    maxPrice,       // Maximum price filter
    seats,          // Minimum seats filter
    page = 1,       // Page number
    limit = 12      // Items per page
  } = req.query;

  // Build base query - only show available cars
  const query = { available: true };

  // Add optional filters
  if (type) query.type = type.toLowerCase();
  if (transmission) query.transmission = transmission.toLowerCase();
  if (seats) query.seats = { $gte: parseInt(seats) };

  // Add price range filter
  if (minPrice || maxPrice) {
    query.pricePerDay = {};
    if (minPrice) query.pricePerDay.$gte = parseFloat(minPrice);
    if (maxPrice) query.pricePerDay.$lte = parseFloat(maxPrice);
  }

  // Get all cars matching filter criteria
  let cars = await Car.find(query);

  // If dates provided, filter out cars with overlapping bookings
  if (startDate && endDate) {
    // Parse date strings to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Find all cars that have overlapping active bookings
    const overlappingBookings = await Booking.find({
      status: { $in: ['pending', 'confirmed', 'active'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    }).distinct('car');

    // Remove cars with overlapping bookings from results
    cars = cars.filter(car =>
      !overlappingBookings.some(bookedCarId =>
        bookedCarId.toString() === car._id.toString()
      )
    );
  }

  // Apply pagination to filtered results
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const total = cars.length;
  const paginatedCars = cars.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  // Return search results with pagination
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
  // Get date parameters from query string
  const { startDate, endDate } = req.query;
  // Get car ID from URL parameter
  const carId = req.params.id;

  // Validate required date parameters
  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'Please provide start and end dates'
    });
  }

  // Find car by ID
  const car = await Car.findById(carId);
  if (!car) {
    return res.status(404).json({
      success: false,
      message: 'Car not found'
    });
  }

  // Check if car is marked as unavailable
  if (!car.available) {
    return res.status(200).json({
      success: true,
      data: {
        available: false,
        reason: 'Car is not available for booking'
      }
    });
  }

  // Parse date strings to Date objects
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Check for any overlapping bookings in pending/confirmed/active status
  const overlappingBooking = await Booking.findOne({
    car: carId,
    status: { $in: ['pending', 'confirmed', 'active'] },
    $or: [
      { startDate: { $lte: end }, endDate: { $gte: start } }
    ]
  });

  // Return availability status
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
  // Get top-rated available cars for homepage display
  const cars = await Car.find({ available: true })
    .sort({ averageRating: -1, totalReviews: -1 })
    .limit(6);

  // Return featured cars list
  res.status(200).json({
    success: true,
    data: { cars }
  });
});

// @desc    Create a new car
// @route   POST /api/cars
// @access  Private/Admin
const createCar = asyncHandler(async (req, res) => {
  // Create new car document from request body
  const car = await Car.create(req.body);

  // Log car creation to audit trail
  await createAuditLog(req, 'CAR_CREATE', 'car', { brand: car.brand, model: car.model }, car._id);

  // Return created car data
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
  // Find existing car by ID
  let car = await Car.findById(req.params.id);

  // Return 404 if car not found
  if (!car) {
    return res.status(404).json({
      success: false,
      message: 'Car not found'
    });
  }

  // Store previous values for audit log
  const previousValue = car.toObject();

  // Update car with new values and run validators
  car = await Car.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log car update with before/after values to audit trail
  await createAuditLog(req, 'CAR_UPDATE', 'car', {
    updatedFields: Object.keys(req.body),
    previousValue,
    newValue: car.toObject()
  }, car._id);

  // Return updated car data
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
  // Find car by ID
  const car = await Car.findById(req.params.id);

  // Return 404 if car not found
  if (!car) {
    return res.status(404).json({
      success: false,
      message: 'Car not found'
    });
  }

  // Check for any active bookings before allowing deletion
  const activeBookings = await Booking.countDocuments({
    car: car._id,
    status: { $in: ['pending', 'confirmed', 'active'] }
  });

  // Prevent deletion if car has active bookings
  if (activeBookings > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete car with active bookings'
    });
  }

  // Log car deletion to audit trail before removing
  await createAuditLog(req, 'CAR_DELETE', 'car', { brand: car.brand, model: car.model }, car._id);

  // Delete car document from database
  await car.deleteOne();

  // Return success response
  res.status(200).json({
    success: true,
    message: 'Car deleted successfully'
  });
});

// @desc    Get car types
// @route   GET /api/cars/types
// @access  Public
const getCarTypes = asyncHandler(async (req, res) => {
  // Get list of unique car types
  const types = await Car.distinct('type');

  // Get count of available cars for each type
  const typeCounts = await Car.aggregate([
    { $match: { available: true } },
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);

  // Return types and their counts
  res.status(200).json({
    success: true,
    data: { types, typeCounts }
  });
});

// Export all car controller functions
module.exports = {
  getAllCars,         // Get paginated car list
  getCarById,         // Get single car details
  searchCars,         // Search with availability check
  checkAvailability,  // Check specific car availability
  getFeaturedCars,    // Get featured cars for homepage
  createCar,          // Admin: create new car
  updateCar,          // Admin: update car
  deleteCar,          // Admin: delete car
  getCarTypes         // Get available car types
};
