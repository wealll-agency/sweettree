'use client';
import React, { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingBag, User, LogOut, LayoutDashboard, Package, LogIn } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { logoutUser } from '../store/authSlice';
import api from '../utils/axiosConfig';

const MobileNavbar = () => {
  const { items: cartItems } = useSelector((state) => state.cart);
  const cartCount = cartItems ? cartItems.reduce((acc, item) => acc + item.quantity, 0) : 0;
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Typeahead state
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchContainerRef = useRef(null);

  const dropdownRef = useRef(null);

  const [isSyncHydrated, setIsSyncHydrated] = useState(false);
  const [isAuthHydrated, setIsAuthHydrated] = useState(false);

  useEffect(() => {
    // Handle outside clicks to close dropdown
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setIsSuggestionsLoading(false);
      return;
    }

    setIsSuggestionsLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/products?keyword=${encodeURIComponent(searchQuery.trim())}&limit=5`);
        const data = res.data;
        if (data.success) {
          setSuggestions(data.products || []);
        }
      } catch (err) {
        console.error('Error fetching search suggestions:', err);
      } finally {
        setIsSuggestionsLoading(false);
      }
    }, 300);
  }, [searchQuery]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleSyncHydration = () => setIsSyncHydrated(true);
      const handleAuthHydration = () => setIsAuthHydrated(true);

      if (window.__isReduxSyncHydrated) {
        setIsSyncHydrated(true);
      } else {
        window.addEventListener('redux-sync-hydrated', handleSyncHydration);
      }

      if (window.__isReduxAuthHydrated) {
        setIsAuthHydrated(true);
      } else {
        window.addEventListener('redux-auth-hydrated', handleAuthHydration);
      }

      return () => {
        window.removeEventListener('redux-sync-hydrated', handleSyncHydration);
        window.removeEventListener('redux-auth-hydrated', handleAuthHydration);
      };
    }
  }, []);

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

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dropdownRef.current?.removeAttribute('open');
    router.push('/login');
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
              style={{ objectFit: 'contain' }}
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
              {isSyncHydrated && cartCount > 0 && (
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
                {isAuthHydrated ? (
                  user ? (
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
                  )
                ) : (
                  <li>
                    <span className="dropdown-item premium-dropdown-item text-muted" style={{ fontSize: '13px' }}>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" style={{ width: '12px', height: '12px' }}></span>
                      Loading...
                    </span>
                  </li>
                )}
              </ul>
            </details>
          </div>
        </div>

        {/* Slide-down search bar */}
        {searchOpen && (
          <div style={{ position: 'relative' }} ref={searchContainerRef}>
            <form onSubmit={handleSearch} className="mobile-topbar-search-bar">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mobile-topbar-search-input"
                autoFocus
                placeholder="Search products..."
              />
              <button type="submit" className="mobile-topbar-search-submit">Search</button>
            </form>
            
            {/* Mobile Autocomplete Dropdown */}
            {(suggestions.length > 0 || isSuggestionsLoading) && searchQuery.trim() && (
              <div 
                className="search-suggestions-dropdown" 
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#fff',
                  borderRadius: '0 0 8px 8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  zIndex: 1000,
                  overflow: 'hidden',
                  border: '1px solid #eee',
                  borderTop: 'none',
                  maxHeight: '60vh',
                  overflowY: 'auto'
                }}
              >
                {isSuggestionsLoading ? (
                  <div className="p-3 text-center text-muted" style={{ fontSize: '13px' }}>
                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                    Searching...
                  </div>
                ) : (
                  <ul className="m-0 p-0" style={{ listStyle: 'none' }}>
                    {suggestions.map((product) => (
                      <li key={product._id} className="border-bottom">
                        <Link 
                          href={`/shop-details?${product.name.replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')}`}
                          className="d-flex align-items-center p-2 text-decoration-none hover-bg-light"
                          style={{ transition: 'background-color 0.2s' }}
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery('');
                            setSuggestions([]);
                          }}
                        >
                          <div style={{ width: '40px', height: '40px', position: 'relative', flexShrink: 0, borderRadius: '4px', overflow: 'hidden' }}>
                            <Image 
                              src={product.images && product.images[0] ? product.images[0] : '/placeholder.jpg'} 
                              alt={product.name}
                              fill
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                          <div className="ms-3 flex-grow-1 overflow-hidden">
                            <h6 className="m-0 text-dark text-truncate" style={{ fontSize: '13px', fontWeight: '600' }}>
                              {product.name}
                            </h6>
                            <div className="d-flex align-items-center mt-1">
                              <span className="fw-bold me-2" style={{ color: '#005b6e', fontSize: '12px' }}>
                                ₹{product.price - (product.discount || 0)}
                              </span>
                              {product.discount > 0 && (
                                <span className="text-muted text-decoration-line-through" style={{ fontSize: '11px' }}>
                                  ₹{product.price}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="p-2 text-center" style={{ backgroundColor: '#f8f9fa' }}>
                  <Link 
                    href={`/shop?keyword=${encodeURIComponent(searchQuery)}`} 
                    className="text-decoration-none fw-bold"
                    style={{ fontSize: '12px', color: '#005b6e' }}
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                      setSuggestions([]);
                    }}
                  >
                    View all results for "{searchQuery}"
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};

export default memo(MobileNavbar);
