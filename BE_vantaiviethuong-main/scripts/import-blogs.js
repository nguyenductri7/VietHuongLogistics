require('dotenv').config();

const { pool } = require('../config/database');
const posts = require('../data/blog-posts');

async function importBlogs() {
  const connection = await pool.getConnection();
  let inserted = 0;
  let skipped = 0;

  try {
    await connection.beginTransaction();

    for (const post of posts) {
      const [existing] = await connection.query(
        'SELECT id FROM blogs WHERE slug = ? LIMIT 1',
        [post.slug]
      );

      if (existing.length) {
        skipped += 1;
        console.log(`Bỏ qua bài đã tồn tại: ${post.title}`);
        continue;
      }

      await connection.query(
        `INSERT INTO blogs
          (title, slug, excerpt, content, thumbnail_url, thumbnail_public_id,
           category, tags, author, status, is_featured, published_at)
         VALUES (?, ?, ?, ?, ?, '', ?, ?, ?, 'draft', ?, NULL)`,
        [
          post.title,
          post.slug,
          post.excerpt,
          post.content,
          post.thumbnail_url || '',
          post.category,
          post.tags,
          post.author || 'Việt Hương Logistics',
          post.is_featured ? 1 : 0,
        ]
      );
      inserted += 1;
      console.log(`Đã thêm bản nháp: ${post.title}`);
    }

    await connection.commit();
    console.log(`\nHoàn tất: thêm ${inserted} bài, bỏ qua ${skipped} bài đã tồn tại.`);
    console.log('Đăng nhập trang admin để thêm ảnh đại diện, duyệt nội dung và xuất bản.');
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

importBlogs().catch((error) => {
  console.error('Nhập bài viết thất bại:', error.message);
  process.exit(1);
});
