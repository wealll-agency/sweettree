'use client';

import { useSelector, useDispatch } from 'react-redux';
import { toggleWishlist } from '../../store/wishlistSlice.js';
import { addToCart } from '../../store/cartSlice.js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Trash2 } from 'lucide-react';
import ProductCard from '../../components/ProductCard.jsx';

export default function WishlistPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const handleAddToCart = (product) => {
    dispatch(addToCart({ product, quantity: 1, size: '100ml' }));
  };

  const handleBuyNow = (product) => {
    dispatch(addToCart({ product, quantity: 1, size: '100ml' }));
    router.push('/checkout');
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="animate-fade-in">
        {/* Premium Header */}
        <div className="bg-light py-3 border-bottom">
          <div className="container-fluid px-4 px-lg-5">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0" style={{ fontSize: '13px' }}>
                <li className="breadcrumb-item"><Link href="/" className="text-muted">Home</Link></li>
                <li className="breadcrumb-item active text-dark fw-bold" aria-current="page">My Wishlist</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="container-fluid px-4 px-lg-5 py-5 text-center">
          <div className="bg-white p-5 max-w-lg mx-auto shadow-sm rounded-4 border mt-4 mb-5">
            <div className="d-inline-flex justify-content-center align-items-center bg-light rounded-circle mb-4" style={{ width: '80px', height: '80px' }}>
              <Heart size={36} className="text-muted" />
            </div>
            <h3 className="fw-bold mb-3" style={{ color: 'var(--primary-color)' }}>Your Wishlist is Empty</h3>
            <p className="text-muted mb-4 fs-6 px-lg-4">Save products you love to your wishlist so you can easily find and purchase them later.</p>
            <Link href="/shop" className="btn btn-brand btn-lg px-5 rounded-pill shadow-sm">
              <i className="fas fa-shopping-bag me-2"></i> Explore Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-5">
      {/* Premium Header */}
      <div className="bg-light py-4 border-bottom position-relative overflow-hidden mb-5">
        <div className="container-fluid px-4 px-lg-5 position-relative" style={{ zIndex: 1 }}>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-3" style={{ fontSize: '13px' }}>
              <li className="breadcrumb-item"><Link href="/" className="text-muted">Home</Link></li>
              <li className="breadcrumb-item active text-dark fw-bold" aria-current="page">My Wishlist</li>
            </ol>
          </nav>
          <div className="d-flex align-items-center gap-3">
            <h1 className="fw-bold mb-0 display-font" style={{ color: 'var(--primary-color)' }}>My Wishlist</h1>
            <span className="badge rounded-pill bg-danger shadow-sm px-3 py-2">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>
          <p className="text-muted mt-2 mb-0" style={{ maxWidth: '600px' }}>Your handpicked selection of premium healthy treats. Review your favorites and move them to your cart when you're ready.</p>
        </div>
      </div>

      <div className="container-fluid px-4 px-lg-5">
        <div className="products-grid">
          {wishlistItems.map((product) => (
            <div key={product._id}>
              <ProductCard 
                product={{
                  ...product,
                  image: product.images?.[0] || product.image,
                  mrp: product.purchasePrice || product.price,
                  brand: 'Sweettree'
                }} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
