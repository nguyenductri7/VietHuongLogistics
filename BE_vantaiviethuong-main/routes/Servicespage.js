// src/routes/servicesPage.js
const express = require('express');
const router = express.Router();

const {
  getServicesPage, updateServicesPage,
  listServiceItems, listServiceItemsAdmin,
  createServiceItem, updateServiceItem, deleteServiceItem, reorderServiceItems,
  uploadImage,
} = require('../controllers/servicesPageController');

const { authMiddleware } = require('../middleware/auth');
const { uploadWebsite } = require('../config/cloudinary');

// ── Public ──
router.get('/', getServicesPage);
router.get('/items', listServiceItems);

// ── Admin: phần cố định ──
router.put('/', authMiddleware, updateServicesPage);

// ── Admin: CRUD danh sách dịch vụ ──
router.get('/items/admin', authMiddleware, listServiceItemsAdmin);
router.post('/items', authMiddleware, createServiceItem);
router.put('/items/reorder', authMiddleware, reorderServiceItems);
router.put('/items/:id', authMiddleware, updateServiceItem);
router.delete('/items/:id', authMiddleware, deleteServiceItem);

// ── Admin: upload ảnh ──
router.post('/upload-image', authMiddleware, uploadWebsite.single('image'), uploadImage);

module.exports = router;