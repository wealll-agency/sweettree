'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminProducts, addProduct, editProduct, removeProduct } from '../../../store/adminSlice.js';
import { Plus, Edit, Trash2, X } from 'lucide-react';

export default function AdminProductsPage() {
  const dispatch = useDispatch();
  
  const { products, productsLoading } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);

  // Form toggles
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Dry Fruits');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [benefits, setBenefits] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    dispatch(fetchAdminProducts());
  }, [dispatch]);

  const resetForm = () => {
    setName('');
    setCategory('Dry Fruits');
    setPrice('');
    setDiscount('0');
    setDescription('');
    setIngredients('');
    setBenefits('');
    setBatchNumber('');
    setExpiryDate('');
    setStock('');
    setImageUrl('');
    setEditMode(false);
    setEditId('');
    setShowForm(false);
  };

  const handleEditClick = (product) => {
    setEditId(product._id);
    setName(product.name);
    setCategory(product.category);
    setPrice(product.price.toString());
    setDiscount(product.discount.toString());
    setDescription(product.description);
    setIngredients(product.ingredients.join(', '));
    setBenefits(product.benefits.join(', '));
    setBatchNumber(product.batchNumber);
    setExpiryDate(product.expiryDate.split('T')[0]);
    setStock(product.stock.toString());
    setImageUrl(product.images[0] || '');
    setEditMode(true);
    setShowForm(true);
  };

  const handleDeleteClick = (id) => {
    if (confirm('Are you sure you want to delete this product? Corresponding inventory records will be wiped.')) {
      dispatch(removeProduct(id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name,
      category,
      price: Number(price),
      discount: Number(discount),
      description,
      ingredients: ingredients.split(',').map(i => i.trim()).filter(Boolean),
      benefits: benefits.split(',').map(b => b.trim()).filter(Boolean),
      batchNumber,
      expiryDate,
      stock: Number(stock),
      images: imageUrl.trim() ? [imageUrl.trim()] : ['https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400']
    };

    if (editMode) {
      dispatch(editProduct({ id: editId, data: payload })).then(() => resetForm());
    } else {
      dispatch(addProduct(payload)).then(() => resetForm());
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold m-0 display-font">Product Manager</h1>
          <p className="text-muted m-0">Add, edit, or adjust inventory catalogs.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-brand d-flex align-items-center gap-2">
            <Plus size={18} /> Add Product
          </button>
        )}
      </div>

      {/* Product form panel */}
      {showForm && (
        <div className="card shadow-sm p-4 border-0 rounded-4 bg-white mb-4 position-relative">
          <button onClick={resetForm} className="btn border-0 position-absolute end-0 top-0 m-3 text-muted">
            <X size={20} />
          </button>
          
          <h4 className="fw-bold mb-4 display-font">{editMode ? 'Edit Product Details' : 'Add New Herbal Product'}</h4>
          
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
              <label className="fw-medium mb-1 fs-7">Product Name</label>
              <input type="text" required className="form-control" placeholder="Sweettree Jumbo Almonds" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="col-md-3">
              <label className="fw-medium mb-1 fs-7">Category</label>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Dry Fruits">Dry Fruits</option>
                <option value="Top Selling Products">Top Selling Products</option>
                <option value="Healthy Snacking">Healthy Snacking</option>
                <option value="Combo Gift Box">Combo Gift Box</option>
                <option value="Flavoured Nuts">Flavoured Nuts</option>
                <option value="Seeds And Berries">Seeds And Berries</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="fw-medium mb-1 fs-7">Image URL</label>
              <input type="text" className="form-control" placeholder="https://image-url..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            </div>

            <div className="col-md-3">
              <label className="fw-medium mb-1 fs-7">Price (INR)</label>
              <input type="number" required className="form-control" placeholder="389" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>

            <div className="col-md-3">
              <label className="fw-medium mb-1 fs-7">Discount (%)</label>
              <input type="number" className="form-control" placeholder="25" value={discount} onChange={(e) => setDiscount(e.target.value)} />
            </div>

            <div className="col-md-3">
              <label className="fw-medium mb-1 fs-7">Batch Number</label>
              <input type="text" required className="form-control" placeholder="MCL-2026-B1" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} />
            </div>

            <div className="col-md-3">
              <label className="fw-medium mb-1 fs-7">Expiry Date</label>
              <input type="date" required className="form-control" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </div>

            <div className="col-md-2">
              <label className="fw-medium mb-1 fs-7">Initial Stock</label>
              <input type="number" required className="form-control" placeholder="150" value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>

            <div className="col-md-5">
              <label className="fw-medium mb-1 fs-7">Ingredients (Comma-separated)</label>
              <input type="text" className="form-control" placeholder="Aloe Vera, Glycerin, Milk Protein" value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
            </div>

            <div className="col-md-5">
              <label className="fw-medium mb-1 fs-7">Benefits (Comma-separated)</label>
              <input type="text" className="form-control" placeholder="Deep cleanses, Softens skin, Hydrates" value={benefits} onChange={(e) => setBenefits(e.target.value)} />
            </div>

            <div className="col-12">
              <label className="fw-medium mb-1 fs-7">Description</label>
              <textarea rows="3" required className="form-control" placeholder="Provide product description..." value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
            </div>

            <div className="col-12 d-flex gap-2 justify-content-end mt-4">
              <button type="button" onClick={resetForm} className="btn btn-brand-secondary">Cancel</button>
              <button type="submit" className="btn btn-brand">{editMode ? 'Update Product' : 'Save Product'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Products list grid */}
      <div className="card shadow-sm p-4 border-0 rounded-4 bg-white">
        {productsLoading ? (
          <p className="text-muted text-center py-4">Loading catalog list...</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-borderless align-middle m-0 fs-7">
              <thead>
                <tr className="border-bottom text-muted">
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Discount</th>
                  <th>Batch</th>
                  <th>Stock</th>
                  <th>Status</th>
                  {user.role !== 'Staff' && <th className="text-center">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod._id} className="border-bottom">
                    <td className="py-3">
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={prod.images[0] || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=80'}
                          alt={prod.name}
                          className="rounded object-fit-cover"
                          style={{ width: '40px', height: '40px' }}
                        />
                        <span className="fw-bold text-dark">{prod.name}</span>
                      </div>
                    </td>
                    <td>{prod.category}</td>
                    <td className="fw-semibold">₹{prod.price}</td>
                    <td>{prod.discount > 0 ? `${prod.discount}%` : '-'}</td>
                    <td className="font-monospace">{prod.batchNumber}</td>
                    <td className={prod.stock <= 10 ? 'text-danger fw-bold' : 'text-dark fw-medium'}>{prod.stock} units</td>
                    <td>
                      <span className={prod.stock > 0 ? 'badge-status-green' : 'badge-status-red'}>
                        {prod.stock > 0 ? 'Active' : 'Out of Stock'}
                      </span>
                    </td>
                    {user.role !== 'Staff' && (
                      <td className="text-center">
                        <div className="d-inline-flex gap-2">
                          <button onClick={() => handleEditClick(prod)} className="btn btn-sm btn-link text-primary p-0 border-0">
                            <Edit size={16} />
                          </button>
                          {user.role === 'Super Admin' && (
                            <button onClick={() => handleDeleteClick(prod._id)} className="btn btn-sm btn-link text-danger p-0 border-0">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
