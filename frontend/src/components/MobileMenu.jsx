import React from 'react';
import Link from 'next/link';

const MobileMenu = () => {
  return (
    <div className="offcanvas offcanvas-start" tabIndex="-1" id="mobileMenu" aria-labelledby="mobileMenuLabel">
      <div className="offcanvas-header" style={{ backgroundColor: '#004c03', color: 'white' }}>
        <h5 className="offcanvas-title fw-bold" id="mobileMenuLabel">Sweettree</h5>
        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div className="offcanvas-body p-0">
        <ul className="list-group list-group-flush mobile-nav-links">
          <li className="list-group-item">
            <Link href="/" className="d-block py-2 text-dark text-decoration-none fw-bold" data-bs-dismiss="offcanvas">
              <i className="fas fa-home me-2 text-muted"></i>HOME
            </Link>
          </li>
          <li className="list-group-item">
            <Link className="d-flex justify-content-between align-items-center py-2 text-dark text-decoration-none fw-bold" href="/shop" data-bs-dismiss="offcanvas">
              <span><i className="fas fa-shopping-bag me-2 text-muted"></i>SHOP</span>
            </Link>
          </li>
          <li className="list-group-item">
            <Link href="/products?category=Combo Gift Box" className="d-block py-2 text-dark text-decoration-none fw-bold" data-bs-dismiss="offcanvas">
              <i className="fas fa-gift me-2 text-muted"></i>COMBO GIFT BOX
            </Link>
          </li>
          <li className="list-group-item">
            <Link href="/about" className="d-block py-2 text-dark text-decoration-none fw-bold" data-bs-dismiss="offcanvas">
              <i className="fas fa-info-circle me-2 text-muted"></i>ABOUT
            </Link>
          </li>
          <li className="list-group-item">
            <Link href="/blog" className="d-block py-2 text-dark text-decoration-none fw-bold" data-bs-dismiss="offcanvas">
              <i className="fas fa-blog me-2 text-muted"></i>BLOG
            </Link>
          </li>
          <li className="list-group-item">
            <Link href="/contact" className="d-block py-2 text-dark text-decoration-none fw-bold" data-bs-dismiss="offcanvas">
              <i className="fas fa-phone-alt me-2 text-muted"></i>CONTACT
            </Link>
          </li>
        </ul>
        <div className="p-3 bg-light mt-3">
          <div className="d-flex justify-content-around">
            <Link href="/user/profile" className="text-dark bg-white rounded-circle p-2 shadow-sm"><i className="far fa-user"></i></Link>
            <Link href="/wishlist" className="text-dark bg-white rounded-circle p-2 shadow-sm"><i className="far fa-heart"></i></Link>
            <a href="https://wa.me/919748724689" target="_blank" rel="noopener noreferrer" className="text-dark bg-white rounded-circle p-2 shadow-sm"><i className="fab fa-whatsapp"></i></a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
