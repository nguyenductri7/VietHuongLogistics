require('dotenv').config();

const fs = require('fs/promises');
const path = require('path');
const { pool } = require('../config/database');
const { sanitizeLegacyLocalized } = require('../utils/cmsSanitizer');

const APPLY = process.argv.includes('--apply');

const TARGETS = [
  {
    table: 'home_page',
    columns: ['hero', 'about_intro', 'services_section', 'partners_section', 'contact_section', 'footer'],
    jsonColumns: ['hero', 'about_intro', 'services_section', 'partners_section', 'contact_section', 'footer'],
  },
  {
    table: 'about_page',
    columns: ['hero', 'stats', 'identity', 'services', 'timeline', 'values_section'],
    jsonColumns: ['hero', 'stats', 'identity', 'services', 'timeline', 'values_section'],
  },
  {
    table: 'services_page',
    columns: ['banner', 'process_steps', 'contact_info'],
    jsonColumns: ['banner', 'process_steps', 'contact_info'],
  },
  {
    table: 'service_items',
    columns: ['title', 'subtitle', 'description', 'tags'],
    jsonColumns: ['tags'],
  },
  {
    table: 'blogs',
    columns: ['title', 'excerpt', 'content', 'tags'],
    jsonColumns: [],
  },
  {
    table: 'faq_categories',
    columns: ['label'],
    jsonColumns: [],
  },
  {
    table: 'faq_items',
    columns: ['question', 'answer'],
    jsonColumns: [],
  },
  {
    table: 'branches',
    columns: ['name', 'address'],
    jsonColumns: [],
  },
  {
    table: 'partners',
    columns: ['name'],
    jsonColumns: [],
  },
  {
    table: 'website_settings',
    columns: ['setting_value', 'label', 'description'],
    jsonColumns: [],
  },
  {
    table: 'services',
    columns: ['title', 'description', 'features'],
    jsonColumns: ['features'],
  },
];

function normalizeForCompare(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function prepareNextValue(value, isJsonColumn) {
  const sanitized = sanitizeLegacyLocalized(value);

  if (isJsonColumn) {
    return JSON.stringify(sanitized);
  }

  if (sanitized && typeof sanitized === 'object') {
    return value;
  }

  return sanitized;
}

function hasChanged(value, nextValue, isJsonColumn) {
  if (isJsonColumn) {
    const currentSanitized = sanitizeLegacyLocalized(value);
    return JSON.stringify(currentSanitized) !== normalizeJsonString(value);
  }

  return normalizeForCompare(value) !== normalizeForCompare(nextValue);
}

function normalizeJsonString(value) {
  if (value === null || value === undefined) return JSON.stringify(value);
  if (typeof value === 'object') return JSON.stringify(value);

  try {
    return JSON.stringify(JSON.parse(value));
  } catch {
    return JSON.stringify(value);
  }
}

async function tableExists(table) {
  const [rows] = await pool.query('SHOW TABLES LIKE ?', [table]);
  return rows.length > 0;
}

async function cleanupTable(target) {
  if (!(await tableExists(target.table))) {
    return { table: target.table, skipped: true, changedRows: 0, changedCells: 0, backups: [] };
  }

  const selectColumns = ['id', ...target.columns].map(column => `\`${column}\``).join(', ');
  const [rows] = await pool.query(`SELECT ${selectColumns} FROM \`${target.table}\``);
  const backups = [];
  let changedCells = 0;
  let changedRows = 0;

  for (const row of rows) {
    const updates = {};
    const before = {};
    const after = {};

    for (const column of target.columns) {
      const isJsonColumn = target.jsonColumns.includes(column);
      const nextValue = prepareNextValue(row[column], isJsonColumn);

      if (!hasChanged(row[column], nextValue, isJsonColumn)) continue;

      updates[column] = nextValue;
      before[column] = row[column];
      after[column] = nextValue;
      changedCells += 1;
    }

    if (!Object.keys(updates).length) continue;

    changedRows += 1;
    backups.push({ table: target.table, id: row.id, before, after });

    if (APPLY) {
      const setSql = Object.keys(updates).map(column => `\`${column}\` = ?`).join(', ');
      const values = [...Object.values(updates), row.id];
      await pool.query(`UPDATE \`${target.table}\` SET ${setSql} WHERE id = ?`, values);
    }
  }

  return { table: target.table, skipped: false, changedRows, changedCells, backups };
}

async function main() {
  const startedAt = new Date();
  console.log(APPLY ? 'Đang dọn dữ liệu legacy {vi,en}...' : 'DRY RUN: chỉ kiểm tra, chưa ghi database.');

  const results = [];
  const allBackups = [];

  for (const target of TARGETS) {
    const result = await cleanupTable(target);
    results.push(result);
    allBackups.push(...result.backups);

    const status = result.skipped ? 'bỏ qua' : `${result.changedRows} dòng / ${result.changedCells} ô`;
    console.log(`- ${result.table}: ${status}`);
  }

  const totalRows = results.reduce((sum, item) => sum + item.changedRows, 0);
  const totalCells = results.reduce((sum, item) => sum + item.changedCells, 0);

  if (APPLY && allBackups.length) {
    const backupDir = path.join(__dirname, '..', 'backups');
    await fs.mkdir(backupDir, { recursive: true });
    const stamp = startedAt.toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `legacy-i18n-cleanup-${stamp}.json`);
    await fs.writeFile(backupPath, JSON.stringify(allBackups, null, 2), 'utf8');
    console.log(`Backup đã lưu: ${backupPath}`);
  }

  console.log(`Tổng cộng: ${totalRows} dòng / ${totalCells} ô ${APPLY ? 'đã dọn.' : 'sẽ được dọn.'}`);

  if (!APPLY && totalCells > 0) {
    console.log('Nếu số liệu ổn, chạy: npm run cleanup:legacy-i18n -- --apply');
  }
}

main()
  .catch((error) => {
    console.error('Cleanup legacy i18n error:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
