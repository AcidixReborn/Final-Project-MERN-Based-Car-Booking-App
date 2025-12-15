// ============================================
// CHECKOUT PAGE COMPONENT
// Handles extras selection and payment processing with Stripe
// ============================================

// React core with useState for state management and useEffect for validation
import React, { useState, useEffect } from 'react';
// Navigation hook for programmatic routing
import { useNavigate } from 'react-router-dom';
// Bootstrap components for layout, cards, forms, and lists
import { Container, Row, Col, Card, Button, Form, ListGroup } from 'react-bootstrap';
// Icon components for visual elements
import { FaCar, FaCalendarAlt, FaShieldAlt, FaMapMarkerAlt, FaWifi, FaBaby, FaCheck, FaCreditCard } from 'react-icons/fa';
// Stripe integration - loads Stripe.js library
import { loadStripe } from '@stripe/stripe-js';
// Stripe React components for payment form
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
// Toast notifications for user feedback
import { toast } from 'react-toastify';
// API services for booking and payment HTTP requests
import { bookingsAPI, paymentsAPI } from '../services/api';
// Custom hook for accessing booking context
import { useBooking } from '../context/BookingContext';
// Loading component for displaying loading states
import Loading from '../components/common/Loading';

// Initialize Stripe with publishable key from environment variables
// Falls back to placeholder key for development
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

// Array of available rental extras with pricing and icons
// Each extra has an ID, display name, description, daily rate, and icon
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

// CheckoutForm component - handles Stripe payment submission
// Receives booking object and success callback as props
const CheckoutForm = ({ booking, onSuccess }) => {
  // Stripe hook for accessing Stripe.js methods
  const stripe = useStripe();
  // Elements hook for accessing the CardElement
  const elements = useElements();
  // Loading state during payment processing
  const [loading, setLoading] = useState(false);
  // Error message to display to user
  const [error, setError] = useState('');
  // Billing information state
  const [billingInfo, setBillingInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });

  // Handle billing info field changes
  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingInfo(prev => ({ ...prev, [name]: value }));
  };

  // Validate billing information before submission
  const validateBillingInfo = () => {
    const { name, email, phone, address, city, state, zipCode } = billingInfo;
    if (!name.trim()) return 'Cardholder name is required';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return 'Valid email is required';
    if (!phone.trim() || phone.length < 10) return 'Valid phone number is required';
    if (!address.trim()) return 'Billing address is required';
    if (!city.trim()) return 'City is required';
    if (!state.trim()) return 'State is required';
    if (!zipCode.trim() || zipCode.length < 5) return 'Valid ZIP code is required';
    return null;
  };

  // Handles payment form submission
  // Creates payment intent and confirms payment with Stripe
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate billing info first
    const validationError = validateBillingInfo();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    // Ensure Stripe.js has loaded before proceeding
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Create payment intent on backend
      const intentResponse = await paymentsAPI.createIntent(booking._id);
      const { clientSecret } = intentResponse.data.data;

      // Step 2: Confirm payment with Stripe using card details and billing info
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: billingInfo.name,
            email: billingInfo.email,
            phone: billingInfo.phone,
            address: {
              line1: billingInfo.address,
              city: billingInfo.city,
              state: billingInfo.state,
              postal_code: billingInfo.zipCode,
              country: billingInfo.country
            }
          }
        },
      });

      // Handle Stripe errors
      if (stripeError) {
        setError(stripeError.message);
        toast.error(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        // Step 3: Confirm payment on backend to update booking status
        await paymentsAPI.confirmPayment(booking._id, paymentIntent.id);
        toast.success('Payment successful!');
        // Call success callback to navigate to confirmation page
        onSuccess(booking._id);
      }
    } catch (err) {
      // Handle API errors
      const message = err.response?.data?.message || 'Payment failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* Billing Information Section */}
      <h6 className="mb-3 text-muted">Billing Information</h6>

      {/* Cardholder Name */}
      <Form.Group className="mb-3">
        <Form.Label>Cardholder Name <span className="text-danger">*</span></Form.Label>
        <Form.Control
          type="text"
          name="name"
          placeholder="John Doe"
          value={billingInfo.name}
          onChange={handleBillingChange}
          required
        />
      </Form.Group>

      {/* Email and Phone Row */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Email <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="john@example.com"
              value={billingInfo.email}
              onChange={handleBillingChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Phone <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              placeholder="(555) 123-4567"
              value={billingInfo.phone}
              onChange={handleBillingChange}
              required
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Billing Address */}
      <Form.Group className="mb-3">
        <Form.Label>Billing Address <span className="text-danger">*</span></Form.Label>
        <Form.Control
          type="text"
          name="address"
          placeholder="123 Main Street"
          value={billingInfo.address}
          onChange={handleBillingChange}
          required
        />
      </Form.Group>

      {/* City, State, ZIP Row */}
      <Row className="mb-4">
        <Col md={5}>
          <Form.Group>
            <Form.Label>City <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="city"
              placeholder="New York"
              value={billingInfo.city}
              onChange={handleBillingChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>State <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="state"
              placeholder="NY"
              value={billingInfo.state}
              onChange={handleBillingChange}
              maxLength={2}
              required
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>ZIP Code <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="zipCode"
              placeholder="10001"
              value={billingInfo.zipCode}
              onChange={handleBillingChange}
              required
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Stripe CardElement for secure card input */}
      <h6 className="mb-3 text-muted">Card Details</h6>
      <div className="mb-4">
        <div className="p-3 border rounded bg-light">
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

      {/* Error message display */}
      {error && (
        <div className="alert alert-danger py-2 mb-3">{error}</div>
      )}

      {/* Submit payment button */}
      <Button
        variant="primary"
        type="submit"
        className="w-100 py-3"
        disabled={!stripe || loading}
      >
        {loading ? 'Processing...' : `Pay $${booking.totalPrice.toFixed(2)}`}
      </Button>

      {/* Security note */}
      <p className="text-muted small text-center mt-3">
        <FaCreditCard className="me-1" /> Secured by Stripe. Your payment info is encrypted.
      </p>
    </Form>
  );
};

// Main Checkout component - manages extras selection and payment flow
const Checkout = () => {
  // Navigation hook for redirecting
  const navigate = useNavigate();
  // Destructure booking context data and methods
  const { bookingData, toggleExtra, getBasePrice, getExtrasTotal, getTax, getTotal, getTotalDays, resetBooking } = useBooking();

  // Array of selected extra items
  const [selectedExtras, setSelectedExtras] = useState([]);
  // Special requests or notes for the booking
  const [notes, setNotes] = useState('');
  // Created booking object returned from API
  const [booking, setBooking] = useState(null);
  // Loading state during booking creation
  const [creatingBooking, setCreatingBooking] = useState(false);
  // Current checkout step: 1 = extras selection, 2 = payment
  const [step, setStep] = useState(1);

  // Validate that car and dates are selected on mount
  // Redirect to booking page if missing required data
  useEffect(() => {
    if (!bookingData.selectedCar || !bookingData.dates.startDate || !bookingData.dates.endDate) {
      toast.warning('Please select a car and dates first');
      navigate('/booking');
    }
  }, [bookingData, navigate]);

  // Toggles an extra item in the selected extras array
  // Adds if not present, removes if already selected
  const handleToggleExtra = (extra) => {
    setSelectedExtras(prev => {
      const exists = prev.find(e => e._id === extra._id);
      if (exists) {
        return prev.filter(e => e._id !== extra._id);
      }
      return [...prev, extra];
    });
  };

  // Calculates total cost of all selected extras
  // Multiplies each extra's daily rate by number of days
  const calculateExtrasTotal = () => {
    return selectedExtras.reduce((total, extra) => total + (extra.pricePerDay * getTotalDays()), 0);
  };

  // Calculates the grand total including base price, extras, and tax
  const calculateTotal = () => {
    const basePrice = getBasePrice();
    const extrasTotal = calculateExtrasTotal();
    const subtotal = basePrice + extrasTotal;
    const tax = subtotal * 0.10; // 10% tax rate
    return subtotal + tax;
  };

  // Creates the booking on the server and advances to payment step
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
      setStep(2); // Advance to payment step
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating booking');
    } finally {
      setCreatingBooking(false);
    }
  };

  // Handles successful payment - resets booking context and navigates to confirmation
  const handlePaymentSuccess = (bookingId) => {
    resetBooking();
    navigate(`/confirmation/${bookingId}`);
  };

  // Show loading screen if car data is not available
  if (!bookingData.selectedCar) {
    return <Loading fullScreen />;
  }

  // Reference to selected car for easier access
  const car = bookingData.selectedCar;

  return (
    <>
      {/* Page Header with step indicator */}
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
          {/* Main Content Column */}
          <Col lg={8}>
            {step === 1 ? (
              // Step 1: Extras Selection and Review
              <>
                {/* Selected Car Summary Card */}
                <Card className="mb-4">
                  <Card.Body>
                    <h5 className="mb-3"><FaCar className="me-2" /> Selected Vehicle</h5>
                    <Row>
                      {/* Car image */}
                      <Col md={4}>
                        <img
                          src={car.images?.[0] || 'https://via.placeholder.com/200x150?text=Car'}
                          alt={`${car.brand} ${car.model}`}
                          className="img-fluid rounded"
                        />
                      </Col>
                      {/* Car details and dates */}
                      <Col md={8}>
                        <h4 className="mb-2">{car.brand} {car.model}</h4>
                        <p className="text-muted mb-2">{car.year} | {car.transmission} | {car.seats} seats</p>
                        <div className="d-flex gap-3">
                          {/* Pick-up date display */}
                          <div>
                            <small className="text-muted">Pick-up</small>
                            <p className="mb-0 fw-semibold">
                              {bookingData.dates.startDate?.toLocaleDateString()}
                            </p>
                          </div>
                          {/* Return date display */}
                          <div>
                            <small className="text-muted">Return</small>
                            <p className="mb-0 fw-semibold">
                              {bookingData.dates.endDate?.toLocaleDateString()}
                            </p>
                          </div>
                          {/* Duration display */}
                          <div>
                            <small className="text-muted">Duration</small>
                            <p className="mb-0 fw-semibold">{getTotalDays()} days</p>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Extras Selection Card */}
                <Card className="mb-4">
                  <Card.Body>
                    <h5 className="mb-3">Add Extras</h5>
                    <Row className="g-3">
                      {/* Render each available extra as a clickable card */}
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
                                  {/* Extra icon */}
                                  <div className="feature-icon me-3">
                                    {extra.icon}
                                  </div>
                                  {/* Extra name and description */}
                                  <div>
                                    <h6 className="mb-1">{extra.name}</h6>
                                    <p className="text-muted small mb-0">{extra.description}</p>
                                  </div>
                                </div>
                                {/* Price and selected indicator */}
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

                {/* Special Requests Card */}
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

                {/* Proceed to Payment Button */}
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
              // Step 2: Payment Form
              <Card>
                <Card.Body className="p-4">
                  <h5 className="mb-4"><FaCreditCard className="me-2" /> Payment</h5>
                  {/* Stripe Elements provider wrapping the checkout form */}
                  <Elements stripe={stripePromise}>
                    <CheckoutForm booking={booking} onSuccess={handlePaymentSuccess} />
                  </Elements>

                  {/* Test Card Information for Development */}
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

          {/* Order Summary Sidebar */}
          <Col lg={4}>
            <Card className="booking-summary">
              <Card.Body className="p-4">
                <h5 className="mb-4">Booking Summary</h5>

                {/* Base rental rate */}
                <div className="summary-row">
                  <span>Base Rate ({getTotalDays()} days)</span>
                  <span>${getBasePrice().toFixed(2)}</span>
                </div>

                {/* Selected extras breakdown */}
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

                {/* Tax calculation (10%) */}
                <div className="summary-row">
                  <span>Tax (10%)</span>
                  <span>${((getBasePrice() + calculateExtrasTotal()) * 0.10).toFixed(2)}</span>
                </div>

                {/* Grand total */}
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

// Export the Checkout component as the default export
export default Checkout;
