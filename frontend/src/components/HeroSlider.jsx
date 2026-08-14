'use client';
import React, { memo, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import api from '../utils/axiosConfig';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const HeroSlider = () => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await api.get('/banners');
        if (res.data.success) {
          const heroBanners = res.data.banners.filter(b => b.placement === 'Hero');
          if (heroBanners.length > 0) {
            setBanners(heroBanners);
          }
        }
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      }
    };
    fetchBanners();
  }, []);

  // Fallback static banners if none are active
  const displayBanners = banners.length > 0 ? banners : [
    { _id: '1', image: '/banner_slider_image1.jpeg', title: 'Banner 1', targetLink: '' },
    { _id: '2', image: '/banner_slider_image2.jpeg', title: 'Banner 2', targetLink: '' }
  ];

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('/')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000';
    return `${baseUrl}${url}`;
  };

  return (
    <section className="hero-slider-wrapper">
      <div className="marquee-wrapper">
        <marquee behavior="scroll" direction="left" scrollamount="5">
          || 🥜 Sweettree Anmol Jumbo Nuts - Extra 10% OFF! 🥜 || 🎁 Nuts For Savings 🎁 || 🔥 PayDay Sale Is LIVE - Extra 15% OFF Sitewide! 🔥 ||
        </marquee>
      </div>
      <div className="container-fluid px-4 px-lg-5 mt-3">
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          loop={true}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          autoHeight={true}
          className="hero-slider"
        >
          {displayBanners.map((banner, index) => (
            <SwiperSlide key={banner._id}>
              <div className="item banner-img-container ratio-hero">
                {banner.targetLink ? (
                  <Link href={banner.targetLink} className="d-block w-100 h-100">
                    <Image 
                      src={getImageUrl(banner.image)} 
                      alt={banner.title || `Banner ${index + 1}`} 
                      width={1920} 
                      height={600} 
                      priority={index === 0} 
                    />
                  </Link>
                ) : (
                  <Image 
                    src={getImageUrl(banner.image)} 
                    alt={banner.title || `Banner ${index + 1}`} 
                    width={1920} 
                    height={600} 
                    priority={index === 0} 
                  />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default memo(HeroSlider);
