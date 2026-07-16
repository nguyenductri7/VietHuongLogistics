const { pool } = require('../config/database');
const { parseJson } = require('../services/cmsRevisionService');

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

module.exports = { getAuditHistory, deleteAuditEntry };
