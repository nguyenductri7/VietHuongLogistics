import { Loader2, RotateCcw, Trash2, X } from 'lucide-react'
import styles from './AdminConfirmDialog.module.scss'

export default function AdminConfirmDialog({
  open,
  title = 'Xác nhận xóa?',
  message = 'Hành động này không thể hoàn tác.',
  target,
  confirmText = 'Xóa vĩnh viễn',
  cancelText = 'Hủy',
  variant = 'delete',
  busy = false,
  onCancel,
  onConfirm,
}) {
  if (!open) return null

  const isRestore = variant === 'restore'
  const Icon = isRestore ? RotateCcw : Trash2
  const busyText = isRestore ? 'Đang hoàn tác...' : 'Đang xóa...'

  return (
    <div className={styles.overlay} onClick={() => !busy && onCancel?.()}>
      <div className={styles.modal} onClick={event => event.stopPropagation()}>
        <button className={styles.closeBtn} disabled={busy} onClick={onCancel} aria-label="Đóng">
          <X size={16} />
        </button>

        <div className={`${styles.iconWrap} ${isRestore ? styles.restoreIcon : ''}`}>
          <Icon size={28} />
        </div>

        <h3>{title}</h3>
        <p>
          {message}
          {target ? <><br /><strong>{target}</strong></> : null}
        </p>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} disabled={busy} onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`${styles.confirmBtn} ${isRestore ? styles.restoreConfirmBtn : ''}`} disabled={busy} onClick={onConfirm}>
            {busy ? <Loader2 size={15} className={styles.spin} /> : <Icon size={15} />}
            {busy ? busyText : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
