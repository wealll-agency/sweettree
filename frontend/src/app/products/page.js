'use client';

import { useEffect, useState, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../store/productsSlice.js';
import { toggleWishlist } from '../../store/wishlistSlice.js';
import { addToCart } from '../../store/cartSlice.js';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Star, Heart, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import ProductCard from '../../components/ProductCard.jsx';

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-center py-5">Loading catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { items: products, loading, error, pages, currentPage } = useSelector((state) => state.products);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  // Read URL queries
  const keywordQuery = searchParams.get('keyword') || '';
  const categoryQuery = searchParams.get('category') || '';
  const sortQuery = searchParams.get('sort') || '';
  const pageQuery = searchParams.get('page') || '1';

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(categoryQuery);
  const [selectedSort, setSelectedSort] = useState(sortQuery);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    // Sync filter states with URL updates
    setSelectedCategory(categoryQuery);
    setSelectedSort(sortQuery);
  }, [categoryQuery, sortQuery]);

  useEffect(() => {
    // Fetch products based on query params
    const params = {
      keyword: keywordQuery,
      category: categoryQuery,
      sort: sortQuery,
      page: pageQuery,
      minPrice,
      maxPrice
    };
    dispatch(fetchProducts(params));
  }, [dispatch, keywordQuery, categoryQuery, sortQuery, pageQuery, minPrice, maxPrice]);

  const handleBuyNow = (product) => {
    dispatch(addToCart({ product, quantity: 1, size: '100ml' }));
    router.push('/checkout');
  };

  const updateFilters = (key, value) => {
    const current = new URLSearchParams(searchParams.toString());
    if (value) {
      current.set(key, value);
    } else {
      current.delete(key);
    }
    current.delete('page'); // Reset to first page on filter change
    router.push(`/products?${current.toString()}`);
  };

  const handleCategoryChange = (category) => {
    const val = selectedCategory === category ? '' : category;
    setSelectedCategory(val);
    updateFilters('category', val);
  };

  const handleSortChange = (sortType) => {
    setSelectedSort(sortType);
    updateFilters('sort', sortType);
  };

  const handlePageChange = (pageNum) => {
    const current = new URLSearchParams(searchParams.toString());
    current.set('page', pageNum.toString());
    router.push(`/products?${current.toString()}`);
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item._id === productId);
  };

  return (
    <div className="container py-5 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="mb-4 breadcrumb-brand">
        <Link href="/">Home</Link> &gt; <span>Shop Catalog</span>
      </nav>

      <div className="row g-4">
        
        {/* Left Side: Sidebar Filters */}
        <div className="col-lg-3">
          <div className="glass-card p-4 sticky-top" style={{ top: '90px', zIndex: '10' }}>
            <div className="d-flex align-items-center gap-2 mb-4">
              <SlidersHorizontal size={18} color="var(--primary-color)" />
              <h5 className="m-0 fw-bold display-font">Filters</h5>
            </div>

            {/* Category Filter */}
            <div className="mb-4">
              <h6 className="fw-bold mb-3">Categories</h6>
              <div className="d-flex flex-column gap-2">
                {['Top Selling Products', 'Healthy Snacking', 'Dry Fruits', 'Combo Gift Box'].map((cat) => (
                  <label key={cat} className="d-flex align-items-center gap-2 cursor-pointer fs-6">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedCategory === cat}
                      onChange={() => handleCategoryChange(cat)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-4">
              <h6 className="fw-bold mb-3">Price Range (INR)</h6>
              <div className="d-flex gap-2 align-items-center">
                <input
                  type="number"
                  className="form-control form-control-brand py-1 px-2 text-center"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span className="text-muted">-</span>
                <input
                  type="number"
                  className="form-control form-control-brand py-1 px-2 text-center"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Product Catalog Grid */}
        <div className="col-lg-9">
          
          {/* Top Bar: Results Count + Sort dropdown */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4 bg-white p-3 rounded shadow-sm border">
            <div>
              <p className="m-0 text-muted">
                {keywordQuery && <span>Search results for "<strong>{keywordQuery}</strong>" — </span>}
                Showing <strong className="text-dark">{products.length}</strong> products
              </p>
            </div>
            
            <div className="d-flex align-items-center gap-2">
              <ArrowUpDown size={16} className="text-muted" />
              <select
                className="form-select border-1 fs-6"
                value={selectedSort}
                onChange={(e) => handleSortChange(e.target.value)}
                style={{ width: '180px', borderRadius: '8px' }}
              >
                <option value="">Sort by: Latest</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Grid list */}
          {loading ? (
            <div className="row g-4">
              {[1, 2, 3, 4, 5, 6].map(idx => (
                <div key={idx} className="col-md-6 col-lg-4">
                  <div className="placeholder-glow">
                    <div className="placeholder bg-light w-100 rounded mb-2" style={{ height: '260px' }}></div>
                    <div className="placeholder bg-light col-8 mb-1"></div>
                    <div className="placeholder bg-light col-4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-5 glass-card bg-white">
              <h4 className="fw-bold mb-2">No Products Found</h4>
              <p className="text-muted mb-4">Try clearing your filters or testing a different search keyword.</p>
              <button 
                onClick={() => {
                  setMinPrice(''); setMaxPrice('');
                  router.push('/products');
                }} 
                className="btn btn-brand"
              >
                Reset Catalog
              </button>
            </div>
          ) : (
            <>
              <div className="row g-4">
                {products.map((product) => (
                  <div key={product._id} className="col-sm-6 col-md-6 col-lg-4">
                    <ProductCard 
                      product={{
                        ...product,
                        image: product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400',
                        mrp: product.mrp || Math.round(product.price / (1 - (product.discount || 0) / 100)),
                        brand: 'Sweettree'
                      }} 
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="d-flex justify-content-center mt-5 gap-2">
                  {[...Array(pages).keys()].map((x) => (
                    <button
                      key={x + 1}
                      onClick={() => handlePageChange(x + 1)}
                      className={`btn btn-sm px-3 py-2 ${currentPage === x + 1 ? 'btn-brand' : 'btn-brand-outline'}`}
                    >
                      {x + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
}
