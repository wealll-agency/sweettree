'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Save, Plus, Trash2, Search, X, UploadCloud, Gift } from 'lucide-react';
import api from '../../../../utils/axiosConfig';
import { useNotification } from '../../../../context/NotificationContext';

export default function AdminComboCreatePage() {
  const router = useRouter();
  const { showAlert } = useNotification();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    sku: '',
    category: 'Combo',
    brand: 'Sweettree',
    comboPrice: '',
    status: 'Draft',
    isFeatured: false,
    sortOrder: 0,
    image: '',
    components: [] // { product: id, name, size, quantity, label }
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Product Search Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      handleSearch();
    }
  }, [isModalOpen]);

  const handleSearch = async () => {
    try {
      setSearching(true);
      const res = await api.get('/products?limit=50&search=' + searchQuery);
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      showAlert('Failed to load products', 'danger');
    } finally {
      setSearching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showAlert('Image size should be less than 2MB', 'warning');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      setUploading(true);
      const res = await api.post('/uploads', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setFormData({ ...formData, image: res.data.url });
        showAlert('Image uploaded successfully', 'success');
      }
    } catch (error) {
      showAlert('Image upload failed', 'danger');
    } finally {
      setUploading(false);
    }
  };

  const addComponent = (product) => {
    const defaultSize = product.packSizes?.length > 0 ? `${product.packSizes[0].weight} ${product.packSizes[0].unit}` : 'Standard';
    
    // Check if already exists
    const exists = formData.components.find(c => c.product === product._id && c.size === defaultSize);
    if (exists) {
      showAlert('This product size is already in the combo. Update the quantity instead.', 'warning');
      return;
    }

    const newComponent = {
      product: product._id,
      name: product.name,
      size: defaultSize,
      quantity: 1,
      label: '',
      // Store original product data for pricing preview
      _productData: product
    };

    setFormData({
      ...formData,
      components: [...formData.components, newComponent]
    });
    
    showAlert(`${product.name} added to combo`, 'success');
  };

  const updateComponent = (index, field, value) => {
    const newComponents = [...formData.components];
    newComponents[index][field] = value;
    setFormData({ ...formData, components: newComponents });
  };

  const removeComponent = (index) => {
    const newComponents = formData.components.filter((_, i) => i !== index);
    setFormData({ ...formData, components: newComponents });
  };

  const calculateRegularTotal = () => {
    let total = 0;
    formData.components.forEach(comp => {
      const p = comp._productData;
      if (!p) return;
      let basePrice = p.price;
      if (p.packSizes?.length > 0) {
        const pack = p.packSizes.find(s => `${s.weight} ${s.unit}` === comp.size);
        if (pack) basePrice = pack.price;
      }
      total += basePrice * comp.quantity;
    });
    return total;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.components.length === 0) {
      showAlert('Please add at least one product to the combo.', 'warning');
      return;
    }

    try {
      setSaving(true);
      // Clean up _productData before sending
      const payload = {
        ...formData,
        components: formData.components.map(c => ({
          product: c.product,
          name: c.name,
          size: c.size,
          quantity: c.quantity,
          label: c.label
        }))
      };

      const res = await api.post('/combos/admin', payload);
      if (res.data.success) {
        showAlert('Combo created successfully', 'success');
        router.push('/admin/combos');
      }
    } catch (error) {
      showAlert(error.response?.data?.message || 'Failed to create combo', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const regularTotal = calculateRegularTotal();
  const savings = Math.max(0, regularTotal - (Number(formData.comboPrice) || 0));

  return (
    <div className="admin-page animate__animated animate__fadeIn pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary border-opacity-25">
        <div className="d-flex align-items-center gap-3">
          <Link href="/admin/combos" className="btn btn-sm btn-outline-secondary rounded-circle p-2" title="Back">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="fw-bold m-0" style={{ color: '#162C18' }}>Create Combo</h2>
            <p className="text-muted m-0">Build a new bundled product offering.</p>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={saving} className="btn btn-brand d-flex align-items-center gap-2">
          {saving ? <span className="spinner-border spinner-border-sm" /> : <Save size={18} />}
          Save Combo
        </button>
      </div>

      <div className="row g-4">
        {/* Left Column: Form Details */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 rounded-4 mb-4">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="m-0 fw-bold">Basic Information</h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold fs-7">Combo Name <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold fs-7">SKU</label>
                  <input type="text" className="form-control" name="sku" value={formData.sku} onChange={handleChange} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-bold fs-7">Description <span className="text-danger">*</span></label>
                  <textarea className="form-control" name="description" rows="4" value={formData.description} onChange={handleChange} required></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm border-0 rounded-4 mb-4">
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h5 className="m-0 fw-bold">Combo Components</h5>
              <button onClick={() => setIsModalOpen(true)} className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1">
                <Plus size={16} /> Add Product
              </button>
            </div>
            <div className="card-body p-0">
              {formData.components.length === 0 ? (
                <div className="p-5 text-center text-muted">
                  <div className="mb-3"><Gift size={48} className="opacity-25" /></div>
                  <h6>No products added yet</h6>
                  <p className="fs-7">Click the "Add Product" button to build this combo.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle m-0">
                    <thead className="table-light">
                      <tr>
                        <th>Product</th>
                        <th width="150">Price</th>
                        <th width="120">Qty</th>
                        <th width="150">Label (Opt)</th>
                        <th width="60"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.components.map((comp, index) => (
                        <tr key={index}>
                          <td className="fw-bold fs-7">{comp.name}</td>
                          <td>
                            <span className="fw-medium text-dark">
                              ₹{comp._productData ? (comp._productData.packSizes?.find(s => `${s.weight} ${s.unit}` === comp.size)?.price || comp._productData.price) : 'N/A'}
                            </span>
                          </td>
                          <td>
                            <input 
                              type="number" 
                              className="form-control form-control-sm text-center"
                              min="1"
                              value={comp.quantity}
                              onChange={(e) => updateComponent(index, 'quantity', parseInt(e.target.value) || 1)}
                            />
                          </td>
                          <td>
                          <div className="position-relative">
                            <input 
                              type="text" 
                              className="form-control form-control-sm"
                              value={comp.label}
                              onChange={(e) => updateComponent(index, 'label', e.target.value)}
                            />
                            {!comp.label && (
                              <span className="position-absolute text-muted" style={{ top: '6px', left: '8px', fontSize: '0.875rem', pointerEvents: 'none' }}>
                                e.g. Free Gift
                              </span>
                            )}
                          </div>
                          </td>
                          <td>
                            <button onClick={() => removeComponent(index)} className="btn btn-sm btn-outline-danger p-1">
                              <Trash2 size={14} />
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

        {/* Right Column: Pricing, Image, Status */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 rounded-4 mb-4">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="m-0 fw-bold">Pricing</h5>
            </div>
            <div className="card-body p-4">
              <div className="mb-3 d-flex justify-content-between text-muted fs-7 border-bottom pb-2">
                <span>Regular Total:</span>
                <span className="fw-bold">₹{regularTotal}</span>
              </div>
              <div className="mb-4">
                <label className="form-label fw-bold fs-7 text-primary">Combo Selling Price (₹) <span className="text-danger">*</span></label>
                <input 
                  type="number" 
                  className="form-control form-control-lg border-primary" 
                  name="comboPrice" 
                  value={formData.comboPrice} 
                  onChange={handleChange} 
                  required 
                  min="0"
                />
              </div>
              {formData.comboPrice && regularTotal > 0 && (
                <div className={`p-3 rounded-3 text-center ${savings > 0 ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning-dark'}`}>
                  {savings > 0 ? (
                    <>
                      <div className="fw-bold fs-5">Save ₹{savings}</div>
                      <div className="fs-8">({Math.round((savings / regularTotal) * 100)}% Discount)</div>
                    </>
                  ) : (
                    <div className="fw-bold fs-6">No Discount Applied</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="card shadow-sm border-0 rounded-4 mb-4">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="m-0 fw-bold">Combo Image</h5>
            </div>
            <div className="card-body p-4 text-center">
              {formData.image ? (
                <div className="position-relative mb-3 d-inline-block" style={{ width: '100%', aspectRatio: '4/3', border: '1px solid #dee2e6', borderRadius: '8px', overflow: 'hidden' }}>
                  <Image src={formData.image.replace('/assets/images/', '/')} alt="Preview" fill style={{ objectFit: 'contain', padding: '10px' }} />
                  <button 
                    onClick={() => setFormData({ ...formData, image: '' })}
                    className="btn btn-sm btn-danger position-absolute"
                    style={{ top: '10px', right: '10px', zIndex: 10 }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <div className="mb-3 p-5 border border-dashed rounded-3 bg-light text-muted">
                  <UploadCloud size={36} className="mb-2 opacity-50" />
                  <div className="fs-7">Upload Combo Image</div>
                </div>
              )}
              
              <div>
                <input 
                  type="file" 
                  id="comboImage" 
                  className="d-none" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                <label htmlFor="comboImage" className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2">
                  {uploading ? <span className="spinner-border spinner-border-sm" /> : <UploadCloud size={16} />}
                  {uploading ? 'Uploading...' : 'Choose Image'}
                </label>
              </div>
            </div>
          </div>

          <div className="card shadow-sm border-0 rounded-4 mb-4">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="m-0 fw-bold">Publishing</h5>
            </div>
            <div className="card-body p-4">
              <div className="mb-3">
                <label className="form-label fw-bold fs-7">Status</label>
                <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold fs-7">Sort Order</label>
                <input type="number" className="form-control" name="sortOrder" value={formData.sortOrder} onChange={handleChange} />
              </div>
              <div className="form-check form-switch mt-4">
                <input className="form-check-input" type="checkbox" role="switch" id="isFeatured" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} />
                <label className="form-check-label fw-bold fs-7" htmlFor="isFeatured">Featured Combo</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Search Modal */}
      {isModalOpen && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header bg-light">
                  <h5 className="modal-title fw-bold">Add Product to Combo</h5>
                  <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
                </div>
                <div className="modal-body p-0">
                  <div className="p-3 border-bottom position-sticky top-0 bg-white" style={{ zIndex: 10 }}>
                    <div className="input-group">
                      <span className="input-group-text bg-white"><Search size={18} /></span>
                      <div className="position-relative flex-grow-1">
                        <input 
                          type="text" 
                          className="form-control" 
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        />
                        {!searchQuery && (
                          <span className="position-absolute text-muted" style={{ top: '8px', left: '12px', pointerEvents: 'none' }}>
                            Search products by name or SKU...
                          </span>
                        )}
                      </div>
                      <button className="btn btn-primary" onClick={handleSearch} disabled={searching}>
                        {searching ? 'Searching...' : 'Search'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="list-group list-group-flush rounded-0">
                    {products.length === 0 && !searching && (
                      <div className="p-5 text-center text-muted">No products found.</div>
                    )}
                    {products.map(product => (
                      <div key={product._id} className="list-group-item list-group-item-action p-3 d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                          <div style={{ width: '40px', height: '40px', position: 'relative', overflow: 'hidden', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                            {product.images?.[0] || product.image ? (
                              <Image src={(product.images?.[0] || product.image).replace('/assets/images/', '/')} alt={product.name} fill style={{ objectFit: 'contain' }} sizes="40px" />
                            ) : null}
                          </div>
                          <div>
                            <h6 className="m-0 fw-bold">{product.name}</h6>
                            <div className="text-muted fs-8">Stock: {product.stock} | Price: ₹{product.price}</div>
                          </div>
                        </div>
                        <button 
                          className="btn btn-sm btn-outline-success" 
                          onClick={() => { addComponent(product); setIsModalOpen(false); }}
                        >
                          <Plus size={16} /> Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
