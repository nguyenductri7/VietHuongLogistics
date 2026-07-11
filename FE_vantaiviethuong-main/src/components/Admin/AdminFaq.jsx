// src/components/Admin/AdminFaq.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HelpCircle, Search, ArrowLeft, Trash2, Trash,
  ChevronDown, ChevronUp, Phone, X, Loader2,
  Clock, CheckCircle2, RefreshCw, MessageSquare,
} from 'lucide-react'
import { faqApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import styles from './AdminFaq.module.scss'
import { useAdminToast } from './AdminToast'

const STATUS = {
  pending:    { label: 'Chờ xử lý',   color: '#f59e0b' },
  inprogress: { label: 'Đang xử lý',  color: '#3b82f6' },
  done:       { label: 'Đã xử lý',    color: '#10b981' },
}

export default function AdminFaq() {
  const { showToast } = useAdminToast()
  const { logout } = useAuth()
  const navigate   = useNavigate()

  const [inquiries, setInquiries]       = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [expandedId, setExpandedId]     = useState(null)
  const [deleting, setDeleting]         = useState(null)
  const [updating, setUpdating]         = useState(null)

  // ── Fetch ─────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true)
    try {
      const params = {}
      if (statusFilter) params.status = statusFilter
      if (search)       params.search = search
      const res = await faqApi.getList(params)          // ← faqApi.getList
      setInquiries(res.data || res)
    } catch (err) {
      showToast(err.message || 'Lỗi tải dữ liệu', 'error')
      if (err.message?.includes('Token')) { logout(); navigate('/login') }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [statusFilter])
  useEffect(() => {
    const t = setTimeout(() => fetchData(), 400)
    return () => clearTimeout(t)
  }, [search])

  // ── Toast ──────────────────────────────────────────────────────

  // ── Change status ──────────────────────────────────────────────
  const changeStatus = async (id, status) => {
    setUpdating(id)
    try {
      await faqApi.updateStatus(id, status)             // ← faqApi.updateStatus
      setInquiries(prev =>
        prev.map(i => i.id === id ? { ...i, status } : i)
      )
      showToast('Cập nhật trạng thái thành công!')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setUpdating(null)
    }
  }

  // ── Delete ─────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleting) return
    try {
      await faqApi.delete(deleting.id)                  // ← faqApi.delete
      showToast('Đã xóa câu hỏi!')
      setDeleting(null)
      fetchData()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  // ── Stats ──────────────────────────────────────────────────────
  const stats = {
    total:      inquiries.length,
    pending:    inquiries.filter(i => i.status === 'pending').length,
    inprogress: inquiries.filter(i => i.status === 'inprogress').length,
    done:       inquiries.filter(i => i.status === 'done').length,
  }

  const formatDate = (str) => {
    if (!str) return '—'
    return new Date(str).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  // ── Filtered list ──────────────────────────────────────────────
  const filtered = inquiries.filter(item => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      item.name?.toLowerCase().includes(q) ||
      item.phone?.toLowerCase().includes(q) ||
      item.question?.toLowerCase().includes(q)
    )
  })

  // ══════════════════════════════════════════════════════════════
  return (
    <div className={styles.page}>

      {/* Toast */}

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <HelpCircle size={20} /> Thắc mắc khách hàng
          </h1>
        </div>
        <button className={styles.refreshBtn} onClick={fetchData}>
          <RefreshCw size={14} /> Làm mới
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        {[
          { label: 'Tổng câu hỏi',  value: stats.total,      icon: MessageSquare, color: '#64748b' },
          { label: 'Chờ xử lý',     value: stats.pending,    icon: Clock,         color: '#f59e0b' },
          { label: 'Đang xử lý',    value: stats.inprogress, icon: RefreshCw,     color: '#3b82f6' },
          { label: 'Đã xử lý xong', value: stats.done,       icon: CheckCircle2,  color: '#10b981' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: color + '18', color }}>
              <Icon size={18} />
            </div>
            <div>
              <p className={styles.statVal}>{value}</p>
              <p className={styles.statLabel}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input
            className={styles.search}
            placeholder="Tìm theo tên, SĐT, nội dung..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.clearBtn} onClick={() => setSearch('')}>
              <X size={12} />
            </button>
          )}
        </div>

        <select
          className={styles.select}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS).map(([val, { label }]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loadingBox}>
            <Loader2 size={16} className={styles.spinIcon} /> Đang tải...
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <MessageSquare size={36} strokeWidth={1.2} />
            <p>Chưa có câu hỏi nào</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Nội dung câu hỏi</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const expanded = expandedId === item.id
                const st = STATUS[item.status] || STATUS.pending
                return (
                  <>
                    <tr
                      key={item.id}
                      className={`${styles.row} ${expanded ? styles.rowExpanded : ''}`}
                      onClick={() => setExpandedId(expanded ? null : item.id)}
                    >
                      {/* Customer */}
                      <td>
                        <div className={styles.customer}>
                          <div className={styles.avatar}>
                            {item.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className={styles.customerName}>{item.name}</p>
                            <a
                              href={`tel:${item.phone}`}
                              className={styles.customerPhone}
                              onClick={e => e.stopPropagation()}
                            >
                              <Phone size={11} /> {item.phone}
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Question */}
                      <td className={styles.tdQuestion}>
                        <span className={styles.questionPreview}>{item.question}</span>
                      </td>

                      {/* Time */}
                      <td className={styles.tdTime}>
                        {formatDate(item.created_at || item.createdAt)}
                      </td>

                      {/* Status select */}
                      <td onClick={e => e.stopPropagation()}>
                        <select
                          className={styles.statusSelect}
                          value={item.status || 'pending'}
                          style={{ color: st.color, borderColor: st.color + '66' }}
                          disabled={updating === item.id}
                          onChange={e => changeStatus(item.id, e.target.value)}
                        >
                          {Object.entries(STATUS).map(([val, { label }]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td onClick={e => e.stopPropagation()}>
                        <div className={styles.actions}>
                          <button
                            className={styles.expandBtn}
                            onClick={() => setExpandedId(expanded ? null : item.id)}
                            title={expanded ? 'Thu gọn' : 'Xem đầy đủ'}
                          >
                            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                          <button
                            className={styles.delBtn}
                            onClick={() => setDeleting(item)}
                          >
                            <Trash2 size={13} /> Xóa
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded row */}
                    {expanded && (
                      <tr key={`${item.id}-exp`} className={styles.expandedRow}>
                        <td colSpan={5}>
                          <div className={styles.expandedBox}>
                            <p className={styles.expandedLabel}>Nội dung đầy đủ</p>
                            <p className={styles.expandedText}>{item.question}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleting && (
        <div className={styles.overlay} onClick={() => setDeleting(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <div className={styles.confirmIcon}><Trash size={28} /></div>
            <h3>Xóa câu hỏi?</h3>
            <p>Câu hỏi của <strong>"{deleting.name}"</strong> sẽ bị xóa vĩnh viễn.</p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleting(null)}>Hủy</button>
              <button className={styles.deleteConfirmBtn} onClick={handleDelete}>Xóa vĩnh viễn</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
