# Task 02.1 — Grade Management

> Bản dùng để đưa lên repository đã ẩn định danh máy local; bản đầy đủ được giữ trong bằng chứng local đã Git ignore.

Ngày 07/11/2026, Asia/Bangkok (UTC+7).

Đã bổ sung Grade Management cho Center Manager tại `/center-manager/grades` và nạp bản Backend đã kiểm thử vào `http://localhost:5036`. Frontend đang chạy tại `http://localhost:5173`. Có thể bắt đầu kiểm thử thủ công.

**Task này không chạy migration, database update hoặc SQL sửa dữ liệu/schema lên database chính. Không commit, push hoặc merge.** Các thay đổi Task 02 đã có trong workspace được giữ nguyên; báo cáo này chỉ mô tả phần bổ sung Task 02.1.

## Chức năng đã triển khai

- Danh sách Grade lấy API thật, có loading, lỗi, tải lại và trạng thái không có kết quả riêng biệt.
- Thêm Grade, sửa tên, tìm kiếm, sắp xếp tên/mã/số lớp và phân trang. Tái sử dụng phong cách và các thành phần bảng của Subject Management; không sửa chức năng Subject.
- Hiển thị số Class thực tế thuộc từng Grade, gồm cả lớp Inactive/Completed. Liên kết xem lớp mở Class Management với `?gradeId=<id>`, dùng được cả hai chế độ Theo khối lớp và Tất cả lớp.
- Xóa sau xác nhận; frontend chặn khi đã biết có lớp. Backend kiểm tra lại để chặn cả trường hợp số lớp trên màn hình đã cũ. Lỗi giữ nguyên dialog/dữ liệu nhập để người dùng xử lý.
- Create/Edit Class tiếp tục tải danh mục Grade từ API. Grade mới hoặc đã đổi tên xuất hiện sau khi tải lại, ở cả Center Manager và Admin Staff. Bỏ giới hạn ID 1–12 trong validation; ID phải là số nguyên dương hợp lệ và tồn tại trong database.
- Không tự phân loại lại Class cũ. Mỗi Class vẫn chỉ có một Subject; không thêm Class Subject hoặc cấu trúc lớp đa môn.
- Theo yêu cầu sau kiểm thử, Class Management mặc định mở chế độ **Theo khối lớp** cho cả Center Manager và Admin Staff; vẫn chuyển được sang Tất cả lớp.

## API và bảo vệ dữ liệu

| Method | Endpoint | Kết quả |
| --- | --- | --- |
| GET | `/api/grades` | Danh sách với `gradeId`, `gradeName`, `totalClasses` |
| GET | `/api/grades/{id}` | Chi tiết mới nhất và số lớp; 404 nếu không tồn tại |
| POST | `/api/grades` | Tạo bằng `{ "gradeName": "..." }`, trả 201 |
| PUT | `/api/grades/{id}` | Chỉ đổi tên bằng cùng DTO; trả 200/404/409 |
| DELETE | `/api/grades/{id}` | Chỉ xóa Grade không có Class; trả 200/404/409 |

Tên được chuẩn hóa Unicode NFKC, gộp khoảng trắng, trim; bắt buộc, tối đa 50 ký tự, không chứa ký tự điều khiển. Kiểm tra trùng cả tên chuẩn hóa không phân biệt hoa thường và phép so sánh theo collation MySQL hiện tại. Ví dụ `khoi 1` bị từ chối khi đã có `Khối 1` trên collation hiện tại. DTO từ chối trường không hỗ trợ như `gradeId` và `status`, thay vì báo thành công nhưng bỏ qua yêu cầu.

Repository dùng transaction SERIALIZABLE và khóa danh mục bằng `SELECT ... FOR UPDATE` để đồng bộ kiểm tra trùng/cấp ID giữa các thao tác API đồng thời. Bảng hiện tại dùng ID gán thủ công, nên tạo mới lấy ID lớn nhất còn tồn tại cộng một; ID của bản ghi hiện hữu không được sửa. ID cao nhất đã xóa có thể được cấp lại, không hứa bảo đảm ID không bao giờ tái sử dụng. Khóa cả danh mục phù hợp danh mục nhỏ này nhưng có thể gây chờ khi nhiều người ghi cùng lúc; lỗi lock/deadlock trả 409 để tải lại và thử lại, không báo lưu thành công giả.

Rename chỉ cập nhật `grade_name`, không thay ID, Class, Subject, học phí hoặc quan hệ lịch sử. Delete kiểm tra mọi Class liên kết và vẫn có FK RESTRICT ở database bảo vệ. Không có cascade xóa Class, Student, Teacher, TA, Schedule, Invoice hay Payment từ các API Grade mới.

## Schema và phần cần phê duyệt

CRUD hiện tại dùng nguyên bảng `grades(grade_id, grade_name)` và quan hệ `classes.grade_id` đã triển khai ở Task 02. Không thêm entity property hoặc EF migration status trong task này, tránh làm runtime truy vấn cột chưa tồn tại.

**Ngừng sử dụng/kích hoạt lại chưa được bật**, vì schema hiện chưa có trạng thái. File [GradeManagementStatus.proposal.sql](../Capstone2/db/migrations/GradeManagementStatus.proposal.sql) chỉ là đề xuất, chưa thực thi ở database chính hoặc database test:

```sql
ALTER TABLE grades ADD status varchar(20) NOT NULL DEFAULT 'active';
```

Tác động dự kiến sau khi được duyệt và triển khai đồng bộ model/API/UI: Grade hiện tại có trạng thái active; ID/FK và Class không đổi; lịch sử của Grade inactive vẫn hiển thị; tạo Class mới chỉ chọn Grade active; sửa Class có thể giữ Grade inactive hiện tại. ALTER cần cửa sổ triển khai, backup và đánh giá metadata lock theo kích thước bảng thực tế. Không chạy riêng SQL trước khi có phần ứng dụng tương ứng và kế hoạch migration/history được duyệt.

File đề xuất cũng chứa **comment** cho unique index `UX_grades_grade_name`. Hiện chưa có index unique tên ở database: các API mới chống trùng và đã kiểm thử đồng thời, nhưng SQL hoặc công cụ ghi bên ngoài có thể bỏ qua bảo vệ này. Trước khi đề xuất index thành migration chính thức cần kiểm tra/chuẩn hóa trùng tên theo collation, thử nghiệm và được phê duyệt; không tự sửa các Grade hiện tại để tạo index.

## Phối hợp phân quyền

Đã thêm route/menu Grades cho Center Manager; menu Admin Staff giữ nguyên, chỉ tiếp tục dùng Grade trong Class Management. Không sửa Authentication/Authorization.

**Backend hiện chưa có authentication scheme và role policy bảo vệ các Management controller**, bao gồm Subject hiện tại. Grade controller đi theo cấu trúc hiện có; việc ẩn menu không phải kiểm soát quyền ở server. Vì thế chưa thể khẳng định API ghi Grade chỉ được gọi bởi Center Manager. Cần phối hợp phần phân quyền để bảo vệ POST/PUT/DELETE khi cơ chế xác thực hiện tại được hoàn thiện; không thêm cơ chế giả dựa vào role gửi từ client.

## Kiểm thử

| Kiểm tra | Kết quả |
| --- | --- |
| Backend build .NET 8 | Đạt; 3 cảnh báo nullable CS8601 sẵn có ở module khác |
| Frontend TypeScript/Vite build | Đạt; cảnh báo chunk lớn hơn 500 kB |
| Frontend unit/API contract tests | 82/82 đạt, gồm 6 test Grade Management mới |
| Lint các file Grade và Class page thay đổi | Đạt, không có cảnh báo sau chỉnh sửa |
| API thật trên MySQL test | 37 kiểm tra đạt / 53 request |
| UI CRUD thật trên database test | 6 nhóm kịch bản CM/AS ở desktop 1440, tablet 768, mobile 390; 93 request, không API fixture |
| UI chỉ đọc trên ứng dụng chính | 6 kịch bản CM/AS, 102 request, không request ghi, không lỗi JS/API |
| API chính sau nạp bản mới | GET Grades, Grade detail, Classes, Subjects đều 200 |
| `git diff --check` | Đạt |

API integration kiểm tra tên rỗng/quá dài/ký tự điều khiển, chống sửa ID, tên trùng/collation, Grade ID lớn hơn 12, đổi tên Grade có lớp, số lớp thực tế, chặn xóa lớp Completed liên kết, 404, tạo trùng đồng thời (một thành công/một 409), tạo ba tên khác nhau đồng thời (ID khác nhau), cleanup bản ghi tổng hợp và đối chiếu dữ liệu/quan hệ ban đầu.

UI integration kiểm tra CRUD, validation, giữ bản nháp sau lỗi tên trùng, search/sort/pagination, số lớp, liên kết xem lớp, Create Class dùng Grade mới, Admin Staff nhận Grade đổi tên sau reload, dialog xóa và xung đột khi có Class được thêm sau lúc tải danh sách, retry sau khi bỏ liên kết trên database test. Bảng trên màn hình nhỏ sử dụng cuộn ngang trong vùng bảng.

Lần chạy lại Chromium trong sandbox bị timeout CDP trước khi mở trang; chạy bằng quyền thực thi phù hợp đã đạt toàn bộ kịch bản nêu trên. Không coi lần timeout môi trường là lỗi CRUD ứng dụng.

Các script có thể chạy lại khi dựng đúng môi trường riêng:

```powershell
# Trong Capstone2/frontend
node --test tests/*.test.mjs
node tests/gradeManagement.integration.mjs <thu-muc-bang-chung>
node tests/gradeManagement.browser.mjs <thu-muc-bang-chung>
```

Hai script integration yêu cầu API test `127.0.0.1:53307` và identity header `127.0.0.1:33307/edutrack_grade_management`; không sử dụng endpoint chính. Test UI dùng bản frontend build trong `dist`. Database test là bản restore mới của database chính trên MySQL riêng cổng 33307; không áp dụng proposal status. Sau kiểm thử giữ lại database/bằng chứng, dừng các tiến trình test riêng.

## Database chính và bằng chứng

Đích đọc kiểm tra: `localhost:3306/edutrack_db`, UUID `<LOCAL_SERVER_UUID>`. Các phiên audit dùng transaction READ ONLY. Tất cả mutation của kiểm thử chạy trên `127.0.0.1:33307/edutrack_grade_management`, UUID riêng `<ISOLATED_TEST_SERVER_UUID>`.

Snapshot ban đầu của task được chụp lúc khoảng 09:18. **Có hoạt động bên ngoài bài kiểm thử trên database chính trong thời gian làm task**; snapshot lúc 09:26:54 khác snapshot đầu ở:

| Bảng | Đầu task | Trước nạp Backend |
| --- | ---: | ---: |
| approval_requests | 7 | 11 |
| class_sessions | 5 | 10 |
| notifications | 15 | 19 |
| teacher_classes | 5 | 5, nhưng có giá trị thay đổi |

Không suy đoán nội dung thay đổi hoặc hoàn nguyên chúng. Vì vậy không tuyên bố toàn database bất biến suốt task. Grade, Class, Student, TA, Subject, Invoice và Payment khớp fingerprint đầu task; khác biệt Teacher/Schedule được ghi nhận như trên.

Đối chiếu ngay trước nạp Backend (09:26:54), sau nạp (09:28:06) và sau UI chỉ đọc (09:29:20): **25/25 bảng có cùng số dòng và SHA-256 trên tất cả cột, metadata bảng/cột/index/FK/stored object giống nhau, migration history vẫn 6 dòng**. Grade vẫn 12 bản ghi; Class vẫn 3 bản ghi, không tự đổi Grade; users 11, student_classes 5, teacher_classes 5, ta_classes 3, class_schedules 4, class_sessions 10, tuition_invoices 11, payment 9. Runtime DbSeeder không tạo thêm dữ liệu khi khởi động lại trong trạng thái đã kiểm tra.

Migration Task 02 gốc vẫn giữ SHA-256:

```text
2f4f1371e913ed1e1224d3d4e7f2a163c0cd9885b4f25530482c5578fa117dd4
```

Đã tạo logical dump mới để dựng môi trường test: 55.040 byte, SHA-256 `c2592615d1d5b0f2794825b32f96314265a99970018c1988854b4ebe281ba61a`. Dump này phản ánh đầu task, **không chứa các phát sinh bên ngoài sau đó**, không dùng nó để tự restore database chính.

Bằng chứng ở thư mục đã Git ignore:

```text
Capstone2/db/backups/grade-management-20261107-021801/
  management-main-before.json
  management-before-restart.json
  management-after-restart.json
  management-main-final.json
  main-final-verification.json
  restart-verification.json
  edutrack_db.before-grade.sql
  backup-manifest.json
  grade-management-api-results.json
  live-browser/results.json
  production-browser/results.json
  main-api-restart.json
  main-api.stdout.log
  main-api.stderr.log
```

Backend local đang dùng assembly build đã kiểm thử; mã nguồn đã cập nhật để các lần build/run tiếp theo có cùng tính năng. Không thay đổi Add Student, Tuition Management, Dashboard, Reports hoặc cơ chế xác thực. Những mục còn chờ: status/deactivation cần phê duyệt schema và triển khai đồng bộ; unique-name index nếu muốn bảo vệ cả luồng SQL ngoài API; chính sách phân quyền server thuộc phần phối hợp Auth.

## Kiểm thử thủ công

1. Mở `http://localhost:5173/center-manager/grades`, tải lại trang nếu đang giữ tab cũ. Thêm một Grade thử với tên riêng, đổi tên và kiểm tra tìm kiếm/sắp xếp.
2. Tải lại Create/Edit Class của Center Manager và Admin Staff: tên Grade mới phải xuất hiện; Class vẫn chỉ chọn một Subject. Không tự gán Grade cho lớp cũ.
3. Dùng liên kết xem lớp và kiểm tra cả Theo khối lớp/Tất cả lớp. Nếu chủ động tạo Class thử liên kết Grade, thử xóa Grade phải bị chặn.
4. Grade không có Class có thể xóa sau xác nhận. Grade có lịch sử liên kết phải giữ lại. Chưa có nút ngừng sử dụng/kích hoạt vì trạng thái chưa được triển khai.

Các thao tác lưu/xóa khi kiểm thử thủ công sẽ ghi dữ liệu thật vào database phát triển hiện tại; toàn bộ kiểm thử tự động có mutation trước đó đã được giới hạn ở database test riêng.
