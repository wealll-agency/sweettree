'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '../../../utils/axiosConfig';
import { useNotification } from '../../../context/NotificationContext';
import { 
  Plus, Edit, Trash2, Copy, Search, ArrowLeft, Gift, 
  Megaphone, Check, Sparkles, Layers, ChevronRight, Sliders, Volume2, Bell, ToggleLeft, ToggleRight, Eye
} from 'lucide-react';

export default function PromotionManagerPage() {
  const [selectedSection, setSelectedSection] = useState(null); // null = overview dashboard
  const { showAlert, showConfirm } = useNotification();

  // Combo Manager States
  const [combos, setCombos] = useState([]);
  const [loadingCombos, setLoadingCombos] = useState(true);
  const [comboSearch, setComboSearch] = useState('');

  // Sliding Notification Ticker States
  const [tickerConfig, setTickerConfig] = useState({
    enabled: true,
    text: '|| 🥜 Sweettree Anmol Jumbo Nuts - Extra 10% OFF! 🥜 || 🎁 Nuts For Savings 🎁 || 🔥 PayDay Sale Is LIVE - Extra 15% OFF Sitewide! 🔥 ||',
    speed: 5
  });
  const [savingTicker, setSavingTicker] = useState(false);

  // Popup Manager States
  const [popups, setPopups] = useState([]);
  const [loadingPopups, setLoadingPopups] = useState(false);
  const [popupForm, setPopupForm] = useState(null); // null=closed, {}=create, {_id}=edit
  const [popupProducts, setPopupProducts] = useState([]);
  const [popupCombos, setPopupCombos] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingPopup, setSavingPopup] = useState(false);
  const [previewPopup, setPreviewPopup] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    fetchCombos();
    fetchSettings();
  }, []);

  // Fetch popups when section selected
  useEffect(() => {
    if (selectedSection === 'popups') {
      fetchPopups();
      fetchPopupProducts();
      fetchPopupCombos();
    }
  }, [selectedSection]);

  const fetchCombos = async () => {
    try {
      setLoadingCombos(true);
      const res = await api.get('/combos/admin/all');
      if (res.data.success) {
        setCombos(res.data.combos);
      }
    } catch (error) {
      showAlert('Failed to fetch combos', 'danger');
    } finally {
      setLoadingCombos(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get('/auth/settings');
      if (res.data.success && res.data.settings?.slidingNotification) {
        setTickerConfig(res.data.settings.slidingNotification);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  // Combo Actions
  const handleDeleteCombo = async (id) => {
    const confirmed = await showConfirm(
      'Are you sure you want to archive this combo? This will remove it from the store but preserve historical order records.'
    );
    if (confirmed) {
      try {
        const res = await api.delete(`/combos/admin/${id}`);
        if (res.data.success) {
          showAlert('Combo archived successfully', 'success');
          fetchCombos();
        }
      } catch (error) {
        showAlert('Failed to archive combo', 'danger');
      }
    }
  };

  const handleDuplicateCombo = async (id) => {
    try {
      const res = await api.post(`/combos/admin/${id}/duplicate`);
      if (res.data.success) {
        showAlert('Combo duplicated successfully. Status is Draft.', 'success');
        fetchCombos();
      }
    } catch (error) {
      showAlert('Failed to duplicate combo', 'danger');
    }
  };

  // ─── Popup Manager Functions ────────────────────────────────
  const fetchPopups = async () => {
    try {
      setLoadingPopups(true);
      const res = await api.get('/promotional-popups');
      if (res.data.success) setPopups(res.data.popups);
    } catch { showAlert('Failed to load popups', 'danger'); }
    finally { setLoadingPopups(false); }
  };

  const fetchPopupProducts = async () => {
    try {
      const res = await api.get('/products?limit=200&isActive=true');
      if (res.data.success) setPopupProducts(res.data.products || []);
    } catch {}
  };

  const fetchPopupCombos = async () => {
    try {
      const res = await api.get('/combos/admin/all');
      if (res.data.success) setPopupCombos((res.data.combos || []).filter(c => c.status !== 'Archived'));
    } catch {}
  };

  const openCreatePopup = () => setPopupForm({
    title: '', subtitle: '', badgeText: '🎁 SURPRISE', image: '',
    popupType: 'product', productRef: '', comboRef: '',
    benefits: [''], promoMessage: '', ctaText: 'Add to Cart',
    viewMoreText: 'View More', isActive: false,
    priority: 0, displayDelayMs: 1500, displayOncePerSession: true,
    startDate: '', endDate: ''
  });

  const openEditPopup = (p) => setPopupForm({
    _id: p._id,
    title: p.title || '',
    subtitle: p.subtitle || '',
    badgeText: p.badgeText || '🎁 SURPRISE',
    image: p.image || '',
    popupType: p.popupType || 'product',
    productRef: p.productRef?._id || p.productRef || '',
    comboRef: p.comboRef?._id || p.comboRef || '',
    benefits: p.benefits?.length ? [...p.benefits] : [''],
    promoMessage: p.promoMessage || '',
    ctaText: p.ctaText || 'Add to Cart',
    viewMoreText: p.viewMoreText || 'View More',
    isActive: Boolean(p.isActive),
    priority: p.priority || 0,
    displayDelayMs: p.displayDelayMs ?? 1500,
    displayOncePerSession: p.displayOncePerSession !== false,
    startDate: p.startDate ? p.startDate.split('T')[0] : '',
    endDate: p.endDate ? p.endDate.split('T')[0] : ''
  });

  const handlePopupImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showAlert('Only JPG, PNG, or WebP images are allowed', 'warning'); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showAlert('Image must be under 5MB', 'warning'); return;
    }
    try {
      setUploadingImage(true);
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/uploads', fd);
      if (res.data.success) setPopupForm(prev => ({ ...prev, image: res.data.url }));
    } catch { showAlert('Image upload failed', 'danger'); }
    finally { setUploadingImage(false); }
  };

  const handlePopupBenefitChange = (idx, val) => {
    const updated = [...popupForm.benefits];
    updated[idx] = val;
    setPopupForm(prev => ({ ...prev, benefits: updated }));
  };

  const handleSavePopup = async (e) => {
    e.preventDefault();
    if (!popupForm.title.trim()) { showAlert('Title is required', 'warning'); return; }
    if (!popupForm.image) { showAlert('Please upload a popup image', 'warning'); return; }
    if (popupForm.popupType === 'product' && !popupForm.productRef) { showAlert('Please select a product', 'warning'); return; }
    if (popupForm.popupType === 'combo' && !popupForm.comboRef) { showAlert('Please select a combo', 'warning'); return; }
    try {
      setSavingPopup(true);
      const payload = {
        ...popupForm,
        benefits: popupForm.benefits.filter(b => b.trim()),
        startDate: popupForm.startDate || null,
        endDate: popupForm.endDate || null
      };
      let res;
      if (popupForm._id) {
        res = await api.put(`/promotional-popups/${popupForm._id}`, payload);
      } else {
        res = await api.post('/promotional-popups', payload);
      }
      if (res.data.success) {
        showAlert(popupForm._id ? 'Popup updated!' : 'Popup created!', 'success');
        setPopupForm(null);
        fetchPopups();
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to save popup', 'danger');
    } finally { setSavingPopup(false); }
  };

  const handleTogglePopup = async (p) => {
    try {
      await api.put(`/promotional-popups/${p._id}`, { isActive: !p.isActive });
      fetchPopups();
    } catch { showAlert('Failed to update popup status', 'danger'); }
  };

  const handleDeletePopup = async (id) => {
    const confirmed = await showConfirm('Are you sure you want to delete this promotional popup? This cannot be undone.');
    if (!confirmed) return;
    try {
      await api.delete(`/promotional-popups/${id}`);
      showAlert('Popup deleted', 'success');
      fetchPopups();
    } catch { showAlert('Failed to delete popup', 'danger'); }
  };

  // Save Sliding Marquee Notification Ticker
  const handleSaveTicker = async (e) => {
    e.preventDefault();
    try {
      setSavingTicker(true);
      const res = await api.put('/auth/settings', {
        settings: {
          slidingNotification: tickerConfig
        }
      });
      if (res.data.success) {
        try {
          localStorage.setItem('sweettree_sliding_ticker', JSON.stringify(tickerConfig));
        } catch {}
        showAlert('Sliding notification ticker updated successfully!', 'success');
      }
    } catch (error) {
      showAlert('Failed to save sliding notification ticker', 'danger');
    } finally {
      setSavingTicker(false);
    }
  };

  const filteredCombos = combos.filter(c => 
    c.status !== 'Archived' &&
    (c.name.toLowerCase().includes(comboSearch.toLowerCase()) || 
    c.sku.toLowerCase().includes(comboSearch.toLowerCase()))
  );

  return (
    <div className="container-fluid py-4 px-lg-5 animate-fade-in" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      
      {/* Overview Dashboard Selector (When no section is selected) */}
      {!selectedSection ? (
        <>
          <div className="mb-4 bg-white p-4 rounded-4 shadow-sm border border-light">
            <div className="d-flex align-items-center gap-3 mb-2">
              <div className="p-3 rounded-3" style={{ backgroundColor: '#fff3e0', color: '#e65100' }}>
                <Megaphone size={28} />
              </div>
              <div>
                <h3 className="fw-bold mb-1" style={{ color: '#162C18' }}>Promotion & Campaign Manager</h3>
            <p className="text-muted mb-0 fs-7">Select an option below to manage combo offer packs, promotional popups, or update the live sliding notification ticker.</p>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Card 1: Combo Packs & Bundles */}
            <div className="col-md-6">
              <div 
                className="card h-100 border-0 shadow-sm rounded-4 cursor-pointer overflow-hidden transition-all hover-shadow"
                onClick={() => setSelectedSection('combos')}
                style={{ borderTop: '4px solid #e65100', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
              >
                <div className="card-body p-4 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="p-3 rounded-3" style={{ backgroundColor: '#fff3e0', color: '#e65100' }}>
                        <Gift size={26} />
                      </div>
                      <span className="badge px-3 py-2 rounded-pill fs-8 fw-semibold" style={{ backgroundColor: '#fff3e0', color: '#e65100', border: '1px solid #ffcc80' }}>
                        {combos.filter(c => c.status !== 'Archived').length} Combos Active
                      </span>
                    </div>
                    <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '20px' }}>Combo Packs & Bundles</h5>
                    <p className="text-muted fs-7 mb-4" style={{ minHeight: '42px', lineHeight: '1.5' }}>
                      Create and manage bundled products, set custom combo prices, select component items, and toggle store visibility.
                    </p>
                  </div>

                  <div className="pt-3 border-top d-flex align-items-center justify-content-between">
                    <span className="fw-semibold fs-7" style={{ color: '#e65100' }}>Manage Combo Packs</span>
                    <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#fff3e0', color: '#e65100' }}>
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Sliding Marquee Notification Bar */}
            <div className="col-md-6">
              <div 
                className="card h-100 border-0 shadow-sm rounded-4 cursor-pointer overflow-hidden transition-all hover-shadow"
                onClick={() => setSelectedSection('sliding')}
                style={{ borderTop: '4px solid #2e7d32', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
              >
                <div className="card-body p-4 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="p-3 rounded-3" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
                        <Megaphone size={26} />
                      </div>
                      <span className={`badge px-3 py-2 rounded-pill fs-8 fw-semibold ${tickerConfig.enabled !== false ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary-subtle text-secondary'}`}>
                        {tickerConfig.enabled !== false ? '● Live Running' : 'Disabled'}
                      </span>
                    </div>
                    <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '20px' }}>Sliding Marquee Notification Bar</h5>
                    <p className="text-muted fs-7 mb-4" style={{ minHeight: '42px', lineHeight: '1.5' }}>
                      Update the live right-to-left sliding ticker message displayed below the website header bar across all customer pages.
                    </p>
                  </div>

                  <div className="pt-3 border-top d-flex align-items-center justify-content-between">
                    <span className="fw-semibold fs-7" style={{ color: '#2e7d32' }}>Update Sliding Ticker</span>
                    <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Promotional Popups */}
            <div className="col-md-6">
              <div 
                className="card h-100 border-0 shadow-sm rounded-4 cursor-pointer overflow-hidden"
                onClick={() => setSelectedSection('popups')}
                style={{ borderTop: '4px solid #1565c0', transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'pointer' }}
              >
                <div className="card-body p-4 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="p-3 rounded-3" style={{ backgroundColor: '#e3f2fd', color: '#1565c0' }}>
                        <Bell size={26} />
                      </div>
                      <span className="badge px-3 py-2 rounded-pill fs-8 fw-semibold" style={{ backgroundColor: '#e3f2fd', color: '#1565c0', border: '1px solid #90caf9' }}>
                        {popups.filter(p => p.isActive).length} Active
                      </span>
                    </div>
                    <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '20px' }}>Promotional Popups</h5>
                    <p className="text-muted fs-7 mb-4" style={{ minHeight: '42px', lineHeight: '1.5' }}>
                      Create and manage surprise promotional popups shown to customers on page load. Attach products or combos with full display controls.
                    </p>
                  </div>
                  <div className="pt-3 border-top d-flex align-items-center justify-content-between">
                    <span className="fw-semibold fs-7" style={{ color: '#1565c0' }}>Manage Popups</span>
                    <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#e3f2fd', color: '#1565c0' }}>
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : selectedSection === 'combos' ? (
        /* Sub-View 1: Combo Packs & Bundles Manager */
        <>
          <div className="mb-4 bg-white p-4 rounded-4 shadow-sm border border-light">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-3">
                <button 
                  className="btn btn-outline-secondary rounded-pill px-3 py-2 d-flex align-items-center gap-2 fs-7 fw-semibold"
                  onClick={() => setSelectedSection(null)}
                >
                  <ArrowLeft size={16} /> Back to Promotion Manager
                </button>
                <div>
                  <h4 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
                    <Gift size={22} color="#e65100" />
                    Combo Packs & Bundles Management
                  </h4>
                  <small className="text-muted fs-7">Create, edit, duplicate, and organize bundled product offers.</small>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3">
                <select 
                  className="form-select form-select-sm rounded-3 fw-semibold border-secondary-subtle"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  style={{ minWidth: '220px' }}
                >
                  <option value="combos">🎁 Combo Packs & Bundles</option>
                  <option value="sliding">📢 Sliding Marquee Ticker</option>
                </select>
                <Link href="/admin/combos/create" className="btn btn-brand d-flex align-items-center gap-2 px-3 py-2 text-nowrap">
                  <Plus size={18} /> Create Combo
                </Link>
              </div>
            </div>
          </div>

          <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-4 bg-white">
            <div className="card-body p-0">
              <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
                <div className="position-relative" style={{ maxWidth: '350px', width: '100%' }}>
                  <Search className="position-absolute text-muted" size={16} style={{ top: '10px', left: '16px' }} />
                  <input
                    type="text"
                    className="form-control form-control-sm ps-5 rounded-pill"
                    value={comboSearch}
                    onChange={e => setComboSearch(e.target.value)}
                  />
                  {!comboSearch && (
                    <span className="position-absolute text-muted" style={{ top: '9px', left: '44px', fontSize: '0.875rem', pointerEvents: 'none' }}>
                      Search combos by name or SKU...
                    </span>
                  )}
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle m-0">
                  <thead className="table-light" style={{ borderBottom: '1px solid #dee2e6' }}>
                    <tr>
                      <th className="py-3 px-4 text-muted fw-bold" style={{ fontSize: '0.9rem' }}>Image</th>
                      <th className="py-3 px-4 text-muted fw-bold" style={{ fontSize: '0.9rem' }}>Name</th>
                      <th className="py-3 px-4 text-muted fw-bold" style={{ fontSize: '0.9rem' }}>SKU</th>
                      <th className="py-3 px-4 text-muted fw-bold" style={{ fontSize: '0.9rem' }}>Price</th>
                      <th className="py-3 px-4 text-muted fw-bold" style={{ fontSize: '0.9rem' }}>Components</th>
                      <th className="py-3 px-4 text-muted fw-bold" style={{ fontSize: '0.9rem' }}>Status</th>
                      <th className="py-3 px-4 text-muted fw-bold text-center" style={{ fontSize: '0.9rem', width: '150px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingCombos ? (
                      <tr>
                        <td colSpan="7" className="text-center py-5">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredCombos.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-5 text-muted fs-7">
                          No combos found. Click "+ Create Combo" to add your first combo pack.
                        </td>
                      </tr>
                    ) : (
                      filteredCombos.map(row => (
                        <tr key={row._id} style={{ fontSize: '0.9rem' }}>
                          <td className="px-4">
                            <div style={{ width: '50px', height: '50px', position: 'relative', overflow: 'hidden', borderRadius: '6px', backgroundColor: '#f8f9fa', border: '1px solid #e2e8f0' }}>
                              {row.image ? (
                                <Image src={row.image.replace('/assets/images/', '/')} alt={row.name} fill style={{ objectFit: 'contain', padding: '4px' }} sizes="50px" />
                              ) : (
                                <div className="w-100 h-100 d-flex justify-content-center align-items-center text-muted" style={{ fontSize: '10px' }}>No Img</div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 fw-bold text-dark">{row.name}</td>
                          <td className="px-4 text-muted">{row.sku}</td>
                          <td className="px-4 fw-bold text-success">₹{row.comboPrice}</td>
                          <td className="px-4">
                            <span className="badge bg-secondary">{row.components?.length || 0} Items</span>
                          </td>
                          <td className="px-4">
                            <span className={`badge ${
                              row.status === 'Active' ? 'bg-success' : 
                              row.status === 'Draft' ? 'bg-warning text-dark' : 'bg-danger'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="px-4 text-center">
                            <div className="d-inline-flex gap-2">
                              <Link href={`/admin/combos/${row._id}`} className="btn btn-sm btn-outline-primary py-1 px-2" title="Edit">
                                <Edit size={14} />
                              </Link>
                              <button onClick={() => handleDuplicateCombo(row._id)} className="btn btn-sm btn-outline-secondary py-1 px-2" title="Duplicate">
                                <Copy size={14} />
                              </button>
                              <button onClick={() => handleDeleteCombo(row._id)} className="btn btn-sm btn-outline-danger py-1 px-2" title="Archive" disabled={row.status === 'Archived'}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : selectedSection === 'sliding' ? (
        /* Sub-View 2: Sliding Marquee Notification Ticker Editor */
        <>
          <div className="mb-4 bg-white p-4 rounded-4 shadow-sm border border-light">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-3">
                <button 
                  className="btn btn-outline-secondary rounded-pill px-3 py-2 d-flex align-items-center gap-2 fs-7 fw-semibold"
                  onClick={() => setSelectedSection(null)}
                >
                  <ArrowLeft size={16} /> Back to Promotion Manager
                </button>
                <div>
                  <h4 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
                    <Megaphone size={22} color="#2e7d32" />
                    Sliding Marquee Notification Ticker
                  </h4>
                  <small className="text-muted fs-7">Configure the live right-to-left moving text announcement displayed below the header.</small>
                </div>
              </div>

              <select 
                className="form-select form-select-sm rounded-3 fw-semibold border-secondary-subtle"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                style={{ minWidth: '220px' }}
              >
                <option value="combos">🎁 Combo Packs & Bundles</option>
                <option value="sliding">📢 Sliding Marquee Ticker</option>
              </select>
            </div>
          </div>

          {/* Live Marquee Ticker Preview Box */}
          <div className="card border-0 shadow-sm rounded-4 bg-white mb-4 overflow-hidden">
            <div className="card-header bg-white p-4 border-bottom">
              <h6 className="fw-bold m-0 text-dark fs-6 d-flex align-items-center gap-2">
                <Sparkles size={16} style={{ color: '#2e7d32' }} /> LIVE WEBSITE PREVIEW
              </h6>
            </div>
            <div className="card-body p-4 bg-light">
              {tickerConfig.enabled ? (
                <div 
                  className="marquee-wrapper rounded-3 py-2 px-3 shadow-2xs overflow-hidden" 
                  style={{ backgroundColor: tickerConfig.backgroundColor || '#162C18', color: tickerConfig.textColor || '#FAF9F6', fontWeight: '500' }}
                >
                  <marquee 
                    key={`preview-marquee-${tickerConfig.speed}-${tickerConfig.text}`}
                    behavior="scroll" 
                    direction="left" 
                    scrollamount={tickerConfig.speed || 5}
                  >
                    {tickerConfig.text || 'No text set for sliding notification ticker'}
                  </marquee>
                </div>
              ) : (
                <div className="p-3 bg-secondary-subtle text-secondary rounded-3 text-center fs-7 fw-semibold">
                  ⚠ Sliding Notification Ticker is currently DISABLED.
                </div>
              )}
            </div>
          </div>

          {/* Ticker Settings Form */}
          <form onSubmit={handleSaveTicker}>
            <div className="card border-0 shadow-sm rounded-4 bg-white mb-4">
              <div className="card-header bg-white p-4 border-bottom d-flex justify-content-between align-items-center">
                <h6 className="fw-bold m-0 text-dark fs-6">Ticker Announcement Settings</h6>
                <button 
                  type="submit" 
                  disabled={savingTicker}
                  className="btn px-4 py-2 fw-semibold rounded-3 shadow-2xs d-flex align-items-center gap-2" 
                  style={{ backgroundColor: '#2e7d32', color: '#ffffff', border: 'none' }}
                >
                  <Check size={16} /> {savingTicker ? 'Saving...' : 'Save Sliding Notification'}
                </button>
              </div>

              <div className="card-body p-4">
                <div className="row g-4">
                  {/* Active Toggle Switch */}
                  <div className="col-12">
                    <div className="p-3 rounded-3 bg-light d-flex align-items-center justify-content-between border">
                      <div>
                        <h6 className="fw-bold m-0 text-dark fs-7">Enable Sliding Marquee Ticker</h6>
                        <small className="text-muted fs-8">Turn on/off the moving notification bar on customer pages.</small>
                      </div>
                      <div className="form-check form-switch fs-4">
                        <input 
                          className="form-check-input cursor-pointer" 
                          type="checkbox" 
                          checked={tickerConfig.enabled !== false} 
                          onChange={(e) => setTickerConfig({ ...tickerConfig, enabled: e.target.checked })} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Marquee Text */}
                  <div className="col-12">
                    <label className="fw-semibold mb-2 fs-7 text-dark">
                      Sliding Ticker Announcement Text
                    </label>
                    <textarea 
                      className="form-control rounded-3 fs-6 p-3" 
                      rows={3} 
                      value={tickerConfig.text || ''} 
                      onChange={(e) => setTickerConfig({ ...tickerConfig, text: e.target.value })} 
                      required 
                      style={{ border: '1px solid #ced4da' }}
                    />
                    <small className="text-muted fs-8 mt-1 d-block">
                      Tip: Use symbols like <code className="text-success">|| 🥜 🎁 🔥 ⚡</code> to separate different offer messages cleanly.
                    </small>
                  </div>

                  {/* Colors */}
                  <div className="col-12 col-md-6">
                    <label className="fw-semibold mb-2 fs-7 text-dark">Background Color</label>
                    <div className="d-flex align-items-center gap-3">
                      <input 
                        type="color" 
                        className="form-control form-control-color" 
                        value={tickerConfig.backgroundColor || '#162C18'} 
                        onChange={(e) => setTickerConfig({ ...tickerConfig, backgroundColor: e.target.value })}
                        title="Choose background color"
                      />
                      <input 
                        type="text" 
                        className="form-control" 
                        value={tickerConfig.backgroundColor || '#162C18'} 
                        onChange={(e) => setTickerConfig({ ...tickerConfig, backgroundColor: e.target.value })}
                        placeholder="#162C18"
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="fw-semibold mb-2 fs-7 text-dark">Text Color</label>
                    <div className="d-flex align-items-center gap-3">
                      <input 
                        type="color" 
                        className="form-control form-control-color" 
                        value={tickerConfig.textColor || '#FAF9F6'} 
                        onChange={(e) => setTickerConfig({ ...tickerConfig, textColor: e.target.value })}
                        title="Choose text color"
                      />
                      <input 
                        type="text" 
                        className="form-control" 
                        value={tickerConfig.textColor || '#FAF9F6'} 
                        onChange={(e) => setTickerConfig({ ...tickerConfig, textColor: e.target.value })}
                        placeholder="#FAF9F6"
                      />
                    </div>
                  </div>

                  {/* Scroll Speed Interactive Range Slider */}
                  <div className="col-12">
                    <div className="p-3 rounded-3 border bg-light">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <label className="fw-semibold fs-7 text-dark m-0 d-flex align-items-center gap-2">
                          <Sliders size={16} style={{ color: '#2e7d32' }} /> Marquee Scroll Speed Slider
                        </label>
                        <span className="badge px-3 py-2 rounded-pill fs-7 fw-bold shadow-2xs" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', border: '1px solid #a5d6a7' }}>
                          Speed: {tickerConfig.speed || 5} ({
                            (tickerConfig.speed || 5) <= 4 ? 'Slow' :
                            (tickerConfig.speed || 5) <= 8 ? 'Normal (Recommended)' :
                            (tickerConfig.speed || 5) <= 14 ? 'Fast' : 'Extra Fast'
                          })
                        </span>
                      </div>
                      {(() => {
                        const currentSpeed = tickerConfig.speed || 5;
                        const fillPercent = ((currentSpeed - 1) / 19) * 100;
                        return (
                          <input 
                            type="range" 
                            className="form-range w-100" 
                            min="1" 
                            max="20" 
                            step="1" 
                            value={currentSpeed} 
                            onChange={(e) => setTickerConfig({ ...tickerConfig, speed: Number(e.target.value) })} 
                            style={{ 
                              width: '100%', 
                              height: '10px', 
                              borderRadius: '5px', 
                              backgroundColor: '#cbd5e1', 
                              backgroundImage: `linear-gradient(to right, #2e7d32 0%, #2e7d32 ${fillPercent}%, #cbd5e1 ${fillPercent}%, #cbd5e1 100%)`, 
                              cursor: 'pointer',
                              accentColor: '#2e7d32'
                            }}
                          />
                        );
                      })()}
                      <div className="d-flex justify-content-between fs-8 text-muted mt-2 fw-semibold">
                        <span>1 (Slowest)</span>
                        <span>5 (Normal)</span>
                        <span>10 (Fast)</span>
                        <span>15 (Extra Fast)</span>
                        <span>20 (Lightning)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </>
      ) : selectedSection === 'popups' ? (
        /* Sub-View 3: Promotional Popups Manager */
        <>
          {/* Header */}
          <div className="mb-4 bg-white p-4 rounded-4 shadow-sm border border-light">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-3">
                <button className="btn btn-outline-secondary rounded-pill px-3 py-2 d-flex align-items-center gap-2 fs-7 fw-semibold" onClick={() => { setSelectedSection(null); setPopupForm(null); setPreviewPopup(null); }}>
                  <ArrowLeft size={16} /> Back to Promotion Manager
                </button>
                <div>
                  <h4 className="fw-bold m-0 text-dark d-flex align-items-center gap-2"><Bell size={22} color="#1565c0" /> Promotional Popups</h4>
                  <small className="text-muted fs-7">Create and manage surprise promotional popups for your customers.</small>
                </div>
              </div>
              {!popupForm && (
                <button className="btn btn-brand d-flex align-items-center gap-2 px-3 py-2" onClick={openCreatePopup}>
                  <Plus size={18} /> Create Popup
                </button>
              )}
            </div>
          </div>

          {/* CREATE / EDIT FORM */}
          {popupForm && (
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-header bg-white border-bottom px-4 py-3 rounded-top-4">
                <h5 className="fw-bold m-0" style={{ color: '#1565c0' }}>{popupForm._id ? '✏️ Edit Popup' : '✨ Create New Popup'}</h5>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSavePopup}>
                  <div className="row g-3">

                    {/* Basic Info */}
                    <div className="col-12"><h6 className="fw-bold text-muted text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>Basic Information</h6></div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Title <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" maxLength={80} value={popupForm.title} onChange={e => setPopupForm(p => ({ ...p, title: e.target.value }))} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Subtitle</label>
                      <input type="text" className="form-control" maxLength={160} value={popupForm.subtitle} onChange={e => setPopupForm(p => ({ ...p, subtitle: e.target.value }))} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Badge Text</label>
                      <input type="text" className="form-control" maxLength={30} value={popupForm.badgeText} onChange={e => setPopupForm(p => ({ ...p, badgeText: e.target.value }))} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>CTA Button Text</label>
                      <input type="text" className="form-control" maxLength={30} value={popupForm.ctaText} onChange={e => setPopupForm(p => ({ ...p, ctaText: e.target.value }))} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>View More Text</label>
                      <input type="text" className="form-control" maxLength={30} value={popupForm.viewMoreText} onChange={e => setPopupForm(p => ({ ...p, viewMoreText: e.target.value }))} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Promotional Message (shown in green box)</label>
                      <input type="text" className="form-control" maxLength={200} value={popupForm.promoMessage} onChange={e => setPopupForm(p => ({ ...p, promoMessage: e.target.value }))} />
                    </div>

                    {/* Image Upload */}
                    <div className="col-12"><hr className="my-1" /><h6 className="fw-bold text-muted text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>Popup Image</h6></div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Image <span className="text-danger">*</span> <span className="text-muted fw-normal">(JPG/PNG/WebP, max 5MB, recommended 480×360px)</span></label>
                      <div className="d-flex align-items-center gap-2">
                        <input type="file" className="form-control" accept="image/jpeg,image/png,image/webp" ref={fileInputRef} onChange={handlePopupImageUpload} disabled={uploadingImage} />
                        {uploadingImage && <span className="spinner-border spinner-border-sm text-primary" />}
                      </div>
                    </div>
                    {popupForm.image && (
                      <div className="col-md-6">
                        <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Image Preview</label>
                        <div style={{ width: '120px', height: '90px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb', position: 'relative' }}>
                          <Image src={popupForm.image.startsWith('http') || popupForm.image.startsWith('/') ? popupForm.image : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api','') : ''}${popupForm.image}`} alt="Preview" fill style={{ objectFit: 'cover' }} />
                        </div>
                      </div>
                    )}

                    {/* Product / Combo */}
                    <div className="col-12"><hr className="my-1" /><h6 className="fw-bold text-muted text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>Product / Combo</h6></div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Popup Type <span className="text-danger">*</span></label>
                      <select className="form-select" value={popupForm.popupType} onChange={e => setPopupForm(p => ({ ...p, popupType: e.target.value, productRef: '', comboRef: '' }))}>
                        <option value="product">Product</option>
                        <option value="combo">Combo</option>
                      </select>
                    </div>
                    {popupForm.popupType === 'product' ? (
                      <div className="col-md-8">
                        <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Select Product <span className="text-danger">*</span></label>
                        <select className="form-select" value={popupForm.productRef} onChange={e => setPopupForm(p => ({ ...p, productRef: e.target.value }))}>
                          <option value="">— Choose a product —</option>
                          {popupProducts.map(pr => <option key={pr._id} value={pr._id}>{pr.name} (₹{pr.price})</option>)}
                        </select>
                      </div>
                    ) : (
                      <div className="col-md-8">
                        <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Select Combo <span className="text-danger">*</span></label>
                        <select className="form-select" value={popupForm.comboRef} onChange={e => setPopupForm(p => ({ ...p, comboRef: e.target.value }))}>
                          <option value="">— Choose a combo —</option>
                          {popupCombos.map(c => <option key={c._id} value={c._id}>{c.name} (₹{c.comboPrice})</option>)}
                        </select>
                      </div>
                    )}

                    {/* Benefits */}
                    <div className="col-12"><hr className="my-1" /><h6 className="fw-bold text-muted text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>Benefits (max 5)</h6></div>
                    {popupForm.benefits.map((b, i) => (
                      <div key={i} className="col-md-6">
                        <div className="input-group">
                          <span className="input-group-text" style={{ fontSize: '12px', color: '#16a34a' }}>✓</span>
                          <input type="text" className="form-control" maxLength={80} value={b} onChange={e => handlePopupBenefitChange(i, e.target.value)} />
                          {popupForm.benefits.length > 1 && (
                            <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setPopupForm(p => ({ ...p, benefits: p.benefits.filter((_, idx) => idx !== i) }))}><Trash2 size={13} /></button>
                          )}
                        </div>
                      </div>
                    ))}
                    {popupForm.benefits.length < 5 && (
                      <div className="col-auto">
                        <button type="button" className="btn btn-outline-success btn-sm" onClick={() => setPopupForm(p => ({ ...p, benefits: [...p.benefits, ''] }))}><Plus size={13} /> Add Benefit</button>
                      </div>
                    )}

                    {/* Display Rules */}
                    <div className="col-12"><hr className="my-1" /><h6 className="fw-bold text-muted text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>Display Rules</h6></div>
                    <div className="col-md-3">
                      <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Priority (higher = shown first)</label>
                      <input type="number" className="form-control" min={0} max={100} value={popupForm.priority} onChange={e => setPopupForm(p => ({ ...p, priority: Number(e.target.value) }))} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Appear Delay (ms)</label>
                      <input type="number" className="form-control" min={0} max={10000} step={500} value={popupForm.displayDelayMs} onChange={e => setPopupForm(p => ({ ...p, displayDelayMs: Number(e.target.value) }))} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Start Date</label>
                      <input type="date" className="form-control" value={popupForm.startDate} onChange={e => setPopupForm(p => ({ ...p, startDate: e.target.value }))} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>End Date</label>
                      <input type="date" className="form-control" value={popupForm.endDate} onChange={e => setPopupForm(p => ({ ...p, endDate: e.target.value }))} />
                    </div>
                    <div className="col-md-6">
                      <div className="form-check form-switch mt-2">
                        <input className="form-check-input" type="checkbox" id="displayOnce" checked={popupForm.displayOncePerSession} onChange={e => setPopupForm(p => ({ ...p, displayOncePerSession: e.target.checked }))} />
                        <label className="form-check-label fw-semibold" htmlFor="displayOnce" style={{ fontSize: '13px' }}>Show only once per browser session</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-check form-switch mt-2">
                        <input className="form-check-input" type="checkbox" id="isActive" checked={popupForm.isActive} onChange={e => setPopupForm(p => ({ ...p, isActive: e.target.checked }))} />
                        <label className="form-check-label fw-semibold" htmlFor="isActive" style={{ fontSize: '13px' }}>Active (visible to customers)</label>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-12 d-flex gap-3 pt-2">
                      <button type="submit" className="btn btn-brand px-4" disabled={savingPopup}>
                        {savingPopup ? <span className="spinner-border spinner-border-sm me-2" /> : <Check size={16} className="me-2" />}
                        {popupForm._id ? 'Save Changes' : 'Create Popup'}
                      </button>
                      <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setPopupForm(null)}>Cancel</button>
                      {popupForm.image && popupForm.title && (
                        <button type="button" className="btn btn-outline-primary px-4 ms-auto" onClick={() => setPreviewPopup(popupForm)}>
                          <Eye size={15} className="me-1" /> Preview
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* POPUP LIST */}
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-0">
              {loadingPopups ? (
                <div className="p-4 text-center text-muted"><span className="spinner-border spinner-border-sm me-2" />Loading popups...</div>
              ) : popups.length === 0 ? (
                <div className="p-5 text-center text-muted">
                  <Bell size={36} className="mb-3 opacity-25" />
                  <p className="mb-2 fw-semibold">No promotional popups yet</p>
                  <p className="fs-7 mb-3">Create your first popup to surprise customers when they visit your store.</p>
                  {!popupForm && <button className="btn btn-brand" onClick={openCreatePopup}><Plus size={16} className="me-1" /> Create First Popup</button>}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="ps-4" style={{ fontSize: '12px' }}>IMAGE</th>
                        <th style={{ fontSize: '12px' }}>TITLE</th>
                        <th style={{ fontSize: '12px' }}>TYPE</th>
                        <th style={{ fontSize: '12px' }}>PRODUCT / COMBO</th>
                        <th style={{ fontSize: '12px' }}>PRIORITY</th>
                        <th style={{ fontSize: '12px' }}>STATUS</th>
                        <th style={{ fontSize: '12px' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {popups.map(p => {
                        const ref = p.popupType === 'combo' ? p.comboRef : p.productRef;
                        const imgSrc = p.image || (ref?.images?.[0]) || ref?.image || '/placeholder.png';
                        return (
                          <tr key={p._id}>
                            <td className="ps-4">
                              <div style={{ width: '56px', height: '42px', borderRadius: '6px', overflow: 'hidden', position: 'relative', backgroundColor: '#f3f4f6' }}>
                                <Image src={imgSrc.startsWith('http') || imgSrc.startsWith('/') ? imgSrc : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api','') : ''}${imgSrc}`} alt={p.title} fill style={{ objectFit: 'cover' }} />
                              </div>
                            </td>
                            <td>
                              <div className="fw-semibold" style={{ fontSize: '13px' }}>{p.title}</div>
                              {p.subtitle && <div className="text-muted" style={{ fontSize: '11px' }}>{p.subtitle}</div>}
                            </td>
                            <td><span className={`badge rounded-pill px-3 ${p.popupType === 'combo' ? 'bg-warning-subtle text-warning-emphasis' : 'bg-info-subtle text-info-emphasis'}`} style={{ fontSize: '11px' }}>{p.popupType}</span></td>
                            <td style={{ fontSize: '12px' }}>{ref?.name || <span className="text-muted">—</span>}</td>
                            <td><span className="badge bg-secondary-subtle text-secondary px-2">{p.priority}</span></td>
                            <td>
                              <button
                                className={`btn btn-sm px-3 rounded-pill ${p.isActive ? 'btn-success' : 'btn-outline-secondary'}`}
                                onClick={() => handleTogglePopup(p)}
                                title={p.isActive ? 'Click to deactivate' : 'Click to activate'}
                              >
                                {p.isActive ? '● Active' : 'Inactive'}
                              </button>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <button className="btn btn-sm btn-outline-secondary" title="Preview" onClick={() => setPreviewPopup(p)}><Eye size={14} /></button>
                                <button className="btn btn-sm btn-outline-primary" title="Edit" onClick={() => openEditPopup(p)}><Edit size={14} /></button>
                                <button className="btn btn-sm btn-outline-danger" title="Delete" onClick={() => handleDeletePopup(p._id)}><Trash2 size={14} /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* INLINE PREVIEW MODAL */}
          {previewPopup && (() => {
            const isCombo = previewPopup.popupType === 'combo';
            const ref = isCombo
              ? popupCombos.find(c => c._id === (previewPopup.comboRef?._id || previewPopup.comboRef))
              : popupProducts.find(pr => pr._id === (previewPopup.productRef?._id || previewPopup.productRef));
            const imgSrc = previewPopup.image || '';
            const displayPrice = isCombo ? ref?.comboPrice : ref?.price;
            const displayName = ref?.name || 'Product Name';
            return (
              <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setPreviewPopup(null)}>
                <div style={{ backgroundColor: '#fff', borderRadius: '20px', width: '100%', maxWidth: '440px', padding: '24px', position: 'relative', boxShadow: '0 32px 80px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
                  <button style={{ position: 'absolute', top: '12px', right: '12px', border: 'none', background: 'rgba(0,0,0,0.08)', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px' }} onClick={() => setPreviewPopup(null)}>×</button>
                  <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                    <span style={{ background: '#0A2F1D', color: '#fff', borderRadius: '30px', padding: '4px 14px', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px' }}>{previewPopup.badgeText || '🎁 SURPRISE'}</span>
                  </div>
                  <h5 style={{ textAlign: 'center', fontWeight: 800, color: '#0A2F1D', marginBottom: '4px' }}>{previewPopup.title || 'Popup Title'}</h5>
                  {previewPopup.subtitle && <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>{previewPopup.subtitle}</p>}
                  {imgSrc && (
                    <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: '12px', overflow: 'hidden', position: 'relative', backgroundColor: '#f5f5f5', marginBottom: '12px' }}>
                      <Image src={imgSrc.startsWith('http') || imgSrc.startsWith('/') ? imgSrc : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api','') : ''}${imgSrc}`} alt="Preview" fill style={{ objectFit: 'cover' }} />
                    </div>
                  )}
                  <p style={{ fontWeight: 700, fontSize: '15px', color: '#111' }}>{displayName}</p>
                  {previewPopup.benefits?.filter(b => b.trim()).map((b, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#374151', marginBottom: '3px' }}>
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>✓</span> {b}
                    </div>
                  ))}
                  {displayPrice && <div style={{ fontSize: '22px', fontWeight: 800, color: '#0A2F1D', marginTop: '10px' }}>₹{displayPrice?.toLocaleString('en-IN')}</div>}
                  {previewPopup.promoMessage && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#166534', marginTop: '8px' }}>🎉 {previewPopup.promoMessage}</div>}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                    <div style={{ background: '#0A2F1D', color: '#fff', borderRadius: '10px', padding: '11px', textAlign: 'center', fontWeight: 700, fontSize: '14px' }}>{previewPopup.ctaText || 'Add to Cart'}</div>
                    <div style={{ border: '2px solid #0A2F1D', color: '#0A2F1D', borderRadius: '10px', padding: '9px', textAlign: 'center', fontWeight: 600, fontSize: '13px' }}>{previewPopup.viewMoreText || 'View More'}</div>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '12px' }}><small className="text-muted">Admin Preview — This is how customers will see the popup</small></div>
                </div>
              </div>
            );
          })()}
        </>
      ) : null}

    </div>
  );
}
