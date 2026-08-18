'use client';

import { useEffect } from 'react';

export default function ChunkErrorHandler() {
  useEffect(() => {
    // Handler for unhandled promise rejections (often how ChunkLoadError manifests in modern Next.js/Webpack)
    const handleUnhandledRejection = (event) => {
      if (event.reason && (event.reason.name === 'ChunkLoadError' || (event.reason.message && event.reason.message.includes('Loading chunk')))) {
        console.warn('ChunkLoadError detected (unhandledrejection). Reloading page to fetch latest assets...');
        window.location.reload();
      }
    };

    // Handler for standard window errors
    const handleError = (event) => {
      if (event.message && (event.message.includes('ChunkLoadError') || event.message.includes('Loading chunk'))) {
        console.warn('ChunkLoadError detected (error event). Reloading page to fetch latest assets...');
        window.location.reload();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null;
}
