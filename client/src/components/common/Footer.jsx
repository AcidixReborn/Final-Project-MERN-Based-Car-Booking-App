// ============================================
// FOOTER COMPONENT
// Site-wide footer with branding, links, and contact info
// Displayed at the bottom of all pages
// ============================================

// React core library
import React from 'react';
// React Router Link for internal navigation
import { Link } from 'react-router-dom';
// Bootstrap layout components
import { Container, Row, Col } from 'react-bootstrap';
// Icon components for visual elements
import { FaCar, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

/**
 * Footer Component
 * Responsive footer with four columns: brand, quick links, car types, and contact
 */
const Footer = () => {
  // Get current year for copyright notice
  const currentYear = new Date().getFullYear();

  return (
    // Dark background footer with padding and auto margin-top for sticky footer
    <footer className="bg-dark text-light pt-5 pb-3 mt-auto">
      <Container>
        <Row className="mb-4">
          {/* ============================================ */}
          {/* BRAND SECTION - Logo and social links */}
          {/* ============================================ */}
          <Col lg={4} md={6} className="mb-4">
            {/* Brand logo and name */}
            <div className="d-flex align-items-center mb-3">
              <FaCar size={32} className="text-primary me-2" />
              <span className="fs-4 fw-bold">
                <span className="text-primary">Drive</span>
                <span className="text-white">Ease</span>
              </span>
            </div>
            {/* Brand description text */}
            <p className="text-muted mb-3">
              Your trusted partner for premium car rentals. Experience comfort, reliability,
              and exceptional service on every journey.
            </p>
            {/* Social media links */}
            <div className="d-flex gap-3">
              <a href="#!" className="text-muted hover-primary">
                <FaFacebook size={20} />
              </a>
              <a href="#!" className="text-muted hover-primary">
                <FaTwitter size={20} />
              </a>
              <a href="#!" className="text-muted hover-primary">
                <FaInstagram size={20} />
              </a>
              <a href="#!" className="text-muted hover-primary">
                <FaLinkedin size={20} />
              </a>
            </div>
          </Col>

          {/* ============================================ */}
          {/* QUICK LINKS SECTION - Main navigation */}
          {/* ============================================ */}
          <Col lg={2} md={6} className="mb-4">
            <h6 className="text-uppercase fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              {/* Home page link */}
              <li className="mb-2">
                <Link to="/" className="text-muted text-decoration-none">Home</Link>
              </li>
              {/* Browse cars link */}
              <li className="mb-2">
                <Link to="/cars" className="text-muted text-decoration-none">Browse Cars</Link>
              </li>
              {/* Booking page link */}
              <li className="mb-2">
                <Link to="/booking" className="text-muted text-decoration-none">Book Now</Link>
              </li>
              {/* User bookings link */}
              <li className="mb-2">
                <Link to="/my-bookings" className="text-muted text-decoration-none">My Bookings</Link>
              </li>
            </ul>
          </Col>

          {/* ============================================ */}
          {/* CAR TYPES SECTION - Category links */}
          {/* ============================================ */}
          <Col lg={2} md={6} className="mb-4">
            <h6 className="text-uppercase fw-bold mb-3">Car Types</h6>
            <ul className="list-unstyled">
              {/* Economy cars link with filter */}
              <li className="mb-2">
                <Link to="/cars?type=economy" className="text-muted text-decoration-none">Economy</Link>
              </li>
              {/* SUV cars link with filter */}
              <li className="mb-2">
                <Link to="/cars?type=suv" className="text-muted text-decoration-none">SUV</Link>
              </li>
              {/* Luxury cars link with filter */}
              <li className="mb-2">
                <Link to="/cars?type=luxury" className="text-muted text-decoration-none">Luxury</Link>
              </li>
              {/* Sports cars link with filter */}
              <li className="mb-2">
                <Link to="/cars?type=sports" className="text-muted text-decoration-none">Sports</Link>
              </li>
            </ul>
          </Col>

          {/* ============================================ */}
          {/* CONTACT SECTION - Address, phone, email */}
          {/* ============================================ */}
          <Col lg={4} md={6} className="mb-4">
            <h6 className="text-uppercase fw-bold mb-3">Contact Us</h6>
            <ul className="list-unstyled">
              {/* Physical address */}
              <li className="mb-3 d-flex align-items-start">
                <FaMapMarkerAlt className="text-primary me-3 mt-1" />
                <span className="text-muted">
                  123 Rental Street, Suite 100<br />
                  City, State 12345
                </span>
              </li>
              {/* Phone number */}
              <li className="mb-3 d-flex align-items-center">
                <FaPhone className="text-primary me-3" />
                <span className="text-muted">+1 (555) 123-4567</span>
              </li>
              {/* Email address */}
              <li className="mb-3 d-flex align-items-center">
                <FaEnvelope className="text-primary me-3" />
                <span className="text-muted">support@driveease.com</span>
              </li>
            </ul>
          </Col>
        </Row>

        {/* Horizontal divider */}
        <hr className="border-secondary" />

        {/* ============================================ */}
        {/* COPYRIGHT SECTION - Legal links */}
        {/* ============================================ */}
        <Row>
          {/* Copyright notice - left aligned on desktop */}
          <Col md={6} className="text-center text-md-start">
            <p className="text-muted mb-0 small">
              &copy; {currentYear} DriveEase. All rights reserved.
            </p>
          </Col>
          {/* Legal links - right aligned on desktop */}
          <Col md={6} className="text-center text-md-end">
            <p className="text-muted mb-0 small">
              <a href="#!" className="text-muted text-decoration-none me-3">Privacy Policy</a>
              <a href="#!" className="text-muted text-decoration-none me-3">Terms of Service</a>
              <a href="#!" className="text-muted text-decoration-none">FAQ</a>
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

// Export Footer component
export default Footer;
