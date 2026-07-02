-- ================================================
-- VAN TAI VIET HUONG - Database Schema
-- Chạy file này để tạo database và các bảng
-- MySQL: mysql -u root -p < init.sql
-- ================================================

CREATE DATABASE IF NOT EXISTS vantaiviethuong
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vantaiviethuong;

-- ================================================
-- BẢNG ADMIN USERS
-- ================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  email VARCHAR(100),
  role ENUM('superadmin', 'admin', 'editor') DEFAULT 'editor',
  is_active TINYINT(1) DEFAULT 1,
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ================================================
-- BẢNG BLOG / TIN TỨC
-- ================================================
CREATE TABLE IF NOT EXISTS blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  slug VARCHAR(300) NOT NULL UNIQUE,
  excerpt TEXT,
  content LONGTEXT,
  thumbnail_url VARCHAR(500),
  thumbnail_public_id VARCHAR(300),
  category VARCHAR(100) DEFAULT 'Tin Tức',
  tags VARCHAR(500),
  author VARCHAR(100) DEFAULT 'Admin',
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  view_count INT DEFAULT 0,
  is_featured TINYINT(1) DEFAULT 0,
  published_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_slug (slug),
  INDEX idx_featured (is_featured),
  INDEX idx_published_at (published_at)
);

-- ================================================
-- BẢNG CÀI ĐẶT WEBSITE
-- ================================================
CREATE TABLE IF NOT EXISTS website_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value LONGTEXT,
  setting_type ENUM('text', 'image', 'json', 'boolean') DEFAULT 'text',
  label VARCHAR(200),
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ================================================
-- BẢNG ĐỐI TÁC / PARTNERS
-- ================================================
CREATE TABLE IF NOT EXISTS partners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  logo_url VARCHAR(500),
  logo_public_id VARCHAR(300),
  website_url VARCHAR(300),
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ================================================
-- BẢNG DỊCH VỤ / SERVICES
-- ================================================
CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  icon_url VARCHAR(500),
  icon_public_id VARCHAR(300),
  features JSON,
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ================================================
-- SERVICES PAGE CONTENT
-- Used by /api/services-page
-- ================================================
CREATE TABLE IF NOT EXISTS services_page (
  id INT AUTO_INCREMENT PRIMARY KEY,
  banner JSON NOT NULL,
  process_steps JSON NOT NULL,
  contact_info JSON NOT NULL,
  updated_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_services_page_updated_by
    FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Create the singleton page row expected by servicesPageController.
INSERT INTO services_page (banner, process_steps, contact_info)
SELECT JSON_OBJECT(), JSON_ARRAY(), JSON_OBJECT()
WHERE NOT EXISTS (SELECT 1 FROM services_page);

-- ================================================
-- SERVICE ITEMS
-- Used by /api/services-page/items
-- ================================================
CREATE TABLE IF NOT EXISTS service_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(300) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(300) NOT NULL,
  description TEXT NOT NULL,
  icon_key VARCHAR(100) DEFAULT 'Truck',
  image VARCHAR(500) NOT NULL,
  tags JSON,
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_service_items_active_order (is_active, sort_order)
);

-- ================================================
-- ABOUT PAGE CONTENT
-- Used by /api/about
-- ================================================
CREATE TABLE IF NOT EXISTS about_page (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hero JSON NOT NULL,
  stats JSON NOT NULL,
  identity JSON NOT NULL,
  services JSON NOT NULL,
  timeline JSON NOT NULL,
  values_section JSON NOT NULL,
  updated_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_about_page_updated_by
    FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Create the singleton page row expected by aboutController.
INSERT INTO about_page (hero, stats, identity, services, timeline, values_section)
SELECT JSON_OBJECT(), JSON_OBJECT(), JSON_OBJECT(), JSON_ARRAY(), JSON_ARRAY(), JSON_OBJECT()
WHERE NOT EXISTS (SELECT 1 FROM about_page);

-- ================================================
-- FAQ CONTENT
-- Used by /api/faq-content
-- ================================================
CREATE TABLE IF NOT EXISTS faq_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(100) NOT NULL UNIQUE,
  label VARCHAR(200) NOT NULL,
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_faq_categories_active_order (is_active, sort_order)
);

CREATE TABLE IF NOT EXISTS faq_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  question TEXT NOT NULL,
  answer LONGTEXT NOT NULL,
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_faq_items_category
    FOREIGN KEY (category_id) REFERENCES faq_categories(id) ON DELETE CASCADE,
  INDEX idx_faq_items_category_active_order (category_id, is_active, sort_order)
);

-- ================================================
-- FAQ INQUIRIES
-- Used by /api/faq-inquiries
-- ================================================
CREATE TABLE IF NOT EXISTS faq_inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  question TEXT NOT NULL,
  status ENUM('pending', 'inprogress', 'done') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_faq_inquiries_status_created (status, created_at)
);

-- ================================================
-- BẢNG CONTACT MESSAGES (Tin nhắn liên hệ)
-- ================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  company VARCHAR(200),
  message TEXT,
  status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status)
);

-- ================================================
-- DỮ LIỆU MẶC ĐỊNH: Admin account
-- Password: Admin@123 (nhớ đổi sau khi setup)
-- ================================================
INSERT IGNORE INTO admin_users (username, password, full_name, email, role)
VALUES (
  'admin',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password (đổi lại)
  'Super Admin',
  'admin@vantaiviethuong.com',
  'superadmin'
);

-- ================================================
-- DỮ LIỆU MẶC ĐỊNH: Website settings
-- ================================================
INSERT IGNORE INTO website_settings (setting_key, setting_value, setting_type, label, description) VALUES
('site_name', 'Vận Tải Việt Hưởng', 'text', 'Tên công ty', 'Tên hiển thị trên website'),
('site_tagline', 'Đơn vị vận tải hàng đầu', 'text', 'Slogan', 'Slogan của công ty'),
('hero_title', 'Vận Tải Việt Hưởng', 'text', 'Tiêu đề Hero', 'Tiêu đề lớn trên trang chủ'),
('hero_subtitle', 'Giải pháp vận tải chuyên nghiệp, an toàn và đúng hạn', 'text', 'Phụ đề Hero', 'Mô tả ngắn dưới tiêu đề'),
('hero_image_url', '', 'image', 'Ảnh Hero', 'Ảnh nền trang chủ'),
('hero_image_public_id', '', 'text', 'Hero Image Public ID', 'Cloudinary public ID'),
('about_title', 'Về Chúng Tôi', 'text', 'Tiêu đề Giới thiệu', NULL),
('about_content', 'Công ty vận tải Việt Hưởng với hơn 10 năm kinh nghiệm...', 'text', 'Nội dung Giới thiệu', NULL),
('about_image_url', '', 'image', 'Ảnh Giới thiệu', NULL),
('about_image_public_id', '', 'text', 'About Image Public ID', NULL),
('contact_phone', '0905 xxx xxx', 'text', 'Số điện thoại', NULL),
('contact_email', 'info@vantaiviethuong.com', 'text', 'Email liên hệ', NULL),
('contact_address', 'Đà Nẵng, Việt Nam', 'text', 'Địa chỉ', NULL),
('facebook_url', '', 'text', 'Facebook URL', NULL),
('zalo_url', '', 'text', 'Zalo URL', NULL),
('logo_url', '', 'image', 'Logo', 'Logo công ty'),
('logo_public_id', '', 'text', 'Logo Public ID', NULL),
('stats_years', '10', 'text', 'Số năm kinh nghiệm', NULL),
('stats_customers', '500', 'text', 'Số khách hàng', NULL),
('stats_trips', '10000', 'text', 'Số chuyến đã thực hiện', NULL);

-- ================================================
-- DỮ LIỆU MẪU: Blog
-- ================================================
INSERT IGNORE INTO blogs (title, slug, excerpt, content, category, author, status, is_featured, published_at) VALUES
('Dịch vụ vận tải hàng hóa toàn quốc', 'dich-vu-van-tai-hang-hoa-toan-quoc', 
 'Chúng tôi cung cấp dịch vụ vận chuyển hàng hóa chuyên nghiệp trên toàn quốc với đội xe hiện đại.',
 '<p>Với đội ngũ lái xe chuyên nghiệp và hệ thống xe tải hiện đại, Vận Tải Việt Hưởng tự hào là đơn vị vận chuyển hàng đầu khu vực miền Trung...</p>',
 'Tin Tức', 'Admin', 'published', 1, NOW()),
('Kinh nghiệm vận chuyển hàng dễ vỡ', 'kinh-nghiem-van-chuyen-hang-de-vo',
 'Chia sẻ những kinh nghiệm quý báu trong việc đóng gói và vận chuyển các mặt hàng dễ vỡ.',
 '<p>Vận chuyển hàng dễ vỡ đòi hỏi kỹ năng đặc biệt và sự cẩn thận tuyệt đối...</p>',
 'Phân Tích', 'Admin', 'published', 0, NOW());

SELECT 'Database khởi tạo thành công! ✅' AS message;
