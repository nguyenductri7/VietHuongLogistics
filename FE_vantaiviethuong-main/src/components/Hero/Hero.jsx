import { useEffect, useRef, useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Hero.module.scss'
import heroSlide1 from '../../assets/hero-slide-1.png'
gsap.registerPlugin(ScrollTrigger)

// FIX: Tắt lag compensation — animation đều hơn ở mọi frame rate
gsap.ticker.lagSmoothing(0)

// ─── CONFIG ───────────────────────────────────────────────
const SLIDES = [
  { type: 'video', src: '/videos/hero-truck.mp4', loop: false },
  { type: 'image', src: heroSlide1, duration: 99999 },
]
const FADE_DURATION  = 1.2
const CHARS_VH       = 'VIET HUONG'.split('')
const SCROLL_LOCK_MS = 0
const VIDEO_INTRO_MAX_MS = 7000
const VIDEO_PLAYBACK_RATE = 1.12

// ─── COMPONENT ────────────────────────────────────────────
export default function Hero() {
  const skipVideo = sessionStorage.getItem('skipHeroVideo') === '1'
  const layerARef  = useRef(null)
  const layerBRef  = useRef(null)
  const activeRef  = useRef('A')
  const slideIdx   = useRef(0)
  const timerRef   = useRef(null)
  const heroRef    = useRef(null)
  const taglineRef = useRef(null)
  const stRef        = useRef(null)
  const contentRef   = useRef(null)
  const floatTlRef   = useRef(null)
  const textShownRef = useRef(false)
  const videoTimerRef = useRef(null)
  const videoDoneRef = useRef(null)
  const videoElRef = useRef(null)
  const phaseRef = useRef('video')
  const [phase, setPhase] = useState('video')
  const [showSkipVideo, setShowSkipVideo] = useState(false)

  const setHeroPhase = useCallback((nextPhase) => {
    phaseRef.current = nextPhase
    setPhase(nextPhase)
  }, [])

  // FIX: Dùng gsap.set() thay vì ghi style trực tiếp → batch DOM writes
  // FIX: Tách riêng quickSetter để tránh object lookup mỗi frame
  const settersRef = useRef(null)

  const applyCurtain = useCallback((p) => {
    if (!settersRef.current) return

    const { heroY, contOpacity, contY } = settersRef.current

    // FIX: quickSetter gọi trực tiếp — nhanh nhất có thể, không tạo object mới
    heroY(p * -100)

    const op = Math.max(0, 1 - p * 2.5)
    contOpacity(op)
    contY(p * -40)

    const cont = contentRef.current
    if (cont) cont.style.pointerEvents = op < 0.1 ? 'none' : ''

    const hero = heroRef.current
    if (hero) hero.style.pointerEvents = p >= 0.99 ? 'none' : 'auto'
    const heroShell = document.getElementById('hero-sticky-shell')
    if (heroShell) heroShell.style.pointerEvents = p >= 0.99 ? 'none' : 'auto'
  }, [])

  const setupScrollTrigger = useCallback(() => {
    if (stRef.current) stRef.current.kill()

    const aboutEl = document.querySelector('#about')

    if (aboutEl) {
      gsap.set(aboutEl, {
        position: 'fixed',
        top: 0, left: 0,
        width: '100%',
        zIndex: 1,
      })
    }

    stRef.current = ScrollTrigger.create({
      trigger : '#page-wrap',
      start   : 'top top',
      // FIX: scrub 0.8 thay vì 8 — phản hồi ngay với scroll, không "đuổi theo"
      // FIX: end dùng innerHeight thôi, không nhân 1.5 → progress linear với scroll
      end     : `+=${window.innerHeight}`,
      scrub   : 0.8,
      invalidateOnRefresh: true,
      onUpdate: (self) => applyCurtain(self.progress),

      onLeave: () => {
        const heroShell = document.getElementById('hero-sticky-shell')
        if (heroShell) heroShell.style.pointerEvents = 'none'
        if (aboutEl) {
          gsap.set(aboutEl, {
            position: 'relative',
            top: 'auto', left: 'auto',
            width: '100%',
            zIndex: 'auto',
          })
        }
      },

      onEnterBack: () => {
        const heroShell = document.getElementById('hero-sticky-shell')
        if (heroShell) heroShell.style.pointerEvents = 'auto'
        if (aboutEl) {
          gsap.set(aboutEl, {
            position: 'fixed',
            top: 0, left: 0,
            width: '100%',
            zIndex: 1,
          })
        }
      },
    })
  }, [applyCurtain])

  const startAmbient3D = useCallback(() => {
    if (floatTlRef.current) floatTlRef.current.kill()

    // FIX: Một timeline chung cho heroTitle thay vì nhiều timeline riêng lẻ
    gsap.to(`.${styles.heroTitle}`, {
      rotateX: 6, rotateY: 4, duration: 5,
      yoyo: true, repeat: -1, ease: 'sine.inOut',
      transformOrigin: '50% 50%',
    })

    // FIX: Dùng stagger trong 1 timeline duy nhất thay vì tạo N timeline riêng
    // → giảm từ 10+ timelines xuống còn 2
    gsap.timeline({ repeat: -1, repeatDelay: 2 })
      .to(`.${styles.charVH}`, {
        y: -15, scaleX: 1.18, scaleY: 1.22, color: '#fff5f0',
        textShadow: `
          0 -2px 0 rgba(255,255,255,.9),
          1px 1px 0 #cc1a1a, 2px 2px 0 #be1818, 3px 3px 0 #b01616,
          4px 4px 0 #a01414, 5px 5px 0 #901212, 6px 6px 0 #801010,
          7px 7px 0 #700e0e, 8px 8px 0 #600c0c, 9px 9px 0 #500a0a,
          10px 10px 0 #400808,
          0 0 20px rgba(255,100,20,1), 0 0 45px rgba(255,50,10,.9),
          0 0 80px rgba(230,0,20,.75)
        `,
        duration: 0.22, ease: 'power3.out', stagger: 0.06,
      })
      .to(`.${styles.charVH}`, {
        y: 0, scaleX: 1, scaleY: 1, color: '#ffffff',
        textShadow: `
          0 -1px 0 rgba(255,255,255,.6),
          1px 1px 0 #cc1a1a, 2px 2px 0 #be1818, 3px 3px 0 #b01616,
          4px 4px 0 #a01414, 5px 5px 0 #901212, 6px 6px 0 #801010,
          7px 7px 0 #700e0e, 8px 8px 0 #600c0c, 9px 9px 0 #500a0a,
          10px 10px 0 #400808, 0 0 60px rgba(200,0,30,.2)
        `,
        duration: 0.75, ease: 'elastic.out(1.3,0.45)', stagger: 0.06,
      }, '+=0.1')

    gsap.to(`.${styles.logisticsRow}`, {
      opacity: 0.75, duration: 2.2, yoyo: true, repeat: -1, ease: 'sine.inOut',
    })

    floatTlRef.current = gsap.timeline()

  }, [])

  const runTextIntro = useCallback(() => {
    if (textShownRef.current) return
    textShownRef.current = true
    setHeroPhase('text')
    setShowSkipVideo(false)

    gsap.set(`.${styles.char}`, { y: -80, opacity: 0, rotateX: -90 })
    gsap.set([`.${styles.logisticsRow}`, `.${styles.desc}`, `.${styles.ctas}`], { opacity: 0, y: 20 })

    gsap.timeline({ onComplete: startAmbient3D })
      .to(`.${styles.charVH}`, {
        y: 0, opacity: 1, rotateX: 0,
        duration: 0.6, ease: 'back.out(1.6)', stagger: 0.06,
      })
      .to(`.${styles.logisticsRow}`, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.2')
      .to([`.${styles.desc}`, `.${styles.ctas}`], {
        opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.1,
      }, '-=0.15')
  }, [setHeroPhase, startAmbient3D])

  const skipVideoIntro = useCallback(() => {
    if (phaseRef.current !== 'video') return
    videoDoneRef.current?.()
  }, [])

  const loadSlide = useCallback((slide, layerEl, onReady) => {
    layerEl.innerHTML = ''
    if (slide.type === 'image') {
      const img = document.createElement('img')
      img.src = slide.src
      img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;transform-origin:center;'
      img.onload  = () => onReady(layerEl)
      img.onerror = () => onReady(layerEl)
      layerEl.appendChild(img)
    } else {
      const vid = document.createElement('video')
      Object.assign(vid, {
        src: slide.src, autoplay: true, muted: true,
        loop: false, playsInline: true, preload: 'auto',
      })
      vid.playbackRate = VIDEO_PLAYBACK_RATE
      videoElRef.current = vid
      vid.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;'
      let completed = false
      const completeVideo = () => {
        if (completed) return
        completed = true
        clearTimeout(videoTimerRef.current)
        videoTimerRef.current = null
        videoDoneRef.current = null
        videoElRef.current = null
        setShowSkipVideo(false)
        gsap.killTweensOf(taglineRef.current)
        gsap.set(taglineRef.current, { opacity: 0 })
        try { vid.pause() } catch (_) {}
        onReady(layerEl)
      }
      videoDoneRef.current = completeVideo
vid.oncanplay = () => {
  vid.play().catch(() => {})
  setShowSkipVideo(true)
  clearTimeout(videoTimerRef.current)
  videoTimerRef.current = setTimeout(completeVideo, VIDEO_INTRO_MAX_MS)
  
  const tl = gsap.timeline()
  tl.to(taglineRef.current, { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', delay: 0.8 })
    .to(taglineRef.current, { opacity: 0, y: -20, duration: 0.8, ease: 'power2.in' }, '+=2.5')
}
      vid.onended = completeVideo
      vid.onerror = completeVideo
      layerEl.appendChild(vid)
    }
  }, [])

  const crossFade = useCallback((botLayer, topLayer, isFirstImageSlide, onDone) => {
    gsap.set(botLayer, { opacity: 0, zIndex: 1, scale: 1.15, filter: 'blur(0px)' })
    gsap.set(topLayer, { zIndex: 2 })

    gsap.timeline()
      .to(botLayer, {
        opacity: 1, scale: 1.0, duration: FADE_DURATION, ease: 'power2.inOut',
        onStart: () => {
          gsap.set(botLayer, { zIndex: 3 })
          if (isFirstImageSlide) runTextIntro()
        },
        onComplete: onDone,
      })
      .to(botLayer, { filter: 'blur(8px)', duration: FADE_DURATION * 0.35, ease: 'power1.in' }, 0)
      .to(botLayer, { filter: 'blur(0px)', duration: FADE_DURATION * 0.65, ease: 'power2.out' }, FADE_DURATION * 0.35)

    gsap.to(topLayer, {
      opacity: 0, scale: 0.94, filter: 'blur(6px)',
      duration: FADE_DURATION, ease: 'power2.inOut',
      onComplete: () => gsap.set(topLayer, { zIndex: 1, scale: 1, filter: 'blur(0px)' }),
    })
  }, [runTextIntro])

  const advanceSlide = useCallback(() => {
    const nextIdx = slideIdx.current
    if (nextIdx >= SLIDES.length) return

    const slide    = SLIDES[nextIdx]
    const isA      = activeRef.current === 'A'
    const topLayer = isA ? layerARef.current : layerBRef.current
    const botLayer = isA ? layerBRef.current : layerARef.current

    loadSlide(slide, botLayer, () => {
      if (slide.type === 'image') {
        const img = botLayer.querySelector('img')
        if (img)
          gsap.fromTo(img, { scale: 1.06 }, {
            scale: 1.0, duration: slide.duration / 1000 + FADE_DURATION, ease: 'none',
          })
      }
      crossFade(botLayer, topLayer, nextIdx === 1, () => {
        activeRef.current = isA ? 'B' : 'A'
        slideIdx.current  = nextIdx + 1
        if (slide.type === 'image' && nextIdx + 1 < SLIDES.length)
          timerRef.current = setTimeout(advanceSlide, slide.duration)
      })
    })
  }, [loadSlide, crossFade])

  const setupMagnetic = useCallback((node) => {
    if (!node) return
    const onMove  = (e) => {
      const r = node.getBoundingClientRect()
      gsap.to(node, {
        x: (e.clientX - r.left - r.width  / 2) * 0.1,
        y: (e.clientY - r.top  - r.height / 2) * 0.1,
        duration: 0.4, ease: 'power2.out',
      })
    }
    const onLeave = () => gsap.to(node, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' })
    node.addEventListener('mousemove',  onMove)
    node.addEventListener('mouseleave', onLeave)
    return () => {
      node.removeEventListener('mousemove',  onMove)
      node.removeEventListener('mouseleave', onLeave)
    }
  }, [])
useEffect(() => {
  const layerA = layerARef.current
  const hero   = heroRef.current
  const cont   = contentRef.current
  if (!layerA || !hero || !cont) return

  settersRef.current = {
    heroY      : gsap.quickSetter(hero, 'yPercent'),
    contOpacity: gsap.quickSetter(cont, 'opacity'),
    contY      : gsap.quickSetter(cont, 'y', 'px'),
  }

  gsap.set([layerA, layerBRef.current], { opacity: 0, zIndex: 1 })
  gsap.set(taglineRef.current, { opacity: 0, y: 20 })

  // Reset About section phòng trường hợp bị kẹt fixed từ lần trước
  const aboutEl = document.querySelector('#about')
  if (aboutEl) {
    gsap.set(aboutEl, {
      position: 'relative',
      top: 'auto', left: 'auto',
      width: '100%',
      zIndex: 'auto',
    })
  }

  // Khởi tạo ngay để cả kéo scrollbar, điều hướng bằng hash và cuộn bằng bàn phím
  // đều cập nhật trạng thái của lớp sticky, không chỉ riêng sự kiện wheel.
  setupScrollTrigger()

  if (skipVideo) {
    // Load thẳng ảnh tĩnh, bỏ qua video
    loadSlide(SLIDES[1], layerA, () => {
      gsap.set(layerA, { zIndex: 2 })
      gsap.to(layerA, { opacity: 1, duration: 0.8, ease: 'power2.out' })
      // Delay nhỏ đảm bảo settersRef + DOM sẵn sàng trước khi chạy animation
      setTimeout(() => {
        runTextIntro()
      }, 50)
    })
  } else {
    // Load bình thường từ video
    loadSlide(SLIDES[0], layerA, () => {
      slideIdx.current  = 1
      activeRef.current = 'A'
      advanceSlide()
    })
    gsap.to(layerA,  { opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.1 })
    gsap.set(layerA, { zIndex: 2 })
  }

  return () => {
    clearTimeout(timerRef.current)
    clearTimeout(videoTimerRef.current)
    videoElRef.current?.pause?.()
    videoDoneRef.current = null
    videoElRef.current = null
    floatTlRef.current?.kill()
    stRef.current?.kill()
    const heroShell = document.getElementById('hero-sticky-shell')
    if (heroShell) heroShell.style.pointerEvents = 'auto'
  }
}, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section
      ref={heroRef}
      id="hero"
      className={styles.hero}
      aria-label="Trang chủ Vận Tải Việt Hương"
    >
      {showSkipVideo && (
        <button
          type="button"
          className={styles.skipVideoBtn}
          onClick={skipVideoIntro}
          aria-label="Bỏ qua video giới thiệu"
        >
          Bỏ qua video
        </button>
      )}
<div className={styles.slideshowWrap}>
  <div ref={layerARef} className={styles.slideshowLayer} />
  <div ref={layerBRef} className={styles.slideshowLayer} />
  <div className={styles.gradTop}    />
  <div className={styles.gradBottom} />
  <div className={styles.gradCenter} />
  <div className={styles.redTint}    />
</div>

      <div ref={contentRef} className={`${styles.content} ${phase === 'text' ? styles.contentVisible : ''}`}>
        <h1 className={styles.heroTitle}>
          {CHARS_VH.map((ch, i) => (
            <span
              key={i}
              className={`${styles.char} ${styles.charVH} ${ch === ' ' ? styles.charSpace : ''}`}
              data-char={ch === ' ' ? '\u00A0' : ch}
              style={{ '--sweep-x': '200%' }}
            >
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          ))}
        </h1>
        <div className={styles.logisticsRow}>
          <span className={styles.logLine} />
          LOGISTICS
          <span className={styles.logLine} />
        </div>
        <p className={styles.desc}>
          Kết nối toàn quốc — vươn tầm quốc tế.<br />
          Vận chuyển chuyên nghiệp, nhanh chóng và an toàn.
        </p>
        <div className={styles.ctas}>
          <Link to="/dich-vu#lien-he" className={styles.btnRed} ref={(node) => { setupMagnetic(node) }}>
            Yêu Cầu Báo Giá
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link to="/dich-vu" className={styles.btnGhost} ref={(node) => { setupMagnetic(node) }}>
            Xem Dịch Vụ
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>
      </div>

      <div className={`${styles.scrollHint} ${phase === 'text' ? styles.scrollVisible : ''}`}>
        <span className={styles.scrollLine} />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>

      <div
        ref={taglineRef}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 15,
          opacity: 0,
          textAlign: 'center',
          padding: '20px 40px',
          borderRadius: '4px',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        <p style={{
          fontFamily: 'inherit',
          fontSize: 'clamp(16px, 2vw, 24px)',
          fontWeight: 400,
          color: 'rgba(255,255,255,0.92)',
          letterSpacing: '0.08em',
          margin: 0,
          lineHeight: 1.6,
        }}>
          Viet Huong Logistics mang đến cho bạn<br />
          <span style={{ color: '#f40c0c', fontWeight: 700 }}>
            những trải nghiệm tuyệt vời nhất
          </span>
        </p>
      </div>
    </section>
  )
}
