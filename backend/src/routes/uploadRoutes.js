import express from 'express';
import multer from 'multer';
import { upload, uploadFile } from '../services/storageService.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

const handleSingleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer upload error:', err.message);
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ success: false, message: err.message || 'File upload failed' });
    }
    next();
  });
};

const handleMultipleUpload = (req, res, next) => {
  upload.array('files', 5)(req, res, (err) => {
    if (err) {
      console.error('Multer array upload error:', err.message);
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ success: false, message: err.message || 'Files upload failed' });
    }
    next();
  });
};

router.post('/', protect, authorizeRoles('Super Admin', 'Manager', 'Staff', 'Admin'), handleSingleUpload, async (req, res, next) => {
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
    console.error('uploadFile processing error detailed:', error);
    res.status(500).json({ success: false, message: error.message, stack: error.stack });
  }
});

router.post('/multiple', protect, authorizeRoles('Super Admin', 'Manager', 'Staff', 'Admin'), handleMultipleUpload, async (req, res, next) => {
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
    console.error('uploadFiles processing error:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to process uploads' });
  }
});

export default router;
