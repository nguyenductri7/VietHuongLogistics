// src/components/Admin/AdminDashboard.jsx
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  Building2, ChevronRight, FileText, HelpCircle, Home,
  Info, Newspaper, Phone, Truck,
} from 'lucide-react'
import { contactApi } from '../../services/api'
import styles from './AdminDashboard.module.scss'

const cards = [
  { icon: Home, label: 'Trang chủ', desc: 'Hero, banner, nội dung chính', color: '#2563EB', to: '/admin/home' },
  { icon: Info, label: 'Giới thiệu', desc: 'Chỉnh sửa nội dung trang About', color: '#DC2626', to: '/admin/about' },
  { icon: Truck, label: 'Dịch vụ', desc: 'Quản lý banner, danh sách dịch vụ, quy trình', color: '#0ea5e9', to: '/admin/services' },
  { icon: HelpCircle, label: 'Giải đáp', desc: 'Quản lý câu hỏi khách gửi', color: '#7c3aed', to: '/admin/faq' },
  { icon: FileText, label: 'Nội dung FAQ', desc: 'Chỉnh sửa danh mục & câu hỏi hiển thị trên trang FAQ', color: '#9333ea', to: '/admin/faq-content' },
  { icon: Newspaper, label: 'Tin tức / Blog', desc: 'Đăng và chỉnh sửa bài viết', color: '#d97706', to: '/admin/blogs' },
  { icon: Building2, label: 'Văn phòng & Chi nhánh', desc: 'Thêm, sửa, xóa địa điểm trên trang khách hàng', color: '#0f766e', to: '/admin/branches' },
  { icon: Phone, label: 'Liên hệ', desc: 'Xem yêu cầu từ khách hàng', color: '#059669', to: '/admin/contacts' },
]

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [newContacts, setNewContacts] = useState(0)

  useEffect(() => {
    let alive = true

    const loadContactStats = async () => {
      try {
        const res = await contactApi.getStats()
        if (alive) setNewContacts(Number(res?.data?.new_count) || 0)
      } catch {
        if (alive) setNewContacts(0)
      }
    }

    loadContactStats()
    const timer = window.setInterval(loadContactStats, 30000)

    return () => {
      alive = false
      window.clearInterval(timer)
    }
  }, [])

  return (
    <div className={styles.main}>
      <div className={styles.topBar}>
        <div>
          <p className={styles.topBarSub}>Chào mừng trở lại</p>
          <h2 className={styles.pageTitle}>{user?.full_name || user?.username}</h2>
        </div>
        <div className={styles.topBarRight}>
          <span className={styles.roleBadge}>{user?.role || 'Admin'}</span>
        </div>
      </div>

      <div className={styles.sectionLabel}>Quản lý nội dung</div>

      <div className={styles.grid}>
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <button
              key={c.to}
              className={styles.card}
              onClick={() => navigate(c.to)}
              style={{ '--accent': c.color }}
            >
              <div className={styles.cardIconWrap} style={{ background: `${c.color}14` }}>
                <Icon size={22} color={c.color} strokeWidth={1.8} />
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardLabel}>
                  {c.label}
                  {c.to === '/admin/contacts' && newContacts > 0 && (
                    <span className={styles.cardBadge}>{newContacts > 99 ? '99+' : `${newContacts} mới`}</span>
                  )}
                </div>
                <div className={styles.cardDesc}>{c.desc}</div>
              </div>
              <ChevronRight size={16} className={styles.cardArrow} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
