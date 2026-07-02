import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Blog.module.scss'

gsap.registerPlugin(ScrollTrigger)

const posts = [
  {
    id: 'logistics-xanh-tuong-lai-ben-vung',
    cat: 'Xu Hướng',
    date: '20 Tháng 5, 2025',
    title: 'Logistics xanh: Tương lai bền vững cho ngành vận tải Việt Nam',
    excerpt: 'Xu hướng giảm phát thải carbon và chuyển đổi sang xe điện đang định hình lại ngành logistics toàn cầu...',
    readTime: '5 phút đọc',
    gradFrom: '#0f3460',
    gradTo: '#16213e',
  },
  {
    id: 'ai-va-du-lieu-lon-toi-uu-van-tai',
    cat: 'Công Nghệ',
    date: '14 Tháng 5, 2025',
    title: 'AI và dữ liệu lớn trong tối ưu hóa tuyến đường vận tải',
    excerpt: 'Ứng dụng trí tuệ nhân tạo giúp các doanh nghiệp logistics tiết kiệm đến 30% chi phí nhiên liệu...',
    readTime: '7 phút đọc',
    gradFrom: '#1a1a2e',
    gradTo: '#0d2137',
  },
  {
    id: 'viet-huong-mo-trung-tam-phan-phoi-mien-bac',
    cat: 'Tin Tức',
    date: '8 Tháng 5, 2025',
    title: 'Việt Hương mở thêm 3 trung tâm phân phối tại miền Bắc',
    excerpt: 'Mở rộng mạng lưới kho bãi nhằm đáp ứng nhu cầu tăng trưởng thương mại điện tử khu vực phía Bắc...',
    readTime: '3 phút đọc',
    gradFrom: '#1e3a2f',
    gradTo: '#0f2318',
  },
  {
    id: 'chuoi-cung-ung-dong-nam-a-co-hoi-vang',
    cat: 'Phân Tích',
    date: '2 Tháng 5, 2025',
    title: 'Chuỗi cung ứng Đông Nam Á: Cơ hội vàng cho logistics Việt',
    excerpt: 'Sự dịch chuyển sản xuất từ Trung Quốc sang ASEAN mở ra làn sóng cơ hội lớn cho các nhà vận tải...',
    readTime: '6 phút đọc',
    gradFrom: '#2d1b4e',
    gradTo: '#1a0f2e',
  },
  {
    id: 'viet-huong-logistics-world-expo-2025',
    cat: 'Sự Kiện',
    date: '25 Tháng 4, 2025',
    title: 'Việt Hương tham dự triển lãm Logistics World Expo 2025',
    excerpt: 'Đại diện Việt Nam tại sự kiện logistics lớn nhất châu Á — cơ hội kết nối và mở rộng quan hệ đối tác...',
    readTime: '4 phút đọc',
    gradFrom: '#2e1a0e',
    gradTo: '#1c0f08',
  },
]

function BlogCard({ post }) {
  const navigate = useNavigate()
  return (
    <article
      className={styles.card}
      onClick={() => navigate(`/tin-tuc/${post.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div
        className={styles.cardImg}
        style={{ background: `linear-gradient(145deg, ${post.gradFrom}, ${post.gradTo})` }}
      >
        <span className={styles.catBadge}>{post.cat}</span>
        <div className={styles.imgOverlay} />
      </div>
      <div className={styles.cardBody}>
        <div className={styles.meta}>
          <span className={styles.cat}>{post.cat}</span>
          <span className={styles.dot}>·</span>
          <time>{post.date}</time>
          <span className={styles.dot}>·</span>
          <span>{post.readTime}</span>
        </div>
        <h3 className={styles.title}>{post.title}</h3>
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

export default function Blog() {
  const sectionRef = useRef(null)
  const trackRef   = useRef(null)
  const tickerTl   = useRef(null)
  const navigate   = useNavigate()

  // Header reveal
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.blog-header',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true } }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  // Ticker auto-scroll
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    gsap.set(track, { x: 0 })
    const half = track.scrollWidth / 2
    tickerTl.current = gsap.to(track, {
      x: -half,
      duration: 35,
      ease: 'none',
      repeat: -1,
    })
    return () => { if (tickerTl.current) tickerTl.current.kill() }
  }, [])

  return (
    <section id="blog" ref={sectionRef} className={styles.blog}>
      <div className="container">
        <div className={`${styles.header} blog-header`}>
          <div>
            <p className={styles.sectionLabel}>Tin Tức</p>
            <h2 className={styles.blogTitle}>
              Góc Nhìn<br />
              <em className={styles.accentShine}>Ngành Vận Tải</em>
            </h2>
          </div>
          <button
            className="btn-outline"
            onClick={() => navigate('/tin-tuc')}
          >
            Xem tất cả bài viết
          </button>
        </div>
      </div>

      <div
        className={styles.tickerWrap}
        onMouseEnter={() => tickerTl.current?.pause()}
        onMouseLeave={() => tickerTl.current?.play()}
        aria-label="Tin tức mới nhất"
      >
        <div className={styles.tickerTrack} ref={trackRef}>
          {[...posts, ...posts].map((post, i) => (
            <BlogCard key={i} post={post} />
          ))}
        </div>
        <div className={styles.fadeLeft}  aria-hidden="true" />
        <div className={styles.fadeRight} aria-hidden="true" />
      </div>

      <div className={styles.dots} aria-hidden="true">
        {posts.map((_, i) => (
          <span key={i} className={i === 0 ? styles.dotActive : styles.dotInactive} />
        ))}
      </div>
    </section>
  )
}
