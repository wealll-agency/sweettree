import express from 'express';
import { submitEnquiry, getAllEnquiries, markAsRead, deleteEnquiry, submitCatalogLead, getCatalogLeads } from '../controllers/enquiryController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Public - submit contact form
router.post('/', submitEnquiry);
router.post('/catalog-leads', submitCatalogLead);

// Admin only routes
router.get('/', protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), getAllEnquiries);
router.get('/catalog-leads', protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), getCatalogLeads);
router.patch('/:id/read', protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), markAsRead);
router.delete('/:id', protect, authorizeRoles('Super Admin', 'Manager'), deleteEnquiry);

export default router;
