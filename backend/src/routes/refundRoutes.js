import express from 'express';
import { protect, authorizeRoles } from '../middleware/auth.js';
import { 
  getRefundRequests, 
  updateRefundStatus, 
  createMockRefundRequest,
  createCustomerRefundRequest
} from '../controllers/refundController.js';

const router = express.Router();

router.route('/')
  .get(protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), getRefundRequests);

router.route('/:id/status')
  .put(protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), updateRefundStatus);

// Mock route for testing
router.route('/mock')
  .post(protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), createMockRefundRequest);

// Customer route for creating a refund/cancel request
router.route('/request/:orderId')
  .post(protect, createCustomerRefundRequest);

export default router;
