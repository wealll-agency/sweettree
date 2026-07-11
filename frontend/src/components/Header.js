'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/authSlice.js';
import { clearCart } from '../store/cartSlice.js';
import { Search, Heart, ShoppingBag, User, LogOut, LayoutDashboard, ShoppingCart } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [keyword, setKeyword] = useState('');
  
  const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      router.push(`/products?keyword=${encodeURIComponent(keyword.trim())}`);
    } else {
      router.push('/products');
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(clearCart());
    router.push('/');
  };

  return (
    <header className="sticky-top bg-white border-bottom shadow-sm py-2">
      <div className="container">
        <nav className="navbar navbar-expand-lg navbar-light p-0">
          {/* Logo */}
          {(!pathname || !pathname.startsWith('/admin')) && (
            <Link href="/" className="navbar-brand d-flex align-items-center">
              <span className="fs-3 fw-bold display-font" style={{ color: 'var(--primary-color)' }}>Sweettree</span>
            </Link>
          )}

          {/* Collapsible Mobile Menu toggle */}
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse align-items-center" id="navbarContent">
            {/* Center links */}
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0 fw-medium">
              <li className="nav-item px-2">
                <Link href="/" className="nav-link text-dark hover-green">Home</Link>
              </li>
              <li className="nav-item px-2">
                <Link href="/products" className="nav-link text-dark">Shop</Link>
              </li>
              <li className="nav-item px-2">
                <Link href="/products?category=Skin%20Care" className="nav-link text-dark">Skin Care</Link>
              </li>
              <li className="nav-item px-2">
                <Link href="/products?category=Hair%20Care" className="nav-link text-dark">Hair Care</Link>
              </li>
              <li className="nav-item px-2">
                <Link href="/#testimonials" className="nav-link text-dark">Reviews</Link>
              </li>
            </ul>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="d-flex me-3 position-relative" style={{ maxWidth: '280px' }}>
              <input
                type="text"
                className="form-control-brand pe-5 py-2 fs-6"
                placeholder="Search herbal care..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{ width: '220px', fontSize: '0.9rem' }}
              />
              <button type="submit" className="btn border-0 position-absolute end-0 top-50 translate-middle-y text-muted">
                <Search size={18} />
              </button>
            </form>

            {/* Actions Bar */}
            <div className="d-flex align-items-center gap-3">
              {/* Wishlist */}
              <Link href="/wishlist" className="position-relative text-dark hover-green-icon">
                <Heart size={22} />
                {wishlistCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.7rem' }}>
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <a href="#" data-bs-toggle="offcanvas" data-bs-target="#cartOffcanvas" className="position-relative text-dark hover-green-icon" onClick={(e) => e.preventDefault()}>
                <ShoppingBag size={22} />
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill" style={{ fontSize: '0.7rem', backgroundColor: 'var(--accent-color)' }}>
                    {cartCount}
                  </span>
                )}
              </a>

              {/* User auth */}
              {user ? (
                <div className="dropdown">
                  <button className="btn dropdown-toggle border-0 d-flex align-items-center gap-1 p-0 hover-green" type="button" id="userMenu" data-bs-toggle="dropdown" aria-expanded="false">
                    <User size={20} />
                    <span className="d-none d-md-inline fw-medium fs-6">{user.name.split(' ')[0]}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="userMenu">
                    {['Super Admin', 'Manager', 'Staff'].includes(user.role) && (
                      <li>
                        <Link href="/admin/dashboard" className="dropdown-item d-flex align-items-center gap-2 py-2">
                          <LayoutDashboard size={16} /> Admin Panel
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link href="/user/profile" className="dropdown-item d-flex align-items-center gap-2 py-2">
                        <User size={16} /> Profile Settings
                      </Link>
                    </li>
                    <li>
                      <Link href="/user/orders" className="dropdown-item d-flex align-items-center gap-2 py-2">
                        <ShoppingCart size={16} /> My Orders
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button onClick={handleLogout} className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger">
                        <LogOut size={16} /> Log Out
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <Link href="/login" className="btn btn-brand-secondary py-2 px-3 fs-6 d-flex align-items-center gap-1">
                  <User size={18} />
                  <span>Log In</span>
                </Link>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
