const { pool } = require('../config/database');
const { recordAdminAudit } = require('../services/adminAuditService');

const PIPELINE_STAGES = [
  { key: 'new_lead', label: 'Khách mới', color: '#64748b' },
  { key: 'called', label: 'Đã gọi', color: '#3b82f6' },
  { key: 'quoting', label: 'Đang báo giá', color: '#f59e0b' },
  { key: 'negotiating', label: 'Đang thương lượng', color: '#8b5cf6' },
  { key: 'contracted', label: 'Đã ký hợp đồng', color: '#10b981' },
  { key: 'completed', label: 'Hoàn thành', color: '#059669' },
];

const STAGE_KEYS = new Set(PIPELINE_STAGES.map(stage => stage.key));
const STAGE_LABELS = Object.fromEntries(PIPELINE_STAGES.map(stage => [stage.key, stage.label]));

function normalizeIds(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(
    value
      .map(item => Number.parseInt(item, 10))
      .filter(item => Number.isInteger(item) && item > 0),
  )];
}

async function updatePositions(connection, stage, ids) {
  if (!STAGE_KEYS.has(stage) || !ids.length) return;
  for (let index = 0; index < ids.length; index += 1) {
    await connection.query(
      'UPDATE contact_messages SET pipeline_position = ? WHERE id = ? AND pipeline_stage = ?',
      [index + 1, ids[index], stage],
    );
  }
}

const getPipeline = async (req, res) => {
  try {
    const search = String(req.query.search || '').trim();
    const params = [];
    let where = '';

    if (search) {
      const keyword = `%${search}%`;
      where = 'WHERE full_name LIKE ? OR phone LIKE ? OR email LIKE ? OR company LIKE ?';
      params.push(keyword, keyword, keyword, keyword);
    }

    const [rows] = await pool.query(
      `SELECT id, full_name, email, phone, company, message, status,
              pipeline_stage, pipeline_position, admin_note, last_action,
              last_action_at, created_at, updated_at
       FROM contact_messages
       ${where}
       ORDER BY pipeline_stage ASC, pipeline_position ASC, created_at DESC`,
      params,
    );

    res.json({
      success: true,
      stages: PIPELINE_STAGES,
      data: rows.map(row => ({
        ...row,
        pipeline_stage: STAGE_KEYS.has(row.pipeline_stage) ? row.pipeline_stage : 'new_lead',
      })),
    });
  } catch (error) {
    console.error('getPipeline error:', error);
    res.status(500).json({ success: false, message: 'Không thể tải pipeline khách hàng.' });
  }
};

const moveContact = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const contactId = Number.parseInt(req.body.contact_id, 10);
    const toStage = String(req.body.to_stage || '').trim();
    const sourceStage = String(req.body.source_stage || '').trim();
    const destinationIds = normalizeIds(req.body.destination_ids);
    const sourceIds = normalizeIds(req.body.source_ids);

    if (!Number.isInteger(contactId) || contactId <= 0 || !STAGE_KEYS.has(toStage)) {
      return res.status(400).json({ success: false, message: 'Dữ liệu di chuyển không hợp lệ.' });
    }

    await connection.beginTransaction();
    const [rows] = await connection.query(
      'SELECT * FROM contact_messages WHERE id = ? FOR UPDATE',
      [contactId],
    );
    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng.' });
    }

    const before = rows[0];
    const previousStage = STAGE_KEYS.has(before.pipeline_stage) ? before.pipeline_stage : 'new_lead';
    await connection.query(
      'UPDATE contact_messages SET pipeline_stage = ? WHERE id = ?',
      [toStage, contactId],
    );

    if (sourceStage && sourceStage !== toStage) {
      await updatePositions(connection, sourceStage, sourceIds);
    }
    await updatePositions(connection, toStage, destinationIds.includes(contactId)
      ? destinationIds
      : [...destinationIds, contactId]);

    if (previousStage !== toStage) {
      await connection.query(
        `INSERT INTO crm_activities
          (contact_id, activity_type, title, description, from_stage, to_stage, created_by)
         VALUES (?, 'stage_changed', ?, ?, ?, ?, ?)`,
        [
          contactId,
          `Chuyển sang ${STAGE_LABELS[toStage]}`,
          `Khách hàng được chuyển từ “${STAGE_LABELS[previousStage]}” sang “${STAGE_LABELS[toStage]}”.`,
          previousStage,
          toStage,
          req.user?.id || null,
        ],
      );
    }

    const [afterRows] = await connection.query(
      'SELECT * FROM contact_messages WHERE id = ?',
      [contactId],
    );
    await connection.commit();

    await recordAdminAudit({
      module: 'crm',
      action: previousStage === toStage ? 'reorder' : 'stage',
      entityType: 'contact',
      entityId: contactId,
      summary: previousStage === toStage
        ? `Sắp xếp khách hàng ${before.full_name} trong pipeline`
        : `Chuyển ${before.full_name} từ ${STAGE_LABELS[previousStage]} sang ${STAGE_LABELS[toStage]}`,
      before,
      after: afterRows[0],
      userId: req.user?.id,
    });

    res.json({
      success: true,
      message: previousStage === toStage ? 'Đã sắp xếp khách hàng.' : 'Đã cập nhật giai đoạn khách hàng.',
      data: afterRows[0],
    });
  } catch (error) {
    await connection.rollback();
    console.error('moveContact error:', error);
    res.status(500).json({ success: false, message: 'Không thể cập nhật pipeline.' });
  } finally {
    connection.release();
  }
};

const getContactActivities = async (req, res) => {
  try {
    const contactId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(contactId) || contactId <= 0) {
      return res.status(400).json({ success: false, message: 'Mã khách hàng không hợp lệ.' });
    }

    const [rows] = await pool.query(
      `SELECT a.*, u.full_name AS created_by_name, u.username AS created_by_username
       FROM crm_activities a
       LEFT JOIN admin_users u ON u.id = a.created_by
       WHERE a.contact_id = ?
       ORDER BY a.created_at DESC, a.id DESC`,
      [contactId],
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('getContactActivities error:', error);
    res.status(500).json({ success: false, message: 'Không thể tải nhật ký chăm sóc.' });
  }
};

const createContactActivity = async (req, res) => {
  try {
    const contactId = Number.parseInt(req.params.id, 10);
    const title = String(req.body.title || '').trim();
    const description = String(req.body.description || '').trim();
    const activityType = String(req.body.activity_type || 'note').trim();

    if (!Number.isInteger(contactId) || contactId <= 0 || !title) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung nhật ký.' });
    }
    if (title.length > 180 || description.length > 5000) {
      return res.status(400).json({ success: false, message: 'Nội dung nhật ký vượt quá độ dài cho phép.' });
    }

    const [contacts] = await pool.query('SELECT id, full_name FROM contact_messages WHERE id = ?', [contactId]);
    if (!contacts.length) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng.' });
    }

    const [result] = await pool.query(
      `INSERT INTO crm_activities
        (contact_id, activity_type, title, description, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [contactId, activityType || 'note', title, description || null, req.user?.id || null],
    );
    const [rows] = await pool.query(
      `SELECT a.*, u.full_name AS created_by_name, u.username AS created_by_username
       FROM crm_activities a
       LEFT JOIN admin_users u ON u.id = a.created_by
       WHERE a.id = ?`,
      [result.insertId],
    );

    await recordAdminAudit({
      module: 'crm',
      action: 'create',
      entityType: 'crm_activity',
      entityId: result.insertId,
      summary: `Thêm nhật ký chăm sóc cho ${contacts[0].full_name}`,
      after: rows[0],
      userId: req.user?.id,
    });

    res.status(201).json({ success: true, message: 'Đã thêm nhật ký chăm sóc.', data: rows[0] });
  } catch (error) {
    console.error('createContactActivity error:', error);
    res.status(500).json({ success: false, message: 'Không thể thêm nhật ký chăm sóc.' });
  }
};

module.exports = {
  PIPELINE_STAGES,
  getPipeline,
  moveContact,
  getContactActivities,
  createContactActivity,
};
