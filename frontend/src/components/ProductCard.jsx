import React, { useEffect, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Heart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { toggleWishlist } from '../store/wishlistSlice';
import { fetchProducts } from '../store/productsSlice';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const dbProducts = useSelector((state) => state.products?.items || []);

  // Dynamically load products if this is a static card with no ID and DB products aren't loaded yet
  useEffect(() => {
    const isValidId = product._id && /^[0-9a-fA-F]{24}$/.test(product._id);
    if (!isValidId && dbProducts.length === 0) {
      dispatch(fetchProducts({ limit: 100 }));
    }
  }, [dispatch, product._id, dbProducts.length]);

  // Resolve matching DB product for static cards to get correct MongoDB _id
  const resolvedProduct = product._id && /^[0-9a-fA-F]{24}$/.test(product._id)
    ? product
    : dbProducts.find(p => {
        const pName = p.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
        const cardName = product.name.toLowerCase().replace(/\.\.\./g, '').replace(/[^a-zA-Z0-9]/g, '');
        return pName.includes(cardName) || cardName.includes(pName);
      }) || product;

  const productId = resolvedProduct._id || product.name;
  const isWishlisted = wishlistItems.some(i => i._id === productId);

  let calculatedDiscountedPrice = resolvedProduct.price;
  if (resolvedProduct.discount > 0) {
    if (resolvedProduct.discountType === 'Percent') {
      calculatedDiscountedPrice = Math.round(resolvedProduct.price * (1 - resolvedProduct.discount / 100));
    } else {
      calculatedDiscountedPrice = Math.max(0, resolvedProduct.price - resolvedProduct.discount);
    }
  } else if (resolvedProduct.discountedPrice !== undefined) {
    calculatedDiscountedPrice = resolvedProduct.discountedPrice;
  }


  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist({
      _id: productId,
      name: resolvedProduct.name,
      price: parseInt(resolvedProduct.price.toString().replace(/,/g, '')),
      discount: parseInt(resolvedProduct.discount || 0),
      images: [resolvedProduct.image || (resolvedProduct.images && resolvedProduct.images[0]) || '/placeholder.png'],
      stock: resolvedProduct.stock || 100,
      category: resolvedProduct.category || 'Nuts'
    }));
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    const finalPrice = calculatedDiscountedPrice;
    dispatch(addToCart({ 
      product: {
        _id: productId,
        name: resolvedProduct.name,
        price: parseInt(finalPrice.toString().replace(/,/g, '')),
        discount: 0, // Prevent double-discounting since price is already the final price
        images: [resolvedProduct.image || (resolvedProduct.images && resolvedProduct.images[0]) || '/placeholder.png'],
        stock: resolvedProduct.stock || 100
      }, 
      quantity: 1, 
      size: resolvedProduct.unit || 'Default'
    }));

    // Trigger offcanvas programmatically
    if (typeof document !== 'undefined') {
      const offcanvasElement = document.getElementById('cartOffcanvas');
      if (offcanvasElement && window.bootstrap) {
        const bsOffcanvas = window.bootstrap.Offcanvas.getOrCreateInstance(offcanvasElement);
        bsOffcanvas.show();
      }
    }
  };

  const imageSrc = resolvedProduct.image || (resolvedProduct.images && resolvedProduct.images[0]) || '/placeholder.png';
  const cleanImageSrc = imageSrc.replace('/assets/images/', '/');

  const allImages = resolvedProduct.images && resolvedProduct.images.length > 0 
    ? resolvedProduct.images 
    : (resolvedProduct.image ? [resolvedProduct.image] : ['/placeholder.png']);

  return (
    <div className="item h-100 px-2 py-3">
      <div className="Sweettree-product-card">
        <div className="product-tags d-flex justify-content-between">
          <span className={`tag-left ${resolvedProduct.newArrival ? 'bg-success' : (product.tagLeftClass || '')}`}>
            {resolvedProduct.newArrival ? 'NEW ARRIVAL' : (product.tagLeft || 'PREMIUM')}
          </span>
          {(product.tagRight || resolvedProduct.discount > 0) ? (
            <span className={`tag-right ${product.tagRightClass || ''} ms-auto`}>
              {product.tagRight || (resolvedProduct.discount > 0 ? (resolvedProduct.discountType === 'Flat' ? `₹${resolvedProduct.discount} OFF` : `${resolvedProduct.discount}% OFF`) : '')}
            </span>
          ) : null}
        </div>
        <Link href={`/shop-details?name=${encodeURIComponent(resolvedProduct.name)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="product-img-box position-relative" style={{ minHeight: '200px', overflow: 'hidden', opacity: resolvedProduct.stock <= 0 ? 0.7 : 1 }}>
            {resolvedProduct.stock <= 0 && (
              <div className="position-absolute w-100 d-flex justify-content-center align-items-center" style={{ top: '40%', zIndex: 20 }}>
                <span className="badge bg-danger px-3 py-2 fs-6 shadow-sm">OUT OF STOCK</span>
              </div>
            )}
            <Swiper
              modules={[Autoplay, EffectFade]}
              effect="fade"
              autoplay={{ delay: Math.floor(Math.random() * 2000) + 2500, disableOnInteraction: false }}
              loop={allImages.length > 1}
              allowTouchMove={false}
              className="w-100 h-100"
            >
              {allImages.map((img, idx) => (
                <SwiperSlide key={idx} className="position-relative w-100 h-100" style={{ minHeight: '200px' }}>
                  <Image 
                    src={img.replace('/assets/images/', '/')} 
                    alt={`${resolvedProduct.name} ${idx}`} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 33vw" 
                    style={{ objectFit: 'contain' }} 
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <div className="card-divider"></div>
          <div className="product-meta d-flex justify-content-between align-items-center">
            <span className="brand-text">{resolvedProduct.brand || 'Sweettree'}</span>
            <div className="rating-heart d-flex align-items-center gap-2">
              <span className="rating-badge d-flex align-items-center gap-1">
                <Star size={12} fill="#ffb800" stroke="#ffb800" /> {resolvedProduct.rating || '5.0'}
              </span>
              <button 
                onClick={handleToggleWishlist} 
                className="btn btn-link p-0 border-0 m-0 text-decoration-none d-flex align-items-center" 
                style={{ zIndex: 10, position: 'relative' }}
              >
                <Heart 
                  size={18} 
                  fill={isWishlisted ? "var(--primary-color)" : "none"} 
                  className={isWishlisted ? "text-danger" : "text-muted"} 
                  style={{ transition: 'color 0.2s ease, fill 0.2s ease' }} 
                />
              </button>
            </div>
          </div>
          <h3 className="product-name" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            height: '38px'
          }} title={resolvedProduct.name}>{resolvedProduct.name}</h3>
          <div className="product-pricing">
            MRP: <del>₹{resolvedProduct.price}</del> <span className="current-price">₹{calculatedDiscountedPrice}</span> 
            {(product.perGram || resolvedProduct.perGram) && <span className="per-gram">({product.perGram || resolvedProduct.perGram})</span>}
          </div>
        </Link>
        {resolvedProduct.stock <= 0 ? (
          <Link href={`/shop-details?name=${encodeURIComponent(resolvedProduct.name)}`} className="btn btn-secondary w-100 mt-2" style={{ backgroundColor: '#6c757d', color: 'white', fontWeight: '600' }}>
            Notify Me
          </Link>
        ) : (
          <button onClick={handleAddToCart} className="Sweettree-btn-cart w-100 mt-2">Add To Cart</button>
        )}
      </div>
    </div>
  );
};

export default memo(ProductCard);
