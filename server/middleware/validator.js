// Express-validator functions for request validation
// body: validates request body fields
// param: validates URL parameters
// query: validates query string parameters
// validationResult: collects validation errors
const { body, param, query, validationResult } = require('express-validator');

// Middleware to check validation results and return errors
// Should be used after validation rules in route definitions
const validate = (req, res, next) => {
  // Collect all validation errors from the request
  const errors = validationResult(req);
  // If there are validation errors, return 400 with error details
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      // Map errors to simplified format with field name and message
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  // No errors, continue to next middleware/controller
  next();
};

// Validation rules for user registration endpoint
const registerRules = [
  // Name: required, trimmed, 2-50 characters
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  // Email: required, valid format, normalized to lowercase
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  // Password: required, min 6 chars, must contain a number
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),
  // Phone: optional, must be valid mobile format if provided
  body('phone')
    .optional()
    .trim()
    .isMobilePhone().withMessage('Please provide a valid phone number')
];

// Validation rules for user login endpoint
const loginRules = [
  // Email: required and valid format
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  // Password: required (no format validation on login)
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Validation rules for creating a new car (admin)
const carRules = [
  // Brand: required, trimmed string
  body('brand')
    .trim()
    .notEmpty().withMessage('Brand is required'),
  // Model: required, trimmed string
  body('model')
    .trim()
    .notEmpty().withMessage('Model is required'),
  // Year: integer between 1990 and next year
  body('year')
    .isInt({ min: 1990, max: new Date().getFullYear() + 1 })
    .withMessage('Year must be valid'),
  // Type: must be one of predefined car types
  body('type')
    .isIn(['economy', 'suv', 'luxury', 'sports', 'van', 'truck'])
    .withMessage('Invalid car type'),
  // Price per day: positive number
  body('pricePerDay')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  // Seats: integer between 1 and 15
  body('seats')
    .isInt({ min: 1, max: 15 })
    .withMessage('Seats must be between 1 and 15'),
  // Transmission: automatic or manual
  body('transmission')
    .isIn(['automatic', 'manual'])
    .withMessage('Transmission must be automatic or manual'),
  // Fuel type: one of predefined fuel options
  body('fuelType')
    .isIn(['gasoline', 'diesel', 'electric', 'hybrid'])
    .withMessage('Invalid fuel type')
];

// Validation rules for updating a car (admin)
// All fields optional but validated if present
const carUpdateRules = [
  // Brand: optional but not empty if provided
  body('brand')
    .optional()
    .trim()
    .notEmpty().withMessage('Brand cannot be empty'),
  // Model: optional but not empty if provided
  body('model')
    .optional()
    .trim()
    .notEmpty().withMessage('Model cannot be empty'),
  // Year: optional, validated if provided
  body('year')
    .optional()
    .isInt({ min: 1990, max: new Date().getFullYear() + 1 })
    .withMessage('Year must be valid'),
  // Type: optional, must be valid if provided
  body('type')
    .optional()
    .isIn(['economy', 'suv', 'luxury', 'sports', 'van', 'truck'])
    .withMessage('Invalid car type'),
  // Price per day: optional, positive if provided
  body('pricePerDay')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  // Seats: optional, valid range if provided
  body('seats')
    .optional()
    .isInt({ min: 1, max: 15 })
    .withMessage('Seats must be between 1 and 15'),
  // Transmission: optional, valid option if provided
  body('transmission')
    .optional()
    .isIn(['automatic', 'manual'])
    .withMessage('Transmission must be automatic or manual'),
  // Fuel type: optional, valid option if provided
  body('fuelType')
    .optional()
    .isIn(['gasoline', 'diesel', 'electric', 'hybrid'])
    .withMessage('Invalid fuel type')
];

// Validation rules for creating a booking
const bookingRules = [
  // Car ID: required, must be valid MongoDB ObjectId
  body('carId')
    .notEmpty().withMessage('Car ID is required')
    .isMongoId().withMessage('Invalid car ID'),
  // Start date: required, ISO format, cannot be in the past
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid start date format')
    .custom((value) => {
      // Custom validator to check date is not in the past
      if (new Date(value) < new Date().setHours(0, 0, 0, 0)) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),
  // End date: required, ISO format, must be after start date
  body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('Invalid end date format')
    .custom((value, { req }) => {
      // Custom validator to ensure end date is after start date
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  // Extras: optional array of extra service IDs
  body('extras')
    .optional()
    .isArray().withMessage('Extras must be an array')
];

// Validation rules for creating a review
const reviewRules = [
  // Car ID: required, valid MongoDB ObjectId
  body('carId')
    .notEmpty().withMessage('Car ID is required')
    .isMongoId().withMessage('Invalid car ID'),
  // Rating: integer between 1 and 5 stars
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  // Comment: required, 10-1000 characters
  body('comment')
    .trim()
    .notEmpty().withMessage('Comment is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Comment must be 10-1000 characters'),
  // Title: optional, max 100 characters if provided
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters')
];

// Validation rule for MongoDB ObjectId URL parameters
// Used for routes like /api/cars/:id
const mongoIdParam = [
  param('id')
    .isMongoId().withMessage('Invalid ID format')
];

// Validation rules for car search query parameters
const searchQueryRules = [
  // Type: optional filter by car type
  query('type')
    .optional()
    .isIn(['economy', 'suv', 'luxury', 'sports', 'van', 'truck'])
    .withMessage('Invalid car type'),
  // Minimum price filter: positive number
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  // Maximum price filter: positive number
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  // Transmission filter: automatic or manual
  query('transmission')
    .optional()
    .isIn(['automatic', 'manual'])
    .withMessage('Invalid transmission type'),
  // Seats filter: 1-15 range
  query('seats')
    .optional()
    .isInt({ min: 1, max: 15 })
    .withMessage('Seats must be between 1 and 15'),
  // Pagination: page number (1+)
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  // Pagination: items per page (1-100)
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Export all validation middleware and rule sets
module.exports = {
  validate,          // Middleware to check validation results
  registerRules,     // Rules for user registration
  loginRules,        // Rules for user login
  carRules,          // Rules for car creation
  carUpdateRules,    // Rules for car updates
  bookingRules,      // Rules for booking creation
  reviewRules,       // Rules for review creation
  mongoIdParam,      // Rules for MongoDB ID parameters
  searchQueryRules   // Rules for search query parameters
};
