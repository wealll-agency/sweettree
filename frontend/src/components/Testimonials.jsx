'use client';
import React, from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';

const Testimonials = () => {
  return (
    <section className="testimonials-section">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <h2 className="fw-bold mb-0">Words From Our Delighted Customer</h2>
        </div>

        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={20}
          navigation={true}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          breakpoints={{
            0: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            992: { slidesPerView: 3 },
          }}
          className="testimonial-slider"
        >
          <SwiperSlide>
            <div className="testimonial-card bg-white p-4 h-100 rounded-4" style={{ border: 'none' }}>
              <i className="fas fa-quote-left d-block mb-3" style={{ fontSize: '40px', color: '#cdead4' }}></i>
              <p className="mb-4" style={{ fontSize: '14px', lineHeight: 1.6, color: '#555', minHeight: '80px' }}>
                Excellent quality dry fruits and delicious Fresh, flavorful, and perfect for gifting.
                I used to take dry fruits from this website from last 1 year no quality issue.
              </p>
              <div className="d-flex justify-content-between align-items-center mt-auto">
                <div className="d-flex align-items-center gap-2">
                  <img src="/testimonial_image1.png" alt="Siddhartha Nandi" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                  <div>
                    <h6 className="mb-0 fw-bold" style={{ fontSize: '14px', color: '#333' }}>Siddhartha Nandi</h6>
                    <small style={{ fontSize: '12px', color: '#aaa' }}>Customer</small>
                  </div>
                </div>
                <div className="text-warning" style={{ fontSize: '12px' }}>
                  <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                </div>
              </div>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="testimonial-card bg-white p-4 h-100 rounded-4" style={{ border: 'none' }}>
              <i className="fas fa-quote-left d-block mb-3" style={{ fontSize: '40px', color: '#cdead4' }}></i>
              <p className="mb-4" style={{ fontSize: '14px', lineHeight: 1.6, color: '#555', minHeight: '80px' }}>
                Pellentesque eu nibh eget mauris congue mattis mattis nec tellus. Phasellus imperdiet elit eu magna dictum, bibendum cursus velit sodales. Donec sed neque eget
              </p>
              <div className="d-flex justify-content-between align-items-center mt-auto">
                <div className="d-flex align-items-center gap-2">
                  <img src="/testimonial_image2.png" alt="Dianne Russell" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                  <div>
                    <h6 className="mb-0 fw-bold" style={{ fontSize: '14px', color: '#333' }}>Dianne Russell</h6>
                    <small style={{ fontSize: '12px', color: '#aaa' }}>Customer</small>
                  </div>
                </div>
                <div className="text-warning" style={{ fontSize: '12px' }}>
                  <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                </div>
              </div>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="testimonial-card bg-white p-4 h-100 rounded-4" style={{ border: 'none' }}>
              <i className="fas fa-quote-left d-block mb-3" style={{ fontSize: '40px', color: '#cdead4' }}></i>
              <p className="mb-4" style={{ fontSize: '14px', lineHeight: 1.6, color: '#555', minHeight: '80px' }}>
                Pellentesque eu nibh eget mauris congue mattis mattis nec tellus. Phasellus imperdiet elit eu magna dictum, bibendum cursus velit sodales. Donec sed neque eget
              </p>
              <div className="d-flex justify-content-between align-items-center mt-auto">
                <div className="d-flex align-items-center gap-2">
                  <img src="/testimonial_image3.png" alt="Md. Dilsad Ali" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                  <div>
                    <h6 className="mb-0 fw-bold" style={{ fontSize: '14px', color: '#333' }}>Md. Dilsad Ali</h6>
                    <small style={{ fontSize: '12px', color: '#aaa' }}>Customer</small>
                  </div>
                </div>
                <div className="text-warning" style={{ fontSize: '12px' }}>
                  <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                </div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </section>
  );
};

export default Testimonials;
