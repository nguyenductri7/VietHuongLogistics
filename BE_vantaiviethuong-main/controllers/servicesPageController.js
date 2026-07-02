// src/controllers/servicesPageController.js
const { pool } = require('../config/database');

const JSON_FIELDS = ['banner', 'process_steps', 'contact_info'];

// ── Tạo slug không dấu từ tiếng Việt, dùng cho service_items.slug ──
function slugify(str) {
  return str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // bỏ dấu
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ═══════════ PHẦN CỐ ĐỊNH (banner / process_steps / contact_info) ═══════════

// GET /api/services-page  (public)
const getServicesPage = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM services_page ORDER BY id DESC LIMIT 1');
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Chưa có nội dung Services.' });
    }
    const row = rows[0];
    const parsed = {};
    for (const field of JSON_FIELDS) {
      parsed[field] = typeof row[field] === 'string' ? JSON.parse(row[field]) : row[field];
    }
    res.json({ success: true, data: { id: row.id, ...parsed, updated_at: row.updated_at } });
  } catch (err) {
    console.error('Get services_page error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// PUT /api/services-page  (admin)
const updateServicesPage = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id FROM services_page ORDER BY id DESC LIMIT 1');
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Chưa có nội dung để cập nhật.' });
    }
    const pageId = rows[0].id;

    const updates = [];
    const values = [];
    for (const field of JSON_FIELDS) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(JSON.stringify(req.body[field]));
      }
    }
    if (!updates.length) {
      return res.status(400).json({ success: false, message: 'Không có dữ liệu để cập nhật.' });
    }
    updates.push('updated_by = ?');
    values.push(req.user?.id || null);
    values.push(pageId);

    await pool.query(`UPDATE services_page SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ success: true, message: 'Cập nhật thành công!' });
  } catch (err) {
    console.error('Update services_page error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// ═══════════ DANH SÁCH DỊCH VỤ (service_items) — CRUD đầy đủ ═══════════

// GET /api/services-page/items  (public) — chỉ trả dịch vụ đang active, sắp theo sort_order
const listServiceItems = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM service_items WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
    );
    const items = rows.map(r => ({
      ...r,
      tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags,
    }));
    res.json({ success: true, data: items });
  } catch (err) {
    console.error('List service_items error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// GET /api/services-page/items/admin  (admin) — trả cả item bị ẩn, để quản lý
const listServiceItemsAdmin = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM service_items ORDER BY sort_order ASC, id ASC');
    const items = rows.map(r => ({
      ...r,
      tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags,
    }));
    res.json({ success: true, data: items });
  } catch (err) {
    console.error('List service_items (admin) error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// POST /api/services-page/items  (admin) — tạo dịch vụ mới, slug tự sinh từ title
const createServiceItem = async (req, res) => {
  try {
    const { title, subtitle, description, icon_key, image, tags } = req.body;

    if (!title?.trim() || !subtitle?.trim() || !description?.trim() || !image?.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin bắt buộc.' });
    }

    let slug = slugify(title);
    if (!slug) slug = `dich-vu-${Date.now()}`;

    // Đảm bảo slug không trùng — nếu trùng thì gắn số đếm phía sau
    const [existing] = await pool.query('SELECT id FROM service_items WHERE slug = ?', [slug]);
    if (existing.length) slug = `${slug}-${Date.now()}`;

    const [maxOrderRows] = await pool.query('SELECT COALESCE(MAX(sort_order), 0) AS maxOrder FROM service_items');
    const nextOrder = maxOrderRows[0].maxOrder + 1;

    const [result] = await pool.query(
      `INSERT INTO service_items (slug, title, subtitle, description, icon_key, image, tags, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [slug, title.trim(), subtitle.trim(), description.trim(), icon_key || 'Truck', image.trim(), JSON.stringify(tags || []), nextOrder]
    );

    res.status(201).json({ success: true, message: 'Tạo dịch vụ thành công!', id: result.insertId, slug });
  } catch (err) {
    console.error('Create service_item error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// PUT /api/services-page/items/:id  (admin) — sửa nội dung, KHÔNG cho sửa slug
const updateServiceItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, description, icon_key, image, tags, is_active } = req.body;

    const [rows] = await pool.query('SELECT id FROM service_items WHERE id = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dịch vụ.' });
    }

    await pool.query(
      `UPDATE service_items
       SET title = ?, subtitle = ?, description = ?, icon_key = ?, image = ?, tags = ?, is_active = ?
       WHERE id = ?`,
      [title, subtitle, description, icon_key, image, JSON.stringify(tags || []), is_active ?? 1, id]
    );

    res.json({ success: true, message: 'Cập nhật dịch vụ thành công!' });
  } catch (err) {
    console.error('Update service_item error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// DELETE /api/services-page/items/:id  (admin)
const deleteServiceItem = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM service_items WHERE id = ?', [id]);
    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dịch vụ.' });
    }
    res.json({ success: true, message: 'Đã xóa dịch vụ.' });
  } catch (err) {
    console.error('Delete service_item error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// PUT /api/services-page/items/reorder  (admin) — body: { order: [id1, id2, id3, ...] }
const reorderServiceItems = async (req, res) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order) || !order.length) {
      return res.status(400).json({ success: false, message: 'Dữ liệu thứ tự không hợp lệ.' });
    }

    // Cập nhật sort_order tuần tự theo vị trí trong mảng order gửi lên
    await Promise.all(
      order.map((itemId, index) =>
        pool.query('UPDATE service_items SET sort_order = ? WHERE id = ?', [index + 1, itemId])
      )
    );

    res.json({ success: true, message: 'Đã lưu thứ tự mới.' });
  } catch (err) {
    console.error('Reorder service_items error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// POST /api/services-page/upload-image  (admin) — dùng uploadWebsite từ config/cloudinary.js
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn ảnh để upload.' });
    }
    res.json({ success: true, url: req.file.path, public_id: req.file.filename });
  } catch (err) {
    console.error('Upload image error:', err);
    res.status(500).json({ success: false, message: 'Lỗi khi upload ảnh.' });
  }
};

module.exports = {
  getServicesPage,
  updateServicesPage,
  listServiceItems,
  listServiceItemsAdmin,
  createServiceItem,
  updateServiceItem,
  deleteServiceItem,
  reorderServiceItems,
  uploadImage,
};