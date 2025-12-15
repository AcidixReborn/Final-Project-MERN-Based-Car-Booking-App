// ============================================
// MAIN APPLICATION COMPONENT
// Root component with routing configuration and layout
// ============================================

// React core library for building components
import React from 'react';
// Routes and Route components for defining URL-based navigation
import { Routes, Route } from 'react-router-dom';
// ToastContainer for displaying notification messages
import { ToastContainer } from 'react-toastify';

// ============================================
// LAYOUT COMPONENTS
// ============================================
// Navigation bar displayed at top of all pages
import Navbar from './components/common/Navbar';
// Footer displayed at bottom of all pages
import Footer from './components/common/Footer';

// ============================================
// ROUTE PROTECTION COMPONENTS
// ============================================
// HOC that requires user authentication to access wrapped routes
import ProtectedRoute from './components/common/ProtectedRoute';
// HOC that requires admin role to access wrapped routes
import AdminRoute from './components/common/AdminRoute';

// ============================================
// PUBLIC PAGES - Accessible without authentication
// ============================================
// Homepage with hero section and featured cars
import Home from './pages/Home';
// Car listing page with filters and search
import Cars from './pages/Cars';
// Individual car details with reviews
import CarDetails from './pages/CarDetails';
// User login page with authentication form
import Login from './pages/Login';
// New user registration page
import Register from './pages/Register';

// ============================================
// PROTECTED USER PAGES - Require authentication
// ============================================
// Booking creation page for selecting dates and car
import Booking from './pages/Booking';
// Checkout page for extras selection and payment
import Checkout from './pages/Checkout';
// Booking confirmation page shown after successful booking
import Confirmation from './pages/Confirmation';
// User profile page for viewing/editing account info
import Profile from './pages/Profile';
// User's booking history list
import BookingHistory from './pages/BookingHistory';

// ============================================
// ADMIN PAGES - Require admin role
// ============================================
// Admin dashboard with statistics and overview
import AdminDashboard from './pages/admin/Dashboard';
// Car management page for CRUD operations
import ManageCars from './pages/admin/ManageCars';
// Booking management page for viewing/updating all bookings
import ManageBookings from './pages/admin/ManageBookings';
// User management page for admin user operations
import ManageUsers from './pages/admin/ManageUsers';
// Reports page with analytics and charts
import Reports from './pages/admin/Reports';
// Audit logs page for viewing system activity
import AuditLogs from './pages/admin/AuditLogs';

/**
 * Main App component
 * Defines the application layout and all routes
 * @returns {JSX.Element} The complete application with routing
 */
function App() {
  return (
    // Main wrapper with flexbox for sticky footer layout
    <div className="d-flex flex-column min-vh-100">
      {/* Global navigation bar */}
      <Navbar />

      {/* Main content area that grows to fill available space */}
      <main className="flex-grow-1">
        <Routes>
          {/* ============================================ */}
          {/* PUBLIC ROUTES - No authentication required */}
          {/* ============================================ */}

          {/* Homepage route */}
          <Route path="/" element={<Home />} />
          {/* Car listing route */}
          <Route path="/cars" element={<Cars />} />
          {/* Individual car details route with dynamic ID parameter */}
          <Route path="/cars/:id" element={<CarDetails />} />
          {/* Login page route */}
          <Route path="/login" element={<Login />} />
          {/* Registration page route */}
          <Route path="/register" element={<Register />} />

          {/* ============================================ */}
          {/* PROTECTED USER ROUTES - Authentication required */}
          {/* ============================================ */}

          {/* Booking creation route - requires login */}
          <Route
            path="/booking"
            element={
              <ProtectedRoute>
                <Booking />
              </ProtectedRoute>
            }
          />
          {/* Checkout route - requires login */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          {/* Booking confirmation route with dynamic booking ID */}
          <Route
            path="/confirmation/:bookingId"
            element={
              <ProtectedRoute>
                <Confirmation />
              </ProtectedRoute>
            }
          />
          {/* User profile route - requires login */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          {/* Booking history route - requires login */}
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <BookingHistory />
              </ProtectedRoute>
            }
          />

          {/* ============================================ */}
          {/* ADMIN ROUTES - Admin role required */}
          {/* ============================================ */}

          {/* Admin dashboard route */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          {/* Admin car management route */}
          <Route
            path="/admin/cars"
            element={
              <AdminRoute>
                <ManageCars />
              </AdminRoute>
            }
          />
          {/* Admin booking management route */}
          <Route
            path="/admin/bookings"
            element={
              <AdminRoute>
                <ManageBookings />
              </AdminRoute>
            }
          />
          {/* Admin user management route */}
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <ManageUsers />
              </AdminRoute>
            }
          />
          {/* Admin reports route */}
          <Route
            path="/admin/reports"
            element={
              <AdminRoute>
                <Reports />
              </AdminRoute>
            }
          />
          {/* Admin audit logs route */}
          <Route
            path="/admin/audit-logs"
            element={
              <AdminRoute>
                <AuditLogs />
              </AdminRoute>
            }
          />

          {/* ============================================ */}
          {/* 404 CATCH-ALL ROUTE */}
          {/* ============================================ */}

          {/* Fallback route for unmatched URLs - shows 404 page */}
          <Route
            path="*"
            element={
              <div className="container py-5 text-center">
                <h1 className="display-1">404</h1>
                <p className="lead">Page not found</p>
                <a href="/" className="btn btn-primary">Go Home</a>
              </div>
            }
          />
        </Routes>
      </main>

      {/* Global footer */}
      <Footer />

      {/* Toast notification container with configuration */}
      <ToastContainer
        position="top-right"      // Position notifications at top-right
        autoClose={3000}          // Auto-dismiss after 3 seconds
        hideProgressBar={false}   // Show progress bar on toasts
        newestOnTop               // Stack newest notifications on top
        closeOnClick              // Allow click to dismiss
        rtl={false}               // Left-to-right text direction
        pauseOnFocusLoss          // Pause timer when window loses focus
        draggable                 // Allow drag to dismiss
        pauseOnHover              // Pause timer on hover
        theme="light"             // Light theme for notifications
      />
    </div>
  );
}

// Export App component as default export
export default App;
