const express = require('express');
const router = express.Router();
const { getBlogCategories, getBlogs, getBlog, createBlog, updateBlog, deleteBlog, uploadContentImage } = require('../controllers/blogController');
const { authMiddleware } = require('../middleware/auth');
const { uploadBlog, uploadBlogContent } = require('../config/cloudinary');

// ========== PUBLIC ROUTES ==========
// GET /api/blogs
router.get('/', getBlogs);

// Phải đặt trước '/:slugOrId' để "categories" không bị hiểu là slug bài viết.
router.get('/categories', getBlogCategories);

// ========== ADMIN ROUTES ==========
// GET /api/admin/blogs (với filter đầy đủ)
router.get('/admin/list', authMiddleware, (req, res, next) => {
  req.user = req.user; // đã auth
  next();
}, getBlogs);

// GET /api/blogs/admin/:id - Lấy đầy đủ nội dung để chỉnh sửa
router.get('/admin/:slugOrId', authMiddleware, getBlog);

// POST /api/admin/blogs/upload-content-image - upload ảnh chèn giữa nội dung bài (RichTextEditor)
// Đặt TRƯỚC route '/admin/:id' để không bị Express hiểu "upload-content-image" là 1 :id
router.post('/admin/upload-content-image', authMiddleware, uploadBlogContent.single('image'), uploadContentImage);

// POST /api/admin/blogs
router.post('/admin', authMiddleware, uploadBlog.single('thumbnail'), createBlog);

// PUT /api/admin/blogs/:id
router.put('/admin/:id', authMiddleware, uploadBlog.single('thumbnail'), updateBlog);

// DELETE /api/admin/blogs/:id
router.delete('/admin/:id', authMiddleware, deleteBlog);

// GET /api/blogs/:slugOrId
// Đặt sau các route /admin/* và /categories để không bắt nhầm route tĩnh thành slug.
router.get('/:slugOrId', getBlog);

module.exports = router;
