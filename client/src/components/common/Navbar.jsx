// ============================================
// NAVIGATION BAR COMPONENT
// Main navigation header displayed on all pages
// Handles user authentication state and navigation
// ============================================

// React core library
import React from 'react';
// React Router components for navigation
import { Link, useNavigate, useLocation } from 'react-router-dom';
// Bootstrap components for responsive navbar layout
import { Navbar as BSNavbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
// Icon components for visual elements
import { FaCar, FaUser, FaSignOutAlt, FaTachometerAlt, FaCalendarAlt, FaClipboardList } from 'react-icons/fa';
// Auth context hook for authentication state
import { useAuth } from '../../context/AuthContext';

/**
 * Navbar Component
 * Responsive navigation bar with authentication-aware links
 * Shows different options based on user login status and role
 */
const Navbar = () => {
  // Destructure auth state and methods from context
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  // Hook for programmatic navigation
  const navigate = useNavigate();
  // Hook for current location/path info
  const location = useLocation();

  /**
   * Handle user logout action
   * Calls logout method and redirects to homepage
   */
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  /**
   * Check if a navigation link is currently active
   * @param {string} path - Path to check against current location
   * @returns {boolean} True if path matches current location
   */
  const isActive = (path) => location.pathname === path;

  return (
    // Bootstrap Navbar with sticky positioning and shadow
    <BSNavbar bg="white" expand="lg" className="shadow-sm sticky-top">
      <Container>
        {/* Brand logo and name - links to homepage */}
        <BSNavbar.Brand as={Link} to="/" className="d-flex align-items-center">
          {/* Car icon for brand */}
          <div className="brand-icon me-2">
            <FaCar size={28} className="text-primary" />
          </div>
          {/* Brand text with split colors */}
          <span className="fw-bold fs-4">
            <span className="text-primary">Drive</span>
            <span className="text-dark">Ease</span>
          </span>
        </BSNavbar.Brand>

        {/* Mobile menu toggle button */}
        <BSNavbar.Toggle aria-controls="main-navbar" />

        {/* Collapsible navigation content */}
        <BSNavbar.Collapse id="main-navbar">
          {/* Left-aligned main navigation links */}
          <Nav className="me-auto">
            {/* Home link */}
            <Nav.Link
              as={Link}
              to="/"
              className={isActive('/') ? 'active fw-semibold' : ''}
            >
              Home
            </Nav.Link>
            {/* Browse cars link */}
            <Nav.Link
              as={Link}
              to="/cars"
              className={isActive('/cars') ? 'active fw-semibold' : ''}
            >
              Browse Cars
            </Nav.Link>
            {/* Book Now link - only shown when authenticated */}
            {isAuthenticated && (
              <Nav.Link
                as={Link}
                to="/booking"
                className={isActive('/booking') ? 'active fw-semibold' : ''}
              >
                Book Now
              </Nav.Link>
            )}
          </Nav>

          {/* Right-aligned authentication/user navigation */}
          <Nav>
            {isAuthenticated ? (
              // Authenticated user menu
              <>
                {/* Admin dropdown menu - only shown for admin users */}
                {isAdmin && (
                  <NavDropdown
                    title={
                      <span>
                        <FaTachometerAlt className="me-1" /> Admin
                      </span>
                    }
                    id="admin-dropdown"
                    className="me-2"
                  >
                    {/* Admin Dashboard link */}
                    <NavDropdown.Item as={Link} to="/admin">
                      <FaTachometerAlt className="me-2" /> Dashboard
                    </NavDropdown.Item>
                    {/* Manage Cars link */}
                    <NavDropdown.Item as={Link} to="/admin/cars">
                      <FaCar className="me-2" /> Manage Cars
                    </NavDropdown.Item>
                    {/* Manage Bookings link */}
                    <NavDropdown.Item as={Link} to="/admin/bookings">
                      <FaCalendarAlt className="me-2" /> Manage Bookings
                    </NavDropdown.Item>
                    {/* Manage Users link */}
                    <NavDropdown.Item as={Link} to="/admin/users">
                      <FaUser className="me-2" /> Manage Users
                    </NavDropdown.Item>
                    {/* Divider between main and reporting links */}
                    <NavDropdown.Divider />
                    {/* Reports link */}
                    <NavDropdown.Item as={Link} to="/admin/reports">
                      <FaClipboardList className="me-2" /> Reports
                    </NavDropdown.Item>
                    {/* Audit Logs link */}
                    <NavDropdown.Item as={Link} to="/admin/audit-logs">
                      <FaClipboardList className="me-2" /> Audit Logs
                    </NavDropdown.Item>
                  </NavDropdown>
                )}

                {/* User account dropdown menu */}
                <NavDropdown
                  title={
                    <span>
                      <FaUser className="me-1" /> {user?.name?.split(' ')[0] || 'Account'}
                    </span>
                  }
                  id="user-dropdown"
                  align="end"
                >
                  {/* Profile link */}
                  <NavDropdown.Item as={Link} to="/profile">
                    <FaUser className="me-2" /> My Profile
                  </NavDropdown.Item>
                  {/* Booking history link */}
                  <NavDropdown.Item as={Link} to="/my-bookings">
                    <FaCalendarAlt className="me-2" /> My Bookings
                  </NavDropdown.Item>
                  {/* Divider before logout */}
                  <NavDropdown.Divider />
                  {/* Logout button */}
                  <NavDropdown.Item onClick={handleLogout} className="text-danger">
                    <FaSignOutAlt className="me-2" /> Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              // Guest user buttons (not authenticated)
              <div className="d-flex gap-2">
                {/* Sign In button - outline style */}
                <Button
                  as={Link}
                  to="/login"
                  variant="outline-primary"
                  size="sm"
                >
                  Sign In
                </Button>
                {/* Sign Up button - filled style */}
                <Button
                  as={Link}
                  to="/register"
                  variant="primary"
                  size="sm"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

// Export Navbar component
export default Navbar;
