import express from 'express';
import { getNotifications } from '../controllers/notificationController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), getNotifications);

export default router;
