// ============================================
// ADMIN ROUTE COMPONENT
// Higher-order component that requires admin role
// Redirects non-authenticated users to login
// Redirects non-admin users to homepage
// ============================================

// React core library
import React from 'react';
// Navigate for redirects, useLocation for preserving return URL
import { Navigate, useLocation } from 'react-router-dom';
// Auth context hook for authentication and role state
import { useAuth } from '../../context/AuthContext';
// Loading component for auth check spinner
import Loading from './Loading';

/**
 * AdminRoute Component
 * Wraps routes that require admin privileges
 * Two-step access control: authentication then authorization
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Admin content to render
 */
const AdminRoute = ({ children }) => {
  // Get authentication state, admin status, and loading from context
  const { isAuthenticated, isAdmin, loading } = useAuth();
  // Get current location for redirect return URL
  const location = useLocation();

  // Show loading spinner while authentication is being verified
  if (loading) {
    return <Loading fullScreen text="Verifying access..." />;
  }

  // Redirect to login if user is not authenticated
  if (!isAuthenticated) {
    // Pass current location in state so user can return after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to homepage if user is not an admin
  if (!isAdmin) {
    // User is logged in but lacks admin role
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has admin role - render admin content
  return children;
};

// Export AdminRoute component
export default AdminRoute;
