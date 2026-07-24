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
  home: { label: 'Trang chủ', tone: 'red' },
  about: { label: 'Trang giới thiệu', tone: 'blue' },
  services: { label: 'Trang dịch vụ', tone: 'green' },
  faq: { label: 'Quản lý giải đáp', tone: 'orange' },
  faq_content: { label: 'Nội dung FAQ', tone: 'purple' },
  blogs: { label: 'Tin tức', tone: 'cyan' },
  branches: { label: 'Chi nhánh', tone: 'pink' },
  contacts: { label: 'Liên hệ', tone: 'gray' },
}

const FIELD_LABELS = {
  hero: 'Hero đầu trang',
  about_intro: 'Giới thiệu trên trang chủ',
  services_section: 'Giải pháp vận tải',
  partners_section: 'Đối tác và đánh giá',
  contact_section: 'Thông tin liên hệ',
  footer: 'Chân trang',
  partners: 'Đối tác',
  stats: 'Số liệu thống kê',
  identity: 'Giới thiệu công ty',
  services: 'Dịch vụ',
  timeline: 'Lịch sử hình thành',
  values_section: 'Giá trị cốt lõi',
  banner: 'Banner',
  process_steps: 'Các bước quy trình',
  contact_info: 'Thông tin liên hệ',
  service_items: 'Danh sách dịch vụ',
  detail_content: 'Nội dung trang chi tiết',
  highlights: 'Số liệu nổi bật',
  features: 'Lợi ích và đặc điểm',
  eyebrow: 'Nhãn nhỏ',
  title_prefix: 'Tiêu đề mở đầu',
  cta_label: 'Chữ trên nút',
  cta_link: 'Liên kết nút',
  hero_cta_label: 'Nút đặt dịch vụ trên Hero',
  form_title_prefix: 'Tiêu đề biểu mẫu',
  form_description: 'Mô tả biểu mẫu',
  num: 'Giá trị',
  title: 'Tiêu đề',
  subtitle: 'Phụ đề',
  description: 'Mô tả',
  name: 'Tên',
  company: 'Công ty',
  quote: 'Nội dung đánh giá',
  image: 'Hình ảnh',
  image_url: 'Hình ảnh',
  avatar_url: 'Ảnh khách hàng',
  logo_url: 'Logo',
  website_url: 'Website',
  is_active: 'Trạng thái hiển thị',
  enabled: 'Bật/tắt section',
  sort_order: 'Thứ tự',
  icon_key: 'Icon',
  icon_url: 'Icon upload',
  tags: 'Thẻ nội dung',
  phone: 'Điện thoại',
  email: 'Email',
  address: 'Địa chỉ',
  hotline: 'Hotline',
  question: 'Câu hỏi',
  answer: 'Câu trả lời',
  label: 'Tên danh mục',
  key: 'Mã danh mục',
  category_id: 'Danh mục',
  status: 'Trạng thái',
  content: 'Nội dung',
  excerpt: 'Mô tả ngắn',
  category: 'Chuyên mục',
  author: 'Tác giả',
  is_featured: 'Bài viết nổi bật',
  published_at: 'Ngày đăng',
  full_name: 'Họ và tên',
  message: 'Nội dung liên hệ',
  lat: 'Vĩ độ',
  lng: 'Kinh độ',
  is_headquarter: 'Trụ sở chính',
  admin_note: 'Ghi chú nội bộ',
  last_action: 'Hành động CRM',
  last_action_at: 'Thời gian xử lý CRM',
}

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Không xác định'
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
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
    .join(' › ')
}

function formatValue(value, path = '') {
  if (value === null || value === undefined || value === '') return 'Trống'
  const isFlag = /(?:^|\.)(?:is_active|enabled|show_[^.]+)$/.test(path)
  if (value === true || (isFlag && value === 1)) return 'Bật / Hiển thị'
  if (value === false || (isFlag && value === 0)) return 'Tắt / Ẩn'
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

function actionLabel(action) {
  if (action === 'added') return 'Đã thêm'
  if (action === 'removed') return 'Đã xoá'
  return 'Đã cập nhật'
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
      showToast(error.message || 'Không thể tải lịch sử chỉnh sửa.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadHistory() }, [moduleFilter])

  const selectedEntries = useMemo(
    () => entries.filter(entry => selectedKeys.has(getEntryKey(entry))),
    [entries, selectedKeys],
  )

  const counts = useMemo(() => entries.reduce((result, entry) => {
    result[entry.module] = (result[entry.module] || 0) + 1
    return result
  }, {}), [entries])

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
      showToast(response.message || 'Đã xoá bản ghi lịch sử.', 'success')
    } catch (error) {
      showToast(error.message || 'Không thể xoá bản ghi lịch sử.', 'error')
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
      showToast(response.message || 'Đã xoá các bản ghi đã chọn.', 'success')
    } catch (error) {
      showToast(error.message || 'Không thể xoá các bản ghi đã chọn.', 'error')
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
      showToast(response.message || 'Đã hoàn tác nội dung CMS.', 'success')
      await loadHistory()
    } catch (error) {
      showToast(error.message || 'Không thể hoàn tác bản ghi này.', 'error')
    } finally {
      setRestoring(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.intro}>
        <div>
          <div className={styles.eyebrow}><FileClock size={16} /> Nhật ký nội dung</div>
          <h2>Lịch sử chỉnh sửa CMS</h2>
          <p>Theo dõi ai đã cập nhật nội dung, thời gian cập nhật và những thông tin đã thay đổi.</p>
        </div>
        <button type="button" className={styles.refreshBtn} onClick={loadHistory} disabled={loading}>
          <RefreshCw size={16} className={loading ? styles.spin : ''} /> Làm mới
        </button>
      </div>

      <div className={styles.toolbar}>
        <label className={styles.filter}>
          <Filter size={16} />
          <span>Trang quản lý</span>
          <select value={moduleFilter} onChange={event => setModuleFilter(event.target.value)}>
            <option value="">Tất cả các trang</option>
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
        <div className={styles.state}>
          <Loader2 size={24} className={styles.spin} /> Đang tải lịch sử...
        </div>
      ) : entries.length === 0 ? (
        <div className={styles.state}>
          <FileClock size={34} />
          <strong>Chưa có lịch sử chỉnh sửa</strong>
          <span>Lịch sử sẽ xuất hiện sau lần lưu nội dung tiếp theo.</span>
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
                      <strong>{entry.change_summary || 'Cập nhật nội dung'}</strong>
                      <div className={styles.meta}>
                        <span><UserRound size={13} /> {entry.author?.full_name || entry.author?.username || 'Tài khoản đã xoá'}</span>
                        <span><Clock3 size={13} /> {formatDate(entry.created_at)}</span>
                        <span>{entry.is_initial ? 'Bản ghi ban đầu' : `${entry.changes.length} thay đổi`}</span>
                      </div>
                    </div>
                    <span className={styles.expandIcon}>{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
                  </button>
                  {entry.source === 'revision' && !entry.is_initial && canDelete && (
                    <button
                      type="button"
                      className={styles.restoreBtn}
                      onClick={(event) => {
                        event.stopPropagation()
                        setRestoreTarget(entry)
                      }}
                      title="Hoàn tác thay đổi này"
                      aria-label="Hoàn tác thay đổi này"
                    >
                      <RotateCcw size={16} />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={(event) => {
                        event.stopPropagation()
                        setDeleteTarget(entry)
                      }}
                      title="Xoá bản ghi lịch sử"
                      aria-label="Xoá bản ghi lịch sử"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {expanded && (
                  <div className={styles.details}>
                    {entry.is_initial ? (
                      <p className={styles.initialNote}>Đây là bản ghi nội dung ban đầu khi hệ thống lịch sử được kích hoạt.</p>
                    ) : entry.changes.length === 0 ? (
                      <p className={styles.initialNote}>Không phát hiện thay đổi dữ liệu trong lần lưu này.</p>
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
                                <div><small>Trước</small><pre>{formatValue(change.before, change.path)}</pre></div>
                              )}
                              {change.action !== 'removed' && (
                                <div><small>Sau</small><pre>{formatValue(change.after, change.path)}</pre></div>
                              )}
                            </div>
                          </div>
                        ))}
                        {entry.changes_truncated && (
                          <p className={styles.truncated}>Bản ghi có quá nhiều thay đổi; chỉ hiển thị 100 thay đổi đầu tiên.</p>
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
        title="Xoá bản ghi lịch sử?"
        message="Thao tác này chỉ xoá nhật ký, không thay đổi nội dung đang hiển thị trên website."
        target={deleteTarget ? `${MODULES[deleteTarget.module]?.label || deleteTarget.module} · ${deleteTarget.change_summary || `Bản ghi #${deleteTarget.source_id}`}` : ''}
        confirmText="Xoá bản ghi"
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
      <AdminConfirmDialog
        open={!!restoreTarget}
        title="Hoàn tác thay đổi này?"
        message="Hệ thống sẽ khôi phục nội dung của trang này về phiên bản ngay trước lần chỉnh sửa đã chọn và tạo thêm một bản ghi lịch sử mới. Nội dung hiện tại sẽ bị thay thế."
        target={restoreTarget ? `${MODULES[restoreTarget.module]?.label || restoreTarget.module} · ${restoreTarget.change_summary || `Thay đổi #${restoreTarget.version_number}`}` : ''}
        confirmText="Hoàn tác"
        variant="restore"
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
