const { pool } = require('../config/database');

// POST /api/contact - Frontend gửi form liên hệ
const submitContact = async (req, res) => {
  try {
    const { full_name, email, phone, company, message } = req.body;

    if (!full_name || !message) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập họ tên và nội dung tin nhắn.' });
    }

    await pool.query(
      'INSERT INTO contact_messages (full_name, email, phone, company, message) VALUES (?, ?, ?, ?, ?)',
      [full_name, email || '', phone || '', company || '', message]
    );

    res.status(201).json({ success: true, message: 'Gửi tin nhắn thành công! Chúng tôi sẽ liên hệ sớm.' });
  } catch (err) {
    console.error('submitContact error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// GET /api/admin/contacts - Admin xem tin nhắn
const getContacts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let conditions = [];
    let params = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM contact_messages ${whereClause}`, params);
    const total = countResult[0].total;

    const [rows] = await pool.query(
      `SELECT * FROM contact_messages ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: rows,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), total_pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// PUT /api/admin/contacts/:id/status
const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['new', 'read', 'replied', 'archived'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ.' });
    }

    await pool.query('UPDATE contact_messages SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: 'Cập nhật trạng thái thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// DELETE /api/admin/contacts/:id
const deleteContact = async (req, res) => {
  try {
    await pool.query('DELETE FROM contact_messages WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Xóa tin nhắn thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// GET /api/admin/contacts/stats - Thống kê
const getContactStats = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(status = 'new') as new_count,
        SUM(status = 'read') as read_count,
        SUM(status = 'replied') as replied_count
       FROM contact_messages`
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

module.exports = { submitContact, getContacts, updateContactStatus, deleteContact, getContactStats };
