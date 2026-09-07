import express from 'express';
import {
  createCoupon,
  applyCoupon,
  getCoupons,
  getPublicCoupons,
  deleteCoupon,
  getCouponUsage
} from '../controllers/couponController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';
import { auditRoute } from '../middleware/logger.js';

const router = express.Router();

router.get('/public', getPublicCoupons);

router.route('/')
  .post(protect, authorizeRoles('Super Admin', 'Manager'), auditRoute('CREATE_COUPON'), createCoupon)
  .get(protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), getCoupons);

router.post('/apply', protect, applyCoupon);

router.route('/:id')
  .delete(protect, authorizeRoles('Super Admin'), auditRoute('DELETE_COUPON'), deleteCoupon);

router.get('/:code/usage', protect, authorizeRoles('Super Admin', 'Manager'), getCouponUsage);

export default router;
