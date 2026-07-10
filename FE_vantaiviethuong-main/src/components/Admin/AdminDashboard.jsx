// src/components/Admin/AdminDashboard.jsx
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  Home, Info, Truck, HelpCircle, Newspaper,
  Phone, Settings, Users, MessageSquare, LogOut, ChevronRight, LayoutDashboard, Building2,
  FileText, UserRound
} from 'lucide-react'
import styles from './AdminDashboard.module.scss'
import logo from '../../assets/VIET HUONG LOGISTICS.png'
import { contactApi } from '../../services/api'
const cards = [
  { icon: Home,          label: 'Trang chủ',        desc: 'Hero, banner, nội dung chính',              color: '#2563EB', to: '/admin/home'  },
  { icon: Info,          label: 'Giới thiệu',        desc: 'Chỉnh sửa nội dung trang About',            color: '#DC2626', to: '/admin/about'     },
  { icon: Truck,         label: 'Dịch vụ',           desc: 'Quản lý banner, danh sách dịch vụ, quy trình', color: '#0ea5e9', to: '/admin/services'  },
  { icon: HelpCircle,    label: 'Giải đáp',          desc: 'Quản lý câu hỏi khách gửi',                color: '#7c3aed', to: '/admin/faq'       },
  { icon: FileText,      label: 'Nội dung FAQ',      desc: 'Chỉnh sửa danh mục & câu hỏi hiển thị trên trang FAQ', color: '#9333ea', to: '/admin/faq-content' },
  { icon: Newspaper,     label: 'Tin tức / Blog',    desc: 'Đăng và chỉnh sửa bài viết',               color: '#d97706', to: '/admin/blogs'     },
  { icon: Building2,     label: 'Văn phòng & Chi nhánh', desc: 'Thêm, sửa, xóa địa điểm trên trang khách hàng', color: '#0f766e', to: '/admin/branches' },
  { icon: Phone,         label: 'Liên hệ',           desc: 'Xem yêu cầu từ khách hàng',                color: '#059669', to: '/admin/contacts'  },
  { icon: UserRound,     label: 'Hồ sơ Admin',       desc: 'Cập nhật thông tin và đổi mật khẩu',          color: '#be123c', to: '/admin/profile'  },
]

const navItems = [
  { icon: LayoutDashboard, label: 'Tổng quan',    to: '/admin'           },
  { icon: Home,            label: 'Trang chủ',    to: '/admin/home'  },
  { icon: Info,            label: 'Giới thiệu',   to: '/admin/about'     },
  { icon: Truck,           label: 'Dịch vụ',      to: '/admin/services'  },
  { icon: HelpCircle,      label: 'Giải đáp',     to: '/admin/faq'       },
  { icon: FileText,        label: 'Nội dung FAQ', to: '/admin/faq-content' },
  { icon: Newspaper,       label: 'Tin tức',       to: '/admin/blogs'     },
  { icon: Building2,       label: 'Chi nhánh',      to: '/admin/branches'  },
  { icon: Phone,           label: 'Liên hệ',      to: '/admin/contacts'  },
  { icon: UserRound,       label: 'Hồ sơ Admin',    to: '/admin/profile'  },

]

export default function AdminDashboard() {
  const { user, logout } = useAuth()
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

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={styles.page}>
      {/* Sidebar */}
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
                className={styles.navItem}
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
            <div className={styles.avatar}>{user?.full_name?.[0] || 'A'}</div>
            <div>
              <div className={styles.userName}>{user?.full_name || user?.username}</div>
              <div className={styles.userRole}>{user?.role}</div>
            </div>
          </button>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={15} strokeWidth={1.8} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <div className={styles.topBar}>
          <div>
            <p className={styles.topBarSub}>Chào mừng trở lại</p>
            <h1 className={styles.pageTitle}>
              {user?.full_name || user?.username}
            </h1>
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

      
      </main>
    </div>
  )
}
