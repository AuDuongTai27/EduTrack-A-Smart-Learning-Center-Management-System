# Task 02 — Review an toàn database và kết quả kiểm thử migration

> Bản dùng để đưa lên repository đã ẩn định danh máy local; bản đầy đủ được giữ trong bằng chứng local đã Git ignore.

Ngày kiểm tra: **07/11/2026**, múi giờ **Asia/Bangkok (UTC+7)**.

Cập nhật sau báo cáo này: Grade Migration đã được áp dụng thành công sau phê duyệt và một lần chạy lại được duyệt riêng.
Postflight/API/UI đạt, Backend đang chạy. Xem [kết quả triển khai hiện tại](EDUTRACK_TASK02_DEPLOYMENT_RESULT.md)
và [snapshot preflight lịch sử](EDUTRACK_TASK02_FINAL_PREFLIGHT.md). Nội dung dưới đây ghi nhận giai đoạn review trước triển khai.

**Database chính `localhost:3306/edutrack_db` chưa được áp dụng migration.** Mọi SQL thay đổi schema/dữ liệu
và CRUD thử nghiệm trong báo cáo này chỉ chạy trên MySQL riêng ở cổng **33307**.
Không commit, push, restart Backend chính hoặc thay connection string của ứng dụng chính.

## 1. Database chính — kiểm tra READ ONLY

| Thuộc tính | Kết quả server trả về |
| --- | --- |
| Host cấu hình | `localhost` |
| Hostname server | `<LOCAL_MYSQL_HOST>` |
| Cổng | `3306` |
| Database đang chọn | `edutrack_db` |
| MySQL | `8.0.44` |
| Server UUID | `<LOCAL_SERVER_UUID>` |
| Server ID | `1` |
| Data directory | `C:/ProgramData/MySQL/MySQL Server 8.0/Data/` |
| Engine mặc định / bảng hiện có | InnoDB / cả 24 bảng là InnoDB |
| Charset / collation mặc định | `utf8mb4` / `utf8mb4_0900_ai_ci` |
| `grades` | Chưa tồn tại |
| `classes.grade_id` | Chưa tồn tại |
| Migration history | 5 dòng, cuối cùng `20261102045221_AddNotificationRecipientDeletedAt` |

Đối chiếu cấu hình `appsettings.json`, cấu hình Development và thông tin do MySQL trả về. Không in password
hoặc connection string có mật khẩu vào log/báo cáo. Phiên audit dùng transaction **READ ONLY**, server xác nhận
`@@transaction_read_only = 1`; truy vấn metadata, COUNT và fingerprint, kết thúc bằng ROLLBACK.

Snapshot đầu ghi nhận lúc **07:52:47**; đối chiếu lại database chính lúc **08:01:39**.

| Bảng yêu cầu | Database chính trước | Bản khôi phục test | Test sau migration | Database chính đối chiếu lại |
| --- | ---: | ---: | ---: | ---: |
| `classes` | 3 | 3 | 3 | 3 |
| `subjects` | 4 | 4 | 4 | 4 |
| `users` | 11 | 11 | 11 | 11 |
| `student_classes` | 5 | 5 | 5 | 5 |
| `teacher_classes` | 4 | 4 | 4 | 4 |
| `ta_classes` | 3 | 3 | 3 | 3 |
| `class_schedules` | 4 | 4 | 4 | 4 |
| `class_sessions` | 5 | 5 | 5 | 5 |
| `tuition_invoices` | 11 | 11 | 11 | 11 |
| `payment` — tên bảng thực tế của Payments | 9 | 9 | 9 | 9 |

Không chỉ so số dòng: SHA-256 trên toàn bộ các cột gốc của **tất cả 24 bảng**, cùng metadata cột/index/FK,
được đối chiếu giữa hai snapshot database chính và đều khớp. Không phát hiện thay đổi dữ liệu/schema trong
khoảng kiểm tra đó. Truy vấn chỉ đọc và kết quả chi tiết lưu trong bộ bằng chứng local ở mục 7.

## 2. Review toàn bộ SQL migration

File đã đọc và thử nghiệm nguyên bản:
[AddGradeClassification.review.sql](../Capstone2/db/migrations/AddGradeClassification.review.sql).

SHA-256 của file:

```text
2f4f1371e913ed1e1224d3d4e7f2a163c0cd9885b4f25530482c5578fa117dd4
```

| Câu lệnh, theo đúng thứ tự | Tác động và kết luận |
| --- | --- |
| `START TRANSACTION` | Mở transaction; không làm toàn bộ DDL thành một giao dịch có thể rollback. |
| `ALTER TABLE classes ADD grade_id int NULL` | Thêm đúng một cột INT nullable. Không DEFAULT, UPDATE hay đọc tên lớp/môn để phân loại. Lớp cũ nhận NULL. |
| `CREATE TABLE grades (...)` | Tạo `grade_id INT NOT NULL` làm PK, `grade_name VARCHAR(50) NOT NULL`, charset utf8mb4. Không sửa bảng môn/học sinh/học phí. Trên server đang kiểm tra, engine kế thừa InnoDB. |
| `INSERT INTO grades ...` | Thêm đúng 12 dòng danh mục Khối 1–12. Không INSERT/UPDATE vào Class cũ. |
| `CREATE INDEX IX_classes_grade_id ON classes(grade_id)` | Thêm index riêng cho FK/lọc khối, không thay index cũ hoặc ID. |
| `ALTER TABLE classes ADD CONSTRAINT FK_classes_grades_grade_id ... ON DELETE RESTRICT` | Thêm quan hệ tùy chọn tới Grade. Giá trị NULL của lớp cũ hợp lệ. Xóa Grade đang được dùng bị chặn. Không sửa FK cũ. |
| `INSERT INTO __EFMigrationsHistory ...` | Ghi một dòng đánh dấu migration sau các thay đổi schema. Dòng này chưa tồn tại ở database chính. |
| `COMMIT` | Kết thúc transaction còn lại; không cung cấp cơ chế rollback cho các DDL đã tự commit. |

Kết luận về nội dung file:

- Không có `DROP TABLE`, `TRUNCATE`, `DELETE` dữ liệu hay `UPDATE`. Cụm `ON DELETE RESTRICT` là quy tắc FK,
  không phải câu DELETE.
- Không tự phân loại Class cũ, không suy đoán từ ClassName/SubjectName.
- Không đổi ID, tuition_fee, SubjectId hoặc các quan hệ Teacher/TA/Student/Schedule hiện có.
- Không thực thi SQL lên `tuition_invoices`, `payment` hoặc các bảng lịch sử.
- Các đối tượng nghiệp vụ được thay đổi chính xác là **bảng `grades` mới**, **cột/index/FK mới của `classes`**;
  ngoài ra **thêm một dòng vào `__EFMigrationsHistory`**.
- File không idempotent: chạy lại sau khi đã thành công hoặc sau lỗi dở dang có thể gặp trùng cột/bảng/index/history.

### Kiểm tra điều kiện FK/index với dữ liệu thực tế

Đã xác minh trên metadata hiện tại: bảng `classes` là InnoDB; chưa có cột Grade, bảng Grade, index
`IX_classes_grade_id` hay constraint `FK_classes_grades_grade_id`; migration history có đúng tiền nhiệm.
INT mới và PK Grade cùng kiểu; PK Grade là khóa được tham chiếu; NULL không tạo orphan cho lớp cũ.

Trên bản sao khôi phục từ database chính, toàn bộ file chạy thành công, bao gồm CREATE INDEX và ADD FK.
Metadata của mọi cột/index/FK cũ và AUTO_INCREMENT tại thời điểm migration đều được giữ nguyên.
Hai phép thử trực tiếp trên MySQL test cũng đạt:

- Gán `grade_id = 99` không tồn tại bị từ chối với lỗi MySQL **1452**.
- Xóa Grade 7 đang được Class test tham chiếu bị từ chối với lỗi **1451**.

Các phép thử lỗi được bao trong transaction test; không sửa dữ liệu đã có khi bị từ chối.

### Rủi ro lỗi giữa chừng

MySQL tự commit các lệnh `ALTER TABLE`, `CREATE TABLE`, `CREATE INDEX`; ROLLBACK không hoàn tác toàn bộ
những lệnh đó. Điều này đã được đối chiếu với [tài liệu MySQL về implicit commit](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html)
và kiểm chứng bằng diễn tập ở mục 5.

Vì vậy **không kết luận “không có rủi ro”** chỉ vì migration có START TRANSACTION/COMMIT.
Rủi ro vận hành còn có metadata lock, thiếu quyền/dung lượng, DDL đồng thời, cấu hình engine thay đổi,
hoặc script bị chạy lặp. Không có câu SQL xóa dữ liệu trong migration, nhưng khôi phục sai đích hoặc dùng backup
cũ sau khi có giao dịch mới vẫn có thể làm mất dữ liệu.

## 3. Backup đầy đủ của database ứng dụng

**Đã tạo backup thật**, bằng `mysqldump 8.0.44`, lúc **07:52:48 ngày 07/11/2026**.

Vị trí local bền hơn thư mục TEMP, tính từ gốc repo:

```text
Capstone2/db/backups/grade-safety-20261107-005220/edutrack_db.before-grade.sql
```

| Thuộc tính | Kết quả |
| --- | --- |
| Dung lượng | 52.825 byte |
| SHA-256 | `21fa0afe99dd5ec0cf6fd698c8bb572a4570906ada480e818c98c3f5c062f81f` |
| Phạm vi | Toàn bộ schema và dữ liệu `edutrack_db`, cùng tùy chọn routines/events/triggers |
| Bảng | 24 bảng, bao gồm users, tuition_invoices, payment và migration history |
| Stored objects ghi nhận | Không có view/trigger/routine/event trong metadata tại thời điểm audit |
| Bảo vệ khỏi Git | `/Capstone2/db/backups/` được thêm vào `.gitignore`, đã kiểm tra bằng `git check-ignore` |

Đây là full **logical backup của database ứng dụng**. Không phải backup toàn bộ máy chủ MySQL: không bao gồm
tài khoản/quyền trong schema hệ thống `mysql`, cấu hình server, chứng thư, binlog hoặc file upload ngoài database.
Nếu mục tiêu là khôi phục toàn máy, các thành phần đó cần một phương án backup riêng.

Backup dùng `--single-transaction --quick --skip-lock-tables --routines --events --triggers --hex-blob
--set-gtid-purged=OFF --no-tablespaces --skip-add-locks`. Cả 24 bảng là InnoDB. Trong lúc chụp snapshot cần
giữ schema ổn định; tham khảo [mysqldump — MySQL 8.0](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html).
Không chạy FLUSH, khóa ghi toàn database hoặc thay đổi schema/dữ liệu nguồn để tạo backup này.

### Hướng dẫn tạo backup mới trước một lần triển khai được duyệt

Từ gốc repo, chọn tài khoản backup có quyền đọc phù hợp, mật khẩu nhập tương tác:

```powershell
$taskMySqlBin = 'C:\Program Files\MySQL\MySQL Server 8.0\bin'
$taskBackupDir = Join-Path (Get-Location).Path 'Capstone2/db/backups'
New-Item -ItemType Directory -Force -Path $taskBackupDir | Out-Null
$taskBackupPath = Join-Path $taskBackupDir ('edutrack_db-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.sql')

& "$taskMySqlBin/mysqldump.exe" --no-defaults --protocol=TCP --host=localhost --port=3306 `
  --user=TEN_TAI_KHOAN_BACKUP --password --default-character-set=utf8mb4 `
  --single-transaction --quick --skip-lock-tables --routines --events --triggers `
  --hex-blob --set-gtid-purged=OFF --no-tablespaces --skip-add-locks `
  "--result-file=$taskBackupPath" edutrack_db
if ($LASTEXITCODE -ne 0) { throw 'Backup chưa thành công; dừng triển khai.' }
Get-FileHash -LiteralPath $taskBackupPath -Algorithm SHA256
```

Không coi exit code 0 hoặc file tồn tại là đủ: phải khôi phục thử và so sánh dữ liệu như dưới đây.
Lưu thêm một bản backup ở nơi lưu trữ được bảo vệ bên ngoài máy làm việc trước triển khai thật;
bản đã tạo hiện vẫn ở cùng máy với database chính.

## 4. Khôi phục backup và migration trên MySQL riêng

| Thuộc tính test | Giá trị |
| --- | --- |
| Server | `127.0.0.1:33307`, chỉ bind loopback |
| MySQL | 8.0.44, cùng phiên bản database chính |
| UUID | `<ISOLATED_TEST_SERVER_UUID>` — khác server chính |
| Server ID | `33307` |
| Database migration/API | `edutrack_grade_review` |
| Data directory | `%TEMP%/EduTrack-GradeSafety-20261107-005220/test-mysql/data/` |
| Cấu hình | `--no-defaults`, data directory mới, event scheduler OFF, không dùng cấu hình/data directory server chính |

Tool kiểm tra cổng, database, UUID và data directory trước các thao tác test. Test API cũng kiểm tra server
trước khi khởi động. Tài khoản root rỗng chỉ dùng cho instance tạm được initialize riêng trên loopback.

Kết quả tuần tự:

1. Khôi phục backup lên database test chưa có Grade.
2. Lần nhập đầu phát hiện encoding luồng stdin làm lệch các cột tiếng Việt của 5 bảng.
   Đã ép `StandardInputEncoding = UTF8`, nhập lại bản sao và kiểm tra lại trước khi chạy migration.
   File backup không bị thay đổi và hash vẫn giữ nguyên.
3. Bản khôi phục sau sửa encoding khớp số dòng và fingerprint **24/24 bảng**, cùng schema/index/FK.
4. Chạy nguyên file SQL có SHA-256 ở mục 2 trên database test: thành công, khoảng **388 ms** ở dữ liệu hiện tại.
5. Sau migration: có 12 Grade, history từ 5 lên 6 dòng; **23/23 bảng nghiệp vụ** giữ nguyên số dòng và SHA-256
   trên toàn bộ các cột gốc. Cả 3 Class cũ vẫn `grade_id = NULL` trước các thao tác API test.
6. Các index/FK cũ, kiểu dữ liệu và AUTO_INCREMENT không đổi ở thời điểm ngay sau migration.

Fingerprint được tạo từ tất cả giá trị cột gốc của mỗi dòng, mã hóa giá trị để giữ đúng NULL/Unicode,
băm SHA-256, sắp xếp các hash dòng rồi băm lại cho từng bảng. Với Class sau migration, cột Grade mới được
kiểm tra riêng; không đưa cột mới vào so sánh “các cột gốc”. Timestamp được đọc trong session UTC.
Không đưa dữ liệu cá nhân thô vào báo cáo hoặc output kiểm thử.

Để khôi phục lại bằng công cụ dòng lệnh, dùng một server test được khởi tạo riêng và database test rỗng;
single-database dump này không có CREATE DATABASE/USE. MySQL hướng dẫn cách chọn database đích trong
[Reloading SQL-Format Backups](https://dev.mysql.com/doc/refman/8.0/en/reloading-sql-format-dumps.html).
Với PowerShell, có thể dùng mysql client `--execute="source <đường-dẫn-file>"` trên kết nối test, hoặc Data Import
trong Workbench trên connection test. Tránh pipeline dùng encoding mặc định; lỗi Unicode đã thực sự xuất hiện
trong lần kiểm tra đầu và chỉ được loại trừ sau đối chiếu hash đầy đủ.

## 5. Diễn tập lỗi giữa migration và khôi phục

Đã chạy thật trên database **`edutrack_grade_partial`**, cùng instance test cổng 33307:

1. Khôi phục backup vào bản sao riêng.
2. Chạy đúng phần đầu migration: thêm cột Class, tạo bảng Grade, insert 12 Grade.
3. Chèn lỗi có chủ ý bằng `SIGNAL SQLSTATE '45000'` trước CREATE INDEX, để mysql client dừng và đóng kết nối.
4. Kiểm tra sau lỗi: cột `classes.grade_id` và 12 dòng Grade vẫn tồn tại; history chưa có migration mới.
   Đây là bằng chứng script có thể để lại schema dở dang dù có START TRANSACTION.
5. Khôi phục nguyên backup sang database mới **`edutrack_grade_recovered`** ở cổng 33307.
6. Xác minh bản khôi phục khớp **24/24 bảng** về số dòng và fingerprint gốc; không có bảng/cột Grade.

### Kế hoạch phục hồi nếu triển khai thật gặp lỗi — chưa thực hiện

1. Đóng luồng ghi trong cửa sổ bảo trì và tạo backup mới đã kiểm tra, trước khi bắt đầu migration được duyệt.
2. Khi lỗi: giữ ứng dụng ở trạng thái bảo trì; lưu lỗi, SQL đã chạy, metadata và bản sao trạng thái lỗi.
   Không chạy lại toàn file hoặc EF Down một cách tự động.
3. Kiểm kê chính xác cột/bảng/index/FK và migration history hiện có. Chọn tiếp tục phần còn thiếu hoặc
   khôi phục từ backup sau khi có phê duyệt rõ ràng cho phương án cụ thể.
4. Phương án đã diễn tập là khôi phục backup vào **database mới**, đối chiếu đầy đủ, rồi lập kế hoạch chuyển
   cấu hình ứng dụng sang bản đã xác minh. Chưa thực hiện chuyển cấu hình hay thao tác phục hồi nào lên server chính.
5. Nếu có ghi dữ liệu sau thời điểm backup, cần xử lý các giao dịch đó trước khi chuyển sang bản khôi phục;
   nếu chỉ quay về backup thì sẽ mất phần thay đổi sau backup. Khả năng PITR/binlog chưa được kiểm chứng trong task này.

Không dùng thao tác xóa bảng lịch sử hay cascade để xử lý lỗi migration.

## 6. API và giao diện sử dụng MySQL thật trong môi trường test

Test API chạy riêng tại **`http://127.0.0.1:53307`**, chỉ kết nối `127.0.0.1:33307/edutrack_grade_review`.
Dùng controller, DTO, service, repository và EF model từ build source hiện tại. Host test không chạy
`Program`/DbSeeder/Migrate của ứng dụng chính và không nạp production connection string cho DbContext.

**31 kiểm tra API đạt, qua 37 request HTTP thật, không dùng API fixture:**

- GET Grades trả đủ 12 khối, đúng tiếng Việt; GET Classes và Subjects hoạt động.
- Trước CRUD, 3 Class cũ đều NULL Grade.
- POST thiếu/NULL/0/13 Grade bị từ chối, không tạo lớp.
- Tạo lớp Grade 7, đọc lại bằng GET list/detail, xác nhận ID do MySQL cấp.
- Sửa sang Grade 8, đổi phí/trạng thái trên lớp test và đọc lại đúng dữ liệu.
- Sửa Grade sai hoặc xóa Grade của lớp đã phân loại bị từ chối.
- Xóa vĩnh viễn lớp test rỗng thành công; GET sau xóa trả 404.
- Lớp cũ có thể đổi trạng thái rồi khôi phục trạng thái gốc khi Grade còn NULL.
- Chủ động phân loại một Class cũ sang Grade 7 trên bản test.
- DELETE lớp đã vận hành bị từ chối và hướng dẫn Inactive/Completed.
- Dữ liệu từ 7 API quan hệ/lịch/hóa đơn/thanh toán giữ nguyên trước/sau CRUD.
- Sau CRUD và kiểm tra FK, cả 23 bảng nghiệp vụ vẫn giữ số dòng và hash toàn bộ cột gốc.
  Một Grade mới được người kiểm thử gán trên bản test là thay đổi có chủ ý; AUTO_INCREMENT của bảng test có thể tăng
  vì đã tạo/xóa lớp test. Hai thay đổi này không xảy ra trên database chính.

**Giao diện với API thật:** 6 trường hợp đều đạt — Center Manager/Admin Staff trên desktop 1440×1000,
tablet 768×1024 và mobile 390×844; ghi nhận **72 request API thật**, không thay response bằng fixture.
Xác minh hai tab, nhóm khối/Chưa phân loại, lọc Grade, form tải 12 Grade thật, Subject vẫn single-select,
Class Details hiển thị Grade thật và kích thước form/nhóm lớp phù hợp viewport.

Frontend test dùng proxy local chỉ tới API test, không dùng proxy 5173 đang nối database chính.
Các tài nguyên CSS/CDN ngoài được cô lập trong browser test; không kết luận về font/icon CDN hay
Authentication/Authorization trên môi trường triển khai từ các kiểm tra này.

Backend source và host test build thành công. Ảnh và kết quả request lưu trong bộ bằng chứng local.

Sau khi hoàn tất, đã dừng host API test và MySQL test sau khi xác nhận đúng PID/UUID. Các tiến trình
MySQL chính cổng 3306 và Backend chính cổng 5036 được giữ nguyên. Kết quả và backup vẫn được lưu local;
các địa chỉ API test trong báo cáo là địa chỉ đã dùng trong phiên kiểm thử, hiện không còn chạy.

## 7. Bằng chứng và những thay đổi file trong lần review này

Thư mục local được Git ignore:

```text
Capstone2/db/backups/grade-safety-20261107-005220/
  edutrack_db.before-grade.sql
  backup-manifest.json
  production-before.json
  production-before.queries.sql
  production-after.json
  production-after.queries.sql
  test-restored.json
  test-after-migration.json
  test-after-api.json
  test-recovery-restored.json
  comparison-summary.json
  verification-results.json
  recovery-drill.json
  fk-probe-results.json
  real-api-results.json
  verify-audits.mjs
  real-api-smoke.mjs
  real-api-browser.mjs
  AddGradeClassification.review.sql
  live-browser/results.json
  live-browser/*-groups.png
```

`verification-results.json` chứa 1.089 phép đối chiếu cụ thể về row count/fingerprint và metadata;
đây là các đối chiếu audit, không phải 1.089 tình huống E2E độc lập.

File được sửa/thêm trong lần review này:

- `.gitignore`: loại trừ backup/dữ liệu kiểm thử thực tế khỏi Git.
- Báo cáo này.
- `EDUTRACK_GRADE_CLASSIFICATION_TASK02.md`: liên kết sang kết quả kiểm chứng database mới.

SQL migration và source ứng dụng không bị sửa trong lần review. Không đưa dump dữ liệu thật vào file tracked.

## 8. Kết luận để phê duyệt

- Migration chỉ bổ sung Grade và liên kết nullable của Class, cùng một dòng lịch sử migration.
- Bản sao dữ liệu thực tế đã vượt qua backup → restore → so sánh → migration → API/UI thật.
- Dữ liệu Class cũ được giữ nguyên; ba lớp đều chưa phân loại ngay sau migration.
- Tuition Invoice, Payment và các bảng quan hệ/lịch sử không thay dữ liệu trong thử nghiệm.
- Backup đã tạo và kiểm tra khôi phục thành công hai lần theo hai mục tiêu kiểm tra: khôi phục ban đầu và phục hồi lỗi.
- Rủi ro DDL dở dang có thật; có diễn tập và kế hoạch phục hồi, không dựa vào ROLLBACK toàn file.
- Trước triển khai thật vẫn cần phê duyệt rõ ràng, backup mới/off-machine, cửa sổ bảo trì, kiểm tra lại đích/metadata,
  và phối hợp schema với Backend. Chưa kiểm chứng PITR, tải đồng thời hoặc thời gian khóa trên dữ liệu lớn.

**Chưa có phê duyệt áp dụng lên `localhost:3306/edutrack_db`; chưa thực hiện thay đổi đó.**
Trang chính vẫn có thể báo HTTP 500 do schema Grade chưa tồn tại. Giữ nguyên trạng thái này trong lúc chờ
quyết định triển khai hoặc một phương án tạm được yêu cầu riêng.
