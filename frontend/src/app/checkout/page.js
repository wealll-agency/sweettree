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
  const { items, couponCode, subtotal, discount, tax, shippingFee, total, isCombo, applicableProducts, discountPercentage } = useSelector((state) => state.cart);
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
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [locality, setLocality] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [landmark, setLandmark] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [addressType, setAddressType] = useState('Home');
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
      router.push('/shop');
    }
  }, [items, router, isMounted]);

  if (!isMounted || items.length === 0) {
    return (
      <div className="container py-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-success mb-3" role="status">
          <span className="visually-hidden">Loading checkout...</span>
        </div>
        <p className="text-muted">Loading checkout details...</p>
      </div>
    );
  }

  const handleAddAddressSubmit = (e) => {
    e.preventDefault();
    if (!addrName || !addrPhone || !pincode || !locality || !address || !city || !stateName) {
      setAddressError('Please fill out all required address fields');
      return;
    }
    setAddressError('');
    
    if (!user) {
      // For guest users, just save locally for now. They will be asked to login upon payment.
      setShowNewAddressForm(false);
      return;
    }

    dispatch(addAddress({ 
      name: addrName, phone: addrPhone, pincode, locality, address, 
      city, state: stateName, landmark, alternatePhone: altPhone, addressType,
      isDefault: user.addresses.length === 0 
    }))
      .unwrap()
      .then((addresses) => {
        setShowNewAddressForm(false);
        setSelectedAddressIndex(addresses.length - 1);
        setAddrName(''); setAddrPhone(''); setPincode(''); setLocality('');
        setAddress(''); setCity(''); setStateName(''); setLandmark(''); setAltPhone('');
      });
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      router.push('/register?redirect=checkout');
      return;
    }

    const address = user.addresses ? user.addresses[selectedAddressIndex] : null;
    if (!address) {
      alert('Please select or add a shipping address');
      return;
    }

    const orderData = {
      items: items.map(i => ({ product: i.product, name: i.name, quantity: i.quantity, price: i.price })),
      deliveryAddress: {
        name: address.name || user.name || 'Guest Customer',
        phone: address.phone || user.phone || '9999999999',
        pincode: address.pincode || address.zipCode || '',
        locality: address.locality || address.street || address.address || address.city || '',
        address: address.address || address.street || address.locality || '',
        city: address.city || '',
        state: address.state || '',
        landmark: address.landmark || '',
        alternatePhone: address.alternatePhone || address.phone || user.phone || '',
        addressType: address.addressType || 'Home'
      },
      couponCode: couponCode || undefined
    };

    try {
      // 1. Create order on backend (returns local order and Razorpay order options)
      const orderResult = await dispatch(createOrder(orderData)).unwrap();
      const { order, razorpayOrder } = orderResult;

      // 2. Configure Razorpay SDK
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_T5pGWPZ0XxeNCx', // Public Razorpay Key ID
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
        if (!hasEligibleItem && !response.data.isCombo) {
          setCouponError('This coupon is not valid for any items in your cart.');
          dispatch(applyCouponCode({ code: '', discountPercentage: 0, applicableProducts: [], isCombo: false }));
          return;
        }
      }

      dispatch(applyCouponCode({
        code: response.data.code,
        discountPercentage: response.data.discountPercentage,
        applicableProducts: applicableProducts,
        isCombo: response.data.isCombo
      }));

      setCouponSuccess(`Coupon "${response.data.code}" applied! ${response.data.discountPercentage}% Discount.`);
    } catch (error) {
      setCouponError(error.response?.data?.message || 'Failed to apply coupon');
      dispatch(applyCouponCode({ code: '', discountPercentage: 0, applicableProducts: [], isCombo: false }));
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

            {!user ? (
              <p className="text-muted fs-7">Please fill in your shipping details. You will be asked to login before payment.</p>
            ) : user.addresses?.length === 0 ? (
              <p className="text-muted fs-7">No shipping addresses saved yet. Please add a new shipping address below.</p>
            ) : (
              <div className="d-flex flex-column gap-3 mb-4">
                {user.addresses?.map((addr, idx) => (
                  <div 
                    key={addr._id || idx}
                    onClick={() => setSelectedAddressIndex(idx)}
                    className={`p-3 rounded border cursor-pointer d-flex justify-content-between align-items-start ${selectedAddressIndex === idx ? 'border-success bg-light' : ''}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div>
                      <div className="d-flex align-items-center gap-3 mb-1">
                        <span className="fw-bold fs-6 text-dark">{addr.name || user.name}</span>
                        {(addr.phone || user.phone) && <span className="fw-bold fs-6 text-dark">{addr.phone || user.phone}</span>}
                        <span className="badge bg-light text-dark border fs-8 px-2 py-1">{addr.addressType || 'Home'}</span>
                      </div>
                      <p className="m-0 text-muted fs-7 lh-sm mt-1">
                        {addr.address || addr.street}
                        {addr.locality ? `, ${addr.locality}` : ''}<br />
                        {addr.city}, {addr.state} - <span className="fw-medium text-dark">{addr.pincode || addr.zipCode}</span>
                      </p>
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
                className="btn btn-brand-outline btn-sm d-flex align-items-center gap-1 mt-3"
              >
                <Plus size={16} /> {(user?.addresses?.length > 0) || (address && city) ? 'Add / Change Address' : 'Add Shipping Address'}
              </button>
            ) : (
              <form onSubmit={handleAddAddressSubmit} className="mt-3 border-top pt-3">
                <h6 className="fw-bold mb-3">Add a new address</h6>
                
                <div className="row g-2 mb-2">
                  <div className="col-md-6">
                    <input
                      type="text"
                      required
                      className="form-control form-control-brand py-2 fs-7"
                      placeholder="Name"
                      value={addrName}
                      onChange={(e) => setAddrName(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="tel"
                      required
                      className="form-control form-control-brand py-2 fs-7"
                      placeholder="10-digit mobile number"
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-md-6">
                    <input
                      type="text"
                      required
                      className="form-control form-control-brand py-2 fs-7"
                      placeholder="Pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      required
                      className="form-control form-control-brand py-2 fs-7"
                      placeholder="Locality"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-2">
                  <textarea
                    required
                    className="form-control form-control-brand py-2 fs-7"
                    placeholder="Address (Area and Street)"
                    rows="2"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  ></textarea>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-md-6">
                    <input
                      type="text"
                      required
                      className="form-control form-control-brand py-2 fs-7"
                      placeholder="City/District/Town"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      required
                      className="form-control form-control-brand py-2 fs-7"
                      placeholder="State"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control form-control-brand py-2 fs-7"
                      placeholder="Landmark (Optional)"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="tel"
                      className="form-control form-control-brand py-2 fs-7"
                      placeholder="Alternate Phone (Optional)"
                      value={altPhone}
                      onChange={(e) => setAltPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3 d-flex gap-3 align-items-center">
                  <span className="fs-7 fw-medium text-muted">Address Type</span>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="addressType" id="homeTypeCheckout" value="Home" checked={addressType === 'Home'} onChange={(e) => setAddressType(e.target.value)} />
                    <label className="form-check-label fs-7" htmlFor="homeTypeCheckout">Home</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="addressType" id="workTypeCheckout" value="Work" checked={addressType === 'Work'} onChange={(e) => setAddressType(e.target.value)} />
                    <label className="form-check-label fs-7" htmlFor="workTypeCheckout">Work</label>
                  </div>
                </div>

                {addressError && <div className="alert alert-danger p-2 fs-8 mb-2">{addressError}</div>}

                <div className="d-flex gap-2 mt-2">
                  <button type="submit" className="btn btn-brand btn-sm py-2 px-4">Save Address</button>
                  <button 
                    type="button" 
                    onClick={() => setShowNewAddressForm(false)} 
                    className="btn btn-light btn-sm py-2 px-4 border"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Display locally saved guest address if filled */}
            {!user && street && city && !showNewAddressForm && (
              <div className="mt-3 p-3 rounded border border-success bg-light d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="fw-bold mb-1">Guest Details</h6>
                  <p className="m-0 text-muted fs-7">{street}, {city}</p>
                  <p className="m-0 text-muted fs-7">{stateName} - {zipCode}, {country}</p>
                </div>
                <span className="badge bg-success">Ready for Checkout</span>
              </div>
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
              {couponCode && (
                <div className="d-flex justify-content-between align-items-center mt-3 bg-light p-2 rounded border">
                  <span className="fw-semibold text-success fs-7">Code: {couponCode}</span>
                  <button type="button" className="btn btn-sm text-danger p-0" onClick={() => {
                    setCouponInput('');
                    setCouponError('');
                    setCouponSuccess('');
                    dispatch(applyCouponCode({ code: '', discountPercentage: 0, applicableProducts: [], isCombo: false }));
                  }}>Remove</button>
                </div>
              )}
              {isCombo && discount === 0 && couponCode && (
                <div className="alert alert-warning py-2 px-3 mt-3 fs-8 mb-0">
                  <i className="fas fa-exclamation-circle me-1"></i>
                  <strong>Combo Incomplete!</strong> You must add all required combo products to your cart to activate the {discountPercentage}% discount.
                </div>
              )}
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
                <span>GST Tax (5%)</span>
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
              disabled={loading || (user && user.addresses?.length === 0) || (!user && (!street || !city))}
              className="btn btn-brand w-100 py-3 mt-4 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2"
            >
              {loading ? 'Processing Order...' : 'Pay Now'}
            </button>
          </div>

          {/* Cross-Sell Recommendations */}
          {recommendedProducts.length > 0 && (
            <div className="mt-4 pt-3 border-top">
              <h5 className="fw-bold mb-3 fs-6 d-flex align-items-center gap-2">
                <ShoppingBag size={16} /> You May Also Like
              </h5>
              <div className="row g-3">
                {recommendedProducts.map(product => {
                  const activePrice = product.price;

                  let imageSrc = '/placeholder.png';
                  if (product.images && product.images.length > 0) {
                    imageSrc = product.images[0].replace('/assets/images/', '/');
                  } else if (product.image) {
                    imageSrc = product.image.replace('/assets/images/', '/');
                  }

                  return (
                    <div key={product._id} className="col-6 col-md-4">
                      <div className="p-2 bg-white border rounded shadow-sm h-100 d-flex flex-column align-items-center text-center">
                        <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f8f9fa', marginBottom: '8px' }}>
                          <img 
                            src={imageSrc} 
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/60?text=No+Image'; }}
                          />
                        </div>
                        <h6 className="fw-semibold fs-8 mb-1 text-truncate w-100" title={product.name}>{product.name}</h6>
                        <div className="mb-2">
                          <span className="fw-bold fs-7 text-dark">₹{activePrice}</span>
                          {product.discount > 0 && (
                            <span className="text-muted text-decoration-line-through fs-8 ms-1">₹{product.purchasePrice || product.price}</span>
                          )}
                        </div>
                        <button 
                          onClick={() => handleAddRecommended(product)}
                          className="btn btn-outline-brand btn-sm w-100 mt-auto"
                          style={{ borderRadius: '20px', fontSize: '12px' }}
                        >
                          Add
                        </button>
                      </div>
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
