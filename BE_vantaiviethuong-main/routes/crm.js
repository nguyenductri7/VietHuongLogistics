const express = require('express');
const {
  getPipeline,
  moveContact,
  getContactActivities,
  createContactActivity,
} = require('../controllers/crmController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);
router.get('/pipeline', getPipeline);
router.put('/pipeline/move', moveContact);
router.get('/contacts/:id/activities', getContactActivities);
router.post('/contacts/:id/activities', createContactActivity);

module.exports = router;
