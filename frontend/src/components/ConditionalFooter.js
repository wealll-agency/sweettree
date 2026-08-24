'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer.js';

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  if (pathname && (pathname.startsWith('/admin') || pathname === '/login' || pathname === '/register')) {
    return null;
  }
  
  return <Footer />;
}
