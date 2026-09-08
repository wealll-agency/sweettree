'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '../../../utils/axiosConfig';
import { useNotification } from '../../../context/NotificationContext';
import { 
  Plus, Edit, Trash2, Copy, Search, ArrowLeft, Gift, 
  Megaphone, Check, Sparkles, Layers, ChevronRight, Sliders, Volume2
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

  // Fetch initial data
  useEffect(() => {
    fetchCombos();
    fetchSettings();
  }, []);

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
                <p className="text-muted mb-0 fs-7">Select an option below to manage combo offer packs or update the live sliding notification ticker across the website.</p>
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
      ) : (
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
                  style={{ backgroundColor: '#162C18', color: '#FAF9F6', fontWeight: '500' }}
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
      )}

    </div>
  );
}
