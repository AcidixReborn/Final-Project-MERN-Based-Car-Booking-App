import React, { useState, useEffect } from 'react';
import {
  Container, Card, Table, Button, Badge, Modal,
  Form, Row, Col, Spinner, InputGroup
} from 'react-bootstrap';
import {
  FaSearch, FaEye, FaCalendarAlt, FaFilter
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { adminAPI, bookingsAPI } from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updating, setUpdating] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, pagination.page]);

  const fetchBookings = async () => {
    try {
      const params = {
        page: pagination.page,
        limit: 10
      };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const response = await adminAPI.getAllBookings(params);
      setBookings(response.data.data.bookings);
      setPagination(prev => ({
        ...prev,
        pages: response.data.pagination?.pages || 1,
        total: response.data.results || 0
      }));
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Error loading bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'primary',
      active: 'success',
      completed: 'info',
      cancelled: 'danger'
    };
    return <Badge bg={colors[status] || 'secondary'}>{status}</Badge>;
  };

  const getPaymentBadge = (status) => {
    const colors = {
      pending: 'warning',
      paid: 'success',
      refunded: 'info',
      failed: 'danger'
    };
    return <Badge bg={colors[status] || 'secondary'}>{status}</Badge>;
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    setUpdating(true);
    try {
      await bookingsAPI.updateStatus(bookingId, newStatus);
      toast.success('Booking status updated');
      fetchBookings();
      if (selectedBooking?._id === bookingId) {
        setSelectedBooking(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating status');
    } finally {
      setUpdating(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const searchStr = `${booking.user?.name} ${booking.user?.email} ${booking.car?.brand} ${booking.car?.model}`
      .toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

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
              <h2 className="mb-1">Manage Bookings</h2>
              <p className="text-muted mb-0">View and manage all customer bookings</p>
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
                      placeholder="Search by customer or car..."
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
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPagination(prev => ({ ...prev, page: 1 }));
                      }}
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </Form.Select>
                  </InputGroup>
                </Col>
                <Col md={5} className="text-md-end">
                  <span className="text-muted">
                    Showing {filteredBookings.length} of {pagination.total} bookings
                  </span>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Car</th>
                    <th>Dates</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                      <tr key={booking._id}>
                        <td>
                          <small className="text-muted font-monospace">
                            {booking._id.slice(-8).toUpperCase()}
                          </small>
                        </td>
                        <td>
                          <div>
                            <p className="mb-0 fw-semibold">{booking.user?.name || 'Unknown'}</p>
                            <small className="text-muted">{booking.user?.email}</small>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={booking.car?.images?.[0] || 'https://via.placeholder.com/40x30?text=Car'}
                              alt={`${booking.car?.brand} ${booking.car?.model}`}
                              className="rounded me-2"
                              style={{ width: '40px', height: '30px', objectFit: 'cover' }}
                            />
                            <span>{booking.car?.brand} {booking.car?.model}</span>
                          </div>
                        </td>
                        <td>
                          <small>
                            {new Date(booking.startDate).toLocaleDateString()} -<br />
                            {new Date(booking.endDate).toLocaleDateString()}
                          </small>
                        </td>
                        <td className="fw-semibold">${booking.totalPrice?.toFixed(2)}</td>
                        <td>{getStatusBadge(booking.status)}</td>
                        <td>{getPaymentBadge(booking.paymentStatus)}</td>
                        <td>
                          <Button
                            variant="light"
                            size="sm"
                            onClick={() => handleViewDetails(booking)}
                          >
                            <FaEye />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-muted">
                        <FaCalendarAlt size={32} className="mb-2" />
                        <p className="mb-0">No bookings found</p>
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

        {/* Booking Details Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Booking Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedBooking && (
              <>
                <Row className="mb-4">
                  <Col md={6}>
                    <h6 className="text-muted mb-2">Customer Information</h6>
                    <Card className="bg-light">
                      <Card.Body>
                        <p className="mb-1"><strong>Name:</strong> {selectedBooking.user?.name}</p>
                        <p className="mb-1"><strong>Email:</strong> {selectedBooking.user?.email}</p>
                        <p className="mb-0"><strong>Phone:</strong> {selectedBooking.user?.phone || 'N/A'}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <h6 className="text-muted mb-2">Car Information</h6>
                    <Card className="bg-light">
                      <Card.Body>
                        <div className="d-flex align-items-center">
                          <img
                            src={selectedBooking.car?.images?.[0] || 'https://via.placeholder.com/80x60?text=Car'}
                            alt={`${selectedBooking.car?.brand} ${selectedBooking.car?.model}`}
                            className="rounded me-3"
                            style={{ width: '80px', height: '60px', objectFit: 'cover' }}
                          />
                          <div>
                            <p className="mb-1 fw-semibold">
                              {selectedBooking.car?.brand} {selectedBooking.car?.model}
                            </p>
                            <p className="mb-0 text-muted small">
                              {selectedBooking.car?.year} | {selectedBooking.car?.type}
                            </p>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Row className="mb-4">
                  <Col md={6}>
                    <h6 className="text-muted mb-2">Booking Period</h6>
                    <Card className="bg-light">
                      <Card.Body>
                        <Row>
                          <Col>
                            <small className="text-muted">Pick-up</small>
                            <p className="mb-0 fw-semibold">
                              {new Date(selectedBooking.startDate).toLocaleDateString()}
                            </p>
                            <small>{selectedBooking.pickupLocation}</small>
                          </Col>
                          <Col>
                            <small className="text-muted">Return</small>
                            <p className="mb-0 fw-semibold">
                              {new Date(selectedBooking.endDate).toLocaleDateString()}
                            </p>
                            <small>{selectedBooking.dropoffLocation}</small>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <h6 className="text-muted mb-2">Status</h6>
                    <Card className="bg-light">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span>Booking Status:</span>
                          {getStatusBadge(selectedBooking.status)}
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span>Payment Status:</span>
                          {getPaymentBadge(selectedBooking.paymentStatus)}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <h6 className="text-muted mb-2">Pricing Breakdown</h6>
                <Card className="bg-light mb-4">
                  <Card.Body>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Base Rate ({selectedBooking.pricing?.totalDays} days)</span>
                      <span>${selectedBooking.pricing?.basePrice?.toFixed(2)}</span>
                    </div>
                    {selectedBooking.extras?.length > 0 && (
                      selectedBooking.extras.map((extra, index) => (
                        <div key={index} className="d-flex justify-content-between mb-2 text-muted">
                          <span>{extra.name}</span>
                          <span>${(extra.pricePerDay * selectedBooking.pricing?.totalDays).toFixed(2)}</span>
                        </div>
                      ))
                    )}
                    <div className="d-flex justify-content-between mb-2">
                      <span>Tax</span>
                      <span>${selectedBooking.pricing?.taxAmount?.toFixed(2)}</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between fw-bold">
                      <span>Total</span>
                      <span className="text-primary">${selectedBooking.totalPrice?.toFixed(2)}</span>
                    </div>
                  </Card.Body>
                </Card>

                {selectedBooking.notes && (
                  <div className="mb-3">
                    <h6 className="text-muted mb-2">Notes</h6>
                    <p className="bg-light p-3 rounded">{selectedBooking.notes}</p>
                  </div>
                )}

                <h6 className="text-muted mb-2">Update Status</h6>
                <div className="d-flex flex-wrap gap-2">
                  {['pending', 'confirmed', 'active', 'completed', 'cancelled'].map((status) => (
                    <Button
                      key={status}
                      variant={selectedBooking.status === status ? 'primary' : 'outline-primary'}
                      size="sm"
                      className="text-capitalize"
                      onClick={() => handleStatusChange(selectedBooking._id, status)}
                      disabled={updating || selectedBooking.status === status}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
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

export default ManageBookings;
