const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { splitSqlStatements } = require('../scripts/migrate');

const initialMigration = fs.readFileSync(
  path.join(__dirname, '..', 'migrations', '001_initial_schema.sql'),
  'utf8'
);

const statements = splitSqlStatements(initialMigration);
assert.strictEqual(statements.length, 14, 'Migration nền tảng phải có đúng 14 câu SQL.');

const quotedSemicolon = splitSqlStatements("INSERT INTO example VALUES ('a;b'); SELECT 1;");
assert.strictEqual(quotedSemicolon.length, 2, 'Không được tách dấu chấm phẩy bên trong chuỗi.');

const comments = splitSqlStatements('-- bỏ qua ;\nSELECT 1; /* bỏ qua ; */ SELECT 2;');
assert.strictEqual(comments.length, 2, 'Không được xem nội dung comment là câu SQL.');

console.log(`Migration parser: OK (${statements.length} statements)`);
