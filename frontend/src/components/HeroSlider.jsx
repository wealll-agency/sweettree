'use client';
import React, { memo, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { fetchBannersCached, getCachedBannersSync } from '../utils/bannerService';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import SlidingTicker from './SlidingTicker';

const HeroSlider = () => {
  const [desktopBanners, setDesktopBanners] = useState([]);
  const [mobileBanners, setMobileBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Populate cached banners post-hydration instantly if available
    const cached = getCachedBannersSync();
    if (cached && cached.length > 0) {
      const hero = cached.filter(b => b.placement === 'Hero');
      if (hero.length > 0) setDesktopBanners(hero);
      const bot = cached.filter(b => b.placement === 'Bottom');
      if (bot.length > 0) setMobileBanners(bot);
      setIsLoading(false);
    }

    const fetchBanners = async () => {
      try {
        const banners = await fetchBannersCached();
        if (banners && banners.length > 0) {
          const heroBanners = banners.filter(b => b.placement === 'Hero');
          if (heroBanners.length > 0) setDesktopBanners(heroBanners);
          const botBanners = banners.filter(b => b.placement === 'Bottom');
          if (botBanners.length > 0) setMobileBanners(botBanners);
        }
      } catch (error) {
        console.error('Failed to fetch slider data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanners();
  }, []);

  const displayDesktopBanners = desktopBanners;
  const displayMobileBanners = mobileBanners.length > 0 ? mobileBanners : desktopBanners;

  const getImageUrl = (url) => {
    if (!url) return '';
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'https://www.sweettreeon.com';
    if (url.includes('localhost:')) return url.replace(/http:\/\/localhost:\d+/, baseUrl);
    if (url.startsWith('http') || url.startsWith('/')) return url;
    return `${baseUrl}${url}`;
  };

  return (
    <section className="hero-slider-wrapper">
      <SlidingTicker />
      <div className="container-fluid px-4 px-lg-5 mt-3">
        {isLoading && displayDesktopBanners.length === 0 ? (
          <>
            <div className="d-none d-md-block">
               <div className="item banner-img-container ratio-hero placeholder-glow" style={{ borderRadius: '16px', overflow: 'hidden', background: 'linear-gradient(135deg, #f9f6f0 0%, #eef4ed 100%)' }}>
                  <div className="placeholder w-100 h-100" style={{ opacity: 0.05, background: '#162C18' }}></div>
               </div>
            </div>
            <div className="d-block d-md-none">
               <div className="item banner-img-container ratio-4x3 placeholder-glow" style={{ borderRadius: '16px', overflow: 'hidden', background: 'linear-gradient(135deg, #f9f6f0 0%, #eef4ed 100%)' }}>
                  <div className="placeholder w-100 h-100" style={{ opacity: 0.05, background: '#162C18' }}></div>
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
