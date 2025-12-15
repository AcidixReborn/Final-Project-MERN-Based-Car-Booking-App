// Express framework for creating router
const express = require('express');
// Create Express router instance for authentication routes
const router = express.Router();
// Import authentication controller functions
const {
  register,       // Handler for user registration
  login,          // Handler for user login
  getProfile,     // Handler for getting current user profile
  updateProfile,  // Handler for updating user profile
  changePassword, // Handler for changing password
  logout          // Handler for logging out
} = require('../controllers/authController');
// Authentication middleware to protect routes
const { protect } = require('../middleware/auth');
// Validation middleware and rule sets for input validation
const { validate, registerRules, loginRules } = require('../middleware/validator');

// ============================================
// PUBLIC ROUTES - No authentication required
// ============================================

// POST /api/auth/register - Register a new user account
// Validates registration data before processing
router.post('/register', registerRules, validate, register);

// POST /api/auth/login - Login with email and password
// Returns JWT token on successful authentication
router.post('/login', loginRules, validate, login);

// ============================================
// PROTECTED ROUTES - Authentication required
// ============================================

// GET /api/auth/profile - Get current authenticated user's profile
router.get('/profile', protect, getProfile);

// PUT /api/auth/profile - Update current user's profile information
router.put('/profile', protect, updateProfile);

// PUT /api/auth/password - Change current user's password
router.put('/password', protect, changePassword);

// POST /api/auth/logout - Logout current user (logs to audit trail)
router.post('/logout', protect, logout);

// Export router for use in server.js
module.exports = router;
