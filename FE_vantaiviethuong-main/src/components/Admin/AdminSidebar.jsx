import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Building2, FileText, HelpCircle, Home, Info, LayoutDashboard,
  LogOut, Newspaper, Phone, Truck,
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
]

export default function AdminSidebar() {
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
    <aside className={styles.sidebar}>
      <div className={styles.sidebarLogo}>
        <img src={logo} alt="Việt Hương Logistics" />
        <span>Admin Panel</span>
      </div>

      <nav className={styles.sideNav}>
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.to}
              className={`${styles.navItem} ${isActive(item.to) ? styles.active : ''}`}
              onClick={() => navigate(item.to)}
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
          <div>
            <div className={styles.userName}>{user?.full_name || user?.username}</div>
            <div className={styles.userRole}>{user?.role || 'Admin'}</div>
          </div>
        </button>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={15} strokeWidth={1.8} />
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
