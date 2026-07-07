import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Save, Home, Info, Truck, Users, Phone, LayoutTemplate, Loader2,
} from 'lucide-react'
import { homePageApi } from '../../services/api'
import styles from './AdminSettings.module.scss'

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
      { key: 'video_url', label: 'Đường dẫn video', type: 'text' },
      { key: 'fallback_image_url', label: 'Ảnh fallback', type: 'text' },
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
  return merged
}

export default function AdminHome() {
  const navigate = useNavigate()
  const [home, setHome] = useState(() => normalizeHome())
  const [activeTab, setActiveTab] = useState('hero')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    homePageApi.get()
      .then(res => setHome(normalizeHome(res.data)))
      .catch(err => showToast(err.message || 'Không thể tải dữ liệu trang chủ.', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }

  const handleChange = (sectionKey, fieldKey, value) => {
    setHome(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [fieldKey]: value,
      },
    }))
  }

  const getSectionPayload = (sectionKey) => {
    const payload = { ...home[sectionKey] }
    if (sectionKey === 'footer') {
      payload.offices = textToOffices(payload.offices_text)
      delete payload.offices_text
    }
    return payload
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await homePageApi.update({ [activeTab]: getSectionPayload(activeTab) })
      setHome(normalizeHome(res.data))
      showToast('Đã lưu nội dung trang chủ!')
    } catch (err) {
      showToast(err.message || 'Lưu thất bại.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const currentSection = SECTIONS.find(section => section.key === activeTab)

  return (
    <div className={styles.page}>
      {toast && <div className={`${styles.toast} ${styles[toast.type]}`}>{toast.msg}</div>}

      <div className={styles.header}>
        <div>
          <button className={styles.backBtn} onClick={() => navigate('/admin')}>
            <ArrowLeft size={14} /> Quay lại
          </button>
          <h1 className={styles.title}>Quản lý trang chủ</h1>
        </div>
        <button className={styles.saveBtn} onClick={handleSave} disabled={saving || loading}>
          {saving
            ? <><Loader2 size={15} className={styles.spinner} /> Đang lưu...</>
            : <><Save size={15} /> Lưu section</>
          }
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingBox}>
          <Loader2 size={18} className={styles.spinner} /> Đang tải...
        </div>
      ) : (
        <div className={styles.layout}>
          <nav className={styles.tabs}>
            {SECTIONS.map(section => {
              const Icon = section.icon
              return (
                <button
                  key={section.key}
                  className={`${styles.tab} ${activeTab === section.key ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab(section.key)}
                >
                  <Icon size={15} strokeWidth={1.8} />
                  {section.label}
                </button>
              )
            })}
          </nav>

          <div className={styles.fields}>
            <h2 className={styles.sectionTitle}>{currentSection.label}</h2>

            {currentSection.fields.map(field => {
              const value = home[activeTab]?.[field.key]

              return (
                <div key={field.key} className={styles.field}>
                  <label className={styles.label}>{field.label}</label>

                  {field.type === 'textarea' ? (
                    <textarea
                      className={styles.textarea}
                      rows={field.key === 'offices_text' ? 8 : 4}
                      value={value || ''}
                      onChange={e => handleChange(activeTab, field.key, e.target.value)}
                    />
                  ) : field.type === 'checkbox' ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4B5563', fontSize: 14 }}>
                      <input
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={e => handleChange(activeTab, field.key, e.target.checked)}
                      />
                      Bật
                    </label>
                  ) : (
                    <input
                      className={styles.input}
                      type="text"
                      value={value || ''}
                      onChange={e => handleChange(activeTab, field.key, e.target.value)}
                    />
                  )}

                  {field.helper && (
                    <small style={{ color: '#6B7280', fontSize: 12 }}>{field.helper}</small>
                  )}
                </div>
              )
            })}

            <div className={styles.saveRow}>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving
                  ? <><Loader2 size={15} className={styles.spinner} /> Đang lưu...</>
                  : <><Save size={15} /> Lưu section</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
