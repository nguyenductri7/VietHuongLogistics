const { pool } = require('../config/database');
const { deleteFromCloudinary } = require('../config/cloudinary');

// GET /api/settings - Lấy tất cả settings (public)
const getSettings = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT setting_key, setting_value, setting_type, label FROM website_settings ORDER BY id ASC'
    );

    // Chuyển thành object key-value để frontend dễ dùng
    const settings = {};
    rows.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });

    res.json({ success: true, data: settings, raw: rows });
  } catch (err) {
    console.error('getSettings error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// PUT /api/admin/settings - Cập nhật settings (không có ảnh)
const updateSettings = async (req, res) => {
  try {
    const updates = req.body; // { setting_key: value, ... }

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ.' });
    }

    const entries = Object.entries(updates);
    if (!entries.length) {
      return res.status(400).json({ success: false, message: 'Không có dữ liệu cập nhật.' });
    }

    // Upsert từng setting
    for (const [key, value] of entries) {
      await pool.query(
        `INSERT INTO website_settings (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = ?`,
        [key, value, value]
      );
    }

    res.json({ success: true, message: 'Cập nhật cài đặt thành công!' });
  } catch (err) {
    console.error('updateSettings error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// PUT /api/admin/settings/image/:key - Upload ảnh setting
const updateSettingImage = async (req, res) => {
  try {
    const { key } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn ảnh.' });
    }

    // Lấy ảnh cũ để xóa
    const [oldRows] = await pool.query(
      'SELECT setting_value FROM website_settings WHERE setting_key = ?',
      [`${key}_public_id`]
    );

    if (oldRows.length && oldRows[0].setting_value) {
      await deleteFromCloudinary(oldRows[0].setting_value).catch(console.error);
    }

    const imageUrl = req.file.path;
    const publicId = req.file.filename;

    // Lưu URL và public_id
    await pool.query(
      `INSERT INTO website_settings (setting_key, setting_value, setting_type)
       VALUES (?, ?, 'image')
       ON DUPLICATE KEY UPDATE setting_value = ?`,
      [key, imageUrl, imageUrl]
    );

    await pool.query(
      `INSERT INTO website_settings (setting_key, setting_value, setting_type)
       VALUES (?, ?, 'text')
       ON DUPLICATE KEY UPDATE setting_value = ?`,
      [`${key}_public_id`, publicId, publicId]
    );

    res.json({
      success: true,
      message: 'Upload ảnh thành công!',
      data: { url: imageUrl, public_id: publicId },
    });
  } catch (err) {
    console.error('updateSettingImage error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

module.exports = { getSettings, updateSettings, updateSettingImage };
