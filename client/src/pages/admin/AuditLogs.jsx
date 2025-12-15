// ============================================
// AUDIT LOGS PAGE COMPONENT
// Admin interface for viewing system activity and user action logs
// ============================================

// React core with useState for state management and useEffect for data fetching
import React, { useState, useEffect } from 'react';
// Bootstrap components for layout, tables, forms, and loading indicators
import {
  Container, Card, Table, Badge, Form, Row, Col,
  Spinner, InputGroup, Button
} from 'react-bootstrap';
// Icon components for search, filter, and resource type indicators
import {
  FaSearch, FaHistory, FaFilter, FaUser, FaCar,
  FaCalendarCheck, FaSignInAlt, FaCreditCard, FaStar
} from 'react-icons/fa';
// Toast notifications for user feedback
import { toast } from 'react-toastify';
// Admin API service for fetching audit log data
import { adminAPI } from '../../services/api';
// Admin sidebar navigation component
import AdminSidebar from '../../components/admin/AdminSidebar';

// AuditLogs component - displays system activity tracking logs
const AuditLogs = () => {
  // Array to store all audit logs from the database
  const [logs, setLogs] = useState([]);
  // Loading state while fetching logs
  const [loading, setLoading] = useState(true);
  // Search term for filtering logs
  const [searchTerm, setSearchTerm] = useState('');
  // Resource type filter (auth, user, car, booking, payment, review)
  const [resourceFilter, setResourceFilter] = useState('all');
  // Action type filter (LOGIN, CREATE, UPDATE, DELETE, etc.)
  const [actionFilter, setActionFilter] = useState('all');
  // Pagination state with current page, total pages, and total count
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });

  // Fetch logs when page, resource filter, or action filter changes
  useEffect(() => {
    fetchLogs();
  }, [pagination.page, resourceFilter, actionFilter]);

  // Fetches audit logs from the admin API with optional filters
  // Updates logs array and pagination state
  const fetchLogs = async () => {
    try {
      const params = {
        page: pagination.page,
        limit: 20
      };
      // Add resource filter if not showing all
      if (resourceFilter !== 'all') {
        params.resource = resourceFilter;
      }
      // Add action filter if not showing all
      if (actionFilter !== 'all') {
        params.action = actionFilter;
      }
      const response = await adminAPI.getAuditLogs(params);
      setLogs(response.data.data.logs);
      setPagination(prev => ({
        ...prev,
        pages: response.data.pagination?.pages || 1,
        total: response.data.results || 0
      }));
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Error loading audit logs');
    } finally {
      setLoading(false);
    }
  };

  // Returns the appropriate icon component based on resource type
  // Used to visually distinguish different types of activities
  const getResourceIcon = (resource) => {
    // Mapping of resource types to icon components
    const icons = {
      auth: FaSignInAlt,       // Login/logout activities
      user: FaUser,            // User management
      car: FaCar,              // Car operations
      booking: FaCalendarCheck,// Booking activities
      payment: FaCreditCard,   // Payment transactions
      review: FaStar           // Review submissions
    };
    const Icon = icons[resource] || FaHistory;
    return <Icon />;
  };

  // Returns a colored badge based on action type
  // Different colors help quickly identify the type of action
  const getActionBadge = (action) => {
    // Color mapping for different action types
    const colors = {
      LOGIN: 'success',       // Green for login
      LOGOUT: 'secondary',    // Gray for logout
      REGISTER: 'primary',    // Blue for registration
      CREATE: 'success',      // Green for create
      UPDATE: 'warning',      // Yellow for update
      DELETE: 'danger',       // Red for delete
      VIEW: 'info',           // Light blue for view
      CANCEL: 'danger',       // Red for cancel
      PAYMENT: 'success'      // Green for payment
    };

    // Extract the action type prefix (e.g., "CREATE" from "CREATE_BOOKING")
    const actionType = action.split('_')[0];
    return (
      <Badge bg={colors[actionType] || 'secondary'} className="text-uppercase">
        {action.replace(/_/g, ' ')}
      </Badge>
    );
  };

  // Filters logs based on search term
  // Searches in user name, email, action, and details
  const filteredLogs = logs.filter(log => {
    const searchStr = `${log.user?.name} ${log.user?.email} ${log.action} ${log.details}`
      .toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  // Formats a timestamp into separate date and time strings
  // Used for displaying timestamps in two-line format
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  // Show loading spinner while fetching data
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
          {/* Page header with title and description */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1">Audit Logs</h2>
              <p className="text-muted mb-0">Track all system activities and user actions</p>
            </div>
          </div>

          {/* Audit Logs Table Card */}
          <Card>
            {/* Search and filter controls in card header */}
            <Card.Header className="bg-white">
              <Row className="g-3 align-items-center">
                {/* Search input */}
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text className="bg-light">
                      <FaSearch className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                {/* Resource type filter dropdown */}
                <Col md={3}>
                  <InputGroup>
                    <InputGroup.Text className="bg-light">
                      <FaFilter className="text-muted" />
                    </InputGroup.Text>
                    <Form.Select
                      value={resourceFilter}
                      onChange={(e) => {
                        setResourceFilter(e.target.value);
                        setPagination(prev => ({ ...prev, page: 1 }));
                      }}
                    >
                      <option value="all">All Resources</option>
                      <option value="auth">Authentication</option>
                      <option value="user">Users</option>
                      <option value="car">Cars</option>
                      <option value="booking">Bookings</option>
                      <option value="payment">Payments</option>
                      <option value="review">Reviews</option>
                    </Form.Select>
                  </InputGroup>
                </Col>
                {/* Action type filter dropdown */}
                <Col md={3}>
                  <Form.Select
                    value={actionFilter}
                    onChange={(e) => {
                      setActionFilter(e.target.value);
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                  >
                    <option value="all">All Actions</option>
                    <option value="LOGIN">Login</option>
                    <option value="REGISTER">Register</option>
                    <option value="CREATE">Create</option>
                    <option value="UPDATE">Update</option>
                    <option value="DELETE">Delete</option>
                    <option value="VIEW">View</option>
                  </Form.Select>
                </Col>
                {/* Total entries count display */}
                <Col md={2} className="text-md-end">
                  <span className="text-muted small">
                    {pagination.total} entries
                  </span>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body className="p-0">
              {/* Audit logs table */}
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th style={{ width: '150px' }}>Timestamp</th>
                    <th>User</th>
                    <th>Resource</th>
                    <th>Action</th>
                    <th>Details</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Render filtered logs or empty state */}
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => {
                      const { date, time } = formatTimestamp(log.createdAt);
                      return (
                        <tr key={log._id}>
                          {/* Timestamp in date/time format */}
                          <td>
                            <small>
                              <div className="fw-semibold">{date}</div>
                              <div className="text-muted">{time}</div>
                            </small>
                          </td>
                          {/* User info with avatar or System indicator */}
                          <td>
                            {log.user ? (
                              <div className="d-flex align-items-center">
                                {/* User avatar with initial */}
                                <div
                                  className="avatar-sm bg-primary bg-opacity-10 rounded-circle me-2 d-flex align-items-center justify-content-center"
                                  style={{ width: '32px', height: '32px' }}
                                >
                                  <span className="text-primary fw-bold small">
                                    {log.user.name?.charAt(0)?.toUpperCase() || 'U'}
                                  </span>
                                </div>
                                <div>
                                  <p className="mb-0 small fw-semibold">{log.user.name}</p>
                                  <small className="text-muted">{log.user.email}</small>
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted">System</span>
                            )}
                          </td>
                          {/* Resource type with icon */}
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="me-2 text-muted">
                                {getResourceIcon(log.resource)}
                              </span>
                              <span className="text-capitalize">{log.resource}</span>
                            </div>
                          </td>
                          {/* Action badge */}
                          <td>{getActionBadge(log.action)}</td>
                          {/* Details - truncated with ellipsis */}
                          <td>
                            <small className="text-muted" style={{ maxWidth: '200px', display: 'block' }}>
                              {typeof log.details === 'object'
                                ? JSON.stringify(log.details).substring(0, 50) + '...'
                                : log.details?.substring(0, 50) || 'N/A'}
                            </small>
                          </td>
                          {/* IP Address in monospace font */}
                          <td>
                            <code className="small">{log.ipAddress || 'N/A'}</code>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        <FaHistory size={32} className="mb-2" />
                        <p className="mb-0">No audit logs found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
            {/* Pagination controls */}
            {pagination.pages > 1 && (
              <Card.Footer className="bg-white">
                <div className="d-flex justify-content-center gap-2">
                  {/* Previous page button */}
                  <Button
                    variant="outline-primary"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Previous
                  </Button>
                  {/* Current page indicator */}
                  <span className="align-self-center">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  {/* Next page button */}
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

          {/* Action Legend Card - explains badge colors */}
          <Card className="mt-4">
            <Card.Body>
              <h6 className="mb-3">Action Legend</h6>
              <div className="d-flex flex-wrap gap-3">
                <div><Badge bg="success">LOGIN / CREATE</Badge> - Successful operations</div>
                <div><Badge bg="warning">UPDATE</Badge> - Modification operations</div>
                <div><Badge bg="danger">DELETE / CANCEL</Badge> - Removal operations</div>
                <div><Badge bg="info">VIEW</Badge> - Read-only access</div>
                <div><Badge bg="primary">REGISTER</Badge> - New registrations</div>
              </div>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </div>
  );
};

// Export the AuditLogs component as the default export
export default AuditLogs;
