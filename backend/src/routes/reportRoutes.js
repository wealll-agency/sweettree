import express from 'express';
import {
  getDashboardSummary,
  exportSalesReportPDF,
  exportSalesReportExcel
} from '../controllers/reportController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, authorizeRoles('Super Admin', 'Manager'), getDashboardSummary);
router.get('/export/pdf', protect, authorizeRoles('Super Admin', 'Manager'), exportSalesReportPDF);
router.get('/export/excel', protect, authorizeRoles('Super Admin', 'Manager'), exportSalesReportExcel);

export default router;
