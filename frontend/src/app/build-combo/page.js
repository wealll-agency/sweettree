'use client';

import { useEffect, useState, Suspense } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/cartSlice.js';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../utils/axiosConfig';

export default function BuildComboPage() {
  return (
    <Suspense fallback={<div className="text-center py-5">Loading combo boxes...</div>}>
      <ComboListingContent />
    </Suspense>
  );
}

function ComboListingContent() {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comboBanners, setComboBanners] = useState([]);
  const [viewType, setViewType] = useState('grid');
  const [sortBy, setSortBy] = useState('Best Selling');
  const { showAlert } = useNotification();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await api.get('/banners');
        if (res.data.success) {
          const fetchedBanners = res.data.banners.filter(b => b.placement === 'ComboBox');
          if (fetchedBanners.length > 0) {
            setComboBanners(fetchedBanners);
          }
        }
      } catch (error) {}
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const res = await api.get('/combos');
        if (res.data.success) {
          setCombos(res.data.combos);
        }
      } catch (err) {
        console.error('Failed to load combos');
      } finally {
        setLoading(false);
      }
    };
    fetchCombos();
  }, []);

  const handleAddToCart = (e, combo) => {
    e.preventDefault();
    e.stopPropagation();
    
    dispatch(addToCart({
      combo,
      itemType: 'Combo',
      quantity: 1,
      size: 'Standard'
    }));

    showAlert(`${combo.name} added to cart`, 'success');

    if (typeof window !== 'undefined' && window.bootstrap) {
      const offcanvas = document.getElementById('cartOffcanvas');
      if (offcanvas) {
        const bsOffcanvas = window.bootstrap.Offcanvas.getOrCreateInstance(offcanvas);
        bsOffcanvas.show();
      }
    }
  };

  return (
    <>
      <div className="marquee-wrapper">
        <marquee behavior="scroll" direction="left" scrollamount="5">
          || 🥜 Sweettree Anmol Jumbo Nuts - Extra 10% OFF! 🥜 || 🎁 Nuts For Savings 🎁 || 🔥 PayDay Sale Is LIVE - Extra 15% OFF Sitewide! 🔥 ||
        </marquee>
      </div>

      {/* Combo Box Banner */}
      <section className="shop-banner">
        <div className="container-fluid px-1 px-md-4 px-lg-5">
          <div className="shop_banner_image">
            {comboBanners.length > 0 ? (
              comboBanners.map(banner => (
                <a href={banner.targetLink || '#'} key={banner._id}>
                  <Image 
                    src={banner.image.startsWith('http') || banner.image.startsWith('/') ? banner.image : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : ''}${banner.image}`} 
                    alt={banner.title || "Combo Box Banner"} 
                    width={1920} 
                    height={300} 
                    priority={true} 
                    style={{ width: '100%', height: '100%', maxHeight: '350px', objectFit: 'cover', display: 'block', marginBottom: '15px', borderRadius: '15px' }} 
                  />
                </a>
              ))
            ) : (
              <Image src="/shop_banner.jpg" alt="Shop Banner" width={1920} height={300} priority={true} style={{ width: '100%', height: 'auto', display: 'block' }} />
            )}
          </div>
        </div>
      </section>

      <div className="container-fluid px-4 px-lg-5 py-5 pb-5">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-4" style={{ fontSize: '13px' }}>
            <li className="breadcrumb-item"><Link href="/" className="text-muted">Home</Link></li>
            <li className="breadcrumb-item active text-dark fw-bold" aria-current="page">Combo Boxes</li>
          </ol>
        </nav>

        {/* Minimal View Bar */}
        <div className="view-tools-bar mb-4">
          <div className="d-none d-lg-flex align-items-center">
            <button 
              onClick={() => setViewType('grid')}
              className={`view-btn ${viewType === 'grid' ? 'active' : ''}`}
            >
              <i className="fas fa-th-large me-1"></i> Grid View
            </button>
            <div className="vr mx-3" style={{ height: '20px', opacity: 0.2 }}></div>
            <button 
              onClick={() => setViewType('list')}
              className={`view-btn ${viewType === 'list' ? 'active' : ''}`}
            >
              <i className="fas fa-list me-1"></i> List View
            </button>
          </div>

          <div className="sort-select-wrapper d-none d-lg-block">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select form-select-sm border-dark rounded-pill px-3" 
              style={{ width: '175px' }}
            >
              <option>Best Selling</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest</option>
            </select>
          </div>
        </div>

      {loading ? (
        <div className="row g-4">
          {[1, 2, 3].map(idx => (
            <div key={idx} className="col-sm-6 col-md-4 col-lg-3 px-2 py-3">
              <div className="placeholder-glow">
                <div className="placeholder bg-light w-100 rounded mb-2" style={{ height: '300px' }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : combos.length === 0 ? (
        <div className="text-center py-5">
          <h4 className="text-muted">No Combos available at the moment.</h4>
          <p>Please check back later.</p>
        </div>
      ) : (
        <div className={viewType === 'grid' ? "products-grid" : "row g-3"} id="shopProductGrid">
          {(() => {
            const sortedCombos = [...combos].sort((a, b) => {
              if (sortBy === 'Price: Low to High') {
                return a.comboPrice - b.comboPrice;
              }
              if (sortBy === 'Price: High to Low') {
                return b.comboPrice - a.comboPrice;
              }
              if (sortBy === 'Newest') {
                return new Date(b.createdAt) - new Date(a.createdAt);
              }
              return 0;
            });

            return sortedCombos.map((combo) => {
              const mrp = combo.regularTotal || 0;
              const savings = Math.max(0, mrp - combo.comboPrice);
              
              let image = '/placeholder.png';
              if (combo.image) {
                image = combo.image.replace('/assets/images/', '/');
              }

              // Calculate Availability (Combo stock)
              let maxStock = Infinity;
              combo.components?.forEach(comp => {
                if (comp.product) {
                  const possible = Math.floor((comp.product.stock || 0) / comp.quantity);
                  if (possible < maxStock) maxStock = possible;
                } else {
                  maxStock = 0;
                }
              });

              const isOutOfStock = maxStock <= 0;

              return viewType === 'grid' ? (
                <div key={combo._id}>
                  <article className="product-card h-100">
                    
                    <div className="product-card__media">
                      <div className="product-card__badges">
                        <span></span>
                        {savings > 0 && (
                          <span className="product-card__discount-badge">
                            ₹{savings} OFF
                          </span>
                        )}
                      </div>

                      <div className="product-card__image-wrapper">
                        {isOutOfStock && (
                          <div style={{
                            position: 'absolute', inset: 0, zIndex: 8,
                            background: 'rgba(248,250,252,0.7)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <span style={{
                              background: '#ef4444', color: 'white', fontWeight: '700',
                              fontSize: '12px', padding: '6px 16px', borderRadius: '9999px',
                              boxShadow: '0 4px 12px rgba(239,68,68,0.3)', letterSpacing: '0.05em',
                            }}>OUT OF STOCK</span>
                          </div>
                        )}

                        <Link href={`/combos/${combo._id}`} onClick={(e) => isOutOfStock && e.preventDefault()} style={{ display: 'block', position: 'relative', height: '100%', width: '100%' }}>
                          <Image 
                            src={image} 
                            alt={combo.name} 
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="product-card__image product-card__image--contain"
                          />
                        </Link>
                      </div>
                    </div>

                    <div className="product-card__content">
                      <div className="product-card__meta">
                        <span className="product-card__brand">
                          {combo.brand || 'SWEETTREE'}
                        </span>
                        <span className="product-card__rating">
                          <Star size={12} fill="#ffb800" color="#ffb800" stroke="#ffb800" />
                          5.0
                        </span>
                      </div>

                      <Link href={`/combos/${combo._id}`} style={{ textDecoration: 'none', marginBottom: 'auto' }}>
                        <h3 className="product-card__title" title={combo.name}>
                          {combo.name}
                        </h3>
                      </Link>

                      <div className="product-card__pricing">
                        <span className="product-card__price">
                          ₹{combo.comboPrice}
                        </span>
                        {mrp > combo.comboPrice && (
                          <span className="product-card__mrp">₹{mrp}</span>
                        )}
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>({combo.components?.length} Items)</span>
                      </div>

                      <div className="product-card__actions" style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                        {isOutOfStock ? (
                          <Link
                            href={`/combos/${combo._id}`}
                            className="product-card__cart"
                            style={{ flex: 1, background: '#f1f5f9', color: '#64748b', textDecoration: 'none', border: '1.5px solid #e2e8f0', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            View Details
                          </Link>
                        ) : (
                          <button 
                            onClick={(e) => handleAddToCart(e, combo)}
                            className="product-card__cart"
                            style={{ flex: 1 }}
                            aria-label="Add product to cart"
                          >
                            <ShoppingCart size={18} /> Add To Cart
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                </div>
              ) : (
                <div className="col-12" key={combo._id}>
                  <div className="card border-0 shadow-sm p-3 rounded-3" style={{ border: '1px solid #eee' }}>
                    <div className="row g-0 align-items-center">
                      <div className="col-4 col-md-3 text-center position-relative" style={{ height: '130px' }}>
                        <Image 
                          src={image} 
                          className="img-fluid rounded" 
                          alt={combo.name} 
                          fill
                          sizes="(max-width: 768px) 33vw, 25vw"
                          style={{ objectFit: 'contain', objectPosition: 'center' }} 
                        />
                      </div>
                      <div className="col-8 col-md-9 ps-3 ps-md-4">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <span className="badge bg-light text-dark border mb-1">{combo.brand || 'SWEETTREE'}</span>
                            <h5 className="fw-bold text-dark mb-1">{combo.name}</h5>
                            <p className="text-muted fs-7 mb-2 text-truncate-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>Premium curated combo featuring {combo.components?.length || 0} carefully selected items.</p>
                          </div>
                          {savings > 0 && <span className="badge bg-danger">₹{savings} OFF</span>}
                        </div>
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <span className="fw-bold fs-5 text-success">₹{combo.comboPrice}</span>
                          {mrp > combo.comboPrice && (
                            <span className="text-muted text-decoration-line-through fs-7">₹{mrp}</span>
                          )}
                        </div>
                        <Link href={`/combos/${combo._id}`} className="btn btn-sm btn-brand px-4 text-white" style={{ backgroundColor: '#005B6E' }}>
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* Pagination */}
      {!loading && combos.length > 0 && (
        <div className="pagination-wrapper d-flex justify-content-center mt-5 mb-5">
          <nav>
            <ul className="pagination custom-maroon-pagination">
              <li className="page-item active text-white"><a className="page-link bg-transparent text-white" href="#">1</a></li>
            </ul>
          </nav>
        </div>
      )}

      </div>
    </>
  );
}
