'use client';
import React, { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const ShopByPurpose = () => {
  return (
    <section className="shop-by-purpose-section bg-white">
      <div className="container text-center pt-4">
        <h2 className="main-title mb-2">Shop By Purpose</h2>
        <p className="mb-5 mx-auto" style={{ maxWidth: '650px', color: '#444', fontSize: '15px' }}>
          We just made it easy for you to shop on your terms. Let's get started to find your way for Passion for Nutrition.
        </p>

        <div className="row g-4 justify-content-center pt-5 pb-4">
          <div className="col-6 col-md-3">
            <div className="purpose-card card-bg-gifting">
              <div className="purpose-default">
                <div className="purpose-circle">
                  <Image src="/shop-by-purpose1.svg" alt="Gifting" width={60} height={60} style={{ width: '100%', height: 'auto' }} />
                </div>
                <h4 className="purpose-title">Gifting</h4>
              </div>
              <div className="purpose-hover">
                <p className="hover-text">Wanna gift your special ones something healthy and tasty? Let's go!</p>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="purpose-card card-bg-cooking">
              <div className="purpose-default">
                <div className="purpose-circle">
                  <Image src="/shop-by-purpose2.svg" alt="Cooking" width={60} height={60} style={{ width: '100%', height: 'auto' }} />
                </div>
                <h4 className="purpose-title">Cooking</h4>
              </div>
              <div className="purpose-hover">
                <p className="hover-text">Elevate your culinary creations with our premium assortment of cooking ingredients.</p>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="purpose-card card-bg-snacking">
              <div className="purpose-default">
                <div className="purpose-circle">
                  <Image src="/shop-by-purpose3.svg" alt="Snacking" width={60} height={60} style={{ width: '100%', height: 'auto' }} />
                </div>
                <h4 className="purpose-title">Snacking</h4>
              </div>
              <div className="purpose-hover">
                <p className="hover-text">Grab our perfectly roasted, crunchy and flavored treats for a guilt-free bite.</p>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="purpose-card card-bg-nutrition">
              <div className="purpose-default">
                <div className="purpose-circle">
                  <Image src="/shop-by-purpose4.svg" alt="Daily Nutrition" width={60} height={60} style={{ width: '100%', height: 'auto' }} />
                </div>
                <h4 className="purpose-title">Daily Nutrition</h4>
              </div>
              <div className="purpose-hover">
                <p className="hover-text">Power your day with protein-packed essential nuts for your health goals.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(ShopByPurpose);
