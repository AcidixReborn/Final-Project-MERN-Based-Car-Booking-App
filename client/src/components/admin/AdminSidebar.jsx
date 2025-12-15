import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import {
  FaTachometerAlt, FaCar, FaCalendarCheck, FaUsers,
  FaChartBar, FaHistory, FaCog, FaSignOutAlt, FaCarSide
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin', icon: FaTachometerAlt, label: 'Dashboard', exact: true },
    { path: '/admin/cars', icon: FaCar, label: 'Manage Cars' },
    { path: '/admin/bookings', icon: FaCalendarCheck, label: 'Bookings' },
    { path: '/admin/users', icon: FaUsers, label: 'Users' },
    { path: '/admin/reports', icon: FaChartBar, label: 'Reports' },
    { path: '/admin/audit-logs', icon: FaHistory, label: 'Audit Logs' }
  ];

  return (
    <div className="admin-sidebar">
      <div className="sidebar-brand">
        <FaCarSide className="text-primary me-2" size={28} />
        <span className="brand-text">
          <span className="text-primary">Drive</span>Ease
        </span>
      </div>

      <div className="sidebar-subtitle">Admin Panel</div>

      <Nav className="flex-column sidebar-nav">
        {menuItems.map((item) => (
          <Nav.Item key={item.path}>
            <NavLink
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `nav-link sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="me-3" />
              {item.label}
            </NavLink>
          </Nav.Item>
        ))}
      </Nav>

      <div className="sidebar-footer">
        <NavLink to="/" className="nav-link sidebar-link">
          <FaCog className="me-3" />
          Back to Site
        </NavLink>
        <button
          className="nav-link sidebar-link text-danger w-100 text-start border-0 bg-transparent"
          onClick={handleLogout}
        >
          <FaSignOutAlt className="me-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
