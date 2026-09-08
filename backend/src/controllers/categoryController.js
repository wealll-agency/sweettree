import Category from '../models/Category.js';

// Default initial categories if DB is empty
const defaultCategories = [
  { name: 'Dry Fruits', subCategories: ['Nuts', 'Raisins', 'Dates', 'Almonds', 'Cashews', 'Pistachios'] },
  { name: 'Healthy Snacking', subCategories: ['Seeds', 'Roasted Mixes', 'Trail Mixes', 'Snack Poppers'] },
  { name: 'Combo Gift Box', subCategories: ['Festive Packs', 'Gifting Assortment', 'Dry Fruit Boxes'] },
  { name: 'Flavoured Nuts', subCategories: ['Peri Peri', 'Salted', 'BBQ', 'Pudina'] },
  { name: 'Seeds And Berries', subCategories: ['Chia Seeds', 'Pumpkin Seeds', 'Cranberries', 'Blueberries'] }
];

// @desc    Get all categories & subcategories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    let categories = await Category.find({}).sort({ name: 1 });

    // Seed defaults if database has no categories yet
    if (categories.length === 0) {
      await Category.insertMany(defaultCategories);
      categories = await Category.find({}).sort({ name: 1 });
    }

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new main category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res, next) => {
  try {
    const { name, subCategory } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const trimmedName = name.trim();
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let category = await Category.findOne({ name: { $regex: new RegExp(`^${escapeRegex(trimmedName)}$`, 'i') } });

    if (category) {
      // If category exists, and a subcategory was provided, append subcategory
      if (subCategory && subCategory.trim()) {
        const trimmedSub = subCategory.trim();
        if (!category.subCategories.some(s => s.toLowerCase() === trimmedSub.toLowerCase())) {
          category.subCategories.push(trimmedSub);
          await category.save();
        }
        return res.status(200).json({ success: true, data: category, message: 'Subcategory added to existing category' });
      } else {
        return res.status(400).json({ success: false, message: `Category "${category.name}" already exists` });
      }
    } else {
      // Create new category
      const subs = subCategory && subCategory.trim() ? [subCategory.trim()] : [];
      category = await Category.create({
        name: trimmedName,
        subCategories: subs
      });
    }

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a subcategory to an existing category
// @route   POST /api/categories/:id/subcategories
// @access  Private/Admin
export const addSubCategory = async (req, res, next) => {
  try {
    const { subCategory } = req.body;

    if (!subCategory || !subCategory.trim()) {
      return res.status(400).json({ success: false, message: 'Subcategory name is required' });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const trimmedSub = subCategory.trim();
    if (!category.subCategories.some(s => s.toLowerCase() === trimmedSub.toLowerCase())) {
      category.subCategories.push(trimmedSub);
      await category.save();
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a main category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a subcategory from a category
// @route   DELETE /api/categories/:id/subcategories
// @access  Private/Admin
export const deleteSubCategory = async (req, res, next) => {
  try {
    const { subCategory } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    category.subCategories = category.subCategories.filter(
      sub => sub.toLowerCase() !== (subCategory || '').trim().toLowerCase()
    );
    await category.save();

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};
