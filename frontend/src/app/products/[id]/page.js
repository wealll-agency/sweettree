'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductDetails, fetchProductReviews, submitProductReview } from '../../../store/productsSlice.js';
import { addToCart } from '../../../store/cartSlice.js';
import { toggleWishlist } from '../../../store/wishlistSlice.js';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, Heart, Plus, Minus, Sprout, ShieldAlert, Sparkles, MessageCircle } from 'lucide-react';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const router = useRouter();

  const { selectedProduct: product, detailsLoading, reviews, reviewsLoading } = useSelector((state) => state.products);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const { user } = useSelector((state) => state.auth);

  // States
  const [selectedSize, setSelectedSize] = useState('100ml');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  
  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetails(id));
      dispatch(fetchProductReviews(id));
    }
  }, [dispatch, id]);

  if (detailsLoading || !product) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Calculate price based on selected size
  const getMultiplier = (size) => {
    if (size === '200ml') return 1.8;
    if (size === '500ml') return 4;
    return 1.0;
  };

  const basePrice = product.price;
  const activeBasePrice = Math.round(basePrice * getMultiplier(selectedSize));
  const activePrice = product.discount > 0
    ? Math.round(activeBasePrice * (1 - product.discount / 100))
    : activeBasePrice;

  const isInWishlist = wishlistItems.some(item => item._id === product._id);

  const handleAddToCart = () => {
    // Modify product price in dispatch to match current size selected
    const sizeAdjustedProduct = {
      ...product,
      price: activeBasePrice // Pass base price for this size
    };
    dispatch(addToCart({ product: sizeAdjustedProduct, quantity, size: selectedSize }));
  };

  const handleBookNow = () => {
    handleAddToCart();
    router.push('/checkout');
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

    dispatch(submitProductReview({ productId: product._id, rating, comment: comment.trim() }))
      .unwrap()
      .then(() => {
        setReviewSuccess('Review submitted successfully!');
        setComment('');
        setRating(5);
        setReviewError('');
      })
      .catch((err) => {
        setReviewError(err || 'Failed to submit review. You can only review once and must buy this product first.');
      });
  };

  return (
    <div className="container py-5 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="mb-4 breadcrumb-brand">
        <Link href="/">Home</Link> &gt; <Link href="/products">Shop Catalog</Link> &gt; <span>{product.name}</span>
      </nav>

      {/* Main product details block */}
      <div className="row g-5 mb-5">
        
        {/* Left Side: Images */}
        <div className="col-lg-6">
          <div className="bg-white p-3 rounded-4 shadow-sm border text-center">
            <img
              src={product.images[0] || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600'}
              alt={product.name}
              className="img-fluid rounded-3 object-fit-cover"
              style={{ maxHeight: '420px', width: '100%' }}
            />
          </div>
        </div>

        {/* Right Side: Details */}
        <div className="col-lg-6">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge-status-green fs-7"><Sprout size={14} className="me-1" /> Herbal Formulation</span>
            <span className="text-muted fs-7">Batch: {product.batchNumber}</span>
          </div>

          <h1 className="fw-bold mb-2 display-font">{product.name}</h1>
          
          <div className="d-flex align-items-center gap-2 mb-3">
            <div className="d-flex text-warning">
              {[1, 2, 3, 4, 5].map(idx => <Star key={idx} fill="#F59E0B" color="#F59E0B" size={16} />)}
            </div>
            <span className="fw-semibold">4.8</span>
            <span className="text-muted">({reviews.length} Customer reviews)</span>
          </div>

          {/* Pricing */}
          <div className="d-flex align-items-center gap-3 mb-4">
            <span className="fs-2 fw-bold" style={{ color: 'var(--primary-color)' }}>₹{activePrice}</span>
            {product.discount > 0 && (
              <>
                <span className="text-muted text-decoration-line-through fs-5">₹{activeBasePrice}</span>
                <span className="badge bg-danger fs-6">{product.discount}% OFF</span>
              </>
            )}
          </div>

          <p className="text-muted mb-4 fs-6" style={{ lineHeight: '1.7' }}>{product.description}</p>

          {/* Brand Benefits bullets */}
          <div className="bg-white p-3 rounded-3 shadow-sm border mb-4">
            <h6 className="fw-bold text-dark mb-2"><Sparkles size={16} className="me-1 text-success" /> Key Benefits:</h6>
            <ul className="m-0 ps-3 text-muted fs-7">
              {product.benefits?.map((benefit, idx) => <li key={idx} className="mb-1">{benefit}</li>)}
            </ul>
          </div>

          {/* Size Options */}
          <div className="mb-4">
            <span className="fw-bold d-block mb-2">Select Size:</span>
            <div className="d-flex gap-2">
              {['100ml', '200ml', '500ml'].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`btn btn-sm px-3 py-2 fw-medium ${selectedSize === size ? 'btn-brand' : 'btn-brand-outline'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity + Actions */}
          <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
            <div className="d-flex align-items-center border rounded-3 bg-white p-1">
              <button 
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                className="btn btn-sm border-0 px-2"
              >
                <Minus size={16} />
              </button>
              <span className="px-3 fw-bold">{quantity}</span>
              <button 
                onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                className="btn btn-sm border-0 px-2"
                disabled={quantity >= product.stock}
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="btn btn-brand-outline px-4 py-2 flex-grow-1"
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            <button
              onClick={handleBookNow}
              className="btn btn-brand px-4 py-2 flex-grow-1 fw-bold text-white"
              style={{ backgroundColor: '#F59E0B', border: '1px solid #F59E0B' }}
              disabled={product.stock === 0}
            >
              Buy Now
            </button>

            <button
              onClick={() => dispatch(toggleWishlist(product))}
              className="btn btn-brand-outline px-3 py-2"
            >
              <Heart size={20} fill={isInWishlist ? 'var(--accent-color)' : 'none'} color={isInWishlist ? 'var(--accent-color)' : 'currentColor'} />
            </button>
          </div>

          {product.stock <= 10 && product.stock > 0 && (
            <div className="text-danger fw-semibold d-flex align-items-center gap-1 mb-3">
              <ShieldAlert size={16} /> Only {product.stock} items left in stock!
            </div>
          )}
        </div>

      </div>

      {/* Tabs Layout */}
      <div className="bg-white p-4 rounded-4 shadow-sm border mb-5">
        <div className="d-flex nav-tabs-brand mb-4 overflow-auto">
          {['description', 'ingredients', 'howToUse', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`nav-link-brand capitalize ${activeTab === tab ? 'active' : ''}`}
            >
              {tab === 'howToUse' ? 'How to Use' : tab === 'reviews' ? `Reviews (${reviews.length})` : tab}
            </button>
          ))}
        </div>

        <div>
          {/* Description Tab */}
          {activeTab === 'description' && (
            <div className="animate-fade-in">
              <h5 className="fw-bold mb-3">Description</h5>
              <p className="text-muted fs-6" style={{ lineHeight: '1.8' }}>{product.description}</p>
            </div>
          )}

          {/* Ingredients Tab */}
          {activeTab === 'ingredients' && (
            <div className="animate-fade-in">
              <h5 className="fw-bold mb-3">Ingredients List</h5>
              <div className="d-flex flex-wrap gap-2">
                {product.ingredients?.map((ing, idx) => (
                  <span key={idx} className="badge bg-light text-dark border p-2 fs-7">{ing}</span>
                ))}
              </div>
            </div>
          )}

          {/* How to Use Tab */}
          {activeTab === 'howToUse' && (
            <div className="animate-fade-in">
              <h5 className="fw-bold mb-3">How to Use Instructions</h5>
              <p className="text-muted fs-6" style={{ lineHeight: '1.8' }}>
                Apply a generous amount of {product.name} on the desired skin or hair surface. Massage gently in circular motions until fully absorbed. For best results, use daily, or as recommended.
              </p>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="animate-fade-in">
              <div className="row g-4">
                
                {/* Reviews List */}
                <div className="col-lg-7">
                  <h5 className="fw-bold mb-4">Customer Feedback</h5>
                  
                  {reviewsLoading ? (
                    <p className="text-muted">Loading reviews...</p>
                  ) : reviews.length === 0 ? (
                    <p className="text-muted">No reviews yet for this product. Be the first to write a review!</p>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {reviews.map((rev) => (
                        <div key={rev._id} className="border-bottom pb-3">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <h6 className="fw-bold m-0">{rev.user?.name || 'Anonymous User'}</h6>
                            <small className="text-muted">{new Date(rev.createdAt).toLocaleDateString()}</small>
                          </div>
                          
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <div className="d-flex text-warning">
                              {[...Array(rev.rating).keys()].map(x => <Star key={x} fill="#F59E0B" color="#F59E0B" size={14} />)}
                            </div>
                            {rev.isVerifiedPurchase && (
                              <span className="badge bg-success-subtle text-success fs-8">Verified Purchase</span>
                            )}
                          </div>
                          <p className="text-muted m-0 fs-7">{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Write a Review Form */}
                <div className="col-lg-5">
                  <div className="bg-light p-4 rounded-3 border">
                    <h5 className="fw-bold mb-3">Write a Review</h5>
                    
                    {user ? (
                      <form onSubmit={handleReviewSubmit}>
                        <div className="mb-3">
                          <label className="fw-medium mb-1">Rating</label>
                          <select 
                            className="form-select"
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                          >
                            <option value="5">5 Stars (Excellent)</option>
                            <option value="4">4 Stars (Good)</option>
                            <option value="3">3 Stars (Average)</option>
                            <option value="2">2 Stars (Poor)</option>
                            <option value="1">1 Star (Very Poor)</option>
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="fw-medium mb-1">Your Comment</label>
                          <textarea
                            rows="4"
                            className="form-control"
                            placeholder="Share your experience with this herbal product..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                          ></textarea>
                        </div>

                        {reviewError && <div className="alert alert-danger p-2 fs-7 mb-3">{reviewError}</div>}
                        {reviewSuccess && <div className="alert alert-success p-2 fs-7 mb-3">{reviewSuccess}</div>}

                        <button type="submit" className="btn btn-brand w-100 py-2">
                          Submit Review
                        </button>
                      </form>
                    ) : (
                      <div className="text-center py-3">
                        <MessageCircle className="text-muted mb-2" size={32} />
                        <p className="text-muted fs-7 mb-3">You must be logged in to review products.</p>
                        <Link href="/login" className="btn btn-brand btn-sm">Log In</Link>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
