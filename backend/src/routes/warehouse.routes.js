import express from 'express';
import { 
  getWarehouses, 
  getWarehouseById, 
  createWarehouse, 
  updateWarehouse, 
  deleteWarehouse 
} from '../controllers/warehouse.controller.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, authorizeRoles('Admin'), getWarehouses)
  .post(protect, authorizeRoles('Admin'), createWarehouse);

router.route('/:id')
  .get(protect, authorizeRoles('Admin'), getWarehouseById)
  .put(protect, authorizeRoles('Admin'), updateWarehouse)
  .delete(protect, authorizeRoles('Admin'), deleteWarehouse);

export default router;
