CREATE TABLE IF NOT EXISTS branches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  address VARCHAR(500) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(50),
  lat DECIMAL(11, 7) NOT NULL DEFAULT 16.0707000,
  lng DECIMAL(11, 7) NOT NULL DEFAULT 108.1526000,
  image_url VARCHAR(700),
  is_headquarter TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_branches_active_order (is_active, sort_order),
  INDEX idx_branches_headquarter (is_headquarter)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO branches (name, address, email, phone, lat, lng, image_url, is_headquarter, sort_order)
SELECT '58 Phước Lý 9 – Phường Hòa Khánh – TP. Đà Nẵng',
       '58 Phước Lý 9 – Phường Hòa Khánh – TP. Đà Nẵng',
       'facebook.com/gomsuviethuong',
       '0905.386.888',
       16.0707000,
       108.1526000,
       'https://res.cloudinary.com/dq8cmcln9/image/upload/v1775449642/danang_zprcls.webp',
       1,
       0
WHERE NOT EXISTS (SELECT 1 FROM branches);

INSERT INTO branches (name, address, email, phone, lat, lng, image_url, is_headquarter, sort_order)
SELECT 'Văn Phòng Đà Nẵng 1',
       '133 Trung Lương 14, Phường Hòa Xuân, TP. Đà Nẵng',
       'facebook.com/gomsuviethuong',
       '0905.386.888',
       15.9897000,
       108.2465000,
       'https://res.cloudinary.com/dq8cmcln9/image/upload/v1775449642/danang_zprcls.webp',
       0,
       1
WHERE (SELECT COUNT(*) FROM branches) = 1;

INSERT INTO branches (name, address, email, phone, lat, lng, image_url, is_headquarter, sort_order)
SELECT 'Văn Phòng Đà Nẵng 2',
       'Đường Đ1, Thôn Đồng Yên, Xã Duy Xuyên, TP. Đà Nẵng',
       'facebook.com/gomsuviethuong',
       '0905.386.888',
       15.8237000,
       108.2457000,
       'https://res.cloudinary.com/dq8cmcln9/image/upload/v1775449642/danang_zprcls.webp',
       0,
       2
WHERE (SELECT COUNT(*) FROM branches) = 2;

INSERT INTO branches (name, address, email, phone, lat, lng, image_url, is_headquarter, sort_order)
SELECT 'Chi Nhánh Hồ Chí Minh',
       '246 Nguyễn Duy Trinh, P. Bình Trưng, TP. Hồ Chí Minh',
       'facebook.com/gomsuviethuong',
       '0905.386.888',
       10.7877000,
       106.7583000,
       'https://viethuongceramics.com/wp-content/smush-webp/2026/01/LQM01215-scaled-1.jpg.webp',
       0,
       3
WHERE (SELECT COUNT(*) FROM branches) = 3;

INSERT INTO branches (name, address, email, phone, lat, lng, image_url, is_headquarter, sort_order)
SELECT 'Chi Nhánh Hải Phòng',
       '298 Phạm Văn Đồng, Phường Hưng Đạo, TP. Hải Phòng',
       'facebook.com/gomsuviethuong',
       '0905.386.888',
       20.7963000,
       106.7118000,
       'https://viethuongceramics.com/wp-content/uploads/2026/01/SHOWROOM-3D.jpg.webp',
       0,
       4
WHERE (SELECT COUNT(*) FROM branches) = 4;
