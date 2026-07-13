// src/components/Admin/AdminFaqContent.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Plus, Trash2, Pencil, ChevronDown, ChevronUp,
  Loader2, CheckCircle2, X, GripVertical, Eye, EyeOff,
  FolderOpen, MessageSquare, RefreshCw, Save,
} from 'lucide-react'
import { faqContentApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import styles from './AdminFaqContent.module.scss'
import { useAdminToast } from './AdminToast'
import { getLocalizedValue, serializeLocalizedValue, toLocalizedString } from '../../i18n/localized'

const ADMIN_LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt', shortLabel: 'VI' },
  { code: 'en', label: 'English', shortLabel: 'EN' },
]

// ─── Modal chỉnh sửa danh mục ─────────────────────────────────────────────────
function CategoryModal({ cat, language, onSave, onClose }) {
  const [form, setForm] = useState({
    key:        cat?.key        ?? '',
    label:      cat?.label      ?? '',
    sort_order: cat?.sort_order ?? 0,
    is_active:  cat?.is_active  ?? 1,
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.key.trim() || !String(getLocalizedValue(form.label, language) || '').trim()) return
    setSaving(true)
    try {
      if (cat) {
        await faqContentApi.updateCategory(cat.id, {
          label: serializeLocalizedValue(form.label), sort_order: form.sort_order, is_active: form.is_active,
        })
      } else {
        await faqContentApi.createCategory({ ...form, label: serializeLocalizedValue(form.label) })
      }
      onSave()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{cat ? 'Sửa danh mục' : 'Thêm danh mục'}</h3>
          <button className={styles.modalClose} onClick={onClose}><X size={16} /></button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.field}>
            <label>Key (slug) <span>*</span></label>
            <input
              value={form.key}
              onChange={e => setForm(p => ({ ...p, key: e.target.value }))}
              placeholder="vd: general, pricing, tracking"
              disabled={!!cat}
            />
            {!cat && <p className={styles.hint}>Chỉ chữ thường, số, dấu gạch. Không thay đổi sau khi tạo.</p>}
          </div>
          <div className={styles.field}>
            <label>Tên hiển thị <span>*</span></label>
            <input
              value={getLocalizedValue(form.label, language) || ''}
              onChange={e => setForm(p => ({ ...p, label: toLocalizedString(p.label, language, e.target.value) }))}
              placeholder="vd: Tổng quan dịch vụ"
            />
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label>Thứ tự</label>
              <input
                type="number" min={0}
                value={form.sort_order}
                onChange={e => setForm(p => ({ ...p, sort_order: +e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label>Trạng thái</label>
              <select
                value={form.is_active}
                onChange={e => setForm(p => ({ ...p, is_active: +e.target.value }))}
              >
                <option value={1}>Hiển thị</option>
                <option value={0}>Ẩn</option>
              </select>
            </div>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Hủy</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={14} className={styles.spin} /> : <Save size={14} />}
            Lưu
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal chỉnh sửa câu hỏi ──────────────────────────────────────────────────
function ItemModal({ item, catId, language, onSave, onClose }) {
  const [form, setForm] = useState({
    question:   item?.question   ?? '',
    answer:     item?.answer     ?? '',
    sort_order: item?.sort_order ?? 0,
    is_active:  item?.is_active  ?? 1,
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (
      !String(getLocalizedValue(form.question, language) || '').trim() ||
      !String(getLocalizedValue(form.answer, language) || '').trim()
    ) return
    setSaving(true)
    try {
      const payload = {
        ...form,
        question: serializeLocalizedValue(form.question),
        answer: serializeLocalizedValue(form.answer),
      }
      if (item) {
        await faqContentApi.updateItem(item.id, payload)
      } else {
        await faqContentApi.createItem(catId, payload)
      }
      onSave()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{item ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}</h3>
          <button className={styles.modalClose} onClick={onClose}><X size={16} /></button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.field}>
            <label>Câu hỏi <span>*</span></label>
            <textarea
              rows={2}
              value={getLocalizedValue(form.question, language) || ''}
              onChange={e => setForm(p => ({ ...p, question: toLocalizedString(p.question, language, e.target.value) }))}
              placeholder="Nhập câu hỏi..."
            />
          </div>
          <div className={styles.field}>
            <label>Câu trả lời <span>*</span></label>
            <textarea
              rows={5}
              value={getLocalizedValue(form.answer, language) || ''}
              onChange={e => setForm(p => ({ ...p, answer: toLocalizedString(p.answer, language, e.target.value) }))}
              placeholder="Nhập câu trả lời chi tiết..."
            />
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label>Thứ tự</label>
              <input
                type="number" min={0}
                value={form.sort_order}
                onChange={e => setForm(p => ({ ...p, sort_order: +e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label>Trạng thái</label>
              <select
                value={form.is_active}
                onChange={e => setForm(p => ({ ...p, is_active: +e.target.value }))}
              >
                <option value={1}>Hiển thị</option>
                <option value={0}>Ẩn</option>
              </select>
            </div>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Hủy</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={14} className={styles.spin} /> : <Save size={14} />}
            Lưu
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
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

export default function AdminFaqContent() {
  const { logout }   = useAuth()
  const navigate     = useNavigate()

  const [categories, setCategories]   = useState([])
  const [expandedCat, setExpandedCat] = useState(null)   // id category đang mở
  const [itemsMap, setItemsMap]       = useState({})      // { [catId]: [...items] }
  const [loading, setLoading]         = useState(true)
  const [loadingItems, setLoadingItems] = useState(null)  // catId đang load items
  const [contentLanguage, setContentLanguage] = useState('vi')

  const [catModal, setCatModal]   = useState(null)   // null | 'new' | cat-object
  const [itemModal, setItemModal] = useState(null)   // null | { catId, item? }
  const [delConfirm, setDelConfirm] = useState(null) // { type:'cat'|'item', id, name }
  const { showToast } = useAdminToast()
// ── Load categories ──────────────────────────────────────────
  const fetchCategories = async () => {
    setLoading(true)
    try {
      const rows = await faqContentApi.getCategories()
      setCategories(rows)
    } catch (err) {
      showToast(err.message || 'Lỗi tải danh mục', 'error')
      if (err.message?.includes('Token')) { logout(); navigate('/login') }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  // ── Toggle expand category → load items ─────────────────────
  const toggleCat = async (catId) => {
    if (expandedCat === catId) { setExpandedCat(null); return }
    setExpandedCat(catId)
    if (itemsMap[catId]) return   // đã có cache
    setLoadingItems(catId)
    try {
      const rows = await faqContentApi.getItems(catId)
      setItemsMap(p => ({ ...p, [catId]: rows }))
    } catch (err) {
      showToast(err.message || 'Lỗi tải câu hỏi', 'error')
    } finally {
      setLoadingItems(null)
    }
  }

  // ── Reload items của 1 category ─────────────────────────────
  const reloadItems = async (catId) => {
    try {
      const rows = await faqContentApi.getItems(catId)
      setItemsMap(p => ({ ...p, [catId]: rows }))
    } catch (err) {
      showToast(err.message || 'Lỗi tải câu hỏi', 'error')
    }
  }

  // ── Delete ───────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!delConfirm) return
    try {
      if (delConfirm.type === 'cat') {
        await faqContentApi.deleteCategory(delConfirm.id)
        showToast('Đã xóa danh mục!')
        fetchCategories()
        if (expandedCat === delConfirm.id) setExpandedCat(null)
      } else {
        await faqContentApi.deleteItem(delConfirm.id)
        showToast('Đã xóa câu hỏi!')
        reloadItems(delConfirm.catId)
      }
    } catch (err) {
      showToast(err.message || 'Lỗi xóa', 'error')
    } finally {
      setDelConfirm(null)
    }
  }

  // ── Toggle visible nhanh ─────────────────────────────────────
  const toggleCatVisible = async (cat) => {
    try {
      await faqContentApi.updateCategory(cat.id, { is_active: cat.is_active ? 0 : 1 })
      fetchCategories()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const toggleItemVisible = async (item, catId) => {
    try {
      await faqContentApi.updateItem(item.id, { is_active: item.is_active ? 0 : 1 })
      reloadItems(catId)
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  // ════════════════════════════════════════════════════════════
  return (
    <div className={styles.page}>

      {/* Toast */}

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>
            <FolderOpen size={20} /> Nội dung FAQ
          </h1>
          <p className={styles.subtitle}>Quản lý danh mục và câu hỏi hiển thị trên trang FAQ</p>
        </div>
        <div className={styles.headerRight}>
          <LanguageTabs value={contentLanguage} onChange={setContentLanguage} />
          <button className={styles.refreshBtn} onClick={fetchCategories}>
            <RefreshCw size={14} /> Làm mới
          </button>
          <button className={styles.addCatBtn} onClick={() => setCatModal('new')}>
            <Plus size={14} /> Thêm danh mục
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <FolderOpen size={18} style={{ color: '#6366f1' }} />
          <div>
            <p className={styles.statVal}>{categories.length}</p>
            <p className={styles.statLabel}>Danh mục</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <MessageSquare size={18} style={{ color: '#10b981' }} />
          <div>
            <p className={styles.statVal}>
              {Object.values(itemsMap).reduce((s, arr) => s + arr.length, 0)}
            </p>
            <p className={styles.statLabel}>Câu hỏi đã tải</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <Eye size={18} style={{ color: '#3b82f6' }} />
          <div>
            <p className={styles.statVal}>{categories.filter(c => c.is_active).length}</p>
            <p className={styles.statLabel}>Đang hiển thị</p>
          </div>
        </div>
      </div>

      {/* Category list */}
      <div className={styles.catList}>
        {loading ? (
          <div className={styles.loadingBox}>
            <Loader2 size={16} className={styles.spin} /> Đang tải danh mục...
          </div>
        ) : categories.length === 0 ? (
          <div className={styles.empty}>
            <FolderOpen size={36} strokeWidth={1.2} />
            <p>Chưa có danh mục nào</p>
            <button className={styles.addCatBtn} onClick={() => setCatModal('new')}>
              <Plus size={14} /> Tạo danh mục đầu tiên
            </button>
          </div>
        ) : (
          categories.map(cat => {
            const isOpen = expandedCat === cat.id
            const items  = itemsMap[cat.id] || []

            return (
              <div key={cat.id} className={`${styles.catCard} ${!cat.is_active ? styles.catHidden : ''}`}>

                {/* Category header */}
                <div className={styles.catHeader}>
                  <button className={styles.catToggle} onClick={() => toggleCat(cat.id)}>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  <div className={styles.catInfo}>
                    <span className={styles.catLabel}>{getLocalizedValue(cat.label, contentLanguage)}</span>
                    <span className={styles.catKey}>{cat.key}</span>
                    <span className={styles.catCount}>
                      {items.length > 0 ? `${items.length} câu hỏi` : 'Chưa tải'}
                    </span>
                    {!cat.is_active && (
                      <span className={styles.hiddenBadge}>Đang ẩn</span>
                    )}
                  </div>

                  <div className={styles.catActions}>
                    <button
                      className={styles.iconBtn}
                      title={cat.is_active ? 'Ẩn danh mục' : 'Hiện danh mục'}
                      onClick={() => toggleCatVisible(cat)}
                    >
                      {cat.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button
                      className={styles.iconBtn}
                      title="Sửa danh mục"
                      onClick={() => setCatModal(cat)}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className={`${styles.iconBtn} ${styles.danger}`}
                      title="Xóa danh mục"
                      onClick={() => setDelConfirm({ type: 'cat', id: cat.id, name: getLocalizedValue(cat.label, contentLanguage) })}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Items */}
                {isOpen && (
                  <div className={styles.itemsBox}>
                    {loadingItems === cat.id ? (
                      <div className={styles.loadingItems}>
                        <Loader2 size={14} className={styles.spin} /> Đang tải câu hỏi...
                      </div>
                    ) : (
                      <>
                        {items.length === 0 ? (
                          <p className={styles.noItems}>Chưa có câu hỏi nào trong danh mục này.</p>
                        ) : (
                          <div className={styles.itemList}>
                            {items.map((item, idx) => (
                              <div
                                key={item.id}
                                className={`${styles.itemRow} ${!item.is_active ? styles.itemHidden : ''}`}
                              >
                                <GripVertical size={14} className={styles.grip} />
                                <span className={styles.itemIdx}>{idx + 1}</span>
                                <div className={styles.itemContent}>
                                  <p className={styles.itemQ}>{getLocalizedValue(item.question, contentLanguage)}</p>
                                  <p className={styles.itemA}>{getLocalizedValue(item.answer, contentLanguage)}</p>
                                </div>
                                <div className={styles.itemActions}>
                                  {!item.is_active && (
                                    <span className={styles.hiddenBadge}>Ẩn</span>
                                  )}
                                  <button
                                    className={styles.iconBtn}
                                    title={item.is_active ? 'Ẩn' : 'Hiện'}
                                    onClick={() => toggleItemVisible(item, cat.id)}
                                  >
                                    {item.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
                                  </button>
                                  <button
                                    className={styles.iconBtn}
                                    title="Sửa câu hỏi"
                                    onClick={() => setItemModal({ catId: cat.id, item })}
                                  >
                                    <Pencil size={13} />
                                  </button>
                                  <button
                                    className={`${styles.iconBtn} ${styles.danger}`}
                                    title="Xóa câu hỏi"
                                    onClick={() => setDelConfirm({
                                      type: 'item', id: item.id,
                                      catId: cat.id,
                                      name: String(getLocalizedValue(item.question, contentLanguage) || '').slice(0, 50),
                                    })}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <button
                          className={styles.addItemBtn}
                          onClick={() => setItemModal({ catId: cat.id, item: null })}
                        >
                          <Plus size={13} /> Thêm câu hỏi
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Modals */}
      {catModal && (
        <CategoryModal
          cat={catModal === 'new' ? null : catModal}
          language={contentLanguage}
          onSave={() => { setCatModal(null); fetchCategories(); showToast('Lưu danh mục thành công!') }}
          onClose={() => setCatModal(null)}
        />
      )}

      {itemModal && (
        <ItemModal
          catId={itemModal.catId}
          item={itemModal.item}
          language={contentLanguage}
          onSave={() => {
            setItemModal(null)
            reloadItems(itemModal.catId)
            showToast('Lưu câu hỏi thành công!')
          }}
          onClose={() => setItemModal(null)}
        />
      )}

      {/* Delete confirm */}
      {delConfirm && (
        <div className={styles.overlay} onClick={() => setDelConfirm(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <div className={styles.confirmIcon}><Trash2 size={26} /></div>
            <h3>Xác nhận xóa?</h3>
            <p>
              {delConfirm.type === 'cat'
                ? <>Danh mục <strong>"{delConfirm.name}"</strong> và tất cả câu hỏi bên trong sẽ bị xóa vĩnh viễn.</>
                : <>Câu hỏi <strong>"{delConfirm.name}..."</strong> sẽ bị xóa vĩnh viễn.</>
              }
            </p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setDelConfirm(null)}>Hủy</button>
              <button className={styles.deleteConfirmBtn} onClick={handleDelete}>Xóa vĩnh viễn</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
