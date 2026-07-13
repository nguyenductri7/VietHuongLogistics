import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Helmet } from 'react-helmet-async'
import { blogApi, resolveApiMediaUrl } from '../../services/api'
import { FALLBACK_BLOG_POSTS, getFallbackPosts } from './blogFallback'
import { ALL_BLOG_CATEGORIES, DEFAULT_BLOG_CATEGORIES } from './blogCategories'
import { readTimeFromPost } from './blogReadTime'
import { formatBlogDate, getBlogDateValue } from './blogDate'
import styles from './BlogPage.module.scss'

gsap.registerPlugin(ScrollTrigger)

// Gradient mặc định cho ảnh bìa khi bài viết không có thumbnail_url
const FALLBACK_GRADIENTS = [
  ['#0f3460', '#16213e'],
  ['#1a1a2e', '#0d2137'],
  ['#1e3a2f', '#0f2318'],
  ['#2d1b4e', '#1a0f2e'],
  ['#2e1a0e', '#1c0f08'],
  ['#1c2b3a', '#0a1520'],
]

function gradientFor(id) {
  // băm id thành index ổn định, để mỗi bài luôn ra cùng 1 gradient
  const hash = String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return FALLBACK_GRADIENTS[hash % FALLBACK_GRADIENTS.length]
}

function readTimeFromContent(content = '') {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 200))
  return `${minutes} phút đọc`
}

function PostCard({ post }) {
  const navigate = useNavigate()
  const [gradFrom, gradTo] = gradientFor(post.id)
  const imageUrl = resolveApiMediaUrl(post.thumbnail_url)
  const hasImage = !!imageUrl

  return (
    <article
      className={styles.card}
      onClick={() => navigate(`/tin-tuc/${post.slug || post.id}`)}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/tin-tuc/${post.slug || post.id}`)}
      role="link"
      aria-label={`Đọc bài: ${post.title}`}
    >
      <div
        className={styles.cardImg}
        style={
          hasImage
            ? { backgroundColor: gradFrom, backgroundImage: `url("${imageUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: `linear-gradient(145deg, ${gradFrom}, ${gradTo})` }
        }
      >
        <span className={styles.catBadge}>{post.category}</span>
        <div className={styles.imgOverlay} />
      </div>
      <div className={styles.cardBody}>
        <div className={styles.meta}>
          <span className={styles.catText}>{post.category}</span>
          <span className={styles.dot}>·</span>
          <time>{formatBlogDate(getBlogDateValue(post), { fallback: 'Đang cập nhật' })}</time>
          <span className={styles.dot}>·</span>
          <span>{readTimeFromPost(post)}</span>
        </div>
        <h3 className={styles.cardTitle}>{post.title}</h3>
        <p className={styles.excerpt}>{post.excerpt}</p>
        <span className={styles.readMore}>
          Đọc Thêm
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </article>
  )
}

export default function BlogPage() {
  const sectionRef = useRef(null)
  const [active, setActive] = useState(ALL_BLOG_CATEGORIES)
  const [categories, setCategories] = useState(DEFAULT_BLOG_CATEGORIES)
  const [posts, setPosts] = useState(FALLBACK_BLOG_POSTS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false
    blogApi.getCategories()
      .then((res) => {
        if (!ignore && Array.isArray(res.data) && res.data.length) setCategories(res.data)
      })
      .catch(() => {})
    return () => { ignore = true }
  }, [])

  // ── Lấy danh sách bài viết đã đăng (published) từ backend ──
  useEffect(() => {
    let ignore = false
    async function fetchPosts() {
      setLoading(true)
      setError('')
      try {
        const params = { status: 'published', limit: 100 }
        if (active !== ALL_BLOG_CATEGORIES) params.category = active
        const res = await blogApi.getList(params)
        if (!ignore) setPosts(res.data || [])
      } catch (err) {
        if (!ignore) {
          setPosts(getFallbackPosts(active))
          setError('')
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    fetchPosts()
    return () => { ignore = true }
  }, [active])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    const ctx = gsap.context(() => {
      const heroItems = gsap.utils.toArray('.bp-hero')
      if (heroItems.length) {
        gsap.fromTo(heroItems, { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1 })
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (loading) return
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.bp-card')
      if (cards.length) {
        gsap.fromTo(cards,
          { opacity: 0, y: 28, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'power3.out', stagger: 0.08 }
        )
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [loading, posts])

  return (
    <>
      <Helmet>
        <title>Tin Tức | Vận Tải Việt Hương</title>
        <meta name="description" content="Cập nhật tin tức, xu hướng và phân tích mới nhất về ngành logistics và vận tải Việt Nam." />
      </Helmet>

      <main ref={sectionRef} className={styles.page}>
        {/* Hero */}
        <div className={styles.hero}>
          <div className="container">
            <p className={`${styles.eyebrow} bp-hero`}>Tin Tức &amp; Góc Nhìn</p>
            <h1 className={`${styles.heroTitle} bp-hero`}>
              Cập Nhật Mới Nhất<br />
              <em className={styles.accent}>Ngành Vận Tải</em>
            </h1>
            <p className={`${styles.heroSub} bp-hero`} style={{ marginBottom: 0 }}>
              Xu hướng, công nghệ và phân tích chuyên sâu từ đội ngũ Việt Hương.
            </p>
          </div>

          <div className={styles.heroWave} aria-hidden="true">
            <svg viewBox="0 0 1440 70" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,40 C240,70 480,10 720,40 C960,70 1200,10 1440,40 L1440,70 L0,70 Z" fill="#ffffff" />
            </svg>
          </div>
        </div>

        <div className="container">
          {/* Filter tabs */}
          <div className={styles.filters}>
            {[ALL_BLOG_CATEGORIES, ...categories].map(cat => (
              <button
                key={cat}
                className={`${styles.filterBtn} ${active === cat ? styles.filterActive : ''}`}
                onClick={() => setActive(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* States: loading / error / empty / grid */}
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#8899aa' }}>
              Đang tải bài viết...
            </div>
          ) : error ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#cc1a1a' }}>
              {error}
            </div>
          ) : posts.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#8899aa' }}>
              Chưa có bài viết nào trong danh mục này.
            </div>
          ) : (
            <div className={styles.grid}>
              {posts.map((post) => (
                <div key={post.id} className="bp-card">
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
