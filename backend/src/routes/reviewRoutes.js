import express from 'express';
import {
  createProductReview,
  getProductReviews,
  deleteProductReview
} from '../controllers/reviewController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';
import { upload } from '../services/storageService.js';

const router = express.Router();

// Allow up to 5 images
router.post('/', protect, upload.array('images', 5), createProductReview);
router.get('/product/:productId', getProductReviews);

// Admin route to delete a review
router.delete('/:reviewId', protect, authorizeRoles('Super Admin', 'Admin', 'Manager'), deleteProductReview);

export default router;
