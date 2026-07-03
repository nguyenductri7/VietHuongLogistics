import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { contactApi } from '../../services/api';

const API_BASE = import.meta.env.VITE_API_URL || ''

const ICON_MAP = {
  Truck: <Truck size={22} />,
  Globe: <Globe size={22} />,
  Warehouse: <Warehouse size={22} />,
  Zap: <Zap size={22} />,
  ShieldCheck: <ShieldCheck size={22} />,
  CheckCircle2: <CheckCircle2 size={22} />,
  Phone: <Phone size={22} />,
  Mail: <Mail size={22} />,
  MapPin: <MapPin size={22} />,
  Clock: <Clock size={22} />,
}
import {
  Truck, Globe, Warehouse, Zap,
  CheckCircle2, ShieldCheck, Phone, ArrowRight,
  ChevronDown, Mail, Send, MapPin, Clock
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import s from './ServicesDetailPage.module.scss';

gsap.registerPlugin(ScrollTrigger);

/* ─── DATA ──────────────────────────────────────────────── */
export const TIMELINE_SERVICES = [
  {
    id: 'van-chuyen-noi-dia',
    label: '01',
    title: 'Vận Chuyển Nội Địa',
    subtitle: 'Phủ khắp 63 tỉnh thành',
    desc: 'Đội xe đa tải trọng từ 500kg đến 20 tấn, GPS tracking 24/7, cam kết giao đúng hẹn. Lịch trình cố định hàng ngày trên tuyến HCM – Đà Nẵng và toàn quốc.',
    icon: <Truck size={22} />,
    image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1200&auto=format&fit=crop',
    tags: ['GPS 24/7', 'Đa tải trọng', 'Toàn quốc'],
    link: '/dich-vu/van-chuyen-noi-dia',
  },
  {
    id: 'van-chuyen-quoc-te',
    label: '02',
    title: 'Vận Chuyển Quốc Tế',
    subtitle: 'Đường biển & hàng không',
    desc: 'Kết nối Đông Nam Á, Trung Quốc và châu Âu qua đối tác đại lý toàn cầu. Xử lý thủ tục hải quan nhanh, tư vấn phân loại HS Code chuyên nghiệp.',
    icon: <Globe size={22} />,
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop',
    tags: ['FCL / LCL', 'Hải quan', 'Door to Door'],
    link: '/dich-vu/van-chuyen-quoc-te',
  },
  {
    id: 'logistics-kho-bai',
    label: '03',
    title: 'Logistics & Kho Bãi',
    subtitle: 'Lưu trữ thông minh',
    desc: 'Hệ thống kho bãi đạt chuẩn, trang bị xe nâng và băng tải hiện đại. Quản lý hàng hóa bằng phần mềm, kiểm kê định kỳ minh bạch và chính xác.',
    icon: <Warehouse size={22} />,
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=1200&auto=format&fit=crop',
    tags: ['WMS', 'Kiểm kê định kỳ', 'Bảo hiểm hàng'],
    link: '/dich-vu/logistics-kho-bai',
  },
  {
    id: 'chuyen-phat-nhanh',
    label: '04',
    title: 'Chuyển Phát Nhanh',
    subtitle: 'Giao hỏa tốc trong ngày',
    desc: 'Cam kết giao hàng nội thành trong 4 giờ, liên tỉnh trong 24 giờ. Dịch vụ COD thu hộ tiền, hỗ trợ sàn thương mại điện tử Shopee, Lazada, TikTok Shop.',
    icon: <Zap size={22} />,
    image: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?q=80&w=1200&auto=format&fit=crop',
    tags: ['COD', '4h nội thành', 'E-commerce'],
    link: '/dich-vu/chuyen-phat-nhanh',
  },
];

const PROCESS_STEPS = [
  { id: 1, title: 'Tiếp Nhận',  desc: 'Ghi nhận yêu cầu, khảo sát hàng hóa và xác nhận thông tin vận chuyển.',       icon: <Phone size={20} /> },
  { id: 2, title: 'Báo Giá',    desc: 'Đề xuất phương án tối ưu chi phí, phù hợp loại hàng và tuyến đường.',          icon: <Zap size={20} /> },
  { id: 3, title: 'Đóng Gói',   desc: 'Đóng gói theo quy chuẩn nghiêm ngặt, dán nhãn và lập chứng từ đầy đủ.',       icon: <ShieldCheck size={20} /> },
  { id: 4, title: 'Vận Chuyển', desc: 'Khởi hành đúng lịch, GPS tracking 24/7 theo thời gian thực liên tục.',         icon: <Truck size={20} /> },
  { id: 5, title: 'Bàn Giao',   desc: 'Xác nhận chứng từ, kiểm tra chất lượng tận nơi và thu thập phản hồi.',         icon: <CheckCircle2 size={20} /> },
];

/* Thông tin liên hệ */
const CONTACT_INFO = [
  {
    icon: <MapPin size={15} />,
    label: 'Trụ sở chính',
    value: '58 Phước Lý 9, Phường Hòa Khánh, TP. Đà Nẵng',
  },
  {
    icon: <Phone size={15} />,
    label: 'Hotline 24/7',
    value: '0905 386 888',
  },
  {
    icon: <Mail size={15} />,
    label: 'Email',
    value: 'info@vantaiviethuong.com',
  },
  {
    icon: <Clock size={15} />,
    label: 'Giờ làm việc',
    value: 'Thứ 2 – Thứ 7: 8:00 – 17:00',
  },
];

/* ─── HOOK: Spotlight mouse follow ──────────────────────── */
function useSpotlight(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--sx', `${e.clientX - rect.left}px`);
      el.style.setProperty('--sy', `${e.clientY - rect.top}px`);
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, [ref]);
}

/* ─── HOOK: Magnetic tilt ───────────────────────────────── */
function useMagneticTilt(ref, strength = 7) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2))  / (rect.width / 2);
      const dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
      gsap.to(el, { rotateY: dx * strength, rotateX: -dy * strength, scale: 1.02, duration: 0.4, ease: 'power2.out', transformPerspective: 900 });
    };
    const onLeave = () => gsap.to(el, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.6, ease: 'elastic.out(1,0.5)' });
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, [ref, strength]);
}

/* ════════════════════════════════════════════════════════════
   SERVICES BANNER
   ════════════════════════════════════════════════════════════ */
export const ServicesBanner = ({ bannerData }) => {
  const heroRef   = useRef(null);
  const titleRef  = useRef(null);
  const subRef    = useRef(null);
  const ctaRef    = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from(titleRef.current.querySelectorAll('span'), { y: 64, opacity: 0, stagger: 0.13, duration: 0.95 });
      tl.from(subRef.current,  { y: 26, opacity: 0, duration: 0.72 }, '-=0.4');
      tl.from(ctaRef.current.children, { y: 20, opacity: 0, stagger: 0.1, duration: 0.6 }, '-=0.3');
      gsap.to(scrollRef.current, { y: 10, repeat: -1, yoyo: true, duration: 1.3, ease: 'sine.inOut' });
      gsap.to(heroRef.current?.querySelector(`.${s.heroBg}`), {
        yPercent: 28, ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className={s.hero}>
      <div className={s.heroBg} />
      <div className={s.heroOverlay} />
      <div className={s.heroNoise} />
      <div className={s.heroInner}>
<h1 ref={titleRef} className={s.heroTitle}>
          <span>{bannerData?.title_line1 || 'Vận Chuyển '}</span>
          <span className={s.heroShine}>{bannerData?.title_accent || 'Đáng Tin Cậy'}</span>
          <br />
          <span>{bannerData?.title_line3 || '— Mọi Hành Trình'}</span>
        </h1>
        <p ref={subRef} className={s.heroSub}>
          {bannerData?.subtitle || 'Từ nội địa đến quốc tế, từ kho bãi đến chuyển phát nhanh — chúng tôi đảm bảo hàng hóa của bạn đến đúng nơi, đúng lúc.'}
        </p>
        <div ref={ctaRef} className={s.heroCtas}>
          <Link to="/lien-he" className={s.heroBtnPrimary}>
            Tư Vấn Miễn Phí <ArrowRight size={16} />
          </Link>
          <Link to="#dich-vu" className={s.heroBtnGhost}>
            Xem Dịch Vụ
          </Link>
        </div>
      </div>
      <div ref={scrollRef} className={s.heroScroll}>
        <ChevronDown size={24} />
      </div>

       <div className={s.heroWave}>
  <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    <path
      d="M0,50 C360,10 720,70 1080,30 C1260,10 1380,50 1440,55 L1440,80 L0,80 Z"
      fill="rgba(255,255,255,0.06)"
    />
    <path
      d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
      fill="#ffffff"
    />
  </svg>
</div>
    </section>
  );
};
const TimelineCard = ({ service, index }) => {
  const wrapRef = useRef(null);
  const cardRef = useRef(null);
  useMagneticTilt(wrapRef, 6);
  useSpotlight(cardRef);
  const isRight = index % 2 === 0;

  const CardEl = (
    <div ref={wrapRef} style={{ minWidth: 0 }}>
      <Link to={service.link || `/dich-vu/${service.slug}`} ref={cardRef} className={s.tlCard}>
        <span className={s.spotlight} />
        <div className={s.cardWatermark}>{service.label || String(service.sort_order ?? '').padStart(2,'0')}</div>
        <div className={s.cardRibbon} data-label={service.label || String(service.sort_order ?? '').padStart(2,'0')} />
        <div className={s.cardImg} style={{ backgroundImage: `url(${service.image})` }}>
          <div className={s.cardImgOverlay} />
        </div>
        <div className={s.cardBody}>
          <div className={s.cardMeta}>
            <div className={s.cardTitleRow}>
              <div className={s.cardIconWrap}>{service.icon || ICON_MAP[service.icon_key] || <Truck size={22} />}</div>
              <h3 className={s.cardTitle}>{service.title}</h3>
            </div>
            <span className={s.cardArrow}><ArrowRight size={15} /></span>
          </div>
          <p className={s.cardSubtitle}>{service.subtitle}</p>
          <p className={s.cardDesc}>{service.desc}</p>
          <ul className={s.tagList}>
            {service.tags.map(t => <li key={t} className={s.tag}>{t}</li>)}
          </ul>
        </div>
      </Link>
    </div>
  );

  const NodeEl = (
    <div className={s.timelineNode}>
      <div className={s.nodeRing}>
        <span className={s.nodeConnector} />
        <div className={s.nodeLabel}>{service.label || String(service.sort_order ?? '').padStart(2,'0')}</div>
      </div>
    </div>
  );

  if (isRight) {
    return (
      <div className={`${s.timelineRow} ${s.rowRight}`}>
        {CardEl}
        {NodeEl}
        <div></div>
      </div>
    );
  }

  return (
    <div className={`${s.timelineRow} ${s.rowLeft}`}>
      <div></div>
      {NodeEl}
      {CardEl}
    </div>
  );
};
// rowLeft: empty TRÁI, node GIỮA, card PHẢI


/* ════════════════════════════════════════════════════════════
   SERVICE TIMELINE SECTION
   ════════════════════════════════════════════════════════════ */
export const ServiceTimeline = ({ services = TIMELINE_SERVICES }) => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(`.${s.spine}`, {
        scaleY: 0, transformOrigin: 'top center', duration: 1.6, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
      });
      gsap.from(`.${s.nodeLabel}`, {
        scale: 0, opacity: 0, stagger: 0.22, duration: 0.75, ease: 'back.out(2)',immediateRender: false,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', once: true },
      });
      gsap.utils.toArray(`.${s.timelineRow}`).forEach((row, i) => {
        gsap.from(row, {
          x: i % 2 === 0 ? 70 : -70,
          opacity: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: row, start: 'top 82%', once: true },
        });
      });
      gsap.from(`.${s.tlHeader} > *`, {
        y: 28, opacity: 0, stagger: 0.14, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={s.timelineSection} id="dich-vu">
      <div className={s.container}>
        <div className={s.tlHeader}>
          <span className={s.miniEyebrow}>Dịch Vụ</span>
          <h2 className={s.sectionTitle}>
            Chúng Tôi <span className={s.shineText}>Mang Đến</span><br />Điều Gì?
          </h2>
          <p className={s.tlHeaderDesc}>
            Từng dịch vụ được thiết kế để giải quyết một bài toán vận chuyển cụ thể —
            chính xác, nhanh, và minh bạch từng khâu.
          </p>
        </div>

        <div className={s.timelineWrapper}>
          <div className={s.spine} />
       {services.map((svc, i) => (
            <TimelineCard key={svc.id || i} service={svc} index={i} />
          ))}
        </div>

        <div className={s.tlCta}>
          <Link to="/lien-he" className={s.btnPrimary}>Tư Vấn Miễn Phí</Link>
          <span className={s.tlCtaNote}>Đội ngũ phản hồi trong vòng 30 phút</span>
        </div>
      </div>
    </section>
  );
};

/* ════════════════════════════════════════════════════════════
   PROCESS STEPPER — NGANG + BÁNH XÍCH
   ════════════════════════════════════════════════════════════ */
const STEP_DURATION = 1800;

export const ProcessStepper = ({ stepsData = PROCESS_STEPS }) => {
  const sectionRef  = useRef(null);
  const fillRef     = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [railVisible, setRailVisible] = useState(false);

useEffect(() => {
    if (!stepsData.length) return;
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % stepsData.length);
    }, STEP_DURATION);
    return () => clearInterval(interval);
  }, [stepsData.length]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(`.${s.centerHeader} > *`, {
        y: 28, opacity: 0, stagger: 0.14, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
      });
      gsap.utils.toArray(`.${s.processStep}`).forEach((step, i) => {
        gsap.from(step, {
          y: 40, opacity: 0, duration: 0.75, ease: 'power3.out', delay: i * 0.08,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
        });
      });
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 75%',
        once: true,
        onEnter: () => setRailVisible(true),
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={s.processSection}>
      <div className={s.container}>
        <div className={s.centerHeader}>
          <span className={s.miniEyebrowDark}>Quy Trình</span>
          <h2 className={s.sectionTitleLight}>
            Làm Việc <span className={s.shineTextAmber}>Chuyên Nghiệp</span>
          </h2>
          <p className={s.processSubhead}>
            Mỗi đơn hàng đều trải qua 5 bước kiểm soát chặt chẽ —
            từ lúc tiếp nhận đến khi bàn giao tận tay.
          </p>
        </div>

        <div className={s.processTrackWrapper}>
          <div className={s.processStepsRow}>
            <div className={s.processRail}>
              <div ref={fillRef} className={`${s.railFill} ${railVisible ? s.visible : ''}`} />
              <div className={s.railDashes} />
              <div className={s.railDot} />
            </div>
        {stepsData.map((step, i) => (
              <ProcessStepCard key={step.id || step.step_order || i} step={step} isActive={activeStep === i} />
            ))}
          </div>
        </div>

        <div className={s.processCta}>
          <span className={s.processCtaLabel}>Sẵn sàng hợp tác?</span>
          <p className={s.processCtaNote}>Cuộn xuống để gửi yêu cầu — phản hồi trong 30 phút · Tư vấn miễn phí</p>
        </div>
      </div>
    </section>
  );
};

const ProcessStepCard = ({ step, isActive }) => {
  const cardRef = useRef(null);
  useSpotlight(cardRef);
  return (
    <div className={s.processStep}>
<div className={`${s.stepCircle} ${isActive ? s.active : ''}`}>
        <span className={s.stepNumber}>{step.id || step.step_order}</span>
      </div>
      <div ref={cardRef} className={`${s.stepCard} ${isActive ? s.active : ''}`}>
        <span className={s.spotlight} />
        <div className={s.stepIconWrap}>{step.icon || ICON_MAP[step.icon_key] || <Zap size={20} />}</div>
        <h4 className={s.stepTitle}>{step.title}</h4>
        <p className={s.stepDesc}>{step.desc}</p>
        <div className={s.stepIndex}>0{step.id || step.step_order}</div>
      </div>
    </div>
  );
};

export const ContactSection = ({ contactData }) => {
  const sectionRef = useRef(null);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', service: '', cargo: '', note: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const ctx = gsap.context(() => {
      const commonTrigger = { trigger: sectionRef.current, once: true };

      gsap.fromTo(
        `.${s.contactHeader} > *`,
        { y: 28, opacity: 0 },
        {
          y: 0, opacity: 1, stagger: 0.14, duration: 0.8, ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: { ...commonTrigger, start: 'top 80%' },
        },
      );
      gsap.fromTo(
        `.${s.contactLeft}`,
        { x: -50, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 1.0, ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: { ...commonTrigger, start: 'top 75%' },
        },
      );
      gsap.fromTo(
        `.${s.envelopeCard}`,
        { x: 50, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 1.0, ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: { ...commonTrigger, start: 'top 75%' },
        },
      );

      // Dữ liệu API và ảnh có thể làm thay đổi chiều cao trang sau khi chuyển route.
      // Refresh lại mốc cuộn để trigger phần liên hệ không dùng tọa độ cũ.
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, sectionRef);
    return () => ctx.revert();
  }, [contactData]);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (submitError) setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = form.name.trim();
    const phone = form.phone.trim();
    const email = form.email.trim();

    if (!name || !phone || !form.service) {
      setSubmitError('Vui lòng nhập họ tên, số điện thoại và chọn dịch vụ cần tư vấn.');
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubmitError('Địa chỉ email chưa đúng định dạng.');
      return;
    }

    const message = [
      `Dịch vụ quan tâm: ${form.service}`,
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
      setForm({ name: '', phone: '', email: '', service: '', cargo: '', note: '' });
    } catch (error) {
      setSubmitError(error.message || 'Không thể gửi yêu cầu. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section ref={sectionRef} className={s.contactSection} id="lien-he">
      <div className={s.contactInner}>

        {/* Header */}
        <div className={s.contactHeader}>
          <span className={s.miniEyebrowSun}>
            <Mail size={12} /> Liên Hệ Cho Chúng Tôi
          </span>
          <h2 className={s.sectionTitleLight}>
            Gửi Yêu Cầu <span className={s.shineTextSun}>Dịch Vụ</span>
          </h2>
          <p className={s.contactSubhead}>
            Điền thông tin bên dưới — đội ngũ chúng tôi sẽ báo giá chi tiết sớm nhất.
          </p>
        </div>

        {/* 2-col layout */}
        <div className={s.contactLayout}>

          {/* ── CỘT TRÁI: ảnh + info ── */}
          <div className={s.contactLeft}>
            {/* Ảnh thực tế */}
            <div className={s.contactLeftImg}>
         <img
                src={contactData?.left_image || 'https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=1200&auto=format&fit=crop'}
                alt="Kho bãi Việt Hương"
              />
            </div>

            {/* Panel thông tin */}
            <div className={s.contactInfoPanel}>
    <h3 className={s.contactInfoTitle}>{contactData?.company_name || 'Việt Hương Logistics'}</h3>
              <p className={s.contactInfoTagline}>{contactData?.tagline || 'Uy Tín · Nhanh Chóng · Tận Tâm'}</p>

              <ul className={s.contactInfoList}>
                {(contactData?.items || CONTACT_INFO).map((item, i) => (
                  <li key={i} className={s.contactInfoItem}>
                    <span className={s.contactInfoIcon}>{item.icon || ICON_MAP[item.icon_key] || <MapPin size={15} />}</span>
                    <span className={s.contactInfoText}>
                      <strong>{item.label}</strong>
                      {item.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

  
          <div className={s.contactRight}>
            <div className={s.envelopeCard}>
              <div className={s.envelopeBody}>
                {/* Ánh nắng nội thất */}
                <div className="sunburstInner" />

                {submitted ? (
                  <div className={s.submitSuccess}>
                    <div className={s.submitSuccessIcon}>
                      <CheckCircle2 size={30} />
                    </div>
                    <p className={s.submitSuccessTitle}>Gửi thành công!</p>
                    <p className={s.submitSuccessNote}>
                      Chúng tôi sẽ liên hệ lại trong vòng 30 phút.<br />
                      Cảm ơn bạn đã tin tưởng Việt Hương Logistics.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className={s.contactFormEyebrow}>
                      <Send size={12} /> Báo giá trong 30 phút
                    </div>
                    <h3 className={s.contactFormTitle}>Liên Hệ Tư Vấn Ngay</h3>
                    <p className={s.contactFormSub}>
                      Tư vấn miễn phí · Không ràng buộc · Phản hồi nhanh 24/7
                    </p>

                    <form className={s.contactForm} onSubmit={handleSubmit}>
                      <div className={s.formRow}>
                        <div className={s.formGroup}>
                          <label className={s.formLabel}>Họ &amp; Tên *</label>
                          <input
                            className={s.formInput}
                            name="name"
                            placeholder="Mời bạn nhập thông tin"
                            value={form.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className={s.formGroup}>
                          <label className={s.formLabel}>Số điện thoại *</label>
                          <input
                            className={s.formInput}
                            name="phone"
                            placeholder="Mời bạn nhập số điện thoại"
                            value={form.phone}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className={s.formGroup}>
                        <label className={s.formLabel}>Email</label>
                        <input
                          className={s.formInput}
                          name="email"
                          type="email"
                          placeholder="email@congty.com"
                          value={form.email}
                          onChange={handleChange}
                        />
                      </div>

                      <div className={s.formRow}>
                        <div className={s.formGroup}>
                          <label className={s.formLabel}>Dịch vụ cần *</label>
                          <select
                            className={s.formSelect}
                            name="service"
                            value={form.service}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Chọn dịch vụ…</option>
                            <option>Vận chuyển nội địa</option>
                            <option>Vận chuyển quốc tế</option>
                            <option>Logistics &amp; Kho bãi</option>
                            <option>Chuyển phát nhanh</option>
                          </select>
                        </div>
                        <div className={s.formGroup}>
                          <label className={s.formLabel}>Loại hàng hóa</label>
                          <input
                            className={s.formInput}
                            name="cargo"
                            placeholder="Hàng điện tử, thực phẩm…"
                            value={form.cargo}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className={s.formGroup}>
                        <label className={s.formLabel}>Ghi chú thêm</label>
                        <textarea
                          className={s.formTextarea}
                          name="note"
                          placeholder="Tuyến đường, thời gian, yêu cầu đặc biệt…"
                          value={form.note}
                          onChange={handleChange}
                          rows={3}
                        />
                      </div>

                      {submitError && (
                        <p className={s.formError} role="alert">{submitError}</p>
                      )}

                      <button
                        type="submit"
                        className={s.contactSubmit}
                        disabled={submitting}
                        aria-busy={submitting}
                      >
                        <Send size={16} /> {submitting ? 'Đang Gửi...' : 'Gửi Yêu Cầu Ngay'}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>{/* end contactLayout */}
      </div>
    </section>
  );
};

/* ════════════════════════════════════════════════════════════
   DEFAULT EXPORT
   ════════════════════════════════════════════════════════════ */
export default function ServicesSections() {
  const { hash } = useLocation()
  const [pageData, setPageData] = useState(null)
  const [services, setServices] = useState(null)
  const [dataReady, setDataReady] = useState(false)

  useEffect(() => {
    if (!hash || !dataReady) return
    const id = decodeURIComponent(hash.slice(1))
    let secondFrame = 0
    const firstFrame = requestAnimationFrame(() => {
      ScrollTrigger.refresh()
      secondFrame = requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    })
    return () => {
      cancelAnimationFrame(firstFrame)
      cancelAnimationFrame(secondFrame)
    }
  }, [hash, dataReady])

  useEffect(() => {
    Promise.all([
      axios.get(`${API_BASE}/services-page`),
      axios.get(`${API_BASE}/services-page/items`),
    ]).then(([pageRes, itemsRes]) => {
      setPageData(pageRes.data.data)
      const activeItems = (itemsRes.data.data || []).filter(i => i.is_active)
      setServices(activeItems.length ? activeItems : TIMELINE_SERVICES)
    }).catch(() => {
      // Lỗi → giữ null → các component dùng hardcode mặc định
    }).finally(() => setDataReady(true))
  }, [])

  return (
    <>
      <ServicesBanner  bannerData={pageData?.banner} />
      <ServiceTimeline services={services || TIMELINE_SERVICES} />
      <ProcessStepper  stepsData={pageData?.process_steps || PROCESS_STEPS} />
      <ContactSection  contactData={pageData?.contact_info} />
    </>
  )
}
