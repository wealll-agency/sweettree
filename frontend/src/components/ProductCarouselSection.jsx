'use client';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import ProductCard from './ProductCard';

import 'swiper/css';
import 'swiper/css/navigation';

const ProductCarouselSection = ({ title, products }) => {
  return (
    <section className="section-wrapper bg-white pb-5 relative-nav">
      <div className="container text-center">
        <h2 className="main-title">{title}</h2>
        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={10}
          navigation={true}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          breakpoints={{
            0: { slidesPerView: 1 },
            576: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            992: { slidesPerView: 4 },
          }}
          className="product-slider"
        >
          {products && products.map((product, index) => (
            <SwiperSlide key={index}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default ProductCarouselSection;
