'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const CashewsBanner = () => {
  return (
    <section className="wholesale-banner-section py-4 bg-white">
      <div className="container container-fluid-md">
        <Link href="#">
          <Image src="/wholesale-banner.png" width={1920} height={500} style={{ width: '100%', height: 'auto' }} className="banner-rounded" alt="Wholesale Banner" priority />
        </Link>
      </div>
    </section>
  );
};

export default CashewsBanner;
