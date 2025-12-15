const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Auth validation rules
const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),
  body('phone')
    .optional()
    .trim()
    .isMobilePhone().withMessage('Please provide a valid phone number')
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Car validation rules
const carRules = [
  body('brand')
    .trim()
    .notEmpty().withMessage('Brand is required'),
  body('model')
    .trim()
    .notEmpty().withMessage('Model is required'),
  body('year')
    .isInt({ min: 1990, max: new Date().getFullYear() + 1 })
    .withMessage('Year must be valid'),
  body('type')
    .isIn(['economy', 'suv', 'luxury', 'sports', 'van', 'truck'])
    .withMessage('Invalid car type'),
  body('pricePerDay')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('seats')
    .isInt({ min: 1, max: 15 })
    .withMessage('Seats must be between 1 and 15'),
  body('transmission')
    .isIn(['automatic', 'manual'])
    .withMessage('Transmission must be automatic or manual'),
  body('fuelType')
    .isIn(['gasoline', 'diesel', 'electric', 'hybrid'])
    .withMessage('Invalid fuel type')
];

const carUpdateRules = [
  body('brand')
    .optional()
    .trim()
    .notEmpty().withMessage('Brand cannot be empty'),
  body('model')
    .optional()
    .trim()
    .notEmpty().withMessage('Model cannot be empty'),
  body('year')
    .optional()
    .isInt({ min: 1990, max: new Date().getFullYear() + 1 })
    .withMessage('Year must be valid'),
  body('type')
    .optional()
    .isIn(['economy', 'suv', 'luxury', 'sports', 'van', 'truck'])
    .withMessage('Invalid car type'),
  body('pricePerDay')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('seats')
    .optional()
    .isInt({ min: 1, max: 15 })
    .withMessage('Seats must be between 1 and 15'),
  body('transmission')
    .optional()
    .isIn(['automatic', 'manual'])
    .withMessage('Transmission must be automatic or manual'),
  body('fuelType')
    .optional()
    .isIn(['gasoline', 'diesel', 'electric', 'hybrid'])
    .withMessage('Invalid fuel type')
];

// Booking validation rules
const bookingRules = [
  body('carId')
    .notEmpty().withMessage('Car ID is required')
    .isMongoId().withMessage('Invalid car ID'),
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid start date format')
    .custom((value) => {
      if (new Date(value) < new Date().setHours(0, 0, 0, 0)) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),
  body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('Invalid end date format')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('extras')
    .optional()
    .isArray().withMessage('Extras must be an array')
];

// Review validation rules
const reviewRules = [
  body('carId')
    .notEmpty().withMessage('Car ID is required')
    .isMongoId().withMessage('Invalid car ID'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .notEmpty().withMessage('Comment is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Comment must be 10-1000 characters'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters')
];

// ID parameter validation
const mongoIdParam = [
  param('id')
    .isMongoId().withMessage('Invalid ID format')
];

// Search query validation
const searchQueryRules = [
  query('type')
    .optional()
    .isIn(['economy', 'suv', 'luxury', 'sports', 'van', 'truck'])
    .withMessage('Invalid car type'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  query('transmission')
    .optional()
    .isIn(['automatic', 'manual'])
    .withMessage('Invalid transmission type'),
  query('seats')
    .optional()
    .isInt({ min: 1, max: 15 })
    .withMessage('Seats must be between 1 and 15'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  carRules,
  carUpdateRules,
  bookingRules,
  reviewRules,
  mongoIdParam,
  searchQueryRules
};
