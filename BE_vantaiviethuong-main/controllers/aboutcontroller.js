// src/controllers/aboutController.js
const { pool } = require('../config/database');
const { sanitizeLegacyLocalized } = require('../utils/cmsSanitizer');

// ── Các field JSON hợp lệ trong bảng, dùng để validate khi update ──
const JSON_FIELDS = ['hero', 'stats', 'identity', 'services', 'timeline', 'values_section'];

const EMPTY_ABOUT_PAGE = {
  hero: {},
  stats: [],
  identity: {},
  services: [],
  timeline: [],
  values_section: [],
};

function parseJson(value, fallback) {
  try {
    if (value === null || value === undefined) return fallback;
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
}

// GET /api/about
// Trả về toàn bộ nội dung trang About (public, không cần đăng nhập)
const getAbout = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM about_page ORDER BY id DESC LIMIT 1');

    if (!rows.length) {
      return res.json({ success: true, data: { id: null, ...EMPTY_ABOUT_PAGE, updated_at: null } });
    }

    const row = rows[0];

    // mysql2 tự parse cột JSON thành object/array trong Node, nhưng phòng trường hợp
    // driver trả về string thì parse thủ công để tránh lỗi phía frontend.
    const parsed = {};
    for (const field of JSON_FIELDS) {
      parsed[field] = parseJson(row[field], EMPTY_ABOUT_PAGE[field]);
    }

    res.json({
      success: true,
      data: sanitizeLegacyLocalized({
        id: row.id,
        ...parsed,
        updated_at: row.updated_at,
      }),
    });
  } catch (err) {
    console.error('Get about error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// PUT /api/about
// Cập nhật một hoặc nhiều section cùng lúc. Body: { hero?, stats?, identity?, services?, timeline?, values_section? }
// Cần đăng nhập (route được bọc bởi middleware auth ở routes/about.js)
const updateAbout = async (req, res) => {
  try {
    let [rows] = await pool.query('SELECT id FROM about_page ORDER BY id DESC LIMIT 1');
    if (!rows.length) {
      const [result] = await pool.query(
        `INSERT INTO about_page (hero, stats, identity, services, timeline, values_section)
         VALUES (?, ?, ?, ?, ?, ?)`,
        JSON_FIELDS.map(field => JSON.stringify(EMPTY_ABOUT_PAGE[field]))
      );
      rows = [{ id: result.insertId }];
    }
    const aboutId = rows[0].id;

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
    values.push(aboutId);

    await pool.query(
      `UPDATE about_page SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ success: true, message: 'Cập nhật trang About thành công!' });
  } catch (err) {
    console.error('Update about error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// POST /api/about/upload-image
// Route dùng middleware uploadWebsite (multer-storage-cloudinary) ở routes/about.js,
// nên khi vào tới đây, file ĐÃ được đẩy lên Cloudinary rồi. req.file.path là URL ảnh,
// req.file.filename là public_id (cần khi muốn xóa ảnh sau này).
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn ảnh để upload.' });
    }

    res.json({
      success: true,
      url: req.file.path,
      public_id: req.file.filename,
    });
  } catch (err) {
    console.error('Upload image error:', err);
    res.status(500).json({ success: false, message: 'Lỗi khi upload ảnh.' });
  }
};

module.exports = { getAbout, updateAbout, uploadImage };
