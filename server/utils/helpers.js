// ============================================
// HELPER UTILITY FUNCTIONS
// General purpose helper functions for the application
// ============================================

// Format a numeric amount as currency string
// Uses Intl.NumberFormat for locale-aware formatting
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

// Calculate the number of days between two dates
// Returns ceiling value to count partial days as full days
const calculateDays = (startDate, endDate) => {
  // Parse dates to ensure Date objects
  const start = new Date(startDate);
  const end = new Date(endDate);
  // Calculate absolute difference in milliseconds
  const diffTime = Math.abs(end - start);
  // Convert milliseconds to days and round up
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Format a date for human-readable display
// Returns format like "January 15, 2024"
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Generate a unique booking reference code
// Format: "BK" prefix + 6 random alphanumeric characters
const generateBookingRef = () => {
  // Characters allowed in reference code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  // Start with BK prefix
  let result = 'BK';
  // Append 6 random characters
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Validate a booking date range
// Checks for: past dates, end before start, max duration
const isValidDateRange = (startDate, endDate) => {
  // Parse dates to ensure Date objects
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  // Start date must be today or in the future
  if (start < now.setHours(0, 0, 0, 0)) {
    return { valid: false, message: 'Start date cannot be in the past' };
  }

  // End date must be after start date
  if (end <= start) {
    return { valid: false, message: 'End date must be after start date' };
  }

  // Maximum booking duration limit (30 days)
  const maxDays = 30;
  const days = calculateDays(start, end);
  if (days > maxDays) {
    return { valid: false, message: `Booking cannot exceed ${maxDays} days` };
  }

  // All validation passed
  return { valid: true };
};

// Sanitize user input to prevent XSS and limit length
// Removes HTML brackets and trims/limits string length
const sanitizeInput = (input) => {
  // Only sanitize string inputs
  if (typeof input !== 'string') return input;
  return input
    .trim()                  // Remove leading/trailing whitespace
    .replace(/[<>]/g, '')    // Remove HTML angle brackets
    .substring(0, 1000);     // Limit to 1000 characters max
};

// Calculate pagination parameters from request query
// Returns standardized pagination object with bounds checking
const paginateResults = (page = 1, limit = 10, total) => {
  // Ensure page is at least 1
  const pageNum = Math.max(1, parseInt(page));
  // Ensure limit is between 1 and 50
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  // Calculate total pages
  const totalPages = Math.ceil(total / limitNum);

  return {
    page: pageNum,                          // Current page number
    limit: limitNum,                        // Items per page
    total,                                  // Total items count
    totalPages,                             // Total pages count
    hasNextPage: pageNum < totalPages,      // Whether next page exists
    hasPrevPage: pageNum > 1,               // Whether previous page exists
    skip: (pageNum - 1) * limitNum          // Number of items to skip (for MongoDB)
  };
};

// Export all helper functions
module.exports = {
  formatCurrency,    // Currency formatting
  calculateDays,     // Days calculation
  formatDate,        // Date formatting
  generateBookingRef,// Booking reference generation
  isValidDateRange,  // Date range validation
  sanitizeInput,     // Input sanitization
  paginateResults    // Pagination calculation
};
