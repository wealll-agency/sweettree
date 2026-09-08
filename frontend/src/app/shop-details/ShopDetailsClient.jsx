'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, clearCart } from '../../store/cartSlice';
import { fetchProducts, fetchProductDetails, fetchProductReviews, submitProductReview } from '../../store/productsSlice';
import { Star, MessageCircle, Heart, Plus, Minus } from 'lucide-react';
import { toggleWishlist } from '../../store/wishlistSlice';
import api from '../../utils/axiosConfig';
import { useNotification } from '../../context/NotificationContext';
import ProductCard from '../../components/ProductCard';

export default function ShopDetailsClient({ initialProduct }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { showAlert } = useNotification();

  const { items: products, selectedProduct, reviews, reviewsLoading } = useSelector((state) => state.products);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const { user } = useSelector((state) => state.auth);
  
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const productIdParam = searchParams.get('id');
  const productNameParam = searchParams.get('name') || '';

  // 1. Dispatch fetch details and reviews
  useEffect(() => {
    if (productIdParam) {
      dispatch(fetchProductDetails(productIdParam));
      dispatch(fetchProductReviews(productIdParam));
    } else if (productNameParam && products && products.length > 0) {
      const searchName = productNameParam.toLowerCase().trim();
      const matched = products.find(p => p.name.toLowerCase().trim() === searchName);
      if (matched) {
        dispatch(fetchProductDetails(matched._id));
        dispatch(fetchProductReviews(matched._id));
      }
    } else if (!products || products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, productIdParam, productNameParam, products]);

  // 2. Resolve the real product: selectedProduct from Redux -> initialProduct from SSR -> matched from products list
  const realProduct = selectedProduct || (initialProduct && initialProduct._id === productIdParam ? initialProduct : null) || initialProduct || (products && products.length > 0 ? (
    productIdParam
      ? products.find(p => p._id === productIdParam)
      : products.find(p => {
          const pName = p.name.toLowerCase().trim();
          const searchName = productNameParam.toLowerCase().trim();
          return pName.includes(searchName) || searchName.includes(pName);
        })
  ) : null);

  // 3. If matched by name, dispatch its reviews
  useEffect(() => {
    if (realProduct && !productIdParam) {
      dispatch(fetchProductReviews(realProduct._id));
    }
  }, [dispatch, realProduct, productIdParam]);

  const defaultPackName = realProduct ? `${realProduct.unitValue || 1} ${realProduct.unit || 'Pack'}` : '';
  const [selectedPack, setSelectedPack] = useState('');
  useEffect(() => {
    if (realProduct) {
      setSelectedPack(defaultPackName);
    }
  }, [realProduct, defaultPackName]);

  let basePrice = realProduct ? realProduct.price : 0;
  if (realProduct && selectedPack !== defaultPackName && realProduct.packSizes && realProduct.packSizes.length > 0) {
    const selectedPackObj = realProduct.packSizes.find(p => `${p.weight} ${p.unit}` === selectedPack);
    if (selectedPackObj) {
      basePrice = selectedPackObj.price;
    }
  }

  let finalPrice = basePrice;
  if (realProduct && realProduct.discount > 0) {
    if (realProduct.discountType === 'Percent') {
      finalPrice = Math.round(basePrice * (1 - realProduct.discount / 100));
    } else {
      finalPrice = Math.max(0, basePrice - realProduct.discount);
    }
  }

  if (!realProduct) {
    return (
      <div className="container-fluid px-4 px-lg-5 py-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-success mb-3" role="status">
          <span className="visually-hidden">Loading product details...</span>
        </div>
        <p className="text-muted">Loading product details...</p>
      </div>
    );
  }

  // Calculate Related Products
  const relatedProducts = products
    ? products
        .filter(p => p._id !== realProduct._id && p.isActive)
        .sort((a, b) => {
          let scoreA = 0;
          let scoreB = 0;
          if (a.category === realProduct.category) scoreA += 1;
          if (a.subCategory && a.subCategory === realProduct.subCategory) scoreA += 2;

          if (b.category === realProduct.category) scoreB += 1;
          if (b.subCategory && b.subCategory === realProduct.subCategory) scoreB += 2;
          
          return scoreB - scoreA;
        })
        .slice(0, 4)
    : [];

  const handleAddToCart = () => {
    const mockProduct = {
      _id: realProduct._id,
      name: realProduct.name,
      price: finalPrice,
      discount: 0, // already applied
      image: realProduct.images && realProduct.images.length > 0 ? realProduct.images[0] : '/placeholder.png',
      unit: selectedPack || defaultPackName,
      unitValue: 1,
      stock: realProduct.stock,
      category: realProduct.category
    };
    dispatch(addToCart({ product: mockProduct, quantity, packSize: selectedPack || defaultPackName }));

    if (typeof window !== 'undefined' && window.bootstrap) {
      const offcanvas = document.getElementById('cartOffcanvas');
      if (offcanvas) {
        window.bootstrap.Offcanvas.getOrCreateInstance(offcanvas).show();
      }
    }
  };

  const handleBuyNow = () => {
    const mockProduct = {
      _id: realProduct._id,
      name: realProduct.name,
      price: finalPrice,
      discount: 0,
      image: realProduct.images?.[0] || '/top_product1.png',
      stock: realProduct.stock || 100
    };
    
    dispatch(clearCart());
    
    dispatch(addToCart({
      product: mockProduct,
      quantity,
      size: selectedPack || defaultPackName
    }));

    setTimeout(() => {
      router.push('/checkout');
    }, 100);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    if (!comment.trim()) {
      setReviewError('Please enter a comment');
      return;
    }

    const formData = new FormData();
    formData.append('productId', realProduct._id);
    formData.append('rating', rating);
    formData.append('comment', comment.trim());

    dispatch(submitProductReview(formData))
      .unwrap()
      .then(() => {
        setReviewSuccess('Review submitted successfully!');
        setComment('');
        setRating(5);
        setReviewError('');
        dispatch(fetchProductReviews(realProduct._id));
      })
      .catch((err) => {
        setReviewError(err || 'Failed to submit review. You can only review once and must buy this product first.');
      });
  };

  const handleNotifyMe = async () => {
    if (!user) {
      router.push(`/login?redirect=/shop-details?id=${realProduct._id}`);
      return;
    }
    
    setNotifyLoading(true);
    try {
      const response = await api.post('/notifications/stock', { productId: realProduct._id });
      if (response.data.success) {
        showAlert(response.data.message, 'success');
      }
    } catch (error) {
      showAlert(error.response?.data?.message || 'Failed to subscribe to notifications', 'error');
    } finally {
      setNotifyLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: realProduct.name,
      text: `Check out ${realProduct.name} on Sweettree!`,
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

  const isInWishlist = mounted && wishlistItems.some(item => item._id === realProduct._id);
  const images = realProduct.images && realProduct.images.length > 0 ? realProduct.images : ['/top_product1.png'];

  const getImageUrl = (url) => {
    if (!url) return '';
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : '';
    if (url.startsWith('http') || url.startsWith('/')) return url;
    return `${baseUrl}${url}`;
  };

  return (
    <div className="container-fluid px-4 px-lg-5 py-4 mt-2 bg-white animate-fade-in">
      {/* Breadcrumb */}
      <nav className="mb-4" style={{ fontSize: '13px', color: '#666' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#666' }}>Home</Link> &gt; 
        <Link href="/shop" style={{ textDecoration: 'none', color: '#666' }}> Shop </Link> &gt; 
        <span style={{ color: '#333' }}>{realProduct.name}</span>
      </nav>

      <div className="row g-5 mb-5">
        {/* Left Side: Images */}
        <div className="col-lg-5">
          <div className="mb-3 position-relative text-center border rounded-2 p-4 d-flex align-items-center justify-content-center" style={{ height: '400px' }}>
             {realProduct.isFeatured && <span className="badge bg-primary position-absolute top-0 start-0 m-3">PREMIUM</span>}
            <Image
              src={getImageUrl(images[activeImageIndex])}
              alt={realProduct.name}
              width={500}
              height={400}
              className="img-fluid object-fit-contain"
              style={{ maxHeight: '100%', width: '100%' }}
              priority
            />
          </div>
          
          <div className="d-flex justify-content-center gap-2 mb-4">
            {images.map((imgUrl, index) => (
              <div 
                key={index} 
                className={`border rounded p-1 cursor-pointer ${activeImageIndex === index ? 'border-primary border-2' : ''}`} 
                style={{ width: '60px', height: '60px' }}
                onClick={() => setActiveImageIndex(index)}
              >
                  <Image src={getImageUrl(imgUrl)} width={60} height={60} className="img-fluid h-100 object-fit-contain" alt={`Thumbnail ${index}`} />
              </div>
            ))}
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
            <h1 className="fw-bold mb-2" style={{ fontSize: '24px', color: '#333', maxWidth: '80%' }}>{realProduct.name}</h1>
            <i className="fas fa-share-alt" onClick={handleShare} style={{ fontSize: '20px', cursor: 'pointer', color: '#666', padding: '5px' }}></i>
          </div>
          
          <div className="d-flex align-items-center gap-2 mb-3 pb-3 border-bottom">
            <div className="d-flex text-warning">
              {[...Array(5).keys()].map(x => (
                <Star key={x} fill={x < Math.round(realProduct.averageRating > 0 ? realProduct.averageRating : 5) ? "#F59E0B" : "none"} color="#F59E0B" size={14} />
              ))}
            </div>
            <span className="badge bg-success text-white">{realProduct.averageRating > 0 ? realProduct.averageRating.toFixed(1) : '5.0'}</span>
            <span className="text-muted" style={{ fontSize: '13px' }}>{reviews.length} reviews</span>
          </div>

          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <div className="d-flex align-items-center gap-3 mb-1">
                <span className="fw-bold" style={{ fontSize: '32px', color: '#005B6E' }}>₹{finalPrice}</span>
                {realProduct.discount > 0 && (
                  <>
                    <span className="badge bg-danger">
                      {realProduct.discountType === 'Flat' 
                        ? `₹${realProduct.discount} OFF` 
                        : `${realProduct.discount}% OFF`}
                    </span>
                  </>
                )}
              </div>
              <p className="text-muted mb-0" style={{ fontSize: '14px' }}>MRP: <del>₹{realProduct.price}</del> <span style={{ fontSize: '12px' }} className="d-none d-sm-inline">(MRP inclusive of all taxes)</span><span style={{ fontSize: '12px' }} className="d-inline d-sm-none">(Inc. taxes)</span></p>
            </div>
            
            <div className="d-block d-md-none text-end pb-1">
                 <p className="fw-bold mb-1" style={{ fontSize: '12px', color: '#666' }}>Quantity</p>
                 <div className="d-flex align-items-center border rounded justify-content-between p-0" style={{ width: '90px' }}>
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="btn btn-sm border-0 px-2"><Minus size={12} /></button>
                    <span className="fw-bold" style={{ fontSize: '14px' }}>{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(realProduct.stock || 100, quantity + 1))} className="btn btn-sm border-0 px-2" disabled={quantity >= (realProduct.stock || 100)}><Plus size={12} /></button>
                 </div>
            </div>
          </div>

          <div className="row mb-4">
             <div className="col-md-3 d-none d-md-block">
                 <p className="fw-bold mb-2" style={{ fontSize: '14px' }}>Quantity</p>
                 <div className="d-flex align-items-center border rounded justify-content-between p-1" style={{ width: '100px' }}>
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="btn btn-sm border-0"><Minus size={12} /></button>
                    <span className="fw-bold">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(realProduct.stock || 100, quantity + 1))} className="btn btn-sm border-0" disabled={quantity >= (realProduct.stock || 100)}><Plus size={12} /></button>
                 </div>
             </div>
              <div className="col-md-9">
                 <p className="fw-bold mb-2" style={{ fontSize: '14px' }}>Select Pack Size</p>
                 <div className="d-flex gap-3 flex-wrap">
                      <div onClick={() => setSelectedPack(defaultPackName)} className={`border rounded p-2 text-center cursor-pointer ${selectedPack === defaultPackName ? 'border-primary border-2' : ''}`} style={{ minWidth: '120px' }}>
                         <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{defaultPackName}</div>
                         <div style={{ fontSize: '12px', color: '#005B6E' }}>₹{realProduct.discountedPrice || realProduct.price}</div>
                      </div>
                      
                      {realProduct.packSizes && realProduct.packSizes.map((pack, i) => {
                         const pName = `${pack.weight} ${pack.unit}`;
                         let pPrice = pack.price;
                         if (realProduct.discount > 0) {
                           if (realProduct.discountType === 'Percent') {
                             pPrice = Math.round(pack.price * (1 - realProduct.discount / 100));
                           } else {
                             pPrice = Math.max(0, pack.price - realProduct.discount);
                           }
                         }
                         return (
                           <div key={i} onClick={() => setSelectedPack(pName)} className={`border rounded p-2 text-center cursor-pointer ${selectedPack === pName ? 'border-primary border-2' : ''}`} style={{ minWidth: '120px' }}>
                             <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{pName}</div>
                             <div style={{ fontSize: '12px', color: '#005B6E' }}>₹{pPrice}</div>
                           </div>
                         );
                      })}
                 </div>
              </div>
          </div>

          {/* Desktop Actions */}
          <div className="d-flex gap-3 mb-4 d-none d-md-flex">
             {realProduct.stock <= 0 ? (
               <button onClick={handleNotifyMe} className="btn w-100 py-3 fw-bold" style={{ backgroundColor: '#6c757d', color: 'white' }} disabled={notifyLoading}>
                 {notifyLoading ? 'Subscribing...' : 'Notify Me When Available'}
               </button>
             ) : (
               <>
                 <button onClick={handleAddToCart} className="btn w-50 py-3 fw-bold" style={{ backgroundColor: '#005B6E', color: 'white' }}>
                   Add To Cart
                 </button>
                 <button onClick={handleBuyNow} className="btn btn-outline-dark w-50 py-3 fw-bold">Buy It Now</button>
               </>
             )}
             <button onClick={() => dispatch(toggleWishlist(realProduct))} className="btn btn-outline-dark px-3"><Heart size={20} fill={isInWishlist ? 'var(--accent-color)' : 'none'} color={isInWishlist ? 'var(--accent-color)' : 'currentColor'} /></button>
          </div>

        </div>
      </div>

      {/* Desktop Version: Tabs */}
      <div className="d-none d-md-block border-top pt-5 mb-5 text-center px-4">
        <div className="d-flex justify-content-center gap-5 border-bottom mb-4">
           {['description', 'ingredients', 'benefits'].map((tab) => (
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
             {realProduct.description}
           </p>
        )}
        {activeTab === 'ingredients' && (
           <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.8' }}>
             {realProduct.ingredients?.length > 0 ? realProduct.ingredients.join(', ') : 'No ingredients specified.'}
           </p>
        )}
        {activeTab === 'benefits' && (
           <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.8' }}>
             {realProduct.benefits?.length > 0 ? realProduct.benefits.join(', ') : 'No benefits specified.'}
           </p>
        )}
      </div>

      {/* Mobile Version: Accordion Dropdown */}
      <div className="d-md-none px-4 mb-5 text-start">
        <div className="accordion" id="productDetailsAccordion">
          <div className="accordion-item border-0 border-bottom border-top rounded-0">
            <h2 className="accordion-header" id="headingDetails">
              <button 
                className="accordion-button collapsed bg-white shadow-none fw-bold px-0 text-dark" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#collapseDetails" 
                aria-expanded="false" 
                aria-controls="collapseDetails"
                style={{ fontSize: '15px' }}
              >
                Product Details
              </button>
            </h2>
            <div id="collapseDetails" className="accordion-collapse collapse" aria-labelledby="headingDetails" data-bs-parent="#productDetailsAccordion">
              <div className="accordion-body px-0 py-3">
                {realProduct.description && (
                  <div className="mb-3">
                    <h6 className="fw-bold" style={{ fontSize: '14px', color: '#005B6E' }}>Description</h6>
                    <p className="text-muted mb-0" style={{ fontSize: '13px', lineHeight: '1.6' }}>{realProduct.description}</p>
                  </div>
                )}
                {realProduct.ingredients?.length > 0 && (
                  <div className="mb-3">
                    <h6 className="fw-bold" style={{ fontSize: '14px', color: '#005B6E' }}>Ingredients</h6>
                    <p className="text-muted mb-0" style={{ fontSize: '13px', lineHeight: '1.6' }}>{realProduct.ingredients.join(', ')}</p>
                  </div>
                )}
                {realProduct.benefits?.length > 0 && (
                  <div>
                    <h6 className="fw-bold" style={{ fontSize: '14px', color: '#005B6E' }}>Benefits</h6>
                    <p className="text-muted mb-0" style={{ fontSize: '13px', lineHeight: '1.6' }}>{realProduct.benefits.join(', ')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Products */}
      <div className="mb-5 animate-fade-in">
        <h5 className="fw-bold mb-4 text-uppercase text-start" style={{ fontSize: '16px', letterSpacing: '0.05em', color: '#005B6E' }}>Recommended Products</h5>
        <div className="products-grid recommended-grid">
          {relatedProducts.length > 0 ? relatedProducts.map((prod) => (
            <div key={prod._id}>
              <ProductCard product={prod} />
            </div>
          )) : (
            <p className="text-muted w-100 mt-4 text-center">No related products found.</p>
          )}
        </div>
      </div>

      {/* Customer Reviews Section (Always Visible) */}
      <div className="mb-5 animate-fade-in text-start border-top pt-5">
        <h3 className="fw-bold mb-4" style={{ color: '#111' }}>Customer Reviews</h3>
        <div className="row g-5">
          
          {/* Reviews List */}
          <div className="col-lg-8">
            {reviewsLoading ? (
              <p className="text-muted">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <div className="text-center py-5 bg-light rounded-3">
                <MessageCircle size={48} className="text-muted mb-3 opacity-50" />
                <h5 className="fw-bold text-dark">No reviews yet</h5>
                <p className="text-muted">Be the first to review this product!</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-4">
                {reviews.map((rev) => (
                  <div key={rev._id} className="pb-4 border-bottom">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', fontSize: '14px', fontWeight: 'bold' }}>
                        {(rev.user?.name || 'A')[0].toUpperCase()}
                      </div>
                      <div>
                        <h6 className="fw-bold m-0" style={{ fontSize: '15px' }}>{rev.user?.name || 'Amazon Customer'}</h6>
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <div className="d-flex text-warning">
                        {[...Array(rev.rating).keys()].map(x => <Star key={x} fill="#F59E0B" color="#F59E0B" size={14} />)}
                        {[...Array(5 - rev.rating).keys()].map(x => <Star key={x} color="#ddd" size={14} />)}
                      </div>
                      {rev.isVerifiedPurchase && (
                        <span className="text-success fw-bold" style={{ fontSize: '12px' }}>Verified Purchase</span>
                      )}
                    </div>
                    
                    <small className="text-muted d-block mb-3">Reviewed on {new Date(rev.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</small>
                    <p className="m-0 text-dark mb-3" style={{ fontSize: '15px', lineHeight: '1.6' }}>{rev.comment}</p>
                    
                    {rev.images && rev.images.length > 0 && (
                      <div className="d-flex gap-2 flex-wrap mt-2">
                        {rev.images.map((img, idx) => (
                          <div key={idx} className="border rounded overflow-hidden" style={{ width: '80px', height: '80px', cursor: 'pointer' }}>
                            <a href={getImageUrl(img)} target="_blank" rel="noopener noreferrer">
                              <Image 
                                src={getImageUrl(img)} 
                                width={80} 
                                height={80} 
                                alt="Review Image" 
                                className="img-fluid w-100 h-100 object-fit-cover"
                              />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Write a Review Form */}
          <div className="col-lg-4">
            <div className="bg-white border rounded-3 p-4 shadow-sm position-sticky" style={{ top: '100px' }}>
              <h4 className="fw-bold mb-4 border-bottom pb-3">Review this product</h4>
              <p className="text-muted fs-7 mb-4">Share your thoughts with other customers</p>
              
              {mounted && user ? (
                <form onSubmit={handleReviewSubmit}>
                  <div className="mb-4">
                    <label className="fw-bold mb-2 text-dark fs-6">Overall rating</label>
                    <div className="d-flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={28} 
                          className="cursor-pointer" 
                          fill={star <= rating ? "#F59E0B" : "none"} 
                          color={star <= rating ? "#F59E0B" : "#ccc"} 
                          onClick={() => setRating(star)} 
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="fw-bold mb-2 text-dark fs-6">Written review</label>
                    <textarea
                      rows="4"
                      className="form-control"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      style={{ fontSize: '14px', resize: 'none' }}
                    ></textarea>
                  </div>

                  {reviewError && <div className="alert alert-danger p-2 fs-7 mb-3"><i className="fas fa-exclamation-circle me-1"></i> {reviewError}</div>}
                  {reviewSuccess && <div className="alert alert-success p-2 fs-7 mb-3"><i className="fas fa-check-circle me-1"></i> {reviewSuccess}</div>}

                  <button type="submit" className="btn w-100 py-2 fw-bold" style={{ backgroundColor: '#FFD814', color: '#111', border: '1px solid #FCD200', borderRadius: '8px' }}>
                    Submit
                  </button>
                </form>
              ) : (
                <div className="text-center py-3">
                  <button onClick={() => router.push('/login')} className="btn w-100 py-2 fw-bold" style={{ backgroundColor: '#fff', color: '#111', border: '1px solid #D5D9D9', borderRadius: '8px', boxShadow: '0 2px 5px rgba(15,17,17,.15)' }}>
                    Write a customer review
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Sticky Actions (Rendered via Portal to guarantee fixed positioning) */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <div className="d-md-none mobile-sticky-actions">
           <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: '12px', color: '#6c757d', fontWeight: '500' }}>Final Price</span>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#212529' }}>₹{finalPrice}</span>
           </div>
           <div className="d-flex gap-2">
             {realProduct.stock <= 0 ? (
               <button onClick={handleNotifyMe} className="btn w-100 py-2 fw-bold" style={{ backgroundColor: '#6c757d', color: 'white', fontSize: '13px' }} disabled={notifyLoading}>
                 {notifyLoading ? 'Subscribing...' : 'Notify Me'}
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
