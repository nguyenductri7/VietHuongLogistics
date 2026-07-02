const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage cho ảnh bài viết blog (thumbnail) — crop cứng 1200x630 để đồng bộ card/thumbnail
const blogStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'vantaiviethuong/blog',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 630, crop: 'fill', quality: 'auto' }],
  },
});

// Storage cho ảnh CHÈN TRONG NỘI DUNG bài viết (rich text editor)
// Không crop cứng — chỉ giới hạn chiều rộng tối đa, giữ tỉ lệ gốc để không cắt mất nội dung ảnh
const blogContentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'vantaiviethuong/blog/content',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1600, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
  },
});

// Storage cho ảnh website (hero, logo, banner...)
const websiteStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'vantaiviethuong/website',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

// Storage cho ảnh đối tác (partners)
const partnerStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'vantaiviethuong/partners',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
    transformation: [{ width: 400, height: 200, crop: 'fit', quality: 'auto' }],
  },
});

const uploadBlog = multer({
  storage: blogStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Multer riêng cho ảnh chèn trong bài viết
const uploadBlogContent = multer({
  storage: blogContentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const uploadWebsite = multer({
  storage: websiteStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadPartner = multer({
  storage: partnerStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Xóa ảnh khỏi Cloudinary
async function deleteFromCloudinary(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (err) {
    console.error('Lỗi xóa ảnh Cloudinary:', err);
    throw err;
  }
}

// Lấy public_id từ URL Cloudinary
function getPublicIdFromUrl(url) {
  if (!url) return null;
  const parts = url.split('/');
  const uploadIndex = parts.indexOf('upload');
  if (uploadIndex === -1) return null;
  // Bỏ version (v1234567) và extension
  const pathParts = parts.slice(uploadIndex + 2);
  const filename = pathParts.join('/');
  return filename.replace(/\.[^/.]+$/, ''); // bỏ extension
}

module.exports = {
  cloudinary,
  uploadBlog,
  uploadBlogContent,
  uploadWebsite,
  uploadPartner,
  deleteFromCloudinary,
  getPublicIdFromUrl,
};