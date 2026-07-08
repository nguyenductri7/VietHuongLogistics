import { useRef, useEffect, Suspense, useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './About.module.scss'
import { homePageApi } from '../../services/api'

gsap.registerPlugin(ScrollTrigger)

// ─── Themes ────────────────────────────────────────────────────────────────
const THEMES = {
  red: {
    accent: '#cc1a1a', accentRgb: '204,26,26',
    bgGrad: 'radial-gradient(ellipse 65% 50% at 68% 32%, rgba(204,26,26,0.07) 0%, transparent 55%), #f8f6f2',
    ink: '#0d0d0d', inkSoft: '#4a4a4a',
    truckColor: '#cc1a1a',
  },
  orange: {
    accent: '#d96300', accentRgb: '217,99,0',
    bgGrad: 'radial-gradient(ellipse 65% 50% at 65% 28%, rgba(217,99,0,0.09) 0%, transparent 55%), #f8f5ef',
    ink: '#1a0d00', inkSoft: '#4a3520',
    truckColor: '#d96300',
  },
  navy: {
    accent: '#1a3a6b', accentRgb: '26,58,107',
    bgGrad: 'radial-gradient(ellipse 65% 50% at 70% 35%, rgba(26,58,107,0.08) 0%, transparent 55%), #f4f6fa',
    ink: '#0a1628', inkSoft: '#2a3a52',
    truckColor: '#1a3a6b',
  },
  slate: {
    accent: '#2d5a3d', accentRgb: '45,90,61',
    bgGrad: 'radial-gradient(ellipse 65% 50% at 65% 32%, rgba(45,90,61,0.08) 0%, transparent 55%), #f4f7f5',
    ink: '#0a1a0f', inkSoft: '#2a4030',
    truckColor: '#2d5a3d',
  },
}

// ─── Images ────────────────────────────────────────────────────────────────
const IMAGES = {
  intro:      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=85',
  stats:      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&q=85',
  milestones: 'https://images.unsplash.com/photo-1494412651409-8963ce7935a7?w=1200&q=85',
  values:     'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=1200&q=85',
}

// ─── Slides ────────────────────────────────────────────────────────────────
const SLIDES = [
  {
    theme: 'red',
    label: 'Giới Thiệu',
    decoNum: '01',
    title: 'Đối Tác Tin Cậy',
    titleAccent: 'Trong Từng Chuyến Hàng',
    body: 'Viet Huong Logistics — thành viên chiến lược của Viet Huong Group — cung cấp giải pháp logistics toàn diện, kết nối doanh nghiệp Việt Nam với thị trường toàn cầu bằng công nghệ hiện đại và đội ngũ chuyên nghiệp.',
    pills: ['Vận chuyển nội địa', 'Xuất nhập khẩu', 'Mua hộ quốc tế', 'Kết nối toàn cầu'],
    image: IMAGES.intro,
    cta: true,
  },
  {
    theme: 'orange',
    label: 'Con Số Nổi Bật',
    decoNum: '02',
    title: 'Hành Trình',
    titleAccent: 'Bằng Con Số',
    stats: [
      { num: '15+', raw: 15,  suffix: '+', desc: 'Năm kinh nghiệm' },
      { num: '63',  raw: 63,  suffix: '',  desc: 'Tỉnh thành phủ sóng' },
      { num: '500+',raw: 500, suffix: '+', desc: 'Chuyến / ngày' },
      { num: '99%', raw: 99,  suffix: '%', desc: 'Giao hàng đúng hẹn' },
    ],
    image: IMAGES.stats,
  },
  {
    theme: 'navy',
    label: 'Mốc Lịch Sử',
    decoNum: '03',
    title: 'Hành Trình',
    titleAccent: '15 Năm Phát Triển',
    milestones: [
      { year: '2009', event: 'Thành lập tại TP.HCM — đội xe 12 chiếc đầu tiên' },
      { year: '2015', event: 'Mở rộng 20 tỉnh phía Nam, kho bãi tại Bình Dương' },
      { year: '2019', event: 'Phủ sóng 63 tỉnh thành — mạng lưới toàn quốc' },
      { year: '2023', event: 'Ra mắt hệ thống tracking thời gian thực' },
    ],
    image: IMAGES.milestones,
  },
  {
    theme: 'slate',
    label: 'Giá Trị Cốt Lõi',
    decoNum: '04',
    title: 'Tầm Nhìn &',
    titleAccent: 'Sứ Mệnh',
    values: [
      {
        icon: '◎',
        title: 'Tầm Nhìn',
        text: 'Trở thành đơn vị uy tín hàng đầu Việt Nam trong lĩnh vực Giao nhận – Vận tải, tạo ra giá trị bền vững cho con người và xã hội.',
      },
      {
        icon: '◈',
        title: 'Sứ Mệnh',
        text: 'Tư vấn và cung cấp chuỗi cung ứng trọn gói với chất lượng và chi phí tốt nhất, dựa trên nền tảng chính trực và đạo đức nghề nghiệp.',
      },
      {
        icon: '◇',
        title: 'Cam Kết',
        text: '"Chuyên nghiệp – Tận tâm – Tin cậy – Hiệu quả": đồng hành cùng khách hàng phát triển dịch vụ và không ngừng nâng cao chất lượng.',
      },
    ],
    image: IMAGES.values,
  },
]

const INIT_ROT_Y = Math.PI * 1.5
const END_ROT_Y  = Math.PI * 1.25 - (Math.PI * 2 / 3)
const TRUCK_MODEL_URL = '/models/truck-optimized.glb'

const DEFAULT_ABOUT_INTRO = {
  enabled: true,
  section_label: 'Giới thiệu',
  show_3d_truck: true,
  title: 'Đối Tác Tin Cậy',
  title_accent: 'Trong Từng Chuyến Hàng',
  description: 'Viet Huong Logistics — thành viên chiến lược của Viet Huong Group — cung cấp giải pháp logistics toàn diện, kết nối doanh nghiệp Việt Nam với thị trường toàn cầu bằng công nghệ hiện đại và đội ngũ chuyên nghiệp.',
  pills: 'Vận chuyển nội địa\nXuất nhập khẩu\nMua hộ quốc tế\nKết nối toàn cầu',
  cta_label: 'Tìm Hiểu Thêm',
  cta_link: '/dich-vu#lien-he',
}

function normalizePills(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  return String(value || '')
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean)
}

// ─── Lấy invalidate từ trong Canvas ra ngoài ───────────────────────────────
function InvalidateOnScroll({ invalidateRef }) {
  const { invalidate } = useThree()
  useEffect(() => {
    invalidateRef.current = invalidate
  }, [invalidate, invalidateRef])
  return null
}

function CameraSetup() {
  const { camera } = useThree()
  useEffect(() => {
    camera.lookAt(-0.2, 1.8, -2)
  }, [camera])
  return null
}

function Truck({ targetRef }) {
  const { scene } = useGLTF(TRUCK_MODEL_URL)
  const meshRef = useRef()
  const cur     = useRef({ rotY: INIT_ROT_Y, posX: 0 })
  const ready   = useRef(false)
  const [offsetY, setOffsetY] = useState(0)

  useEffect(() => {
    if (!scene) return
    const box = new THREE.Box3().setFromObject(scene)
    setOffsetY(-box.min.y)
    if (meshRef.current) meshRef.current.rotation.y = INIT_ROT_Y
    ready.current = true
  }, [scene])

  useFrame(({ invalidate }, delta) => {
    if (!meshRef.current || !ready.current) return
    const alpha = 1 - Math.pow(0.003, delta)
    const dRotY = targetRef.current.rotY - cur.current.rotY
    const dPosX = targetRef.current.posX - cur.current.posX
    cur.current.rotY += dRotY * alpha
    cur.current.posX += dPosX * alpha
    meshRef.current.rotation.y = cur.current.rotY
    meshRef.current.position.x = cur.current.posX
    // Tiếp tục render cho đến khi lerp xong
    if (Math.abs(dRotY) > 0.0001 || Math.abs(dPosX) > 0.0001) invalidate()
  })

  return <primitive ref={meshRef} object={scene} scale={1.1} position={[0, offsetY, 0]} />
}
useGLTF.preload(TRUCK_MODEL_URL)

// ─── Main ──────────────────────────────────────────────────────────────────
export default function About() {
  const sectionRef    = useRef(null)
  const canvasWrapRef = useRef(null)
  const slideRefs     = useRef([])
  const wipeRefs      = useRef([])
  const bgRef         = useRef(null)
  const mountedRef    = useRef(true)
  const counterTweens = useRef([])
  const invalidateRef = useRef(null)
  const [active, setActive] = useState(0)
  const [aboutIntro, setAboutIntro] = useState(DEFAULT_ABOUT_INTRO)

  useEffect(() => {
    let cancelled = false
    homePageApi.get()
      .then(res => {
        if (cancelled) return
        setAboutIntro({
          ...DEFAULT_ABOUT_INTRO,
          ...(res.data?.about_intro || {}),
        })
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const slides = useMemo(() => {
    const introPills = normalizePills(aboutIntro.pills)
    return SLIDES.map((slide, index) => {
      if (index !== 0) return slide
      return {
        ...slide,
        label: aboutIntro.section_label || slide.label,
        title: aboutIntro.title || slide.title,
        titleAccent: aboutIntro.title_accent || slide.titleAccent,
        body: aboutIntro.description || slide.body,
        pills: introPills.length ? introPills : slide.pills,
        ctaLabel: aboutIntro.cta_label || 'Tìm Hiểu Thêm',
        ctaLink: aboutIntro.cta_link || '/dich-vu#lien-he',
      }
    })
  }, [aboutIntro])

  const truckTarget   = useRef({ rotY: INIT_ROT_Y, posX: 0 })
  const [renderQuality] = useState(() => {
    if (typeof window === 'undefined') return { antialias: true, dpr: 1 }
    const cpuCores = navigator.hardwareConcurrency || 8
    const memory = navigator.deviceMemory || 8
    const constrained = window.matchMedia('(max-width: 960px)').matches || cpuCores <= 4 || memory <= 4
    return {
      antialias: !constrained,
      dpr: constrained ? 1 : [1, 1.1],
    }
  })

  const applyTheme = useCallback((themeName) => {
    if (!mountedRef.current) return
    const t = THEMES[themeName] || THEMES.red
    const root = sectionRef.current
    if (!root) return
    root.style.setProperty('--accent',     t.accent)
    root.style.setProperty('--accent-rgb', t.accentRgb)
    root.style.setProperty('--ink',        t.ink)
    root.style.setProperty('--ink-soft',   t.inkSoft)
    if (bgRef.current) bgRef.current.style.background = t.bgGrad
  }, [])

  const animateCounters = useCallback(() => {
    if (!mountedRef.current) return
    const el = slideRefs.current[1]
    if (!el) return
    counterTweens.current.forEach(t => t.kill())
    counterTweens.current = []
    el.querySelectorAll('[data-count]').forEach(node => {
      if (!node) return
      gsap.killTweensOf(node)
      const target = parseFloat(node.dataset.count)
      const suffix = node.dataset.suffix || ''
      node.innerText = '0' + suffix
      const tween = gsap.to(node, {
        duration: 2.2,
        ease: 'power3.out',
        onUpdate() {
          if (!mountedRef.current || !node.isConnected) return
          node.innerText = Math.round(this.progress() * target) + suffix
        },
      })
      counterTweens.current.push(tween)
    })
  }, [])

  useEffect(() => {
    mountedRef.current = true
    const section = sectionRef.current
    if (!section) return
    slideRefs.current.forEach((el, i) => {
      if (!el) return
      el.style.position      = 'absolute'
      el.style.top           = '0'
      el.style.left          = '0'
      el.style.width         = '100%'
      el.style.height        = '100%'
      el.style.opacity       = i === 0 ? '1' : '0'
      el.style.pointerEvents = i === 0 ? 'auto' : 'none'
      el.style.transform     = 'none'
    })
    wipeRefs.current.forEach(el => {
      if (!el) return
      gsap.set(el, { clipPath: 'inset(0 0 0 100%)' })
    })
    if (canvasWrapRef.current) gsap.set(canvasWrapRef.current, { x: 0, opacity: 1 })
    applyTheme('red')

    let currentSlide = 0
    let pendingSlide = 0
    let wipeTl       = null
    let isAnimating  = false

    const goToSlide = (nextIdx) => {
      if (!mountedRef.current) return
      if (nextIdx === currentSlide && !isAnimating) return
      if (nextIdx === pendingSlide && isAnimating) return
      pendingSlide = nextIdx

      if (wipeTl) {
        wipeTl.kill(); wipeTl = null
        slideRefs.current.forEach((el, i) => {
          if (!el) return
          gsap.set(el, {
            opacity: i === currentSlide ? 1 : 0,
            pointerEvents: i === currentSlide ? 'auto' : 'none',
            y: 0,
          })
        })
       wipeRefs.current.forEach(el => { if (el) gsap.set(el, { clipPath: 'inset(0 0 0 100%)' }) })
      }

      const outEl  = slideRefs.current[currentSlide]
      const inEl   = slideRefs.current[nextIdx]
      const wipeEl = wipeRefs.current[nextIdx] ?? wipeRefs.current[0]
      const dir    = nextIdx > currentSlide ? 1 : -1
      if (!inEl || !wipeEl) return

      const nt = THEMES[slides[nextIdx]?.theme] || THEMES.red
      wipeEl.style.background = nt.accent
      gsap.set(wipeEl, { clipPath: 'inset(0 100% 0 0)' })

      isAnimating  = true
      currentSlide = nextIdx

wipeTl = gsap.timeline({
  onComplete: () => {
    isAnimating = false; wipeTl = null
    if (outEl) gsap.set(outEl, { opacity: 0, pointerEvents: 'none' })
    // Reset wipeBar — xóa màu accent còn đọng lại
    if (wipeEl) {
      wipeEl.style.background = 'transparent'
     gsap.set(wipeEl, { clipPath: 'inset(0 0 0 100%)' })
    }
  },
})
wipeTl
  .call(() => {
    if (!mountedRef.current) return
    applyTheme(slides[nextIdx].theme)
    gsap.set(inEl, { opacity: 0, pointerEvents: 'auto' })
  })
  .to(outEl, { opacity: 0, duration: 0.5, ease: 'power2.inOut' })
  .to(inEl,  { opacity: 1, duration: 0.5, ease: 'power2.inOut' }, '-=0.25')
if (nextIdx === 1) wipeTl.call(animateCounters, [], '+=0.1')
    }

    let lastIdx = 0

    const aboutTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom top',
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (!mountedRef.current) return
        const p = self.progress
        const n = slides.length
        const idx = Math.min(n - 1, Math.floor(p * n * 0.9999))
        if (idx !== lastIdx) { lastIdx = idx; goToSlide(idx); setActive(idx) }
        if (p <= 0.75) {
          const nextRotY = gsap.utils.mapRange(0, 0.75, INIT_ROT_Y, END_ROT_Y, p)
          if (Math.abs(nextRotY - truckTarget.current.rotY) > 0.0001) {
            truckTarget.current.rotY = nextRotY
            invalidateRef.current?.()
          }
        }
        if (canvasWrapRef.current) 
          gsap.set(canvasWrapRef.current, { x: 0, opacity: 1 })
        if (p > 0.85) {
          const last = slideRefs.current[n - 1]
          if (last) gsap.set(last, { opacity: 1 })
        }
  // ← THÊM LẠI dòng này
  // ← THÊM LẠI dòng này
      },
    })

    return () => {
      mountedRef.current = false
      counterTweens.current.forEach(t => t.kill())
      counterTweens.current = []
      aboutTrigger.kill()
      if (wipeTl) wipeTl.kill()
    }
  }, [animateCounters, applyTheme, slides])

  if (!aboutIntro.enabled) return null

  const at = THEMES[slides[active]?.theme] || THEMES.red

  return (
    <section
      id="about"
      ref={sectionRef}
      className={styles.about}
      style={{ '--accent': at.accent, '--accent-rgb': at.accentRgb, '--ink': at.ink, '--ink-soft': at.inkSoft }}
    >
      <div className={styles.stickyWrap}>
        <div ref={bgRef} className={styles.gradientBg} />
        <div className={styles.grain} />
        <div className={styles.redBar} />

        {/* ── Left text column ── */}
        <div className={styles.textCol}>
          <nav className={styles.dots} aria-label="Slide navigation">
            {slides.map((s, i) => (
              <span
                key={i}
                className={`${styles.dot} ${active === i ? styles.dotActive : ''}`}
                style={active === i ? { background: THEMES[s.theme].accent } : {}}
                aria-label={s.label}
              />
            ))}
          </nav>

          {/* Slides */}
          <div className={styles.slidesWrap}>
            {slides.map((slide, i) => {
              const t = THEMES[slide.theme]
              return (
                <div key={i} ref={el => (slideRefs.current[i] = el)} className={styles.slide}>

                  {/* Wipe overlay */}
                  <div ref={el => (wipeRefs.current[i] = el)} className={styles.wipeBar} />

                  {/* Decorative huge number */}
                  <div
                    className={styles.decoNumber}
                    style={{
                      position: 'absolute',
                      bottom: '-0.15em',
                      right: 'clamp(28px, 4.5vw, 72px)',
                      zIndex: 0,
                      color: `rgba(${t.accentRgb},0.055)`,
                    }}
                  >
                    {slide.decoNum}
                  </div>

                  {/* Ruled lines */}
                  <div
                    className={styles.decoRuled}
                    style={{ top: 'clamp(200px, 28vh, 280px)' }}
                  />

                  {/* Diagonal image */}
                  <div className={styles.slideImgWrap}>
                    <img src={slide.image} alt={slide.label} className={styles.slideImg} loading="lazy" />
                    <div className={styles.slideImgOverlay} />
                    <div
                      className={styles.slideImgTag}
                      style={{ color: t.accent, borderColor: `${t.accent}50` }}
                    >
                      {slide.label}
                    </div>
                  </div>

                  {/* Label */}
                  <p className={styles.label} style={{ color: t.accent }}>
                    <span className={styles.labelLine} style={{ background: t.accent }} />
                    {slide.label}
                  </p>

           <h2 className={styles.title} style={{ color: t.ink }}>
                    {slide.title}
                    <br />
                    <span className={styles.titleAccentShimmer}>{slide.titleAccent}</span>
                  </h2>

                  {slide.body && (
                    <p className={styles.body} style={{ color: t.inkSoft }}>{slide.body}</p>
                  )}

                  {slide.pills && (
                    <div className={styles.pills}>
                      {slide.pills.map((p, j) => (
                        <span key={j} className={styles.pill}
                          style={{ borderColor: `${t.accent}50`, color: t.accent }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  )}

                  {slide.cta && (
                    <Link to={slide.ctaLink || '/dich-vu#lien-he'} className={styles.cta} style={{ color: t.accent }}>
                      {slide.ctaLabel || 'Tìm Hiểu Thêm'}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}

                  {slide.stats && (
                    <div className={styles.statsGrid}>
                      {slide.stats.map((s, j) => (
                        <div key={j} className={styles.statItem}>
                          <span className={styles.statAccentLine} style={{ background: t.accent }} />
                          <span
                            className={styles.statNum}
                            data-count={s.raw} data-suffix={s.suffix}
                            style={{ color: t.accent }}
                          >{s.num}</span>
                          <span className={styles.statDesc}>{s.desc}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {slide.milestones && (
                    <div className={styles.milestones}>
                      {slide.milestones.map((m, j) => (
                        <div key={j} className={styles.milestone}>
                          <span className={styles.milestoneIdx}>{String(j + 1).padStart(2, '0')}</span>
                          <span className={styles.year} style={{ color: t.accent }}>{m.year}</span>
                          <span className={styles.event} style={{ color: t.inkSoft }}>{m.event}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {slide.values && (
                    <div className={styles.valuesGrid}>
                      {slide.values.map((v, j) => (
                        <div key={j} className={styles.valueItem}
                          style={{ borderColor: `${t.accent}20` }}>
                          <span className={styles.valueIcon} style={{ color: t.accent }}>{v.icon}</span>
                          <span className={styles.valueTitle} style={{ color: t.ink }}>{v.title}</span>
                          <p className={styles.valueText} style={{ color: t.inkSoft }}>{v.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Progress */}
          <div className={styles.progressWrap}>
            {slides.map((s, i) => (
              <div key={i}
                className={`${styles.progressStep} ${active >= i ? styles.progressActive : ''}`}
                style={active >= i ? { '--step-color': THEMES[s.theme].accent } : {}}
              />
            ))}
          </div>
        </div>

        {/* ── Right: 3D truck ── */}
        <div ref={canvasWrapRef} className={styles.canvasCol}>
          <div className={styles.cornerTL} style={{ borderColor: at.accent }} />
          <div className={styles.cornerBR} style={{ borderColor: at.accent }} />
          <div className={styles.slideNum}>
            <span className={styles.slideNumCurrent}>{String(active + 1).padStart(2, '0')}</span>
            <span className={styles.slideNumSep}> / </span>
            <span className={styles.slideNumTotal}>{String(slides.length).padStart(2, '0')}</span>
          </div>
          <Canvas
            frameloop="demand"
            camera={{ position: [-1, 10, 24], fov: 21 }}
            gl={{
              alpha: true,
              antialias: renderQuality.antialias,
              powerPreference: 'high-performance',
              stencil: false,
            }}
            dpr={renderQuality.dpr}
            style={{ width: '100%', height: '100%', background: 'transparent' }}
          >
            <Suspense fallback={null}>
              <InvalidateOnScroll invalidateRef={invalidateRef} />
              <CameraSetup />
              <ambientLight intensity={1.2} />
              <directionalLight position={[5, 8, 5]}  intensity={2.2} />
              <directionalLight position={[-5, 4, -3]} intensity={0.8} />
              <Truck targetRef={truckTarget} />
              <ContactShadows
                position={[0, 0, 0]}
                opacity={0.28}
                scale={18}
                blur={2.5}
                far={4}
                frames={1}
                resolution={128}
              />
              <Environment preset="city" background={false} />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </section>
  )
} 
