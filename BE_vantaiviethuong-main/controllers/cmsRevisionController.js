const { pool } = require('../config/database');
const { getConfig, parseJson } = require('../services/cmsRevisionService');

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

const getAuditHistory = async (req, res) => {
  try {
    const module = String(req.query.module || '').trim();
    if (module) getConfig(module);

    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const filters = [];
    const params = [];
    if (module) {
      filters.push('r.module = ?');
      params.push(module);
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
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

    const data = rows.map((row) => {
      const snapshot = parseJson(row.snapshot, {});
      const previousSnapshot = row.previous_snapshot === null
        ? null
        : parseJson(row.previous_snapshot, {});
      const isInitial = previousSnapshot === null;
      const changes = isInitial ? [] : collectChanges(previousSnapshot, snapshot);

      return {
        id: row.id,
        module: row.module,
        version_number: row.version_number,
        status: row.status,
        change_summary: row.change_summary,
        created_at: row.created_at,
        published_at: row.published_at,
        is_initial: isInitial,
        changes,
        changes_truncated: changes.length >= MAX_CHANGES_PER_ENTRY,
        author: {
          id: row.created_by,
          full_name: row.full_name || null,
          username: row.username || null,
        },
      };
    });

    return res.json({ success: true, data });
  } catch (error) {
    console.error('getCmsAuditHistory error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Không thể tải lịch sử chỉnh sửa.',
    });
  }
};

module.exports = { getAuditHistory };
