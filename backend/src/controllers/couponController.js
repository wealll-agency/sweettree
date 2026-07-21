import Coupon from '../models/Coupon.js';
import { logActivity } from '../middleware/logger.js';

// @desc    Create a coupon code
// @route   POST /api/coupons
// @access  Private/Admin/Manager
export const createCoupon = async (req, res, next) => {
  const { code, discountPercentage, expiryDate, usageLimit, applicableProducts, isCombo } = req.body;

  try {
    const codeUpper = code.toUpperCase().trim();
    const couponExists = await Coupon.findOne({ code: codeUpper });

    if (couponExists) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: codeUpper,
      discountPercentage,
      expiryDate: new Date(expiryDate),
      usageLimit: usageLimit || 100,
      isCombo: isCombo || false,
      applicableProducts: applicableProducts || []
    });

    await logActivity(req.user._id, 'CREATE_COUPON', `Created coupon code: ${codeUpper}`, req);

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate/Apply a coupon
// @route   POST /api/coupons/apply
// @access  Private
export const applyCoupon = async (req, res, next) => {
  const { code } = req.body;

  try {
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please enter a coupon code' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon code not found' });
    }

    if (!coupon.isValid()) {
      return res.status(400).json({ success: false, message: 'Coupon is expired, inactive, or has reached its usage limit' });
    }

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      discountPercentage: coupon.discountPercentage,
      code: coupon.code,
      isCombo: coupon.isCombo,
      applicableProducts: coupon.applicableProducts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all coupon codes
// @route   GET /api/coupons
// @access  Private/Admin/Manager/Staff
export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 }).populate('applicableProducts', 'name');
    res.json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete coupon code
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
      await coupon.deleteOne();
      await logActivity(req.user._id, 'DELETE_COUPON', `Deleted coupon ID: ${req.params.id}`, req);
      res.json({ success: true, message: 'Coupon removed successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Coupon not found' });
    }
  } catch (error) {
    next(error);
  }
};
