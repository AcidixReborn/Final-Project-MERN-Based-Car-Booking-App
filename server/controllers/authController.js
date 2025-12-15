// User model for database operations on user accounts
const User = require('../models/User');
// JWT token generation utility from auth middleware
const { generateToken } = require('../middleware/auth');
// Async handler to catch errors and pass to error middleware
const { asyncHandler } = require('../middleware/errorHandler');
// Audit logging utility for tracking user actions
const { createAuditLog } = require('../middleware/auditLogger');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  // Destructure registration data from request body
  const { name, email, password, phone } = req.body;

  // Check if user already exists with this email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  // Create new user document in database (password hashed by pre-save hook)
  const user = await User.create({
    name,
    email,
    password,
    phone
  });

  // Generate JWT token for immediate authentication after registration
  const token = generateToken(user._id);

  // Log successful registration to audit trail
  await createAuditLog(req, 'REGISTER', 'auth', { email }, user._id);

  // Return success response with user data and token
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  // Destructure login credentials from request body
  const { email, password } = req.body;

  // Find user by email and explicitly include password field (normally excluded)
  const user = await User.findOne({ email }).select('+password');

  // Return error if user not found (don't reveal which credential was wrong)
  if (!user) {
    await createAuditLog(req, 'LOGIN_FAILED', 'auth', { email, reason: 'User not found' });
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if user account has been deactivated by admin
  if (!user.isActive) {
    await createAuditLog(req, 'LOGIN_FAILED', 'auth', { email, reason: 'Account deactivated' });
    return res.status(401).json({
      success: false,
      message: 'Your account has been deactivated. Please contact support.'
    });
  }

  // Verify password matches using bcrypt comparison method on user model
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await createAuditLog(req, 'LOGIN_FAILED', 'auth', { email, reason: 'Invalid password' });
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Update last login timestamp for tracking purposes
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Generate JWT token for authenticated session
  const token = generateToken(user._id);

  // Log successful login to audit trail
  await createAuditLog(req, 'LOGIN', 'auth', { email }, user._id);

  // Return success response with user data and authentication token
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      },
      token
    }
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  // Fetch fresh user data from database (req.user set by auth middleware)
  const user = await User.findById(req.user._id);

  // Return user profile data
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  // Destructure updatable fields from request body
  const { name, phone, avatar } = req.body;

  // Get current user from database
  const user = await User.findById(req.user._id);

  // Update only provided fields
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (avatar) user.avatar = avatar;

  // Save updated user document
  await user.save();

  // Log profile update to audit trail
  await createAuditLog(req, 'USER_UPDATE', 'user', { updatedFields: Object.keys(req.body) }, user._id);

  // Return updated user data
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      }
    }
  });
});

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  // Destructure current and new password from request body
  const { currentPassword, newPassword } = req.body;

  // Get user with password field included for verification
  const user = await User.findById(req.user._id).select('+password');

  // Verify current password is correct before allowing change
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Set new password (will be hashed by pre-save middleware)
  user.password = newPassword;
  await user.save();

  // Log password change to audit trail for security tracking
  await createAuditLog(req, 'PASSWORD_CHANGE', 'auth', {}, user._id);

  // Return success response
  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Logout user (client-side token removal, but we log it)
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  // Log logout event to audit trail (actual token removal happens client-side)
  await createAuditLog(req, 'LOGOUT', 'auth', {}, req.user._id);

  // Return success response
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Export all authentication controller functions
module.exports = {
  register,        // User registration handler
  login,           // User login handler
  getProfile,      // Get current user profile handler
  updateProfile,   // Update profile handler
  changePassword,  // Password change handler
  logout           // Logout handler
};
