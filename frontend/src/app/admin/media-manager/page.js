'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../utils/axiosConfig';
import { useNotification } from '../../../context/NotificationContext';
import { Trash2, Plus } from 'lucide-react';

export default function MediaManagerPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useNotification();

  // Define the sections we want to display
  const sections = [
    { 
      id: 'Hero', 
      title: 'Homepage Hero Banner', 
      subtitle: 'Recommended: 1920 × 750 px | Aspect Ratio: 1920:750 | Format: WebP / JPG / PNG', 
      expectedRatio: 1920/750, 
      recWidth: 1920, 
      recHeight: 750,
      previewClass: 'ratio-hero',
      allowMultiple: true 
    },
    { 
      id: 'Promotional', 
      title: 'Trending Now Banner', 
      subtitle: 'Recommended: 1400 × 280 px | Aspect Ratio: 5:1 | Format: WebP / JPG / PNG', 
      expectedRatio: 5/1, 
      recWidth: 1400, 
      recHeight: 280,
      previewClass: 'ratio-trending',
      allowMultiple: true 
    },
    { 
      id: 'Middle', 
      title: 'Promotional Banner', 
      subtitle: 'Recommended: 1400 × 400 px | Aspect Ratio: 7:2 | Format: WebP / JPG / PNG', 
      expectedRatio: 7/2, 
      recWidth: 1400, 
      recHeight: 400,
      previewClass: 'ratio-promo',
      allowMultiple: true 
    },
    { 
      id: 'Bottom', 
      title: 'Mobile Hero Banner', 
      subtitle: 'Recommended: 1080 × 1350 px | Aspect Ratio: 4:5 | Format: WebP / JPG / PNG', 
      expectedRatio: 4/5, 
      recWidth: 1080, 
      recHeight: 1350,
      previewClass: 'ratio-hero-mobile-portrait',
      allowMultiple: true 
    }
  ];

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await api.get('/banners?all=true');
      if (res.data.success) {
        setBanners(res.data.banners);
      }
    } catch (error) {
      showAlert('Failed to fetch banners', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e, placement, bannerId = null) => {
    const file = e.target.files[0];
    if (!file) return;

    const sectionDef = sections.find(s => s.id === placement);
    let warningMsg = null;

    // Validate dimensions on frontend before saving
    const validateDimensions = () => new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const actualRatio = img.width / img.height;
        const expectedRatio = sectionDef?.expectedRatio || 1;
        // Check if ratio deviates by more than 5%
        if (Math.abs(actualRatio - expectedRatio) / expectedRatio > 0.05) {
          warningMsg = `⚠ Warning: Uploaded image is ${img.width}x${img.height} px (${actualRatio.toFixed(2)}:1). Recommended is ${sectionDef.recWidth}x${sectionDef.recHeight} px. Image will be cropped automatically.`;
        }
        resolve();
      };
      img.onerror = resolve;
    });

    await validateDimensions();

    const form = new FormData();
    form.append('file', file); // Matches backend multer upload.single('file')
    
    try {
      const res = await api.post('/uploads', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const uploadedUrl = res.data.url || res.data.imageUrl || res.data.path || res.data;
      
      if (bannerId) {
        setBanners(prev => prev.map(b => b._id === bannerId ? { ...b, image: uploadedUrl, warning: warningMsg, isDirty: true } : b));
      } else {
        const newTempBanner = {
          _id: `temp_${Date.now()}`,
          title: `${placement} Banner`,
          image: uploadedUrl,
          warning: warningMsg,
          placement: placement,
          isActive: true,
          isDirty: true,
          isNew: true
        };
        setBanners(prev => [...prev, newTempBanner]);
      }
    } catch (error) {
      console.error('Upload Error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload image';
      showAlert(errorMessage, 'error');
    }
  };

  const handleAddEmptyRow = (placement) => {
    const newTempBanner = {
      _id: `temp_${Date.now()}`,
      title: `${placement} Banner`,
      image: '',
      placement: placement,
      isActive: true,
      isDirty: true,
      isNew: true
    };
    setBanners(prev => [...prev, newTempBanner]);
  };

  const handleRemove = async (banner) => {
    if (banner.isNew) {
      // Just remove from state
      setBanners(prev => prev.filter(b => b._id !== banner._id));
    } else {
      // Delete from database
      if (window.confirm('Are you sure you want to remove this banner?')) {
        try {
          const res = await api.delete(`/banners/${banner._id}`);
          if (res.data.success) {
            setBanners(prev => prev.filter(b => b._id !== banner._id));
            showAlert('Banner removed successfully', 'success');
          }
        } catch (error) {
          showAlert('Failed to remove banner', 'error');
        }
      }
    }
  };

  const handleSaveSection = async (placement) => {
    const sectionBanners = banners.filter(b => b.placement === placement && b.isDirty);
    
    if (sectionBanners.length === 0) {
      showAlert('No changes to save in this section', 'info');
      return;
    }

    try {
      for (const banner of sectionBanners) {
        if (!banner.image) continue; // Skip empty rows

        if (banner.isNew) {
          await api.post('/banners', {
            title: banner.title,
            image: banner.image,
            placement: banner.placement,
            isActive: banner.isActive
          });
        } else {
          await api.put(`/banners/${banner._id}`, {
            title: banner.title,
            image: banner.image,
            placement: banner.placement,
            isActive: banner.isActive
          });
        }
      }
      showAlert(`${placement} section saved successfully!`, 'success');
      fetchBanners(); // Refresh from DB to clear dirty flags and temp IDs
    } catch (error) {
      showAlert(`Error saving ${placement} section`, 'error');
    }
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('/')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000';
    return `${baseUrl}${url}`;
  };

  if (loading) {
    return <div className="p-5 text-center">Loading Media Manager...</div>;
  }

  return (
    <div className="container-fluid py-4 px-lg-5 animate-fade-in" style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ color: '#162C18' }}>Media Manager</h3>
        <p className="text-muted small">Upload and manage all homepage banners, category headers, hero sliders, and promo videos.</p>
      </div>

      {sections.map(section => {
        const sectionBanners = banners.filter(b => b.placement === section.id);
        
        return (
          <div key={section.id} className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <h6 className="mb-0" style={{ fontWeight: '500', color: '#333' }}>{section.title}</h6>
                <small className="text-muted" style={{ fontSize: '11px' }}>{section.subtitle}</small>
              </div>
              <button 
                className="btn btn-sm" 
                style={{ backgroundColor: '#1A6D2D', color: 'white', fontWeight: '500', padding: '4px 16px', borderRadius: '4px' }}
                onClick={() => handleSaveSection(section.id)}
              >
                Save Section
              </button>
            </div>

            <div className="card border-0 rounded-0">
              <div className="card-body p-4">
                {sectionBanners.length === 0 ? (
                  <p className="text-muted mb-0 small">No banners added yet.</p>
                ) : (
                  sectionBanners.map((banner, idx) => (
                    <div key={banner._id} className="mb-4 pb-4 border-bottom">
                      <div className="d-flex align-items-start mb-3">
                        <div className="flex-grow-1">
                          <label className="fw-semibold mb-1" style={{ fontSize: '13px', color: '#4B5563' }}>
                            Upload Banner File <span className="text-primary ms-2" style={{fontSize: '11px'}}>(Must be exactly {section.recWidth}x{section.recHeight} px)</span>
                          </label>
                          <div className="d-flex align-items-center gap-3 mt-1">
                            <input 
                              type="file" 
                              className="form-control form-control-sm" 
                              style={{ maxWidth: '350px' }}
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, section.id, banner._id)}
                            />
                            <button 
                              className="btn btn-sm" 
                              style={{ color: '#e74c3c', border: '1px solid #e74c3c', backgroundColor: '#fff', padding: '4px 16px', fontSize: '12px', borderRadius: '4px', whiteSpace: 'nowrap' }}
                              onClick={() => handleRemove(banner)}
                            >
                              <Trash2 size={14} className="me-1" /> Remove
                            </button>
                          </div>
                          
                          {banner.warning && (
                            <div className="mt-2 p-2 rounded" style={{ backgroundColor: '#FFFBEB', color: '#B45309', fontSize: '12px', border: '1px solid #FDE68A', display: 'inline-block' }}>
                              {banner.warning}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Live Banner Preview using globals.css standardized classes */}
                      <div>
                        <label className="fw-semibold mb-1" style={{ fontSize: '12px', color: '#6B7280' }}>LIVE BANNER PREVIEW</label>
                        <div 
                          className={`banner-img-container ${section.previewClass} rounded shadow-sm`} 
                          style={{ border: '2px dashed #E5E7EB', backgroundColor: '#F9FAFB' }}
                        >
                          {banner.image ? (
                            <img src={getImageUrl(banner.image)} alt="Preview" />
                          ) : (
                            <div className="d-flex w-100 h-100 align-items-center justify-content-center text-muted" style={{ fontSize: '12px' }}>
                              No Image Provided
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {section.allowMultiple && (
                  <div className="mt-3">
                    <button 
                      className="btn btn-sm"
                      style={{ color: '#27ae60', border: '1px solid #27ae60', backgroundColor: '#fff', padding: '6px 16px', fontSize: '12px', borderRadius: '4px' }}
                      onClick={() => handleAddEmptyRow(section.id)}
                    >
                      + Upload Another {section.id === 'Hero' ? 'Slider Image' : 'Banner'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
