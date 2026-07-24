const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/auth');
const {
  getAuditHistory,
  deleteAuditEntry,
  restoreRevisionEntry,
  bulkDeleteAuditEntries,
} = require('../controllers/cmsRevisionController');

const router = express.Router();

router.get('/', authMiddleware, getAuditHistory);
router.post('/revision/:id/restore', authMiddleware, requireRole('superadmin', 'admin'), restoreRevisionEntry);
router.post('/bulk-delete', authMiddleware, requireRole('superadmin', 'admin'), bulkDeleteAuditEntries);
router.delete('/:source/:id', authMiddleware, requireRole('superadmin', 'admin'), deleteAuditEntry);

module.exports = router;
