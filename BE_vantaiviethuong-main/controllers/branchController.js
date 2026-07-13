const { pool } = require('../config/database');
const { sanitizeLegacyLocalized } = require('../utils/cmsSanitizer');

const toBoolInt = (value, fallback = 0) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'number') return value ? 1 : 0;
  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase()) ? 1 : 0;
};

const normalizeBranch = (row) => ({
  ...sanitizeLegacyLocalized(row),
  lat: Number(row.lat),
  lng: Number(row.lng),
  is_headquarter: Number(row.is_headquarter) === 1,
  is_active: Number(row.is_active) === 1,
});

const getBranches = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM branches WHERE is_active = 1 ORDER BY is_headquarter DESC, sort_order ASC, id ASC'
    );
    res.json({ success: true, data: rows.map(normalizeBranch) });
  } catch (err) {
    console.error('getBranches error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

const getAllBranches = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM branches ORDER BY is_headquarter DESC, sort_order ASC, id ASC'
    );
    res.json({ success: true, data: rows.map(normalizeBranch) });
  } catch (err) {
    console.error('getAllBranches error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

const createBranch = async (req, res) => {
  try {
    const {
      name, address, email, phone, lat, lng, image_url,
      is_headquarter, is_active, sort_order,
    } = req.body;

    if (!String(name || '').trim() || !String(address || '').trim()) {
      return res.status(400).json({ success: false, message: 'Tên và địa chỉ chi nhánh không được để trống.' });
    }

    const nextIsHeadquarter = toBoolInt(is_headquarter);
    if (nextIsHeadquarter) {
      await pool.query('UPDATE branches SET is_headquarter = 0');
    }

    const [result] = await pool.query(
      `INSERT INTO branches
       (name, address, email, phone, lat, lng, image_url, is_headquarter, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(name).trim(),
        String(address).trim(),
        String(email || '').trim(),
        String(phone || '').trim(),
        Number(lat) || 16.0707,
        Number(lng) || 108.1526,
        String(image_url || '').trim(),
        nextIsHeadquarter,
        toBoolInt(is_active, 1),
        Number.parseInt(sort_order, 10) || 0,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM branches WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Đã thêm chi nhánh.', data: normalizeBranch(rows[0]) });
  } catch (err) {
    console.error('createBranch error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const [existingRows] = await pool.query('SELECT * FROM branches WHERE id = ?', [id]);
    if (!existingRows.length) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy chi nhánh.' });
    }

    const current = existingRows[0];
    const {
      name, address, email, phone, lat, lng, image_url,
      is_headquarter, is_active, sort_order,
    } = req.body;

    const nextIsHeadquarter = toBoolInt(is_headquarter, current.is_headquarter);
    if (nextIsHeadquarter) {
      await pool.query('UPDATE branches SET is_headquarter = 0 WHERE id <> ?', [id]);
    }

    await pool.query(
      `UPDATE branches SET
       name = ?, address = ?, email = ?, phone = ?, lat = ?, lng = ?,
       image_url = ?, is_headquarter = ?, is_active = ?, sort_order = ?
       WHERE id = ?`,
      [
        String(name ?? current.name).trim(),
        String(address ?? current.address).trim(),
        String(email ?? current.email ?? '').trim(),
        String(phone ?? current.phone ?? '').trim(),
        Number(lat ?? current.lat) || 16.0707,
        Number(lng ?? current.lng) || 108.1526,
        String(image_url ?? current.image_url ?? '').trim(),
        nextIsHeadquarter,
        toBoolInt(is_active, current.is_active),
        Number.parseInt(sort_order ?? current.sort_order, 10) || 0,
        id,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM branches WHERE id = ?', [id]);
    res.json({ success: true, message: 'Đã cập nhật chi nhánh.', data: normalizeBranch(rows[0]) });
  } catch (err) {
    console.error('updateBranch error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT id FROM branches WHERE id = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy chi nhánh.' });
    }

    await pool.query('DELETE FROM branches WHERE id = ?', [id]);
    res.json({ success: true, message: 'Đã xóa chi nhánh.' });
  } catch (err) {
    console.error('deleteBranch error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

module.exports = {
  getBranches,
  getAllBranches,
  createBranch,
  updateBranch,
  deleteBranch,
};
