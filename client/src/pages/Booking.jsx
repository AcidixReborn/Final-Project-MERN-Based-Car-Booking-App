// ============================================
// BOOKING PAGE COMPONENT
// Date selection and car browsing for creating new bookings
// ============================================

// React core with useState for state management and useEffect for data fetching
import React, { useState, useEffect } from 'react';
// Navigation hook for programmatic routing
import { useNavigate } from 'react-router-dom';
// Bootstrap components for layout, cards, and forms
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
// Icon components for visual elements
import { FaCalendarAlt, FaCar, FaStar, FaArrowRight } from 'react-icons/fa';
// Date picker component for selecting booking dates
import DatePicker from 'react-datepicker';
// Toast notifications for user feedback
import { toast } from 'react-toastify';
// API service for car-related HTTP requests
import { carsAPI } from '../services/api';
// Custom hook for accessing booking context
import { useBooking } from '../context/BookingContext';
// Loading component for displaying loading states
import Loading from '../components/common/Loading';

// Booking component - allows users to select dates and choose a car
const Booking = () => {
  // Navigation hook for redirecting to checkout page
  const navigate = useNavigate();
  // Destructure booking context methods and data
  const { bookingData, setDates, setSelectedCar } = useBooking();

  // Array to store cars available for selected dates
  const [availableCars, setAvailableCars] = useState([]);
  // Loading state while fetching available cars
  const [loading, setLoading] = useState(false);
  // Start date for the booking (pre-filled from context if available)
  const [startDate, setStartDate] = useState(bookingData.dates.startDate);
  // End date for the booking (pre-filled from context if available)
  const [endDate, setEndDate] = useState(bookingData.dates.endDate);
  // Filter options for car type and transmission
  const [filters, setFilters] = useState({ type: '', transmission: '' });

  // Fetch available cars when dates or filters change
  useEffect(() => {
    if (startDate && endDate) {
      fetchAvailableCars();
    }
  }, [startDate, endDate, filters]);

  // Fetches cars available for the selected date range
  // Applies any active filters (type, transmission)
  const fetchAvailableCars = async () => {
    setLoading(true);
    try {
      // Build query params, excluding empty filter values
      const queryParams = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };
      // Only add filters that have actual values
      if (filters.type) queryParams.type = filters.type;
      if (filters.transmission) queryParams.transmission = filters.transmission;

      const response = await carsAPI.search(queryParams);
      setAvailableCars(response.data.data.cars);
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast.error('Error fetching available cars');
    } finally {
      setLoading(false);
    }
  };

  // Handles changes to either the start or end date
  // Updates local state and saves to booking context
  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      setDates(start, end);
    }
  };

  // Handles car selection - saves car to context and navigates to checkout
  const handleSelectCar = (car) => {
    setSelectedCar(car);
    navigate('/checkout');
  };

  // Calculates the number of days between selected dates
  // Returns 0 if dates are not selected
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  };

  // Available car type options for the filter dropdown
  const carTypes = ['economy', 'suv', 'luxury', 'sports'];

  return (
    <>
      {/* Page Header with title and description */}
      <div className="page-header">
        <Container>
          <h1 className="mb-2">Book Your Ride</h1>
          <p className="opacity-75 mb-0">Select your dates and choose from available vehicles</p>
        </Container>
      </div>

      <Container className="py-4">
        {/* Date Selection Card */}
        <Card className="mb-4">
          <Card.Body className="p-4">
            <h4 className="mb-4"><FaCalendarAlt className="me-2" /> Select Your Dates</h4>
            <Row className="align-items-end">
              {/* Pick-up Date Input */}
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Pick-up Date</Form.Label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => handleDateChange(date, endDate)}
                    minDate={new Date()}
                    placeholderText="Select pick-up date"
                    className="form-control"
                    dateFormat="MMM d, yyyy"
                    portalId="datepicker-portal"
                  />
                </Form.Group>
              </Col>
              {/* Return Date Input */}
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Return Date</Form.Label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => handleDateChange(startDate, date)}
                    minDate={startDate || new Date()}
                    placeholderText="Select return date"
                    className="form-control"
                    dateFormat="MMM d, yyyy"
                    portalId="datepicker-portal"
                  />
                </Form.Group>
              </Col>
              {/* Days Selected Display */}
              <Col md={4}>
                {startDate && endDate && (
                  <div className="bg-primary text-white p-3 rounded text-center">
                    <strong>{calculateDays()}</strong> days selected
                  </div>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Filters Card - Car type and transmission filters */}
        <Card className="mb-4">
          <Card.Body className="p-4">
            <Row className="align-items-center">
              {/* Car Type Filter Dropdown */}
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Car Type</Form.Label>
                  <Form.Select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  >
                    <option value="">All Types</option>
                    {carTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              {/* Transmission Filter Dropdown */}
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Transmission</Form.Label>
                  <Form.Select
                    value={filters.transmission}
                    onChange={(e) => setFilters({ ...filters, transmission: e.target.value })}
                  >
                    <option value="">All</option>
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Available Cars Section */}
        <h4 className="mb-4"><FaCar className="me-2" /> Available Cars</h4>

        {/* Conditional rendering based on state */}
        {!startDate || !endDate ? (
          // Empty state - prompt to select dates first
          <Card className="text-center py-5">
            <Card.Body>
              <FaCalendarAlt size={48} className="text-muted mb-3" />
              <h5>Select Your Dates</h5>
              <p className="text-muted">Please select pick-up and return dates to see available cars</p>
            </Card.Body>
          </Card>
        ) : loading ? (
          // Loading state while fetching cars
          <Loading />
        ) : availableCars.length === 0 ? (
          // No cars available for selected dates
          <Card className="text-center py-5">
            <Card.Body>
              <FaCar size={48} className="text-muted mb-3" />
              <h5>No Cars Available</h5>
              <p className="text-muted">No cars available for the selected dates. Try different dates.</p>
            </Card.Body>
          </Card>
        ) : (
          // Grid of available cars
          <Row className="g-4">
            {availableCars.map((car) => (
              <Col md={6} lg={4} key={car._id}>
                <Card className="car-card h-100">
                  {/* Car image with type badge */}
                  <div className="card-img-wrapper">
                    <Card.Img
                      variant="top"
                      src={car.images?.[0] || 'https://via.placeholder.com/400x250?text=Car'}
                      alt={`${car.brand} ${car.model}`}
                    />
                    {/* Car type badge - different colors for luxury/sports */}
                    <span className={`car-type-badge bg-${car.type === 'luxury' ? 'warning' : car.type === 'sports' ? 'danger' : 'primary'} text-white`}>
                      {car.type}
                    </span>
                  </div>
                  <Card.Body>
                    {/* Car name and specifications */}
                    <h5 className="fw-bold mb-1">{car.brand} {car.model}</h5>
                    <p className="text-muted small mb-2">{car.year} | {car.transmission} | {car.seats} seats</p>

                    {/* Star rating display */}
                    <div className="d-flex align-items-center mb-3">
                      <div className="star-rating me-2">
                        {/* Render 5 stars, filled or empty based on rating */}
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} size={12} className={i < Math.round(car.averageRating) ? '' : 'empty'} />
                        ))}
                      </div>
                      <span className="text-muted small">({car.totalReviews})</span>
                    </div>

                    {/* Pricing breakdown */}
                    <div className="bg-light p-3 rounded mb-3">
                      {/* Daily rate and number of days */}
                      <div className="d-flex justify-content-between mb-1">
                        <span>${car.pricePerDay}/day</span>
                        <span>x {calculateDays()} days</span>
                      </div>
                      {/* Total price calculation */}
                      <div className="d-flex justify-content-between fw-bold">
                        <span>Total</span>
                        <span className="text-primary">${(car.pricePerDay * calculateDays()).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Select Car Button */}
                    <Button
                      variant="primary"
                      className="w-100"
                      onClick={() => handleSelectCar(car)}
                    >
                      Select This Car <FaArrowRight className="ms-2" />
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  );
};

// Export the Booking component as the default export
export default Booking;
