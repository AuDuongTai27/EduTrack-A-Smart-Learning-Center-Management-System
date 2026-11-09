# EduTrack — Schedule Phase 2: Approved database design implementation

Ngày: 09/11/2026, Asia/Bangkok (UTC+7). Branch: `Duy`.

Đã triển khai versioning/occurrence và chạy migration trên **MySQL test độc lập**.
Chưa áp dụng lên database development, chưa commit/push/merge/rebase. Dừng để
người dùng nghiệm thu implementation và evidence trước khi cho phép cutover.

Thiết kế được dùng là `docs/EDUTRACK_SCHEDULE_PHASE2_DATABASE_DESIGN.md` đang có
trong repository; không có file mang hậu tố `FINAL_DATABASE_DESIGN.md`. Nội dung
được duyệt khớp các quyết định ScheduleId ổn định, version theo tuần và unique
occurrence trong yêu cầu triển khai. Không sửa proposal hoặc báo cáo Phase 2 cũ.

## 1. Hành vi đã triển khai

- `ClassSchedule` giữ danh tính ca. `ClassScheduleVersion` chứa weekday/time/room
  và khoảng DATE `[EffectiveFrom, EffectiveTo)`, biên Thứ Hai. Tạo/đổi/retire đều
  có Preview và Confirm riêng; tuần hiệu lực sớm nhất là tuần sau theo UTC+7.
- Thay lịch append successor trên cùng ScheduleId; không tự ghi đè version tương
  lai đã lên kế hoạch. Retire đóng khoảng, không xóa root/version/Session.
- Preview liệt kê các Session đã materialize từ tuần hiệu lực, gồm source version,
  planned date, actual booking/status và cờ Attendance. Confirm chỉ ghi timeline;
  các Session đã tạo giữ nguyên và được hiển thị là ngoại lệ theo version cũ.
- `ClassSession` giữ SessionId; thêm source version, original planned DATE và
  generated stored Monday. Unique `(schedule_id, occurrence_week_start)` áp dụng
  mọi status. Dời actual hoặc cancelled không giải phóng occurrence.
- Generate tra root/tuần trước actual time/date và trước version. Single/month
  Preview tìm cả original plans và candidate keys xuyên ranh tháng; record đã
  tồn tại ở actual month khác vẫn trả cùng SessionId. Không tự tạo makeup.
- Confirm kiểm lại principal/DB role/assignment, fingerprint timeline, Class dates,
  selected keys và conflicts Class/Teacher/TA/Room. Giữ named lock dùng chung trên
  MySQL connection + Serializable transaction; version writes còn lock root.
  Race đúng occurrence unique được rollback, đọc lại trong transaction mới và chỉ
  trả existing khi tìm đủ key; không nuốt mọi lỗi 1062.
- Actual snapshot giữ độc lập, kể cả TIME(6). GET/Preview không ghi. Calendar/List
  engine giữ nguyên; chỉ Session detail bổ sung provenance và panel Management
  bổ sung timeline/effective week/retained-session preview.

## 2. Migration source và kết quả trên MySQL test

Hai migration mới, kèm Designer và snapshot hiện tại:

| Migration | Nội dung và gate |
|---|---|
| `20261109004646_ScheduleVersionExpand` | Gate Class/Schedule consistency trước DDL; thêm bảng version, source/planned nullable, generated stored week, alternate/composite FKs RESTRICT, indexes và CHECKs |
| `20261109005859_ScheduleVersionContract` | Gate metadata đầy đủ, không logical duplicate và timeline không overlap; sau đó NOT NULL cho owner/source/planned, unique root/week và CHECK week không NULL |

Không sửa migration lịch sử. Không có default 0/ngày giả để ép NOT NULL. Down có
gate chặn khi đã có version/planned history; không tự làm mất lịch sử version.
DDL MySQL không được xem như toàn bộ quy trình rollback bằng một transaction.

**Có chủ đích giữ bốn cột definition cũ trên root.** `DbSeeder` vẫn là consumer tạo
root theo contract cũ và không được tự sửa trong lượt này. Các reader đã chuyển
sang Versions; ca mới điền bốn cột root một lần để tương thích schema cũ, không
duy trì chúng như current-version cache. Không được dùng app cũ để đọc lịch mới.
Cleanup/drop cột chờ owner chuyển seeder và rà hết consumers trước lần duyệt sau.

Rehearsal cuối tạo schema random
`edutrack_version_test_4a94bff1056b4fef9d9674e58f2a2295` trên process MySQL riêng,
port 33308/datadir Temp được runner xác thực. Trình tự đã kiểm thử:

1. Migrate tới baseline cũ; tạo synthetic legacy records có cả ScheduleId NULL,
   buổi cancelled đã dời qua năm/tháng và Attendance trỏ SessionId cũ.
2. Expand từ chối Class mismatch trước khi thêm cột. Sau xử lý riêng negative
   fixture test, Expand thành công và không tự suy planned date.
3. Backfill từ chối thiếu evidence, actual/Attendance hash stale, sai ca/version
   và mapping gây duplicate; transaction rollback metadata khi không hợp lệ.
4. Mapping một phần làm Contract dừng trước tightening, cột vẫn nullable. Các
   negative fixtures duplicate do bypass writer và version overlap cũng bị chặn.
5. Mapping synthetic đầy đủ rồi Contract thành công. Model/snapshot không còn
   pending changes; SessionId, actual fields/status và toàn bộ Attendance hash giữ
   nguyên. Raw INSERT duplicate root/tuần bị unique reject dù đổi actual/source/status;
   NULL, cross-Class/cross-root FK và ngày/giờ version sai bị constraint reject.
6. Generate/version/retire/retry/race và browser chạy trên schema đã Contract.
   Sau test runner cleanup schema và shutdown đúng process MySQL riêng.

Không đọc, ghi, seed hoặc migrate dữ liệu `edutrack_db` trong rehearsal. Không
chạy production host để test migration. HTTP host test chỉ đăng ký controllers
Schedule với principal do harness cấp bằng nonce, không chạy Program/DbSeeder thật.

Lúc scaffold đầu tiên, EF CLI dùng API startup đã thử discovery services và gọi
AutoDetect; kết nối thất bại ở SSL handshake trước SQL, không chạy migration/seed.
Sau đó mọi scaffold dùng **ScheduleManagement test startup**. Design-time factory
không đọc appsettings, dùng static server version và dummy endpoint port 1. Không
tái dùng API startup cho các lệnh EF. Evidence lần thử: `%TEMP%\edutrack-version-expand-scaffold.log`.

## 3. Backfill legacy và blocker thật

`ScheduleLegacyBackfill` là utility explicit mapping trong cửa sổ **sau Expand,
trước Contract**, không có HTTP endpoint hay auto-backfill trong migration.
Mapping cần SessionId, resolved ScheduleId/version, original planned date,
EvidenceReference và fingerprint actual/Attendance đã review. Chỉ UPDATE metadata;
không đổi SessionId, actual fields, status, Attendance hoặc enrollment.

Không gán planned bằng actual date toàn bảng; ScheduleId khác NULL cũng không được
coi là chứng minh lịch gốc. Synthetic fixtures có bằng chứng được khai báo rõ,
không dùng kết quả đó như bằng chứng dữ liệu thật đã map được.

**Chưa inventory database thật nên chưa biết số unresolved/duplicate hoặc khả năng
mapping thực tế.** Cutover bị chặn nếu còn thiếu nguồn planned, NULL owner/source,
Class mismatch, root chưa có version, logical duplicate hoặc overlap timeline.
Không chọn winner, xóa/gộp Session, cấp ca giả hoặc chuyển Attendance để qua gate.
Nếu duplicate thật cùng occurrence có Attendance, chủ dữ liệu phải quyết định
cách xử lý/thiết kế ngoại lệ riêng trước Contract.

Trước áp dụng thật phải backup/đối soát, dừng toàn bộ writer cũ, duyệt evidence
mapping và effective timeline; thử bản sao dữ liệu độc lập. MySQL cần enforcement
CHECK (8.0.16+). Chưa có lệnh triển khai development được chạy hay tự lên lịch.

## 4. Consumer và dependency owner

| Consumer | Adapter đã cập nhật |
|---|---|
| ClassSchedule repository/query service | Include Versions và chọn effective definition tại listing date; giữ DTO/UI cũ |
| Teacher/TA Schedule | Đọc effective versions thay root definition; giữ nghiệp vụ và UI |
| Teacher/TA My Classes | Summary giờ/thứ từ effective versions, giữ nhãn tiếng Việt |
| Learner dashboard/timetable | Adapter summary/weekday từ effective versions, giữ DTO/UI Student |
| Landing portal | Đếm ca có version đang hiệu lực thay root đã retire |
| Schedule read/detail | Thêm provenance; vẫn query/render theo actual SessionDate |
| Teaching dashboard | Đã dùng actual ClassSession nên giữ nguyên byte-for-byte |

Các adapter đã chạy regression; patch consumer chỉ đổi nguồn definition, không
ghi đè module hoặc đổi UI đồng đội. Owner nên review patch trước tích hợp.

Dependency chưa tự sửa:

- **Attendance:** GET writer cũ và mọi đường tạo Session phải được owner bỏ/chuyển
  protocol trước cutover. Sau Contract, INSERT thiếu metadata bị DB từ chối; đây
  không phải cách hoàn thiện workflow Attendance. Không sửa module Attendance.
- **Seeder/consumer cũ:** owner chuyển seed/fixtures sang root + version + planned
  metadata trước khi dùng schema mới; không seed development bằng seeder cũ. Bốn
  cột root giữ lại tới khi dependency này được xử lý và cleanup được duyệt.
- **Auth:** production vẫn cần principal/transport thật của owner; test nonce
  không có trong production. Chưa tuyên bố full login workflow đã nghiệm thu.
- **Approval/Phase 3:** chưa sửa. Reschedule/cancel cần cập nhật cùng SessionId,
  giữ planned/source identity, validate destination và apply request idempotent
  theo design được duyệt. Không tự đổi buổi tương lai khi đổi template.

Unique không thay thế resource conflict protocol hoặc cấm mọi SQL UPDATE/DELETE
tùy ý. Mọi writer phải giữ identity bất biến và không hard-delete Session.
Assignments vẫn là assignment hiện tại của Class; không thêm historical staff
snapshot. Không đổi business rules Tuition hay tháng học phí.

## 5. Kết quả kiểm thử mới

Các kết quả dưới được chạy trong lượt implementation schema này; không dùng số
test Phase 2 cũ làm bằng chứng schema mới.

| Kiểm tra | Kết quả |
|---|---|
| Frontend lint, typecheck/build | Đạt; upstream lint warnings và bundle >500 kB còn tồn tại |
| Frontend unit/contract | **138 pass**, 0 fail/skip; gồm validation version/occurrence và TIME(6) |
| Backend / harness build | Đạt; 3 nullable warnings baseline ở module nhóm, không warning mới trong Schedule |
| Version/occurrence offline | **27 assertions**, không host/DB; cũng nằm trong tổng harness dưới |
| Expand/Backfill/Contract + Management MySQL/HTTP | **109 assertions**, gồm offline, negative gates, FK/unique, preserved history, stale Preview, assignments, retry và concurrency |
| Management HTTP/browser | **3 viewport groups**: 1440px/390px/360px, schema thật đã migrate; create/replace/retire, explicit Preview/Confirm, giữ IDs Calendar/List |
| Schedule Read MySQL/HTTP/browser | **62 assertions, 193 SELECT, 0 write attempts**, toàn bộ table snapshot không đổi |
| Calendar/List browser | **20 groups**, 5 role × desktop/tablet/390px/360px |
| Class browser | **42 groups**, fixture HTTP interception, không live DB |
| Student browser | **12 groups**, fixture HTTP interception, không live DB |
| Tuition/KPI browser | **300 scenarios**, fixtures; Temp copy chỉ thêm Chrome --no-sandbox |
| StudentEnrollment MySQL | **73 assertions**, gồm Grade migration/native backup restore và migration history; isolated DB |
| Tuition database-only | **43 assertions**, schema mới; không khởi động production host |
| Student/Tuition offline policies | **26 / 27 + 18 assertions** |
| Teaching/TA/Student adapter regression | Assertions thực thi service thật trong Management harness, source effective versions |
| Scope/whitespace | HEAD/index giữ nguyên; protected modules/Calendar/List engine hashes không đổi; diff/whitespace checks đạt |

Các case chính: đổi weekday/time/room tương lai khi đã generate, retire sau generate,
old-source sessions, cancelled/completed, actual dời qua tuần/tháng/năm, Tue 31/08
→ Wed 01/09 cùng occurrence week, year-boundary Monday DATE, TIME(6), 5 confirms
đồng thời/single-vs-month, concurrent version append chỉ một thắng, stale Preview
khi timeline hoặc impacted sessions đổi, rollback sau INSERT trước COMMIT và lock
recovery. Test mới dùng unique thực tế, không thay bằng lock trong RAM.

Các lỗi test trung gian đã sửa trước pass cuối: count Saturday trong effective
range; assertion tiếng Anh thay nhãn tiếng Việt hiện có; Grade backup fingerprint
cần loại riêng bảng version **rỗng** trong rehearsal migration cũ và chặn nếu có
version giả. Không dùng fallback production để ép test qua. Browser là Chromium,
chưa thay nghiệm thu thiết bị thật/Safari hoặc full Auth/Attendance/Approval.

## 6. File thực sự thay đổi trong lượt này

Đối chiếu SHA-256 với manifest 1.027 file đầu lượt: **28 file có sẵn được sửa,
9 source mới và báo cáo mới này = 38 đường dẫn**. Danh sách dưới là delta của lượt
này, khác với toàn bộ git status vốn đã chứa implementation Phase 2 chưa commit.

28 file có sẵn (prefix `Capstone2/`):

```text
backend.Tests/ScheduleManagement/Program.cs
backend.Tests/ScheduleManagement/ScheduleManagement.Tests.csproj
backend.Tests/ScheduleRead/Program.cs
backend.Tests/StudentEnrollment/Program.cs
backend.Tests/TuitionIntegration/Program.cs
backend/Controllers/Schedule/ScheduleManagementController.cs
backend/Migrations/EduTrackDbContextModelSnapshot.cs
backend/Models/DTOs/Schedule/ScheduleManagementDto.cs
backend/Models/DTOs/Schedule/ScheduleReadDto.cs
backend/Models/EF/EduTrackDbContext.cs
backend/Models/Entities/ClassSchedule.cs
backend/Models/Entities/ClassSession.cs
backend/Repositories/Implementation/ClassScheduleRepository.cs
backend/Services/Implementation/ClassScheduleService.cs
backend/Services/Implementation/LandingPortalService.cs
backend/Services/Learning/Implementation/LearnerDashboardService.cs
backend/Services/Schedule/ScheduleManagementPolicy.cs
backend/Services/Schedule/ScheduleManagementService.cs
backend/Services/Schedule/ScheduleReadService.cs
backend/Services/Teaching/Implementation/TeachingMyClassService.cs
backend/Services/Teaching/Implementation/TeachingScheduleService.cs
frontend/src/BLL/models/ScheduleManagement.ts
frontend/src/BLL/models/ScheduleSession.ts
frontend/src/GUIs/components/shared/schedule/ScheduleManagement.tsx
frontend/src/GUIs/components/shared/schedule/ScheduleSessionDetail.tsx
frontend/src/api/scheduleManagementApi.ts
frontend/tests/scheduleManagement.http.browser.mjs
frontend/tests/scheduleManagement.test.mjs
```

9 source mới (prefix `Capstone2/`) và báo cáo:

```text
backend/Migrations/20261109004646_ScheduleVersionExpand.cs
backend/Migrations/20261109004646_ScheduleVersionExpand.Designer.cs
backend/Migrations/20261109005859_ScheduleVersionContract.cs
backend/Migrations/20261109005859_ScheduleVersionContract.Designer.cs
backend/Migrations/ScheduleMigrationGates.cs
backend/Models/EF/EduTrackDesignTimeFactory.cs
backend/Models/Entities/ClassScheduleVersion.cs
backend/Services/Schedule/ScheduleLegacyBackfill.cs
backend/Services/Schedule/ScheduleTimeline.cs
docs/EDUTRACK_SCHEDULE_PHASE2_DATABASE_IMPLEMENTATION.md (từ repository root)
```

Không sửa production Auth/Attendance/Approval/Tuition, Program, DbSeeder,
TeachingDashboard hoặc migration lịch sử. Không sửa Calendar/List/Workspace/CSS
engine trong lượt này. Các thay đổi CI/TuitionPolicy project/Workspace/CSS đã có
từ trước lượt triển khai được giữ nguyên.

`git diff --check` và file mới không có lỗi whitespace/conflict marker. Một dòng
trailing space trong `TeachingMyClassService` đã tồn tại nguyên văn trong backup
đầu lượt, ngoài adapter được sửa; không tính là whitespace mới.

## 7. Evidence và tái chạy

Log cuối trong `%TEMP%`:

```text
edutrack-version-http-final.log
edutrack-version-policy-final.log
edutrack-version-unit-final.log
edutrack-version-lint-final.log
edutrack-version-build-final.log
edutrack-version-read-browser.log
edutrack-version-enrollment-mysql-final.log
edutrack-version-tuition-mysql.log
edutrack-version-class-browser.log
edutrack-version-student-browser.log
edutrack-version-tuition-browser.log
```

Management screenshots/results cuối:
`%TEMP%\edutrack-schedule-version-browser-OPDt0y`.
Baseline backup/hash/scope và adapter patch:
`%TEMP%\edutrack-approved-version-5d0177ee-898b-48b9-b4b7-010fdacd47ce`.
Artifacts/dumps/Temp logs không được đưa vào repository.

Từ repository root, các lệnh test dùng runner MySQL riêng:

```powershell
npm.cmd run build --prefix Capstone2/frontend
dotnet build Capstone2/backend.Tests/ScheduleManagement/ScheduleManagement.Tests.csproj
dotnet run --project Capstone2/backend.Tests/ScheduleManagement/ScheduleManagement.Tests.csproj --no-build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File Capstone2/backend.Tests/StudentEnrollment/Run-IsolatedMySql.ps1 -TestAssemblyPath Capstone2/backend.Tests/ScheduleManagement/bin/Debug/net8.0/ScheduleManagement.Tests.dll -Http -FrontendRoot Capstone2/frontend
```

Runner yêu cầu port 33308 trống, kiểm port/datadir trước fixture writes và tự tạo
schema random; không nhận database development làm đích. Backfill test chỉ dùng
mapping synthetic trong harness. Không chạy `database update` với appsettings thật.

## 8. Git và điểm dừng

Branch `Duy`, HEAD vẫn `2ee1c99543d7d982e0bec036b3c461487a09da96`.
Index rỗng, không conflict, không commit/push/merge/rebase hoặc đổi remote.
Working tree cuối: **21 tracked modified + 25 untracked files** (đếm đường dẫn
file, mở rộng thư mục untracked). Trong đó có cả dirty files của Phase 2 đã tồn
tại trước lượt này; delta riêng được liệt kê ở mục 6.

Implementation và rehearsal schema mới đã hoàn thành trong phạm vi isolated test.
Áp dụng development vẫn chờ nghiệm thu và phê duyệt riêng; các gate dữ liệu thật,
Auth principal, Attendance writer và seeder owner chưa được coi là đã giải quyết.
