'use client';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const MobileNavbar = dynamic(() => import('./MobileNavbar'), { ssr: false });
const MobileBottomNav = dynamic(() => import('./MobileBottomNav'), { ssr: false });

export default function ConditionalMobileUI() {
  const pathname = usePathname();

  // Hide all mobile UI on admin pages
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  // Hide bottom nav on specific pages
  const hideBottomNav = pathname && (pathname.startsWith('/shop-details') || pathname.startsWith('/checkout'));

  return (
    <>
      <MobileNavbar />
      {!hideBottomNav && <MobileBottomNav />}
    </>
  );
}
