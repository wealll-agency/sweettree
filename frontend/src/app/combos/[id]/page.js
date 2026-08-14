'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../../store/cartSlice.js';
import Link from 'next/link';
import Image from 'next/image';
import { useNotification } from '../../../context/NotificationContext';
import { ArrowLeft, Gift, ShoppingCart, ShieldCheck } from 'lucide-react';
import api from '../../../utils/axiosConfig';

export default function ComboDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { showAlert } = useNotification();

  const [combo, setCombo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchCombo = async () => {
      try {
        const res = await api.get(`/combos/${id}`);
        if (res.data.success) {
          setCombo(res.data.combo);
        } else {
          router.push('/build-combo');
        }
      } catch (err) {
        showAlert('Failed to load combo details', 'danger');
        router.push('/build-combo');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCombo();
  }, [id, router, showAlert]);

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!combo) return null;

  // Calculate Combo Stock correctly
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
  const image = combo.image ? combo.image.replace('/assets/images/', '/') : '/placeholder.png';
  const mrp = combo.regularTotal || 0;
  const savings = Math.max(0, mrp - combo.comboPrice);

  const handleAddToCart = () => {
    if (quantity > maxStock) {
      showAlert(`Only ${maxStock} combos available right now.`, 'warning');
      return;
    }

    dispatch(addToCart({
      combo,
      itemType: 'Combo',
      quantity,
      size: 'Standard'
    }));

    showAlert(`${combo.name} added to cart!`, 'success');

    if (typeof window !== 'undefined' && window.bootstrap) {
      const offcanvas = document.getElementById('cartOffcanvas');
      if (offcanvas) {
        const bsOffcanvas = window.bootstrap.Offcanvas.getOrCreateInstance(offcanvas);
        bsOffcanvas.show();
      }
    }
  };

  const increaseQty = () => setQuantity(prev => Math.min(prev + 1, maxStock));
  const decreaseQty = () => setQuantity(prev => Math.max(prev - 1, 1));

  const handleBuyNow = () => {
    if (quantity > maxStock) return;
    dispatch(addToCart({
      combo,
      itemType: 'Combo',
      quantity,
      size: 'Standard'
    }));
    setTimeout(() => {
      router.push('/checkout');
    }, 100);
  };

  const handleShare = async () => {
    const shareData = {
      title: combo.name,
      text: `Check out ${combo.name} on Sweettree!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showAlert('Link copied to clipboard!', 'success');
      }
    } catch (err) {
      console.log('Share canceled or failed', err);
    }
  };

  return (
    <div className="container-fluid px-4 px-lg-5 py-4 mt-2 bg-white animate-fade-in">
      {/* Breadcrumb */}
      <nav className="mb-4" style={{ fontSize: '13px', color: '#666' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#666' }}>Home</Link> &gt; 
        <Link href="/build-combo" style={{ textDecoration: 'none', color: '#666' }}> Combos </Link> &gt; 
        <span style={{ color: '#333' }}>{combo.name}</span>
      </nav>

      <div className="row g-5 mb-5">
        {/* Left Side: Images */}
        <div className="col-lg-5">
          <div className="mb-3 position-relative text-center border rounded-2 p-4">
             {combo.isFeatured && <span className="badge bg-primary position-absolute top-0 start-0 m-3">PREMIUM</span>}
            <Image
              src={image}
              alt={combo.name}
              width={500}
              height={400}
              className="img-fluid object-fit-contain"
              style={{ maxHeight: '400px', width: '100%' }}
              priority
            />
          </div>
          
          <div className="d-flex justify-content-center gap-2 mb-4">
            <div 
              className="border rounded p-1 cursor-pointer border-primary border-2"
              style={{ width: '60px', height: '60px' }}
            >
                <Image src={image} width={60} height={60} className="img-fluid h-100 object-fit-contain" alt={combo.name} />
            </div>
          </div>

          <div className="d-flex justify-content-between text-center px-3 border-top pt-4">
             <div>
                <Image src="/icon_heart.png" alt="Healthy" width={30} height={30} className="mb-2" />
                <p style={{ fontSize: '11px', color: '#666' }}>100% Healthy</p>
             </div>
             <div>
                <Image src="/icon_gluten.png" alt="Gluten Free" width={30} height={30} className="mb-2" />
                <p style={{ fontSize: '11px', color: '#666' }}>Gluten Free</p>
             </div>
             <div>
                <Image src="/icon_nutrition.png" alt="Nutrition" width={30} height={30} className="mb-2" />
                <p style={{ fontSize: '11px', color: '#666' }}>Powerful Nutrition</p>
             </div>
             <div>
                <Image src="/icon_cholesterol.png" alt="Cholesterol" width={30} height={30} className="mb-2" />
                <p style={{ fontSize: '11px', color: '#666' }}>Cholesterol Free</p>
             </div>
          </div>
        </div>

        {/* Right Side: Details */}
        <div className="col-lg-7 ps-lg-5">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h1 className="fw-bold mb-2" style={{ fontSize: '24px', color: '#333', maxWidth: '80%' }}>{combo.name}</h1>
            <i className="fas fa-share-alt" onClick={handleShare} style={{ fontSize: '20px', cursor: 'pointer', color: '#666', padding: '5px' }}></i>
          </div>
          
          <div className="d-flex align-items-center gap-2 mb-3 pb-3 border-bottom">
            <div className="d-flex text-warning">
              {[...Array(5).keys()].map(x => (
                <svg key={x} width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              ))}
            </div>
            <span className="badge bg-success text-white">5.0</span>
            <span className="text-muted" style={{ fontSize: '13px' }}>0 reviews</span>
          </div>

          <div className="d-flex align-items-center gap-3 mb-1">
            <span className="fw-bold" style={{ fontSize: '32px', color: '#005B6E' }}>₹{combo.comboPrice}</span>
            {savings > 0 && (
              <span className="badge bg-danger">
                ₹{savings} OFF
              </span>
            )}
          </div>
          <p className="text-muted mb-4" style={{ fontSize: '14px' }}>MRP: <del>₹{mrp}</del> <span style={{ fontSize: '12px' }}>(MRP inclusive of all taxes)</span></p>

          <p className="text-muted mb-4 fs-6">{combo.description}</p>

          <div className="row mb-4">
             <div className="col-md-3">
                 <p className="fw-bold mb-2" style={{ fontSize: '14px' }}>Quantity</p>
                 <div className="d-flex align-items-center border rounded justify-content-between p-1" style={{ width: '100px' }}>
                    <button onClick={decreaseQty} className="btn btn-sm border-0"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                    <span className="fw-bold">{quantity}</span>
                    <button onClick={increaseQty} className="btn btn-sm border-0" disabled={quantity >= maxStock}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                 </div>
             </div>
              <div className="col-md-9">
                 <p className="fw-bold mb-2" style={{ fontSize: '14px' }}>What's inside this combo?</p>
                 <div className="row g-2">
                      {combo.components?.map((comp, idx) => (
                         <div key={idx} className="col-12 col-sm-6">
                           <Link 
                             href={`/shop-details?id=${comp.product?._id || comp.product}`} 
                             style={{ textDecoration: 'none', color: 'inherit' }}
                           >
                             <div className="border rounded p-2 d-flex align-items-center gap-3 h-100 transition-all product-card-hover" style={{ cursor: 'pointer' }}>
                               <div style={{ width: '40px', height: '40px', position: 'relative', flexShrink: 0, backgroundColor: '#f8f9fa', borderRadius: '4px', overflow: 'hidden' }}>
                                 {comp.product?.images?.[0] || comp.product?.image ? (
                                   <Image 
                                     src={(comp.product.images?.[0] || comp.product.image).replace('/assets/images/', '/')}
                                     alt={comp.name}
                                     fill
                                     style={{ objectFit: 'contain' }}
                                   />
                                 ) : (
                                   <div className="w-100 h-100 d-flex justify-content-center align-items-center"><Gift size={14} className="text-muted opacity-50" /></div>
                                 )}
                               </div>
                               <div>
                                   <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{comp.name}</div>
                                   <div style={{ fontSize: '12px', color: '#005B6E' }}>Size: {comp.size} &times; {comp.quantity}</div>
                               </div>
                             </div>
                           </Link>
                         </div>
                      ))}
                 </div>
              </div>
          </div>

          <div className="d-flex gap-3 mb-4 d-none d-md-flex">
             {isOutOfStock ? (
               <button className="btn w-100 py-3 fw-bold" style={{ backgroundColor: '#6c757d', color: 'white' }} disabled>
                 OUT OF STOCK
               </button>
             ) : (
               <>
                 <button onClick={handleAddToCart} className="btn w-50 py-3 fw-bold" style={{ backgroundColor: '#005B6E', color: 'white' }}>
                   Add To Cart
                 </button>
                 <button onClick={handleBuyNow} className="btn btn-outline-dark w-50 py-3 fw-bold">Buy It Now</button>
               </>
             )}
          </div>
          
          <div className="mt-4 pt-3 border-top text-muted fs-7 d-flex align-items-center gap-2">
            <ShieldCheck size={18} className="text-success" />
            100% Secure Checkout & Original Products
          </div>

        </div>
      </div>

      {/* Mobile Sticky Actions (Rendered via Portal to guarantee fixed positioning) */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <div className="d-md-none mobile-sticky-actions">
           <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: '12px', color: '#6c757d', fontWeight: '500' }}>Final Price</span>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#212529' }}>₹{combo.comboPrice}</span>
           </div>
           <div className="d-flex gap-2">
             {isOutOfStock ? (
               <button className="btn w-100 py-2 fw-bold" style={{ backgroundColor: '#6c757d', color: 'white', fontSize: '13px' }} disabled>
                 OUT OF STOCK
               </button>
             ) : (
               <>
                 <button onClick={handleAddToCart} className="btn flex-fill py-2 fw-bold bg-white" style={{ border: '1px solid #005B6E', color: '#005B6E', fontSize: '13px' }}>
                   ADD TO CART
                 </button>
                 <button onClick={handleBuyNow} className="btn flex-fill py-2 fw-bold" style={{ backgroundColor: '#005B6E', color: 'white', border: '1px solid #005B6E', fontSize: '13px' }}>
                   BUY NOW
                 </button>
               </>
             )}
           </div>
        </div>,
        document.body
      )}

    </div>
  );
}
