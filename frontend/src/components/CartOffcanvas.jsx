'use client';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart } from '../store/cartSlice';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, Receipt, ChevronDown } from 'lucide-react';
import Image from 'next/image';

const CartOffcanvas = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { items, subtotal, discount, tax, shippingFee, total } = useSelector((state) => state.cart);
  const dbProducts = useSelector((state) => state.products?.items || []);

  let calculatedTotalMrp = 0;
  items.forEach(item => {
    const dbProduct = dbProducts.find(p => p._id === item.product);
    const mrp = dbProduct ? dbProduct.price : item.price;
    calculatedTotalMrp += (mrp * item.quantity);
  });
  if (calculatedTotalMrp < subtotal) calculatedTotalMrp = subtotal;

  const mrpDiscount = calculatedTotalMrp - subtotal;
  const totalSavings = mrpDiscount + discount;
  const savingsPercent = calculatedTotalMrp > 0 ? Math.round((totalSavings / calculatedTotalMrp) * 100) : 0;

  const handleIncrement = (product, size) => {
    dispatch(addToCart({ product, quantity: 1, size }));
  };

  const handleDecrement = (product, size) => {
    const item = items.find(i => i.product === product._id && i.size === size);
    if (item && item.quantity > 1) {
      dispatch(addToCart({ product, quantity: -1, size }));
    } else {
      dispatch(removeFromCart({ product: product._id, size }));
    }
  };

  const handleRemove = (productId, size) => {
    dispatch(removeFromCart({ product: productId, size }));
  };

  const handleProductClick = (productId) => {
    if (typeof window !== 'undefined' && window.bootstrap) {
      const offcanvasEl = document.getElementById('cartOffcanvas');
      if (offcanvasEl) {
        const bsOffcanvas = window.bootstrap.Offcanvas.getInstance(offcanvasEl);
        if (bsOffcanvas) bsOffcanvas.hide();
      }
    }
    router.push(`/shop-details?id=${productId}`);
  };

  // Sweettree free shipping threshold is 1999
  const freeShippingThreshold = 1999;
  const remainingForFreeShipping = freeShippingThreshold - subtotal;
  const progressPercent = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  // Calculate MRP (assuming item.price is the discounted price, we'll try to estimate or show subtotal)
  // Since we don't store MRP in cart, we'll use subtotal + discount as a rough MRP
  const totalMrp = subtotal + discount;

  return (
    <div className="offcanvas offcanvas-end" tabIndex="-1" id="cartOffcanvas" aria-labelledby="cartOffcanvasLabel" style={{ width: '400px' }}>
      <div className="offcanvas-header border-bottom py-3">
        <h5 className="offcanvas-title d-flex align-items-center gap-2 fw-bold text-danger" id="cartOffcanvasLabel">
          <ShoppingCart size={20} /> Cart
        </h5>
        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>

      <div className="offcanvas-body p-0 d-flex flex-column bg-light">
        {/* Free Shipping Progress */}
        <div className="bg-white p-3 mb-2 shadow-sm text-center">
          {remainingForFreeShipping > 0 ? (
            <small className="fw-bold mb-2 d-block text-dark">
              Add <span className="text-danger">₹{remainingForFreeShipping.toFixed(2)}</span> More To Unlock <span className="text-danger">Free Shipping</span>
            </small>
          ) : (
            <small className="fw-bold mb-2 d-block text-success">
              You have unlocked FREE SHIPPING!
            </small>
          )}
          <div className="progress mx-auto" style={{ height: '6px', width: '80%' }}>
            <div className="progress-bar bg-danger" role="progressbar" style={{ width: `${progressPercent}%` }} aria-valuenow={progressPercent} aria-valuemin="0" aria-valuemax="100"></div>
          </div>
        </div>

        <div className="bg-dark text-white text-center py-2" style={{ fontSize: '11px', fontWeight: 'bold' }}>
          Add more favourites to unlock FREE SHIPPING!
        </div>

        {/* Cart Items */}
        <div className="flex-grow-1 overflow-auto p-3">
          {items.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <ShoppingCart size={40} className="mb-3 opacity-50" />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={`${item.product}-${item.size}-${index}`} className="card border-0 shadow-sm rounded-3 mb-3 p-3">
                <div className="d-flex position-relative">
                  <button onClick={() => handleRemove(item.product, item.size)} className="position-absolute top-0 end-0 bg-transparent border-0 text-muted p-0" style={{ right: '-5px' }}>
                    <Trash2 size={16} />
                  </button>
                  <Image 
                    src={item.image?.startsWith('http') || item.image?.startsWith('/') ? item.image : (item.image ? `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'https://www.sweettreeon.com'}${item.image}` : '/placeholder.png')} 
                    alt={item.name} 
                    width={60} 
                    height={60} 
                    className="rounded" 
                    style={{ objectFit: 'cover', cursor: 'pointer' }} 
                    onClick={() => handleProductClick(item.product)}
                  />
                  <div className="ms-3 flex-grow-1">
                    <div className="text-primary fw-bold" style={{ fontSize: '10px' }}>SWEETTREE</div>
                    <h6 
                      className="fw-bold m-0 mb-2 text-dark" 
                      style={{ fontSize: '12px', lineHeight: '1.4', cursor: 'pointer' }}
                      onClick={() => handleProductClick(item.product)}
                    >
                      {item.name}
                    </h6>
                    
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div className="input-group border rounded" style={{ width: '80px', height: '30px' }}>
                        <button className="btn btn-sm btn-light border-0 px-2" onClick={() => handleDecrement({ _id: item.product, price: item.price, name: item.name, images: [item.image], stock: item.maxStock }, item.size)}>-</button>
                        <input type="text" className="form-control form-control-sm text-center border-0 p-0 fw-bold bg-white" value={item.quantity} readOnly />
                        <button className="btn btn-sm btn-light border-0 px-2" onClick={() => handleIncrement({ _id: item.product, price: item.price, name: item.name, images: [item.image], stock: item.maxStock }, item.size)}>+</button>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold fs-6">₹{(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer - Sweettree Theme with Farmley Logic */}
        {items.length > 0 && (
          <div className="bg-white border-top shadow-sm mt-auto">
            
            <div className="p-3 pb-2 collapsed" data-bs-toggle="collapse" data-bs-target="#cartBreakdown" aria-expanded="false" style={{ cursor: 'pointer' }}>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark fs-6">
                  <Receipt size={18} className="text-danger" /> Estimated Total
                </h6>
                <div className="text-end d-flex align-items-center">
                  {calculatedTotalMrp > total && (
                    <span className="text-muted text-decoration-line-through me-2 fs-7">₹{calculatedTotalMrp.toFixed(2)}</span>
                  )}
                  <span className="fw-bold fs-5 text-dark">₹{total.toFixed(2)}</span>
                  <ChevronDown size={18} className="ms-2 text-muted" />
                </div>
              </div>
              {totalSavings > 0 && (
                <div className="text-end text-success fw-bold fs-7 mt-1 me-4">
                  You saved ₹{totalSavings.toFixed(2)}!
                </div>
              )}
            </div>

            <div id="cartBreakdown" className="collapse px-3">
              <div className="py-2 border-top border-bottom border-light">
                <div className="d-flex justify-content-between mb-2 fs-7 text-muted">
                  <span>Total MRP:</span>
                  <span>₹{calculatedTotalMrp.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2 fs-7 text-muted">
                  <span>Shipping:</span>
                  <span>{shippingFee === 0 ? <span className="text-success fw-bold">FREE</span> : 'To be calculated'}</span>
                </div>
                {mrpDiscount > 0 && (
                  <div className="d-flex justify-content-between mb-2 fs-7 text-success">
                    <span>Discount on MRP:</span>
                    <span>- ₹{mrpDiscount.toFixed(2)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="d-flex justify-content-between mb-2 fs-7 text-success">
                    <span>Coupon Discount:</span>
                    <span>- ₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-2 fs-7 text-muted">
                  <span>GST (5%):</span>
                  <span>+ ₹{tax.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mt-2 mb-2 fw-bold fs-6 text-dark">
                  <span>Grand Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-3 pt-2">
              {totalSavings > 0 && (
                <div className="text-center py-1 fw-bold mb-3 text-success" style={{ fontSize: '12px', background: '#f8fff9', border: '1px solid #d1e7dd', borderRadius: '4px' }}>
                  You Saved ₹{totalSavings.toFixed(2)} ({savingsPercent}%) so far!
                </div>
              )}
              <button className="btn btn-dark w-100 fw-bold py-2" data-bs-dismiss="offcanvas" onClick={() => {
                const offcanvasEl = document.getElementById('cartOffcanvas');
                if (offcanvasEl) {
                  const bsOffcanvas = window.bootstrap.Offcanvas.getInstance(offcanvasEl);
                  if (bsOffcanvas) bsOffcanvas.hide();
                }
                router.push('/checkout');
              }}>
                Place Order Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartOffcanvas;
