import React, { useState, useEffect } from 'react';
import {
  Container, Card, Table, Badge, Form, Row, Col,
  Spinner, InputGroup, Button
} from 'react-bootstrap';
import {
  FaSearch, FaHistory, FaFilter, FaUser, FaCar,
  FaCalendarCheck, FaSignInAlt, FaCreditCard, FaStar
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { adminAPI } from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, resourceFilter, actionFilter]);

  const fetchLogs = async () => {
    try {
      const params = {
        page: pagination.page,
        limit: 20
      };
      if (resourceFilter !== 'all') {
        params.resource = resourceFilter;
      }
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

  const getResourceIcon = (resource) => {
    const icons = {
      auth: FaSignInAlt,
      user: FaUser,
      car: FaCar,
      booking: FaCalendarCheck,
      payment: FaCreditCard,
      review: FaStar
    };
    const Icon = icons[resource] || FaHistory;
    return <Icon />;
  };

  const getActionBadge = (action) => {
    const colors = {
      LOGIN: 'success',
      LOGOUT: 'secondary',
      REGISTER: 'primary',
      CREATE: 'success',
      UPDATE: 'warning',
      DELETE: 'danger',
      VIEW: 'info',
      CANCEL: 'danger',
      PAYMENT: 'success'
    };

    const actionType = action.split('_')[0];
    return (
      <Badge bg={colors[actionType] || 'secondary'} className="text-uppercase">
        {action.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const filteredLogs = logs.filter(log => {
    const searchStr = `${log.user?.name} ${log.user?.email} ${log.action} ${log.details}`
      .toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
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
              <h2 className="mb-1">Audit Logs</h2>
              <p className="text-muted mb-0">Track all system activities and user actions</p>
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
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
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
                <Col md={2} className="text-md-end">
                  <span className="text-muted small">
                    {pagination.total} entries
                  </span>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body className="p-0">
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
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => {
                      const { date, time } = formatTimestamp(log.timestamp);
                      return (
                        <tr key={log._id}>
                          <td>
                            <small>
                              <div className="fw-semibold">{date}</div>
                              <div className="text-muted">{time}</div>
                            </small>
                          </td>
                          <td>
                            {log.user ? (
                              <div className="d-flex align-items-center">
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
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="me-2 text-muted">
                                {getResourceIcon(log.resource)}
                              </span>
                              <span className="text-capitalize">{log.resource}</span>
                            </div>
                          </td>
                          <td>{getActionBadge(log.action)}</td>
                          <td>
                            <small className="text-muted" style={{ maxWidth: '200px', display: 'block' }}>
                              {typeof log.details === 'object'
                                ? JSON.stringify(log.details).substring(0, 50) + '...'
                                : log.details?.substring(0, 50) || 'N/A'}
                            </small>
                          </td>
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

          {/* Legend */}
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

export default AuditLogs;
