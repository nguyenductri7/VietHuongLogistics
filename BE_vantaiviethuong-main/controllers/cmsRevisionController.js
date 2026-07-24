const { pool } = require('../config/database');
const { applySnapshot, insertRevision, parseJson } = require('../services/cmsRevisionService');

const REVISION_MODULES = ['home', 'about', 'services'];
const AUDIT_MODULES = ['faq', 'faq_content', 'blogs', 'branches', 'contacts'];
const ALL_MODULES = [...REVISION_MODULES, ...AUDIT_MODULES];
const MAX_CHANGES_PER_ENTRY = 100;

function valuesEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function collectChanges(before, after, path = '', changes = []) {
  if (changes.length >= MAX_CHANGES_PER_ENTRY || valuesEqual(before, after)) return changes;

  const beforeObject = before && typeof before === 'object';
  const afterObject = after && typeof after === 'object';
  const bothArrays = Array.isArray(before) && Array.isArray(after);
  const bothObjects = beforeObject && afterObject && !Array.isArray(before) && !Array.isArray(after);

  if (bothArrays) {
    const length = Math.max(before.length, after.length);
    for (let index = 0; index < length && changes.length < MAX_CHANGES_PER_ENTRY; index += 1) {
      collectChanges(before[index], after[index], `${path}[${index + 1}]`, changes);
    }
    return changes;
  }

  if (bothObjects) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    for (const key of keys) {
      if (changes.length >= MAX_CHANGES_PER_ENTRY) break;
      collectChanges(before[key], after[key], path ? `${path}.${key}` : key, changes);
    }
    return changes;
  }

  changes.push({
    path: path || 'content',
    before: before === undefined ? null : before,
    after: after === undefined ? null : after,
    action: before === undefined
      ? 'added'
      : after === undefined
        ? 'removed'
        : 'updated',
  });
  return changes;
}

function authorFromRow(row) {
  return {
    id: row.created_by,
    full_name: row.full_name || null,
    username: row.username || null,
  };
}

async function loadRevisionEntries(module, limit) {
  if (module && !REVISION_MODULES.includes(module)) return [];
  const params = [];
  const where = module ? 'WHERE r.module = ?' : '';
  if (module) params.push(module);
  params.push(limit);

  const [rows] = await pool.query(
    `SELECT
       r.id, r.module, r.version_number, r.status, r.snapshot,
       r.change_summary, r.created_by, r.created_at, r.published_at,
       u.full_name, u.username,
       (
         SELECT previous.snapshot
         FROM cms_revisions previous
         WHERE previous.module = r.module
           AND previous.version_number < r.version_number
         ORDER BY previous.version_number DESC
         LIMIT 1
       ) AS previous_snapshot
     FROM cms_revisions r
     LEFT JOIN admin_users u ON u.id = r.created_by
     ${where}
     ORDER BY r.created_at DESC, r.id DESC
     LIMIT ?`,
    params,
  );

  return rows.map((row) => {
    const snapshot = parseJson(row.snapshot, {});
    const previousSnapshot = row.previous_snapshot === null ? null : parseJson(row.previous_snapshot, {});
    const isInitial = previousSnapshot === null;
    const changes = isInitial ? [] : collectChanges(previousSnapshot, snapshot);
    return {
      id: `revision-${row.id}`,
      source: 'revision',
      source_id: row.id,
      module: row.module,
      version_number: row.version_number,
      action: 'update',
      status: row.status,
      change_summary: row.change_summary,
      created_at: row.created_at,
      published_at: row.published_at,
      is_initial: isInitial,
      changes,
      changes_truncated: changes.length >= MAX_CHANGES_PER_ENTRY,
      author: authorFromRow(row),
    };
  });
}

async function loadAuditEntries(module, limit) {
  if (module && !AUDIT_MODULES.includes(module)) return [];
  const params = [];
  const where = module ? 'WHERE a.module = ?' : '';
  if (module) params.push(module);
  params.push(limit);

  const [rows] = await pool.query(
    `SELECT a.*, u.full_name, u.username
     FROM admin_audit_logs a
     LEFT JOIN admin_users u ON u.id = a.created_by
     ${where}
     ORDER BY a.created_at DESC, a.id DESC
     LIMIT ?`,
    params,
  );

  return rows.map((row) => {
    const before = parseJson(row.before_data, null);
    const after = parseJson(row.after_data, null);
    const changes = collectChanges(before || {}, after || {});
    return {
      id: `audit-${row.id}`,
      source: 'audit',
      source_id: row.id,
      module: row.module,
      action: row.action,
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      change_summary: row.summary,
      created_at: row.created_at,
      is_initial: false,
      changes,
      changes_truncated: changes.length >= MAX_CHANGES_PER_ENTRY,
      author: authorFromRow(row),
    };
  });
}

const getAuditHistory = async (req, res) => {
  try {
    const module = String(req.query.module || '').trim();
    if (module && !ALL_MODULES.includes(module)) {
      return res.status(400).json({ success: false, message: 'Trang quản lý không hợp lệ.' });
    }

    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const [revisions, audits] = await Promise.all([
      loadRevisionEntries(module, limit),
      loadAuditEntries(module, limit),
    ]);
    const data = [...revisions, ...audits]
      .sort((left, right) => new Date(right.created_at) - new Date(left.created_at))
      .slice(0, limit);

    return res.json({ success: true, data });
  } catch (error) {
    console.error('getCmsAuditHistory error:', error);
    return res.status(500).json({ success: false, message: 'Không thể tải lịch sử chỉnh sửa.' });
  }
};

const deleteAuditEntry = async (req, res) => {
  try {
    const { source } = req.params;
    const id = Number(req.params.id);
    if (!['revision', 'audit'].includes(source) || !Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Mã lịch sử không hợp lệ.' });
    }

    const table = source === 'revision' ? 'cms_revisions' : 'admin_audit_logs';
    const [result] = await pool.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'Bản ghi lịch sử không còn tồn tại.' });
    }
    return res.json({ success: true, message: 'Đã xóa bản ghi lịch sử.' });
  } catch (error) {
    console.error('deleteCmsAuditEntry error:', error);
    return res.status(500).json({ success: false, message: 'Không thể xóa bản ghi lịch sử.' });
  }
};

const restoreRevisionEntry = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Mã phiên bản không hợp lệ.' });
    }

    await connection.beginTransaction();

    const [rows] = await connection.query(
      'SELECT id, module, version_number, snapshot FROM cms_revisions WHERE id = ?',
      [id],
    );

    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Phiên bản cần hoàn tác không còn tồn tại.' });
    }

    const revision = rows[0];
    const snapshot = parseJson(revision.snapshot, null);
    if (!snapshot || typeof snapshot !== 'object') {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Dữ liệu phiên bản không hợp lệ, không thể hoàn tác.' });
    }

    await applySnapshot(revision.module, snapshot, req.user?.id, connection);
    const restoredRevision = await insertRevision(connection, {
      module: revision.module,
      status: 'published',
      snapshot,
      userId: req.user?.id,
      restoredFromId: revision.id,
      summary: `Hoàn tác về phiên bản #${revision.version_number}`,
    });

    await connection.commit();
    return res.json({
      success: true,
      message: 'Đã hoàn tác nội dung CMS thành công.',
      data: {
        module: revision.module,
        restored_from_id: revision.id,
        new_revision_id: restoredRevision.id,
        version_number: restoredRevision.version_number,
      },
    });
  } catch (error) {
    await connection.rollback().catch(() => {});
    console.error('restoreCmsRevisionEntry error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Không thể hoàn tác phiên bản CMS.',
    });
  } finally {
    connection.release();
  }
};

const bulkDeleteAuditEntries = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const entries = Array.isArray(req.body?.entries) ? req.body.entries : [];
    if (!entries.length) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn ít nhất một bản ghi lịch sử.' });
    }
    if (entries.length > 100) {
      return res.status(400).json({ success: false, message: 'Chỉ có thể xoá tối đa 100 bản ghi mỗi lần.' });
    }

    const revisionIds = [];
    const auditIds = [];

    for (const entry of entries) {
      const source = String(entry.source || '').trim();
      const id = Number(entry.id);
      if (!['revision', 'audit'].includes(source) || !Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ success: false, message: 'Danh sách bản ghi xoá không hợp lệ.' });
      }
      if (source === 'revision') revisionIds.push(id);
      else auditIds.push(id);
    }

    await connection.beginTransaction();
    let deleted = 0;

    if (revisionIds.length) {
      const [result] = await connection.query('DELETE FROM cms_revisions WHERE id IN (?)', [revisionIds]);
      deleted += Number(result.affectedRows) || 0;
    }

    if (auditIds.length) {
      const [result] = await connection.query('DELETE FROM admin_audit_logs WHERE id IN (?)', [auditIds]);
      deleted += Number(result.affectedRows) || 0;
    }

    await connection.commit();
    return res.json({ success: true, message: `Đã xoá ${deleted} bản ghi lịch sử.`, deleted });
  } catch (error) {
    await connection.rollback().catch(() => {});
    console.error('bulkDeleteCmsAuditEntries error:', error);
    return res.status(500).json({ success: false, message: 'Không thể xoá các bản ghi lịch sử đã chọn.' });
  } finally {
    connection.release();
  }
};

module.exports = {
  getAuditHistory,
  deleteAuditEntry,
  restoreRevisionEntry,
  bulkDeleteAuditEntries,
};
