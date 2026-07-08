import { useRef, useEffect, useCallback, useMemo, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Partners.module.scss'
import { homePageApi, partnerApi, resolveApiMediaUrl } from '../../services/api'

gsap.registerPlugin(ScrollTrigger)

const logoModules = import.meta.glob(
  '../../assets/ảnh cty hợp tác/*.png',
  { eager: true }
)
const LOGO_ALTS = ['Maersk', 'MSC', 'CMA CGM', 'COSCO', 'Evergreen']
const logos = Object.entries(logoModules)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, mod], i) => ({ src: mod.default, alt: LOGO_ALTS[i] ?? 'Logo ' + (i + 1) }))

const DEFAULT_REVIEWS_TITLE = 'Đánh giá từ khách hàng'
const DEFAULT_REVIEWS_SUBTITLE = 'Những phản hồi thực tế từ các doanh nghiệp đã đồng hành cùng Việt Hương Logistics.'

const DEFAULT_REVIEWS = [
  {
    id: 'a',
    initials: 'TQ',
    name: 'Tony Quoc',
    company: 'BITI France',
    avatarBg: '#dbeafe',
    avatarColor: '#a5cacd',
    gradFrom: '#9dcccb',
    sunColor: 'rgba(100,180,255,0.22)',
    quote: 'Tôi rất hài lòng với dịch vụ logistics của Việt Hương. Các nhân viên hỗ trợ tận tình, chuyên nghiệp. Thời gian giao nhận hàng luôn được đảm bảo chính xác.',
  },
  {
    id: 'b',
    initials: 'BN',
    name: 'Bảo Nguyên',
    company: 'BITI VN',
    avatarBg: '#fef3c7',
    avatarColor: '#92400e',
    gradFrom: '#f1dc88',
    sunColor: 'rgba(255,200,80,0.24)',
    quote: 'Dịch vụ chuyên nghiệp và đáng tin cậy. Hệ thống vận chuyển tiên tiến mang lại sự hài lòng tuyệt đối. Đảm bảo an toàn hàng hóa là điều tôi thích nhất.',
  },
  {
    id: 'c',
    initials: 'JT',
    name: 'Jessie Truong',
    company: 'Unilever VN',
    avatarBg: '#d1fae5',
    avatarColor: '#065f46',
    gradFrom: '#6ab388',
    sunColor: 'rgba(147, 167, 198, 0.22)',
    quote: 'Rất chuyên nghiệp trong xử lý hàng hóa. Vận chuyển an toàn, đúng hạn — tôi hoàn toàn tin tưởng và sẽ tiếp tục hợp tác lâu dài.',
  },
  {
    id: 'd',
    initials: 'PH',
    name: 'Phạm Quốc Hùng',
    company: 'CFO — Masan Group',
    avatarBg: '#fce7f3',
    avatarColor: '#9d174d',
    gradFrom: '#a0748c',
    sunColor: 'rgba(200,100,255,0.20)',
    quote: 'Từ khi hợp tác với Việt Hương, chi phí vận chuyển giảm 18% trong khi chất lượng dịch vụ tăng lên rõ rệt. Đó là điều hiếm thấy trên thị trường.',
  },
]

function normalizeReviews(reviews = []) {
  const source = Array.isArray(reviews) ? reviews : DEFAULT_REVIEWS
  return source.map((review, index) => {
    const fallback = DEFAULT_REVIEWS[index % DEFAULT_REVIEWS.length]
    return {
      ...fallback,
      ...(review || {}),
    }
  })
}

function splitHighlightTitle(title = '') {
  const value = String(title || DEFAULT_REVIEWS_TITLE).trim()
  const words = value.split(/\s+/).filter(Boolean)

  if (words.length <= 2) {
    return { main: '', accent: value }
  }

  return {
    main: words.slice(0, -2).join(' '),
    accent: words.slice(-2).join(' '),
  }
}

function Stars() {
  return (
    <div className={styles.stars} aria-label="5 sao">
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

function Avatar({ initials, bg, color, size }) {
  const s = size || 52
  return (
    <div
      className={styles.avatar}
      style={{ width: s, height: s, background: bg, color: color }}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

export default function Partners() {
  const sectionRef = useRef(null)
  const tickerRef  = useRef(null)
  const tickerTl   = useRef(null)
  const cardRefs   = useRef([])
  const [managedLogos, setManagedLogos] = useState([])
  const [reviewContent, setReviewContent] = useState({
    title: DEFAULT_REVIEWS_TITLE,
    subtitle: DEFAULT_REVIEWS_SUBTITLE,
    reviews: DEFAULT_REVIEWS,
  })
  const displayLogos = useMemo(
    () => (managedLogos.length ? managedLogos : logos),
    [managedLogos],
  )
  const displayReviews = useMemo(
    () => normalizeReviews(reviewContent.reviews),
    [reviewContent.reviews],
  )
  const leadReview = displayReviews[0]
  const topReviews = displayReviews.slice(1, 3)
  const wideReview = displayReviews[3]
  const extraReviews = displayReviews.slice(4)
  const reviewTitle = splitHighlightTitle(reviewContent.title || DEFAULT_REVIEWS_TITLE)

  useEffect(() => {
    let cancelled = false
    Promise.allSettled([partnerApi.getList(), homePageApi.get()])
      .then(([partnerResult, homeResult]) => {
        if (cancelled) return

        const partnerData = partnerResult.status === 'fulfilled' ? partnerResult.value?.data : []
        const nextLogos = Array.isArray(partnerData)
          ? partnerData
              .filter(item => item.logo_url)
              .map(item => ({
                src: resolveApiMediaUrl(item.logo_url),
                alt: item.name || 'Logo Ä‘á»‘i tĂ¡c',
                href: item.website_url || '',
              }))
          : []
        setManagedLogos(nextLogos)

        const partnersSection = homeResult.status === 'fulfilled'
          ? homeResult.value?.data?.partners_section
          : null

        if (partnersSection && typeof partnersSection === 'object') {
          setReviewContent({
            title: partnersSection.reviews_title || DEFAULT_REVIEWS_TITLE,
            subtitle: partnersSection.reviews_subtitle || DEFAULT_REVIEWS_SUBTITLE,
            reviews: Array.isArray(partnersSection.reviews)
              ? normalizeReviews(partnersSection.reviews)
              : DEFAULT_REVIEWS,
          })
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const track = tickerRef.current
    if (!track) return
    if (tickerTl.current) tickerTl.current.kill()
    gsap.set(track, { x: 0 })
    const half = track.scrollWidth / 2
    tickerTl.current = gsap.to(track, {
      x: -half, duration: 28, ease: 'none', repeat: -1,
    })
    return () => { if (tickerTl.current) tickerTl.current.kill() }
  }, [displayLogos])

  const handleMouseMove = useCallback((e, card) => {
    const rect = card.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    card.style.setProperty('--mx', x + '%')
    card.style.setProperty('--my', y + '%')
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        section.querySelector('.js-eyebrow'),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: section, start: 'top 82%', once: true } }
      )
      gsap.fromTo(
        section.querySelector('.js-title'),
        { opacity: 0, y: 32, clipPath: 'inset(100% 0 0 0)' },
        { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)',
          duration: 0.9, ease: 'power4.out', delay: 0.1,
          scrollTrigger: { trigger: section, start: 'top 82%', once: true } }
      )
      gsap.fromTo(
        section.querySelector('.js-sub'),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.22,
          scrollTrigger: { trigger: section, start: 'top 82%', once: true } }
      )
      gsap.fromTo(
        section.querySelector('.js-ticker'),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: section.querySelector('.js-ticker'), start: 'top 88%', once: true } }
      )
      const cards = section.querySelectorAll('.js-card')
      gsap.fromTo(
        cards,
        { opacity: 0, y: 48, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: 'power3.out', stagger: 0.12,
          scrollTrigger: { trigger: section.querySelector('.js-bento'), start: 'top 82%', once: true } }
      )
    }, section)

    const handlers = []
    cardRefs.current.forEach((card) => {
      if (!card) return
      const onMove  = (e) => handleMouseMove(e, card)
      const onEnter = () => gsap.to(card, { y: -10, scale: 1.018, duration: 0.4, ease: 'power2.out', overwrite: 'auto' })
      const onLeave = () => {
        card.style.removeProperty('--mx')
        card.style.removeProperty('--my')
        gsap.to(card, { y: 0, scale: 1, duration: 0.55, ease: 'power3.out', overwrite: 'auto' })
      }
      card.addEventListener('mousemove', onMove)
      card.addEventListener('mouseenter', onEnter)
      card.addEventListener('mouseleave', onLeave)
      handlers.push({ card, onMove, onEnter, onLeave })
    })

    return () => {
      ctx.revert()
      handlers.forEach(({ card, onMove, onEnter, onLeave }) => {
        card.removeEventListener('mousemove', onMove)
        card.removeEventListener('mouseenter', onEnter)
        card.removeEventListener('mouseleave', onLeave)
      })
    }
  }, [handleMouseMove])

  return (
    <section
      id="partners"
      ref={sectionRef}
      className={styles.partners}
      aria-label="Đối tác và khách hàng"
    >
      <div className="container">
        <div className={styles.header}>
          <span className={styles.eyebrow + ' js-eyebrow'}>Đối Tác &amp; Khách Hàng</span>
          <h2 className={styles.title + ' js-title'}>
            Tin Tưởng Bởi <em className={styles.accent}>Hàng Trăm Doanh Nghiệp</em>
          </h2>
          <p className={styles.sub + ' js-sub'}>
            Từ tập đoàn đa quốc gia đến doanh nghiệp vừa và nhỏ —
            Việt Hương đồng hành cùng mọi quy mô.
          </p>
        </div>
      </div>

      <div
        className={styles.tickerWrap + ' js-ticker'}
        onMouseEnter={() => tickerTl.current && tickerTl.current.pause()}
        onMouseLeave={() => tickerTl.current && tickerTl.current.play()}
        aria-hidden="true"
      >
        <div className={styles.tickerTrack} ref={tickerRef}>
          {[...displayLogos, ...displayLogos, ...displayLogos].map((logo, i) => (
            <div key={i} className={styles.logoPill}>
              <img src={logo.src} alt={logo.alt} loading="lazy" />
            </div>
          ))}
        </div>
      </div>

      <div className="container">
        <div className={styles.reviewHeader}>
          <span className={styles.eyebrow}>Khách hàng nói gì</span>
          <h2 className={styles.reviewTitle}>
            {reviewTitle.main && <>{reviewTitle.main} </>}
            <em className={styles.accent}>{reviewTitle.accent}</em>
          </h2>
          <p className={styles.reviewSub}>{reviewContent.subtitle || DEFAULT_REVIEWS_SUBTITLE}</p>
        </div>

        {displayReviews.length > 0 ? (
          <div className={styles.bento + ' js-bento'}>

            {leadReview && (
              <article
                className={styles.cardTall + ' js-card'}
                ref={(el) => { if (el) cardRefs.current[0] = el }}
                style={{ '--grad-from': leadReview.gradFrom, '--sun-color': leadReview.sunColor }}
              >
                <Stars />
                <span className={styles.openQuote}>"</span>
                <p className={styles.quoteLg}>{leadReview.quote}</p>
                <footer className={styles.cardFooter}>
                  <Avatar initials={leadReview.initials} bg={leadReview.avatarBg} color={leadReview.avatarColor} />
                  <div>
                    <strong className={styles.name}>{leadReview.name}</strong>
                    <span className={styles.role}>{leadReview.company}</span>
                  </div>
                </footer>
              </article>
            )}

            {(topReviews.length > 0 || wideReview || extraReviews.length > 0) && (
              <div className={styles.rightCol}>
                {topReviews.length > 0 && (
                  <div className={styles.topRow}>
                    {topReviews.map((r, i) => (
                      <article
                        key={r.id || i}
                        className={styles.cardSmall + ' js-card'}
                        ref={(el) => { if (el) cardRefs.current[i + 1] = el }}
                        style={{ '--grad-from': r.gradFrom, '--sun-color': r.sunColor }}
                      >
                        <Stars />
                        <Avatar initials={r.initials} bg={r.avatarBg} color={r.avatarColor} size={48} />
                        <strong className={styles.name} style={{ marginTop: 10 }}>{r.name}</strong>
                        <span className={styles.role}>{r.company}</span>
                        <p className={styles.quoteSm}>"{r.quote}"</p>
                      </article>
                    ))}
                  </div>
                )}

                {wideReview && (
                  <article
                    className={styles.cardWide + ' js-card'}
                    ref={(el) => { if (el) cardRefs.current[3] = el }}
                    style={{ '--grad-from': wideReview.gradFrom, '--sun-color': wideReview.sunColor }}
                  >
                    <div className={styles.wideLeft}>
                      <Avatar initials={wideReview.initials} bg={wideReview.avatarBg} color={wideReview.avatarColor} size={52} />
                      <div>
                        <strong className={styles.name}>{wideReview.name}</strong>
                        <span className={styles.role}>{wideReview.company}</span>
                        <Stars />
                      </div>
                    </div>
                    <p className={styles.wideQuote}>"{wideReview.quote}"</p>
                  </article>
                )}

                {extraReviews.length > 0 && (
                  <div className={styles.extraReviews}>
                    {extraReviews.map((r, i) => (
                      <article
                        key={r.id || `extra-${i}`}
                        className={styles.cardSmall + ' js-card'}
                        ref={(el) => { if (el) cardRefs.current[i + 4] = el }}
                        style={{ '--grad-from': r.gradFrom, '--sun-color': r.sunColor }}
                      >
                        <Stars />
                        <Avatar initials={r.initials} bg={r.avatarBg} color={r.avatarColor} size={48} />
                        <strong className={styles.name} style={{ marginTop: 10 }}>{r.name}</strong>
                        <span className={styles.role}>{r.company}</span>
                        <p className={styles.quoteSm}>"{r.quote}"</p>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        ) : (
          <p className={styles.emptyReviews}>Các đánh giá khách hàng sẽ được cập nhật sớm.</p>
        )}
      </div>
    </section>
  )
}
