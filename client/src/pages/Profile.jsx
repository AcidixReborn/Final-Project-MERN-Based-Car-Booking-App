import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Tab, Nav } from 'react-bootstrap';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

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

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success('Password changed successfully');
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
      <div className="page-header">
        <Container>
          <h1 className="mb-2">My Profile</h1>
          <p className="opacity-75 mb-0">Manage your account settings</p>
        </Container>
      </div>

      <Container className="py-4">
        <Row>
          <Col lg={4} className="mb-4">
            <Card>
              <Card.Body className="text-center p-4">
                <div
                  className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}
                >
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <h4 className="mb-1">{user?.name}</h4>
                <p className="text-muted mb-2">{user?.email}</p>
                <span className={`badge bg-${user?.role === 'admin' ? 'danger' : 'primary'}`}>
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </span>
                <hr />
                <p className="text-muted small mb-0">
                  Member since {new Date(user?.createdAt).toLocaleDateString()}
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8}>
            <Card>
              <Card.Body className="p-4">
                <Tab.Container defaultActiveKey="profile">
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
                    <Tab.Pane eventKey="profile">
                      <Form onSubmit={handleProfileSubmit}>
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

                        <Button variant="primary" type="submit" disabled={loading}>
                          <FaSave className="me-2" />
                          {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </Form>
                    </Tab.Pane>

                    <Tab.Pane eventKey="security">
                      <Form onSubmit={handlePasswordSubmit}>
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

export default Profile;
