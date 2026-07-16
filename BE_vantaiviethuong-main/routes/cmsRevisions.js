const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getAuditHistory } = require('../controllers/cmsRevisionController');

const router = express.Router();

router.get('/', authMiddleware, getAuditHistory);

module.exports = router;
