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
  const dispatch = useDispatch();
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useNotification();

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
    <div className="container-fluid px-4 px-lg-5 py-5">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb mb-4" style={{ fontSize: '13px' }}>
          <li className="breadcrumb-item"><Link href="/" className="text-muted">Home</Link></li>
          <li className="breadcrumb-item active text-dark fw-bold" aria-current="page">Combo Boxes</li>
        </ol>
      </nav>

      <div className="mb-5 text-center">
        <h2 className="main-title mb-2" style={{ color: '#203d74' }}>Premium Combo Boxes</h2>
        <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
          Discover our exclusive curated combos at unbeatable prices. Perfect for gifting or stocking up on your favorites.
        </p>
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
        <div className="row g-4" id="shopProductGrid">
          {combos.map((combo) => {
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

            return (
              <div key={combo._id} className="col-sm-6 col-md-4 col-lg-3 px-2 py-3">
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
            );
          })}
        </div>
      )}
    </div>
  );
}
