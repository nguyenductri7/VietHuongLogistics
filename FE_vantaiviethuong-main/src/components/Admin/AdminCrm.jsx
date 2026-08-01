import { useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  BellRing, Building2, CalendarClock, Check, Clock3, GripVertical, History,
  Loader2, Mail, MessageSquareText, Phone, Plus, RefreshCw, Search,
  Trash2, UserRound, X,
} from 'lucide-react'
import { contactApi, crmApi } from '../../services/api'
import AdminConfirmDialog from './AdminConfirmDialog'
import { useAdminToast } from './AdminToast'
import styles from './AdminCrm.module.scss'

const FALLBACK_STAGES = [
  { key: 'new_lead', label: 'Khách mới', color: '#64748b' },
  { key: 'called', label: 'Đã gọi', color: '#3b82f6' },
  { key: 'quoting', label: 'Đang báo giá', color: '#f59e0b' },
  { key: 'negotiating', label: 'Đang thương lượng', color: '#8b5cf6' },
  { key: 'contracted', label: 'Đã ký hợp đồng', color: '#10b981' },
  { key: 'completed', label: 'Hoàn thành', color: '#059669' },
]

const ACTIVITY_TYPES = [
  { value: 'note', label: 'Ghi chú' },
  { value: 'call', label: 'Cuộc gọi' },
  { value: 'email', label: 'Email' },
  { value: 'quote', label: 'Báo giá' },
  { value: 'meeting', label: 'Cuộc hẹn' },
]

const REMINDER_TYPE_LABELS = {
  call: 'Gọi điện',
  email: 'Gửi email',
  quote: 'Gửi báo giá',
  meeting: 'Gặp khách hàng',
  other: 'Công việc khác',
}

const REMINDER_PRIORITY_LABELS = {
  low: 'Thấp',
  normal: 'Bình thường',
  high: 'Cao',
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ContactCardContent({ contact, compact = false }) {
  return (
    <>
      <div className={styles.cardTop}>
        <span className={styles.avatar}>{contact.full_name?.trim()?.[0]?.toUpperCase() || '?'}</span>
        <div className={styles.cardIdentity}>
          <strong>{contact.full_name || 'Khách hàng'}</strong>
          <span>{contact.company || 'Khách hàng cá nhân'}</span>
        </div>
      </div>
      {!compact && (
        <>
          <div className={styles.cardContacts}>
            {contact.phone && <span><Phone size={12} /> {contact.phone}</span>}
            {contact.email && <span><Mail size={12} /> {contact.email}</span>}
          </div>
          <p className={styles.cardMessage}>{contact.message || 'Chưa có nội dung yêu cầu.'}</p>
          <div className={styles.cardFooter}>
            <span><Clock3 size={12} /> {formatDate(contact.created_at)}</span>
            <span className={styles.detailHint}>Xem chi tiết</span>
          </div>
        </>
      )}
    </>
  )
}

function SortableContactCard({ contact, onOpen }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `contact-${contact.id}`,
    data: { type: 'contact', stage: contact.pipeline_stage, contactId: contact.id },
  })

  return (
    <article
      ref={setNodeRef}
      className={`${styles.contactCard} ${isDragging ? styles.dragging : ''}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={() => onOpen(contact)}
    >
      <button
        type="button"
        className={styles.dragHandle}
        aria-label={`Kéo ${contact.full_name}`}
        onClick={event => event.stopPropagation()}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={15} />
      </button>
      <ContactCardContent contact={contact} />
    </article>
  )
}

function PipelineColumn({ stage, contacts, onOpen }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `stage-${stage.key}`,
    data: { type: 'stage', stage: stage.key },
  })

  return (
    <section className={`${styles.column} ${isOver ? styles.columnOver : ''}`}>
      <header className={styles.columnHeader}>
        <div>
          <span className={styles.stageDot} style={{ background: stage.color }} />
          <strong>{stage.label}</strong>
        </div>
        <span className={styles.columnCount}>{contacts.length}</span>
      </header>
      <div ref={setNodeRef} className={styles.columnBody}>
        <SortableContext
          items={contacts.map(contact => `contact-${contact.id}`)}
          strategy={verticalListSortingStrategy}
        >
          {contacts.map(contact => (
            <SortableContactCard key={contact.id} contact={contact} onOpen={onOpen} />
          ))}
        </SortableContext>
        {contacts.length === 0 && (
          <div className={styles.emptyColumn}>Kéo khách hàng vào đây</div>
        )}
      </div>
    </section>
  )
}

export default function AdminCrm() {
  const { showToast } = useAdminToast()
  const [stages, setStages] = useState(FALLBACK_STAGES)
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [moving, setMoving] = useState(false)
  const [search, setSearch] = useState('')
  const [activeContact, setActiveContact] = useState(null)
  const [selectedContact, setSelectedContact] = useState(null)
  const [activities, setActivities] = useState([])
  const [activitiesLoading, setActivitiesLoading] = useState(false)
  const [savingActivity, setSavingActivity] = useState(false)
  const [reminders, setReminders] = useState([])
  const [remindersLoading, setRemindersLoading] = useState(false)
  const [savingReminder, setSavingReminder] = useState(false)
  const [reminderToDelete, setReminderToDelete] = useState(null)
  const [deletingReminder, setDeletingReminder] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingContact, setDeletingContact] = useState(false)
  const [activityForm, setActivityForm] = useState({
    activity_type: 'note',
    title: '',
    description: '',
  })
  const [reminderForm, setReminderForm] = useState({
    title: '',
    notes: '',
    reminder_type: 'call',
    priority: 'normal',
    remind_at: '',
    email_reminder_enabled: false,
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const loadPipeline = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    try {
      const response = await crmApi.getPipeline(search.trim() ? { search: search.trim() } : {})
      setStages(response.stages?.length ? response.stages : FALLBACK_STAGES)
      setContacts(response.data || [])
    } catch (error) {
      if (!silent) showToast(error.message || 'Không thể tải pipeline khách hàng.', 'error')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => loadPipeline(), search ? 300 : 0)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const refreshPipeline = () => loadPipeline({ silent: true })
    const handleStorage = event => {
      if (event.key === 'vh-crm-refresh') refreshPipeline()
    }
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshPipeline()
    }

    window.addEventListener('vh-crm-refresh', refreshPipeline)
    window.addEventListener('storage', handleStorage)
    window.addEventListener('focus', refreshPipeline)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.removeEventListener('vh-crm-refresh', refreshPipeline)
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('focus', refreshPipeline)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [search])

  const contactsByStage = useMemo(() => Object.fromEntries(
    stages.map(stage => [
      stage.key,
      contacts
        .filter(contact => contact.pipeline_stage === stage.key)
        .sort((a, b) => (Number(a.pipeline_position) || 0) - (Number(b.pipeline_position) || 0)),
    ]),
  ), [contacts, stages])

  const loadContactDetails = async (contact) => {
    setSelectedContact(contact)
    setActivities([])
    setReminders([])
    setActivitiesLoading(true)
    setRemindersLoading(true)
    try {
      const [activityResponse, reminderResponse] = await Promise.all([
        crmApi.getActivities(contact.id),
        crmApi.getReminders({ contact_id: contact.id }),
      ])
      setActivities(activityResponse.data || [])
      setReminders(reminderResponse.data || [])
    } catch (error) {
      showToast(error.message || 'Không thể tải hồ sơ chăm sóc khách hàng.', 'error')
    } finally {
      setActivitiesLoading(false)
      setRemindersLoading(false)
    }
  }

  const handleDragStart = ({ active }) => {
    const contactId = Number(active.data.current?.contactId)
    setActiveContact(contacts.find(contact => contact.id === contactId) || null)
  }

  const handleDragCancel = () => setActiveContact(null)

  const handleDragEnd = async ({ active, over }) => {
    setActiveContact(null)
    if (!over || moving) return

    const contactId = Number(active.data.current?.contactId)
    const currentContact = contacts.find(contact => contact.id === contactId)
    if (!currentContact) return

    const targetStage = over.data.current?.stage
      || contacts.find(contact => `contact-${contact.id}` === String(over.id))?.pipeline_stage
    if (!stages.some(stage => stage.key === targetStage)) return

    const previousContacts = contacts
    const sourceStage = currentContact.pipeline_stage
    const withoutActive = contacts.filter(contact => contact.id !== contactId)
    const destination = withoutActive.filter(contact => contact.pipeline_stage === targetStage)
    const overContactId = String(over.id).startsWith('contact-')
      ? Number(String(over.id).replace('contact-', ''))
      : null
    const targetIndex = overContactId
      ? Math.max(0, destination.findIndex(contact => contact.id === overContactId))
      : destination.length

    const movedContact = { ...currentContact, pipeline_stage: targetStage }
    destination.splice(targetIndex < 0 ? destination.length : targetIndex, 0, movedContact)
    const destinationWithPositions = destination.map((contact, index) => ({
      ...contact,
      pipeline_position: index + 1,
    }))
    const source = sourceStage === targetStage
      ? []
      : withoutActive
          .filter(contact => contact.pipeline_stage === sourceStage)
          .map((contact, index) => ({ ...contact, pipeline_position: index + 1 }))
    const unaffected = withoutActive.filter(contact => (
      contact.pipeline_stage !== targetStage
      && (sourceStage === targetStage || contact.pipeline_stage !== sourceStage)
    ))
    const nextContacts = [...unaffected, ...source, ...destinationWithPositions]

    setContacts(nextContacts)
    setMoving(true)
    try {
      await crmApi.moveContact({
        contact_id: contactId,
        source_stage: sourceStage,
        to_stage: targetStage,
        source_ids: source.map(contact => contact.id),
        destination_ids: destinationWithPositions.map(contact => contact.id),
      })
      window.dispatchEvent(new Event('vh-admin-notifications-refresh'))
      if (sourceStage !== targetStage) {
        const stageLabel = stages.find(stage => stage.key === targetStage)?.label || targetStage
        showToast(`Đã chuyển khách hàng sang “${stageLabel}”.`)
      }
    } catch (error) {
      setContacts(previousContacts)
      showToast(error.message || 'Không thể di chuyển khách hàng.', 'error')
    } finally {
      setMoving(false)
    }
  }

  const handleAddActivity = async (event) => {
    event.preventDefault()
    if (!selectedContact || !activityForm.title.trim()) {
      showToast('Vui lòng nhập nội dung nhật ký.', 'error')
      return
    }

    setSavingActivity(true)
    try {
      const response = await crmApi.createActivity(selectedContact.id, {
        ...activityForm,
        title: activityForm.title.trim(),
        description: activityForm.description.trim(),
      })
      setActivities(current => [response.data, ...current])
      setActivityForm({ activity_type: 'note', title: '', description: '' })
      showToast('Đã thêm nhật ký chăm sóc.')
    } catch (error) {
      showToast(error.message || 'Không thể thêm nhật ký.', 'error')
    } finally {
      setSavingActivity(false)
    }
  }

  const handleCreateReminder = async (event) => {
    event.preventDefault()
    if (!selectedContact || !reminderForm.title.trim() || !reminderForm.remind_at) {
      showToast('Vui lòng nhập nội dung và thời gian nhắc.', 'error')
      return
    }

    setSavingReminder(true)
    try {
      const response = await crmApi.createReminder(selectedContact.id, {
        ...reminderForm,
        title: reminderForm.title.trim(),
        notes: reminderForm.notes.trim(),
        remind_at: new Date(reminderForm.remind_at).toISOString(),
      })
      setReminders(current => [...current, response.data].sort(
        (left, right) => new Date(left.remind_at) - new Date(right.remind_at),
      ))
      setReminderForm({
        title: '',
        notes: '',
        reminder_type: 'call',
        priority: 'normal',
        remind_at: '',
        email_reminder_enabled: false,
      })
      const activityResponse = await crmApi.getActivities(selectedContact.id)
      setActivities(activityResponse.data || [])
      window.dispatchEvent(new Event('vh-admin-notifications-refresh'))
      showToast('Đã tạo lịch hẹn.')
    } catch (error) {
      showToast(error.message || 'Không thể tạo lịch hẹn.', 'error')
    } finally {
      setSavingReminder(false)
    }
  }

  const updateReminder = async (reminder, patch, successMessage) => {
    try {
      const response = await crmApi.updateReminder(reminder.id, patch)
      setReminders(current => current.map(item => item.id === reminder.id ? response.data : item))
      if (patch.status && selectedContact) {
        const activityResponse = await crmApi.getActivities(selectedContact.id)
        setActivities(activityResponse.data || [])
      }
      window.dispatchEvent(new Event('vh-admin-notifications-refresh'))
      if (successMessage) showToast(successMessage)
    } catch (error) {
      showToast(error.message || 'Không thể cập nhật lịch hẹn.', 'error')
    }
  }

  const handleDeleteReminder = async () => {
    if (!reminderToDelete) return
    setDeletingReminder(true)
    try {
      await crmApi.deleteReminder(reminderToDelete.id)
      setReminders(current => current.filter(item => item.id !== reminderToDelete.id))
      setReminderToDelete(null)
      window.dispatchEvent(new Event('vh-admin-notifications-refresh'))
      showToast('Đã xoá lịch hẹn.')
    } catch (error) {
      showToast(error.message || 'Không thể xoá lịch hẹn.', 'error')
    } finally {
      setDeletingReminder(false)
    }
  }

  const handleDeleteContact = async () => {
    if (!selectedContact) return
    setDeletingContact(true)
    try {
      await contactApi.delete(selectedContact.id)
      setContacts(current => current.filter(contact => contact.id !== selectedContact.id))
      setShowDeleteConfirm(false)
      setSelectedContact(null)
      setActivities([])
      window.dispatchEvent(new Event('vh-admin-notifications-refresh'))
      showToast('Đã xoá khách hàng khỏi hệ thống.')
    } catch (error) {
      showToast(error.message || 'Không thể xoá khách hàng.', 'error')
    } finally {
      setDeletingContact(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div>
          <h2>Pipeline khách hàng</h2>
          <p>Kéo thả khách hàng qua từng giai đoạn chăm sóc.</p>
        </div>
        <div className={styles.toolbarActions}>
          <label className={styles.searchBox}>
            <Search size={15} />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Tìm tên, SĐT, email..."
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} aria-label="Xoá tìm kiếm">
                <X size={13} />
              </button>
            )}
          </label>
          <button type="button" className={styles.refreshBtn} onClick={() => loadPipeline()} disabled={loading}>
            <RefreshCw size={15} /> Làm mới
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <Loader2 size={20} className={styles.spin} /> Đang tải pipeline...
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragCancel={handleDragCancel}
          onDragEnd={handleDragEnd}
        >
          <div className={styles.board}>
            {stages.map(stage => (
              <PipelineColumn
                key={stage.key}
                stage={stage}
                contacts={contactsByStage[stage.key] || []}
                onOpen={loadContactDetails}
              />
            ))}
          </div>
          <DragOverlay>
            {activeContact ? (
              <div className={`${styles.contactCard} ${styles.overlayCard}`}>
                <ContactCardContent contact={activeContact} compact />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {selectedContact && (
        <div className={styles.drawerOverlay} onClick={() => setSelectedContact(null)}>
          <aside className={styles.drawer} onClick={event => event.stopPropagation()}>
            <header className={styles.drawerHeader}>
              <div>
                <span>Hồ sơ khách hàng</span>
                <h3>{selectedContact.full_name}</h3>
              </div>
              <button type="button" onClick={() => setSelectedContact(null)} aria-label="Đóng">
                <X size={18} />
              </button>
            </header>

            <div className={styles.drawerBody}>
              <section className={styles.customerSummary}>
                <div><UserRound size={15} /><span>{selectedContact.full_name}</span></div>
                {selectedContact.company && <div><Building2 size={15} /><span>{selectedContact.company}</span></div>}
                {selectedContact.phone && <div><Phone size={15} /><a href={`tel:${selectedContact.phone}`}>{selectedContact.phone}</a></div>}
                {selectedContact.email && <div><Mail size={15} /><a href={`mailto:${selectedContact.email}`}>{selectedContact.email}</a></div>}
                <div><MessageSquareText size={15} /><span>{selectedContact.message || 'Chưa có nội dung yêu cầu.'}</span></div>
              </section>

              <section className={styles.reminderSection}>
                <div className={styles.sectionTitle}>
                  <CalendarClock size={15} />
                  <strong>Lịch hẹn và nhắc việc</strong>
                </div>

                <form className={styles.reminderForm} onSubmit={handleCreateReminder}>
                  <input
                    value={reminderForm.title}
                    onChange={event => setReminderForm(form => ({ ...form, title: event.target.value }))}
                    placeholder="VD: Gọi lại để xác nhận báo giá"
                  />
                  <div className={styles.reminderFormRow}>
                    <select
                      value={reminderForm.reminder_type}
                      onChange={event => setReminderForm(form => ({ ...form, reminder_type: event.target.value }))}
                    >
                      {Object.entries(REMINDER_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <select
                      value={reminderForm.priority}
                      onChange={event => setReminderForm(form => ({ ...form, priority: event.target.value }))}
                    >
                      {Object.entries(REMINDER_PRIORITY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>Ưu tiên: {label}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="datetime-local"
                    value={reminderForm.remind_at}
                    onChange={event => setReminderForm(form => ({ ...form, remind_at: event.target.value }))}
                  />
                  <textarea
                    rows={2}
                    value={reminderForm.notes}
                    onChange={event => setReminderForm(form => ({ ...form, notes: event.target.value }))}
                    placeholder="Ghi chú cho lịch hẹn..."
                  />
                  <label className={styles.emailReminderToggle}>
                    <input
                      type="checkbox"
                      checked={reminderForm.email_reminder_enabled}
                      onChange={event => setReminderForm(form => ({
                        ...form,
                        email_reminder_enabled: event.target.checked,
                      }))}
                    />
                    <span className={styles.reminderSwitch} aria-hidden="true" />
                    <span>
                      <strong>Nhắc lịch qua email</strong>
                      <small>Lưu lựa chọn trước; hệ thống gửi tự động sẽ được kích hoạt sau.</small>
                    </span>
                  </label>
                  <button type="submit" disabled={savingReminder}>
                    {savingReminder ? <Loader2 size={14} className={styles.spin} /> : <CalendarClock size={14} />}
                    {savingReminder ? 'Đang tạo...' : 'Tạo lịch hẹn'}
                  </button>
                </form>

                {remindersLoading ? (
                  <div className={styles.timelineLoading}><Loader2 size={16} className={styles.spin} /> Đang tải lịch...</div>
                ) : reminders.length === 0 ? (
                  <p className={styles.emptyTimeline}>Chưa có lịch hẹn nào.</p>
                ) : (
                  <div className={styles.reminderList}>
                    {reminders.map(reminder => {
                      const overdue = reminder.status === 'pending'
                        && new Date(reminder.remind_at).getTime() < Date.now()
                      return (
                        <article
                          key={reminder.id}
                          className={`${styles.reminderItem} ${overdue ? styles.reminderOverdue : ''} ${reminder.status !== 'pending' ? styles.reminderDone : ''}`}
                        >
                          <div className={styles.reminderItemTop}>
                            <div>
                              <strong>{reminder.title}</strong>
                              <span>{REMINDER_TYPE_LABELS[reminder.reminder_type] || 'Công việc'} · Ưu tiên {REMINDER_PRIORITY_LABELS[reminder.priority] || 'Bình thường'}</span>
                            </div>
                            <time>{formatDate(reminder.remind_at)}</time>
                          </div>
                          {reminder.notes && <p>{reminder.notes}</p>}
                          <label className={styles.reminderEmailOption}>
                            <input
                              type="checkbox"
                              checked={Boolean(Number(reminder.email_reminder_enabled))}
                              disabled={reminder.status !== 'pending'}
                              onChange={event => updateReminder(
                                reminder,
                                { email_reminder_enabled: event.target.checked },
                                event.target.checked ? 'Đã bật tùy chọn nhắc email.' : 'Đã tắt tùy chọn nhắc email.',
                              )}
                            />
                            <BellRing size={12} />
                            Nhắc email
                          </label>
                          <div className={styles.reminderActions}>
                            {reminder.status === 'pending' ? (
                              <>
                                <button type="button" onClick={() => updateReminder(reminder, { status: 'completed' }, 'Đã hoàn thành lịch hẹn.')}>
                                  <Check size={13} /> Hoàn thành
                                </button>
                                <button type="button" onClick={() => updateReminder(reminder, { status: 'cancelled' }, 'Đã huỷ lịch hẹn.')}>
                                  Huỷ lịch
                                </button>
                              </>
                            ) : (
                              <button type="button" onClick={() => updateReminder(reminder, { status: 'pending' }, 'Đã mở lại lịch hẹn.')}>
                                Mở lại
                              </button>
                            )}
                            <button type="button" className={styles.reminderDeleteBtn} onClick={() => setReminderToDelete(reminder)}>
                              <Trash2 size={13} /> Xoá
                            </button>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </section>

              <form className={styles.activityForm} onSubmit={handleAddActivity}>
                <div className={styles.sectionTitle}>
                  <Plus size={15} />
                  <strong>Thêm nhật ký chăm sóc</strong>
                </div>
                <div className={styles.activityFormRow}>
                  <select
                    value={activityForm.activity_type}
                    onChange={event => setActivityForm(form => ({ ...form, activity_type: event.target.value }))}
                  >
                    {ACTIVITY_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <input
                    value={activityForm.title}
                    onChange={event => setActivityForm(form => ({ ...form, title: event.target.value }))}
                    placeholder="VD: Khách yêu cầu báo giá"
                  />
                </div>
                <textarea
                  rows={3}
                  value={activityForm.description}
                  onChange={event => setActivityForm(form => ({ ...form, description: event.target.value }))}
                  placeholder="Thông tin chi tiết, kết quả trao đổi, bước tiếp theo..."
                />
                <button type="submit" disabled={savingActivity}>
                  {savingActivity ? <Loader2 size={14} className={styles.spin} /> : <Plus size={14} />}
                  {savingActivity ? 'Đang lưu...' : 'Thêm vào nhật ký'}
                </button>
              </form>

              <section className={styles.timelineSection}>
                <div className={styles.sectionTitle}>
                  <History size={15} />
                  <strong>Nhật ký chăm sóc</strong>
                </div>
                {activitiesLoading ? (
                  <div className={styles.timelineLoading}><Loader2 size={16} className={styles.spin} /> Đang tải...</div>
                ) : activities.length === 0 ? (
                  <p className={styles.emptyTimeline}>Chưa có hoạt động chăm sóc nào.</p>
                ) : (
                  <div className={styles.timeline}>
                    {activities.map(activity => (
                      <article key={activity.id} className={styles.timelineItem}>
                        <span className={styles.timelineDot} />
                        <div>
                          <div className={styles.timelineMeta}>
                            <strong>{activity.title}</strong>
                            <time>{formatDate(activity.created_at)}</time>
                          </div>
                          {activity.description && <p>{activity.description}</p>}
                          <span className={styles.timelineAuthor}>
                            {activity.created_by_name || activity.created_by_username || 'Hệ thống'}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className={styles.dangerZone}>
                <div>
                  <strong>Xoá hồ sơ khách hàng</strong>
                  <span>Khách hàng sẽ bị xoá khỏi CRM, danh sách liên hệ và toàn bộ nhật ký chăm sóc.</span>
                </div>
                <button type="button" onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 size={14} /> Xoá khách hàng
                </button>
              </section>
            </div>
          </aside>
        </div>
      )}

      <AdminConfirmDialog
        open={Boolean(reminderToDelete)}
        title="Xoá lịch hẹn?"
        message="Lịch hẹn này sẽ bị xoá khỏi hồ sơ khách hàng."
        target={reminderToDelete?.title}
        confirmText="Xoá lịch hẹn"
        busy={deletingReminder}
        onCancel={() => setReminderToDelete(null)}
        onConfirm={handleDeleteReminder}
      />

      <AdminConfirmDialog
        open={showDeleteConfirm && Boolean(selectedContact)}
        title="Xoá hồ sơ khách hàng?"
        message="Hành động này sẽ xoá yêu cầu liên hệ và toàn bộ nhật ký CRM liên quan. Không thể hoàn tác."
        target={selectedContact?.full_name}
        confirmText="Xoá khách hàng"
        busy={deletingContact}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteContact}
      />
    </div>
  )
}
