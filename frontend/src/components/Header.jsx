'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/authSlice';
import { useRouter } from 'next/navigation';

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const wishlistCount = wishlistItems.length;
  
  const { items: cartItems, total: cartTotal } = useSelector((state) => state.cart);
  const cartCount = cartItems ? cartItems.reduce((acc, item) => acc + item.quantity, 0) : 0;
  
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch(logoutUser());
    router.push('/login');
  };

  return (
    <header className="main-header">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-3 col-6">
            <Link href="/">
              <img src="/logo.png" alt="Sweettree Logo" className="brand-logo" />
            </Link>
          </div>

          <div className="col-lg-6 d-none d-lg-block">
            <ul className="d-flex justify-content-center align-items-center m-0 p-0" style={{ listStyle: 'none', gap: '30px', fontSize: '14px', whiteSpace: 'nowrap' }}>
              <li><Link href="/" className="premium-nav-link">HOME</Link></li>
              <li><Link href="/shop" className="premium-nav-link">SHOP</Link></li>
              <li><Link href="/build-combo" className="premium-nav-link">COMBO GIFT BOX</Link></li>
              <li><Link href="/about" className="premium-nav-link">ABOUT</Link></li>
              <li><Link href="/blog" className="premium-nav-link">BLOG</Link></li>
              <li><Link href="/contact" className="premium-nav-link">CONTACT</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-6 d-flex justify-content-end header-icons gap-4">
            <Link href="#" className="header-icon-box d-none d-md-flex text-decoration-none" onClick={(e) => { e.preventDefault(); setIsSearchOpen(!isSearchOpen); }}>
              <i className="fas fa-search"></i>
            </Link>
            <div className="dropdown d-none d-md-flex">
              <Link href="#" className="header-icon-box text-decoration-none" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i className="far fa-user"></i>
              </Link>
              {user ? (
                <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2" style={{ minWidth: '150px', borderRadius: '8px' }}>
                  {user?.role === 'Super Admin' || user?.role === 'admin' ? (
                    <li>
                      <Link href="/admin/dashboard" className="dropdown-item d-flex align-items-center gap-2 py-2" style={{ fontSize: '14px', color: '#333' }}>
                        <i className="fas fa-tachometer-alt text-muted" style={{ width: '16px' }}></i> Admin Panel
                      </Link>
                    </li>
                  ) : null}
                  <li>
                    <Link href="/user/profile" className="dropdown-item d-flex align-items-center gap-2 py-2" style={{ fontSize: '14px', color: '#333' }}>
                      <i className="far fa-user-circle text-muted" style={{ width: '16px' }}></i> Profile Settings
                    </Link>
                  </li>
                  <li>
                    <Link href="/user/orders" className="dropdown-item d-flex align-items-center gap-2 py-2" style={{ fontSize: '14px', color: '#333' }}>
                      <i className="fas fa-box text-muted" style={{ width: '16px' }}></i> My Orders
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link href="#" onClick={handleLogout} className="dropdown-item d-flex align-items-center gap-2 py-2" style={{ fontSize: '14px', color: '#dc3545' }}>
                      <i className="fas fa-sign-out-alt text-danger" style={{ width: '16px' }}></i> Log Out
                    </Link>
                  </li>
                </ul>
              ) : (
                <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2" style={{ minWidth: '150px', borderRadius: '8px' }}>
                  <li>
                    <Link href="/login" className="dropdown-item d-flex align-items-center gap-2 py-2" style={{ fontSize: '14px', color: '#333' }}>
                      <i className="fas fa-sign-in-alt text-muted" style={{ width: '16px' }}></i> Sign in
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="dropdown-item d-flex align-items-center gap-2 py-2" style={{ fontSize: '14px', color: '#333' }}>
                      <i className="far fa-user-circle text-muted" style={{ width: '16px' }}></i> Sign up
                    </Link>
                  </li>
                </ul>
              )}
            </div>
            <Link href="/wishlist" className="header-icon-box d-none d-md-flex text-decoration-none">
              <div className="position-relative">
                <i className="far fa-heart"></i>
                {wishlistCount > 0 && <span className="cart-badge bg-danger">{wishlistCount}</span>}
              </div>
            </Link>
            <Link href="#" className="header-icon-box text-decoration-none position-relative d-flex align-items-center" onClick={(e) => e.preventDefault()} data-bs-toggle="offcanvas" data-bs-target="#cartOffcanvas">
              <div className="position-relative">
                <i className="fas fa-shopping-basket"></i>
                <span className="cart-badge">{cartCount}</span>
              </div>
              <div className="ms-2 d-none d-xl-block">
                <span className="d-block text-white" style={{ fontSize: '11px', lineHeight: '1', opacity: 0.8 }}>Shopping cart:</span>
                <span className="cart-amount text-white fw-bold">₹{cartTotal ? cartTotal.toFixed(2) : '0.00'}</span>
              </div>
            </Link>
            <Link href="#" className="header-icon-box d-lg-none text-decoration-none" data-bs-toggle="offcanvas" data-bs-target="#mobileMenu">
              <i className="fas fa-bars"></i>
            </Link>
          </div>
        </div>
      </div>

      {isSearchOpen && (
        <div className="position-absolute w-100 bg-white shadow-sm border-top" style={{ top: '100%', left: 0, zIndex: 1000, padding: '15px 0' }}>
          <div className="container">
            <form className="header-search-form mx-auto" style={{ maxWidth: '600px' }}>
              <select defaultValue="All Categories">
                <option value="All Categories">All Categories</option>
                <option value="Nuts">Nuts</option>
                <option value="Seeds">Seeds</option>
                <option value="Dates">Dates</option>
              </select>
              <input type="text" placeholder="Search products" />
              <button type="submit">SEARCH</button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
