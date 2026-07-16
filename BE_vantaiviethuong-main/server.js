require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const { testConnection } = require('./config/database');
const { runMigrations } = require('./scripts/migrate');
const faqRoutes = require('./routes/Faq')
const faqContentRoutes = require('./routes/Faqcontent')
const app = express();
const PORT = process.env.PORT || 5000;
let databaseStatus = 'connecting';
let databaseError = null;

app.use(cors({
  origin: [
    'https://vantaiviethuong.onrender.com',
    'https://viet-huong-logistics.vercel.app',
    'https://viethuonglogistics.com',
    'http://viethuonglogistics.com',      // ← thêm dòng này
    'www.viethuonglogistics.com',
    'https://www.viethuonglogistics.com', // ← và dòng này
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/static', express.static(path.join(__dirname, 'public')));

// ================================================
// ROUTES
// ================================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/home-page', require('./routes/homePage'));
app.use('/api/partners', require('./routes/partners'));
app.use('/api/branches', require('./routes/branches'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/about',    require('./routes/About'));   
app.use('/api/services-page', require('./routes/Servicespage'));
app.use('/api/faq-inquiries', faqRoutes)
app.use('/api/faq-content', require('./routes/Faqcontent'))
app.use('/api/cms-revisions', require('./routes/cmsRevisions'));
// Health check
app.get('/api/health', (req, res) => {
  const databaseConnected = databaseStatus === 'connected';
  res.status(databaseConnected ? 200 : 503).json({
    success: databaseConnected,
    message: 'Van Tai Viet Huong API đang chạy!',
    database: databaseStatus,
    database_error: databaseConnected
      ? null
      : (process.env.NODE_ENV === 'production' ? 'Database chưa sẵn sàng.' : databaseError),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ================================================
// 404 Handler
// ================================================
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} không tồn tại.` });
});

// ================================================
// Global Error Handler
// ================================================
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File quá lớn. Tối đa 10MB.' });
  }

  if (err.message?.includes('Invalid file type') || err.message?.includes('not allowed')) {
    return res.status(400).json({ success: false, message: 'Định dạng file không được hỗ trợ.' });
  }

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Lỗi server.' : err.message,
  });
});

// ================================================
// START SERVER
// ================================================
const DB_RETRY_DELAY_MS = 15000;

async function connectDatabase() {
  databaseStatus = 'connecting';
  databaseError = null;

  try {
    await runMigrations();
    await testConnection();
    databaseStatus = 'connected';
  } catch (err) {
    databaseStatus = 'error';
    databaseError = err.message;
    console.error(`Sẽ thử kết nối MySQL lại sau ${DB_RETRY_DELAY_MS / 1000} giây.`);
    setTimeout(connectDatabase, DB_RETRY_DELAY_MS);
  }
}

function start() {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`📚 API Health check: http://localhost:${PORT}/api/health`);
    console.log(`\n📋 Danh sách API endpoints:`);
    console.log(`   POST   /api/auth/login`);
    console.log(`   GET    /api/auth/me`);
    console.log(`   GET    /api/blogs`);
    console.log(`   GET    /api/blogs/:slugOrId`);
    console.log(`   POST   /api/blogs/admin (+ thumbnail upload)`);
    console.log(`   PUT    /api/blogs/admin/:id`);
    console.log(`   DELETE /api/blogs/admin/:id`);
    console.log(`   GET    /api/settings`);
    console.log(`   PUT    /api/settings/admin`);
    console.log(`   PUT    /api/settings/admin/image/:key`);
    console.log(`   GET    /api/partners`);
    console.log(`   POST   /api/partners/admin`);
    console.log(`   PUT    /api/partners/admin/:id`);
    console.log(`   DELETE /api/partners/admin/:id`);
    console.log(`   POST   /api/contact`);
    console.log(`   GET    /api/contact/admin`);
    console.log('');
    connectDatabase();
  });
}

start();
