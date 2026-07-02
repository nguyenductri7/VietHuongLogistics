# 🚚 Van Tai Viet Huong - Backend API

Backend Node.js + Express + MySQL + Cloudinary cho website vận tải.

---

## 📋 Yêu cầu

- **Node.js** >= 16.x
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

JWT_SECRET=chuỗi_bí_mật_dài_và_ngẫu_nhiên

CLOUDINARY_CLOUD_NAME=tên_cloud_của_bạn
CLOUDINARY_API_KEY=api_key_của_bạn
CLOUDINARY_API_SECRET=api_secret_của_bạn

FRONTEND_URL=http://localhost:5173
```

### Bước 3: Tạo database MySQL

```bash
# Đăng nhập MySQL
mysql -u root -p

# Chạy script tạo database
source config/init.sql
```

Hoặc mở **MySQL Workbench** → chạy file `config/init.sql`.

### Bước 4: Tạo mật khẩu admin

```bash
node generate-password.js Admin@123
```

Copy hash xuất ra → chạy SQL:

```sql
USE vantaiviethuong;
UPDATE admin_users SET password = 'HASH_Ở_TRÊN' WHERE username = 'admin';
```

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
│   └── init.sql         # Script tạo database
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
├── .env.example
├── generate-password.js
├── package.json
└── server.js            # Entry point
```
