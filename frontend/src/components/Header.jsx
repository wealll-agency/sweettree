'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/authSlice';
import { useRouter } from 'next/navigation';

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="main-header">
      <div className="container">
        <div className="row align-items-center">
          {/* Logo */}
          <div className="col-lg-2 col-5">
            <Link href="/">
              <img src="/logo.png" alt="Sweettree Logo" className="brand-logo" />
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="col-lg-7 d-none d-lg-block">
            <ul className="d-flex justify-content-center align-items-center m-0 p-0" style={{ listStyle: 'none', gap: '6px' }}>
              <li>
                <Link href="/" className="premium-nav-link">
                  <span className="nav-icon"><i className="fas fa-home"></i></span>
                  <span className="nav-text">HOME</span>
                </Link>
              </li>
              <li>
                <Link href="/shop" className="premium-nav-link">
                  <span className="nav-icon"><i className="fas fa-store"></i></span>
                  <span className="nav-text">SHOP</span>
                </Link>
              </li>
              <li>
                <Link href="/build-combo" className="premium-nav-link nav-highlight">
                  <span className="nav-icon"><i className="fas fa-gift"></i></span>
                  <span className="nav-text">COMBO BOX</span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="premium-nav-link">
                  <span className="nav-icon"><i className="fas fa-leaf"></i></span>
                  <span className="nav-text">ABOUT</span>
                </Link>
              </li>
              <li>
                <Link href="/blog" className="premium-nav-link">
                  <span className="nav-icon"><i className="fas fa-book-open"></i></span>
                  <span className="nav-text">BLOG</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="premium-nav-link">
                  <span className="nav-icon"><i className="fas fa-envelope"></i></span>
                  <span className="nav-text">CONTACT</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Right Action Icons */}
          <div className="col-lg-3 col-7 d-flex justify-content-end align-items-center" style={{ gap: '8px' }}>
            {/* Search */}
            <button
              className="header-action-btn d-none d-md-flex"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              title="Search"
            >
              <i className="fas fa-search"></i>
            </button>

            {/* User Dropdown */}
            <div className="dropdown d-none d-md-flex">
              <button className="header-action-btn" data-bs-toggle="dropdown" aria-expanded="false" title="Account">
                <i className="far fa-user"></i>
              </button>
              {user ? (
                <ul className="dropdown-menu dropdown-menu-end premium-dropdown" aria-label="user menu">
                  <li className="dropdown-header-item">
                    <span className="d-block fw-bold text-dark" style={{ fontSize: '13px' }}>Hi, {user.name?.split(' ')[0] || 'User'}</span>
                    <span className="text-muted" style={{ fontSize: '11px' }}>{user.email}</span>
                  </li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  {(user?.role === 'Super Admin' || user?.role === 'Manager' || user?.role === 'Staff') && (
                    <li>
                      <Link href="/admin/dashboard" className="dropdown-item premium-dropdown-item">
                        <i className="fas fa-tachometer-alt me-2 text-success"></i> Admin Panel
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link href="/user/profile" className="dropdown-item premium-dropdown-item">
                      <i className="far fa-user-circle me-2 text-primary"></i> My Profile
                    </Link>
                  </li>
                  <li>
                    <Link href="/user/orders" className="dropdown-item premium-dropdown-item">
                      <i className="fas fa-box me-2 text-warning"></i> My Orders
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <button onClick={handleLogout} className="dropdown-item premium-dropdown-item text-danger">
                      <i className="fas fa-sign-out-alt me-2"></i> Log Out
                    </button>
                  </li>
                </ul>
              ) : (
                <ul className="dropdown-menu dropdown-menu-end premium-dropdown" aria-label="user menu">
                  <li>
                    <Link href="/login" className="dropdown-item premium-dropdown-item">
                      <i className="fas fa-sign-in-alt me-2 text-success"></i> Sign In
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="dropdown-item premium-dropdown-item">
                      <i className="far fa-user-circle me-2 text-primary"></i> Sign Up
                    </Link>
                  </li>
                </ul>
              )}
            </div>

            {/* Wishlist */}
            <Link href="/wishlist" className="header-action-btn d-none d-md-flex text-decoration-none position-relative" title="Wishlist">
              <i className="far fa-heart"></i>
              {wishlistCount > 0 && (
                <span className="header-badge">{wishlistCount}</span>
              )}
            </Link>

            {/* Cart */}
            <a
              href="#"
              className="header-cart-btn text-decoration-none position-relative"
              onClick={(e) => e.preventDefault()}
              data-bs-toggle="offcanvas"
              data-bs-target="#cartOffcanvas"
              title="Cart"
            >
              <div className="cart-icon-wrap">
                <i className="fas fa-shopping-basket"></i>
                <span className="header-badge">{cartCount}</span>
              </div>
              <div className="cart-info d-none d-xl-block">
                <span className="cart-label">Shopping cart</span>
                <span className="cart-value">₹{cartTotal ? cartTotal.toFixed(2) : '0.00'}</span>
              </div>
            </a>

            {/* Mobile Hamburger */}
            <Link href="#" className="header-action-btn d-lg-none text-decoration-none" data-bs-toggle="offcanvas" data-bs-target="#mobileMenu">
              <i className="fas fa-bars"></i>
            </Link>
          </div>
        </div>
      </div>

      {/* Sliding Search Bar */}
      {isSearchOpen && (
        <div className="header-search-overlay">
          <div className="container">
            <form onSubmit={handleSearch} className="header-search-form">
              <div className="search-input-group">
                <i className="fas fa-search search-icon"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for nuts, dates, dry fruits..."
                  autoFocus
                />
                <button type="submit">SEARCH</button>
                <button type="button" onClick={() => setIsSearchOpen(false)} className="close-search">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
