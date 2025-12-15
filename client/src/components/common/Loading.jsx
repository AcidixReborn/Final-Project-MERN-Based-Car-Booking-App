import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loading = ({ text = 'Loading...', fullScreen = false, size = 'md' }) => {
  const spinnerSize = size === 'sm' ? 'sm' : undefined;

  if (fullScreen) {
    return (
      <div className="loading-fullscreen d-flex flex-column justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <p className="mt-3 text-muted">{text}</p>
      </div>
    );
  }

  return (
    <div className="loading-container d-flex flex-column justify-content-center align-items-center py-5">
      <Spinner animation="border" variant="primary" size={spinnerSize} />
      {text && <p className="mt-2 text-muted mb-0">{text}</p>}
    </div>
  );
};

export const LoadingButton = ({ loading, children, ...props }) => {
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading ? (
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
        children
      )}
    </button>
  );
};

export const CardSkeleton = () => (
  <div className="card skeleton-card">
    <div className="skeleton-img bg-secondary" style={{ height: '200px' }}></div>
    <div className="card-body">
      <div className="skeleton-line bg-secondary mb-2" style={{ height: '20px', width: '70%' }}></div>
      <div className="skeleton-line bg-secondary mb-2" style={{ height: '16px', width: '50%' }}></div>
      <div className="skeleton-line bg-secondary" style={{ height: '16px', width: '30%' }}></div>
    </div>
  </div>
);

export default Loading;
