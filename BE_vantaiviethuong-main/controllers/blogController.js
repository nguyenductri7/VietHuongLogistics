const { pool } = require('../config/database');
const { deleteFromCloudinary, getPublicIdFromUrl } = require('../config/cloudinary');
const { BLOG_CATEGORIES, DEFAULT_BLOG_CATEGORY } = require('../config/blogCategories');
const { sanitizeLegacyLocalized } = require('../utils/cmsSanitizer');

const getBlogCategories = (req, res) => {
  res.json({ success: true, data: BLOG_CATEGORIES });
};

// Tạo slug từ tiêu đề
function createSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    + '-' + Date.now();
}

function stripHtml(value = '') {
  return String(value)
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
}

function getReadingTimeText(...parts) {
  const text = parts.map(stripHtml).join(' ').trim()
  const words = text.split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} phút đọc`
}

const getBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      search,
      featured,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let conditions = [];
    let params = [];

if (!req.user) {
  conditions.push('status = ?');
  params.push('published');
} else if (status) {
  conditions.push('status = ?');
  params.push(status);
}

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    if (featured === '1') {
      conditions.push('is_featured = 1');
    }

    if (search) {
      conditions.push('(title LIKE ? OR excerpt LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM blogs ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const [rows] = await pool.query(
      `SELECT id, title, slug, excerpt, content, thumbnail_url, category, tags, author, 
              status, view_count, is_featured, published_at, created_at
       FROM blogs ${whereClause}
       ORDER BY published_at DESC, created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const blogs = rows.map(({ content, ...blog }) => {
      const safeBlog = sanitizeLegacyLocalized(blog);
      const safeContent = sanitizeLegacyLocalized(content);
      return {
        ...safeBlog,
        reading_time: getReadingTimeText(safeContent, safeBlog.excerpt, safeBlog.title),
      };
    });

    res.json({
      success: true,
      data: blogs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('getBlogs error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// GET /api/blogs/:slugOrId - Lấy 1 bài
const getBlog = async (req, res) => {
  try {
    const { slugOrId } = req.params;
    const isId = /^\d+$/.test(slugOrId);

    const [rows] = await pool.query(
      `SELECT * FROM blogs WHERE ${isId ? 'id' : 'slug'} = ?`,
      [slugOrId]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết.' });
    }

    // Tăng view count nếu là public request
    if (!req.user) {
      await pool.query('UPDATE blogs SET view_count = view_count + 1 WHERE id = ?', [rows[0].id]);
    }

    const safeBlog = sanitizeLegacyLocalized(rows[0]);

    res.json({
      success: true,
      data: {
        ...safeBlog,
        reading_time: getReadingTimeText(safeBlog.content, safeBlog.excerpt, safeBlog.title),
      },
    });
  } catch (err) {
    console.error('getBlog error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// POST /api/admin/blogs - Tạo bài mới
const createBlog = async (req, res) => {
  try {
    const { title, excerpt, content, category, tags, author, status, is_featured } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Tiêu đề không được để trống.' });
    }

    const slug = createSlug(title);
    const thumbnail_url = req.file?.path || '';
    const thumbnail_public_id = req.file?.filename || '';
    const published_at = status === 'published' ? new Date() : null;

    const [result] = await pool.query(
      `INSERT INTO blogs 
        (title, slug, excerpt, content, thumbnail_url, thumbnail_public_id, category, tags, author, status, is_featured, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, slug, excerpt || '', content || '', thumbnail_url, thumbnail_public_id,
        category || DEFAULT_BLOG_CATEGORY, tags || '', author || req.user.full_name || 'Admin',
        status || 'draft', is_featured ? 1 : 0, published_at,
      ]
    );

    const [newBlog] = await pool.query('SELECT * FROM blogs WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, message: 'Tạo bài viết thành công!', data: sanitizeLegacyLocalized(newBlog[0]) });
  } catch (err) {
    console.error('createBlog error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// PUT /api/admin/blogs/:id - Cập nhật bài
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, excerpt, content, category, tags, author, status, is_featured } = req.body;

    const [existing] = await pool.query('SELECT * FROM blogs WHERE id = ?', [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết.' });
    }

    const blog = existing[0];
    let thumbnail_url = blog.thumbnail_url;
    let thumbnail_public_id = blog.thumbnail_public_id;

    // Nếu có ảnh mới upload
    if (req.file) {
      // Xóa ảnh cũ trên Cloudinary
      if (blog.thumbnail_public_id) {
        await deleteFromCloudinary(blog.thumbnail_public_id).catch(console.error);
      }
      thumbnail_url = req.file.path;
      thumbnail_public_id = req.file.filename;
    }

    const published_at =
      status === 'published' && blog.status !== 'published'
        ? new Date()
        : blog.published_at;

    await pool.query(
      `UPDATE blogs SET
        title = ?, excerpt = ?, content = ?, thumbnail_url = ?, thumbnail_public_id = ?,
        category = ?, tags = ?, author = ?, status = ?, is_featured = ?, published_at = ?
       WHERE id = ?`,
      [
        title || blog.title,
        excerpt ?? blog.excerpt,
        content ?? blog.content,
        thumbnail_url,
        thumbnail_public_id,
        category || blog.category,
        tags ?? blog.tags,
        author || blog.author,
        status || blog.status,
        is_featured !== undefined ? (is_featured ? 1 : 0) : blog.is_featured,
        published_at,
        id,
      ]
    );

    const [updated] = await pool.query('SELECT * FROM blogs WHERE id = ?', [id]);
    res.json({ success: true, message: 'Cập nhật bài viết thành công!', data: sanitizeLegacyLocalized(updated[0]) });
  } catch (err) {
    console.error('updateBlog error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// DELETE /api/admin/blogs/:id
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM blogs WHERE id = ?', [id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết.' });
    }

    // Xóa ảnh trên Cloudinary
    if (rows[0].thumbnail_public_id) {
      await deleteFromCloudinary(rows[0].thumbnail_public_id).catch(console.error);
    }

    await pool.query('DELETE FROM blogs WHERE id = ?', [id]);
    res.json({ success: true, message: 'Xóa bài viết thành công!' });
  } catch (err) {
    console.error('deleteBlog error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};
// POST /api/blogs/admin/upload-content-image
const uploadContentImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn ảnh để upload.' });
    }

    res.status(201).json({
      success: true,
      message: 'Upload ảnh thành công!',
      url: req.file.path,
      public_id: req.file.filename,
    });
  } catch (err) {
    console.error('uploadContentImage error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};
module.exports = { getBlogCategories, getBlogs, getBlog, createBlog, updateBlog, deleteBlog, uploadContentImage };
