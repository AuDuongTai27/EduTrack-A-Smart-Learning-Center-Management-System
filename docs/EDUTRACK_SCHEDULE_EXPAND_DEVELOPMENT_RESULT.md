# EduTrack — Giải quyết drift và áp dụng ScheduleVersionExpand

Ngày 09/11/2026, Asia/Bangkok. Branch `Duy`, HEAD
`22a07dc6847abcfb4f1d9789f209f2b853dc3dcf`.

**Đã áp dụng duy nhất `20261109004646_ScheduleVersionExpand` lên
`localhost:3306/edutrack_db`. History 7 → 8. Toàn bộ 24 bảng nghiệp vụ cũ giữ nguyên
records và hash các cột cũ, gồm trạng thái notification hiện hành.**

GET ClassSessions/Schedule/Notifications trên database development qua host chỉ
đọc dùng source mới đều đạt 200. App frontend thật kiểm tra Dashboard AD/CM đạt;
không chạy production Program/DbSeeder hoặc restart tiến trình API của người dùng.
Không commit/push/merge/reset; không sửa implementation Notifications/No-Auth.

## 1. Drift chính xác, không bỏ qua bằng cách thay expected hash

Restore lại backup cũ vào MySQL độc lập port 33308, xác minh SHA-256 và hashes tất
cả 25 bảng khớp evidence rehearsal cũ. So sánh từng row theo recipient_id và từng
field với database hiện tại được đọc trong READ ONLY/consistent snapshot.

**Chỉ một field của một row thay đổi:**

| Field — recipient 19 | Backup cũ | Development trước Expand |
|---|---|---|
| recipient_id | 19 | 19 |
| notification_id | 9 | 9 |
| user_id | 1 | 1 |
| is_read | true | true |
| read_at (UTC) | 2026-11-09 14:32:54.412934 | 2026-11-09 14:32:54.412934 |
| deleted_at (UTC) | NULL | **2026-11-09 15:53:18.586190** |

Đây là toàn bộ 6 cột của row. 42 recipient còn lại không đổi. Không INSERT/DELETE
row, không reassignment hoặc đổi ownership; vẫn 43 recipient. 24 bảng còn lại,
gồm history, Schedule và Attendance, khớp snapshot cũ.

Thay đổi phù hợp chính xác với soft-delete một thông báo đã đọc, là hành vi bình
thường của Thùng rác. Không có bằng chứng định danh người thực hiện trong task này;
không suy ra actor từ user_id. Đánh giá an toàn dựa trên diff đầy đủ của mọi field,
không chỉ counts. Không revert/restore recipient hoặc thay đổi IsRead/ReadAt/DeletedAt.

Hash notification_recipients:

```text
Backup cũ:
1595bfb212affd36d2134582a09ce56efb15330412737d5df821803399b286bd
Current trước Expand = sau Expand = sau API/browser:
b9aa12a8de30ee1d4745a68d92f2c444fdb62ff45a37127e3ebeadf4b037e183
```

Giữ nguyên backup/evidence cũ và báo cáo BLOCKED trước; không sửa lại lịch sử để
biến drift thành “không có thay đổi”.

## 2. Database identity, writers và preflight mới

Connection được resolve từ appsettings.json DefaultConnection; Development,
launch profiles và environment không override đích. Không ghi password/full
connection string vào logs hoặc báo cáo.

| Thuộc tính | Đã xác minh |
|---|---|
| Database | localhost:3306 / edutrack_db |
| Host | DESKTOP-B5RURE3 |
| Server UUID | 9eb85238-f949-11f0-ad01-9c6b00a7788b |
| MySQL | 8.0.44 |
| Trước migration | 25 bảng, 7 migrations, 10/4/6 Sessions/Schedules/Attendance |
| FK / consistency trước | 48 FK, 0 orphan, 0 Class mismatch |
| Trạng thái Expand trước thực thi | Chưa áp dụng |
| Writers | Không thấy peer connection, external InnoDB transaction hoặc metadata lock/schema operation đang hoạt động tại các lần kiểm tra |

Đã kiểm SHOW FULL PROCESSLIST, information_schema.innodb_trx và
performance_schema.metadata_locks. Chỉ lưu metadata/loại câu lệnh, không log SQL
người dùng chứa dữ liệu nhạy cảm. Không có routines/triggers/events trong database
đích bị bỏ qua bởi đánh giá này.

Trước DDL, tool giữ file lock cho process thực thi và hai database-scoped MySQL
named locks: schema-Expand và protocol Schedule hiện có. Sau đó kiểm lại đúng
server UUID, toàn bộ schema/count/hash của **25 bảng** bằng consistent snapshot
so với fresh verified baseline, history và external writers. Tất cả đạt trước DDL.
Named locks mang tính cooperative; không tuyên bố ngăn được DBA/SQL bất kỳ bỏ qua
protocol. Không bật global read_only hoặc tự quản lý/dừng process người dùng.

## 3. Fresh backup và restored rehearsal

Backup cũ còn nguyên, SHA-256:
`43321a36398ac4ce9310b15bbc0974f9b7eef631c70b629347116b43e79f9543`.

Fresh backup trước Expand được tạo bằng mysqldump single-transaction, không lock
tables hoặc ghi dữ liệu. Password chỉ chuyển trong process environment, không
đặt trong command arguments/log; không đổi appsettings hoặc tắt SSL database gốc.

Backup mới lưu bền tại:

```text
C:\Users\RescueAdmin\Downloads\edutrack_backup_before_schedule_expand_20261109_231603.sql
```

Kích thước **59.644 bytes**; SHA-256 sau dump và sau copy vào Downloads đều là:

```text
d9d4ace4ff72a9f3ef4db74d722ecccd760a8ae5517d93f2525f6206d2a6c84c
```

Kiểm hash toàn bộ database trước/sau dump không đổi. Scanner kiểm routing trước
import; restore chỉ vào schema random trên MySQL process riêng port 33308/datadir
Temp đã xác minh. **Tất cả 25 bảng, danh sách cột, counts và hashes của bản restore
khớp fresh development baseline**, gồm DeletedAt mới của recipient 19.

Rehearsal với source runtime mới đạt **70 compatibility assertions**: chỉ Expand
trên fresh legacy copy; HTTP ClassSessions/Schedule/Notifications 200; đủ 10 IDs,
không backfill và giữ mọi business hash. Kiểm Contract trong harness chỉ ở một
schema synthetic riêng, không trên copy legacy hoặc development.

Thử thêm đường thực thi giữ connection đã mở/named lock trên một copy fresh backup
khác: Expand và bảo toàn hashes đều đạt trước khi thực thi development.
Các server test đều được runner shutdown sau khi kiểm đúng datadir.

## 4. Thực thi migration được duyệt

EF dùng **EduTrackDbContext** migration model, static MySqlServerVersion và
IMigrator từ tool/test assembly riêng; không chạy API startup/Program/DbSeeder,
không dùng runtime context tạo schema. Lệnh EF thực tế:

```csharp
await db.GetService<IMigrator>()
    .MigrateAsync("20261109004646_ScheduleVersionExpand");
```

Tool đọc connection trong bộ nhớ và giữ cùng connection đã xác minh/khóa.
Mọi câu DDL/gate là của Expand nguyên bản; không chỉnh migration/gates/snapshot.
Không chạy target latest, Contract, Phase 3, utility backfill, Down hoặc restore.
Không UPDATE business row, chuyển Attendance, sửa ID hoặc suy planned date.

History trước vẫn 7 migrations kết thúc AddStudentGrade. History sau:

```text
20261012134022_InitialCreate
20261019061116_AddTitleAndDescriptionToApprovalRequests
20261101011722_AddPaymentAdditionalCharges
20261102032813_AddNotificationRecipientsAndSender
20261102045221_AddNotificationRecipientDeletedAt
20261107002822_AddGradeClassification
20261107061101_AddStudentGrade
20261109004646_ScheduleVersionExpand
```

Hai lỗi trong tool Temp được ghi đầy đủ, không tính thành PASS: lần đầu context
chưa khởi tạo vì Pomelo cần AllowUserVariables=true/UseAffectedRows=false trên
external open connection; xác minh chưa gọi migration, schema/history còn nguyên,
sửa options trong tool và rehearsal lại độc lập trước khi tiếp tục. Lần thực thi
sau, migration **hoàn thành**, history/data/FK checks đạt nhưng reader metadata
dùng key lowercase trong khi MySQL trả uppercase. Không chạy lại migration hoặc
rollback; sửa reader Temp và hoàn tất xác minh bằng đường **READ ONLY**.

## 5. Schema và bảo toàn dữ liệu

| Thành phần | Sau Expand |
|---|---|
| planned_occurrence_date | DATE NULL |
| schedule_version_id | INT NULL |
| occurrence_week_start | DATE NULL, STORED GENERATED |
| class_schedule_versions | Tồn tại, 0 rows |
| Contract unique/NOT NULL | Chưa áp dụng |
| FK | 50, orphan counts đều 0; Class mismatch 0 |

Biểu thức generated column được MySQL chuẩn hóa:

```sql
(`planned_occurrence_date` - interval weekday(`planned_occurrence_date`) day)
```

| Bảng | Trước / Sau | SHA-256 của cột cũ trước = sau |
|---|---:|---|
| class_sessions | 10 / 10 | 8f7c3f8a7ad0f79063803b59d530e96b8b44f62d2f01f6e13c0efcc9c381a70f |
| class_schedules | 4 / 4 | aca6419f36f166297abbbfe49b27163d47d4bbe98688442561516a4512f0e99c |
| attendance | 6 / 6 | 8fce8183a55d0ba3730cc75e1a9807aba9d3b81267c2da3cb8991d7ee910377d |
| notification_recipients | 43 / 43 | b9aa12a8de30ee1d4745a68d92f2c444fdb62ff45a37127e3ebeadf4b037e183 |

Các bảng nghiệp vụ cũ khác cũng giữ nguyên hash/số dòng/cột cũ. ClassSessions có
thêm cột nên hash *toàn bộ schema mới* khác schema cũ là đúng; phép đối soát bảo toàn
chỉ chọn cùng tập cột cũ. Snapshot đầy đủ sau Expand giữ nguyên trong suốt API/browser.
EF history là bảng duy nhất thêm row; class_schedule_versions là bảng mới rỗng.

Sessions 6–10 vẫn ScheduleId NULL; cả 10 planned/version/week vẫn NULL. SessionId,
actual date/time/room/status, các ScheduleId khác và toàn bộ Attendance giữ nguyên.

## 6. HTTP và Dashboard trên database development

Host loopback đăng ký production controllers/services với **EduTrackRuntimeDbContext**
từ bản build source mới. Không có DbSeeder/production Program; middleware chỉ cho
GET/HEAD, EF interceptor từ chối SQL ngoài SELECT. Không test mutation trên DB gốc.
Endpoint ngoài allowlist trả 404 rõ ràng, không mock hoặc empty-success fallback.

| Kiểm tra thực tế | Kết quả |
|---|---|
| GET /api/classsessions | **200**, đúng IDs 1–10 |
| GET /api/schedule/sessions, range 08/09–30/09 exclusive | **200**, đủ 10 actual Sessions, NULL provenance đọc an toàn |
| GET /api/notifications/inbox/snapshot?userId=1 | **200**, Inbox/Trash đúng contract |
| GET user-selection | **200**, chọn ID từ DB, không default principal/login |
| AD Dashboard 1440px / 390px | ClassSessions HTTP 200, section lịch hiển thị đúng empty state |
| CM Dashboard 1440px / 390px | Notifications card/count và Bell tải được |
| Sau mọi API/browser GETs | Toàn bộ table fingerprints như ngay sau Expand |

Ngày 09/11/2026 UTC+7 không có actual Session trong dữ liệu hiện tại: AD hiển thị
“Không có buổi học nào được xếp hôm nay.” Không tạo fake Session để có nội dung.
Đã xem screenshot desktop; 4 nhóm browser đạt, không API response >=400 trong run.
Browser chặn tài nguyên ngoài host; một số icon font cũ không tải, shared SVG Bell
vẫn hoạt động. Không gọi đây là nghiệm thu mọi nghiệp vụ tài chính/Approval.

**Giới hạn host:** không dừng/restart API đang chạy của người dùng; không xác nhận
URL/port API cũ đã nạp binary mới. Kết quả 200 trên development DB là qua host an
toàn chạy đúng source mới. Khi dùng launch setup bình thường vẫn cần kiểm tác động
automatic DbSeeder hiện có; không tự chạy Program để thay thế bước đó.

## 7. Regression mới và giới hạn còn lại

Kết quả regression cuối được ghi trong evidence của lượt này; các lỗi trung gian
không được tính PASS.

| Kiểm tra chạy mới | Kết quả |
|---|---|
| API + Ops/Compatibility/Read/Notifications builds | PASS, source copy/output Temp; API có 3 nullable warnings baseline, không sửa production để ép build |
| Frontend typecheck / unit / build | PASS; **162 tests**, 0 fail/skip; bundle warning baseline còn tồn tại |
| Fresh backup compatibility | **70 assertions** tổng, gồm 13 metadata checks offline; copy legacy chỉ Expand |
| Execution connection rehearsal | PASS trên private fresh copy: giữ named lock, chỉ Expand, giữ mọi business hash |
| Development schema/data verification | PASS qua READ ONLY; generated column/FK/history/nullable metadata đúng |
| Development HTTP + actual frontend | ClassSessions/Schedule/Notifications **200**; **4 dashboard groups** AD/CM × 1440/390 |
| Schedule Read regression | **60 assertions, 219 SELECT, 0 write attempts; 20 browser groups**; MySQL riêng |
| Notifications regression cuối | **49 assertions, 24 browser groups**, MySQL riêng; schema cleanup/server shutdown đạt |
| Git diff / source scope | diff --check PASS; 1.077 file đầu lượt không đổi SHA-256 |

Notifications browser run đầu hoàn tất 24 nhóm rồi vấp assertion nút “Chọn giao
diện” ngay sau đổi URL Home; script chờ URL nhưng chưa chờ DOM Home render. Rerun
nguyên source/test không sửa đạt toàn bộ, gồm bước đó. Giữ log và artifact lần lỗi;
không tính lần đó là PASS hoặc thay code/fallback production để qua test. Đây là
timing risk của test hiện có, không sửa trong phạm vi migration.

CI compatibility: project/harness build và metadata mode trong compatibility run
đạt; workflow vẫn gọi đúng offline project, không database/import trong CI. Không
push nên chưa chạy GitHub-hosted CI. Không chạy Safari/thiết bị thật hoặc mutation
workflow trên development database.

Phase 2 management/generation vẫn bị mapping gate với Class legacy: chưa có source
versions/planned metadata được đối soát. Contract chưa chạy nên không tuyên bố
toàn hệ thống có occurrence unique cuối cùng. Cần owner xử lý mapping, Attendance
writers và seeder trong quy trình riêng; không tạo dữ liệu mặc định để vượt gate.

Migration Phase 3 chưa chạy; typed detail table chưa có trên development database.
GenericRoutesGuarded và AttendanceWritesCoordinated giữ mặc định false; Approval
generic guards/Attendance concurrency vẫn là dependency cũ. Không sửa Auth hoặc
đưa Authentication/Authorization trở lại. Không production-ready/public deploy.

## 8. Evidence và Git

Evidence ngoài repository:

```text
%TEMP%/edutrack-drift-expand-69d032a6dcb145f180828750a09a9f34/
  source-baseline.json
  old-recipients.json, old-snapshot.json, current-recipients.json, current.json
  exact-drift.json, validated.json, backup-writers.json, apply-writers.json
  fresh-backup.sql, fresh-backup-metadata.json, durable-backup.json
  fresh-baseline.json, fresh-rehearsal/, fresh-rehearsal.log
  external-rehearsal.json, external-connection-rehearsal.log
  before-ddl-*.json/log, apply-final.log, history-after.json
  immediately-before.json, after-original-columns.json, post-expand-baseline.json
  verified-columns.json, verified-audit.json, final-snapshot.json
  development-verification.json, development-verification.log
  development-browser.log, migration-result.json
```

Dashboard artifacts: `%TEMP%/edutrack-development-dashboard-dsTDHC/`.
Không đưa SQL dumps, datadir, screenshots, tool/build output hoặc credentials vào Git.
Backup cũ, rehearsal cũ và báo cáo preflight BLOCKED giữ nguyên để đối chiếu.

Regression logs: `ScheduleRead-regression.log`, `Notifications-regression-final.log`,
frontend typecheck/test/build logs và các build logs trong cùng evidence. Lần
Notifications lỗi nằm ở `Notifications-regression.log`; final log có artifact path
và exit 0 riêng. Không thay bằng log từ các lượt nghiệm thu cũ.

Lượt này chỉ thêm báo cáo này trong repository; toàn bộ source/migrations/CI,
Notifications, No-Auth và Schedule implementation giữ nguyên. Không stage/commit/
push/merge/reset/rebase/stash/clean. Dừng sau nghiệm thu migration giới hạn Expand.

Git cuối: **56 modified + 2 deleted + 26 untracked files**, gồm dirty source từ
Notifications/No-Auth/compatibility đã có; index rỗng, không conflict, không commit
mới. Chỉ thêm `docs/EDUTRACK_SCHEDULE_EXPAND_DEVELOPMENT_RESULT.md` trong lượt này.

Có thể chuẩn bị review phạm vi commit source tiếp theo; task này không stage hoặc
cho phép push/PR/deploy. Expand development đã được xác minh không đồng nghĩa cho
phép Contract/Phase 3, bật integration flags hoặc tuyên bố production-ready.
