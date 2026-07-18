// routes/Faq.js
const express    = require('express')
const router     = express.Router()
const { authMiddleware } = require('../middleware/auth')
const {
  submitInquiry,
  getInquiries,
  getInquiryStats,
  updateStatus,
  deleteInquiry,
} = require('../controllers/faqController')

// PUBLIC
router.post('/', submitInquiry)

// ADMIN
router.get('/admin', authMiddleware, getInquiries)
router.get('/admin/stats', authMiddleware, getInquiryStats)
router.put('/admin/:id/status', authMiddleware, updateStatus)
router.delete('/admin/:id', authMiddleware, deleteInquiry)

module.exports = router
