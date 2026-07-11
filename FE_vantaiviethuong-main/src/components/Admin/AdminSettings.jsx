// src/components/Admin/AdminSettings.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { settingsApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import {
  ArrowLeft, Save, Home, Building2, Palette,
  Phone, BarChart2, Camera, Loader2
} from 'lucide-react'
import styles from './AdminSettings.module.scss'
import { useAdminToast } from './AdminToast'

const SECTIONS = [
  {
    key: 'hero',
    label: 'Trang chủ (Hero)',
    icon: Home,
    fields: [
      { key: 'hero_title',     label: 'Tiêu đề lớn', type: 'text' },
      { key: 'hero_subtitle',  label: 'Phụ đề',       type: 'text' },
      { key: 'hero_image_url', label: 'Ảnh nền Hero', type: 'image', imageKey: 'hero_image_url' },
    ],
  },
  {
    key: 'about',
    label: 'Giới thiệu',
    icon: Building2,
    fields: [
      { key: 'about_title',    label: 'Tiêu đề',         type: 'text' },
      { key: 'about_content',  label: 'Nội dung',         type: 'textarea' },
      { key: 'about_image_url',label: 'Ảnh giới thiệu',  type: 'image', imageKey: 'about_image_url' },
    ],
  },
  {
    key: 'logo',
    label: 'Logo & Thương hiệu',
    icon: Palette,
    fields: [
      { key: 'site_name',    label: 'Tên công ty', type: 'text' },
      { key: 'site_tagline', label: 'Slogan',      type: 'text' },
      { key: 'logo_url',     label: 'Logo',        type: 'image', imageKey: 'logo_url' },
    ],
  },
  {
    key: 'contact',
    label: 'Thông tin liên hệ',
    icon: Phone,
    fields: [
      { key: 'contact_phone',   label: 'Số điện thoại', type: 'text' },
      { key: 'contact_email',   label: 'Email',         type: 'text' },
      { key: 'contact_address', label: 'Địa chỉ',       type: 'text' },
      { key: 'facebook_url',    label: 'Facebook URL',  type: 'text' },
      { key: 'zalo_url',        label: 'Zalo URL',      type: 'text' },
    ],
  },
  {
    key: 'stats',
    label: 'Thống kê',
    icon: BarChart2,
    fields: [
      { key: 'stats_years',     label: 'Số năm kinh nghiệm',     type: 'text' },
      { key: 'stats_customers', label: 'Số khách hàng',          type: 'text' },
      { key: 'stats_trips',     label: 'Số chuyến đã thực hiện', type: 'text' },
    ],
  },
]

export default function AdminSettings() {
  const { showToast } = useAdminToast()
  const { logout } = useAuth()
  const navigate   = useNavigate()

  const [settings, setSettings]   = useState({})
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [uploading, setUploading] = useState({})
  const [activeTab, setActiveTab] = useState('hero')
  const [previews, setPreviews]   = useState({})
  const fileRefs = useRef({})

  useEffect(() => {
    settingsApi.getAll()
      .then(res => setSettings(res.data || {}))
      .catch(err => {
        showToast(err.message, 'error')
        if (err.message?.includes('Token')) { logout(); navigate('/admin/login') }
      })
      .finally(() => setLoading(false))
  }, [])


  const handleChange = (key, value) => setSettings(prev => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const section = SECTIONS.find(s => s.key === activeTab)
      const toSave  = {}
      section.fields
        .filter(f => f.type !== 'image')
        .forEach(f => { toSave[f.key] = settings[f.key] || '' })
      await settingsApi.update(toSave)
      showToast('Lưu cài đặt thành công!')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (imageKey, file) => {
    if (!file) return
    const localPreview = URL.createObjectURL(file)
    setPreviews(p => ({ ...p, [imageKey]: localPreview }))
    setUploading(u => ({ ...u, [imageKey]: true }))
    try {
      const res = await settingsApi.uploadImage(imageKey, file)
      setSettings(prev => ({ ...prev, [imageKey]: res.data.url }))
      showToast('Upload ảnh thành công!')
    } catch (err) {
      showToast(err.message, 'error')
      setPreviews(p => ({ ...p, [imageKey]: undefined }))
    } finally {
      setUploading(u => ({ ...u, [imageKey]: false }))
    }
  }

  const currentSection = SECTIONS.find(s => s.key === activeTab)

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Cài đặt Website</h1>
        </div>
        <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
          {saving
            ? <><Loader2 size={15} className={styles.spinner} /> Đang lưu...</>
            : <><Save size={15} /> Lưu thay đổi</>
          }
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingBox}>
          <Loader2 size={18} className={styles.spinner} /> Đang tải...
        </div>
      ) : (
        <div className={styles.layout}>
          {/* Tab sidebar */}
          <nav className={styles.tabs}>
            {SECTIONS.map(s => {
              const Icon = s.icon
              return (
                <button
                  key={s.key}
                  className={`${styles.tab} ${activeTab === s.key ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab(s.key)}
                >
                  <Icon size={15} strokeWidth={1.8} />
                  {s.label}
                </button>
              )
            })}
          </nav>

          {/* Fields */}
          <div className={styles.fields}>
            <h2 className={styles.sectionTitle}>{currentSection.label}</h2>

            {currentSection.fields.map(field => (
              <div key={field.key} className={styles.field}>
                <label className={styles.label}>{field.label}</label>

                {field.type === 'image' ? (
                  <div className={styles.imageField}>
                    <div
                      className={styles.imagePreview}
                      onClick={() => fileRefs.current[field.imageKey]?.click()}
                    >
                      {uploading[field.imageKey] ? (
                        <div className={styles.uploadingOverlay}>
                          <Loader2 size={22} className={styles.spinner} />
                          <span>Đang upload...</span>
                        </div>
                      ) : (previews[field.imageKey] || settings[field.key]) ? (
                        <img
                          src={previews[field.imageKey] || settings[field.key]}
                          alt={field.label}
                        />
                      ) : (
                        <div className={styles.imagePlaceholder}>
                          <Camera size={32} strokeWidth={1.4} />
                          <p>Click để chọn ảnh</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={el => fileRefs.current[field.imageKey] = el}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={e => handleImageUpload(field.imageKey, e.target.files[0])}
                    />
                    {(previews[field.imageKey] || settings[field.key]) && (
                      <div className={styles.imageUrl}>
                        <span>URL:</span>
                        <a
                          href={settings[field.key]}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.urlLink}
                        >
                          {settings[field.key]?.slice(0, 60)}...
                        </a>
                      </div>
                    )}
                    <button
                      className={styles.changeImgBtn}
                      onClick={() => fileRefs.current[field.imageKey]?.click()}
                      disabled={uploading[field.imageKey]}
                    >
                      <Camera size={14} /> Thay đổi ảnh
                    </button>
                  </div>

                ) : field.type === 'textarea' ? (
                  <textarea
                    className={styles.textarea}
                    rows={4}
                    value={settings[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                  />
                ) : (
                  <input
                    className={styles.input}
                    type="text"
                    value={settings[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                  />
                )}
              </div>
            ))}

            <div className={styles.saveRow}>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving
                  ? <><Loader2 size={15} className={styles.spinner} /> Đang lưu...</>
                  : <><Save size={15} /> Lưu thay đổi</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
