// src/services/api.js
// Tất cả call API backend đều đi qua file này

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export function resolveApiMediaUrl(url) {
  if (!url || typeof url !== 'string') return ''
  const value = url.trim()
  if (!value || /^(?:https?:|data:|blob:)/i.test(value)) return value

  // Assets do Vite quản lý phải tiếp tục dùng origin của frontend.
  if (value.startsWith('/assets/') || value.startsWith('/src/')) return value

  try {
    const frontendOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
    const apiOrigin = new URL(BASE_URL, frontendOrigin).origin
    return new URL(value.replace(/^\.?\//, ''), `${apiOrigin}/`).href
  } catch {
    return value
  }
}

export function resolveApiMediaInHtml(html = '') {
  if (typeof html !== 'string' || !html.includes('<img')) return html
  return html.replace(
    /(<img\b[^>]*\bsrc=["'])([^"']+)(["'])/gi,
    (_, before, url, quote) => `${before}${resolveApiMediaUrl(url)}${quote}`,
  )
}

// ─── Helper: gắn token vào header ───────────────────────────
function authHeader() {
  const token = localStorage.getItem('vh_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ─── Helper: fetch wrapper ───────────────────────────────────
async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
      ...options.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || `Lỗi ${res.status}`)
  return data
}

// FormData request (upload ảnh) — không set Content-Type để browser tự set boundary
async function requestForm(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...authHeader(),
      ...options.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || `Lỗi ${res.status}`)
  return data
}

// ════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════
export const authApi = {
  login: (username, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  getMe: () => request('/auth/me'),

  updateProfile: (data) =>
    request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (current_password, new_password) =>
    request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password }),
    }),
}

// ════════════════════════════════════════════════════════════
// BLOG / TIN TỨC
// ════════════════════════════════════════════════════════════
export const blogApi = {
  getCategories: () => request('/blogs/categories'),

  // Public
  getList: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/blogs${qs ? '?' + qs : ''}`)
  },
  getOne: (slugOrId) => request(`/blogs/${slugOrId}`),

  // Admin
  adminList: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/blogs/admin/list${qs ? '?' + qs : ''}`)
  },
  adminGetOne: (id) => request(`/blogs/admin/${id}`),
  create: (formData) =>
    requestForm('/blogs/admin', { method: 'POST', body: formData }),

  update: (id, formData) =>
    requestForm(`/blogs/admin/${id}`, { method: 'PUT', body: formData }),

  uploadContentImage: (file) => {
    const fd = new FormData()
    fd.append('image', file)
    return requestForm('/blogs/admin/upload-content-image', { method: 'POST', body: fd })
  },

  delete: (id) => request(`/blogs/admin/${id}`, { method: 'DELETE' }),
}

// ════════════════════════════════════════════════════════════
// WEBSITE SETTINGS
// ════════════════════════════════════════════════════════════
export const homePageApi = {
  get: () => request('/home-page'),

  update: (data) =>
    request('/home-page', { method: 'PUT', body: JSON.stringify(data) }),

  uploadImage: (file) => {
    const fd = new FormData()
    fd.append('image', file)
    return requestForm('/home-page/upload-image', { method: 'POST', body: fd })
  },
}

export const cmsHistoryApi = {
  getList: ({ module = '', limit = 50 } = {}) => {
    const params = new URLSearchParams({ limit: String(limit) })
    if (module) params.set('module', module)
    return request(`/cms-revisions?${params.toString()}`)
  },
  delete: (source, id) => request(`/cms-revisions/${source}/${id}`, { method: 'DELETE' }),
}

export const aboutPageApi = {
  get: () => request('/about'),
}

// ════════════════════════════════════════════════════════════
// PARTNERS / ĐỐI TÁC
// ════════════════════════════════════════════════════════════
export const servicePageApi = {
  getPage: () => request('/services-page'),
  getItems: () => request('/services-page/items'),
}

export const partnerApi = {
  getList: () => request('/partners'),
  adminList: () => request('/partners/admin'),
  create: (formData) =>
    requestForm('/partners/admin', { method: 'POST', body: formData }),
  update: (id, formData) =>
    requestForm(`/partners/admin/${id}`, { method: 'PUT', body: formData }),
  delete: (id) => request(`/partners/admin/${id}`, { method: 'DELETE' }),
}

// ════════════════════════════════════════════════════════════
// CONTACT / LIÊN HỆ
// ════════════════════════════════════════════════════════════
export const branchApi = {
  getList: () => request('/branches'),
  adminList: () => request('/branches/admin'),
  create: (data) =>
    request('/branches/admin', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/branches/admin/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/branches/admin/${id}`, { method: 'DELETE' }),
}
export const contactApi = {
  // Public — gửi form liên hệ
  submit: (data) =>
    request('/contact', { method: 'POST', body: JSON.stringify(data) }),

  // Admin
  getList: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/contact/admin${qs ? '?' + qs : ''}`)
  },
  getStats: () => request('/contact/admin/stats'),
  updateStatus: (id, status) =>
    request(`/contact/admin/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  delete: (id) => request(`/contact/admin/${id}`, { method: 'DELETE' }),
}

// ════════════════════════════════════════════════════════════
// FAQ INQUIRIES / THẮC MẮC KHÁCH HÀNG
// ════════════════════════════════════════════════════════════
export const faqApi = {
  // Public — khách gửi thắc mắc (không cần auth)
  submit: (data) =>
    request('/faq-inquiries', { method: 'POST', body: JSON.stringify(data) }),

  // Admin — lấy danh sách
  getList: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/faq-inquiries/admin${qs ? '?' + qs : ''}`)
  },
  getStats: () => request('/faq-inquiries/admin/stats'),

  // Admin — đổi trạng thái
  updateStatus: (id, status) =>
    request(`/faq-inquiries/admin/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Admin — xóa
  delete: (id) => request(`/faq-inquiries/admin/${id}`, { method: 'DELETE' }),
}
// ════════════════════════════════════════════════════════════
// FAQ CONTENT — Nội dung FAQ tĩnh (admin chỉnh sửa)
// ════════════════════════════════════════════════════════════
export const faqContentApi = {
  getAll: () => request('/faq-content'),

  getCategories: () => request('/faq-content/admin/categories'),
  createCategory: (data) =>
    request('/faq-content/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) =>
    request(`/faq-content/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id) =>
    request(`/faq-content/admin/categories/${id}`, { method: 'DELETE' }),

  getItems: (catId) => request(`/faq-content/admin/categories/${catId}/items`),
  createItem: (catId, data) =>
    request(`/faq-content/admin/categories/${catId}/items`, { method: 'POST', body: JSON.stringify(data) }),
  updateItem: (id, data) =>
    request(`/faq-content/admin/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteItem: (id) =>
    request(`/faq-content/admin/items/${id}`, { method: 'DELETE' }),
}
