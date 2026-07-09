import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import { logActivity } from '../middleware/logger.js';

// @desc    Get all products (with search, category filter, sorting, pagination)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const { keyword, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

    const query = {};

    // Keyword Search
    if (keyword) {
      query.$text = { $search: keyword };
    }

    // Category Filter
    if (category) {
      query.category = category;
    }

    // Price Range Filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sorting
    let sortBy = { createdAt: -1 };
    if (sort) {
      if (sort === 'priceAsc') sortBy = { price: 1 };
      else if (sort === 'priceDesc') sortBy = { price: -1 };
      else if (sort === 'rating') sortBy = { rating: -1 };
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json({ success: true, product });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin/Manager/Staff
export const createProduct = async (req, res, next) => {
  const { name, category, price, discount, description, ingredients, benefits, images, videos, batchNumber, expiryDate, stock } = req.body;

  try {
    const product = new Product({
      name,
      category,
      price,
      discount: discount || 0,
      description,
      ingredients: ingredients || [],
      benefits: benefits || [],
      images: images || [],
      videos: videos || [],
      batchNumber,
      expiryDate: expiryDate ? new Date(expiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default 1 year expiry
      stock: stock || 0
    });

    const createdProduct = await product.save();

    // Create Initial Inventory Record
    await Inventory.create({
      product: createdProduct._id,
      batchNumber: batchNumber || 'BATCH-001',
      expiryDate: expiryDate ? new Date(expiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      stockQuantity: stock || 0,
      adjustments: [{
        quantityChanged: stock || 0,
        type: 'Restock',
        reason: 'Initial Product Stock Seeding',
        adjustedBy: req.user._id
      }]
    });

    await logActivity(req.user._id, 'CREATE_PRODUCT', `Created product: ${name} (ID: ${createdProduct._id})`, req);

    res.status(201).json({ success: true, product: createdProduct });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin/Manager
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = req.body.name || product.name;
      product.category = req.body.category || product.category;
      product.price = req.body.price !== undefined ? req.body.price : product.price;
      product.discount = req.body.discount !== undefined ? req.body.discount : product.discount;
      product.description = req.body.description || product.description;
      product.ingredients = req.body.ingredients || product.ingredients;
      product.benefits = req.body.benefits || product.benefits;
      product.images = req.body.images || product.images;
      product.videos = req.body.videos || product.videos;
      
      const oldStock = product.stock;
      if (req.body.stock !== undefined) {
        product.stock = req.body.stock;
      }

      const updatedProduct = await product.save();

      // Sync Stock with Inventory if changed
      if (req.body.stock !== undefined && req.body.stock !== oldStock) {
        const diff = req.body.stock - oldStock;
        await Inventory.findOneAndUpdate(
          { product: product._id },
          { 
            $set: { stockQuantity: req.body.stock },
            $push: { 
              adjustments: {
                quantityChanged: diff,
                type: 'AuditAdjustment',
                reason: 'Manual Product Update Adjustment',
                adjustedBy: req.user._id
              } 
            }
          },
          { upsert: true, new: true }
        );
      }

      await logActivity(req.user._id, 'UPDATE_PRODUCT', `Updated product ID: ${req.params.id}`, req);
      res.json({ success: true, product: updatedProduct });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      // Remove corresponding inventory
      await Inventory.deleteMany({ product: req.params.id });

      await logActivity(req.user._id, 'DELETE_PRODUCT', `Deleted product ID: ${req.params.id}`, req);
      res.json({ success: true, message: 'Product removed successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    next(error);
  }
};
