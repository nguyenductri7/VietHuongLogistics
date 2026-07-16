import { useEffect, useMemo, useState } from 'react'
import {
  ChevronDown, ChevronUp, Clock3, FileClock, Filter, Loader2, RefreshCw, UserRound,
} from 'lucide-react'
import { cmsHistoryApi } from '../../services/api'
import { useAdminToast } from './AdminToast'
import styles from './AdminCmsHistory.module.scss'

const MODULES = {
  home: { label: 'Trang chủ', tone: 'red' },
  about: { label: 'Trang giới thiệu', tone: 'blue' },
  services: { label: 'Trang dịch vụ', tone: 'green' },
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
}

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Không xác định'
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
  if (action === 'removed') return 'Đã xóa'
  return 'Đã cập nhật'
}

export default function AdminCmsHistory() {
  const { showToast } = useAdminToast()
  const [entries, setEntries] = useState([])
  const [moduleFilter, setModuleFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  const loadHistory = async () => {
    setLoading(true)
    try {
      const response = await cmsHistoryApi.getList({ module: moduleFilter, limit: 100 })
      setEntries(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      showToast(error.message || 'Không thể tải lịch sử chỉnh sửa.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadHistory() }, [moduleFilter])

  const counts = useMemo(() => entries.reduce((result, entry) => {
    result[entry.module] = (result[entry.module] || 0) + 1
    return result
  }, {}), [entries])

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
        <span className={styles.total}>{entries.length} bản ghi gần nhất</span>
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
        <div className={styles.state}><Loader2 size={24} className={styles.spin} /> Đang tải lịch sử...</div>
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
            return (
              <article className={styles.entry} key={entry.id}>
                <button
                  type="button"
                  className={styles.entryMain}
                  onClick={() => setExpandedId(expanded ? null : entry.id)}
                >
                  <span className={`${styles.moduleBadge} ${styles[module.tone]}`}>{module.label}</span>
                  <div className={styles.entryContent}>
                    <strong>{entry.change_summary || 'Cập nhật nội dung'}</strong>
                    <div className={styles.meta}>
                      <span><UserRound size={13} /> {entry.author?.full_name || entry.author?.username || 'Tài khoản đã xóa'}</span>
                      <span><Clock3 size={13} /> {formatDate(entry.created_at)}</span>
                      <span>{entry.is_initial ? 'Bản ghi ban đầu' : `${entry.changes.length} thay đổi`}</span>
                    </div>
                  </div>
                  <span className={styles.expandIcon}>{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
                </button>

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
    </div>
  )
}
