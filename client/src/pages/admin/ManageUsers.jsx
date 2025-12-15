import React, { useState, useEffect } from 'react';
import {
  Container, Card, Table, Button, Badge, Modal,
  Form, Row, Col, Spinner, InputGroup
} from 'react-bootstrap';
import {
  FaSearch, FaEye, FaUserShield, FaUser, FaBan,
  FaCheck, FaUsers
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { adminAPI } from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [updating, setUpdating] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, roleFilter]);

  const fetchUsers = async () => {
    try {
      const params = {
        page: pagination.page,
        limit: 10
      };
      if (roleFilter !== 'all') {
        params.role = roleFilter;
      }
      const response = await adminAPI.getUsers(params);
      setUsers(response.data.data.users);
      setPagination(prev => ({
        ...prev,
        pages: response.data.pagination?.pages || 1,
        total: response.data.results || 0
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

    setUpdating(true);
    try {
      await adminAPI.updateUser(userId, { role: newRole });
      toast.success('User role updated successfully');
      fetchUsers();
      if (selectedUser?._id === userId) {
        setSelectedUser(prev => ({ ...prev, role: newRole }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating user role');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const action = newStatus === 'suspended' ? 'suspend' : 'activate';

    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    setUpdating(true);
    try {
      await adminAPI.updateUser(userId, { status: newStatus });
      toast.success(`User ${action}d successfully`);
      fetchUsers();
      if (selectedUser?._id === userId) {
        setSelectedUser(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating user status');
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchStr = `${user.name} ${user.email}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  const getRoleBadge = (role) => {
    return (
      <Badge bg={role === 'admin' ? 'danger' : 'primary'}>
        {role === 'admin' ? <FaUserShield className="me-1" /> : <FaUser className="me-1" />}
        {role}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'success',
      suspended: 'danger',
      pending: 'warning'
    };
    return <Badge bg={colors[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content d-flex justify-content-center align-items-center">
          <Spinner animation="border" variant="primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <Container fluid>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1">Manage Users</h2>
              <p className="text-muted mb-0">View and manage registered users</p>
            </div>
          </div>

          <Card>
            <Card.Header className="bg-white">
              <Row className="g-3 align-items-center">
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text className="bg-light">
                      <FaSearch className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                  >
                    <option value="all">All Roles</option>
                    <option value="user">Users Only</option>
                    <option value="admin">Admins Only</option>
                  </Form.Select>
                </Col>
                <Col md={5} className="text-md-end">
                  <span className="text-muted">
                    {pagination.total} total users
                  </span>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Bookings</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar-sm bg-primary bg-opacity-10 rounded-circle me-3 d-flex align-items-center justify-content-center"
                              style={{ width: '40px', height: '40px' }}>
                              <span className="text-primary fw-bold">
                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="mb-0 fw-semibold">{user.name}</p>
                              <small className="text-muted">{user.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>{getRoleBadge(user.role)}</td>
                        <td>{getStatusBadge(user.status || 'active')}</td>
                        <td>
                          <small>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </small>
                        </td>
                        <td>{user.bookingsCount || 0}</td>
                        <td>
                          <Button
                            variant="light"
                            size="sm"
                            onClick={() => handleViewUser(user)}
                          >
                            <FaEye />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        <FaUsers size={32} className="mb-2" />
                        <p className="mb-0">No users found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
            {pagination.pages > 1 && (
              <Card.Footer className="bg-white">
                <div className="d-flex justify-content-center gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Previous
                  </Button>
                  <span className="align-self-center">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              </Card.Footer>
            )}
          </Card>
        </Container>

        {/* User Details Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>User Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedUser && (
              <>
                <Row className="mb-4">
                  <Col md={4} className="text-center">
                    <div
                      className="avatar-lg bg-primary bg-opacity-10 rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                      style={{ width: '100px', height: '100px' }}
                    >
                      <span className="text-primary fw-bold" style={{ fontSize: '2.5rem' }}>
                        {selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <h5 className="mb-1">{selectedUser.name}</h5>
                    <p className="text-muted mb-2">{selectedUser.email}</p>
                    {getRoleBadge(selectedUser.role)}
                  </Col>
                  <Col md={8}>
                    <Card className="bg-light">
                      <Card.Body>
                        <Row className="g-3">
                          <Col md={6}>
                            <small className="text-muted">Phone</small>
                            <p className="mb-0 fw-semibold">{selectedUser.phone || 'Not provided'}</p>
                          </Col>
                          <Col md={6}>
                            <small className="text-muted">Status</small>
                            <p className="mb-0">{getStatusBadge(selectedUser.status || 'active')}</p>
                          </Col>
                          <Col md={6}>
                            <small className="text-muted">Joined</small>
                            <p className="mb-0 fw-semibold">
                              {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </Col>
                          <Col md={6}>
                            <small className="text-muted">Last Active</small>
                            <p className="mb-0 fw-semibold">
                              {selectedUser.lastLogin
                                ? new Date(selectedUser.lastLogin).toLocaleDateString()
                                : 'Never'
                              }
                            </p>
                          </Col>
                          <Col md={6}>
                            <small className="text-muted">Total Bookings</small>
                            <p className="mb-0 fw-semibold">{selectedUser.bookingsCount || 0}</p>
                          </Col>
                          <Col md={6}>
                            <small className="text-muted">Total Spent</small>
                            <p className="mb-0 fw-semibold">${selectedUser.totalSpent?.toFixed(2) || '0.00'}</p>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Row className="g-3">
                  <Col md={6}>
                    <Card>
                      <Card.Header className="bg-white">
                        <h6 className="mb-0">Change Role</h6>
                      </Card.Header>
                      <Card.Body>
                        <div className="d-flex gap-2">
                          <Button
                            variant={selectedUser.role === 'user' ? 'primary' : 'outline-primary'}
                            className="flex-grow-1"
                            onClick={() => handleRoleChange(selectedUser._id, 'user')}
                            disabled={updating || selectedUser.role === 'user'}
                          >
                            <FaUser className="me-2" />
                            User
                          </Button>
                          <Button
                            variant={selectedUser.role === 'admin' ? 'danger' : 'outline-danger'}
                            className="flex-grow-1"
                            onClick={() => handleRoleChange(selectedUser._id, 'admin')}
                            disabled={updating || selectedUser.role === 'admin'}
                          >
                            <FaUserShield className="me-2" />
                            Admin
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card>
                      <Card.Header className="bg-white">
                        <h6 className="mb-0">Account Status</h6>
                      </Card.Header>
                      <Card.Body>
                        <div className="d-flex gap-2">
                          <Button
                            variant={(selectedUser.status || 'active') === 'active' ? 'success' : 'outline-success'}
                            className="flex-grow-1"
                            onClick={() => handleStatusToggle(selectedUser._id, selectedUser.status || 'active')}
                            disabled={updating || (selectedUser.status || 'active') === 'active'}
                          >
                            <FaCheck className="me-2" />
                            Active
                          </Button>
                          <Button
                            variant={selectedUser.status === 'suspended' ? 'danger' : 'outline-danger'}
                            className="flex-grow-1"
                            onClick={() => handleStatusToggle(selectedUser._id, selectedUser.status || 'active')}
                            disabled={updating || selectedUser.status === 'suspended'}
                          >
                            <FaBan className="me-2" />
                            Suspend
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default ManageUsers;
