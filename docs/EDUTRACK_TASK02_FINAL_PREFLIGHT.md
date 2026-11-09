# Task 02 — Preflight cuối cùng, chờ phê duyệt triển khai

> Bản dùng để đưa lên repository đã ẩn định danh máy local; bản đầy đủ được giữ trong bằng chứng local đã Git ignore.

Ngày **07/11/2026**, giờ **Asia/Bangkok (UTC+7)**.

**Cập nhật sau preflight:** người dùng đã phê duyệt, chấp nhận backup local/Desktop và cho phép một lần thực thi lại
sau lỗi truyền UTF-8. Lần thực thi lại đã thành công lúc 08:50:15; postflight đạt, Backend đã chạy lại và API/UI hoạt động.
Xem [kết quả triển khai hiện tại](EDUTRACK_TASK02_DEPLOYMENT_RESULT.md).
Nội dung dưới đây là snapshot lịch sử trước triển khai.

**Chưa áp dụng migration lên `edutrack_db`. Chưa thực hiện DDL/DML, commit hoặc push.**
Backend đã được tạm dừng theo sự cho phép riêng của người dùng để kiểm tra trong cửa sổ bảo trì.

**Kết luận:** hash, đích kết nối, dữ liệu/schema và backup local đạt các kiểm tra dưới đây. Bản trên Desktop
đã được sao chép và kiểm tra hash theo lựa chọn mới của người dùng. **Desktop vẫn nằm trên máy hiện tại;
điều kiện bản sao ngoài máy trong yêu cầu ban đầu chưa được đáp ứng.** Dừng tại báo cáo để chờ quyết định cuối cùng.

## 1. SHA-256 của đúng file sẽ triển khai

File: `Capstone2/db/migrations/AddGradeClassification.review.sql`.

```text
2f4f1371e913ed1e1224d3d4e7f2a163c0cd9885b4f25530482c5578fa117dd4
```

Đã đối chiếu đồng thời với:

- Hash trong báo cáo kiểm thử trước.
- Bản SQL được lưu cùng backup và bằng chứng kiểm thử trước.
- File SQL thực tế hiện tại trong workspace.

Ba giá trị trùng nhau; file migration không bị sửa trong lần preflight này.

## 2. Bảo trì và hoạt động ghi dữ liệu

Người dùng đã cho phép tạm dừng Backend và xác nhận sẽ dừng các kết nối ghi MySQL khác.

- Đã xác minh đúng tiến trình `EduTrack.API`, PID **24956**, đường dẫn
  `Capstone2/backend/bin/Debug/net8.0/EduTrack.API.exe`, đang nghe cổng **5036** trước khi dừng.
- Backend đã dừng lúc **08:25:44**. Kiểm tra lại sau preflight: cổng 5036 không có listener.
- MySQL chính cổng **3306**, PID **7092**, tiếp tục hoạt động; không restart MySQL.
- Khoảng quan sát trong bảo trì: **08:26:19–08:28:01**.
- 12 bộ đếm DML/DDL trong `events_statements_summary_global_by_event_name` đều tăng **0**:
  INSERT/INSERT SELECT, UPDATE/UPDATE MULTI, DELETE/DELETE MULTI, REPLACE/REPLACE SELECT,
  ALTER TABLE, CREATE TABLE, DROP TABLE, TRUNCATE.
- Bộ đếm ghi của cả **24 bảng `edutrack_db`** trong `table_io_waits_summary_by_table` đều tăng **0**.
  Instrument `wait/io/table/sql/handler` đang enabled.
- Không có transaction ghi hoặc kết nối khác vào `edutrack_db` được ghi nhận ở hai đầu khoảng quan sát.
- Fingerprint dữ liệu trước/sau khoảng bảo trì khớp toàn bộ 24 bảng.

Phương pháp đọc bộ đếm statement dựa trên
[MySQL Statement Summary Tables](https://dev.mysql.com/doc/refman/8.0/en/performance-schema-statement-summary-tables.html).
`Com_xxx` không được lấy từ bảng status của Performance Schema vì các bảng đó không thu thập nhóm này;
tham khảo [MySQL Status Variable Tables](https://dev.mysql.com/doc/refman/8.0/en/performance-schema-status-variable-tables.html).

**Giới hạn:** đây là xác nhận không ghi nhận hoạt động ghi trong khoảng quan sát, cùng việc đã dừng Backend.
Server vẫn có `read_only=0`, `super_read_only=0`; không thiết lập chặn ghi toàn server. Event scheduler đang ON,
nhưng metadata của `edutrack_db` không có event. Kết nối mới hoặc công cụ khác vẫn có thể ghi nếu người vận hành
mở lại chúng. Phải duy trì bảo trì và kiểm tra lại ngay trước một lần triển khai được duyệt.

Backend được giữ ở trạng thái dừng trong lúc chờ quyết định; chưa tự khởi động lại.

## 3. Backup mới sau khi dừng Backend

Thời điểm tạo: **08:26:20 ngày 07/11/2026**.

```text
Capstone2/db/backups/grade-preflight-maintenance-20261107-012618/
  edutrack_db.before-grade.sql
```

| Thuộc tính | Giá trị |
| --- | --- |
| Dung lượng | 52.825 byte |
| SHA-256 | `61138b3565f9cbbd9f8f759e72e077e1f95d120f6c6a1e3c889bd9f35d2236b5` |
| Phạm vi | Full logical backup của `edutrack_db`: schema/data/routines/events/triggers |
| Thời điểm | Sau khi Backend đã dừng và trong khoảng quan sát không có ghi |
| Bảo vệ trong repo | Thư mục backup được `.gitignore` loại trừ |

Theo lựa chọn **“desktop đi bạn”**, đã tạo thêm bản tại:

```text
%USERPROFILE%/Desktop/EduTrack-Grade-Preflight-20261107-082620/
  edutrack_db.before-grade.sql
  backup-manifest.json
  AddGradeClassification.review.sql
  desktop-backup-receipt.json
```

Đã đọc lại bản Desktop lúc **08:26:55**: dung lượng và SHA-256 trùng bản nguồn.
Đường dẫn Desktop là thư mục local trên ổ C:, không phải UNC và không có link/redirect được ghi nhận.
**Chưa có bản trên NAS/server/cloud hoặc thiết bị ngoài máy đã được xác minh.**

Đã so toàn bộ nội dung dump mới với dump đã khôi phục thành công trong lần kiểm thử trước:
chỉ khác comment thời điểm hoàn tất backup; nội dung SQL còn lại giống hệt.
Lần preflight này **không chạy lại restore của file mới**. Bằng chứng restore/API/UI trước được giữ trong
[báo cáo kiểm thử database](EDUTRACK_TASK02_DATABASE_SAFETY_REVIEW.md).

Để đáp ứng đầy đủ điều kiện ngoài máy ban đầu, cần đích lưu được người dùng xác nhận và thao tác sao chép,
sau đó đọc lại bản đích để kiểm tra hash. Bản Desktop không được ghi nhận là bản ngoài máy.

## 4. Kiểm tra lại đúng đích và điều kiện trước migration

| Thuộc tính | Kết quả |
| --- | --- |
| Đích cấu hình và kết nối kiểm tra | `localhost:3306/edutrack_db` |
| Hostname | `<LOCAL_MYSQL_HOST>` |
| Server UUID | `<LOCAL_SERVER_UUID>` |
| MySQL / Server ID | `8.0.44` / `1` |
| Data directory | `C:/ProgramData/MySQL/MySQL Server 8.0/Data/` |
| Engine / charset / collation mặc định | InnoDB / utf8mb4 / utf8mb4_0900_ai_ci |
| `grades` | Chưa tồn tại |
| `classes.grade_id` | Chưa tồn tại |
| `IX_classes_grade_id` | Chưa tồn tại |
| `FK_classes_grades_grade_id` | Chưa tồn tại |
| Migration mới | Chưa có trong history |
| Migration history | 5 dòng; cuối cùng `20261102045221_AddNotificationRecipientDeletedAt` |

Các phiên kiểm tra dùng transaction READ ONLY, server xác nhận `@@transaction_read_only=1`.
Không chạy `database update`, SQL migration hoặc câu lệnh sửa dữ liệu/schema lên đích này.

## 5. So sánh schema và dữ liệu với thời điểm đã thử nghiệm

Đã đối chiếu số dòng và SHA-256 trên toàn bộ các cột của **24/24 bảng** với snapshot database chính
được dùng để tạo bản sao kiểm thử. Metadata bảng, cột, index, FK và stored object cũng khớp.
Không có khác biệt được phát hiện về ID, học phí, trạng thái, quan hệ, hóa đơn hoặc thanh toán.

| Bảng quan trọng | Số dòng giữ nguyên |
| --- | ---: |
| classes | 3 |
| subjects | 4 |
| users | 11 |
| student_classes | 5 |
| teacher_classes | 4 |
| ta_classes | 3 |
| class_schedules | 4 |
| class_sessions | 5 |
| tuition_invoices | 11 |
| payment | 9 |

Snapshot cuối được đọc lúc **08:28:01**. Kết quả này có thời điểm xác định; mọi thao tác ghi mới hoặc thay đổi
schema sau đó yêu cầu kiểm tra lại baseline và độ mới của backup.

## 6. Danh sách kiểm tra ngay sau migration — đã chuẩn bị, chưa chạy

File truy vấn:
[AddGradeClassification.postflight.readonly.sql](../Capstone2/db/migrations/AddGradeClassification.postflight.readonly.sql).

File gồm 20 câu truy vấn/điều khiển transaction chỉ đọc; đã kiểm tra không có lệnh mutation.
Chỉ sử dụng sau khi migration được phê duyệt và thực hiện, trước khi mở lại luồng ghi:

1. Kiểm tra `DATABASE()`, hostname, port, UUID, phiên bản và `foreign_key_checks`.
   Nếu sai đích, dừng đánh giá kết quả còn lại.
2. Kiểm tra metadata cột, `SHOW CREATE TABLE classes/grades`; Grade nullable, kiểu ID/học phí cũ không đổi.
3. Xác nhận đúng 12 Grade, ID và tên; 3 Class cũ vẫn có Grade NULL, không có tham chiếu Grade mồ côi.
4. Kiểm tra index và FK mới với DELETE RESTRICT; đối chiếu metadata FK/index cũ với preflight.
5. History có đúng một dòng migration mới, tổng 6 dòng.
6. Đối chiếu số dòng của cả 23 bảng nghiệp vụ, các giá trị Class gốc và tổng hóa đơn/thanh toán.
7. Đọc lại và so fingerprint toàn bộ cột gốc với `preflight-before.json`; riêng history có thêm dòng đã duyệt.
   Số dòng/tổng tiền bằng nhau chưa đủ để thay thế đối chiếu fingerprint.
8. Kiểm tra quan hệ học sinh–lớp, hóa đơn–lớp, thanh toán–hóa đơn không có orphan mới.

Sau khi được phép khởi động lại Backend, các kiểm tra API **GET** cần thực hiện:

```powershell
$gradePostflightUrls = @(
  'http://localhost:5036/api/grades',
  'http://localhost:5036/api/classes',
  'http://localhost:5036/api/subjects'
)
foreach ($gradePostflightUrl in $gradePostflightUrls) {
  $gradePostflightResponse = Invoke-WebRequest -Uri $gradePostflightUrl -UseBasicParsing -TimeoutSec 15
  [pscustomobject]@{Url=$gradePostflightUrl;Status=$gradePostflightResponse.StatusCode}
}
```

Kiểm tra tiếp GET `/api/classes/{ID-cũ-thực-tế}`, hai trang quản lý lớp, nhóm Chưa phân loại, filter và Details.
Việc khởi động lại Backend có runtime DbSeeder nên phải nằm trong phương án triển khai được cho phép;
không khởi động lại để chạy các GET trên trong lần preflight này. Chưa gửi POST/PUT/DELETE thử lên database chính.

## 7. Kế hoạch xử lý nếu migration lỗi giữa chừng

1. Giữ Backend và các nguồn ghi dừng. Lưu lỗi, thời điểm và stdout/stderr của công cụ migration.
2. Đọc metadata cột/bảng/index/FK và history để xác định câu cuối đã hoàn tất. MySQL DDL tự commit;
   không dựa vào ROLLBACK toàn file. Không tự chạy lại script hoặc EF Down.
3. Đọc lại số dòng/fingerprint của 24 bảng gốc, so với backup và preflight. Không xóa lịch sử để chữa lỗi.
4. Lập phương án cụ thể để người dùng duyệt: tiếp tục các bước còn thiếu sau khi đối chiếu chính xác,
   hoặc khôi phục bản backup mới có SHA-256 ở mục 3 vào một database mới trên môi trường riêng.
5. Với phương án khôi phục, kiểm tra đủ schema/số dòng/fingerprint trước khi đề xuất chuyển cấu hình
   ứng dụng hoặc thao tác lên database chính. Kế hoạch restore trên bản sao đã được diễn tập ở báo cáo trước.
6. Nếu có ghi sau backup, xác định và xử lý phần phát sinh trước khi quay về bản khôi phục;
   khả năng PITR/binlog chưa được xác minh. Không tự ghi đè database chính bằng dump.
7. Chỉ mở lại ứng dụng sau khi kiểm tra SQL, dữ liệu và GET API đạt, và được phép kết thúc bảo trì.

Mọi lệnh sửa schema/dữ liệu, phục hồi hoặc khởi động lại ứng dụng đều chờ sự đồng ý rõ ràng tương ứng.

## 8. Bằng chứng local và trạng thái chờ duyệt

```text
Capstone2/db/backups/grade-preflight-maintenance-20261107-012618/
  backup-manifest.json
  desktop-backup-receipt.json
  maintenance-backend-stop.json
  maintenance-observation-start.json
  maintenance-observation-end.json
  maintenance-observation-summary.json
  preflight-before.json
  preflight-before.queries.sql
  preflight-final.json
  preflight-final.queries.sql
  preflight-comparison.json
  preflight-comparison-final.json
  preflight-readiness.json
  final-data-backup-verification.json
  edutrack_db.before-grade.sql
  AddGradeClassification.review.sql
  AddGradeClassification.postflight.readonly.sql
```

Các bước trước khi dừng Backend, gồm backup 08:19, còn được lưu riêng trong thư mục
`grade-preflight-20261107-011839`; bản ở mục 3 là bản mới nhất và được tạo sau khi dừng Backend.

Không có thông tin đăng nhập/mật khẩu trong báo cáo. Backup và bằng chứng thực tế ở thư mục Git ignore.
Lần này chỉ thêm file postflight SQL chỉ đọc và báo cáo; file migration đã kiểm thử không đổi.

**Dừng chờ phê duyệt cuối cùng. Backend đang tạm dừng. Database chính vẫn chưa có schema Grade.**
Điều kiện bản sao ngoài máy ban đầu còn thiếu; bản Desktop đã được hoàn thành theo lựa chọn của người dùng.
