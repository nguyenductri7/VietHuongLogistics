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
const CONTACT_STATUS_BY_STAGE = {
  new_lead: 'new',
  called: 'read',
  quoting: 'replied',
  negotiating: 'replied',
  contracted: 'replied',
  completed: 'replied',
};
const REMINDER_TYPES = new Set(['call', 'email', 'quote', 'meeting', 'other']);
const REMINDER_PRIORITIES = new Set(['low', 'normal', 'high']);
const REMINDER_STATUSES = new Set(['pending', 'completed', 'cancelled']);

function toMysqlUtcDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

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
    const syncedContactStatus = CONTACT_STATUS_BY_STAGE[toStage];
    await connection.query(
      'UPDATE contact_messages SET pipeline_stage = ?, status = ? WHERE id = ?',
      [toStage, syncedContactStatus, contactId],
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
          `Khách hàng được chuyển từ “${STAGE_LABELS[previousStage]}” sang “${STAGE_LABELS[toStage]}”; trạng thái liên hệ được đồng bộ thành “${syncedContactStatus}”.`,
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

const getReminders = async (req, res) => {
  try {
    const contactId = Number.parseInt(req.query.contact_id, 10);
    const status = String(req.query.status || '').trim();
    const conditions = [];
    const params = [];

    if (Number.isInteger(contactId) && contactId > 0) {
      conditions.push('r.contact_id = ?');
      params.push(contactId);
    }
    if (REMINDER_STATUSES.has(status)) {
      conditions.push('r.status = ?');
      params.push(status);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT r.*, c.full_name, c.phone, c.email, c.company,
              u.full_name AS created_by_name, u.username AS created_by_username
       FROM crm_reminders r
       JOIN contact_messages c ON c.id = r.contact_id
       LEFT JOIN admin_users u ON u.id = r.created_by
       ${where}
       ORDER BY
         CASE r.status WHEN 'pending' THEN 0 WHEN 'completed' THEN 1 ELSE 2 END,
         r.remind_at ASC, r.id DESC`,
      params,
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('getReminders error:', error);
    res.status(500).json({ success: false, message: 'Không thể tải lịch hẹn.' });
  }
};

const getReminderStats = async (req, res) => {
  try {
    const [[stats]] = await pool.query(
      `SELECT
         SUM(status = 'pending') AS pending_count,
         SUM(status = 'pending' AND remind_at < UTC_TIMESTAMP()) AS overdue_count,
         SUM(
           status = 'pending'
           AND DATE(CONVERT_TZ(remind_at, '+00:00', '+07:00'))
             = DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+07:00'))
         ) AS today_count,
         SUM(
           status = 'pending'
           AND (
             remind_at < UTC_TIMESTAMP()
             OR DATE(CONVERT_TZ(remind_at, '+00:00', '+07:00'))
               = DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+07:00'))
           )
         ) AS attention_count
       FROM crm_reminders`,
    );
    const [items] = await pool.query(
      `SELECT r.id, r.contact_id, r.title, r.notes, r.reminder_type, r.priority,
              r.remind_at, r.status, r.email_reminder_enabled,
              c.full_name, c.phone, c.email, c.company
       FROM crm_reminders r
       JOIN contact_messages c ON c.id = r.contact_id
       WHERE r.status = 'pending'
       ORDER BY r.remind_at ASC
       LIMIT 8`,
    );
    res.json({
      success: true,
      data: {
        pending_count: Number(stats.pending_count) || 0,
        overdue_count: Number(stats.overdue_count) || 0,
        today_count: Number(stats.today_count) || 0,
        attention_count: Number(stats.attention_count) || 0,
        items,
      },
    });
  } catch (error) {
    console.error('getReminderStats error:', error);
    res.status(500).json({ success: false, message: 'Không thể tải thông báo lịch hẹn.' });
  }
};

const createReminder = async (req, res) => {
  try {
    const contactId = Number.parseInt(req.params.id, 10);
    const title = String(req.body.title || '').trim();
    const notes = String(req.body.notes || '').trim();
    const reminderType = REMINDER_TYPES.has(req.body.reminder_type) ? req.body.reminder_type : 'call';
    const priority = REMINDER_PRIORITIES.has(req.body.priority) ? req.body.priority : 'normal';
    const remindAt = toMysqlUtcDate(req.body.remind_at);
    const emailEnabled = req.body.email_reminder_enabled ? 1 : 0;

    if (!Number.isInteger(contactId) || contactId <= 0 || !title || !remindAt) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung và thời gian nhắc.' });
    }
    if (title.length > 180 || notes.length > 5000) {
      return res.status(400).json({ success: false, message: 'Nội dung lịch hẹn vượt quá độ dài cho phép.' });
    }

    const [contacts] = await pool.query('SELECT id, full_name FROM contact_messages WHERE id = ?', [contactId]);
    if (!contacts.length) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng.' });
    }

    const [result] = await pool.query(
      `INSERT INTO crm_reminders
        (contact_id, title, notes, reminder_type, priority, remind_at, email_reminder_enabled, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [contactId, title, notes || null, reminderType, priority, remindAt, emailEnabled, req.user?.id || null],
    );
    await pool.query(
      `INSERT INTO crm_activities
        (contact_id, activity_type, title, description, created_by)
       VALUES (?, 'reminder', ?, ?, ?)`,
      [
        contactId,
        `Đã tạo lịch hẹn: ${title}`,
        `Thời gian nhắc: ${remindAt} UTC${emailEnabled ? '. Đã bật tùy chọn nhắc email.' : ''}`,
        req.user?.id || null,
      ],
    );
    const [rows] = await pool.query(
      `SELECT r.*, c.full_name, c.phone, c.email, c.company
       FROM crm_reminders r
       JOIN contact_messages c ON c.id = r.contact_id
       WHERE r.id = ?`,
      [result.insertId],
    );

    await recordAdminAudit({
      module: 'crm',
      action: 'create',
      entityType: 'crm_reminder',
      entityId: result.insertId,
      summary: `Tạo lịch hẹn cho ${contacts[0].full_name}`,
      after: rows[0],
      userId: req.user?.id,
    });

    res.status(201).json({ success: true, message: 'Đã tạo lịch hẹn.', data: rows[0] });
  } catch (error) {
    console.error('createReminder error:', error);
    res.status(500).json({ success: false, message: 'Không thể tạo lịch hẹn.' });
  }
};

const updateReminder = async (req, res) => {
  try {
    const reminderId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(reminderId) || reminderId <= 0) {
      return res.status(400).json({ success: false, message: 'Mã lịch hẹn không hợp lệ.' });
    }

    const [beforeRows] = await pool.query(
      `SELECT r.*, c.full_name
       FROM crm_reminders r
       JOIN contact_messages c ON c.id = r.contact_id
       WHERE r.id = ?`,
      [reminderId],
    );
    if (!beforeRows.length) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch hẹn.' });
    }
    const before = beforeRows[0];
    const title = req.body.title === undefined ? before.title : String(req.body.title || '').trim();
    const notes = req.body.notes === undefined ? before.notes : String(req.body.notes || '').trim();
    const reminderType = REMINDER_TYPES.has(req.body.reminder_type) ? req.body.reminder_type : before.reminder_type;
    const priority = REMINDER_PRIORITIES.has(req.body.priority) ? req.body.priority : before.priority;
    const status = REMINDER_STATUSES.has(req.body.status) ? req.body.status : before.status;
    const remindAt = req.body.remind_at === undefined ? before.remind_at : toMysqlUtcDate(req.body.remind_at);
    const emailEnabled = req.body.email_reminder_enabled === undefined
      ? Number(before.email_reminder_enabled)
      : (req.body.email_reminder_enabled ? 1 : 0);
    const completedAt = status === 'completed'
      ? (before.status === 'completed' ? before.completed_at : toMysqlUtcDate(new Date()))
      : null;

    if (!title || !remindAt) {
      return res.status(400).json({ success: false, message: 'Nội dung hoặc thời gian nhắc không hợp lệ.' });
    }

    await pool.query(
      `UPDATE crm_reminders
       SET title = ?, notes = ?, reminder_type = ?, priority = ?, remind_at = ?,
           status = ?, email_reminder_enabled = ?, completed_at = ?
       WHERE id = ?`,
      [title, notes || null, reminderType, priority, remindAt, status, emailEnabled, completedAt, reminderId],
    );

    if (before.status !== status) {
      const actionLabel = status === 'completed' ? 'Hoàn thành' : status === 'cancelled' ? 'Huỷ' : 'Mở lại';
      await pool.query(
        `INSERT INTO crm_activities
          (contact_id, activity_type, title, description, created_by)
         VALUES (?, 'reminder', ?, ?, ?)`,
        [
          before.contact_id,
          `${actionLabel} lịch hẹn: ${title}`,
          notes || null,
          req.user?.id || null,
        ],
      );
    }

    const [afterRows] = await pool.query(
      `SELECT r.*, c.full_name, c.phone, c.email, c.company
       FROM crm_reminders r
       JOIN contact_messages c ON c.id = r.contact_id
       WHERE r.id = ?`,
      [reminderId],
    );
    await recordAdminAudit({
      module: 'crm',
      action: 'update',
      entityType: 'crm_reminder',
      entityId: reminderId,
      summary: `Cập nhật lịch hẹn của ${before.full_name}`,
      before,
      after: afterRows[0],
      userId: req.user?.id,
    });

    res.json({ success: true, message: 'Đã cập nhật lịch hẹn.', data: afterRows[0] });
  } catch (error) {
    console.error('updateReminder error:', error);
    res.status(500).json({ success: false, message: 'Không thể cập nhật lịch hẹn.' });
  }
};

const deleteReminder = async (req, res) => {
  try {
    const reminderId = Number.parseInt(req.params.id, 10);
    const [rows] = await pool.query(
      `SELECT r.*, c.full_name
       FROM crm_reminders r
       JOIN contact_messages c ON c.id = r.contact_id
       WHERE r.id = ?`,
      [reminderId],
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch hẹn.' });
    }
    await pool.query('DELETE FROM crm_reminders WHERE id = ?', [reminderId]);
    await recordAdminAudit({
      module: 'crm',
      action: 'delete',
      entityType: 'crm_reminder',
      entityId: reminderId,
      summary: `Xoá lịch hẹn của ${rows[0].full_name}`,
      before: rows[0],
      userId: req.user?.id,
    });
    res.json({ success: true, message: 'Đã xoá lịch hẹn.' });
  } catch (error) {
    console.error('deleteReminder error:', error);
    res.status(500).json({ success: false, message: 'Không thể xoá lịch hẹn.' });
  }
};

module.exports = {
  PIPELINE_STAGES,
  getPipeline,
  moveContact,
  getContactActivities,
  createContactActivity,
  getReminders,
  getReminderStats,
  createReminder,
  updateReminder,
  deleteReminder,
};
