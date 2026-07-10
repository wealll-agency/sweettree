import express from 'express';
import { submitEnquiry, getAllEnquiries, markAsRead, deleteEnquiry } from '../controllers/enquiryController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Public - submit contact form
router.post('/', submitEnquiry);

// Admin only routes
router.get('/', protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), getAllEnquiries);
router.patch('/:id/read', protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), markAsRead);
router.delete('/:id', protect, authorizeRoles('Super Admin', 'Manager'), deleteEnquiry);

export default router;
