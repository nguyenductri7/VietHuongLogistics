# BÁO CÁO TIẾP NHẬN, KHẮC PHỤC VÀ PHÁT TRIỂN WEBSITE viethuonglogict

## 1. Các vấn đề ghi nhận khi được tiếp nhận dự án

1. Frontend bị lỗi dependency giữa Vite và plugin React khi build trên Vercel.
2. Các đường dẫn như `/login` trả về lỗi 404 khi truy cập hoặc tải lại trực tiếp.
3. Frontend sau khi deploy vẫn gửi API về `localhost:5000`.
4. Backend chặn request từ frontend do cấu hình CORS chưa đủ.
5. Backend gặp lỗi kết nối database do sử dụng sai tên database và thông tin kết nối giữa Railway/Aiven.
6. Render không phát hiện cổng dịch vụ trong một số lần deploy do ứng dụng chờ database trước khi mở cổng.
7. Các bảng dữ liệu như `blogs` chưa tồn tại hoặc chưa được khởi tạo đầy đủ trên database online.
8. Nút liên hệ và các form trên website chưa có luồng xử lý dữ liệu thực tế.
9. Trang quản trị liên hệ, dịch vụ và giới thiệu chưa hoạt động đầy đủ.
10. Chức năng chỉnh sửa bài viết không lấy lại nội dung đã đăng.
11. Khu vực “Góc nhìn ngành vận tải” ở trang chủ chưa đồng bộ với dữ liệu trang tin tức.
12. Gmail SMTP bị timeout trên Render Free do nền tảng chặn các cổng SMTP.
13. Email gửi về quản trị chưa có giao diện trình bày chuyên nghiệp.
.......

## 2. Các hạng mục đã thực hiện

### 2.1. Khắc phục build và triển khai Frontend

- Điều chỉnh phiên bản plugin React tương thích với Vite, xử lý lỗi `ERESOLVE` khi build.
- Bổ sung cấu hình rewrite cho Vercel để React Router hoạt động khi truy cập trực tiếp đường dẫn.
- Tạo và đưa `.htaccess` vào bản build để các route React hoạt động trên cPanel.
- Cấu hình biến môi trường `VITE_API_URL` để frontend gọi đúng backend trên Render.
- Hướng dẫn quy trình build, nén thư mục `dist` và triển khai lên thư mục tên miền trên AZDIGI/cPanel.
- Cấu hình tên miền chính `viethuonglogistics.com` và hỗ trợ cả phiên bản `www`.


### 2.2. Hoàn thiện chức năng liên hệ khách hàng

- Chuyển form liên hệ từ giao diện minh họa sang form gửi dữ liệu thật về backend.
- Bổ sung kiểm tra dữ liệu bắt buộc và định dạng email.
- Lưu thông tin khách hàng vào bảng `contact_messages`.
- Tích hợp form vào trang chủ, trang dịch vụ và trang chi tiết dịch vụ.
- Hiển thị trạng thái đang gửi, gửi thành công và thông báo lỗi cho người dùng.

### 2.3. Xây dựng trang quản lý liên hệ trong Admin

- Tạo giao diện danh sách yêu cầu liên hệ.
- Bổ sung tìm kiếm, phân trang và lọc theo trạng thái.
- Bổ sung các trạng thái: mới, đã xem, đã phản hồi và lưu trữ.
- Hiển thị thống kê số lượng yêu cầu theo trạng thái.
- Cho phép cập nhật trạng thái và xóa yêu cầu.
- Thêm đường dẫn quản lý liên hệ vào dashboard Admin.

### 2.4. Hoàn thiện quản lý dịch vụ

- Kết nối trang dịch vụ công khai với dữ liệu từ backend.
- Hoàn thiện giao diện Admin quản lý banner, quy trình vận chuyển và thông tin liên hệ.
- Bổ sung chức năng tạo, sửa, xóa và sắp xếp thứ tự các dịch vụ.
- Bổ sung chức năng khởi tạo dữ liệu dịch vụ mẫu khi database chưa có dữ liệu.
- Đồng bộ nội dung giữa trang quản trị và trang dịch vụ dành cho khách hàng.

### 2.5. Khắc phục trang giới thiệu trong Admin

- Sửa luồng lấy và cập nhật dữ liệu trang giới thiệu.
- Xử lý dữ liệu rỗng hoặc dữ liệu JSON chưa đúng cấu trúc.
- Sửa chức năng tải ảnh và cập nhật nội dung từ Admin.
- Sửa liên kết hành động trên trang giới thiệu để điều hướng tới phần liên hệ.

### 2.6. Hoàn thiện phần tin tức

- Chuẩn bị 10 bài viết mẫu về logistics và vận tải.
- Viết công cụ import bài viết vào database thay vì yêu cầu nhập thủ công từng bài.
- Kết nối khu vực “Góc nhìn ngành vận tải” ở trang chủ với dữ liệu bài viết đã đăng.
- Sửa API lấy chi tiết bài viết dành cho Admin.
- Sửa trình soạn thảo để nút chỉnh sửa tải lại đầy đủ nội dung bài đã đăng.
- Hỗ trợ tải ảnh chèn trong nội dung bài viết lên Cloudinary.

### 2.7. Điều chỉnh giao diện trang chủ

- Loại bỏ logo Việt Hương Logistics phủ trên video giới thiệu theo yêu cầu.
- Đồng bộ bài viết trang chủ với trang tin tức.
- Điều chỉnh một số liên kết và hành động điều hướng chưa hoạt động.

### 2.8. Hoàn thiện phần FAQ

- Lưu câu hỏi khách hàng gửi từ trang giải đáp vào database.
- Quản lý danh sách câu hỏi và trạng thái xử lý trong Admin.
- Quản lý nội dung danh mục và câu hỏi thường gặp hiển thị trên website.
- Gửi thông báo email khi có câu hỏi mới.

### 2.9. Tích hợp thông báo email

- Ban đầu tích hợp Gmail SMTP bằng Nodemailer cho form liên hệ và FAQ.
- Phân tích lỗi `Connection timeout` và xác định Render Free chặn cổng SMTP.
- Chuyển hệ thống gửi email sang Resend HTTPS API để hoạt động trên Render Free.
- Việc gửi email được tách khỏi thao tác lưu database; nếu email lỗi, yêu cầu khách hàng vẫn được lưu trong Admin.
- Thiết kế mẫu email tương thích Gmail, gồm:
  - Nhận diện Việt Hương Logistics.
  - Thông tin khách hàng rõ ràng.
  - Nội dung yêu cầu hoặc câu hỏi nổi bật.
  - Nút trả lời email hoặc gọi điện nhanh.
  - Giao diện phù hợp cho cả máy tính và điện thoại.

## 3. Kết quả đạt được

- Frontend đã có thể build và triển khai trên Vercel/cPanel.
- Các đường dẫn React hoạt động khi truy cập và tải lại trực tiếp.
- Frontend đã kết nối được với backend production.
- Backend hoạt động trên Render và kết nối được MySQL Aiven.
- Database đã có cấu trúc phục vụ các chức năng chính của website.
- Schema database được cập nhật tự động khi deploy, không còn phụ thuộc vào thao tác chạy `init.sql` thủ công.
- Form liên hệ và FAQ lưu dữ liệu thực tế vào Admin.
- Quản trị viên có thể quản lý nội dung giới thiệu, dịch vụ, tin tức, FAQ và yêu cầu khách hàng.
- Nội dung tin tức trên trang chủ được đồng bộ với trang tin tức.
- Hệ thống có thể gửi thông báo qua Resend mà không phụ thuộc vào cổng Gmail SMTP.
- Email thông báo đã có giao diện chuyên nghiệp và thuận tiện xử lý yêu cầu.

## 4. Các kiểm tra đã thực hiện

- Kiểm tra build frontend sau khi điều chỉnh dependency.
- Kiểm tra route trực tiếp trên Vercel và cPanel.
- Kiểm tra health-check backend và trạng thái kết nối database.
- Kiểm tra cú pháp, thứ tự và bộ phân tách câu lệnh của migration tự động.
- Kiểm tra đăng nhập Admin và xác thực JWT.
- Kiểm tra gửi form liên hệ, lưu database và hiển thị trong Admin.
- Kiểm tra gửi câu hỏi FAQ và cập nhật trạng thái.
- Kiểm tra tạo, sửa, xóa và sắp xếp dịch vụ.
- Kiểm tra tạo và chỉnh sửa bài viết có nội dung rich text.
- Kiểm tra payload gửi email qua Resend và cú pháp mẫu HTML email.
---
**Người lập báo cáo:** Nguyễn Đức Trí 
**Ngày lập:** 06/07/2026
