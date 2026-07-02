// controllers/faqContentController.js
const { pool } = require('../config/database')

// ═══════════════════════════════════════════════════════════════
//  PUBLIC
// ═══════════════════════════════════════════════════════════════

// GET /api/faq-content  — trả về toàn bộ categories + items cho FaqPage
const getPublicContent = async (req, res) => {
  try {
    const [cats] = await pool.query(
      `SELECT id, \`key\`, label, sort_order
       FROM faq_categories
       WHERE is_active = 1
       ORDER BY sort_order ASC`
    )
    const [items] = await pool.query(
      `SELECT id, category_id, question, answer, sort_order
       FROM faq_items
       WHERE is_active = 1
       ORDER BY category_id ASC, sort_order ASC`
    )
    // Gom items vào từng category
    const result = cats.map(cat => ({
      ...cat,
      items: items.filter(i => i.category_id === cat.id),
    }))
    return res.json(result)
  } catch (err) {
    console.error('[FAQ-CONTENT] getPublicContent error:', err)
    return res.status(500).json({ message: 'Lỗi tải dữ liệu.' })
  }
}

// ═══════════════════════════════════════════════════════════════
//  ADMIN — CATEGORIES
// ═══════════════════════════════════════════════════════════════

// GET /api/faq-content/admin/categories
const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM faq_categories ORDER BY sort_order ASC`
    )
    return res.json(rows)
  } catch (err) {
    console.error('[FAQ-CONTENT] getCategories error:', err)
    return res.status(500).json({ message: 'Lỗi tải dữ liệu.' })
  }
}

// POST /api/faq-content/admin/categories
const createCategory = async (req, res) => {
  try {
    const { key, label, sort_order = 0 } = req.body
    if (!key?.trim() || !label?.trim()) {
      return res.status(400).json({ message: 'key và label là bắt buộc.' })
    }
    const [result] = await pool.query(
      `INSERT INTO faq_categories (\`key\`, label, sort_order) VALUES (?, ?, ?)`,
      [key.trim(), label.trim(), sort_order]
    )
    return res.status(201).json({ message: 'Tạo danh mục thành công.', id: result.insertId })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Key danh mục đã tồn tại.' })
    }
    console.error('[FAQ-CONTENT] createCategory error:', err)
    return res.status(500).json({ message: 'Lỗi server.' })
  }
}

// PUT /api/faq-content/admin/categories/:id
const updateCategory = async (req, res) => {
  try {
    const { label, sort_order, is_active } = req.body
    const fields = [], vals = []
    if (label !== undefined)      { fields.push('label = ?');      vals.push(label) }
    if (sort_order !== undefined) { fields.push('sort_order = ?'); vals.push(sort_order) }
    if (is_active !== undefined)  { fields.push('is_active = ?');  vals.push(is_active ? 1 : 0) }
    if (!fields.length) return res.status(400).json({ message: 'Không có dữ liệu cập nhật.' })

    vals.push(req.params.id)
    const [result] = await pool.query(
      `UPDATE faq_categories SET ${fields.join(', ')} WHERE id = ?`, vals
    )
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy danh mục.' })
    return res.json({ message: 'Cập nhật danh mục thành công.' })
  } catch (err) {
    console.error('[FAQ-CONTENT] updateCategory error:', err)
    return res.status(500).json({ message: 'Lỗi server.' })
  }
}

// DELETE /api/faq-content/admin/categories/:id  (cascade xóa items luôn)
const deleteCategory = async (req, res) => {
  try {
    const [result] = await pool.query(
      `DELETE FROM faq_categories WHERE id = ?`, [req.params.id]
    )
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy danh mục.' })
    return res.json({ message: 'Đã xóa danh mục.' })
  } catch (err) {
    console.error('[FAQ-CONTENT] deleteCategory error:', err)
    return res.status(500).json({ message: 'Lỗi server.' })
  }
}

// ═══════════════════════════════════════════════════════════════
//  ADMIN — ITEMS
// ═══════════════════════════════════════════════════════════════

// GET /api/faq-content/admin/categories/:catId/items
const getItems = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM faq_items WHERE category_id = ? ORDER BY sort_order ASC`,
      [req.params.catId]
    )
    return res.json(rows)
  } catch (err) {
    console.error('[FAQ-CONTENT] getItems error:', err)
    return res.status(500).json({ message: 'Lỗi tải dữ liệu.' })
  }
}

// POST /api/faq-content/admin/categories/:catId/items
const createItem = async (req, res) => {
  try {
    const { question, answer, sort_order = 0 } = req.body
    if (!question?.trim() || !answer?.trim()) {
      return res.status(400).json({ message: 'question và answer là bắt buộc.' })
    }
    const [result] = await pool.query(
      `INSERT INTO faq_items (category_id, question, answer, sort_order) VALUES (?, ?, ?, ?)`,
      [req.params.catId, question.trim(), answer.trim(), sort_order]
    )
    return res.status(201).json({ message: 'Tạo câu hỏi thành công.', id: result.insertId })
  } catch (err) {
    console.error('[FAQ-CONTENT] createItem error:', err)
    return res.status(500).json({ message: 'Lỗi server.' })
  }
}

// PUT /api/faq-content/admin/items/:id
const updateItem = async (req, res) => {
  try {
    const { question, answer, sort_order, is_active } = req.body
    const fields = [], vals = []
    if (question !== undefined)   { fields.push('question = ?');   vals.push(question) }
    if (answer !== undefined)     { fields.push('answer = ?');     vals.push(answer) }
    if (sort_order !== undefined) { fields.push('sort_order = ?'); vals.push(sort_order) }
    if (is_active !== undefined)  { fields.push('is_active = ?');  vals.push(is_active ? 1 : 0) }
    if (!fields.length) return res.status(400).json({ message: 'Không có dữ liệu cập nhật.' })

    vals.push(req.params.id)
    const [result] = await pool.query(
      `UPDATE faq_items SET ${fields.join(', ')} WHERE id = ?`, vals
    )
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy câu hỏi.' })
    return res.json({ message: 'Cập nhật câu hỏi thành công.' })
  } catch (err) {
    console.error('[FAQ-CONTENT] updateItem error:', err)
    return res.status(500).json({ message: 'Lỗi server.' })
  }
}

// DELETE /api/faq-content/admin/items/:id
const deleteItem = async (req, res) => {
  try {
    const [result] = await pool.query(
      `DELETE FROM faq_items WHERE id = ?`, [req.params.id]
    )
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy câu hỏi.' })
    return res.json({ message: 'Đã xóa câu hỏi.' })
  } catch (err) {
    console.error('[FAQ-CONTENT] deleteItem error:', err)
    return res.status(500).json({ message: 'Lỗi server.' })
  }
}

module.exports = {
  getPublicContent,
  getCategories, createCategory, updateCategory, deleteCategory,
  getItems, createItem, updateItem, deleteItem,
}