// src/components/Admin/AdminDashboard.jsx
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  Home, Info, Truck, HelpCircle, Newspaper,
  Phone, Settings, Users, MessageSquare, LogOut, ChevronRight, LayoutDashboard,
  FileText   // ← thêm icon mới cho "Nội dung FAQ"
} from 'lucide-react'
import styles from './AdminDashboard.module.scss'
import logo from '../../assets/VIET HUONG LOGISTICS.png'
const cards = [
  { icon: Home,          label: 'Trang chủ',        desc: 'Hero, banner, nội dung chính',              color: '#2563EB', to: '/admin/home'  },
  { icon: Info,          label: 'Giới thiệu',        desc: 'Chỉnh sửa nội dung trang About',            color: '#DC2626', to: '/admin/about'     },
  { icon: Truck,         label: 'Dịch vụ',           desc: 'Quản lý banner, danh sách dịch vụ, quy trình', color: '#0ea5e9', to: '/admin/services'  },
  { icon: HelpCircle,    label: 'Giải đáp',          desc: 'Quản lý câu hỏi khách gửi',                color: '#7c3aed', to: '/admin/faq'       },
  { icon: FileText,      label: 'Nội dung FAQ',      desc: 'Chỉnh sửa danh mục & câu hỏi hiển thị trên trang FAQ', color: '#9333ea', to: '/admin/faq-content' },
  { icon: Newspaper,     label: 'Tin tức / Blog',    desc: 'Đăng và chỉnh sửa bài viết',               color: '#d97706', to: '/admin/blogs'     },
  { icon: Phone,         label: 'Liên hệ',           desc: 'Xem yêu cầu từ khách hàng',                color: '#059669', to: '/admin/contacts'  },
]

const navItems = [
  { icon: LayoutDashboard, label: 'Tổng quan',    to: '/admin'           },
  { icon: Home,            label: 'Trang chủ',    to: '/admin/home'  },
  { icon: Info,            label: 'Giới thiệu',   to: '/admin/about'     },
  { icon: Truck,           label: 'Dịch vụ',      to: '/admin/services'  },
  { icon: HelpCircle,      label: 'Giải đáp',     to: '/admin/faq'       },
  { icon: FileText,        label: 'Nội dung FAQ', to: '/admin/faq-content' },
  { icon: Newspaper,       label: 'Tin tức',       to: '/admin/blogs'     },
  { icon: Phone,           label: 'Liên hệ',      to: '/admin/contacts'  },

]

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

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
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className={styles.sideFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{user?.full_name?.[0] || 'A'}</div>
            <div>
              <div className={styles.userName}>{user?.full_name || user?.username}</div>
              <div className={styles.userRole}>{user?.role}</div>
            </div>
          </div>
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
                  <div className={styles.cardLabel}>{c.label}</div>
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
