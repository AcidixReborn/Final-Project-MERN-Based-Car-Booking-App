// ============================================
// ADMIN SIDEBAR COMPONENT
// Navigation sidebar for admin dashboard pages
// Contains links to all admin features
// ============================================

// React core library
import React from 'react';
// NavLink for active state styling, useNavigate for programmatic navigation
import { NavLink, useNavigate } from 'react-router-dom';
// Bootstrap Nav component for navigation list
import { Nav } from 'react-bootstrap';
// Icon components for menu items
import {
  FaTachometerAlt, FaCar, FaCalendarCheck, FaUsers,
  FaChartBar, FaHistory, FaCog, FaSignOutAlt, FaCarSide
} from 'react-icons/fa';
// Auth context hook for logout functionality
import { useAuth } from '../../context/AuthContext';

/**
 * AdminSidebar Component
 * Vertical navigation menu for admin panel
 * Contains branding, nav links, and logout button
 */
const AdminSidebar = () => {
  // Get logout function from auth context
  const { logout } = useAuth();
  // Hook for programmatic navigation after logout
  const navigate = useNavigate();

  /**
   * Handle admin logout
   * Logs out user and redirects to login page
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Array of menu items for navigation
  // Each item has: path (route), icon (component), label (display text)
  const menuItems = [
    { path: '/admin', icon: FaTachometerAlt, label: 'Dashboard', exact: true },  // Dashboard - exact match
    { path: '/admin/cars', icon: FaCar, label: 'Manage Cars' },                   // Car management
    { path: '/admin/bookings', icon: FaCalendarCheck, label: 'Bookings' },        // Booking management
    { path: '/admin/users', icon: FaUsers, label: 'Users' },                      // User management
    { path: '/admin/reports', icon: FaChartBar, label: 'Reports' },               // Analytics reports
    { path: '/admin/audit-logs', icon: FaHistory, label: 'Audit Logs' }           // Activity logs
  ];

  return (
    <div className="admin-sidebar">
      {/* Sidebar brand/logo section */}
      <div className="sidebar-brand">
        <FaCarSide className="text-primary me-2" size={28} />
        <span className="brand-text">
          <span className="text-primary">Drive</span>Ease
        </span>
      </div>

      {/* Admin panel label */}
      <div className="sidebar-subtitle">Admin Panel</div>

      {/* Main navigation menu */}
      <Nav className="flex-column sidebar-nav">
        {/* Map through menu items to create nav links */}
        {menuItems.map((item) => (
          <Nav.Item key={item.path}>
            {/* NavLink handles active state automatically */}
            <NavLink
              to={item.path}
              end={item.exact}  // Exact match for dashboard route
              className={({ isActive }) =>
                `nav-link sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              {/* Icon component rendered dynamically */}
              <item.icon className="me-3" />
              {item.label}
            </NavLink>
          </Nav.Item>
        ))}
      </Nav>

      {/* Sidebar footer with utility links */}
      <div className="sidebar-footer">
        {/* Link to return to main site */}
        <NavLink to="/" className="nav-link sidebar-link">
          <FaCog className="me-3" />
          Back to Site
        </NavLink>
        {/* Logout button styled as nav link */}
        <button
          className="nav-link sidebar-link text-danger w-100 text-start border-0 bg-transparent"
          onClick={handleLogout}
        >
          <FaSignOutAlt className="me-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

// Export AdminSidebar component
export default AdminSidebar;
