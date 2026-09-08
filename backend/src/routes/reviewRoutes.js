import express from 'express';
import {
  createProductReview,
  getProductReviews
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../services/storageService.js';

const router = express.Router();

// Allow up to 5 images
router.post('/', protect, upload.array('images', 5), createProductReview);
router.get('/product/:productId', getProductReviews);

export default router;
