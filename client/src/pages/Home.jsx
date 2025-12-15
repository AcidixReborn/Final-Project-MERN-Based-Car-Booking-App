import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Form } from 'react-bootstrap';
import { FaCar, FaShieldAlt, FaClock, FaHeadset, FaStar, FaArrowRight, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import { carsAPI, reviewsAPI } from '../services/api';
import { useBooking } from '../context/BookingContext';
import Loading from '../components/common/Loading';

const Home = () => {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const { setDates } = useBooking();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carsRes, reviewsRes] = await Promise.all([
          carsAPI.getFeatured(),
          reviewsAPI.getRecent()
        ]);
        setFeaturedCars(carsRes.data.data.cars);
        setRecentReviews(reviewsRes.data.data.reviews);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (startDate && endDate) {
      setDates(startDate, endDate);
      navigate('/booking');
    }
  };

  const features = [
    {
      icon: <FaCar size={24} />,
      title: 'Wide Selection',
      description: 'Choose from economy to luxury vehicles'
    },
    {
      icon: <FaShieldAlt size={24} />,
      title: 'Fully Insured',
      description: 'Comprehensive coverage on all rentals'
    },
    {
      icon: <FaClock size={24} />,
      title: '24/7 Service',
      description: 'Round-the-clock customer support'
    },
    {
      icon: <FaHeadset size={24} />,
      title: 'Easy Booking',
      description: 'Simple and secure online booking'
    }
  ];

  const stats = [
    { number: '500+', label: 'Happy Customers' },
    { number: '50+', label: 'Vehicles Available' },
    { number: '15+', label: 'Locations' },
    { number: '24/7', label: 'Support' }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section d-flex align-items-center">
        <Container className="hero-content py-5">
          <Row className="align-items-center">
            <Col lg={6} className="text-white mb-5 mb-lg-0">
              <h1 className="display-4 fw-bold mb-4">
                Find Your Perfect
                <span className="text-primary d-block">Rental Car</span>
              </h1>
              <p className="lead mb-4 opacity-75">
                Discover the freedom of the road with our premium car rental service.
                From economy to luxury, we have the perfect vehicle for your journey.
              </p>
              <div className="d-flex gap-3">
                <Button as={Link} to="/cars" variant="primary" size="lg">
                  Browse Cars <FaArrowRight className="ms-2" />
                </Button>
                <Button as={Link} to="/register" variant="outline-light" size="lg">
                  Join Now
                </Button>
              </div>
            </Col>
            <Col lg={6}>
              <Card className="search-box border-0">
                <Card.Body className="p-4">
                  <h4 className="mb-4">Book Your Ride</h4>
                  <Form onSubmit={handleSearch}>
                    <Row>
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
                      <Col md={12} className="mb-3">
                        <Form.Label><FaMapMarkerAlt className="me-2" />Location</Form.Label>
                        <Form.Select>
                          <option value="main">Main Office</option>
                          <option value="airport">Airport Terminal</option>
                        </Form.Select>
                      </Col>
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

      {/* Features Section */}
      <section className="py-5 bg-white">
        <Container>
          <Row className="g-4">
            {features.map((feature, index) => (
              <Col md={6} lg={3} key={index}>
                <div className="text-center p-4">
                  <div className="feature-icon feature-icon-lg mx-auto mb-3">
                    {feature.icon}
                  </div>
                  <h5 className="fw-bold mb-2">{feature.title}</h5>
                  <p className="text-muted mb-0">{feature.description}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Featured Cars Section */}
      <section className="py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">Featured Vehicles</h2>
            <p className="text-muted">Explore our most popular rental cars</p>
          </div>

          {loading ? (
            <Loading />
          ) : (
            <Row className="g-4">
              {featuredCars.map((car) => (
                <Col md={6} lg={4} key={car._id}>
                  <Card className="car-card h-100">
                    <div className="card-img-wrapper">
                      <Card.Img
                        variant="top"
                        src={car.images?.[0] || 'https://via.placeholder.com/400x250?text=Car'}
                        alt={`${car.brand} ${car.model}`}
                      />
                      <span className={`car-type-badge bg-${car.type === 'luxury' ? 'warning' : car.type === 'sports' ? 'danger' : 'primary'} text-white`}>
                        {car.type}
                      </span>
                    </div>
                    <Card.Body>
                      <h5 className="fw-bold mb-1">{car.brand} {car.model}</h5>
                      <p className="text-muted small mb-3">{car.year} | {car.transmission} | {car.seats} seats</p>
                      <div className="d-flex align-items-center mb-3">
                        <div className="star-rating me-2">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className={i < Math.round(car.averageRating) ? '' : 'empty'} />
                          ))}
                        </div>
                        <span className="text-muted small">({car.totalReviews} reviews)</span>
                      </div>
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

          <div className="text-center mt-5">
            <Button as={Link} to="/cars" variant="primary" size="lg">
              View All Cars <FaArrowRight className="ms-2" />
            </Button>
          </div>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-dark text-white">
        <Container>
          <Row className="g-4">
            {stats.map((stat, index) => (
              <Col md={6} lg={3} key={index}>
                <div className="text-center">
                  <div className="stats-number text-primary">{stat.number}</div>
                  <p className="mb-0 opacity-75">{stat.label}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Reviews Section */}
      {recentReviews.length > 0 && (
        <section className="py-5">
          <Container>
            <div className="text-center mb-5">
              <h2 className="fw-bold mb-3">What Our Customers Say</h2>
              <p className="text-muted">Read reviews from satisfied customers</p>
            </div>

            <Row className="g-4">
              {recentReviews.slice(0, 3).map((review) => (
                <Col md={4} key={review._id}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="p-4">
                      <div className="star-rating mb-3">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < review.rating ? '' : 'empty'} />
                        ))}
                      </div>
                      <p className="mb-3">{review.comment}</p>
                      <div className="d-flex align-items-center">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                          {review.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="fw-bold mb-0">{review.user?.name || 'Anonymous'}</p>
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

      {/* CTA Section */}
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

export default Home;
