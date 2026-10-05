# Bàn giao phiên làm việc — đọc tệp này trước, không cần đọc lại lịch sử hội thoại cũ

Ghi lúc: 2026-10-12, cập nhật lần cuối **05/10/2026** (build hiện tại **2026-10-14.12**, đã chạy trên máy người dùng và người dùng đã thử đạt). Mục đích: phiên Claude Code mới đọc tệp này là đủ hiểu trạng thái, đỡ phải đọc lại toàn bộ hội thoại. **Đọc mục "Phiên 04–05/10" ngay dưới đây trước** — các mục phía dưới là lịch sử cũ hơn, một số câu "chưa kiểm thử/không chạy được lệnh" ở đó đã lỗi thời.

## ★ Phiên 04–05/10 (build 2026-10-14.9 → .12) — ĐỌC TRƯỚC

### Cách làm việc mới (tiết kiệm token)
- Repo đã có trên GitHub: `tuvanxdvina-design/VINA-SUPERVISION-MVP-04`. Máy người dùng (`D:\Setup\QLGS-HeThong\ChatGPT\VINA-SUPERVISION-MVP-04`) đã nối `origin`.
- Quy trình: mỗi việc 1 nhánh `claude/...` → PR → **GitHub Actions tự chạy kiểm thử** (`.github/workflows/kiem-thu.yml`: cú pháp + bộ tách + hồi quy + giao diện, ~1–2 phút) → người dùng bấm Merge → trên máy: `git pull origin main` → `.\run.bat` → Ctrl+F5 ở **http://localhost:3003/**.
- Trước khi pull, luôn cho người dùng chạy `git remote -v` + `git status --short`; `status` có tệp → dừng, hỏi trước (tránh ghi đè việc Codex/người dùng tự sửa).
- Chạy kiểm thử trên Linux/đám mây (không cần Docker/Chrome của máy): PostgreSQL 16 ở cổng 5434 (user/pass `postgres/postgres`), đặt `JWT_SECRET` (repo không có `backend/.env`), `TEST_DB_URL`/`UI_TEST_DB_URL` (tên CSDL bắt đầu `vina_regr`/`vina_ui`), `CHROME_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome` cho bộ giao diện. Lệnh: `cd backend && node --test tests/regression.test.js` và `node --test --test-reporter=spec tests/ui/all.test.js`.
- Phiên đám mây **không** chạy được lệnh trên máy Windows của người dùng; muốn Claude chạy hộ thì người dùng mở `claude remote-control` trong thư mục dự án.

### Đã xong và người dùng đã thử đạt (CAP-NHAT Đợt 31–34)
1. **Lỗi phân quyền máy chủ**: sửa công trình / tệp hợp đồng / bảng tiến độ (`routes/projectRoutes.js`) nay xét quyền Duyệt **tại công trình** (`requirePermission('APPROVE')`), khớp `canEditProject(pid)`.
2. Ẩn "+ Thêm công trình" và "Quản lý Gói thầu" với người không phải Admin/Giám đốc; trạng thái hiện chữ Việt (`STATUS_LABELS` trong `js/01-core.js`).
3. **Điện thoại**: bảng danh sách → thẻ (`js/16-the-dien-thoai.js` + CSS `table.mcards`, ≤600px; thêm khung bảng mới vào `MCARD_CONTAINERS`); số liệu Tổng quan 2×2; bóng mờ báo còn mục ở thanh điều hướng dưới; thanh nút Lưu bám đáy hộp thoại.
4. **TVGS trưởng "Duyệt tất cả (N)"** (`logBulkLead`): Xác nhận nháp của mình + Duyệt bản tổ viên đã gửi.
5. **Nháp báo cáo ngày là của riêng người lập** (quy tắc mới, xem CLAUDE.md "Domain rules"): chỉ người lập thấy/sửa/gửi; TVGS trưởng thấy từ khi đã gửi; Admin/Giám đốc thấy hết. Áp cả máy chủ (404 với nháp người khác) lẫn giao diện (`canSeeLog`). Đồng bộ dọn bản máy chủ không còn trả về — **chỉ dọn bản đã có mã từ trước khi tải và không còn thay đổi chờ** (từng có lỗi chạy đua xóa nhầm bản vừa lưu, đã sửa ở .12, ca GD-25).
6. **Cảnh báo "thiếu báo cáo ngày"** chỉ tính bản đã gửi trở đi — ngày chỉ có nháp vẫn là thiếu.
7. Kiểm thử: hồi quy **46/46**, giao diện **25/25**; ca giao diện cũ lỗi thời đã sửa; thêm `CHROME_PATH` cho Linux.
8. Đã kiểm, **không phải lỗi**: "báo cáo GS viên biến mất sau khi Gửi duyệt" (Đợt 30) — không tái hiện được (vẫn thấy sau gửi, sau tải lại, trên máy mới).

### Quyết định của người dùng (04–05/10) — không bàn lại
- Nháp chỉ người lập thấy/sửa; trưởng nhóm không duyệt hộ nháp chưa gửi.
- Admin/Giám đốc vẫn thấy nháp.
- Ngày chỉ có nháp = thiếu báo cáo.
- Điện thoại dùng dạng thẻ; PC giữ dạng bảng.

### Đề xuất đã được duyệt — đang làm (05/10), xem CAP-NHAT Đợt 35 khi xong
1. Ô "Gói thầu" trong văn bản chất lượng chọn từ danh sách gói đã khai báo (tránh gõ tay lệch tên).
2. Nhãn đầy đủ: "Đơn vị tc" → "Đơn vị thi công", "Cbkt" → "Cán bộ kỹ thuật (người)".
3. Gói thầu có nhà thầu nhưng chưa có hạng mục: vẫn cho chọn nhà thầu từ danh sách (hiện lùi về ô gõ tay).
4. Bộ tình huống kiểm thử đủ mọi vai trò (Admin, Giám đốc, TVGS trưởng, GS viên, người không được phân công).

### Còn mở (chưa ai yêu cầu làm)
- `backend/.env` của MVP-04 có thể dùng chung `JWT_SECRET` với MVP-03 — nên đổi khóa riêng.
- "Ẩn hẳn mục theo vai trò ở Chi tiết công trình" — vẫn chưa có câu trả lời cụ thể "ẩn mục nào".
- CSDL thử (bộ kiểm thử) không có bảng `schema_migrations` nên app hiện dải đỏ "CSDL chưa cập nhật" trong lúc test — chỉ ảnh hưởng môi trường thử.


## ⚠️ Đổi tên lớn vừa làm: "Nhật ký" → "Báo cáo ngày" (01/10, Đợt 24)
Toàn bộ giao diện/thông báo đã đổi "Nhật ký"/"Nhật ký hiện trường" → "Báo cáo ngày". **Cơ chế/dữ liệu KHÔNG đổi** (vẫn bảng `daily_logs`, vẫn hàm `openLog`/`canEditLog`/`daily_logs` API, vẫn quy trình Nháp→Chờ duyệt→Duyệt→Khóa) — quyết định có chủ đích để không phá phần Xác nhận tự duyệt + Gói thầu vừa xong. Loại báo cáo tổng hợp "DAILY" trong mục Báo cáo đã đổi nhãn thành "Tổng hợp ngày" để tránh trùng tên. **Nếu đọc code thấy "nhật ký"/"log" ở tên hàm/biến/bảng — đó là tên nội bộ cũ, cố ý giữ nguyên, không phải sót.** Riêng `DOC_TYPES` trong `js/06-ho-so.js`/`documentService.js` có mã `'NK':'Nhật ký'` — đây là MỘT LOẠI HỒ SƠ PHÁP LÝ KHÁC (tài liệu lưu trữ dạng sổ nhật ký cũ), không liên quan tính năng vừa đổi tên, cố tình giữ nguyên.

## Bối cảnh
- `VINA-SUPERVISION-MVP-04` là **bản fork riêng của MVP-03** (09/10/2026) để sửa lỗi/thêm tính năng mà không đụng MVP-03 đang chạy thật qua Tailscale.
- Cổng/CSDL tách biệt: giao diện `8082` (MVP-03: `8081`), API `3003` (MVP-03: `3002`), PostgreSQL cổng máy `5434` (MVP-03: `5433`), DB `vina_supervision_mvp04` (MVP-03: `vina_supervision`).
- Tài khoản thử: `duong` (Giám đốc — toàn quyền), mật khẩu hiện tại `Test12345` (đặt qua `node backend\scripts\set-user-password.js duong`, có thể đã bị đổi — nếu đăng nhập sai, đặt lại bằng script đó).
- **MVP-03 có thể đang được một phiên Claude Code khác sửa song song** — đã thấy nhiều lần trong phiên trước (build MVP-03 tự tăng, có hàm mới lạ). Không đụng vào MVP-03 trừ khi được yêu cầu rõ.

## ⚠️ `web-public` (cổng 8082) — tìm ra 2 lỗi thật, khuyến nghị DÙNG CỔNG 3003 THAY THẾ (01/10, build 2026-10-14.5)

Đợt trước từng báo nhầm "lỗi đã hết" (do tình cờ khớp vì Claude tự chép tay trước khi test, không phải do `run.bat` tự chép đúng). Khi kiểm tra kỹ bằng trình duyệt thật (Đợt 27), phát hiện **2 lỗi thật, độc lập nhau**:

1. **`start-dev.ps1` chép `js/` bị lỗi cú pháp**: `Copy-Item -LiteralPath (Join-Path $jsSrc '*') ...` — `-LiteralPath` khiến PowerShell hiểu `*` là tên tệp thật (không phải đại diện) → luôn thất bại âm thầm, `web-public\js\*` không bao giờ được cập nhật qua con đường này. **Đã sửa**: bỏ `-LiteralPath`, dùng `-Path`.
2. **Cổng 8082 (python `http.server` phục vụ `web-public/`) bị trình duyệt cache tệp JS rất dai dẳng** — kể cả sau khi tệp trên đĩa đã đổi và tải lại trang. Python `http.server` không gửi header chống cache. Đây nhiều khả năng là **nguyên nhân gốc thật sự** của hầu hết các lần báo "sửa code mà giao diện vẫn chạy bản cũ" suốt from Đợt 17 tới giờ.

**Phát hiện thêm quan trọng hơn cả 2 lỗi trên:** `backend/src/app.js` (cổng **3003**) phục vụ giao diện **trực tiếp từ thư mục gốc dự án**, không qua `web-public/`, không qua python. Nghĩa là **cổng 3003 không bao giờ bị lỗi đồng bộ hay cache dai dẳng** — sửa tệp gốc xong là có hiệu lực ngay, không cần chờ `run.bat` chép gì cả.

**Khuyến nghị cho mọi phiên sau: dùng `http://localhost:3003/` làm địa chỉ chính để kiểm thử/làm việc hằng ngày, không dùng 8082 nữa trừ khi có lý do cụ thể** (đóng gói cài đặt/PWA có thể vẫn cần 8082 — chưa rà hết). Nếu vẫn cần dùng 8082, phải Ctrl+Shift+R (hard reload, không chỉ Ctrl+F5) hoặc mở cửa sổ ẩn danh mới để chắc chắn không dính cache cũ.

**Lưu ý cho Claude phiên sau:** nếu công cụ dòng lệnh vẫn lỗi (xem mục dưới), không tự chạy `.\run.bat` được. Sau khi nhờ người dùng chạy, **kiểm tra lại bằng trình duyệt ở cổng 3003** (không phải 8082) trước khi kết luận đã đồng bộ đúng — cổng 8082 có thể báo sai do cache dù dữ liệu trên đĩa đã đúng.

## Việc đã làm xong (build 2026-10-09.1 → 2026-10-14.2) — xem chi tiết ở `CAP-NHAT-20260926.md` Đợt 16–24
1. **`apiOnline()` (`js/01-core.js`) bỏ hẳn điều kiện `navigator.onLine`** — chỉ còn kiểm tra đã đăng nhập. Lý do: trên mạng Tailscale riêng (không có đường ra Internet công khai), `navigator.onLine` hay báo sai là offline, làm nhiều nút "Tải lại" (Tổng quan, Việc cần duyệt, Thùng rác) và việc lấy lại hồ sơ đã tải lên (`syncDocumentsFromApi`) không hoạt động dù đang có mạng. Đã tự kiểm bằng trình duyệt (Claude) — hoạt động đúng.
2. **Enter đăng nhập được** (trước phải bấm nút) — `index.html` thêm `onkeydown` cho 2 ô tài khoản/mật khẩu.
3. **Gửi duyệt nhật ký không còn báo nhầm "chưa lên máy chủ (mất mạng?)"** khi đang có mạng — cùng nguyên nhân `navigator.onLine` ở trên, sửa tại `js/05-nhat-ky.js` + `api.js`.
4. **4 trường mới trong form nhật ký**: Đơn vị tc, Hạng mục, Cbkt (số người), Kiến nghị — migration `20261011_daily_log_extra_fields.sql`.
5. **Nhân lực/Máy móc tách thành danh sách nhiều loại** (tên loại tự gõ + số lượng, ví dụ "Thợ xây: 5, Thợ điện: 2") — migration `20261012_daily_log_worker_machine_items.sql`. Tổng số vẫn tự tính cho các chỗ đang tổng hợp cũ (báo cáo, tổng quan tiến độ) không cần sửa lại.
6. **Sửa lỗi ô "Chứng chỉ" trong Nhân sự không hoạt động** — nhân sự phân công qua Thiết lập → "Phân công tài khoản" chỉ tạo `project_members`, không tạo `project_personnel`, nên ô Chứng chỉ khóa vĩnh viễn + nút Lưu gọi nhầm API (PUT với id rỗng). Sửa `backend/src/services/projectPersonnelService.js` (`upsert()` nay nhận `user_id` để hợp nhất đúng dòng) + `js/09-nhan-su.js`.
7. **Xác nhận "nhiều GS viên cùng lập nhật ký 1 ca + Trưởng nhóm Tổng hợp cuối ngày" đã có sẵn, không cần sửa** — ràng buộc trùng đã theo `(project_id, log_date, shift, created_by)` từ trước (migration `20261010_contract_personnel_daily.sql`, có thể do phiên MVP-03 làm), và "Báo cáo → + Lập báo cáo → Báo cáo ngày" tự gộp mọi nhật ký trong ngày (mỗi dòng một người). Đã thêm hiển thị chi tiết nhân lực/máy móc theo từng loại vào bảng báo cáo này (`js/07-bao-cao.js`, `backend/src/services/reportService.js`).

## Việc CHƯA làm / còn hỏi ngỏ
- **Chưa kiểm thử qua trình duyệt** phần lớn thay đổi từ Đợt 19 trở đi (chỉ soát mã, chưa bấm thử qua UI thật vì công cụ dòng lệnh hỏng suốt nhiều phiên) — xem danh sách cần thử ở cuối CAP-NHAT Đợt 22.
- **Nguyên nhân `web-public` không tự đồng bộ vẫn chưa tìm ra** — cần công cụ dòng lệnh để chạy thử `start-dev.ps1` trực tiếp và xem lỗi thật.
- **`backend/.env` của MVP-04 dùng chung `JWT_SECRET` với MVP-03** (copy nguyên khi fork) — nên đổi sang khóa riêng nếu MVP-04 chạy song song lâu dài: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` rồi dán vào `backend\.env`.
- **Chưa viết ca kiểm thử hồi quy** (`backend/tests/regression.test.js`) cho các thay đổi từ Đợt 17 trở đi (nhân lực/máy móc theo loại, Xác nhận tự duyệt, tệp ký văn bản chất lượng) — công cụ dòng lệnh chưa chạy được suốt các phiên gần đây, không tự chạy được `run-regression.cmd`.
- **"Ẩn mục theo vai trò" ở trang Chi tiết công trình còn dở dang** — hỏi lại người dùng "ẩn mục nào" chưa có câu trả lời rõ (người dùng chuyển sang yêu cầu khác); để sau.

## Việc lớn người dùng vừa yêu cầu (01/10) — tiến độ

1. ~~**Nhân sự: chọn từ danh sách nhân sự có sẵn ở dự án khác khi thêm mới**~~ — **ĐÃ XONG (01/10, bản 2026-10-14.3, Đợt 25)**. `openTeamMember()` khi thêm mới nay có ô gõ-kèm-gợi-ý (`<datalist>`) nạp từ `GET /api/project-personnel/search` (mới, `projectPersonnelService.searchNames()`); chọn đúng tên gợi ý → tự điền Chứng chỉ nếu đang trống; chức danh tại công trình mới luôn tự chọn riêng, không kéo theo công trình cũ. Chưa thử qua trình duyệt.
2. ~~**Nhân sự: nhiều tệp chứng chỉ + xóa từng tệp**~~ — **ĐÃ XONG (01/10, bản 2026-10-14.3, Đợt 25)**. Ô `tmCertFile` nay `multiple`, lưu lần lượt từng tệp (lỗi 1 tệp không chặn các tệp còn lại); danh sách tệp đã lưu có nút ✕ xóa riêng (route mới `DELETE /api/project-personnel/:id/files/:fileId` + `service.removeFile()`). Chưa thử qua trình duyệt. **Phần "dùng lại ở nhiều nơi" (nhập một chỗ, hiện ở các màn hình khác) CHƯA làm** — cần hỏi lại người dùng muốn hiện chứng chỉ ở đúng những màn hình nào trước khi thiết kế tiếp (xem mục dưới).
3. ~~**Gộp "Hồ sơ" vào trang Công trình**~~ — **ĐÃ XONG một phần, phạm vi thu hẹp (01/10, bản 2026-10-14.4, Đợt 26)**. Thêm nút **"+ Khai báo hồ sơ mới"** ngay trong card "Hồ sơ" ở Chi tiết công trình (`openDoc('',currentProjectId)`, `openDoc()` nhận thêm tham số `forceProjectId`); nút "Sửa" từng hồ sơ trong bảng đã có sẵn từ trước. **Chưa bỏ** trang "Hồ sơ" (`#docs`) riêng — vẫn giữ để Admin/Giám đốc xem/sửa hồ sơ nhiều công trình cùng lúc; nếu người dùng muốn bỏ hẳn trang riêng thì làm tiếp (rủi ro cao hơn vì nhiều nơi khác còn trỏ tới `#docs`/`docProject`). Chưa thử qua trình duyệt.
4. **Giao diện đổi theo vai trò khi chuyển công trình** — **sửa được MỘT lỗi cụ thể (01/10, bản 2026-10-14.4, Đợt 26)**: `canEditProject()` (`js/02-quyen.js`) trước đây xét theo **loại tài khoản chung** (`db.role`) nên nút "Sửa công trình"/"Sửa bảng tiến độ" hiện sai ở công trình mà người dùng chỉ là GS viên. Đã sửa thành `canEditProject(pid)` xét đúng quyền Duyệt tại từng công trình — khớp với cách "Duyệt"/"Trình công ty" (`canApproveIn`/`isLogLead`) **vốn đã làm đúng per-project từ trước** (đã xác nhận qua đọc code, không phải sửa). Tác dụng phụ: tạo công trình MỚI nay chỉ Admin/Giám đốc làm được (trước đây tài khoản loại "Trưởng TVGS" cũng tạo được) — xem lại nếu không đúng ý. **Vẫn CHƯA làm phần rộng hơn** người dùng mô tả ban đầu (đổi hẳn bố cục/các khối hiển thị trên trang Chi tiết công trình tùy vai trò, không chỉ 1-2 nút) — nếu người dùng muốn thêm, cần hỏi cụ thể "mục nào nên khác" trước khi code tiếp (xem Đợt 22/SESSION-HANDOFF cũ, câu hỏi này đã hỏi 2 lần chưa có câu trả lời cụ thể).
5. **Bộ tình huống kiểm thử đầy đủ mọi vai trò** (Admin, Giám đốc, TVGS trưởng, GS viên, GS hiện trường...) qua mọi chức năng — CHƯA LÀM, làm SAU KHI các mục 1–4 ổn định, tránh phải viết lại kịch bản khi tính năng còn đổi.

**Việc còn mở cần hỏi người dùng:**
- Ý "nhập liệu một chỗ dùng nhiều nơi" cho chứng chỉ nhân sự (mục 2) — cụ thể muốn chứng chỉ của một người hiện lại ở đâu ngoài trang Nhân sự (hồ sơ công trình? báo cáo? phiếu phân công?) trước khi code tiếp.
- Mục 4 (giao diện theo vai trò): mục nào trên trang Chi tiết công trình nên ẨN HẲN (không chỉ disable) khi người dùng không phải TVGS trưởng tại công trình đang xem — cần ví dụ cụ thể.
- Trang "Hồ sơ" (`#docs`) riêng: giữ song song với nút khai báo trong Công trình (như hiện tại), hay bỏ hẳn?

## Việc mới làm trong phiên 01/10 thứ hai (bản 2026-10-14.4, Đợt 26) — ngoài 4 mục trên

- **Gộp nav "Báo cáo ngày" + "Báo cáo"**: còn 1 nút "📈 Báo cáo" trên thanh nav; bên trong 2 tab (`.report-hub-tab[data-tab="daily"|"reports"]`) chuyển qua lại giữa "Báo cáo ngày (cá nhân)" và "Báo cáo tổng hợp". `goPage()` (`js/01-core.js`) tự ánh xạ `daily`→nút nav `reports` để tô sáng đúng + đồng bộ tab. Đã sửa `backend/tests/ui/helpers.js` (`openPage`/`navVisible`) để không vỡ ca kiểm thử cũ gọi `openPage(page,'daily')`.
- **Hiện tên tài khoản + vai trò ở đầu trang** sau đăng nhập (`#hdrUser`, hàm `renderHeaderUser()` trong `js/01-core.js`).
- **Biên bản kiểm tra hiện trường** (`js/08-chat-luong.js`): hiện "Thứ" theo ngày lập (tự tính); chân ký (mục 4) tự lấy tên người chức vụ cao nhất của từng đơn vị trong "Thành phần tham gia" (vẫn sửa tay được); bỏ chữ thừa "(công việc kiểm tra)" ở nhãn "Đối tượng".
- **Thư kỹ thuật**: "Người tiếp nhận" (1 ô) → danh sách nhiều người nhận; Lưu xong tự mở màn hình Xem (có nút In/Xuất PDF ngay) thay vì phải thoát ra ngoài rồi mở lại — áp dụng cho cả Biên bản hiện trường.
- Toàn bộ **chưa kiểm thử qua trình duyệt** (công cụ dòng lệnh vẫn lỗi suốt phiên) — xem danh sách cần thử ở cuối CAP-NHAT Đợt 26.

## Cách kiểm thử nhanh không cần đọc lại toàn bộ mã
1. Chạy đồng bộ + khởi động (xem lệnh robocopy ở trên).
2. Vào `http://localhost:8082/`, đăng nhập `duong`/mật khẩu đã đặt.
3. Lập nhật ký mới: thử Enter ở ô mật khẩu lúc đăng nhập (đã làm ở bước 2), thêm nhân lực/máy móc nhiều loại, gửi duyệt, mở khung duyệt xem hiển thị đúng.
4. Thiết lập → Phân công 1 tài khoản mới chưa có hồ sơ nhân sự → Nhân sự → bấm vào người đó → thử nhập Chứng chỉ + tải tệp.
5. Việc cần duyệt / Tổng quan / Thùng rác: bấm "↻ Tải lại", phải phản ứng.

## Yêu cầu 12/10 — ĐÃ XỬ LÝ (xem CAP-NHAT Đợt 21–22), chỉ còn 1 việc dở dang

Danh sách 11 việc + 2 ghi chú nghiệp vụ người dùng nêu ngày 12/10 đã được rà và xử lý qua các Đợt 21–22:
- Đã xong từ trước (xác nhận qua rà mã, không cần sửa): đồng bộ hồ sơ qua `queueOfflineFiles`/IndexedDB (không còn base64/localStorage); danh mục Loại hợp đồng đã là dropdown (`CONTRACT_NATURE_TYPES`/`CONTRACT_PRICE_TYPES`); ô Tiến độ (%) đã có chú thích; nút tải "Quyết định thay thế nhân sự" đã lưu thật lên máy chủ; tổng hợp nhật ký nhiều GS viên → báo cáo ngày đã có sẵn.
- Đã sửa: ô "Số ngày thực hiện hợp đồng" tự tính (Đợt 21, lỗi id lệch hoa/thường); "Xác nhận" tự duyệt cho TVGS trưởng tự lập nhật ký (Đợt 22 — chọn phương án ẩn hẳn bước Chờ duyệt, đổi nút thành "Xác nhận", KHÔNG phải tự động chuyển ngầm); tệp ký văn bản chất lượng nay lên máy chủ thật, không còn mất khi đổi thiết bị (Đợt 22).
- **Còn dở dang — CHƯA XONG:** "ẩn hẳn các mục không liên quan vai trò hiện tại" trên trang Chi tiết công trình (người dùng đã chọn phương án này khi được hỏi lại, không phải chỉ ẩn nút). Hiện mới có `updateProjectRoleBadge()`/`#pdRole` hiện đúng chức danh tại công trình đang xem, **chưa ẩn mục/nút nào theo vai trò đó**. Cần làm tiếp: xác định rõ với người dùng những mục nào nên ẩn với vai trò nào trước khi code (ví dụ: GS viên không phải TVGS trưởng thì ẩn hẳn khối "Duyệt"/"Trình công ty" ở trang chi tiết, không chỉ ẩn nút Duyệt).

## Tính năng "Gói thầu" — ĐÃ XONG (01/10, bản 2026-10-14.1), xem CAP-NHAT Đợt 23

Một công trình có thể có nhiều gói thầu, mỗi gói thầu nhiều nhà thầu, mỗi nhà thầu thi công một số hạng mục. Migration `20261014_bidding_packages.sql` (bảng `bidding_packages`, `bidding_package_contractors`, cột `bidding_package_id` trên `project_personnel`/`project_members`); backend `biddingPackageService.js`/`routes/biddingPackages.js`; giao diện ở cả 3 tệp `js/03-cong-trinh.js` (khai báo/quản lý gói thầu), `js/09-nhan-su.js` (bắt buộc chọn gói khi phân công nếu công trình có gói), `js/05-nhat-ky.js` (dropdown xếp tầng Đơn vị tc/Hạng mục khi người lập đã được gán gói). **Chưa kiểm thử qua trình duyệt** — xem danh sách cần thử ở cuối CAP-NHAT Đợt 23. Hạn chế đã biết: đổi công trình ngay trong cửa sổ Lập nhật ký không tự nạp lại gói thầu theo công trình mới chọn (đóng mở lại form để né).

## Ghi chú khác
- File tạm lạ `DSetupQLGS-HeThongChatGPTVINA-SUPERVISION-MVP-02port-check-tmp.txt` ở gốc MVP-04 — rác từ trước, chưa dọn, không ảnh hưởng gì.
- Backup CSDL thật có sẵn trong `backups\` nếu cần dữ liệu thật hơn để thử (xem `KET-QUA-KIEM-THU-20260926.md` để biết cách phục hồi an toàn — chỉ đụng container của MVP-04, không đụng MVP-03).
