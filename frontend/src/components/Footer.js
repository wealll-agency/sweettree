'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }} className="pt-5 pb-3 mt-5">
      <div className="container">
        <div className="row mb-5">
          {/* Logo and About Section */}
          <div className="col-lg-4 col-md-12 mb-4 mb-lg-0">
            <Link href="/" className="d-inline-block mb-4">
              <Image src="/footer_logo.png" alt="Sweettree" width={200} height={56} style={{ maxWidth: '200px', height: 'auto', width: 'auto' }} priority />
            </Link>
            <p className="mb-4" style={{ color: '#888', fontSize: '14px', lineHeight: '1.6', maxWidth: '300px' }}>
              Sweettree brings you a collection of carefully selected foods from India and across the world.
            </p>
            <div className="d-flex align-items-center gap-3 mb-4">
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>+91 9748724689</span>
              <Image src="/fssai_logo.png" alt="FSSAI" width={80} height={30} style={{ height: '30px', width: 'auto', backgroundColor: '#fff', padding: '2px', borderRadius: '4px' }} />
            </div>

            {/* Social Icons */}
            <div className="d-flex align-items-center gap-3">
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Follow Us:</span>
              <a href="https://www.facebook.com/sweettreeon/" target="_blank" rel="noopener noreferrer" className="text-white text-opacity-75 text-decoration-none hover-white"><i className="fab fa-facebook-f fs-5"></i></a>
              <a href="https://twitter.com/sweettreeon" target="_blank" rel="noopener noreferrer" className="text-white text-opacity-75 text-decoration-none hover-white"><i className="fab fa-twitter fs-5"></i></a>
              <a href="https://www.instagram.com/sweettreeon/" target="_blank" rel="noopener noreferrer" className="text-white text-opacity-75 text-decoration-none hover-white"><i className="fab fa-instagram fs-5"></i></a>
              <a href="https://www.youtube.com/@sweettreeon" target="_blank" rel="noopener noreferrer" className="text-white text-opacity-75 text-decoration-none hover-white"><i className="fab fa-youtube fs-5"></i></a>
              <a href="mailto:info@sweettreeon.com" className="text-white text-opacity-75 text-decoration-none hover-white"><i className="fas fa-envelope fs-5"></i></a>
            </div>
          </div>

          {/* My Account */}
          <div className="col-lg-2 col-md-3 col-6 mb-4 mb-md-0">
            <h6 className="mb-4" style={{ fontSize: '16px', fontWeight: 'bold' }}>My Account</h6>
            <ul className="list-unstyled d-flex flex-column gap-3">
              <li><Link href="/user/profile" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>My Account</Link></li>
              <li><Link href="/user/orders" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>Order History</Link></li>
              <li><a href="#" data-bs-toggle="offcanvas" data-bs-target="#cartOffcanvas" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }} onClick={(e) => e.preventDefault()}>Shopping Cart</a></li>
              <li><Link href="/wishlist" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>Wishlist</Link></li>
            </ul>
          </div>

          {/* Helps */}
          <div className="col-lg-2 col-md-3 col-6 mb-4 mb-md-0">
            <h6 className="mb-4" style={{ fontSize: '16px', fontWeight: 'bold' }}>Helps</h6>
            <ul className="list-unstyled d-flex flex-column gap-3">
              <li><Link href="/contact" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>Contact</Link></li>
              <li><Link href="#" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>Faqs</Link></li>
              <li><Link href="#" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>Terms & Condition</Link></li>
              <li><Link href="#" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Proxy */}
          <div className="col-lg-2 col-md-3 col-6 mb-4 mb-md-0">
            <h6 className="mb-4" style={{ fontSize: '16px', fontWeight: 'bold' }}>Proxy</h6>
            <ul className="list-unstyled d-flex flex-column gap-3">
              <li><Link href="/about" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>About</Link></li>
              <li><Link href="/shop" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>Shop</Link></li>
              <li><Link href="/contact" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>Contact</Link></li>
              <li><Link href="/user/orders" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>Track Order</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="col-lg-2 col-md-3 col-6 mb-4 mb-md-0">
            <h6 className="mb-4" style={{ fontSize: '16px', fontWeight: 'bold' }}>Categories</h6>
            <ul className="list-unstyled d-flex flex-column gap-3">
              <li><Link href="/shop?category=Dry%20Fruits" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>Dry Fruits</Link></li>
              <li><Link href="/shop?category=Top%20Selling%20Products" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>Top Selling Products</Link></li>
              <li><Link href="/shop?category=Whole%20Spices" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>Whole Spices</Link></li>
              <li><Link href="/shop?category=Healthy%20Snacking" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>Healthy Snacking</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-4 d-flex flex-column flex-md-row justify-content-between align-items-center" style={{ borderTop: '1px solid #333' }}>
          <div className="mb-3 mb-md-0" style={{ color: '#888', fontSize: '12px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '5px' }}>
            Sweettree © 2026 All Rights Reserved | v1.0.0 
            and developed by 
            <Image src="/Wealll_new.webp" alt="We All" width={60} height={20} style={{ objectFit: 'contain' }} />
          </div>
          
          <div className="d-flex align-items-center gap-2">
            <Image src="/payment1.png" alt="Payment 1" width={40} height={24} style={{ objectFit: 'contain' }} />
            <Image src="/payment2.png" alt="Payment 2" width={40} height={24} style={{ objectFit: 'contain' }} />
            <Image src="/payment3.png" alt="Payment 3" width={40} height={24} style={{ objectFit: 'contain' }} />
            <Image src="/payment4.png" alt="Payment 4" width={40} height={24} style={{ objectFit: 'contain' }} />
            <Image src="/payment5.png" alt="Payment 5" width={40} height={24} style={{ objectFit: 'contain' }} />
          </div>
        </div>
      </div>
    </footer>
  );
}
export default memo(Footer);
