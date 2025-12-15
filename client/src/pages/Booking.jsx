import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { FaCalendarAlt, FaCar, FaStar, FaArrowRight } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';
import { carsAPI } from '../services/api';
import { useBooking } from '../context/BookingContext';
import Loading from '../components/common/Loading';

const Booking = () => {
  const navigate = useNavigate();
  const { bookingData, setDates, setSelectedCar } = useBooking();

  const [availableCars, setAvailableCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(bookingData.dates.startDate);
  const [endDate, setEndDate] = useState(bookingData.dates.endDate);
  const [filters, setFilters] = useState({ type: '', transmission: '' });

  useEffect(() => {
    if (startDate && endDate) {
      fetchAvailableCars();
    }
  }, [startDate, endDate, filters]);

  const fetchAvailableCars = async () => {
    setLoading(true);
    try {
      const response = await carsAPI.search({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ...filters
      });
      setAvailableCars(response.data.data.cars);
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast.error('Error fetching available cars');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      setDates(start, end);
    }
  };

  const handleSelectCar = (car) => {
    setSelectedCar(car);
    navigate('/checkout');
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  };

  const carTypes = ['economy', 'suv', 'luxury', 'sports'];

  return (
    <>
      <div className="page-header">
        <Container>
          <h1 className="mb-2">Book Your Ride</h1>
          <p className="opacity-75 mb-0">Select your dates and choose from available vehicles</p>
        </Container>
      </div>

      <Container className="py-4">
        {/* Date Selection */}
        <Card className="mb-4">
          <Card.Body className="p-4">
            <h4 className="mb-4"><FaCalendarAlt className="me-2" /> Select Your Dates</h4>
            <Row className="align-items-end">
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
                  />
                </Form.Group>
              </Col>
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
                  />
                </Form.Group>
              </Col>
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

        {/* Filters */}
        <Card className="mb-4">
          <Card.Body className="p-4">
            <Row className="align-items-center">
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

        {/* Available Cars */}
        <h4 className="mb-4"><FaCar className="me-2" /> Available Cars</h4>

        {!startDate || !endDate ? (
          <Card className="text-center py-5">
            <Card.Body>
              <FaCalendarAlt size={48} className="text-muted mb-3" />
              <h5>Select Your Dates</h5>
              <p className="text-muted">Please select pick-up and return dates to see available cars</p>
            </Card.Body>
          </Card>
        ) : loading ? (
          <Loading />
        ) : availableCars.length === 0 ? (
          <Card className="text-center py-5">
            <Card.Body>
              <FaCar size={48} className="text-muted mb-3" />
              <h5>No Cars Available</h5>
              <p className="text-muted">No cars available for the selected dates. Try different dates.</p>
            </Card.Body>
          </Card>
        ) : (
          <Row className="g-4">
            {availableCars.map((car) => (
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
                    <p className="text-muted small mb-2">{car.year} | {car.transmission} | {car.seats} seats</p>

                    <div className="d-flex align-items-center mb-3">
                      <div className="star-rating me-2">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} size={12} className={i < Math.round(car.averageRating) ? '' : 'empty'} />
                        ))}
                      </div>
                      <span className="text-muted small">({car.totalReviews})</span>
                    </div>

                    <div className="bg-light p-3 rounded mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span>${car.pricePerDay}/day</span>
                        <span>x {calculateDays()} days</span>
                      </div>
                      <div className="d-flex justify-content-between fw-bold">
                        <span>Total</span>
                        <span className="text-primary">${(car.pricePerDay * calculateDays()).toFixed(2)}</span>
                      </div>
                    </div>

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

export default Booking;
