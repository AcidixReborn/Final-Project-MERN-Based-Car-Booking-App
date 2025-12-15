const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllBookings,
  getAuditLogs,
  getReports
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { validate, mongoIdParam } = require('../middleware/validator');

// All admin routes require authentication and admin role
router.use(protect);
router.use(admin);

// Dashboard
router.get('/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id', mongoIdParam, validate, updateUser);
router.delete('/users/:id', mongoIdParam, validate, deleteUser);

// Bookings management
router.get('/bookings', getAllBookings);

// Audit logs
router.get('/audit-logs', getAuditLogs);

// Reports
router.get('/reports', getReports);

module.exports = router;
