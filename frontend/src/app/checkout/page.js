'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { createOrder } from '../../store/ordersSlice.js';
import { clearCart, addToCart, applyCouponCode } from '../../store/cartSlice.js';
import api from '../../utils/axiosConfig.js';
import { addAddress } from '../../store/authSlice.js';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, CreditCard, ShoppingBag, Plus } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { user } = useSelector((state) => state.auth);
  const { items, couponCode, subtotal, discount, tax, shippingFee, total, isCombo, applicableProducts, discountPercentage, minPurchaseAmount, discountType, flatDiscountAmount } = useSelector((state) => state.cart);
  const { loading, error } = useSelector((state) => state.orders);
  const { showAlert } = useNotification();

  // Address selection states
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  // Coupon states
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState([]);

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
  const [paymentMode, setPaymentMode] = useState('ICICI');
  const [hasCodPermission, setHasCodPermission] = useState(true);
  const [hasOnlinePaymentPermission, setHasOnlinePaymentPermission] = useState(true);

  useEffect(() => {
    if (!hasCodPermission && paymentMode === 'COD') {
      setPaymentMode('ICICI');
    } else if (!hasOnlinePaymentPermission && paymentMode === 'ICICI') {
      setPaymentMode('COD');
    }
  }, [hasCodPermission, hasOnlinePaymentPermission, paymentMode]);

  useEffect(() => {
    setIsMounted(true);

    const fetchGlobalSettings = async () => {
      try {
        const res = await api.get(`/auth/settings?t=${Date.now()}`);
        if (res.data.success) {
          setHasCodPermission(res.data.settings.cod !== false);
          setHasOnlinePaymentPermission(res.data.settings.onlinePayment !== false);
        }
      } catch (err) {
        console.warn('Failed to fetch system settings:', err.message || err);
      }
    };
    fetchGlobalSettings();
    
    // Parse error from URL if redirected from payment failure
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('error')) {
        setPaymentError(params.get('error'));
      }
    }

    // Fetch available coupons
    const fetchCoupons = async () => {
      try {
        const res = await api.get('/coupons');
        if (res.data.success) {
          setAvailableCoupons(res.data.coupons.filter(c => c.isActive && new Date(c.expiryDate) > new Date()));
        }
      } catch (err) {
        console.warn('Failed to load coupons:', err.message || err);
      }
    };
    if (user) {
      fetchCoupons();
    }

    // Fetch recommended products
    const fetchRecommended = async () => {
      try {
        const res = await api.get(`/products`);
        if (res.data.success) {
          // Exclude products already in cart, get top 3
          const cartProductIds = items.map(item => item.product);
          const availableRecs = res.data.products
            .filter(p => !cartProductIds.includes(p._id) && p.stock > 0)
            .slice(0, 3);
          setRecommendedProducts(availableRecs);
        }
      } catch (err) {
        console.warn('Failed to load recommendations:', err.message || err);
      }
    };
    if (items.length > 0) {
      fetchRecommended();
    }
  }, [items, user]);

  // Restore Checkout State after login/registration
  useEffect(() => {
    if (user) {
      const pendingCheckoutStr = localStorage.getItem('pendingCheckout');
      if (pendingCheckoutStr) {
        try {
          const state = JSON.parse(pendingCheckoutStr);
          if (state.address && state.city) {
            setAddrName(state.addrName || '');
            setAddrPhone(state.addrPhone || '');
            setPincode(state.pincode || '');
            setLocality(state.locality || '');
            setAddress(state.address || '');
            setCity(state.city || '');
            setStateName(state.stateName || '');
            setLandmark(state.landmark || '');
            setAltPhone(state.altPhone || '');
            setAddressType(state.addressType || 'Home');
            setPaymentMode(state.paymentMode || 'ICICI');

            // Automatically save this address to their profile
            dispatch(addAddress({ 
              name: state.addrName, phone: state.addrPhone, pincode: state.pincode, locality: state.locality, address: state.address, 
              city: state.city, state: state.stateName, landmark: state.landmark, alternatePhone: state.altPhone, addressType: state.addressType,
              isDefault: (!user.addresses || user.addresses.length === 0)
            })).unwrap().then((addresses) => {
              setSelectedAddressIndex(addresses.length - 1);
              setShowNewAddressForm(false);
            }).catch(err => console.warn("Failed to restore checkout address:", err.message || err));
            // Restore coupon if it was active
            if (state.couponCode) {
              dispatch(applyCouponCode({
                code: state.couponCode,
                discountType: state.discountType,
                discountPercentage: state.discountPercentage,
                flatDiscountAmount: state.flatDiscountAmount,
                applicableProducts: state.applicableProducts,
                isCombo: state.isCombo,
                minPurchaseAmount: state.minPurchaseAmount
              }));
            }
          }
          localStorage.removeItem('pendingCheckout');
        } catch (e) {
          console.warn('State restore error:', e.message || e);
        }
      }
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (!isMounted) return;
    // Redirect if cart is empty
    if (items.length === 0) {
      router.push('/shop');
    }
  }, [items, router, isMounted]);

  if (!isMounted || items.length === 0) {
    return (
      <div className="container-fluid px-4 px-lg-5 py-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
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
      })
      .catch((err) => {
        setAddressError(err || 'Failed to save address. Please try again.');
      });
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      const checkoutState = {
        addrName, addrPhone, pincode, locality, address, city, stateName, landmark, altPhone, addressType, paymentMode,
        couponCode, discountType, discountPercentage, flatDiscountAmount, applicableProducts, isCombo, minPurchaseAmount
      };
      localStorage.setItem('pendingCheckout', JSON.stringify(checkoutState));
      router.push('/login?redirect=checkout');
      return;
    }

    const addressObj = user.addresses ? user.addresses[selectedAddressIndex] : null;
    if (!addressObj) {
      showAlert('Please select or add a shipping address', 'warning');
      return;
    }

    const orderData = {
      items: items.map(i => ({ 
        product: i.product || undefined, 
        combo: i.combo || undefined, 
        itemType: i.itemType || 'Product',
        name: i.name, 
        quantity: i.quantity, 
        price: i.price,
        size: i.size
      })),
      deliveryAddress: {
        name: addressObj.name || user.name || 'Guest Customer',
        phone: addressObj.phone || user.phone || '9999999999',
        pincode: addressObj.pincode || addressObj.zipCode || '',
        locality: addressObj.locality || addressObj.street || addressObj.address || addressObj.city || '',
        address: addressObj.address || addressObj.street || addressObj.locality || '',
        city: addressObj.city || '',
        state: addressObj.state || '',
        landmark: addressObj.landmark || '',
        alternatePhone: addressObj.alternatePhone || addressObj.phone || user.phone || '',
        addressType: addressObj.addressType || 'Home'
      },
      couponCode: couponCode || undefined,
      paymentMode: paymentMode
    };

    try {
      // 1. Create order on backend (returns local order and ICICI payload)
      const orderResult = await dispatch(createOrder(orderData)).unwrap();
      const { iciciPayload } = orderResult;
      
      // If COD, skip ICICI redirection and go to user profile
      if (paymentMode === 'COD') {
        // Clear cart for COD immediately
        dispatch(clearCart());
        showAlert('Order placed successfully via Cash on Delivery!', 'success');
        router.push('/user/profile');
        return;
      }

      if (orderResult.gatewayError) {
        showAlert(`Payment Gateway Error: ${orderResult.gatewayError}`, 'error');
        return;
      }

      const iciciActionUrl = orderResult.iciciActionUrl;
      if (iciciActionUrl) {
        window.location.href = iciciActionUrl;
        return;
      }

      // Fallback form rendering if no paymentUrl but also no error (for non-S2S gateways)
      if (orderResult.iciciPayload) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://pgpayuat.icici.bank.in/tsp/pg/api/v2/initiateSale';
        
        Object.keys(orderResult.iciciPayload).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = orderResult.iciciPayload[key];
          form.appendChild(input);
        });
        
        document.body.appendChild(form);
        form.submit();
      } else {
        showAlert("Invalid payment gateway response. Please try again.", 'error');
      }

    } catch (err) {
      console.error("Checkout Error:", err);
      showAlert(err?.message || (typeof err === 'string' ? err : 'Failed to place order'), 'error');
    }
  };

  const handleApplyCoupon = async (e, codeToApply = null) => {
    if (e) e.preventDefault();
    const code = codeToApply || couponInput;
    setCouponError('');
    setCouponSuccess('');
    
    if (!code || !code.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    try {
      const response = await api.post(`/coupons/apply`, { 
        code: code.trim(),
        cartSubtotal: subtotal
      });
      
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
        discountType: response.data.discountType,
        discountPercentage: response.data.discountPercentage,
        flatDiscountAmount: response.data.flatDiscountAmount,
        applicableProducts: applicableProducts,
        isCombo: response.data.isCombo,
        minPurchaseAmount: response.data.minPurchaseAmount
      }));

      const displayDiscount = response.data.discountType === 'flat' ? `₹${response.data.flatDiscountAmount}` : `${response.data.discountPercentage}%`;
      setCouponSuccess(`Coupon "${response.data.code}" applied! ${displayDiscount} Discount.`);
      setCouponInput(''); // Clear input if applied from modal
      
      // Close modal if open
      if (typeof window !== 'undefined' && window.bootstrap) {
        const modalEl = document.getElementById('couponsModal');
        if (modalEl) {
          const bsModal = window.bootstrap.Modal.getInstance(modalEl);
          if (bsModal) bsModal.hide();
        }
      }
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
    <div className="container-fluid px-4 px-lg-5 py-5 animate-fade-in">
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
                    <label className="form-label mb-1 fs-7 fw-semibold" htmlFor="addrName">Full Name*</label>
                    <input
                      id="addrName"
                      aria-label="Full Name"
                      type="text"
                      required
                      className="form-control form-control-brand py-2 fs-7"
                      value={addrName}
                      onChange={(e) => setAddrName(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label mb-1 fs-7 fw-semibold" htmlFor="addrPhone">Phone Number*</label>
                    <input
                      id="addrPhone"
                      aria-label="Phone Number"
                      type="tel"
                      required
                      className="form-control form-control-brand py-2 fs-7"
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-md-6">
                    <label className="form-label mb-1 fs-7 fw-semibold" htmlFor="pincode">Pincode*</label>
                    <input
                      id="pincode"
                      aria-label="Pincode"
                      type="text"
                      required
                      className="form-control form-control-brand py-2 fs-7"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label mb-1 fs-7 fw-semibold" htmlFor="locality">Locality / Area*</label>
                    <input
                      id="locality"
                      aria-label="Locality or Area"
                      type="text"
                      required
                      className="form-control form-control-brand py-2 fs-7"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-2">
                  <label className="form-label mb-1 fs-7 fw-semibold" htmlFor="address">Street Address / House No.*</label>
                  <textarea
                    id="address"
                    aria-label="Street Address or House Number"
                    required
                    className="form-control form-control-brand py-2 fs-7"
                    rows="2"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  ></textarea>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-md-6">
                    <label className="form-label mb-1 fs-7 fw-semibold" htmlFor="city">City / District*</label>
                    <input
                      id="city"
                      aria-label="City or District"
                      type="text"
                      required
                      className="form-control form-control-brand py-2 fs-7"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label mb-1 fs-7 fw-semibold" htmlFor="stateName">State*</label>
                    <input
                      id="stateName"
                      aria-label="State"
                      type="text"
                      required
                      className="form-control form-control-brand py-2 fs-7"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <label className="form-label mb-1 fs-7 fw-semibold" htmlFor="landmark">Landmark (Optional)</label>
                    <input
                      id="landmark"
                      aria-label="Landmark"
                      type="text"
                      className="form-control form-control-brand py-2 fs-7"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label mb-1 fs-7 fw-semibold" htmlFor="altPhone">Alternate Phone (Optional)</label>
                    <input
                      id="altPhone"
                      aria-label="Alternate Phone"
                      type="tel"
                      className="form-control form-control-brand py-2 fs-7"
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
            {!user && address && city && !showNewAddressForm && (
              <div className="mt-3 p-3 rounded border border-success bg-light d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="fw-bold mb-1">Guest Details</h6>
                  <p className="m-0 text-muted fs-7">{address}, {city}</p>
                  <p className="m-0 text-muted fs-7">{stateName} - {pincode}</p>
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
            <div className="d-flex flex-column gap-3">
              {hasOnlinePaymentPermission && (
                <div 
                  className={`p-3 rounded border cursor-pointer d-flex align-items-center gap-3 ${paymentMode === 'ICICI' ? 'border-success bg-light' : ''}`}
                  onClick={() => setPaymentMode('ICICI')}
                  style={{ cursor: 'pointer' }}
                >
                  <input type="radio" checked={paymentMode === 'ICICI'} readOnly className="form-check-input mt-0" />
                  <div>
                    <h6 className="fw-bold m-0 text-dark">ICICI Secure Payment</h6>
                    <small className="text-muted">Pay securely using Cards, Net Banking, UPI, or Wallets.</small>
                  </div>
                </div>
              )}
              {hasCodPermission && (
                <div 
                  className={`p-3 rounded border cursor-pointer d-flex align-items-center gap-3 ${paymentMode === 'COD' ? 'border-success bg-light' : ''}`}
                  onClick={() => setPaymentMode('COD')}
                  style={{ cursor: 'pointer' }}
                >
                  <input type="radio" checked={paymentMode === 'COD'} readOnly className="form-check-input mt-0" />
                  <div>
                    <h6 className="fw-bold m-0 text-dark">Cash on Delivery (COD)</h6>
                    <small className="text-muted">Pay in cash when your order is delivered to your door.</small>
                  </div>
                </div>
              )}
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
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-bold fs-7 mb-0 text-dark">Have a coupon?</h6>
                <button 
                  type="button" 
                  className="btn btn-link text-brand p-0 text-decoration-none fs-8 fw-semibold"
                  data-bs-toggle="modal"
                  data-bs-target="#couponsModal"
                >
                  View all coupons
                </button>
              </div>
              <form onSubmit={handleApplyCoupon} className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control form-control-sm form-control-brand"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                />
                <button type="submit" className="btn btn-sm btn-brand px-3">Apply</button>
              </form>
              {couponError && <div className="text-danger fs-8 mt-1">{couponError}</div>}
              {couponSuccess && (!minPurchaseAmount || subtotal >= minPurchaseAmount) && (
                <div className="text-success fs-8 mt-1">{couponSuccess}</div>
              )}
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
              {/* Eligible Coupons */}
              {availableCoupons && availableCoupons.filter(c => !c.minPurchaseAmount || subtotal >= c.minPurchaseAmount).length > 0 && !couponCode && (
                <div className="mt-3">
                  <h6 className="fs-8 fw-bold text-muted mb-2">Available for you:</h6>
                  <div className="d-flex flex-column gap-2">
                    {availableCoupons.filter(c => !c.minPurchaseAmount || subtotal >= c.minPurchaseAmount).slice(0, 1).map(c => (
                      <div key={c._id} className="d-flex justify-content-between align-items-center border rounded p-2" style={{ borderStyle: 'dashed !important', borderColor: 'var(--primary-color) !important', backgroundColor: 'rgba(74, 222, 128, 0.05)' }}>
                        <div>
                          <span className="fw-bold d-block" style={{ fontSize: '0.85rem', color: 'var(--primary-color)' }}>{c.code}</span>
                          <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                            {c.discountType === 'percentage' || c.discountType === 'Percent' ? `${c.discountPercentage}% OFF` : `₹${c.flatDiscountAmount} OFF`}
                            {c.minPurchaseAmount > 0 ? ` on orders above ₹${c.minPurchaseAmount}` : ''}
                          </small>
                        </div>
                        <button 
                          type="button" 
                          className="btn btn-sm fs-8 py-1 px-2"
                          style={{ backgroundColor: 'var(--primary-color)', color: '#fff', borderRadius: '6px' }}
                          onClick={() => handleApplyCoupon(null, c.code)}
                        >
                          Apply
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {isCombo && discount === 0 && couponCode && (!minPurchaseAmount || subtotal >= minPurchaseAmount) && (
                <div className="alert alert-warning py-2 px-3 mt-3 fs-8 mb-0">
                  <i className="fas fa-exclamation-circle me-1"></i>
                  <strong>Combo Incomplete!</strong> You must add all required combo products to your cart to activate the {discountPercentage}% discount.
                </div>
              )}
              {couponCode && minPurchaseAmount > 0 && subtotal < minPurchaseAmount && (
                <div className="alert alert-warning py-2 px-3 mt-3 fs-8 mb-0">
                  <i className="fas fa-exclamation-triangle me-1"></i>
                  <strong>Minimum Purchase Not Met!</strong> Add ₹{minPurchaseAmount - subtotal} more to unlock this coupon discount.
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
            {paymentError && <div className="alert alert-danger p-2 fs-8 mt-3"><i className="fas fa-exclamation-triangle me-1"></i> {paymentError}</div>}

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="btn w-100 py-3 mt-4 fw-bold fs-6 d-none d-md-flex align-items-center justify-content-center gap-2 text-white border-0 shadow-sm"
              style={{
                background: loading ? 'rgba(14, 165, 233, 0.5)' : 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                boxShadow: '0 6px 16px rgba(14, 165, 233, 0.25)',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(14, 165, 233, 0.4)'; }}}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(14, 165, 233, 0.25)'; }}
            >
              {loading 
                ? <><span className="spinner-border spinner-border-sm" style={{ width: '1rem', height: '1rem' }} /> Processing...</>
                : 'Pay Now'
              }
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
                        <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f8f9fa', marginBottom: '8px', position: 'relative' }}>
                          <Image 
                            src={imageSrc} 
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            style={{ objectFit: 'cover' }}
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

      {/* Mobile Sticky Pay Now Action (Rendered via Portal to guarantee fixed positioning) */}
      {isMounted && typeof document !== 'undefined' && createPortal(
        <div className="d-md-none mobile-sticky-actions">
           <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: '12px', color: '#6c757d', fontWeight: '500' }}>Total Amount</span>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#212529' }}>₹{total}</span>
           </div>
           <div className="d-flex gap-2">
             <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="btn flex-fill py-2 fw-bold text-white border-0 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                style={{ 
                  background: loading ? 'rgba(14, 165, 233, 0.5)' : 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
             >
                {loading 
                  ? <><span className="spinner-border spinner-border-sm" style={{ width: '14px', height: '14px' }} /> Processing...</>
                  : 'Pay Now'
                }
             </button>
           </div>
        </div>,
        document.body
      )}

      {/* Coupons Modal (Rendered via Portal to fix stacking context issues) */}
      {isMounted && typeof document !== 'undefined' && createPortal(
        <div className="modal fade" id="couponsModal" tabIndex="-1" aria-labelledby="couponsModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-bottom bg-light">
                <h5 className="modal-title fw-bold fs-5 text-dark" id="couponsModalLabel">Available Coupons</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body p-4 bg-light">
                {availableCoupons.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    <i className="bi bi-ticket-perforated fs-1 mb-3 text-secondary opacity-50"></i>
                    <p>No coupons available right now.</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {availableCoupons.map(coupon => {
                      const gap = (coupon.minPurchaseAmount || 0) - subtotal;
                      const isApplicable = gap <= 0;

                      return (
                        <div key={coupon._id} className={`card border-0 shadow-sm ${isApplicable ? 'border-success border' : 'opacity-75'}`}>
                          <div className="card-body p-3">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div className="border border-success border-dashed px-3 py-1 rounded bg-success bg-opacity-10 text-success fw-bold fs-6" style={{ letterSpacing: '1px', borderStyle: 'dashed', borderWidth: '2px' }}>
                                {coupon.code}
                              </div>
                              {isApplicable ? (
                                <button 
                                  type="button" 
                                  className="btn btn-sm btn-success px-4 fw-bold shadow-sm"
                                  onClick={() => handleApplyCoupon(null, coupon.code)}
                                >
                                  Apply
                                </button>
                              ) : (
                                <button 
                                  type="button" 
                                  className="btn btn-sm btn-outline-secondary px-4 fw-bold"
                                  onClick={() => showAlert(`Add ₹${gap.toFixed(2)} more to unlock this offer!`, 'warning')}
                                >
                                  Apply
                                </button>
                              )}
                            </div>
                            <h5 className="fw-bold text-dark mb-1">
                              {coupon.discountType === 'flat' ? `₹${coupon.flatDiscountAmount} OFF` : `${coupon.discountPercentage}% OFF`}
                            </h5>
                            {coupon.minPurchaseAmount > 0 && (
                              <p className="text-muted fs-7 mb-0">On minimum purchase of ₹{coupon.minPurchaseAmount}</p>
                            )}
                            {!isApplicable && gap > 0 && (
                              <div className="mt-3 text-danger fs-7 fw-semibold bg-danger bg-opacity-10 px-3 py-2 rounded d-inline-block border border-danger border-opacity-25 w-100 text-center">
                                <i className="fas fa-lock me-1"></i> Add ₹{gap.toFixed(2)} more to unlock
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
