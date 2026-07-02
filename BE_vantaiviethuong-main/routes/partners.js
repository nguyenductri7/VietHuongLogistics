const express = require('express');
const router = express.Router();
const {
  getPartners, getAllPartners, createPartner, updatePartner, deletePartner,
} = require('../controllers/partnerController');
const { authMiddleware } = require('../middleware/auth');
const { uploadPartner } = require('../config/cloudinary');

// GET /api/partners - Public
router.get('/', getPartners);

// GET /api/admin/partners - Admin
router.get('/admin', authMiddleware, getAllPartners);

// POST /api/admin/partners
router.post('/admin', authMiddleware, uploadPartner.single('logo'), createPartner);

// PUT /api/admin/partners/:id
router.put('/admin/:id', authMiddleware, uploadPartner.single('logo'), updatePartner);

// DELETE /api/admin/partners/:id
router.delete('/admin/:id', authMiddleware, deletePartner);

module.exports = router;
