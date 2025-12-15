// ============================================
// REGISTER PAGE COMPONENT
// New user registration with form validation
// Creates account and auto-logs in user
// ============================================

// React core and hooks for state management
import React, { useState } from 'react';
// React Router for navigation
import { Link, useNavigate } from 'react-router-dom';
// Bootstrap UI components for form and layout
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
// Icon components for form inputs
import { FaCar, FaUser, FaEnvelope, FaLock, FaPhone, FaEye, FaEyeSlash } from 'react-icons/fa';
// Toast notifications for user feedback
import { toast } from 'react-toastify';
// Auth context hook for registration
import { useAuth } from '../context/AuthContext';

/**
 * Register Component
 * User registration form with validation
 * Auto-logs in user upon successful registration
 */
const Register = () => {
  // Form data state for all registration fields
  const [formData, setFormData] = useState({
    name: '',            // User's full name
    email: '',           // Email address
    password: '',        // Password
    confirmPassword: '', // Password confirmation
    phone: ''            // Optional phone number
  });
  // Toggle for password visibility
  const [showPassword, setShowPassword] = useState(false);
  // Loading state during registration
  const [loading, setLoading] = useState(false);
  // Error message state for validation/submission errors
  const [error, setError] = useState('');

  // Get register function and auth state from context
  const { register, isAuthenticated } = useAuth();
  // Hook for programmatic navigation
  const navigate = useNavigate();

  // Effect to redirect if user is already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
   * Validates input and attempts registration
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength (minimum 6 characters)
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // Attempt registration with form data
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      });
      toast.success('Registration successful! Welcome to DriveEase!');
      // Redirect to home page
      navigate('/', { replace: true });
    } catch (err) {
      // Extract error message from response
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Full-height container with gradient background
    <div className="min-vh-100 d-flex align-items-center py-5" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
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

            {/* Registration card */}
            <Card className="shadow-lg border-0">
              <Card.Body className="p-4 p-md-5">
                {/* Card header */}
                <h3 className="text-center mb-4">Create Account</h3>
                <p className="text-muted text-center mb-4">
                  Join DriveEase and start your journey
                </p>

                {/* Error alert - shown when validation/registration fails */}
                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                {/* Registration form */}
                <Form onSubmit={handleSubmit}>
                  {/* Full name input field */}
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FaUser className="text-muted" />
                      </span>
                      <Form.Control
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="border-start-0"
                      />
                    </div>
                  </Form.Group>

                  {/* Email input field */}
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <div className="input-group">
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

                  {/* Phone input field (optional) */}
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number (Optional)</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FaPhone className="text-muted" />
                      </span>
                      <Form.Control
                        type="tel"
                        name="phone"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={handleChange}
                        className="border-start-0"
                      />
                    </div>
                  </Form.Group>

                  {/* Password input field */}
                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FaLock className="text-muted" />
                      </span>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                        className="border-start-0 border-end-0"
                      />
                      {/* Password visibility toggle */}
                      <button
                        type="button"
                        className="input-group-text bg-light border-start-0"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? <FaEyeSlash className="text-muted" /> : <FaEye className="text-muted" />}
                      </button>
                    </div>
                    {/* Password requirements hint */}
                    <Form.Text className="text-muted">
                      Must be at least 6 characters with one number
                    </Form.Text>
                  </Form.Group>

                  {/* Confirm password input field */}
                  <Form.Group className="mb-4">
                    <Form.Label>Confirm Password</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FaLock className="text-muted" />
                      </span>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="border-start-0"
                      />
                    </div>
                  </Form.Group>

                  {/* Submit button */}
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 py-2 mb-3"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </Form>

                {/* Sign in link */}
                <div className="text-center">
                  <p className="text-muted mb-0">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary text-decoration-none fw-semibold">
                      Sign In
                    </Link>
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

// Export Register component
export default Register;
