import { Helmet } from 'react-helmet-async'
import logo from '../../assets/logofooter.png'

export const SITE_URL = 'https://viethuonglogistics.com'
export const SITE_NAME = 'Việt Hương Logistics'

const DEFAULT_TITLE = 'Việt Hương Logistics | Vận tải và Logistics toàn quốc'
const DEFAULT_DESCRIPTION =
  'Việt Hương Logistics cung cấp dịch vụ vận chuyển nội địa, quốc tế, logistics kho bãi và chuyển phát nhanh.'

function absoluteUrl(value = '') {
  if (!value) return SITE_URL
  try {
    return new URL(value, `${SITE_URL}/`).href
  } catch {
    return SITE_URL
  }
}

function asText(value, fallback = '') {
  if (typeof value === 'string') return value.trim() || fallback
  if (typeof value === 'number') return String(value)
  if (value && typeof value === 'object') {
    return asText(value.vi || value.en, fallback)
  }
  return fallback
}

export default function Seo({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image = logo,
  type = 'website',
  noindex = false,
  publishedTime,
  modifiedTime,
  structuredData,
}) {
  const canonical = absoluteUrl(path)
  const imageUrl = absoluteUrl(image)
  const robots = noindex ? 'noindex, nofollow' : 'index, follow'
  const safeTitle = asText(title, DEFAULT_TITLE)
  const safeDescription = asText(description, DEFAULT_DESCRIPTION)

  return (
    <Helmet>
      <html lang="vi" />
      <title>{safeTitle}</title>
      <meta name="description" content={safeDescription} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />

      <meta property="og:locale" content="vi_VN" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={safeTitle} />
      <meta property="og:description" content={safeDescription} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={safeTitle} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={safeTitle} />
      <meta name="twitter:description" content={safeDescription} />
      <meta name="twitter:image" content={imageUrl} />

      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {structuredData && (
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      )}
    </Helmet>
  )
}
