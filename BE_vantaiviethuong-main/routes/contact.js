const express = require('express');
const router = express.Router();
const {
  submitContact, getContacts, updateContactStatus, deleteContact, getContactStats,
} = require('../controllers/contactController');
const { authMiddleware } = require('../middleware/auth');

// POST /api/contact - Public (form liên hệ)
router.post('/', submitContact);

// GET /api/admin/contacts
router.get('/admin', authMiddleware, getContacts);

// GET /api/admin/contacts/stats
router.get('/admin/stats', authMiddleware, getContactStats);

// PUT /api/admin/contacts/:id/status
router.put('/admin/:id/status', authMiddleware, updateContactStatus);

// DELETE /api/admin/contacts/:id
router.delete('/admin/:id', authMiddleware, deleteContact);

module.exports = router;
