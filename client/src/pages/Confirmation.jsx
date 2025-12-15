// ============================================
// CONFIRMATION PAGE COMPONENT
// Displays booking confirmation details after successful payment
// ============================================

// React core with useState for state management and useEffect for data fetching
import React, { useState, useEffect } from 'react';
// React Router hooks for URL parameters and navigation links
import { useParams, Link } from 'react-router-dom';
// Bootstrap components for layout, cards, and buttons
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
// Icon components for visual elements
import { FaCheckCircle, FaCar, FaCalendarAlt, FaMapMarkerAlt, FaPrint, FaHome } from 'react-icons/fa';
// API service for booking-related HTTP requests
import { bookingsAPI } from '../services/api';
// Loading component for displaying loading states
import Loading from '../components/common/Loading';

// Confirmation component - shows booking details after successful payment
const Confirmation = () => {
  // Extract booking ID from URL parameters
  const { bookingId } = useParams();
  // State for storing the fetched booking details
  const [booking, setBooking] = useState(null);
  // Loading state while fetching booking from server
  const [loading, setLoading] = useState(true);

  // Fetch booking details when component mounts or bookingId changes
  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  // Fetches the booking details from the API using the booking ID
  const fetchBooking = async () => {
    try {
      const response = await bookingsAPI.getById(bookingId);
      setBooking(response.data.data.booking);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while fetching data
  if (loading) return <Loading fullScreen />;
  // Show error message if booking not found
  if (!booking) return <div className="text-center py-5">Booking not found</div>;

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          {/* Main Confirmation Card */}
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5 text-center">
              {/* Success Icon */}
              <div className="mb-4">
                <FaCheckCircle size={80} className="text-success" />
              </div>
              {/* Confirmation Heading */}
              <h2 className="mb-3">Booking Confirmed!</h2>
              <p className="text-muted mb-4">
                Thank you for your booking. Your reservation has been confirmed.
              </p>

              {/* Booking Reference Number Display */}
              <div className="bg-light p-4 rounded mb-4">
                <h5 className="mb-3">Booking Reference</h5>
                {/* Display last 8 characters of booking ID as reference */}
                <h3 className="text-primary mb-0">{booking._id.slice(-8).toUpperCase()}</h3>
              </div>

              {/* Booking Details Grid */}
              <Row className="text-start mb-4">
                {/* Vehicle Information Card */}
                <Col md={6} className="mb-3">
                  <Card className="h-100">
                    <Card.Body>
                      <h6 className="text-muted mb-2"><FaCar className="me-2" /> Vehicle</h6>
                      <h5 className="mb-1">{booking.car?.brand} {booking.car?.model}</h5>
                      <p className="text-muted mb-0">{booking.car?.year} | {booking.car?.type}</p>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Dates Information Card */}
                <Col md={6} className="mb-3">
                  <Card className="h-100">
                    <Card.Body>
                      <h6 className="text-muted mb-2"><FaCalendarAlt className="me-2" /> Dates</h6>
                      <p className="mb-1">
                        <strong>Pick-up:</strong> {new Date(booking.startDate).toLocaleDateString()}
                      </p>
                      <p className="mb-0">
                        <strong>Return:</strong> {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Location Information Card */}
                <Col md={6} className="mb-3">
                  <Card className="h-100">
                    <Card.Body>
                      <h6 className="text-muted mb-2"><FaMapMarkerAlt className="me-2" /> Location</h6>
                      <p className="mb-1">
                        <strong>Pick-up:</strong> {booking.pickupLocation}
                      </p>
                      <p className="mb-0">
                        <strong>Drop-off:</strong> {booking.dropoffLocation}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Payment Summary Card */}
                <Col md={6} className="mb-3">
                  <Card className="h-100">
                    <Card.Body>
                      <h6 className="text-muted mb-2">Payment Summary</h6>
                      <p className="mb-1">
                        <strong>Status:</strong>{' '}
                        {/* Payment status badge - green for paid, yellow for pending */}
                        <span className={`badge bg-${booking.paymentStatus === 'paid' ? 'success' : 'warning'}`}>
                          {booking.paymentStatus}
                        </span>
                      </p>
                      {/* Total price in primary color */}
                      <h4 className="text-primary mb-0">${booking.totalPrice?.toFixed(2)}</h4>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Included Extras Section - only shown if extras were selected */}
              {booking.extras?.length > 0 && (
                <div className="text-start mb-4">
                  <h6 className="text-muted mb-2">Included Extras</h6>
                  <ul className="list-unstyled">
                    {/* List each selected extra with checkmark */}
                    {booking.extras.map((extra, index) => (
                      <li key={index} className="mb-1">
                        <FaCheckCircle className="text-success me-2" />
                        {extra.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="d-flex justify-content-center gap-3">
                {/* Print Confirmation Button */}
                <Button variant="outline-primary" onClick={() => window.print()}>
                  <FaPrint className="me-2" /> Print Confirmation
                </Button>
                {/* View My Bookings Button */}
                <Button as={Link} to="/my-bookings" variant="primary">
                  View My Bookings
                </Button>
                {/* Back to Home Button */}
                <Button as={Link} to="/" variant="outline-secondary">
                  <FaHome className="me-2" /> Back to Home
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Email Confirmation Note */}
          <div className="text-center mt-4">
            <p className="text-muted">
              A confirmation email has been sent to your registered email address.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

// Export the Confirmation component as the default export
export default Confirmation;
