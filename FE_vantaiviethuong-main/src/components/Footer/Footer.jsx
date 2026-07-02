import styles from './Footer.module.scss'
import { MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo">
      {/* BỎ div.container — dùng padding trực tiếp trong SCSS */}
      <div className={styles.top}>

        {/* Cột 1 */}
        <div className={styles.brand}>
          <img src="/src/assets/logofooter.png" alt="Việt Hương Logistics" className={styles.logoImg}/>
          <p className={styles.companyName}>CÔNG TY TNHH GIAO NHẬN VẬN TẢI VIỆT HƯƠNG</p>
          <p className={styles.taxCode}>Mã số thuế: 0402058419</p>

          <div className={styles.socials}>
            {/* Facebook */}
            <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer"
               className={styles.socials__facebook}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
              </svg>
            </a>

            {/* YouTube */}
            <a href="https://youtube.com" aria-label="YouTube" target="_blank" rel="noopener noreferrer"
               className={styles.socials__youtube}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer"
               className={styles.socials__instagram}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
              </svg>
            </a>

            {/* Zalo */}
            <a href="https://zalo.me" aria-label="Zalo" target="_blank" rel="noopener noreferrer"
               className={styles.socials__zalo}>
              <svg viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 4C13 4 4 13 4 24c0 5.5 2.2 10.5 5.8 14.1L8 44l6.2-1.6A19.8 19.8 0 0024 44c11 0 20-9 20-20S35 4 24 4zm9.8 27.4l-2.4.2c-.9 0-1.5-.3-2-.8-.5-.5-2.2-2.3-2.2-2.3s-4.7 2.1-7.5-2.5c-1.3-2.1-1-4.5.7-6.1.4-.4.7-.2.9.1l1.4 2c.2.3.1.6-.1.8-.7.6-.9 1.5-.5 2.3.6 1.2 2 1.6 3.2 1 .4-.2.7-.1.9.2l1.3 1.9c.2.3.1.6-.2.8-.3.2-.6.3-.9.4 1 1.2 2 2.4 2 2.4.4.4.9.6 1.5.5l2.1-.2c.4 0 .6.3.5.6l-.7 1.3c-.1.3-.4.4-.6.4h-.4z"/>
              </svg>
            </a>

            {/* Gmail — envelope đỏ nền trắng */}
            <a href="mailto:info@vantaiviethuong.com" aria-label="Gmail"
               className={styles.socials__gmail}>
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 6C2 4.9 2.9 4 4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6z" fill="#e57e7e"/>
                <path d="M2 6l10 7 10-7" stroke="#EA4335" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Cột 2: Trụ sở chính */}
        <div className={styles.officeCol}>
          <h4 className={styles.colTitle}>TRỤ SỞ CHÍNH</h4>
          <div className={styles.addressRow}>
            <MapPin size={15} className={styles.pinIcon}/>
            <p>58 Phước Lý 9 – Phường Hòa Khánh – TP.Đà Nẵng</p>
          </div>
          <p>Hotline: <a href="tel:0905386888" className={styles.hotline}>0905.386.888</a></p>
          <p>Email: <a href="mailto:info@vantaiviethuong.com" className={styles.emailLink}>info@vantaiviethuong.com</a></p>
        </div>

        {/* Cột 3: Văn phòng đại diện */}
        <div className={styles.officeCol}>
          <h4 className={styles.colTitle}>VĂN PHÒNG ĐẠI DIỆN</h4>
          {[
            { city: 'ĐÀ NẴNG',     addr: '58 Phước Lý 9 – Phường Hòa Khánh – TP. Đà Nẵng' },
            { city: 'ĐÀ NẴNG',     addr: '133 Trung Lương 14, Phường Hòa Xuân, TP. Đà Nẵng' },
            { city: 'ĐÀ NẴNG',     addr: 'Đường Đ1, Thôn Đồng Yên, Xã Duy Xuyên, TP. Đà Nẵng' },
            { city: 'HỒ CHÍ MINH', addr: '246 Nguyễn Duy Trinh, P. Bình Trưng, TP. Hồ Chí Minh' },
            { city: 'HẢI PHÒNG',   addr: '298 Phạm Văn Đồng, Phường Hưng Đạo, TP. Hải Phòng' }
          ].map(({ city, addr }, i) => (
            <div className={styles.officeItem} key={i}>
              <MapPin size={13} className={styles.pinIcon}/>
              <p className={styles.cityAddr}>
                <strong className={styles.city}>{city}:</strong>{' '}{addr}
              </p>
            </div>
          ))}
        </div>

      </div>

      <div className={styles.bottom}>
        <p>© Copyright 2026 – CÔNG TY TNHH GIAO NHẬN VẬN TẢI VIỆT HƯƠNG</p>
        <div className={styles.legal}>
          <a href="#">Quy định &amp; Điều khoản</a>
          <span>|</span>
          <a href="#">Chính sách bảo mật</a>
          <span>|</span>
          <a href="#">Chính sách Cookie</a>
        </div>
      </div>
    </footer>
  )
}