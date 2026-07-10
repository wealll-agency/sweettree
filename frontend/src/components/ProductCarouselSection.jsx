'use client';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import ProductCard from './ProductCard';

import 'swiper/css';
import 'swiper/css/navigation';

const ProductCarouselSection = ({ title, products }) => {
  return (
    <>
      <section className="section-wrapper animated-gradient-bg pb-5 relative-nav">
        <div className="container text-center">
          <h2 className="main-title">{title}</h2>
          <Swiper
            modules={[Autoplay, Navigation]}
            spaceBetween={10}
            navigation={true}
            loop={true}
            autoplay={{ delay: 2500, disableOnInteraction: false }}
            breakpoints={{
              0: { slidesPerView: 1 },
              576: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              992: { slidesPerView: 4 },
            }}
            className="product-slider"
          >
            {products && [...products, ...products].map((product, index) => (
              <SwiperSlide key={index}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
      <style>{`
        .animated-gradient-bg {
          background: linear-gradient(-45deg, #f0fdf4, #e0f2fe, #fdf4ff, #fffbeb);
          background-size: 400% 400%;
          animation: gradientBG 15s ease infinite;
        }
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </>
  );
};

export default ProductCarouselSection;
