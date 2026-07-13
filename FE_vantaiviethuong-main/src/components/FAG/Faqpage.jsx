// src/components/FAG/Faqpage.jsx
import { useState, useRef, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChevronDown, Phone, MessageCircle, CheckCircle2 } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { faqApi, faqContentApi } from '../../services/api'   // ← import faqApi + faqContentApi
import styles from './Faqpage.module.scss'
import { useLanguage } from '../../i18n/LanguageContext'
import { localizeObject } from '../../i18n/localized'

gsap.registerPlugin(ScrollTrigger)

// ── Nội dung hướng dẫn (vẫn giữ tĩnh, không phải FAQ) ───────────
const GUIDE_SECTIONS = [
  {
    title: 'Quy trình đặt dịch vụ vận chuyển',
    content: 'Để bắt đầu, bạn chỉ cần cung cấp thông tin cơ bản về lô hàng: loại hàng, trọng lượng/khối lượng, điểm đi và điểm đến mong muốn. Đội ngũ chúng tôi sẽ tư vấn phương thức vận chuyển tối ưu về chi phí và thời gian, sau đó gửi báo giá chính thức trong vòng 2 giờ.',
  },
  {
    title: 'Cách đóng gói hàng hóa đúng cách',
    content: 'Đóng gói đúng cách là yếu tố quan trọng nhất để đảm bảo hàng hóa nguyên vẹn. Sử dụng thùng carton chắc chắn, độn xốp PE hoặc bubble wrap cho hàng dễ vỡ, và dán nhãn rõ ràng thông tin người nhận, mã vận đơn và ký hiệu "Fragile" nếu cần. Với hàng lỏng hoặc hóa chất, cần đóng gói theo tiêu chuẩn UN.',
  },
  {
    title: 'Những lưu ý về hàng hóa cấm và hạn chế',
    content: 'Một số mặt hàng bị cấm hoặc hạn chế vận chuyển quốc tế như: vũ khí, chất nổ, hàng giả mạo nhãn hiệu, tiền mặt và các loại hàng hóa vi phạm quy định của nước nhập khẩu. Trước khi gửi hàng, hãy kiểm tra danh sách hàng cấm với nhân viên tư vấn để tránh phát sinh phí phạt hoặc bị giữ hàng tại cảng.',
  },
]

export default function FaqPage() {
  const { language } = useLanguage()
  const pageRef             = useRef(null)
  const [openMap, setOpenMap]       = useState({})

  // ── FAQ lấy từ API ──────────────────────────────────────────
  const [faqCategories, setFaqCategories] = useState([])
  const localizedFaqCategories = useMemo(
    () => localizeObject(faqCategories, language) || [],
    [faqCategories, language],
  )
  const [faqLoading, setFaqLoading]       = useState(true)
  const [activeTab, setActiveTab]         = useState('')

  const [form, setForm]             = useState({ name: '', phone: '', question: '' })
  const [submitted, setSubmitted]   = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const toggle = (key) => setOpenMap(p => ({ ...p, [key]: !p[key] }))

  // ── Fetch FAQ content ────────────────────────────────────────
  useEffect(() => {
    faqContentApi.getAll()
      .then(data => {
        setFaqCategories(data)
        if (data.length) setActiveTab(data[0].key)
      })
      .catch(err => console.error('Lỗi tải FAQ:', err))
      .finally(() => setFaqLoading(false))
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.faq-hero-in',
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1 }
      )
      gsap.fromTo('.faq-guide-item',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', stagger: 0.12,
          scrollTrigger: { trigger: '.faq-guide', start: 'top 80%', once: true } }
      )
      gsap.fromTo('.faq-form-in',
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '.faq-form-in', start: 'top 82%', once: true } }
      )
    }, pageRef)
    return () => ctx.revert()
  }, [])

  // ── Submit gửi lên API thật ────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim() || !form.question.trim()) return
    setSubmitting(true)
    try {
      await faqApi.submit({                             // ← gọi API thật
        name:     form.name.trim(),
        phone:    form.phone.trim(),
        question: form.question.trim(),
      })
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      alert('Có lỗi xảy ra, vui lòng thử lại!')
    } finally {
      setSubmitting(false)
    }
  }

  const currentFaq = localizedFaqCategories.find(c => c.key === activeTab)

  return (
    <>
      <Helmet>
        <title>Giải Đáp Thắc Mắc | Việt Hương Logistics</title>
        <meta name="description" content="Tổng hợp câu hỏi thường gặp về dịch vụ vận chuyển, báo giá, thủ tục hải quan và theo dõi hàng hóa." />
      </Helmet>

      <main ref={pageRef} className={styles.page}>

        {/* ── Hero Banner ── */}
        <div className={styles.heroBanner}>
          <div className={`container ${styles.bannerContent}`}>
            <span className={`${styles.catBadge} faq-hero-in`}>Hỗ Trợ Khách Hàng</span>
            <h1 className={`${styles.title} faq-hero-in`}>
              Giải Đáp <em className={styles.accent}>Thắc Mắc</em> Của Bạn
            </h1>
            <p className={`${styles.sub} faq-hero-in`}>
              Tổng hợp câu hỏi thường gặp về vận chuyển, báo giá, hải quan và thời gian giao hàng.
              Không tìm thấy câu trả lời? Gửi thắc mắc ngay bên dưới.
            </p>
            <div className={`${styles.heroCta} faq-hero-in`}>
              <a href="#faq" className={styles.ctaPrimary}>Xem câu hỏi</a>
              <a href="#ask" className={styles.ctaSecondary}>Gửi thắc mắc</a>
            </div>
          </div>

          <div className={styles.heroWave} aria-hidden="true">
            <svg viewBox="0 0 1440 70" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,40 C240,70 480,10 720,40 C960,70 1200,10 1440,40 L1440,70 L0,70 Z" fill="#ffffff" />
            </svg>
          </div>
        </div>

        {/* ── Body Layout ── */}
        <div className="container">
          <div className={styles.layout}>

            {/* ── Main column ── */}
            <div className={styles.main}>

              {/* Hướng dẫn */}
              <section className={`${styles.guideSection} faq-guide`}>
                <p className={styles.sectionEyebrow}>Hướng dẫn chi tiết</p>
                <h2 className={styles.sectionTitle}>Những điều bạn cần biết trước khi gửi hàng</h2>
                <div className={styles.guideList}>
                  {GUIDE_SECTIONS.map((g, i) => (
                    <div key={i} className={`${styles.guideItem} faq-guide-item`}>
                      <div className={styles.guideNum}>{String(i + 1).padStart(2, '0')}</div>
                      <div className={styles.guideBody}>
                        <h3 className={styles.guideTitle}>{g.title}</h3>
                        <p className={styles.guideText}>{g.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQ accordion */}
              <section id="faq" className={styles.faqSection}>
                <p className={styles.sectionEyebrow}>Câu hỏi thường gặp</p>
                <h2 className={styles.sectionTitle}>Tìm câu trả lời nhanh</h2>

                {faqLoading ? (
                  <p style={{ color: '#94a3b8', padding: '20px 0' }}>Đang tải...</p>
                ) : localizedFaqCategories.length === 0 ? (
                  <p style={{ color: '#94a3b8', padding: '20px 0' }}>Chưa có dữ liệu FAQ.</p>
                ) : (
                  <>
                    <div className={styles.tabRow}>
                      {localizedFaqCategories.map(cat => (
                        <button
                          key={cat.key}
                          className={`${styles.tabBtn} ${activeTab === cat.key ? styles.tabActive : ''}`}
                          onClick={() => setActiveTab(cat.key)}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                    <div className={styles.accordion}>
                      {currentFaq?.items.map((item, i) => {
                        const key = `${activeTab}-${i}`
                        const open = !!openMap[key]
                        return (
                          <div key={key} className={`${styles.accItem} ${open ? styles.accOpen : ''}`}>
                            <button className={styles.accTrigger} onClick={() => toggle(key)}>
                              <span>{item.question}</span>
                              <ChevronDown size={18} className={styles.accChevron} />
                            </button>
                            <div className={styles.accBody}>
                              <p>{item.answer}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </section>

              {/* Form gửi thắc mắc */}
              <section id="ask" className={`${styles.formSection} faq-form-in`}>
                <div className={styles.formCard}>
                  <div className={styles.formCardLeft}>
                    <p className={styles.sectionEyebrow}>Vẫn còn thắc mắc?</p>
                    <h2 className={styles.formTitle}>Chúng tôi lắng nghe bạn</h2>
                    <p className={styles.formDesc}>
                      Điền thông tin và câu hỏi của bạn. Chuyên viên tư vấn sẽ liên hệ lại trong vòng
                      <strong> 2 giờ làm việc</strong>.
                    </p>
                    <div className={styles.formMeta}>
                      <div className={styles.formMetaItem}>
                        <Phone size={16} />
                        <span>Hotline: <strong>0905.386.888</strong></span>
                      </div>
                      <div className={styles.formMetaItem}>
                        <MessageCircle size={16} />
                        <span>Zalo / WhatsApp hỗ trợ 24/7</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.formCardRight}>
                    {submitted ? (
                      <div className={styles.successBox}>
                        <CheckCircle2 size={40} className={styles.successIcon} />
                        <h3>Đã nhận câu hỏi của bạn!</h3>
                        <p>
                          Chuyên viên sẽ liên hệ với <strong>{form.name}</strong> qua số{' '}
                          <strong>{form.phone}</strong> trong thời gian sớm nhất.
                        </p>
                        <button
                          className={styles.resetBtn}
                          onClick={() => {
                            setSubmitted(false)
                            setForm({ name: '', phone: '', question: '' })
                          }}
                        >
                          Gửi câu hỏi khác
                        </button>
                      </div>
                    ) : (
                      <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.formField}>
                          <label>Họ và tên <span>*</span></label>
                          <input
                            type="text"
                            placeholder="Mời bạn nhập thông tin"
                            value={form.name}
                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                            required
                          />
                        </div>
                        <div className={styles.formField}>
                          <label>Số điện thoại <span>*</span></label>
                          <input
                            type="tel"
                            placeholder="Mời bạn nhập số điện thoại"
                            value={form.phone}
                            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                            required
                          />
                        </div>
                        <div className={styles.formField}>
                          <label>Câu hỏi của bạn <span>*</span></label>
                          <textarea
                            rows={4}
                            placeholder="Bạn quan tâm đến gì nào?"
                            value={form.question}
                            onChange={e => setForm(p => ({ ...p, question: e.target.value }))}
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className={styles.submitBtn}
                          disabled={submitting}
                        >
                          {submitting ? 'Đang gửi...' : 'Gửi thắc mắc'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </section>

            </div>

            {/* ── Sidebar ── */}
            <aside className={styles.sidebar}>
              <div className={styles.sideCard}>
                <p className={styles.sideLabel}>Danh mục câu hỏi</p>
                <nav className={styles.sideNav}>
                  {localizedFaqCategories.map(cat => (
                    <button
                      key={cat.key}
                      className={`${styles.sideNavItem} ${activeTab === cat.key ? styles.sideNavActive : ''}`}
                      onClick={() => {
                        setActiveTab(cat.key)
                        document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })
                      }}
                    >
                      {cat.label}
                      <span className={styles.sideNavCount}>{cat.items.length}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className={styles.sideCard}>
                <p className={styles.sideLabel}>Liên hệ nhanh</p>
                <p className={styles.sideText}>
                  Cần tư vấn ngay? Gọi hotline hoặc nhắn Zalo — phản hồi trong 15 phút.
                </p>
                <a href="tel:0905386888" className={styles.ctaBtn}>
                  <Phone size={14} /> Gọi ngay
                </a>
              </div>

              <div className={styles.sideCard}>
                <p className={styles.sideLabel}>Chủ đề phổ biến</p>
                <div className={styles.tagCloud}>
                  {['Báo giá', 'Thông quan', 'Theo dõi hàng', 'Hàng lạnh', 'FCL / LCL', 'Bảo hiểm', 'Hàng không', 'Đường biển'].map(t => (
                    <span key={t} className={styles.tag}>{t}</span>
                  ))}
                </div>
              </div>
            </aside>

          </div>
        </div>
      </main>
    </>
  )
}
