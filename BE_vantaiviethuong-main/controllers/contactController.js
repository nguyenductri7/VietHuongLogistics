const { pool } = require('../config/database');
const { sendContactNotification } = require('../services/emailService');

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

    const [result] = await pool.query(
      'INSERT INTO contact_messages (full_name, email, phone, company, message) VALUES (?, ?, ?, ?, ?)',
      [contact.full_name, contact.email, contact.phone, contact.company, contact.message]
    );

    let emailNotificationSent = false;
    try {
      emailNotificationSent = await sendContactNotification({
        id: result.insertId,
        ...contact,
      });
    } catch (mailError) {
      console.error('[MAIL] Không thể gửi thông báo liên hệ:', mailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Gửi tin nhắn thành công! Chúng tôi sẽ liên hệ sớm.',
      email_notification_sent: emailNotificationSent,
    });
  } catch (err) {
    console.error('submitContact error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// GET /api/admin/contacts - Admin xem tin nhắn
const getContacts = async (req, res) => {
  try {
    const { status, search = '' } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;
    let conditions = [];
    let params = [];

    if (['new', 'read', 'replied', 'archived'].includes(status)) {
      conditions.push('status = ?');
      params.push(status);
    }

    const searchTerm = String(search).trim();
    if (searchTerm) {
      conditions.push('(full_name LIKE ? OR phone LIKE ? OR email LIKE ? OR company LIKE ? OR message LIKE ?)');
      const keyword = `%${searchTerm}%`;
      params.push(keyword, keyword, keyword, keyword, keyword);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM contact_messages ${whereClause}`, params);
    const total = countResult[0].total;

    const [rows] = await pool.query(
      `SELECT * FROM contact_messages ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: rows,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
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
        SUM(status = 'replied') as replied_count,
        SUM(status = 'archived') as archived_count
       FROM contact_messages`
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

module.exports = { submitContact, getContacts, updateContactStatus, deleteContact, getContactStats };
