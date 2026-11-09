# EduTrack — Bỏ dependency Authentication/Authorization

Ngày 09/11/2026, Asia/Bangkok. Branch `Duy`, HEAD
`22a07dc6847abcfb4f1d9789f209f2b853dc3dcf`.

Đã chuyển các luồng đang dùng principal/AuthContext sang **chọn tài khoản dữ liệu
theo route/role và DB**. Không tạo Authentication thay thế, Demo Mode, JWT, cookie,
session, principal giả, bypass middleware hoặc Auth feature flags. Không cần đăng
nhập để vào các giao diện hoặc gọi API với userId/senderId phù hợp.

**Đây là hệ thống không có bảo vệ truy cập giữa người gọi API.** userId/senderId là
dữ liệu do client chọn; người gọi cố ý có thể chọn ID của tài khoản khác. Các rule
về recipient, phân công, trạng thái Class, Attendance, học phí và xử lý request là
quy tắc dữ liệu/nghiệp vụ, không phải bằng chứng Authentication/Authorization.

Không commit/push/merge/rebase/reset/stash/clean. Không migrate/seed/ghi hoặc đọc
dữ liệu nghiệp vụ `edutrack_db`; không chạy production Program/DbSeeder. Báo cáo
Notifications trước được giữ làm lịch sử nghiệm thu của kiến trúc trước; các nhận
định cần Auth/principal trong báo cáo đó được thay bằng kết quả lượt này.

## 1. Thay đổi kiến trúc và xác định user

Backend thêm GET `/api/user-selection?role=...`: query users active có DB role tương
ứng, sort UserId; trả code/name/email/avatar/status/roles, không password hash. Có
CM, AD, Teacher, TA (bao gồm alias ta), Student và Parent. Không đóng vai trò cấp
quyền hoặc tạo identity, không có mutation trong endpoint này.

Frontend `userSelection.ts` + `useSelectedUser` chọn dataset theo prefix route:
center-manager → center_manager, admin-staff → admin_staff, v.v. Nếu ID đã chọn trong
localStorage còn thuộc danh sách DB thì dùng lại; nếu không thì chọn tài khoản active
đầu tiên trong danh sách DB. Không mặc định ID 1/2/3/5. Empty/error là trạng thái thật,
không tạo tài khoản hoặc mock fallback. Account dropdown CM/AD cho đổi lựa chọn trong
các tài khoản role đó. Đây là preference dữ liệu, không phải login/session.

API clients Schedule/Notifications gửi userId query; Sent gửi senderId; tạo thông
báo gửi senderId trong body. Các factory API Schedule nhận optional selectedUserId
để có thể dùng như client dữ liệu độc lập và kiểm thử offline. Khi app chạy, lựa
chọn được resolve qua DB endpoint; không có nhánh localhost hoặc test principal.
Credentials của các clients đã chuyển là omit, không yêu cầu token/cookie.

Cache Notifications vẫn chia theo selected user/role; đổi lựa chọn bỏ data/request
trước đó. Schedule reset selection/mutation/preview state theo cùng DB user được
chọn. DB roles vẫn phân loại persona và capability nghiệp vụ; caller không được
xác thực là người sở hữu ID đó và có thể chọn persona khác qua API.

Không inventory ID trên database development. Thay vì cố định seed ID, runtime
query DB hiện tại; đã nghiệm thu trên DB riêng dùng IDs 501–507 và unit dùng 701,
811, 905, có preference seed ID không tồn tại. Không tuyên bố dữ liệu thật đã sạch.

## 2. Dependency Auth đã bỏ

- Xóa AuthContext/mock-default-user provider khỏi App và barrel export; bỏ file
  AuthContext không còn dùng. Các consumer cũ chuyển sang useSelectedUser hoặc bỏ
  action Auth không còn tồn tại.
- Bỏ LoginModal giả (username/password không xác thực nhưng dẫn vào app). Landing
  Header/Hero mở WorkspaceChooser gồm các link role trực tiếp, không form đăng nhập.
- Bỏ UseAuthorization ở Program. Không thêm middleware, scheme hoặc DI Auth.
- ScheduleRead/Management/Changes không còn ClaimsPrincipal/RequireSubject. Service
  nhận int userId, kiểm dữ liệu user và business rules như trước.
- NotificationInboxService không còn IsAuthenticated/claims. Input selector không
  hợp lệ/missing trả 400, user không có recipient trả 404, xóa unread trả 409. Không
  trả 401 do thiếu login; role/account không phù hợp workflow là lỗi dữ liệu 400.
- TopBars, các Dashboard CM/AD, Schedule hooks/panels và API clients không cần
  AuthContext. Admin account hiển thị tài khoản DB đang chọn, không “Chưa xác minh”.
  Teacher/TA profile header cũng lấy DB selection thay việc tải ID 3/5 cố định.
- Các nút Đăng xuất không có session đổi thành **Về trang chủ**; không giả revoke
  token hoặc gọi logout API không tồn tại. Student/Parent navigation bỏ Auth dispatch.
- Test host không gán HttpContext.User hoặc tạo principal. HTTP business tests dùng
  query selectors bình thường; browser chọn dataset bằng route/localStorage preference.

Rà source production không còn AuthContext, ClaimsPrincipal, IsAuthenticated,
[Authorize], UseAuthentication hoặc UseAuthorization. Không có Login guard/permission
middleware cần bật ở các route hiện tại. Các module không có dependency Auth trước
đó không bị viết lại hoặc thêm Auth adapter mới.

## 3. API được điều chỉnh

| Nhóm | Contract mới |
|---|---|
| `/api/user-selection?role=...` | Danh sách account dữ liệu theo DB role, public |
| `/api/notifications/inbox/snapshot?userId=...` | Account metadata + server time + own selected-recipient Inbox/Trash/count |
| `/api/notifications`, `/inbox`, `/inbox/{id}`, `/{id}`, `/trash` | Thêm userId selector, không principal |
| `/api/notifications/{id}/read`, `/read-all`, `/{id}/inbox`, `/{id}/restore` | userId chọn đúng recipient record để mutation |
| POST `/api/management/notifications` | senderId body là selected sender; giữ validate target/type/content |
| GET `/api/management/notifications/sent?senderId=...` | Sent của sender được chọn |
| `/api/teaching/notifications` và read/read-all | userId data selector, không Auth; giữ recipient-only và không seed |
| `/api/schedule/sessions` và `/{id}` | userId query; giữ range/filter, Class assignment/enrollment scope |
| `/api/schedule/management/*` | userId query trên capabilities/templates/preview/confirm |
| `/api/schedule/change-requests/*` | userId query trên list/detail/preview/submit/claim/decision |

Thiếu selector không được hiểu là yêu cầu login. Caller cần chọn ID có thật; API
không tự dùng account 1/2/3/5. Không tuyên bố các scope này ngăn người gọi giả mạo ID.

## 4. Notifications và Account

Giữ shared Dashboard card CM/AD, Bell bốn role, Inbox/Sent/Trash, deep-link, Undo,
Restore, unread count, expiry timer, focus/revalidation/invalidation và error state.
Source recipient vẫn là NotificationRecipient, không dùng root IsRead. ReadAt chỉ
ghi lần đầu unread → read; reopen/F5/read-all/restore không reset. DeletedAt chỉ dùng
soft-delete, không xóa root hoặc làm mất Sent/recipient B.

Quick view vẫn filter toàn bộ tập đủ điều kiện rồi sort/take 5; unread không hết hạn,
read dùng `now < ReadAt + 300000ms`, legacy read NULL không bịa timestamp. Expiry
không ghi DB. Browser có lỗi đọc/restore thật, retry/Undo và đổi CM account 501→505;
count/list không giữ dữ liệu account cũ. Đổi role trong SPA lấy đúng dataset mới.

CM/AD avatar dropdown dùng account DB đang chọn, có name/code/email/role và account
selector, outside/Escape, Home action. Không còn fake login/logout. Không tạo Profile
route giả hoặc thay search/academic year/settings.

## 5. Schedule và dependency không thuộc Auth

Read, recurring versions/effective weeks, generation, occurrence uniqueness và
change-request service đều nhận selected userId. Không sửa engine Calendar/List,
schema, conflict rules Class/Teacher/TA/Room, planned identity, SessionId hoặc policy
chặn phiên đã có Attendance/completed. Preview/fingerprint, transaction/named lock,
rollback, stale protection và retry/idempotency được chạy lại.

**Hai integration gates Phase 3 có sẵn vẫn giữ nguyên:**

```text
ScheduleChangeRequests:GenericRoutesGuarded = false (mặc định)
ScheduleChangeRequests:AttendanceWritesCoordinated = false (mặc định)
```

Đây không phải Auth flags và không được dùng làm điều kiện đăng nhập. Test đã tái
hiện generic Approval route đổi typed header thành approved mà không apply Session;
Attendance writer concurrency chưa được owner tích hợp. Vì vậy ở app mặc định,
Submit/Claim/Decision vẫn có thể nhận **503 do integration an toàn dữ liệu**, không
phải 401 do thiếu Auth. Không xóa các gate để làm mọi nút chạy bằng cách bỏ business
integrity. Test host riêng opt in các gate để chạy lại transaction/reschedule/cancel/
makeup; không bật appsettings development hoặc public apply workflow.

Phase 2 schema/mapping/cutover và old writers/DbSeeder vẫn là dependency dữ liệu đã
có. DB thật thiếu version/occurrence columns hoặc legacy mapping vẫn có lỗi/gate
tương ứng; bỏ Auth không tự nâng cấp schema hay suy planned dates. Không thay các
điều kiện này bằng seed/fallback, không đổi SessionId/Attendance.

## 6. Kết quả kiểm thử thực tế

| Kiểm tra | Kết quả lượt này |
|---|---|
| Frontend lint/typecheck/build | PASS; warnings upstream/bundle size còn tồn tại |
| Frontend unit/contract | **162 pass, 0 fail/skip**; gồm 3 test DB user selection mới |
| Backend API + bốn harness builds | PASS; 3 nullable warnings baseline, không warning mới ở boundary sửa |
| Notifications + module GET smoke + HTTP/browser | **49 assertions** tổng, gồm 2 offline và browser aggregation |
| Notifications browser | **24 groups**, 4 role × 4 widths + 2 Dashboard × 4 widths, không login/principal |
| Schedule Read HTTP/MySQL/browser | **60 assertions, 219 SELECT, 0 write attempts**, snapshot mọi bảng không đổi |
| Calendar/List browser | **20 groups**, 5 role × 1440/768/390/360px |
| Schedule Management/Version/Generation | **112 assertions + 3 browser groups**, migration rehearsal DB riêng |
| Schedule Changes | **104 assertions**, gồm negative integration-blocker tests |
| Schedule Changes browser | **4 component + 20 actual workspace groups**, 1440/768/390/360px |
| Các module GET không Auth | **9 endpoints** trong Notifications harness, không cộng lại như tập mới |
| Source scope/whitespace/Git | Kiểm tra ở phần cuối; không stage/commit |

GET smoke thực tế: users, classes, subjects, grades, tuitioninvoices, teacherclasses,
taclasses, studentclasses, centersettings. Các query này trả success trên schema
test, không session/token. Approval generic review HTTP cũng chạy trong harness
Changes (bao gồm tái hiện blocker), không dùng principal.

Không gọi những GET rỗng này là nghiệm thu đầy đủ CRUD/KPI/Tuition/Attendance/
Teaching Monitoring trên dữ liệu thật. Các module đó được kiểm source dependency
và build; workflow sâu không được thay business logic hay báo PASS ngoài test đã chạy.
Các constants/mock adapters legacy ngoài các boundary được chuyển trong task này
không được xem là cơ chế Auth và không được dùng làm bằng chứng live integration.

Browser dùng API/MySQL riêng cho domain đang kiểm; API layout/domain ngoài scope
bị intercept 503 để tránh chạm host/data người dùng. Calendar, Management và Changes
đã chuyển test assumptions từ cookie/principal sang selector. Các nhãn log legacy
nhắc “401/IDOR/principal” không phải test Auth mới: assertions hiện tại kiểm data
selectors; không có fixture authentication middleware. Không dùng kết quả cũ làm
bằng chứng cho source mới.

Các lỗi trung gian đã sửa trước pass cuối: tests cũ chặn userId query trong Fetch
interception, chờ anonymous 401, allow-list host thiếu UserSelectionController,
component test cần Router sau khi dùng route selector, và assertion chờ form trước
khi chọn Class. Các run fail không được tính pass. Một old harness exception giữ
DLL Temp; build read cuối dùng output riêng/catch cleanup. MySQL run lỗi được dừng
chỉ sau kiểm đúng datadir Temp riêng, không dừng DB/API development.

## 7. Môi trường test, evidence và phần chưa chạy

Tất cả DB tests dùng runner port 33308, datadir Temp riêng, kiểm identity trước write,
schema random. Migrate Expand/Backfill/Contract/Phase 3 chỉ trên synthetic fixtures
đã có evidence trong harness, cleanup schema và shutdown process sau run. Không có
migration source mới; không chạy Program, AutoDetect hoặc DbSeeder production.

Evidence ở `%TEMP%/edutrack-user-selection-mfoDiw`:

```text
baseline.json, backup/, scope.json, scope-final.json
notifications-build-final.log, Schedule*-build-final.log, read-build-final.log
frontend-unit-final.log, frontend-lint-final.log, frontend-typecheck-final.log
frontend-build.log
notifications-final.log
read-browser-final.log
management-browser-final.log
changes-browser-final.log
```

Browser artifacts của các run cuối:

```text
edutrack-notifications-browser-czpbft
edutrack-schedule-browser-5XrLEW
edutrack-schedule-version-browser-fvSas3
edutrack-schedule-change-browser-sSsl3K
```

Không đưa artifacts/Chrome profiles/dumps/build outputs vào Git. Chưa đọc/kiểm thử
database development, chưa chạy Safari/thiết bị thật hoặc GitHub-hosted CI. CI hiện
chạy frontend tests/build và offline backend harness; không yêu cầu Auth secret.
Không push để kích hoạt CI, không thêm workflow deploy/public network.

## 8. Chạy trên máy thành viên khác

1. Restore/build bằng Node/.NET và DB connection hiện có của dự án. Không cần JWT
   secret, cookie config, DemoAuth flag hoặc cấu hình Auth theo máy.
2. Frontend: `npm ci` rồi `npm run dev` trong `Capstone2/frontend`; production build
   là `npm run build`. API URL/proxy vẫn dùng cấu hình API hiện có, không thêm env Auth.
3. API build: `dotnet build Capstone2/backend/EduTrack.API.csproj`. Chạy theo launch
   setup hiện có sau khi owner kiểm schema/data/writers của database đích. Program
   vẫn còn automatic DbSeeder baseline; lượt này không chạy nó hoặc sửa business seed.
   Không dùng việc chạy app để tự backfill/migrate dữ liệu thật.
4. Vào trực tiếp `/center-manager/dashboard`, `/admin-staff/dashboard`, `/teacher/schedule`,
   `/teaching-assistant/schedule`, `/student/schedule`, hoặc dùng Chọn giao diện ở Home.
5. Kiểm GET `/api/user-selection?role=center_manager` trên API: lấy ID từ DB hiện tại,
   không cần giống seed. CM/AD có thể đổi account qua avatar dropdown.
6. Notifications/Schedule requests cần userId; Sent cần senderId. Thiếu/sai ID là lỗi
   input/dataset, không thêm token hay login để “sửa” lỗi đó.
7. Nếu Phase 3 trả 503 hoặc version/legacy mapping chưa đạt, xem phần 5; không bật
   các gate hoặc chạy migration development khi chưa được duyệt riêng.

Tái chạy DB tests bằng `Run-IsolatedMySql.ps1` và DLL harness build trong Temp. Truyền
`-Http -FrontendRoot Capstone2/frontend` sau frontend build; không đổi connection đích
thành edutrack_db. Bản build đã dùng `read-output/ScheduleRead.Tests.dll` do output cũ
bị giữ; các harness khác ở `build/Capstone2/backend.Tests/<name>/bin/Debug/net8.0/`.

## 9. Giới hạn bảo mật và điểm dừng

Không có Authentication/Authorization là quyết định của task này. Dữ liệu theo
account chỉ là dataset selection; bất kỳ caller biết/chọn userId có thể thao tác
workflow của ID đó nếu business rules hợp lệ. Không tuyên bố bảo vệ dữ liệu cá nhân
khỏi caller cố ý giả mạo. Không public deploy, không mở DB ra ngoài mạng, không thêm
automatic deployment. Auth thật là task tương lai, không được lén thay bằng principal
giả hoặc localhost bypass.

Đã bỏ dependency Auth trong phạm vi toàn bộ source hiện tại có Auth blocking. Chưa
tuyên bố các dependency schema/Approval/Attendance hoặc mọi nghiệp vụ legacy đã
hoàn tất. Dừng sau source/tests/report, không commit hoặc push.

## 10. File và Git

Working tree trước lượt này đã có 38 đường dẫn Notifications chưa commit. Đã backup
1.067 file trước edit, giữ báo cáo/evidence Notifications trước và các chức năng mới.
Danh sách dưới là **delta của lượt bỏ Auth**, không phải toàn bộ Git dirty files.

```text
M Capstone2/backend.Tests/Notifications/Program.cs
M Capstone2/backend.Tests/ScheduleChanges/Program.cs
M Capstone2/backend.Tests/ScheduleManagement/Program.cs
M Capstone2/backend.Tests/ScheduleRead/Program.cs
M Capstone2/backend/Controllers/Management/ManagementNotificationsController.cs
M Capstone2/backend/Controllers/Management/NotificationInboxController.cs
M Capstone2/backend/Controllers/Queries/NotificationsController.cs
M Capstone2/backend/Controllers/Schedule/ScheduleChangeRequestsController.cs
M Capstone2/backend/Controllers/Schedule/ScheduleController.cs
M Capstone2/backend/Controllers/Schedule/ScheduleManagementController.cs
M Capstone2/backend/Controllers/Teaching/TeachingNotificationsController.cs
M Capstone2/backend/Models/DTOs/Management/CreateManagementNotificationDto.cs
M Capstone2/backend/Program.cs
M Capstone2/backend/Services/Notifications/NotificationInboxService.cs
M Capstone2/backend/Services/Schedule/ScheduleChangeRequestService.cs
M Capstone2/backend/Services/Schedule/ScheduleManagementService.cs
M Capstone2/backend/Services/Schedule/ScheduleReadService.cs
M Capstone2/frontend/src/App.tsx
M Capstone2/frontend/src/BLL/services/notificationInbox.ts
M Capstone2/frontend/src/DAL/adminStaffDashboardDAL.ts
M Capstone2/frontend/src/GUIs/components/landing/HeroSection.tsx
M Capstone2/frontend/src/GUIs/components/shared/notifications/NotificationQuickViews.tsx
M Capstone2/frontend/src/GUIs/components/shared/schedule/ScheduleChangeRequests.tsx
M Capstone2/frontend/src/GUIs/components/shared/schedule/ScheduleManagement.tsx
M Capstone2/frontend/src/GUIs/components/shared/schedule/useScheduleReadModel.ts
M Capstone2/frontend/src/GUIs/hooks/useNotificationInbox.ts
M Capstone2/frontend/src/GUIs/layouts/landing/Landing-page-layout.tsx
M Capstone2/frontend/src/GUIs/layouts/landing/LandingHeader.tsx
M Capstone2/frontend/src/GUIs/layouts/parent/ParentNavMenu.tsx
M Capstone2/frontend/src/GUIs/layouts/student/StudentNavMenu.tsx
M Capstone2/frontend/src/GUIs/layouts/teacher/TeacherTopBar.tsx
M Capstone2/frontend/src/GUIs/layouts/teacher/TeachingAssistantTopBar.tsx
M Capstone2/frontend/src/GUIs/pages/admin/AdminStaff/AdminStaffDashboardPage.tsx
M Capstone2/frontend/src/GUIs/pages/admin/CenterManager/CenterManagerDashboardPage.tsx
M Capstone2/frontend/src/GUIs/pages/landing/Landing-page.tsx
M Capstone2/frontend/src/api/notificationApi.ts
M Capstone2/frontend/src/api/notificationInboxApi.ts
M Capstone2/frontend/src/api/scheduleChangeRequestApi.ts
M Capstone2/frontend/src/api/scheduleManagementApi.ts
M Capstone2/frontend/src/api/scheduleSessionApi.ts
M Capstone2/frontend/src/api/teachingApi.ts
M Capstone2/frontend/src/contexts/index.ts
M Capstone2/frontend/tests/notifications.http.browser.mjs
M Capstone2/frontend/tests/schedule.http.browser.mjs
M Capstone2/frontend/tests/scheduleChanges.http.browser.mjs
M Capstone2/frontend/tests/scheduleChanges.test.mjs
M Capstone2/frontend/tests/scheduleManagement.http.browser.mjs
M Capstone2/frontend/tests/scheduleManagement.test.mjs
M Capstone2/frontend/tests/scheduleView.test.mjs
D Capstone2/frontend/src/GUIs/components/landing/LoginModal.tsx
D Capstone2/frontend/src/contexts/AuthContext.tsx
A Capstone2/backend/Controllers/Queries/UserSelectionController.cs
A Capstone2/frontend/src/BLL/services/userSelection.ts
A Capstone2/frontend/src/GUIs/components/landing/WorkspaceChooser.tsx
A Capstone2/frontend/src/GUIs/hooks/useSelectedUser.ts
A Capstone2/frontend/tests/userSelection.test.mjs
A docs/EDUTRACK_NO_AUTH_ACCEPTANCE_REPORT.md
```

Delta: 49 modified, 2 removed, 6 added.

Git working tree (including preserved Notifications work): **55 modified + 2 deleted + 19 untracked**. Index empty; no unmerged paths. HEAD/branch unchanged. No stage/commit/push.

| Final check | Result |
|---|---|
| No active AuthContext / principal / authentication middleware | PASS |
| Database-backed role/user selection, no seed-ID assumption | PASS |
| Notifications features preserved without login | PASS - HTTP/MySQL + 24 browser groups |
| Schedule data and transactions without principal | PASS - current harnesses and browser groups above |
| Existing business rules and Attendance identities preserved | PASS - regression assertions; no production business patches outside selector boundaries |
| Full development database / every legacy module workflow | NOT TESTED |
| Approval/Attendance owner integration | BLOCKED - existing non-Auth integrity dependencies; default apply gates preserved |
| No development DB migration/seed/write or Git publishing | PASS |
