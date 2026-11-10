# EduTrack — Schedule legacy compatibility sau Expand

Ngày 09/11/2026, Asia/Bangkok. Branch `Duy`, HEAD
`22a07dc6847abcfb4f1d9789f209f2b853dc3dcf`.

Đã sửa source và restore lại backup thật trên MySQL độc lập. Sau Expand,
`GET /api/classsessions` và Schedule read trả **200**, giữ đủ **10 Session**,
kể cả IDs 6–10 có ScheduleId NULL. Không cập nhật database gốc trong lượt này.

## 1. Root cause và cách sửa

CLR properties đã nullable nhưng EF model lại đặt ScheduleId, ScheduleVersionId,
PlannedOccurrenceDate là required. Expand chủ ý cho phép NULL để chờ explicit
legacy mapping; EF materializer của model Contract không đọc được các NULL đó.
Quan hệ required tới Schedule còn làm Include sinh INNER JOIN, loại Session chưa
có Schedule ngay cả khi tránh được lỗi cast.

Giữ nguyên `EduTrackDbContext` làm model **migration Contract**; chỉ thêm protected
constructor nhận DbContextOptions cho context ứng dụng kế thừa. OnModelCreating,
snapshot, Designer, migration, gate và design-time factory cũ không đổi.

Context mới `EduTrackRuntimeDbContext` gọi mapping gốc rồi override riêng ClassSession:

```csharp
session.Property(x => x.ScheduleId).IsRequired(false);
session.Property(x => x.ScheduleVersionId).IsRequired(false);
session.Property(x => x.PlannedOccurrenceDate).IsRequired(false);
// Cả hai quan hệ composite Schedule và ScheduleVersion:
// giữ ForeignKey / PrincipalKey / DeleteBehavior.Restrict hiện có,
// chỉ đổi IsRequired(false).
```

Program đăng ký `AddDbContext<EduTrackDbContext, EduTrackRuntimeDbContext>`.
Các repository/service/controller vẫn inject cùng base type nhưng nhận model
runtime. Hai context có model cache riêng theo concrete type; test tạo cả hai
trong cùng process xác nhận không lẫn mapping.

ClassSessionRepository vẫn Include Class/Schedule; không cần viết lại query.
ClassSessionService/DTO đã giữ ScheduleId nullable và map actual fields an toàn.
ClassSessionsController không cần đổi. ScheduleReadService/DTO đã giữ provenance
nullable, dùng actual date và assignment/enrollment scope; source các file này
giữ nguyên. Không tạo planned date, version hoặc Schedule giả.

Mapping runtime nullable không nới schema Contract: DB vẫn giữ NOT NULL/unique/FK.
Mọi lệnh EF migration tiếp tục chọn rõ `--context EduTrackDbContext` và test startup
ScheduleManagement; không dùng runtime context để tạo/cập nhật schema.

## 2. SQL EF trước và sau

Trước, model required sinh:

```sql
FROM `class_sessions` AS `c`
INNER JOIN `classes` AS `c0` ON `c`.`class_id` = `c0`.`class_id`
INNER JOIN `class_schedules` AS `c1`
  ON (`c`.`schedule_id` = `c1`.`schedule_id`)
 AND (`c`.`class_id` = `c1`.`class_id`)
```

Sau, model runtime sinh:

```sql
FROM `class_sessions` AS `c`
INNER JOIN `classes` AS `c0` ON `c`.`class_id` = `c0`.`class_id`
LEFT JOIN `class_schedules` AS `c1`
  ON (`c`.`schedule_id` = `c1`.`schedule_id`)
 AND (`c`.`class_id` = `c1`.`class_id`)
LEFT JOIN `class_schedule_versions` AS `c2`
  ON (`c`.`schedule_version_id` = `c2`.`schedule_version_id`)
 AND (`c`.`schedule_id` = `c2`.`schedule_id`)
```

JOIN Class vẫn required như trước; không bỏ consistency/FK. SQL đầy đủ được lưu
bằng ToQueryString trong evidence. Repository list/detail thực tế đều trả đủ IDs.

## 3. Rehearsal trên backup thật

Backup: `C:\Users\RescueAdmin\Downloads\edutrack_backup_20261109.sql`, SHA-256
`43321a36398ac4ce9310b15bbc0974f9b7eef631c70b629347116b43e79f9543`.
Checksum được kiểm lại trước import; scanner từ chối executable database routing
hoặc tham chiếu qualified tới database gốc. Import explicit database trên process
MySQL riêng, port 33308/datadir Temp/server UUID đã xác minh trước mọi write.

Bản sao đạt cuối:
`edutrack_compat_test_b034a55fa6d44cdda55df9bb17934800`.

Restore có đúng 7 migrations, cuối là AddStudentGrade. Chỉ chạy
`IMigrator.MigrateAsync("20261109004646_ScheduleVersionExpand")` trên bản sao này;
history sau đó đúng 8 dòng, chỉ thêm Expand. Không Contract, Phase 3, backfill hoặc
DbSeeder trên bản sao backup thật. Không đọc connection/appsettings database gốc.

| API trên copy sau Expand | Kết quả |
|---|---|
| GET /api/classsessions | 200, đúng 10 IDs ban đầu |
| GET /api/classsessions/{id}, IDs 1–10 | Tất cả 200 |
| GET /api/schedule/sessions, range bao phủ actual dates | 200, đúng 10 IDs |
| GET /api/notifications/inbox/snapshot | 200, payload nghiệp vụ khớp model cũ |
| Management templates của Class active còn legacy | 409 mapping gate, không 500 |

Test riêng class/date/status filters và Teacher/TA assignment scope đạt. CM, AD,
Teacher, TA, Student đọc qua selected-user contract No-Auth hiện có. Không có login,
principal giả hoặc thay Authentication/Authorization.

| Dữ liệu | Trước restore/Expand | Sau đọc HTTP/service |
|---|---:|---:|
| ClassSession | 10 | 10 |
| ClassSchedule | 4 | 4 |
| Attendance | 6 | 6 |
| ScheduleId NULL | 5 (IDs 6–10) | 5 (cùng IDs) |
| ClassScheduleVersion | Chưa có bảng | 0 |

Hash theo PK của toàn bộ **24 bảng nghiệp vụ cũ và các cột cũ** không đổi sau
Expand và sau reads. Snapshot toàn bộ bảng sau Expand cũng không đổi sau repository,
service và HTTP GETs. SessionId, ScheduleId, actual date/time/room/status và mọi
Attendance row giữ nguyên; cả 10 planned/version/week vẫn NULL.

## 4. Contract và migration compatibility

Schema tổng hợp riêng:
`edutrack_compat_contract_08a9c646a4fa4b3d9c096040e61ed616`.

Chỉ schema synthetic này chạy tới Contract rồi tạo fixture có planned identity
được khai báo rõ. Không dùng fixture đó làm mapping cho legacy backup.

- Runtime model đọc được source version/planned/generated week và actual date độc lập.
- INSERT thiếu metadata qua runtime bị DB NOT NULL từ chối (1048).
- INSERT trùng ca/tuần dù actual/status khác bị DB unique từ chối (1062).
- Model migration không có pending changes so với snapshot hiện có.
- SQL AddStudentGrade → Expand sinh lại khớp bản rehearsal trước sau chuẩn hóa
  line endings; không cần migration mới. Không sửa migration lịch sử/snapshot.

## 5. Validation của lượt này

| Kiểm tra | Kết quả mới |
|---|---|
| Compatibility metadata/offline | 13 assertions, không DB/host |
| Backup Expand + nullable reads + synthetic Contract | **70 assertions** tổng, bao gồm 13 offline, không cộng hai tập |
| Backend API + Compatibility/Read/Management/Changes/Notifications builds | PASS, output Temp; API full build có 3 nullable warnings baseline, không warning mới |
| Frontend lint/typecheck/build | PASS; upstream warnings/bundle size còn tồn tại |
| Frontend unit/contract | **162 pass**, 0 fail/skip |
| Schedule Read MySQL/HTTP/browser | **60 assertions, 219 SELECT, 0 write attempts**, toàn bộ table snapshot không đổi; **20 browser groups** |
| Management/version/generation MySQL/HTTP/browser | **112 assertions + 3 browser groups**, gồm Expand/Backfill/Contract tổng hợp và consumer adapters |
| Schedule Changes MySQL/HTTP/browser | **104 assertions + 4 component / 20 workspace browser groups**, có negative tests tái hiện owner blocker chưa sửa |
| Notifications MySQL/HTTP/browser | **49 assertions + 24 browser groups**, source Notifications giữ nguyên |
| Migration model / SQL Expand | Không pending model changes; SQL Expand không đổi |
| git diff --check / whitespace file mới | PASS |

Các browser runs dùng app/component thật với HTTP/MySQL cô lập và selected-user
contract hiện có. Không coi synthetic Contract tests hoặc feature-gate opt-in trong
test host là phê duyệt rollout/production. Nhãn log cũ như principal/401 không làm
test trở thành Authentication; source No-Auth và selectors không được sửa ở lượt này.

Các run lỗi trung gian không tính PASS: test ban đầu chọn Class completed nhưng kỳ vọng mapping gate; assertion hash
ban đầu so tập cột cũ với tập cột đã expand. Đã sửa fixture/kỳ vọng so sánh, giữ nguyên
production business rules và chạy lại toàn bộ compatibility harness từ backup mới.

## 6. File thay đổi

Delta riêng lượt này, không phải toàn bộ dirty Notifications/No-Auth có sẵn:

```text
M .github/workflows/ci.yml
M Capstone2/backend.Tests/TuitionPolicy.Tests.csproj
M Capstone2/backend.Tests/ScheduleRead/Program.cs
M Capstone2/backend.Tests/ScheduleManagement/Program.cs
M Capstone2/backend.Tests/ScheduleChanges/Program.cs
M Capstone2/backend/Models/EF/EduTrackDbContext.cs
M Capstone2/backend/Program.cs
A Capstone2/backend/Models/EF/EduTrackRuntimeDbContext.cs
A Capstone2/backend.Tests/ScheduleCompatibility/Program.cs
A Capstone2/backend.Tests/ScheduleCompatibility/ScheduleCompatibility.Tests.csproj
A docs/EDUTRACK_SCHEDULE_LEGACY_COMPATIBILITY_REPORT.md
```

Ba harness Schedule chỉ đổi HTTP host registration sang runtime context. Các bước
migration/fixture vẫn dùng strict base model. CI thêm metadata checks offline,
không import backup hoặc khởi động MySQL. TuitionPolicy project chỉ exclude folder
console harness mới để tránh trùng entrypoint; không đổi Tuition policy.

Program chỉ đổi generic DbContext registration; toàn bộ No-Auth pipeline, DbSeeder
và cấu hình khác giữ nguyên. Không sửa Notifications production/test/frontend,
Calendar/List, Schedule services/DTOs, Approval, Attendance hoặc business rules.

## 7. Giới hạn và ReadyForApproval

**ReadyForApproval = true** cho source compatibility + backup Expand rehearsal.
Đây là sẵn sàng trình duyệt Expand, chưa phải quyền chạy migration gốc.
Readiness này chỉ dành cho
**source mới kết hợp Expand**, không xác nhận Phase 2/3 writes hoặc production-ready.
Database gốc chưa được cập nhật; API đang chạy source/schema cũ vẫn có thể lỗi.

Trước lần xin phép/thực thi riêng phải xác minh lại database đích, history, backup
và dữ liệu không drift. Chỉ target Expand qua base migration context/test startup;
không chạy latest, Contract hoặc Phase 3 và không chạy production Program/DbSeeder
để thử migration. Lượt này không kết nối hay ghi `edutrack_db`.

Phase 2 management/generation tiếp tục chặn legacy chưa có version/planned mapping.
Schema chỉ Expand chưa có NOT NULL/unique occurrence cuối Contract; không coi đây
là bảo đảm duplicate protection hoàn chỉnh cho writer tùy ý. Contract cần evidence
mapping riêng, xử lý NULL/duplicate và owner cutover Attendance/seeder.

Phase 3 detail table chưa có trên copy Expand; workflow đó không được mở bằng patch
này. Hai integration flags GenericRoutesGuarded/AttendanceWritesCoordinated vẫn
mặc định false. Generic Approval bypass/Attendance concurrency còn chờ owner như
báo cáo trước. Không sửa hoặc bật các integration này để làm demo.

## 8. Evidence, tái chạy và Git

Evidence ngoài repository:
`%TEMP%/edutrack-expand-compat-Dv7Nso`.

Compatibility run cuối: `compat-mysql-accepted.log`, `copy-test-accepted/results.json`,
`before.json`, `after-reads.json`, `after-original-columns.json`, SQL trước/sau,
server identity và database names. `expand-only-unchanged.sql`/`ef-script.log` chứng
minh SQL migration không đổi. Không đưa backup, datadir, screenshots hoặc build
outputs vào repository.

Regression logs: `ScheduleRead-regression.log`, `ScheduleManagement-regression.log`,
`ScheduleChanges-regression.log`, `Notifications-regression.log`; frontend logs
`frontend-lint/test/typecheck/build.log`. Các build logs và scope comparison cùng
thư mục evidence. Browser artifacts cuối: `edutrack-schedule-browser-yG2ByA`,
`edutrack-schedule-version-browser-lD1tQ2`, `edutrack-schedule-change-browser-wcjDmU`;
Notifications artifact path được ghi trong Notifications-regression.log.

Scope SHA-256: 1.072 file đầu lượt; đúng 7 file có sẵn thay đổi như danh sách mục 6,
1.065 file còn lại không đổi. Thêm 4 file mới kể cả báo cáo này. Notifications,
No-Auth consumers và toàn bộ migrations/snapshot giữ nguyên; Program chỉ đổi DI.
Git cuối: **56 modified + 2 deleted + 24 untracked files**, gồm dirty source có sẵn;
index rỗng, không conflict. HEAD giữ nguyên, không có commit mới.

Private MySQL của run backup cuối đã shutdown đúng identity; datadir được giữ tại
`%TEMP%/edutrack-enrollment-mysql-1d176b23874f40f295fd0d7b1ea6bbf6/data`.

Tái chạy offline bằng project ScheduleCompatibility. Muốn test backup cần ba biến
môi trường explicit EDUTRACK_COMPAT_BACKUP, EDUTRACK_COMPAT_BACKUP_SHA256 và
EDUTRACK_COMPAT_EVIDENCE; dùng Run-IsolatedMySql.ps1 với DLL build trong Temp và
`-Http`. Harness chỉ nhận MySQL riêng port 33308/datadir runner, không nhận connection
development. Các browser regression dùng frontend build và `-FrontendRoot` như cũ.

Không stage/commit/push/merge/reset/stash/clean; index và HEAD giữ nguyên. Dừng trước
mọi thay đổi database gốc để người dùng nghiệm thu source và kết quả rehearsal.
