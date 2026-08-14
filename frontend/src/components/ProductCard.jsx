import React, { useEffect, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Star, Heart, ShoppingCart, Leaf, ShieldCheck, Zap, Droplet, Flame, Award } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { toggleWishlist } from '../store/wishlistSlice';
import { fetchProducts } from '../store/productsSlice';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';

const ProductCard = ({ product }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const dbProducts = useSelector((state) => state.products?.items || []);

  useEffect(() => {
    const isValidId = product._id && /^[0-9a-fA-F]{24}$/.test(product._id);
    if (!isValidId && dbProducts.length === 0) {
      dispatch(fetchProducts({ limit: 100 }));
    }
  }, [dispatch, product._id, dbProducts.length]);

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
        discount: 0,
        images: [resolvedProduct.image || (resolvedProduct.images && resolvedProduct.images[0]) || '/placeholder.png'],
        stock: resolvedProduct.stock || 100
      }, 
      quantity: 1, 
      size: resolvedProduct.unit || 'Default'
    }));

    if (typeof document !== 'undefined') {
      const offcanvasElement = document.getElementById('cartOffcanvas');
      if (offcanvasElement && window.bootstrap) {
        const bsOffcanvas = window.bootstrap.Offcanvas.getOrCreateInstance(offcanvasElement);
        bsOffcanvas.show();
      }
    }
  };

  const imageSrc = resolvedProduct.image || (resolvedProduct.images && resolvedProduct.images[0]) || '/placeholder.png';
  const allImages = resolvedProduct.images && resolvedProduct.images.length > 0 
    ? resolvedProduct.images 
    : (resolvedProduct.image ? [resolvedProduct.image] : ['/placeholder.png']);

  const icons = [Leaf, ShieldCheck, Droplet, Zap];

  const getBadge = () => {
    if (product.tagLeft) {
       return { text: product.tagLeft.toUpperCase(), class: 'badge-green', icon: <Flame size={12} fill="white" /> };
    }
    if (resolvedProduct.isFeatured) {
       return { text: 'BEST SELLER', class: 'badge-green', icon: <Flame size={12} fill="white" /> };
    }
    if (resolvedProduct.newArrival) {
       return { text: 'NEW ARRIVAL', class: 'badge-orange', icon: <Star size={12} fill="white" /> };
    }
    if (resolvedProduct.category && resolvedProduct.category.toLowerCase().includes('premium')) {
       return { text: 'PREMIUM', class: 'badge-red', icon: <Award size={12} fill="white" /> };
    }
    if (resolvedProduct.healthyProduct) {
       return { text: 'HEALTHY CHOICE', class: 'badge-green', icon: <Leaf size={12} fill="white" /> };
    }
    return null;
  };
  
  const badge = getBadge();

  return (
    <div className="item h-100">
      <article className="product-card">
        
        <div className="product-card__media">
          <div className="product-card__badges">
            {badge ? (
              <span className={`product-card__category-badge ${badge.class}`}>
                 {badge.icon} {badge.text}
              </span>
            ) : <span></span>}

            {resolvedProduct.discount > 0 && (
              <span className="product-card__discount-badge">
                {resolvedProduct.discountType === 'Flat' ? `₹${resolvedProduct.discount} OFF` : `${resolvedProduct.discount}% OFF`}
              </span>
            )}
          </div>

          <div className="product-card__image-wrapper">
            {resolvedProduct.stock <= 0 && (
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

            <Link href={`/shop-details?id=${resolvedProduct._id}`} style={{ display: 'block', position: 'relative', height: '100%', width: '100%' }}>
              <Swiper
                modules={[Autoplay, EffectFade]}
                effect="fade"
                autoplay={{ delay: Math.floor(Math.random() * 2000) + 2500, disableOnInteraction: false }}
                loop={allImages.length > 1}
                allowTouchMove={false}
                className="position-absolute top-0 start-0 w-100 h-100"
              >
                {allImages.map((img, idx) => (
                  <SwiperSlide key={idx} className="position-relative w-100 h-100">
                    <Image 
                      src={img.replace('/assets/images/', '/')} 
                      alt={`${resolvedProduct.name} ${idx}`} 
                      fill 
                      sizes="(max-width: 768px) 100vw, 33vw" 
                      className="product-card__image product-card__image--contain"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </Link>

          </div>
        </div>



        <div className="product-card__content">
          <div className="product-card__meta">
            <span className="product-card__brand">
              {resolvedProduct.brand || 'SWEETTREE'}
            </span>
            <span className="product-card__rating">
              <Star size={12} fill="#ffb800" color="#ffb800" stroke="#ffb800" />
              {resolvedProduct.averageRating > 0 ? resolvedProduct.averageRating.toFixed(1) : '5.0'}
            </span>
          </div>

          <Link href={`/shop-details?id=${resolvedProduct._id}`} style={{ textDecoration: 'none', marginBottom: 'auto' }}>
            <h3 className="product-card__title" title={resolvedProduct.name}>
              {resolvedProduct.name}
            </h3>
          </Link>

          <div className="product-card__pricing">
            <span className="product-card__price">
              ₹{calculatedDiscountedPrice}
            </span>
            {resolvedProduct.discount > 0 && (
              <>
                <span className="product-card__mrp">₹{resolvedProduct.price}</span>
              </>
            )}
          </div>

          <div className="product-card__actions" style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
            {resolvedProduct.stock <= 0 ? (
              <Link
                href={`/shop-details?id=${resolvedProduct._id}`}
                className="product-card__cart"
                style={{ flex: 1, background: '#f1f5f9', color: '#64748b', textDecoration: 'none', border: '1.5px solid #e2e8f0', boxShadow: 'none' }}
              >
                Notify Me
              </Link>
            ) : (
              <button 
                onClick={handleAddToCart} 
                className="product-card__cart"
                style={{ flex: 1 }}
                aria-label="Add product to cart"
              >
                <ShoppingCart size={18} /> Add To Cart
              </button>
            )}
            <button
              className="product-card__wishlist-btn"
              onClick={handleToggleWishlist}
              aria-label="Toggle wishlist"
            >
              <Heart size={20} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : '#1e3a5f'} />
            </button>
          </div>
        </div>

      </article>
    </div>
  );
};

export default memo(ProductCard);

