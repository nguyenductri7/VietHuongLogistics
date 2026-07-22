import { Fragment, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, CheckCircle2, ChevronDown, ChevronLeft,
  ChevronRight, ChevronUp, Clock, Loader2, Mail, MessageSquare,
  Phone, RefreshCw, Search, Trash, Trash2, UserRound, X,
} from 'lucide-react'
import { contactApi } from '../../services/api'
import styles from './AdminFaq.module.scss'
import { useAdminToast } from './AdminToast'

const STATUS = {
  new:      { label: 'Mới',            color: '#f59e0b' },
  read:     { label: 'Đã xem',         color: '#3b82f6' },
  replied:  { label: 'Đã phản hồi',    color: '#10b981' },
  archived: { label: 'Lưu trữ',        color: '#64748b' },
}

const EMPTY_STATS = {
  total: 0,
  new_count: 0,
  read_count: 0,
  replied_count: 0,
  archived_count: 0,
}

const CRM_ACTIONS = [
  { value: 'called', label: 'Đã gọi' },
  { value: 'emailed', label: 'Đã gửi mail' },
  { value: 'missed_call', label: 'Khách không nghe máy' },
  { value: 'closed', label: 'Đã chốt' },
]

const CRM_ACTION_LABEL = CRM_ACTIONS.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {})

const getGmailComposeUrl = ({ to, subject = '', body = '' }) => {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: to || '',
    su: subject,
    body,
  })
  return `https://mail.google.com/mail/?${params.toString()}`
}

export default function AdminContacts() {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState([])
  const [stats, setStats] = useState(EMPTY_STATS)
  const [pagination, setPagination] = useState({ total: 0, page: 1, total_pages: 1 })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deletingBusy, setDeletingBusy] = useState(false)
  const { showToast } = useAdminToast()
const fetchData = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    try {
      const params = { page, limit: 20 }
      if (statusFilter) params.status = statusFilter
      if (search.trim()) params.search = search.trim()

      const [listRes, statsRes] = await Promise.all([
        contactApi.getList(params),
        contactApi.getStats(),
      ])

      setContacts(listRes.data || [])
      setPagination(listRes.pagination || { total: 0, page: 1, total_pages: 1 })
      setStats({ ...EMPTY_STATS, ...(statsRes.data || {}) })
    } catch (error) {
      if (!silent) showToast(error.message || 'Không thể tải danh sách liên hệ.', 'error')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(fetchData, search ? 350 : 0)
    return () => window.clearTimeout(timer)
  }, [page, search, statusFilter])

  useEffect(() => {
    const timer = window.setInterval(() => fetchData({ silent: true }), 30000)
    return () => window.clearInterval(timer)
  }, [page, search, statusFilter])

  const handleSearch = (event) => {
    setSearch(event.target.value)
    setPage(1)
  }

  const handleStatusFilter = (event) => {
    setStatusFilter(event.target.value)
    setPage(1)
  }

  const changeStatus = async (id, status) => {
    setUpdating(id)
    try {
      await contactApi.updateStatus(id, status)
      setContacts(current => current.map(item => item.id === id ? { ...item, status } : item))
      const statsRes = await contactApi.getStats()
      setStats({ ...EMPTY_STATS, ...(statsRes.data || {}) })
      window.dispatchEvent(new Event('vh-admin-notifications-refresh'))
      showToast('Đã cập nhật trạng thái.')
    } catch (error) {
      showToast(error.message || 'Không thể cập nhật trạng thái.', 'error')
    } finally {
      setUpdating(null)
    }
  }

  const updateLocalContact = (id, patch) => {
    setContacts(current => current.map(item => item.id === id ? { ...item, ...patch } : item))
  }

  const saveCrm = async (item, action = item.last_action || '') => {
    setUpdating(item.id)
    try {
      const res = await contactApi.updateCrm(item.id, {
        admin_note: item.admin_note || '',
        last_action: action,
      })
      updateLocalContact(item.id, res.data || { ...item, last_action: action })
      showToast('Đã lưu thông tin xử lý.')
    } catch (error) {
      showToast(error.message || 'Không thể lưu thông tin xử lý.', 'error')
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    setDeletingBusy(true)
    try {
      await contactApi.delete(deleting.id)
      setDeleting(null)
      window.dispatchEvent(new Event('vh-admin-notifications-refresh'))
      showToast('Đã xóa yêu cầu liên hệ.')
      if (contacts.length === 1 && page > 1) setPage(current => current - 1)
      else await fetchData()
    } catch (error) {
      showToast(error.message || 'Không thể xóa yêu cầu.', 'error')
    } finally {
      setDeletingBusy(false)
    }
  }

  const formatDate = (value) => {
    if (!value) return '—'
    return new Date(value).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const statCards = [
    { label: 'Tổng yêu cầu', value: stats.total, icon: MessageSquare, color: '#64748b' },
    { label: 'Yêu cầu mới', value: stats.new_count, icon: Clock, color: '#f59e0b' },
    { label: 'Đã xem', value: stats.read_count, icon: UserRound, color: '#3b82f6' },
    { label: 'Đã phản hồi', value: stats.replied_count, icon: CheckCircle2, color: '#10b981' },
  ]

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <MessageSquare size={20} /> Yêu cầu liên hệ
          </h1>
        </div>
        <button className={styles.refreshBtn} onClick={fetchData} disabled={loading}>
          <RefreshCw size={14} /> Làm mới
        </button>
      </div>

      <div className={styles.statsRow}>
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: `${color}18`, color }}>
              <Icon size={18} />
            </div>
            <div>
              <p className={styles.statVal}>{Number(value) || 0}</p>
              <p className={styles.statLabel}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input
            className={styles.search}
            placeholder="Tìm theo tên, SĐT, email, nội dung..."
            value={search}
            onChange={handleSearch}
          />
          {search && (
            <button className={styles.clearBtn} onClick={() => { setSearch(''); setPage(1) }}>
              <X size={12} />
            </button>
          )}
        </div>

        <select className={styles.select} value={statusFilter} onChange={handleStatusFilter}>
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS).map(([value, item]) => (
            <option key={value} value={value}>{item.label}</option>
          ))}
        </select>
      </div>

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loadingBox}>
            <Loader2 size={16} className={styles.spinIcon} /> Đang tải...
          </div>
        ) : contacts.length === 0 ? (
          <div className={styles.empty}>
            <MessageSquare size={36} strokeWidth={1.2} />
            <p>Chưa có yêu cầu liên hệ phù hợp</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Nội dung</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(item => {
                const expanded = expandedId === item.id
                const status = STATUS[item.status] || STATUS.new
                return (
                  <Fragment key={item.id}>
                    <tr
                      className={`${styles.row} ${expanded ? styles.rowExpanded : ''}`}
                      onClick={() => setExpandedId(expanded ? null : item.id)}
                    >
                      <td>
                        <div className={styles.customer}>
                          <div className={styles.avatar}>{item.full_name?.charAt(0)?.toUpperCase() || '?'}</div>
                          <div>
                            <p className={styles.customerName}>{item.full_name}</p>
                            <a href={`tel:${item.phone}`} className={styles.customerPhone} onClick={e => e.stopPropagation()}>
                              <Phone size={11} /> {item.phone || 'Chưa có SĐT'}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className={styles.tdQuestion}>
                        <span className={styles.questionPreview}>{item.message}</span>
                      </td>
                      <td className={styles.tdTime}>{formatDate(item.created_at)}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <select
                          className={styles.statusSelect}
                          value={item.status || 'new'}
                          style={{ color: status.color, borderColor: `${status.color}66` }}
                          disabled={updating === item.id}
                          onChange={e => changeStatus(item.id, e.target.value)}
                        >
                          {Object.entries(STATUS).map(([value, option]) => (
                            <option key={value} value={value}>{option.label}</option>
                          ))}
                        </select>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <div className={styles.actions}>
                          <button
                            className={styles.expandBtn}
                            onClick={() => setExpandedId(expanded ? null : item.id)}
                            title={expanded ? 'Thu gọn' : 'Xem đầy đủ'}
                          >
                            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                          <button className={styles.delBtn} onClick={() => setDeleting(item)}>
                            <Trash2 size={13} /> Xóa
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expanded && (
                      <tr className={styles.expandedRow}>
                        <td colSpan={5}>
                          <div className={styles.expandedBox}>
                            <p className={styles.expandedLabel}>Thông tin khách hàng</p>
                            <p className={styles.expandedText}>
                              {item.email ? (
                                <>
                                  <Mail size={13} />{' '}
                                  <a
                                    href={getGmailComposeUrl({
                                      to: item.email,
                                      subject: `Phản hồi từ Việt Hương Logistics - liên hệ #${item.id}`,
                                      body: `Chào ${item.full_name || 'quý khách'},\n\nViệt Hương Logistics đã nhận được yêu cầu tư vấn của bạn và xin phản hồi như sau:\n\n`,
                                    })}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {item.email}
                                  </a>
                                  <br />
                                </>
                              ) : null}
                              {item.company ? <>Công ty: {item.company}<br /></> : null}
                              Gửi lúc: {formatDate(item.created_at)}
                            </p>
                            <p className={styles.expandedLabel} style={{ marginTop: 14 }}>Nội dung yêu cầu</p>
                            <p className={styles.expandedText} style={{ whiteSpace: 'pre-wrap' }}>{item.message}</p>
                            {item.last_action ? (
                              <p className={styles.expandedText}>
                                Xử lý gần nhất: {CRM_ACTION_LABEL[item.last_action] || item.last_action}
                                {item.last_action_at ? ` - ${formatDate(item.last_action_at)}` : ''}
                              </p>
                            ) : null}
                            <p className={styles.expandedLabel} style={{ marginTop: 14 }}>CRM nội bộ</p>
                            <div className={styles.crmPanel} onClick={event => event.stopPropagation()}>
                              <div className={styles.crmActions}>
                                {CRM_ACTIONS.map(action => (
                                  <button
                                    key={action.value}
                                    type="button"
                                    className={`${styles.crmActionBtn} ${item.last_action === action.value ? styles.crmActionActive : ''}`}
                                    disabled={updating === item.id}
                                    onClick={() => saveCrm(item, action.value)}
                                  >
                                    {action.label}
                                  </button>
                                ))}
                              </div>
                              <textarea
                                className={styles.crmNote}
                                rows={3}
                                placeholder="Ghi chú nội bộ: đã gọi lúc nào, khách yêu cầu gì, bước tiếp theo..."
                                value={item.admin_note || ''}
                                onChange={event => updateLocalContact(item.id, { admin_note: event.target.value })}
                              />
                              <button
                                type="button"
                                className={styles.replyLink}
                                disabled={updating === item.id}
                                onClick={() => saveCrm(item)}
                              >
                                Lưu ghi chú
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {pagination.total_pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 18 }}>
          <button
            className={styles.refreshBtn}
            disabled={page <= 1 || loading}
            onClick={() => setPage(current => current - 1)}
          >
            <ChevronLeft size={14} /> Trang trước
          </button>
          <span style={{ color: '#64748b', fontSize: 13 }}>
            Trang {pagination.page} / {pagination.total_pages}
          </span>
          <button
            className={styles.refreshBtn}
            disabled={page >= pagination.total_pages || loading}
            onClick={() => setPage(current => current + 1)}
          >
            Trang sau <ChevronRight size={14} />
          </button>
        </div>
      )}

      {deleting && (
        <div className={styles.overlay} onClick={() => !deletingBusy && setDeleting(null)}>
          <div className={styles.confirmModal} onClick={event => event.stopPropagation()}>
            <div className={styles.confirmIcon}><Trash size={28} /></div>
            <h3>Xóa yêu cầu liên hệ?</h3>
            <p>Yêu cầu của <strong>“{deleting.full_name}”</strong> sẽ bị xóa vĩnh viễn.</p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} disabled={deletingBusy} onClick={() => setDeleting(null)}>Hủy</button>
              <button className={styles.deleteConfirmBtn} disabled={deletingBusy} onClick={handleDelete}>
                {deletingBusy ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
