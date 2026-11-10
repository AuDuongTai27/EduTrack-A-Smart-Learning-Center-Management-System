# EduTrack — Thử ScheduleVersionExpand trên backup thật

Ngày 09/11/2026, Asia/Bangkok. Branch `Duy`, HEAD
`22a07dc6847abcfb4f1d9789f209f2b853dc3dcf`.

**Đã restore backup và chạy EF migration Expand thật trên database bản sao. Schema
và bảo toàn dữ liệu đạt, nhưng kiểm thử API thất bại: Expand một mình chưa sửa được
HTTP 500 với model EF hiện tại. Chưa đủ điều kiện áp dụng lên `edutrack_db`.**

Database gốc chỉ được đọc trong transaction READ ONLY/consistent snapshot. Không
migrate/seed/UPDATE/INSERT/DELETE database gốc; không chạy production Program/DbSeeder.
Không sửa source production, Notifications, No-Auth, business rules, migration hoặc
gates. Không commit/push/merge/reset/stash/rebase. Lượt này chỉ thêm báo cáo này trong
repository; tool/build/SQL/evidence nằm ngoài repository ở Temp.

## 1. Connection và preflight thực tế

Nguồn connection: `Capstone2/backend/appsettings.json`, key
`ConnectionStrings:DefaultConnection`. appsettings.Development không override;
launch profiles dùng Development, không override connection; environment của
preflight không có ConnectionStrings override. Không có UserSecretsId trong project.

Đích đã kết nối/xác minh bằng SQL, không suy đoán từ ID seed:

| Thuộc tính | Giá trị |
|---|---|
| Server/port | localhost:3306 |
| Database | edutrack_db |
| User | root; không ghi password vào báo cáo/command literal |
| SQL hostname | DESKTOP-B5RURE3 |
| Server UUID | 9eb85238-f949-11f0-ad01-9c6b00a7788b |
| MySQL | 8.0.44, lower_case_table_names=1 |
| Sessions / Schedules / Attendance | 10 / 4 / 6 |
| Session có ScheduleId NULL | 6, 7, 8, 9, 10 |
| Class mismatch giữa Session và Schedule tham chiếu | 0 |
| FK trước migration | 48; tất cả orphan counts bằng 0 |

7 migration đã áp dụng:

```text
20261012134022_InitialCreate
20261019061116_AddTitleAndDescriptionToApprovalRequests
20261101011722_AddPaymentAdditionalCharges
20261102032813_AddNotificationRecipientsAndSender
20261102045221_AddNotificationRecipientDeletedAt
20261107002822_AddGradeClassification
20261107061101_AddStudentGrade
```

Trước migration không có bảng class_schedule_versions hoặc ba cột occurrence mới.
Runtime EF model đã map các cột đó nên SELECT entity ClassSession tham chiếu
occurrence_week_start gây lỗi Unknown column ban đầu.

Sandbox gặp Windows SSL/SSPI “No credentials are available in the security package”.
Preflight được chạy ngoài sandbox với chính connection cấu hình và transaction
READ ONLY. Không tắt SSL hoặc sửa connection/appsettings để vượt lỗi đó.

## 2. Backup được tìm thấy và khôi phục thực tế

```text
C:\Users\RescueAdmin\Downloads\edutrack_backup_20261109.sql
```

- Kích thước: 61.304 bytes; modified UTC 2026-11-09 14:49:23.108.
- Dump có footer hoàn tất lúc 21:49:23, 09/11/2026.
- SHA-256:
  `43321a36398ac4ce9310b15bbc0974f9b7eef631c70b629347116b43e79f9543`.
- Đã kiểm routing SQL: không có CREATE DATABASE/USE hoặc tham chiếu database gốc
  thực thi ngoài comments/literals; không routine/trigger/event hoặc import script
  phụ. Bản import giữ nguyên bytes/checksum của backup đã kiểm.
- Import chỉ dùng explicit database đích trên MySQL process riêng port 33308,
  bind 127.0.0.1; port/datadir/server UUID khác database gốc được kiểm trước write.
- Restore thành công; đối chiếu **25 bảng**, từng danh sách cột, số dòng và SHA-256
  dữ liệu canonical theo PK: khớp database gốc tại consistent snapshot. Đây là
  bằng chứng restore được backup hiện có, không chỉ kiểm file tồn tại.

Database bản sao:
`edutrack_schedule_copy_3e77ba3943834f4c8b60e89af9565d85`.

Nó nằm trên process MySQL riêng, không phải schema phụ trên server 3306. Sau test
process đã shutdown đúng identity; dữ liệu/datadir Temp giữ để đối chiếu, không xóa
hoặc reset database gốc.

## 3. Migration đã chạy trên bản sao

Đã đọc Up/Down của Expand/Contract và ScheduleMigrationGates. Expand chạy gate
CompatibleLegacyClass trước DDL. Class mismatch=0, không bypass/sửa gate. Không tự
gán ScheduleId, source version hoặc planned date cho legacy.

EF API thực sự được gọi trên connection của bản sao:

```csharp
await db.GetService<IMigrator>()
    .MigrateAsync("20261109004646_ScheduleVersionExpand");
```

Không dùng Database.Migrate() tới latest. Không chạy Contract, ScheduleChangeRequests,
Down migration hoặc utility backfill. History bản sao sau migration có đúng 8 dòng,
dòng mới duy nhất là ScheduleVersionExpand.

SQL generated từ EF API và `dotnet ef migrations script AddStudentGrade Expand`
đã được đối chiếu giống nhau sau chuẩn hóa line endings. Script chỉ có Expand,
không chứa Contract/Phase 3. SHA-256 canonical:
`f4104deb6b8480aa50ea5a3ad4ff515e2d36dc64904aad5d17b7353904ece86c`.

## 4. Schema và dữ liệu sau Expand

| Kiểm tra | Kết quả |
|---|---|
| planned_occurrence_date | DATE NULL |
| schedule_version_id | INT NULL |
| occurrence_week_start | DATE NULL, STORED GENERATED từ planned date |
| class_schedule_versions | Được tạo đúng; 0 dòng sau toàn bộ test |
| History | 8 migrations, chỉ thêm Expand |
| FK sau Expand | 50, không orphan; class consistency vẫn đúng |
| Contract occurrence unique/NOT NULL | Chưa áp dụng, đúng phạm vi |

MySQL chuẩn hóa generation expression thành:

```sql
(`planned_occurrence_date` - interval weekday(`planned_occurrence_date`) day)
```

Biểu thức tương đương DATE_SUB trong migration. Probe ngày planned Wednesday
11/11/2026 và actual Tuesday 17/11/2026 trả occurrence week 09/11/2026, đúng planned.

| Bảng | Trước | Sau | Hash các cột/bản ghi cũ |
|---|---:|---:|---|
| class_sessions | 10 | 10 | Giống hệt |
| class_schedules | 4 | 4 | Giống hệt |
| attendance | 6 | 6 | Giống hệt |

Toàn bộ **24 bảng nghiệp vụ cũ** giữ nguyên hash/số dòng/cột cũ, không chỉ ba bảng
trên. SessionId, actual date/time/status, ScheduleId và mọi Attendance row giữ nguyên.
Sessions 6–10 vẫn NULL ScheduleId. Cả 10 Session vẫn NULL planned/version/week; 4
Schedule chưa có version. Không suy ngày planned từ SessionDate.

Đã thử CHECK Monday/weekday/time, unique root/effective-from, composite FK đúng
Class/root/version và RESTRICT. Các trường hợp không hợp lệ bị MySQL từ chối đúng
3819/1062/1452/1451. Probes chỉ dùng record synthetic ID âm trên bản sao trong một
transaction rồi ROLLBACK; không UPDATE/DELETE record nghiệp vụ cũ hoặc chuyển Attendance.
Sau rollback, hash dữ liệu và bảng version rỗng được kiểm lại.

## 5. Blocker runtime đã tái hiện sau Expand

Host test đăng ký controllers/services production trên database bản sao, không
chạy production Program/DbSeeder hoặc thay source. Kết quả thật:

| API | Sau Expand |
|---|---|
| GET /api/classsessions | **500** |
| GET /api/schedule/sessions?userId=1&from=2026-09-08&toExclusive=2026-09-15 | **500** |
| GET /api/notifications/inbox/snapshot?userId=1 | **200** |

Gọi trực tiếp ClassSessionRepository cũng tái hiện:

```text
InvalidCastException:
Unable to cast object of type 'System.DBNull' to type 'System.DateTime'.
```

Nguyên nhân tiếp theo là **model ứng dụng đang mô tả trạng thái Contract**, trong
khi schema/data đang ở Expand hợp lệ:

| Property | CLR nullable | EF IsNullable |
|---|---|---|
| ScheduleId | true | false |
| ScheduleVersionId | true | false |
| PlannedOccurrenceDate | true | false |
| OccurrenceWeekStart | true | true |

`EduTrackDbContext.cs` dòng cấu hình ClassSession có IsRequired cho ba property đầu.
EF materializer không đọc an toàn các NULL legacy. Vì vậy thêm cột loại được lỗi
Unknown column nhưng không làm API hiện tại đọc được dataset này.

Còn một vấn đề phải sửa cùng: FK Schedule bị EF xem là required, nên query của
ClassSessionRepository Include(Schedule) sinh:

```sql
INNER JOIN `class_schedules` AS `c1`
  ON (`c`.`schedule_id` = `c1`.`schedule_id`)
 AND (`c`.`class_id` = `c1`.`class_id`)
```

JOIN này loại Sessions 6–10 có ScheduleId NULL. Chỉ sửa lỗi materialize date mà giữ
INNER JOIN có thể làm API âm thầm thiếu 5 Session. Đã lưu metadata EF và SQL thật
bằng ToQueryString, không suy đoán từ tên property CLR.

**Không sửa dữ liệu để che blocker:** không điền date giả, không clone/xóa Session,
không gán ca tùy tiện, không chạy Contract/Phase 3. Chưa sửa DbContext, repository,
Schedule read adapter hoặc snapshot để cố làm test pass trong lượt schema này.

Bước cần giải quyết tiếp theo là patch read/mapping tương thích trạng thái Expand:
đọc đúng NULL và giữ legacy Session không có Schedule; sau đó test lại đủ 10 rows
trên chính backup. Đây không phải cho phép tự backfill legacy hoặc bỏ constraint.
Các test trước chạy trên dữ liệu đã mapping/Contract không chứng minh trạng thái
chỉ Expand của backup thật đã tương thích runtime.

## 6. Database gốc và trạng thái sẵn sàng

Đã so lại consistent snapshot database gốc sau toàn bộ rehearsal: danh sách
bảng/cột, row counts, data hashes và migration history **không đổi**. Database gốc
vẫn 7 migrations, không có các cột/bảng Expand, vẫn 10/4/6 records.

- Backup restore: PASS.
- Expand DDL và preservation: PASS; 26 checks kỹ thuật được ghi trong evidence.
- Production read API trên Expand legacy: FAIL như phần 5.
- **ReadyForApproval = false. Không đề nghị duyệt/chạy migration gốc lúc này.**

Admin Staff Dashboard chưa thể được đánh dấu đã sửa vì dependency /api/classsessions
vẫn lỗi trong rehearsal. Chưa kiểm browser Dashboard trên database gốc. Notifications
snapshot trên copy đạt; không gọi đó là full Notifications browser regression lượt này.

Phase 2 generation/version management vẫn cần explicit legacy mapping/version data
và Contract theo quy trình riêng. Phase 3 detail table/migration chưa có và các owner
integration gates vẫn giữ nguyên; không bật hoặc tuyên bố workflow đó khả dụng sau
Expand. Những endpoint cần bảng Phase 3 chưa được nghiệm thu trên database này.

## 7. Lệnh dự kiến sau khi giải quyết blocker và được phê duyệt

**Chưa chạy lệnh dưới trên edutrack_db.** Nó chỉ là lệnh giới hạn target để review;
phải rehearsal lại thành công đầy đủ trước khi xin phép thay đổi database gốc.
Connection được đọc vào biến trong bộ nhớ, không in password. Startup là harness
ScheduleManagement, không dùng API Program; design factory dùng endpoint dummy.

```powershell
$reviewRoot = "$env:TEMP/edutrack-expand-rehearsal-Ijhsa3/build"
$settings = Get-Content -Raw 'Capstone2/backend/appsettings.json' | ConvertFrom-Json
$expandConnection = $settings.ConnectionStrings.DefaultConnection

dotnet ef database update 20261109004646_ScheduleVersionExpand `
  --project "$reviewRoot/Capstone2/backend/EduTrack.API.csproj" `
  --startup-project "$reviewRoot/Capstone2/backend.Tests/ScheduleManagement/ScheduleManagement.Tests.csproj" `
  --context EduTrackDbContext --no-build --connection $expandConnection
```

Phải xác minh lại config hiệu lực/server UUID/history/checksum backup và không có
drift so với bản đã thử trước khi thực thi sau phê duyệt. MySQL DDL không được xem
là có thể rollback toàn bộ bằng transaction; không auto Down/restore database gốc.
Không dùng database update thiếu migration target hoặc script chạy tiếp tới latest.

## 8. Evidence và Git

Evidence ngoài repository:

```text
%TEMP%/edutrack-expand-rehearsal-Ijhsa3/
  source-baseline.json
  backup-metadata.json, import-audit.json, verified-backup.sql, restore-copy.sql
  original-preflight.json, preflight-summary.json
  copy-server.json, copy-before.json, copy-after-existing-columns.json
  pending-before.json, history-after.json
  session-columns-after.json, session-ddl-after.json
  expand-only.sql, expand-only-cli.sql, ef-script.log
  current-model-diagnostic.json, current-repository-query.sql
  http-results.json, http-0.txt, http-1.txt, http-2.txt
  rehearsal-result.json, rehearsal.log
```

Bản sao được giữ trong datadir của server đã dừng:

```text
%TEMP%/edutrack-enrollment-mysql-3e4322d00acb472c8983574d3a09370a/data
```

Không có artifacts/dump hoặc source thử nghiệm được đưa vào repository. Chỉ tài liệu
này được thêm; source Notifications/No-Auth/Schedule/migrations giữ nguyên SHA-256 so
với đầu lượt. Branch/HEAD/index không đổi; không commit/push hoặc thao tác Git đồng bộ.

Dừng với blocker được tái hiện và bằng chứng đầy đủ, trước mọi thay đổi database gốc.
