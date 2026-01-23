'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <div className="card" style={{ maxWidth: '500px' }}>
        <h2 style={{ marginBottom: '15px', fontSize: '24px' }}>
          Something went wrong!
        </h2>
        <p style={{ color: '#888', marginBottom: '20px' }}>
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          className="btn-primary"
          onClick={reset}
          style={{ marginBottom: '10px' }}
        >
          Try again
        </button>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            background: '#3a3a3c',
            color: 'white',
            padding: '14px',
            borderRadius: '12px',
            border: 'none',
            width: '100%',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}