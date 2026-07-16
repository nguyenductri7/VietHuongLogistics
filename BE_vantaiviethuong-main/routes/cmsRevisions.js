const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { getAuditHistory, deleteAuditEntry } = require('../controllers/cmsRevisionController');

const router = express.Router();

router.get('/', authMiddleware, getAuditHistory);
router.delete('/:source/:id', authMiddleware, requireRole('superadmin', 'admin'), deleteAuditEntry);

module.exports = router;
