// ============================================
// REPORTS & ANALYTICS PAGE COMPONENT
// Admin interface for viewing detailed business analytics and metrics
// ============================================

// React core with useState for state management and useEffect for data fetching
import React, { useState, useEffect } from 'react';
// Bootstrap components for layout, cards, forms, and loading indicators
import {
  Container, Card, Row, Col, Spinner, Form, Button
} from 'react-bootstrap';
// Icon components for stats cards, download, and chart indicators
import {
  FaDollarSign, FaCalendarCheck, FaCar, FaUsers,
  FaDownload, FaChartLine
} from 'react-icons/fa';
// Chart.js React components for Line, Bar, and Pie charts
import { Line, Bar, Pie } from 'react-chartjs-2';
// Chart.js core library and required components for chart rendering
import {
  Chart as ChartJS,
  CategoryScale,       // X-axis category labels
  LinearScale,         // Y-axis numeric scale
  BarElement,          // Bar chart bars
  PointElement,        // Data points on line chart
  LineElement,         // Lines connecting points
  ArcElement,          // Pie chart segments
  Title,               // Chart title
  Tooltip,             // Hover tooltips
  Legend,              // Chart legend
  Filler               // Fill under line chart
} from 'chart.js';
// Toast notifications for user feedback
import { toast } from 'react-toastify';
// Admin API service for fetching report data
import { adminAPI } from '../../services/api';
// Admin sidebar navigation component
import AdminSidebar from '../../components/admin/AdminSidebar';

// Register all required ChartJS components for use in charts
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

// Reports component - displays detailed analytics and exportable reports
const Reports = () => {
  // Loading state while fetching report data
  const [loading, setLoading] = useState(true);
  // Stores all report data including stats, charts, and metrics
  const [reportData, setReportData] = useState(null);
  // Selected date range filter (7, 30, 90, or 365 days)
  const [dateRange, setDateRange] = useState('30');

  // Fetch report data when date range changes
  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  // Fetches report data from the admin API based on selected date range
  // Updates reportData state with analytics information
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

  // Exports the daily stats data to a CSV file for download
  // Creates a downloadable file with date, bookings, and revenue columns
  const exportToCSV = () => {
    if (!reportData) return;

    // CSV column headers
    const headers = ['Date', 'Bookings', 'Revenue'];
    // Map daily stats to CSV row format
    const rows = reportData.dailyStats?.map(stat => [
      stat.date,
      stat.bookings,
      stat.revenue.toFixed(2)
    ]) || [];

    // Combine headers and rows into CSV content string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `driveease-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  // Configuration for the revenue trend line chart
  // Shows daily revenue over the selected date range
  const revenueTrendData = {
    labels: reportData?.dailyStats?.map(stat => stat.date) || [],
    datasets: [
      {
        label: 'Revenue',
        data: reportData?.dailyStats?.map(stat => stat.revenue) || [],
        fill: true,                                    // Fill area under line
        backgroundColor: 'rgba(37, 99, 235, 0.1)',    // Light blue fill
        borderColor: 'rgba(37, 99, 235, 1)',          // Blue line
        tension: 0.4                                   // Smooth curve
      }
    ]
  };

  // Configuration for the daily bookings bar chart
  // Shows number of bookings per day
  const bookingsTrendData = {
    labels: reportData?.dailyStats?.map(stat => stat.date) || [],
    datasets: [
      {
        label: 'Bookings',
        data: reportData?.dailyStats?.map(stat => stat.bookings) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',   // Green bars
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1
      }
    ]
  };

  // Configuration for the car type distribution pie chart
  // Shows breakdown of bookings by car category
  const carTypeData = {
    labels: reportData?.carTypeDistribution?.map(item => item.type) || [],
    datasets: [
      {
        data: reportData?.carTypeDistribution?.map(item => item.count) || [],
        // Color palette for pie segments
        backgroundColor: [
          '#2563eb',    // Blue
          '#10b981',    // Green
          '#f59e0b',    // Amber
          '#ef4444',    // Red
          '#8b5cf6',    // Purple
          '#ec4899'     // Pink
        ]
      }
    ]
  };

  // Common chart options for line and bar charts
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false        // Hide legend
      }
    },
    scales: {
      y: {
        beginAtZero: true     // Y-axis starts at 0
      }
    }
  };

  // Chart options for pie chart with bottom legend
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'    // Legend below chart
      }
    }
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
          {/* Page header with title, date range selector, and export button */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1">Reports & Analytics</h2>
              <p className="text-muted mb-0">View detailed business analytics</p>
            </div>
            <div className="d-flex gap-2">
              {/* Date range filter dropdown */}
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
              {/* CSV export button */}
              <Button variant="outline-primary" onClick={exportToCSV}>
                <FaDownload className="me-2" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Summary Stats Cards Row - Key performance indicators */}
          <Row className="g-4 mb-4">
            {/* Total Revenue Card */}
            <Col md={6} xl={3}>
              <Card className="stats-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <p className="text-muted mb-1">Total Revenue</p>
                      <h3 className="mb-0">${reportData?.summary?.totalRevenue?.toLocaleString() || 0}</h3>
                      {/* Change indicator vs previous period */}
                      <small className={`text-${reportData?.summary?.revenueChange >= 0 ? 'success' : 'danger'}`}>
                        {reportData?.summary?.revenueChange >= 0 ? '+' : ''}
                        {reportData?.summary?.revenueChange || 0}% vs previous period
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
                      <h3 className="mb-0">{reportData?.summary?.totalBookings || 0}</h3>
                      {/* Change indicator vs previous period */}
                      <small className={`text-${reportData?.summary?.bookingsChange >= 0 ? 'success' : 'danger'}`}>
                        {reportData?.summary?.bookingsChange >= 0 ? '+' : ''}
                        {reportData?.summary?.bookingsChange || 0}% vs previous period
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

            {/* Average Booking Value Card */}
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
                    {/* Icon badge */}
                    <div className="stats-icon bg-info bg-opacity-10">
                      <FaChartLine className="text-info" size={24} />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* New Users Card */}
            <Col md={6} xl={3}>
              <Card className="stats-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <p className="text-muted mb-1">New Users</p>
                      <h3 className="mb-0">{reportData?.summary?.newUsers || 0}</h3>
                      {/* Change indicator vs previous period */}
                      <small className={`text-${reportData?.summary?.usersChange >= 0 ? 'success' : 'danger'}`}>
                        {reportData?.summary?.usersChange >= 0 ? '+' : ''}
                        {reportData?.summary?.usersChange || 0}% vs previous period
                      </small>
                    </div>
                    {/* Icon badge */}
                    <div className="stats-icon bg-warning bg-opacity-10">
                      <FaUsers className="text-warning" size={24} />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Main Charts Row - Revenue trend and car type distribution */}
          <Row className="g-4 mb-4">
            {/* Revenue Trend Line Chart */}
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
                            // Format Y-axis values as currency
                            callback: (value) => '$' + value.toLocaleString()
                          }
                        }
                      }
                    }}
                  />
                </Card.Body>
              </Card>
            </Col>

            {/* Car Type Distribution Pie Chart */}
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

          {/* Secondary Charts Row - Daily bookings and top performers */}
          <Row className="g-4 mb-4">
            {/* Daily Bookings Bar Chart */}
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

            {/* Top Performing Cars List */}
            <Col lg={6}>
              <Card className="h-100">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Top Performing Cars</h5>
                </Card.Header>
                <Card.Body>
                  {/* Render top cars list or empty state */}
                  {reportData?.topCars?.length > 0 ? (
                    <div>
                      {reportData.topCars.map((car, index) => (
                        <div
                          key={car._id}
                          className={`d-flex align-items-center justify-content-between ${index !== reportData.topCars.length - 1 ? 'mb-3 pb-3 border-bottom' : ''}`}
                        >
                          <div className="d-flex align-items-center">
                            {/* Rank number badge */}
                            <div
                              className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                              style={{ width: '40px', height: '40px' }}
                            >
                              <span className="text-primary fw-bold">{index + 1}</span>
                            </div>
                            {/* Car name and booking count */}
                            <div>
                              <p className="mb-0 fw-semibold">{car.brand} {car.model}</p>
                              <small className="text-muted">{car.bookings} bookings</small>
                            </div>
                          </div>
                          {/* Revenue amount */}
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

          {/* Additional Metrics Row - Status distributions and quick stats */}
          <Row className="g-4">
            {/* Booking Status Distribution Card */}
            <Col lg={4}>
              <Card>
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Booking Status Distribution</h5>
                </Card.Header>
                <Card.Body>
                  {/* Render progress bars for each status */}
                  {reportData?.statusDistribution?.map((status, index) => (
                    <div key={status.status} className={index !== reportData.statusDistribution.length - 1 ? 'mb-3' : ''}>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-capitalize">{status.status}</span>
                        <span className="fw-semibold">{status.count}</span>
                      </div>
                      {/* Progress bar showing percentage of total */}
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

            {/* Payment Status Distribution Card */}
            <Col lg={4}>
              <Card>
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Payment Status</h5>
                </Card.Header>
                <Card.Body>
                  {/* Render progress bars for each payment status */}
                  {reportData?.paymentDistribution?.map((payment, index) => (
                    <div key={payment.status} className={index !== reportData.paymentDistribution.length - 1 ? 'mb-3' : ''}>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-capitalize">{payment.status}</span>
                        <span className="fw-semibold">${payment.amount?.toLocaleString()}</span>
                      </div>
                      {/* Progress bar showing percentage of total revenue */}
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

            {/* Quick Stats Card - Additional metrics */}
            <Col lg={4}>
              <Card>
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Quick Stats</h5>
                </Card.Header>
                <Card.Body>
                  {/* Average rental duration */}
                  <div className="mb-3 pb-3 border-bottom">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Avg. Rental Duration</span>
                      <span className="fw-semibold">{reportData?.summary?.avgDuration || 0} days</span>
                    </div>
                  </div>
                  {/* Repeat customers percentage */}
                  <div className="mb-3 pb-3 border-bottom">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Repeat Customers</span>
                      <span className="fw-semibold">{reportData?.summary?.repeatCustomers || 0}%</span>
                    </div>
                  </div>
                  {/* Cancellation rate */}
                  <div className="mb-3 pb-3 border-bottom">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Cancellation Rate</span>
                      <span className="fw-semibold">{reportData?.summary?.cancellationRate || 0}%</span>
                    </div>
                  </div>
                  {/* Fleet utilization percentage */}
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

// Returns the appropriate color class for booking status badges
// Maps booking statuses to Bootstrap color variants
const getStatusColor = (status) => {
  // Color mapping for booking statuses
  const colors = {
    pending: 'warning',     // Yellow for pending
    confirmed: 'primary',   // Blue for confirmed
    active: 'success',      // Green for active
    completed: 'info',      // Light blue for completed
    cancelled: 'danger'     // Red for cancelled
  };
  return colors[status] || 'secondary';
};

// Returns the appropriate color class for payment status badges
// Maps payment statuses to Bootstrap color variants
const getPaymentColor = (status) => {
  // Color mapping for payment statuses
  const colors = {
    pending: 'warning',     // Yellow for pending
    paid: 'success',        // Green for paid
    refunded: 'info',       // Light blue for refunded
    failed: 'danger'        // Red for failed
  };
  return colors[status] || 'secondary';
};

// Export the Reports component as the default export
export default Reports;
