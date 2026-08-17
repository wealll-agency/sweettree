'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('sweettree_cookie_consent');
    if (!consent) {
      // Small delay to make the entrance feel more natural, exactly like enterprise sites
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('sweettree_cookie_consent', 'accepted');
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem('sweettree_cookie_consent', 'declined');
    setShow(false);
  };

  if (!show) return null;

  return (
    <>
      <div 
        className="cookie-consent-popup position-fixed shadow-lg" 
        style={{
          bottom: '24px',
          left: '24px',
          maxWidth: '420px',
          width: 'calc(100% - 48px)',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid rgba(0,0,0,0.08)',
          zIndex: 9999
        }}
      >
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center gap-3">
            <div className="p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(79, 134, 52, 0.1)', color: '#4f8634' }}>
              <Cookie size={24} />
            </div>
            <h5 className="mb-0 fw-bold text-dark" style={{ fontFamily: 'var(--font-outfit)' }}>We value your privacy</h5>
          </div>
          <button onClick={handleDecline} className="btn-close shadow-none mt-1" style={{ fontSize: '0.75rem' }} aria-label="Close"></button>
        </div>
        
        <p className="text-muted fs-7 mb-4" style={{ lineHeight: '1.6' }}>
          We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. <Link href="/privacy-policy" className="fw-semibold text-decoration-none" style={{ color: '#4f8634' }}>Read more</Link>
        </p>

        <div className="d-flex gap-2">
          <button 
            onClick={handleDecline}
            className="btn btn-outline-secondary w-100 fw-medium rounded-pill"
            style={{ fontSize: '14px', padding: '10px 0' }}
          >
            Decline
          </button>
          <button 
            onClick={handleAccept}
            className="btn w-100 fw-medium rounded-pill shadow-sm"
            style={{ backgroundColor: '#4f8634', color: '#fff', fontSize: '14px', padding: '10px 0', border: 'none' }}
          >
            Accept All
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .cookie-consent-popup {
          animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 576px) {
          .cookie-consent-popup {
            bottom: 16px !important;
            left: 16px !important;
            width: calc(100% - 32px) !important;
            max-width: 100% !important;
          }
        }
      `}} />
    </>
  );
}
