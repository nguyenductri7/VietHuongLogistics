# BÁO CÁO TIẾP NHẬN, KHẮC PHỤC VÀ PHÁT TRIỂN WEBSITE VIỆT HƯƠNG LOGISTICS

## 1. Tổng quan dự án

Dự án Việt Hương Logistics là website giới thiệu doanh nghiệp vận tải/logistics, bao gồm giao diện khách hàng, hệ thống quản trị nội dung, backend API và database MySQL. Khi tiếp nhận, dự án đang trong giai đoạn phát triển, một số chức năng mới ở mức giao diện tĩnh hoặc chưa kết nối dữ liệu thật.

Trong quá trình phát triển, hệ thống đã được hoàn thiện theo hướng:

- Frontend có thể triển khai trên Vercel và cPanel.
- Backend chạy trên Render.
- Database sử dụng MySQL online.
- Admin có thể quản lý phần lớn nội dung hiển thị trên website.
- Form khách hàng gửi dữ liệu thật về Admin và gửi thông báo email.
- Website chuyển dần từ dữ liệu viết cứng trong code sang dữ liệu quản trị được.

## 2. Các vấn đề ghi nhận khi tiếp nhận dự án

1. Frontend bị lỗi dependency giữa Vite và plugin React khi build/deploy.
2. Các route React như `/login`, `/admin`, `/tin-tuc/...` bị lỗi 404 khi truy cập trực tiếp hoặc reload.
3. Frontend sau deploy vẫn gọi API về `localhost:5000`.
4. Backend bị lỗi CORS khi frontend production gọi API.
5. Backend gặp lỗi kết nối database do sai database name, sai thông tin Railway/Aiven hoặc thiếu bảng.
6. Render có lúc không phát hiện port vì backend chờ database trước khi mở service.
7. Database phụ thuộc vào thao tác chạy `init.sql` thủ công, dẫn tới lỗi thiếu database/bảng như `blogs`.
8. Form liên hệ, FAQ và một số nút CTA chưa có luồng xử lý dữ liệu thật.
9. Trang Admin còn rời rạc, mỗi trang có layout/toast/nút quay lại khác nhau.
10. Trang Admin chưa có profile để cập nhật thông tin quản trị viên.
11. Trang Admin chưa có modal xác nhận xoá thống nhất ở tất cả nút Delete/Xoá.
12. Chức năng chỉnh sửa bài viết không lấy lại đầy đủ nội dung đã đăng.
13. Thời gian đọc bài viết ở trang tin tức bị hiển thị không đúng, nhiều bài luôn là `1 phút đọc`.
14. Khu vực “Góc nhìn ngành vận tải” ở trang chủ chưa đồng bộ với dữ liệu tin tức thật.
15. Các phần trang chủ còn viết cứng trong code, chưa quản lý được từ Admin.
16. Dịch vụ, đối tác, đánh giá khách hàng, thông tin liên hệ trên trang chủ chưa đồng bộ hoàn toàn với dữ liệu quản trị.
17. Trang “Liên hệ” thực tế dùng để hiển thị văn phòng/chi nhánh nên tên menu chưa rõ nghĩa.
18. Chưa có trang Admin riêng để quản lý văn phòng và chi nhánh.
19. Nhiều phần media như video hero, ảnh fallback, logo đối tác, icon dịch vụ, icon quy trình còn khó thay đổi nếu không sửa code.
20. Trang chủ có hiện tượng chồng/lộ nội dung khi cuộn từ video đầu trang xuống phần xe và dịch vụ.
21. Thanh menu khách hàng cần điều chỉnh hành vi khi cuộn.
22. Một số liên kết card dịch vụ ở trang giới thiệu chưa điều hướng đúng.
23. Gmail SMTP bị timeout trên Render Free do giới hạn cổng SMTP.
24. Email thông báo chưa có giao diện chuyên nghiệp và chưa dùng logo công ty.

## 3. Các hạng mục đã thực hiện

### 3.1. Khắc phục build và triển khai frontend

- Sửa lỗi dependency giữa Vite và plugin React, xử lý lỗi `ERESOLVE`.
- Cấu hình rewrite cho Vercel để React Router hoạt động khi reload route.
- Tạo `.htaccess` trong bản build để hỗ trợ triển khai trên cPanel/AZDIGI.
- Cấu hình `VITE_API_URL` để frontend gọi đúng backend production.
- Hướng dẫn triển khai frontend lên Vercel và cPanel với tên miền `viethuonglogistics.com`.
- Kiểm tra lại các route công khai sau khi deploy.

### 3.2. Khắc phục backend, database và deploy Render

- Hướng dẫn cấu hình backend trên Render.
- Xử lý lỗi CORS giữa frontend production và backend Render.
- Xử lý lỗi database name khi chuyển giữa Railway và Aiven.
- Hỗ trợ kiểm tra health-check API.
- Bổ sung/chuẩn hóa migration để giảm phụ thuộc vào việc chạy `init.sql` thủ công.
- Tổ chức lại các bảng quan trọng như `admin_users`, `blogs`, `contact_messages`, `branches`, cấu hình trang chủ, dịch vụ, FAQ.
- Sắp lại route blog để các route tĩnh như `/blogs/admin/list` không bị bắt nhầm thành slug.

### 3.3. Hoàn thiện form liên hệ khách hàng

- Chuyển form liên hệ từ giao diện minh họa sang form gửi dữ liệu thật.
- Bổ sung kiểm tra dữ liệu bắt buộc và định dạng email.
- Lưu thông tin khách hàng vào bảng `contact_messages`.
- Tích hợp form vào trang chủ, trang dịch vụ và trang chi tiết dịch vụ.
- Hiển thị trạng thái đang gửi, gửi thành công và lỗi.
- Sau khi gửi thành công, bổ sung nút gửi yêu cầu khác/quay lại form để người dùng có thể gửi tiếp mà không cần tải lại trang.

### 3.4. Quản lý liên hệ trong Admin

- Xây dựng trang danh sách yêu cầu liên hệ.
- Bổ sung tìm kiếm, phân trang, lọc theo trạng thái.
- Thêm các trạng thái: mới, đã xem, đã phản hồi, lưu trữ.
- Hiển thị thống kê số lượng yêu cầu theo trạng thái.
- Cho phép cập nhật trạng thái và xoá yêu cầu.
- Bổ sung badge số yêu cầu mới trên dashboard/sidebar.
- Bổ sung polling 30 giây để danh sách liên hệ tự cập nhật, giúp admin nhận biết yêu cầu mới mà không cần reload.
- Tối ưu polling để không bật loading toàn trang, tránh gây giật giao diện.

### 3.5. Tích hợp thông báo email

- Ban đầu thử tích hợp Gmail SMTP bằng Nodemailer.
- Phân tích lỗi `Connection timeout` và xác định Render Free không phù hợp với SMTP truyền thống.
- Chuyển hướng sang gửi email bằng Resend HTTPS API.
- Tách thao tác gửi email khỏi thao tác lưu database: nếu email lỗi, dữ liệu khách hàng vẫn được lưu trong Admin.
- Thiết kế mẫu email HTML tương thích Gmail, gồm:
  - Logo Việt Hương Logistics.
  - Thông tin khách hàng.
  - Nội dung yêu cầu/câu hỏi.
  - Nút trả lời email hoặc gọi nhanh.
  - Bố cục dễ đọc trên máy tính và điện thoại.
- Thay phần chữ thương hiệu trong email bằng logo công ty giống logo footer.
- Bổ sung static route backend để phục vụ logo email ổn định trên production.

### 3.6. Hoàn thiện quản lý tin tức

- Chuẩn bị 10 bài viết mẫu về logistics/vận tải.
- Viết công cụ import bài viết vào database để không phải nhập thủ công từng bài.
- Sửa API lấy chi tiết bài viết cho Admin.
- Sửa chức năng chỉnh sửa bài viết để tải lại đầy đủ nội dung đã đăng.
- Hỗ trợ rich text editor và upload ảnh chèn trong nội dung bài viết lên Cloudinary.
- Kết nối khu vực “Góc nhìn ngành vận tải” ở trang chủ với dữ liệu bài viết đã đăng.
- Sửa thời gian đọc bài viết:
  - Backend trả thêm `reading_time` tính từ nội dung thật.
  - Frontend ưu tiên dùng `reading_time`.
  - Nếu backend chưa có trường này, frontend tự tính từ `content`, `excerpt`, `title`.
  - Tránh tình trạng danh sách tin tức luôn hiển thị `1 phút đọc`.

### 3.7. Hoàn thiện trang dịch vụ

- Kết nối trang dịch vụ công khai với dữ liệu backend.
- Xây dựng Admin quản lý banner, danh sách dịch vụ, quy trình vận chuyển và thông tin liên hệ.
- Cho phép tạo, sửa, xoá, ẩn/hiện và sắp xếp thứ tự dịch vụ.
- Bổ sung chức năng khởi tạo dịch vụ mẫu khi database chưa có dữ liệu.
- Đồng bộ dữ liệu dịch vụ giữa trang dịch vụ, trang chủ và các khu vực giới thiệu liên quan.
- Cho phép upload icon cho 5 bước quy trình.
- Giữ cơ chế icon mặc định để website vẫn hiển thị ổn nếu Admin chưa upload icon riêng.

### 3.8. Hoàn thiện trang giới thiệu

- Sửa luồng lấy và cập nhật dữ liệu trang giới thiệu trong Admin.
- Xử lý dữ liệu rỗng hoặc JSON sai cấu trúc.
- Cho phép cập nhật nội dung, ảnh, dịch vụ, lịch sử hình thành, giá trị cốt lõi.
- Bổ sung nút thêm năm trong phần lịch sử hình thành.
- Bổ sung nút thêm giá trị trong phần giá trị cốt lõi.
- Chuyển phần video hero và ảnh fallback sang dạng upload.
- Cho phép upload icon cho phần dịch vụ trong trang giới thiệu.
- Sửa các card “Giải pháp Logistics Toàn Diện” để điều hướng đúng sang trang dịch vụ tương ứng.

### 3.9. Quản lý trang chủ trong Admin

- Thay thế trang setting cũ bằng trang quản lý trang chủ tại `/admin/home`.
- Cho phép Admin quản lý các khối nội dung chính trên trang chủ.
- Quản lý nội dung bên cạnh hình ảnh chiếc xe.
- Đồng bộ phần “Giải Pháp Vận Tải Toàn Diện” với dữ liệu dịch vụ thật.
- Đồng bộ form/thông tin liên hệ trang chủ với dữ liệu từ trang dịch vụ.
- Giữ phần tin tức trang chủ lấy từ hệ thống quản lý tin tức sẵn có, tránh trùng chức năng.
- Sửa lỗi chồng/lộ nội dung dịch vụ khi cuộn từ video đầu trang xuống.

### 3.10. Quản lý đối tác và đánh giá khách hàng

- Cho phép Admin upload logo công ty đối tác.
- Tách phần đánh giá khách hàng thành tab riêng, không dùng chung tab đối tác.
- Bổ sung tiêu đề lớn cho khu vực đánh giá trên trang chủ.
- Tiêu đề đánh giá lấy từ Admin, mặc định là “Đánh giá từ khách hàng”.
- Bổ sung màu nhấn cho từ khóa trong tiêu đề section.
- Cho phép Admin thêm, sửa, xoá các đánh giá khách hàng.
- Sửa hiệu ứng hover cho các card đánh giá bị thiếu hiệu ứng.

### 3.11. Quản lý văn phòng và chi nhánh

- Đổi tên menu khách hàng từ “Liên hệ” sang “Văn phòng & Chi nhánh”.
- Đổi route công khai từ `/lien-he` sang `/chi-nhanh`.
- Giữ redirect từ `/lien-he` sang `/chi-nhanh` để tránh lỗi link cũ.
- Xây dựng API backend quản lý chi nhánh.
- Bổ sung bảng `branches` và dữ liệu mặc định.
- Tạo trang Admin riêng để thêm, sửa, xoá văn phòng/chi nhánh.
- Cho phép lưu tên chi nhánh, địa chỉ, hotline, email, ảnh, trạng thái hiển thị, thứ tự, kinh độ và vĩ độ.
- Kết nối trang khách hàng với dữ liệu chi nhánh thật từ backend.

### 3.12. Hoàn thiện FAQ

- Lưu câu hỏi khách hàng gửi từ trang FAQ vào database.
- Quản lý danh sách câu hỏi và trạng thái xử lý trong Admin.
- Quản lý nội dung danh mục và câu hỏi thường gặp hiển thị trên website.
- Gửi thông báo email khi có câu hỏi mới.
- Chuẩn hóa chiều rộng trang Admin FAQ để giao diện không lúc to lúc nhỏ.

### 3.13. Chuẩn hóa trải nghiệm Admin

- Tạo `AdminLayout` dùng chung cho các trang Admin.
- Tạo `AdminSidebar` dùng chung, áp dụng cho toàn bộ trang Admin thay vì chỉ dashboard.
- Bổ sung breadcrumb và tiêu đề trang thống nhất.
- Bổ sung nút “Về dashboard” nhất quán.
- Giữ nút “Quay lại danh sách” riêng ở trang form tin tức vì đây là điều hướng nội bộ cần thiết.
- Tạo hệ thống toast dùng chung:
  - Đã lưu.
  - Đang lưu.
  - Lỗi.
  - Upload thành công/thất bại.
- Áp dụng toast dùng chung cho các trang Admin.
- Tạo modal xác nhận xoá dùng chung cho các thao tác nguy hiểm.
- Gắn modal xác nhận xoá vào các trang còn thiếu như giới thiệu, dịch vụ, trang chủ, chi nhánh.
- Rà soát và loại bỏ `window.confirm` trong Admin.
- Mở rộng chiều ngang các trang quản lý nội dung lớn như giới thiệu, dịch vụ, FAQ.

### 3.14. Sidebar Admin thu gọn/mở rộng

- Bổ sung nút thu gọn/mở rộng sidebar.
- Khi thu gọn, sidebar chỉ hiển thị icon.
- Nội dung trang quản lý tự giãn rộng hơn khi sidebar thu gọn.
- Lưu trạng thái thu gọn/mở rộng vào `localStorage`.
- Thêm tooltip cho icon khi sidebar đang thu gọn.
- Sửa lỗi icon bị lệch trái khi sidebar thu gọn, căn icon vào giữa.

### 3.15. Trang hồ sơ Admin

- Tạo trang hồ sơ Admin.
- Cho phép cập nhật họ tên và email quản trị viên.
- Tích hợp đường dẫn profile vào khu vực user ở cuối sidebar.
- Không thêm mục “Hồ sơ Admin” riêng trong menu sidebar để tránh rối.
- Backend bổ sung API cập nhật profile.
- Frontend cập nhật lại thông tin user sau khi lưu thành công.

### 3.16. Cải thiện giao diện khách hàng

- Sửa logo footer hiển thị đúng.
- Xoá logo phủ trên video giới thiệu ở trang chủ.
- Điều chỉnh luồng cuộn trang chủ để mượt hơn.
- Loại bỏ hiện tượng lộ/chồng nội dung khi cuộn xuống khu vực dịch vụ.
- Điều chỉnh navbar khách hàng:
  - Ở đầu trang: trạng thái bình thường.
  - Khi cuộn xuống: trong suốt nhưng vẫn thấy tab.
  - Khi chưa quay lại đầu trang: giữ trạng thái trong suốt.
- Sửa các nút CTA chưa hoạt động đúng.
- Cải thiện trải nghiệm form sau khi gửi thành công.

## 4. Kết quả đạt được

- Frontend build và deploy được trên Vercel/cPanel.
- Backend chạy trên Render và kết nối database online.
- Các route React hoạt động khi truy cập trực tiếp/reload.
- CORS và API URL production đã được xử lý.
- Database có schema phục vụ các chức năng chính.
- Form liên hệ và FAQ lưu dữ liệu thật vào Admin.
- Email thông báo hoạt động qua Resend, không phụ thuộc Gmail SMTP.
- Admin có thể quản lý:
  - Trang chủ.
  - Trang giới thiệu.
  - Trang dịch vụ.
  - Tin tức.
  - FAQ.
  - Liên hệ khách hàng.
  - Văn phòng & chi nhánh.
  - Đối tác.
  - Đánh giá khách hàng.
  - Hồ sơ Admin.
- Nội dung tin tức trang chủ đồng bộ với trang tin tức.
- Nội dung dịch vụ trang chủ đồng bộ với dữ liệu dịch vụ thật.
- Website có route “Văn phòng & Chi nhánh” rõ nghĩa hơn.
- Các khu vực media quan trọng có thể upload từ Admin.
- Admin có layout/sidebar/toast/modal xác nhận xoá thống nhất hơn.
- Sidebar Admin có thể thu gọn để tăng không gian làm việc.
- Thời gian đọc bài viết được tính từ dữ liệu thật thay vì hiển thị cứng.

## 5. Các kiểm tra đã thực hiện

- Kiểm tra build frontend bằng `npm run build`.
- Kiểm tra cú pháp backend bằng `node --check` cho các file đã chỉnh.
- Kiểm tra route React trên Vercel/cPanel.
- Kiểm tra health-check backend.
- Kiểm tra kết nối database online.
- Kiểm tra đăng nhập Admin và xác thực JWT.
- Kiểm tra gửi form liên hệ và lưu vào database.
- Kiểm tra danh sách liên hệ trong Admin và polling tự cập nhật.
- Kiểm tra gửi câu hỏi FAQ và cập nhật trạng thái.
- Kiểm tra tạo, sửa, xoá, ẩn/hiện và sắp xếp dịch vụ.
- Kiểm tra tạo, sửa, xoá bài viết rich text.
- Kiểm tra upload ảnh trong bài viết.
- Kiểm tra thời gian đọc bài viết ở danh sách và chi tiết tin tức.
- Kiểm tra upload logo đối tác, icon dịch vụ, icon quy trình, video hero và ảnh fallback.
- Kiểm tra thêm, sửa, xoá văn phòng/chi nhánh.
- Kiểm tra thêm, sửa, xoá đánh giá khách hàng.
- Kiểm tra modal xác nhận xoá ở các trang Admin.
- Kiểm tra toast thông báo lưu/lỗi/upload.
- Kiểm tra sidebar Admin thu gọn/mở rộng và căn giữa icon.
- Kiểm tra giao diện trang chủ sau khi xử lý lỗi cuộn/chồng nội dung.
- Kiểm tra navbar khách hàng ở đầu trang và khi cuộn xuống.
- Kiểm tra payload email và giao diện HTML email.

## 6. Các điểm còn có thể phát triển tiếp

1. Tối ưu hiệu năng frontend bằng code splitting/lazy loading để giảm bundle lớn.
2. Thay các hàm Sass `darken()` cũ bằng `color.adjust()` để loại bỏ cảnh báo build.
3. Bổ sung hệ thống phân quyền Admin chi tiết hơn theo vai trò.
4. Bổ sung xác nhận email nếu Admin thay đổi email tài khoản.
5. Bổ sung audit log để biết ai đã sửa/xoá nội dung nào.
6. Bổ sung backup database định kỳ.
7. Cân nhắc nâng cấp Render/Aiven nếu cần tốc độ phản hồi ổn định hơn và tránh cold start.
8. Nếu cần real-time thật, có thể triển khai WebSocket/SSE; hiện tại polling 30 giây là lựa chọn phù hợp với Render Free.
9. Tối ưu SEO nâng cao cho bài viết: schema, sitemap, Open Graph, canonical URL.
10. Tối ưu hình ảnh và video để giảm thời gian tải trang đầu.

---

**Người lập báo cáo:** Nguyễn Đức Trí  
**Ngày lập/cập nhật:** 11/07/2026
