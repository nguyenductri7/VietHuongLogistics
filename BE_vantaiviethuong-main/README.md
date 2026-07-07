# 🚚 Van Tai Viet Huong - Backend API

Backend Node.js + Express + MySQL + Cloudinary cho website vận tải.

---

## 📋 Yêu cầu

- **Node.js** >= 18.x
- **MySQL** >= 8.0
- Tài khoản **Cloudinary** (miễn phí tại https://cloudinary.com)

---

## ⚡ Cài đặt nhanh

### Bước 1: Cài dependencies

```bash
cd backend
npm install
```

### Bước 2: Tạo file `.env`

```bash
# Copy file mẫu
copy .env.example .env
```

Mở `.env` và điền thông tin:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=mật_khẩu_mysql_của_bạn
DB_NAME=vantaiviethuong

# Chỉ cần cho lần khởi tạo database mới; xóa khỏi môi trường sau khi Admin được tạo
INITIAL_ADMIN_USERNAME=admin
INITIAL_ADMIN_PASSWORD=mật_khẩu_mạnh_tối_thiểu_8_ký_tự
INITIAL_ADMIN_NAME=Quản trị viên
INITIAL_ADMIN_EMAIL=admin@example.com

JWT_SECRET=chuỗi_bí_mật_dài_và_ngẫu_nhiên

CLOUDINARY_CLOUD_NAME=tên_cloud_của_bạn
CLOUDINARY_API_KEY=api_key_của_bạn
CLOUDINARY_API_SECRET=api_secret_của_bạn

FRONTEND_URL=http://localhost:5173
```

### Bước 3: Cập nhật schema database

```bash
npm run migrate
```

Không chạy `config/init.sql` thủ công. Lệnh migration dùng đúng database trong
`DB_NAME`, chỉ chạy các phiên bản chưa áp dụng và ghi lịch sử vào bảng
`schema_migrations`. Khi `npm start`, backend cũng tự kiểm tra và chạy migration
trước khi đánh dấu database sẵn sàng.

### Bước 4: Tạo tài khoản Admin ban đầu

Với database mới, khai báo các biến `INITIAL_ADMIN_*` như ví dụ phía trên rồi
chạy `npm run migrate` hoặc deploy backend. Hệ thống chỉ tạo Admin khi bảng
`admin_users` chưa có tài khoản và không tự ghi đè mật khẩu ở những lần chạy sau.
Sau khi đăng nhập thành công, xóa `INITIAL_ADMIN_PASSWORD` khỏi môi trường.

### Bước 5: Chạy server

```bash
# Development (tự reload khi sửa code)
npm run dev

# Production
npm start
```

Server chạy tại: `http://localhost:5000`

---

## 🌐 API Endpoints

### Auth
| Method | URL | Mô tả | Auth |
|--------|-----|-------|------|
| POST | `/api/auth/login` | Đăng nhập admin | ❌ |
| GET | `/api/auth/me` | Thông tin user hiện tại | ✅ |
| POST | `/api/auth/change-password` | Đổi mật khẩu | ✅ |

**Login request:**
```json
POST /api/auth/login
{
  "username": "admin",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": { "id": 1, "username": "admin", "role": "superadmin" }
}
```

---

### Blog / Tin tức
| Method | URL | Mô tả | Auth |
|--------|-----|-------|------|
| GET | `/api/blogs` | Danh sách bài (public, chỉ published) | ❌ |
| GET | `/api/blogs/:slugOrId` | Chi tiết bài | ❌ |
| GET | `/api/blogs/admin/list` | Danh sách (admin, có filter) | ✅ |
| POST | `/api/blogs/admin` | Tạo bài mới | ✅ |
| PUT | `/api/blogs/admin/:id` | Cập nhật bài | ✅ |
| DELETE | `/api/blogs/admin/:id` | Xóa bài | ✅ |

**Query params cho GET list:**
- `page=1&limit=10` - Phân trang
- `status=published|draft|archived`
- `category=Tin tức`
- `search=từ khóa`
- `featured=1`

**Tạo bài (multipart/form-data):**
```
POST /api/blogs/admin
Authorization: Bearer {token}
Content-Type: multipart/form-data

thumbnail: [file ảnh]
title: Tiêu đề bài viết
excerpt: Mô tả ngắn
content: <p>Nội dung HTML</p>
category: Tin tức
tags: tag1,tag2
status: draft|published
is_featured: 0|1
```

---

### Website Settings
| Method | URL | Mô tả | Auth |
|--------|-----|-------|------|
| GET | `/api/settings` | Lấy toàn bộ settings | ❌ |
| PUT | `/api/settings/admin` | Cập nhật text settings | ✅ |
| PUT | `/api/settings/admin/image/:key` | Upload ảnh setting | ✅ |

**Cập nhật settings:**
```json
PUT /api/settings/admin
{
  "hero_title": "Vận Tải Việt Hưởng",
  "hero_subtitle": "Chuyên nghiệp, uy tín",
  "contact_phone": "0905 123 456"
}
```

**Upload ảnh hero:**
```
PUT /api/settings/admin/image/hero_image_url
Content-Type: multipart/form-data
image: [file ảnh]
```

**Các key ảnh hỗ trợ:** `hero_image_url`, `about_image_url`, `logo_url`

---

### Partners / Đối tác
| Method | URL | Mô tả | Auth |
|--------|-----|-------|------|
| GET | `/api/partners` | Danh sách (public, active) | ❌ |
| GET | `/api/partners/admin` | Tất cả (admin) | ✅ |
| POST | `/api/partners/admin` | Thêm đối tác | ✅ |
| PUT | `/api/partners/admin/:id` | Cập nhật | ✅ |
| DELETE | `/api/partners/admin/:id` | Xóa | ✅ |

---

### Contact / Liên hệ
| Method | URL | Mô tả | Auth |
|--------|-----|-------|------|
| POST | `/api/contact` | Gửi form liên hệ | ❌ |
| GET | `/api/contact/admin` | Danh sách tin nhắn | ✅ |
| GET | `/api/contact/admin/stats` | Thống kê | ✅ |
| PUT | `/api/contact/admin/:id/status` | Đổi trạng thái | ✅ |
| DELETE | `/api/contact/admin/:id` | Xóa tin nhắn | ✅ |

---

## 🔐 Xác thực

Tất cả API admin cần header:
```
Authorization: Bearer {token}
```

Token lấy từ response của `/api/auth/login`, hết hạn sau 7 ngày.

---

## ☁️ Cloudinary Setup

1. Đăng ký tại [cloudinary.com](https://cloudinary.com) (miễn phí 25GB)
2. Vào **Dashboard** → copy `Cloud Name`, `API Key`, `API Secret`
3. Điền vào file `.env`

Ảnh sẽ được lưu vào các folder:
- `vantaiviethuong/blog/` - Ảnh bài viết
- `vantaiviethuong/website/` - Ảnh website (hero, logo...)
- `vantaiviethuong/partners/` - Logo đối tác

---

## 🗂️ Cấu trúc thư mục

```
backend/
├── config/
│   ├── database.js      # Kết nối MySQL
│   ├── cloudinary.js    # Config Cloudinary + multer
│   └── init.sql         # File cũ, không dùng cho deploy mới
├── migrations/          # Schema có phiên bản, chạy theo thứ tự
├── controllers/
│   ├── authController.js
│   ├── blogController.js
│   ├── settingsController.js
│   ├── partnerController.js
│   └── contactController.js
├── middleware/
│   └── auth.js          # JWT middleware
├── routes/
│   ├── auth.js
│   ├── blogs.js
│   ├── settings.js
│   ├── partners.js
│   └── contact.js
├── scripts/
│   └── migrate.js       # Migration runner
├── .env.example
├── generate-password.js
├── package.json
└── server.js            # Entry point
```
