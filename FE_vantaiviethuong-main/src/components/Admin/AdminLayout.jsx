import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, LayoutDashboard } from 'lucide-react'
import AdminSidebar from './AdminSidebar'
import { AdminToastProvider } from './AdminToast'
import styles from './AdminLayout.module.scss'

const PAGE_META = {
  '/admin': { title: 'Tổng quan', crumb: 'Dashboard' },
  '/admin/home': { title: 'Quản lý trang chủ', crumb: 'Trang chủ' },
  '/admin/about': { title: 'Quản lý giới thiệu', crumb: 'Giới thiệu' },
  '/admin/services': { title: 'Quản lý dịch vụ', crumb: 'Dịch vụ' },
  '/admin/faq': { title: 'Quản lý giải đáp', crumb: 'Giải đáp' },
  '/admin/faq-content': { title: 'Nội dung FAQ', crumb: 'Nội dung FAQ' },
  '/admin/blogs': { title: 'Quản lý tin tức', crumb: 'Tin tức' },
  '/admin/branches': { title: 'Văn phòng & Chi nhánh', crumb: 'Chi nhánh' },
  '/admin/contacts': { title: 'Yêu cầu liên hệ', crumb: 'Liên hệ' },
  '/admin/profile': { title: 'Hồ sơ Admin', crumb: 'Hồ sơ' },
}

function getMeta(pathname) {
  return PAGE_META[pathname] || { title: 'Admin Panel', crumb: 'Quản trị' }
}

export default function AdminLayout({ children }) {
  const location = useLocation()
  const meta = getMeta(location.pathname)
  const isDashboard = location.pathname === '/admin'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => (
    window.localStorage.getItem('vh_admin_sidebar_collapsed') === '1'
  ))

  useEffect(() => {
    window.localStorage.setItem('vh_admin_sidebar_collapsed', sidebarCollapsed ? '1' : '0')
  }, [sidebarCollapsed])

  return (
    <AdminToastProvider>
      <div className={styles.shell}>
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(value => !value)}
        />
        <main className={styles.content}>
          <div className={styles.pageChrome}>
            <div>
              <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                <Link to="/admin">Admin</Link>
                <ChevronRight size={14} />
                <span>{meta.crumb}</span>
              </nav>
              <h1>{meta.title}</h1>
            </div>

            {!isDashboard && (
              <Link className={styles.dashboardLink} to="/admin">
                <LayoutDashboard size={15} />
                Về dashboard
              </Link>
            )}
          </div>
          {children}
        </main>
      </div>
    </AdminToastProvider>
  )
}
