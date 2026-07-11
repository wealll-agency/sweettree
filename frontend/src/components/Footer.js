'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }} className="pt-5 pb-3 mt-5">
      <div className="container">
        <div className="row mb-5">
          {/* Logo and About Section */}
          <div className="col-lg-4 col-md-12 mb-4 mb-lg-0">
            <Link href="/" className="d-inline-block mb-4">
              <img src="/footer_logo.png" alt="Sweettree" style={{ maxWidth: '200px' }} />
            </Link>
            <p className="mb-4" style={{ color: '#888', fontSize: '14px', lineHeight: '1.6', maxWidth: '300px' }}>
              Sweettree brings you a collection of carefully selected foods from India and across the world.
            </p>
            <div className="d-flex align-items-center gap-3 mb-4">
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>+91 9748724689</span>
              <img src="/fssai_logo.png" alt="FSSAI" style={{ height: '30px', backgroundColor: '#fff', padding: '2px', borderRadius: '4px' }} />
            </div>

            {/* Social Icons */}
            <div className="d-flex align-items-center gap-3">
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Follow Us:</span>
              <a href="#" className="text-white text-opacity-75 text-decoration-none hover-white"><i className="fab fa-facebook-f fs-5"></i></a>
              <a href="#" className="text-white text-opacity-75 text-decoration-none hover-white"><i className="fab fa-twitter fs-5"></i></a>
              <a href="#" className="text-white text-opacity-75 text-decoration-none hover-white"><i className="fab fa-instagram fs-5"></i></a>
              <a href="#" className="text-white text-opacity-75 text-decoration-none hover-white"><i className="fab fa-youtube fs-5"></i></a>
              <a href="#" className="text-white text-opacity-75 text-decoration-none hover-white"><i className="fas fa-envelope fs-5"></i></a>
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
              <li><Link href="/products" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>Product</Link></li>
              <li><Link href="/user/orders" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>Track Order</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="col-lg-2 col-md-3 col-6 mb-4 mb-md-0">
            <h6 className="mb-4" style={{ fontSize: '16px', fontWeight: 'bold' }}>Categories</h6>
            <ul className="list-unstyled d-flex flex-column gap-3">
              <li><Link href="/products?category=Dry Fruits" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>Dry Fruits</Link></li>
              <li><Link href="/products?category=Flavoured Nuts" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>Flavoured Nuts</Link></li>
              <li><Link href="/products?category=Seeds And Berries" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>Seeds And Berries</Link></li>
              <li><Link href="/products?category=Healthy Snacking" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>Healthy Snacking</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-4 d-flex flex-column flex-md-row justify-content-between align-items-center" style={{ borderTop: '1px solid #333' }}>
          <div className="mb-3 mb-md-0" style={{ color: '#888', fontSize: '12px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '5px' }}>
            Sweettree © 2026 All Rights Reserved 
            <img src="/heart.webp" alt="love" style={{ width: '14px', height: '14px' }} /> 
            and developed by 
            <img src="/Wealll_new.webp" alt="We All" style={{ height: '20px', objectFit: 'contain' }} />
          </div>
          
          <div className="d-flex align-items-center gap-2">
            <img src="/payment1.png" alt="Payment 1" style={{ height: '24px', objectFit: 'contain' }} />
            <img src="/payment2.png" alt="Payment 2" style={{ height: '24px', objectFit: 'contain' }} />
            <img src="/payment3.png" alt="Payment 3" style={{ height: '24px', objectFit: 'contain' }} />
            <img src="/payment4.png" alt="Payment 4" style={{ height: '24px', objectFit: 'contain' }} />
            <img src="/payment5.png" alt="Payment 5" style={{ height: '24px', objectFit: 'contain' }} />
          </div>
        </div>
      </div>
    </footer>
  );
}
