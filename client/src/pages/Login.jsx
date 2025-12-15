// ============================================
// LOGIN PAGE COMPONENT
// User authentication page with email/password form
// Handles login flow and redirects
// ============================================

// React core and hooks for state management
import React, { useState } from 'react';
// React Router for navigation and location state
import { Link, useNavigate, useLocation } from 'react-router-dom';
// Bootstrap UI components for form and layout
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
// Icon components for form inputs
import { FaCar, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
// Toast notifications for user feedback
import { toast } from 'react-toastify';
// Auth context hook for login functionality
import { useAuth } from '../context/AuthContext';

/**
 * Login Component
 * Authentication page with email and password form
 * Includes demo credentials for testing
 */
const Login = () => {
  // Form data state for email and password inputs
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  // Toggle for password visibility
  const [showPassword, setShowPassword] = useState(false);
  // Loading state during authentication
  const [loading, setLoading] = useState(false);
  // Error message state for failed login attempts
  const [error, setError] = useState('');

  // Get login function and auth state from context
  const { login, isAuthenticated } = useAuth();
  // Hook for programmatic navigation
  const navigate = useNavigate();
  // Hook for accessing navigation state (return URL)
  const location = useLocation();

  // Effect to redirect if user is already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      // Get return URL from location state or default to home
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  /**
   * Handle form input changes
   * Updates formData state and clears any existing error
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    setError('');
  };

  /**
   * Handle form submission
   * Attempts login and handles success/failure
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Attempt login with credentials
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      // Redirect to return URL or home page
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      // Extract error message from response
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Full-height container with gradient background
    <div className="min-vh-100 d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            {/* Brand logo and name */}
            <div className="text-center mb-4">
              <Link to="/" className="text-decoration-none">
                <FaCar size={48} className="text-primary mb-3" />
                <h2 className="text-white">
                  <span className="text-primary">Drive</span>Ease
                </h2>
              </Link>
            </div>

            {/* Login card */}
            <Card className="shadow-lg border-0">
              <Card.Body className="p-4 p-md-5">
                {/* Card header */}
                <h3 className="text-center mb-4">Welcome Back</h3>
                <p className="text-muted text-center mb-4">
                  Sign in to continue to your account
                </p>

                {/* Error alert - shown when login fails */}
                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                {/* Login form */}
                <Form onSubmit={handleSubmit}>
                  {/* Email input field */}
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <div className="input-group">
                      {/* Email icon */}
                      <span className="input-group-text bg-light border-end-0">
                        <FaEnvelope className="text-muted" />
                      </span>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="border-start-0"
                      />
                    </div>
                  </Form.Group>

                  {/* Password input field */}
                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <div className="input-group">
                      {/* Lock icon */}
                      <span className="input-group-text bg-light border-end-0">
                        <FaLock className="text-muted" />
                      </span>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="border-start-0 border-end-0"
                      />
                      {/* Password visibility toggle button */}
                      <button
                        type="button"
                        className="input-group-text bg-light border-start-0"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? <FaEyeSlash className="text-muted" /> : <FaEye className="text-muted" />}
                      </button>
                    </div>
                  </Form.Group>

                  {/* Submit button */}
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 py-2 mb-3"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </Form>

                {/* Sign up link */}
                <div className="text-center">
                  <p className="text-muted mb-0">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary text-decoration-none fw-semibold">
                      Sign Up
                    </Link>
                  </p>
                </div>

                {/* Demo credentials box for testing */}
                <div className="mt-4 p-3 bg-light rounded">
                  <p className="small text-muted mb-2">
                    <strong>Demo Credentials:</strong>
                  </p>
                  <p className="small text-muted mb-1">
                    Admin: admin@carbooking.com / admin123
                  </p>
                  <p className="small text-muted mb-0">
                    User: john@example.com / password123
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

// Export Login component
export default Login;
