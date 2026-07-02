// routes/FaqContent.js
const express = require('express')
const router  = express.Router()
const { authMiddleware } = require('../middleware/auth')
const {
  getPublicContent,
  getCategories, createCategory, updateCategory, deleteCategory,
  getItems, createItem, updateItem, deleteItem,
} = require('../controllers/faqContentController')

// ── PUBLIC ────────────────────────────────────────────────────────────────────
// FaqPage.jsx fetch toàn bộ nội dung
router.get('/', getPublicContent)

// ── ADMIN — Categories ────────────────────────────────────────────────────────
router.get   ('/admin/categories',          authMiddleware, getCategories)
router.post  ('/admin/categories',          authMiddleware, createCategory)
router.put   ('/admin/categories/:id',      authMiddleware, updateCategory)
router.delete('/admin/categories/:id',      authMiddleware, deleteCategory)

// ── ADMIN — Items ─────────────────────────────────────────────────────────────
router.get   ('/admin/categories/:catId/items', authMiddleware, getItems)
router.post  ('/admin/categories/:catId/items', authMiddleware, createItem)
router.put   ('/admin/items/:id',               authMiddleware, updateItem)
router.delete('/admin/items/:id',               authMiddleware, deleteItem)

module.exports = router