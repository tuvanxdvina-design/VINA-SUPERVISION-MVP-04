# VINA-SUPERVISION MVP-04 — chạy thử có kiểm soát

Bản này fork từ MVP-03 (09/10/2026) để sửa lỗi mà không đụng bản MVP-03 đang chạy thật. Ứng dụng MVP-04 chạy trên máy này: giao diện `http://localhost:8082/`, API `http://localhost:3003/`, PostgreSQL trong Docker qua cổng máy `5434`, DB `vina_supervision_mvp04`. Các cổng chỉ lắng nghe trên `127.0.0.1` và được tách khỏi MVP-03 (8081/3002/5433) cùng các phiên bản dự án khác.

## Khởi động

Yêu cầu Docker Desktop, Node.js, Python và thư mục `backend/node_modules` đã được cài. Chạy `run.bat` trong thư mục dự án. Tập lệnh khởi động cơ sở dữ liệu, API và giao diện, sau đó kiểm tra kết nối. Có thể chạy lại mà không tạo thêm máy chủ.

Kiểm tra `http://localhost:3003/health`: kết quả cần có `status: OK` và `database: connected`. Nếu khởi động lỗi, xem `runtime-logs/backend.err.log` và `runtime-logs/frontend.err.log`.

## Phạm vi bản chạy thử

- Hệ thống đang chạy ở chế độ `production`; tài khoản demo đã bị vô hiệu hóa. Mỗi người sử dụng tài khoản riêng và chỉ thấy các công trình được phân công.
- Công trình, tiến độ, nhật ký, hồ sơ, tệp đính kèm, nội dung chất lượng, nhân sự, phân quyền, quy trình duyệt và thùng rác được lưu tập trung trong PostgreSQL/thư mục tải lên của máy chủ.
- Trình duyệt chỉ giữ phiên đăng nhập, bộ nhớ đệm giao diện và hàng đợi tạm khi mất kết nối; đây không phải nguồn dữ liệu chính.
- Tệp chờ khi thiết bị mất mạng được giữ bằng IndexedDB, không nhúng base64 vào `localStorage`. Ảnh lớn được tối ưu tối đa khoảng 2560 px trước khi xếp hàng; tệp chỉ bị xóa khỏi hàng đợi sau khi máy chủ xác nhận lưu thành công.
- Hợp đồng công trình và ảnh nhật ký lưu trong kho `backend/uploads` theo SHA-256; PostgreSQL lưu metadata và quyền truy cập. Hồ sơ/báo cáo hiện gửi nhị phân trực tiếp tới máy chủ. Không được gửi duyệt nhật ký khi còn tệp chờ đồng bộ.
- Nhật ký và hồ sơ đi theo quy trình nháp → gửi duyệt → phê duyệt/trả lại → khóa. Quyền xem, thêm, sửa, tải xuống, duyệt và xóa được kiểm tra tại máy chủ theo từng công trình.
- Ứng dụng có thể cài theo chuẩn PWA trên Windows, Android và iPhone nhưng vẫn kết nối cùng một máy chủ dữ liệu.

## Giới hạn

Đây là bản chạy thử nội bộ qua mạng Tailscale riêng, không mở ra Internet công cộng. Máy chủ văn phòng, Docker Desktop và Tailscale phải hoạt động để thiết bị khác đọc hoặc cập nhật dữ liệu. Cần tiếp tục nghiệm thu thực địa về chất lượng mạng, dung lượng ảnh/tệp, xung đột khi nhiều người cùng sửa và quy trình khôi phục sau sự cố trước khi vận hành chính thức.

Các chuỗi cũ đã mất dấu thành dấu `?` trong nội dung nhật ký PostgreSQL cần đối chiếu bản gốc trước khi sửa; việc đổi mã hóa tệp không thể khôi phục những ký tự đã mất trong dữ liệu.

## Chạy trên nhiều thiết bị

Địa chỉ Tailscale `https://desktop-e9suj00.tailc548b7.ts.net/` trong `DEPLOY-MULTISITE.md` là của **MVP-03**, chưa áp dụng cho MVP-04. MVP-04 hiện chỉ chạy trên `127.0.0.1`, chưa mở qua Tailscale — nếu cần mở, sửa `enable-tailnet.ps1` đã trỏ đúng cổng `3003` rồi nhưng phải đăng ký một serve/funnel riêng, không dùng chung địa chỉ trên.
