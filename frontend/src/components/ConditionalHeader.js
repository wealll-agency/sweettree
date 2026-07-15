'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from './Header.jsx';

const MobileMenu = dynamic(() => import('./MobileMenu.jsx'), { ssr: false });
const CartOffcanvas = dynamic(() => import('./CartOffcanvas.jsx'), { ssr: false });

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
