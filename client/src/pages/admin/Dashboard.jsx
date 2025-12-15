// ============================================
// ADMIN DASHBOARD PAGE COMPONENT
// Main admin panel with statistics, charts, and recent activity
// ============================================

// React core with useState for state management and useEffect for data fetching
import React, { useState, useEffect } from 'react';
// Bootstrap components for layout, cards, tables, and loading indicators
import { Container, Row, Col, Card, Table, Badge, Spinner } from 'react-bootstrap';
// Link component for navigation to detail pages
import { Link } from 'react-router-dom';
// Icon components for visual elements in stat cards and tables
import {
  FaCar, FaUsers, FaCalendarCheck, FaDollarSign,
  FaArrowUp, FaArrowDown, FaEye
} from 'react-icons/fa';
// Chart.js React components for Line and Doughnut charts
import { Line, Doughnut } from 'react-chartjs-2';
// Chart.js core library and required components for chart rendering
import {
  Chart as ChartJS,
  CategoryScale,       // X-axis category labels
  LinearScale,         // Y-axis numeric scale
  PointElement,        // Data points on line chart
  LineElement,         // Lines connecting points
  ArcElement,          // Segments in doughnut chart
  Title,               // Chart title
  Tooltip,             // Hover tooltips
  Legend,              // Chart legend
  Filler               // Fill under line chart
} from 'chart.js';
// Toast notifications for user feedback
import { toast } from 'react-toastify';
// Admin API service for fetching dashboard statistics
import { adminAPI } from '../../services/api';
// Admin sidebar navigation component
import AdminSidebar from '../../components/admin/AdminSidebar';

// Register all required ChartJS components for use in charts
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Dashboard component - displays admin statistics and analytics
const Dashboard = () => {
  // State for storing dashboard statistics from API
  const [stats, setStats] = useState(null);
  // Loading state while fetching statistics
  const [loading, setLoading] = useState(true);

  // Fetch dashboard stats when component mounts
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Fetches dashboard statistics from the admin API
  // Sets stats state with revenue, bookings, users, and cars data
  const fetchDashboardStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Returns a colored badge based on booking status
  // Maps status values to Bootstrap color variants
  const getStatusBadge = (status) => {
    // Color mapping for different booking statuses
    const colors = {
      pending: 'warning',     // Yellow for pending
      confirmed: 'primary',   // Blue for confirmed
      active: 'success',      // Green for active
      completed: 'info',      // Light blue for completed
      cancelled: 'danger'     // Red for cancelled
    };
    return <Badge bg={colors[status] || 'secondary'}>{status}</Badge>;
  };

  // Configuration for the revenue line chart
  // Uses monthly revenue data from stats
  const revenueChartData = {
    labels: stats?.revenueByMonth?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Revenue',
        data: stats?.revenueByMonth?.map(item => item.revenue) || [],
        fill: true,                                    // Fill area under line
        backgroundColor: 'rgba(37, 99, 235, 0.1)',    // Light blue fill
        borderColor: 'rgba(37, 99, 235, 1)',          // Blue line
        tension: 0.4                                   // Smooth curve
      }
    ]
  };

  // Chart options for the revenue line chart
  const revenueChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false        // Hide legend
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          // Format Y-axis values as currency
          callback: (value) => '$' + value.toLocaleString()
        }
      }
    }
  };

  // Configuration for the booking status doughnut chart
  // Shows distribution of bookings across different statuses
  const bookingStatusData = {
    labels: ['Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled'],
    datasets: [
      {
        data: [
          stats?.bookingsByStatus?.pending || 0,
          stats?.bookingsByStatus?.confirmed || 0,
          stats?.bookingsByStatus?.active || 0,
          stats?.bookingsByStatus?.completed || 0,
          stats?.bookingsByStatus?.cancelled || 0
        ],
        // Colors matching the status badge colors
        backgroundColor: [
          '#ffc107',    // Warning yellow - pending
          '#0d6efd',    // Primary blue - confirmed
          '#198754',    // Success green - active
          '#0dcaf0',    // Info cyan - completed
          '#dc3545'     // Danger red - cancelled
        ]
      }
    ]
  };

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content d-flex justify-content-center align-items-center">
          <Spinner animation="border" variant="primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <Container fluid>
          {/* Page header with title and welcome message */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1">Dashboard</h2>
              <p className="text-muted mb-0">Welcome to DriveEase Admin Panel</p>
            </div>
          </div>

          {/* Stats Cards Row - Key performance indicators */}
          <Row className="g-4 mb-4">
            {/* Total Revenue Card */}
            <Col md={6} xl={3}>
              <Card className="stats-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <p className="text-muted mb-1">Total Revenue</p>
                      <h3 className="mb-0">${stats?.totalRevenue?.toLocaleString() || 0}</h3>
                      {/* Growth indicator from last month */}
                      <small className="text-success">
                        <FaArrowUp className="me-1" />
                        {stats?.revenueGrowth || 0}% from last month
                      </small>
                    </div>
                    {/* Icon badge */}
                    <div className="stats-icon bg-primary bg-opacity-10">
                      <FaDollarSign className="text-primary" size={24} />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Total Bookings Card */}
            <Col md={6} xl={3}>
              <Card className="stats-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <p className="text-muted mb-1">Total Bookings</p>
                      <h3 className="mb-0">{stats?.totalBookings || 0}</h3>
                      {/* Growth indicator from last month */}
                      <small className="text-success">
                        <FaArrowUp className="me-1" />
                        {stats?.bookingsGrowth || 0}% from last month
                      </small>
                    </div>
                    {/* Icon badge */}
                    <div className="stats-icon bg-success bg-opacity-10">
                      <FaCalendarCheck className="text-success" size={24} />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Total Users Card */}
            <Col md={6} xl={3}>
              <Card className="stats-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <p className="text-muted mb-1">Total Users</p>
                      <h3 className="mb-0">{stats?.totalUsers || 0}</h3>
                      {/* Growth indicator from last month */}
                      <small className="text-success">
                        <FaArrowUp className="me-1" />
                        {stats?.usersGrowth || 0}% from last month
                      </small>
                    </div>
                    {/* Icon badge */}
                    <div className="stats-icon bg-info bg-opacity-10">
                      <FaUsers className="text-info" size={24} />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Total Cars Card */}
            <Col md={6} xl={3}>
              <Card className="stats-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <p className="text-muted mb-1">Total Cars</p>
                      <h3 className="mb-0">{stats?.totalCars || 0}</h3>
                      {/* Available cars count */}
                      <small className="text-muted">
                        {stats?.availableCars || 0} available
                      </small>
                    </div>
                    {/* Icon badge */}
                    <div className="stats-icon bg-warning bg-opacity-10">
                      <FaCar className="text-warning" size={24} />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Charts Row - Revenue trend and booking status distribution */}
          <Row className="g-4 mb-4">
            {/* Revenue Overview Line Chart */}
            <Col lg={8}>
              <Card className="h-100">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Revenue Overview</h5>
                </Card.Header>
                <Card.Body>
                  <Line data={revenueChartData} options={revenueChartOptions} />
                </Card.Body>
              </Card>
            </Col>

            {/* Booking Status Doughnut Chart */}
            <Col lg={4}>
              <Card className="h-100">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Booking Status</h5>
                </Card.Header>
                <Card.Body className="d-flex align-items-center justify-content-center">
                  <div style={{ maxWidth: '250px' }}>
                    <Doughnut data={bookingStatusData} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Recent Activity Row - Bookings table and popular cars */}
          <Row className="g-4">
            {/* Recent Bookings Table */}
            <Col lg={8}>
              <Card>
                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Recent Bookings</h5>
                  {/* Link to full bookings list */}
                  <Link to="/admin/bookings" className="btn btn-sm btn-outline-primary">
                    View All
                  </Link>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table responsive hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Customer</th>
                        <th>Car</th>
                        <th>Dates</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Render recent bookings or empty state */}
                      {stats?.recentBookings?.length > 0 ? (
                        stats.recentBookings.map((booking) => (
                          <tr key={booking._id}>
                            {/* Customer info with avatar */}
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="avatar-sm bg-primary bg-opacity-10 rounded-circle me-2 d-flex align-items-center justify-content-center">
                                  <span className="text-primary fw-bold">
                                    {booking.user?.name?.charAt(0) || 'U'}
                                  </span>
                                </div>
                                <div>
                                  <p className="mb-0 fw-semibold">{booking.user?.name || 'Unknown'}</p>
                                  <small className="text-muted">{booking.user?.email}</small>
                                </div>
                              </div>
                            </td>
                            {/* Car brand and model */}
                            <td>
                              {booking.car?.brand} {booking.car?.model}
                            </td>
                            {/* Booking date range */}
                            <td>
                              <small>
                                {new Date(booking.startDate).toLocaleDateString()} -<br />
                                {new Date(booking.endDate).toLocaleDateString()}
                              </small>
                            </td>
                            {/* Total price */}
                            <td className="fw-semibold">${booking.totalPrice?.toFixed(2)}</td>
                            {/* Status badge */}
                            <td>{getStatusBadge(booking.status)}</td>
                            {/* View details action */}
                            <td>
                              <Link
                                to={`/admin/bookings?id=${booking._id}`}
                                className="btn btn-sm btn-light"
                              >
                                <FaEye />
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-4 text-muted">
                            No recent bookings
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            {/* Popular Cars List */}
            <Col lg={4}>
              <Card>
                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Popular Cars</h5>
                  {/* Link to full cars list */}
                  <Link to="/admin/cars" className="btn btn-sm btn-outline-primary">
                    View All
                  </Link>
                </Card.Header>
                <Card.Body>
                  {/* Render popular cars or empty state */}
                  {stats?.popularCars?.length > 0 ? (
                    stats.popularCars.map((car, index) => (
                      <div
                        key={car._id}
                        className={`d-flex align-items-center ${index !== stats.popularCars.length - 1 ? 'mb-3 pb-3 border-bottom' : ''}`}
                      >
                        {/* Car thumbnail image */}
                        <img
                          src={car.images?.[0] || 'https://via.placeholder.com/60x40?text=Car'}
                          alt={`${car.brand} ${car.model}`}
                          className="rounded me-3"
                          style={{ width: '60px', height: '40px', objectFit: 'cover' }}
                        />
                        {/* Car name and booking count */}
                        <div className="flex-grow-1">
                          <p className="mb-0 fw-semibold">{car.brand} {car.model}</p>
                          <small className="text-muted">{car.bookingCount} bookings</small>
                        </div>
                        {/* Price badge */}
                        <Badge bg="primary">${car.pricePerDay}/day</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted mb-0">No data available</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

// Export the Dashboard component as the default export
export default Dashboard;
