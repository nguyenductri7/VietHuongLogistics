import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import styles from './Navbar.module.scss'
import logoImg from '../../assets/logo viet huong.png'

const navLinks = [
  { label: 'TRANG CHỦ',    href: '#hero',     to: null },
  { label: 'VỀ CHÚNG TÔI', href: null,        to: '/ve-chung-toi' },
  { label: 'DỊCH VỤ',      href: null,        to: '/dich-vu' },
  { label: 'GIẢI ĐÁP',     href: null,        to: '/giai-dap' },  // ← sửa
  { label: 'TIN TỨC',      href: null,        to: '/tin-tuc' },
  { label: 'VĂN PHÒNG & CHI NHÁNH', href: null, to: '/lien-he' },
]

export default function Navbar() {
  const navRef     = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [transparent, setTransparent] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      const cur = window.scrollY
      const isAwayFromTop = cur > 16

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
          <a href="tel:0905386888" className="btn-primary">Gọi Hotline</a>
        </nav>
      </div>
    </header>
  )
}
