// Express framework for creating router
const express = require('express');
// Create Express router instance for admin routes
const router = express.Router();
// Import admin controller functions
const {
  getDashboardStats, // Handler for getting dashboard statistics
  getAllUsers,       // Handler for getting all users
  updateUser,        // Handler for updating user role/status
  deleteUser,        // Handler for deleting a user
  getAllBookings,    // Handler for getting all bookings
  getAuditLogs,      // Handler for viewing audit logs
  getReports         // Handler for generating reports
} = require('../controllers/adminController');
// Authentication middleware to protect routes
const { protect } = require('../middleware/auth');
// Admin authorization middleware
const { admin } = require('../middleware/admin');
// Validation middleware
const { validate, mongoIdParam } = require('../middleware/validator');

// ============================================
// MIDDLEWARE - Applied to all routes below
// ============================================

// All admin routes require authentication
router.use(protect);
// All admin routes require admin role
router.use(admin);

// ============================================
// DASHBOARD ROUTES
// ============================================

// GET /api/admin/stats - Get dashboard statistics
// Returns: totalUsers, totalCars, totalBookings, revenue, monthly stats, recent activity
router.get('/stats', getDashboardStats);

// ============================================
// USER MANAGEMENT ROUTES
// ============================================

// GET /api/admin/users - Get all users with filters and pagination
// Query params: page, limit, search, role, isActive
router.get('/users', getAllUsers);

// PUT /api/admin/users/:id - Update a user's role or active status
// Body: { role, isActive }
router.put('/users/:id', mongoIdParam, validate, updateUser);

// DELETE /api/admin/users/:id - Delete a user account
// Cannot delete user with active bookings or self
router.delete('/users/:id', mongoIdParam, validate, deleteUser);

// ============================================
// BOOKING MANAGEMENT ROUTES
// ============================================

// GET /api/admin/bookings - Get all bookings with filters and pagination
// Query params: page, limit, status, paymentStatus
router.get('/bookings', getAllBookings);

// ============================================
// AUDIT LOG ROUTES
// ============================================

// GET /api/admin/audit-logs - Get audit log entries with filters
// Query params: page, limit, action, resource, userId, startDate, endDate
router.get('/audit-logs', getAuditLogs);

// ============================================
// REPORTING ROUTES
// ============================================

// GET /api/admin/reports - Generate various reports
// Query params: startDate, endDate, type (revenue, bookings, cars)
router.get('/reports', getReports);

// Export router for use in server.js
module.exports = router;
