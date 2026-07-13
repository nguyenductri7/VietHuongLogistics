import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import styles from './Navbar.module.scss'
import logoImg from '../../assets/logo viet huong.png'

const navLinks = [
  { label: 'TRANG CHỦ', href: '#hero', to: null },
  { label: 'VỀ CHÚNG TÔI', href: null, to: '/ve-chung-toi' },
  { label: 'DỊCH VỤ', href: null, to: '/dich-vu' },
  { label: 'GIẢI ĐÁP', href: null, to: '/giai-dap' },
  { label: 'TIN TỨC', href: null, to: '/tin-tuc' },
  { label: 'VĂN PHÒNG & CHI NHÁNH', href: null, to: '/chi-nhanh' },
]

const GOOGLE_TRANSLATE_SCRIPT_ID = 'google-translate-script'
const GOOGLE_TRANSLATE_COOKIE = 'googtrans'

function getCookieDomains() {
  if (typeof window === 'undefined') return ['']
  const hostname = window.location.hostname
  const parts = hostname.split('.').filter(Boolean)
  const domains = ['', hostname, `.${hostname}`]

  if (parts.length >= 2) {
    const rootDomain = parts.slice(-2).join('.')
    domains.push(rootDomain, `.${rootDomain}`)
  }

  return [...new Set(domains)]
}

function setCookie(name, value) {
  const maxAge = 60 * 60 * 24 * 365
  const encodedValue = encodeURIComponent(value)
  document.cookie = `${name}=${encodedValue}; path=/; max-age=${maxAge}; SameSite=Lax`
}

function removeCookie(name) {
  const expires = 'Thu, 01 Jan 1970 00:00:00 GMT'
  getCookieDomains().forEach((domain) => {
    const domainPart = domain ? `; domain=${domain}` : ''
    document.cookie = `${name}=; path=/${domainPart}; expires=${expires}; SameSite=Lax`
    document.cookie = `${name}=; path=/;${domainPart}; expires=${expires}`
  })
}

function clearGoogleTranslateState() {
  removeCookie(GOOGLE_TRANSLATE_COOKIE)
  removeCookie(`googtrans`)
  localStorage.setItem('siteLanguage', 'vi')
  document.documentElement.classList.remove('translated-ltr', 'translated-rtl')
  document.body.classList.remove('translated-ltr', 'translated-rtl')
}

function getCurrentLanguage() {
  const match = document.cookie.match(new RegExp(`(?:^|; )${GOOGLE_TRANSLATE_COOKIE}=([^;]*)`))
  const value = match ? decodeURIComponent(match[1]) : ''
  return value.includes('/en') ? 'en' : 'vi'
}

function FlagVietnam() {
  return (
    <svg className={styles.flagSvg} viewBox="0 0 64 44" aria-hidden="true" focusable="false">
      <rect width="64" height="44" rx="7" fill="#da251d" />
      <path
        fill="#ff0"
        d="M32 9.2l3.54 10.9h11.46l-9.27 6.73 3.54 10.9L32 31l-9.27 6.73 3.54-10.9L17 20.1h11.46L32 9.2z"
      />
    </svg>
  )
}

function FlagUnitedKingdom() {
  return (
    <svg className={styles.flagSvg} viewBox="0 0 64 44" aria-hidden="true" focusable="false">
      <clipPath id="uk-flag-clip">
        <rect width="64" height="44" rx="7" />
      </clipPath>
      <g clipPath="url(#uk-flag-clip)">
        <rect width="64" height="44" fill="#012169" />
        <path d="M0 0l64 44M64 0L0 44" stroke="#fff" strokeWidth="8" />
        <path d="M0 0l64 44M64 0L0 44" stroke="#c8102e" strokeWidth="4.8" />
        <path d="M32 0v44M0 22h64" stroke="#fff" strokeWidth="13" />
        <path d="M32 0v44M0 22h64" stroke="#c8102e" strokeWidth="8" />
      </g>
    </svg>
  )
}

export default function Navbar() {
  const navRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [transparent, setTransparent] = useState(false)
  const [language, setLanguage] = useState(getCurrentLanguage)

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      const isAwayFromTop = window.scrollY > 16
      setScrolled(isAwayFromTop)
      setTransparent(isAwayFromTop)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const isAwayFromTop = window.scrollY > 16
    setScrolled(isAwayFromTop)
    setTransparent(isAwayFromTop)
  }, [location.pathname])

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return

      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'vi',
          includedLanguages: 'vi,en',
          autoDisplay: false,
        },
        'google_translate_element',
      )
    }

    if (!document.getElementById(GOOGLE_TRANSLATE_SCRIPT_ID)) {
      const script = document.createElement('script')
      script.id = GOOGLE_TRANSLATE_SCRIPT_ID
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      script.async = true
      document.body.appendChild(script)
    } else if (window.google?.translate?.TranslateElement) {
      window.googleTranslateElementInit()
    }
  }, [])

  const applyLanguage = (nextLanguage) => {
    setMenuOpen(false)
    setLanguage(nextLanguage)

    if (nextLanguage === 'en') {
      setCookie(GOOGLE_TRANSLATE_COOKIE, '/vi/en')
      localStorage.setItem('siteLanguage', 'en')
    } else {
      const select = document.querySelector('.goog-te-combo')
      if (select) {
        select.value = ''
        select.dispatchEvent(new Event('change'))
      }
      clearGoogleTranslateState()
      window.location.reload()
      return
    }

    const select = document.querySelector('.goog-te-combo')
    if (select) {
      select.value = nextLanguage === 'en' ? 'en' : 'vi'
      select.dispatchEvent(new Event('change'))
      return
    }

    window.location.reload()
  }

  const handleAnchorClick = (e, href) => {
    e.preventDefault()
    setMenuOpen(false)
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
      }, 350)
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleLinkClick = (event, to) => {
    setMenuOpen(false)

    if (location.pathname === to) {
      event.preventDefault()
      navigate(to)
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'instant' })
        window.dispatchEvent(new Event('scroll'))
      })
    }
  }

  return (
    <header
      ref={navRef}
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ''} ${transparent ? styles.transparent : ''}`}
      role="banner"
    >
      <div className={`container ${styles.inner}`}>
        <a
          href="#hero"
          className={styles.logo}
          aria-label="Vận Tải Việt Hương - Trang chủ"
          onClick={(e) => handleAnchorClick(e, '#hero')}
        >
          <img src={logoImg} alt="Logo Vận Tải Việt Hương" className={styles.logoImg} />
        </a>

        <nav className={styles.nav} aria-label="Menu chính">
          <ul className={styles.navList}>
            {navLinks.map((link) => (
              <li key={link.label}>
                {link.to ? (
                  <Link
                    to={link.to}
                    className={`${styles.navLink} anim-underline`}
                    onClick={(event) => handleLinkClick(event, link.to)}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className={`${styles.navLink} anim-underline`}
                    onClick={(e) => handleAnchorClick(e, link.href)}
                  >
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <a href="tel:+84xxxxxxxxx" className={styles.ctaBtn}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.36 7.18a19.79 19.79 0 01-3.07-8.67A2 2 0 012.27 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
          </svg>
          Gọi Ngay
        </a>

        <div className={styles.languageSwitcher} aria-label="Chọn ngôn ngữ">
          <button
            type="button"
            className={`${styles.langBtn} ${language === 'vi' ? styles.langActive : ''}`}
            onClick={() => applyLanguage('vi')}
            aria-label="Tiếng Việt"
            title="Tiếng Việt"
          >
            <FlagVietnam />
          </button>
          <button
            type="button"
            className={`${styles.langBtn} ${language === 'en' ? styles.langActive : ''}`}
            onClick={() => applyLanguage('en')}
            aria-label="English"
            title="English"
          >
            <FlagUnitedKingdom />
          </button>
        </div>

        <button
          className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </div>

      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileOpen : ''}`}>
        <nav aria-label="Menu di động">
          <ul>
            {navLinks.map((link) => (
              <li key={link.label}>
                {link.to ? (
                  <Link to={link.to} onClick={(event) => handleLinkClick(event, link.to)}>
                    {link.label}
                  </Link>
                ) : (
                  <a href={link.href} onClick={(e) => handleAnchorClick(e, link.href)}>
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>

          <div className={styles.mobileLanguageSwitcher} aria-label="Chọn ngôn ngữ">
            <button
              type="button"
              className={`${styles.langBtn} ${language === 'vi' ? styles.langActive : ''}`}
              onClick={() => applyLanguage('vi')}
            >
              <FlagVietnam /> Tiếng Việt
            </button>
            <button
              type="button"
              className={`${styles.langBtn} ${language === 'en' ? styles.langActive : ''}`}
              onClick={() => applyLanguage('en')}
            >
              <FlagUnitedKingdom /> English
            </button>
          </div>

          <a href="tel:0905386888" className="btn-primary">Gọi Hotline</a>
        </nav>
      </div>

      <div id="google_translate_element" className={styles.googleTranslateElement} aria-hidden="true" />
    </header>
  )
}
