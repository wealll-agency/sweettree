'use client';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import Link from 'next/link';

import 'swiper/css';
import 'swiper/css/navigation';

const CollectionSlider = () => {
  return (
    <section className="section-wrapper bg-white collection-bg-section pb-2 mt-4 relative-nav popout-slider-wrapper">
      <div className="container text-center">
        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={20}
          navigation={true}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          breakpoints={{
            0: { slidesPerView: 2 },
            415: { slidesPerView: 2 },
            576: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            992: { slidesPerView: 5 },
          }}
          className="collection-slider mx-auto"
        >
          <SwiperSlide>
            <Link href="#" className="collection-card" style={{ background: '#945A45' }}>
              <img src="/collection1.png" alt="Almond" className="collection-img" />
              <div className="collection-name">Almond</div>
            </Link>
          </SwiperSlide>
          <SwiperSlide>
            <Link href="#" className="collection-card" style={{ background: '#005B6E' }}>
              <img src="/collection2.png" alt="Cashew" className="collection-img" />
              <div className="collection-name">Cashew</div>
            </Link>
          </SwiperSlide>
          <SwiperSlide>
            <Link href="#" className="collection-card" style={{ background: '#525D3F' }}>
              <img src="/collection3.png" alt="Pista" className="collection-img" />
              <div className="collection-name">Pista</div>
            </Link>
          </SwiperSlide>
          <SwiperSlide>
            <Link href="#" className="collection-card" style={{ background: '#C88330' }}>
              <img src="/collection4.png" alt="Raisin" className="collection-img" />
              <div className="collection-name">Raisin</div>
            </Link>
          </SwiperSlide>
          <SwiperSlide>
            <Link href="#" className="collection-card" style={{ background: '#731A2B' }}>
              <img src="/collection5.png" alt="Walnut" className="collection-img" />
              <div className="collection-name">Walnut</div>
            </Link>
          </SwiperSlide>
          <SwiperSlide>
            <Link href="#" className="collection-card" style={{ background: '#945A45' }}>
              <img src="/collection6.png" alt="Fig" className="collection-img" />
              <div className="collection-name">Fig</div>
            </Link>
          </SwiperSlide>
          <SwiperSlide>
            <Link href="#" className="collection-card" style={{ background: '#005B6E' }}>
              <img src="/collection7.png" alt="Mix" className="collection-img" />
              <div className="collection-name">Mix</div>
            </Link>
          </SwiperSlide>
        </Swiper>
      </div>

      <style jsx global>{`
        /* Fix Swiper clipping the pop-out image */
        .collection-slider.swiper {
          padding-top: 60px !important;
          padding-bottom: 20px !important;
          margin-top: -60px !important;
        }
        
        /* Make hover scale slightly larger but not too massive */
     
        
        /* Style navigation arrows to match original black chevrons */
        .collection-slider .swiper-button-next,
        .collection-slider .swiper-button-prev {
          color: #000 !important;
        }
        .collection-slider .swiper-button-next:after,
        .collection-slider .swiper-button-prev:after {
          font-size: 24px !important;
          font-weight: 900;
        }
      `}</style>
    </section>
  );
};

export default CollectionSlider;
