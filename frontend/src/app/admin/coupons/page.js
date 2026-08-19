'use client';

import { useState, useEffect } from 'react';
import api from '../../../utils/axiosConfig.js';
import { Tag, Trash2, PlusCircle, AlertCircle } from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://www.sweettreeon.com/api';

export default function CouponManagerPage() {
  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showConfirm, showAlert } = useNotification();
  
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountPercentage: '',
    flatDiscountAmount: '',
    minPurchaseAmount: '',
    expiryDate: '',
    usageLimit: 100,
    applicableProducts: [],
    isCombo: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [viewingProducts, setViewingProducts] = useState(null);
  const [couponMode, setCouponMode] = useState('purchase'); // 'purchase' or 'product'

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (viewingProducts) {
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'auto';
    };
  }, [viewingProducts]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [couponsRes, productsRes] = await Promise.all([
        api.get(`/coupons`),
        api.get(`/products`)
      ]);
      setCoupons(couponsRes.data.coupons || []);
      setProducts(productsRes.data.products || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load coupons or products');
    } finally {
      setLoading(false);
    }
  };

  const handleProductCheckboxChange = (productId, isChecked) => {
    if (isChecked) {
      setFormData({ ...formData, applicableProducts: [...formData.applicableProducts, productId] });
    } else {
      setFormData({ ...formData, applicableProducts: formData.applicableProducts.filter(id => id !== productId) });
    }
  };

  const handleSelectAllProducts = (e) => {
    if (e.target.checked) {
      setFormData({ ...formData, applicableProducts: products.map(p => p._id) });
    } else {
      setFormData({ ...formData, applicableProducts: [] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let submissionData = { ...formData };
    if (couponMode === 'purchase') {
      submissionData.applicableProducts = [];
      submissionData.isCombo = false;
    } else {
      if (submissionData.isCombo && submissionData.applicableProducts.length < 2) {
        setError('Combo coupons must have at least 2 applicable products selected.');
        return;
      }
      if (submissionData.applicableProducts.length === 0) {
        setError('Please select at least one applicable product.');
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post(`/coupons`, submissionData);
      setSuccess('Coupon created successfully!');
      setFormData({
        code: '',
        discountType: 'percentage',
        discountPercentage: '',
        flatDiscountAmount: '',
        minPurchaseAmount: '',
        expiryDate: '',
        usageLimit: 100,
        applicableProducts: [],
        isCombo: false
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm('Are you sure you want to delete this coupon?');
    if (!confirmed) return;
    try {
      await api.delete(`/coupons/${id}`);
      fetchData();
    } catch (err) {
      setError('Failed to delete coupon');
    }
  };

  if (loading) return <div className="p-5 text-center">Loading Coupon Manager...</div>;

  return (
    <div className="animate-fade-in">
      <style>{`
        .force-round-radio, .force-round-checkbox {
          width: 18px !important;
          height: 18px !important;
          min-width: 18px !important;
          min-height: 18px !important;
          max-width: 18px !important;
          max-height: 18px !important;
          border-radius: 50% !important;
          appearance: none !important;
          -webkit-appearance: none !important;
          border: 2px solid #aaa !important;
          background-color: #fff !important;
          margin: 0 !important;
          padding: 0 !important;
          display: inline-block !important;
          position: relative !important;
          cursor: pointer !important;
          flex-shrink: 0 !important;
          outline: none !important;
          box-shadow: none !important;
        }
        .force-round-radio:checked, .force-round-checkbox:checked {
          background-color: #1A6D2D !important;
          border-color: #1A6D2D !important;
        }
        .force-round-radio:checked::after, .force-round-checkbox:checked::after {
          content: '' !important;
          position: absolute !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          width: 8px !important;
          height: 8px !important;
          border-radius: 50% !important;
          background: white !important;
        }
      `}</style>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold m-0 display-font">Coupon Manager</h1>
          <p className="text-muted m-0">Create product-specific discounts.</p>
        </div>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}
      {success && <div className="alert alert-success py-2">{success}</div>}

      <div className="row g-4">
        {/* Create Coupon Form */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <h5 className="fw-bold d-flex align-items-center gap-2 mb-3">
              <PlusCircle size={20} className="text-brand" /> Create New Coupon
            </h5>
            
            <ul className="nav nav-pills nav-fill mb-4 fs-7 fw-semibold bg-light p-1 rounded-3">
              <li className="nav-item">
                <button 
                  className={`nav-link rounded-3 py-2 ${couponMode === 'purchase' ? 'active bg-brand text-white shadow-sm' : 'text-muted'}`}
                  onClick={() => setCouponMode('purchase')}
                >
                  Purchase Wise
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link rounded-3 py-2 ${couponMode === 'product' ? 'active bg-brand text-white shadow-sm' : 'text-muted'}`}
                  onClick={() => setCouponMode('product')}
                >
                  Product Wise
                </button>
              </li>
            </ul>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fs-7 fw-semibold">Coupon Code</label>
                <input 
                  type="text" 
                  className="form-control bg-light border-0" 
                  value={formData.code} 
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fs-7 fw-semibold">Discount Type</label>
                <div className="d-flex gap-4 mt-2">
                  <div className="form-check d-flex align-items-center gap-2 m-0 p-0">
                    <input 
                      className="force-round-radio" 
                      type="radio" 
                      name="discountType" 
                      id="typePercentage" 
                      value="percentage" 
                      checked={formData.discountType === 'percentage'} 
                      onChange={(e) => setFormData({...formData, discountType: e.target.value})} 
                    />
                    <label className="form-check-label fs-7 fw-medium cursor-pointer m-0 mt-1" htmlFor="typePercentage">Percentage (%)</label>
                  </div>
                  <div className="form-check d-flex align-items-center gap-2 m-0 p-0">
                    <input 
                      className="force-round-radio" 
                      type="radio" 
                      name="discountType" 
                      id="typeFlat" 
                      value="flat" 
                      checked={formData.discountType === 'flat'} 
                      onChange={(e) => setFormData({...formData, discountType: e.target.value})} 
                    />
                    <label className="form-check-label fs-7 fw-medium cursor-pointer m-0 mt-1" htmlFor="typeFlat">Flat Amount (₹)</label>
                  </div>
                </div>
              </div>

              {formData.discountType === 'percentage' ? (
                <div className="mb-3">
                  <label className="form-label fs-7 fw-semibold">Discount Percentage (%)</label>
                  <input 
                    type="number" 
                    className="form-control bg-light border-0" 
                    value={formData.discountPercentage} 
                    onChange={(e) => setFormData({...formData, discountPercentage: e.target.value})}
                    required={formData.discountType === 'percentage'} 
                    min="1" max="100"
                  />
                </div>
              ) : (
                <div className="mb-3">
                  <label className="form-label fs-7 fw-semibold">Flat Discount Amount (₹)</label>
                  <input 
                    type="number" 
                    className="form-control bg-light border-0" 
                    value={formData.flatDiscountAmount} 
                    onChange={(e) => setFormData({...formData, flatDiscountAmount: e.target.value})}
                    required={formData.discountType === 'flat'} 
                    min="1"
                  />
                </div>
              )}

              {couponMode === 'purchase' && (
                <div className="mb-3">
                  <label className="form-label fs-7 fw-semibold">Minimum Purchase Amount (₹)</label>
                  <input 
                    type="number" 
                    className="form-control bg-light border-0" 
                    value={formData.minPurchaseAmount} 
                    onChange={(e) => setFormData({...formData, minPurchaseAmount: e.target.value})}
                    placeholder="0 (No minimum)"
                    min="0"
                    required
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="form-label fs-7 fw-semibold">Expiry Date</label>
                <input 
                  type="date" 
                  className="form-control bg-light border-0" 
                  value={formData.expiryDate} 
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  required 
                />
              </div>

              {couponMode === 'product' && (
                <>
                  <div className="mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <input 
                        type="checkbox" 
                        className="force-round-checkbox" 
                        id="isComboCheck"
                        checked={formData.isCombo}
                        onChange={(e) => setFormData({...formData, isCombo: e.target.checked})}
                      />
                      <label className="form-check-label fs-7 fw-semibold cursor-pointer m-0 mt-1" htmlFor="isComboCheck">
                        Is this a Combo Coupon?
                      </label>
                    </div>
                    <div className="form-text fs-8 text-muted mt-1 ms-4">If checked, customer must have ALL selected products below in their cart to use this coupon. Minimum 2 products required.</div>
                  </div>

                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                      <label className="form-label fs-7 fw-semibold mb-0">Applicable Products</label>
                      <div className="d-flex align-items-center gap-2 m-0 p-0 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="force-round-checkbox" 
                          id="selectAllProducts"
                          checked={products.length > 0 && formData.applicableProducts.length === products.length}
                          onChange={handleSelectAllProducts}
                        />
                        <label className="form-check-label fs-8 fw-bold text-brand cursor-pointer m-0 mt-1" htmlFor="selectAllProducts">
                          Select All
                        </label>
                      </div>
                    </div>
                    
                    <div 
                      className="bg-white rounded border p-2" 
                      style={{ height: '220px', overflowY: 'auto' }}
                    >
                      {products.length === 0 ? (
                        <div className="text-muted fs-8 text-center mt-4">Loading products...</div>
                      ) : (
                        <div className="d-flex flex-column gap-1">
                          {products.map(product => (
                            <label 
                              key={product._id} 
                              className="d-flex align-items-center p-2 rounded cursor-pointer"
                              style={{
                                backgroundColor: formData.applicableProducts.includes(product._id) ? '#f0f9ff' : 'transparent',
                                transition: 'background-color 0.2s',
                                border: formData.applicableProducts.includes(product._id) ? '1px solid #bae6fd' : '1px solid transparent'
                              }}
                            >
                              <input 
                                type="checkbox" 
                                className="force-round-checkbox me-3 mt-1" 
                                checked={formData.applicableProducts.includes(product._id)}
                                onChange={(e) => handleProductCheckboxChange(product._id, e.target.checked)}
                              />
                              <div className="d-flex justify-content-between w-100 align-items-center mt-1">
                                <span className="fs-8 fw-medium text-dark text-truncate" style={{ maxWidth: '75%' }}>{product.name}</span>
                                <span className="fs-8 text-muted fw-bold">₹{product.price}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    {formData.applicableProducts.length === 0 && (
                      <div className="text-danger fs-8 mt-1 px-1">Please select at least one product.</div>
                    )}
                  </div>
                </>
              )}

              <button type="submit" className="btn btn-brand w-100 py-2 fw-semibold" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Coupon'}
              </button>
            </form>
          </div>
        </div>

        {/* Coupon List */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <Tag size={20} className="text-info" /> Active Coupons
            </h5>

            {coupons.length === 0 ? (
              <div className="text-center py-5">
                <AlertCircle size={48} className="text-muted mb-3 opacity-50" />
                <h6 className="fw-bold">No coupons found</h6>
                <p className="text-muted fs-7">Create your first product-specific coupon from the form.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle fs-7">
                  <thead className="table-light text-muted">
                    <tr>
                      <th className="fw-semibold rounded-start">Code</th>
                      <th className="fw-semibold">Discount</th>
                      <th className="fw-semibold">Applicable Products</th>
                      <th className="fw-semibold">Expiry</th>
                      <th className="fw-semibold rounded-end text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon) => (
                      <tr key={coupon._id}>
                        <td>
                          <span className="badge bg-dark px-2 py-1 fs-8 font-monospace">{coupon.code}</span>
                          {coupon.isCombo && <span className="badge bg-primary ms-2 px-2 py-1 fs-8">COMBO</span>}
                        </td>
                        <td>
                          <div className="fw-bold text-success">
                            {coupon.discountType === 'flat' ? `₹${coupon.flatDiscountAmount} OFF` : `${coupon.discountPercentage}% OFF`}
                          </div>
                          {coupon.minPurchaseAmount > 0 && (
                            <small className="text-muted fs-8 d-block mt-1">Min ₹{coupon.minPurchaseAmount}</small>
                          )}
                        </td>
                        <td style={{ maxWidth: '200px' }}>
                          {coupon.applicableProducts && coupon.applicableProducts.length > 0 ? (
                            <button 
                              className="btn btn-sm btn-outline-dark fs-8 py-1 fw-medium"
                              onClick={() => setViewingProducts(coupon)}
                            >
                              View ({coupon.applicableProducts.length})
                            </button>
                          ) : (
                            <span className="text-muted fst-italic">All Products</span>
                          )}
                        </td>
                        <td>{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                        <td className="text-end">
                          <button 
                            className="btn btn-sm btn-light text-danger hover-light-red"
                            onClick={() => handleDelete(coupon._id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Applicable Products Modal */}
      {viewingProducts && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">
                  Applicable Products for <span className="font-monospace fs-6">{viewingProducts.code}</span>
                </h5>
                <button type="button" className="btn-close shadow-none" onClick={() => setViewingProducts(null)}></button>
              </div>
              <div className="modal-body">
                <div className="d-flex flex-column gap-2">
                  {viewingProducts.applicableProducts.map(p => (
                    <div key={p._id} className="p-2 border rounded bg-light fs-7 d-flex justify-content-between align-items-center">
                      <span className="fw-medium text-dark">{p.name}</span>
                      <span className="text-muted fw-bold">₹{p.price}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn btn-light rounded px-4" onClick={() => setViewingProducts(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
