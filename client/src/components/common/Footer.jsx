import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { FaCar, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-light pt-5 pb-3 mt-auto">
      <Container>
        <Row className="mb-4">
          {/* Brand Section */}
          <Col lg={4} md={6} className="mb-4">
            <div className="d-flex align-items-center mb-3">
              <FaCar size={32} className="text-primary me-2" />
              <span className="fs-4 fw-bold">
                <span className="text-primary">Drive</span>
                <span className="text-white">Ease</span>
              </span>
            </div>
            <p className="text-muted mb-3">
              Your trusted partner for premium car rentals. Experience comfort, reliability,
              and exceptional service on every journey.
            </p>
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

          {/* Quick Links */}
          <Col lg={2} md={6} className="mb-4">
            <h6 className="text-uppercase fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-muted text-decoration-none">Home</Link>
              </li>
              <li className="mb-2">
                <Link to="/cars" className="text-muted text-decoration-none">Browse Cars</Link>
              </li>
              <li className="mb-2">
                <Link to="/booking" className="text-muted text-decoration-none">Book Now</Link>
              </li>
              <li className="mb-2">
                <Link to="/my-bookings" className="text-muted text-decoration-none">My Bookings</Link>
              </li>
            </ul>
          </Col>

          {/* Car Categories */}
          <Col lg={2} md={6} className="mb-4">
            <h6 className="text-uppercase fw-bold mb-3">Car Types</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/cars?type=economy" className="text-muted text-decoration-none">Economy</Link>
              </li>
              <li className="mb-2">
                <Link to="/cars?type=suv" className="text-muted text-decoration-none">SUV</Link>
              </li>
              <li className="mb-2">
                <Link to="/cars?type=luxury" className="text-muted text-decoration-none">Luxury</Link>
              </li>
              <li className="mb-2">
                <Link to="/cars?type=sports" className="text-muted text-decoration-none">Sports</Link>
              </li>
            </ul>
          </Col>

          {/* Contact Info */}
          <Col lg={4} md={6} className="mb-4">
            <h6 className="text-uppercase fw-bold mb-3">Contact Us</h6>
            <ul className="list-unstyled">
              <li className="mb-3 d-flex align-items-start">
                <FaMapMarkerAlt className="text-primary me-3 mt-1" />
                <span className="text-muted">
                  123 Rental Street, Suite 100<br />
                  City, State 12345
                </span>
              </li>
              <li className="mb-3 d-flex align-items-center">
                <FaPhone className="text-primary me-3" />
                <span className="text-muted">+1 (555) 123-4567</span>
              </li>
              <li className="mb-3 d-flex align-items-center">
                <FaEnvelope className="text-primary me-3" />
                <span className="text-muted">support@driveease.com</span>
              </li>
            </ul>
          </Col>
        </Row>

        <hr className="border-secondary" />

        {/* Copyright */}
        <Row>
          <Col md={6} className="text-center text-md-start">
            <p className="text-muted mb-0 small">
              &copy; {currentYear} DriveEase. All rights reserved.
            </p>
          </Col>
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

export default Footer;
