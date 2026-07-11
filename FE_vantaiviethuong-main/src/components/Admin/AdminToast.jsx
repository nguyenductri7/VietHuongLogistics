import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, Info, Loader2, X } from 'lucide-react'
import styles from './AdminToast.module.scss'

const AdminToastContext = createContext(null)

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  loading: Loader2,
  info: Info,
}

export function AdminToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  const hideToast = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = null
    setToast(null)
  }, [])

  const showToast = useCallback((message, type = 'success', options = {}) => {
    if (!message) return
    if (timerRef.current) window.clearTimeout(timerRef.current)

    const duration = typeof options.duration === 'number'
      ? options.duration
      : type === 'loading'
        ? 0
        : 3200

    setToast({ message, type })

    if (duration > 0) {
      timerRef.current = window.setTimeout(() => setToast(null), duration)
    }
  }, [])

  const Icon = toast ? (ICONS[toast.type] || Info) : null

  return (
    <AdminToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type] || styles.info}`} role="status">
          <span className={styles.icon}>
            <Icon size={17} className={toast.type === 'loading' ? styles.spin : ''} />
          </span>
          <span className={styles.message}>{toast.message}</span>
          <button className={styles.closeBtn} onClick={hideToast} aria-label="Đóng thông báo">
            <X size={14} />
          </button>
        </div>
      )}
    </AdminToastContext.Provider>
  )
}

export function useAdminToast() {
  const ctx = useContext(AdminToastContext)
  if (!ctx) {
    return {
      showToast: () => {},
      hideToast: () => {},
    }
  }
  return ctx
}
