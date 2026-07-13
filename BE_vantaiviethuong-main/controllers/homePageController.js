const { pool } = require('../config/database');
const { sanitizeLegacyLocalized } = require('../utils/cmsSanitizer');

const JSON_FIELDS = [
  'hero',
  'about_intro',
  'services_section',
  'partners_section',
  'contact_section',
  'footer',
];

const DEFAULT_HOME_PAGE = {
  hero: {
    title: 'VIET HUONG',
    subtitle: 'LOGISTICS',
    description: 'Kết nối toàn quốc — vươn tầm quốc tế.\nVận chuyển chuyên nghiệp, nhanh chóng và an toàn.',
    primary_cta_label: 'Yêu Cầu Báo Giá',
    primary_cta_link: '/dich-vu#lien-he',
    secondary_cta_label: 'Xem Dịch Vụ',
    secondary_cta_link: '/dich-vu',
    video_url: '/videos/hero-truck.mp4',
    fallback_image_url: '',
    show_video: true,
  },
  about_intro: {
    enabled: true,
    section_label: 'Giới thiệu',
    show_3d_truck: true,
    title: 'Đối Tác Tin Cậy',
    title_accent: 'Trong Từng Chuyến Hàng',
    description: 'Viet Huong Logistics — thành viên chiến lược của Viet Huong Group — cung cấp giải pháp logistics toàn diện, kết nối doanh nghiệp Việt Nam với thị trường toàn cầu bằng công nghệ hiện đại và đội ngũ chuyên nghiệp.',
    pills: 'Vận chuyển nội địa\nXuất nhập khẩu\nMua hộ quốc tế\nKết nối toàn cầu',
    cta_label: 'Tìm Hiểu Thêm',
    cta_link: '/dich-vu#lien-he',
  },
  services_section: {
    enabled: true,
    title: 'Giải Pháp Vận Tải',
    accent: 'Toàn Diện',
    cta_label: 'Tư Vấn Miễn Phí',
    cta_link: '/dich-vu#lien-he',
    use_service_admin_items: true,
  },
  partners_section: {
    enabled: true,
    title: 'Đối tác của chúng tôi',
    reviews_title: 'Đánh giá từ khách hàng',
    reviews_subtitle: 'Những phản hồi thực tế từ các doanh nghiệp đã đồng hành cùng Việt Hương Logistics.',
    reviews: [
      {
        initials: 'TQ',
        name: 'Tony Quoc',
        company: 'BITI France',
        quote: 'Tôi rất hài lòng với dịch vụ logistics của Việt Hương. Các nhân viên hỗ trợ tận tình, chuyên nghiệp. Thời gian giao nhận hàng luôn được đảm bảo chính xác.',
      },
      {
        initials: 'BN',
        name: 'Bảo Nguyên',
        company: 'BITI VN',
        quote: 'Dịch vụ chuyên nghiệp và đáng tin cậy. Hệ thống vận chuyển tiên tiến mang lại sự hài lòng tuyệt đối. Đảm bảo an toàn hàng hóa là điều tôi thích nhất.',
      },
      {
        initials: 'JT',
        name: 'Jessie Truong',
        company: 'Unilever VN',
        quote: 'Rất chuyên nghiệp trong xử lý hàng hóa. Vận chuyển an toàn, đúng hạn — tôi hoàn toàn tin tưởng và sẽ tiếp tục hợp tác lâu dài.',
      },
      {
        initials: 'PH',
        name: 'Phạm Quốc Hùng',
        company: 'CFO — Masan Group',
        quote: 'Từ khi hợp tác với Việt Hương, chi phí vận chuyển giảm 18% trong khi chất lượng dịch vụ tăng lên rõ rệt. Đó là điều hiếm thấy trên thị trường.',
      },
    ],
  },
  contact_section: {
    enabled: true,
    title: 'Liên hệ tư vấn',
    subtitle: 'Gửi thông tin để Việt Hương Logistics liên hệ lại với bạn.',
  },
  footer: {
    company_name: 'CÔNG TY TNHH GIAO NHẬN VẬN TẢI VIỆT HƯƠNG',
    tax_code: '0402058419',
    address: '58 Phước Lý 9 – Phường Hòa Khánh – TP. Đà Nẵng',
    hotline: '0905.386.888',
    email: 'info@vantaiviethuong.com',
    facebook_url: 'https://facebook.com',
    youtube_url: 'https://youtube.com',
    instagram_url: 'https://instagram.com',
    zalo_url: 'https://zalo.me',
    offices: [
      { city: 'ĐÀ NẴNG', addr: '58 Phước Lý 9 – Phường Hòa Khánh – TP. Đà Nẵng' },
      { city: 'ĐÀ NẴNG', addr: '133 Trung Lương 14, Phường Hòa Xuân, TP. Đà Nẵng' },
      { city: 'ĐÀ NẴNG', addr: 'Đường Đ1, Thôn Đồng Yên, Xã Duy Xuyên, TP. Đà Nẵng' },
      { city: 'HỒ CHÍ MINH', addr: '246 Nguyễn Duy Trinh, P. Bình Trưng, TP. Hồ Chí Minh' },
      { city: 'HẢI PHÒNG', addr: '298 Phạm Văn Đồng, Phường Hưng Đạo, TP. Hải Phòng' },
    ],
  },
};

function parseJson(value, fallback) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function mergeObject(defaultValue, value) {
  const safeValue = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  return { ...defaultValue, ...safeValue };
}

function normalizeHomePage(row = {}) {
  const data = {};

  JSON_FIELDS.forEach((field) => {
    data[field] = parseJson(row[field], DEFAULT_HOME_PAGE[field]);
  });

  return sanitizeLegacyLocalized({
    id: row.id || null,
    hero: mergeObject(DEFAULT_HOME_PAGE.hero, data.hero),
    about_intro: mergeObject(DEFAULT_HOME_PAGE.about_intro, data.about_intro),
    services_section: mergeObject(DEFAULT_HOME_PAGE.services_section, data.services_section),
    partners_section: mergeObject(DEFAULT_HOME_PAGE.partners_section, data.partners_section),
    contact_section: mergeObject(DEFAULT_HOME_PAGE.contact_section, data.contact_section),
    footer: {
      ...DEFAULT_HOME_PAGE.footer,
      ...(data.footer && typeof data.footer === 'object' && !Array.isArray(data.footer) ? data.footer : {}),
      offices: Array.isArray(data.footer?.offices) && data.footer.offices.length
        ? data.footer.offices
        : DEFAULT_HOME_PAGE.footer.offices,
    },
    updated_at: row.updated_at || null,
  });
}

async function ensureHomePageRow() {
  let [rows] = await pool.query('SELECT * FROM home_page ORDER BY id DESC LIMIT 1');
  if (rows.length) return rows[0];

  await pool.query(
    `INSERT INTO home_page (hero, about_intro, services_section, partners_section, contact_section, footer)
     VALUES (?, ?, ?, ?, ?, ?)`,
    JSON_FIELDS.map((field) => JSON.stringify(DEFAULT_HOME_PAGE[field]))
  );

  [rows] = await pool.query('SELECT * FROM home_page ORDER BY id DESC LIMIT 1');
  return rows[0];
}

const getHomePage = async (req, res) => {
  try {
    const row = await ensureHomePageRow();
    res.json({ success: true, data: normalizeHomePage(row) });
  } catch (err) {
    console.error('getHomePage error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

const updateHomePage = async (req, res) => {
  try {
    const body = req.body || {};
    const invalidKeys = Object.keys(body).filter((key) => !JSON_FIELDS.includes(key));

    if (invalidKeys.length) {
      return res.status(400).json({
        success: false,
        message: `Section không hợp lệ: ${invalidKeys.join(', ')}`,
      });
    }

    const entries = Object.entries(body);
    if (!entries.length) {
      return res.status(400).json({ success: false, message: 'Không có dữ liệu cập nhật.' });
    }

    const row = await ensureHomePageRow();
    const updates = [];
    const values = [];

    entries.forEach(([field, value]) => {
      updates.push(`${field} = ?`);
      values.push(JSON.stringify(value || DEFAULT_HOME_PAGE[field]));
    });

    updates.push('updated_by = ?');
    values.push(req.user?.id || null, row.id);

    await pool.query(`UPDATE home_page SET ${updates.join(', ')} WHERE id = ?`, values);

    const [rows] = await pool.query('SELECT * FROM home_page WHERE id = ?', [row.id]);
    res.json({
      success: true,
      message: 'Cập nhật trang chủ thành công!',
      data: normalizeHomePage(rows[0]),
    });
  } catch (err) {
    console.error('updateHomePage error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

const uploadHomeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn ảnh.' });
    }

    res.json({
      success: true,
      message: 'Upload ảnh thành công!',
      url: req.file.path,
      public_id: req.file.filename,
    });
  } catch (err) {
    console.error('uploadHomeImage error:', err);
    res.status(500).json({ success: false, message: 'Upload ảnh thất bại.' });
  }
};

module.exports = {
  DEFAULT_HOME_PAGE,
  getHomePage,
  updateHomePage,
  uploadHomeImage,
};
