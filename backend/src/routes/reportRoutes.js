import express from 'express';
import {
  getDashboardSummary,
  getSalesChartData,
  exportSalesReportPDF,
  exportSalesReportExcel,
  getSidebarStats
} from '../controllers/reportController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, authorizeRoles('Super Admin', 'Manager'), getDashboardSummary);
router.get('/sales-chart', protect, authorizeRoles('Super Admin', 'Manager'), getSalesChartData);
router.get('/export/pdf', protect, authorizeRoles('Super Admin', 'Manager'), exportSalesReportPDF);
router.get('/export/excel', protect, authorizeRoles('Super Admin', 'Manager'), exportSalesReportExcel);
router.get('/sidebar-stats', protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), getSidebarStats);

export default router;
