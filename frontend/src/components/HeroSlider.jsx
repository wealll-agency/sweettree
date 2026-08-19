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
  const [desktopBanners, setDesktopBanners] = useState([]);
  const [mobileBanners, setMobileBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await api.get('/banners');
        if (res.data.success) {
          const heroBanners = res.data.banners.filter(b => b.placement === 'Hero');
          if (heroBanners.length > 0) {
            setDesktopBanners(heroBanners);
          }
          const botBanners = res.data.banners.filter(b => b.placement === 'Bottom');
          if (botBanners.length > 0) {
            setMobileBanners(botBanners);
          }
        }
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanners();
  }, []);

  // Fallback static banners if none are active
  const displayDesktopBanners = desktopBanners.length > 0 ? desktopBanners : [
    { _id: '1', image: '/banner_slider_image1.jpeg', title: 'Banner 1', targetLink: '' },
    { _id: '2', image: '/banner_slider_image2.jpeg', title: 'Banner 2', targetLink: '' }
  ];

  const displayMobileBanners = mobileBanners.length > 0 ? mobileBanners : displayDesktopBanners;

  const getImageUrl = (url) => {
    if (!url) return '';
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:7050';
    if (url.includes('localhost:')) return url.replace(/http:\/\/localhost:\d+/, baseUrl);
    if (url.startsWith('http') || url.startsWith('/')) return url;
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
        {isLoading ? (
          <>
            <div className="d-none d-md-block">
               <div className="item banner-img-container ratio-hero placeholder-glow" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                  <div className="placeholder w-100 h-100 bg-secondary" style={{ opacity: 0.1 }}></div>
               </div>
            </div>
            <div className="d-block d-md-none">
               <div className="item banner-img-container ratio-4x3 placeholder-glow" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                  <div className="placeholder w-100 h-100 bg-secondary" style={{ opacity: 0.1 }}></div>
               </div>
            </div>
          </>
        ) : (
          <>
        <div className="d-none d-md-block">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            loop={displayDesktopBanners.length > 1}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            autoHeight={true}
            className="hero-slider"
          >
            {displayDesktopBanners.map((banner, index) => (
              <SwiperSlide key={`desktop-${banner._id}`}>
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

        {/* Mobile Slider */}
        <div className="d-block d-md-none">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            loop={displayMobileBanners.length > 1}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            autoHeight={true}
            className="hero-slider"
          >
            {displayMobileBanners.map((banner, index) => (
              <SwiperSlide key={`mobile-${banner._id}`}>
                <div className="item banner-img-container ratio-4x3">
                  {banner.targetLink ? (
                    <Link href={banner.targetLink} className="d-block w-100 h-100">
                      <Image 
                        src={getImageUrl(banner.image)} 
                        alt={banner.title || `Mobile Banner ${index + 1}`} 
                        width={382} 
                        height={286} 
                        priority={index === 0} 
                      />
                    </Link>
                  ) : (
                    <Image 
                      src={getImageUrl(banner.image)} 
                      alt={banner.title || `Mobile Banner ${index + 1}`} 
                      width={382} 
                      height={286} 
                      priority={index === 0} 
                    />
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
          </>
        )}
      </div>
    </section>
  );
};

export default memo(HeroSlider);
