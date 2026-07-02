import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './WhyUs.module.scss'

gsap.registerPlugin(ScrollTrigger)

const reasons = [
  { num: '01', title: 'Đội Xe Hiện Đại', desc: 'Hơn 500 phương tiện đa dạng, bảo trì định kỳ, đảm bảo vận hành 24/7.' },
  { num: '02', title: 'Công Nghệ GPS Real-time', desc: 'Khách hàng theo dõi lộ trình và tình trạng hàng hóa trực tiếp qua app.' },
  { num: '03', title: 'Đội Ngũ Chuyên Nghiệp', desc: '800+ nhân sự được đào tạo bài bản, tận tâm với từng chuyến hàng.' },
  { num: '04', title: 'Bảo Hiểm Toàn Diện', desc: 'Hàng hóa được bảo hiểm 100% giá trị, giải quyết bồi thường nhanh chóng.' },
  { num: '05', title: 'Giá Cạnh Tranh', desc: 'Tối ưu chi phí vận hành, báo giá minh bạch, không phát sinh chi phí ẩn.' },
  { num: '06', title: 'Hỗ Trợ 24/7', desc: 'Đội ngũ CSKH túc trực mọi lúc, xử lý sự cố trong vòng 30 phút.' },
]

export default function WhyUs() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.why-item',
        { x: -30, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true }
        }
      )
      gsap.fromTo('.why-visual',
        { scale: 0.9, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true }
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="why-us" ref={sectionRef} className={styles.whyUs}>
      <div className={`container ${styles.inner}`}>
        {/* Left content */}
        <div className={styles.left}>
          <p className="section-label">Tại Sao Chọn Chúng Tôi</p>
          <h2 className="section-title">
            Cam Kết<br />
            <em style={{ fontStyle: 'normal', color: '#f40c0c' }}>Chất Lượng</em><br />
            Vượt Trội
          </h2>
          <p className={styles.intro}>
            Mỗi chuyến hàng là một cam kết. Chúng tôi không chỉ vận chuyển — chúng tôi bảo vệ
            giá trị của bạn.
          </p>

          <div className={styles.list}>
            {reasons.map((r, i) => (
              <div key={i} className={`${styles.item} why-item`}>
                <span className={styles.num}>{r.num}</span>
                <div>
                  <h3 className={styles.itemTitle}>{r.title}</h3>
                  <p className={styles.itemDesc}>{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: big visual */}
        <div className={`${styles.right} why-visual`}>
          <div className={styles.bigNumber}>500<span>+</span></div>
          <p className={styles.bigLabel}>Phương tiện vận tải</p>

          <div className={styles.circleStats}>
            {[
              { val: '99%', label: 'Đúng hẹn' },
              { val: '24/7', label: 'Hỗ trợ' },
              { val: '63', label: 'Tỉnh thành' },
            ].map((c, i) => (
              <div key={i} className={styles.circleStat}>
                <strong>{c.val}</strong>
                <span>{c.label}</span>
              </div>
            ))}
          </div>

          <div className={styles.redAccent} aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}
