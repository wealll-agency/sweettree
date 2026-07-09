'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createOrder, verifyPayment } from '../../store/ordersSlice.js';
import { clearCart, addToCart, applyCouponCode } from '../../store/cartSlice.js';
import axios from 'axios';
import { addAddress } from '../../store/authSlice.js';
import Link from 'next/link';
import { MapPin, CreditCard, ShoppingBag, Plus } from 'lucide-react';

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { user } = useSelector((state) => state.auth);
  const { items, couponCode, subtotal, discount, tax, shippingFee, total } = useSelector((state) => state.cart);
  const { loading, error } = useSelector((state) => state.orders);

  // Address selection states
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  // Coupon states
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // New Address Form fields
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('India');
  const [addressError, setAddressError] = useState('');

  useEffect(() => {
    setIsMounted(true);
    // Fetch recommended products
    const fetchRecommended = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7050/api';
        const res = await axios.get(`${apiUrl}/products`);
        if (res.data.success) {
          // Exclude products already in cart, get top 3
          const cartProductIds = items.map(item => item.product);
          const availableRecs = res.data.products
            .filter(p => !cartProductIds.includes(p._id) && p.stock > 0)
            .slice(0, 3);
          setRecommendedProducts(availableRecs);
        }
      } catch (err) {
        console.error('Failed to load recommendations', err);
      }
    };
    if (items.length > 0) {
      fetchRecommended();
    }
  }, [items]);

  useEffect(() => {
    if (!isMounted) return;
    // Redirect if cart is empty
    if (items.length === 0) {
      router.push('/cart');
    }
    // Redirect if user not logged in
    if (!user) {
      router.push('/login?redirect=checkout');
    }
  }, [items, user, router, isMounted]);

  if (!isMounted || !user || items.length === 0) {
    return null;
  }

  const handleAddAddressSubmit = (e) => {
    e.preventDefault();
    if (!street || !city || !stateName || !zipCode || !country) {
      setAddressError('Please fill out all address fields');
      return;
    }
    setAddressError('');
    dispatch(addAddress({ street, city, state: stateName, zipCode, country, isDefault: user.addresses.length === 0 }))
      .unwrap()
      .then((addresses) => {
        setShowNewAddressForm(false);
        setSelectedAddressIndex(addresses.length - 1);
        setStreet(''); setCity(''); setStateName(''); setZipCode('');
      });
  };

  const handlePlaceOrder = async () => {
    const address = user.addresses[selectedAddressIndex];
    if (!address) {
      alert('Please select a shipping address');
      return;
    }

    const orderData = {
      items: items.map(i => ({ product: i.product, name: i.name, quantity: i.quantity, price: i.price })),
      deliveryAddress: {
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country
      },
      couponCode: couponCode || undefined
    };

    try {
      // 1. Create order on backend (returns local order and Razorpay order options)
      const orderResult = await dispatch(createOrder(orderData)).unwrap();
      const { order, razorpayOrder } = orderResult;

      // 2. Configure Razorpay SDK
      const options = {
        key: 'rzp_test_T5pGWPZ0XxeNCx', // Public Razorpay Key ID
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Sweettree Enterprises',
        description: `Payment for Order #${order._id.substring(0, 8)}`,
        order_id: razorpayOrder.id,
        handler: async function (response) {
          // Cryptographic verify response in backend
          const verifyData = {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          };

          const verifyResult = await dispatch(verifyPayment(verifyData)).unwrap();
          if (verifyResult.success) {
            dispatch(clearCart());
            router.push(`/user/orders/${verifyResult.order._id}?success=true`);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || '9999999999'
        },
        theme: {
          color: '#1E3F20'
        },
        modal: {
          ondismiss: function () {
            alert('Payment cancelled. Please try checkout again or contact support.');
          }
        }
      };

      // 3. Open Razorpay iframe overlay
      const loadRazorpay = () => {
        return new Promise((resolve) => {
          if (window.Razorpay) {
            resolve(true);
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const isLoaded = await loadRazorpay();

      if (isLoaded && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
      }
    } catch (err) {
      alert(err || 'Failed to place order');
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    if (!couponInput.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('sweettree_token') : null;
      const config = {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        },
        withCredentials: true
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7050/api';
      const response = await axios.post(`${apiUrl}/coupons/apply`, { code: couponInput.trim() }, config);
      
      const applicableProducts = response.data.applicableProducts || [];

      if (applicableProducts.length > 0) {
        const hasEligibleItem = items.some(item => applicableProducts.includes(item.product));
        if (!hasEligibleItem) {
          setCouponError('This coupon is not valid for any items in your cart.');
          dispatch(applyCouponCode({ code: '', discountPercentage: 0, applicableProducts: [] }));
          return;
        }
      }

      dispatch(applyCouponCode({
        code: response.data.code,
        discountPercentage: response.data.discountPercentage,
        applicableProducts: applicableProducts
      }));

      setCouponSuccess(`Coupon "${response.data.code}" applied! ${response.data.discountPercentage}% Discount.`);
    } catch (error) {
      setCouponError(error.response?.data?.message || 'Failed to apply coupon');
      dispatch(applyCouponCode({ code: '', discountPercentage: 0 }));
    }
  };

  const handleAddRecommended = (product) => {
    dispatch(addToCart({
      product,
      quantity: 1,
      size: product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Standard'
    }));
  };

  return (
    <div className="container py-5 animate-fade-in">
      <h1 className="fw-bold mb-4 display-font">Secure Checkout</h1>

      <div className="row g-5">
        
        {/* Left Side: Delivery Address + Payment method */}
        <div className="col-lg-7">
          
          {/* Address Section */}
          <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <MapPin size={20} color="var(--primary-color)" /> Shipping Address
            </h5>

            {user.addresses.length === 0 ? (
              <p className="text-muted fs-7">No shipping addresses saved yet. Please add a new shipping address below.</p>
            ) : (
              <div className="d-flex flex-column gap-3 mb-4">
                {user.addresses.map((addr, idx) => (
                  <div 
                    key={addr._id}
                    onClick={() => setSelectedAddressIndex(idx)}
                    className={`p-3 rounded border cursor-pointer d-flex justify-content-between align-items-start ${selectedAddressIndex === idx ? 'border-success bg-light' : ''}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div>
                      <h6 className="fw-bold mb-1">{user.name}</h6>
                      <p className="m-0 text-muted fs-7">{addr.street}, {addr.city}</p>
                      <p className="m-0 text-muted fs-7">{addr.state} - {addr.zipCode}, {addr.country}</p>
                    </div>
                    {selectedAddressIndex === idx && <span className="badge bg-success">Selected</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Form inline address */}
            {!showNewAddressForm ? (
              <button 
                onClick={() => setShowNewAddressForm(true)} 
                className="btn btn-brand-outline btn-sm d-flex align-items-center gap-1"
              >
                <Plus size={16} /> Add New Address
              </button>
            ) : (
              <form onSubmit={handleAddAddressSubmit} className="mt-3 border-top pt-3">
                <h6 className="fw-bold mb-2">New Address Details</h6>
                
                <div className="mb-2">
                  <input
                    type="text"
                    className="form-control form-control-brand py-2 fs-7"
                    placeholder="Street Address, Area"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control form-control-brand py-2 fs-7"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control form-control-brand py-2 fs-7"
                      placeholder="State"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control form-control-brand py-2 fs-7"
                      placeholder="Zip Code"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control form-control-brand py-2 fs-7"
                      placeholder="Country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </div>
                </div>

                {addressError && <div className="text-danger fs-8 mb-2">{addressError}</div>}

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-brand btn-sm">Save Address</button>
                  <button 
                    type="button" 
                    onClick={() => setShowNewAddressForm(false)} 
                    className="btn btn-brand-secondary btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Payment Card selection */}
          <div className="bg-white p-4 rounded-4 shadow-sm border">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <CreditCard size={20} color="var(--primary-color)" /> Payment Method
            </h5>
            <div className="p-3 rounded border border-success bg-light d-flex align-items-center gap-3">
              <input type="radio" checked readOnly className="form-check-input" />
              <div>
                <h6 className="fw-bold m-0 text-success">Razorpay Payment Gateway</h6>
                <small className="text-muted">Pay securely using Cards, Net Banking, UPI, or Wallets.</small>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Order summary review */}
        <div className="col-lg-5">
          <div className="glass-card p-4">
            <h4 className="fw-bold mb-3 display-font text-dark border-bottom pb-2">Review Order</h4>

            {/* Small recap list */}
            <div className="d-flex flex-column gap-3 mb-4" style={{ maxHeight: '220px', overflowY: 'auto' }}>
              {items.map(item => (
                <div key={`${item.product}-${item.size}`} className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <ShoppingBag size={18} className="text-muted" />
                    <div>
                      <span className="fw-semibold text-dark fs-7 d-block text-truncate" style={{ maxWidth: '180px' }}>{item.name}</span>
                      <small className="text-muted fs-8">Qty: {item.quantity} | Size: {item.size}</small>
                    </div>
                  </div>
                  <span className="fw-bold fs-7 text-dark">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Coupon Entry */}
            <div className="mt-3 mb-4 border-top pt-3">
              <h6 className="fw-bold fs-7 mb-2 text-dark">Have a coupon?</h6>
              <form onSubmit={handleApplyCoupon} className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control form-control-sm form-control-brand"
                  placeholder="Enter coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                />
                <button type="submit" className="btn btn-sm btn-brand px-3">Apply</button>
              </form>
              {couponError && <div className="text-danger fs-8 mt-1">{couponError}</div>}
              {couponSuccess && <div className="text-success fs-8 mt-1">{couponSuccess}</div>}
            </div>

            <div className="d-flex flex-column gap-2 text-muted border-top pt-3 fs-7">
              <div className="d-flex justify-content-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="d-flex justify-content-between text-success">
                  <span>Coupon Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="d-flex justify-content-between">
                <span>Shipping Fee</span>
                <span>{shippingFee === 0 ? 'Free' : `₹${shippingFee}`}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>GST Tax (18%)</span>
                <span>₹{tax}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between text-dark fw-bold fs-5">
                <span>Total Amount</span>
                <span>₹{total}</span>
              </div>
            </div>

            {error && <div className="alert alert-danger p-2 fs-8 mt-3">{error}</div>}

            <button
              onClick={handlePlaceOrder}
              disabled={loading || user.addresses.length === 0}
              className="btn btn-brand w-100 py-3 mt-4 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2"
            >
              {loading ? 'Processing Order...' : 'Pay with Razorpay'}
            </button>
          </div>

          {/* Cross-Sell Recommendations */}
          {recommendedProducts.length > 0 && (
            <div className="mt-4 pt-3 border-top">
              <h5 className="fw-bold mb-3 fs-6 d-flex align-items-center gap-2">
                <ShoppingBag size={16} /> You May Also Like
              </h5>
              <div className="d-flex flex-column gap-3">
                {recommendedProducts.map(product => {
                  const activePrice = product.discount > 0 
                    ? Math.round(product.price * (1 - product.discount / 100))
                    : product.price;

                  return (
                    <div key={product._id} className="d-flex align-items-center gap-3 p-3 bg-white border rounded shadow-sm">
                      <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f8f9fa' }}>
                        {product.images?.[0] && (
                          <img 
                            src={`${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:7050'}${product.images[0]}`} 
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/60?text=No+Image'; }}
                          />
                        )}
                      </div>
                      <div className="flex-grow-1 min-w-0">
                        <h6 className="fw-semibold fs-7 mb-1 text-truncate">{product.name}</h6>
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-bold fs-7 text-dark">₹{activePrice}</span>
                          {product.discount > 0 && (
                            <span className="text-muted text-decoration-line-through fs-8">₹{product.price}</span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleAddRecommended(product)}
                        className="btn btn-outline-brand btn-sm px-3 flex-shrink-0"
                        style={{ borderRadius: '20px' }}
                      >
                        Add
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
