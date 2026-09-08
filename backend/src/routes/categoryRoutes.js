import express from 'express';
import {
  getCategories,
  createCategory,
  addSubCategory,
  deleteCategory,
  deleteSubCategory
} from '../controllers/categoryController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';
import { auditRoute } from '../middleware/logger.js';

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), auditRoute('CREATE_CATEGORY'), createCategory);

router.route('/:id')
  .delete(protect, authorizeRoles('Super Admin', 'Manager'), auditRoute('DELETE_CATEGORY'), deleteCategory);

router.route('/:id/subcategories')
  .post(protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), auditRoute('ADD_SUBCATEGORY'), addSubCategory)
  .delete(protect, authorizeRoles('Super Admin', 'Manager'), auditRoute('DELETE_SUBCATEGORY'), deleteSubCategory);

export default router;
