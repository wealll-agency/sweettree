import React from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { toggleWishlist } from '../store/wishlistSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const productId = product._id || product.name;
  const isWishlisted = wishlistItems.some(i => i._id === productId);

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist({
      _id: productId,
      name: product.name,
      price: parseInt(product.price.toString().replace(/,/g, '')),
      discount: parseInt(product.discount || 0),
      images: [product.image],
      stock: product.stock || 100,
      category: product.category || 'Nuts'
    }));
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch(addToCart({ 
      product: {
        _id: product._id || product.name, // Use _id if available, fallback to name
        name: product.name,
        price: parseInt(product.price.toString().replace(/,/g, '')),
        discount: 0, // Prevent double-discounting since price is already the final price
        images: [product.image],
        stock: product.stock || 100
      }, 
      quantity: 1, 
      size: 'Default' 
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
  return (
    <div className="item h-100 px-2 py-3">
      <div className="Sweettree-product-card">
        <div className="product-tags d-flex justify-content-between">
          {product.tagLeft && <span className={`tag-left ${product.tagLeftClass}`}>{product.tagLeft}</span>}
          {product.tagRight && <span className={`tag-right ${product.tagRightClass} ms-auto`}>{product.tagRight}</span>}
        </div>
        <Link href={`/shop-details?name=${encodeURIComponent(product.name)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="product-img-box">
            <img src={product.image ? product.image.replace('/assets/images/', '/') : '/placeholder.png'} alt={product.name} />
          </div>
          <div className="card-divider"></div>
          <div className="product-meta d-flex justify-content-between align-items-center">
            <span className="brand-text">{product.brand || 'Sweettree'}</span>
            <div className="rating-heart d-flex align-items-center gap-2">
              {product.rating && <span className="rating-badge"><i className="fas fa-star"></i> {product.rating}</span>}
              <button 
                onClick={handleToggleWishlist} 
                className="btn btn-link p-0 border-0 m-0 text-decoration-none" 
                style={{ zIndex: 10, position: 'relative' }}
              >
                <i className={`${isWishlisted ? 'fas text-danger' : 'far text-muted'} fa-heart`} style={{ fontSize: '18px', transition: 'color 0.2s ease' }}></i>
              </button>
            </div>
          </div>
          <h3 className="product-name">{product.name}</h3>
          <div className="product-pricing">
            MRP: <del>₹{product.mrp}</del> <span className="current-price">₹{product.price}</span> 
            {product.perGram && <span className="per-gram">({product.perGram})</span>}
          </div>
        </Link>
        <button onClick={handleAddToCart} className="Sweettree-btn-cart w-100 mt-2">Add To Cart</button>
      </div>
    </div>
  );
};

export default ProductCard;
