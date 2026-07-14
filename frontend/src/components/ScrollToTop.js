'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('ScrollToTop error:', error);
    }
  }, [pathname, searchParams]);

  return null;
}
