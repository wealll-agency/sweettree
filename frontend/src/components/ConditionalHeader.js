'use client';

import { usePathname } from 'next/navigation';
import Header from './Header.jsx';
import MobileMenu from './MobileMenu.jsx';
import CartOffcanvas from './CartOffcanvas.jsx';

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  if (pathname && pathname.startsWith('/admin')) {
    return null; // Admin has its own layout/header
  }
  
  return (
    <>
      <Header />
      <MobileMenu />
      <CartOffcanvas />
    </>
  );
}
