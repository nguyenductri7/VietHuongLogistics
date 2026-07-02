# Vận Tải Việt Hương — Landing Page

React Vite + SCSS + GSAP | vantaiviethuong.com

## Cài đặt

```bash
npm install
npm run dev
```

Build production:
```bash
npm run build
npm run preview
```

---

## Cấu trúc thư mục

```
src/
├── components/
│   ├── Navbar/          # Navbar ẩn/hiện khi scroll (GSAP)
│   ├── Hero/            # Video loop + logo badge + stats
│   ├── About/           # Giới thiệu + milestone timeline
│   ├── Services/        # 4 dịch vụ chính
│   ├── WhyUs/           # 6 lý do + sticky visual
│   ├── Partners/        # Infinite scroll ticker + testimonial
│   ├── Blog/            # 3 bài viết mới nhất
│   ├── Contact/         # Form liên hệ + thông tin
│   └── Footer/          # Footer đầy đủ
├── hooks/
│   └── useScrollReveal.js   # GSAP ScrollTrigger hook
└── styles/
    ├── variables.scss   # Design tokens
    └── global.scss      # Global styles
```

---

## ⚠️ Thêm video hero

Đặt file video MP4 của bạn vào:
```
public/videos/hero-truck.mp4
```

Sau đó bỏ comment dòng `src` trong `Hero.jsx`:
```jsx
// Tìm dòng này trong src/components/Hero/Hero.jsx:
// src="/videos/hero-truck.mp4"

// Bỏ comment thành:
src="/videos/hero-truck.mp4"
```

---

## SEO đã tích hợp

- ✅ Meta tags đầy đủ (title, description, keywords)
- ✅ Open Graph (Facebook, LinkedIn)
- ✅ Twitter Card
- ✅ Schema.org JSON-LD (Organization)
- ✅ Canonical URL
- ✅ robots.txt
- ✅ Semantic HTML (article, section, nav, header, footer, address)
- ✅ itemScope / itemProp microdata
- ✅ aria-label accessibility
- ✅ lang="vi" trên thẻ html

---

## GSAP Animations

- **Navbar**: Hide on scroll down, show on scroll up
- **Hero**: Red wipe intro → stagger content reveal → floating logo badge
- **About**: Split slide-in (left + right)
- **Services**: Card stagger reveal
- **WhyUs**: List items cascade + number counter
- **Partners**: Infinite horizontal ticker
- **Blog**: Card stagger reveal
- **Contact**: Split slide-in form

---

## Thay đổi thông tin

Tìm và thay thế placeholder trong các file:
- Số hotline: `1800 xxxx xxxx`
- Email: `info@vantaiviethuong.com`
- Địa chỉ: `123 Đường Vận Tải, Q.7, TP.HCM`
- Số liệu thống kê trong `Hero.jsx` và `WhyUs.jsx`
- Bài viết blog trong `Blog.jsx`
- Đối tác trong `Partners.jsx`
