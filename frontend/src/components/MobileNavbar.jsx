'use client';
import React, { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingBag, User, LogOut, LayoutDashboard, Package, LogIn } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { logoutUser } from '../store/authSlice';

const MobileNavbar = () => {
  const { items: cartItems } = useSelector((state) => state.cart);
  const cartCount = cartItems ? cartItems.reduce((acc, item) => acc + item.quantity, 0) : 0;
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    dispatch(logoutUser());
    dropdownRef.current?.removeAttribute('open');
    router.push('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className="mobile-topbar d-lg-none">
        <div className="mobile-topbar-inner">
          <Link href="/" className="mobile-topbar-logo" aria-label="SweetTree Home">
            <Image
              src="/logo.png"
              alt="SweetTree Logo"
              width={130}
              height={36}
              priority
              style={{ objectFit: 'contain', height: '36px', width: 'auto' }}
            />
          </Link>

          <div className="mobile-topbar-actions">
            <button
              className="mobile-topbar-btn"
              onClick={() => setSearchOpen(v => !v)}
              aria-label="Search"
            >
              <Search size={20} strokeWidth={1.8} />
            </button>

            <a
              href="#"
              className="mobile-topbar-btn mobile-topbar-cart"
              onClick={(e) => e.preventDefault()}
              data-bs-toggle="offcanvas"
              data-bs-target="#cartOffcanvas"
              aria-label={`Cart, ${cartCount} items`}
            >
              <ShoppingBag size={20} strokeWidth={1.8} />
              {cartCount > 0 && (
                <span className="mobile-topbar-badge">{cartCount > 9 ? '9+' : cartCount}</span>
              )}
            </a>

            <details className="dropdown" ref={dropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <summary 
                className="mobile-topbar-btn" 
                title="Account"
                style={{ listStyle: 'none', outline: 'none', cursor: 'pointer', border: 'none', background: 'transparent', padding: 0 }}
              >
                <User size={20} strokeWidth={1.8} />
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
                  transform: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
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
                      <button onClick={handleLogout} className="dropdown-item premium-dropdown-item text-danger" style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left' }}>
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
          </div>
        </div>

        {/* Slide-down search bar */}
        {searchOpen && (
          <form onSubmit={handleSearch} className="mobile-topbar-search-bar">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mobile-topbar-search-input"
              autoFocus
            />
            <button type="submit" className="mobile-topbar-search-submit">Search</button>
          </form>
        )}
      </header>
    </>
  );
};

export default memo(MobileNavbar);
