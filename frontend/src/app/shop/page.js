'use client';
import React, from 'react';
import Link from 'next/link';

export default function ShopPage() {
  return (
    <>
      <div className="marquee-wrapper">
        <marquee behavior="scroll" direction="left" scrollamount="5">
          || 🥜 Sweettree Anmol Jumbo Nuts - Extra 10% OFF! 🥜 || 🎁 Nuts For Savings 🎁 || 🔥 PayDay Sale Is LIVE - Extra 15% OFF Sitewide! 🔥 ||
        </marquee>
      </div>

      {/* Shop Banner */}
      <section className="shop-banner">
        <div className="container">
          <div className="shop_banner_image">
            <img src="/shop_banner.jpg" alt="" />
          </div>
        </div>
      </section>

      {/* Breadcrumb and Description */}
      <div className="container py-3">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-2" style={{ fontSize: '13px' }}>
            <li className="breadcrumb-item"><Link href="/" className="text-muted">Home</Link></li>
            <li className="breadcrumb-item active text-dark fw-bold" aria-current="page">Shop</li>
          </ol>
        </nav>
        <p className="mb-4" style={{ fontSize: '14px', color: '#555' }}>
          Nutraj <strong>PAYDAY SALE is Live!</strong> ✨ Get up to <strong>60% Off + Extra 15% Off</strong> on premium Nuts & Dry Fruits. Shop now for healthy savings!
        </p>
      </div>

      <div className="container pb-5">
        <div className="row">
          {/* Sidebar Filters */}
          <div className="col-lg-3 d-none d-lg-block">
            <div className="shop-sidebar-filter card border-0 shadow-sm rounded-0 p-4 mb-4">
              <div className="filter-header d-flex justify-content-between align-items-center mb-1">
                <h5 className="fw-bold m-0 text-dark" style={{ fontSize: '16px' }}>Filter By</h5>
              </div>

              {/* Price Filter */}
              <div className="filter-section border-top py-3">
                <div className="d-flex justify-content-between align-items-center filter-toggle" data-bs-toggle="collapse" data-bs-target="#priceFilter">
                  <span className="fw-bold" style={{ fontSize: '14px' }}>Price</span>
                  <i className="fas fa-minus small"></i>
                </div>
                <div id="priceFilter" className="collapse show mt-3">
                  <div className="from-to-inputs d-flex align-items-center gap-2">
                    <div className="input-group input-group-sm border rounded">
                      <span className="input-group-text bg-white border-0 text-muted">₹</span>
                      <input type="text" className="form-control border-0 px-1" placeholder="From" />
                    </div>
                    <div className="input-group input-group-sm border rounded">
                      <span className="input-group-text bg-white border-0 text-muted">₹</span>
                      <input type="text" className="form-control border-0 px-1" placeholder="To" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Availability Filter */}
              <div className="filter-section border-top py-3">
                <div className="d-flex justify-content-between align-items-center filter-toggle collapsed" data-bs-toggle="collapse" data-bs-target="#stockFilter">
                  <span className="fw-bold" style={{ fontSize: '14px' }}>Availability</span>
                  <i className="fas fa-plus small"></i>
                </div>
                <div id="stockFilter" className="collapse mt-3">
                  <div className="d-flex flex-wrap gap-2">
                    <button className="filter-pill-btn active">In Stock</button>
                    <button className="filter-pill-btn">Out Of Stock</button>
                  </div>
                </div>
              </div>

              {/* Brand Filter */}
              <div className="filter-section border-top py-3">
                <div className="d-flex justify-content-between align-items-center filter-toggle collapsed" data-bs-toggle="collapse" data-bs-target="#brandFilter">
                  <span className="fw-bold" style={{ fontSize: '14px' }}>Brand</span>
                  <i className="fas fa-plus small"></i>
                </div>
                <div id="brandFilter" className="collapse mt-3">
                  <div className="d-flex flex-wrap gap-2">
                    <button className="filter-tag-btn">Nutraj</button>
                    <button className="filter-tag-btn">Nutraj Anmol</button>
                    <button className="filter-tag-btn">Nutraj Bundle Store</button>
                    <button className="filter-tag-btn">Nutraj Kitchen Essential</button>
                    <button className="filter-tag-btn">Nutraj Snackrite</button>
                  </div>
                </div>
              </div>

              {/* Discount Filter */}
              <div className="filter-section border-top py-3">
                <div className="d-flex justify-content-between align-items-center filter-toggle collapsed" data-bs-toggle="collapse" data-bs-target="#discountFilter">
                  <span className="fw-bold" style={{ fontSize: '14px' }}>Discount</span>
                  <i className="fas fa-plus small"></i>
                </div>
                <div id="discountFilter" className="collapse mt-3">
                  <div className="discount-grid">
                    <button className="filter-tag-btn">0.21</button>
                    <button className="filter-tag-btn">3% Off</button>
                    <button className="filter-tag-btn">4% Off</button>
                    <button className="filter-tag-btn">10% Off</button>
                  </div>
                </div>
              </div>

              {/* Shop By Category */}
              <div className="filter-section border-top py-3">
                <div className="d-flex justify-content-between align-items-center filter-toggle" data-bs-toggle="collapse" data-bs-target="#shopCatFilter">
                  <span className="fw-bold">Shop By Category</span>
                  <i className="fas fa-minus"></i>
                </div>
                <div id="shopCatFilter" className="collapse show mt-3">
                  <div className="discount-grid">
                    <button className="filter-tag-btn">Almond</button>
                    <button className="filter-tag-btn">Apricot</button>
                    <button className="filter-tag-btn">Cashew</button>
                    <button className="filter-tag-btn">Dates</button>
                    <button className="filter-tag-btn">Fig</button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="col-lg-9">
            {/* Minimal View Bar */}
            <div className="view-tools-bar mb-4">
              <div className="d-none d-lg-flex align-items-center">
                <button className="view-btn active"><i className="fas fa-th-large"></i> Grid View</button>
                <div className="vr mx-3" style={{ height: '20px', opacity: 0.2 }}></div>
                <button className="view-btn"><i className="fas fa-list"></i> List View</button>
              </div>

              <div className="sort-select-wrapper d-none d-lg-block">
                <select className="form-select form-select-sm border-dark rounded-pill px-3" style={{ width: '160px' }}>
                  <option>Best Selling</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                </select>
              </div>
            </div>

            <div className="row row-cols-2 row-cols-lg-3 g-2 g-lg-4" id="shopProductGrid">
              {/* Product 1 */}
              <div className="col">
                <div className="Sweettree-product-card">
                  <Link href="/shop-details?name=Nutraj%20Anmol%20Premium%20Medjool%20Dates%20500gm" className="product-card-link">
                    <div className="product-img-box">
                      <div className="product-tags d-flex justify-content-between">
                        <span className="tag-left">PREMIUM</span>
                        <span className="tag-right">45% off</span>
                      </div>
                      <img src="/top_product1.png" alt="Product" />
                    </div>
                    <div className="card-divider"></div>
                    <div className="product-details-content">
                      <div className="product-meta d-flex justify-content-between align-items-center">
                        <span className="brand-text">NUTRAJ ANMOL</span>
                        <div className="rating-heart">
                          <span className="rating-badge"><i className="fas fa-star"></i> 4.9</span>
                          <i className="far fa-heart"></i>
                        </div>
                      </div>
                      <h3 className="product-name">Nutraj Anmol Premium Medjool Dates 500gm</h3>
                      <div className="product-pricing">
                        MRP: <del>₹1,578</del> <span className="current-price">₹856</span> <span className="per-gram">( ₹171 / 100g )</span>
                      </div>
                    </div>
                  </Link>
                  <div className="px-3 pb-3">
                    <button className="Sweettree-btn-cart">Add To Cart</button>
                  </div>
                </div>
              </div>

              {/* Product 2 */}
              <div className="col">
                <div className="Sweettree-product-card">
                  <Link href="/shop-details?name=Nutraj%20Anmol%20Walnut%20Kernels%20Premium%20500gm" className="product-card-link">
                    <div className="product-img-box">
                      <div className="product-tags d-flex justify-content-between">
                        <span className="tag-left">PREMIUM</span>
                        <span className="tag-right">35% off</span>
                      </div>
                      <img src="/top_product2.png" alt="Product" />
                    </div>
                    <div className="card-divider"></div>
                    <div className="product-details-content">
                      <div className="product-meta d-flex justify-content-between align-items-center">
                        <span className="brand-text">NUTRAJ ANMOL</span>
                        <div className="rating-heart">
                          <span className="rating-badge"><i className="fas fa-star"></i> 4.8</span>
                          <i className="far fa-heart"></i>
                        </div>
                      </div>
                      <h3 className="product-name">Nutraj Anmol Walnut Kernels Premium 500gm</h3>
                      <div className="product-pricing">
                        MRP: <del>₹1,499</del> <span className="current-price">₹972</span> <span className="per-gram">( ₹194 / 100g )</span>
                      </div>
                    </div>
                  </Link>
                  <div className="px-3 pb-3">
                    <button className="Sweettree-btn-cart">Add To Cart</button>
                  </div>
                </div>
              </div>
              
              {/* Product 3 */}
              <div className="col">
                <div className="Sweettree-product-card">
                  <Link href="/shop-details?name=Nutraj%20Anmol%20Jumbo%20Size%20Mamra%20Almonds%20500gm" className="product-card-link">
                    <div className="product-img-box">
                      <div className="product-tags d-flex justify-content-between">
                        <span className="tag-left">PREMIUM</span>
                        <span className="tag-right">19% off</span>
                      </div>
                      <img src="/top_product3.png" alt="Product" />
                    </div>
                    <div className="card-divider"></div>
                    <div className="product-details-content">
                      <div className="product-meta d-flex justify-content-between align-items-center">
                        <span className="brand-text">NUTRAJ ANMOL</span>
                        <div className="rating-heart">
                          <span className="rating-badge"><i className="fas fa-star"></i> 5.0</span>
                          <i className="far fa-heart"></i>
                        </div>
                      </div>
                      <h3 className="product-name">Nutraj Anmol Jumbo Size Mamra Almonds 500gm</h3>
                      <div className="product-pricing">
                        MRP: <del>₹3,389</del> <span className="current-price">₹2,737</span> <span className="per-gram">( ₹547 / 100g )</span>
                      </div>
                    </div>
                  </Link>
                  <div className="px-3 pb-3">
                    <button className="Sweettree-btn-cart">Add To Cart</button>
                  </div>
                </div>
              </div>

            </div>
            
            {/* Pagination */}
            <div className="pagination-wrapper d-flex justify-content-center mt-5 mb-5">
              <nav>
                <ul className="pagination custom-maroon-pagination">
                  <li className="page-item active text-white"><a className="page-link bg-transparent text-white" href="#">1</a></li>
                  <li className="page-item"><a className="page-link text-dark" href="#">2</a></li>
                  <li className="page-item"><a className="page-link text-dark" href="#">3</a></li>
                  <li className="page-item"><a className="page-link text-dark" href="#">&gt;</a></li>
                </ul>
              </nav>
            </div>

          </div>
        </div>
      </div>
      
      {/* People Are Also Looking For Section */}
      <section className="tags-section bg-white py-5">
        <div className="container py-3">
          <h3 className="mb-4 text-start" style={{ fontSize: '24px', color: '#333' }}>People Are Also Looking For</h3>
          <div className="d-flex flex-wrap gap-2">
            <a href="#" className="search-tag-pill">Cashew Royale</a>
            <a href="#" className="search-tag-pill">Cashew Premium</a>
            <a href="#" className="search-tag-pill">Almond American</a>
            <a href="#" className="search-tag-pill">Mamra</a>
            <a href="#" className="search-tag-pill">Kishmish Royale</a>
            <a href="#" className="search-tag-pill">Walnut Royale</a>
          </div>
        </div>
      </section>
    </>
  );
}
