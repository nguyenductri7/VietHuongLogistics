// src/components/Admin/AdminBlogs.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Newspaper, Plus, Search, Image as ImageIcon, Star,
  Pencil, Trash2, Save, ArrowLeft, Trash, Loader2,
} from 'lucide-react'
import { blogApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import RichTextEditor from './Richtexteditor'
import { DEFAULT_BLOG_CATEGORIES, DEFAULT_BLOG_CATEGORY } from '../Blog/blogCategories'
import { formatBlogDate, getBlogDateValue } from '../Blog/blogDate'
import styles from './AdminBlogs.module.scss'
import { useAdminToast } from './AdminToast'

const STATUS_LABEL = { draft: 'Nháp', published: 'Đã đăng', archived: 'Lưu trữ' }
const STATUS_COLOR = { draft: '#8899aa', published: '#52c97a', archived: '#e8a020' }

export default function AdminBlogs() {
  const { showToast } = useAdminToast()
  const { logout } = useAuth()
  const navigate   = useNavigate()

  const [blogs, setBlogs]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage]         = useState(1)
  const [pagination, setPagination] = useState({})
  const [categoryOptions, setCategoryOptions] = useState(DEFAULT_BLOG_CATEGORIES)

  // view: 'list' | 'form'  — thay cho modal cũ
  const [view, setView]         = useState('list')
  const [editing, setEditing]   = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [saving, setSaving]     = useState(false)
  const [loadingEdit, setLoadingEdit] = useState(null)

  // Form state
  const [form, setForm] = useState({
    title: '', excerpt: '', content: '',
    category: DEFAULT_BLOG_CATEGORY, tags: '', status: 'draft', is_featured: false,
  })
  const [thumbnail, setThumbnail] = useState(null)
  const [preview, setPreview]     = useState('')
  const fileRef = useRef()

  // ── Load danh sách ──────────────────────────────────────────
  const fetchBlogs = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (search)       params.search = search
      if (statusFilter) params.status = statusFilter
      const res = await blogApi.adminList(params)
      setBlogs(res.data)
      setPagination(res.pagination)
    } catch (err) {
      showToast(err.message, 'error')
      if (err.message?.includes('Token')) { logout(); navigate('/admin/login') }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBlogs() }, [page, statusFilter])
  useEffect(() => {
    blogApi.getCategories()
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length) setCategoryOptions(res.data)
      })
      .catch(() => {})
  }, [])
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchBlogs() }, 400)
    return () => clearTimeout(t)
  }, [search])

  // ── Toast ───────────────────────────────────────────────────

  // ── Mở trang tạo / sửa ─────────────────────────────────────
  const openCreate = () => {
    setEditing(null)
    setForm({ title: '', excerpt: '', content: '', category: DEFAULT_BLOG_CATEGORY, tags: '', status: 'draft', is_featured: false })
    setThumbnail(null)
    setPreview('')
    setView('form')
  }

  const openEdit = async (blog) => {
    setLoadingEdit(blog.id)
    try {
      const res = await blogApi.adminGetOne(blog.id)
      const detail = res.data || res

      setEditing(detail)
      setForm({
        title:       detail.title || '',
        excerpt:     detail.excerpt || '',
        content:     detail.content || '',
        category:    detail.category || DEFAULT_BLOG_CATEGORY,
        tags:        detail.tags || '',
        status:      detail.status || 'draft',
        is_featured: !!detail.is_featured,
      })
      setThumbnail(null)
      setPreview(detail.thumbnail_url || '')
      setView('form')
    } catch (err) {
      showToast(err.message || 'Không thể tải nội dung bài viết.', 'error')
    } finally {
      setLoadingEdit(null)
    }
  }

  const closeForm = () => {
    setView('list')
    setEditing(null)
  }

  // ── Chọn ảnh ───────────────────────────────────────────────
  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setThumbnail(f)
    setPreview(URL.createObjectURL(f))
  }

  // ── Submit form ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { showToast('Tiêu đề không được để trống', 'error'); return }
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (thumbnail) fd.append('thumbnail', thumbnail)

      if (editing) {
        await blogApi.update(editing.id, fd)
        showToast('Cập nhật bài viết thành công!')
      } else {
        await blogApi.create(fd)
        showToast('Tạo bài viết thành công!')
      }
      setView('list')
      setEditing(null)
      fetchBlogs()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── Xóa ────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleting) return
    try {
      await blogApi.delete(deleting.id)
      showToast('Đã xóa bài viết!')
      setDeleting(null)
      fetchBlogs()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  // ════════════════════════════════════════════════════════
  // VIEW: FORM (full-width, không còn modal)
  // ════════════════════════════════════════════════════════
  if (view === 'form') {
    return (
      <div className={styles.page}>

        <div className={styles.header}>
          <div>
            <button className={styles.backBtn} onClick={closeForm}>
              <ArrowLeft size={14} /> Quay lại danh sách
            </button>
            <h1 className={styles.title}>
              {editing
                ? <><Pencil size={20} /> Chỉnh sửa bài viết</>
                : <><Plus size={20} /> Thêm bài viết mới</>
              }
            </h1>
          </div>
        </div>

        <form className={styles.formPage} onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            {/* ── Cột chính: nội dung ── */}
            <div className={styles.formMain}>
              <div className={styles.field}>
                <label>Tiêu đề <span className={styles.req}>*</span></label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Nhập tiêu đề bài viết..."
                />
              </div>

              <div className={styles.field}>
                <label>Mô tả ngắn</label>
                <textarea
                  rows={3}
                  value={form.excerpt}
                  onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                  placeholder="Tóm tắt nội dung bài viết..."
                />
              </div>

              <div className={styles.field}>
                <label>Nội dung</label>
                <RichTextEditor
                  value={form.content}
                  onChange={(html) => setForm(f => ({ ...f, content: html }))}
                  placeholder="Soạn nội dung bài viết..."
                />
              </div>
            </div>

            {/* ── Cột phụ: ảnh bìa, danh mục, trạng thái ── */}
            <div className={styles.formSide}>
              <div className={styles.sideBlock}>
                <label>Ảnh bìa</label>
                <div
                  className={styles.uploadArea}
                  onClick={() => fileRef.current.click()}
                >
                  {preview
                    ? <img src={preview} alt="preview" className={styles.previewImg} />
                    : <div className={styles.uploadPlaceholder}>
                        <ImageIcon size={26} />
                        <p>Click để chọn ảnh</p>
                        <small>JPG, PNG, WEBP · tối đa 10MB</small>
                      </div>
                  }
                </div>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
              </div>

              <div className={styles.sideBlock}>
                <label>Danh mục</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {!categoryOptions.includes(form.category) && (
                    <option value={form.category}>{form.category} (danh mục cũ)</option>
                  )}
                  {categoryOptions.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className={styles.sideBlock}>
                <label>Tags</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="vận tải, logistics, ..."
                />
              </div>

              <div className={styles.sideBlock}>
                <label>Trạng thái</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="draft">Nháp</option>
                  <option value="published">Đăng ngay</option>
                  <option value="archived">Lưu trữ</option>
                </select>
              </div>

              <div className={styles.sideBlock}>
                <label>Bài nổi bật</label>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))}
                  />
                  <span className={styles.toggleSlider} />
                  <span className={styles.toggleLabel}>
                    {form.is_featured ? <><Star size={13} fill="currentColor" /> Có</> : 'Không'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={closeForm}>
              Hủy
            </button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving
                ? <><Loader2 size={15} className={styles.spinIcon} /> Đang lưu...</>
                : <><Save size={15} /> {editing ? 'Cập nhật' : 'Tạo bài'}</>
              }
            </button>
          </div>
        </form>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════
  // VIEW: LIST (mặc định)
  // ════════════════════════════════════════════════════════
  return (
    <div className={styles.page}>
      {/* Toast */}

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}><Newspaper size={20} /> Quản lý Tin tức</h1>
        </div>
        <button className={styles.addBtn} onClick={openCreate}>
          <Plus size={15} /> Thêm bài viết
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            className={styles.search}
            type="text"
            placeholder="Tìm kiếm tiêu đề..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className={styles.select}
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="published">Đã đăng</option>
          <option value="draft">Nháp</option>
          <option value="archived">Lưu trữ</option>
        </select>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loadingBox}>
            <Loader2 size={16} className={styles.spinIcon} /> Đang tải...
          </div>
        ) : blogs.length === 0 ? (
          <div className={styles.empty}>Chưa có bài viết nào</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tiêu đề</th>
                <th>Danh mục</th>
                <th>Trạng thái</th>
                <th>Lượt xem</th>
                <th>Ngày đăng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map(b => (
                <tr key={b.id}>
                  <td>
                    {b.thumbnail_url
                      ? <img src={b.thumbnail_url} alt="" className={styles.thumb} />
                      : <div className={styles.noThumb}><ImageIcon size={16} /></div>
                    }
                  </td>
                  <td>
                    <div className={styles.blogTitle}>{b.title}</div>
                    {b.is_featured === 1 && (
                      <span className={styles.featuredBadge}>
                        <Star size={11} fill="currentColor" /> Nổi bật
                      </span>
                    )}
                  </td>
                  <td><span className={styles.category}>{b.category}</span></td>
                  <td>
                    <span
                      className={styles.status}
                      style={{ '--c': STATUS_COLOR[b.status] }}
                    >
                      {STATUS_LABEL[b.status]}
                    </span>
                  </td>
                  <td className={styles.views}>{b.view_count?.toLocaleString()}</td>
                  <td className={styles.date}>
                    {formatBlogDate(getBlogDateValue(b), {
                      fallback: b.status === 'published' ? 'Chưa có ngày' : '—',
                      month: '2-digit',
                    })}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => openEdit(b)}
                        disabled={loadingEdit === b.id}
                      >
                        {loadingEdit === b.id
                          ? <><Loader2 size={13} className={styles.spinIcon} /> Đang tải</>
                          : <><Pencil size={13} /> Sửa</>
                        }
                      </button>
                      <button className={styles.delBtn} onClick={() => setDeleting(b)}>
                        <Trash2 size={13} /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className={styles.pagination}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Trước</button>
          <span>Trang {page} / {pagination.total_pages}</span>
          <button disabled={page >= pagination.total_pages} onClick={() => setPage(p => p + 1)}>Sau →</button>
        </div>
      )}

      {/* Modal xác nhận xóa — giữ dạng popup nhỏ vì là hành động nguy hiểm cần xác nhận nhanh */}
      {deleting && (
        <div className={styles.overlay} onClick={() => setDeleting(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <div className={styles.confirmIcon}><Trash size={28} /></div>
            <h3>Xóa bài viết?</h3>
            <p>Bài viết <strong>"{deleting.title}"</strong> sẽ bị xóa vĩnh viễn và không thể khôi phục.</p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleting(null)}>Hủy</button>
              <button className={styles.deleteConfirmBtn} onClick={handleDelete}>Xóa vĩnh viễn</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
