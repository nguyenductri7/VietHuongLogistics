const { pool } = require('../config/database');

const MODULES = {
  home: {
    table: 'home_page',
    fields: ['hero', 'about_intro', 'services_section', 'partners_section', 'contact_section', 'footer'],
  },
  about: {
    table: 'about_page',
    fields: ['hero', 'stats', 'identity', 'services', 'timeline', 'values_section'],
  },
  services: {
    table: 'services_page',
    fields: ['banner', 'process_steps', 'contact_info'],
  },
};

function getConfig(module) {
  const config = MODULES[module];
  if (!config) {
    const error = new Error('Module CMS không hợp lệ.');
    error.statusCode = 400;
    throw error;
  }
  return config;
}

function parseJson(value, fallback) {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

function cleanRow(row) {
  const result = { ...row };
  delete result.created_at;
  delete result.updated_at;
  return result;
}

async function readSnapshot(module, connection = pool) {
  const config = getConfig(module);
  const [rows] = await connection.query(`SELECT * FROM ${config.table} ORDER BY id DESC LIMIT 1`);
  const row = rows[0] || {};
  const snapshot = {};

  for (const field of config.fields) {
    const arrayField = ['stats', 'services', 'timeline', 'values_section', 'process_steps'].includes(field);
    snapshot[field] = parseJson(row[field], arrayField ? [] : {});
  }

  if (module === 'home') {
    const [partners] = await connection.query('SELECT * FROM partners ORDER BY sort_order ASC, id ASC');
    snapshot.partners = partners.map(cleanRow);
  }

  if (module === 'services') {
    const [items] = await connection.query('SELECT * FROM service_items ORDER BY sort_order ASC, id ASC');
    snapshot.service_items = items.map((item) => ({
      ...cleanRow(item),
      tags: parseJson(item.tags, []),
    }));
  }

  return snapshot;
}

function mergeSnapshot(module, current, incoming = {}) {
  const config = getConfig(module);
  const merged = { ...current };
  for (const field of config.fields) {
    if (incoming[field] !== undefined) merged[field] = incoming[field];
  }
  if (module === 'home' && Array.isArray(incoming.partners)) merged.partners = incoming.partners;
  if (module === 'services' && Array.isArray(incoming.service_items)) merged.service_items = incoming.service_items;
  return merged;
}

async function ensurePageRow(module, connection) {
  const config = getConfig(module);
  const [rows] = await connection.query(`SELECT id FROM ${config.table} ORDER BY id DESC LIMIT 1`);
  if (rows.length) return rows[0].id;

  const placeholders = config.fields.map(() => '?').join(', ');
  const values = config.fields.map((field) => (
    ['stats', 'services', 'timeline', 'values_section', 'process_steps'].includes(field) ? '[]' : '{}'
  ));
  const [result] = await connection.query(
    `INSERT INTO ${config.table} (${config.fields.join(', ')}) VALUES (${placeholders})`,
    values,
  );
  return result.insertId;
}

async function replacePartners(connection, partners) {
  await connection.query('DELETE FROM partners');
  for (const partner of partners) {
    await connection.query(
      `INSERT INTO partners
        (id, name, logo_url, logo_public_id, website_url, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        partner.id || null,
        partner.name || '',
        partner.logo_url || '',
        partner.logo_public_id || '',
        partner.website_url || '',
        Number(partner.sort_order) || 0,
        partner.is_active === 0 ? 0 : 1,
      ],
    );
  }
}

async function replaceServiceItems(connection, items) {
  await connection.query('DELETE FROM service_items');
  for (const [index, item] of items.entries()) {
    await connection.query(
      `INSERT INTO service_items
        (id, slug, title, subtitle, description, icon_key, image, tags, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id || null,
        item.slug || `dich-vu-${Date.now()}-${index}`,
        item.title || '',
        item.subtitle || '',
        item.description || '',
        item.icon_key || 'Truck',
        item.image || '',
        JSON.stringify(Array.isArray(item.tags) ? item.tags : []),
        Number(item.sort_order) || index + 1,
        item.is_active === 0 ? 0 : 1,
      ],
    );
  }
}

async function applySnapshot(module, snapshot, userId, connection) {
  const config = getConfig(module);
  const pageId = await ensurePageRow(module, connection);
  const assignments = config.fields.map((field) => `${field} = ?`);
  const values = config.fields.map((field) => JSON.stringify(snapshot[field] ?? {}));
  assignments.push('updated_by = ?');
  values.push(userId || null, pageId);

  await connection.query(
    `UPDATE ${config.table} SET ${assignments.join(', ')} WHERE id = ?`,
    values,
  );

  if (module === 'home' && Array.isArray(snapshot.partners)) {
    await replacePartners(connection, snapshot.partners);
  }
  if (module === 'services' && Array.isArray(snapshot.service_items)) {
    await replaceServiceItems(connection, snapshot.service_items);
  }
}

async function insertRevision(connection, { module, status, snapshot, userId, summary, restoredFromId = null }) {
  const lockName = `cms_revision_${module}`;
  const [[lock]] = await connection.query('SELECT GET_LOCK(?, 10) AS acquired', [lockName]);
  if (Number(lock.acquired) !== 1) throw new Error('Không thể tạo phiên bản CMS lúc này.');

  try {
    const [[versionRow]] = await connection.query(
      'SELECT COALESCE(MAX(version_number), 0) + 1 AS nextVersion FROM cms_revisions WHERE module = ?',
      [module],
    );
    const versionNumber = Number(versionRow.nextVersion);
    const [result] = await connection.query(
      `INSERT INTO cms_revisions
        (module, version_number, status, snapshot, change_summary, created_by, restored_from_id, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        module,
        versionNumber,
        status,
        JSON.stringify(snapshot),
        summary || null,
        userId || null,
        restoredFromId,
        status === 'published' ? new Date() : null,
      ],
    );
    return { id: result.insertId, version_number: versionNumber };
  } finally {
    await connection.query('SELECT RELEASE_LOCK(?)', [lockName]).catch(() => {});
  }
}

async function ensureInitialRevision(module, userId, connection) {
  const [[row]] = await connection.query(
    'SELECT COUNT(*) AS total FROM cms_revisions WHERE module = ?',
    [module],
  );
  if (Number(row.total) > 0) return;
  const snapshot = await readSnapshot(module, connection);
  await insertRevision(connection, {
    module,
    status: 'published',
    snapshot,
    userId,
    summary: 'Phiên bản ban đầu trước khi bật lịch sử CMS',
  });
}

async function recordCurrentPublished(module, userId, summary) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await ensureInitialRevision(module, userId, connection);
    const snapshot = await readSnapshot(module, connection);
    const revision = await insertRevision(connection, {
      module,
      status: 'published',
      snapshot,
      userId,
      summary,
    });
    await connection.commit();
    return revision;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function ensurePublishedBaseline(module, userId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await ensureInitialRevision(module, userId, connection);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  MODULES,
  getConfig,
  readSnapshot,
  mergeSnapshot,
  applySnapshot,
  insertRevision,
  ensureInitialRevision,
  recordCurrentPublished,
  ensurePublishedBaseline,
  parseJson,
};
