const express = require('express');
const {
  getPipeline,
  moveContact,
  getContactActivities,
  createContactActivity,
  getReminders,
  getReminderStats,
  createReminder,
  updateReminder,
  deleteReminder,
} = require('../controllers/crmController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);
router.get('/pipeline', getPipeline);
router.put('/pipeline/move', moveContact);
router.get('/reminders', getReminders);
router.get('/reminders/stats', getReminderStats);
router.put('/reminders/:id', updateReminder);
router.delete('/reminders/:id', deleteReminder);
router.get('/contacts/:id/activities', getContactActivities);
router.post('/contacts/:id/activities', createContactActivity);
router.post('/contacts/:id/reminders', createReminder);

module.exports = router;
