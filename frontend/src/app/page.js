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
  RecentBlogs, 
  Faqs, 
  TagsSection, 
  HealthyCombo 
} from '../components/HomeSections';

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
    <main>
      <HeroSlider />
      <CollectionSlider />
      {topSellingProducts.length > 0 && <ProductCarouselSection title="Top Selling Products" products={topSellingProducts} />}
      <NuttyDelightOffers />
      <ShopByCategory />
      {healthyProducts.length > 0 && (
        <div className="healthy-snacks-section py-5">
           <ProductCarouselSection title="Healthy Section" products={healthyProducts} />
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
      {/* <RecentBlogs /> */}
      <Faqs />
      <Testimonials />
      <TagsSection />
    </main>
  );
}
