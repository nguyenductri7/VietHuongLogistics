import { useRef, useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { Helmet } from 'react-helmet-async'
import { blogApi, resolveApiMediaInHtml, resolveApiMediaUrl } from '../../services/api'
import { BLOG_DEFAULT_IMAGE, getFallbackPost, getFallbackRelated } from './blogFallback'
import styles from './BlogDetailPage.module.scss'

// Gradient mặc định khi bài viết không có thumbnail_url (đồng bộ với BlogPage.jsx)
const FALLBACK_GRADIENTS = [
  ['#0f3460', '#16213e'],
  ['#1a1a2e', '#0d2137'],
  ['#1e3a2f', '#0f2318'],
  ['#2d1b4e', '#1a0f2e'],
  ['#2e1a0e', '#1c0f08'],
  ['#1c2b3a', '#0a1520'],
]

function gradientFor(id) {
  const hash = String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return FALLBACK_GRADIENTS[hash % FALLBACK_GRADIENTS.length]
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function readTimeFromContent(content = '') {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 200))
  return `${minutes} phút đọc`
}

export default function BlogDetailPage() {
  const { id } = useParams() // có thể là slug hoặc id, tuỳ route bạn khai báo
  const navigate = useNavigate()
  const pageRef = useRef(null)

  const [post, setPost] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // ── Lấy bài viết hiện tại + bài liên quan từ backend ──
  useEffect(() => {
    let ignore = false
    async function fetchData() {
      setLoading(true)
      setNotFound(false)
      try {
        const detail = await blogApi.getOne(id)
        if (ignore) return
        const current = detail.data || detail
        setPost(current)

        // Lấy bài liên quan: cùng category, loại trừ bài hiện tại
        const listRes = await blogApi.getList({ status: 'published', limit: 12 })
        if (ignore) return
        const others = (listRes.data || [])
          .filter(p => p.id !== current.id)
          .slice(0, 3)
        setRelated(others)
      } catch (err) {
        if (!ignore) {
          const fallback = getFallbackPost(id)
          if (fallback) {
            setPost(fallback)
            setRelated(getFallbackRelated(fallback.id))
            setNotFound(false)
          } else {
            setNotFound(true)
          }
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    fetchData()
    return () => { ignore = true }
  }, [id])

  useEffect(() => {
    if (loading || notFound) return
    window.scrollTo({ top: 0, behavior: 'instant' })
    const ctx = gsap.context(() => {
      gsap.fromTo('.bd-hero',
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1 }
      )
      gsap.fromTo('.bd-body',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.3 }
      )
    }, pageRef)
    return () => ctx.revert()
  }, [id, loading, notFound])

  if (loading) {
    return (
      <main className={styles.notFound}>
        <div className="container">
          <p>Đang tải bài viết...</p>
        </div>
      </main>
    )
  }

  if (notFound || !post) {
    return (
      <main className={styles.notFound}>
        <div className="container">
          <h1>Bài viết không tồn tại</h1>
          <button onClick={() => navigate('/tin-tuc')} className={styles.backBtn}>
            ← Quay lại tin tức
          </button>
        </div>
      </main>
    )
  }

  // Bài mới (từ TipTap) lưu dạng HTML thật → render thẳng bằng dangerouslySetInnerHTML.
  // Bài cũ (markdown-lite ##, **) không chứa tag HTML → giữ cách parse dòng-theo-dòng như trước.
  const isHtml = (raw = '') => /<\/?[a-z][\s\S]*>/i.test(raw)

  const renderContent = (raw = '') => {
    if (isHtml(raw)) {
      return <div dangerouslySetInnerHTML={{ __html: resolveApiMediaInHtml(raw) }} />
    }
    return raw.trim().split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return <h2 key={i} className={styles.h2}>{line.slice(3)}</h2>
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className={styles.bold}>{line.slice(2, -2)}</p>
      }
      if (line.trim() === '') return null
      return <p key={i} className={styles.para}>{line}</p>
    })
  }

  const heroImage = resolveApiMediaUrl(post.thumbnail_url) || BLOG_DEFAULT_IMAGE
  const readTime = readTimeFromContent(post.content)
  const dateLabel = formatDate(post.published_at || post.created_at)

  return (
    <>
      <Helmet>
        <title>{post.title} | Việt Hương Logistics</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>

      <main ref={pageRef} className={styles.page}>
        {/* Back breadcrumb */}
        <div className={styles.breadcrumb}>
          <div className="container">
            <Link to="/tin-tuc" className={styles.back}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Tin Tức
            </Link>
          </div>
        </div>

        {/* Hero banner */}
        <div
          className={styles.heroBanner}
          style={{ backgroundImage: `url('${heroImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className={`container ${styles.bannerContent}`}>
            <span className={`${styles.catBadge} bd-hero`}>{post.category}</span>
            <h1 className={`${styles.title} bd-hero`}>{post.title}</h1>
            <div className={`${styles.meta} bd-hero`}>
              <time>{dateLabel}</time>
              <span className={styles.dot}>·</span>
              <span>{readTime}</span>
            </div>
          </div>

          <div className={styles.heroWave} aria-hidden="true">
            <svg viewBox="0 0 1440 70" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,40 C240,70 480,10 720,40 C960,70 1200,10 1440,40 L1440,70 L0,70 Z" fill="#ffffff" />
            </svg>
          </div>
        </div>

        {/* Body */}
        <div className="container">
          <div className={styles.layout}>
            {/* Article */}
            <article className={`${styles.article} bd-body`}>
              <p className={styles.lead}>{post.excerpt}</p>
              <div className={styles.content}>
                {renderContent(post.content)}
              </div>
            </article>

            {/* Sidebar */}
            <aside className={`${styles.sidebar} bd-body`}>
              <div className={styles.sideCard}>
                <p className={styles.sideLabel}>Bài viết liên quan</p>
                <div className={styles.relatedList}>
                  {related.map(r => {
                    const [gradFrom, gradTo] = gradientFor(r.id)
                    const imageUrl = resolveApiMediaUrl(r.thumbnail_url)
                    const hasImg = !!imageUrl
                    return (
                      <Link key={r.id} to={`/tin-tuc/${r.slug || r.id}`} className={styles.relatedItem}>
                        <div
                          className={styles.relatedImg}
                          style={
                            hasImg
                              ? { backgroundColor: gradFrom, backgroundImage: `url("${imageUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
                              : { background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }
                          }
                        />
                        <div className={styles.relatedBody}>
                          <span className={styles.relatedCat}>{r.category}</span>
                          <p className={styles.relatedTitle}>{r.title}</p>
                          <span className={styles.relatedTime}>{readTimeFromContent(r.content)}</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>

              <div className={styles.sideCard}>
                <p className={styles.sideLabel}>Liên hệ tư vấn</p>
                <p className={styles.sideText}>Cần giải pháp logistics phù hợp cho doanh nghiệp của bạn?</p>
                <a href="#contact" className={styles.ctaBtn}>Gọi Ngay</a>
              </div>
            </aside>
          </div>
        </div>

        {/* More posts */}
        <div className={styles.morePosts}>
          <div className="container">
            <p className={styles.moreLabel}>Khám phá thêm</p>
            <div className={styles.moreGrid}>
              {related.map(r => {
                const [gradFrom, gradTo] = gradientFor(r.id)
                const imageUrl = resolveApiMediaUrl(r.thumbnail_url)
                const hasImg = !!imageUrl
                return (
                  <Link key={r.id} to={`/tin-tuc/${r.slug || r.id}`} className={styles.moreCard}>
                    <div
                      className={styles.moreImg}
                      style={
                        hasImg
                          ? { backgroundColor: gradFrom, backgroundImage: `url("${imageUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
                          : { background: `linear-gradient(145deg, ${gradFrom}, ${gradTo})` }
                      }
                    >
                      <span className={styles.moreCatBadge}>{r.category}</span>
                    </div>
                    <div className={styles.moreBody}>
                      <p className={styles.moreTitle}>{r.title}</p>
                      <span className={styles.moreTime}>{readTimeFromContent(r.content)}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
