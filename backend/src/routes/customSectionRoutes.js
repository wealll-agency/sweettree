import express from 'express';
import {
  getCustomSections,
  createCustomSection,
  updateCustomSection,
  deleteCustomSection
} from '../controllers/customSectionController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Public route to get custom sections for homepage
// Admin routes for managing custom sections
router.route('/')
  .get(getCustomSections)
  .post(protect, authorizeRoles('Super Admin', 'Manager'), createCustomSection);

router.route('/:id')
  .put(protect, authorizeRoles('Super Admin', 'Manager'), updateCustomSection)
  .delete(protect, authorizeRoles('Super Admin', 'Manager'), deleteCustomSection);

export default router;
