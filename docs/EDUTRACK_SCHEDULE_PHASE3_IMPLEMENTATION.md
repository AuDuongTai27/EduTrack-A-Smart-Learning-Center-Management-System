# EduTrack — Phase 3 Schedule Change Requests: implementation và integration limits

Ngày: 09/11/2026, Asia/Bangkok (UTC+7). Branch `Duy`.
HEAD giữ nguyên `0b4e21e2303bb976f4ff69a934e1fc908bdc6e9a`.

Đã triển khai và kiểm thử phần **Schedule-owned** của Phase 3. Chưa xác nhận toàn
bộ workflow production hoàn tất: Approval guards/page hooks và Attendance concurrency
contract còn chờ owner. Theo trả lời của người dùng **“Chờ owner; giữ patch chưa áp
dụng”**, không sửa sáu file đồng đội trong patch review.

Không stage/commit/push/merge/rebase, không migrate/seed/ghi `edutrack_db`, không chạy
production host hoặc DbSeeder để test. Không sửa Auth, Attendance hay Tuition business
rules. Không viết lại Calendar/List hoặc generation/versioning của Phase 2.

## 1. Phần chức năng đã triển khai

`ScheduleChangeRequestDetail` liên kết 1–1 với ApprovalRequest bằng RequestId, trỏ
tới ClassSession thật bằng SessionId. Header dùng `RequestType=schedule_change`;
detail lưu ChangeKind, original actual snapshot, proposed actual, fingerprint,
ClientRequestKey và AppliedAt. Description chỉ chứa lý do; không phân tích text để
apply lịch hoặc backfill typed payload cho legacy requests.

Teacher active và có assignment active mới được tạo yêu cầu mới. Principal và DB
role quyết định quyền; DTO không nhận actor ID, unknown JSON properties bị từ chối.
Teacher chỉ xem typed requests của mình; AD/CM active có scope review. Tài khoản
nhiều role không tự review request do chính mình tạo.

- **Preview/Submit:** kiểm Session, planned identity, assignment, thời gian/Class
  dates và conflicts. Submit chỉ tạo header/detail pending, không ghi Session.
- **Reschedule:** approved cập nhật actual date/start/end/room trên cùng Session.
- **Cancel:** approved đổi status thành cancelled, giữ record và occurrence key.
- **Makeup:** chỉ áp dụng cho Session cancelled hiện có; khôi phục scheduled và
  cập nhật actual, không INSERT Session hoặc cấp ca mới.
- **Reject:** chỉ ghi request status/review reason; không đổi actual hay Attendance.
- **Policy:** chặn completed hoặc bất kỳ Attendance row; dời/hủy buổi chưa bắt đầu,
  destination tương lai trong Class active/upcoming. Makeup có thể lấy buổi cancelled
  cũ nhưng destination vẫn phải hợp lệ. Không có ngoại lệ Attendance được tự thêm.

SessionId, ScheduleId, ScheduleVersionId, PlannedOccurrenceDate và generated
OccurrenceWeekStart giữ nguyên qua mọi action. Snapshot/actual TIME(6) được giữ
đúng độ chính xác; đổi riêng date/room không âm thầm làm tròn giờ gốc. Giờ nhập mới
có thể HH:mm[:ss] hoặc phần thập phân tới microsecond; sub-microsecond không lưu được
bị từ chối. Picker hiển thị giây; state giữ full precision tới khi người dùng sửa giờ.

## 2. Transaction, stale và idempotency

Dùng nguyên `ScheduleWriteTransaction` của Phase 2: MySQL database named lock trên
connection, Serializable transaction, release lock trong finally. Decision còn
lock header và Session bằng FOR UPDATE. Chưa sửa protocol Phase 2.

Approval header phải pending và được reviewer claim trước decision. Claim bởi người
khác trả conflict. Decision Preview không ghi; Confirm đọc lại role/assignment,
request/claim, original Session fingerprint, Attendance, Class dates và allocation
Class/Teacher/TA/Room. Timeline/allocation đổi làm token cũ bị từ chối; template
đổi không tự đổi pending request hoặc repoint source version.

Approve ghi **actual/status + header approved + AppliedAt trong cùng transaction**.
Lỗi sau SQL trước COMMIT rollback cả ba. Không set approved trước rồi apply ở bước
riêng. Reject không thực hiện Session update. Các terminal states/detail không nhất
quán trả 409; Schedule API không coi header approved thiếu AppliedAt là đã áp dụng.

ClientRequestKey UUID unique: retry đúng requester/payload trả cùng RequestId, kể
cả response cũ bị mất. Key khác chủ thể trả 404, đổi payload dùng lại key trả 409.
Chỉ một pending typed request/Session được tạo trong shared transaction. Không có
unique DB xuyên header/detail để tự bảo đảm pending policy cho writer bất kỳ.

Retry approved/applied trả lại kết quả đã ghi, không apply lại hoặc đổi reviewer/notes,
kể cả actual sau đó đã có request hợp lệ khác. Các reviewer cùng confirm nhận một
AppliedAt; reviewer tranh claim chỉ một thắng. Hai request tranh destination không
được cùng commit. Các actual booking khác và template allocation chưa materialize
vẫn được kiểm; cancelled/moved occurrence không giữ thêm obsolete template booking.

## 3. Migration và isolated database results

Migration mới, kèm Designer và snapshot:

`20261109024926_ScheduleChangeRequests`

Chỉ tạo `schedule_change_request_details`: PK/FK RequestId RESTRICT, FK SessionId
RESTRICT, index SessionId, unique ClientRequestKey, CHECK kind và destination theo
kind/valid times. Snapshot original/proposed dùng DATETIME(6)/TIME(6); room nullable
VARCHAR(50), fingerprint VARCHAR(64), key VARCHAR(36), AppliedAt UTC nullable.
Down chỉ cho phép khi detail table rỗng; có audit/apply history thì chặn trước DROP.

Không sửa hai migration Expand/Contract hay explicit legacy backfill của Phase 2.
Không drop cột template cũ. Không sửa SessionId/Attendance hoặc suy planned dates.

Rehearsal cuối tạo schema
`edutrack_change_test_305e0fba5c5b4c96b775d39584c16ddc` trên MySQL riêng port
33308/datadir Temp được runner xác thực trước writes. Migrate tới Phase 2 Contract,
tạo synthetic fixtures có bằng chứng occurrence rõ ràng, Session/Attendance/legacy
text request; sau đó apply migration Phase 3. Kết quả:

- Session/Attendance snapshot giữ nguyên sau migration trên dữ liệu Phase 2 đã có.
- Detail table rỗng: không tự biến legacy Description thành command.
- Empty-table Down/reapply thành công, dữ liệu Phase 2 giữ nguyên.
- Unique ClientRequestKey, CHECK kind và RESTRICT Session được DB thực tế kiểm tra.
- Down bị chặn khi đã có typed history. Model/snapshot không có pending changes.
- Runner cleanup schema và shutdown đúng MySQL test process sau mỗi lần chạy.

Build đầu ở workspace bị khóa `EduTrack.API.exe` bởi process khác. Không dừng/restart
process đó; các build, scaffold và backend test sau đó chạy trên bản sao source
trong Temp. EF scaffold dùng ScheduleManagement **test startup**, design factory
static/dummy endpoint; không chạy API Program/AutoDetect/DbSeeder hoặc startup thật.
Lệnh restore dùng package cache và tắt NuGet audit riêng ở CLI, không đổi repository
package/audit config. Chỉ copy migration source/Designer/snapshot đã tạo về workspace.

## 4. API contract

Base `/api/schedule/change-requests`. Responses no-store. Subject từ principal;
roles/active status/assignment đọc DB, không từ query/body identity.

| Method/path | Contract |
|---|---|
| GET capabilities | canPreview/canSubmit/canReview/canApply/canViewAll và blocker thực tế |
| GET / ; GET /{id} | Typed requests theo scope; legacy text-only không có typed detail |
| POST preview | Teacher Preview input, không ghi |
| POST / | Teacher submit pending; PreviewToken + ClientRequestKey |
| POST /{id}/claim | AD/CM claim pending, không đổi Session |
| POST /{id}/decision-preview | AD/CM Preview approve/reject, reasons và token |
| POST /{id}/decision | Explicit Confirm; approve+apply atomically hoặc reject |

Submit input: `sessionId`, `changeKind`, `proposedSessionDate`, `proposedStartTime`,
`proposedEndTime`, `proposedRoom`, `reason`, `clientRequestKey`, `previewToken`.
Cancel phải để toàn bộ destination NULL. Decision input chỉ gồm `decision`
(`approved`/`rejected`), `reviewNotes`, `previewToken`; reject cần reason.
Không nhận RequestedBy/ReviewedBy/userId/planned/source identity để ghi.

DTO tách original/proposed/current actual, planned identity, status và AppliedAt.
401/403/404 cho authentication/role/scope, 400 cho input, 409 cho stale/conflict,
503 khi integration chưa bật. Không public apply endpoint bypass Approval.

## 5. Frontend thực tế và phần page integration còn chờ

Component mới `ScheduleChangeRequests` có form dời/hủy/bù, Preview/Submit riêng,
typed list/filter/detail, claim, decision Preview/Confirm, error/blocked states và
double-submit guard. State reset theo identity/session. API kiểm response shape,
key/Session/RequestId và approved/applied consistency; không mock fallback.

Đã gắn vào **Schedule Session detail** hiện có. Teacher workflow dùng Session thật,
hiển thị planned/source và actual/proposed. Capabilities từ server quyết định action;
TA/Student không có form mutation. Pending/rejected không tạo ghost Session hoặc
refresh official read source. Chỉ kết quả AppliedAt thành công phát event để
ScheduleWorkspace gọi lại read model; engine Calendar/List giữ nguyên.

Teacher Request page và AD/CM Approval pages **chưa được sửa**. Patch đề nghị chỉ
thêm import/panel sau PageHeader; không thay layout/list của đồng đội. Browser Phase 3
build chính component production vào entry Temp để test reviewer UI trên HTTP/MySQL
thật, không giả rằng page hooks đã tích hợp. Calendar/List regression dùng app thật.

## 6. Approval owner: patch chưa áp dụng và blocker tái hiện

Tài liệu review: `docs/EDUTRACK_SCHEDULE_PHASE3_OWNER_INTEGRATION.md`.
Sáu file production dưới giữ nguyên SHA-256 so với đầu lượt:

```text
Capstone2/backend/Repositories/Implementation/ApprovalRequestRepository.cs
Capstone2/backend/Services/Teaching/Implementation/TeachingRequestService.cs
Capstone2/backend/Services/Learning/Implementation/LearnerDashboardService.cs
Capstone2/frontend/src/GUIs/pages/teacher/Teacher/TeacherRequestPage.tsx
Capstone2/frontend/src/GUIs/pages/admin/AdminStaff/AdminStaffApprovalRequestPage.tsx
Capstone2/frontend/src/GUIs/pages/admin/CenterManager/CenterManagerApprovalRequestPage.tsx
```

Patch đề xuất: generic Add không tạo schedule_change text mới; generic update/delete
chặn typed ID, conditional review loại typed detail ngay trong SQL; Teaching/Learner
direct edit và sample normalization cũng phải bảo vệ typed header. New Schedule
orchestrator không gọi generic review rồi apply ở transaction khác.

**Test đã tái hiện generic repository hiện vẫn đổi được header typed thành approved
mà không apply Session. Đây là blocker thật, không phải proof bypass prevention.**
Test chỉ restore negative fixture trong schema random sau khi tái hiện; Schedule read
trả 409 cho state inconsistent. Không tự apply patch để làm security test thành pass.
Legacy text request giữ nguyên, không tự tạo typed detail hoặc apply.

Do đó hai cờ server-side mặc định **false**, không sửa appsettings để bật:

| Cờ | Tác dụng |
|---|---|
| `ScheduleChangeRequests:GenericRoutesGuarded` | Chưa xác nhận thì Submit/Claim/Decision bị 503, capabilities không cho ghi |
| `ScheduleChangeRequests:AttendanceWritesCoordinated` | Chưa xác nhận thì Approve/apply bị 503 dù generic guards đã có |

Chỉ isolated test host bật hai cờ để nghiệm thu Schedule-owned code. Cờ không thể
được truyền qua body/header client. Lab opt-in không phải xác nhận owner integrations
đã hoàn tất. Cần owner review/apply guards, test các generic endpoints và gắn UI hooks
trước khi cân nhắc bật workflow thật.

## 7. Attendance/Auth và cutover dependencies

Không sửa Attendance. Service đọc lại Attendance dưới transaction và chặn nếu đã
có row; test thêm Attendance **trước** approve xác nhận guard hoạt động. Chưa tuyên
bố giải quyết writer race đang diễn ra đồng thời hoặc stale attendance sheet.

Owner Attendance cần phối hợp `TeachingAttendanceService`, controller/DTO và frontend
sheet: bỏ GET writer ngoài Schedule protocol, dùng cùng lock/session ordering, kiểm
sheet fingerprint trước save/status update. Attendance thắng thì approve phải chặn;
apply thắng thì sheet actual cũ phải reload. Chưa có contract đó thì apply gate giữ tắt.

Auth owner cần principal/transport thật và claim NameIdentifier/sub thống nhất với
DB role hiện hành. Không thay AuthContext/Login/JWT/middleware hoặc body actor fallback.
Nonce principal chỉ có trong isolated test assembly; chưa nghiệm thu login thật.

Database development vẫn chờ inventory/backup/review mapping của Phase 2, writer
cutover và owner seeder chuyển sang version/occurrence. Chưa đọc dữ liệu thật nên
không biết unresolved/duplicates; không dùng synthetic mapping làm bằng chứng dữ
liệu thật đã giải quyết. Không chạy production DbSeeder trên schema mới.

## 8. Test results mới trong lượt này

| Kiểm tra | Kết quả |
|---|---|
| Backend build (bản sao Temp) | Đạt; 3 nullable warnings baseline của đồng đội, không warning mới trong Schedule |
| Frontend lint/typecheck/build | Đạt; warnings upstream và bundle >500 kB còn tồn tại |
| Frontend unit/contract | **149 pass**, 0 fail/skip; 11 nhóm Phase 3 mới |
| Phase 3 migration/service/HTTP | **93 assertions**, gồm 3 offline checks và assertions tái hiện blocker; không coi tất cả là proof production readiness |
| Phase 3 browser component | **3 groups** 1440px/390px/360px, MySQL/HTTP thật, owner page hooks chưa áp dụng |
| Phase 2 Management regression | **109 assertions + 3 browser groups**, gồm version/occurrence và Teaching/TA/Student adapters |
| Schedule Read regression | **62 assertions, 193 SELECT, 0 write attempts**, toàn bộ table snapshot không đổi |
| Calendar/List browser | **20 groups**, 5 role × 4 viewport |
| Class browser | **42 groups**, fixtures, không live development API/DB |
| Student browser | **12 groups**, fixtures, không live development API/DB |
| Tuition/KPI browser | **300 scenarios**, fixtures; Temp script copy chỉ thêm Chrome --no-sandbox |
| Tuition database-only regression | **43 assertions**, isolated schema mới; không production host |
| Student/Tuition offline | **26 / 27 assertions**, không DB |

Cases Phase 3: permissions/IDOR/assignment revoked, client actor bị 400, same-key retry
và payload mismatch, pending/rejected giữ nguyên official Session, reschedule/cancel/
makeup, completed/Attendance guards, Class/Teacher/TA/Room conflicts/adjacency,
Class-date/timeline Preview stale, original actual stale, concurrent claim giữa AD/CM,
5 concurrent confirms, conflicting destinations, lost-response replay, rollback sau
actual/header/marker SQL trước COMMIT, giữ toàn bộ Attendance fingerprint gốc,
cross-month/year/source version, TIME(6), generate moved/cancelled không tạo lại.

Các lỗi trung gian đã sửa trước pass cuối: fixture Attendance thiếu recorded_at;
Temp host root chưa được tạo; browser helper date-only vẫn chỉnh time fields do
thao tác sửa script không khớp anchor. Những lần fail đó không tính pass. Precision
case cuối đã chạy cả DB và browser; không sửa production bằng fallback để qua test.
Chromium chưa thay nghiệm thu thiết bị thật/Safari hoặc full Approval/Attendance/Auth.

## 9. File thay đổi và Git

Delta lượt này: **5 file có sẵn được sửa + 15 file mới = 20 đường dẫn**.
Prefix source/test dưới là `Capstone2/`:

```text
M backend.Tests/TuitionPolicy.Tests.csproj
M backend/Migrations/EduTrackDbContextModelSnapshot.cs
M backend/Models/EF/EduTrackDbContext.cs
M frontend/src/GUIs/components/shared/schedule/ScheduleSessionDetail.tsx
M frontend/src/GUIs/components/shared/schedule/ScheduleWorkspace.tsx
A backend.Tests/ScheduleChanges/Program.cs
A backend.Tests/ScheduleChanges/ScheduleChanges.Tests.csproj
A backend/Controllers/Schedule/ScheduleChangeRequestsController.cs
A backend/Migrations/20261109024926_ScheduleChangeRequests.cs
A backend/Migrations/20261109024926_ScheduleChangeRequests.Designer.cs
A backend/Models/DTOs/Schedule/ScheduleChangeRequestDto.cs
A backend/Models/Entities/ScheduleChangeRequestDetail.cs
A backend/Services/Schedule/ScheduleChangeRequestService.cs
A frontend/src/BLL/models/ScheduleChangeRequest.ts
A frontend/src/GUIs/components/shared/schedule/ScheduleChangeRequests.tsx
A frontend/src/api/scheduleChangeRequestApi.ts
A frontend/tests/scheduleChanges.http.browser.mjs
A frontend/tests/scheduleChanges.test.mjs
```

Hai tài liệu mới từ repository root:

```text
A docs/EDUTRACK_SCHEDULE_PHASE3_OWNER_INTEGRATION.md
A docs/EDUTRACK_SCHEDULE_PHASE3_IMPLEMENTATION.md
```

Manifest đầu lượt có 1.038 file. So hash xác nhận sáu owner files, Auth/Attendance/
Approval/Tuition production, DbSeeder/Program, Phase 2 migrations/backfill/generation,
Calendar/List renderer/read engine/CSS và tài liệu kế hoạch cũ không đổi.
`git diff --check` và whitespace/conflict-marker check file mới đạt.

Git cuối: branch `Duy`, HEAD vẫn commit Phase 2 `0b4e21e2303bb976f4ff69a934e1fc908bdc6e9a`,
index rỗng, **5 tracked modified + 16 untracked files**. Trong 16 untracked có
`EDUTRACK_SCHEDULE_PHASE2_FINALIZATION_AND_PHASE3_PLAN.md` đã tồn tại từ đầu lượt;
không tính file đó là thay đổi Phase 3. Không có commit/push/merge/rebase.

## 10. Evidence và tái chạy an toàn

Evidence nằm ngoài repository: `%TEMP%\edutrack-phase3-yYOL1N` gồm baseline/scope JSON,
owner-proposals và patch **chưa áp dụng**, Temp build source, scaffold/build logs,
`changes-http-final.log`, `frontend-*-final.log`, `frontend-exits.json`,
`management-regression.log`, `read-regression.log`, `regression-exits.json`,
`class-browser.log`, `student-browser.log`, `tuition-browser.log`,
`tuition-database.log`, `student-offline.log`, `tuition-offline.log`.

Browser Phase 3 cuối: `%TEMP%\edutrack-schedule-change-browser-cGpKWZ` chứa screenshots
và results.json; component được compile từ source thật vào entry Temp. Không đưa
build outputs, dumps, Chrome profile hoặc screenshots vào repository.

Tái chạy sau build bằng runner đã có, với TestAssemblyPath trỏ DLL ScheduleChanges
trong Temp build hoặc output riêng không bị host khóa:

```powershell
npm.cmd test --prefix Capstone2/frontend
npm.cmd run build --prefix Capstone2/frontend
powershell.exe -NoProfile -ExecutionPolicy Bypass -File Capstone2/backend.Tests/StudentEnrollment/Run-IsolatedMySql.ps1 -TestAssemblyPath <isolated-build>/ScheduleChanges.Tests.dll -Http -FrontendRoot Capstone2/frontend
```

Runner yêu cầu port 33308 trống, tạo process MySQL/datadir riêng, xác minh identity
trước writes và dùng random schema. Không thay đích bằng development database.
Không gọi API startup hoặc database update qua appsettings thật để tái chạy test.

Dừng để nghiệm thu phần Schedule-owned và chờ owner integration. Không coi Phase 3
là production-ready khi generic guards, page hooks và Attendance/Auth dependencies
chưa được giải quyết; không tự áp dụng patch đang chờ review.
