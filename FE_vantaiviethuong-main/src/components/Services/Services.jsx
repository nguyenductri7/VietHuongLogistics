import { useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Services.module.scss'

gsap.registerPlugin(ScrollTrigger)

const services = [
  {
    id: 'domestic',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="6" y="14" width="36" height="24" rx="2" />
        <path d="M6 22h36M18 14v24M6 30h12" />
        <circle cx="14" cy="40" r="3" />
        <circle cx="34" cy="40" r="3" />
      </svg>
    ),
    label: '01',
    title: 'Vận Chuyển Nội Địa',
    desc: 'Mạng lưới 63 tỉnh thành, giao hàng đúng hẹn với đội xe tải trọng tải 1–30 tấn.',
    features: ['Xe tải, container', 'Theo dõi GPS thời gian thực', 'Bảo hiểm hàng hóa'],
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=900&q=80&auto=format',
    size: 'large',
  },
  {
    id: 'international',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 24C4 13 13 4 24 4s20 9 20 20-9 20-20 20S4 35 4 24z" />
        <path d="M4 24h40M24 4c-5.5 6-8.5 12.5-8.5 20s3 14 8.5 20M24 4c5.5 6 8.5 12.5 8.5 20s-3 14-8.5 20" />
      </svg>
    ),
    label: '02',
    title: 'Vận Chuyển Quốc Tế',
    desc: 'Kết nối Việt Nam với ASEAN, Trung Quốc, châu Âu qua đường bộ, biển và hàng không.',
    features: ['Thủ tục hải quan', 'Door-to-door', 'FCL & LCL'],
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=900&q=80&auto=format',
    size: 'tall',
  },
  {
    id: 'warehouse',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="10" width="40" height="30" rx="2" />
        <path d="M4 20h40M16 10v30M12 15h2M12 25h2M12 32h2" />
      </svg>
    ),
    label: '03',
    title: 'Logistics & Kho Bãi',
    desc: 'Hệ thống kho hiện đại tại TP.HCM, Hà Nội, Đà Nẵng. Quản lý hàng hóa tự động.',
    features: ['Kho lạnh & kho thường', 'Hệ thống WMS', 'Bốc xếp chuyên nghiệp'],
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=900&q=80&auto=format',
    size: 'small',
  },
  {
    id: 'express',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 8h28l4 12H6L10 8z" />
        <rect x="4" y="20" width="40" height="6" rx="1" />
        <path d="M8 26v12M40 26v12M4 38h40" />
        <circle cx="16" cy="40" r="3" />
        <circle cx="32" cy="40" r="3" />
      </svg>
    ),
    label: '04',
    title: 'Chuyển Phát Nhanh',
    desc: 'Giao hàng nội thành trong 2–4 giờ, liên tỉnh 24–48 giờ. Cam kết đúng giờ.',
    features: ['Giao hàng hỏa tốc', 'COD linh hoạt', 'App theo dõi đơn hàng'],
    image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=900&q=80&auto=format',
    size: 'wide',
  },
]

export default function Services() {
  const sectionRef = useRef(null)
  const cardsRef = useRef([])

  // ── Spotlight / magnetic effect ──────────────────────────────────────
  const handleMouseMove = useCallback((e, card) => {
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2

    // Spotlight
    card.style.setProperty('--sx', `${x}px`)
    card.style.setProperty('--sy', `${y}px`)

    // Subtle 3-D tilt (magnetic)
    const rotX = ((y - cy) / cy) * -6
    const rotY = ((x - cx) / cx) * 6
    gsap.to(card, {
      rotateX: rotX,
      rotateY: rotY,
      duration: 0.4,
      ease: 'power2.out',
      transformPerspective: 900,
      transformOrigin: 'center center',
    })

    // Parallax image inside card
    const img = card.querySelector(`.${styles.cardBg}`)
    if (img) {
      const px = ((x - cx) / cx) * 12
      const py = ((y - cy) / cy) * 12
      gsap.to(img, { x: px, y: py, duration: 0.6, ease: 'power2.out' })
    }
  }, [])

  const handleMouseLeave = useCallback((card) => {
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.5)',
    })
    const img = card.querySelector(`.${styles.cardBg}`)
    if (img) gsap.to(img, { x: 0, y: 0, duration: 0.6, ease: 'power2.out' })
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header reveal
      gsap.fromTo(
        `.${styles.headerLabel}`,
        { y: 20, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', once: true },
        }
      )
      gsap.fromTo(
        `.${styles.headerTitle}`,
        { y: 50, opacity: 0, clipPath: 'inset(100% 0 0 0)' },
        {
          y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', duration: 1, ease: 'power4.out', delay: 0.1,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', once: true },
        }
      )
      gsap.fromTo(
        `.${styles.headerSub}`,
        { y: 20, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.25,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', once: true },
        }
      )

      // Bento cards stagger reveal
      cardsRef.current.forEach((card, i) => {
        if (!card) return
        gsap.fromTo(
          card,
          { y: 80, opacity: 0, scale: 0.94 },
          {
            y: 0, opacity: 1, scale: 1, duration: 0.85,
            ease: 'power4.out',
            delay: i * 0.1,
            scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', once: true },
          }
        )
      })

      // Scroll-driven parallax on section bg
      gsap.to(`.${styles.sectionParallax}`, {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, sectionRef)

    // Attach magnetic listeners
    const cards = cardsRef.current.filter(Boolean)
    const moveHandlers = cards.map((card) => {
      const onMove = (e) => handleMouseMove(e, card)
      const onLeave = () => handleMouseLeave(card)
      card.addEventListener('mousemove', onMove)
      card.addEventListener('mouseleave', onLeave)
      return { card, onMove, onLeave }
    })

    return () => {
      ctx.revert()
      moveHandlers.forEach(({ card, onMove, onLeave }) => {
        card.removeEventListener('mousemove', onMove)
        card.removeEventListener('mouseleave', onLeave)
      })
    }
  }, [handleMouseMove, handleMouseLeave])

  return (
    <section id="services" ref={sectionRef} className={styles.services}>
      {/* Section-level parallax atmosphere */}
      <div className={styles.sectionParallax} aria-hidden="true" />
      <div className={styles.orbTeal} aria-hidden="true" />
      <div className={styles.orbBlue} aria-hidden="true" />

   
        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
          
<h2 className={styles.headerTitle}>
  Giải Pháp Vận Tải
  <em className={styles.accent}>Toàn Diện</em>
</h2>
          </div>
          <div className={styles.headerRight}>
        
            <Link to="/dich-vu#lien-he" className={styles.headerCta}>
              Tư Vấn Miễn Phí
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      

      {/* ── Bento Grid — full bleed ── */}
      <div className={styles.bentoWrap}>
        <div className={styles.bento}>
          {services.map((s, i) => (
            <article
              key={s.id}
              ref={(el) => (cardsRef.current[i] = el)}
              className={`${styles.card} ${styles[`card--${s.size}`]}`}
              itemScope
              itemType="https://schema.org/Service"
            >
               <div className={styles.cardRibbon} data-label={s.label} />
              <div
                className={styles.cardBg}
                style={{ backgroundImage: `url(${s.image})` }}
              />
              <div className={styles.cardOverlay} />
              <div className={styles.spotlight} aria-hidden="true" />

              <div className={styles.cardContent}>
                <div className={styles.cardTop}>
                  <span className={styles.cardLabel}>{s.label}</span>
                 
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle} itemProp="name">{s.title}</h3>
                  <p className={styles.cardDesc} itemProp="description">{s.desc}</p>

                  <ul className={styles.cardFeatures}>
                    {s.features.map((f, fi) => (
                      <li key={fi}>
                        <span className={styles.check} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link to="/dich-vu#lien-he" className={styles.cardLink}>
                    Báo Giá Ngay
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
} 
