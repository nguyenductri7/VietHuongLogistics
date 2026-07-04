// controllers/faqController.js
const { pool } = require('../config/database')
const { sendFaqNotification } = require('../services/emailService')

const ALLOWED_STATUSES = ['pending', 'inprogress', 'done']

// [PUBLIC] POST /api/faq-inquiries
const submitInquiry = async (req, res) => {
  try {
    const { name, phone, question } = req.body
    if (!name?.trim() || !phone?.trim() || !question?.trim()) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' })
    }
    const [result] = await pool.query(
      `INSERT INTO faq_inquiries (name, phone, question) VALUES (?, ?, ?)`,
      [name.trim(), phone.trim(), question.trim()]
    )

    let emailNotificationSent = false
    try {
      emailNotificationSent = await sendFaqNotification({
        id: result.insertId,
        name: name.trim(),
        phone: phone.trim(),
        question: question.trim(),
      })
    } catch (mailError) {
      console.error('[MAIL] Không thể gửi thông báo FAQ:', mailError.message)
    }

    return res.status(201).json({
      message: 'Câu hỏi đã được gửi thành công!',
      id: result.insertId,
      email_notification_sent: emailNotificationSent,
    })
  } catch (err) {
    console.error('[FAQ] submitInquiry error:', err)
    return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại.' })
  }
}

// [ADMIN] GET /api/faq-inquiries/admin
const getInquiries = async (req, res) => {
  try {
    const { status, search } = req.query
    let sql    = `SELECT * FROM faq_inquiries WHERE 1=1`
    const vals = []

    if (status && ALLOWED_STATUSES.includes(status)) {
      sql += ` AND status = ?`
      vals.push(status)
    }
    if (search?.trim()) {
      const like = `%${search.trim()}%`
      sql += ` AND (name LIKE ? OR phone LIKE ? OR question LIKE ?)`
      vals.push(like, like, like)
    }
    sql += ` ORDER BY created_at DESC`

    const [rows] = await pool.query(sql, vals)
    return res.json(rows)
  } catch (err) {
    console.error('[FAQ] getInquiries error:', err)
    return res.status(500).json({ message: 'Lỗi tải dữ liệu.' })
  }
}

// [ADMIN] PUT /api/faq-inquiries/admin/:id/status
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body
    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ.' })
    }
    const [result] = await pool.query(
      `UPDATE faq_inquiries SET status = ? WHERE id = ?`,
      [status, req.params.id]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy câu hỏi.' })
    }
    return res.json({ message: 'Cập nhật trạng thái thành công.' })
  } catch (err) {
    console.error('[FAQ] updateStatus error:', err)
    return res.status(500).json({ message: 'Lỗi server.' })
  }
}

// [ADMIN] DELETE /api/faq-inquiries/admin/:id
const deleteInquiry = async (req, res) => {
  try {
    const [result] = await pool.query(
      `DELETE FROM faq_inquiries WHERE id = ?`,
      [req.params.id]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy câu hỏi.' })
    }
    return res.json({ message: 'Đã xóa câu hỏi.' })
  } catch (err) {
    console.error('[FAQ] deleteInquiry error:', err)
    return res.status(500).json({ message: 'Lỗi server.' })
  }
}

module.exports = { submitInquiry, getInquiries, updateStatus, deleteInquiry }
