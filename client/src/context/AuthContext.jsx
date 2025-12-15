import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/profile');
          setUser(response.data.data.user);
        } catch (error) {
          console.error('Error loading user:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Register
  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { user: newUser, token: newToken } = response.data.data;

    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);

    return response.data;
  };

  // Login
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { user: loggedInUser, token: newToken } = response.data.data;

    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(loggedInUser);

    return response.data;
  };

  // Logout
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  // Update profile
  const updateProfile = async (userData) => {
    const response = await api.put('/auth/profile', userData);
    setUser(response.data.data.user);
    return response.data;
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    const response = await api.put('/auth/password', {
      currentPassword,
      newPassword
    });
    return response.data;
  };

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Check if authenticated
  const isAuthenticated = !!user && !!token;

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    register,
    login,
    logout,
    updateProfile,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
