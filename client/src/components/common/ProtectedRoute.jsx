// ============================================
// PROTECTED ROUTE COMPONENT
// Higher-order component that requires authentication
// Redirects unauthenticated users to login page
// ============================================

// React core library
import React from 'react';
// Navigate for redirects, useLocation for preserving return URL
import { Navigate, useLocation } from 'react-router-dom';
// Auth context hook for authentication state
import { useAuth } from '../../context/AuthContext';
// Loading component for auth check spinner
import Loading from './Loading';

/**
 * ProtectedRoute Component
 * Wraps routes that require user authentication
 * Shows loading while checking auth, redirects to login if not authenticated
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Protected content to render
 */
const ProtectedRoute = ({ children }) => {
  // Get authentication state and loading status from context
  const { isAuthenticated, loading } = useAuth();
  // Get current location for redirect return URL
  const location = useLocation();

  // Show loading spinner while authentication is being verified
  if (loading) {
    return <Loading fullScreen text="Checking authentication..." />;
  }

  // Redirect to login if user is not authenticated
  if (!isAuthenticated) {
    // Pass current location in state so user can return after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated - render protected content
  return children;
};

// Export ProtectedRoute component
export default ProtectedRoute;
