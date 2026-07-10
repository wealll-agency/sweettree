'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminProducts, addProduct, editProduct, removeProduct, toggleProductState } from '../../../store/adminSlice.js';
import { Plus, Edit, Trash2, X, Eye, Download, Search, LayoutGrid } from 'lucide-react';

export default function AdminProductsPage() {
  const dispatch = useDispatch();
  
  const { products, productsLoading } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);

  // Form toggles
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState('');

  // Filters state
  const [filterBrand, setFilterBrand] = useState('All Brands');
  const [filterCategory, setFilterCategory] = useState('Select category');
  const [filterSubCategory, setFilterSubCategory] = useState('Select Sub Category');
  const [filterSubSubCategory, setFilterSubSubCategory] = useState('Select Sub Sub Category');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showLimitedStockOnly, setShowLimitedStockOnly] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [viewingBarcode, setViewingBarcode] = useState(null);

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Dry Fruits');
  const [subCategory, setSubCategory] = useState('');
  const [subSubCategory, setSubSubCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [productType, setProductType] = useState('Physical');
  const [sku, setSku] = useState('');
  const [unit, setUnit] = useState('kg');
  const [searchTags, setSearchTags] = useState('');
  
  const [price, setPrice] = useState(''); // Represents Unit Price
  const [purchasePrice, setPurchasePrice] = useState('0');
  const [minOrderQty, setMinOrderQty] = useState('1');
  const [discount, setDiscount] = useState('0'); // Represents Discount Amount
  const [discountType, setDiscountType] = useState('Flat');
  const [taxAmount, setTaxAmount] = useState('0');
  const [taxCalculation, setTaxCalculation] = useState('Include with product');
  const [shippingCost, setShippingCost] = useState('0');
  const [shippingMultiplyWithQty, setShippingMultiplyWithQty] = useState(false);
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [benefits, setBenefits] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const loadProducts = () => {
    dispatch(fetchAdminProducts({
      brand: filterBrand !== 'All Brands' ? filterBrand : '',
      category: filterCategory !== 'Select category' ? filterCategory : '',
      subCategory: filterSubCategory !== 'Select Sub Category' ? filterSubCategory : '',
      subSubCategory: filterSubSubCategory !== 'Select Sub Sub Category' ? filterSubSubCategory : '',
      keyword: searchKeyword
    }));
  };

  useEffect(() => {
    loadProducts();
  }, [dispatch]);

  const handleToggle = (id, field, value) => {
    dispatch(toggleProductState({ id, field, value }));
  };

  const handleExport = () => {
    if (!products || products.length === 0) {
      alert("No products to export");
      return;
    }
    const headers = ['SL', 'Product Name', 'Category', 'Product Type', 'Purchase Price', 'Selling Price', 'Stock', 'Featured', 'Active'];
    const csvRows = [headers.join(',')];
    
    products.forEach((p, index) => {
      const row = [
        index + 1,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.category}"`,
        p.productType || 'Physical',
        p.purchasePrice || 0,
        p.price,
        p.stock,
        p.isFeatured || false,
        p.isActive !== false
      ];
      csvRows.push(row.join(','));
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'sweettree_products.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setName('');
    setCategory('Dry Fruits');
    setSubCategory('');
    setSubSubCategory('');
    setBrand('');
    setProductType('Physical');
    setSku('');
    setUnit('kg');
    setSearchTags('');
    setPrice('');
    setPurchasePrice('0');
    setMinOrderQty('1');
    setDiscount('0');
    setDiscountType('Flat');
    setTaxAmount('0');
    setTaxCalculation('Include with product');
    setShippingCost('0');
    setShippingMultiplyWithQty(false);
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
    setSubCategory(product.subCategory || '');
    setSubSubCategory(product.subSubCategory || '');
    setBrand(product.brand || '');
    setProductType(product.productType || 'Physical');
    setSku(product.sku || '');
    setUnit(product.unit || 'kg');
    setSearchTags(product.searchTags ? product.searchTags.join(', ') : '');
    setPrice(product.price.toString());
    setPurchasePrice(product.purchasePrice ? product.purchasePrice.toString() : '0');
    setMinOrderQty(product.minOrderQty ? product.minOrderQty.toString() : '1');
    setDiscount(product.discount.toString());
    setDiscountType(product.discountType || 'Flat');
    setTaxAmount(product.taxAmount ? product.taxAmount.toString() : '0');
    setTaxCalculation(product.taxCalculation || 'Include with product');
    setShippingCost(product.shippingCost ? product.shippingCost.toString() : '0');
    setShippingMultiplyWithQty(product.shippingMultiplyWithQty || false);
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
      subCategory,
      subSubCategory,
      brand,
      productType,
      sku,
      unit,
      searchTags: searchTags.split(',').map(tag => tag.trim()).filter(Boolean),
      price: Number(price),
      purchasePrice: Number(purchasePrice),
      minOrderQty: Number(minOrderQty),
      discount: Number(discount),
      discountType,
      taxAmount: Number(taxAmount),
      taxCalculation,
      shippingCost: Number(shippingCost),
      shippingMultiplyWithQty,
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

  const generateSku = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSku(code);
  };

  const displayedProducts = showLimitedStockOnly ? products.filter(p => p.stock <= 10) : products;

  return (
    <div className="animate-fade-in position-relative">
      {/* View Product Modal */}
      {viewingProduct && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="card shadow border-0 rounded-4" style={{ width: '400px' }}>
            <div className="card-header bg-white d-flex justify-content-between align-items-center border-bottom-0 pt-3">
              <h5 className="fw-bold m-0">Product Details</h5>
              <button className="btn border-0 text-muted" onClick={() => setViewingProduct(null)}><X size={20} /></button>
            </div>
            <div className="card-body text-center">
              <img src={viewingProduct.images[0] || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200'} alt="product" className="img-fluid rounded mb-3" style={{ maxHeight: '200px', objectFit: 'cover' }} />
              <h5 className="fw-bold">{viewingProduct.name}</h5>
              <p className="text-muted mb-1">Category: {viewingProduct.category}</p>
              <p className="fw-semibold text-brand fs-5 mb-1">${viewingProduct.price}</p>
              <span className={`badge ${viewingProduct.stock > 0 ? 'bg-success' : 'bg-danger'}`}>{viewingProduct.stock} in stock</span>
              <p className="mt-3 fs-7 text-start text-muted">{viewingProduct.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* View Barcode Modal */}
      {viewingBarcode && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="card shadow border-0 rounded-4" style={{ width: '350px' }}>
            <div className="card-header bg-white d-flex justify-content-between align-items-center border-bottom-0 pt-3">
              <h5 className="fw-bold m-0">Product Barcode</h5>
              <button className="btn border-0 text-muted" onClick={() => setViewingBarcode(null)}><X size={20} /></button>
            </div>
            <div className="card-body text-center py-5">
              <div className="border p-3 d-inline-block rounded bg-light mb-3">
                <h1 className="display-4 fw-bold m-0 text-dark" style={{ letterSpacing: '8px', fontFamily: 'monospace' }}>
                  |||||||||
                </h1>
              </div>
              <h5 className="font-monospace fw-bold">{viewingBarcode.sku || viewingBarcode.batchNumber || 'NO-SKU'}</h5>
              <p className="text-muted">{viewingBarcode.name}</p>
            </div>
          </div>
        </div>
      )}
      {/* Filter Products Section */}
      {!showForm && (
        <div className="card shadow-sm border-0 rounded-4 bg-white mb-4">
          <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
            <h6 className="fw-bold m-0 text-dark">Filter Products</h6>
          </div>
          <div className="card-body">
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="fw-medium mb-1 fs-7">Brand</label>
                <select className="form-select" value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)}>
                  <option value="All Brands">All Brands</option>
                  <option value="Sweettree">Sweettree</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="fw-medium mb-1 fs-7">Category</label>
                <select className="form-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                  <option value="Select category">Select category</option>
                  <option value="Dry Fruits">Dry Fruits</option>
                  <option value="Healthy Snacking">Healthy Snacking</option>
                  <option value="Combo Gift Box">Combo Gift Box</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="fw-medium mb-1 fs-7">Sub Category</label>
                <select className="form-select" value={filterSubCategory} onChange={(e) => setFilterSubCategory(e.target.value)}>
                  <option value="Select Sub Category">Select Sub Category</option>
                  <option value="Nuts">Nuts</option>
                  <option value="Seeds">Seeds</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="fw-medium mb-1 fs-7">Sub Sub Category</label>
                <select className="form-select" value={filterSubSubCategory} onChange={(e) => setFilterSubSubCategory(e.target.value)}>
                  <option value="Select Sub Sub Category">Select Sub Sub Category</option>
                </select>
              </div>
              
              <div className="col-12 d-flex justify-content-end gap-2 mt-4">
                <button 
                  className="btn btn-brand-secondary"
                  onClick={() => {
                    setFilterBrand('All Brands');
                    setFilterCategory('Select category');
                    setFilterSubCategory('Select Sub Category');
                    setFilterSubSubCategory('Select Sub Sub Category');
                    setSearchKeyword('');
                    dispatch(fetchAdminProducts({})); // instantly reload all
                  }}
                >
                  Reset
                </button>
                <button className="btn btn-brand" onClick={loadProducts}>Show data</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Actions Bar */}
      {!showForm && (
        <div className="card shadow-sm border-0 rounded-4 bg-white mb-4">
          <div className="card-body p-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="d-flex" style={{ width: '300px' }}>
              <input 
                type="text" 
                className="form-control rounded-end-0 border-end-0" 
                placeholder="Search Product Name" 
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadProducts()}
              />
              <button className="btn btn-brand rounded-start-0 px-3" onClick={loadProducts}>
                Search
              </button>
            </div>
            <div className="d-flex gap-2">
              <button onClick={handleExport} className="btn btn-outline-brand d-flex align-items-center gap-2" style={{ borderColor: '#1c72b9', color: '#1c72b9' }}>
                <Download size={16} /> Export
              </button>
              <button onClick={() => setShowLimitedStockOnly(!showLimitedStockOnly)} className="btn d-flex align-items-center" style={{ backgroundColor: showLimitedStockOnly ? '#00b8b8' : '#00d2d3', color: '#fff', border: 'none' }}>
                Limited Sotcks {showLimitedStockOnly && '(Active)'}
              </button>
              <button onClick={() => setShowForm(true)} className="btn btn-brand d-flex align-items-center gap-2">
                <Plus size={16} /> Add new product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product form panel */}
      {showForm && (
        <div className="mb-4 position-relative">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold m-0">{editMode ? 'Edit Product Details' : 'Add New Product'}</h4>
            <button onClick={resetForm} className="btn border-0 text-muted shadow-sm bg-white rounded-circle" style={{ width: '40px', height: '40px' }}>
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* General Setup Card */}
            <div className="card shadow-sm border-0 rounded-4 bg-white mb-4">
              <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
                <h6 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
                  <i className="fas fa-user-cog text-muted"></i> General setup
                </h6>
              </div>
              <div className="card-body">
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="fw-medium mb-1 fs-7">Product Name</label>
                    <input type="text" required className="form-control" placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="fw-medium mb-1 fs-7">Brand</label>
                    <input type="text" className="form-control" placeholder="Select Brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
                  </div>
                  
                  <div className="col-md-4">
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
                  <div className="col-md-4">
                    <label className="fw-medium mb-1 fs-7">Sub Category</label>
                    <input type="text" className="form-control" placeholder="Select Sub Category" value={subCategory} onChange={(e) => setSubCategory(e.target.value)} />
                  </div>
                  <div className="col-md-4">
                    <label className="fw-medium mb-1 fs-7">Sub Sub Category</label>
                    <input type="text" className="form-control" placeholder="Select Sub Sub Category" value={subSubCategory} onChange={(e) => setSubSubCategory(e.target.value)} />
                  </div>

                  <div className="col-md-4">
                    <label className="fw-medium mb-1 fs-7">Product Type</label>
                    <select className="form-select" value={productType} onChange={(e) => setProductType(e.target.value)}>
                      <option value="Physical">Physical</option>
                      <option value="Digital">Digital</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <div className="d-flex justify-content-between">
                      <label className="fw-medium mb-1 fs-7">Product SKU</label>
                      <a href="#" className="text-primary text-decoration-none fs-7" onClick={(e) => { e.preventDefault(); generateSku(); }}>Generate Code</a>
                    </div>
                    <input type="text" className="form-control" placeholder="Code" value={sku} onChange={(e) => setSku(e.target.value)} />
                  </div>
                  <div className="col-md-4">
                    <label className="fw-medium mb-1 fs-7">Unit</label>
                    <select className="form-select" value={unit} onChange={(e) => setUnit(e.target.value)}>
                      <option value="kg">kg</option>
                      <option value="gm">gm</option>
                      <option value="pcs">pcs</option>
                      <option value="ltr">ltr</option>
                      <option value="pack">pack</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="fw-medium mb-1 fs-7">Search Tags</label>
                    <input type="text" className="form-control" placeholder="Enter tag (comma separated)" value={searchTags} onChange={(e) => setSearchTags(e.target.value)} />
                  </div>

                  {/* Rest of the original form fields that belong to general data */}
                  <div className="col-md-4">
                    <label className="fw-medium mb-1 fs-7">Image URL</label>
                    <input type="text" className="form-control" placeholder="https://image-url..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                  </div>
                  <div className="col-md-4">
                    <label className="fw-medium mb-1 fs-7">Batch Number</label>
                    <input type="text" required className="form-control" placeholder="BATCH-123" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} />
                  </div>
                  <div className="col-md-4">
                    <label className="fw-medium mb-1 fs-7">Expiry Date</label>
                    <input type="date" required className="form-control" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="fw-medium mb-1 fs-7">Ingredients (Comma-separated)</label>
                    <input type="text" className="form-control" placeholder="Aloe Vera, Glycerin..." value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="fw-medium mb-1 fs-7">Benefits (Comma-separated)</label>
                    <input type="text" className="form-control" placeholder="Hydrates, Softens..." value={benefits} onChange={(e) => setBenefits(e.target.value)} />
                  </div>
                  <div className="col-12">
                    <label className="fw-medium mb-1 fs-7">Description</label>
                    <textarea rows="3" required className="form-control" placeholder="Provide product description..." value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Others Card */}
            <div className="card shadow-sm border-0 rounded-4 bg-white mb-4">
              <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
                <h6 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
                  <i className="fas fa-dollar-sign text-muted"></i> Pricing & others
                </h6>
              </div>
              <div className="card-body">
                <div className="row g-4">
                  <div className="col-md-3">
                    <label className="fw-medium mb-1 fs-7">Purchase Price ($)</label>
                    <input type="number" className="form-control" placeholder="Purchase price" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} />
                  </div>
                  <div className="col-md-3">
                    <label className="fw-medium mb-1 fs-7">Unit Price ($)</label>
                    <input type="number" required className="form-control" placeholder="Unit price" value={price} onChange={(e) => setPrice(e.target.value)} />
                  </div>
                  <div className="col-md-3">
                    <label className="fw-medium mb-1 fs-7">Minimum Order Qty</label>
                    <input type="number" className="form-control" value={minOrderQty} onChange={(e) => setMinOrderQty(e.target.value)} />
                  </div>
                  <div className="col-md-3">
                    <label className="fw-medium mb-1 fs-7">Current Stock Qty</label>
                    <input type="number" required className="form-control" value={stock} onChange={(e) => setStock(e.target.value)} />
                  </div>

                  <div className="col-md-3">
                    <label className="fw-medium mb-1 fs-7">Discount Type</label>
                    <select className="form-select" value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                      <option value="Flat">Flat</option>
                      <option value="Percent">Percent</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="fw-medium mb-1 fs-7">Discount Amount</label>
                    <input type="number" className="form-control" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                  </div>
                  <div className="col-md-3">
                    <label className="fw-medium mb-1 fs-7">Tax Amount(%)</label>
                    <input type="number" className="form-control" value={taxAmount} onChange={(e) => setTaxAmount(e.target.value)} />
                  </div>
                  <div className="col-md-3">
                    <label className="fw-medium mb-1 fs-7">Tax Calculation</label>
                    <select className="form-select" value={taxCalculation} onChange={(e) => setTaxCalculation(e.target.value)}>
                      <option value="Include with product">Include with product</option>
                      <option value="Exclude">Exclude</option>
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label className="fw-medium mb-1 fs-7">Shipping Cost ($)</label>
                    <input type="number" className="form-control" value={shippingCost} onChange={(e) => setShippingCost(e.target.value)} />
                  </div>
                  <div className="col-md-6 d-flex align-items-end pb-2">
                    <div className="form-check form-switch d-flex align-items-center gap-2">
                      <label className="form-check-label fs-7 fw-medium mb-0">Shipping Cost Multiply With Quantity</label>
                      <input className="form-check-input ms-2" type="checkbox" checked={shippingMultiplyWithQty} onChange={(e) => setShippingMultiplyWithQty(e.target.checked)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 justify-content-end mb-4">
              <button type="button" onClick={resetForm} className="btn btn-brand-secondary">Cancel</button>
              <button type="submit" className="btn btn-brand">{editMode ? 'Update Product' : 'Save Product'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Products list grid */}
      {!showForm && (
        <div className="card shadow-sm border-0 rounded-4 bg-white">
          {productsLoading ? (
            <p className="text-muted text-center py-4">Loading catalog list...</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-borderless align-middle m-0 fs-7">
                <thead>
                  <tr className="border-bottom text-muted">
                    <th>SL</th>
                    <th>Product Name</th>
                    <th>Product Type</th>
                    <th>Purchase Price</th>
                    <th>Selling Price</th>
                    <th className="text-center">Show As Featured</th>
                    <th className="text-center">Active Status</th>
                    {user.role !== 'Staff' && <th className="text-center">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {displayedProducts.map((prod, index) => (
                    <tr key={prod._id} className="border-bottom">
                      <td className="text-muted">{index + 1}</td>
                      <td className="py-3">
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={prod.images[0] || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=80'}
                            alt={prod.name}
                            className="rounded object-fit-cover"
                            style={{ width: '36px', height: '36px' }}
                          />
                          <span className="fw-bold text-dark">{prod.name}</span>
                        </div>
                      </td>
                      <td>{prod.productType || 'Physical'}</td>
                      <td>${prod.purchasePrice || 0}</td>
                      <td className="fw-semibold">${prod.price}</td>
                      <td className="text-center">
                        <div className="form-check form-switch d-inline-block">
                          <input 
                            className="form-check-input cursor-pointer" 
                            type="checkbox" 
                            checked={prod.isFeatured || false} 
                            onChange={(e) => handleToggle(prod._id, 'isFeatured', e.target.checked)} 
                          />
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="form-check form-switch d-inline-block">
                          <input 
                            className="form-check-input cursor-pointer" 
                            type="checkbox" 
                            checked={prod.isActive !== false} 
                            onChange={(e) => handleToggle(prod._id, 'isActive', e.target.checked)} 
                          />
                        </div>
                      </td>
                      {user.role !== 'Staff' && (
                        <td className="text-center">
                          <div className="d-inline-flex gap-2">
                            <button onClick={() => setViewingBarcode(prod)} className="btn btn-sm bg-white" style={{ border: '1px solid #00d2d3', color: '#00d2d3', padding: '0.25rem 0.4rem', borderRadius: '4px' }} title="Barcode">
                              <LayoutGrid size={14} />
                            </button>
                            <button onClick={() => setViewingProduct(prod)} className="btn btn-sm bg-white" style={{ border: '1px solid #00d2d3', color: '#00d2d3', padding: '0.25rem 0.4rem', borderRadius: '4px' }} title="View">
                              <Eye size={14} />
                            </button>
                            <button onClick={() => handleEditClick(prod)} className="btn btn-sm bg-white" style={{ border: '1px solid #1c72b9', color: '#1c72b9', padding: '0.25rem 0.4rem', borderRadius: '4px' }} title="Edit">
                              <Edit size={14} />
                            </button>
                            {user.role === 'Super Admin' && (
                              <button onClick={() => handleDeleteClick(prod._id)} className="btn btn-sm bg-white" style={{ border: '1px solid #f1416c', color: '#f1416c', padding: '0.25rem 0.4rem', borderRadius: '4px' }} title="Delete">
                                <Trash2 size={14} />
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
      )}

    </div>
  );
}
