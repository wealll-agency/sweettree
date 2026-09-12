import express from 'express';
const router = express.Router();
import {
  getActivePopup,
  getAllPopups,
  createPopup,
  updatePopup,
  deletePopup
} from '../controllers/promotionalPopupController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

// Public route — customer-facing, read-only
router.get('/active', getActivePopup);

// Admin routes — protected
router.route('/')
  .get(protect, authorizeRoles('Super Admin', 'Manager'), getAllPopups)
  .post(protect, authorizeRoles('Super Admin', 'Manager'), createPopup);

router.route('/:id')
  .put(protect, authorizeRoles('Super Admin', 'Manager'), updatePopup)
  .delete(protect, authorizeRoles('Super Admin', 'Manager'), deletePopup);

export default router;
