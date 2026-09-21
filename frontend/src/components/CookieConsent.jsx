'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem('sweettree_cookies_accepted');
    if (!hasAccepted) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('sweettree_cookies_accepted', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div 
      className="fixed-bottom bg-dark text-white p-3 d-flex flex-column flex-md-row justify-content-between align-items-center shadow-lg" 
      style={{ zIndex: 1050, borderTop: '2px solid #2db34a' }}
    >
      <div className="mb-3 mb-md-0 me-md-4 text-center text-md-start" style={{ fontSize: '0.9rem' }}>
        <strong className="d-block mb-1" style={{ color: '#2db34a' }}>Cookie Preferences</strong>
        We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking &quot;Accept&quot;, you consent to our use of cookies.
      </div>
      <div className="d-flex gap-2">
        <Link href="/privacy" className="btn btn-outline-light btn-sm">
          Privacy Policy
        </Link>
        <button className="btn btn-sm text-white fw-bold px-4" style={{ backgroundColor: '#2db34a' }} onClick={handleAccept}>
          Accept
        </button>
      </div>
    </div>
  );
}
