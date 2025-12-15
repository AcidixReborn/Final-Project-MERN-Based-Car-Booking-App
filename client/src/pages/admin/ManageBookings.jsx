// ============================================
// MANAGE BOOKINGS PAGE COMPONENT
// Admin interface for viewing and managing all customer bookings
// ============================================

// React core with useState for state management and useEffect for data fetching
import React, { useState, useEffect } from 'react';
// Bootstrap components for layout, tables, forms, modals, and loading indicators
import {
  Container, Card, Table, Button, Badge, Modal,
  Form, Row, Col, Spinner, InputGroup
} from 'react-bootstrap';
// Icon components for search, filter, and visual elements
import {
  FaSearch, FaEye, FaCalendarAlt, FaFilter
} from 'react-icons/fa';
// Toast notifications for user feedback
import { toast } from 'react-toastify';
// API services for booking-related HTTP requests
import { adminAPI, bookingsAPI } from '../../services/api';
// Admin sidebar navigation component
import AdminSidebar from '../../components/admin/AdminSidebar';

// ManageBookings component - allows admins to view and manage all bookings
const ManageBookings = () => {
  // Array to store all bookings from the database
  const [bookings, setBookings] = useState([]);
  // Loading state while fetching bookings
  const [loading, setLoading] = useState(true);
  // Currently selected booking for viewing in modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  // Controls visibility of the booking details modal
  const [showModal, setShowModal] = useState(false);
  // Search term for filtering bookings
  const [searchTerm, setSearchTerm] = useState('');
  // Status filter for displaying specific booking statuses
  const [statusFilter, setStatusFilter] = useState('all');
  // Loading state during status update operations
  const [updating, setUpdating] = useState(false);
  // Pagination state with current page, total pages, and total count
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });

  // Fetch bookings when status filter or page changes
  useEffect(() => {
    fetchBookings();
  }, [statusFilter, pagination.page]);

  // Fetches bookings from the admin API with optional status filter
  // Updates bookings array and pagination state
  const fetchBookings = async () => {
    try {
      const params = {
        page: pagination.page,
        limit: 10
      };
      // Only add status filter if not showing all
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

  // Returns a colored badge based on booking status
  // Maps status values to Bootstrap color variants
  const getStatusBadge = (status) => {
    // Color mapping for different booking statuses
    const colors = {
      pending: 'warning',     // Yellow for pending
      confirmed: 'primary',   // Blue for confirmed
      active: 'success',      // Green for active
      completed: 'info',      // Light blue for completed
      cancelled: 'danger'     // Red for cancelled
    };
    return <Badge bg={colors[status] || 'secondary'}>{status}</Badge>;
  };

  // Returns a colored badge based on payment status
  const getPaymentBadge = (status) => {
    // Color mapping for different payment statuses
    const colors = {
      pending: 'warning',     // Yellow for pending payment
      paid: 'success',        // Green for paid
      refunded: 'info',       // Light blue for refunded
      failed: 'danger'        // Red for failed payment
    };
    return <Badge bg={colors[status] || 'secondary'}>{status}</Badge>;
  };

  // Opens the booking details modal with the selected booking
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  // Handles booking status change via API
  // Updates selected booking and refreshes the list
  const handleStatusChange = async (bookingId, newStatus) => {
    setUpdating(true);
    try {
      await bookingsAPI.updateStatus(bookingId, newStatus);
      toast.success('Booking status updated');
      fetchBookings();
      // Update selected booking status in modal
      if (selectedBooking?._id === bookingId) {
        setSelectedBooking(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating status');
    } finally {
      setUpdating(false);
    }
  };

  // Filters bookings based on search term
  // Searches in customer name, email, car brand, and car model
  const filteredBookings = bookings.filter(booking => {
    const searchStr = `${booking.user?.name} ${booking.user?.email} ${booking.car?.brand} ${booking.car?.model}`
      .toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

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
              <h2 className="mb-1">Manage Bookings</h2>
              <p className="text-muted mb-0">View and manage all customer bookings</p>
            </div>
          </div>

          {/* Bookings Table Card */}
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
                      placeholder="Search by customer or car..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                {/* Status filter dropdown */}
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
                {/* Results count display */}
                <Col md={5} className="text-md-end">
                  <span className="text-muted">
                    Showing {filteredBookings.length} of {pagination.total} bookings
                  </span>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body className="p-0">
              {/* Bookings table */}
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
                  {/* Render filtered bookings or empty state */}
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                      <tr key={booking._id}>
                        {/* Booking ID - shows last 8 characters */}
                        <td>
                          <small className="text-muted font-monospace">
                            {booking._id.slice(-8).toUpperCase()}
                          </small>
                        </td>
                        {/* Customer name and email */}
                        <td>
                          <div>
                            <p className="mb-0 fw-semibold">{booking.user?.name || 'Unknown'}</p>
                            <small className="text-muted">{booking.user?.email}</small>
                          </div>
                        </td>
                        {/* Car info with thumbnail */}
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
                        {/* Booking date range */}
                        <td>
                          <small>
                            {new Date(booking.startDate).toLocaleDateString()} -<br />
                            {new Date(booking.endDate).toLocaleDateString()}
                          </small>
                        </td>
                        {/* Total price */}
                        <td className="fw-semibold">${booking.totalPrice?.toFixed(2)}</td>
                        {/* Booking status badge */}
                        <td>{getStatusBadge(booking.status)}</td>
                        {/* Payment status badge */}
                        <td>{getPaymentBadge(booking.paymentStatus)}</td>
                        {/* View details action button */}
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
        </Container>

        {/* Booking Details Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Booking Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedBooking && (
              <>
                {/* Customer and Car Information Row */}
                <Row className="mb-4">
                  {/* Customer information card */}
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
                  {/* Car information card with image */}
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

                {/* Booking Period and Status Row */}
                <Row className="mb-4">
                  {/* Booking period card with pick-up and return details */}
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
                  {/* Current status card */}
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

                {/* Pricing Breakdown Section */}
                <h6 className="text-muted mb-2">Pricing Breakdown</h6>
                <Card className="bg-light mb-4">
                  <Card.Body>
                    {/* Base rate calculation */}
                    <div className="d-flex justify-content-between mb-2">
                      <span>Base Rate ({selectedBooking.pricing?.totalDays} days)</span>
                      <span>${selectedBooking.pricing?.basePrice?.toFixed(2)}</span>
                    </div>
                    {/* Extras breakdown if any selected */}
                    {selectedBooking.extras?.length > 0 && (
                      selectedBooking.extras.map((extra, index) => (
                        <div key={index} className="d-flex justify-content-between mb-2 text-muted">
                          <span>{extra.name}</span>
                          <span>${(extra.pricePerDay * selectedBooking.pricing?.totalDays).toFixed(2)}</span>
                        </div>
                      ))
                    )}
                    {/* Tax amount */}
                    <div className="d-flex justify-content-between mb-2">
                      <span>Tax</span>
                      <span>${selectedBooking.pricing?.taxAmount?.toFixed(2)}</span>
                    </div>
                    <hr />
                    {/* Total price */}
                    <div className="d-flex justify-content-between fw-bold">
                      <span>Total</span>
                      <span className="text-primary">${selectedBooking.totalPrice?.toFixed(2)}</span>
                    </div>
                  </Card.Body>
                </Card>

                {/* Notes section - only shown if notes exist */}
                {selectedBooking.notes && (
                  <div className="mb-3">
                    <h6 className="text-muted mb-2">Notes</h6>
                    <p className="bg-light p-3 rounded">{selectedBooking.notes}</p>
                  </div>
                )}

                {/* Update Status Section - buttons for changing booking status */}
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

// Export the ManageBookings component as the default export
export default ManageBookings;
