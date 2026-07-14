'use client';
import React, { memo } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const HeroSlider = () => {
  return (
    <section className="hero-slider-wrapper">
      <div className="marquee-wrapper">
        <marquee behavior="scroll" direction="left" scrollamount="5">
          || 🥜 Sweettree Anmol Jumbo Nuts - Extra 10% OFF! 🥜 || 🎁 Nuts For Savings 🎁 || 🔥 PayDay Sale Is LIVE - Extra 15% OFF Sitewide! 🔥 ||
        </marquee>
      </div>
      <div className="container mt-3">
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
          <SwiperSlide>
            <div className="item">
              <Image src="/banner_slider_image1.jpeg" alt="Banner 1" width={1200} height={400} priority={true} style={{ width: '100%', height: 'auto' }} />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="item">
              <Image src="/banner_slider_image2.jpeg" alt="Banner 2" width={1200} height={400} style={{ width: '100%', height: 'auto' }} />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="item">
              <Image src="/banner_slider_image1.jpeg" alt="Banner 1" width={1200} height={400} style={{ width: '100%', height: 'auto' }} />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="item">
              <Image src="/banner_slider_image2.jpeg" alt="Banner 2" width={1200} height={400} style={{ width: '100%', height: 'auto' }} />
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </section>
  );
};

export default memo(HeroSlider);
