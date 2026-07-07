const { pool } = require('../config/database');
const { deleteFromCloudinary } = require('../config/cloudinary');

const parseBooleanFlag = (value) => {
  if (value === undefined) return undefined;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'number') return value === 1 ? 1 : 0;

  const normalized = String(value).trim().toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(normalized) ? 1 : 0;
};

// GET /api/partners - Public
const getPartners = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM partners WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getPartners error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// GET /api/admin/partners - Admin (kể cả inactive)
const getAllPartners = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM partners ORDER BY sort_order ASC, id ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// POST /api/admin/partners
const createPartner = async (req, res) => {
  try {
    const { name, website_url, sort_order } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Tên đối tác không được để trống.' });

    const logo_url = req.file?.path || '';
    const logo_public_id = req.file?.filename || '';

    const [result] = await pool.query(
      'INSERT INTO partners (name, logo_url, logo_public_id, website_url, sort_order) VALUES (?, ?, ?, ?, ?)',
      [name, logo_url, logo_public_id, website_url || '', parseInt(sort_order) || 0]
    );

    const [newPartner] = await pool.query('SELECT * FROM partners WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Thêm đối tác thành công!', data: newPartner[0] });
  } catch (err) {
    console.error('createPartner error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// PUT /api/admin/partners/:id
const updatePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, website_url, sort_order, is_active } = req.body;

    const [existing] = await pool.query('SELECT * FROM partners WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Không tìm thấy đối tác.' });

    const partner = existing[0];
    let logo_url = partner.logo_url;
    let logo_public_id = partner.logo_public_id;
    const nextIsActive = parseBooleanFlag(is_active);

    if (req.file) {
      if (partner.logo_public_id) await deleteFromCloudinary(partner.logo_public_id).catch(console.error);
      logo_url = req.file.path;
      logo_public_id = req.file.filename;
    }

    await pool.query(
      'UPDATE partners SET name=?, logo_url=?, logo_public_id=?, website_url=?, sort_order=?, is_active=? WHERE id=?',
      [
        name || partner.name,
        logo_url,
        logo_public_id,
        website_url ?? partner.website_url,
        sort_order !== undefined ? parseInt(sort_order) : partner.sort_order,
        nextIsActive !== undefined ? nextIsActive : partner.is_active,
        id,
      ]
    );

    const [updated] = await pool.query('SELECT * FROM partners WHERE id = ?', [id]);
    res.json({ success: true, message: 'Cập nhật đối tác thành công!', data: updated[0] });
  } catch (err) {
    console.error('updatePartner error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// DELETE /api/admin/partners/:id
const deletePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM partners WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Không tìm thấy đối tác.' });

    if (rows[0].logo_public_id) await deleteFromCloudinary(rows[0].logo_public_id).catch(console.error);
    await pool.query('DELETE FROM partners WHERE id = ?', [id]);
    res.json({ success: true, message: 'Xóa đối tác thành công!' });
  } catch (err) {
    console.error('deletePartner error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

module.exports = { getPartners, getAllPartners, createPartner, updatePartner, deletePartner };
