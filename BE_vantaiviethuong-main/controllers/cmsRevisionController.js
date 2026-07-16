const { pool } = require('../config/database');
const {
  getConfig,
  readSnapshot,
  mergeSnapshot,
  applySnapshot,
  insertRevision,
  ensureInitialRevision,
  parseJson,
} = require('../services/cmsRevisionService');

function serializeRevision(row, includeSnapshot = false) {
  const revision = {
    id: row.id,
    module: row.module,
    version_number: row.version_number,
    status: row.status,
    change_summary: row.change_summary,
    restored_from_id: row.restored_from_id,
    created_at: row.created_at,
    published_at: row.published_at,
    author: {
      id: row.created_by,
      full_name: row.full_name || null,
      username: row.username || null,
    },
  };
  if (includeSnapshot) revision.snapshot = parseJson(row.snapshot, {});
  return revision;
}

const getHistory = async (req, res) => {
  try {
    const { module } = req.params;
    getConfig(module);
    const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 100);
    const [rows] = await pool.query(
      `SELECT r.*, u.full_name, u.username
       FROM cms_revisions r
       LEFT JOIN admin_users u ON u.id = r.created_by
       WHERE r.module = ?
       ORDER BY r.version_number DESC
       LIMIT ?`,
      [module, limit],
    );
    res.json({ success: true, data: rows.map((row) => serializeRevision(row)) });
  } catch (error) {
    console.error('getCmsHistory error:', error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Lỗi server.' });
  }
};

const getRevision = async (req, res) => {
  try {
    const { module, id } = req.params;
    getConfig(module);
    const [rows] = await pool.query(
      `SELECT r.*, u.full_name, u.username
       FROM cms_revisions r
       LEFT JOIN admin_users u ON u.id = r.created_by
       WHERE r.id = ? AND r.module = ?`,
      [id, module],
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Không tìm thấy phiên bản.' });
    return res.json({ success: true, data: serializeRevision(rows[0], true) });
  } catch (error) {
    console.error('getCmsRevision error:', error);
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Lỗi server.' });
  }
};

const getLatestDraft = async (req, res) => {
  try {
    const { module } = req.params;
    getConfig(module);
    const [rows] = await pool.query(
      `SELECT r.*, u.full_name, u.username
       FROM cms_revisions r
       LEFT JOIN admin_users u ON u.id = r.created_by
       WHERE r.module = ? AND r.status = 'draft'
       ORDER BY r.version_number DESC LIMIT 1`,
      [module],
    );
    return res.json({ success: true, data: rows.length ? serializeRevision(rows[0], true) : null });
  } catch (error) {
    console.error('getLatestCmsDraft error:', error);
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Lỗi server.' });
  }
};

const saveDraft = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { module } = req.params;
    getConfig(module);
    const incoming = req.body?.snapshot;
    if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
      return res.status(400).json({ success: false, message: 'Nội dung bản nháp không hợp lệ.' });
    }

    await connection.beginTransaction();
    await ensureInitialRevision(module, req.user.id, connection);
    const current = await readSnapshot(module, connection);
    const snapshot = mergeSnapshot(module, current, incoming);
    const revision = await insertRevision(connection, {
      module,
      status: 'draft',
      snapshot,
      userId: req.user.id,
      summary: req.body?.summary || 'Lưu bản nháp',
    });
    await connection.commit();
    return res.status(201).json({
      success: true,
      message: `Đã lưu bản nháp phiên bản #${revision.version_number}.`,
      data: { ...revision, status: 'draft', snapshot },
    });
  } catch (error) {
    await connection.rollback();
    console.error('saveCmsDraft error:', error);
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Lỗi server.' });
  } finally {
    connection.release();
  }
};

const publish = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { module } = req.params;
    getConfig(module);
    const incoming = req.body?.snapshot;
    if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
      return res.status(400).json({ success: false, message: 'Nội dung xuất bản không hợp lệ.' });
    }

    await connection.beginTransaction();
    await ensureInitialRevision(module, req.user.id, connection);
    const current = await readSnapshot(module, connection);
    const snapshot = mergeSnapshot(module, current, incoming);
    await applySnapshot(module, snapshot, req.user.id, connection);
    const revision = await insertRevision(connection, {
      module,
      status: 'published',
      snapshot,
      userId: req.user.id,
      summary: req.body?.summary || 'Xuất bản nội dung',
    });
    await connection.commit();
    return res.json({
      success: true,
      message: `Đã xuất bản phiên bản #${revision.version_number}.`,
      data: { ...revision, status: 'published', snapshot },
    });
  } catch (error) {
    await connection.rollback();
    console.error('publishCmsRevision error:', error);
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Lỗi server.' });
  } finally {
    connection.release();
  }
};

const restore = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { module, id } = req.params;
    getConfig(module);
    await connection.beginTransaction();
    const [rows] = await connection.query(
      'SELECT * FROM cms_revisions WHERE id = ? AND module = ? FOR UPDATE',
      [id, module],
    );
    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy phiên bản cần khôi phục.' });
    }

    const snapshot = parseJson(rows[0].snapshot, {});
    await applySnapshot(module, snapshot, req.user.id, connection);
    const revision = await insertRevision(connection, {
      module,
      status: 'published',
      snapshot,
      userId: req.user.id,
      summary: req.body?.summary || `Khôi phục từ phiên bản #${rows[0].version_number}`,
      restoredFromId: rows[0].id,
    });
    await connection.commit();
    return res.json({
      success: true,
      message: `Đã khôi phục và xuất bản thành phiên bản #${revision.version_number}.`,
      data: { ...revision, status: 'published', snapshot },
    });
  } catch (error) {
    await connection.rollback();
    console.error('restoreCmsRevision error:', error);
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Lỗi server.' });
  } finally {
    connection.release();
  }
};

module.exports = { getHistory, getRevision, getLatestDraft, saveDraft, publish, restore };
