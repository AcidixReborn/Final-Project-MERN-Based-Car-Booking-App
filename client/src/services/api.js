import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';

    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Optionally redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Handle 403 - Forbidden
    if (error.response?.status === 403) {
      console.error('Access denied:', message);
    }

    // Handle 500 - Server error
    if (error.response?.status >= 500) {
      console.error('Server error:', message);
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
  logout: () => api.post('/auth/logout')
};

// Cars API
export const carsAPI = {
  getAll: (params) => api.get('/cars', { params }),
  getById: (id) => api.get(`/cars/${id}`),
  search: (params) => api.get('/cars/search', { params }),
  getFeatured: () => api.get('/cars/featured'),
  getTypes: () => api.get('/cars/types'),
  checkAvailability: (id, params) => api.get(`/cars/${id}/availability`, { params }),
  // Admin
  create: (data) => api.post('/cars', data),
  update: (id, data) => api.put(`/cars/${id}`, data),
  delete: (id) => api.delete(`/cars/${id}`)
};

// Bookings API
export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: (params) => api.get('/bookings/my', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }),
  calculatePrice: (data) => api.post('/bookings/calculate', data),
  // Admin
  getAll: (params) => api.get('/bookings', { params }),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status })
};

// Payments API
export const paymentsAPI = {
  createIntent: (bookingId) => api.post('/payments/create-intent', { bookingId }),
  confirmPayment: (bookingId, paymentIntentId) =>
    api.post('/payments/confirm', { bookingId, paymentIntentId }),
  getStatus: (bookingId) => api.get(`/payments/${bookingId}/status`),
  // Admin
  refund: (bookingId) => api.post(`/payments/${bookingId}/refund`)
};

// Reviews API
export const reviewsAPI = {
  create: (data) => api.post('/reviews', data),
  getCarReviews: (carId, params) => api.get(`/reviews/car/${carId}`, { params }),
  getMyReviews: () => api.get('/reviews/my'),
  getRecent: () => api.get('/reviews/recent'),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`)
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAllBookings: (params) => api.get('/admin/bookings', { params }),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getReports: (params) => api.get('/admin/reports', { params })
};

// Extras API (using bookings endpoint)
export const extrasAPI = {
  getAll: () => api.get('/extras')
};
