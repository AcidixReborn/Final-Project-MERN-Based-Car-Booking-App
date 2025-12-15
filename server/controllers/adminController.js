// User model for admin user management operations
const User = require('../models/User');
// Car model for dashboard statistics
const Car = require('../models/Car');
// Booking model for revenue and booking analytics
const Booking = require('../models/Booking');
// Review model for platform statistics (not directly used but available)
const Review = require('../models/Review');
// AuditLog model for viewing system audit trails
const AuditLog = require('../models/AuditLog');
// Async handler to catch errors and pass to error middleware
const { asyncHandler } = require('../middleware/errorHandler');
// Audit logging utility for tracking admin actions
const { createAuditLog } = require('../middleware/auditLogger');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  // Get total counts for dashboard cards
  const totalUsers = await User.countDocuments({ role: 'user' });
  const totalCars = await Car.countDocuments();
  const availableCars = await Car.countDocuments({ available: true });
  const totalBookings = await Booking.countDocuments();

  // Aggregate booking counts by status for pie chart
  const bookingsByStatus = await Booking.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Calculate total revenue and average booking value from paid bookings
  const revenueStats = await Booking.aggregate([
    { $match: { paymentStatus: 'paid' } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' },
        avgBookingValue: { $avg: '$totalPrice' }
      }
    }
  ]);

  // Get monthly revenue breakdown for current year (for charts)
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = await Booking.aggregate([
    {
      $match: {
        paymentStatus: 'paid',
        createdAt: {
          $gte: new Date(`${currentYear}-01-01`),
          $lte: new Date(`${currentYear}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        revenue: { $sum: '$totalPrice' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Get 5 most recent bookings for dashboard activity feed
  const recentBookings = await Booking.find()
    .populate('user', 'name email')
    .populate('car', 'brand model')
    .sort('-createdAt')
    .limit(5);

  // Get top 5 most booked cars
  const popularCars = await Booking.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    { $group: { _id: '$car', bookingCount: { $sum: 1 } } },
    { $sort: { bookingCount: -1 } },
    { $limit: 5 },
    {
      // Join with cars collection to get car details
      $lookup: {
        from: 'cars',
        localField: '_id',
        foreignField: '_id',
        as: 'carDetails'
      }
    },
    { $unwind: '$carDetails' },
    {
      // Project only needed fields
      $project: {
        _id: 1,
        bookingCount: 1,
        brand: '$carDetails.brand',
        model: '$carDetails.model',
        type: '$carDetails.type'
      }
    }
  ]);

  // Log admin dashboard access to audit trail
  await createAuditLog(req, 'ADMIN_ACCESS', 'admin', { action: 'view_dashboard' });

  // Return comprehensive dashboard data
  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalCars,
        availableCars,
        totalBookings,
        totalRevenue: revenueStats[0]?.totalRevenue || 0,
        avgBookingValue: Math.round(revenueStats[0]?.avgBookingValue || 0)
      },
      bookingsByStatus,
      monthlyRevenue,
      recentBookings,
      popularCars
    }
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  // Destructure query parameters for filtering and pagination
  const { page = 1, limit = 20, search, role, isActive } = req.query;

  // Build query object from filters
  const query = {};
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  // Search by name or email (case-insensitive)
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination values
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Fetch users excluding password field
  const users = await User.find(query)
    .select('-password')
    .sort('-createdAt')
    .skip(skip)
    .limit(limitNum);

  // Get total count for pagination
  const total = await User.countDocuments(query);

  // Return paginated user list
  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  });
});

// @desc    Update user (by admin)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  // Destructure updatable fields (only role and active status)
  const { role, isActive } = req.body;

  // Find user by ID
  const user = await User.findById(req.params.id);

  // Return 404 if user not found
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Store previous state for audit log
  const previousState = { role: user.role, isActive: user.isActive };

  // Update provided fields
  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save();

  // Determine appropriate audit action based on what changed
  const action = isActive === false ? 'USER_DEACTIVATE' : isActive === true ? 'USER_ACTIVATE' : 'USER_UPDATE';
  // Log change to audit trail with before/after states
  await createAuditLog(req, action, 'user', { previousState, newState: { role: user.role, isActive: user.isActive } }, user._id);

  // Return updated user
  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: { user }
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  // Find user by ID
  const user = await User.findById(req.params.id);

  // Return 404 if user not found
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent admin from deleting their own account
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete your own account'
    });
  }

  // Check if user has active bookings that would be orphaned
  const activeBookings = await Booking.countDocuments({
    user: user._id,
    status: { $in: ['pending', 'confirmed', 'active'] }
  });

  // Prevent deletion if user has active bookings
  if (activeBookings > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete user with active bookings'
    });
  }

  // Log deletion to audit trail before removing
  await createAuditLog(req, 'USER_DELETE', 'user', { email: user.email }, user._id);

  // Delete user from database
  await user.deleteOne();

  // Return success response
  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Private/Admin
const getAuditLogs = asyncHandler(async (req, res) => {
  // Destructure query parameters for filtering and pagination
  const { page = 1, limit = 50, action, resource, userId, startDate, endDate } = req.query;

  // Build query object from filters
  const query = {};
  if (action) query.action = action;
  if (resource) query.resource = resource;
  if (userId) query.userId = userId;

  // Add date range filter if provided
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Calculate pagination values
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Fetch logs with user details populated
  const logs = await AuditLog.find(query)
    .populate('userId', 'name email')
    .sort('-createdAt')
    .skip(skip)
    .limit(limitNum);

  // Get total count for pagination
  const total = await AuditLog.countDocuments(query);

  // Return paginated audit logs
  res.status(200).json({
    success: true,
    data: {
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  });
});

// @desc    Get reports
// @route   GET /api/admin/reports
// @access  Private/Admin
const getReports = asyncHandler(async (req, res) => {
  // Get report parameters from query string
  const { startDate, endDate, type = 'revenue' } = req.query;

  // Build date filter for aggregation
  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  // Variable to hold report data
  let report = {};

  // Generate report based on requested type
  switch (type) {
    case 'revenue':
      // Daily revenue report - sum revenue by date
      report = await Booking.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            ...(Object.keys(dateFilter).length && { createdAt: dateFilter })
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$totalPrice' },
            bookings: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      break;

    case 'bookings':
      // Booking status report - count and value by status
      report = await Booking.aggregate([
        {
          $match: {
            ...(Object.keys(dateFilter).length && { createdAt: dateFilter })
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalValue: { $sum: '$totalPrice' }
          }
        }
      ]);
      break;

    case 'cars':
      // Car performance report - bookings and revenue by car
      report = await Booking.aggregate([
        {
          $match: {
            status: { $ne: 'cancelled' },
            ...(Object.keys(dateFilter).length && { createdAt: dateFilter })
          }
        },
        {
          $group: {
            _id: '$car',
            bookings: { $sum: 1 },
            revenue: { $sum: '$totalPrice' }
          }
        },
        { $sort: { bookings: -1 } },
        {
          // Join with cars collection
          $lookup: {
            from: 'cars',
            localField: '_id',
            foreignField: '_id',
            as: 'car'
          }
        },
        { $unwind: '$car' },
        {
          // Project formatted output
          $project: {
            _id: 1,
            bookings: 1,
            revenue: 1,
            carName: { $concat: ['$car.brand', ' ', '$car.model'] },
            type: '$car.type'
          }
        }
      ]);
      break;

    default:
      // Invalid report type
      return res.status(400).json({
        success: false,
        message: 'Invalid report type'
      });
  }

  // Log report generation to audit trail
  await createAuditLog(req, 'REPORT_GENERATED', 'admin', { reportType: type, startDate, endDate });

  // Return generated report
  res.status(200).json({
    success: true,
    data: { report, type }
  });
});

// @desc    Get all bookings (admin)
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookings = asyncHandler(async (req, res) => {
  // Destructure query parameters for filtering and pagination
  const { page = 1, limit = 10, status, paymentStatus, search } = req.query;

  // Build query object from filters
  const query = {};
  if (status && status !== 'all') query.status = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;

  // Calculate pagination values
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Fetch bookings with user and car details
  const bookings = await Booking.find(query)
    .populate('user', 'name email phone')
    .populate('car', 'brand model year type images pricePerDay')
    .sort('-createdAt')
    .skip(skip)
    .limit(limitNum);

  // Get total count for pagination
  const total = await Booking.countDocuments(query);

  // Return paginated booking list with count
  res.status(200).json({
    success: true,
    results: total,
    data: {
      bookings
    },
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

// Export all admin controller functions
module.exports = {
  getDashboardStats,  // Get dashboard statistics
  getAllUsers,        // Get paginated user list
  updateUser,         // Update user role/status
  deleteUser,         // Delete user account
  getAllBookings,     // Get all bookings
  getAuditLogs,       // Get audit log entries
  getReports          // Generate reports
};
