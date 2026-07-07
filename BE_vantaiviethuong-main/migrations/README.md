# Database migrations

Thư mục này là nguồn chuẩn duy nhất của cấu trúc database.

## Cách chạy

```bash
npm run migrate
```

Backend cũng tự chạy migration khi `npm start`. Server mở cổng trước, sau đó cập
nhật schema và chỉ báo database `connected` khi migration hoàn tất. Vì vậy Render
không bị port timeout nếu Aiven tạm thời chưa kết nối được.

## Tạo thay đổi schema mới

1. Không sửa migration đã được chạy.
2. Tạo file SQL mới với số thứ tự tăng dần, ví dụ:
   `002_create_quote_requests.sql`.
3. Không viết `CREATE DATABASE` hoặc `USE`; database luôn lấy từ `DB_NAME`.
4. Nên viết câu lệnh có thể chạy lại an toàn. MySQL DDL có thể tự commit nên hãy
   sao lưu dữ liệu trước các thay đổi xóa cột hoặc đổi kiểu dữ liệu.
5. Chạy `npm run test:migrations`, sau đó `npm run migrate` trên môi trường thử
   nghiệm trước khi deploy production.

Runner lưu tên file, checksum và thời điểm áp dụng trong bảng
`schema_migrations`. Nếu nội dung một migration cũ bị thay đổi, quá trình deploy
sẽ dừng và yêu cầu tạo migration mới. Advisory lock MySQL bảo đảm hai instance
không cập nhật schema cùng lúc.

`config/init.sql` chỉ còn là tài liệu cũ và không được sử dụng cho deploy mới.

Với database hoàn toàn mới, đặt `INITIAL_ADMIN_PASSWORD` (tối thiểu 8 ký tự) và
các biến `INITIAL_ADMIN_*` tùy chọn trước lần chạy đầu. Runner chỉ tạo tài khoản
khi bảng `admin_users` đang rỗng; biến mật khẩu nên được xóa sau khi đăng nhập.
