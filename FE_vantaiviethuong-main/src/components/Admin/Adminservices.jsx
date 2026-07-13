// src/components/Admin/AdminServices.jsx
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, Trash2, Eye, EyeOff, X, ArrowLeft } from 'lucide-react'
import styles from './Adminservices.module.scss'
import { useAdminToast } from './AdminToast'
import AdminConfirmDialog from './AdminConfirmDialog'
import { getLocalizedValue, serializeLocalizedValue, toLocalizedString, toLocalizedValue } from '../../i18n/localized'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const ICON_OPTIONS = [
  'Truck', 'Globe', 'Warehouse', 'Zap', 'ShieldCheck', 'CheckCircle2',
  'Phone', 'Mail', 'MapPin', 'Clock',
]

const EMPTY_ITEM = { title: '', subtitle: '', description: '', icon_key: 'Truck', image: '', tags: [] }
const ADMIN_LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt', shortLabel: 'VI' },
  { code: 'en', label: 'English', shortLabel: 'EN' },
]

const DEFAULT_PAGE = {
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
}

function normalizePage(data = {}) {
  const banner = data.banner && typeof data.banner === 'object' && !Array.isArray(data.banner)
    ? data.banner
    : {}
  const contactInfo = data.contact_info && typeof data.contact_info === 'object' && !Array.isArray(data.contact_info)
    ? data.contact_info
    : {}

  const processSteps = Array.isArray(data.process_steps) && data.process_steps.length
    ? data.process_steps.map((step, index) => ({
        step_order: step?.step_order || step?.id || index + 1,
        icon_key: step?.icon_key || DEFAULT_PAGE.process_steps[index]?.icon_key || 'Truck',
        icon_url: step?.icon_url || '',
        title: step?.title || '',
        desc: step?.desc || '',
      }))
    : structuredClone(DEFAULT_PAGE.process_steps)

  const contactItems = Array.isArray(contactInfo.items) && contactInfo.items.length
    ? contactInfo.items.map(item => ({
        icon_key: item?.icon_key || 'MapPin',
        label: item?.label || '',
        value: item?.value || '',
      }))
    : structuredClone(DEFAULT_PAGE.contact_info.items)

  return {
    ...data,
    banner: { ...DEFAULT_PAGE.banner, ...banner },
    process_steps: processSteps,
    contact_info: {
      ...DEFAULT_PAGE.contact_info,
      ...contactInfo,
      items: contactItems,
    },
  }
}

function normalizeServiceItems(items) {
  if (!Array.isArray(items)) return []
  return items.map(item => ({
    ...item,
    tags: Array.isArray(item.tags) ? item.tags : [],
  }))
}

export default function AdminServices() {
  const { showToast } = useAdminToast()
  const navigate = useNavigate()

  const [page, setPage] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState({})
  const [contentLanguage, setContentLanguage] = useState('vi')
  const [uploadingKey, setUploadingKey] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState(EMPTY_ITEM)
  const [tagInput, setTagInput] = useState('')
  const [seeding, setSeeding] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const token = localStorage.getItem('vh_token')
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } }
const loadAll = useCallback(() => {
    setLoading(true)
    Promise.all([
      axios.get(`${API_BASE}/services-page`),
      axios.get(`${API_BASE}/services-page/items/admin`, authHeaders),
    ])
      .then(([pageRes, itemsRes]) => {
        setPage(normalizePage(pageRes.data?.data))
        setItems(normalizeServiceItems(itemsRes.data?.data))
      })
      .catch((err) => {
        setPage(normalizePage())
        setItems([])
        showToast(err.response?.data?.message || 'Không thể tải dữ liệu trang Dịch vụ.', 'error')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const updatePageField = (path, value) => {
    setPage(prev => {
      const next = structuredClone(prev)
      const keys = path.split('.')
      let target = next
      for (let i = 0; i < keys.length - 1; i++) target = target[keys[i]]
      target[keys[keys.length - 1]] = value
      return next
    })
  }

  const saveSection = async (sectionKey) => {
    setSaving(prev => ({ ...prev, [sectionKey]: true }))
    try {
      await axios.put(`${API_BASE}/services-page`, { [sectionKey]: page[sectionKey] }, authHeaders)
      showToast('Đã lưu thay đổi!', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Lưu thất bại.', 'error')
    } finally {
      setSaving(prev => ({ ...prev, [sectionKey]: false }))
    }
  }

  const uploadImageFile = async (file, key, onDone) => {
    if (!file) return
    setUploadingKey(key)
    try {
      const formDataObj = new FormData()
      formDataObj.append('image', file)
      const res = await axios.post(`${API_BASE}/services-page/upload-image`, formDataObj, {
        headers: { ...authHeaders.headers, 'Content-Type': 'multipart/form-data' },
      })
      onDone(res.data.url)
      showToast('Upload ảnh thành công!', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Upload ảnh thất bại.', 'error')
    } finally {
      setUploadingKey(null)
    }
  }

  const openCreateForm = () => {
    setEditingItem(null)
    setFormData(EMPTY_ITEM)
    setTagInput('')
    setShowForm(true)
  }

  const seedDefaultServices = async () => {
    setSeeding(true)
    try {
      const res = await axios.post(`${API_BASE}/services-page/items/seed`, {}, authHeaders)
      showToast(res.data?.message || 'Đã khởi tạo các dịch vụ mặc định.', 'success')
      loadAll()
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể khởi tạo dịch vụ mặc định.', 'error')
    } finally {
      setSeeding(false)
    }
  }

  const openEditForm = (item) => {
    setEditingItem(item)
    setFormData({ ...item, tags: Array.isArray(item.tags) ? item.tags : [] })
    setTagInput('')
    setShowForm(true)
  }

  const addTag = () => {
    const v = tagInput.trim()
    if (!v) return
    setFormData(prev => ({ ...prev, tags: [...prev.tags, toLocalizedString('', contentLanguage, v)] }))
    setTagInput('')
  }

  const removeTag = (idx) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== idx) }))
  }

  const submitForm = async (e) => {
    e.preventDefault()
    if (
      !String(getLocalizedValue(formData.title, contentLanguage) || '').trim() ||
      !String(getLocalizedValue(formData.subtitle, contentLanguage) || '').trim() ||
      !String(getLocalizedValue(formData.description, contentLanguage) || '').trim() ||
      !formData.image.trim()
    ) {
      showToast('Vui lòng nhập đầy đủ thông tin bắt buộc.', 'error')
      return
    }
    try {
      const payload = {
        ...formData,
        title: serializeLocalizedValue(formData.title),
        subtitle: serializeLocalizedValue(formData.subtitle),
        description: serializeLocalizedValue(formData.description),
        tags: Array.isArray(formData.tags) ? formData.tags.map(serializeLocalizedValue) : [],
      }
      if (editingItem) {
        await axios.put(`${API_BASE}/services-page/items/${editingItem.id}`, payload, authHeaders)
        showToast('Đã cập nhật dịch vụ!', 'success')
      } else {
        await axios.post(`${API_BASE}/services-page/items`, payload, authHeaders)
        showToast('Đã thêm dịch vụ mới!', 'success')
      }
      setShowForm(false)
      loadAll()
    } catch (err) {
      showToast(err.response?.data?.message || 'Lưu thất bại.', 'error')
    }
  }

  const deleteItem = async () => {
    if (!deleteTarget) return
    setDeletingId(deleteTarget.id)
    try {
      await axios.delete(`${API_BASE}/services-page/items/${deleteTarget.id}`, authHeaders)
      showToast('Đã xóa dịch vụ.', 'success')
      setItems(prev => prev.filter(i => i.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      showToast(err.response?.data?.message || 'Xóa thất bại.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const updateLocalizedPageField = (path, value) => {
    setPage(prev => {
      const next = structuredClone(prev)
      const keys = path.split('.')
      let target = next
      for (let i = 0; i < keys.length - 1; i++) target = target[keys[i]]
      const lastKey = keys[keys.length - 1]
      target[lastKey] = toLocalizedValue(target[lastKey], contentLanguage, value)
      return next
    })
  }

  const updateLocalizedFormField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: toLocalizedString(prev[field], contentLanguage, value),
    }))
  }

  const toggleActive = async (item) => {
    const next = item.is_active ? 0 : 1
    try {
      await axios.put(`${API_BASE}/services-page/items/${item.id}`, { ...item, is_active: next }, authHeaders)
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_active: next } : i))
    } catch (err) {
      showToast('Không thể đổi trạng thái hiển thị.', 'error')
    }
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex(i => i.id === active.id)
    const newIndex = items.findIndex(i => i.id === over.id)
    const reordered = arrayMove(items, oldIndex, newIndex)
    setItems(reordered)
    try {
      await axios.put(`${API_BASE}/services-page/items/reorder`, { order: reordered.map(i => i.id) }, authHeaders)
    } catch (err) {
      showToast('Không thể lưu thứ tự mới.', 'error')
      loadAll()
    }
  }

  if (loading) return <div className={styles.loading}>Đang tải nội dung...</div>
  if (!page)   return <div className={styles.loading}>Không có dữ liệu.</div>

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Quản Lý Trang Dịch Vụ</h1>
        </div>
        <LanguageTabs value={contentLanguage} onChange={setContentLanguage} />
      </div>


      {/* ══════════ BANNER ══════════ */}
      <Section title="Banner Hero" onSave={() => saveSection('banner')} saving={saving.banner}>
        <TextField label="Tiêu đề dòng 1" value={getLocalizedValue(page.banner.title_line1, contentLanguage)}
          onChange={v => updateLocalizedPageField('banner.title_line1', v)} />
        <TextField label="Tiêu đề nhấn màu (dòng 2)" value={getLocalizedValue(page.banner.title_accent, contentLanguage)}
          onChange={v => updateLocalizedPageField('banner.title_accent', v)} />
        <TextField label="Tiêu đề dòng 3" value={getLocalizedValue(page.banner.title_line3, contentLanguage)}
          onChange={v => updateLocalizedPageField('banner.title_line3', v)} />
        <TextAreaField label="Mô tả phụ" value={getLocalizedValue(page.banner.subtitle, contentLanguage)}
          onChange={v => updateLocalizedPageField('banner.subtitle', v)} />
      </Section>

      {/* ══════════ DANH SÁCH DỊCH VỤ ══════════ */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Danh Sách Dịch Vụ (Timeline)</h2>
          <button className={styles.addBtn} onClick={openCreateForm}>
            <Plus size={16} /> Thêm dịch vụ
          </button>
        </div>
        <div className={styles.sectionBody}>
          <p className={styles.dragHint}>Kéo biểu tượng <GripVertical size={13} /> để đổi thứ tự hiển thị trên trang.</p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <div className={styles.itemsList}>
                {items.map(item => (
                  <SortableServiceCard
                    key={item.id}
                    item={item}
                    language={contentLanguage}
                    onEdit={() => openEditForm(item)}
                    onDelete={() => setDeleteTarget(item)}
                    onToggleActive={() => toggleActive(item)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {!items.length && (
            <div className={styles.emptyState}>
              <p>Database chưa có dịch vụ nào.</p>
              <button className={styles.addBtn} onClick={seedDefaultServices} disabled={seeding}>
                <Plus size={16} /> {seeding ? 'Đang khởi tạo...' : 'Tạo 4 dịch vụ hiện tại'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ══════════ PROCESS STEPS ══════════ */}
      <Section title="5 Bước Quy Trình" onSave={() => saveSection('process_steps')} saving={saving.process_steps}>
        {page.process_steps.map((step, i) => (
          <div key={i} className={styles.itemBlock}>
            <p className={styles.itemLabel}>Bước #{step.step_order}</p>
            <div className={styles.row}>
              <SelectField label="Icon" value={step.icon_key}
                options={ICON_OPTIONS}
                onChange={v => updatePageField(`process_steps.${i}.icon_key`, v)} />
              <TextField label="Tiêu đề" value={getLocalizedValue(step.title, contentLanguage)}
                onChange={v => updateLocalizedPageField(`process_steps.${i}.title`, v)} />
            </div>
            <ImageField label={"Icon upload (t\u00f9y ch\u1ecdn)"} value={step.icon_url}
              uploading={uploadingKey === `process_steps.${i}.icon_url`}
              onUpload={file => uploadImageFile(file, `process_steps.${i}.icon_url`, url => updatePageField(`process_steps.${i}.icon_url`, url))} />
            <TextAreaField label="Mô tả" value={getLocalizedValue(step.desc, contentLanguage)}
              onChange={v => updateLocalizedPageField(`process_steps.${i}.desc`, v)} />
          </div>
        ))}
      </Section>

      {/* ══════════ CONTACT INFO ══════════ */}
      <Section title="Thông Tin Liên Hệ" onSave={() => saveSection('contact_info')} saving={saving.contact_info}>
        <div className={styles.row}>
          <TextField label="Tên công ty" value={getLocalizedValue(page.contact_info.company_name, contentLanguage)}
            onChange={v => updateLocalizedPageField('contact_info.company_name', v)} />
          <TextField label="Slogan" value={getLocalizedValue(page.contact_info.tagline, contentLanguage)}
            onChange={v => updateLocalizedPageField('contact_info.tagline', v)} />
        </div>
        <ImageField label="Ảnh minh họa cột trái" value={page.contact_info.left_image}
          uploading={uploadingKey === 'contact_info.left_image'}
          onUpload={file => uploadImageFile(file, 'contact_info.left_image', url => updatePageField('contact_info.left_image', url))} />

        {page.contact_info.items.map((info, i) => (
          <div key={i} className={styles.itemBlock}>
            <p className={styles.itemLabel}>Thông tin #{i + 1}</p>
            <div className={styles.row}>
              <SelectField label="Icon" value={info.icon_key}
                options={ICON_OPTIONS}
                onChange={v => updatePageField(`contact_info.items.${i}.icon_key`, v)} />
              <TextField label="Nhãn" value={getLocalizedValue(info.label, contentLanguage)}
                onChange={v => updateLocalizedPageField(`contact_info.items.${i}.label`, v)} />
            </div>
            <TextField label="Giá trị" value={getLocalizedValue(info.value, contentLanguage)}
              onChange={v => updateLocalizedPageField(`contact_info.items.${i}.value`, v)} />
          </div>
        ))}
      </Section>

      {/* ══════════ MODAL FORM ══════════ */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingItem ? 'Sửa Dịch Vụ' : 'Thêm Dịch Vụ Mới'}</h3>
              <button className={styles.closeBtn} onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>

            <form className={styles.modalForm} onSubmit={submitForm}>
              {editingItem && (
                <p className={styles.slugNote}>
                  Đường dẫn: <code>/dich-vu/{editingItem.slug}</code> (tự sinh từ tiêu đề, không thể sửa)
                </p>
              )}

              <TextField label="Tiêu đề dịch vụ *" value={getLocalizedValue(formData.title, contentLanguage)}
                onChange={v => updateLocalizedFormField('title', v)} />
              <TextField label="Phụ đề *" value={getLocalizedValue(formData.subtitle, contentLanguage)}
                onChange={v => updateLocalizedFormField('subtitle', v)} />
              <TextAreaField label="Mô tả chi tiết *" value={getLocalizedValue(formData.description, contentLanguage)}
                onChange={v => updateLocalizedFormField('description', v)} />
              <SelectField label="Icon" value={formData.icon_key} options={ICON_OPTIONS}
                onChange={v => setFormData(p => ({ ...p, icon_key: v }))} />

              <ImageField label="Ảnh minh họa *" value={formData.image}
                uploading={uploadingKey === 'form.image'}
                onUpload={file => uploadImageFile(file, 'form.image', url => setFormData(p => ({ ...p, image: url })))} />

              <div className={styles.field}>
                <span>Tags</span>
                <div className={styles.tagInputRow}>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                    placeholder="Nhập tag rồi nhấn Enter"
                  />
                  <button type="button" className={styles.tagAddBtn} onClick={addTag}>Thêm</button>
                </div>
                <div className={styles.tagList}>
                  {formData.tags.map((tag, i) => (
                    <span key={i} className={styles.tagChip}>
                      {getLocalizedValue(tag, contentLanguage)}
                      <button type="button" onClick={() => removeTag(i)}><X size={12} /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>Hủy</button>
                <button type="submit" className={styles.submitBtn}>
                  {editingItem ? 'Lưu thay đổi' : 'Thêm dịch vụ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <AdminConfirmDialog
        open={!!deleteTarget}
        title="Xóa dịch vụ?"
        message="Dịch vụ này sẽ bị xóa khỏi trang Dịch vụ và các khu vực đang lấy dữ liệu dịch vụ."
        target={deleteTarget?.title}
        busy={!!deleteTarget && deletingId === deleteTarget.id}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={deleteItem}
      />
    </div>
  )
}

// ── Card dịch vụ có thể kéo-thả ──────────────────────────────
function SortableServiceCard({ item, language = 'vi', onEdit, onDelete, onToggleActive }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : item.is_active ? 1 : 0.55,
  }

  return (
    <div ref={setNodeRef} style={style} className={styles.serviceCard}>
      <button className={styles.dragHandle} {...attributes} {...listeners} aria-label="Kéo để sắp xếp">
        <GripVertical size={18} />
      </button>

      <img src={item.image} alt={getLocalizedValue(item.title, language)} className={styles.serviceCardThumb} />

      <div className={styles.serviceCardInfo}>
        <p className={styles.serviceCardTitle}>{getLocalizedValue(item.title, language)}</p>
        <p className={styles.serviceCardSubtitle}>{getLocalizedValue(item.subtitle, language)}</p>
        <div className={styles.serviceCardTags}>
          {item.tags.map((t, i) => <span key={i} className={styles.miniTag}>{getLocalizedValue(t, language)}</span>)}
        </div>
      </div>

      <div className={styles.serviceCardActions}>
        <button className={styles.iconBtn} onClick={onToggleActive} title={item.is_active ? 'Đang hiển thị — bấm để ẩn' : 'Đang ẩn — bấm để hiện'}>
          {item.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
        <button className={styles.iconBtn} onClick={onEdit} title="Sửa">Sửa</button>
        <button className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={onDelete} title="Xóa">
          <Trash2 size={16} />
        </button>
      </div>
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

function LanguageTabs({ value, onChange }) {
  return (
    <div style={{ display: 'inline-flex', gap: 6, padding: 4, border: '1px solid #E5E7EB', borderRadius: 999, background: '#F9FAFB' }}>
      {ADMIN_LANGUAGES.map(lang => (
        <button
          key={lang.code}
          type="button"
          onClick={() => onChange(lang.code)}
          title={lang.label}
          style={{
            border: 0,
            borderRadius: 999,
            padding: '7px 12px',
            fontWeight: 800,
            fontSize: 12,
            cursor: 'pointer',
            color: value === lang.code ? '#fff' : '#374151',
            background: value === lang.code ? '#DC2626' : 'transparent',
          }}
        >
          {lang.shortLabel}
        </button>
      ))}
    </div>
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
          <input type="file" accept="image/*" disabled={uploading}
            onChange={e => onUpload(e.target.files?.[0])} hidden />
        </label>
      </div>
    </div>
  )
}
