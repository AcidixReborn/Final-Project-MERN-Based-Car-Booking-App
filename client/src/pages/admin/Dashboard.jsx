import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  FaCar, FaUsers, FaCalendarCheck, FaDollarSign,
  FaArrowUp, FaArrowDown, FaEye
} from 'react-icons/fa';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { toast } from 'react-toastify';
import { adminAPI } from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';

// Register ChartJS components
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

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

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

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'primary',
      active: 'success',
      completed: 'info',
      cancelled: 'danger'
    };
    return <Badge bg={colors[status] || 'secondary'}>{status}</Badge>;
  };

  // Revenue chart data
  const revenueChartData = {
    labels: stats?.revenueByMonth?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Revenue',
        data: stats?.revenueByMonth?.map(item => item.revenue) || [],
        fill: true,
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderColor: 'rgba(37, 99, 235, 1)',
        tension: 0.4
      }
    ]
  };

  const revenueChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => '$' + value.toLocaleString()
        }
      }
    }
  };

  // Booking status chart data
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
        backgroundColor: [
          '#ffc107',
          '#0d6efd',
          '#198754',
          '#0dcaf0',
          '#dc3545'
        ]
      }
    ]
  };

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
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1">Dashboard</h2>
              <p className="text-muted mb-0">Welcome to DriveEase Admin Panel</p>
            </div>
          </div>

          {/* Stats Cards */}
          <Row className="g-4 mb-4">
            <Col md={6} xl={3}>
              <Card className="stats-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <p className="text-muted mb-1">Total Revenue</p>
                      <h3 className="mb-0">${stats?.totalRevenue?.toLocaleString() || 0}</h3>
                      <small className="text-success">
                        <FaArrowUp className="me-1" />
                        {stats?.revenueGrowth || 0}% from last month
                      </small>
                    </div>
                    <div className="stats-icon bg-primary bg-opacity-10">
                      <FaDollarSign className="text-primary" size={24} />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} xl={3}>
              <Card className="stats-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <p className="text-muted mb-1">Total Bookings</p>
                      <h3 className="mb-0">{stats?.totalBookings || 0}</h3>
                      <small className="text-success">
                        <FaArrowUp className="me-1" />
                        {stats?.bookingsGrowth || 0}% from last month
                      </small>
                    </div>
                    <div className="stats-icon bg-success bg-opacity-10">
                      <FaCalendarCheck className="text-success" size={24} />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} xl={3}>
              <Card className="stats-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <p className="text-muted mb-1">Total Users</p>
                      <h3 className="mb-0">{stats?.totalUsers || 0}</h3>
                      <small className="text-success">
                        <FaArrowUp className="me-1" />
                        {stats?.usersGrowth || 0}% from last month
                      </small>
                    </div>
                    <div className="stats-icon bg-info bg-opacity-10">
                      <FaUsers className="text-info" size={24} />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} xl={3}>
              <Card className="stats-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <p className="text-muted mb-1">Total Cars</p>
                      <h3 className="mb-0">{stats?.totalCars || 0}</h3>
                      <small className="text-muted">
                        {stats?.availableCars || 0} available
                      </small>
                    </div>
                    <div className="stats-icon bg-warning bg-opacity-10">
                      <FaCar className="text-warning" size={24} />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Charts Row */}
          <Row className="g-4 mb-4">
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

          {/* Recent Bookings & Popular Cars */}
          <Row className="g-4">
            <Col lg={8}>
              <Card>
                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Recent Bookings</h5>
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
                      {stats?.recentBookings?.length > 0 ? (
                        stats.recentBookings.map((booking) => (
                          <tr key={booking._id}>
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
                            <td>
                              {booking.car?.brand} {booking.car?.model}
                            </td>
                            <td>
                              <small>
                                {new Date(booking.startDate).toLocaleDateString()} -<br />
                                {new Date(booking.endDate).toLocaleDateString()}
                              </small>
                            </td>
                            <td className="fw-semibold">${booking.totalPrice?.toFixed(2)}</td>
                            <td>{getStatusBadge(booking.status)}</td>
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

            <Col lg={4}>
              <Card>
                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Popular Cars</h5>
                  <Link to="/admin/cars" className="btn btn-sm btn-outline-primary">
                    View All
                  </Link>
                </Card.Header>
                <Card.Body>
                  {stats?.popularCars?.length > 0 ? (
                    stats.popularCars.map((car, index) => (
                      <div
                        key={car._id}
                        className={`d-flex align-items-center ${index !== stats.popularCars.length - 1 ? 'mb-3 pb-3 border-bottom' : ''}`}
                      >
                        <img
                          src={car.images?.[0] || 'https://via.placeholder.com/60x40?text=Car'}
                          alt={`${car.brand} ${car.model}`}
                          className="rounded me-3"
                          style={{ width: '60px', height: '40px', objectFit: 'cover' }}
                        />
                        <div className="flex-grow-1">
                          <p className="mb-0 fw-semibold">{car.brand} {car.model}</p>
                          <small className="text-muted">{car.bookingCount} bookings</small>
                        </div>
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

export default Dashboard;
