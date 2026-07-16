// src/controllers/servicesPageController.js
const { pool } = require('../config/database');
const { sanitizeLegacyLocalized } = require('../utils/cmsSanitizer');
const { ensurePublishedBaseline, recordCurrentPublished } = require('../services/cmsRevisionService');

const JSON_FIELDS = ['banner', 'process_steps', 'contact_info'];

const DEFAULT_SERVICES_PAGE = {
  banner: {
    title_line1: 'Vận Chuyển',
    title_accent: 'Đáng Tin Cậy',
    title_line3: '— Mọi Hành Trình',
    subtitle: 'Từ nội địa đến quốc tế, từ kho bãi đến chuyển phát nhanh — chúng tôi đảm bảo hàng hóa của bạn đến đúng nơi, đúng lúc.',
  },
  process_steps: [
    { step_order: 1, icon_key: 'Phone', title: 'Tiếp Nhận', desc: 'Ghi nhận yêu cầu, khảo sát hàng hóa và xác nhận thông tin vận chuyển.' },
    { step_order: 2, icon_key: 'Zap', title: 'Báo Giá', desc: 'Đề xuất phương án tối ưu chi phí, phù hợp loại hàng và tuyến đường.' },
    { step_order: 3, icon_key: 'ShieldCheck', title: 'Đóng Gói', desc: 'Đóng gói theo quy chuẩn, dán nhãn và lập chứng từ đầy đủ.' },
    { step_order: 4, icon_key: 'Truck', title: 'Vận Chuyển', desc: 'Khởi hành đúng lịch và cập nhật tiến độ vận chuyển liên tục.' },
    { step_order: 5, icon_key: 'CheckCircle2', title: 'Bàn Giao', desc: 'Kiểm tra hàng hóa, xác nhận chứng từ và bàn giao tận nơi.' },
  ],
  contact_info: {
    company_name: 'Việt Hương Logistics',
    tagline: 'Uy Tín · Nhanh Chóng · Tận Tâm',
    left_image: '',
    items: [
      { icon_key: 'MapPin', label: 'Trụ sở chính', value: '58 Phước Lý 9, Phường Hòa Khánh, TP. Đà Nẵng' },
      { icon_key: 'Phone', label: 'Hotline 24/7', value: '0905 386 888' },
      { icon_key: 'Mail', label: 'Email', value: 'info@vantaiviethuong.com' },
      { icon_key: 'Clock', label: 'Giờ làm việc', value: 'Thứ 2 – Thứ 7: 8:00 – 17:00' },
    ],
  },
};

const DEFAULT_SERVICE_ITEMS = [
  {
    slug: 'van-chuyen-noi-dia',
    title: 'Vận Chuyển Nội Địa',
    subtitle: 'Phủ khắp 63 tỉnh thành',
    description: 'Đội xe đa tải trọng từ 500kg đến 20 tấn, GPS tracking 24/7, cam kết giao đúng hẹn. Lịch trình cố định hằng ngày trên tuyến TP.HCM – Đà Nẵng và toàn quốc.',
    icon_key: 'Truck',
    image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1200&auto=format&fit=crop',
    tags: ['GPS 24/7', 'Đa tải trọng', 'Toàn quốc'],
  },
  {
    slug: 'van-chuyen-quoc-te',
    title: 'Vận Chuyển Quốc Tế',
    subtitle: 'Đường biển & hàng không',
    description: 'Kết nối Đông Nam Á, Trung Quốc và châu Âu qua đối tác đại lý toàn cầu. Xử lý thủ tục hải quan nhanh, tư vấn phân loại HS Code chuyên nghiệp.',
    icon_key: 'Globe',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop',
    tags: ['FCL / LCL', 'Hải quan', 'Door to Door'],
  },
  {
    slug: 'logistics-kho-bai',
    title: 'Logistics & Kho Bãi',
    subtitle: 'Lưu trữ thông minh',
    description: 'Hệ thống kho bãi đạt chuẩn, trang bị xe nâng và băng tải hiện đại. Quản lý hàng hóa bằng phần mềm, kiểm kê định kỳ minh bạch và chính xác.',
    icon_key: 'Warehouse',
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=1200&auto=format&fit=crop',
    tags: ['WMS', 'Kiểm kê định kỳ', 'Bảo hiểm hàng'],
  },
  {
    slug: 'chuyen-phat-nhanh',
    title: 'Chuyển Phát Nhanh',
    subtitle: 'Giao hỏa tốc trong ngày',
    description: 'Cam kết giao hàng nội thành trong 4 giờ, liên tỉnh trong 24 giờ. Dịch vụ COD thu hộ tiền, hỗ trợ sàn thương mại điện tử Shopee, Lazada và TikTok Shop.',
    icon_key: 'Zap',
    image: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?q=80&w=1200&auto=format&fit=crop',
    tags: ['COD', '4h nội thành', 'E-commerce'],
  },
];

function parseJson(value, fallback) {
  try {
    if (value === null || value === undefined) return fallback;
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
}

function normalizeServicesPage(row = {}) {
  const banner = parseJson(row.banner, {});
  const processSteps = parseJson(row.process_steps, []);
  const contactInfo = parseJson(row.contact_info, {});

  return sanitizeLegacyLocalized({
    id: row.id || null,
    banner: {
      ...DEFAULT_SERVICES_PAGE.banner,
      ...(banner && typeof banner === 'object' && !Array.isArray(banner) ? banner : {}),
    },
    process_steps: Array.isArray(processSteps) && processSteps.length
      ? processSteps
      : DEFAULT_SERVICES_PAGE.process_steps,
    contact_info: {
      ...DEFAULT_SERVICES_PAGE.contact_info,
      ...(contactInfo && typeof contactInfo === 'object' && !Array.isArray(contactInfo) ? contactInfo : {}),
      items: Array.isArray(contactInfo?.items) && contactInfo.items.length
        ? contactInfo.items
        : DEFAULT_SERVICES_PAGE.contact_info.items,
    },
    updated_at: row.updated_at || null,
  });
}

function normalizeServiceItem(row = {}) {
  return sanitizeLegacyLocalized({
    ...row,
    tags: parseJson(row.tags, []),
    detail_content: parseJson(row.detail_content, null),
  });
}

// ── Tạo slug không dấu từ tiếng Việt, dùng cho service_items.slug ──
function slugify(str) {
  return str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // bỏ dấu
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ═══════════ PHẦN CỐ ĐỊNH (banner / process_steps / contact_info) ═══════════

// GET /api/services-page  (public)
const getServicesPage = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM services_page ORDER BY id DESC LIMIT 1');
    if (!rows.length) {
      return res.json({ success: true, data: normalizeServicesPage() });
    }
    res.json({ success: true, data: normalizeServicesPage(rows[0]) });
  } catch (err) {
    console.error('Get services_page error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// PUT /api/services-page  (admin)
const updateServicesPage = async (req, res) => {
  try {
    let [rows] = await pool.query('SELECT id FROM services_page ORDER BY id DESC LIMIT 1');
    if (!rows.length) {
      const [result] = await pool.query(
        'INSERT INTO services_page (banner, process_steps, contact_info) VALUES (?, ?, ?)',
        [
          JSON.stringify(DEFAULT_SERVICES_PAGE.banner),
          JSON.stringify(DEFAULT_SERVICES_PAGE.process_steps),
          JSON.stringify(DEFAULT_SERVICES_PAGE.contact_info),
        ]
      );
      rows = [{ id: result.insertId }];
    }
    const pageId = rows[0].id;

    await ensurePublishedBaseline('services', req.user?.id);
    const updates = [];
    const values = [];
    for (const field of JSON_FIELDS) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(JSON.stringify(req.body[field]));
      }
    }
    if (!updates.length) {
      return res.status(400).json({ success: false, message: 'Không có dữ liệu để cập nhật.' });
    }
    updates.push('updated_by = ?');
    values.push(req.user?.id || null);
    values.push(pageId);

    await pool.query(`UPDATE services_page SET ${updates.join(', ')} WHERE id = ?`, values);
    await recordCurrentPublished('services', req.user?.id, 'Xuất bản thay đổi trang dịch vụ');
    res.json({ success: true, message: 'Cập nhật thành công!' });
  } catch (err) {
    console.error('Update services_page error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// ═══════════ DANH SÁCH DỊCH VỤ (service_items) — CRUD đầy đủ ═══════════

// GET /api/services-page/items  (public) — chỉ trả dịch vụ đang active, sắp theo sort_order
const listServiceItems = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM service_items WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
    );
    const items = rows.map(normalizeServiceItem);
    res.json({ success: true, data: items });
  } catch (err) {
    console.error('List service_items error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// GET /api/services-page/items/admin  (admin) — trả cả item bị ẩn, để quản lý
const listServiceItemsAdmin = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM service_items ORDER BY sort_order ASC, id ASC');
    const items = rows.map(normalizeServiceItem);
    res.json({ success: true, data: items });
  } catch (err) {
    console.error('List service_items (admin) error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// POST /api/services-page/items  (admin) — tạo dịch vụ mới, slug tự sinh từ title
const createServiceItem = async (req, res) => {
  try {
    const { title, subtitle, description, icon_key, image, tags, detail_content } = req.body;

    if (!title?.trim() || !subtitle?.trim() || !description?.trim() || !image?.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin bắt buộc.' });
    }

    await ensurePublishedBaseline('services', req.user?.id);
    let slug = slugify(title);
    if (!slug) slug = `dich-vu-${Date.now()}`;

    // Đảm bảo slug không trùng — nếu trùng thì gắn số đếm phía sau
    const [existing] = await pool.query('SELECT id FROM service_items WHERE slug = ?', [slug]);
    if (existing.length) slug = `${slug}-${Date.now()}`;

    const [maxOrderRows] = await pool.query('SELECT COALESCE(MAX(sort_order), 0) AS maxOrder FROM service_items');
    const nextOrder = maxOrderRows[0].maxOrder + 1;

    const [result] = await pool.query(
      `INSERT INTO service_items (slug, title, subtitle, description, icon_key, image, tags, detail_content, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug, title.trim(), subtitle.trim(), description.trim(), icon_key || 'Truck', image.trim(),
        JSON.stringify(tags || []), JSON.stringify(detail_content || {}), nextOrder,
      ]
    );

    await recordCurrentPublished('services', req.user?.id, `Thêm dịch vụ: ${title.trim()}`);

    res.status(201).json({ success: true, message: 'Tạo dịch vụ thành công!', id: result.insertId, slug });
  } catch (err) {
    console.error('Create service_item error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// POST /api/services-page/items/seed - Tạo bộ dịch vụ đang dùng trên giao diện
const seedDefaultServiceItems = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await ensurePublishedBaseline('services', req.user?.id);
    await connection.beginTransaction();
    let created = 0;

    for (const [index, item] of DEFAULT_SERVICE_ITEMS.entries()) {
      const [result] = await connection.query(
        `INSERT IGNORE INTO service_items
          (slug, title, subtitle, description, icon_key, image, tags, sort_order, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          item.slug,
          item.title,
          item.subtitle,
          item.description,
          item.icon_key,
          item.image,
          JSON.stringify(item.tags),
          index + 1,
        ]
      );
      created += result.affectedRows;
    }

    await connection.commit();
    if (created) await recordCurrentPublished('services', req.user?.id, 'Khởi tạo danh sách dịch vụ mặc định');
    return res.status(created ? 201 : 200).json({
      success: true,
      created,
      message: created
        ? `Đã khởi tạo ${created} dịch vụ mặc định.`
        : 'Các dịch vụ mặc định đã tồn tại.',
    });
  } catch (err) {
    await connection.rollback();
    console.error('Seed service_items error:', err);
    return res.status(500).json({ success: false, message: 'Không thể khởi tạo dịch vụ mặc định.' });
  } finally {
    connection.release();
  }
};

// PUT /api/services-page/items/:id  (admin) — sửa nội dung, KHÔNG cho sửa slug
const updateServiceItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, description, icon_key, image, tags, detail_content, is_active } = req.body;

    const [rows] = await pool.query('SELECT id FROM service_items WHERE id = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dịch vụ.' });
    }

    await ensurePublishedBaseline('services', req.user?.id);
    await pool.query(
      `UPDATE service_items
       SET title = ?, subtitle = ?, description = ?, icon_key = ?, image = ?, tags = ?, detail_content = ?, is_active = ?
       WHERE id = ?`,
      [
        title, subtitle, description, icon_key, image, JSON.stringify(tags || []),
        JSON.stringify(detail_content || {}), is_active ?? 1, id,
      ]
    );

    await recordCurrentPublished('services', req.user?.id, `Cập nhật dịch vụ: ${title || id}`);

    res.json({ success: true, message: 'Cập nhật dịch vụ thành công!' });
  } catch (err) {
    console.error('Update service_item error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// DELETE /api/services-page/items/:id  (admin)
const deleteServiceItem = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT title FROM service_items WHERE id = ?', [id]);
    await ensurePublishedBaseline('services', req.user?.id);
    const [result] = await pool.query('DELETE FROM service_items WHERE id = ?', [id]);
    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dịch vụ.' });
    }
    await recordCurrentPublished('services', req.user?.id, `Xóa dịch vụ: ${rows[0]?.title || id}`);
    res.json({ success: true, message: 'Đã xóa dịch vụ.' });
  } catch (err) {
    console.error('Delete service_item error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// PUT /api/services-page/items/reorder  (admin) — body: { order: [id1, id2, id3, ...] }
const reorderServiceItems = async (req, res) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order) || !order.length) {
      return res.status(400).json({ success: false, message: 'Dữ liệu thứ tự không hợp lệ.' });
    }

    await ensurePublishedBaseline('services', req.user?.id);
    // Cập nhật sort_order tuần tự theo vị trí trong mảng order gửi lên
    await Promise.all(
      order.map((itemId, index) =>
        pool.query('UPDATE service_items SET sort_order = ? WHERE id = ?', [index + 1, itemId])
      )
    );

    await recordCurrentPublished('services', req.user?.id, 'Sắp xếp lại danh sách dịch vụ');

    res.json({ success: true, message: 'Đã lưu thứ tự mới.' });
  } catch (err) {
    console.error('Reorder service_items error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// POST /api/services-page/upload-image  (admin) — dùng uploadWebsite từ config/cloudinary.js
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn ảnh để upload.' });
    }
    res.json({ success: true, url: req.file.path, public_id: req.file.filename });
  } catch (err) {
    console.error('Upload image error:', err);
    res.status(500).json({ success: false, message: 'Lỗi khi upload ảnh.' });
  }
};

module.exports = {
  getServicesPage,
  updateServicesPage,
  listServiceItems,
  listServiceItemsAdmin,
  createServiceItem,
  seedDefaultServiceItems,
  updateServiceItem,
  deleteServiceItem,
  reorderServiceItems,
  uploadImage,
};
