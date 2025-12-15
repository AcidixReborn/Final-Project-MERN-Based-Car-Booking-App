// ============================================
// LOADING COMPONENTS
// Reusable loading indicators and skeleton screens
// Used throughout the app for async operations
// ============================================

// React core library
import React from 'react';
// Bootstrap Spinner component for loading animations
import { Spinner } from 'react-bootstrap';

/**
 * Loading Component
 * Displays a spinner with optional text message
 * Can be rendered inline or as full-screen overlay
 *
 * @param {Object} props - Component props
 * @param {string} props.text - Loading message to display (default: 'Loading...')
 * @param {boolean} props.fullScreen - Whether to render as full-screen overlay
 * @param {string} props.size - Spinner size: 'sm' or 'md' (default: 'md')
 */
const Loading = ({ text = 'Loading...', fullScreen = false, size = 'md' }) => {
  // Convert size prop to Bootstrap spinner size
  const spinnerSize = size === 'sm' ? 'sm' : undefined;

  // Full-screen loading overlay
  if (fullScreen) {
    return (
      <div className="loading-fullscreen d-flex flex-column justify-content-center align-items-center min-vh-100">
        {/* Large spinner for full-screen */}
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        {/* Loading text below spinner */}
        <p className="mt-3 text-muted">{text}</p>
      </div>
    );
  }

  // Inline loading indicator
  return (
    <div className="loading-container d-flex flex-column justify-content-center align-items-center py-5">
      {/* Standard spinner */}
      <Spinner animation="border" variant="primary" size={spinnerSize} />
      {/* Optional text message */}
      {text && <p className="mt-2 text-muted mb-0">{text}</p>}
    </div>
  );
};

/**
 * LoadingButton Component
 * Button that shows loading spinner when in loading state
 * Disables click while loading
 *
 * @param {Object} props - Component props
 * @param {boolean} props.loading - Whether button is in loading state
 * @param {React.ReactNode} props.children - Button content when not loading
 */
export const LoadingButton = ({ loading, children, ...props }) => {
  return (
    // Native button with disabled state during loading
    <button {...props} disabled={loading || props.disabled}>
      {loading ? (
        // Loading state: spinner and text
        <>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
            className="me-2"
          />
          Loading...
        </>
      ) : (
        // Normal state: render children
        children
      )}
    </button>
  );
};

/**
 * CardSkeleton Component
 * Placeholder skeleton for card content while loading
 * Shows gray blocks mimicking card layout
 */
export const CardSkeleton = () => (
  <div className="card skeleton-card">
    {/* Skeleton image placeholder */}
    <div className="skeleton-img bg-secondary" style={{ height: '200px' }}></div>
    <div className="card-body">
      {/* Skeleton text lines */}
      <div className="skeleton-line bg-secondary mb-2" style={{ height: '20px', width: '70%' }}></div>
      <div className="skeleton-line bg-secondary mb-2" style={{ height: '16px', width: '50%' }}></div>
      <div className="skeleton-line bg-secondary" style={{ height: '16px', width: '30%' }}></div>
    </div>
  </div>
);

// Export Loading as default component
export default Loading;
