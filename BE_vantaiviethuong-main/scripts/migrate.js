require('dotenv').config();

const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');
const MIGRATION_LOCK = 'vantaiviethuong_schema_migrations';

function splitSqlStatements(sql) {
  const statements = [];
  let current = '';
  let quote = null;
  let lineComment = false;
  let blockComment = false;

  for (let index = 0; index < sql.length; index += 1) {
    const char = sql[index];
    const next = sql[index + 1];

    if (lineComment) {
      if (char === '\n') {
        lineComment = false;
        current += char;
      }
      continue;
    }

    if (blockComment) {
      if (char === '*' && next === '/') {
        blockComment = false;
        index += 1;
      }
      continue;
    }

    if (!quote && char === '-' && next === '-' && /\s/.test(sql[index + 2] || '')) {
      lineComment = true;
      index += 1;
      continue;
    }

    if (!quote && char === '#') {
      lineComment = true;
      continue;
    }

    if (!quote && char === '/' && next === '*') {
      blockComment = true;
      index += 1;
      continue;
    }

    if (quote) {
      current += char;
      if (char === '\\') {
        current += next || '';
        index += 1;
      } else if (char === quote) {
        if (next === quote && quote !== '`') {
          current += next;
          index += 1;
        } else {
          quote = null;
        }
      }
      continue;
    }

    if (char === "'" || char === '"' || char === '`') {
      quote = char;
      current += char;
      continue;
    }

    if (char === ';') {
      const statement = current.trim();
      if (statement) statements.push(statement);
      current = '';
      continue;
    }

    current += char;
  }

  const finalStatement = current.trim();
  if (finalStatement) statements.push(finalStatement);
  return statements;
}

async function loadMigrations() {
  const files = (await fs.readdir(MIGRATIONS_DIR))
    .filter((file) => /^\d+_[a-z0-9_-]+\.sql$/i.test(file))
    .sort((left, right) => left.localeCompare(right, 'en'));

  return Promise.all(files.map(async (file) => {
    const sql = (await fs.readFile(path.join(MIGRATIONS_DIR, file), 'utf8')).replace(/\r\n/g, '\n');
    return {
      version: file,
      checksum: crypto.createHash('sha256').update(sql).digest('hex'),
      statements: splitSqlStatements(sql),
    };
  }));
}

async function ensureInitialAdmin(connection) {
  const [[{ total }]] = await connection.query('SELECT COUNT(*) AS total FROM admin_users');
  if (Number(total) > 0) return;

  const password = String(process.env.INITIAL_ADMIN_PASSWORD || '');
  if (password.length < 8) {
    console.warn('[DB] Chưa có tài khoản Admin. Đặt INITIAL_ADMIN_PASSWORD (ít nhất 8 ký tự) rồi deploy lại.');
    return;
  }

  const username = String(process.env.INITIAL_ADMIN_USERNAME || '').trim() || 'admin';
  const fullName = String(process.env.INITIAL_ADMIN_NAME || '').trim() || 'Quản trị viên';
  const email = String(process.env.INITIAL_ADMIN_EMAIL || '').trim() || null;
  const passwordHash = await bcrypt.hash(password, 12);

  await connection.query(
    `INSERT INTO admin_users (username, password, full_name, email, role)
     VALUES (?, ?, ?, ?, 'superadmin')`,
    [username, passwordHash, fullName, email]
  );
  console.log(`[DB] Đã tạo tài khoản quản trị ban đầu: ${username}`);
}

async function runMigrations() {
  const connection = await pool.getConnection();
  let lockAcquired = false;

  try {
    const [[lockResult]] = await connection.query('SELECT GET_LOCK(?, 30) AS acquired', [MIGRATION_LOCK]);
    lockAcquired = Number(lockResult.acquired) === 1;
    if (!lockAcquired) throw new Error('Không thể lấy khóa migration sau 30 giây.');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        version VARCHAR(255) NOT NULL UNIQUE,
        checksum CHAR(64) NOT NULL,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    const migrations = await loadMigrations();
    const [appliedRows] = await connection.query('SELECT version, checksum FROM schema_migrations');
    const applied = new Map(appliedRows.map((row) => [row.version, row.checksum]));

    for (const migration of migrations) {
      const previousChecksum = applied.get(migration.version);
      if (previousChecksum) {
        if (previousChecksum !== migration.checksum) {
          throw new Error(`Migration ${migration.version} đã bị thay đổi sau khi chạy. Hãy tạo migration mới.`);
        }
        continue;
      }

      console.log(`[DB] Đang chạy migration ${migration.version}...`);
      for (const statement of migration.statements) {
        await connection.query(statement);
      }

      await connection.query(
        'INSERT INTO schema_migrations (version, checksum) VALUES (?, ?)',
        [migration.version, migration.checksum]
      );
      console.log(`[DB] Hoàn tất migration ${migration.version}.`);
    }

    await ensureInitialAdmin(connection);
    console.log(`[DB] Schema đã cập nhật (${migrations.length} migration).`);
  } finally {
    if (lockAcquired) {
      await connection.query('SELECT RELEASE_LOCK(?)', [MIGRATION_LOCK]).catch(() => {});
    }
    connection.release();
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => pool.end())
    .catch(async (error) => {
      console.error('[DB] Migration thất bại:', error.message);
      await pool.end().catch(() => {});
      process.exitCode = 1;
    });
}

module.exports = { runMigrations, splitSqlStatements };
