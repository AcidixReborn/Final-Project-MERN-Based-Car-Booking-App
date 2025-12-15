// ============================================
// PROFILE PAGE COMPONENT
// User account settings with profile and password management
// ============================================

// React core library with useState hook for managing form state
import React, { useState } from 'react';
// Bootstrap components for layout and form elements
import { Container, Row, Col, Card, Form, Button, Tab, Nav } from 'react-bootstrap';
// Icon components for visual elements in the profile page
import { FaUser, FaLock, FaEnvelope, FaPhone, FaSave } from 'react-icons/fa';
// Toast notification library for user feedback
import { toast } from 'react-toastify';
// Custom hook for accessing auth context (user data and update methods)
import { useAuth } from '../context/AuthContext';

// Profile component - allows users to manage their account settings
const Profile = () => {
  // Destructure user data and update methods from auth context
  const { user, updateProfile, changePassword } = useAuth();

  // State object for profile form fields (name and phone)
  // Pre-populated with current user data if available
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });

  // State object for password change form fields
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',      // User's current password for verification
    newPassword: '',          // New password to set
    confirmPassword: ''       // Confirmation of new password
  });

  // Loading state to disable buttons during API calls
  const [loading, setLoading] = useState(false);

  // Handles input changes in the profile form
  // Updates the specific field that was modified
  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };

  // Handles input changes in the password form
  // Updates the specific field that was modified
  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  // Handles profile form submission
  // Sends updated profile data to the server
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(profileForm);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  // Handles password change form submission
  // Validates passwords match and meet requirements before sending
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validate that new passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    // Validate minimum password length
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success('Password changed successfully');
      // Clear password form after successful change
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error changing password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Page header section with title and description */}
      <div className="page-header">
        <Container>
          <h1 className="mb-2">My Profile</h1>
          <p className="opacity-75 mb-0">Manage your account settings</p>
        </Container>
      </div>

      <Container className="py-4">
        <Row>
          {/* Left column - User profile card with avatar and basic info */}
          <Col lg={4} className="mb-4">
            <Card>
              <Card.Body className="text-center p-4">
                {/* Avatar circle with user's first initial */}
                <div
                  className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}
                >
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                {/* User name display */}
                <h4 className="mb-1">{user?.name}</h4>
                {/* User email display */}
                <p className="text-muted mb-2">{user?.email}</p>
                {/* Role badge - red for admin, blue for regular user */}
                <span className={`badge bg-${user?.role === 'admin' ? 'danger' : 'primary'}`}>
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </span>
                <hr />
                {/* Account creation date */}
                <p className="text-muted small mb-0">
                  Member since {new Date(user?.createdAt).toLocaleDateString()}
                </p>
              </Card.Body>
            </Card>
          </Col>

          {/* Right column - Tabbed forms for profile and security settings */}
          <Col lg={8}>
            <Card>
              <Card.Body className="p-4">
                {/* Tab container with Profile and Security tabs */}
                <Tab.Container defaultActiveKey="profile">
                  {/* Tab navigation */}
                  <Nav variant="tabs" className="mb-4">
                    <Nav.Item>
                      <Nav.Link eventKey="profile">
                        <FaUser className="me-2" /> Profile
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="security">
                        <FaLock className="me-2" /> Security
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>

                  <Tab.Content>
                    {/* Profile Tab - Name and Phone update form */}
                    <Tab.Pane eventKey="profile">
                      <Form onSubmit={handleProfileSubmit}>
                        {/* Full name input field */}
                        <Form.Group className="mb-3">
                          <Form.Label><FaUser className="me-2" /> Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={profileForm.name}
                            onChange={handleProfileChange}
                            required
                          />
                        </Form.Group>

                        {/* Email field - disabled as it cannot be changed */}
                        <Form.Group className="mb-3">
                          <Form.Label><FaEnvelope className="me-2" /> Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            value={user?.email}
                            disabled
                          />
                          <Form.Text className="text-muted">
                            Email cannot be changed
                          </Form.Text>
                        </Form.Group>

                        {/* Phone number input field */}
                        <Form.Group className="mb-4">
                          <Form.Label><FaPhone className="me-2" /> Phone Number</Form.Label>
                          <Form.Control
                            type="tel"
                            name="phone"
                            value={profileForm.phone}
                            onChange={handleProfileChange}
                            placeholder="Enter your phone number"
                          />
                        </Form.Group>

                        {/* Save changes button */}
                        <Button variant="primary" type="submit" disabled={loading}>
                          <FaSave className="me-2" />
                          {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </Form>
                    </Tab.Pane>

                    {/* Security Tab - Password change form */}
                    <Tab.Pane eventKey="security">
                      <Form onSubmit={handlePasswordSubmit}>
                        {/* Current password field for verification */}
                        <Form.Group className="mb-3">
                          <Form.Label>Current Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            required
                          />
                        </Form.Group>

                        {/* New password field */}
                        <Form.Group className="mb-3">
                          <Form.Label>New Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="newPassword"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            required
                            minLength={6}
                          />
                          <Form.Text className="text-muted">
                            Must be at least 6 characters
                          </Form.Text>
                        </Form.Group>

                        {/* Confirm new password field */}
                        <Form.Group className="mb-4">
                          <Form.Label>Confirm New Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="confirmPassword"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                          />
                        </Form.Group>

                        {/* Change password button */}
                        <Button variant="primary" type="submit" disabled={loading}>
                          <FaLock className="me-2" />
                          {loading ? 'Updating...' : 'Change Password'}
                        </Button>
                      </Form>
                    </Tab.Pane>
                  </Tab.Content>
                </Tab.Container>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

// Export the Profile component as the default export
export default Profile;
