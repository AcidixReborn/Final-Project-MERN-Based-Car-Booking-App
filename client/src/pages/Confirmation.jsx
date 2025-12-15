import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaCheckCircle, FaCar, FaCalendarAlt, FaMapMarkerAlt, FaPrint, FaHome } from 'react-icons/fa';
import { bookingsAPI } from '../services/api';
import Loading from '../components/common/Loading';

const Confirmation = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

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

  if (loading) return <Loading fullScreen />;
  if (!booking) return <div className="text-center py-5">Booking not found</div>;

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5 text-center">
              <div className="mb-4">
                <FaCheckCircle size={80} className="text-success" />
              </div>
              <h2 className="mb-3">Booking Confirmed!</h2>
              <p className="text-muted mb-4">
                Thank you for your booking. Your reservation has been confirmed.
              </p>

              <div className="bg-light p-4 rounded mb-4">
                <h5 className="mb-3">Booking Reference</h5>
                <h3 className="text-primary mb-0">{booking._id.slice(-8).toUpperCase()}</h3>
              </div>

              <Row className="text-start mb-4">
                <Col md={6} className="mb-3">
                  <Card className="h-100">
                    <Card.Body>
                      <h6 className="text-muted mb-2"><FaCar className="me-2" /> Vehicle</h6>
                      <h5 className="mb-1">{booking.car?.brand} {booking.car?.model}</h5>
                      <p className="text-muted mb-0">{booking.car?.year} | {booking.car?.type}</p>
                    </Card.Body>
                  </Card>
                </Col>
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
                <Col md={6} className="mb-3">
                  <Card className="h-100">
                    <Card.Body>
                      <h6 className="text-muted mb-2">Payment Summary</h6>
                      <p className="mb-1">
                        <strong>Status:</strong>{' '}
                        <span className={`badge bg-${booking.paymentStatus === 'paid' ? 'success' : 'warning'}`}>
                          {booking.paymentStatus}
                        </span>
                      </p>
                      <h4 className="text-primary mb-0">${booking.totalPrice?.toFixed(2)}</h4>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {booking.extras?.length > 0 && (
                <div className="text-start mb-4">
                  <h6 className="text-muted mb-2">Included Extras</h6>
                  <ul className="list-unstyled">
                    {booking.extras.map((extra, index) => (
                      <li key={index} className="mb-1">
                        <FaCheckCircle className="text-success me-2" />
                        {extra.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="d-flex justify-content-center gap-3">
                <Button variant="outline-primary" onClick={() => window.print()}>
                  <FaPrint className="me-2" /> Print Confirmation
                </Button>
                <Button as={Link} to="/my-bookings" variant="primary">
                  View My Bookings
                </Button>
                <Button as={Link} to="/" variant="outline-secondary">
                  <FaHome className="me-2" /> Back to Home
                </Button>
              </div>
            </Card.Body>
          </Card>

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

export default Confirmation;
