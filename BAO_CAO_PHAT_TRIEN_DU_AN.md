# BÁO CÁO TIẾP NHẬN, KHẮC PHỤC VÀ PHÁT TRIỂN WEBSITE VIỆT HƯƠNG LOGISTICS

## 1. Các vấn đề ghi nhận khi được tiếp nhận dự án

1. Frontend bị lỗi dependency giữa Vite và plugin React
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
14. Admin chưa có cơ chế nhắc nhanh khi phát sinh yêu cầu liên hệ mới, quản trị viên phải vào trang liên hệ và bấm làm mới thủ công.
15. Một số nội dung trang chủ còn bị viết cứng trong code, chưa cho phép quản trị viên thay đổi từ Admin.
16. Khu vực dịch vụ, đối tác, đánh giá khách hàng và thông tin liên hệ trên trang chủ chưa đồng bộ hoàn toàn với dữ liệu quản trị.
17. Trang “Liên hệ” thực tế đang dùng để hiển thị văn phòng/chi nhánh nên tên menu chưa rõ nghĩa.
18. Chưa có trang Admin riêng để quản lý danh sách văn phòng và chi nhánh.
19. Một số khu vực upload media như video hero, ảnh fallback, logo đối tác, icon dịch vụ và icon quy trình còn khó quản lý đối với người không biết code.
20. Giao diện trang chủ có hiện tượng lag/hiển thị chồng nội dung khi cuộn từ video đầu trang xuống khu vực xe và dịch vụ.
21. Thanh menu khách hàng cần điều chỉnh lại hành vi khi cuộn trang để phù hợp trải nghiệm thực tế.
22. Các liên kết ở một số card dịch vụ trên trang giới thiệu chưa điều hướng đúng tới trang dịch vụ tương ứng.
.......

## 2. Các hạng mục đã thực hiện

### 2.1. Khắc phục build và triển khai Frontend

- Điều chỉnh phiên bản plugin React tương thích với Vite, xử lý lỗi `ERESOLVE` khi build.
- Bổ sung cấu hình rewrite cho Vercel để React Router hoạt động khi truy cập trực tiếp đường dẫn.
- Tạo và đưa `.htaccess` vào bản build để các route React hoạt động trên cPanel.
- Cấu hình biến môi trường `VITE_API_URL` để frontend gọi đúng backend trên Render.
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
- Bổ sung badge thông báo số yêu cầu liên hệ mới ngay trên dashboard và sidebar Admin.
- Bổ sung cơ chế tự cập nhật danh sách liên hệ theo chu kỳ 30 giây bằng polling, giúp admin nhận biết yêu cầu mới mà không cần tải lại trang.
- Tối ưu quá trình tự cập nhật để không bật loading toàn trang, tránh gây giật giao diện khi admin đang xem hoặc xử lý dữ liệu.

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
- Thay phần chữ thương hiệu trong email bằng logo công ty giống logo ở footer.
- Bổ sung static route backend để phục vụ logo email ổn định trên môi trường production.

### 2.10. Xây dựng quản lý trang chủ trong Admin

- Thay thế khu vực setting trang chủ cũ bằng trang quản lý trang chủ mới tại `/admin/home`.
- Cho phép Admin quản lý các khối nội dung chính xuất hiện trên trang chủ.
- Đồng bộ khu vực “Giải Pháp Vận Tải Toàn Diện” ở trang chủ với dữ liệu dịch vụ thật đã quản lý trong Admin dịch vụ.
- Đồng bộ form/thông tin liên hệ ở trang chủ với dữ liệu thật từ trang quản lý dịch vụ.
- Giữ phần tin tức trang chủ lấy từ hệ thống quản lý tin tức sẵn có, tránh tạo trùng chức năng quản trị.
- Bổ sung khả năng quản lý nội dung bên cạnh hình ảnh chiếc xe trên trang chủ.
- Sửa lỗi hiển thị chồng/lộ nội dung khu vực dịch vụ khi cuộn từ phần video đầu trang xuống.

### 2.11. Quản lý đối tác và đánh giá khách hàng

- Bổ sung chức năng để Admin upload logo công ty đối tác thay vì phụ thuộc vào ảnh cố định.
- Tách phần đánh giá khách hàng thành một tab quản lý riêng, không dùng chung với tab đối tác.
- Bổ sung tiêu đề lớn cho khu vực đánh giá khách hàng trên trang chủ.
- Cho phép tiêu đề đánh giá lấy từ Admin, có giá trị mặc định là “Đánh giá từ khách hàng”.
- Bổ sung màu nhấn cho từ khóa trong tiêu đề lớn để đồng bộ phong cách với các section khác trên trang chủ.
- Cho phép Admin thêm, sửa, xóa các đánh giá khách hàng.

### 2.12. Quản lý văn phòng và chi nhánh

- Đổi tên menu khách hàng từ “Liên hệ” sang “Văn phòng & Chi nhánh” để đúng ý nghĩa trang.
- Đổi đường dẫn công khai từ `/lien-he` sang `/chi-nhanh`.
- Giữ redirect từ `/lien-he` sang `/chi-nhanh` để tránh lỗi khi người dùng hoặc Google còn truy cập link cũ.
- Xây dựng API backend quản lý danh sách chi nhánh.
- Bổ sung bảng dữ liệu `branches` và dữ liệu chi nhánh mặc định.
- Tạo trang Admin riêng để thêm, sửa, xóa văn phòng/chi nhánh.
- Cho phép lưu các thông tin như tên chi nhánh, địa chỉ, hotline, email, giờ làm việc, kinh độ và vĩ độ để phục vụ hiển thị bản đồ.
- Kết nối trang khách hàng với dữ liệu chi nhánh thật từ backend, có dữ liệu dự phòng nếu API tạm thời lỗi.

### 2.13. Nâng cấp quản lý trang giới thiệu

- Bổ sung nút thêm năm trong phần lịch sử hình thành để Admin có thể mở rộng timeline.
- Bổ sung nút thêm giá trị trong phần giá trị cốt lõi để không bị giới hạn số lượng nội dung.
- Chuyển trường đường dẫn video hero và ảnh fallback sang dạng upload, giúp Admin dễ thay video/ảnh mà không cần sửa code.
- Cho phép upload icon cho phần dịch vụ trong trang giới thiệu, ngoài các icon cố định có sẵn.
- Sửa các card trong phần “Giải Pháp Logistics Toàn Diện” để điều hướng đúng sang trang dịch vụ tương ứng.

### 2.14. Nâng cấp quản lý trang dịch vụ

- Bổ sung upload icon cho 5 bước quy trình trong trang quản lý dịch vụ.
- Cho phép Admin dùng nhiều kiểu icon/ảnh khác nhau thay vì chỉ chọn icon có sẵn trong code.
- Giữ cơ chế icon mặc định để website vẫn hiển thị ổn nếu Admin chưa upload icon riêng.
- Đồng bộ dữ liệu dịch vụ giữa trang dịch vụ, trang chủ và các khu vực giới thiệu liên quan.

### 2.15. Cải thiện giao diện và trải nghiệm người dùng

- Sửa logo ở footer để hiển thị đúng.
- Xóa logo phủ trên video giới thiệu ở trang chủ theo yêu cầu nhận diện mới.
- Điều chỉnh luồng cuộn trang chủ: sau phần video/xe sẽ chuyển mượt sang khu vực “Giải Pháp Vận Tải Toàn Diện”, không còn phần hình ảnh trượt từ phải sang gây rối.
- Điều chỉnh thanh menu khách hàng: khi ở đầu trang hiển thị trạng thái bình thường, khi cuộn xuống hoặc đang xem các phần bên dưới thì chuyển sang trạng thái trong suốt nhưng vẫn nhìn thấy các tab.
- Bổ sung nút gửi yêu cầu khác/quay lại form sau khi gửi liên hệ thành công, giúp người dùng có thể gửi lại thông tin mới mà không cần tải lại trang.

## 3. Kết quả đạt được

- Frontend đã có thể build và triển khai trên Vercel/cPanel.
- Các đường dẫn React hoạt động khi truy cập và tải lại trực tiếp.
- Frontend đã kết nối được với backend production.
- Backend hoạt động trên Render và kết nối được MySQL Aiven.
- Database đã có cấu trúc phục vụ các chức năng chính của website.
- Schema database được cập nhật tự động khi deploy, không còn phụ thuộc vào thao tác chạy `init.sql` thủ công.
- Form liên hệ và FAQ lưu dữ liệu thực tế vào Admin.
- Admin có thể nhìn thấy số yêu cầu liên hệ mới trực tiếp trên dashboard/sidebar và danh sách liên hệ được tự động làm mới định kỳ.
- Quản trị viên có thể quản lý nội dung trang chủ, giới thiệu, dịch vụ, tin tức, FAQ, chi nhánh, đối tác, đánh giá khách hàng và yêu cầu khách hàng.
- Nội dung tin tức trên trang chủ được đồng bộ với trang tin tức.
- Nội dung dịch vụ trên trang chủ được đồng bộ với dữ liệu dịch vụ thật.
- Website có trang “Văn phòng & Chi nhánh” rõ nghĩa hơn, dữ liệu có thể cập nhật từ Admin.
- Các khu vực cần thay đổi media như logo đối tác, icon dịch vụ, icon quy trình, video hero và ảnh fallback đã thân thiện hơn với Admin.
- Trải nghiệm cuộn trang chủ, thanh menu, form liên hệ và các liên kết dịch vụ được cải thiện.
- Hệ thống có thể gửi thông báo qua Resend mà không phụ thuộc vào cổng Gmail SMTP.
- Email thông báo đã có giao diện chuyên nghiệp và thuận tiện xử lý yêu cầu.

## 4. Các kiểm tra đã thực hiện

- Kiểm tra build frontend sau khi điều chỉnh dependency.
- Kiểm tra route trực tiếp trên Vercel và cPanel.
- Kiểm tra health-check backend và trạng thái kết nối database.
- Kiểm tra cú pháp, thứ tự và bộ phân tách câu lệnh của migration tự động.
- Kiểm tra đăng nhập Admin và xác thực JWT.
- Kiểm tra gửi form liên hệ, lưu database và hiển thị trong Admin.
- Kiểm tra badge số yêu cầu liên hệ mới trên dashboard Admin và cơ chế tự làm mới danh sách liên hệ theo chu kỳ.
- Kiểm tra gửi câu hỏi FAQ và cập nhật trạng thái.
- Kiểm tra tạo, sửa, xóa và sắp xếp dịch vụ.
- Kiểm tra tạo và chỉnh sửa bài viết có nội dung rich text.
- Kiểm tra payload gửi email qua Resend và cú pháp mẫu HTML email.
- Kiểm tra thêm, sửa, xóa dữ liệu văn phòng/chi nhánh trong Admin.
- Kiểm tra upload logo đối tác, icon dịch vụ, icon quy trình, video hero và ảnh fallback.
- Kiểm tra dữ liệu dịch vụ hiển thị lại ở trang chủ và trang giới thiệu.
- Kiểm tra thêm, sửa, xóa đánh giá khách hàng và tiêu đề section đánh giá.
- Kiểm tra hành vi thanh menu khi ở đầu trang và khi cuộn xuống.
- Kiểm tra giao diện trang chủ sau khi loại bỏ lỗi lộ/chồng nội dung khi cuộn.
- Kiểm tra nút gửi yêu cầu khác sau khi gửi form liên hệ thành công.
---
**Người lập báo cáo:** Nguyễn Đức Trí 
**Ngày lập:** 11/07/2026
