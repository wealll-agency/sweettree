import express from 'express';
const router = express.Router();
import { getBanners, createBanner, updateBanner, deleteBanner } from '../controllers/bannerController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

router.route('/')
  .get(getBanners)
  .post(protect, authorizeRoles('Super Admin', 'Manager'), createBanner);

router.route('/:id')
  .put(protect, authorizeRoles('Super Admin', 'Manager'), updateBanner)
  .delete(protect, authorizeRoles('Super Admin', 'Manager'), deleteBanner);

export default router;
