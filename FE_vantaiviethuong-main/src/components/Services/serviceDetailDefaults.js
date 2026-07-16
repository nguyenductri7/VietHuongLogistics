export const GENERIC_SERVICE_DETAIL = {
  eyebrow: 'Chi Tiết Dịch Vụ',
  title_prefix: 'Tại Sao Chọn',
  description: 'Chúng tôi không chỉ vận chuyển hàng hóa — chúng tôi cam kết mang lại sự yên tâm tuyệt đối cho doanh nghiệp của bạn, từ khâu tiếp nhận đến tận tay người nhận.',
  cta_label: 'Nhận Báo Giá Ngay',
  cta_link: '#lien-he',
  hero_cta_label: 'Đặt Dịch Vụ Ngay',
  form_title_prefix: 'Đặt Lịch',
  form_description: 'Tư vấn miễn phí · Báo giá trong 30 phút · Không ràng buộc',
  hotline: '0905 386 888',
  email: 'info@vantaiviethuong.com',
  highlights: [],
  features: [],
}

export const SERVICE_DETAIL_DATA = {
  'van-chuyen-noi-dia': {
    ...GENERIC_SERVICE_DETAIL,
    highlights: [
      { num: '63+', label: 'Tỉnh thành phủ sóng' },
      { num: '500kg–20T', label: 'Tải trọng đa dạng' },
      { num: '24/7', label: 'GPS tracking thực tế' },
      { num: '99.2%', label: 'Tỷ lệ giao đúng hẹn' },
    ],
    features: [
      'Đội xe hơn 200 phương tiện, tải trọng từ 500kg đến 20 tấn.',
      'Hệ thống GPS theo dõi lộ trình thực tế, cập nhật liên tục 24/7.',
      'Lịch trình cố định hằng ngày tuyến HCM – Đà Nẵng – Hà Nội.',
      'Bảo hiểm hàng hóa toàn hành trình, bồi thường nhanh trong 48h.',
      'Tài xế được đào tạo chuyên nghiệp, kinh nghiệm trung bình 8 năm.',
      'Hệ thống chứng từ điện tử, tra cứu đơn hàng trực tuyến dễ dàng.',
    ],
  },
  'van-chuyen-quoc-te': {
    ...GENERIC_SERVICE_DETAIL,
    highlights: [
      { num: '40+', label: 'Quốc gia kết nối' },
      { num: 'FCL/LCL', label: 'Đường biển linh hoạt' },
      { num: '48h', label: 'Xử lý hải quan nhanh' },
      { num: '15+', label: 'Năm kinh nghiệm xuất nhập khẩu' },
    ],
    features: [
      'Kết nối Đông Nam Á, Trung Quốc, Nhật Bản và châu Âu.',
      'Dịch vụ đường biển FCL (nguyên container) và LCL (ghép hàng).',
      'Vận tải hàng không nhanh chóng cho hàng có giá trị cao.',
      'Tư vấn phân loại HS Code và tối ưu thuế nhập khẩu.',
      'Hỗ trợ thủ tục hải quan trọn gói, từ khai báo đến thông quan.',
      'Dịch vụ Door-to-Door: nhận hàng tại kho, giao tận đích.',
    ],
  },
  'logistics-kho-bai': {
    ...GENERIC_SERVICE_DETAIL,
    highlights: [
      { num: '50,000m²', label: 'Tổng diện tích kho' },
      { num: 'WMS', label: 'Phần mềm quản lý hiện đại' },
      { num: '100%', label: 'Hàng được bảo hiểm' },
      { num: 'Real-time', label: 'Kiểm kê và báo cáo' },
    ],
    features: [
      'Hệ thống kho đạt chuẩn, nhiệt độ kiểm soát theo yêu cầu hàng hóa.',
      'Trang bị xe nâng, băng tải và hệ thống rack hiện đại.',
      'Phần mềm WMS quản lý tồn kho theo thời gian thực.',
      'Kiểm kê định kỳ minh bạch, báo cáo gửi email hằng tuần.',
      'Dịch vụ đóng gói, dán nhãn và phân loại theo yêu cầu.',
      'Bảo hiểm hàng hóa toàn diện trong suốt thời gian lưu kho.',
    ],
  },
  'chuyen-phat-nhanh': {
    ...GENERIC_SERVICE_DETAIL,
    highlights: [
      { num: '4h', label: 'Giao nội thành' },
      { num: '24h', label: 'Giao liên tỉnh' },
      { num: 'COD', label: 'Thu hộ tiền mặt' },
      { num: '3 sàn', label: 'Shopee · Lazada · TikTok' },
    ],
    features: [
      'Cam kết giao hàng nội thành trong 4 giờ kể từ lúc lấy.',
      'Liên tỉnh 24 giờ cho các tuyến HCM – Đà Nẵng – Hà Nội.',
      'Dịch vụ COD thu hộ tiền, chuyển khoản về trong ngày.',
      'Tích hợp API với Shopee, Lazada, TikTok Shop, đồng bộ đơn tự động.',
      'Ứng dụng tra cứu đơn hàng real-time cho người gửi và người nhận.',
      'Đội giao hàng chuyên nghiệp, đồng phục, có mã nhân viên xác minh.',
    ],
  },
}

export function normalizeServiceDetail(detail, slug = '') {
  const fallback = SERVICE_DETAIL_DATA[slug] || GENERIC_SERVICE_DETAIL
  const source = detail && typeof detail === 'object' && !Array.isArray(detail) ? detail : {}
  return {
    ...fallback,
    ...source,
    highlights: Array.isArray(source.highlights) ? source.highlights : [...fallback.highlights],
    features: Array.isArray(source.features) ? source.features : [...fallback.features],
  }
}
