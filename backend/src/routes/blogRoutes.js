import express from 'express';
import { getBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog } from '../controllers/blogController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getBlogs)
  .post(protect, authorizeRoles('Super Admin', 'Manager'), createBlog);

router.route('/:id')
  .put(protect, authorizeRoles('Super Admin', 'Manager'), updateBlog)
  .delete(protect, authorizeRoles('Super Admin', 'Manager'), deleteBlog);

router.route('/slug/:slug')
  .get(getBlogBySlug);

export default router;
