// ============================================
// AUTHENTICATION CONTEXT
// Global state management for user authentication
// Provides auth state and methods to all components
// ============================================

// React core and hooks for creating context and managing state
import React, { createContext, useState, useContext, useEffect } from 'react';
// API service for making HTTP requests to backend
import api from '../services/api';

// Create authentication context with null default value
const AuthContext = createContext(null);

/**
 * Authentication Provider Component
 * Wraps the app and provides auth state and methods to all children
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 */
export const AuthProvider = ({ children }) => {
  // Current authenticated user data (null if not logged in)
  const [user, setUser] = useState(null);
  // JWT token for API authentication (loaded from localStorage on init)
  const [token, setToken] = useState(localStorage.getItem('token'));
  // Loading state while checking authentication status
  const [loading, setLoading] = useState(true);

  // Effect to load user data when token changes (on mount or login/logout)
  useEffect(() => {
    /**
     * Loads user profile from API using stored token
     * Clears auth state if token is invalid or expired
     */
    const loadUser = async () => {
      // Only attempt to load user if token exists
      if (token) {
        try {
          // Fetch current user profile from API
          const response = await api.get('/auth/profile');
          // Update user state with fetched data
          setUser(response.data.data.user);
        } catch (error) {
          // Log error and clear invalid auth state
          console.error('Error loading user:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      // Mark loading as complete regardless of outcome
      setLoading(false);
    };

    // Execute user loading function
    loadUser();
  }, [token]); // Re-run when token changes

  /**
   * Register a new user account
   * @param {Object} userData - User registration data (name, email, password)
   * @returns {Object} API response data
   */
  const register = async (userData) => {
    // Send registration request to API
    const response = await api.post('/auth/register', userData);
    // Destructure user and token from response
    const { user: newUser, token: newToken } = response.data.data;

    // Store token in localStorage for persistence
    localStorage.setItem('token', newToken);
    // Update context state with new auth data
    setToken(newToken);
    setUser(newUser);

    return response.data;
  };

  /**
   * Login with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Object} API response data
   */
  const login = async (email, password) => {
    // Send login request to API
    const response = await api.post('/auth/login', { email, password });
    // Destructure user and token from response
    const { user: loggedInUser, token: newToken } = response.data.data;

    // Store token in localStorage for persistence
    localStorage.setItem('token', newToken);
    // Update context state with new auth data
    setToken(newToken);
    setUser(loggedInUser);

    return response.data;
  };

  /**
   * Logout current user
   * Clears token and user state
   */
  const logout = async () => {
    try {
      // Notify server of logout (for audit logging)
      await api.post('/auth/logout');
    } catch (error) {
      // Log error but continue with logout
      console.error('Logout error:', error);
    } finally {
      // Always clear local auth state
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  /**
   * Update current user's profile
   * @param {Object} userData - Updated profile data
   * @returns {Object} API response data
   */
  const updateProfile = async (userData) => {
    // Send profile update request to API
    const response = await api.put('/auth/profile', userData);
    // Update user state with new profile data
    setUser(response.data.data.user);
    return response.data;
  };

  /**
   * Change current user's password
   * @param {string} currentPassword - User's current password
   * @param {string} newPassword - New password to set
   * @returns {Object} API response data
   */
  const changePassword = async (currentPassword, newPassword) => {
    // Send password change request to API
    const response = await api.put('/auth/password', {
      currentPassword,
      newPassword
    });
    return response.data;
  };

  // Boolean flag indicating if user has admin role
  const isAdmin = user?.role === 'admin';

  // Boolean flag indicating if user is authenticated
  const isAuthenticated = !!user && !!token;

  // Context value object containing all auth state and methods
  const value = {
    user,             // Current user data object
    token,            // JWT authentication token
    loading,          // Loading state boolean
    isAuthenticated,  // Authentication status boolean
    isAdmin,          // Admin role status boolean
    register,         // Registration function
    login,            // Login function
    logout,           // Logout function
    updateProfile,    // Profile update function
    changePassword    // Password change function
  };

  // Render provider with context value
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access auth context
 * Throws error if used outside of AuthProvider
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  // Get context value
  const context = useContext(AuthContext);
  // Throw error if used outside provider
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export context as default
export default AuthContext;
