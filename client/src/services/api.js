// ============================================
// API SERVICE LAYER
// Centralized HTTP client configuration and API methods
// All backend communication goes through this module
// ============================================

// Axios HTTP client library for making API requests
import axios from 'axios';

// Create configured axios instance with base settings
const api = axios.create({
  // API base URL from environment variable or default to /api for proxy
  baseURL: process.env.REACT_APP_API_URL || '/api',
  // Default headers for all requests
  headers: {
    'Content-Type': 'application/json'  // Send JSON data format
  }
});

// ============================================
// REQUEST INTERCEPTOR
// Runs before every request is sent
// ============================================
api.interceptors.request.use(
  (config) => {
    // Get JWT token from localStorage
    const token = localStorage.getItem('token');
    // If token exists, add Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Return modified config
    return config;
  },
  (error) => {
    // Reject promise on request error
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// Runs after every response is received
// Handles global error cases
// ============================================
api.interceptors.response.use(
  // Success handler - return response as-is
  (response) => response,
  // Error handler - process different error types
  (error) => {
    // Extract error message from response or use default
    const message = error.response?.data?.message || 'An error occurred';

    // Handle 401 Unauthorized - user not authenticated
    if (error.response?.status === 401) {
      // Clear invalid token from storage
      localStorage.removeItem('token');
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Handle 403 Forbidden - user lacks permission
    if (error.response?.status === 403) {
      console.error('Access denied:', message);
    }

    // Handle 500+ Server errors
    if (error.response?.status >= 500) {
      console.error('Server error:', message);
    }

    // Reject promise with error for calling code to handle
    return Promise.reject(error);
  }
);

// Export configured axios instance as default
export default api;

// ============================================
// AUTH API ENDPOINTS
// User authentication and profile management
// ============================================
export const authAPI = {
  // Register new user account
  register: (data) => api.post('/auth/register', data),
  // Login with email and password
  login: (data) => api.post('/auth/login', data),
  // Get current user's profile
  getProfile: () => api.get('/auth/profile'),
  // Update user profile information
  updateProfile: (data) => api.put('/auth/profile', data),
  // Change user password
  changePassword: (data) => api.put('/auth/password', data),
  // Logout current user
  logout: () => api.post('/auth/logout')
};

// ============================================
// CARS API ENDPOINTS
// Vehicle listing and management
// ============================================
export const carsAPI = {
  // Get all cars with optional filters/pagination
  getAll: (params) => api.get('/cars', { params }),
  // Get single car by ID
  getById: (id) => api.get(`/cars/${id}`),
  // Search cars with filters and availability check
  search: (params) => api.get('/cars/search', { params }),
  // Get featured cars for homepage
  getFeatured: () => api.get('/cars/featured'),
  // Get available car types with counts
  getTypes: () => api.get('/cars/types'),
  // Check car availability for specific dates
  checkAvailability: (id, params) => api.get(`/cars/${id}/availability`, { params }),
  // Admin: Create new car listing
  create: (data) => api.post('/cars', data),
  // Admin: Update existing car
  update: (id, data) => api.put(`/cars/${id}`, data),
  // Admin: Delete car listing
  delete: (id) => api.delete(`/cars/${id}`)
};

// ============================================
// BOOKINGS API ENDPOINTS
// Rental reservation management
// ============================================
export const bookingsAPI = {
  // Create new booking reservation
  create: (data) => api.post('/bookings', data),
  // Get current user's booking history
  getMyBookings: (params) => api.get('/bookings/my', { params }),
  // Get single booking by ID
  getById: (id) => api.get(`/bookings/${id}`),
  // Cancel a booking with optional reason
  cancel: (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }),
  // Calculate booking price preview
  calculatePrice: (data) => api.post('/bookings/calculate', data),
  // Admin: Get all bookings with filters
  getAll: (params) => api.get('/bookings', { params }),
  // Admin: Update booking status
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status })
};

// ============================================
// PAYMENTS API ENDPOINTS
// Stripe payment processing
// ============================================
export const paymentsAPI = {
  // Create Stripe payment intent for booking
  createIntent: (bookingId) => api.post('/payments/create-intent', { bookingId }),
  // Confirm payment after Stripe processing
  confirmPayment: (bookingId, paymentIntentId) =>
    api.post('/payments/confirm', { bookingId, paymentIntentId }),
  // Get payment status for a booking
  getStatus: (bookingId) => api.get(`/payments/${bookingId}/status`),
  // Admin: Process refund for booking
  refund: (bookingId) => api.post(`/payments/${bookingId}/refund`)
};

// ============================================
// REVIEWS API ENDPOINTS
// Car review and rating management
// ============================================
export const reviewsAPI = {
  // Create new review for a car
  create: (data) => api.post('/reviews', data),
  // Get all reviews for a specific car
  getCarReviews: (carId, params) => api.get(`/reviews/car/${carId}`, { params }),
  // Get current user's reviews
  getMyReviews: () => api.get('/reviews/my'),
  // Get recent reviews (for homepage)
  getRecent: () => api.get('/reviews/recent'),
  // Update an existing review
  update: (id, data) => api.put(`/reviews/${id}`, data),
  // Delete a review
  delete: (id) => api.delete(`/reviews/${id}`)
};

// ============================================
// ADMIN API ENDPOINTS
// Administrative operations and reporting
// ============================================
export const adminAPI = {
  // Get dashboard statistics
  getStats: () => api.get('/admin/stats'),
  // Get all users with pagination
  getUsers: (params) => api.get('/admin/users', { params }),
  // Update user information or role
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  // Delete a user account
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  // Get all bookings (admin view)
  getAllBookings: (params) => api.get('/admin/bookings', { params }),
  // Get audit log entries
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  // Get analytics reports
  getReports: (params) => api.get('/admin/reports', { params })
};

// ============================================
// EXTRAS API ENDPOINTS
// Booking add-ons (insurance, GPS, etc.)
// ============================================
export const extrasAPI = {
  // Get all available extras
  getAll: () => api.get('/extras')
};
