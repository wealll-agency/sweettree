'use client';
import React, { memo } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import ProductCard from './ProductCard';

import 'swiper/css';

// Grid wrapper using exact ProductCard component from shop page
const MobileProductGrid = ({ products = [], title = 'Top Selling Products', viewAllHref = '/shop' }) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="mpg-wrapper">
      <div className="mpg-header">
        <h2 className="mpg-title">
          <span className="mpg-title-icon">🌿</span>
          {title}
        </h2>
        <Link href={viewAllHref} className="mpg-view-all">
          View All &rsaquo;
        </Link>
      </div>
      <div className="mpg-slider-container">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={10}
          slidesPerView={2}
          loop={products.length >= 4}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          className="mpg-swiper"
        >
          {products.slice(0, 8).map((product) => (
            <SwiperSlide key={product._id || product.name}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export { ProductCard as MobileProductCard };
export default memo(MobileProductGrid);

