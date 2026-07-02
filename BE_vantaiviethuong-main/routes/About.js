// src/routes/about.js
const express = require('express');
const router = express.Router();

const { getAbout, updateAbout, uploadImage } = require('../controllers/aboutcontroller')
const { authMiddleware } = require('../middleware/auth'); // middleware verify JWT đang dùng cho các route admin khác
const { uploadWebsite } = require('../config/cloudinary'); // storage có sẵn, dùng chung cho ảnh hero/banner/website

// ── Public: trang About công khai gọi route này để lấy nội dung ──
router.get('/', getAbout);

// ── Admin: cần đăng nhập ──
router.put('/', authMiddleware, updateAbout);

// uploadWebsite.single('image') tự đẩy file lên Cloudinary qua CloudinaryStorage,
// kết quả nằm ở req.file.path (URL) và req.file.filename (public_id) — không cần
// gọi cloudinary.uploader.upload thủ công trong controller nữa.
router.post('/upload-image', authMiddleware, uploadWebsite.single('image'), uploadImage);

module.exports = router;