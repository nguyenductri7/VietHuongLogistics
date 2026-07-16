const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const {
  getHistory,
  getRevision,
  getLatestDraft,
  saveDraft,
  publish,
  restore,
} = require('../controllers/cmsRevisionController');

const router = express.Router();

router.use(authMiddleware);
router.get('/:module', getHistory);
router.get('/:module/draft/latest', getLatestDraft);
router.get('/:module/:id', getRevision);
router.post('/:module/draft', saveDraft);
router.post('/:module/publish', publish);
router.post('/:module/:id/restore', restore);

module.exports = router;
