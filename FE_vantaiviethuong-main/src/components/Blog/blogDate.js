export function getBlogDateValue(post = {}) {
  const candidates = [post.published_at, post.created_at, post.date, post.updated_at]
  return candidates.find(value => parseBlogDate(value)) || ''
}

export function parseBlogDate(value) {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value

  const raw = String(value).trim()
  if (!raw || raw.toLowerCase() === 'invalid date') return null
  if (/^0{4}-0{2}-0{2}/.test(raw)) return null

  const normalized = /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(raw)
    ? raw.replace(' ', 'T')
    : raw

  const parsed = new Date(normalized)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function formatBlogDate(value, options = {}) {
  const {
    fallback = '',
    day = 'numeric',
    month = 'long',
    year = 'numeric',
  } = options

  const parsed = parseBlogDate(value)
  if (!parsed) return fallback

  return parsed.toLocaleDateString('vi-VN', { day, month, year })
}
