import React, { useState, useEffect } from 'react';
import {
  Container, Card, Row, Col, Spinner, Form, Button
} from 'react-bootstrap';
import {
  FaDollarSign, FaCalendarCheck, FaCar, FaUsers,
  FaDownload, FaChartLine
} from 'react-icons/fa';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
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
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getReports({ days: dateRange });
      setReportData(response.data.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Error loading reports');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    const headers = ['Date', 'Bookings', 'Revenue'];
    const rows = reportData.dailyStats?.map(stat => [
      stat.date,
      stat.bookings,
      stat.revenue.toFixed(2)
    ]) || [];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `driveease-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  // Revenue trend chart
  const revenueTrendData = {
    labels: reportData?.dailyStats?.map(stat => stat.date) || [],
    datasets: [
      {
        label: 'Revenue',
        data: reportData?.dailyStats?.map(stat => stat.revenue) || [],
        fill: true,
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderColor: 'rgba(37, 99, 235, 1)',
        tension: 0.4
      }
    ]
  };

  // Bookings trend chart
  const bookingsTrendData = {
    labels: reportData?.dailyStats?.map(stat => stat.date) || [],
    datasets: [
      {
        label: 'Bookings',
        data: reportData?.dailyStats?.map(stat => stat.bookings) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1
      }
    ]
  };

  // Car type distribution
  const carTypeData = {
    labels: reportData?.carTypeDistribution?.map(item => item.type) || [],
    datasets: [
      {
        data: reportData?.carTypeDistribution?.map(item => item.count) || [],
        backgroundColor: [
          '#2563eb',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#ec4899'
        ]
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
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
              <h2 className="mb-1">Reports & Analytics</h2>
              <p className="text-muted mb-0">View detailed business analytics</p>
            </div>
            <div className="d-flex gap-2">
              <Form.Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </Form.Select>
              <Button variant="outline-primary" onClick={exportToCSV}>
                <FaDownload className="me-2" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Summary Stats */}
          <Row className="g-4 mb-4">
            <Col md={6} xl={3}>
              <Card className="stats-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <p className="text-muted mb-1">Total Revenue</p>
                      <h3 className="mb-0">${reportData?.summary?.totalRevenue?.toLocaleString() || 0}</h3>
                      <small className={`text-${reportData?.summary?.revenueChange >= 0 ? 'success' : 'danger'}`}>
                        {reportData?.summary?.revenueChange >= 0 ? '+' : ''}
                        {reportData?.summary?.revenueChange || 0}% vs previous period
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
                      <h3 className="mb-0">{reportData?.summary?.totalBookings || 0}</h3>
                      <small className={`text-${reportData?.summary?.bookingsChange >= 0 ? 'success' : 'danger'}`}>
                        {reportData?.summary?.bookingsChange >= 0 ? '+' : ''}
                        {reportData?.summary?.bookingsChange || 0}% vs previous period
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
                      <p className="text-muted mb-1">Avg. Booking Value</p>
                      <h3 className="mb-0">${reportData?.summary?.avgBookingValue?.toFixed(2) || 0}</h3>
                      <small className="text-muted">
                        Per transaction
                      </small>
                    </div>
                    <div className="stats-icon bg-info bg-opacity-10">
                      <FaChartLine className="text-info" size={24} />
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
                      <p className="text-muted mb-1">New Users</p>
                      <h3 className="mb-0">{reportData?.summary?.newUsers || 0}</h3>
                      <small className={`text-${reportData?.summary?.usersChange >= 0 ? 'success' : 'danger'}`}>
                        {reportData?.summary?.usersChange >= 0 ? '+' : ''}
                        {reportData?.summary?.usersChange || 0}% vs previous period
                      </small>
                    </div>
                    <div className="stats-icon bg-warning bg-opacity-10">
                      <FaUsers className="text-warning" size={24} />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          <Row className="g-4 mb-4">
            <Col lg={8}>
              <Card className="h-100">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Revenue Trend</h5>
                </Card.Header>
                <Card.Body>
                  <Line
                    data={revenueTrendData}
                    options={{
                      ...chartOptions,
                      scales: {
                        ...chartOptions.scales,
                        y: {
                          ...chartOptions.scales.y,
                          ticks: {
                            callback: (value) => '$' + value.toLocaleString()
                          }
                        }
                      }
                    }}
                  />
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="h-100">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Bookings by Car Type</h5>
                </Card.Header>
                <Card.Body className="d-flex align-items-center justify-content-center">
                  <div style={{ maxWidth: '250px', width: '100%' }}>
                    <Pie data={carTypeData} options={pieOptions} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4 mb-4">
            <Col lg={6}>
              <Card className="h-100">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Daily Bookings</h5>
                </Card.Header>
                <Card.Body>
                  <Bar data={bookingsTrendData} options={chartOptions} />
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card className="h-100">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Top Performing Cars</h5>
                </Card.Header>
                <Card.Body>
                  {reportData?.topCars?.length > 0 ? (
                    <div>
                      {reportData.topCars.map((car, index) => (
                        <div
                          key={car._id}
                          className={`d-flex align-items-center justify-content-between ${index !== reportData.topCars.length - 1 ? 'mb-3 pb-3 border-bottom' : ''}`}
                        >
                          <div className="d-flex align-items-center">
                            <div
                              className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                              style={{ width: '40px', height: '40px' }}
                            >
                              <span className="text-primary fw-bold">{index + 1}</span>
                            </div>
                            <div>
                              <p className="mb-0 fw-semibold">{car.brand} {car.model}</p>
                              <small className="text-muted">{car.bookings} bookings</small>
                            </div>
                          </div>
                          <div className="text-end">
                            <p className="mb-0 fw-bold text-primary">${car.revenue?.toLocaleString()}</p>
                            <small className="text-muted">revenue</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted mb-0">No data available</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Additional Metrics */}
          <Row className="g-4">
            <Col lg={4}>
              <Card>
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Booking Status Distribution</h5>
                </Card.Header>
                <Card.Body>
                  {reportData?.statusDistribution?.map((status, index) => (
                    <div key={status.status} className={index !== reportData.statusDistribution.length - 1 ? 'mb-3' : ''}>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-capitalize">{status.status}</span>
                        <span className="fw-semibold">{status.count}</span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div
                          className={`progress-bar bg-${getStatusColor(status.status)}`}
                          style={{ width: `${(status.count / reportData.summary.totalBookings) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card>
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Payment Status</h5>
                </Card.Header>
                <Card.Body>
                  {reportData?.paymentDistribution?.map((payment, index) => (
                    <div key={payment.status} className={index !== reportData.paymentDistribution.length - 1 ? 'mb-3' : ''}>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-capitalize">{payment.status}</span>
                        <span className="fw-semibold">${payment.amount?.toLocaleString()}</span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div
                          className={`progress-bar bg-${getPaymentColor(payment.status)}`}
                          style={{ width: `${(payment.amount / reportData.summary.totalRevenue) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card>
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Quick Stats</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3 pb-3 border-bottom">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Avg. Rental Duration</span>
                      <span className="fw-semibold">{reportData?.summary?.avgDuration || 0} days</span>
                    </div>
                  </div>
                  <div className="mb-3 pb-3 border-bottom">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Repeat Customers</span>
                      <span className="fw-semibold">{reportData?.summary?.repeatCustomers || 0}%</span>
                    </div>
                  </div>
                  <div className="mb-3 pb-3 border-bottom">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Cancellation Rate</span>
                      <span className="fw-semibold">{reportData?.summary?.cancellationRate || 0}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Fleet Utilization</span>
                      <span className="fw-semibold">{reportData?.summary?.fleetUtilization || 0}%</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    confirmed: 'primary',
    active: 'success',
    completed: 'info',
    cancelled: 'danger'
  };
  return colors[status] || 'secondary';
};

const getPaymentColor = (status) => {
  const colors = {
    pending: 'warning',
    paid: 'success',
    refunded: 'info',
    failed: 'danger'
  };
  return colors[status] || 'secondary';
};

export default Reports;
