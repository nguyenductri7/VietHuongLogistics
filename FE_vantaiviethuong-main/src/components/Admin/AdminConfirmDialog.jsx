import { Loader2, Trash2, X } from 'lucide-react'
import styles from './AdminConfirmDialog.module.scss'

export default function AdminConfirmDialog({
  open,
  title = 'Xác nhận xóa?',
  message = 'Hành động này không thể hoàn tác.',
  target,
  confirmText = 'Xóa vĩnh viễn',
  busyText = 'Đang xóa...',
  cancelText = 'Hủy',
  icon: DialogIcon = Trash2,
  confirmIcon: ConfirmIcon = Trash2,
  busy = false,
  onCancel,
  onConfirm,
}) {
  if (!open) return null

  return (
    <div className={styles.overlay} onClick={() => !busy && onCancel?.()}>
      <div className={styles.modal} onClick={event => event.stopPropagation()}>
        <button className={styles.closeBtn} disabled={busy} onClick={onCancel} aria-label="Đóng">
          <X size={16} />
        </button>

        <div className={styles.iconWrap}>
          <DialogIcon size={28} />
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
          <button className={styles.confirmBtn} disabled={busy} onClick={onConfirm}>
            {busy ? <Loader2 size={15} className={styles.spin} /> : <ConfirmIcon size={15} />}
            {busy ? busyText : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
