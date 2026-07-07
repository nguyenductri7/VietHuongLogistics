CREATE TABLE IF NOT EXISTS home_page (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hero JSON NOT NULL,
  about_intro JSON NOT NULL,
  services_section JSON NOT NULL,
  partners_section JSON NOT NULL,
  contact_section JSON NOT NULL,
  footer JSON NOT NULL,
  updated_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_home_page_updated_by
    FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO home_page (
  hero,
  about_intro,
  services_section,
  partners_section,
  contact_section,
  footer
)
SELECT
  JSON_OBJECT(
    'title', 'VIET HUONG',
    'subtitle', 'LOGISTICS',
    'description', 'Kết nối toàn quốc — vươn tầm quốc tế.\nVận chuyển chuyên nghiệp, nhanh chóng và an toàn.',
    'primary_cta_label', 'Yêu Cầu Báo Giá',
    'primary_cta_link', '/dich-vu#lien-he',
    'secondary_cta_label', 'Xem Dịch Vụ',
    'secondary_cta_link', '/dich-vu',
    'video_url', '/videos/hero-truck.mp4',
    'fallback_image_url', '',
    'show_video', true
  ),
  JSON_OBJECT(
    'enabled', true,
    'section_label', 'Giới thiệu',
    'show_3d_truck', true
  ),
  JSON_OBJECT(
    'enabled', true,
    'title', 'Giải Pháp Vận Tải',
    'accent', 'Toàn Diện',
    'cta_label', 'Tư Vấn Miễn Phí',
    'cta_link', '/dich-vu#lien-he',
    'use_service_admin_items', true
  ),
  JSON_OBJECT(
    'enabled', true,
    'title', 'Đối tác của chúng tôi'
  ),
  JSON_OBJECT(
    'enabled', true,
    'title', 'Liên hệ tư vấn',
    'subtitle', 'Gửi thông tin để Việt Hương Logistics liên hệ lại với bạn.'
  ),
  JSON_OBJECT(
    'company_name', 'CÔNG TY TNHH GIAO NHẬN VẬN TẢI VIỆT HƯƠNG',
    'tax_code', '0402058419',
    'address', '58 Phước Lý 9 – Phường Hòa Khánh – TP. Đà Nẵng',
    'hotline', '0905.386.888',
    'email', 'info@vantaiviethuong.com',
    'facebook_url', 'https://facebook.com',
    'youtube_url', 'https://youtube.com',
    'instagram_url', 'https://instagram.com',
    'zalo_url', 'https://zalo.me',
    'offices', JSON_ARRAY(
      JSON_OBJECT('city', 'ĐÀ NẴNG', 'addr', '58 Phước Lý 9 – Phường Hòa Khánh – TP. Đà Nẵng'),
      JSON_OBJECT('city', 'ĐÀ NẴNG', 'addr', '133 Trung Lương 14, Phường Hòa Xuân, TP. Đà Nẵng'),
      JSON_OBJECT('city', 'ĐÀ NẴNG', 'addr', 'Đường Đ1, Thôn Đồng Yên, Xã Duy Xuyên, TP. Đà Nẵng'),
      JSON_OBJECT('city', 'HỒ CHÍ MINH', 'addr', '246 Nguyễn Duy Trinh, P. Bình Trưng, TP. Hồ Chí Minh'),
      JSON_OBJECT('city', 'HẢI PHÒNG', 'addr', '298 Phạm Văn Đồng, Phường Hưng Đạo, TP. Hải Phòng')
    )
  )
WHERE NOT EXISTS (SELECT 1 FROM home_page);
