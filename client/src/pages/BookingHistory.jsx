// ============================================
// BOOKING HISTORY PAGE COMPONENT
// Displays user's past and current bookings with management options
// ============================================

// React core with useState for state management and useEffect for data fetching
import React, { useState, useEffect } from 'react';
// Link component for navigation to other pages
import { Link } from 'react-router-dom';
// Bootstrap components for layout, cards, navigation tabs, and modals
import { Container, Row, Col, Card, Button, Badge, Tab, Nav, Modal } from 'react-bootstrap';
// Icon components for visual elements throughout the page
import { FaCalendarAlt, FaCar, FaEye, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
// Toast notifications for user feedback
import { toast } from 'react-toastify';
// API service for booking-related HTTP requests
import { bookingsAPI } from '../services/api';
// Loading component for displaying loading states
import Loading from '../components/common/Loading';

// BookingHistory component - displays all user bookings with filtering and details
const BookingHistory = () => {
  // Array to store fetched bookings from the API
  const [bookings, setBookings] = useState([]);
  // Loading state while fetching bookings from server
  const [loading, setLoading] = useState(true);
  // Currently selected booking for viewing in the modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  // Controls visibility of the booking details modal
  const [showModal, setShowModal] = useState(false);
  // Loading state during booking cancellation process
  const [cancelling, setCancelling] = useState(false);

  // Fetch bookings when component mounts
  useEffect(() => {
    fetchBookings();
  }, []);

  // Fetches user's bookings from the API
  // Sets the bookings state with the response data
  const fetchBookings = async () => {
    try {
      const response = await bookingsAPI.getMyBookings();
      setBookings(response.data.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Error fetching bookings');
    } finally {
      setLoading(false);
    }
  };

  // Opens the booking details modal with the selected booking
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  // Handles booking cancellation with confirmation dialog
  // Refreshes booking list and closes modal on success
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    setCancelling(true);
    try {
      await bookingsAPI.cancel(bookingId, 'Cancelled by user');
      toast.success('Booking cancelled successfully');
      fetchBookings();
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error cancelling booking');
    } finally {
      setCancelling(false);
    }
  };

  // Returns a colored badge based on booking status
  // Maps status values to Bootstrap color variants
  const getStatusBadge = (status) => {
    // Color mapping for different booking statuses
    const colors = {
      pending: 'warning',     // Yellow for pending
      confirmed: 'primary',   // Blue for confirmed
      active: 'success',      // Green for active rentals
      completed: 'info',      // Light blue for completed
      cancelled: 'danger'     // Red for cancelled
    };
    return <Badge bg={colors[status] || 'secondary'}>{status}</Badge>;
  };

  // Filters bookings array based on selected tab
  // Returns all, active (pending/confirmed/active), completed, or cancelled bookings
  const filterBookings = (status) => {
    if (status === 'all') return bookings;
    // 'active' tab shows pending, confirmed, and currently active bookings
    if (status === 'active') return bookings.filter(b => ['pending', 'confirmed', 'active'].includes(b.status));
    return bookings.filter(b => b.status === status);
  };

  // Show full-screen loading spinner while fetching data
  if (loading) return <Loading fullScreen />;

  return (
    <>
      {/* Page header with title and description */}
      <div className="page-header">
        <Container>
          <h1 className="mb-2">My Bookings</h1>
          <p className="opacity-75 mb-0">View and manage your car rental bookings</p>
        </Container>
      </div>

      <Container className="py-4">
        {/* Tab container for filtering bookings by status */}
        <Tab.Container defaultActiveKey="all">
          {/* Tab navigation pills showing count for each category */}
          <Nav variant="pills" className="mb-4">
            <Nav.Item>
              <Nav.Link eventKey="all">All ({bookings.length})</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="active">Active ({filterBookings('active').length})</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="completed">Completed ({filterBookings('completed').length})</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="cancelled">Cancelled ({filterBookings('cancelled').length})</Nav.Link>
            </Nav.Item>
          </Nav>

          {/* Tab content - renders booking cards for each tab */}
          <Tab.Content>
            {['all', 'active', 'completed', 'cancelled'].map((tab) => (
              <Tab.Pane key={tab} eventKey={tab}>
                {/* Empty state when no bookings match the filter */}
                {filterBookings(tab).length === 0 ? (
                  <Card className="text-center py-5">
                    <Card.Body>
                      <FaCalendarAlt size={48} className="text-muted mb-3" />
                      <h5>No Bookings Found</h5>
                      <p className="text-muted">
                        {tab === 'all'
                          ? "You haven't made any bookings yet."
                          : `No ${tab} bookings found.`}
                      </p>
                      <Button as={Link} to="/cars" variant="primary">
                        Browse Cars
                      </Button>
                    </Card.Body>
                  </Card>
                ) : (
                  /* Grid of booking cards */
                  <Row className="g-4">
                    {filterBookings(tab).map((booking) => (
                      <Col md={6} lg={4} key={booking._id}>
                        <Card className="h-100">
                          <Card.Body>
                            {/* Card header with car name and status badge */}
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div>
                                <h5 className="mb-1">
                                  {booking.car?.brand} {booking.car?.model}
                                </h5>
                                <p className="text-muted small mb-0">{booking.car?.year}</p>
                              </div>
                              {getStatusBadge(booking.status)}
                            </div>

                            {/* Booking dates and pickup location */}
                            <div className="mb-3">
                              <div className="d-flex align-items-center text-muted small mb-1">
                                <FaCalendarAlt className="me-2" />
                                {new Date(booking.startDate).toLocaleDateString()} -
                                {new Date(booking.endDate).toLocaleDateString()}
                              </div>
                              <div className="d-flex align-items-center text-muted small">
                                <FaMapMarkerAlt className="me-2" />
                                {booking.pickupLocation}
                              </div>
                            </div>

                            {/* Total price display */}
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <span className="text-muted">Total</span>
                              <span className="fw-bold text-primary">${booking.totalPrice?.toFixed(2)}</span>
                            </div>

                            {/* Action buttons - View details and Cancel */}
                            <div className="d-flex gap-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="flex-grow-1"
                                onClick={() => handleViewDetails(booking)}
                              >
                                <FaEye className="me-1" /> Details
                              </Button>
                              {/* Only show cancel button for pending or confirmed bookings */}
                              {['pending', 'confirmed'].includes(booking.status) && (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleCancelBooking(booking._id)}
                                >
                                  <FaTimes />
                                </Button>
                              )}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </Tab.Pane>
            ))}
          </Tab.Content>
        </Tab.Container>
      </Container>

      {/* Booking Details Modal - shows full booking information */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Booking Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <>
              {/* Car image and basic info section */}
              <Row className="mb-4">
                <Col md={4}>
                  <img
                    src={selectedBooking.car?.images?.[0] || 'https://via.placeholder.com/300x200?text=Car'}
                    alt={`${selectedBooking.car?.brand} ${selectedBooking.car?.model}`}
                    className="img-fluid rounded"
                  />
                </Col>
                <Col md={8}>
                  <h4>{selectedBooking.car?.brand} {selectedBooking.car?.model}</h4>
                  <p className="text-muted">{selectedBooking.car?.year} | {selectedBooking.car?.type}</p>
                  {/* Booking status badge */}
                  <div className="mb-2">
                    <strong>Status: </strong>
                    {getStatusBadge(selectedBooking.status)}
                  </div>
                  {/* Payment status badge */}
                  <div className="mb-2">
                    <strong>Payment: </strong>
                    <Badge bg={selectedBooking.paymentStatus === 'paid' ? 'success' : 'warning'}>
                      {selectedBooking.paymentStatus}
                    </Badge>
                  </div>
                </Col>
              </Row>

              {/* Pick-up and Return date/location cards */}
              <Row className="mb-3">
                {/* Pick-up details card */}
                <Col md={6}>
                  <Card className="bg-light">
                    <Card.Body>
                      <h6 className="text-muted mb-2">Pick-up</h6>
                      <p className="mb-1 fw-semibold">
                        {new Date(selectedBooking.startDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-muted mb-0">{selectedBooking.pickupLocation}</p>
                    </Card.Body>
                  </Card>
                </Col>
                {/* Return details card */}
                <Col md={6}>
                  <Card className="bg-light">
                    <Card.Body>
                      <h6 className="text-muted mb-2">Return</h6>
                      <p className="mb-1 fw-semibold">
                        {new Date(selectedBooking.endDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-muted mb-0">{selectedBooking.dropoffLocation}</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Pricing breakdown card */}
              <Card>
                <Card.Body>
                  <h6 className="mb-3">Pricing Breakdown</h6>
                  {/* Base rental rate */}
                  <div className="d-flex justify-content-between mb-2">
                    <span>Base Rate ({selectedBooking.pricing?.totalDays} days)</span>
                    <span>${selectedBooking.pricing?.basePrice?.toFixed(2)}</span>
                  </div>
                  {/* Selected extras with their costs */}
                  {selectedBooking.extras?.length > 0 && (
                    <>
                      {selectedBooking.extras.map((extra, index) => (
                        <div key={index} className="d-flex justify-content-between mb-2 text-muted">
                          <span>{extra.name}</span>
                          <span>${(extra.pricePerDay * selectedBooking.pricing?.totalDays).toFixed(2)}</span>
                        </div>
                      ))}
                    </>
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

              {/* Optional notes section */}
              {selectedBooking.notes && (
                <div className="mt-3">
                  <h6>Notes</h6>
                  <p className="text-muted">{selectedBooking.notes}</p>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {/* Cancel booking button - only for pending/confirmed bookings */}
          {selectedBooking && ['pending', 'confirmed'].includes(selectedBooking.status) && (
            <Button
              variant="danger"
              onClick={() => handleCancelBooking(selectedBooking._id)}
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Booking'}
            </Button>
          )}
          {/* Close modal button */}
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

// Export the BookingHistory component as the default export
export default BookingHistory;
