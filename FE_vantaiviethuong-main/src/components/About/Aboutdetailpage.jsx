import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Truck, Plane, ShoppingBag, Warehouse, MapPin, LineChart,
  Phone, ArrowRight, Eye, Target, Shield,
} from 'lucide-react'
import styles from './Aboutdetailpage.module.scss'

gsap.registerPlugin(ScrollTrigger)

// VITE_API_URL = http://localhost:5000/api  ← đã có /api
// Nên chỉ thêm /about, KHÔNG thêm /api/about
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ─── Map tên icon ─────────────────────────────────────────────
const ICON_MAP = {
  Truck:       <Truck size={18} />,
  Plane:       <Plane size={18} />,
  ShoppingBag: <ShoppingBag size={18} />,
  Warehouse:   <Warehouse size={18} />,
  LineChart:   <LineChart size={18} />,
  Eye:         <Eye size={19} />,
  Target:      <Target size={19} />,
  Shield:      <Shield size={19} />,
}

const TICKER_ITEMS = [
  { icon: <Truck size={13} />,      text: 'Vận chuyển nội địa 63 tỉnh' },
  { icon: <Plane size={13} />,      text: 'Xuất nhập khẩu quốc tế' },
  { icon: <Warehouse size={13} />,  text: 'Kho bãi đạt chuẩn ISO' },
  { icon: <MapPin size={13} />,     text: 'GPS Tracking 24/7' },
  { icon: <ShoppingBag size={13} />,text: 'Mua hộ Trung Quốc · Hàn · Nhật' },
  { icon: <LineChart size={13} />,  text: 'Tư vấn chuỗi cung ứng' },
  { icon: <Shield size={13} />,     text: 'Thành viên VIFFAS' },
  { icon: <Truck size={13} />,      text: '500+ chuyến mỗi ngày' },
]

export const FALLBACK_ABOUT = {
  hero: {
    eyebrow: 'Về Việt Hương Logistics',
    title_line1: 'Đồng Hành',
    title_accent: 'Trên Mọi Hành Trình',
    title_line3: 'Vươn Tới Thành Công',
    subtitle: 'Giải pháp vận tải và logistics toàn diện, kết nối doanh nghiệp Việt Nam với mọi miền đất nước và thị trường quốc tế.',
    bg_image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&q=85&auto=format',
  },
  stats: [
    { raw: 15, suffix: '+', label: 'Năm kinh nghiệm' },
    { raw: 63, suffix: '', label: 'Tỉnh thành phủ sóng' },
    { raw: 500, suffix: '+', label: 'Chuyến mỗi ngày' },
    { raw: 99, suffix: '%', label: 'Giao hàng đúng hẹn' },
  ],
  identity: {
    eyebrow: 'Câu Chuyện Của Chúng Tôi',
    title_main: 'Đối Tác Logistics',
    title_accent: 'Đáng Tin Cậy',
    body_1: 'Việt Hương Logistics cung cấp giải pháp vận tải linh hoạt, an toàn và tối ưu cho từng nhu cầu của khách hàng.',
    body_2: 'Chúng tôi không ngừng đầu tư vào đội xe, công nghệ và con người để nâng cao chất lượng dịch vụ trên mỗi hành trình.',
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&q=85&auto=format',
    certs: ['Phủ sóng 63 tỉnh thành', 'Theo dõi GPS 24/7', 'Hỗ trợ tận tâm'],
  },
  services: [
    { icon_key: 'Truck', title: 'Vận Chuyển Nội Địa', desc: 'Dịch vụ vận tải hàng hóa toàn quốc với đội xe đa dạng tải trọng.', img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=900&q=80&auto=format' },
    { icon_key: 'Plane', title: 'Vận Chuyển Quốc Tế', desc: 'Kết nối hàng hóa bằng đường bộ, đường biển và đường hàng không.', img: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=900&q=80&auto=format' },
    { icon_key: 'Warehouse', title: 'Logistics & Kho Bãi', desc: 'Quản lý, lưu trữ và phân phối hàng hóa an toàn, chuyên nghiệp.', img: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=900&q=80&auto=format' },
    { icon_key: 'ShoppingBag', title: 'Mua Hộ Quốc Tế', desc: 'Hỗ trợ tìm nguồn, mua hộ và vận chuyển hàng hóa về Việt Nam.', img: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=900&q=80&auto=format' },
  ],
  timeline: [
    { year: '2009', title: 'Khởi Đầu Hành Trình', desc: 'Thành lập tại TP.HCM với đội xe đầu tiên.', img: 'https://images.unsplash.com/photo-1494412651409-8963ce7935a7?w=900&q=80&auto=format' },
    { year: '2015', title: 'Mở Rộng Quy Mô', desc: 'Phát triển mạng lưới vận tải và kho bãi phía Nam.', img: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=900&q=80&auto=format' },
    { year: '2019', title: 'Phủ Sóng Toàn Quốc', desc: 'Kết nối dịch vụ vận tải trên 63 tỉnh thành.', img: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=900&q=80&auto=format' },
    { year: '2023', title: 'Chuyển Đổi Số', desc: 'Ứng dụng công nghệ theo dõi và quản lý vận đơn.', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&q=80&auto=format' },
  ],
  values_section: [
    { icon_key: 'Eye', title: 'Tầm Nhìn', text: 'Trở thành đơn vị logistics uy tín hàng đầu Việt Nam, tạo giá trị bền vững cho khách hàng và xã hội.' },
    { icon_key: 'Target', title: 'Sứ Mệnh', text: 'Cung cấp chuỗi dịch vụ vận tải hiệu quả, an toàn và tối ưu chi phí.' },
    { icon_key: 'Shield', title: 'Cam Kết', text: 'Chuyên nghiệp, tận tâm, tin cậy và không ngừng nâng cao chất lượng.' },
  ],
}

export function normalizeAbout(payload) {
  const source = payload && typeof payload === 'object' ? payload : {}
  const useArray = (value, fallback) => Array.isArray(value) && value.length ? value : fallback
  return {
    hero: { ...FALLBACK_ABOUT.hero, ...(source.hero || {}) },
    stats: useArray(source.stats, FALLBACK_ABOUT.stats),
    identity: {
      ...FALLBACK_ABOUT.identity,
      ...(source.identity || {}),
      certs: useArray(source.identity?.certs, FALLBACK_ABOUT.identity.certs),
    },
    services: useArray(source.services, FALLBACK_ABOUT.services),
    timeline: useArray(source.timeline, FALLBACK_ABOUT.timeline),
    values_section: useArray(source.values_section, FALLBACK_ABOUT.values_section),
  }
}

function WaveDivider({ fill = '#ffffff', flip = false }) {
  return (
    <div className={`${styles.waveDivider} ${flip ? styles.waveUp : ''}`}>
      <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path d="M0,24 C360,48 720,0 1080,24 C1260,36 1380,12 1440,24 L1440,48 L0,48 Z" fill={fill} />
      </svg>
    </div>
  )
}

export default function AboutDetailPage() {
  const [about, setAbout] = useState(FALLBACK_ABOUT)
  const [loadError] = useState(false)

  const heroRef       = useRef(null)
  const heroBgRef     = useRef(null)
  const statsRef      = useRef(null)
  const identityRef   = useRef(null)
  const servicesRef   = useRef(null)
  const valuesRef     = useRef(null)
  const teamRef       = useRef(null)
  const ctaRef        = useRef(null)
  const timelineRefs  = useRef([])
  const valueCardsRef = useRef([])

  // ── Fetch — FIX: /about (không phải /api/about) ──────────
  useEffect(() => {
    const controller = new AbortController()
    axios.get(`${API_BASE}/about`, { signal: controller.signal })
      .then(res => setAbout(normalizeAbout(res.data?.data ?? res.data)))
      .catch(err => {
        if (err.code !== 'ERR_CANCELED') setAbout(FALLBACK_ABOUT)
      })
    return () => controller.abort()
  }, [])

  // ── GSAP animations ───────────────────────────────────────
  useEffect(() => {
    if (!about) return

    window.scrollTo(0, 0)

    const ctx = gsap.context(() => {

      // Hero bg parallax
      gsap.to(heroBgRef.current?.querySelector('img'), {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      // Hero entrance
      const heroTl = gsap.timeline({ delay: 0.08 })
      heroTl
        .from(`.${styles.heroEyebrow}`, { opacity: 0, y: 16, duration: 0.5, ease: 'power3.out' })
        .from(`.${styles.heroTitle}`,   { opacity: 0, y: 44, duration: 0.9, ease: 'power4.out' }, '-=0.25')
        .from(`.${styles.heroSub}`,     { opacity: 0, y: 20, duration: 0.65, ease: 'power3.out' }, '-=0.5')
        .from(`.${styles.heroCtas}`,    { opacity: 0, y: 14, duration: 0.55, ease: 'power3.out' }, '-=0.4')
        .from(`.${styles.heroBadge}`,   { opacity: 0, y: 20, stagger: 0.08, duration: 0.45, ease: 'power3.out' }, '-=0.3')

      // Values cards entrance + loop
      ScrollTrigger.create({
        trigger: valuesRef.current,
        start: 'top 78%',
        once: true,
        onEnter() {
          gsap.fromTo(`.${styles.valueCard}`,
            { opacity: 0, y: 40 },
            {
              opacity: 1, y: 0,
              duration: 0.65,
              ease: 'power3.out',
              stagger: 0.15,
              onComplete: startValueLoop,
            }
          )
        },
      })

      function startValueLoop() {
        const cards = valueCardsRef.current.filter(Boolean)
        if (!cards.length) return
        let idx = 0

        function runNext() {
          const card = cards[idx]
          if (!card) return

          gsap.fromTo(card.querySelector(`.${styles.valueShimmer}`),
            { x: '-110%' },
            { x: '110%', duration: 0.75, ease: 'power2.inOut' }
          )

          gsap.timeline()
            .to(card, { y: -14, duration: 0.28, ease: 'power2.out' })
            .to(card, { y: 0,   duration: 0.45, ease: 'elastic.out(1, 0.5)' })

          idx = (idx + 1) % cards.length
          gsap.delayedCall(1.1, runNext)
        }

        runNext()
      }

      // Identity section
      gsap.from(`.${styles.identityLeft}`, {
        scrollTrigger: { trigger: identityRef.current, start: 'top 80%', once: true },
        opacity: 0, x: -32, duration: 0.75, ease: 'power3.out',
      })
      gsap.from(`.${styles.identityImgWrap}`, {
        scrollTrigger: { trigger: identityRef.current, start: 'top 78%', once: true },
        opacity: 0, scale: 0.96, y: 20, duration: 0.7, ease: 'power3.out',
      })
      gsap.from(`.${styles.identityBody}`, {
        scrollTrigger: { trigger: identityRef.current, start: 'top 76%', once: true },
        opacity: 0, y: 20, stagger: 0.12, duration: 0.65, ease: 'power3.out',
      })
      gsap.from(`.${styles.cert}`, {
        scrollTrigger: { trigger: identityRef.current, start: 'top 72%', once: true },
        opacity: 0, scale: 0.85, stagger: 0.07, duration: 0.45, ease: 'back.out(2)',
      })

      gsap.from(`.${styles.teamCard}`, {
        scrollTrigger: { trigger: teamRef.current, start: 'top 80%', once: true },
        opacity: 0, y: 30, scale: 0.95, stagger: 0.09, duration: 0.58, ease: 'back.out(1.4)',
      })

      // CTA banner
      gsap.from(`.${styles.ctaBannerText}`, {
        scrollTrigger: { trigger: ctaRef.current, start: 'top 82%', once: true },
        opacity: 0, x: -30, duration: 0.7, ease: 'power3.out',
      })
      gsap.from(`.${styles.ctaBannerBtns}`, {
        scrollTrigger: { trigger: ctaRef.current, start: 'top 80%', once: true },
        opacity: 0, x: 30, duration: 0.7, ease: 'power3.out', delay: 0.1,
      })

      // Eyebrow lines draw in
      gsap.utils.toArray(`.${styles.eyebrowLine}`).forEach((line) => {
        gsap.fromTo(line,
          { scaleX: 0, transformOrigin: 'left center' },
          {
            scaleX: 1, duration: 0.7, ease: 'power3.out',
            scrollTrigger: { trigger: line, start: 'top 88%', once: true },
          }
        )
      })

    })

    // Timeline IntersectionObserver
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        const idx = Number(entry.target.dataset.idx || 0)
        setTimeout(() => entry.target.classList.add(styles.inView), idx * 130)
        io.unobserve(entry.target)
      })
    }, { threshold: 0.14 })

    timelineRefs.current.forEach(el => el && io.observe(el))

    return () => {
      ctx.revert()
      io.disconnect()
    }
  }, [about])

  // ── Loading / error ────────────────────────────────────────
  if (loadError) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingState}>
          Không thể tải nội dung trang. Vui lòng thử lại sau.
        </div>
      </main>
    )
  }

  if (!about) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingState}>Đang tải nội dung...</div>
      </main>
    )
  }

  const { hero, stats, identity, services, timeline, values_section: values } = about

  return (
    <main className={styles.page}>

      {/* ══════════ HERO */}
      <section ref={heroRef} className={styles.hero}>
        <div ref={heroBgRef} className={styles.heroBg}>
          <img src={hero.bg_image} alt="Kho vận Viet Huong Logistics" />
        </div>

        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>
            <span className={styles.eyebrowLine} />
            {hero.eyebrow}
          </p>

          <h1 className={styles.heroTitle}>
            {hero.title_line1}<br />
            <span className={styles.heroAccent}>{hero.title_accent}</span><br />
            {hero.title_line3}
          </h1>

          <p className={styles.heroSub}>{hero.subtitle}</p>

          <div className={styles.heroCtas}>
            <Link to="/lien-he" className={styles.ctaPrimary}>
              <Phone size={14} /> Liên Hệ Ngay
            </Link>
            <a href="#services" className={styles.ctaOutline}>
              Xem Dịch Vụ <ArrowRight size={14} />
            </a>
          </div>
        </div>

        <div className={styles.heroScrollHint} aria-hidden>
          <div className={styles.scrollLine} />
        </div>

        <div className={styles.heroWave}>
          <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path
              d="M0,50 C360,10 720,70 1080,30 C1260,10 1380,50 1440,55 L1440,80 L0,80 Z"
              fill="rgba(255,255,255,0.12)"
            />
            <path
              d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </section>

      {/* ══════════ STATS */}
      <section ref={statsRef} className={styles.statsSection}>
        <div className={styles.statsContainer}>
          <div className={styles.statsTrack}>
            {stats.map((s, i) => (
              <div key={i} className={styles.statPole}>
                <div className={styles.statNumWrap}>
                  <span className={styles.statNum} data-count={s.raw} data-suffix={s.suffix}>
                    {s.raw}{s.suffix}
                  </span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
                <div className={styles.statHook} />
                <div className={styles.statDot} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ IDENTITY */}
      <WaveDivider fill="#f8f9fb" />

      <section ref={identityRef} className={styles.identitySection}>
        <div className={styles.identityBgImg}>
          <img src={hero.bg_image} alt="" aria-hidden />
        </div>

        <div className={styles.identityInner}>
          <div className={styles.identityLeft}>
            <p className={styles.sectionEyebrow}>
              <span className={styles.eyebrowLine} />
              {identity.eyebrow}
            </p>
            <h2 className={styles.sectionTitle}>
              {identity.title_main}{' '}
              <span className={styles.accent}>{identity.title_accent}</span>
            </h2>
          </div>

          <div className={styles.identityRight}>
            <div className={styles.identityImgWrap}>
              <img src={identity.image} alt="Kho hàng Viet Huong" loading="lazy" />
            </div>

            <p className={styles.identityBody}>{identity.body_1}</p>
            <p className={styles.identityBody}>{identity.body_2}</p>

            <div className={styles.certBadges}>
              {identity.certs.map((cert, i) => (
                <span key={i} className={styles.cert}>{cert}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ TICKER */}
      <div className={styles.tickerSection} aria-hidden>
        <div className={styles.tickerTrack}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <div key={i} className={styles.tickerItem}>
              {item.icon}
              {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* ══════════ SERVICES */}
      <WaveDivider fill="#ffffff" flip />

      <section id="services" ref={servicesRef} className={styles.servicesSection}>
        <div className={styles.servicesInner}>
          <div className={styles.servicesHeader}>
            <div>
              <p className={styles.sectionEyebrow}>
                <span className={styles.eyebrowLine} />
                Dịch Vụ
              </p>
              <h2 className={styles.sectionTitle}>
                Giải Pháp Logistics{' '}
                <span className={styles.accent}>Toàn Diện</span>
              </h2>
            </div>
          </div>

          <div className={styles.servicesGrid}>
            {services.slice(0, 2).map((s, i) => (
              <div key={i} className={`${styles.serviceCard} ${styles.serviceCardWide}`}>
                <div className={styles.serviceRibbon} />
                <div className={styles.serviceCornerRibbon} />
                <div className={styles.serviceCardImg}>
                  <img src={s.img} alt={s.title} loading="lazy" />
                </div>
                <div className={styles.serviceCardContent}>
                  <div className={styles.serviceCardHeader}>
                    <div className={styles.serviceCardIcon}>{ICON_MAP[s.icon_key]}</div>
                    <h3 className={styles.serviceCardTitle}>{s.title}</h3>
                  </div>
                  <p className={styles.serviceCardDesc}>{s.desc}</p>
                  <a href="#contact" className={styles.serviceCardLink}>
                    Tìm hiểu thêm <ArrowRight size={12} />
                  </a>
                </div>
              </div>
            ))}

            {services.slice(2).map((s, i) => (
              <div key={i} className={`${styles.serviceCard} ${styles.serviceCardTall}`}>
                <div className={styles.serviceRibbon} />
                <div className={styles.serviceCornerRibbon} />
                <div className={styles.serviceCardImg}>
                  <img src={s.img} alt={s.title} loading="lazy" />
                </div>
                <div className={styles.serviceCardContent}>
                  <div className={styles.serviceCardHeader}>
                    <div className={styles.serviceCardIcon}>{ICON_MAP[s.icon_key]}</div>
                    <h3 className={styles.serviceCardTitle}>{s.title}</h3>
                  </div>
                  <p className={styles.serviceCardDesc}>{s.desc}</p>
                  <a href="#contact" className={styles.serviceCardLink}>
                    Tìm hiểu thêm <ArrowRight size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TIMELINE */}
      <WaveDivider fill="#f8f9fb" />

      <section className={styles.timelineSection}>
        <div className={styles.timelineHeader}>
          <p className={styles.sectionEyebrow}>
            <span className={styles.eyebrowLine} />
            Lịch Sử Hình Thành
          </p>
          <h2 className={styles.sectionTitle}>
            Hành Trình{' '}
            <span className={styles.accent}>15 Năm Phát Triển</span>
          </h2>
        </div>

        <div className={styles.timelineTree}>
          {timeline.map((m, i) => (
            <div
              key={i}
              ref={el => (timelineRefs.current[i] = el)}
              data-idx={i}
              className={styles.timelineEntry}
            >
              <div className={styles.timelineCard}>
                <div className={styles.timelineCardImg}>
                  <img src={m.img} alt={m.title} loading="lazy" />
                </div>
                <div className={styles.timelineCardBody}>
                  <div className={styles.timelineCardYear}>{m.year}</div>
                  <h3 className={styles.timelineCardTitle}>{m.title}</h3>
                  <p className={styles.timelineCardDesc}>{m.desc}</p>
                </div>
              </div>

              <div className={styles.timelineCenter}>
                <div className={styles.timelineNode}><span>{m.year}</span></div>
              </div>

              <div className={styles.timelineEmpty} />
            </div>
          ))}
        </div>
      </section>

      <WaveDivider fill="rgba(138, 0, 0, 0.98)" />

      {/* ══════════ VALUES */}
      <section ref={valuesRef} className={styles.valuesSection}>
        <div className={styles.valuesBg}>
          <img src={hero.bg_image} alt="" aria-hidden />
        </div>

        <div className={styles.valuesInner}>
          <div className={styles.valuesHeader}>
            <p className={styles.sectionEyebrow}>
              <span className={styles.eyebrowLine} />
              Tầm Nhìn & Sứ Mệnh
            </p>
            <h2 className={styles.valuesBigTitle}>
              Giá Trị <span className={styles.accent}>Cốt Lõi</span>
            </h2>
          </div>

          <div className={styles.valuesGrid}>
            {values.map((v, i) => (
              <div
                key={i}
                ref={el => (valueCardsRef.current[i] = el)}
                className={`${styles.valueCard} ${styles.valueRow}`}
              >
                <div className={styles.valueShimmer} aria-hidden />
                <span className={styles.valueNum}>0{i + 1}</span>
                <div className={styles.valueCardTop}>
                  <div className={styles.valueIconWrap}>{ICON_MAP[v.icon_key]}</div>
                  <h3 className={styles.valueTitle}>{v.title}</h3>
                </div>
                <p className={styles.valueText}>{v.text}</p>
                <div className={styles.valueCardFooter}>
                  <span className={styles.valueCardLine} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}
