import express from 'express';
import { upload, uploadFile } from '../services/storageService.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileUrl = await uploadFile(req.file);
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      url: fileUrl
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/multiple', protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), upload.array('files', 5), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const uploadPromises = req.files.map(file => uploadFile(file));
    const urls = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      urls
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
