'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '../utils/axiosConfig';

const CashewsBanner = () => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await api.get('/banners');
        if (res.data.success) {
          const middleBanners = res.data.banners.filter(b => b.placement === 'Middle');
          if (middleBanners.length > 0) {
            setBanners(middleBanners);
          }
        }
      } catch (error) {
        console.error('Failed to fetch middle banners:', error);
      }
    };
    fetchBanners();
  }, []);

  const displayBanners = banners.length > 0 ? banners : [
    { _id: '1', image: '/wholesale-banner.png', title: 'Wholesale Banner', targetLink: '#' }
  ];

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('/')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000';
    return `${baseUrl}${url}`;
  };

  return (
    <section className="wholesale-banner-section py-4 bg-white">
      <div className="container-fluid px-4 px-lg-5 container-fluid-md">
        {displayBanners.map((banner, index) => (
          <Link href={banner.targetLink || '#'} key={banner._id || index} className="d-block mb-3">
            <div className="banner-img-container ratio-trending banner-rounded overflow-hidden shadow-sm">
              <Image 
                src={getImageUrl(banner.image)} 
                width={1920} 
                height={500} 
                alt={banner.title || 'Wholesale Banner'} 
                priority 
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CashewsBanner;
