# MÔ TẢ, Ý NGHĨA VÀ TỔNG KẾT PHÁT TRIỂN DỰ ÁN VIỆT HƯƠNG LOGISTICS

## 1. Thông tin chung

- **Tên dự án:** Website Việt Hương Logistics
- **Tên miền chính:** `https://viethuonglogistics.com`
- **Loại dự án:** Website giới thiệu doanh nghiệp kết hợp hệ thống quản trị nội dung và quản lý khách hàng
- **Lĩnh vực:** Vận tải, giao nhận hàng hóa, logistics và kho bãi
- **Frontend:** React, Vite, SCSS
- **Backend:** Node.js, Express
- **Database:** MySQL
- **Lưu trữ hình ảnh:** Cloudinary
- **Gửi email:** Resend API
- **Triển khai Frontend:** cPanel/AZDIGI và Vercel dùng cho kiểm thử
- **Triển khai Backend:** Render
- **Database production:** Aiven MySQL
- **Ngày cập nhật tài liệu:** 27/07/2026

## 2. Mô tả dự án

Việt Hương Logistics là website đại diện trực tuyến cho doanh nghiệp hoạt động trong lĩnh vực vận tải và logistics. Website giúp doanh nghiệp giới thiệu thương hiệu, năng lực, dịch vụ, mạng lưới văn phòng, tin tức chuyên ngành và tiếp nhận nhu cầu tư vấn từ khách hàng.

Dự án không chỉ là một website giới thiệu tĩnh. Hệ thống đã được phát triển thành một nền tảng quản trị nội dung, trong đó Admin có thể cập nhật phần lớn thông tin xuất hiện trên website mà không cần sửa trực tiếp trong mã nguồn.

Hệ thống gồm ba phần chính:

1. **Website dành cho khách hàng:** Hiển thị thông tin doanh nghiệp, dịch vụ, bài viết, FAQ, chi nhánh, đánh giá và các biểu mẫu liên hệ.
2. **Trang quản trị Admin:** Quản lý nội dung website, tin tức, dịch vụ, câu hỏi, liên hệ, chi nhánh, lịch sử chỉnh sửa và hồ sơ quản trị viên.
3. **Backend và database:** Cung cấp API, xác thực, lưu trữ dữ liệu, quản lý upload, gửi email và ghi nhận lịch sử thao tác.

## 3. Ý nghĩa của dự án

### 3.1. Đối với doanh nghiệp

- Xây dựng hình ảnh Việt Hương Logistics chuyên nghiệp và thống nhất trên môi trường số.
- Giúp khách hàng hiểu rõ năng lực, dịch vụ và quy trình hoạt động của doanh nghiệp.
- Tạo một kênh tiếp nhận khách hàng tiềm năng hoạt động liên tục.
- Giảm phụ thuộc vào nhân viên kỹ thuật khi cần cập nhật nội dung.
- Tập trung dữ liệu liên hệ và thắc mắc của khách hàng vào một hệ thống quản lý chung.
- Hỗ trợ bộ phận kinh doanh theo dõi quá trình liên hệ và chăm sóc khách hàng.
- Giảm nguy cơ mất nội dung nhờ lịch sử chỉnh sửa và chức năng hoàn tác.

### 3.2. Đối với khách hàng

- Dễ dàng tìm hiểu các loại hình vận tải và dịch vụ logistics.
- Xem được nội dung chi tiết, lợi ích, quy trình và thông tin cần chuẩn bị cho từng dịch vụ.
- Gửi yêu cầu tư vấn hoặc nhận báo giá trực tiếp trên website.
- Gửi câu hỏi và cung cấp email để doanh nghiệp phản hồi.
- Tìm đúng địa chỉ, số điện thoại và vị trí văn phòng hoặc chi nhánh.
- Theo dõi tin tức và kiến thức liên quan đến ngành vận tải.

### 3.3. Đối với người quản trị

- Quản lý nội dung tập trung trong một trang Admin.
- Thêm, sửa, xoá, ẩn/hiện và sắp xếp dữ liệu mà không phải sửa code.
- Nhận biết liên hệ hoặc câu hỏi mới qua badge thông báo.
- Theo dõi trạng thái chăm sóc khách hàng bằng mini CRM.
- Xem lịch sử chỉnh sửa, người thực hiện, thời gian và nội dung thay đổi.
- Hoàn tác các thay đổi sai đối với nội dung CMS có hỗ trợ phiên bản.

## 4. Kiến trúc tổng thể

```text
Khách hàng / Admin
        |
        v
Frontend React + Vite
        |
        | HTTPS REST API
        v
Backend Node.js + Express trên Render
        |
        +-------------------+
        |                   |
        v                   v
Aiven MySQL            Cloudinary
        |
        v
Resend API gửi thông báo email
```

### 4.1. Frontend

Frontend sử dụng React và React Router để xây dựng giao diện dạng Single Page Application. SCSS được dùng để quản lý giao diện; GSAP và Three.js hỗ trợ các hiệu ứng chuyển động và mô hình xe 3D; Tiptap được dùng làm trình soạn thảo nội dung bài viết.

### 4.2. Backend

Backend sử dụng Express để cung cấp REST API, xử lý xác thực JWT, kiểm tra dữ liệu, upload file, thao tác MySQL, gửi email và bảo vệ các API dành riêng cho Admin.

### 4.3. Database

MySQL lưu trữ tài khoản Admin, nội dung trang chủ, giới thiệu, dịch vụ, chi tiết dịch vụ, tin tức, danh mục tin tức, FAQ, câu hỏi khách hàng, liên hệ, chi nhánh, đối tác, đánh giá, lịch sử CMS và nhật ký thao tác.

Database hiện được quản lý bằng migration có phiên bản. Backend tự kiểm tra và chạy migration khi khởi động, giúp hạn chế lỗi thiếu bảng hoặc sai schema khi triển khai.

## 5. Các trang dành cho khách hàng

### 5.1. Trang chủ

- Hero video và ảnh fallback.
- Nội dung giới thiệu bên cạnh mô hình xe.
- Mô hình xe 3D và hiệu ứng cuộn.
- Giải pháp vận tải lấy từ dữ liệu dịch vụ thật.
- Thông tin nổi bật về doanh nghiệp.
- Logo đối tác.
- Đánh giá từ khách hàng.
- Góc nhìn ngành vận tải lấy từ bài viết đã xuất bản.
- Form tư vấn và thông tin liên hệ.
- Footer chứa thông tin doanh nghiệp.

### 5.2. Trang Về chúng tôi

- Nội dung giới thiệu doanh nghiệp.
- Lịch sử hình thành theo từng năm.
- Tầm nhìn, sứ mệnh và giá trị cốt lõi.
- Các dịch vụ liên quan.
- Video hero và ảnh fallback.
- Điều hướng sang đúng trang dịch vụ.

### 5.3. Trang Dịch vụ

- Danh sách các dịch vụ đang hoạt động.
- Ẩn hoặc hiện dịch vụ theo cấu hình Admin.
- Sắp xếp dịch vụ theo thứ tự.
- Hiển thị icon và hình ảnh do Admin upload.
- Quy trình thực hiện dịch vụ.
- Form liên hệ và nhận báo giá.

### 5.4. Trang chi tiết dịch vụ

Khi khách hàng chọn một dịch vụ, hệ thống chuyển đến trang chi tiết tương ứng. Nội dung chi tiết được chuẩn hóa theo cấu trúc:

- Giới thiệu dịch vụ.
- Đối tượng khách hàng phù hợp.
- Quy trình thực hiện.
- Lợi ích của dịch vụ.
- Hồ sơ hoặc thông tin khách hàng cần chuẩn bị.
- Câu hỏi thường gặp riêng.
- Form nhận báo giá.
- Các dịch vụ liên quan.

### 5.5. Trang Tin tức

- Danh sách bài viết đã xuất bản.
- Tìm kiếm và lọc theo danh mục.
- Hiển thị ảnh đại diện, mô tả, ngày đăng và thời gian đọc.
- Trang chi tiết bài viết sử dụng nội dung rich text.
- Khu vực bài viết nổi bật và bài viết liên quan.

### 5.6. Trang Giải đáp

- Hiển thị các nhóm câu hỏi thường gặp.
- Khách hàng có thể gửi câu hỏi mới.
- Yêu cầu nhập họ tên, số điện thoại, email và nội dung câu hỏi.
- Sau khi gửi, dữ liệu được lưu vào Admin và gửi thông báo đến email công ty.

### 5.7. Trang Văn phòng & Chi nhánh

- Hiển thị danh sách văn phòng và chi nhánh.
- Hiển thị địa chỉ, hotline, email, hình ảnh và vị trí bản đồ.
- Route chính là `/chi-nhanh`.
- Route cũ `/lien-he` được chuyển hướng để không làm hỏng các liên kết trước đây.

### 5.8. Chuyển đổi ngôn ngữ

- Đã thử nghiệm phương án nhập tay dữ liệu `{vi, en}` trong CMS.
- Đã loại bỏ dữ liệu song ngữ nhập tay cũ sau khi phát sinh lỗi hiển thị object trong React.
- Phương án hiện tại sử dụng Google Translate với nút cờ Việt Nam và Anh trên thanh menu.
- Có xử lý quay lại tiếng Việt và ẩn giao diện mặc định của Google Translate.

## 6. Các chức năng của trang Admin

### 6.1. Đăng nhập và bảo mật

- Đăng nhập bằng tài khoản Admin.
- Xác thực API bằng JWT.
- Bảo vệ toàn bộ route `/admin`.
- Kiểm tra vai trò trước các thao tác quản trị.
- Đăng xuất và xoá phiên đăng nhập.

### 6.2. Dashboard

- Tổng quan dữ liệu hệ thống.
- Truy cập nhanh đến các trang quản lý.
- Hiển thị số lượng liên hệ và câu hỏi mới.
- Không hiển thị lịch sử chỉnh sửa trực tiếp tại dashboard để giao diện gọn hơn.

### 6.3. Quản lý trang chủ

- Quản lý nội dung hero.
- Quản lý nội dung bên cạnh mô hình xe.
- Quản lý các section nội dung chính.
- Quản lý đối tác và upload logo.
- Quản lý đánh giá khách hàng, tiêu đề, nội dung và ảnh đại diện.
- Thêm, sửa, xoá và sắp xếp đánh giá.
- Từng section có nút lưu riêng để tránh nhầm phạm vi dữ liệu.

### 6.4. Quản lý trang giới thiệu

- Chỉnh sửa nội dung giới thiệu.
- Thêm hoặc xoá các mốc lịch sử.
- Thêm hoặc xoá giá trị cốt lõi.
- Quản lý danh sách dịch vụ liên quan.
- Upload icon dịch vụ.
- Upload video hero và ảnh fallback.
- Lưu lịch sử phiên bản phục vụ hoàn tác.

### 6.5. Quản lý dịch vụ

- Thêm, sửa, xoá dịch vụ.
- Ẩn hoặc hiện dịch vụ.
- Sắp xếp bằng kéo thả.
- Upload ảnh và icon.
- Quản lý quy trình thực hiện.
- Thêm hoặc xoá từng bước trong quy trình.
- Upload icon riêng cho từng bước.
- Quản lý toàn bộ nội dung trang chi tiết dịch vụ.
- Form chỉnh sửa được mở trong modal và đã sửa lỗi ô mô tả bị quá hẹp.
- Lưu lịch sử phiên bản phục vụ hoàn tác.

### 6.6. Quản lý tin tức

- Tạo bài viết mới.
- Chỉnh sửa bài viết và lấy lại đầy đủ nội dung cũ.
- Xoá bài viết có modal xác nhận.
- Lưu nháp, xuất bản hoặc lưu trữ.
- Chọn bài nổi bật.
- Upload ảnh đại diện.
- Soạn nội dung rich text.
- Chèn và upload ảnh trong nội dung.
- Tìm kiếm, lọc trạng thái và lọc danh mục.
- Tính thời gian đọc từ nội dung thật.
- Chuẩn hóa ngày đăng, tránh `Invalid Date` hoặc “Chưa có ngày”.

### 6.7. Quản lý danh mục tin tức

- Danh mục được lưu trong database thay vì chỉ khai báo cứng.
- Thêm danh mục.
- Sửa tên, thứ tự và trạng thái.
- Ẩn hoặc hiện danh mục.
- Xoá danh mục nếu chưa có bài viết sử dụng.
- Chặn xoá khi danh mục vẫn còn bài viết để bảo vệ dữ liệu.
- Khi đổi tên danh mục, cập nhật đồng bộ các bài viết đang sử dụng.
- Giao diện quản lý bằng modal riêng.
- Hiển thị số thứ tự, số bài viết và trạng thái của từng danh mục.

### 6.8. Quản lý nội dung FAQ

- Thêm, sửa, xoá danh mục FAQ.
- Thêm, sửa, xoá câu hỏi trong từng danh mục.
- Ẩn hoặc hiện nội dung.
- Chuẩn hóa chiều rộng và font chữ theo giao diện Admin chung.

### 6.9. Quản lý câu hỏi khách hàng

- Danh sách câu hỏi gửi từ trang Giải đáp.
- Hiển thị email khách hàng.
- Tìm kiếm và lọc trạng thái.
- Thay đổi trạng thái xử lý.
- Xoá câu hỏi với modal xác nhận.
- Mở Gmail để trả lời khách hàng.
- Hiển thị badge số câu hỏi chưa xử lý.
- Polling định kỳ để tự cập nhật dữ liệu mới.

### 6.10. Quản lý liên hệ và mini CRM

- Danh sách liên hệ gửi từ các form trên website.
- Hiển thị họ tên, điện thoại, email, công ty và nội dung.
- Tìm kiếm, phân trang và lọc trạng thái.
- Cập nhật trạng thái: mới, đã xem, đã phản hồi hoặc lưu trữ.
- Mở Gmail để trả lời đúng địa chỉ khách hàng.
- Ghi chú nội bộ cho từng khách hàng.
- Các hành động CRM:
  - Đã gọi.
  - Đã gửi mail.
  - Khách không nghe máy.
  - Đã chốt.
- Nhấn lại hành động đã chọn để huỷ lựa chọn.
- Ghi nhận hành động gần nhất và thời gian thực hiện.
- Badge thông báo liên hệ mới.
- Polling định kỳ để danh sách tự cập nhật.
- Có trang CRM khách hàng riêng dạng bảng Kanban.
- Pipeline gồm các giai đoạn:
  - Khách mới.
  - Đã gọi.
  - Đang báo giá.
  - Đang thương lượng.
  - Đã ký hợp đồng.
  - Hoàn thành.
- Cho phép kéo thả khách hàng giữa các giai đoạn giống Trello.
- Lưu thứ tự thẻ trong từng cột.
- Tìm kiếm khách hàng trực tiếp trên pipeline.
- Mở hồ sơ khách hàng từ từng thẻ.
- Có timeline chăm sóc riêng cho từng khách hàng.
- Tự ghi nhật ký khi tiếp nhận khách hàng và khi chuyển giai đoạn.
- Cho phép Admin thêm thủ công nhật ký cuộc gọi, email, báo giá, cuộc hẹn hoặc ghi chú.

### 6.11. Quản lý văn phòng và chi nhánh

- Thêm, sửa, xoá chi nhánh.
- Quản lý tên, địa chỉ, email, hotline và hình ảnh.
- Khai báo kinh độ và vĩ độ để đặt vị trí bản đồ.
- Đánh dấu trụ sở chính.
- Ẩn hoặc hiện chi nhánh.
- Sắp xếp thứ tự hiển thị.

### 6.12. Lịch sử chỉnh sửa CMS

- Có tab “Lịch sử chỉnh sửa” riêng trong Admin.
- Tổng hợp lịch sử của trang chủ, giới thiệu, dịch vụ và các module quản trị khác.
- Hiển thị người thực hiện, thời gian, loại thao tác và nội dung thay đổi.
- Lọc lịch sử theo trang quản lý.
- Mở chi tiết từng thay đổi.
- Chọn và xoá nhiều bản ghi một lần.
- Xoá riêng từng bản ghi.
- Hoàn tác thay đổi của các module CMS có snapshot.
- Khi hoàn tác, hệ thống khôi phục nội dung ở phiên bản ngay trước thay đổi được chọn.
- Sau khi hoàn tác, hệ thống tạo thêm một phiên bản mới để tiếp tục bảo toàn lịch sử.

### 6.13. Hồ sơ Admin

- Xem tên đăng nhập, vai trò và trạng thái.
- Cập nhật họ tên và email.
- Đổi mật khẩu bằng mật khẩu hiện tại.
- Nhập và xác nhận mật khẩu mới.
- Có nút hiện hoặc ẩn cho cả ba trường mật khẩu.
- Truy cập hồ sơ từ khu vực user ở cuối sidebar.

### 6.14. Trải nghiệm giao diện Admin

- Dùng chung `AdminLayout` và `AdminSidebar`.
- Sidebar có thể thu gọn hoặc mở rộng.
- Khi thu gọn, icon được căn giữa.
- Sidebar giữ nguyên khi cuộn nội dung dài.
- Nội dung quản trị tự mở rộng khi sidebar thu gọn.
- Breadcrumb và tiêu đề trang được chuẩn hóa.
- Toast dùng chung cho trạng thái đang lưu, thành công và lỗi.
- Modal xác nhận xoá dùng chung.
- Nút quay lại không cần thiết đã được loại bỏ; riêng form tin tức giữ nút quay lại danh sách.
- Các trang giới thiệu, dịch vụ và FAQ được mở rộng chiều ngang.

## 7. Các hạng mục kỹ thuật và lỗi đã khắc phục

### 7.1. Frontend và giao diện

- Khắc phục xung đột dependency giữa Vite và React plugin.
- Sửa lỗi build `ERESOLVE`.
- Sửa route SPA bị 404 khi reload trên Vercel và cPanel.
- Bổ sung `.htaccess` cho Apache.
- Cấu hình API URL theo môi trường.
- Sửa frontend production còn gọi `localhost:5000`.
- Sửa lỗi logo footer.
- Xoá logo phủ trên video giới thiệu.
- Sửa các nút CTA và liên kết dịch vụ không hoạt động.
- Sửa hiệu ứng hover thiếu trên một số đánh giá.
- Sửa giao diện bị chồng/lộ section khi cuộn.
- Điều chỉnh navbar trong suốt khi cuộn và trở lại bình thường ở đầu trang.
- Sửa modal dịch vụ có textarea mô tả quá hẹp.
- Chuẩn hóa giao diện FAQ và các trang Admin.
- Sửa lỗi icon sidebar bị lệch khi thu gọn.
- Sửa lỗi ngày tin tức `Invalid Date`.
- Sửa lỗi React render object `{vi, en}` sau thử nghiệm song ngữ.
- Giảm cảnh báo GSAP do selector rỗng hoặc phần tử không tồn tại ở một số luồng.

### 7.2. Backend và API

- Chuẩn hóa CORS cho tên miền production, Vercel và local.
- Hỗ trợ nhiều frontend URL qua biến môi trường.
- Cấu hình health check API.
- Mở port server đúng cách để Render không bị port scan timeout.
- Tách gửi email khỏi lưu database để email lỗi không làm mất yêu cầu.
- Bổ sung validate cho email, số điện thoại và độ dài dữ liệu.
- Chuẩn hóa route blog để không xung đột giữa route tĩnh và slug.
- Bổ sung API quản lý danh mục tin tức.
- Bổ sung API lịch sử, xoá nhiều và hoàn tác.
- Bổ sung API mini CRM cho liên hệ và câu hỏi.
- Bổ sung API profile và đổi mật khẩu Admin.
- Bổ sung API quản lý chi tiết dịch vụ.

### 7.3. Database

- Xử lý lỗi sai tên database giữa Railway, Aiven và môi trường local.
- Xử lý lỗi thiếu bảng như `blogs`.
- Chuyển từ chạy `init.sql` thủ công sang migration tự động.
- Tạo bảng `schema_migrations` để theo dõi migration đã chạy.
- Kiểm tra checksum để tránh sửa nhầm migration cũ.
- Dùng advisory lock để tránh nhiều instance cùng cập nhật schema.
- Tạo Admin ban đầu bằng biến môi trường khi database mới chưa có tài khoản.

Các migration chính:

| Migration | Nội dung |
|---|---|
| `001_initial_schema.sql` | Schema nền tảng của hệ thống |
| `002_home_page.sql` | Nội dung trang chủ |
| `003_branches.sql` | Văn phòng và chi nhánh |
| `004_cms_revisions.sql` | Phiên bản nội dung CMS |
| `005_admin_audit_logs.sql` | Nhật ký thao tác Admin |
| `006_service_detail_content.sql` | Nội dung chi tiết dịch vụ |
| `007_faq_inquiry_email.sql` | Email của người gửi câu hỏi |
| `008_mini_crm_fields.sql` | Ghi chú và hành động CRM |
| `009_blog_categories.sql` | Danh mục tin tức động |
| `010_crm_pipeline.sql` | Pipeline và nhật ký chăm sóc khách hàng |

### 7.4. Email

- Thử nghiệm Gmail SMTP bằng Nodemailer.
- Xác định lỗi timeout SMTP trên Render Free.
- Chuyển sang Resend API qua HTTPS.
- Thiết kế email HTML phù hợp Gmail và điện thoại.
- Dùng logo Việt Hương Logistics thay cho chữ thương hiệu.
- Tối ưu cách dùng logo để giảm thời gian tải.
- Chỉ hiển thị mục công ty khi khách hàng có nhập dữ liệu.
- Bổ sung trường công ty tại form liên hệ tương ứng.
- Thêm nút trả lời khách hàng qua email.
- FAQ yêu cầu email và có nút trả lời tương tự liên hệ.

## 8. Dữ liệu và nội dung đã chuẩn bị

- Chuẩn bị khoảng 10 bài viết mẫu về vận tải và logistics.
- Tạo script import bài viết để không phải nhập thủ công.
- Đồng bộ bài viết lên khu vực tin tức và góc nhìn ngành vận tải.
- Chuẩn bị cấu trúc nội dung tiếng Anh để thử nghiệm CMS song ngữ.
- Sau khi thay đổi phương án, dọn dữ liệu `{vi, en}` cũ để tránh lỗi giao diện.
- Chuẩn hóa thông tin văn phòng Hải Phòng và các dữ liệu chi nhánh liên quan.
- Chuẩn hóa các nội dung mặc định cho dịch vụ và đánh giá.

## 9. Triển khai hệ thống

### 9.1. Frontend

- Đã triển khai thử nghiệm trên Vercel.
- Đã cấu hình triển khai production lên cPanel/AZDIGI.
- File build được tạo bằng `npm run build`.
- Nội dung thư mục `dist` được upload vào document root của tên miền.
- `.htaccess` đảm bảo các route React hoạt động khi tải lại trang.

### 9.2. Backend

- Backend chạy trên Render bằng lệnh `npm start`.
- API production: `https://viethuonglogistics.onrender.com/api`.
- Health check sử dụng `/api/health`.
- CORS cho phép tên miền production gọi API.
- Backend tự chạy migration khi khởi động.

### 9.3. Database và dịch vụ ngoài

- MySQL được triển khai trên Aiven.
- Cloudinary lưu ảnh được upload từ Admin.
- Resend gửi email thông báo đến công ty.
- Có thể dùng dịch vụ monitor gọi health check định kỳ để giảm ảnh hưởng cold start của Render Free.

## 10. Kết quả đạt được

- Website đã chuyển từ giao diện tĩnh sang hệ thống có dữ liệu thật.
- Phần lớn nội dung public có thể quản lý từ Admin.
- Dịch vụ, tin tức, chi nhánh, FAQ, liên hệ, đối tác và đánh giá đã có API và database.
- Khách hàng có thể gửi yêu cầu thật.
- Admin nhận dữ liệu và email thông báo.
- Mini CRM giúp theo dõi hoạt động chăm sóc khách hàng.
- Lịch sử CMS giúp kiểm tra và hoàn tác thay đổi.
- Database được cập nhật bằng migration an toàn hơn.
- Frontend có thể chạy trên Vercel và cPanel.
- Backend có thể chạy trên Render và kết nối Aiven.
- Giao diện Admin đã đồng bộ và dễ sử dụng hơn.

## 11. Kiểm thử đã thực hiện

- Build frontend production.
- Kiểm tra route public và Admin.
- Kiểm tra truy cập trực tiếp và reload route trên hosting.
- Kiểm tra đăng nhập, JWT và protected route.
- Kiểm tra kết nối database và migration.
- Kiểm tra CRUD trang chủ, giới thiệu và dịch vụ.
- Kiểm tra nội dung chi tiết dịch vụ.
- Kiểm tra CRUD bài viết và danh mục tin tức.
- Kiểm tra upload ảnh, logo, icon và video.
- Kiểm tra ngày đăng và thời gian đọc bài viết.
- Kiểm tra form liên hệ và form FAQ.
- Kiểm tra email thông báo.
- Kiểm tra trạng thái, ghi chú và hành động mini CRM.
- Kiểm tra badge thông báo và polling.
- Kiểm tra lịch sử chỉnh sửa, xoá nhiều và hoàn tác.
- Kiểm tra đổi mật khẩu và nút hiện/ẩn mật khẩu.
- Kiểm tra responsive của các modal và trang Admin.

## 12. Những điểm cần tiếp tục theo dõi

1. Render Free có cold start nên lần gọi API đầu tiên sau thời gian không hoạt động có thể chậm.
2. Bundle JavaScript vẫn khá lớn do Three.js, mô hình 3D, GSAP và rich text editor.
3. Ảnh hero và một số ảnh tĩnh còn dung lượng lớn, nên chuyển sang WebP/AVIF.
4. Video hero cần được nén theo cấu hình phù hợp cho web.
5. Cần thay các hàm Sass `darken()` đã deprecated bằng `color.adjust()`.
6. Nên bổ sung backup database định kỳ.
7. Nên bổ sung xác nhận email khi Admin đổi địa chỉ email.
8. Nên phát triển phân quyền chi tiết nếu có nhiều tài khoản quản trị.
9. SEO production cần được rà soát riêng trước khi gửi website lên Google Search Console.
10. Google Translate là dịch máy nên không thể đảm bảo chất lượng bản dịch chuyên ngành tuyệt đối.

## 13. Đề xuất phát triển tiếp

### Ưu tiên cao

- Tối ưu ảnh, video và mô hình 3D để giảm thời gian tải trang đầu.
- Đo hiệu năng thực tế bằng Lighthouse và PageSpeed Insights.
- Hoàn thiện SEO theo đúng tên miền production.
- Tạo sitemap động cho các bài viết và dịch vụ.
- Thiết lập backup database tự động.

### Ưu tiên trung bình

- Xác nhận email khi thay đổi email Admin.
- Phân quyền theo vai trò và module.
- Xuất danh sách khách hàng ra Excel/CSV.
- Thêm bộ lọc CRM theo hành động và thời gian chăm sóc.
- Thêm lịch nhắc gọi lại khách hàng.

### Phát triển dài hạn

- Theo dõi hành trình và trạng thái vận chuyển.
- Form báo giá nâng cao theo loại hàng, khối lượng và tuyến đường.
- Dashboard thống kê tỷ lệ chuyển đổi khách hàng.
- Tích hợp Zalo OA hoặc hệ thống chat doanh nghiệp.
- Xây dựng bản dịch chuyên nghiệp do người quản trị duyệt.

## 14. Kết luận

Dự án Việt Hương Logistics đã phát triển từ một website giới thiệu còn phụ thuộc nhiều vào dữ liệu viết cứng thành một hệ thống website doanh nghiệp có backend, database và trang quản trị tương đối đầy đủ.

Giá trị quan trọng nhất của dự án là tạo ra một nền tảng quản lý nội dung và khách hàng tập trung. Doanh nghiệp có thể chủ động cập nhật website, tiếp nhận nhu cầu, quản lý lịch sử chăm sóc khách hàng và kiểm soát các thay đổi nội dung mà không phải can thiệp trực tiếp vào mã nguồn.

Hệ thống hiện đã đáp ứng tốt mục tiêu giới thiệu doanh nghiệp, quản lý nội dung và thu thập khách hàng tiềm năng. Các giai đoạn phát triển tiếp theo nên tập trung vào hiệu năng, SEO, sao lưu dữ liệu và các công cụ hỗ trợ hoạt động kinh doanh.

---

**Người thực hiện phát triển và hoàn thiện dự án:** Nguyễn Đức Trí  
**Tài liệu liên quan:** `BAO_CAO_PHAT_TRIEN_DU_AN.md`
