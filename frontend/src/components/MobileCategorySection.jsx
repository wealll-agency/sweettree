'use client';
import React, { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Categories matching the live version exactly
const CATEGORIES = [
  { name: 'Nuts',         icon: 'fa-solid fa-leaf',        borderColor: '#d37d6e', href: '/shop?category=Nuts' },
  { name: 'Berries',      icon: 'fa-solid fa-lemon',       borderColor: '#e46682', href: '/shop?category=Berries' },
  { name: 'Dried Fruits', icon: 'fa-solid fa-apple-whole', borderColor: '#e8b948', href: '/shop?category=Dried+Fruits' },
  { name: 'Seeds',        icon: 'fa-solid fa-seedling',    borderColor: '#7eb672', href: '/shop?category=Seeds' },
  { name: 'Mixes',        icon: 'fa-solid fa-bowl-food',   borderColor: '#6691c2', href: '/shop?category=Mixes' },
];

const MobileCategorySection = () => {
  return (
    <div className="mcs-wrapper py-3 px-2 bg-white">
      <div className="text-center mb-3">
        <h2 className="fw-bold fs-5 text-dark m-0" style={{ fontFamily: 'sans-serif' }}>Shop by Category</h2>
      </div>
      <div className="d-flex flex-nowrap justify-content-center gap-2 px-1">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.name}
            href={cat.href}
            className="text-decoration-none text-dark d-flex justify-content-center"
            style={{ flex: '1 1 0', minWidth: 0 }}
          >
            <div
              className="category-squircle"
              style={{
                borderColor: cat.borderColor,
                '--cat-color': cat.borderColor,
                width: '100%',
                maxWidth: '68px',
                height: '68px',
                borderRadius: '18px',
                border: `1.5px solid ${cat.borderColor}`,
                backgroundColor: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px 2px',
                boxSizing: 'border-box'
              }}
            >
              <div
                className="category-icon-circle"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  border: '1px solid #333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '3px'
                }}
              >
                <i className={`${cat.icon}`} style={{ fontSize: '13px', color: '#111' }} />
              </div>
              <span
                className="category-name-text text-truncate"
                style={{
                  fontSize: '9px',
                  fontWeight: '700',
                  color: '#111',
                  maxWidth: '100%',
                  lineHeight: '1.1'
                }}
              >
                {cat.name}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile Trust Banner (Shipping, Payment, Quality, Rewards) */}
      <div
        className="mt-3 mx-1 p-3 text-center text-white"
        style={{
          background: 'radial-gradient(50% 1294.07% at 50% 49.98%, #240000 0%, #000000 100%)',
          borderRadius: '16px',
        }}
      >
        <div className="row g-0 m-0">
          <div
            className="col-6 d-flex flex-column align-items-center justify-content-center p-2"
            style={{ borderRight: '1px solid rgba(255,255,255,0.15)', borderBottom: '1px solid rgba(255,255,255,0.15)' }}
          >
            <Image src="/shipping_icon1.gif" alt="Shipping" width={38} height={38} className="mb-2" style={{ maxHeight: '38px', width: 'auto' }} unoptimized />
            <div style={{ fontSize: '10px', fontWeight: '500', lineHeight: '1.3' }}>
              Free Shipping On<br />Orders Above ₹1499
            </div>
          </div>
          <div
            className="col-6 d-flex flex-column align-items-center justify-content-center p-2"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}
          >
            <Image src="/shipping_icon2.gif" alt="Payment" width={38} height={38} className="mb-2" style={{ maxHeight: '38px', width: 'auto' }} unoptimized />
            <div style={{ fontSize: '10px', fontWeight: '500', lineHeight: '1.3' }}>
              Pay<br />On Delivery
            </div>
          </div>
          <div
            className="col-6 d-flex flex-column align-items-center justify-content-center p-2"
            style={{ borderRight: '1px solid rgba(255,255,255,0.15)' }}
          >
            <Image src="/shipping_icon3.gif" alt="Quality" width={38} height={38} className="mb-2" style={{ maxHeight: '38px', width: 'auto' }} unoptimized />
            <div style={{ fontSize: '10px', fontWeight: '500', lineHeight: '1.3' }}>
              100% Quality<br />Guaranteed
            </div>
          </div>
          <div
            className="col-6 d-flex flex-column align-items-center justify-content-center p-2"
          >
            <Image src="/shipping_icon4.gif" alt="Rewards" width={38} height={38} className="mb-2" style={{ maxHeight: '38px', width: 'auto' }} unoptimized />
            <div style={{ fontSize: '10px', fontWeight: '500', lineHeight: '1.3' }}>
              Reward Points<br />On Every Purchase
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(MobileCategorySection);

