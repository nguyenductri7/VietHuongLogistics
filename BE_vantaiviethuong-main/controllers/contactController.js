const { pool } = require('../config/database');

// POST /api/contact - Frontend gửi form liên hệ
const submitContact = async (req, res) => {
  try {
    const { full_name, email, phone, company, message } = req.body;

    const contact = {
      full_name: String(full_name || '').trim(),
      email: String(email || '').trim(),
      phone: String(phone || '').trim(),
      company: String(company || '').trim(),
      message: String(message || '').trim(),
    };

    if (!contact.full_name || !contact.phone || !contact.message) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập họ tên, số điện thoại và nội dung tin nhắn.',
      });
    }

    if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      return res.status(400).json({ success: false, message: 'Địa chỉ email chưa đúng định dạng.' });
    }

    if (
      contact.full_name.length > 100 ||
      contact.email.length > 100 ||
      contact.phone.length > 20 ||
      contact.company.length > 150
    ) {
      return res.status(400).json({ success: false, message: 'Thông tin liên hệ vượt quá độ dài cho phép.' });
    }

    await pool.query(
      'INSERT INTO contact_messages (full_name, email, phone, company, message) VALUES (?, ?, ?, ?, ?)',
      [contact.full_name, contact.email, contact.phone, contact.company, contact.message]
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
