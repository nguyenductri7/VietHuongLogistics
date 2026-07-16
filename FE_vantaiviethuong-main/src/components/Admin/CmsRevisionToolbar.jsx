import { useState } from 'react'
import { Archive, Clock3, Download, Eye, History, Loader2, RotateCcw, Send } from 'lucide-react'
import { cmsRevisionApi } from '../../services/api'
import { useAdminToast } from './AdminToast'
import AdminConfirmDialog from './AdminConfirmDialog'
import styles from './CmsRevisionToolbar.module.scss'

const MODULE_LABELS = {
  home: 'trang chủ',
  about: 'trang giới thiệu',
  services: 'trang dịch vụ',
}

function formatDate(value) {
  if (!value) return 'Chưa xác định'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Chưa xác định'
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export default function CmsRevisionToolbar({ module, snapshot, previewPath, onApplied }) {
  const { showToast } = useAdminToast()
  const [summary, setSummary] = useState('')
  const [busy, setBusy] = useState('')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [restoreTarget, setRestoreTarget] = useState(null)

  const openPreview = (content = snapshot) => {
    localStorage.setItem(`vh_cms_preview_${module}`, JSON.stringify(content))
    const separator = previewPath.includes('?') ? '&' : '?'
    window.open(`${previewPath}${separator}cms-preview=${module}`, '_blank', 'noopener,noreferrer')
  }

  const refreshHistory = async () => {
    setHistoryLoading(true)
    try {
      const response = await cmsRevisionApi.history(module)
      setHistory(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      showToast(error.message || 'Không thể tải lịch sử chỉnh sửa.', 'error')
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleOpenHistory = () => {
    setHistoryOpen(true)
    refreshHistory()
  }

  const handleSaveDraft = async () => {
    setBusy('draft')
    try {
      const response = await cmsRevisionApi.saveDraft(module, snapshot, summary.trim())
      showToast(response.message || 'Đã lưu bản nháp.', 'success')
      setSummary('')
    } catch (error) {
      showToast(error.message || 'Không thể lưu bản nháp.', 'error')
    } finally {
      setBusy('')
    }
  }

  const handlePublish = async () => {
    setBusy('publish')
    try {
      const response = await cmsRevisionApi.publish(module, snapshot, summary.trim())
      showToast(response.message || 'Đã xuất bản nội dung.', 'success')
      setSummary('')
      onApplied?.(response.data?.snapshot)
    } catch (error) {
      showToast(error.message || 'Không thể xuất bản nội dung.', 'error')
    } finally {
      setBusy('')
    }
  }

  const previewRevision = async (revision) => {
    setBusy(`preview-${revision.id}`)
    try {
      const response = await cmsRevisionApi.getOne(module, revision.id)
      openPreview(response.data?.snapshot || {})
    } catch (error) {
      showToast(error.message || 'Không thể xem phiên bản này.', 'error')
    } finally {
      setBusy('')
    }
  }

  const loadRevisionForEditing = async (revision) => {
    setBusy(`load-${revision.id}`)
    try {
      const response = await cmsRevisionApi.getOne(module, revision.id)
      onApplied?.(response.data?.snapshot)
      setHistoryOpen(false)
      showToast(`Đã nạp phiên bản #${revision.version_number} để chỉnh sửa. Website chưa thay đổi.`, 'success')
    } catch (error) {
      showToast(error.message || 'Không thể nạp phiên bản này.', 'error')
    } finally {
      setBusy('')
    }
  }

  const handleRestore = async () => {
    if (!restoreTarget) return
    setBusy(`restore-${restoreTarget.id}`)
    try {
      const response = await cmsRevisionApi.restore(module, restoreTarget.id)
      showToast(response.message || 'Đã khôi phục phiên bản.', 'success')
      onApplied?.(response.data?.snapshot)
      setRestoreTarget(null)
      await refreshHistory()
    } catch (error) {
      showToast(error.message || 'Không thể khôi phục phiên bản.', 'error')
    } finally {
      setBusy('')
    }
  }

  return (
    <>
      <section className={styles.toolbar}>
        <div className={styles.heading}>
          <div className={styles.titleRow}>
            <Archive size={18} />
            <strong>Phiên bản nội dung</strong>
          </div>
          <p>Lưu nháp để tiếp tục chỉnh sửa, hoặc xuất bản khi nội dung đã sẵn sàng.</p>
        </div>

        <input
          className={styles.summary}
          value={summary}
          onChange={event => setSummary(event.target.value)}
          placeholder="Ghi chú thay đổi (không bắt buộc)"
          maxLength={255}
        />

        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={() => openPreview()}>
            <Eye size={16} /> Xem trước
          </button>
          <button type="button" className={styles.secondary} onClick={handleOpenHistory}>
            <History size={16} /> Lịch sử
          </button>
          <button type="button" className={styles.draft} onClick={handleSaveDraft} disabled={!!busy}>
            {busy === 'draft' ? <Loader2 size={16} className={styles.spin} /> : <Clock3 size={16} />}
            Lưu nháp
          </button>
          <button type="button" className={styles.publish} onClick={handlePublish} disabled={!!busy}>
            {busy === 'publish' ? <Loader2 size={16} className={styles.spin} /> : <Send size={16} />}
            Xuất bản toàn bộ
          </button>
        </div>
      </section>

      {historyOpen && (
        <div className={styles.overlay} onMouseDown={() => setHistoryOpen(false)}>
          <div className={styles.modal} onMouseDown={event => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2>Lịch sử {MODULE_LABELS[module]}</h2>
                <p>Mỗi lần khôi phục sẽ tạo một phiên bản xuất bản mới.</p>
              </div>
              <button type="button" onClick={() => setHistoryOpen(false)} aria-label="Đóng">×</button>
            </div>

            <div className={styles.historyList}>
              {historyLoading ? (
                <div className={styles.empty}><Loader2 size={20} className={styles.spin} /> Đang tải lịch sử...</div>
              ) : history.length ? history.map(revision => (
                <article className={styles.revision} key={revision.id}>
                  <div>
                    <div className={styles.revisionTitle}>
                      <strong>Phiên bản #{revision.version_number}</strong>
                      <span className={revision.status === 'published' ? styles.publishedBadge : styles.draftBadge}>
                        {revision.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                      </span>
                    </div>
                    <p>{revision.change_summary || 'Không có ghi chú'}</p>
                    <small>
                      {revision.author?.full_name || revision.author?.username || 'Tài khoản đã xóa'} · {formatDate(revision.created_at)}
                    </small>
                  </div>
                  <div className={styles.revisionActions}>
                    <button type="button" onClick={() => previewRevision(revision)} disabled={!!busy}>
                      {busy === `preview-${revision.id}` ? <Loader2 size={14} className={styles.spin} /> : <Eye size={14} />}
                      Xem
                    </button>
                    <button type="button" onClick={() => loadRevisionForEditing(revision)} disabled={!!busy}>
                      {busy === `load-${revision.id}` ? <Loader2 size={14} className={styles.spin} /> : <Download size={14} />}
                      Nạp sửa
                    </button>
                    <button type="button" onClick={() => setRestoreTarget(revision)} disabled={!!busy}>
                      <RotateCcw size={14} /> Khôi phục
                    </button>
                  </div>
                </article>
              )) : (
                <div className={styles.empty}>Chưa có phiên bản nào. Hãy lưu nháp hoặc xuất bản lần đầu.</div>
              )}
            </div>
          </div>
        </div>
      )}

      <AdminConfirmDialog
        open={!!restoreTarget}
        title={`Khôi phục phiên bản #${restoreTarget?.version_number || ''}?`}
        message="Nội dung của phiên bản này sẽ được xuất bản lên website. Phiên bản hiện tại vẫn được giữ trong lịch sử."
        target={restoreTarget?.change_summary || MODULE_LABELS[module]}
        confirmText="Khôi phục & xuất bản"
        busyText="Đang khôi phục..."
        icon={RotateCcw}
        confirmIcon={RotateCcw}
        busy={busy === `restore-${restoreTarget?.id}`}
        onCancel={() => setRestoreTarget(null)}
        onConfirm={handleRestore}
      />
    </>
  )
}
