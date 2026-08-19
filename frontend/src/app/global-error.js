'use client';

import React, { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Global Error caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#333' }}>Something went wrong</h1>
          <p style={{ color: '#666', marginBottom: '2rem' }}>We apologize for the inconvenience. A critical error occurred.</p>
          <button 
            onClick={() => reset()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4f8634',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
