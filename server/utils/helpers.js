// Format currency
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

// Calculate number of days between two dates
const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Generate booking reference
const generateBookingRef = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'BK';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Validate date range
const isValidDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  // Start date should be today or future
  if (start < now.setHours(0, 0, 0, 0)) {
    return { valid: false, message: 'Start date cannot be in the past' };
  }

  // End date should be after start date
  if (end <= start) {
    return { valid: false, message: 'End date must be after start date' };
  }

  // Maximum booking duration (e.g., 30 days)
  const maxDays = 30;
  const days = calculateDays(start, end);
  if (days > maxDays) {
    return { valid: false, message: `Booking cannot exceed ${maxDays} days` };
  }

  return { valid: true };
};

// Sanitize user input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML brackets
    .substring(0, 1000); // Limit length
};

// Paginate results helper
const paginateResults = (page = 1, limit = 10, total) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const totalPages = Math.ceil(total / limitNum);

  return {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages,
    hasNextPage: pageNum < totalPages,
    hasPrevPage: pageNum > 1,
    skip: (pageNum - 1) * limitNum
  };
};

module.exports = {
  formatCurrency,
  calculateDays,
  formatDate,
  generateBookingRef,
  isValidDateRange,
  sanitizeInput,
  paginateResults
};
