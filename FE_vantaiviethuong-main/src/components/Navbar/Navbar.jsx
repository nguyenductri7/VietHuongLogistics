import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import styles from './Navbar.module.scss'
import logoImg from '../../assets/logo viet huong.png'
import { useLanguage } from '../../i18n/LanguageContext'

const navLinks = [
  { key: 'nav_home', href: '#hero', to: null },
  { key: 'nav_about', href: null, to: '/ve-chung-toi' },
  { key: 'nav_services', href: null, to: '/dich-vu' },
  { key: 'nav_faq', href: null, to: '/giai-dap' },
  { key: 'nav_blog', href: null, to: '/tin-tuc' },
  { key: 'nav_branches', href: null, to: '/chi-nhanh' },
]

function FlagIcon({ code }) {
  if (code === 'vi') {
    return (
      <svg className={styles.flagSvg} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <rect width="64" height="64" fill="#da251d" />
        <path
          fill="#ffde00"
          d="M32 12.5l4.6 14.2h14.9l-12.1 8.8 4.6 14.2L32 40.9 20 49.7l4.6-14.2-12.1-8.8h14.9L32 12.5z"
        />
      </svg>
    )
  }

  if (code === 'en') {
    return (
      <svg className={styles.flagSvg} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <rect width="64" height="64" fill="#012169" />
        <path d="M0 0l64 64M64 0L0 64" stroke="#fff" strokeWidth="12" />
        <path d="M0 0l64 64M64 0L0 64" stroke="#C8102E" strokeWidth="6" />
        <path d="M32 0v64M0 32h64" stroke="#fff" strokeWidth="20" />
        <path d="M32 0v64M0 32h64" stroke="#C8102E" strokeWidth="12" />
      </svg>
    )
  }

  return <span className={styles.flagFallback}>{code.toUpperCase()}</span>
}

export default function Navbar() {
  const navRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [transparent, setTransparent] = useState(false)
  const { language, languageOptions, setLanguage, t } = useLanguage()

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

  const renderLanguageSwitch = (className) => (
    <div className={className} role="group" aria-label="Language switcher">
      {languageOptions.map((item, index) => (
        <span className={styles.langItemWrap} key={item.code}>
          <button
            type="button"
            className={language === item.code ? styles.langActive : ''}
            onClick={() => setLanguage(item.code)}
            aria-label={`Switch to ${item.englishLabel}`}
            aria-pressed={language === item.code}
            title={item.label}
          >
            <span className={styles.flagIcon} aria-hidden="true">
              <FlagIcon code={item.code} />
            </span>
            <span className={styles.langCode}>{item.shortLabel}</span>
          </button>
          {index < languageOptions.length - 1 && <span className={styles.langDivider} aria-hidden="true" />}
        </span>
      ))}
    </div>
  )

  return (
    <header
      ref={navRef}
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ''} ${transparent ? styles.transparent : ''}`}
      role="banner"
      data-no-translate
    >
      <div className={`container ${styles.inner}`}>
        <a
          href="#hero"
          className={styles.logo}
          aria-label={t('logo_home')}
          onClick={(e) => handleAnchorClick(e, '#hero')}
        >
          <img src={logoImg} alt="Viet Huong Logistics" className={styles.logoImg} />
        </a>

        <nav className={styles.nav} aria-label={t('main_menu')}>
          <ul className={styles.navList}>
            {navLinks.map((link) => (
              <li key={link.key}>
                {link.to ? (
                  <Link
                    to={link.to}
                    className={`${styles.navLink} anim-underline`}
                    onClick={(event) => handleLinkClick(event, link.to)}
                  >
                    {t(link.key)}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className={`${styles.navLink} anim-underline`}
                    onClick={(e) => handleAnchorClick(e, link.href)}
                  >
                    {t(link.key)}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {renderLanguageSwitch(styles.langSwitch)}

        <a href="tel:0905386888" className={styles.ctaBtn}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.36 7.18a19.79 19.79 0 01-3.07-8.67A2 2 0 012.27 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
          </svg>
          {t('call_now')}
        </a>

        <button
          className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? t('close_menu') : t('open_menu')}
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </div>

      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileOpen : ''}`}>
        <nav aria-label={t('mobile_menu')}>
          <ul>
            {navLinks.map((link) => (
              <li key={link.key}>
                {link.to ? (
                  <Link to={link.to} onClick={(event) => handleLinkClick(event, link.to)}>
                    {t(link.key)}
                  </Link>
                ) : (
                  <a href={link.href} onClick={(e) => handleAnchorClick(e, link.href)}>
                    {t(link.key)}
                  </a>
                )}
              </li>
            ))}
          </ul>
          {renderLanguageSwitch(styles.mobileLangSwitch)}
          <a href="tel:0905386888" className="btn-primary">{t('call_hotline')}</a>
        </nav>
      </div>
    </header>
  )
}
