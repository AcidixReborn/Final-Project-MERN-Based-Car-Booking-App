// ============================================
// BOOKING CONTEXT
// Global state management for the booking flow
// Manages car selection, dates, extras, and pricing
// ============================================

// React core and hooks for creating context and managing state
import React, { createContext, useState, useContext } from 'react';

// Create booking context with null default value
const BookingContext = createContext(null);

/**
 * Booking Provider Component
 * Wraps booking-related pages and provides booking state/methods
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 */
export const BookingProvider = ({ children }) => {
  // Main booking data state object containing all booking information
  const [bookingData, setBookingData] = useState({
    // Date range for the rental period
    dates: {
      startDate: null,  // Rental start date
      endDate: null     // Rental end date
    },
    selectedCar: null,              // Selected car object
    extras: [],                     // Array of selected extra add-ons
    pricing: null,                  // Calculated pricing breakdown
    pickupLocation: 'Main Office',  // Pickup location string
    dropoffLocation: 'Main Office', // Dropoff location string
    notes: ''                       // Additional booking notes
  });

  /**
   * Set rental date range
   * @param {Date} startDate - Rental start date
   * @param {Date} endDate - Rental end date
   */
  const setDates = (startDate, endDate) => {
    setBookingData(prev => ({
      ...prev,
      dates: { startDate, endDate }
    }));
  };

  /**
   * Set the selected car for booking
   * @param {Object} car - Car object from API
   */
  const setSelectedCar = (car) => {
    setBookingData(prev => ({
      ...prev,
      selectedCar: car
    }));
  };

  /**
   * Toggle an extra add-on (add if not selected, remove if selected)
   * @param {Object} extra - Extra object to toggle
   */
  const toggleExtra = (extra) => {
    setBookingData(prev => {
      // Check if extra already exists in selection
      const exists = prev.extras.find(e => e._id === extra._id);
      if (exists) {
        // Remove extra if already selected
        return {
          ...prev,
          extras: prev.extras.filter(e => e._id !== extra._id)
        };
      } else {
        // Add extra if not selected
        return {
          ...prev,
          extras: [...prev.extras, extra]
        };
      }
    });
  };

  /**
   * Set all selected extras at once
   * @param {Array} extras - Array of extra objects
   */
  const setExtras = (extras) => {
    setBookingData(prev => ({
      ...prev,
      extras
    }));
  };

  /**
   * Set pricing breakdown data
   * @param {Object} pricing - Pricing object with breakdown
   */
  const setPricing = (pricing) => {
    setBookingData(prev => ({
      ...prev,
      pricing
    }));
  };

  /**
   * Set pickup and dropoff locations
   * @param {string} pickup - Pickup location name
   * @param {string} dropoff - Dropoff location name
   */
  const setLocations = (pickup, dropoff) => {
    setBookingData(prev => ({
      ...prev,
      pickupLocation: pickup,
      dropoffLocation: dropoff
    }));
  };

  /**
   * Set additional booking notes
   * @param {string} notes - Notes text
   */
  const setNotes = (notes) => {
    setBookingData(prev => ({
      ...prev,
      notes
    }));
  };

  /**
   * Calculate total rental days from selected dates
   * @returns {number} Number of rental days (0 if dates not set)
   */
  const getTotalDays = () => {
    const { startDate, endDate } = bookingData.dates;
    // Return 0 if dates not selected
    if (!startDate || !endDate) return 0;
    // Calculate difference in milliseconds
    const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
    // Convert to days and round up
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  /**
   * Calculate base rental price (car rate × days)
   * @returns {number} Base price (0 if no car selected)
   */
  const getBasePrice = () => {
    // Return 0 if no car selected
    if (!bookingData.selectedCar) return 0;
    // Calculate: daily rate × total days
    return bookingData.selectedCar.pricePerDay * getTotalDays();
  };

  /**
   * Calculate total cost of all selected extras
   * @returns {number} Extras total (sum of all extras × days)
   */
  const getExtrasTotal = () => {
    const days = getTotalDays();
    // Sum all extras (each extra × number of days)
    return bookingData.extras.reduce((total, extra) => {
      return total + (extra.pricePerDay * days);
    }, 0);
  };

  /**
   * Calculate tax amount (10% of subtotal)
   * @returns {number} Tax amount
   */
  const getTax = () => {
    // Calculate subtotal (base + extras)
    const subtotal = getBasePrice() + getExtrasTotal();
    // Return 10% tax
    return subtotal * 0.10;
  };

  /**
   * Calculate grand total (base + extras + tax)
   * @returns {number} Total booking cost
   */
  const getTotal = () => {
    return getBasePrice() + getExtrasTotal() + getTax();
  };

  /**
   * Reset all booking data to initial state
   * Used after successful booking or when starting fresh
   */
  const resetBooking = () => {
    setBookingData({
      dates: {
        startDate: null,
        endDate: null
      },
      selectedCar: null,
      extras: [],
      pricing: null,
      pickupLocation: 'Main Office',
      dropoffLocation: 'Main Office',
      notes: ''
    });
  };

  /**
   * Check if booking has minimum required data for checkout
   * @returns {boolean} True if ready for checkout
   */
  const isReadyForCheckout = () => {
    return (
      bookingData.dates.startDate &&  // Has start date
      bookingData.dates.endDate &&    // Has end date
      bookingData.selectedCar         // Has selected car
    );
  };

  // Context value object containing all booking state and methods
  const value = {
    bookingData,        // Current booking data object
    setDates,           // Set date range function
    setSelectedCar,     // Set car selection function
    toggleExtra,        // Toggle extra add-on function
    setExtras,          // Set all extras function
    setPricing,         // Set pricing function
    setLocations,       // Set locations function
    setNotes,           // Set notes function
    getTotalDays,       // Calculate days function
    getBasePrice,       // Calculate base price function
    getExtrasTotal,     // Calculate extras total function
    getTax,             // Calculate tax function
    getTotal,           // Calculate grand total function
    resetBooking,       // Reset booking function
    isReadyForCheckout  // Check checkout readiness function
  };

  // Render provider with context value
  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

/**
 * Custom hook to access booking context
 * Throws error if used outside of BookingProvider
 * @returns {Object} Booking context value
 */
export const useBooking = () => {
  // Get context value
  const context = useContext(BookingContext);
  // Throw error if used outside provider
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

// Export context as default
export default BookingContext;
