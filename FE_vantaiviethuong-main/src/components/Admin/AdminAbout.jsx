// src/components/Admin/AdminAbout.jsx
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft } from 'lucide-react'
import { normalizeAbout } from '../About/Aboutdetailpage'
import styles from './AdminAbout.module.scss'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const ICON_OPTIONS = ['Truck', 'Plane', 'ShoppingBag', 'Warehouse', 'LineChart', 'Eye', 'Target', 'Shield']

export default function AdminAbout() {
  const navigate = useNavigate()

  const [data, setData] = useState(() => normalizeAbout())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState({})
  const [message, setMessage] = useState(null)
  const [uploadingKey, setUploadingKey] = useState(null)

  const token = localStorage.getItem('vh_token')
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    axios.get(`${API_BASE}/about`)
      .then(res => setData(normalizeAbout(res.data?.data)))
      .catch((err) => {
        setData(normalizeAbout())
        setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể tải nội dung trang Giới thiệu.' })
      })
      .finally(() => setLoading(false))
  }, [])

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3500)
  }

  const updateField = useCallback((path, value) => {
    setData(prev => {
      const next = structuredClone(prev)
      const keys = path.split('.')
      let target = next
      for (let i = 0; i < keys.length - 1; i++) {
        target = target[keys[i]]
      }
      target[keys[keys.length - 1]] = value
      return next
    })
  }, [])

  const saveSection = async (sectionKey) => {
    setSaving(prev => ({ ...prev, [sectionKey]: true }))
    try {
      await axios.put(`${API_BASE}/about`, { [sectionKey]: data[sectionKey] }, authHeaders)
      showMessage('success', 'Đã lưu thay đổi!')
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Lưu thất bại.')
    } finally {
      setSaving(prev => ({ ...prev, [sectionKey]: false }))
    }
  }

  const handleImageUpload = async (path, file) => {
    if (!file) return
    setUploadingKey(path)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await axios.post(`${API_BASE}/about/upload-image`, formData, {
        headers: { ...authHeaders.headers, 'Content-Type': 'multipart/form-data' },
      })
      updateField(path, res.data.url)
      showMessage('success', 'Upload ảnh thành công!')
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Upload ảnh thất bại.')
    } finally {
      setUploadingKey(null)
    }
  }

  if (loading) return <div className={styles.loading}>Đang tải nội dung...</div>
  if (!data)   return <div className={styles.loading}>Không có dữ liệu.</div>

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <button className={styles.backBtn} onClick={() => navigate('/admin')}>
            <ArrowLeft size={14} /> Quay lại
          </button>
          <h1 className={styles.pageTitle}>Quản Lý Trang Giới Thiệu</h1>
        </div>
      </div>

      {message && (
        <div className={`${styles.toast} ${styles[message.type]}`}>{message.text}</div>
      )}

      {/* ══════════ HERO ══════════ */}
      <Section title="Banner Hero" onSave={() => saveSection('hero')} saving={saving.hero}>
        <TextField label="Dòng nhỏ phía trên (eyebrow)" value={data.hero.eyebrow}
          onChange={v => updateField('hero.eyebrow', v)} />
        <TextField label="Tiêu đề dòng 1" value={data.hero.title_line1}
          onChange={v => updateField('hero.title_line1', v)} />
        <TextField label="Tiêu đề nhấn màu (dòng 2)" value={data.hero.title_accent}
          onChange={v => updateField('hero.title_accent', v)} />
        <TextField label="Tiêu đề dòng 3" value={data.hero.title_line3}
          onChange={v => updateField('hero.title_line3', v)} />
        <TextAreaField label="Mô tả phụ" value={data.hero.subtitle}
          onChange={v => updateField('hero.subtitle', v)} />
        <ImageField label="Ảnh nền banner" value={data.hero.bg_image}
          uploading={uploadingKey === 'hero.bg_image'}
          onUpload={file => handleImageUpload('hero.bg_image', file)} />
      </Section>

      {/* ══════════ STATS ══════════ */}
      <Section title="Số Liệu Thống Kê" onSave={() => saveSection('stats')} saving={saving.stats}>
        {data.stats.map((stat, i) => (
          <div key={i} className={styles.itemBlock}>
            <p className={styles.itemLabel}>Số liệu #{i + 1}</p>
            <div className={styles.row}>
              <TextField label="Số" value={String(stat.raw)}
                onChange={v => updateField(`stats.${i}.raw`, Number(v) || 0)} />
              <TextField label="Hậu tố (+, %, ...)" value={stat.suffix}
                onChange={v => updateField(`stats.${i}.suffix`, v)} />
            </div>
            <TextField label="Mô tả" value={stat.label}
              onChange={v => updateField(`stats.${i}.label`, v)} />
          </div>
        ))}
      </Section>

      {/* ══════════ IDENTITY ══════════ */}
      <Section title="Giới Thiệu Công Ty" onSave={() => saveSection('identity')} saving={saving.identity}>
        <TextField label="Dòng nhỏ phía trên" value={data.identity.eyebrow}
          onChange={v => updateField('identity.eyebrow', v)} />
        <div className={styles.row}>
          <TextField label="Tiêu đề chính" value={data.identity.title_main}
            onChange={v => updateField('identity.title_main', v)} />
          <TextField label="Tiêu đề nhấn màu" value={data.identity.title_accent}
            onChange={v => updateField('identity.title_accent', v)} />
        </div>
        <TextAreaField label="Đoạn giới thiệu 1" value={data.identity.body_1}
          onChange={v => updateField('identity.body_1', v)} />
        <TextAreaField label="Đoạn giới thiệu 2" value={data.identity.body_2}
          onChange={v => updateField('identity.body_2', v)} />
        <ImageField label="Ảnh minh họa" value={data.identity.image}
          uploading={uploadingKey === 'identity.image'}
          onUpload={file => handleImageUpload('identity.image', file)} />
        <p className={styles.itemLabel}>Chứng nhận / Badge (cách nhau bởi dấu phẩy)</p>
        <TextField label="Danh sách chứng nhận" value={data.identity.certs.join(', ')}
          onChange={v => updateField('identity.certs', v.split(',').map(s => s.trim()).filter(Boolean))} />
      </Section>

      {/* ══════════ SERVICES ══════════ */}
      <Section title="Dịch Vụ" onSave={() => saveSection('services')} saving={saving.services}>
        {data.services.map((svc, i) => (
          <div key={i} className={styles.itemBlock}>
            <p className={styles.itemLabel}>Dịch vụ #{i + 1}</p>
            <div className={styles.row}>
              <SelectField label="Icon" value={svc.icon_key} options={ICON_OPTIONS}
                onChange={v => updateField(`services.${i}.icon_key`, v)} />
              <TextField label="Tên dịch vụ" value={svc.title}
                onChange={v => updateField(`services.${i}.title`, v)} />
            </div>
            <TextAreaField label="Mô tả" value={svc.desc}
              onChange={v => updateField(`services.${i}.desc`, v)} />
            <ImageField label="Ảnh minh họa" value={svc.img}
              uploading={uploadingKey === `services.${i}.img`}
              onUpload={file => handleImageUpload(`services.${i}.img`, file)} />
          </div>
        ))}
      </Section>

      {/* ══════════ TIMELINE ══════════ */}
      <Section title="Lịch Sử Hình Thành" onSave={() => saveSection('timeline')} saving={saving.timeline}>
        {data.timeline.map((m, i) => (
          <div key={i} className={styles.itemBlock}>
            <p className={styles.itemLabel}>Mốc thời gian #{i + 1}</p>
            <div className={styles.row}>
              <TextField label="Năm" value={m.year}
                onChange={v => updateField(`timeline.${i}.year`, v)} />
              <TextField label="Tiêu đề" value={m.title}
                onChange={v => updateField(`timeline.${i}.title`, v)} />
            </div>
            <TextAreaField label="Mô tả" value={m.desc}
              onChange={v => updateField(`timeline.${i}.desc`, v)} />
            <ImageField label="Ảnh minh họa" value={m.img}
              uploading={uploadingKey === `timeline.${i}.img`}
              onUpload={file => handleImageUpload(`timeline.${i}.img`, file)} />
          </div>
        ))}
      </Section>

      {/* ══════════ VALUES ══════════ */}
      <Section title="Giá Trị Cốt Lõi" onSave={() => saveSection('values_section')} saving={saving.values_section}>
        {data.values_section.map((v, i) => (
          <div key={i} className={styles.itemBlock}>
            <p className={styles.itemLabel}>Giá trị #{i + 1}</p>
            <div className={styles.row}>
              <SelectField label="Icon" value={v.icon_key} options={ICON_OPTIONS}
                onChange={val => updateField(`values_section.${i}.icon_key`, val)} />
              <TextField label="Tiêu đề" value={v.title}
                onChange={val => updateField(`values_section.${i}.title`, val)} />
            </div>
            <TextAreaField label="Nội dung" value={v.text}
              onChange={val => updateField(`values_section.${i}.text`, val)} />
          </div>
        ))}
      </Section>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────
function Section({ title, children, onSave, saving }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>{title}</h2>
        <button className={styles.saveBtn} onClick={onSave} disabled={saving}>
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  )
}

function TextField({ label, value, onChange }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <input type="text" value={value ?? ''} onChange={e => onChange(e.target.value)} />
    </label>
  )
}

function TextAreaField({ label, value, onChange }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <textarea value={value ?? ''} onChange={e => onChange(e.target.value)} rows={3} />
    </label>
  )
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <select value={value ?? options[0] ?? ''} onChange={e => onChange(e.target.value)}>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </label>
  )
}

function ImageField({ label, value, onUpload, uploading }) {
  return (
    <div className={styles.imageField}>
      <span>{label}</span>
      <div className={styles.imagePreviewWrap}>
        {value && <img src={value} alt="" className={styles.imagePreview} />}
        <label className={styles.uploadBtn}>
          {uploading ? 'Đang tải lên...' : 'Chọn ảnh khác'}
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={e => onUpload(e.target.files?.[0])}
            hidden
          />
        </label>
      </div>
    </div>
  )
}
