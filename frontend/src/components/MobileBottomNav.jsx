'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid2X2, Tag, Heart, Info } from 'lucide-react';
import { useSelector } from 'react-redux';

const MobileBottomNav = () => {
  const pathname = usePathname();
  const { user } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const wishlistCount = wishlistItems.length;

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/shop', icon: Grid2X2, label: 'Shop' },
    { href: '/build-combo', icon: Tag, label: 'Combo' },
    { href: '/wishlist', icon: Heart, label: 'Wishlist', badge: wishlistCount },
    { href: '/about', icon: Info, label: 'About' },
  ];

  // Hide bottom nav on specific pages
  if (pathname?.startsWith('/shop-details') || pathname?.startsWith('/checkout')) {
    return null;
  }

  return (
    <nav className="mobile-bottom-nav d-lg-none" role="navigation" aria-label="Mobile bottom navigation">
      {navItems.map(({ href, icon: Icon, label, badge }) => {
        const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));
        return (
          <Link key={href} href={href} className={`mobile-bottom-nav-item${isActive ? ' active' : ''}`} aria-label={label}>
            <div className="mobile-bottom-nav-icon-wrap">
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
              {badge > 0 && <span className="mobile-bottom-nav-badge">{badge > 9 ? '9+' : badge}</span>}
            </div>
            <span className="mobile-bottom-nav-label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
