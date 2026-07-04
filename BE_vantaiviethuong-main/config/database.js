const mysql = require('mysql2/promise');

// Aiven yêu cầu kết nối SSL. Certificate được lưu trong biến môi trường
// DB_SSL_CA (dán nguyên nội dung file ca.pem vào Render Environment Variables).
// Nếu không có DB_SSL_CA (vd: chạy local với XAMPP), bỏ qua SSL.
const sslConfig = process.env.DB_SSL_CA
  ? { ca: process.env.DB_SSL_CA.replace(/\\n/g, '\n') }
  : undefined;

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vantaiviethuong',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT, 10) || 10000,
  charset: 'utf8mb4',
  ...(sslConfig ? { ssl: sslConfig } : {}),
});

// Test connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Kết nối MySQL thành công!');
    connection.release();
  } catch (err) {
    console.error('❌ Lỗi kết nối MySQL:', err.message);
    throw err;
  }
}

module.exports = { pool, testConnection };
