import React, { useEffect, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { toggleWishlist } from '../store/wishlistSlice';
import { fetchProducts } from '../store/productsSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const { items: dbProducts } = useSelector((state) => state.products || { items: [] });

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
    const finalPrice = resolvedProduct.discountedPrice !== undefined ? resolvedProduct.discountedPrice : resolvedProduct.price;
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

  return (
    <div className="item h-100 px-2 py-3">
      <div className="Sweettree-product-card">
        <div className="product-tags d-flex justify-content-between">
          {product.tagLeft && <span className={`tag-left ${product.tagLeftClass}`}>{product.tagLeft}</span>}
          {product.tagRight && <span className={`tag-right ${product.tagRightClass} ms-auto`}>{product.tagRight}</span>}
        </div>
        <Link href={`/shop-details?name=${encodeURIComponent(resolvedProduct.name)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="product-img-box position-relative" style={{ minHeight: '200px' }}>
            <Image src={cleanImageSrc} alt={resolvedProduct.name} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'contain' }} />
          </div>
          <div className="card-divider"></div>
          <div className="product-meta d-flex justify-content-between align-items-center">
            <span className="brand-text">{resolvedProduct.brand || 'Sweettree'}</span>
            <div className="rating-heart d-flex align-items-center gap-2">
              {resolvedProduct.rating && <span className="rating-badge"><i className="fas fa-star"></i> {resolvedProduct.rating}</span>}
              <button 
                onClick={handleToggleWishlist} 
                className="btn btn-link p-0 border-0 m-0 text-decoration-none" 
                style={{ zIndex: 10, position: 'relative' }}
              >
                <i className={`${isWishlisted ? 'fas text-danger' : 'far text-muted'} fa-heart`} style={{ fontSize: '18px', transition: 'color 0.2s ease' }}></i>
              </button>
            </div>
          </div>
          <h3 className="product-name">{resolvedProduct.name}</h3>
          <div className="product-pricing">
            MRP: <del>₹{resolvedProduct.price}</del> <span className="current-price">₹{resolvedProduct.discountedPrice !== undefined ? resolvedProduct.discountedPrice : resolvedProduct.price}</span> 
            {product.perGram && <span className="per-gram">({product.perGram})</span>}
          </div>
        </Link>
        <button onClick={handleAddToCart} className="Sweettree-btn-cart w-100 mt-2">Add To Cart</button>
      </div>
    </div>
  );
};

export default memo(ProductCard);
