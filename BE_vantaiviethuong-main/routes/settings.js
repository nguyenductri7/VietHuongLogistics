const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, updateSettingImage } = require('../controllers/settingsController');
const { authMiddleware } = require('../middleware/auth');
const { uploadWebsite } = require('../config/cloudinary');

// GET /api/settings - Public (frontend lấy thông tin website)
router.get('/', getSettings);

// PUT /api/admin/settings - Cập nhật text settings
router.put('/admin', authMiddleware, updateSettings);

// PUT /api/admin/settings/image/:key - Upload ảnh
router.put('/admin/image/:key', authMiddleware, uploadWebsite.single('image'), updateSettingImage);

module.exports = router;
