'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ShopDetailsContent() {
  const searchParams = useSearchParams();
  const [productName, setProductName] = useState('Loading...');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedPack, setSelectedPack] = useState('100g');
  const [pincode, setPincode] = useState('');

  useEffect(() => {
    const name = searchParams.get('name');
    if (name) {
      setProductName(name);
    } else {
      setProductName('Sweettree For Good Daily Nutrition Protein Energy Nut Bar 100g (25g x 4)');
    }
  }, [searchParams]);

  return (
    <div className="container py-4 mt-2 bg-white">
      {/* Breadcrumb */}
      <nav className="mb-4" style={{ fontSize: '13px', color: '#666' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#666' }}>Home</Link> &gt; 
        <Link href="/shop" style={{ textDecoration: 'none', color: '#666' }}> Shop </Link> &gt; 
        <span style={{ color: '#333' }}>{productName}</span>
      </nav>

      <div className="row g-5 mb-5">
        {/* Left Side: Images */}
        <div className="col-lg-5">
          <div className="mb-3 position-relative text-center border rounded-2 p-4">
             <span className="badge bg-primary position-absolute top-0 start-0 m-3">PREMIUM</span>
            <img
              src="/top_product1.png"
              alt={productName}
              className="img-fluid object-fit-contain"
              style={{ maxHeight: '400px', width: '100%' }}
            />
          </div>
          
          <div className="d-flex justify-content-center gap-2 mb-4">
            <div className="border rounded p-1 cursor-pointer" style={{ width: '60px', height: '60px' }}>
                <img src="/top_product1.png" className="img-fluid h-100 object-fit-contain" />
            </div>
            <div className="border rounded p-1 cursor-pointer" style={{ width: '60px', height: '60px' }}>
                <img src="/top_product2.png" className="img-fluid h-100 object-fit-contain" />
            </div>
            <div className="border rounded p-1 cursor-pointer" style={{ width: '60px', height: '60px' }}>
                <img src="/top_product3.png" className="img-fluid h-100 object-fit-contain" />
            </div>
            <div className="border rounded p-1 cursor-pointer" style={{ width: '60px', height: '60px' }}>
                <img src="/top_product4.png" className="img-fluid h-100 object-fit-contain" />
            </div>
          </div>

          <div className="d-flex justify-content-between text-center px-3 border-top pt-4">
             <div>
                <img src="/icon_heart.png" alt="Healthy" height="30" className="mb-2" />
                <p style={{ fontSize: '11px', color: '#666' }}>100% Healthy</p>
             </div>
             <div>
                <img src="/icon_gluten.png" alt="Gluten Free" height="30" className="mb-2" />
                <p style={{ fontSize: '11px', color: '#666' }}>Gluten Free</p>
             </div>
             <div>
                <img src="/icon_nutrition.png" alt="Nutrition" height="30" className="mb-2" />
                <p style={{ fontSize: '11px', color: '#666' }}>Powerful Nutrition</p>
             </div>
             <div>
                <img src="/icon_cholesterol.png" alt="Cholesterol" height="30" className="mb-2" />
                <p style={{ fontSize: '11px', color: '#666' }}>Cholesterol Free</p>
             </div>
          </div>
        </div>

        {/* Right Side: Details */}
        <div className="col-lg-7 ps-lg-5">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h1 className="fw-bold mb-2" style={{ fontSize: '24px', color: '#333', maxWidth: '80%' }}>{productName}</h1>
            <i className="fas fa-share-alt" style={{ fontSize: '20px', cursor: 'pointer', color: '#666' }}></i>
          </div>
          
          <div className="d-flex align-items-center gap-2 mb-3 pb-3 border-bottom">
            <span className="badge bg-success text-white">4.8 <i className="fas fa-star" style={{ fontSize: '10px' }}></i></span>
            <span className="text-muted" style={{ fontSize: '13px' }}>785 reviews | 520 answered questions</span>
          </div>

          <div className="d-flex align-items-center gap-3 mb-1">
            <span className="fw-bold" style={{ fontSize: '32px', color: '#005B6E' }}>₹856</span>
            <span className="badge bg-danger">50% OFF</span>
          </div>
          <p className="text-muted mb-4" style={{ fontSize: '14px' }}>MRP: <del>₹1,733</del> <span style={{ fontSize: '12px' }}>(MRP inclusive of all taxes)</span></p>

          <div className="row mb-4">
             <div className="col-md-2">
                 <p className="fw-bold mb-2" style={{ fontSize: '14px' }}>Quantity</p>
                 <div className="d-flex align-items-center border rounded justify-content-between p-1" style={{ width: '90px' }}>
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="btn btn-sm border-0"><i className="fas fa-minus" style={{ fontSize: '10px' }}></i></button>
                    <span className="fw-bold">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="btn btn-sm border-0"><i className="fas fa-plus" style={{ fontSize: '10px' }}></i></button>
                 </div>
             </div>
             <div className="col-md-10">
                 <p className="fw-bold mb-2" style={{ fontSize: '14px' }}>Select Pack Size</p>
                 <div className="d-flex gap-3">
                     <div onClick={() => setSelectedPack('100g')} className={`border rounded p-2 text-center cursor-pointer ${selectedPack === '100g' ? 'border-primary border-2' : ''}`} style={{ width: '120px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold' }}>100g</div>
                        <div style={{ fontSize: '12px', color: '#005B6E' }}>₹856</div>
                     </div>
                     <div onClick={() => setSelectedPack('200g')} className={`border rounded p-2 text-center cursor-pointer ${selectedPack === '200g' ? 'border-primary border-2' : ''}`} style={{ width: '120px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold' }}>200g [Pack of 2]</div>
                        <div style={{ fontSize: '12px', color: '#005B6E' }}>₹1,649</div>
                     </div>
                 </div>
             </div>
          </div>

          <div className="d-flex gap-3 mb-4">
             <button className="btn w-50 py-3 fw-bold" style={{ backgroundColor: '#005B6E', color: 'white' }}>Add To Cart</button>
             <button className="btn btn-outline-dark w-50 py-3 fw-bold">Buy It Now</button>
          </div>

          <div className="mb-4 pt-2">
             <div className="d-flex">
                <input type="text" className="form-control rounded-start rounded-0 py-2 border-dark" placeholder="Enter Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} style={{ maxWidth: '250px' }} />
                <button className="btn btn-dark rounded-end rounded-0 px-4">Check Now</button>
             </div>
             <div className="d-flex align-items-center gap-3 mt-3">
                <div style={{ fontSize: '13px' }}><i className="fas fa-truck text-muted me-1"></i> Estimate Delivery Date</div>
                <div style={{ fontSize: '13px' }}><i className="fas fa-wallet text-muted me-1"></i> COD AVAILABLE</div>
             </div>
          </div>
        </div>
      </div>

      <div className="border-top pt-5 mb-5 text-center px-4" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="d-flex justify-content-center gap-5 border-bottom mb-4">
           {['description', 'specifications', 'reviews', 'faq'].map((tab) => (
             <button 
                key={tab} 
                className={`btn border-0 text-capitalize fw-bold pb-3 rounded-0 ${activeTab === tab ? 'border-bottom border-dark border-2' : 'text-muted'}`}
                onClick={() => setActiveTab(tab)}
                style={{ fontSize: '14px' }}
             >
                {tab}
             </button>
           ))}
        </div>
        
        {activeTab === 'description' && (
           <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.8' }}>
             Experience the authentic taste of healthiness mixed with the zeal of nature! Sweettree Anmol Medjool Dates that are locally sourced and free from any additives or preservatives. The Anmol Medjool Dates are larger than life, overall naturally nutrition-filled, and taste like heaven! Not, have to be added to your baking recipes, desserts, and daily diet, Anmol Medjool Dates are your perfect alternative to sugar cravings and a super healthy dose of dietary fiber, calcium, iron, copper, and so much more.
           </p>
        )}
        {activeTab === 'specifications' && (
           <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.8' }}>
             100% natural and premium quality dates, packaged carefully to maintain freshness. Ideal for vegan diets and gluten-free lifestyles. 
           </p>
        )}
        {activeTab === 'reviews' && (
           <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.8' }}>
             Customer reviews will be displayed here. 
           </p>
        )}
        {activeTab === 'faq' && (
           <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.8' }}>
             Frequently asked questions regarding this product will be shown here.
           </p>
        )}
      </div>

      <div className="py-5 bg-light px-4 rounded-3 text-center">
         <h4 className="fw-bold mb-4" style={{ fontSize: '18px' }}>People Are Also Looking For</h4>
         <div className="d-flex flex-wrap gap-2 justify-content-center mx-auto" style={{ maxWidth: '800px' }}>
            <span className="search-tag-pill bg-white">Cashew Royale</span>
            <span className="search-tag-pill bg-white">Cashew Premium</span>
            <span className="search-tag-pill bg-white">Almond American</span>
            <span className="search-tag-pill bg-white">Mamra</span>
            <span className="search-tag-pill bg-white">Kishmish Royale</span>
            <span className="search-tag-pill bg-white">Kishmish Premium</span>
            <span className="search-tag-pill bg-white">Walnut Royale</span>
            <span className="search-tag-pill bg-white">Anjeer</span>
            <span className="search-tag-pill bg-white">Pista</span>
            <span className="search-tag-pill bg-white">Dates Royale</span>
            <span className="search-tag-pill bg-white">Kishmish Black</span>
            <span className="search-tag-pill bg-white">Mate Coffee Creamer</span>
            <span className="search-tag-pill bg-white">Shahi Rose Trail Mix</span>
            <span className="search-tag-pill bg-white">Crazy Crunchy Corn</span>
            <span className="search-tag-pill bg-white">Museli Dry Fruits Medley</span>
            <span className="search-tag-pill bg-white">Fruity Orchard Mix</span>
            <span className="search-tag-pill bg-white">BBQ Millets Trail Mix</span>
            <span className="search-tag-pill bg-white">Museli Fruit & Nut</span>
            <span className="search-tag-pill bg-white">Cashew Green Chilli</span>
            <span className="search-tag-pill bg-white">Cashew Salted</span>
            <span className="search-tag-pill bg-white">Almond Salted</span>
            <span className="search-tag-pill bg-white">Almond Peri Peri</span>
            <span className="search-tag-pill bg-white">Cashew Cheese</span>
         </div>
      </div>
    </div>
  );
}

export default function ShopDetailsPage() {
  return (
    <Suspense fallback={<div className="container py-5 text-center">Loading product details...</div>}>
      <ShopDetailsContent />
    </Suspense>
  );
}
