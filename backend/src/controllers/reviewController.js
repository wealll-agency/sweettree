import Review from '../models/Review.js';
import Order from '../models/Order.js';
import { logActivity } from '../middleware/logger.js';

// @desc    Add review for a product
// @route   POST /api/reviews
// @access  Private
export const createProductReview = async (req, res, next) => {
  const { productId, rating, comment, images } = req.body;

  try {
    if (!rating || !comment || !productId) {
      return res.status(400).json({ success: false, message: 'Please provide product ID, rating and comment' });
    }

    const alreadyReviewed = await Review.findOne({ user: req.user._id, product: productId });
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    // Check if user has bought this product to set verified purchase flag
    const orders = await Order.find({
      user: req.user._id,
      paymentStatus: 'Paid',
      'items.product': productId
    });
    const isVerifiedPurchase = orders.length > 0;

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating: Number(rating),
      comment,
      images: images || [],
      isVerifiedPurchase
    });

    await logActivity(req.user._id, 'ADD_REVIEW', `Submitted product review for product ID: ${productId}`, req);

    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};
