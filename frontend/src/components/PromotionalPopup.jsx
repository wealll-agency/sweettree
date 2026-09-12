'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { addToCart } from '../store/cartSlice';
import api from '../utils/axiosConfig';

// Inline styles for the popup — completely self-contained, no global CSS changes
// Inline styles for the popup — premium, compact, and completely self-contained
const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(10, 47, 29, 0.4)',
    backdropFilter: 'blur(8px)',
    zIndex: 9998,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    animation: 'ppBackdropIn 0.4s ease forwards',
  },
  popup: {
    position: 'relative',
    background: 'linear-gradient(145deg, #ffffff 0%, #f4fcf7 100%)',
    borderRadius: '24px',
    boxShadow: '0 40px 100px -20px rgba(10, 47, 29, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.9)',
    width: '100%',
    maxWidth: '420px',
    overflow: 'hidden', // Prevent scrolling
    animation: 'ppSlideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
    outline: 'none',
  },
  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    zIndex: 10,
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#0A2F1D',
    transition: 'transform 0.2s ease, backgroundColor 0.2s ease',
  },
  badge: {
    display: 'inline-block',
    background: 'linear-gradient(90deg, #0A2F1D 0%, #115e59 100%)',
    color: '#fff',
    borderRadius: '30px',
    padding: '6px 16px',
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '10px',
    boxShadow: '0 4px 10px rgba(10, 47, 29, 0.2)',
  },
  imageWrap: {
    width: '100%',
    borderRadius: '16px',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    position: 'relative',
    aspectRatio: '16/10', // Wider aspect ratio saves vertical space
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    marginBottom: '16px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 900,
    color: '#0A2F1D',
    lineHeight: 1.2,
    margin: '0 0 4px',
  },
  subtitle: {
    fontSize: '13px',
    color: '#4b5563',
    margin: '0 0 14px',
    fontWeight: 500,
  },
  benefit: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#374151',
    fontWeight: 600,
    marginBottom: '6px',
  },
  dot: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '4px',
    marginBottom: '12px',
  },
  price: {
    fontSize: '26px',
    fontWeight: 900,
    color: '#0A2F1D',
  },
  mrp: {
    fontSize: '14px',
    color: '#9ca3af',
    textDecoration: 'line-through',
    fontWeight: 600,
  },
  saveBadge: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
    borderRadius: '8px',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: 800,
    boxShadow: '0 2px 6px rgba(245, 158, 11, 0.15)',
  },
  promoMsg: {
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: '10px',
    padding: '10px',
    fontSize: '12px',
    color: '#065f46',
    fontWeight: 600,
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  addToCartBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(90deg, #0A2F1D 0%, #166534 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '14px',
    fontWeight: 800,
    fontSize: '15px',
    cursor: 'pointer',
    letterSpacing: '0.5px',
    boxShadow: '0 8px 20px rgba(10, 47, 29, 0.25)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  viewMoreBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'transparent',
    color: '#0A2F1D',
    border: '2px solid rgba(10, 47, 29, 0.2)',
    borderRadius: '14px',
    fontWeight: 700,
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
  },
};

// CSS keyframes including the Celebration Confetti animation
const KEYFRAMES = `
@keyframes ppBackdropIn {
  from { opacity: 0; backdrop-filter: blur(0px); }
  to { opacity: 1; backdrop-filter: blur(8px); }
}
@keyframes ppSlideIn {
  from { opacity: 0; transform: scale(0.9) translateY(40px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes ppConfettiFall {
  0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}
.pp-confetti {
  position: absolute;
  top: -50px;
  width: 10px;
  height: 22px;
  border-radius: 4px;
  animation-name: ppConfettiFall;
  animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation-fill-mode: forwards;
  z-index: 9999;
}
@media (prefers-reduced-motion: reduce) {
  @keyframes ppBackdropIn { from { opacity: 1; } }
  @keyframes ppSlideIn { from { opacity: 1; transform: none; } }
  .pp-confetti { display: none; }
}
`;

function slugify(text) {
  if (!text) return '';
  return text.toString().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export default function PromotionalPopup() {
  const [popup, setPopup] = useState(null);
  const [visible, setVisible] = useState(false);
  const [added, setAdded] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const popupRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Only show on the Home Page
    if (pathname !== '/') return;

    let cancelled = false;

    const fetchAndShow = async () => {
      try {
        const res = await api.get('/promotional-popups/active');
        if (cancelled) return;

        const data = res.data?.popup;
        if (!data) return;

        // Strictly show only once per browser session
        const sessionKey = 'sweettree_popup_shown_session';
        if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(sessionKey)) {
          return; // Already shown this session
        }

        setPopup(data);

        const delay = typeof data.displayDelayMs === 'number' ? data.displayDelayMs : 1500;
        timerRef.current = setTimeout(() => {
          if (!cancelled) {
            setVisible(true);
            // Mark as shown in sessionStorage unconditionally
            if (typeof sessionStorage !== 'undefined') {
              try {
                sessionStorage.setItem(sessionKey, '1');
              } catch {}
            }
          }
        }, delay);
      } catch {
        // Silent fail — homepage must not break if popup API fails
      }
    };

    fetchAndShow();

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Escape key to close
  useEffect(() => {
    if (!visible) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleKey);
    // Trap focus in popup for accessibility
    if (popupRef.current) popupRef.current.focus();
    return () => document.removeEventListener('keydown', handleKey);
  }, [visible]);

  const close = useCallback(() => setVisible(false), []);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) close();
  }, [close]);

  const handleAddToCart = useCallback(() => {
    if (!popup) return;

    if (popup.popupType === 'combo' && popup.comboRef) {
      dispatch(addToCart({
        combo: popup.comboRef,
        itemType: 'Combo',
        quantity: 1,
        size: 'Standard',
      }));
    } else if (popup.popupType === 'product' && popup.productRef) {
      const p = popup.productRef;
      let finalPrice = p.price;
      if (p.discount > 0) {
        finalPrice = p.discountType === 'Percent'
          ? Math.round(p.price * (1 - p.discount / 100))
          : Math.max(0, p.price - p.discount);
      }
      dispatch(addToCart({
        product: {
          _id: p._id,
          name: p.name,
          price: finalPrice,
          discount: 0,
          images: p.images || [],
          stock: p.stock || 100,
        },
        quantity: 1,
        size: p.unit || 'Default',
      }));
    } else {
      return;
    }

    // Open cart offcanvas — identical to ProductCard.jsx and build-combo/page.js
    if (typeof window !== 'undefined' && window.bootstrap) {
      const offcanvas = document.getElementById('cartOffcanvas');
      if (offcanvas) {
        window.bootstrap.Offcanvas.getOrCreateInstance(offcanvas).show();
      }
    }

    setAdded(true);
    setTimeout(() => close(), 600);
  }, [popup, dispatch, close]);

  const handleViewMore = useCallback(() => {
    if (!popup) return;
    if (popup.popupType === 'combo') {
      router.push('/build-combo');
    } else if (popup.popupType === 'product' && popup.productRef) {
      router.push('/shop-details?' + slugify(popup.productRef.name));
    }
    close();
  }, [popup, router, close]);

  if (!visible || !popup) return null;

  // Resolve display price
  const isCombo = popup.popupType === 'combo';
  const ref = isCombo ? popup.comboRef : popup.productRef;
  if (!ref) return null;

  let displayPrice = isCombo ? ref.comboPrice : ref.price;
  let originalPrice = null;
  let savings = null;

  if (!isCombo && ref.discount > 0) {
    originalPrice = ref.price;
    displayPrice = ref.discountType === 'Percent'
      ? Math.round(ref.price * (1 - ref.discount / 100))
      : Math.max(0, ref.price - ref.discount);
    savings = originalPrice - displayPrice;
  }

  const displayImage = popup.image || (isCombo ? ref.image : ref.images?.[0]) || '/placeholder.png';
  const displayName = ref.name;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />
      <div
        style={styles.backdrop}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-label={`Promotional offer: ${popup.title}`}
      >
        {/* Confetti Celebration Layer */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {Array.from({ length: 45 }).map((_, i) => (
            <div
              key={i}
              className="pp-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#fcd34d', '#34d399', '#f472b6', '#60a5fa', '#a78bfa', '#ef4444'][Math.floor(Math.random() * 6)],
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1.5 + Math.random() * 1.5}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>

        <div
          ref={popupRef}
          style={styles.popup}
          tabIndex={-1}
        >
          {/* Close Button */}
          <button
            style={styles.closeBtn}
            onClick={close}
            aria-label="Close promotional popup"
            title="Close"
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ×
          </button>

          {/* Content */}
          <div style={{ padding: '24px 28px' }}>
            {/* Badge */}
            <div style={{ textAlign: 'center' }}>
              <span style={styles.badge}>{popup.badgeText || '🎁 SURPRISE'}</span>
            </div>

            {/* Heading */}
            <div style={{ textAlign: 'center' }}>
              <h2 style={styles.title}>{popup.title}</h2>
              {popup.subtitle && <p style={styles.subtitle}>{popup.subtitle}</p>}
            </div>

            {/* Product/Combo Image */}
            <div style={styles.imageWrap}>
              <Image
                src={displayImage.startsWith('http') || displayImage.startsWith('/') ? displayImage : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : ''}${displayImage}`}
                alt={displayName}
                fill
                sizes="(max-width: 480px) 100vw, 480px"
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>

            {/* Product Name */}
            <div style={{ marginBottom: '8px' }}>
              <p style={{ fontSize: '15px', fontWeight: 800, color: '#111827', margin: 0 }}>{displayName}</p>
            </div>

            {/* Benefits Row (flex wrap to save space) */}
            {popup.benefits && popup.benefits.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginBottom: '12px' }}>
                {popup.benefits.map((b, i) => (
                  <div key={i} style={styles.benefit}>
                    <span style={styles.dot}>✓</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Price Row */}
            <div style={styles.priceRow}>
              <span style={styles.price}>₹{displayPrice?.toLocaleString('en-IN')}</span>
              {originalPrice && (
                <span style={styles.mrp}>₹{originalPrice.toLocaleString('en-IN')}</span>
              )}
              {savings && savings > 0 && (
                <span style={styles.saveBadge}>SAVE ₹{savings.toLocaleString('en-IN')}</span>
              )}
            </div>

            {/* Promo Message */}
            {popup.promoMessage && (
              <div style={styles.promoMsg}>
                <span style={{ fontSize: '16px' }}>🎉</span> {popup.promoMessage}
              </div>
            )}

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                style={{ ...styles.addToCartBtn, flex: 2, backgroundColor: added ? '#059669' : undefined, background: added ? 'none' : styles.addToCartBtn.background }}
                onClick={handleAddToCart}
                aria-label={`Add ${displayName} to cart`}
              >
                {added ? '✓ Added!' : (popup.ctaText || 'Add to Cart')}
              </button>
              <button
                style={{ ...styles.viewMoreBtn, flex: 1 }}
                onClick={handleViewMore}
                aria-label={`View more details for ${displayName}`}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#0A2F1D'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(10, 47, 29, 0.2)'}
              >
                {popup.viewMoreText || 'Details'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
