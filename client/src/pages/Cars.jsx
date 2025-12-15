// ============================================
// CARS LISTING PAGE COMPONENT
// Displays all available cars with filtering and pagination
// ============================================

// React core with useState for state management and useEffect for data fetching
import React, { useState, useEffect } from 'react';
// React Router hooks for navigation and URL parameter management
import { Link, useSearchParams } from 'react-router-dom';
// Bootstrap components for layout, cards, forms, and pagination
import { Container, Row, Col, Card, Form, Button, Pagination } from 'react-bootstrap';
// Icon components for visual elements in car cards and filters
import { FaStar, FaFilter, FaTimes, FaCar, FaGasPump, FaCog, FaUsers } from 'react-icons/fa';
// API service for car-related HTTP requests
import { carsAPI } from '../services/api';
// Loading component for displaying loading states
import Loading from '../components/common/Loading';

// Cars component - displays browseable car listing with filters
const Cars = () => {
  // Hook to read and set URL search parameters for filtering
  const [searchParams, setSearchParams] = useSearchParams();
  // Array to store fetched cars from the API
  const [cars, setCars] = useState([]);
  // Loading state while fetching cars from server
  const [loading, setLoading] = useState(true);
  // Pagination state object with current page, total pages, and total count
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  // Controls visibility of mobile filter panel (not currently used in UI)
  const [showFilters, setShowFilters] = useState(false);

  // Filter state object - initialized from URL parameters
  // Allows filters to persist across page refreshes
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',             // Car type filter (economy, suv, etc.)
    transmission: searchParams.get('transmission') || '', // Transmission filter (automatic/manual)
    minPrice: searchParams.get('minPrice') || '',     // Minimum price per day
    maxPrice: searchParams.get('maxPrice') || '',     // Maximum price per day
    seats: searchParams.get('seats') || ''            // Minimum seat count
  });

  // Fetch cars whenever URL search parameters change
  useEffect(() => {
    fetchCars();
  }, [searchParams]);

  // Fetches cars from the API based on current search parameters
  // Updates cars array and pagination state with response data
  const fetchCars = async () => {
    setLoading(true);
    try {
      // Convert URLSearchParams to regular object for API call
      const params = Object.fromEntries(searchParams.entries());
      const response = await carsAPI.getAll(params);
      setCars(response.data.data.cars);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handles changes to any filter input field
  // Updates the filters state object with new value
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Applies current filters by updating URL search parameters
  // Resets to page 1 when filters are applied
  const applyFilters = () => {
    const params = new URLSearchParams();
    // Only add non-empty filter values to URL
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set('page', '1');
    setSearchParams(params);
  };

  // Resets all filters to empty values and clears URL parameters
  const clearFilters = () => {
    setFilters({
      type: '',
      transmission: '',
      minPrice: '',
      maxPrice: '',
      seats: ''
    });
    setSearchParams({ page: '1' });
  };

  // Handles pagination page changes
  // Preserves existing filters while changing page number
  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
  };

  // Available car type options for the filter dropdown
  const carTypes = ['economy', 'suv', 'luxury', 'sports', 'van', 'truck'];

  return (
    <>
      {/* Page Header with title and description */}
      <div className="page-header">
        <Container>
          <h1 className="mb-2">Browse Our Fleet</h1>
          <p className="opacity-75 mb-0">Find the perfect car for your journey</p>
        </Container>
      </div>

      <Container className="py-4">
        <Row>
          {/* Left Sidebar - Filter Panel */}
          <Col lg={3} className="mb-4">
            <Card className="filter-card sticky-top" style={{ top: '100px' }}>
              <Card.Body>
                {/* Filter header with clear button */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">
                    <FaFilter className="me-2" /> Filters
                  </h5>
                  {/* Show clear button only if any filter is applied */}
                  {Object.values(filters).some(v => v) && (
                    <Button variant="link" size="sm" onClick={clearFilters} className="text-danger p-0">
                      <FaTimes /> Clear
                    </Button>
                  )}
                </div>

                {/* Car Type Filter Dropdown */}
                <div className="filter-section">
                  <Form.Label className="fw-semibold">Car Type</Form.Label>
                  <Form.Select
                    name="type"
                    value={filters.type}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Types</option>
                    {carTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </Form.Select>
                </div>

                {/* Transmission Filter Dropdown */}
                <div className="filter-section">
                  <Form.Label className="fw-semibold">Transmission</Form.Label>
                  <Form.Select
                    name="transmission"
                    value={filters.transmission}
                    onChange={handleFilterChange}
                  >
                    <option value="">All</option>
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                  </Form.Select>
                </div>

                {/* Price Range Filter - Min and Max inputs */}
                <div className="filter-section">
                  <Form.Label className="fw-semibold">Price Range (per day)</Form.Label>
                  <Row className="g-2">
                    <Col>
                      <Form.Control
                        type="number"
                        name="minPrice"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        type="number"
                        name="maxPrice"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                      />
                    </Col>
                  </Row>
                </div>

                {/* Minimum Seats Filter Dropdown */}
                <div className="filter-section">
                  <Form.Label className="fw-semibold">Minimum Seats</Form.Label>
                  <Form.Select
                    name="seats"
                    value={filters.seats}
                    onChange={handleFilterChange}
                  >
                    <option value="">Any</option>
                    <option value="2">2+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                    <option value="7">7+</option>
                  </Form.Select>
                </div>

                {/* Apply Filters Button */}
                <Button variant="primary" className="w-100" onClick={applyFilters}>
                  Apply Filters
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Main Content - Cars Grid */}
          <Col lg={9}>
            {loading ? (
              // Show loading spinner while fetching
              <Loading />
            ) : cars.length === 0 ? (
              // Empty state when no cars match filters
              <div className="text-center py-5">
                <FaCar size={48} className="text-muted mb-3" />
                <h4>No cars found</h4>
                <p className="text-muted">Try adjusting your filters</p>
                <Button variant="primary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                {/* Results header with count and sort dropdown */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <p className="mb-0 text-muted">
                    Showing {cars.length} of {pagination.total} cars
                  </p>
                  {/* Sort dropdown - updates URL params on change */}
                  <Form.Select style={{ width: 'auto' }} onChange={(e) => {
                    const params = new URLSearchParams(searchParams);
                    params.set('sort', e.target.value);
                    setSearchParams(params);
                  }}>
                    <option value="-createdAt">Newest First</option>
                    <option value="pricePerDay">Price: Low to High</option>
                    <option value="-pricePerDay">Price: High to Low</option>
                    <option value="-averageRating">Top Rated</option>
                  </Form.Select>
                </div>

                {/* Cars Grid - 3 columns on large screens */}
                <Row className="g-4">
                  {cars.map((car) => (
                    <Col md={6} xl={4} key={car._id}>
                      <Card className="car-card h-100">
                        {/* Car image with type badge overlay */}
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
                          {/* Car name and year */}
                          <h5 className="fw-bold mb-1">{car.brand} {car.model}</h5>
                          <p className="text-muted small mb-2">{car.year}</p>

                          {/* Car specification badges */}
                          <div className="d-flex flex-wrap gap-2 mb-3">
                            <span className="badge bg-light text-dark">
                              <FaCog className="me-1" /> {car.transmission}
                            </span>
                            <span className="badge bg-light text-dark">
                              <FaGasPump className="me-1" /> {car.fuelType}
                            </span>
                            <span className="badge bg-light text-dark">
                              <FaUsers className="me-1" /> {car.seats} seats
                            </span>
                          </div>

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

                          {/* Price and View Details button */}
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="price-tag">
                              ${car.pricePerDay}<small>/day</small>
                            </div>
                            <Button as={Link} to={`/cars/${car._id}`} variant="primary" size="sm">
                              View Details
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {/* Pagination Controls */}
                {pagination.pages > 1 && (
                  <div className="d-flex justify-content-center mt-5">
                    <Pagination>
                      {/* Previous page button */}
                      <Pagination.Prev
                        disabled={pagination.page === 1}
                        onClick={() => handlePageChange(pagination.page - 1)}
                      />
                      {/* Page number buttons */}
                      {[...Array(pagination.pages)].map((_, i) => (
                        <Pagination.Item
                          key={i + 1}
                          active={i + 1 === pagination.page}
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </Pagination.Item>
                      ))}
                      {/* Next page button */}
                      <Pagination.Next
                        disabled={pagination.page === pagination.pages}
                        onClick={() => handlePageChange(pagination.page + 1)}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

// Export the Cars component as the default export
export default Cars;
