'use client';

import { useState, useEffect } from 'react';
import { Shield, Save, Check, RefreshCw, AlertCircle, ShoppingBag, RotateCcw, CreditCard, X } from 'lucide-react';
import api from '../../../utils/axiosConfig.js';
import { useNotification } from '../../../context/NotificationContext.js';

export default function CustomerAccessPage() {
  const [settings, setSettings] = useState({ cod: true, refund: true, onlinePayment: true, shippingTiers: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showAlert } = useNotification();
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/auth/settings?t=${Date.now()}`);
      if (res.data.success) {
        setSettings(res.data.settings);
      }
    } catch (err) {
      console.error(err);
      showAlert(err.response?.data?.message || 'Failed to fetch global access settings.', 'danger', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleTierChange = (index, field, value) => {
    const updatedTiers = [...settings.shippingTiers];
    updatedTiers[index] = { ...updatedTiers[index], [field]: Number(value) };
    setSettings(prev => ({ ...prev, shippingTiers: updatedTiers }));
  };

  const addTier = () => {
    setSettings(prev => ({
      ...prev,
      shippingTiers: [...(prev.shippingTiers || []), { min: 0, max: 0, fee: 0 }]
    }));
  };

  const removeTier = (index) => {
    const updatedTiers = [...settings.shippingTiers];
    updatedTiers.splice(index, 1);
    setSettings(prev => ({ ...prev, shippingTiers: updatedTiers }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/auth/settings`, { settings });
      if (res.data.success) {
        showAlert('Global access settings saved successfully.', 'success', 'Settings Saved');
      }
    } catch (err) {
      console.error(err);
      showAlert(err.response?.data?.message || 'Failed to save global settings.', 'danger', 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid py-4 px-4 animate-fade-in">
      {/* Title */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-2">
          <h3 className="fw-bold m-0 text-dark display-font d-flex align-items-center gap-2">
            <span className="text-success">
              <Shield size={24} />
            </span>
            Universal Access Control
          </h3>
        </div>
        <button 
          onClick={fetchSettings}
          disabled={loading}
          className="btn btn-outline-secondary d-flex align-items-center gap-2 rounded px-3 py-2"
        >
          <RefreshCw size={16} className={loading ? 'spin-anim' : ''} />
          Reload Settings
        </button>
      </div>

      <div className="row g-4">
        {/* COD Control Card */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="rounded-4 p-3 bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h5 className="fw-bold text-dark m-0">Cash on Delivery (COD)</h5>
                  <small className="text-muted">Global Storefront Payment Option</small>
                </div>
              </div>
              <p className="text-muted fs-7 mb-4">
                Controls the availability of the Cash on Delivery payment option at storefront checkout. Enabling this gives all users checkout access immediately.
              </p>
            </div>
            
            <div className="d-flex align-items-center justify-content-between pt-3 border-top">
              <span className={`fw-bold fs-7 ${settings.cod ? 'text-success' : 'text-danger'}`}>
                {settings.cod ? 'Currently Enabled' : 'Currently Disabled'}
              </span>
              <div className="form-check form-switch m-0">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  role="switch" 
                  style={{ width: '2.5em', height: '1.25em', cursor: 'pointer' }}
                  checked={settings.cod}
                  disabled={loading}
                  onChange={() => handleToggle('cod')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Refund Control Card */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="rounded-4 p-3 bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center">
                  <RotateCcw size={24} />
                </div>
                <div>
                  <h5 className="fw-bold text-dark m-0">Refund & Cancellation Requests</h5>
                  <small className="text-muted">Global Storefront Customer Operations</small>
                </div>
              </div>
              <p className="text-muted fs-7 mb-4">
                Controls whether customers can request refunds or order cancellations from their account dashboard. Disabling this hides refund request options globally.
              </p>
            </div>

            <div className="d-flex align-items-center justify-content-between pt-3 border-top">
              <span className={`fw-bold fs-7 ${settings.refund ? 'text-success' : 'text-danger'}`}>
                {settings.refund ? 'Currently Enabled' : 'Currently Disabled'}
              </span>
              <div className="form-check form-switch m-0">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  role="switch" 
                  style={{ width: '2.5em', height: '1.25em', cursor: 'pointer' }}
                  checked={settings.refund}
                  disabled={loading}
                  onChange={() => handleToggle('refund')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Online Payment Control Card */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="rounded-4 p-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h5 className="fw-bold text-dark m-0">Online Transactions</h5>
                  <small className="text-muted">Global Storefront Payment Option</small>
                </div>
              </div>
              <p className="text-muted fs-7 mb-4">
                Controls the availability of Online Payment options at storefront checkout. Disabling this restricts users from paying via CCAvenue globally.
              </p>
            </div>

            <div className="d-flex align-items-center justify-content-between pt-3 border-top">
              <span className={`fw-bold fs-7 ${settings.onlinePayment ? 'text-success' : 'text-danger'}`}>
                {settings.onlinePayment ? 'Currently Enabled' : 'Currently Disabled'}
              </span>
              <div className="form-check form-switch m-0">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  role="switch" 
                  style={{ width: '2.5em', height: '1.25em', cursor: 'pointer' }}
                  checked={settings.onlinePayment}
                  disabled={loading}
                  onChange={() => handleToggle('onlinePayment')}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Tiers Configuration */}
      <div className="row g-4 mt-1">
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="rounded-4 p-3 bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h5 className="fw-bold text-dark m-0">Dynamic Shipping Tiers</h5>
                  <small className="text-muted">Configure shipping fees based on order subtotal</small>
                </div>
              </div>
              <p className="text-muted fs-7 mb-4">
                Define the shipping fee for different order value ranges. The system will automatically apply the fee based on the matching tier.
              </p>
            </div>

            <div className="pt-3 border-top">
              {settings.shippingTiers && settings.shippingTiers.map((tier, index) => (
                <div key={index} className="d-flex flex-wrap gap-3 align-items-center mb-3">
                  <div className="flex-grow-1">
                    <label className="fs-7 fw-bold mb-1">Min Value (₹)</label>
                    <input type="number" className="form-control" value={tier.min} onChange={(e) => handleTierChange(index, 'min', e.target.value)} />
                  </div>
                  <div className="flex-grow-1">
                    <label className="fs-7 fw-bold mb-1">Max Value (₹)</label>
                    <input type="number" className="form-control" value={tier.max} onChange={(e) => handleTierChange(index, 'max', e.target.value)} />
                  </div>
                  <div className="flex-grow-1">
                    <label className="fs-7 fw-bold mb-1">Shipping Fee (₹)</label>
                    <input type="number" className="form-control" value={tier.fee} onChange={(e) => handleTierChange(index, 'fee', e.target.value)} />
                  </div>
                  <div className="d-flex align-items-end mt-2 mt-md-0" style={{ paddingTop: '22px' }}>
                    <button type="button" className="btn btn-outline-danger px-3 py-2" onClick={() => removeTier(index)}>
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-outline-primary btn-sm mt-2" onClick={addTier}>
                + Add Shipping Tier
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="d-flex justify-content-end mt-4">
        <button 
          onClick={saveSettings}
          disabled={loading || saving}
          className="btn btn-brand py-2 px-5 rounded shadow-sm fw-bold d-inline-flex align-items-center gap-2"
          style={{ backgroundColor: '#162C18', color: 'white' }}
        >
          {saving ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              Saving Settings...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Access Configuration
            </>
          )}
        </button>
      </div>
    </div>
  );
}
