import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const SITE_URL = 'https://viethuonglogistics.com'
const API_URL = (process.env.VITE_API_URL || 'https://viethuonglogistics.onrender.com/api')
  .replace(/\/+$/, '')

const staticPages = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/ve-chung-toi', priority: '0.8', changefreq: 'monthly' },
  { path: '/dich-vu', priority: '0.9', changefreq: 'weekly' },
  { path: '/tin-tuc', priority: '0.9', changefreq: 'daily' },
  { path: '/giai-dap', priority: '0.7', changefreq: 'monthly' },
  { path: '/chi-nhanh', priority: '0.8', changefreq: 'monthly' },
]

const fallbackServices = [
  'van-chuyen-noi-dia',
  'van-chuyen-quoc-te',
  'logistics-kho-bai',
  'chuyen-phat-nhanh',
]

const escapeXml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

async function fetchData(path) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(12000),
  })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  return response.json()
}

async function generate() {
  let services = fallbackServices.map((slug) => ({ slug }))
  let blogs = []

  try {
    const [serviceResponse, blogResponse] = await Promise.all([
      fetchData('/services-page/items'),
      fetchData('/blogs?status=published&limit=1000'),
    ])
    if (Array.isArray(serviceResponse.data) && serviceResponse.data.length) {
      services = serviceResponse.data
    }
    if (Array.isArray(blogResponse.data)) blogs = blogResponse.data
  } catch (error) {
    console.warn(`[sitemap] Không tải được dữ liệu động, dùng danh sách dự phòng: ${error.message}`)
  }

  const pages = [
    ...staticPages,
    ...services
      .filter((item) => item.slug)
      .map((item) => ({
        path: `/dich-vu/${encodeURIComponent(item.slug)}`,
        priority: '0.8',
        changefreq: 'monthly',
        lastmod: item.updated_at || item.created_at,
      })),
    ...blogs
      .filter((item) => item.slug)
      .map((item) => ({
        path: `/tin-tuc/${encodeURIComponent(item.slug)}`,
        priority: '0.7',
        changefreq: 'monthly',
        lastmod: item.updated_at || item.published_at || item.created_at,
      })),
  ]

  const uniquePages = [...new Map(pages.map((page) => [page.path, page])).values()]
  const entries = uniquePages.map((page) => {
    const date = page.lastmod ? new Date(page.lastmod) : null
    const lastmod = date && !Number.isNaN(date.getTime())
      ? `\n    <lastmod>${date.toISOString().slice(0, 10)}</lastmod>`
      : ''
    return `  <url>
    <loc>${escapeXml(new URL(page.path, `${SITE_URL}/`).href)}</loc>${lastmod}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  }).join('\n')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`

  await writeFile(resolve('public/sitemap.xml'), sitemap, 'utf8')
  console.log(`[sitemap] Đã tạo ${uniquePages.length} URL.`)
}

generate().catch((error) => {
  console.error(`[sitemap] Không thể tạo sitemap: ${error.message}`)
  process.exitCode = 1
})
