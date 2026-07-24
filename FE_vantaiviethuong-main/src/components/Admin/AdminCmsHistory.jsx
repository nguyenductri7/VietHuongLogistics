import { useEffect, useMemo, useState } from 'react'
import {
  ChevronDown, ChevronUp, Clock3, FileClock, Filter, Loader2, RefreshCw, UserRound,
  RotateCcw, Trash2,
} from 'lucide-react'
import { cmsHistoryApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useAdminToast } from './AdminToast'
import AdminConfirmDialog from './AdminConfirmDialog'
import styles from './AdminCmsHistory.module.scss'

const MODULES = {
  home: { label: 'Trang chá»§', tone: 'red' },
  about: { label: 'Trang giá»›i thiá»‡u', tone: 'blue' },
  services: { label: 'Trang dá»‹ch vá»¥', tone: 'green' },
  faq: { label: 'Quáº£n lĂ½ giáº£i Ä‘Ă¡p', tone: 'orange' },
  faq_content: { label: 'Ná»™i dung FAQ', tone: 'purple' },
  blogs: { label: 'Tin tá»©c', tone: 'cyan' },
  branches: { label: 'Chi nhĂ¡nh', tone: 'pink' },
  contacts: { label: 'LiĂªn há»‡', tone: 'gray' },
}

const FIELD_LABELS = {
  hero: 'Hero Ä‘áº§u trang',
  about_intro: 'Giá»›i thiá»‡u trĂªn trang chá»§',
  services_section: 'Giáº£i phĂ¡p váº­n táº£i',
  partners_section: 'Äá»‘i tĂ¡c vĂ  Ä‘Ă¡nh giĂ¡',
  contact_section: 'ThĂ´ng tin liĂªn há»‡',
  footer: 'ChĂ¢n trang',
  partners: 'Äá»‘i tĂ¡c',
  stats: 'Sá»‘ liá»‡u thá»‘ng kĂª',
  identity: 'Giá»›i thiá»‡u cĂ´ng ty',
  services: 'Dá»‹ch vá»¥',
  timeline: 'Lá»‹ch sá»­ hĂ¬nh thĂ nh',
  values_section: 'GiĂ¡ trá»‹ cá»‘t lĂµi',
  banner: 'Banner',
  process_steps: 'CĂ¡c bÆ°á»›c quy trĂ¬nh',
  contact_info: 'ThĂ´ng tin liĂªn há»‡',
  service_items: 'Danh sĂ¡ch dá»‹ch vá»¥',
  detail_content: 'Ná»™i dung trang chi tiáº¿t',
  highlights: 'Sá»‘ liá»‡u ná»•i báº­t',
  features: 'Lá»£i Ă­ch vĂ  Ä‘áº·c Ä‘iá»ƒm',
  eyebrow: 'NhĂ£n nhá»',
  title_prefix: 'TiĂªu Ä‘á» má»Ÿ Ä‘áº§u',
  cta_label: 'Chá»¯ trĂªn nĂºt',
  cta_link: 'LiĂªn káº¿t nĂºt',
  hero_cta_label: 'NĂºt Ä‘áº·t dá»‹ch vá»¥ trĂªn Hero',
  form_title_prefix: 'TiĂªu Ä‘á» biá»ƒu máº«u',
  form_description: 'MĂ´ táº£ biá»ƒu máº«u',
  num: 'GiĂ¡ trá»‹',
  title: 'TiĂªu Ä‘á»',
  subtitle: 'Phá»¥ Ä‘á»',
  description: 'MĂ´ táº£',
  name: 'TĂªn',
  company: 'CĂ´ng ty',
  quote: 'Ná»™i dung Ä‘Ă¡nh giĂ¡',
  image: 'HĂ¬nh áº£nh',
  image_url: 'HĂ¬nh áº£nh',
  avatar_url: 'áº¢nh khĂ¡ch hĂ ng',
  logo_url: 'Logo',
  website_url: 'Website',
  is_active: 'Tráº¡ng thĂ¡i hiá»ƒn thá»‹',
  enabled: 'Báº­t/táº¯t section',
  sort_order: 'Thá»© tá»±',
  icon_key: 'Icon',
  icon_url: 'Icon upload',
  tags: 'Tháº» ná»™i dung',
  phone: 'Äiá»‡n thoáº¡i',
  email: 'Email',
  address: 'Äá»‹a chá»‰',
  hotline: 'Hotline',
  question: 'CĂ¢u há»i',
  answer: 'CĂ¢u tráº£ lá»i',
  label: 'TĂªn danh má»¥c',
  key: 'MĂ£ danh má»¥c',
  category_id: 'Danh má»¥c',
  status: 'Tráº¡ng thĂ¡i',
  content: 'Ná»™i dung',
  excerpt: 'MĂ´ táº£ ngáº¯n',
  category: 'ChuyĂªn má»¥c',
  author: 'TĂ¡c giáº£',
  is_featured: 'BĂ i viáº¿t ná»•i báº­t',
  published_at: 'NgĂ y Ä‘Äƒng',
  full_name: 'Há» vĂ  tĂªn',
  message: 'Ná»™i dung liĂªn há»‡',
  lat: 'VÄ© Ä‘á»™',
  lng: 'Kinh Ä‘á»™',
  is_headquarter: 'Trá»¥ sá»Ÿ chĂ­nh',
}

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'KhĂ´ng xĂ¡c Ä‘á»‹nh'
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(date)
}

function formatPath(path = '') {
  return path
    .split('.')
    .map(segment => {
      const match = segment.match(/^([^[]+)(.*)$/)
      if (!match) return segment
      return `${FIELD_LABELS[match[1]] || match[1].replaceAll('_', ' ')}${match[2]}`
    })
    .join(' â€º ')
}

function formatValue(value, path = '') {
  if (value === null || value === undefined || value === '') return 'Trá»‘ng'
  const isFlag = /(?:^|\.)(?:is_active|enabled|show_[^.]+)$/.test(path)
  if (value === true || (isFlag && value === 1)) return 'Báº­t / Hiá»ƒn thá»‹'
  if (value === false || (isFlag && value === 0)) return 'Táº¯t / áº¨n'
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

function actionLabel(action) {
  if (action === 'added') return 'ÄĂ£ thĂªm'
  if (action === 'removed') return 'ÄĂ£ xĂ³a'
  return 'ÄĂ£ cáº­p nháº­t'
}

function getEntryKey(entry) {
  return `${entry.source}:${entry.source_id}`
}

export default function AdminCmsHistory() {
  const { showToast } = useAdminToast()
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [moduleFilter, setModuleFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [restoreTarget, setRestoreTarget] = useState(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState(() => new Set())
  const [deleting, setDeleting] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const canDelete = ['superadmin', 'admin'].includes(user?.role)

  const loadHistory = async () => {
    setLoading(true)
    try {
      const response = await cmsHistoryApi.getList({ module: moduleFilter, limit: 100 })
      setEntries(Array.isArray(response.data) ? response.data : [])
      setSelectedKeys(new Set())
    } catch (error) {
      showToast(error.message || 'KhĂ´ng thá»ƒ táº£i lá»‹ch sá»­ chá»‰nh sá»­a.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadHistory() }, [moduleFilter])

  const selectedEntries = useMemo(
    () => entries.filter(entry => selectedKeys.has(getEntryKey(entry))),
    [entries, selectedKeys],
  )

  const toggleSelected = (entry) => {
    const key = getEntryKey(entry)
    setSelectedKeys(current => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const clearSelected = () => setSelectedKeys(new Set())

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const response = await cmsHistoryApi.delete(deleteTarget.source, deleteTarget.source_id)
      setEntries(current => current.filter(entry => entry.id !== deleteTarget.id))
      if (expandedId === deleteTarget.id) setExpandedId(null)
      setDeleteTarget(null)
      showToast(response.message || 'ÄĂ£ xĂ³a báº£n ghi lá»‹ch sá»­.', 'success')
    } catch (error) {
      showToast(error.message || 'KhĂ´ng thá»ƒ xĂ³a báº£n ghi lá»‹ch sá»­.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const handleBulkDelete = async () => {
    if (!selectedEntries.length) return
    setDeleting(true)
    try {
      const response = await cmsHistoryApi.deleteMany(
        selectedEntries.map(entry => ({ source: entry.source, id: entry.source_id })),
      )
      const selected = new Set(selectedEntries.map(getEntryKey))
      setEntries(current => current.filter(entry => !selected.has(getEntryKey(entry))))
      if (selectedEntries.some(entry => entry.id === expandedId)) setExpandedId(null)
      clearSelected()
      setBulkDeleteOpen(false)
      showToast(response.message || 'ÄĂ£ xoĂ¡ cĂ¡c báº£n ghi Ä‘Ă£ chá»n.', 'success')
    } catch (error) {
      showToast(error.message || 'KhĂ´ng thá»ƒ xoĂ¡ cĂ¡c báº£n ghi Ä‘Ă£ chá»n.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const handleRestore = async () => {
    if (!restoreTarget) return
    setRestoring(true)
    try {
      const response = await cmsHistoryApi.restoreRevision(restoreTarget.source_id)
      setRestoreTarget(null)
      clearSelected()
      showToast(response.message || 'ÄĂ£ hoĂ n tĂ¡c ná»™i dung CMS.', 'success')
      await loadHistory()
    } catch (error) {
      showToast(error.message || 'KhĂ´ng thá»ƒ hoĂ n tĂ¡c báº£n ghi nĂ y.', 'error')
    } finally {
      setRestoring(false)
    }
  }

  const counts = useMemo(() => entries.reduce((result, entry) => {
    result[entry.module] = (result[entry.module] || 0) + 1
    return result
  }, {}), [entries])

  return (
    <div className={styles.page}>
      <div className={styles.intro}>
        <div>
          <div className={styles.eyebrow}><FileClock size={16} /> Nháº­t kĂ½ ná»™i dung</div>
          <h2>Lá»‹ch sá»­ chá»‰nh sá»­a CMS</h2>
          <p>Theo dĂµi ai Ä‘Ă£ cáº­p nháº­t ná»™i dung, thá»i gian cáº­p nháº­t vĂ  nhá»¯ng thĂ´ng tin Ä‘Ă£ thay Ä‘á»•i.</p>
        </div>
        <button type="button" className={styles.refreshBtn} onClick={loadHistory} disabled={loading}>
          <RefreshCw size={16} className={loading ? styles.spin : ''} /> LĂ m má»›i
        </button>
      </div>

      <div className={styles.toolbar}>
        <label className={styles.filter}>
          <Filter size={16} />
          <span>Trang quáº£n lĂ½</span>
          <select value={moduleFilter} onChange={event => setModuleFilter(event.target.value)}>
            <option value="">Táº¥t cáº£ cĂ¡c trang</option>
            {Object.entries(MODULES).map(([key, module]) => (
              <option key={key} value={key}>{module.label}</option>
            ))}
          </select>
        </label>
        <div className={styles.toolbarActions}>
          <span className={styles.total}>
            {selectedEntries.length > 0
              ? `${selectedEntries.length} bản ghi đã chọn`
              : `${entries.length} bản ghi gần nhất`}
          </span>
          {canDelete && selectedEntries.length > 0 && (
            <>
              <button type="button" className={styles.clearBtn} onClick={clearSelected}>
                Bỏ chọn
              </button>
              <button type="button" className={styles.bulkDeleteBtn} onClick={() => setBulkDeleteOpen(true)}>
                <Trash2 size={15} /> Xoá đã chọn
              </button>
            </>
          )}
        </div>
      </div>

      {!moduleFilter && !loading && entries.length > 0 && (
        <div className={styles.stats}>
          {Object.entries(MODULES).map(([key, module]) => (
            <div className={styles.stat} key={key}>
              <span className={`${styles.dot} ${styles[module.tone]}`} />
              <div><strong>{counts[key] || 0}</strong><small>{module.label}</small></div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className={styles.state}><Loader2 size={24} className={styles.spin} /> Äang táº£i lá»‹ch sá»­...</div>
      ) : entries.length === 0 ? (
        <div className={styles.state}>
          <FileClock size={34} />
          <strong>ChÆ°a cĂ³ lá»‹ch sá»­ chá»‰nh sá»­a</strong>
          <span>Lá»‹ch sá»­ sáº½ xuáº¥t hiá»‡n sau láº§n lÆ°u ná»™i dung tiáº¿p theo.</span>
        </div>
      ) : (
        <div className={styles.list}>
          {entries.map(entry => {
            const module = MODULES[entry.module] || { label: entry.module, tone: 'red' }
            const expanded = expandedId === entry.id
            const selected = selectedKeys.has(getEntryKey(entry))
            return (
              <article className={styles.entry} key={entry.id}>
                <div className={styles.entryHeader}>
                  {canDelete && (
                    <label className={styles.selectEntry} onClick={event => event.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleSelected(entry)}
                        aria-label="Chọn bản ghi lịch sử"
                      />
                    </label>
                  )}
                  <button
                    type="button"
                    className={styles.entryMain}
                    onClick={() => setExpandedId(expanded ? null : entry.id)}
                  >
                    <span className={`${styles.moduleBadge} ${styles[module.tone]}`}>{module.label}</span>
                    <div className={styles.entryContent}>
                      <strong>{entry.change_summary || 'Cáº­p nháº­t ná»™i dung'}</strong>
                      <div className={styles.meta}>
                        <span><UserRound size={13} /> {entry.author?.full_name || entry.author?.username || 'TĂ i khoáº£n Ä‘Ă£ xĂ³a'}</span>
                        <span><Clock3 size={13} /> {formatDate(entry.created_at)}</span>
                        <span>{entry.is_initial ? 'Báº£n ghi ban Ä‘áº§u' : `${entry.changes.length} thay Ä‘á»•i`}</span>
                      </div>
                    </div>
                    <span className={styles.expandIcon}>{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
                  </button>
                  {entry.source === 'revision' && canDelete && (
                    <button
                      type="button"
                      className={styles.restoreBtn}
                      onClick={() => setRestoreTarget(entry)}
                      title="Hoàn tác về phiên bản này"
                      aria-label="Hoàn tác về phiên bản này"
                    >
                      <RotateCcw size={16} />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => setDeleteTarget(entry)}
                      title="XĂ³a báº£n ghi lá»‹ch sá»­"
                      aria-label="XĂ³a báº£n ghi lá»‹ch sá»­"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {expanded && (
                  <div className={styles.details}>
                    {entry.is_initial ? (
                      <p className={styles.initialNote}>ÄĂ¢y lĂ  báº£n ghi ná»™i dung ban Ä‘áº§u khi há»‡ thá»‘ng lá»‹ch sá»­ Ä‘Æ°á»£c kĂ­ch hoáº¡t.</p>
                    ) : entry.changes.length === 0 ? (
                      <p className={styles.initialNote}>KhĂ´ng phĂ¡t hiá»‡n thay Ä‘á»•i dá»¯ liá»‡u trong láº§n lÆ°u nĂ y.</p>
                    ) : (
                      <div className={styles.changeList}>
                        {entry.changes.map((change, index) => (
                          <div className={styles.change} key={`${change.path}-${index}`}>
                            <div className={styles.changeHeader}>
                              <strong>{formatPath(change.path)}</strong>
                              <span className={styles[change.action]}>{actionLabel(change.action)}</span>
                            </div>
                            <div className={styles.values}>
                              {change.action !== 'added' && (
                                <div><small>TrÆ°á»›c</small><pre>{formatValue(change.before, change.path)}</pre></div>
                              )}
                              {change.action !== 'removed' && (
                                <div><small>Sau</small><pre>{formatValue(change.after, change.path)}</pre></div>
                              )}
                            </div>
                          </div>
                        ))}
                        {entry.changes_truncated && (
                          <p className={styles.truncated}>Báº£n ghi cĂ³ quĂ¡ nhiá»u thay Ä‘á»•i; chá»‰ hiá»ƒn thá»‹ 100 thay Ä‘á»•i Ä‘áº§u tiĂªn.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

      <AdminConfirmDialog
        open={!!deleteTarget}
        title="XĂ³a báº£n ghi lá»‹ch sá»­?"
        message="Thao tĂ¡c nĂ y chá»‰ xĂ³a nháº­t kĂ½, khĂ´ng thay Ä‘á»•i ná»™i dung Ä‘ang hiá»ƒn thá»‹ trĂªn website."
        target={deleteTarget ? `${MODULES[deleteTarget.module]?.label || deleteTarget.module} Â· ${deleteTarget.change_summary || `Báº£n ghi #${deleteTarget.source_id}`}` : ''}
        confirmText="XĂ³a báº£n ghi"
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
      <AdminConfirmDialog
        open={!!restoreTarget}
        title="Hoàn tác nội dung CMS?"
        message="Hệ thống sẽ khôi phục nội dung của trang này về đúng phiên bản đã chọn và tạo thêm một bản ghi lịch sử mới. Nội dung hiện tại sẽ bị thay thế."
        target={restoreTarget ? `${MODULES[restoreTarget.module]?.label || restoreTarget.module} · ${restoreTarget.change_summary || `Phiên bản #${restoreTarget.version_number}`}` : ''}
        confirmText="Hoàn tác"
        busy={restoring}
        onCancel={() => setRestoreTarget(null)}
        onConfirm={handleRestore}
      />
      <AdminConfirmDialog
        open={bulkDeleteOpen}
        title="Xoá các bản ghi đã chọn?"
        message="Thao tác này chỉ xoá nhật ký lịch sử, không thay đổi nội dung đang hiển thị trên website."
        target={`${selectedEntries.length} bản ghi lịch sử`}
        confirmText="Xoá đã chọn"
        busy={deleting}
        onCancel={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
      />
    </div>
  )
}
