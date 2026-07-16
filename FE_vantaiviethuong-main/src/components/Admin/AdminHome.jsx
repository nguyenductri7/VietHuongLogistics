import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Save, Home, Info, Truck, Users, Phone, LayoutTemplate, Loader2,
  Camera, Plus, Trash2, Eye, EyeOff, Star, Upload,
} from 'lucide-react'
import { homePageApi, partnerApi, resolveApiMediaUrl } from '../../services/api'
import styles from './AdminSettings.module.scss'
import { useAdminToast } from './AdminToast'
import AdminConfirmDialog from './AdminConfirmDialog'

const DEFAULT_HOME = {
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
        avatar_url: '',
        quote: 'Tôi rất hài lòng với dịch vụ logistics của Việt Hương. Các nhân viên hỗ trợ tận tình, chuyên nghiệp. Thời gian giao nhận hàng luôn được đảm bảo chính xác.',
      },
      {
        initials: 'BN',
        name: 'Bảo Nguyên',
        company: 'BITI VN',
        avatar_url: '',
        quote: 'Dịch vụ chuyên nghiệp và đáng tin cậy. Hệ thống vận chuyển tiên tiến mang lại sự hài lòng tuyệt đối. Đảm bảo an toàn hàng hóa là điều tôi thích nhất.',
      },
      {
        initials: 'JT',
        name: 'Jessie Truong',
        company: 'Unilever VN',
        avatar_url: '',
        quote: 'Rất chuyên nghiệp trong xử lý hàng hóa. Vận chuyển an toàn, đúng hạn — tôi hoàn toàn tin tưởng và sẽ tiếp tục hợp tác lâu dài.',
      },
      {
        initials: 'PH',
        name: 'Phạm Quốc Hùng',
        company: 'CFO — Masan Group',
        avatar_url: '',
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
    offices: [],
  },
}

const SECTIONS = [
  {
    key: 'hero',
    label: 'Hero đầu trang',
    icon: Home,
    fields: [
      { key: 'title', label: 'Tên chính', type: 'text' },
      { key: 'subtitle', label: 'Dòng phụ', type: 'text' },
      { key: 'description', label: 'Mô tả', type: 'textarea' },
      { key: 'primary_cta_label', label: 'Nút chính', type: 'text' },
      { key: 'primary_cta_link', label: 'Link nút chính', type: 'text' },
      { key: 'secondary_cta_label', label: 'Nút phụ', type: 'text' },
      { key: 'secondary_cta_link', label: 'Link nút phụ', type: 'text' },
      { key: 'video_url', label: 'Video hero', type: 'video_upload' },
      { key: 'fallback_image_url', label: 'Ảnh fallback', type: 'image_upload' },
      { key: 'show_video', label: 'Hiển thị video', type: 'checkbox' },
    ],
  },
  {
    key: 'about_intro',
    label: 'Giới thiệu / xe 3D',
    icon: Info,
    fields: [
      { key: 'enabled', label: 'Hiển thị section', type: 'checkbox' },
      { key: 'section_label', label: 'Nhãn section', type: 'text' },
      { key: 'title', label: 'Tiêu đề chính', type: 'text' },
      { key: 'title_accent', label: 'Chữ nhấn mạnh', type: 'text' },
      { key: 'description', label: 'Nội dung mô tả', type: 'textarea' },
      { key: 'pills', label: 'Các thẻ dịch vụ', type: 'textarea', helper: 'Mỗi dòng là một thẻ.' },
      { key: 'cta_label', label: 'Nút CTA', type: 'text' },
      { key: 'cta_link', label: 'Link CTA', type: 'text' },
      { key: 'show_3d_truck', label: 'Hiển thị xe 3D', type: 'checkbox' },
    ],
  },
  {
    key: 'services_section',
    label: 'Dịch vụ trang chủ',
    icon: Truck,
    fields: [
      { key: 'enabled', label: 'Hiển thị section', type: 'checkbox' },
      { key: 'title', label: 'Tiêu đề', type: 'text' },
      { key: 'accent', label: 'Chữ nhấn mạnh', type: 'text' },
      { key: 'cta_label', label: 'Nút CTA', type: 'text' },
      { key: 'cta_link', label: 'Link CTA', type: 'text' },
      { key: 'use_service_admin_items', label: 'Lấy danh sách từ admin Dịch vụ', type: 'checkbox' },
    ],
  },
  {
    key: 'partners_section',
    label: 'Đối tác',
    icon: Users,
    fields: [
      { key: 'enabled', label: 'Hiển thị section', type: 'checkbox' },
      { key: 'title', label: 'Tiêu đề', type: 'text' },
    ],
  },
  {
    key: 'testimonials_section',
    dataKey: 'partners_section',
    label: 'Đánh giá khách hàng',
    icon: Star,
    fields: [
      { key: 'reviews_title', label: 'Tiêu đề đánh giá', type: 'text' },
      { key: 'reviews_subtitle', label: 'Mô tả đánh giá', type: 'textarea' },
    ],
  },
  {
    key: 'contact_section',
    label: 'Liên hệ',
    icon: Phone,
    fields: [
      { key: 'enabled', label: 'Hiển thị form liên hệ', type: 'checkbox' },
      { key: 'title', label: 'Tiêu đề', type: 'text' },
      { key: 'subtitle', label: 'Mô tả', type: 'textarea' },
    ],
  },
  {
    key: 'footer',
    label: 'Footer',
    icon: LayoutTemplate,
    fields: [
      { key: 'company_name', label: 'Tên công ty', type: 'text' },
      { key: 'tax_code', label: 'Mã số thuế', type: 'text' },
      { key: 'address', label: 'Trụ sở chính', type: 'textarea' },
      { key: 'hotline', label: 'Hotline', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'facebook_url', label: 'Facebook', type: 'text' },
      { key: 'youtube_url', label: 'YouTube', type: 'text' },
      { key: 'instagram_url', label: 'Instagram', type: 'text' },
      { key: 'zalo_url', label: 'Zalo', type: 'text' },
      { key: 'offices_text', label: 'Văn phòng đại diện', type: 'textarea', helper: 'Mỗi dòng: TỈNH/TP | Địa chỉ' },
    ],
  },
]

function officesToText(offices = []) {
  return Array.isArray(offices)
    ? offices.map(item => `${item.city || ''} | ${item.addr || ''}`).join('\n')
    : ''
}

function textToOffices(text = '') {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [city, ...rest] = line.split('|')
      return { city: city?.trim() || '', addr: rest.join('|').trim() || '' }
    })
    .filter(item => item.city || item.addr)
}

function normalizeHome(data = {}) {
  const merged = {
    hero: { ...DEFAULT_HOME.hero, ...(data.hero || {}) },
    about_intro: { ...DEFAULT_HOME.about_intro, ...(data.about_intro || {}) },
    services_section: { ...DEFAULT_HOME.services_section, ...(data.services_section || {}) },
    partners_section: { ...DEFAULT_HOME.partners_section, ...(data.partners_section || {}) },
    contact_section: { ...DEFAULT_HOME.contact_section, ...(data.contact_section || {}) },
    footer: { ...DEFAULT_HOME.footer, ...(data.footer || {}) },
  }

  merged.footer.offices_text = officesToText(merged.footer.offices)
  merged.partners_section.reviews = normalizeReviews(merged.partners_section.reviews)
  return merged
}

function normalizeReviews(reviews = []) {
  const source = Array.isArray(reviews) ? reviews : DEFAULT_HOME.partners_section.reviews
  return source.map((review, index) => {
    const fallback = DEFAULT_HOME.partners_section.reviews[index % DEFAULT_HOME.partners_section.reviews.length]
    return {
    ...fallback,
    ...(review || {}),
    avatar_url: review?.avatar_url || review?.avatar || review?.image_url || fallback.avatar_url || '',
    id: review?.id || `${Date.now()}-${index}`,
  }
  })
}

export default function AdminHome() {
  const { showToast } = useAdminToast()
  const navigate = useNavigate()
  const [home, setHome] = useState(() => normalizeHome())
  const [activeTab, setActiveTab] = useState('hero')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [partners, setPartners] = useState([])
  const [partnerLoading, setPartnerLoading] = useState(false)
  const [partnerSaving, setPartnerSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState(null)
  const [deleteReviewTarget, setDeleteReviewTarget] = useState(null)
  const [deletePartnerTarget, setDeletePartnerTarget] = useState(null)
  const [deletingPartnerId, setDeletingPartnerId] = useState(null)
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    website_url: '',
    sort_order: '',
    logo: null,
  })

  useEffect(() => {
    homePageApi.get()
      .then(res => setHome(normalizeHome(res.data)))
      .catch(err => showToast(err.message || 'Không thể tải dữ liệu trang chủ.', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const loadPartners = async () => {
    setPartnerLoading(true)
    try {
      const res = await partnerApi.adminList()
      setPartners(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      showToast(err.message || 'Không thể tải danh sách đối tác.', 'error')
    } finally {
      setPartnerLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'partners_section') loadPartners()
  }, [activeTab])


  const handleChange = (sectionKey, fieldKey, value) => {
    setHome(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [fieldKey]: value,
      },
    }))
  }

  const handleReviewChange = (index, fieldKey, value) => {
    setHome(prev => {
      const reviews = normalizeReviews(prev.partners_section?.reviews).map((review, reviewIndex) => (
        reviewIndex === index ? { ...review, [fieldKey]: value } : review
      ))

      return {
        ...prev,
        partners_section: {
          ...prev.partners_section,
          reviews,
        },
      }
    })
  }

  const handleAddReview = () => {
    setHome(prev => {
      const reviews = normalizeReviews(prev.partners_section?.reviews)
      const nextIndex = reviews.length
      const fallback = DEFAULT_HOME.partners_section.reviews[nextIndex % DEFAULT_HOME.partners_section.reviews.length]

      return {
        ...prev,
        partners_section: {
          ...prev.partners_section,
          reviews: [
            ...reviews,
            {
              ...fallback,
              id: `${Date.now()}-${nextIndex}`,
              initials: '',
              name: '',
              company: '',
              avatar_url: '',
              quote: '',
            },
          ],
        },
      }
    })
  }

  const handleDeleteReview = (index) => {
    const review = normalizeReviews(home.partners_section?.reviews)[index]
    setDeleteReviewTarget({ index, name: review?.name || `Đánh giá #${index + 1}` })
  }

  const confirmDeleteReview = () => {
    if (!deleteReviewTarget) return
    setHome(prev => ({
      ...prev,
      partners_section: {
        ...prev.partners_section,
        reviews: normalizeReviews(prev.partners_section?.reviews).filter((_, reviewIndex) => reviewIndex !== deleteReviewTarget.index),
      },
    }))
    setDeleteReviewTarget(null)
    showToast('Đã xóa đánh giá. Bấm lưu section để cập nhật lên website.', 'success')
  }

  const getSectionPayload = (sectionKey) => {
    const section = SECTIONS.find(item => item.key === sectionKey)
    const dataKey = section?.dataKey || sectionKey
    const payload = { ...home[dataKey] }
    if (dataKey === 'footer') {
      payload.offices = textToOffices(payload.offices_text)
      delete payload.offices_text
    }
    return payload
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const section = SECTIONS.find(item => item.key === activeTab)
      const dataKey = section?.dataKey || activeTab
      const res = await homePageApi.update({ [dataKey]: getSectionPayload(activeTab) })
      setHome(normalizeHome(res.data))
      showToast('Đã lưu nội dung trang chủ!')
    } catch (err) {
      showToast(err.message || 'Lưu thất bại.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleHeroMediaUpload = async (fieldKey, file) => {
    if (!file) return
    setUploadingField(fieldKey)
    try {
      const res = await homePageApi.uploadImage(file)
      handleChange('hero', fieldKey, res.url)
      showToast('Upload thành công! Bấm “Xuất bản section” để cập nhật website.')
    } catch (err) {
      showToast(err.message || 'Upload thất bại.', 'error')
    } finally {
      setUploadingField(null)
    }
  }

  const handleReviewAvatarUpload = async (index, file) => {
    if (!file) return
    const fieldKey = `review-avatar-${index}`
    setUploadingField(fieldKey)
    try {
      const res = await homePageApi.uploadImage(file)
      handleReviewChange(index, 'avatar_url', res.url)
      showToast('Upload ảnh khách hàng thành công! Bấm “Xuất bản section” để cập nhật website.')
    } catch (err) {
      showToast(err.message || 'Upload ảnh khách hàng thất bại.', 'error')
    } finally {
      setUploadingField(null)
    }
  }

  const handleCreatePartner = async (event) => {
    event.preventDefault()
    if (!partnerForm.name.trim()) {
      showToast('Vui lòng nhập tên công ty đối tác.', 'error')
      return
    }

    setPartnerSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', partnerForm.name.trim())
      fd.append('website_url', partnerForm.website_url.trim())
      fd.append('sort_order', partnerForm.sort_order || '0')
      if (partnerForm.logo) fd.append('logo', partnerForm.logo)

      await partnerApi.create(fd)
      setPartnerForm({ name: '', website_url: '', sort_order: '', logo: null })
      showToast('Đã thêm logo đối tác!')
      await loadPartners()
    } catch (err) {
      showToast(err.message || 'Thêm đối tác thất bại.', 'error')
    } finally {
      setPartnerSaving(false)
    }
  }

  const handleTogglePartner = async (partner) => {
    const fd = new FormData()
    fd.append('name', partner.name || '')
    fd.append('website_url', partner.website_url || '')
    fd.append('sort_order', partner.sort_order ?? 0)
    fd.append('is_active', partner.is_active ? '0' : '1')

    try {
      await partnerApi.update(partner.id, fd)
      await loadPartners()
    } catch (err) {
      showToast(err.message || 'Cập nhật đối tác thất bại.', 'error')
    }
  }

  const handleDeletePartner = async () => {
    if (!deletePartnerTarget) return
    setDeletingPartnerId(deletePartnerTarget.id)
    try {
      await partnerApi.delete(deletePartnerTarget.id)
      showToast('Đã xóa đối tác.')
      setDeletePartnerTarget(null)
      await loadPartners()
    } catch (err) {
      showToast(err.message || 'Xóa đối tác thất bại.', 'error')
    } finally {
      setDeletingPartnerId(null)
    }
  }

  const currentSection = SECTIONS.find(section => section.key === activeTab)
  const activeDataKey = currentSection?.dataKey || activeTab
  const isSectionEnabled = (section) => {
    const dataKey = section.dataKey || section.key
    return section.key === 'hero' || section.key === 'testimonials_section' || section.key === 'footer'
      ? true
      : home[dataKey]?.enabled !== false
  }

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Quản lý trang chủ</h1>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingBox}>
          <Loader2 size={18} className={styles.spinner} /> Đang tải...
        </div>
      ) : (
        <>
        <div className={styles.layout}>
          <nav className={styles.tabs}>
            {SECTIONS.map(section => {
              const Icon = section.icon
              const enabled = isSectionEnabled(section)
              return (
                <button
                  key={section.key}
                  className={`${styles.tab} ${activeTab === section.key ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab(section.key)}
                >
                  <span className={styles.sectionIcon}><Icon size={17} strokeWidth={1.8} /></span>
                  <span className={styles.sectionText}>
                    <strong>{section.label}</strong>
                  </span>
                  <span className={`${styles.stateDot} ${enabled ? styles.stateOn : styles.stateOff}`} />
                </button>
              )
            })}
          </nav>

          <div className={styles.fields}>
            <div className={styles.editorHeader}>
              <div>
                <h2 className={styles.sectionTitle}>{currentSection.label}</h2>
              </div>
            </div>

            {currentSection.fields.map(field => {
              const value = home[activeDataKey]?.[field.key]

              return (
                <div key={field.key} className={styles.field}>
                  <label className={styles.label}>{field.label}</label>

                  {field.type === 'textarea' ? (
                    <textarea
                      className={styles.textarea}
                      rows={field.key === 'offices_text' ? 8 : 4}
                      value={value || ''}
                      onChange={e => handleChange(activeDataKey, field.key, e.target.value)}
                    />
                  ) : field.type === 'image_upload' || field.type === 'video_upload' ? (
                    <div style={{ display: 'grid', gap: 10 }}>
                      {value && (
                        <div
                          style={{
                            border: '1px solid #E5E7EB',
                            borderRadius: 12,
                            overflow: 'hidden',
                            background: '#F9FAFB',
                            maxWidth: 420,
                          }}
                        >
                          {field.type === 'video_upload' ? (
                            <video
                              src={resolveApiMediaUrl(value)}
                              controls
                              muted
                              style={{ display: 'block', width: '100%', maxHeight: 220, objectFit: 'cover' }}
                            />
                          ) : (
                            <img
                              src={resolveApiMediaUrl(value)}
                              alt={field.label}
                              style={{ display: 'block', width: '100%', maxHeight: 220, objectFit: 'cover' }}
                            />
                          )}
                        </div>
                      )}

                      <label className={styles.changeImgBtn} style={{ width: 'fit-content' }}>
                        {uploadingField === field.key
                          ? <><Loader2 size={14} className={styles.spinner} /> Đang upload...</>
                          : <><Upload size={14} /> Chọn {field.type === 'video_upload' ? 'video' : 'ảnh'}</>
                        }
                        <input
                          hidden
                          type="file"
                          accept={field.type === 'video_upload' ? 'video/mp4,video/webm,video/quicktime' : 'image/*'}
                          disabled={uploadingField === field.key}
                          onChange={e => handleHeroMediaUpload(field.key, e.target.files?.[0])}
                        />
                      </label>

                      <input
                        className={styles.input}
                        type="text"
                        value={value || ''}
                        placeholder="URL sau khi upload hoặc dán link thủ công"
                        onChange={e => handleChange(activeDataKey, field.key, e.target.value)}
                      />
                    </div>
                  ) : field.type === 'checkbox' ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4B5563', fontSize: 14 }}>
                      <input
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={e => handleChange(activeDataKey, field.key, e.target.checked)}
                      />
                      Bật
                    </label>
                  ) : (
                    <input
                      className={styles.input}
                      type="text"
                      value={value || ''}
                      onChange={e => handleChange(activeDataKey, field.key, e.target.value)}
                    />
                  )}

                  {field.helper && (
                    <small style={{ color: '#6B7280', fontSize: 12 }}>{field.helper}</small>
                  )}
                </div>
              )
            })}

            {activeTab === 'partners_section' && (
              <div className={styles.sectionAddon}>
                <h3 style={{ margin: '0 0 14px', fontSize: 15, color: '#111827' }}>
                  Logo công ty đối tác
                </h3>

                <form onSubmit={handleCreatePartner} className={styles.partnerForm}>
                  <div className={styles.field} style={{ marginBottom: 0 }}>
                    <label className={styles.label}>Tên công ty</label>
                    <input
                      className={styles.input}
                      value={partnerForm.name}
                      onChange={e => setPartnerForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="VD: Maersk"
                    />
                  </div>

                  <div className={styles.field} style={{ marginBottom: 0 }}>
                    <label className={styles.label}>Website</label>
                    <input
                      className={styles.input}
                      value={partnerForm.website_url}
                      onChange={e => setPartnerForm(prev => ({ ...prev, website_url: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>

                  <div className={styles.field} style={{ marginBottom: 0 }}>
                    <label className={styles.label}>Thứ tự</label>
                    <input
                      className={styles.input}
                      type="number"
                      value={partnerForm.sort_order}
                      onChange={e => setPartnerForm(prev => ({ ...prev, sort_order: e.target.value }))}
                      placeholder="0"
                    />
                  </div>

                  <div className={styles.field} style={{ marginBottom: 0 }}>
                    <label className={styles.label}>Logo</label>
                    <input
                      className={styles.input}
                      type="file"
                      accept="image/*"
                      onChange={e => setPartnerForm(prev => ({ ...prev, logo: e.target.files?.[0] || null }))}
                    />
                  </div>

                  <button className={styles.saveBtn} type="submit" disabled={partnerSaving}>
                    {partnerSaving
                      ? <><Loader2 size={14} className={styles.spinner} /> Đang thêm</>
                      : <><Plus size={14} /> Thêm</>
                    }
                  </button>
                </form>

                {partnerLoading ? (
                  <div className={styles.loadingBox} style={{ padding: '18px 0' }}>
                    <Loader2 size={16} className={styles.spinner} /> Đang tải đối tác...
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                    {partners.map(partner => (
                      <div
                        key={partner.id}
                        style={{
                          border: '1px solid #E5E7EB',
                          borderRadius: 12,
                          background: '#F9FAFB',
                          padding: 12,
                        }}
                      >
                        <div
                          style={{
                            height: 88,
                            borderRadius: 10,
                            background: '#fff',
                            border: '1px solid #E5E7EB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 10,
                            overflow: 'hidden',
                          }}
                        >
                          {partner.logo_url ? (
                            <img src={resolveApiMediaUrl(partner.logo_url)} alt={partner.name} style={{ maxWidth: '82%', maxHeight: '70%', objectFit: 'contain' }} />
                          ) : (
                            <Camera size={26} color="#9CA3AF" />
                          )}
                        </div>

                        <div style={{ fontWeight: 700, color: '#111827', fontSize: 14 }}>{partner.name}</div>
                        <div style={{ color: '#6B7280', fontSize: 12, marginTop: 3 }}>
                          Thứ tự: {partner.sort_order ?? 0} · {partner.is_active ? 'Đang hiện' : 'Đang ẩn'}
                        </div>

                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                          <button
                            type="button"
                            className={styles.changeImgBtn}
                            onClick={() => handleTogglePartner(partner)}
                          >
                            {partner.is_active ? <EyeOff size={13} /> : <Eye size={13} />}
                            {partner.is_active ? 'Ẩn' : 'Hiện'}
                          </button>
                          <button
                            type="button"
                            className={styles.changeImgBtn}
                            onClick={() => setDeletePartnerTarget(partner)}
                          >
                            <Trash2 size={13} /> Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'testimonials_section' && (
              <div className={styles.sectionAddon}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 15, color: '#111827' }}>
                    Đánh giá khách hàng trên trang chủ
                  </h3>
                  <button type="button" className={styles.saveBtn} onClick={handleAddReview}>
                    <Plus size={14} /> Thêm đánh giá
                  </button>
                </div>
                <p style={{ margin: '0 0 16px', color: '#6B7280', fontSize: 13 }}>
                  Các nội dung này sẽ hiển thị trong cụm thẻ đánh giá bên dưới logo đối tác.
                </p>

                {normalizeReviews(home.partners_section?.reviews).length === 0 && (
                  <div style={{ border: '1px dashed #D1D5DB', borderRadius: 12, padding: 18, color: '#6B7280', fontSize: 14, marginBottom: 14 }}>
                    Chưa có đánh giá nào. Bấm “Thêm đánh giá” để tạo đánh giá đầu tiên.
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                  {normalizeReviews(home.partners_section?.reviews).map((review, index) => (
                    <div
                      key={index}
                      style={{
                        border: '1px solid #E5E7EB',
                        borderRadius: 12,
                        background: '#fff',
                        padding: 14,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
                        <div style={{ fontWeight: 700, color: '#111827', fontSize: 14 }}>
                          Đánh giá #{index + 1}
                        </div>
                        <button
                          type="button"
                          className={styles.changeImgBtn}
                          onClick={() => handleDeleteReview(index)}
                        >
                          <Trash2 size={13} /> Xóa
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 10 }}>
                        <div className={styles.field} style={{ marginBottom: 0 }}>
                          <label className={styles.label}>Chữ tắt</label>
                          <input
                            className={styles.input}
                            value={review.initials || ''}
                            maxLength={3}
                            onChange={e => handleReviewChange(index, 'initials', e.target.value.toUpperCase())}
                            placeholder="TQ"
                          />
                        </div>

                        <div className={styles.field} style={{ marginBottom: 0 }}>
                          <label className={styles.label}>Tên khách hàng</label>
                          <input
                            className={styles.input}
                            value={review.name || ''}
                            onChange={e => handleReviewChange(index, 'name', e.target.value)}
                            placeholder="Tên khách hàng"
                          />
                        </div>
                      </div>

                      <div className={styles.field} style={{ marginTop: 10 }}>
                        <label className={styles.label}>Công ty / chức vụ</label>
                        <input
                          className={styles.input}
                          value={review.company || ''}
                          onChange={e => handleReviewChange(index, 'company', e.target.value)}
                          placeholder="VD: CEO — ABC Logistics"
                        />
                      </div>

                      <div className={styles.field} style={{ marginTop: 10 }}>
                        <label className={styles.label}>Ảnh khách hàng</label>
                        <div className={styles.reviewAvatarUploader}>
                          <div className={styles.reviewAvatarPreview}>
                            {review.avatar_url ? (
                              <img src={resolveApiMediaUrl(review.avatar_url)} alt={review.name || `Khách hàng ${index + 1}`} />
                            ) : (
                              <span>{review.initials || 'KH'}</span>
                            )}
                          </div>

                          <div className={styles.reviewAvatarActions}>
                            <label className={styles.changeImgBtn}>
                              {uploadingField === `review-avatar-${index}`
                                ? <><Loader2 size={14} className={styles.spinner} /> Đang upload...</>
                                : <><Upload size={14} /> Chọn ảnh</>
                              }
                              <input
                                type="file"
                                accept="image/*"
                                disabled={uploadingField === `review-avatar-${index}`}
                                onChange={e => handleReviewAvatarUpload(index, e.target.files?.[0])}
                                style={{ display: 'none' }}
                              />
                            </label>

                            {review.avatar_url && (
                              <button
                                type="button"
                                className={styles.changeImgBtn}
                                onClick={() => handleReviewChange(index, 'avatar_url', '')}
                              >
                                <Trash2 size={13} /> Xóa ảnh
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className={styles.field} style={{ marginBottom: 0 }}>
                        <label className={styles.label}>Nội dung đánh giá</label>
                        <textarea
                          className={styles.textarea}
                          rows={4}
                          value={review.quote || ''}
                          onChange={e => handleReviewChange(index, 'quote', e.target.value)}
                          placeholder="Nhập nội dung đánh giá..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.saveRow}>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving
                  ? <><Loader2 size={15} className={styles.spinner} /> Đang xuất bản...</>
                  : <><Save size={15} /> Xuất bản section</>
                }
              </button>
            </div>
          </div>
        </div>
        </>
      )}

      <AdminConfirmDialog
        open={!!deletePartnerTarget}
        title="Xóa đối tác?"
        message="Logo đối tác này sẽ bị xóa khỏi trang chủ."
        target={deletePartnerTarget?.name}
        busy={!!deletePartnerTarget && deletingPartnerId === deletePartnerTarget.id}
        onCancel={() => setDeletePartnerTarget(null)}
        onConfirm={handleDeletePartner}
      />

      <AdminConfirmDialog
        open={!!deleteReviewTarget}
        title="Xóa đánh giá?"
        message="Đánh giá này sẽ bị xóa khỏi trang chủ. Bạn cần bấm lưu section để ghi lại thay đổi."
        target={deleteReviewTarget?.name}
        onCancel={() => setDeleteReviewTarget(null)}
        onConfirm={confirmDeleteReview}
      />
    </div>
  )
}
