// ============================================
// CAR DETAILS PAGE COMPONENT
// Displays detailed car information with booking and review functionality
// ============================================

// React core with useState for state management and useEffect for data fetching
import React, { useState, useEffect } from 'react';
// React Router hooks for URL params, navigation, and links
import { useParams, useNavigate, Link } from 'react-router-dom';
// Bootstrap components for layout, cards, badges, forms, and modals
import { Container, Row, Col, Card, Button, Badge, Form, Modal } from 'react-bootstrap';
// Icon components for visual elements throughout the page
import { FaStar, FaGasPump, FaCog, FaUsers, FaMapMarkerAlt, FaCheck, FaArrowLeft } from 'react-icons/fa';
// Date picker component for selecting booking dates
import DatePicker from 'react-datepicker';
// Toast notifications for user feedback
import { toast } from 'react-toastify';
// API services for car and review HTTP requests
import { carsAPI, reviewsAPI } from '../services/api';
// Custom hook for accessing authentication state
import { useAuth } from '../context/AuthContext';
// Custom hook for accessing booking context
import { useBooking } from '../context/BookingContext';
// Loading component for displaying loading states
import Loading from '../components/common/Loading';

// CarDetails component - displays full car information and booking interface
const CarDetails = () => {
  // Extract car ID from URL parameters
  const { id } = useParams();
  // Navigation hook for programmatic routing
  const navigate = useNavigate();
  // Destructure auth state and user data from auth context
  const { isAuthenticated, user } = useAuth();
  // Destructure booking methods from booking context
  const { setDates, setSelectedCar } = useBooking();

  // State for storing fetched car details
  const [car, setCar] = useState(null);
  // State for storing car reviews
  const [reviews, setReviews] = useState([]);
  // Loading state while fetching car data
  const [loading, setLoading] = useState(true);
  // Index of currently displayed image in gallery
  const [selectedImage, setSelectedImage] = useState(0);
  // Selected start date for booking
  const [startDate, setStartDate] = useState(null);
  // Selected end date for booking
  const [endDate, setEndDate] = useState(null);
  // Availability status for selected dates (null = unchecked)
  const [isAvailable, setIsAvailable] = useState(null);
  // Loading state during availability check
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Review Modal State
  // Controls visibility of the review modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  // Form state for writing a review
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  // Loading state during review submission
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch car details and reviews when component mounts or ID changes
  useEffect(() => {
    fetchCarDetails();
    fetchReviews();
  }, [id]);

  // Fetches car details from the API
  // Redirects to cars page if car not found
  const fetchCarDetails = async () => {
    try {
      const response = await carsAPI.getById(id);
      setCar(response.data.data.car);
    } catch (error) {
      console.error('Error fetching car:', error);
      toast.error('Car not found');
      navigate('/cars');
    } finally {
      setLoading(false);
    }
  };

  // Fetches reviews for this specific car
  const fetchReviews = async () => {
    try {
      const response = await reviewsAPI.getCarReviews(id);
      setReviews(response.data.data.reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  // Checks if the car is available for selected date range
  // Updates availability state based on API response
  const checkAvailability = async () => {
    // Validate that both dates are selected
    if (!startDate || !endDate) {
      toast.warning('Please select both dates');
      return;
    }

    setCheckingAvailability(true);
    try {
      const response = await carsAPI.checkAvailability(id, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      setIsAvailable(response.data.data.available);
      // Show warning if car is not available
      if (!response.data.data.available) {
        toast.warning(response.data.data.reason || 'Car not available for selected dates');
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Error checking availability');
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Handles the Book Now button click
  // Requires authentication and date selection before proceeding
  const handleBookNow = () => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      toast.info('Please log in to book');
      navigate('/login', { state: { from: { pathname: `/cars/${id}` } } });
      return;
    }

    // Validate dates are selected
    if (!startDate || !endDate) {
      toast.warning('Please select dates first');
      return;
    }

    // Save booking data to context and navigate to checkout
    setDates(startDate, endDate);
    setSelectedCar(car);
    navigate('/checkout');
  };

  // Handles review form submission
  // Creates a new review via API and refreshes reviews list
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    // Require authentication to leave a review
    if (!isAuthenticated) {
      toast.info('Please log in to leave a review');
      return;
    }

    setSubmittingReview(true);
    try {
      await reviewsAPI.create({
        carId: id,
        ...reviewForm
      });
      toast.success('Review submitted successfully!');
      setShowReviewModal(false);
      // Reset form for next review
      setReviewForm({ rating: 5, title: '', comment: '' });
      // Refresh reviews and car details to update rating
      fetchReviews();
      fetchCarDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Show loading spinner while fetching data
  if (loading) return <Loading fullScreen />;
  // Return null if car data is not available
  if (!car) return null;

  // Calculates the number of days between selected dates
  // Returns 0 if dates are not selected
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  };

  // Calculate total price based on days and daily rate
  const totalPrice = calculateDays() * car.pricePerDay;

  return (
    <>
      {/* Page Header with back button and car name */}
      <div className="page-header">
        <Container>
          <Button variant="link" className="text-white p-0 mb-3" onClick={() => navigate(-1)}>
            <FaArrowLeft className="me-2" /> Back to Cars
          </Button>
          <h1 className="mb-2">{car.brand} {car.model}</h1>
          <p className="opacity-75 mb-0">{car.year} | {car.type.charAt(0).toUpperCase() + car.type.slice(1)}</p>
        </Container>
      </div>

      <Container className="py-4">
        <Row>
          {/* Left Column - Car Details and Reviews */}
          <Col lg={8}>
            {/* Image Gallery Card */}
            <Card className="mb-4">
              <div className="position-relative">
                {/* Main car image display */}
                <img
                  src={car.images?.[selectedImage] || 'https://via.placeholder.com/800x500?text=Car'}
                  alt={`${car.brand} ${car.model}`}
                  className="w-100"
                  style={{ height: '400px', objectFit: 'cover', borderRadius: '0.75rem 0.75rem 0 0' }}
                />
                {/* Car type badge overlay */}
                <Badge
                  className={`position-absolute top-0 start-0 m-3 bg-${car.type === 'luxury' ? 'warning' : car.type === 'sports' ? 'danger' : 'primary'}`}
                >
                  {car.type.toUpperCase()}
                </Badge>
              </div>
              {/* Thumbnail gallery for multiple images */}
              {car.images?.length > 1 && (
                <Card.Body className="p-3">
                  <div className="d-flex gap-2 overflow-auto">
                    {car.images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`View ${index + 1}`}
                        className={`cursor-pointer rounded ${selectedImage === index ? 'border border-primary border-2' : ''}`}
                        style={{ width: '80px', height: '60px', objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => setSelectedImage(index)}
                      />
                    ))}
                  </div>
                </Card.Body>
              )}
            </Card>

            {/* Car Specifications Card */}
            <Card className="mb-4">
              <Card.Body>
                <h4 className="mb-4">Specifications</h4>
                <Row className="g-4">
                  {/* Transmission type */}
                  <Col sm={6} md={3}>
                    <div className="text-center p-3 bg-light rounded">
                      <FaCog className="text-primary mb-2" size={24} />
                      <p className="mb-0 fw-semibold">{car.transmission}</p>
                      <small className="text-muted">Transmission</small>
                    </div>
                  </Col>
                  {/* Fuel type */}
                  <Col sm={6} md={3}>
                    <div className="text-center p-3 bg-light rounded">
                      <FaGasPump className="text-primary mb-2" size={24} />
                      <p className="mb-0 fw-semibold">{car.fuelType}</p>
                      <small className="text-muted">Fuel Type</small>
                    </div>
                  </Col>
                  {/* Seat capacity */}
                  <Col sm={6} md={3}>
                    <div className="text-center p-3 bg-light rounded">
                      <FaUsers className="text-primary mb-2" size={24} />
                      <p className="mb-0 fw-semibold">{car.seats} Seats</p>
                      <small className="text-muted">Capacity</small>
                    </div>
                  </Col>
                  {/* Pickup location */}
                  <Col sm={6} md={3}>
                    <div className="text-center p-3 bg-light rounded">
                      <FaMapMarkerAlt className="text-primary mb-2" size={24} />
                      <p className="mb-0 fw-semibold">{car.location}</p>
                      <small className="text-muted">Location</small>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Features Card - only shown if car has features */}
            {car.features?.length > 0 && (
              <Card className="mb-4">
                <Card.Body>
                  <h4 className="mb-4">Features</h4>
                  <Row className="g-3">
                    {/* Render each feature with a checkmark icon */}
                    {car.features.map((feature, index) => (
                      <Col sm={6} md={4} key={index}>
                        <div className="d-flex align-items-center">
                          <FaCheck className="text-success me-2" />
                          <span>{feature}</span>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            )}

            {/* Description Card - only shown if car has description */}
            {car.description && (
              <Card className="mb-4">
                <Card.Body>
                  <h4 className="mb-3">About This Car</h4>
                  <p className="text-muted mb-0">{car.description}</p>
                </Card.Body>
              </Card>
            )}

            {/* Reviews Section Card */}
            <Card>
              <Card.Body>
                {/* Reviews header with rating and Write Review button */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h4 className="mb-1">Reviews</h4>
                    {/* Average rating display with stars */}
                    <div className="d-flex align-items-center">
                      <div className="star-rating me-2">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < Math.round(car.averageRating) ? '' : 'empty'} />
                        ))}
                      </div>
                      <span className="text-muted">
                        {car.averageRating?.toFixed(1) || '0'} ({car.totalReviews} reviews)
                      </span>
                    </div>
                  </div>
                  {/* Show Write Review button only for authenticated users */}
                  {isAuthenticated && (
                    <Button variant="outline-primary" onClick={() => setShowReviewModal(true)}>
                      Write a Review
                    </Button>
                  )}
                </div>

                {/* Reviews list or empty state */}
                {reviews.length === 0 ? (
                  <p className="text-muted text-center py-4">No reviews yet. Be the first to review!</p>
                ) : (
                  <div className="divide-y">
                    {/* Render each review */}
                    {reviews.map((review) => (
                      <div key={review._id} className="py-3 border-bottom">
                        <div className="d-flex justify-content-between mb-2">
                          <div className="d-flex align-items-center">
                            {/* User avatar with initial */}
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '36px', height: '36px' }}>
                              {review.user?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="mb-0 fw-semibold">{review.user?.name || 'Anonymous'}</p>
                              {/* Star rating for this review */}
                              <div className="star-rating">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar key={i} size={12} className={i < review.rating ? '' : 'empty'} />
                                ))}
                              </div>
                            </div>
                          </div>
                          {/* Review date */}
                          <small className="text-muted">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        {/* Review title and comment */}
                        {review.title && <p className="fw-semibold mb-1">{review.title}</p>}
                        <p className="text-muted mb-0">{review.comment}</p>
                        {/* Verified booking badge */}
                        {review.isVerifiedBooking && (
                          <Badge bg="success" className="mt-2">Verified Booking</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column - Booking Sidebar */}
          <Col lg={4}>
            <Card className="booking-summary">
              <Card.Body className="p-4">
                {/* Price display */}
                <div className="text-center mb-4">
                  <div className="price-tag mb-2" style={{ fontSize: '2rem' }}>
                    ${car.pricePerDay}
                  </div>
                  <p className="text-muted">per day</p>
                </div>

                {/* Pick-up Date Picker */}
                <Form.Group className="mb-3">
                  <Form.Label>Pick-up Date</Form.Label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => {
                      setStartDate(date);
                      setIsAvailable(null); // Reset availability when date changes
                    }}
                    minDate={new Date()}
                    placeholderText="Select pick-up date"
                    className="form-control"
                    dateFormat="MMM d, yyyy"
                  />
                </Form.Group>

                {/* Return Date Picker */}
                <Form.Group className="mb-3">
                  <Form.Label>Return Date</Form.Label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => {
                      setEndDate(date);
                      setIsAvailable(null); // Reset availability when date changes
                    }}
                    minDate={startDate || new Date()}
                    placeholderText="Select return date"
                    className="form-control"
                    dateFormat="MMM d, yyyy"
                  />
                </Form.Group>

                {/* Duration display - only shown when dates are selected */}
                {startDate && endDate && (
                  <div className="summary-row">
                    <span>Duration</span>
                    <span>{calculateDays()} days</span>
                  </div>
                )}

                {/* Estimated total - only shown when dates are selected */}
                {startDate && endDate && (
                  <div className="summary-row summary-total">
                    <span>Estimated Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                )}

                {/* Check Availability Button */}
                <Button
                  variant="outline-primary"
                  className="w-100 mb-3"
                  onClick={checkAvailability}
                  disabled={!startDate || !endDate || checkingAvailability}
                >
                  {checkingAvailability ? 'Checking...' : 'Check Availability'}
                </Button>

                {/* Availability status message */}
                {isAvailable !== null && (
                  <div className={`alert alert-${isAvailable ? 'success' : 'danger'} py-2 text-center`}>
                    {isAvailable ? 'Available for selected dates!' : 'Not available for selected dates'}
                  </div>
                )}

                {/* Book Now / Login to Book Button */}
                <Button
                  variant="primary"
                  className="w-100"
                  disabled={!isAvailable}
                  onClick={handleBookNow}
                >
                  {isAuthenticated ? 'Continue to Booking' : 'Login to Book'}
                </Button>

                {/* Payment note */}
                <p className="text-muted small text-center mt-3 mb-0">
                  No payment required to reserve. Pay at pickup or online.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Review Modal - form for writing a new review */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Write a Review</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleReviewSubmit}>
          <Modal.Body>
            {/* Star Rating Selection */}
            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    size={24}
                    style={{ cursor: 'pointer' }}
                    className={star <= reviewForm.rating ? '' : 'empty'}
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                  />
                ))}
              </div>
            </Form.Group>
            {/* Optional Title Input */}
            <Form.Group className="mb-3">
              <Form.Label>Title (Optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Summarize your experience"
                value={reviewForm.title}
                onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
              />
            </Form.Group>
            {/* Review Comment Textarea */}
            <Form.Group className="mb-3">
              <Form.Label>Your Review</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Share your experience with this car..."
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                required
                minLength={10}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            {/* Cancel button */}
            <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
              Cancel
            </Button>
            {/* Submit button */}
            <Button variant="primary" type="submit" disabled={submittingReview}>
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

// Export the CarDetails component as the default export
export default CarDetails;
