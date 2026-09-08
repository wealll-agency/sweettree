import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshTokenUser,
  getUserProfile,
  updateUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  getSystemSettings,
  updateSystemSettings
} from '../controllers/authController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);
router.post('/refresh', refreshTokenUser);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.route('/addresses')
  .post(protect, addAddress);
router.route('/addresses/:id')
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

router.route('/settings')
  .get(getSystemSettings)
  .put(protect, authorizeRoles('Super Admin', 'Manager'), updateSystemSettings);

export default router;
