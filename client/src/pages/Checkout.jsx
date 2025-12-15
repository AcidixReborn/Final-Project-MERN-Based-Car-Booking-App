import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, ListGroup } from 'react-bootstrap';
import { FaCar, FaCalendarAlt, FaShieldAlt, FaMapMarkerAlt, FaWifi, FaBaby, FaCheck, FaCreditCard } from 'react-icons/fa';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import { bookingsAPI, paymentsAPI } from '../services/api';
import { useBooking } from '../context/BookingContext';
import Loading from '../components/common/Loading';

// Initialize Stripe - you'll need to add your publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const extras = [
  {
    _id: 'insurance',
    name: 'Full Coverage Insurance',
    description: 'Comprehensive coverage with zero deductible',
    pricePerDay: 25,
    icon: <FaShieldAlt />
  },
  {
    _id: 'gps',
    name: 'GPS Navigation',
    description: 'Portable GPS with up-to-date maps',
    pricePerDay: 10,
    icon: <FaMapMarkerAlt />
  },
  {
    _id: 'child-seat',
    name: 'Child Safety Seat',
    description: 'Approved car seat for children',
    pricePerDay: 12,
    icon: <FaBaby />
  },
  {
    _id: 'wifi',
    name: 'WiFi Hotspot',
    description: 'Unlimited mobile internet',
    pricePerDay: 12,
    icon: <FaWifi />
  }
];

const CheckoutForm = ({ booking, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create payment intent
      const intentResponse = await paymentsAPI.createIntent(booking._id);
      const { clientSecret } = intentResponse.data.data;

      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        toast.error(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        await paymentsAPI.confirmPayment(booking._id, paymentIntent.id);
        toast.success('Payment successful!');
        onSuccess(booking._id);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Payment failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="mb-4">
        <Form.Label>Card Details</Form.Label>
        <div className="p-3 border rounded">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#1e293b',
                  '::placeholder': { color: '#94a3b8' },
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 mb-3">{error}</div>
      )}

      <Button
        variant="primary"
        type="submit"
        className="w-100 py-3"
        disabled={!stripe || loading}
      >
        {loading ? 'Processing...' : `Pay $${booking.totalPrice.toFixed(2)}`}
      </Button>

      <p className="text-muted small text-center mt-3">
        <FaCreditCard className="me-1" /> Secured by Stripe. Your payment info is encrypted.
      </p>
    </Form>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const { bookingData, toggleExtra, getBasePrice, getExtrasTotal, getTax, getTotal, getTotalDays, resetBooking } = useBooking();

  const [selectedExtras, setSelectedExtras] = useState([]);
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(null);
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [step, setStep] = useState(1); // 1: extras, 2: payment

  useEffect(() => {
    if (!bookingData.selectedCar || !bookingData.dates.startDate || !bookingData.dates.endDate) {
      toast.warning('Please select a car and dates first');
      navigate('/booking');
    }
  }, [bookingData, navigate]);

  const handleToggleExtra = (extra) => {
    setSelectedExtras(prev => {
      const exists = prev.find(e => e._id === extra._id);
      if (exists) {
        return prev.filter(e => e._id !== extra._id);
      }
      return [...prev, extra];
    });
  };

  const calculateExtrasTotal = () => {
    return selectedExtras.reduce((total, extra) => total + (extra.pricePerDay * getTotalDays()), 0);
  };

  const calculateTotal = () => {
    const basePrice = getBasePrice();
    const extrasTotal = calculateExtrasTotal();
    const subtotal = basePrice + extrasTotal;
    const tax = subtotal * 0.10;
    return subtotal + tax;
  };

  const handleProceedToPayment = async () => {
    setCreatingBooking(true);
    try {
      const response = await bookingsAPI.create({
        carId: bookingData.selectedCar._id,
        startDate: bookingData.dates.startDate.toISOString(),
        endDate: bookingData.dates.endDate.toISOString(),
        extras: selectedExtras.map(e => e._id),
        notes
      });
      setBooking(response.data.data.booking);
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating booking');
    } finally {
      setCreatingBooking(false);
    }
  };

  const handlePaymentSuccess = (bookingId) => {
    resetBooking();
    navigate(`/confirmation/${bookingId}`);
  };

  if (!bookingData.selectedCar) {
    return <Loading fullScreen />;
  }

  const car = bookingData.selectedCar;

  return (
    <>
      <div className="page-header">
        <Container>
          <h1 className="mb-2">Checkout</h1>
          <p className="opacity-75 mb-0">
            {step === 1 ? 'Select extras and review your booking' : 'Complete payment'}
          </p>
        </Container>
      </div>

      <Container className="py-4">
        <Row>
          <Col lg={8}>
            {step === 1 ? (
              <>
                {/* Selected Car */}
                <Card className="mb-4">
                  <Card.Body>
                    <h5 className="mb-3"><FaCar className="me-2" /> Selected Vehicle</h5>
                    <Row>
                      <Col md={4}>
                        <img
                          src={car.images?.[0] || 'https://via.placeholder.com/200x150?text=Car'}
                          alt={`${car.brand} ${car.model}`}
                          className="img-fluid rounded"
                        />
                      </Col>
                      <Col md={8}>
                        <h4 className="mb-2">{car.brand} {car.model}</h4>
                        <p className="text-muted mb-2">{car.year} | {car.transmission} | {car.seats} seats</p>
                        <div className="d-flex gap-3">
                          <div>
                            <small className="text-muted">Pick-up</small>
                            <p className="mb-0 fw-semibold">
                              {bookingData.dates.startDate?.toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <small className="text-muted">Return</small>
                            <p className="mb-0 fw-semibold">
                              {bookingData.dates.endDate?.toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <small className="text-muted">Duration</small>
                            <p className="mb-0 fw-semibold">{getTotalDays()} days</p>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Extras */}
                <Card className="mb-4">
                  <Card.Body>
                    <h5 className="mb-3">Add Extras</h5>
                    <Row className="g-3">
                      {extras.map((extra) => {
                        const isSelected = selectedExtras.some(e => e._id === extra._id);
                        return (
                          <Col md={6} key={extra._id}>
                            <div
                              className={`extra-item ${isSelected ? 'selected' : ''}`}
                              onClick={() => handleToggleExtra(extra)}
                            >
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="d-flex">
                                  <div className="feature-icon me-3">
                                    {extra.icon}
                                  </div>
                                  <div>
                                    <h6 className="mb-1">{extra.name}</h6>
                                    <p className="text-muted small mb-0">{extra.description}</p>
                                  </div>
                                </div>
                                <div className="text-end">
                                  <p className="fw-bold text-primary mb-0">${extra.pricePerDay}/day</p>
                                  {isSelected && <FaCheck className="text-success mt-1" />}
                                </div>
                              </div>
                            </div>
                          </Col>
                        );
                      })}
                    </Row>
                  </Card.Body>
                </Card>

                {/* Notes */}
                <Card className="mb-4">
                  <Card.Body>
                    <h5 className="mb-3">Special Requests (Optional)</h5>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Any special requests or notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </Card.Body>
                </Card>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-100"
                  onClick={handleProceedToPayment}
                  disabled={creatingBooking}
                >
                  {creatingBooking ? 'Creating Booking...' : 'Proceed to Payment'}
                </Button>
              </>
            ) : (
              <Card>
                <Card.Body className="p-4">
                  <h5 className="mb-4"><FaCreditCard className="me-2" /> Payment</h5>
                  <Elements stripe={stripePromise}>
                    <CheckoutForm booking={booking} onSuccess={handlePaymentSuccess} />
                  </Elements>

                  {/* Test Card Info */}
                  <div className="mt-4 p-3 bg-light rounded">
                    <p className="small text-muted mb-2">
                      <strong>Test Card Numbers:</strong>
                    </p>
                    <p className="small text-muted mb-1">
                      Success: 4242 4242 4242 4242
                    </p>
                    <p className="small text-muted mb-0">
                      Use any future date and any CVC
                    </p>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* Order Summary */}
          <Col lg={4}>
            <Card className="booking-summary">
              <Card.Body className="p-4">
                <h5 className="mb-4">Booking Summary</h5>

                <div className="summary-row">
                  <span>Base Rate ({getTotalDays()} days)</span>
                  <span>${getBasePrice().toFixed(2)}</span>
                </div>

                {selectedExtras.length > 0 && (
                  <>
                    <p className="fw-semibold mb-2 mt-3">Extras</p>
                    {selectedExtras.map((extra) => (
                      <div key={extra._id} className="summary-row">
                        <span className="text-muted">{extra.name}</span>
                        <span>${(extra.pricePerDay * getTotalDays()).toFixed(2)}</span>
                      </div>
                    ))}
                  </>
                )}

                <div className="summary-row">
                  <span>Tax (10%)</span>
                  <span>${((getBasePrice() + calculateExtrasTotal()) * 0.10).toFixed(2)}</span>
                </div>

                <div className="summary-row summary-total border-top pt-3 mt-3">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Checkout;
