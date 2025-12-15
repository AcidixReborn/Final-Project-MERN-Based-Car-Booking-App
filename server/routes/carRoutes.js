// Express framework for creating router
const express = require('express');
// Create Express router instance for car routes
const router = express.Router();
// Import car controller functions
const {
  getAllCars,       // Handler for getting all cars with filters
  getCarById,       // Handler for getting a single car by ID
  searchCars,       // Handler for searching cars with availability check
  checkAvailability,// Handler for checking car availability for dates
  getFeaturedCars,  // Handler for getting featured cars (homepage)
  createCar,        // Admin handler for creating a new car
  updateCar,        // Admin handler for updating a car
  deleteCar,        // Admin handler for deleting a car
  getCarTypes       // Handler for getting available car types
} = require('../controllers/carController');
// Authentication middleware to protect routes
const { protect } = require('../middleware/auth');
// Admin authorization middleware
const { admin } = require('../middleware/admin');
// Validation middleware and rule sets
const { validate, carRules, carUpdateRules, mongoIdParam, searchQueryRules } = require('../middleware/validator');

// ============================================
// PUBLIC ROUTES - No authentication required
// ============================================

// GET /api/cars/featured - Get featured cars for homepage display
router.get('/featured', getFeaturedCars);

// GET /api/cars/types - Get list of available car types with counts
router.get('/types', getCarTypes);

// GET /api/cars/search - Search cars with filters and availability check
// Supports: startDate, endDate, type, transmission, minPrice, maxPrice, seats
router.get('/search', searchQueryRules, validate, searchCars);

// GET /api/cars/:id/availability - Check if a specific car is available for dates
// Query params: startDate, endDate
router.get('/:id/availability', mongoIdParam, validate, checkAvailability);

// GET /api/cars/:id - Get single car details by ID
router.get('/:id', mongoIdParam, validate, getCarById);

// GET /api/cars - Get all cars with pagination and optional filters
router.get('/', searchQueryRules, validate, getAllCars);

// ============================================
// ADMIN ROUTES - Authentication + Admin role required
// ============================================

// POST /api/cars - Create a new car listing
router.post('/', protect, admin, carRules, validate, createCar);

// PUT /api/cars/:id - Update an existing car
router.put('/:id', protect, admin, mongoIdParam, carUpdateRules, validate, updateCar);

// DELETE /api/cars/:id - Delete a car (only if no active bookings)
router.delete('/:id', protect, admin, mongoIdParam, validate, deleteCar);

// Export router for use in server.js
module.exports = router;
