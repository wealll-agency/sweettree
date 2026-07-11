'use client';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart } from '../store/cartSlice';
import Link from 'next/link';
import { ShoppingCart, Trash2 } from 'lucide-react';

const CartOffcanvas = () => {
  const dispatch = useDispatch();
  const { items, subtotal, discount, total } = useSelector((state) => state.cart);

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

  // Sweettree free shipping threshold is usually 1000 for this layout
  const freeShippingThreshold = 1000;
  const remainingForFreeShipping = freeShippingThreshold - total;
  const progressPercent = Math.min((total / freeShippingThreshold) * 100, 100);

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
                  <img src={item.image || '/placeholder.png'} alt={item.name} className="rounded" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                  <div className="ms-3 flex-grow-1">
                    <div className="text-primary fw-bold" style={{ fontSize: '10px' }}>SWEETTREE</div>
                    <h6 className="fw-bold m-0 mb-2" style={{ fontSize: '12px', lineHeight: '1.4' }}>{item.name}</h6>
                    
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div className="input-group border rounded" style={{ width: '80px', height: '30px' }}>
                        <button className="btn btn-sm btn-light border-0 px-2" onClick={() => handleDecrement({ _id: item.product }, item.size)}>-</button>
                        <input type="text" className="form-control form-control-sm text-center border-0 p-0 fw-bold bg-white" value={item.quantity} readOnly />
                        <button className="btn btn-sm btn-light border-0 px-2" onClick={() => handleIncrement({ _id: item.product, price: item.price, name: item.name, images: [item.image] }, item.size)}>+</button>
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

        {/* Footer */}
        {items.length > 0 && (
          <div className="bg-white border-top p-3 shadow-sm">
            <div className="d-flex justify-content-between mb-2 fs-7 text-muted">
              <span>MRP:</span>
              <span>₹{totalMrp.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-3 fs-7 text-success">
              <span>Offer Discount:</span>
              <span>- ₹{discount.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-3 fw-bold fs-5 text-dark">
              <span>Sub-Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <button className="btn btn-dark w-100 fw-bold py-2" data-bs-dismiss="offcanvas" onClick={() => window.location.href = '/checkout'}>
              Place Order Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartOffcanvas;
