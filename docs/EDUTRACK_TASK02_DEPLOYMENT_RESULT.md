# Task 02 — Grade Migration đã triển khai thành công

> Bản dùng để đưa lên repository đã ẩn định danh máy local; bản đầy đủ được giữ trong bằng chứng local đã Git ignore.

Ngày **07/11/2026**, múi giờ **Asia/Bangkok (UTC+7)**.

**Đã triển khai thành công lên `localhost:3306/edutrack_db`. Backend đã chạy lại; có thể bắt đầu kiểm thử thủ công.**
Lần thực thi lại được người dùng phê duyệt riêng đã chạy đúng **một lần**, sau khi sửa duy nhất phần truyền UTF-8.
Không commit, push, merge hoặc thay đổi module ứng dụng khác.

## 1. File SQL và sửa lỗi truyền UTF-8

Giữ nguyên file `Capstone2/db/migrations/AddGradeClassification.review.sql`, SHA-256:

```text
2f4f1371e913ed1e1224d3d4e7f2a163c0cd9885b4f25530482c5578fa117dd4
```

Công cụ thực thi đã sửa theo đúng yêu cầu:

- Decode bằng UTF-8 strict, tiêu thụ đúng một BOM của file khi đọc raw bytes.
- `StandardInputEncoding = new UTF8Encoding(false, true)` không phát sinh BOM khi gửi stdin.
- Payload bắt đầu chính xác bằng `START TRANSACTION;`, không chứa U+FEFF.
- Đối chiếu từng byte: payload bằng nguyên nội dung file được duyệt sau chữ ký encoding; câu SQL không đổi.
- Giữ kiểm tra đích/backup/bảo trì và marker một lần, mysql client `--skip-reconnect`, dừng khi lỗi.

Bằng chứng transport:

```text
fileBomConsumed: 1
payloadBomCount: 0
payloadPrefix: START TRANSACTION;
firstBytes: 5354415254205452414E53414354494F4E3B
payloadSha256: aed1277b6bb5ffda1d774b820853500526920889bdd33faadacfda86eaac32f4
```

Hash payload khác hash file vì không chứa chữ ký BOM; nội dung câu SQL được kiểm tra byte-for-byte là không đổi.
Lỗi lần đầu được giữ trong [báo cáo lưu vết](EDUTRACK_TASK02_DEPLOYMENT_ATTEMPT01_FAILURE.md).
Lần đầu dừng trước thay đổi schema; lần được phê duyệt lại này thành công và không có lần gửi lại tiếp theo.

## 2. Kiểm tra trước lần thực thi lại

Lúc **08:49:51–08:49:52**:

| Điều kiện | Kết quả |
| --- | --- |
| Server/database | `localhost:3306/edutrack_db` |
| Hostname / MySQL | `<LOCAL_MYSQL_HOST>` / `8.0.44` |
| Server UUID | `<LOCAL_SERVER_UUID>` |
| Backend 5036 | Vẫn dừng trước migration |
| Transaction ghi / kết nối database khác | Không được ghi nhận |
| Ghi trên các bảng nguồn kể từ lần lỗi | Bộ đếm INSERT/UPDATE/DELETE không tăng |
| Schema/dữ liệu | 24/24 bảng khớp snapshot sau lần lỗi, gồm fingerprint toàn bộ cột gốc |
| Grade schema / history | Chưa có bảng/cột/index/FK Grade; history có 5 dòng |
| Backup local/Desktop | Còn nguyên vẹn, đúng hash |

Backup đã được người dùng chấp nhận cho môi trường Capstone:

```text
Capstone2/db/backups/grade-preflight-maintenance-20261107-012618/edutrack_db.before-grade.sql
%USERPROFILE%/Desktop/EduTrack-Grade-Preflight-20261107-082620/edutrack_db.before-grade.sql
SHA-256: 61138b3565f9cbbd9f8f759e72e077e1f95d120f6c6a1e3c889bd9f35d2236b5
```

Bản dump đã restore-test trước đó cũng giữ đúng hash. Backup hiện tại giống nội dung bản đã khôi phục thành công,
ngoại trừ comment thời điểm hoàn tất dump. Không thực hiện restore lên database chính.

## 3. Thực thi và thay đổi chính xác

- Bắt đầu: **08:50:14**.
- Thành công: **08:50:15**, khoảng **742 ms**.
- Đúng một lần thực thi cho lần phê duyệt lại này; không tự retry hoặc restore.

Các thay đổi đã áp dụng:

1. Tạo bảng `grades`: `grade_id INT` làm PK, `grade_name VARCHAR(50)`.
2. Thêm đúng 12 dòng Khối 1–12.
3. Thêm `classes.grade_id INT NULL`.
4. Thêm index `IX_classes_grade_id`.
5. Thêm FK `FK_classes_grades_grade_id`, `ON DELETE RESTRICT`.
6. Thêm một dòng `20261107002822_AddGradeClassification`, ProductVersion `8.0.8`, vào EF migration history.

Không áp dụng migration khác. Không UPDATE/DELETE/backfill Class cũ, không sửa ID, học phí hoặc FK/index cũ.

## 4. Postflight đầy đủ trước khi khởi động Backend

Đã chạy toàn bộ file `AddGradeClassification.postflight.readonly.sql` và các kiểm tra độc lập:

- Đúng 12 Grade; ID 1–12, tên tiếng Việt đúng.
- Đủ 3 Class cũ, cả 3 vẫn `grade_id = NULL`; không có Grade mồ côi.
- Cột Grade nullable đúng kiểu, index và FK RESTRICT đúng.
- Các cột/index/FK/stored object cũ giữ nguyên; chỉ có các đối tượng schema Grade đã duyệt được thêm.
- Giữ cả 5 dòng EF history cũ, thêm đúng một dòng migration mới, tổng **6**.
- **23/23 bảng nghiệp vụ** giữ nguyên số dòng và SHA-256 trên toàn bộ các cột gốc.
- Không có orphan mới ở StudentClass–Class, Invoice–Class, Payment–Invoice.

| Bảng quan trọng | Trước / sau migration |
| --- | ---: |
| classes | 3 / 3 |
| subjects | 4 / 4 |
| users | 11 / 11 |
| student_classes | 5 / 5 |
| teacher_classes | 4 / 4 |
| ta_classes | 3 / 3 |
| class_schedules | 4 / 4 |
| class_sessions | 5 / 5 |
| tuition_invoices | 11 / 11 |
| payment | 9 / 9 |

Các bảng Attendance, Assignment, Submission, AiEvaluation, ProgressNote, ApprovalRequest, Notification và
NotificationRecipient cũng nằm trong đối chiếu fingerprint đầy đủ, không chỉ bảng ở danh sách trên.

Sau khi khởi động Backend và kiểm tra UI, đã đọc lại database lúc **08:56:16**:
**cả 25 bảng hiện tại** (gồm Grade và history sau migration) giữ đúng fingerprint so với thời điểm ngay sau migration.
Không phát hiện thay đổi dữ liệu gốc hoặc lịch sử do startup/runtime/kiểm thử giao diện.

## 5. Backend và API

Chỉ khởi động sau khi toàn bộ postflight đạt:

| Thành phần | Trạng thái |
| --- | --- |
| Backend build | Thành công |
| Backend | `http://localhost:5036`, PID **23668** |
| Khởi động | **08:51:36**, môi trường Development |
| Frontend Vite | `http://localhost:5173`, giữ server hiện có |

**16 request kiểm tra GET đều HTTP 200**, gồm:

- `/api/grades`: đủ 12 Grade.
- `/api/classes`: đủ 3 Class cũ, Grade NULL.
- `/api/subjects`: đủ 4 môn.
- GET chi tiết từng Class cũ: đúng ID, Subject và học phí.
- StudentClasses, TeacherClasses, TaClasses, ClassSchedules, ClassSessions, TuitionInvoices, Payments:
  dữ liệu và số dòng khớp baseline.
- Grades/Classes/Subjects qua proxy `localhost:5173/api/...`: đều thành công.

Không gửi POST/PUT/DELETE thử nghiệm vào database chính.

## 6. Class Management trên giao diện thật

Kiểm tra trực tiếp frontend đang chạy tại `localhost:5173`, dùng Backend và MySQL chính đã migration:

- Center Manager và Admin Staff.
- Desktop 1440×1000, tablet 768×1024 và mobile 390×844.
- **6/6 trường hợp vai trò × viewport đạt**; ghi nhận **126 phản hồi API HTTP 200**, không có lỗi JavaScript.
- Hai chế độ **Theo khối lớp / Tất cả lớp** hoạt động; mở/thu nhóm được.
- Ba Class cũ hiển thị **Chưa phân loại** ở cả bảng, nhóm, form Edit và Details.
- Chọn Grade 7 chưa có lớp cho kết quả rỗng đúng; chọn Chưa phân loại trả đủ 3 lớp.
- Form Create tải đủ 12 Grade thật và bắt buộc chọn Grade; Subject vẫn single-select.
- Mở/đóng form Create/Edit và kiểm tra responsive; không lưu thay đổi vào các lớp thật.
- Details giữ bốn tab Overview, Subjects, Students, Schedule.

Browser test chặn mọi yêu cầu ghi vào API; không có yêu cầu ghi nào phát sinh. Không dùng fixture thay dữ liệu API.
Tài nguyên CSS/CDN ngoài được cô lập trong trình duyệt kiểm thử; font/icon CDN không nằm trong kết luận kiểm thử này.

## 7. Lỗi/cảnh báo còn lại và phạm vi kiểm chứng

- Lỗi gửi UTF-8 BOM đã được xử lý; không còn lỗi 1064 trong lần thực thi được duyệt lại.
- Không còn HTTP 500 trên các API và luồng Class Management đã kiểm tra.
- Backend ghi cảnh báo `Failed to determine the https port for redirect` do môi trường Development đang chạy
  HTTP cổng 5036. Các API HTTP vẫn 200; chưa thay cấu hình HTTPS ngoài phạm vi task.
- CRUD ghi dữ liệu đã được kiểm thử trên bản sao ở báo cáo trước. Sau triển khai chính, kiểm tra tự động chỉ đọc;
  người dùng có thể bắt đầu kiểm thử thủ công bằng một lớp thử nghiệm mới.
- Kết luận giữ nguyên dữ liệu được xác nhận tới snapshot **08:56:16**; các thay đổi người dùng thực hiện sau bàn giao
  sẽ là hoạt động nghiệp vụ mới.

## 8. Bằng chứng và file báo cáo

Thư mục local được Git ignore:

```text
Capstone2/db/backups/grade-deployment-retry-20261107-014948/
  transport-verification.json
  retry-observation-before.json
  deployment-before.json
  executed-approved-migration.sql
  migration-attempt.json
  migration.stdout.log
  postflight.readonly.output.txt
  postflight-core-checks.json
  deployment-after.json
  postflight-verification.json
  verify-postflight.mjs
  backend-restart.json
  backend.stdout.log
  backend.stderr.log
  production-api-results.json
  production-readonly-api.mjs
  production-browser-readonly.mjs
  production-browser/results.json
  production-browser/*-groups.png
  deployment-after-runtime-ui.json
  deployment-final-summary.json
  fixed-execution-runner.cs
```

Source ứng dụng và file SQL không bị sửa trong lần triển khai lại này. Phần sửa UTF-8 nằm trong công cụ thực thi;
bản chụp công cụ và bằng chứng được lưu riêng. Các file Markdown liên quan được cập nhật trạng thái mới nhất.

## 9. Bàn giao kiểm thử thủ công

Hai trang đang hoạt động:

- `http://localhost:5173/center-manager/classes`
- `http://localhost:5173/admin-staff/classes`

Tải lại trang trình duyệt đang mở. Hiện đúng theo yêu cầu, ba lớp cũ đều nằm trong nhóm **Chưa phân loại**;
nhóm Khối 1–12 chỉ xuất hiện khi có Class được gán Grade rõ ràng.

Có thể dùng một lớp thử nghiệm mới để kiểm tra Create, đổi Grade, hai chế độ xem, Details và Delete khi lớp còn rỗng.
Với lớp có lịch sử, kiểm tra thông báo từ chối xóa và thao tác chuyển Inactive/Completed theo quy tắc đã triển khai.

**Đã hoàn tất triển khai và có thể bắt đầu kiểm thử thủ công. Backend được giữ chạy. Không commit/push/merge.**
