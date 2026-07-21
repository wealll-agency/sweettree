'use client';
import React from 'react';
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
  const topSellingProducts = [
    {
      name: "Sweettree Anmol Premium Medjool Dates 500gm (Khajur/Khajoor)",
      brand: "Sweettree ANMOL",
      image: "/top_product1.png",
      price: "789",
      mrp: "1,578",
      perGram: "₹158 / 100g",
      rating: "4.9",
      tagLeft: "PREMIUM",
      tagLeftClass: "bg-brown",
      tagRight: "50% off",
      tagRightClass: "bg-brown"
    },
    {
      name: "Sweettree Anmol Premium Walnut Kernel (Jumbo Size - Rare Crop -...",
      brand: "Sweettree ANMOL",
      image: "/top_product2.png",
      price: "975",
      mrp: "1,499",
      perGram: "₹195 / 100g",
      rating: "4.8",
      tagLeft: "PREMIUM",
      tagLeftClass: "bg-brown",
      tagRight: "34% off",
      tagRightClass: "bg-brown"
    },
    {
      name: "Sweettree Anmol Jumbo Size Mamra Almonds 500gm",
      brand: "Sweettree ANMOL",
      image: "/top_product3.png",
      price: "2,789",
      mrp: "3,389",
      perGram: "₹558 / 100g",
      rating: "5.0",
      tagLeft: "PREMIUM",
      tagLeftClass: "bg-brown",
      tagRight: "17% off",
      tagRightClass: "bg-brown"
    },
    {
      name: "Sweettree Anmol Roasted & Salted Jumbo Size Pistachio 500gm",
      brand: "Sweettree ANMOL",
      image: "/top_product4.png",
      price: "869",
      mrp: "975",
      perGram: "₹174 / 100g",
      rating: "5.0",
      tagLeft: "PREMIUM",
      tagLeftClass: "bg-brown",
      tagRight: "10% off",
      tagRightClass: "bg-brown"
    }
  ];

  const healthySnacking = [
    {
      name: "Sweettree For Good Nutty Date Bites 180g (15g x 12 Pieces)",
      brand: "Sweettree",
      image: "/new_product1.png",
      price: "445",
      mrp: "699",
      perGram: "₹124 / 100g",
      rating: "5.0",
      tagLeft: "NEW LAUNCH",
      tagLeftClass: "bg-nmlaunch",
      tagRight: "36% off",
      tagRightClass: "bg-brown"
    },
    {
      name: "Sweettree For Good Daily Nutrition Protein Energy Nut Bar 100g (25g x...",
      brand: "Sweettree",
      image: "/top_product1.png",
      price: "169",
      mrp: "169",
      perGram: "₹169 / 100g",
      rating: "5.0",
      tagLeft: "NEW LAUNCH",
      tagLeftClass: "bg-nmlaunch"
    },
    {
      name: "Sweettree Snackrite Roasted Makhana Pudina Chatka 70g",
      brand: "Sweettree SNACKRITE",
      image: "/new_product3.png",
      price: "255",
      mrp: "556",
      perGram: "₹182 / 100g",
      tagRight: "54% off",
      tagRightClass: "bg-brown"
    },
    {
      name: "Sweettree Snackrite Makhana Peri Peri 70g",
      brand: "Sweettree SNACKRITE",
      image: "/new_product4.png",
      price: "249",
      mrp: "556",
      perGram: "₹178 / 100g",
      tagLeft: "NEW LAUNCH",
      tagLeftClass: "bg-nmlaunch",
      tagRight: "55% off",
      tagRightClass: "bg-brown"
    }
  ];

  const wholeSpices = [
    {
      name: "Sweettree Anmol Green Cardamom (Elaichi) 75g (Size - 8mm+)",
      brand: "Sweettree ANMOL",
      image: "/new_product1.png",
      price: "393",
      mrp: "600",
      perGram: "₹524 / 100g",
      tagLeft: "NEW LAUNCH",
      tagLeftClass: "bg-nmlaunch",
      tagRight: "34% off",
      tagRightClass: "bg-brown"
    },
    {
      name: "Sweettree Anmol Clove (Laung) 80gm",
      brand: "Sweettree",
      image: "/new_product2.png",
      price: "212",
      mrp: "249",
      perGram: "₹265 / 100g",
      tagRight: "14% off",
      tagRightClass: "bg-brown"
    },
    {
      name: "Sweettree Whole Spices 400g Combo Pack - Coriander Seeds 200g &..",
      brand: "Sweettree",
      image: "/new_product3.png",
      price: "240",
      mrp: "240",
      perGram: "₹60 / 100g",
      tagRight: "Pre-order",
      tagRightClass: "badge-preorder"
    },
    {
      name: "Sweettree Anmol Black Pepper (Kali Mirch) 100g",
      brand: "Sweettree ANMOL",
      image: "/new_product4.png",
      price: "360",
      mrp: "400",
      perGram: "₹360 / 100g",
      tagLeft: "NEW LAUNCH",
      tagLeftClass: "bg-nmlaunch",
      tagRight: "10% off",
      tagRightClass: "bg-brown"
    }
  ];

  return (
    <main>
      <HeroSlider />
      <CollectionSlider />
      <ProductCarouselSection title="Top Selling Products" products={topSellingProducts} />
      <NuttyDelightOffers />
      <ShopByCategory />
      <div className="healthy-snacks-section py-5">
         <ProductCarouselSection title="Healthy Snacks" products={healthySnacking} />
      </div>
      {/* <HealthyCombo /> */}
      <ShopByPurpose />
      <CashewsBanner />
      {/* <RecentBlogs /> */}
      <Faqs />
      <Testimonials />
      <TagsSection />
    </main>
  );
}
