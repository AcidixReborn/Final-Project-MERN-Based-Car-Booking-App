// Express framework for creating router
const express = require('express');
// Create Express router instance for extras routes
const router = express.Router();
// Extra model for database operations on booking add-ons
const Extra = require('../models/Extra');
// Async handler to catch errors and pass to error middleware
const { asyncHandler } = require('../middleware/errorHandler');
// Authentication middleware to protect routes
const { protect } = require('../middleware/auth');
// Admin authorization middleware
const { admin } = require('../middleware/admin');

// ============================================
// PUBLIC ROUTES - No authentication required
// ============================================

// @desc    Get all available extras
// @route   GET /api/extras
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  // Fetch all available extras sorted by category then name
  const extras = await Extra.find({ available: true }).sort('category name');

  // Return list of available extras
  res.status(200).json({
    success: true,
    data: { extras }
  });
}));

// @desc    Get single extra by ID
// @route   GET /api/extras/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  // Find extra by ID from URL parameter
  const extra = await Extra.findById(req.params.id);

  // Return 404 if extra not found
  if (!extra) {
    return res.status(404).json({
      success: false,
      message: 'Extra not found'
    });
  }

  // Return extra details
  res.status(200).json({
    success: true,
    data: { extra }
  });
}));

// ============================================
// ADMIN ROUTES - Authentication + Admin role required
// ============================================

// @desc    Create new extra
// @route   POST /api/extras
// @access  Private/Admin
router.post('/', protect, admin, asyncHandler(async (req, res) => {
  // Create new extra from request body
  const extra = await Extra.create(req.body);

  // Return created extra
  res.status(201).json({
    success: true,
    data: { extra }
  });
}));

// @desc    Update extra
// @route   PUT /api/extras/:id
// @access  Private/Admin
router.put('/:id', protect, admin, asyncHandler(async (req, res) => {
  // Find and update extra with validation
  const extra = await Extra.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  // Return 404 if extra not found
  if (!extra) {
    return res.status(404).json({
      success: false,
      message: 'Extra not found'
    });
  }

  // Return updated extra
  res.status(200).json({
    success: true,
    data: { extra }
  });
}));

// @desc    Delete extra
// @route   DELETE /api/extras/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
  // Find extra by ID
  const extra = await Extra.findById(req.params.id);

  // Return 404 if extra not found
  if (!extra) {
    return res.status(404).json({
      success: false,
      message: 'Extra not found'
    });
  }

  // Delete extra from database
  await extra.deleteOne();

  // Return success response
  res.status(200).json({
    success: true,
    message: 'Extra deleted successfully'
  });
}));

// Export router for use in server.js
module.exports = router;
