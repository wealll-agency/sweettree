'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/authSlice';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Home, 
  Store, 
  Gift, 
  Leaf, 
  BookOpen, 
  Envelope, 
  Search, 
  X, 
  User, 
  Heart, 
  ShoppingBag, 
  Menu,
  LayoutDashboard,
  Package,
  LogOut,
  LogIn,
  Mail
} from 'lucide-react';

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
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
    if (dropdownRef.current) {
      dropdownRef.current.removeAttribute('open');
    }
    router.push('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const closestDropdown = event.target.closest('.dropdown');
      if (closestDropdown !== dropdownRef.current && dropdownRef.current) {
        dropdownRef.current.removeAttribute('open');
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, []);





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
              <Image src="/logo.png" alt="Sweettree Logo" width={180} height={50} priority={true} className="brand-logo" style={{ objectFit: 'contain' }} />
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="col-lg-7 d-none d-lg-block">
            <ul className="d-flex justify-content-center align-items-center m-0 p-0" style={{ listStyle: 'none', gap: '6px' }}>
              <li>
                <Link href="/" className="premium-nav-link">
                  <span className="nav-icon"><Home size={16} /></span>
                  <span className="nav-text">HOME</span>
                </Link>
              </li>
              <li>
                <Link href="/shop" className="premium-nav-link">
                  <span className="nav-icon"><Store size={16} /></span>
                  <span className="nav-text">SHOP</span>
                </Link>
              </li>
              <li>
                <Link href="/build-combo" className="premium-nav-link">
                  <span className="nav-icon"><Gift size={16} /></span>
                  <span className="nav-text">COMBO BOX</span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="premium-nav-link">
                  <span className="nav-icon"><Leaf size={16} /></span>
                  <span className="nav-text">ABOUT</span>
                </Link>
              </li>
              {/* 
              <li>
                <Link href="/blog" className="premium-nav-link">
                  <span className="nav-icon"><BookOpen size={16} /></span>
                  <span className="nav-text">BLOG</span>
                </Link>
              </li> 
              */}
              <li>
                <Link href="/contact" className="premium-nav-link">
                  <span className="nav-icon"><Mail size={16} /></span>
                  <span className="nav-text">CONTACT</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Right Action Icons */}
          <div className="col-lg-3 col-7 d-flex justify-content-end align-items-center gap-3 gap-md-2">
            {/* Search */}
            <div className={`sliding-search-container d-none d-md-flex ${isSearchOpen ? 'open' : ''}`}>
              <form onSubmit={handleSearch} className="sliding-search-form mb-0">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="sliding-search-input"
                />
                <button
                  type="button"
                  className="header-action-btn search-toggle-btn"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  title="Search"
                >
                  {isSearchOpen ? <X size={18} /> : <Search size={18} />}
                </button>
              </form>
            </div>

            {/* User Dropdown */}
            <details className="dropdown d-none d-md-block" ref={dropdownRef} style={{ position: 'relative' }}>
              <summary 
                className="header-action-btn" 
                title="Account"
                style={{ listStyle: 'none', outline: 'none', cursor: 'pointer' }}
              >
                <User size={18} />
              </summary>
              <ul 
                className="dropdown-menu premium-dropdown show" 
                aria-label="user menu"
                style={{
                  display: 'block',
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  left: 'auto',
                  marginTop: '10px',
                  minWidth: '220px',
                  zIndex: 99999,
                  transform: 'none'
                }}
              >
                {user ? (
                  <>
                    <li className="dropdown-header-item">
                      <span className="d-block fw-bold text-dark" style={{ fontSize: '13px' }}>Hi, {user.name?.split(' ')[0] || 'User'}</span>
                      <span className="text-muted" style={{ fontSize: '11px' }}>{user.email}</span>
                    </li>
                    <li><hr className="dropdown-divider my-1" /></li>
                    {(user?.role === 'Super Admin' || user?.role === 'Manager' || user?.role === 'Staff') && (
                      <li>
                        <Link href="/admin/dashboard" className="dropdown-item premium-dropdown-item" onClick={() => dropdownRef.current?.removeAttribute('open')}>
                          <LayoutDashboard size={16} className="me-2 text-success" /> Admin Panel
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link href="/user/profile" className="dropdown-item premium-dropdown-item" onClick={() => dropdownRef.current?.removeAttribute('open')}>
                        <User size={16} className="me-2 text-primary" /> My Profile
                      </Link>
                    </li>
                    <li>
                      <Link href="/user/orders" className="dropdown-item premium-dropdown-item" onClick={() => dropdownRef.current?.removeAttribute('open')}>
                        <Package size={16} className="me-2 text-warning" /> My Orders
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider my-1" /></li>
                    <li>
                      <button onClick={handleLogout} className="dropdown-item premium-dropdown-item text-danger">
                        <LogOut size={16} className="me-2" /> Log Out
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link href="/login" className="dropdown-item premium-dropdown-item" onClick={() => dropdownRef.current?.removeAttribute('open')}>
                        <LogIn size={16} className="me-2 text-success" /> Sign In
                      </Link>
                    </li>
                    <li>
                      <Link href="/register" className="dropdown-item premium-dropdown-item" onClick={() => dropdownRef.current?.removeAttribute('open')}>
                        <User size={16} className="me-2 text-primary" /> Sign Up
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </details>

            {/* Wishlist */}
            <Link href="/wishlist" className="header-action-btn d-none d-md-flex text-decoration-none position-relative" title="Wishlist">
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span className="header-badge">{wishlistCount}</span>
              )}
            </Link>

            {/* Cart */}
            <a
              href="#"
              className="header-action-btn text-decoration-none position-relative"
              onClick={(e) => e.preventDefault()}
              data-bs-toggle="offcanvas"
              data-bs-target="#cartOffcanvas"
              title="Cart"
            >
              <ShoppingBag size={18} />
              <span className="header-badge">{cartCount}</span>
            </a>

            {/* Mobile Hamburger */}
            <Link href="#" className="header-action-btn d-lg-none text-decoration-none" data-bs-toggle="offcanvas" data-bs-target="#mobileMenu">
              <Menu size={18} />
            </Link>
          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;
