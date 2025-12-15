// Express.js framework for building the REST API server
const express = require('express');
// CORS middleware for handling cross-origin requests from the React frontend
const cors = require('cors');
// Helmet middleware for securing HTTP headers
const helmet = require('helmet');
// Morgan middleware for HTTP request logging in development
const morgan = require('morgan');
// Rate limiting middleware to prevent brute force and DDoS attacks
const rateLimit = require('express-rate-limit');
// Node.js path module for handling file paths
const path = require('path');
// Load environment variables from .env file in parent directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Database connection function
const connectDB = require('./config/db');
// Global error handling middleware
const errorHandler = require('./middleware/errorHandler');

// Route handlers for different API endpoints
const authRoutes = require('./routes/authRoutes');       // Authentication routes (login, register, profile)
const carRoutes = require('./routes/carRoutes');         // Car CRUD and search routes
const bookingRoutes = require('./routes/bookingRoutes'); // Booking management routes
const paymentRoutes = require('./routes/paymentRoutes'); // Stripe payment processing routes
const reviewRoutes = require('./routes/reviewRoutes');   // Car review routes
const adminRoutes = require('./routes/adminRoutes');     // Admin dashboard and management routes
const userRoutes = require('./routes/userRoutes');       // User profile and stats routes
const extraRoutes = require('./routes/extraRoutes');     // Booking extras (insurance, GPS, etc.) routes

// Create Express application instance
const app = express();

// Establish connection to MongoDB database
connectDB();

// Apply Helmet middleware for security headers (XSS protection, etc.)
app.use(helmet());

// Rate limiter configuration to prevent API abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Time window: 15 minutes in milliseconds
  max: 100,                  // Maximum requests per IP per window
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});
// Apply rate limiting to all API routes
app.use('/api', limiter);

// CORS configuration to allow requests from the React frontend
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000', // Allowed origin
  credentials: true,                                          // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],        // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization']          // Allowed headers
}));

// Parse incoming JSON request bodies with a 10MB limit
app.use(express.json({ limit: '10mb' }));
// Parse URL-encoded request bodies (form submissions)
app.use(express.urlencoded({ extended: true }));

// Enable HTTP request logging in development mode only
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount API route handlers at their respective paths
app.use('/api/auth', authRoutes);       // /api/auth/* - Authentication endpoints
app.use('/api/cars', carRoutes);        // /api/cars/* - Car management endpoints
app.use('/api/bookings', bookingRoutes);// /api/bookings/* - Booking endpoints
app.use('/api/payments', paymentRoutes);// /api/payments/* - Payment endpoints
app.use('/api/reviews', reviewRoutes);  // /api/reviews/* - Review endpoints
app.use('/api/admin', adminRoutes);     // /api/admin/* - Admin-only endpoints
app.use('/api/users', userRoutes);      // /api/users/* - User profile endpoints
app.use('/api/extras', extraRoutes);    // /api/extras/* - Booking extras endpoints

// Health check endpoint for monitoring server status
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Serve React build files in production mode
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React build directory
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Handle React Router - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// 404 handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler middleware (must be last)
app.use(errorHandler);

// Server port from environment variable or default to 5000
const PORT = process.env.PORT || 5000;
// Start the Express server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections globally
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  // Optionally close server and exit process
  // server.close(() => process.exit(1));
});
