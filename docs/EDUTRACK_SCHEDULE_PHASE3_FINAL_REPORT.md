# EduTrack — Schedule Phase 3: hoàn thiện Schedule-owned và xác minh code nhóm mới

Ngày: 09/11/2026, Asia/Bangkok (UTC+7). Không commit hoặc triển khai database.
Tài liệu này cập nhật kết quả sau báo cáo `EDUTRACK_SCHEDULE_PHASE3_IMPLEMENTATION.md`;
báo cáo/evidence trước đó được giữ nguyên để đối chiếu.

## 1. Git thực tế: local chưa có merge mới

Đã kiểm tra branch/HEAD/status/index/conflict trước khi sửa source, sau đó
`git fetch origin --prune` để xác minh refs. **Không pull/merge vào working tree.**

| Ref | Commit đã xác minh |
|---|---|
| Local Duy / HEAD | `0b4e21e2303bb976f4ff69a934e1fc908bdc6e9a` |
| origin/Duy | `2bc3b2315a5992b90a4ac1ff2367795b68287911` |
| origin/main | `92605810402dfd89ddd4d272a74d192eda712824` |
| origin/viet | `21627d5c09f4f3861d64ce41669a57fbc8f36c90` |

Local là ancestor, chậm hơn origin/Duy **3 commits**, origin/main **4 commits**;
không có local-only commits. Index rỗng, không unmerged paths. Trạng thái đầu lượt
đúng **5 tracked modified + 16 untracked**. Không mặc định local đã ở `2bc3b23`.

Lịch sử mới ở remote: `21627d5` → PR36 merge `d56439b` → merge main vào Duy
`2bc3b23` → PR37 merge Duy vào main `9260581`. Tree của hai tip Duy/main giống nhau:
`5a6a1790a1c6fc7d627d6ef4d308e5d6714dad76`.

Phase 1 `2f1065dd1de3ba363b72117f2bf94d925c6b5062`, Phase 2 `0b4e21e…`, Task 04
`bdd7bf04b9c824a422307faed026078402e86c65` còn trong ancestry tương ứng; không sửa
history hoặc ghi đè code nhóm. Không reset/stash/clean/checkout overwrite/rebase/
cherry-pick/push. Chỉ fetch cập nhật remote refs.

Hai file khác giữa local base và remote mới:

```text
Capstone2/backend/Services/Teaching/Implementation/TeachingDashboardService.cs
Capstone2/frontend/src/DAL/teachingDAL.ts
```

Không file nào chồng với delta Schedule của lượt này. Local hai file vẫn giữ nguyên
vì chưa được phép đồng bộ dirty tree. Để kiểm thử code nhóm mới, tạo **bản ghép Temp**
bằng archive của đúng origin/Duy rồi overlay các file Phase 3 hiện tại. Đây không
phải Git merge hoặc thay HEAD. Canonical Git blobs của hai file nhóm trong bản ghép
khớp remote; khác LF/CRLF khi export được kiểm bằng Git filters. Vì remote Duy/main
cùng tree, bản ghép cũng dùng cùng source base với main ở mốc trên.

Các kết quả MySQL/browser/regression trong mục 6 chạy trên bản ghép này; build,
lint/unit/typecheck/build cũng chạy cho source local. Không báo local đã merge mới.

## 2. Source Phase 3 trước đó được bảo toàn

Đầu lượt đã đối chiếu SHA-256 với manifest cuối lượt Phase 3 trước: **không có
drift** ở các file đã báo cáo. Snapshot/backup 1.053 file được tạo ngoài repository
trước mọi edit. Không file source bị xóa hoặc thay bằng checkout từ remote.

Giữ entity/migration Phase 3, original snapshot, TIME(6), idempotency, transaction
và planned identity đã kiểm thử. Không sửa migration Phase 2 Expand/Contract,
explicit legacy backfill, generation/versioning, Calendar/List renderer/read engine,
Auth, Attendance, Tuition business rules hoặc sáu file đang chờ owner.

## 3. A — Chức năng Schedule-owned đã hoàn thiện và kiểm thử

### Backend

- Teacher Preview/Submit reschedule/cancel/makeup trên Session thật; fresh write
  yêu cầu active Teacher/assignment. Không nhận actor từ body/query/default ID.
- Pending/rejected không thay ClassSession; approved ghi actual/status, header
  approved và AppliedAt cùng transaction. Giữ SessionId, ScheduleId, source version,
  original planned date và generated occurrence week; makeup không tạo Session mới.
- Chặn completed/Attendance, ngoài Class dates, assignment revoked, stale actual/
  Preview và conflicts Class/Teacher/TA/Room. Dùng nguyên lock/transaction Phase 2.
- Retry submit cùng ClientRequestKey trả cùng request; claim/concurrent approvals
  chỉ apply một lần; failure sau SQL trước COMMIT rollback mọi phần.
- Bổ sung server `currentUserId` trong capabilities để UI xác định self-review/
  reviewer sở hữu claim, không dựa Auth cache ID mặc định. Đây là output, không
  nhận lại làm identity input. Bổ sung ReviewedAt từ header có sẵn, không đổi schema.
- Teacher gọi Claim/Decision bị 403 trước feature-gate check; authorized actor gặp
  integration chưa đủ nhận 503. GET/Preview không ghi dữ liệu.

### UI Schedule riêng, giữ nguyên sáu trang/module đồng đội

| Role/route | Hành vi đã kiểm thử trên app thật |
|---|---|
| Teacher `/teacher/schedule` | Mở real Session detail, Preview → Submit; mở **Lịch sử yêu cầu đổi lịch** ngay trong Schedule, filter/detail/status |
| CM `/center-manager/schedule` | Mở **Xử lý yêu cầu đổi lịch**, xem original/proposed/current, claim → Preview decision → explicit Confirm |
| AD `/admin-staff/schedule` | Cùng workflow review theo principal/DB role; xem applied history sau người khác xử lý |
| TA `/teaching-assistant/schedule` | Calendar/List/detail scoped, không form/action ghi Schedule |
| Student `/student/schedule` | Calendar/List/detail theo enrollment, không action ghi |

Panel mới nằm trong ScheduleWorkspace, không cần sửa Teacher Request page hoặc
AD/CM Approval pages. Các page hooks cũ vẫn là proposal chưa áp dụng.

Đã bổ sung loading, empty, list error/retry, unavailable, status Pending/Claimed/
Rejected/Approved, reviewer và ReviewedAt/AppliedAt hiển thị UTC+7. Ba snapshot
original/proposed/current tách rõ; nguồn planned/source version luôn hiển thị.
Self-review hoặc claim của người khác được disable ở UI; backend vẫn quyết định.

409 xóa token Preview cũ và yêu cầu review lại, không hiển thị thành công giả.
Lỗi network chưa biết kết quả giữ khả năng retry cùng key; không mock fallback.
Double-submit được chặn. Request list cập nhật bằng event riêng sau Submit/Claim/
Decision; **chỉ event apply thành công gọi official Calendar/List retry**. Pending/
Reject không chủ động refresh hoặc tạo ghost Session. Các refresh focus/visibility
vốn có của Phase 1 được giữ nguyên.

Responsive đã kiểm tra desktop 1440px, tablet 768px, mobile 390px và 360px. CSS mới
scope trong component riêng; không sửa CSS/engine Calendar/List của Phase 1.

## 4. B — Đã implement nhưng còn bị chặn khi dùng thật

Giữ hai cờ **mặc định false**, không thêm/bật chúng trong production appsettings:

```text
ScheduleChangeRequests:GenericRoutesGuarded = false
ScheduleChangeRequests:AttendanceWritesCoordinated = false
```

- Submit/Claim/Decision chưa được bật khi generic routes chưa an toàn; UI hiển thị
  unavailable/readonly tương ứng capabilities, HTTP write trả 503.
- Approve/apply vẫn bị 503 nếu Attendance concurrency contract chưa đạt, kể cả
  generic guards sau này đã được tích hợp. Không tuyên bố Attendance race đã giải quyết.
- Auth thật chưa được nghiệm thu. Không sửa Login/AuthContext/JWT/cookie/middleware;
  production không có test-principal bypass.
- Isolated host ban đầu đặt cả hai cờ false để test HTTP fail closed, sau đó chỉ
  test host opt in true để kiểm thử chức năng. Không dùng kết quả lab làm bằng chứng
  production-ready, không thay config của host đang chạy.

**Negative security test trên chính HTTP generic Approval route còn tái hiện được
bypass:** PUT review pending rồi approved trả success; header approved nhưng
AppliedAt NULL và Session snapshot không đổi. Schedule GET trả 409 cho trạng thái
inconsistent. Không báo bug này đã sửa. Negative fixture chỉ được restore trong
schema test random; không apply pending owner patch để làm test qua.

## 5. C — Dependency ngoài phạm vi, không tự sửa

1. **Approval/Teaching/Learner:** giữ nguyên sáu file trong
   `EDUTRACK_SCHEDULE_PHASE3_OWNER_INTEGRATION.md`: ApprovalRequestRepository,
   TeachingRequestService, LearnerDashboardService, TeacherRequestPage và hai
   AD/CM Approval pages. Cần guard generic add/edit/delete/review và direct writers/
   sample normalization trước bật submit; review phải dispatch atomic Schedule
   orchestrator hoặc reject typed IDs trước mutation. Không suy payload từ legacy text.
2. **Attendance:** TeachingAttendanceService/controller/DTO và attendance sheet cần
   bỏ GET writer ngoài protocol, dùng chung lock/session ordering, kiểm sheet
   fingerprint trước save. Check Attendance trước approve không tự giải quyết race
   với save đồng thời hoặc sheet stale. Giữ apply disabled tới khi owner tích hợp.
3. **Auth:** owner cung cấp principal/transport thật, subject/DB role thống nhất và
   401/403 contract. Không actor body/query/default ID. Test nonce chỉ nằm ở harness.
4. **Schema/cutover:** inventory/backup/evidence mapping dữ liệu thật, dừng writers,
   xử lý NULL/duplicate/class mismatch/version ranges và chuyển DbSeeder trước
   áp dụng development. Chưa đọc dữ liệu thật, không suy planned từ actual, không
   đổi SessionId/Attendance để vượt gate. Migration Phase 3 vẫn là
   `20261109024926_ScheduleChangeRequests`, không tạo migration mới ở lượt này.
5. **Delta dashboard mới của nhóm:** TeachingDashboardService mới có fallback đọc
   definition trên ClassSchedule root và dùng ScheduleId ở trường SessionId khi
   chưa có actual Session. Owner cần kiểm tra adapter version/retire và phân biệt
   planned/actual trước cutover. teachingDAL còn fallback riêng của module đồng đội.
   Không sửa hai file đó; Schedule mới luôn lấy target từ real ClassSession API,
   không dùng dashboard fallback ID hoặc mock data làm request target.
6. **Git base:** local còn behind remote; không pull khi dirty hoặc tự merge. Muốn
   chốt trên base đồng bộ mới cần thao tác Git được duyệt riêng, bảo toàn dirty source.

## 6. Validation mới, không dùng số pass cũ thay nghiệm thu

| Kiểm tra | Kết quả lần này |
|---|---|
| Local frontend lint/unit/typecheck/production build | Đạt; **151 tests**, 0 fail/skip |
| Remote-composed frontend lint/unit/typecheck/production build | Đạt; **151 tests**, 0 fail/skip |
| Backend local và remote-composed builds | Đạt trên output Temp; 3 nullable warnings baseline, không warning mới Schedule |
| Phase 3 migration/service/HTTP | **104 assertions**, gồm negative blocker tests, trên MySQL độc lập |
| Phase 3 component browser | **4 viewport groups**, reschedule/cancel/makeup, Preview/Submit/Confirm, retry/precision/identity |
| Phase 3 app Schedule browser | **20 role/viewport groups**, 5 role × 4 viewport; app routes thật |
| UI availability states | Loading/empty/list-error/503/retry bằng fault injection; 409 stale và 401 qua HTTP thật; không fallback dữ liệu |
| HTTP gates/security | Thực tế 401/403/409/503; default flags false chặn ghi; actual generic bypass tái hiện, chưa sửa |
| Phase 2 Management/Version/Generation | **109 assertions + 3 browser groups**, gồm Teaching/TA/Student adapters |
| Phase 1 Read/Calendar/List | **62 assertions, 193 SELECT, 0 write attempts**, snapshot tất cả bảng không đổi; **20 browser groups** |
| Class browser | **42 groups**, fixtures, không development API/DB |
| Student browser | **12 groups**, fixtures, không development API/DB |
| Tuition/KPI browser | **300 scenarios**, fixtures, không đổi business rules |
| Tuition database-only | **43 assertions**, MySQL isolated, không production host |
| Student/Tuition offline | **26 / 27 assertions**, không DB |
| Scope/hash/whitespace | Sáu owner files, protected modules và engines không đổi; diff check/file mới đạt |

104 assertions có các ca tái hiện blocker, **không phải 104 bằng chứng toàn hệ thống
đã an toàn production**. Frontend 503 fault injection chỉ kiểm UI; backend 503 được
kiểm riêng trên controller thật với flags false. Teaching regression ở đây là các
adapter Schedule, không tuyên bố dashboard fallback ngoài phạm vi đã version-aware.

Migration chạy lại trên populated Phase 2 synthetic fixtures; original Session/
Attendance giữ nguyên, legacy text không sinh detail, unique key/CHECK/FK được
DB enforce, empty Down/reapply đạt và Down có history bị chặn. Retry/concurrent
claims/approvals, revoked assignment, TIME(6), cross-month/year, rollback sau SQL
trước COMMIT, moved/cancelled occurrence không tạo lại đều chạy lại.

Phase 3 schema cuối: `edutrack_change_test_59091f6bb5cc426db48a0a7a24995a47`.
Runner kiểm port/datadir trước mọi write, dùng MySQL process riêng port 33308,
cleanup schema và shutdown đúng process. Không lệnh nào migrate/seed/ghi `edutrack_db`;
không chạy production Program/DbSeeder/EF startup discovery trong lượt này.

Một lỗi browser selector quoting ở lần trung gian đã sửa; lần fail đó không tính
pass. Bản archive export LF/CRLF khác raw bytes đã được kiểm lại bằng canonical Git
blobs; không có source nhóm bị overwrite. Không đổi production bằng mock/fallback
để test qua. Browser là Chromium, chưa thay Safari/thiết bị thật/login thật.

## 7. File thực sự sửa/tạo trong lượt hoàn thiện này

So với snapshot đầu lượt, **9 file có sẵn được sửa, 2 file mới = 11 đường dẫn**:

```text
M Capstone2/backend.Tests/ScheduleChanges/Program.cs
M Capstone2/backend/Models/DTOs/Schedule/ScheduleChangeRequestDto.cs
M Capstone2/backend/Services/Schedule/ScheduleChangeRequestService.cs
M Capstone2/frontend/src/BLL/models/ScheduleChangeRequest.ts
M Capstone2/frontend/src/GUIs/components/shared/schedule/ScheduleChangeRequests.tsx
M Capstone2/frontend/src/GUIs/components/shared/schedule/ScheduleWorkspace.tsx
M Capstone2/frontend/src/api/scheduleChangeRequestApi.ts
M Capstone2/frontend/tests/scheduleChanges.http.browser.mjs
M Capstone2/frontend/tests/scheduleChanges.test.mjs
A Capstone2/frontend/src/GUIs/components/shared/schedule/schedule-change-requests.css
A docs/EDUTRACK_SCHEDULE_PHASE3_FINAL_REPORT.md
```

M/A ở trên là delta lượt này, không phải Git staged status: nhiều file Phase 3 vốn
untracked từ trước. Không sửa 6 owner files, hai file team mới, Auth/Attendance/
Approval/Tuition production, DbSeeder, Program, migration lịch sử hoặc proposal cũ.

## 8. Git cuối và đánh giá commit local

Branch `Duy`, HEAD vẫn `0b4e21e2303bb976f4ff69a934e1fc908bdc6e9a`, index rỗng,
không conflict. Working tree **5 tracked modified + 18 untracked files**; có tài liệu
Phase 2 finalization/Phase 3 plan đã tồn tại từ đầu, không tính là file mới lượt này.
Tổng phạm vi Phase 3 chưa commit qua hai lượt là 22 file, cộng tài liệu plan cũ thành
23 đường dẫn trong git status. Không stage/commit/push/merge/rebase/cherry-pick.

**Schedule-owned đã sẵn sàng để review và commit local dưới trạng thái blocked mặc
định**, vì source/tests đạt và không bật các writer chưa an toàn. Chưa đủ cơ sở gọi
là “đã chốt trên local Duy sau merge mới”: HEAD local còn cũ, việc đồng bộ Git cần
được thực hiện riêng theo quy trình bảo toàn dirty source. Không production-ready;
không dùng commit source như phê duyệt migration development hoặc bật flags.

## 9. Evidence và điểm dừng

Evidence ngoài repo: `%TEMP%\edutrack-phase3-final-kQE4G7` gồm baseline/backup,
remote-base archive, `remote-composition.json`, `scope-check.json`, local-build và
remote-composed source, frontend exits/lint/unit/build, backend build logs,
`phase3-final.log`, `ScheduleManagement-regression.log`, `ScheduleRead-regression.log`,
`class-browser.log`, `student-browser.log`, `tuition-browser.log`,
`tuition-database.log`, `fixture-exits.json`, offline logs.

Browser cuối: `%TEMP%\edutrack-schedule-change-browser-v1T3w4` có results.json,
screenshots 1440/768/390/360 và request logs. Không đưa artifacts vào repository.
Các output backend dùng Temp để không đụng host/API executable của người dùng.

Đã hoàn thành các phần làm an toàn trong phạm vi Schedule. Dừng để nghiệm thu;
không hỏi lại/apply owner patch, không tự đồng bộ dirty branch hoặc bắt đầu deploy.
