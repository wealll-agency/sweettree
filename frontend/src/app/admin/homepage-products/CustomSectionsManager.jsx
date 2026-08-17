'use client';
import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Edit } from 'lucide-react';
import api from '../../../utils/axiosConfig';
import { useNotification } from '../../../context/NotificationContext';
import Image from 'next/image';

export default function CustomSectionsManager({ allProducts }) {
  const { showAlert } = useNotification();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  
  // To manage products of a specific section
  const [editingSection, setEditingSection] = useState(null);
  const [selections, setSelections] = useState({});
  const [saving, setSaving] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const categories = allProducts ? [...new Set(allProducts.map(p => p.category).filter(Boolean))] : [];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await api.get('/custom-sections');
      if (res.data.success) {
        setSections(res.data.sections);
      }
    } catch (err) {
      showAlert('Failed to load custom sections', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return showAlert('Title is required', 'error');
    
    try {
      const res = await api.post('/custom-sections', { title: newTitle });
      if (res.data.success) {
        showAlert('Section created successfully', 'success');
        setNewTitle('');
        await fetchSections();
        if (res.data.section) {
          startEditing(res.data.section);
        }
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to create section', 'error');
    }
  };

  const handleDeleteSection = async (id) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    try {
      const res = await api.delete(`/custom-sections/${id}`);
      if (res.data.success) {
        showAlert('Section deleted', 'success');
        if (editingSection?._id === id) setEditingSection(null);
        fetchSections();
      }
    } catch (err) {
      showAlert('Failed to delete section', 'error');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const res = await api.put(`/custom-sections/${id}`, { isActive: !currentStatus });
      if (res.data.success) {
        if (editingSection && editingSection._id === id) {
          setEditingSection(prev => ({ ...prev, isActive: !currentStatus }));
        }
        fetchSections();
      }
    } catch (err) {
      showAlert('Failed to update status', 'error');
    }
  };

  const startEditing = (section) => {
    setEditingSection(section);
    const initial = {};
    if (section.products) {
      section.products.forEach(p => {
        initial[p._id || p] = true;
      });
    }
    setSelections(initial);
    setCurrentPage(1);
    setSearchTerm('');
  };

  const handleCheckboxChange = (productId, checked) => {
    setSelections(prev => ({
      ...prev,
      [productId]: checked
    }));
  };

  const handleSaveProducts = async () => {
    if (!editingSection) return;
    setSaving(true);
    try {
      const productIds = Object.keys(selections).filter(id => selections[id]);
      const res = await api.put(`/custom-sections/${editingSection._id}`, { products: productIds });
      if (res.data.success) {
        showAlert('Products updated successfully', 'success');
        // Do not close editingSection, just refresh
        fetchSections();
      }
    } catch (err) {
      showAlert('Failed to update products', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-5 text-muted">Loading custom sections...</div>;

  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="animate-fade-in">
      <div className="row mb-4 align-items-end bg-light p-3 rounded-3 mx-0">
        <div className="col-lg-5 mb-3 mb-lg-0">
          <label className="form-label fw-medium fs-7 mb-1 text-brand">1. Select Section to Manage</label>
          <select 
            className="form-select border-brand shadow-none"
            value={editingSection ? editingSection._id : ''}
            onChange={(e) => {
              const sec = sections.find(s => s._id === e.target.value);
              if (sec) startEditing(sec);
              else setEditingSection(null);
            }}
          >
            <option value="">-- Choose an existing section --</option>
            {sections.map(sec => (
              <option key={sec._id} value={sec._id}>{sec.title} ({sec.products?.length || 0} items)</option>
            ))}
          </select>
        </div>
        
        <div className="col-lg-1 text-center mb-3 mb-lg-0 text-muted fw-bold">OR</div>
        
        <div className="col-lg-6">
          <label className="form-label text-muted fs-7 mb-1">Create a New Section</label>
          <form onSubmit={handleCreateSection} className="d-flex gap-2">
            <input 
              type="text" 
              className="form-control" 
              placeholder="E.g. Festive Specials" 
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-brand text-nowrap d-flex align-items-center gap-1">
              <Plus size={16} /> Create
            </button>
          </form>
        </div>
      </div>

      {editingSection ? (
        <div className="border border-light-subtle rounded-3 p-4">
          <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
            <div>
              <h5 className="fw-bold mb-1 text-dark">Managing: {editingSection.title}</h5>
              <div className="d-flex align-items-center gap-4 mt-2">
                <div className="form-check form-switch m-0">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    role="switch"
                    checked={editingSection.isActive}
                    onChange={() => handleToggleActive(editingSection._id, editingSection.isActive)}
                  />
                  <label className="form-check-label fw-medium fs-7 ms-1 text-dark">
                    {editingSection.isActive ? 'Visible on Homepage' : 'Hidden from Homepage'}
                  </label>
                </div>
                <button 
                  className="btn btn-sm text-danger p-0 border-0 bg-transparent d-flex align-items-center"
                  onClick={() => handleDeleteSection(editingSection._id)}
                >
                  <Trash2 size={14} className="me-1" /> Delete Section
                </button>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-brand d-flex align-items-center gap-2 px-4 shadow-sm" onClick={handleSaveProducts} disabled={saving}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Assignments'}
              </button>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <input 
                type="text" 
                className="form-control bg-light border-0" 
                placeholder="Search products by name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <select 
                className="form-select bg-light border-0" 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-borderless align-middle m-0 fs-7">
              <thead>
                <tr className="border-bottom text-muted">
                  <th style={{ width: '60px' }}>Select</th>
                  <th style={{ width: '80px' }}>Image</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.length > 0 ? (
                  currentProducts.map(product => (
                    <tr key={product._id} className="border-bottom" style={{ opacity: product.isActive ? 1 : 0.6 }}>
                      <td>
                        <div className="form-check">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            checked={selections[product._id] || false}
                            onChange={(e) => handleCheckboxChange(product._id, e.target.checked)}
                            style={{ transform: 'scale(1.2)' }}
                          />
                        </div>
                      </td>
                      <td>
                        <Image 
                          src={product.images?.[0] || 'https://via.placeholder.com/50'} 
                          alt="product" 
                          width={40} height={40} 
                          className="rounded" 
                          style={{ objectFit: 'cover' }} 
                        />
                      </td>
                      <td>
                        <span className="fw-medium text-dark">{product.name}</span>
                        {!product.isActive && <span className="badge bg-danger ms-2">Inactive</span>}
                      </td>
                      <td>{product.category}</td>
                      <td>₹{product.price}</td>
                      <td>
                        {selections[product._id] ? (
                          <span className="badge bg-success bg-opacity-25 text-success">Selected</span>
                        ) : (
                          <span className="badge bg-secondary bg-opacity-25 text-secondary">Unselected</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">No products match your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {filteredProducts.length > itemsPerPage && (
              <div className="d-flex justify-content-between align-items-center mt-4 px-2 pb-2">
                <span className="text-muted fs-7">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} entries
                </span>
                <div className="d-flex gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => p - 1)} 
                    disabled={currentPage === 1}
                    className="btn btn-outline-secondary btn-sm px-3"
                  >
                    Previous
                  </button>
                  <button 
                    onClick={() => setCurrentPage(p => p + 1)} 
                    disabled={currentPage === totalPages}
                    className="btn btn-outline-secondary btn-sm px-3"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-5 border border-dashed rounded-3 bg-light">
          <p className="text-muted mb-0">Please select an existing custom section from the dropdown above, or create a new one.</p>
        </div>
      )}
    </div>
  );
}
