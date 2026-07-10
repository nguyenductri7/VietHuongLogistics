import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Building2, Edit3, Loader2, MapPin, Plus, RefreshCw,
  Save, Trash2, X,
} from 'lucide-react'
import { branchApi } from '../../services/api'
import styles from './AdminBranches.module.scss'

const EMPTY_FORM = {
  name: '',
  address: '',
  email: '',
  phone: '',
  lat: '',
  lng: '',
  image_url: '',
  is_headquarter: false,
  is_active: true,
  sort_order: 0,
}

export default function AdminBranches() {
  const navigate = useNavigate()
  const [branches, setBranches] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    window.setTimeout(() => setToast(null), 3000)
  }

  const fetchBranches = async () => {
    setLoading(true)
    try {
      const res = await branchApi.adminList()
      setBranches(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      showToast(error.message || 'Không thể tải danh sách chi nhánh.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBranches()
  }, [])

  const updateField = (key, value) => {
    setForm(current => ({ ...current, [key]: value }))
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const editBranch = (branch) => {
    setEditingId(branch.id)
    setForm({
      name: branch.name || '',
      address: branch.address || '',
      email: branch.email || '',
      phone: branch.phone || '',
      lat: branch.lat ?? '',
      lng: branch.lng ?? '',
      image_url: branch.image_url || '',
      is_headquarter: !!branch.is_headquarter,
      is_active: !!branch.is_active,
      sort_order: branch.sort_order || 0,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const saveBranch = async (event) => {
    event.preventDefault()

    if (!form.name.trim() || !form.address.trim()) {
      showToast('Vui lòng nhập tên và địa chỉ chi nhánh.', 'error')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...form,
        lat: Number(form.lat) || 16.0707,
        lng: Number(form.lng) || 108.1526,
        sort_order: Number.parseInt(form.sort_order, 10) || 0,
      }

      if (editingId) {
        await branchApi.update(editingId, payload)
        showToast('Đã cập nhật chi nhánh.')
      } else {
        await branchApi.create(payload)
        showToast('Đã thêm chi nhánh mới.')
      }

      resetForm()
      await fetchBranches()
    } catch (error) {
      showToast(error.message || 'Không thể lưu chi nhánh.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const deleteBranch = async (branch) => {
    if (!window.confirm(`Xóa "${branch.name}" khỏi danh sách chi nhánh?`)) return

    setDeletingId(branch.id)
    try {
      await branchApi.delete(branch.id)
      showToast('Đã xóa chi nhánh.')
      if (editingId === branch.id) resetForm()
      await fetchBranches()
    } catch (error) {
      showToast(error.message || 'Không thể xóa chi nhánh.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className={styles.page}>
      {toast && <div className={`${styles.toast} ${styles[toast.type]}`}>{toast.msg}</div>}

      <div className={styles.header}>
        <div>
          <button className={styles.backBtn} onClick={() => navigate('/admin')}>
            <ArrowLeft size={14} /> Quay lại
          </button>
          <h1 className={styles.title}>
            <Building2 size={22} /> Văn phòng & Chi nhánh
          </h1>
          <p className={styles.subtitle}>
            Quản lý các địa điểm hiển thị trên trang khách hàng /chi-nhanh.
          </p>
        </div>
        <button className={styles.refreshBtn} onClick={fetchBranches} disabled={loading}>
          <RefreshCw size={14} /> Làm mới
        </button>
      </div>

      <form className={styles.formCard} onSubmit={saveBranch}>
        <div className={styles.formHeader}>
          <h2>{editingId ? 'Chỉnh sửa chi nhánh' : 'Thêm chi nhánh mới'}</h2>
          {editingId && (
            <button type="button" className={styles.cancelBtn} onClick={resetForm}>
              <X size={14} /> Hủy sửa
            </button>
          )}
        </div>

        <div className={styles.grid}>
          <label>
            Tên văn phòng/chi nhánh *
            <input value={form.name} onChange={e => updateField('name', e.target.value)} />
          </label>
          <label>
            Số điện thoại
            <input value={form.phone} onChange={e => updateField('phone', e.target.value)} />
          </label>
          <label className={styles.wide}>
            Địa chỉ *
            <input value={form.address} onChange={e => updateField('address', e.target.value)} />
          </label>
          <label>
            Email / Facebook
            <input value={form.email} onChange={e => updateField('email', e.target.value)} />
          </label>
          <label>
            Thứ tự hiển thị
            <input type="number" value={form.sort_order} onChange={e => updateField('sort_order', e.target.value)} />
          </label>
          <label>
            Vĩ độ latitude
            <input type="number" step="0.0000001" value={form.lat} onChange={e => updateField('lat', e.target.value)} />
          </label>
          <label>
            Kinh độ longitude
            <input type="number" step="0.0000001" value={form.lng} onChange={e => updateField('lng', e.target.value)} />
          </label>
          <label className={styles.wide}>
            Link ảnh đại diện
            <input value={form.image_url} onChange={e => updateField('image_url', e.target.value)} />
          </label>
        </div>

        <div className={styles.checkRow}>
          <label className={styles.checkItem}>
            <input
              type="checkbox"
              checked={form.is_headquarter}
              onChange={e => updateField('is_headquarter', e.target.checked)}
            />
            Đặt làm trụ sở chính
          </label>
          <label className={styles.checkItem}>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={e => updateField('is_active', e.target.checked)}
            />
            Hiển thị ngoài website
          </label>
        </div>

        <button className={styles.saveBtn} disabled={saving}>
          {saving ? <Loader2 size={15} className={styles.spinIcon} /> : editingId ? <Save size={15} /> : <Plus size={15} />}
          {editingId ? 'Lưu thay đổi' : 'Thêm chi nhánh'}
        </button>
      </form>

      <div className={styles.listCard}>
        <div className={styles.listHeader}>
          <h2>Danh sách chi nhánh</h2>
          <span>{branches.length} địa điểm</span>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <Loader2 size={16} className={styles.spinIcon} /> Đang tải...
          </div>
        ) : branches.length === 0 ? (
          <div className={styles.empty}>Chưa có chi nhánh nào.</div>
        ) : (
          <div className={styles.branchList}>
            {branches.map(branch => (
              <div key={branch.id} className={`${styles.branchItem} ${!branch.is_active ? styles.inactive : ''}`}>
                <div className={styles.thumb}>
                  {branch.image_url ? <img src={branch.image_url} alt={branch.name} /> : <Building2 size={24} />}
                </div>
                <div className={styles.branchInfo}>
                  <div className={styles.branchTitle}>
                    <h3>{branch.name}</h3>
                    {branch.is_headquarter && <span className={styles.badge}>Trụ sở chính</span>}
                    {!branch.is_active && <span className={styles.badgeMuted}>Đang ẩn</span>}
                  </div>
                  <p><MapPin size={13} /> {branch.address}</p>
                  <p>{branch.phone || 'Chưa có SĐT'} · {branch.email || 'Chưa có email'}</p>
                  <small>Lat: {branch.lat} · Lng: {branch.lng} · Thứ tự: {branch.sort_order}</small>
                </div>
                <div className={styles.actions}>
                  <button className={styles.editBtn} onClick={() => editBranch(branch)}>
                    <Edit3 size={14} /> Sửa
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => deleteBranch(branch)}
                    disabled={deletingId === branch.id}
                  >
                    {deletingId === branch.id ? <Loader2 size={14} className={styles.spinIcon} /> : <Trash2 size={14} />}
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
