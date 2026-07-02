import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Contact.module.scss'

gsap.registerPlugin(ScrollTrigger)

export default function Contact() {
  const sectionRef = useRef(null)
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', service: '', message: ''
  })
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.contact-info',
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true } }
      )
      gsap.fromTo('.contact-form',
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.15,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true } }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const handleChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Connect to backend/email service
    setSent(true)
    gsap.fromTo('.success-msg',
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
    )
  }

  const contactItems = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.36 7.18a19.79 19.79 0 01-3.07-8.67A2 2 0 012.27 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
        </svg>
      ),
      label: 'Hotline',
      value: '1800 xxxx xxxx',
      sub: 'Miễn phí 24/7',
      href: 'tel:1800xxxxxxxx',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      label: 'Email',
      value: 'info@vantaiviethuong.com',
      sub: 'Phản hồi trong 2 giờ',
      href: 'mailto:info@vantaiviethuong.com',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
      label: 'Văn Phòng',
      value: '123 Đường Vận Tải, Q.7, TP.HCM',
      sub: 'T2–T7: 7:00–18:00',
      href: 'https://maps.google.com',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
      ),
      label: 'Zalo / Facebook',
      value: 'Việt Hương Transport',
      sub: 'Chat trực tiếp',
      href: 'https://zalo.me',
    },
  ]

  return (
    <section id="contact" ref={sectionRef} className={styles.contact}>
      <div className={`container ${styles.inner}`}>
        {/* Info */}
        <div className={`${styles.info} contact-info`}>
          <p className="section-label">Liên Hệ</p>
          <h2 className="section-title">
            Bắt Đầu<br />
            <em style={{ fontStyle: 'normal', color: '#f40c0c' }}>Ngay Hôm Nay</em>
          </h2>
          <p className={styles.desc}>
            Hãy cho chúng tôi biết nhu cầu vận chuyển của bạn — đội ngũ chuyên gia sẽ tư vấn
            giải pháp tối ưu trong vòng 30 phút.
          </p>

          <div className={styles.contactList}>
            {contactItems.map((item, i) => (
              <a
                key={i}
                href={item.href}
                className={styles.contactItem}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
              >
                <div className={styles.contactIcon}>{item.icon}</div>
                <div>
                  <p className={styles.contactLabel}>{item.label}</p>
                  <p className={styles.contactValue}>{item.value}</p>
                  <p className={styles.contactSub}>{item.sub}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className={`${styles.formWrap} contact-form`}>
          {sent ? (
            <div className={`${styles.success} success-msg`}>
              <div className={styles.successIcon}>✓</div>
              <h3>Đã Gửi Thành Công!</h3>
              <p>Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong vòng 30 phút.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <h3 className={styles.formTitle}>Yêu Cầu Báo Giá</h3>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="name">Họ & Tên *</label>
                  <input
                    id="name" name="name" type="text"
                    placeholder="Nguyễn Văn A"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="phone">Số Điện Thoại *</label>
                  <input
                    id="phone" name="phone" type="tel"
                    placeholder="0912 345 678"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="email">Email</label>
                <input
                  id="email" name="email" type="email"
                  placeholder="email@congty.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="service">Dịch Vụ Cần Tư Vấn</label>
                <select
                  id="service" name="service"
                  value={formData.service}
                  onChange={handleChange}
                >
                  <option value="">-- Chọn dịch vụ --</option>
                  <option>Vận Chuyển Nội Địa</option>
                  <option>Vận Chuyển Quốc Tế</option>
                  <option>Logistics & Kho Bãi</option>
                  <option>Chuyển Phát Nhanh</option>
                  <option>Khác</option>
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="message">Nội Dung</label>
                <textarea
                  id="message" name="message"
                  placeholder="Mô tả nhu cầu vận chuyển của bạn..."
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className={`btn-primary ${styles.submit}`}>
                Gửi Yêu Cầu Ngay
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
