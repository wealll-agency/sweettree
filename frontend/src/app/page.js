'use client';
import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import HeroSlider from '../components/HeroSlider';
import CollectionSlider from '../components/CollectionSlider';
import ProductCarouselSection from '../components/ProductCarouselSection';
import ShopByPurpose from '../components/ShopByPurpose';
import CashewsBanner from '../components/CashewsBanner';
import Testimonials from '../components/Testimonials';
import { 
  NuttyDelightOffers, 
  ShopByCategory, 
  Faqs, 
  TagsSection 
} from '../components/HomeSections';
import MobileProductGrid from '../components/MobileProductGrid';
import MobileCategorySection from '../components/MobileCategorySection';

export default function Home() {
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [healthyProducts, setHealthyProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [customSections, setCustomSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomepageProducts = async () => {
      try {
        const [topRes, newRes, featRes, customRes] = await Promise.all([
          api.get(`/products?topSelling=true&limit=8&inStock=true`),
          api.get(`/products?healthyProduct=true&limit=8&inStock=true`),
          api.get(`/products?homepage=true&limit=8&inStock=true`),
          api.get(`/custom-sections?activeOnly=true`)
        ]);

        const topData = topRes.data;
        const newData = newRes.data;
        const featData = featRes.data;
        const customData = customRes.data;

        if (topData.success) setTopSellingProducts(topData.products || []);
        if (newData.success) setHealthyProducts(newData.products || []);
        if (featData.success) setFeaturedProducts(featData.products || []);
        if (customData.success) setCustomSections(customData.sections || []);
      } catch (error) {
        console.error("Error fetching homepage products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomepageProducts();
  }, []);

  return (
    <main className="home-page-main">

      {/* ─── DESKTOP HOME LAYOUT (hidden on mobile) ─── */}
      <div className="d-none d-md-block">
        <HeroSlider />
        <CollectionSlider />
        {(loading || topSellingProducts.length > 0) && (
          <ProductCarouselSection title="Top Selling Products" products={topSellingProducts} loading={loading} />
        )}
        <NuttyDelightOffers />
        <ShopByCategory />
        {(loading || healthyProducts.length > 0) && (
          <div className="healthy-snacks-section py-5">
             <ProductCarouselSection title="Healthy Section" products={healthyProducts} loading={loading} />
          </div>
        )}
        <ShopByPurpose />
        {customSections.map(section => (
          section.products && section.products.length > 0 && (
            <div key={section._id} className="py-2">
              <ProductCarouselSection title={section.title} products={section.products} />
            </div>
          )
        ))}
        <CashewsBanner />
        <Faqs />
        <Testimonials />
        <TagsSection />
      </div>

      {/* ─── MOBILE HOME LAYOUT (hidden on desktop) ─── */}
      <div className="d-block d-md-none mobile-home-wrapper">

        {/* Mobile Hero Slider */}
        <div className="mobile-hero-section">
          <HeroSlider />
        </div>

        {/* Mobile Category Slider */}
        <div className="mobile-collection-wrapper">
          <CollectionSlider />
        </div>

        {/* Mobile Top Selling Products */}
        {(loading || topSellingProducts.length > 0) && (
          <MobileProductGrid
            products={topSellingProducts}
            title="Top Selling Products"
            viewAllHref="/shop"
            loading={loading}
          />
        )}

        {/* Trending Now Slider */}
        <NuttyDelightOffers />

        {/* Mobile Category Section */}
        <MobileCategorySection />

        {/* Mobile Healthy Products */}
        {(loading || healthyProducts.length > 0) && (
          <MobileProductGrid
            products={healthyProducts}
            title="Healthy Picks"
            viewAllHref="/shop?healthyProduct=true"
            loading={loading}
          />
        )}

        {/* Mobile Custom Sections */}
        {customSections.map(section =>
          section.products && section.products.length > 0 ? (
            <MobileProductGrid
              key={section._id}
              products={section.products}
              title={section.title}
              viewAllHref="/shop"
            />
          ) : null
        )}

        {/* Mobile Shop By Purpose */}
        <ShopByPurpose />

        {/* Mobile Cashews Banner */}
        <CashewsBanner />

        {/* Mobile FAQs */}
        <Faqs />

        {/* Mobile Tags */}
        <TagsSection />
      </div>
    </main>
  );
}
