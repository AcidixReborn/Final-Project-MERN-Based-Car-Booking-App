const express = require('express');
const router = express.Router();
const Extra = require('../models/Extra');
const { asyncHandler } = require('../middleware/errorHandler');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

// @desc    Get all available extras
// @route   GET /api/extras
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const extras = await Extra.find({ available: true }).sort('category name');

  res.status(200).json({
    success: true,
    data: { extras }
  });
}));

// @desc    Get single extra
// @route   GET /api/extras/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  const extra = await Extra.findById(req.params.id);

  if (!extra) {
    return res.status(404).json({
      success: false,
      message: 'Extra not found'
    });
  }

  res.status(200).json({
    success: true,
    data: { extra }
  });
}));

// @desc    Create new extra
// @route   POST /api/extras
// @access  Private/Admin
router.post('/', protect, admin, asyncHandler(async (req, res) => {
  const extra = await Extra.create(req.body);

  res.status(201).json({
    success: true,
    data: { extra }
  });
}));

// @desc    Update extra
// @route   PUT /api/extras/:id
// @access  Private/Admin
router.put('/:id', protect, admin, asyncHandler(async (req, res) => {
  const extra = await Extra.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!extra) {
    return res.status(404).json({
      success: false,
      message: 'Extra not found'
    });
  }

  res.status(200).json({
    success: true,
    data: { extra }
  });
}));

// @desc    Delete extra
// @route   DELETE /api/extras/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
  const extra = await Extra.findById(req.params.id);

  if (!extra) {
    return res.status(404).json({
      success: false,
      message: 'Extra not found'
    });
  }

  await extra.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Extra deleted successfully'
  });
}));

module.exports = router;
