import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar as BSNavbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import { FaCar, FaUser, FaSignOutAlt, FaTachometerAlt, FaCalendarAlt, FaClipboardList } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <BSNavbar bg="white" expand="lg" className="shadow-sm sticky-top">
      <Container>
        <BSNavbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <div className="brand-icon me-2">
            <FaCar size={28} className="text-primary" />
          </div>
          <span className="fw-bold fs-4">
            <span className="text-primary">Drive</span>
            <span className="text-dark">Ease</span>
          </span>
        </BSNavbar.Brand>

        <BSNavbar.Toggle aria-controls="main-navbar" />
        <BSNavbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/"
              className={isActive('/') ? 'active fw-semibold' : ''}
            >
              Home
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/cars"
              className={isActive('/cars') ? 'active fw-semibold' : ''}
            >
              Browse Cars
            </Nav.Link>
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

          <Nav>
            {isAuthenticated ? (
              <>
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
                    <NavDropdown.Item as={Link} to="/admin">
                      <FaTachometerAlt className="me-2" /> Dashboard
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/cars">
                      <FaCar className="me-2" /> Manage Cars
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/bookings">
                      <FaCalendarAlt className="me-2" /> Manage Bookings
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/users">
                      <FaUser className="me-2" /> Manage Users
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item as={Link} to="/admin/reports">
                      <FaClipboardList className="me-2" /> Reports
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/audit-logs">
                      <FaClipboardList className="me-2" /> Audit Logs
                    </NavDropdown.Item>
                  </NavDropdown>
                )}

                <NavDropdown
                  title={
                    <span>
                      <FaUser className="me-1" /> {user?.name?.split(' ')[0] || 'Account'}
                    </span>
                  }
                  id="user-dropdown"
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/profile">
                    <FaUser className="me-2" /> My Profile
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/my-bookings">
                    <FaCalendarAlt className="me-2" /> My Bookings
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout} className="text-danger">
                    <FaSignOutAlt className="me-2" /> Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Button
                  as={Link}
                  to="/login"
                  variant="outline-primary"
                  size="sm"
                >
                  Sign In
                </Button>
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

export default Navbar;
