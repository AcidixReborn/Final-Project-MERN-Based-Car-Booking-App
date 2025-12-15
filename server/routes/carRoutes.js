const express = require('express');
const router = express.Router();
const {
  getAllCars,
  getCarById,
  searchCars,
  checkAvailability,
  getFeaturedCars,
  createCar,
  updateCar,
  deleteCar,
  getCarTypes
} = require('../controllers/carController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { validate, carRules, carUpdateRules, mongoIdParam, searchQueryRules } = require('../middleware/validator');

// Public routes
router.get('/featured', getFeaturedCars);
router.get('/types', getCarTypes);
router.get('/search', searchQueryRules, validate, searchCars);
router.get('/:id/availability', mongoIdParam, validate, checkAvailability);
router.get('/:id', mongoIdParam, validate, getCarById);
router.get('/', searchQueryRules, validate, getAllCars);

// Admin routes
router.post('/', protect, admin, carRules, validate, createCar);
router.put('/:id', protect, admin, mongoIdParam, carUpdateRules, validate, updateCar);
router.delete('/:id', protect, admin, mongoIdParam, validate, deleteCar);

module.exports = router;
