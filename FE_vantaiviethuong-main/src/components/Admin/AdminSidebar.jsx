import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Building2, FileText, HelpCircle, Home, Info, LayoutDashboard,
  History, LogOut, Newspaper, PanelLeftClose, PanelLeftOpen, Phone, Truck,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { contactApi } from '../../services/api'
import logo from '../../assets/VIET HUONG LOGISTICS.png'
import styles from './AdminSidebar.module.scss'

const navItems = [
  { icon: LayoutDashboard, label: 'Tổng quan', to: '/admin' },
  { icon: Home, label: 'Trang chủ', to: '/admin/home' },
  { icon: Info, label: 'Giới thiệu', to: '/admin/about' },
  { icon: Truck, label: 'Dịch vụ', to: '/admin/services' },
  { icon: HelpCircle, label: 'Giải đáp', to: '/admin/faq' },
  { icon: FileText, label: 'Nội dung FAQ', to: '/admin/faq-content' },
  { icon: Newspaper, label: 'Tin tức', to: '/admin/blogs' },
  { icon: Building2, label: 'Chi nhánh', to: '/admin/branches' },
  { icon: Phone, label: 'Liên hệ', to: '/admin/contacts' },
  { icon: History, label: 'Lịch sử chỉnh sửa', to: '/admin/history' },
]

export default function AdminSidebar({ collapsed = false, onToggleCollapse }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
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

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const isActive = (to) => (
    to === '/admin'
      ? location.pathname === '/admin'
      : location.pathname === to || location.pathname.startsWith(`${to}/`)
  )

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.sidebarLogo}>
        <img src={logo} alt="Việt Hương Logistics" />
        <span>Admin Panel</span>
        <button
          type="button"
          className={styles.collapseBtn}
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <nav className={styles.sideNav}>
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.to}
              className={`${styles.navItem} ${isActive(item.to) ? styles.active : ''}`}
              onClick={() => navigate(item.to)}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={16} strokeWidth={1.8} />
              <span className={styles.navLabel}>{item.label}</span>
              {item.to === '/admin/contacts' && newContacts > 0 && (
                <span className={styles.navBadge}>{newContacts > 99 ? '99+' : newContacts}</span>
              )}
            </button>
          )
        })}
      </nav>

      <div className={styles.sideFooter}>
        <button className={styles.userInfo} onClick={() => navigate('/admin/profile')}>
          <div className={styles.avatar}>{user?.full_name?.[0] || user?.username?.[0] || 'A'}</div>
          <div className={styles.userText}>
            <div className={styles.userName}>{user?.full_name || user?.username}</div>
            <div className={styles.userRole}>{user?.role || 'Admin'}</div>
          </div>
        </button>
        <button className={styles.logoutBtn} onClick={handleLogout} title={collapsed ? 'Đăng xuất' : undefined}>
          <LogOut size={15} strokeWidth={1.8} />
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
