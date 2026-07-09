import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/ProductController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';
import { auditRoute } from '../middleware/logger.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), auditRoute('CREATE_PRODUCT'), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, authorizeRoles('Super Admin', 'Manager'), auditRoute('UPDATE_PRODUCT'), updateProduct)
  .delete(protect, authorizeRoles('Super Admin'), auditRoute('DELETE_PRODUCT'), deleteProduct);

export default router;
