// Mongoose ODM for MongoDB schema definition
const mongoose = require('mongoose');
// Bcrypt library for password hashing and comparison
const bcrypt = require('bcryptjs');

// User schema definition with validation rules
const userSchema = new mongoose.Schema({
  // User's display name with length validation
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  // User's email address with format validation and uniqueness
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  // Hashed password - excluded from queries by default for security
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  // Optional phone number for contact
  phone: {
    type: String,
    trim: true
  },
  // User role for authorization (user or admin)
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // URL to user's profile picture
  avatar: {
    type: String,
    default: ''
  },
  // Account status flag for soft-delete functionality
  isActive: {
    type: Boolean,
    default: true
  },
  // Timestamp of user's most recent login
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

// Pre-save middleware to hash password before storing in database
userSchema.pre('save', async function(next) {
  // Only hash if password field was modified
  if (!this.isModified('password')) {
    return next();
  }

  // Generate salt and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare candidate password with stored hash
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual property to get user's full name (returns name field)
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Configure schema to include virtual fields in JSON output
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Export the User model for use in controllers
module.exports = mongoose.model('User', userSchema);
