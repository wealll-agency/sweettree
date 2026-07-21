import React from 'react';
import Link from 'next/link';
import { Home, ShoppingBag, Gift, Info, BookOpen, Phone, User, Heart, MessageCircle } from 'lucide-react';

const MobileMenu = () => {
  const closeMenu = () => {
    if (typeof window !== 'undefined' && window.bootstrap) {
      const menu = document.getElementById('mobileMenu');
      if (menu) {
        const bsOffcanvas = window.bootstrap.Offcanvas.getInstance(menu);
        if (bsOffcanvas) {
          bsOffcanvas.hide();
        }
      }
    }
  };

  return (
    <div className="offcanvas offcanvas-start" tabIndex="-1" id="mobileMenu" aria-labelledby="mobileMenuLabel">
      <div className="offcanvas-header" style={{ backgroundColor: '#004c03', color: 'white' }}>
        <h5 className="offcanvas-title fw-bold" id="mobileMenuLabel">Sweettree</h5>
        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div className="offcanvas-body p-0">
        <ul className="list-group list-group-flush mobile-nav-links">
          <li className="list-group-item">
            <Link href="/" className="d-flex align-items-center py-2 text-dark text-decoration-none fw-bold gap-2" onClick={closeMenu}>
              <Home size={18} className="text-muted" />HOME
            </Link>
          </li>
          <li className="list-group-item">
            <Link className="d-flex align-items-center py-2 text-dark text-decoration-none fw-bold gap-2" href="/shop" onClick={closeMenu}>
              <ShoppingBag size={18} className="text-muted" />SHOP
            </Link>
          </li>
          <li className="list-group-item">
            <Link href="/build-combo" className="d-flex align-items-center py-2 text-dark text-decoration-none fw-bold gap-2" onClick={closeMenu}>
              <Gift size={18} className="text-muted" />COMBO GIFT BOX
            </Link>
          </li>
          <li className="list-group-item">
            <Link href="/about" className="d-flex align-items-center py-2 text-dark text-decoration-none fw-bold gap-2" onClick={closeMenu}>
              <Info size={18} className="text-muted" />ABOUT
            </Link>
          </li>
          {/*
          <li className="list-group-item">
            <Link href="/blog" className="d-flex align-items-center py-2 text-dark text-decoration-none fw-bold gap-2" onClick={closeMenu}>
              <BookOpen size={18} className="text-muted" />BLOG
            </Link>
          </li>
          */}
          <li className="list-group-item">
            <Link href="/contact" className="d-flex align-items-center py-2 text-dark text-decoration-none fw-bold gap-2" onClick={closeMenu}>
              <Phone size={18} className="text-muted" />CONTACT
            </Link>
          </li>
        </ul>
        <div className="p-3 bg-light mt-3">
          <div className="d-flex justify-content-around">
            <Link href="/user/profile" className="text-dark bg-white rounded-circle p-2 shadow-sm d-flex align-items-center justify-content-center" onClick={closeMenu} style={{ width: '38px', height: '38px' }}>
              <User size={18} />
            </Link>
            <Link href="/wishlist" className="text-dark bg-white rounded-circle p-2 shadow-sm d-flex align-items-center justify-content-center" onClick={closeMenu} style={{ width: '38px', height: '38px' }}>
              <Heart size={18} />
            </Link>
            <a href="https://wa.me/919748724689" target="_blank" rel="noopener noreferrer" className="text-dark bg-white rounded-circle p-2 shadow-sm d-flex align-items-center justify-content-center" onClick={closeMenu} style={{ width: '38px', height: '38px' }}>
              <MessageCircle size={18} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
