// ============================================
// APPLICATION ENTRY POINT
// Main entry file that bootstraps the React application
// ============================================

// React core library for building user interfaces
import React from 'react';
// ReactDOM for rendering React components to the DOM
import ReactDOM from 'react-dom/client';
// BrowserRouter for client-side routing with browser history
import { BrowserRouter } from 'react-router-dom';
// Main App component containing all routes and layout
import App from './App';
// Authentication context provider for user state management
import { AuthProvider } from './context/AuthContext';
// Booking context provider for booking flow state management
import { BookingProvider } from './context/BookingContext';

// Bootstrap CSS framework for responsive styling
import 'bootstrap/dist/css/bootstrap.min.css';
// Date picker component styles for date selection UI
import 'react-datepicker/dist/react-datepicker.css';
// Toast notification styles for user feedback messages
import 'react-toastify/dist/ReactToastify.css';

// Custom application styles (overrides and additions)
import './styles/custom.css';

// Create React root attached to the 'root' DOM element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the application with all providers wrapped
// - React.StrictMode enables additional development checks
// - BrowserRouter provides routing context
// - AuthProvider manages authentication state globally
// - BookingProvider manages booking flow state globally
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
          <App />
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
