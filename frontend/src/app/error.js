'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error("Next.js Application Error:", error);
  }, [error]);

  return (
    <div className="container-fluid px-4 px-lg-5 py-5 d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="glass-card p-5 text-center" style={{ maxWidth: '600px' }}>
        <div className="rounded-circle p-3 bg-danger bg-opacity-10 text-danger d-inline-block mb-4">
          <i className="fas fa-exclamation-triangle" style={{ fontSize: '32px' }}></i>
        </div>
        <h2 className="fw-bold display-font text-dark mb-3">Something went wrong</h2>
        <p className="text-muted mb-4">
          We encountered an unexpected error while loading this page. Our technical team has been notified.
        </p>
        <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
          <button
            onClick={() => reset()}
            className="btn btn-brand d-inline-flex align-items-center justify-content-center gap-2"
          >
            <i className="fas fa-redo-alt"></i> Try Again
          </button>
          <Link href="/" className="btn btn-brand-outline d-inline-flex align-items-center justify-content-center gap-2">
            <i className="fas fa-home"></i> Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
