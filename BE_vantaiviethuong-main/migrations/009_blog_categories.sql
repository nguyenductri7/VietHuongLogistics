CREATE TABLE IF NOT EXISTS blog_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(120) NOT NULL UNIQUE,
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_blog_categories_active_order (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO blog_categories (name, slug, sort_order, is_active) VALUES
  ('Xu Hướng', 'xu-huong', 1, 1),
  ('Công Nghệ', 'cong-nghe', 2, 1),
  ('Tin Tức', 'tin-tuc', 3, 1),
  ('Phân Tích', 'phan-tich', 4, 1),
  ('Sự Kiện', 'su-kien', 5, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  sort_order = VALUES(sort_order),
  is_active = VALUES(is_active);
