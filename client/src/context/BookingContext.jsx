import React, { createContext, useState, useContext } from 'react';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [bookingData, setBookingData] = useState({
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

  // Set booking dates
  const setDates = (startDate, endDate) => {
    setBookingData(prev => ({
      ...prev,
      dates: { startDate, endDate }
    }));
  };

  // Set selected car
  const setSelectedCar = (car) => {
    setBookingData(prev => ({
      ...prev,
      selectedCar: car
    }));
  };

  // Toggle extra
  const toggleExtra = (extra) => {
    setBookingData(prev => {
      const exists = prev.extras.find(e => e._id === extra._id);
      if (exists) {
        return {
          ...prev,
          extras: prev.extras.filter(e => e._id !== extra._id)
        };
      } else {
        return {
          ...prev,
          extras: [...prev.extras, extra]
        };
      }
    });
  };

  // Set extras
  const setExtras = (extras) => {
    setBookingData(prev => ({
      ...prev,
      extras
    }));
  };

  // Set pricing
  const setPricing = (pricing) => {
    setBookingData(prev => ({
      ...prev,
      pricing
    }));
  };

  // Set locations
  const setLocations = (pickup, dropoff) => {
    setBookingData(prev => ({
      ...prev,
      pickupLocation: pickup,
      dropoffLocation: dropoff
    }));
  };

  // Set notes
  const setNotes = (notes) => {
    setBookingData(prev => ({
      ...prev,
      notes
    }));
  };

  // Calculate total days
  const getTotalDays = () => {
    const { startDate, endDate } = bookingData.dates;
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calculate base price
  const getBasePrice = () => {
    if (!bookingData.selectedCar) return 0;
    return bookingData.selectedCar.pricePerDay * getTotalDays();
  };

  // Calculate extras total
  const getExtrasTotal = () => {
    const days = getTotalDays();
    return bookingData.extras.reduce((total, extra) => {
      return total + (extra.pricePerDay * days);
    }, 0);
  };

  // Calculate tax
  const getTax = () => {
    const subtotal = getBasePrice() + getExtrasTotal();
    return subtotal * 0.10; // 10% tax
  };

  // Calculate total
  const getTotal = () => {
    return getBasePrice() + getExtrasTotal() + getTax();
  };

  // Reset booking data
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

  // Check if booking is ready for checkout
  const isReadyForCheckout = () => {
    return (
      bookingData.dates.startDate &&
      bookingData.dates.endDate &&
      bookingData.selectedCar
    );
  };

  const value = {
    bookingData,
    setDates,
    setSelectedCar,
    toggleExtra,
    setExtras,
    setPricing,
    setLocations,
    setNotes,
    getTotalDays,
    getBasePrice,
    getExtrasTotal,
    getTax,
    getTotal,
    resetBooking,
    isReadyForCheckout
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export default BookingContext;
