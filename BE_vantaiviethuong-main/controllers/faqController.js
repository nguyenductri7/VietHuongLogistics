// controllers/faqController.js
const { pool } = require('../config/database')
const { sendFaqNotification } = require('../services/emailService')
const { recordAdminAudit } = require('../services/adminAuditService')

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

// [ADMIN] GET /api/faq-inquiries/admin/stats
const getInquiryStats = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        COUNT(*) AS total,
        SUM(status = 'pending') AS pending_count,
        SUM(status = 'inprogress') AS inprogress_count,
        SUM(status = 'done') AS done_count
       FROM faq_inquiries`
    )
    return res.json({
      success: true,
      data: {
        total: Number(rows[0]?.total) || 0,
        pending_count: Number(rows[0]?.pending_count) || 0,
        inprogress_count: Number(rows[0]?.inprogress_count) || 0,
        done_count: Number(rows[0]?.done_count) || 0,
      },
    })
  } catch (err) {
    console.error('[FAQ] getInquiryStats error:', err)
    return res.status(500).json({ success: false, message: 'Lỗi tải thống kê.' })
  }
}

// [ADMIN] PUT /api/faq-inquiries/admin/:id/status
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body
    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ.' })
    }
    const [beforeRows] = await pool.query('SELECT * FROM faq_inquiries WHERE id = ?', [req.params.id])
    if (!beforeRows.length) {
      return res.status(404).json({ message: 'Không tìm thấy câu hỏi.' })
    }
    const [result] = await pool.query(
      `UPDATE faq_inquiries SET status = ? WHERE id = ?`,
      [status, req.params.id]
    )
    const [afterRows] = await pool.query('SELECT * FROM faq_inquiries WHERE id = ?', [req.params.id])
    await recordAdminAudit({
      module: 'faq', action: 'status', entityType: 'faq_inquiry', entityId: req.params.id,
      summary: `Cập nhật trạng thái thắc mắc của ${beforeRows[0].name}`,
      before: beforeRows[0], after: afterRows[0], userId: req.user?.id,
    })
    return res.json({ message: 'Cập nhật trạng thái thành công.' })
  } catch (err) {
    console.error('[FAQ] updateStatus error:', err)
    return res.status(500).json({ message: 'Lỗi server.' })
  }
}

// [ADMIN] DELETE /api/faq-inquiries/admin/:id
const deleteInquiry = async (req, res) => {
  try {
    const [beforeRows] = await pool.query('SELECT * FROM faq_inquiries WHERE id = ?', [req.params.id])
    if (!beforeRows.length) {
      return res.status(404).json({ message: 'Không tìm thấy câu hỏi.' })
    }
    const [result] = await pool.query(
      `DELETE FROM faq_inquiries WHERE id = ?`,
      [req.params.id]
    )
    await recordAdminAudit({
      module: 'faq', action: 'delete', entityType: 'faq_inquiry', entityId: req.params.id,
      summary: `Xóa thắc mắc của ${beforeRows[0].name}`, before: beforeRows[0], userId: req.user?.id,
    })
    return res.json({ message: 'Đã xóa câu hỏi.' })
  } catch (err) {
    console.error('[FAQ] deleteInquiry error:', err)
    return res.status(500).json({ message: 'Lỗi server.' })
  }
}

module.exports = { submitInquiry, getInquiries, getInquiryStats, updateStatus, deleteInquiry }
