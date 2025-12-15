// ============================================
// HOME PAGE COMPONENT
// Landing page with hero section, featured cars, stats, and reviews
// Entry point for the car rental booking flow
// ============================================

// React core and hooks for state and side effects
import React, { useState, useEffect } from 'react';
// React Router for navigation
import { Link, useNavigate } from 'react-router-dom';
// Bootstrap UI components for layout and styling
import { Container, Row, Col, Button, Card, Form } from 'react-bootstrap';
// Icon components for visual elements
import { FaCar, FaShieldAlt, FaClock, FaHeadset, FaStar, FaArrowRight, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
// Date picker component for date selection
import DatePicker from 'react-datepicker';
// API services for fetching data
import { carsAPI, reviewsAPI } from '../services/api';
// Booking context for storing selected dates
import { useBooking } from '../context/BookingContext';
// Loading component for async operations
import Loading from '../components/common/Loading';

/**
 * Home Component
 * Main landing page with hero, features, featured cars, and testimonials
 */
const Home = () => {
  // Featured cars list fetched from API
  const [featuredCars, setFeaturedCars] = useState([]);
  // Recent customer reviews fetched from API
  const [recentReviews, setRecentReviews] = useState([]);
  // Loading state while fetching initial data
  const [loading, setLoading] = useState(true);
  // Selected pickup date from quick search form
  const [startDate, setStartDate] = useState(null);
  // Selected return date from quick search form
  const [endDate, setEndDate] = useState(null);

  // Get setDates function from booking context
  const { setDates } = useBooking();
  // Hook for programmatic navigation
  const navigate = useNavigate();

  // Fetch featured cars and reviews on component mount
  useEffect(() => {
    /**
     * Fetches featured cars and recent reviews in parallel
     */
    const fetchData = async () => {
      try {
        // Parallel API requests for better performance
        const [carsRes, reviewsRes] = await Promise.all([
          carsAPI.getFeatured(),
          reviewsAPI.getRecent()
        ]);
        // Update state with fetched data
        setFeaturedCars(carsRes.data.data.cars);
        setRecentReviews(reviewsRes.data.data.reviews);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        // Mark loading as complete
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array - run once on mount

  /**
   * Handle quick search form submission
   * Stores dates in context and navigates to booking page
   * @param {Event} e - Form submit event
   */
  const handleSearch = (e) => {
    e.preventDefault();
    // Only navigate if both dates selected
    if (startDate && endDate) {
      setDates(startDate, endDate);
      navigate('/booking');
    }
  };

  // Array of feature items for the features section
  const features = [
    {
      icon: <FaCar size={24} />,          // Car icon
      title: 'Wide Selection',             // Feature title
      description: 'Choose from economy to luxury vehicles'  // Feature description
    },
    {
      icon: <FaShieldAlt size={24} />,    // Shield icon
      title: 'Fully Insured',
      description: 'Comprehensive coverage on all rentals'
    },
    {
      icon: <FaClock size={24} />,        // Clock icon
      title: '24/7 Service',
      description: 'Round-the-clock customer support'
    },
    {
      icon: <FaHeadset size={24} />,      // Headset icon
      title: 'Easy Booking',
      description: 'Simple and secure online booking'
    }
  ];

  // Array of statistics for the stats section
  const stats = [
    { number: '500+', label: 'Happy Customers' },
    { number: '50+', label: 'Vehicles Available' },
    { number: '15+', label: 'Locations' },
    { number: '24/7', label: 'Support' }
  ];

  return (
    <>
      {/* ============================================ */}
      {/* HERO SECTION - Main banner with search form */}
      {/* ============================================ */}
      <section className="hero-section d-flex align-items-center">
        <Container className="hero-content py-5">
          <Row className="align-items-center">
            {/* Left column - Hero text and CTA buttons */}
            <Col lg={6} className="text-white mb-5 mb-lg-0">
              {/* Main headline */}
              <h1 className="display-4 fw-bold mb-4">
                Find Your Perfect
                <span className="text-primary d-block">Rental Car</span>
              </h1>
              {/* Subheadline */}
              <p className="lead mb-4 opacity-75">
                Discover the freedom of the road with our premium car rental service.
                From economy to luxury, we have the perfect vehicle for your journey.
              </p>
              {/* CTA buttons */}
              <div className="d-flex gap-3">
                <Button as={Link} to="/cars" variant="primary" size="lg">
                  Browse Cars <FaArrowRight className="ms-2" />
                </Button>
                <Button as={Link} to="/register" variant="outline-light" size="lg">
                  Join Now
                </Button>
              </div>
            </Col>
            {/* Right column - Quick search form */}
            <Col lg={6}>
              <Card className="search-box border-0">
                <Card.Body className="p-4">
                  <h4 className="mb-4">Book Your Ride</h4>
                  <Form onSubmit={handleSearch}>
                    <Row>
                      {/* Pick-up date picker */}
                      <Col md={6} className="mb-3">
                        <Form.Label><FaCalendarAlt className="me-2" />Pick-up Date</Form.Label>
                        <DatePicker
                          selected={startDate}
                          onChange={setStartDate}
                          minDate={new Date()}
                          placeholderText="Select date"
                          className="form-control"
                          dateFormat="MMM d, yyyy"
                        />
                      </Col>
                      {/* Return date picker */}
                      <Col md={6} className="mb-3">
                        <Form.Label><FaCalendarAlt className="me-2" />Return Date</Form.Label>
                        <DatePicker
                          selected={endDate}
                          onChange={setEndDate}
                          minDate={startDate || new Date()}
                          placeholderText="Select date"
                          className="form-control"
                          dateFormat="MMM d, yyyy"
                        />
                      </Col>
                      {/* Location selector */}
                      <Col md={12} className="mb-3">
                        <Form.Label><FaMapMarkerAlt className="me-2" />Location</Form.Label>
                        <Form.Select>
                          <option value="main">Main Office</option>
                          <option value="airport">Airport Terminal</option>
                        </Form.Select>
                      </Col>
                      {/* Search button */}
                      <Col md={12}>
                        <Button type="submit" variant="primary" className="w-100 py-3">
                          Search Available Cars
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ============================================ */}
      {/* FEATURES SECTION - Key selling points */}
      {/* ============================================ */}
      <section className="py-5 bg-white">
        <Container>
          <Row className="g-4">
            {/* Map through features array */}
            {features.map((feature, index) => (
              <Col md={6} lg={3} key={index}>
                <div className="text-center p-4">
                  {/* Feature icon */}
                  <div className="feature-icon feature-icon-lg mx-auto mb-3">
                    {feature.icon}
                  </div>
                  {/* Feature title */}
                  <h5 className="fw-bold mb-2">{feature.title}</h5>
                  {/* Feature description */}
                  <p className="text-muted mb-0">{feature.description}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ============================================ */}
      {/* FEATURED CARS SECTION - Popular vehicles */}
      {/* ============================================ */}
      <section className="py-5">
        <Container>
          {/* Section header */}
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">Featured Vehicles</h2>
            <p className="text-muted">Explore our most popular rental cars</p>
          </div>

          {/* Car grid or loading spinner */}
          {loading ? (
            <Loading />
          ) : (
            <Row className="g-4">
              {/* Map through featured cars */}
              {featuredCars.map((car) => (
                <Col md={6} lg={4} key={car._id}>
                  <Card className="car-card h-100">
                    {/* Car image with type badge */}
                    <div className="card-img-wrapper">
                      <Card.Img
                        variant="top"
                        src={car.images?.[0] || 'https://via.placeholder.com/400x250?text=Car'}
                        alt={`${car.brand} ${car.model}`}
                      />
                      {/* Type badge with dynamic color */}
                      <span className={`car-type-badge bg-${car.type === 'luxury' ? 'warning' : car.type === 'sports' ? 'danger' : 'primary'} text-white`}>
                        {car.type}
                      </span>
                    </div>
                    <Card.Body>
                      {/* Car name */}
                      <h5 className="fw-bold mb-1">{car.brand} {car.model}</h5>
                      {/* Car specs */}
                      <p className="text-muted small mb-3">{car.year} | {car.transmission} | {car.seats} seats</p>
                      {/* Star rating */}
                      <div className="d-flex align-items-center mb-3">
                        <div className="star-rating me-2">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className={i < Math.round(car.averageRating) ? '' : 'empty'} />
                          ))}
                        </div>
                        <span className="text-muted small">({car.totalReviews} reviews)</span>
                      </div>
                      {/* Price and details button */}
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="price-tag">
                          ${car.pricePerDay}<small>/day</small>
                        </div>
                        <Button as={Link} to={`/cars/${car._id}`} variant="outline-primary" size="sm">
                          View Details
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {/* View all cars button */}
          <div className="text-center mt-5">
            <Button as={Link} to="/cars" variant="primary" size="lg">
              View All Cars <FaArrowRight className="ms-2" />
            </Button>
          </div>
        </Container>
      </section>

      {/* ============================================ */}
      {/* STATS SECTION - Company numbers */}
      {/* ============================================ */}
      <section className="py-5 bg-dark text-white">
        <Container>
          <Row className="g-4">
            {/* Map through stats array */}
            {stats.map((stat, index) => (
              <Col md={6} lg={3} key={index}>
                <div className="text-center">
                  {/* Stat number */}
                  <div className="stats-number text-primary">{stat.number}</div>
                  {/* Stat label */}
                  <p className="mb-0 opacity-75">{stat.label}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ============================================ */}
      {/* REVIEWS SECTION - Customer testimonials */}
      {/* ============================================ */}
      {recentReviews.length > 0 && (
        <section className="py-5">
          <Container>
            {/* Section header */}
            <div className="text-center mb-5">
              <h2 className="fw-bold mb-3">What Our Customers Say</h2>
              <p className="text-muted">Read reviews from satisfied customers</p>
            </div>

            <Row className="g-4">
              {/* Display first 3 reviews */}
              {recentReviews.slice(0, 3).map((review) => (
                <Col md={4} key={review._id}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="p-4">
                      {/* Star rating */}
                      <div className="star-rating mb-3">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < review.rating ? '' : 'empty'} />
                        ))}
                      </div>
                      {/* Review comment */}
                      <p className="mb-3">{review.comment}</p>
                      {/* Reviewer info */}
                      <div className="d-flex align-items-center">
                        {/* Avatar circle */}
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                          {review.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          {/* Reviewer name */}
                          <p className="fw-bold mb-0">{review.user?.name || 'Anonymous'}</p>
                          {/* Car reviewed */}
                          <small className="text-muted">
                            {review.car?.brand} {review.car?.model}
                          </small>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      )}

      {/* ============================================ */}
      {/* CTA SECTION - Final call to action */}
      {/* ============================================ */}
      <section className="py-5 bg-primary text-white">
        <Container className="text-center">
          <h2 className="fw-bold mb-3">Ready to Hit the Road?</h2>
          <p className="lead mb-4 opacity-75">
            Book your perfect rental car today and enjoy the journey
          </p>
          <Button as={Link} to="/booking" variant="light" size="lg">
            Book Now <FaArrowRight className="ms-2" />
          </Button>
        </Container>
      </section>
    </>
  );
};

// Export Home component
export default Home;
