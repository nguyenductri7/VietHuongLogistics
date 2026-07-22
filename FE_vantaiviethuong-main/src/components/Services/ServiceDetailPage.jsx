import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, ArrowRight, CheckCircle2,
  Phone, Mail, Send, ChevronDown,
  Truck, Globe, Warehouse, Zap, ShieldCheck, MapPin, Clock
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { contactApi } from '../../services/api';
import { TIMELINE_SERVICES } from './ServicesDetailPage';
import { normalizeServiceDetail } from './serviceDetailDefaults';
import s from './ServiceDetailPage.module.scss';

const API_BASE = import.meta.env.VITE_API_URL || ''

const ICON_MAP = {
  Truck: <Truck size={32} />, Globe: <Globe size={32} />,
  Warehouse: <Warehouse size={32} />, Zap: <Zap size={32} />,
  ShieldCheck: <ShieldCheck size={32} />, CheckCircle2: <CheckCircle2 size={32} />,
  Phone: <Phone size={32} />, Mail: <Mail size={32} />,
  MapPin: <MapPin size={32} />, Clock: <Clock size={32} />,
}
gsap.registerPlugin(ScrollTrigger);

/* ════════════════════════════════════════════════════════════
   PAGE — lấy data theo :id
   ════════════════════════════════════════════════════════════ */
export default function ServiceDetailPage() {
  const { id } = useParams();
  const [service, setService] = useState(null)
  const [allServices, setAllServices] = useState(TIMELINE_SERVICES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API_BASE}/services-page/items`)
      .then(res => {
        const list = res.data.data || []
        if (list.length > 0) {
          setAllServices(list)
          setService(list.find(svc => svc.slug === id) || null)
        } else {
          setService(TIMELINE_SERVICES.find(svc => svc.id === id) || null)
        }
      })
      .catch(() => {
        setService(TIMELINE_SERVICES.find(svc => svc.id === id) || null)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Đang tải...</div>
  if (!service) return <Navigate to="/dich-vu" replace />

  return (
    <>
      <ServiceDetailHero service={service} />
      <ServiceDetailContent service={service} allServices={allServices} />
      <ServiceDetailCTA service={service} />
    </>
  );
}


const ServiceDetailHero = ({ service }) => {
  const detail = normalizeServiceDetail(service.detail_content, service.slug || service.id);
  const heroRef  = useRef(null);
  const titleRef = useRef(null);
  const subRef   = useRef(null);
  const ctaRef   = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from(`.${s.heroBreadcrumb}`, { y: -16, opacity: 0, duration: 0.6 });
      tl.from(titleRef.current.querySelectorAll('span'), {
        y: 56, opacity: 0, stagger: 0.12, duration: 0.9,
      }, '-=0.2');
      tl.from(subRef.current, { y: 22, opacity: 0, duration: 0.7 }, '-=0.4');
      tl.from(`.${s.heroTags} > *`, { y: 14, opacity: 0, stagger: 0.08, duration: 0.5 }, '-=0.3');
      tl.from(ctaRef.current.children, { y: 18, opacity: 0, stagger: 0.1, duration: 0.55 }, '-=0.25');

      gsap.to(scrollRef.current, {
        y: 10, repeat: -1, yoyo: true, duration: 1.3, ease: 'sine.inOut',
      });

      gsap.to(heroRef.current?.querySelector(`.${s.heroBg}`), {
        yPercent: 25, ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    }, heroRef);
    return () => ctx.revert();
  }, [service.id]);

  return (
    <section ref={heroRef} className={s.hero}>
      {/* Ảnh nền mờ */}
      <div
        className={s.heroBg}
        style={{ backgroundImage: `url(${service.image})` }}
      />
      <div className={s.heroOverlay} />
      <div className={s.heroNoise} />

      {/* Decorative icon large */}
    <div className={s.heroIconBg}>{service.icon || ICON_MAP[service.icon_key] || <Truck size={32} />}</div>

      <div className={s.heroInner}>
        {/* Breadcrumb */}
        <nav className={s.heroBreadcrumb}>
          <Link to="/dich-vu" className={s.breadcrumbBack}>
            <ArrowLeft size={14} /> Tất cả dịch vụ
          </Link>
          <span className={s.breadcrumbSep}>/</span>
          <span className={s.breadcrumbCurrent}>{service.title}</span>
        </nav>

        {/* Service number badge */}
        <div className={s.heroLabel}>{service.label || String(service.sort_order || '').padStart(2, '0')}</div>

        {/* Title */}
        <h1 ref={titleRef} className={s.heroTitle}>
          <span>{service.title.split(' ').slice(0, 2).join(' ')}&nbsp;</span>
          <span className={s.heroShine}>
            {service.title.split(' ').slice(2).join(' ')}
          </span>
        </h1>

        <p ref={subRef} className={s.heroSubtitle}>{service.subtitle}</p>
        <p className={s.heroDesc}>{service.description || service.desc}</p>

        {/* Tags */}
        <ul className={s.heroTags}>
          {(service.tags || []).map(t => (
            <li key={t} className={s.heroTag}>
              <CheckCircle2 size={13} /> {t}
            </li>
          ))}
        </ul>

        {/* CTAs */}
        <div ref={ctaRef} className={s.heroCtas}>
          <a href="#lien-he" className={s.heroBtnPrimary}>
            {detail.hero_cta_label} <ArrowRight size={16} />
          </a>
          <Link to="/dich-vu" className={s.heroBtnGhost}>
            <ArrowLeft size={16} /> Xem Dịch Vụ Khác
          </Link>
        </div>
      </div>

      <div ref={scrollRef} className={s.heroScroll}>
        <ChevronDown size={22} />
      </div>
    </section>
  );
};

/* ════════════════════════════════════════════════════════════
   CONTENT — mô tả chi tiết + highlights
   Dữ liệu tĩnh — về sau thay bằng API call theo service.id
   ════════════════════════════════════════════════════════════ */
const SERVICE_DETAIL_DATA = {
  'van-chuyen-noi-dia': {
    highlights: [
      { num: '63+', label: 'Tỉnh thành phủ sóng' },
      { num: '500kg–20T', label: 'Tải trọng đa dạng' },
      { num: '24/7', label: 'GPS tracking thực tế' },
      { num: '99.2%', label: 'Tỷ lệ giao đúng hẹn' },
    ],
    features: [
      'Đội xe hơn 200 phương tiện, tải trọng từ 500kg đến 20 tấn.',
      'Hệ thống GPS theo dõi lộ trình thực tế, cập nhật liên tục 24/7.',
      'Lịch trình cố định hàng ngày tuyến HCM – Đà Nẵng – Hà Nội.',
      'Bảo hiểm hàng hóa toàn hành trình, bồi thường nhanh trong 48h.',
      'Tài xế được đào tạo chuyên nghiệp, kinh nghiệm trung bình 8 năm.',
      'Hệ thống chứng từ điện tử, tra cứu đơn hàng trực tuyến dễ dàng.',
    ],
  },
  'van-chuyen-quoc-te': {
    highlights: [
      { num: '40+', label: 'Quốc gia kết nối' },
      { num: 'FCL/LCL', label: 'Đường biển linh hoạt' },
      { num: '48h', label: 'Xử lý hải quan nhanh' },
      { num: '15+', label: 'Năm kinh nghiệm xuất nhập khẩu' },
    ],
    features: [
      'Kết nối Đông Nam Á, Trung Quốc, Nhật Bản và châu Âu.',
      'Dịch vụ đường biển FCL (nguyên container) & LCL (ghép hàng).',
      'Vận tải hàng không nhanh chóng cho hàng có giá trị cao.',
      'Tư vấn phân loại HS Code và tối ưu thuế nhập khẩu.',
      'Hỗ trợ thủ tục hải quan trọn gói, từ khai báo đến thông quan.',
      'Dịch vụ Door-to-Door: nhận hàng tại kho, giao tận đích.',
    ],
  },
  'logistics-kho-bai': {
    highlights: [
      { num: '50,000m²', label: 'Tổng diện tích kho' },
      { num: 'WMS', label: 'Phần mềm quản lý hiện đại' },
      { num: '100%', label: 'Hàng được bảo hiểm' },
      { num: 'Real-time', label: 'Kiểm kê & báo cáo' },
    ],
    features: [
      'Hệ thống kho đạt chuẩn, nhiệt độ kiểm soát theo yêu cầu hàng hóa.',
      'Trang bị xe nâng, băng tải và hệ thống rack hiện đại.',
      'Phần mềm WMS quản lý tồn kho theo thời gian thực.',
      'Kiểm kê định kỳ minh bạch, báo cáo gửi email hàng tuần.',
      'Dịch vụ đóng gói, dán nhãn và phân loại theo yêu cầu.',
      'Bảo hiểm hàng hóa toàn diện trong suốt thời gian lưu kho.',
    ],
  },
  'chuyen-phat-nhanh': {
    highlights: [
      { num: '4h', label: 'Giao nội thành' },
      { num: '24h', label: 'Giao liên tỉnh' },
      { num: 'COD', label: 'Thu hộ tiền mặt' },
      { num: '3 sàn', label: 'Shopee · Lazada · TikTok' },
    ],
    features: [
      'Cam kết giao hàng nội thành trong 4 giờ kể từ lúc lấy.',
      'Liên tỉnh 24 giờ cho các tuyến HCM – Đà Nẵng – Hà Nội.',
      'Dịch vụ COD thu hộ tiền, chuyển khoản về trong ngày.',
      'Tích hợp API với Shopee, Lazada, TikTok Shop, đồng bộ đơn tự động.',
      'Ứng dụng tra cứu đơn hàng real-time cho người gửi và người nhận.',
      'Đội giao hàng chuyên nghiệp, đồng phục, có mã nhân viên xác minh.',
    ],
  },
};

const ServiceDetailContent = ({ service, allServices = TIMELINE_SERVICES }) => {
  const sectionRef = useRef(null);
  const detail = normalizeServiceDetail(service.detail_content, service.slug || service.id);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(`.${s.highlightCard}`, {
        y: 30, opacity: 0, stagger: 0.1, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
      });
      gsap.from(`.${s.featureItem}`, {
        x: -24, opacity: 0, stagger: 0.08, duration: 0.65, ease: 'power3.out',
        scrollTrigger: { trigger: `.${s.featureList}`, start: 'top 82%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [service.id]);

  return (
    <section ref={sectionRef} className={s.contentSection}>
      <div className={s.container}>
        {/* Highlights grid */}
        <div className={s.highlightsGrid}>
          {detail.highlights.map((h, i) => (
            <div key={i} className={s.highlightCard}>
              <span className={s.highlightNum}>{h.num}</span>
              <span className={s.highlightLabel}>{h.label}</span>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className={s.contentGrid}>
          <div className={s.contentLeft}>
            <span className={s.miniEyebrow}>{detail.eyebrow}</span>
            <h2 className={s.contentTitle}>
              Giới thiệu <br />
              <span className={s.shineText}>{service.title}</span>
            </h2>
            <p className={s.contentDesc}>{detail.description}</p>
            <a href={detail.cta_link || '#lien-he'} className={s.btnPrimary}>
              {detail.cta_label || 'Nhận Báo Giá Ngay'} <ArrowRight size={16} />
            </a>
          </div>

          <ul className={s.featureList}>
            {detail.benefits.map((feat, i) => (
              <li key={i} className={s.featureItem}>
                <CheckCircle2 size={18} className={s.featureIcon} />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={s.standardSections}>
          <section className={s.standardBlock}>
            <div className={s.blockHeading}>
              <span>01</span>
              <h3>Phù hợp với loại khách nào?</h3>
            </div>
            <div className={s.audienceGrid}>
              {detail.audiences.map((item, index) => (
                <div key={index} className={s.audienceCard}>
                  <CheckCircle2 size={18} />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={s.standardBlock}>
            <div className={s.blockHeading}>
              <span>02</span>
              <h3>Quy trình thực hiện</h3>
            </div>
            <div className={s.processList}>
              {detail.process.map((step, index) => (
                <div key={index} className={s.processItem}>
                  <div className={s.processIndex}>{String(index + 1).padStart(2, '0')}</div>
                  <div>
                    <h4>{step.title}</h4>
                    <p>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={s.standardBlock}>
            <div className={s.blockHeading}>
              <span>03</span>
              <h3>Hồ sơ / thông tin cần chuẩn bị</h3>
            </div>
            <ul className={s.documentList}>
              {detail.documents.map((item, index) => (
                <li key={index}>
                  <CheckCircle2 size={16} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className={s.standardBlock}>
            <div className={s.blockHeading}>
              <span>04</span>
              <h3>Câu hỏi thường gặp riêng của dịch vụ</h3>
            </div>
            <div className={s.serviceFaqList}>
              {detail.faqs.map((faq, index) => (
                <details key={index} className={s.serviceFaqItem}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </div>

        {/* Other services */}
        <div className={s.otherServices}>
          <h3 className={s.otherTitle}>Dịch Vụ Khác</h3>
          <div className={s.otherGrid}>
       {allServices.filter(svc => svc.id !== service.id).map(svc => (
              <Link key={svc.id || svc.slug} to={svc.link || `/dich-vu/${svc.slug}`} className={s.otherCard}>
                <div className={s.otherCardIcon}>{svc.icon || ICON_MAP[svc.icon_key] || <Truck size={22} />}</div>
                <div>
                  <p className={s.otherCardTitle}>{svc.title}</p>
                  <p className={s.otherCardSub}>{svc.subtitle}</p>
                </div>
                <ArrowRight size={16} className={s.otherCardArrow} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ════════════════════════════════════════════════════════════
   CTA SECTION — form đỏ ánh nắng (inline)
   ════════════════════════════════════════════════════════════ */
const ServiceDetailCTA = ({ service }) => {
  const detail = normalizeServiceDetail(service.detail_content, service.slug || service.id);
  const sectionRef = useRef(null);
  const [form, setForm] = React.useState({
    name: '', phone: '', email: '', cargo: '', note: '',
  });
  const [submitted, setSubmitted] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(`.${s.ctaCard}`, {
        y: 40, opacity: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (submitError) setSubmitError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const name = form.name.trim();
    const phone = form.phone.trim();
    const email = form.email.trim();

    if (!name || !phone) {
      setSubmitError('Vui lòng nhập đầy đủ họ tên và số điện thoại.');
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubmitError('Địa chỉ email chưa đúng định dạng.');
      return;
    }

    const message = [
      `Dịch vụ quan tâm: ${service.title}`,
      form.cargo.trim() && `Loại hàng hóa: ${form.cargo.trim()}`,
      form.note.trim() || 'Khách hàng yêu cầu tư vấn và báo giá.',
    ].filter(Boolean).join('\n');

    setSubmitting(true);
    setSubmitError('');

    try {
      await contactApi.submit({
        full_name: name,
        phone,
        email,
        company: '',
        message,
      });
      setSubmitted(true);
      setForm({ name: '', phone: '', email: '', cargo: '', note: '' });
    } catch (error) {
      setSubmitError(error.message || 'Không thể gửi yêu cầu. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section ref={sectionRef} className={s.ctaSection} id="lien-he">
      <div className={s.container}>
        <div className={s.ctaCard}>
          <div className={s.ctaCardInner}>
            {/* Left info */}
            <div className={s.ctaLeft}>
              <div className={s.ctaIconWrap}>{service.icon || ICON_MAP[service.icon_key] || <Truck size={32} />}</div>
              <h2 className={s.ctaTitle}>
                {detail.form_title_prefix}<br /><span className={s.ctaTitleShine}>{service.title}</span>
              </h2>
              <p className={s.ctaDesc}>{detail.form_description}</p>
              <div className={s.ctaContacts}>
                <a href={`tel:${String(detail.hotline || '').replace(/\s/g, '')}`} className={s.ctaContactItem}>
                  <Phone size={15} /> {detail.hotline}
                </a>
                <a href={`mailto:${detail.email || ''}`} className={s.ctaContactItem}>
                  <Mail size={15} /> {detail.email}
                </a>
              </div>
            </div>

            {/* Right form */}
            <div className={s.ctaRight}>
              {submitted ? (
                <div className={s.ctaSuccess}>
                  <CheckCircle2 size={48} />
                  <p>Đã nhận yêu cầu!</p>
                  <span>Chúng tôi sẽ liên hệ trong 30 phút.</span>
                </div>
              ) : (
                <form className={s.ctaForm} onSubmit={handleSubmit}>
                  <div className={s.formRow}>
                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Họ & Tên *</label>
                      <input className={s.formInput} name="name" placeholder="Nguyễn Văn A"
                        value={form.name} onChange={handleChange} required />
                    </div>
                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Điện thoại *</label>
                      <input className={s.formInput} name="phone" placeholder="0909 xxx xxx"
                        value={form.phone} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className={s.formGroup}>
                    <label className={s.formLabel}>Email</label>
                    <input className={s.formInput} name="email" type="email"
                      placeholder="email@congty.com" value={form.email} onChange={handleChange} />
                  </div>

                  <div className={s.formGroup}>
                    <label className={s.formLabel}>Loại hàng hóa</label>
                    <input className={s.formInput} name="cargo"
                      placeholder="Hàng điện tử, thực phẩm…"
                      value={form.cargo} onChange={handleChange} />
                  </div>

                  <div className={s.formGroup}>
                    <label className={s.formLabel}>Ghi chú / Yêu cầu đặc biệt</label>
                    <textarea className={s.formTextarea} name="note" rows={3}
                      placeholder="Tuyến đường, thời gian dự kiến, yêu cầu đặc biệt…"
                      value={form.note} onChange={handleChange} />
                  </div>

                  {submitError && (
                    <p className={s.formError} role="alert">{submitError}</p>
                  )}

                  <button
                    type="submit"
                    className={s.ctaSubmit}
                    disabled={submitting}
                    aria-busy={submitting}
                  >
                    <Send size={16} /> {submitting ? 'Đang Gửi...' : 'Gửi Yêu Cầu Ngay'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
