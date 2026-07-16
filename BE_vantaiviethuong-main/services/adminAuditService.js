const { pool } = require('../config/database');

function cleanAuditData(value) {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) return value.map(cleanAuditData);
  if (typeof value !== 'object') return value;

  const result = {};
  for (const [key, item] of Object.entries(value)) {
    if (['password', 'token', 'thumbnail_public_id'].includes(key)) continue;
    if (['created_at', 'updated_at', 'last_login'].includes(key)) continue;
    result[key] = cleanAuditData(item);
  }
  return result;
}

async function recordAdminAudit({
  module,
  action,
  entityType,
  entityId,
  summary,
  before = null,
  after = null,
  userId = null,
}) {
  try {
    await pool.query(
      `INSERT INTO admin_audit_logs
        (module, action, entity_type, entity_id, summary, before_data, after_data, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        module,
        action,
        entityType,
        entityId === null || entityId === undefined ? null : String(entityId),
        String(summary || 'Cập nhật nội dung').slice(0, 255),
        before === null ? null : JSON.stringify(cleanAuditData(before)),
        after === null ? null : JSON.stringify(cleanAuditData(after)),
        userId || null,
      ],
    );
  } catch (error) {
    // Nhật ký không được làm thất bại thao tác quản trị chính.
    console.error('[AUDIT] Không thể ghi lịch sử chỉnh sửa:', error.message);
  }
}

module.exports = { recordAdminAudit, cleanAuditData };
