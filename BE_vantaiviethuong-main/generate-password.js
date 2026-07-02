/**
 * Script tạo mật khẩu hash để dùng trong database
 * Chạy: node generate-password.js
 * Sau đó copy hash vào câu lệnh SQL UPDATE
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2] || 'Admin@123';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Lỗi:', err);
    return;
  }
  console.log('\n✅ Mật khẩu gốc:', password);
  console.log('🔐 Hash đã tạo:', hash);
  console.log('\nCâu lệnh SQL cập nhật mật khẩu:');
  console.log(`UPDATE admin_users SET password = '${hash}' WHERE username = 'admin';\n`);
});
