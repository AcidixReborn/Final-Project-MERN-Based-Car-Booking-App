const User = require('../models/User');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const AuditLog = require('../models/AuditLog');
const { asyncHandler } = require('../middleware/errorHandler');
const { createAuditLog } = require('../middleware/auditLogger');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  // Get counts
  const totalUsers = await User.countDocuments({ role: 'user' });
  const totalCars = await Car.countDocuments();
  const availableCars = await Car.countDocuments({ available: true });
  const totalBookings = await Booking.countDocuments();

  // Get booking stats by status
  const bookingsByStatus = await Booking.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Get revenue stats
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

  // Get monthly revenue for the current year
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

  // Get recent bookings
  const recentBookings = await Booking.find()
    .populate('user', 'name email')
    .populate('car', 'brand model')
    .sort('-createdAt')
    .limit(5);

  // Get popular cars
  const popularCars = await Booking.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    { $group: { _id: '$car', bookingCount: { $sum: 1 } } },
    { $sort: { bookingCount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'cars',
        localField: '_id',
        foreignField: '_id',
        as: 'carDetails'
      }
    },
    { $unwind: '$carDetails' },
    {
      $project: {
        _id: 1,
        bookingCount: 1,
        brand: '$carDetails.brand',
        model: '$carDetails.model',
        type: '$carDetails.type'
      }
    }
  ]);

  await createAuditLog(req, 'ADMIN_ACCESS', 'admin', { action: 'view_dashboard' });

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
  const { page = 1, limit = 20, search, role, isActive } = req.query;

  const query = {};
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const users = await User.find(query)
    .select('-password')
    .sort('-createdAt')
    .skip(skip)
    .limit(limitNum);

  const total = await User.countDocuments(query);

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
  const { role, isActive } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const previousState = { role: user.role, isActive: user.isActive };

  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save();

  const action = isActive === false ? 'USER_DEACTIVATE' : isActive === true ? 'USER_ACTIVATE' : 'USER_UPDATE';
  await createAuditLog(req, action, 'user', { previousState, newState: { role: user.role, isActive: user.isActive } }, user._id);

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
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent deleting yourself
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete your own account'
    });
  }

  // Check for active bookings
  const activeBookings = await Booking.countDocuments({
    user: user._id,
    status: { $in: ['pending', 'confirmed', 'active'] }
  });

  if (activeBookings > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete user with active bookings'
    });
  }

  await createAuditLog(req, 'USER_DELETE', 'user', { email: user.email }, user._id);

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Private/Admin
const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, action, resource, userId, startDate, endDate } = req.query;

  const query = {};
  if (action) query.action = action;
  if (resource) query.resource = resource;
  if (userId) query.userId = userId;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const logs = await AuditLog.find(query)
    .populate('userId', 'name email')
    .sort('-createdAt')
    .skip(skip)
    .limit(limitNum);

  const total = await AuditLog.countDocuments(query);

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
  const { startDate, endDate, type = 'revenue' } = req.query;

  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  let report = {};

  switch (type) {
    case 'revenue':
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
          $lookup: {
            from: 'cars',
            localField: '_id',
            foreignField: '_id',
            as: 'car'
          }
        },
        { $unwind: '$car' },
        {
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
      return res.status(400).json({
        success: false,
        message: 'Invalid report type'
      });
  }

  await createAuditLog(req, 'REPORT_GENERATED', 'admin', { reportType: type, startDate, endDate });

  res.status(200).json({
    success: true,
    data: { report, type }
  });
});

// @desc    Get all bookings (admin)
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, paymentStatus, search } = req.query;

  const query = {};
  if (status && status !== 'all') query.status = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const bookings = await Booking.find(query)
    .populate('user', 'name email phone')
    .populate('car', 'brand model year type images pricePerDay')
    .sort('-createdAt')
    .skip(skip)
    .limit(limitNum);

  const total = await Booking.countDocuments(query);

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

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllBookings,
  getAuditLogs,
  getReports
};
