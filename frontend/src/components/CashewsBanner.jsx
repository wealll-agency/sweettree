'use client';
import React from 'react';
import Link from 'next/link';

const CashewsBanner = () => {
  return (
    <section className="wholesale-banner-section py-4 bg-white">
      <div className="container container-fluid-md">
        <Link href="#">
          <img src="/wholesale-banner.png" className="w-100 banner-rounded" alt="Wholesale Banner" />
        </Link>
      </div>
    </section>
  );
};

export default CashewsBanner;
