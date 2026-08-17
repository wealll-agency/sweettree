import CustomSection from '../models/CustomSection.js';

// @desc    Get all custom sections
// @route   GET /api/custom-sections
// @access  Public (for homepage) and Private/Admin (for management)
export const getCustomSections = async (req, res) => {
  const { activeOnly } = req.query;
  
  const query = {};
  if (activeOnly === 'true') {
    query.isActive = true;
  }

  // Find all sections, populate the actual products
  const sections = await CustomSection.find(query)
    .populate({
      path: 'products',
      select: 'name price discount discountType images inStock stock isActive healthyProduct isFeatured',
      match: { isActive: true, stock: { $gt: 0 } } // Only return active and in-stock products
    })
    .sort({ order: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    sections
  });
};

// @desc    Create a custom section
// @route   POST /api/custom-sections
// @access  Private/Admin
export const createCustomSection = async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Section title is required' });
  }

  const existingSection = await CustomSection.findOne({ title });
  if (existingSection) {
    return res.status(400).json({ success: false, message: 'A section with this title already exists' });
  }

  const section = await CustomSection.create({
    title,
    products: []
  });

  res.status(201).json({
    success: true,
    message: 'Section created successfully',
    section
  });
};

// @desc    Update a custom section (title, isActive, products)
// @route   PUT /api/custom-sections/:id
// @access  Private/Admin
export const updateCustomSection = async (req, res) => {
  const { id } = req.params;
  const { title, isActive, products, order } = req.body;

  const section = await CustomSection.findById(id);

  if (!section) {
    return res.status(404).json({ success: false, message: 'Section not found' });
  }

  // Check title uniqueness if updating title
  if (title && title !== section.title) {
    const existingSection = await CustomSection.findOne({ title });
    if (existingSection) {
      return res.status(400).json({ success: false, message: 'A section with this title already exists' });
    }
    section.title = title;
  }

  if (isActive !== undefined) section.isActive = isActive;
  if (products !== undefined) section.products = products;
  if (order !== undefined) section.order = order;

  const updatedSection = await section.save();

  // Return populated updated section
  const populatedSection = await CustomSection.findById(updatedSection._id).populate('products');

  res.status(200).json({
    success: true,
    message: 'Section updated successfully',
    section: populatedSection
  });
};

// @desc    Delete a custom section
// @route   DELETE /api/custom-sections/:id
// @access  Private/Admin
export const deleteCustomSection = async (req, res) => {
  const { id } = req.params;

  const section = await CustomSection.findById(id);

  if (!section) {
    return res.status(404).json({ success: false, message: 'Section not found' });
  }

  await section.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Section deleted successfully'
  });
};
