# EduTrack — Dashboard Notifications, Bell, Trash và Admin Account

Ngày: 09/11/2026, Asia/Bangkok. Branch `Duy`.
Baseline/HEAD: `22a07dc6847abcfb4f1d9789f209f2b853dc3dcf` (main sau PR #39).

Đã triển khai source và nghiệm thu bằng principal test cô lập trên HTTP/MySQL riêng.
**Chưa nghiệm thu đăng nhập production; không tuyên bố production-ready.** Không
commit/push/PR, không pull/merge/rebase/reset/stash/clean; không migrate/seed/ghi
`edutrack_db`, không chạy production Program/DbSeeder hoặc đổi Auth toàn hệ thống.
Không cần migration: `notification_recipients` đã có IsRead, ReadAt và DeletedAt.

## 1. Kiến trúc trước và sau

Trước: CM Dashboard và các TopBar tải notifications toàn hệ thống rồi đếm IsRead
trên root. Teacher/TA TopBar còn lấy tổng số khi unread bằng 0. Các trang truyền
ID seed vào API; Inbox/Sent nhận userId/senderId từ query/body. Teaching Notifications
GET tự seed ví dụ; mark-read có thể tạo recipient và reset ReadAt. Teaching DAL có
mock fallback và báo mark-read thành công khi API lỗi. Các màn hình giữ state riêng.

Sau: `NotificationInboxService` xác định subject từ authenticated principal, kiểm
tài khoản active và roles trong DB. Recipient là nguồn duy nhất của membership và
read/delete state. Snapshot trả verified identity, serverNowUtc, toàn bộ Inbox,
Trash của CM/AD và unread count từ chính tập recipient chưa xóa đó. Không lấy 5
record trước rồi lọc; không dùng root Notification.IsRead để đếm cá nhân.

Frontend dùng policy/API/store/hook chung. Dashboard CM/AD và chuông bốn role dùng
cùng quick list; bốn trang Notifications dùng cùng Inbox state và component trang.
Gửi thủ công và Sent của CM/AD được giữ: all/role/class/user, loại thông báo, recipient
count, tìm/lọc/sắp xếp/phân trang và chi tiết. Sender được server xác định, không
tin body senderId. Không thêm automatic notifications hoặc hệ thống realtime.

## 2. API và quyền

| Endpoint | Hành vi |
|---|---|
| GET `/api/notifications/inbox/snapshot` | Verified identity + server clock + Inbox/Trash/count theo principal |
| GET `/api/notifications/inbox` | Array Inbox tương thích caller cũ; query userId không quyết định identity |
| GET `/api/notifications/inbox/{id}` | Chỉ detail chưa xóa của recipient hiện tại |
| GET `/api/notifications`, `/{id}` | Alias legacy nay giới hạn chính Inbox; không còn feed/detail toàn hệ thống |
| PATCH `/api/notifications/{id}/read` | Atomic unread → read, UTC ReadAt lần đầu; retry giữ nguyên timestamp |
| PATCH `/api/notifications/{id}/read?snapshot=true` | Cùng mutation, trả snapshot cho state chung |
| PATCH `/api/notifications/read-all` | Chỉ unread recipients hiện tại chưa xóa |
| DELETE `/api/notifications/{id}/inbox` | CM/AD, chỉ own read recipient; set DeletedAt, không DELETE root |
| GET `/api/notifications/trash` | CM/AD, own deleted recipients |
| POST `/api/notifications/{id}/restore` | CM/AD, own recipient; clear DeletedAt, giữ IsRead/ReadAt |
| POST `/api/management/notifications` | CM/AD active; senderId input bị bỏ qua, sender lấy từ principal |
| GET `/api/management/notifications/sent` | CM/AD, Sent của principal; không tin senderId query |
| Legacy `/api/teaching/notifications` + read/read-all | Principal scope, recipient-only, không seed/create membership hoặc reset ReadAt |

Missing/ambiguous principal trả 401; inactive/role không phù hợp trả 403; record không
thuộc Inbox hoặc đã xóa trả 404; xóa unread trả 409. Responses no-store. Không lộ
password hash, danh sách người nhận khác hoặc trạng thái riêng của người khác trong
Inbox. Teacher/TA không có quyền Trash/Restore ở backend và không thấy controls đó.

Không sửa Auth middleware để tạo principal. Không đưa test cookie/header hoặc
fallback actor vào production controllers/services. Query ID cũ có thể còn được
caller legacy truyền nhưng không còn giá trị cấp quyền.

## 3. Quy tắc năm phút và legacy

Điều kiện xem nhanh: chưa DeletedAt và (`!IsRead` hoặc `ReadAt != null` và
`now < ReadAt + 300000ms`). Sắp xếp CreatedAt giảm dần, NotificationId giảm dần,
sau đó mới lấy tối đa 5. Unread cũ vẫn đủ điều kiện; các mục unread tiếp theo được
đôn lên khi các mục read mới hơn hết hạn. Count là toàn bộ unread chưa xóa, không
phải số item đang hiển thị.

ReadAt được ghi UTC ở backend qua conditional UPDATE chỉ khi IsRead=false. Reopen,
F5, read-all hoặc restore không reset ReadAt đã lưu. Snapshot đọc datetime từ MySQL
và serialize UTC rõ ràng. UI hiển thị Asia/Ho_Chi_Minh, kể cả browser ở timezone khác.

Store lấy serverNowUtc làm mốc và dùng performance.now cho thời gian trôi qua; không
lấy lúc render/mount làm thời điểm đọc. Timer theo deadline gần nhất cập nhật quick
list từ toàn bộ Inbox, không gọi mutation. Đến đúng biên năm phút, predicate loại
record khỏi quick list; timer browser nền có thể bị throttle, focus/visibility sẽ
tính lại. Record vẫn ở Inbox, DeletedAt không thay đổi.

Legacy IsRead=true/ReadAt=NULL: loại khỏi quick list vì không chứng minh được còn
trong grace; vẫn giữ trong Inbox và cho CM/AD xóa/khôi phục theo trạng thái cũ.
Không bịa ReadAt. Root notifications không có recipient không được tự nhận là thư
của người dùng dựa vào label/target role hoặc UserId legacy. Không backfill membership
hoặc timestamp lịch sử trong task này; dữ liệu legacy cần owner xác minh riêng.

## 4. Đồng bộ state và trải nghiệm

- Một store theo local identity/permission/route-role boundary; local identity chỉ
  chia cache, không cấp quyền backend. Chỉ identity do server trả được dùng cho Admin
  account. Role trang không khớp DB roles thì không hiển thị Inbox.
- Mark-read/read-all/delete/restore chỉ cập nhật từ response backend xác nhận. Request
  đang ghi chặn double-submit; generation + AbortController bỏ response cũ khi đổi
  identity/unmount. Mutation lỗi không giả cập nhật thành công; 401/403 xóa identity/data.
- Các subscriber trong tab dùng cùng state. Storage invalidation cho tab khác;
  refresh on focus/visibility và revalidation 60 giây khi visible. Không SignalR,
  không cron/Hangfire, không polling dày. Timers/listeners/request được cleanup.
- Shared `DashboardNotificationsCard`: tiêu đề “Thông báo gần đây”, count chính xác,
  tối đa 5, sender/thời gian/type icon, mô tả hai dòng, nhấn nhẹ unread. Read bình
  thường, không badge đỏ. Empty state “Bạn đã xem hết thông báo mới.” và Xem tất cả.
  Card cao theo nội dung; đã override padding section của CSS landing bằng selector
  riêng, không để khoảng trống lớn hoặc sửa stylesheet đồng đội.
- `NotificationBellDropdown`: click chuông không mark-read. Links đi đúng route role
  và notificationId. Outside/Escape/select đóng; Escape trả focus về trigger, buttons
  và links dùng keyboard được, ARIA expanded/controls/region rõ ràng. Chuông và type
  icons dùng inline SVG, không phụ thuộc icon font CDN. Có override riêng để CSS
  mobile cũ không ẩn shared bell qua nth-of-type.
- Deep-link mở đúng item trong toàn bộ own Inbox dù ở trang lọc/phân trang khác.
  Không tự chọn record kế tiếp khi ID không tồn tại/đã xóa/không có quyền. Chỉ khi
  thực sự mở detail mới gửi mark-read. Sent/Trash detail không mark-read Inbox.
- CM/AD có Inbox/Sent/Thùng rác. Delete chỉ own read recipient, giữ root và Sent.
  Undo vẫn có thể thử lại sau restore lỗi. Restore giữ ReadAt cũ; quá grace thì chỉ
  trở lại Inbox, không trở lại quick list. Không thêm xóa vĩnh viễn.

## 5. Admin account dropdown

CM/AD hiển thị avatar hoặc initials từ verified identity, full name và user code
ở desktop, dạng gọn ở mobile. Dropdown có tên/email/code/DB roles, outside/Escape,
focus và nút Đăng xuất. Không seed account 1/2, không gọi profile ID cố định, không
tạo Profile route/module giả. Khi chưa xác minh, hiển thị trạng thái cần đăng nhập.
Search, theme button, center settings và academic year hiện có được giữ.

Logout xóa notification stores, dispatch `{type:'logout'}` theo AuthContext hiện tại
và navigate `/`. **Không có bằng chứng server session/token đã bị revoke:** Auth
hiện chưa hoàn chỉnh và chưa có logout transport để task này tích hợp. Teacher/TA
account menu cũ không nằm trong phạm vi nâng cấp; chỉ thay phần chuông của hai TopBar.

## 6. File thay đổi

25 tracked modified; prefix source dưới là `Capstone2/`:

```text
.github/workflows/ci.yml                                      # từ repository root
backend.Tests/TuitionPolicy.Tests.csproj
backend/Controllers/Management/ManagementNotificationsController.cs
backend/Controllers/Management/NotificationInboxController.cs
backend/Controllers/Queries/NotificationsController.cs
backend/Controllers/Teaching/TeachingNotificationsController.cs
backend/Models/DTOs/Management/CreateManagementNotificationDto.cs
backend/Models/DTOs/NotificationDto.cs
backend/Services/Management/Implementation/ManagementNotificationService.cs
backend/Services/Teaching/Implementation/TeachingNotificationService.cs
frontend/src/BLL/models/NotificationDto.ts
frontend/src/DAL/adminStaffDashboardDAL.ts
frontend/src/DAL/teachingDAL.ts
frontend/src/GUIs/layouts/admin/AdminTopBar.tsx
frontend/src/GUIs/layouts/teacher/TeacherTopBar.tsx
frontend/src/GUIs/layouts/teacher/TeachingAssistantTopBar.tsx
frontend/src/GUIs/pages/admin/AdminStaff/AdminStaffDashboardPage.tsx
frontend/src/GUIs/pages/admin/AdminStaff/AdminStaffNotificationPage.tsx
frontend/src/GUIs/pages/admin/CenterManager/CenterManagerDashboardPage.tsx
frontend/src/GUIs/pages/admin/CenterManager/CenterManagerNotificationPage.tsx
frontend/src/GUIs/pages/teacher/Teacher/TeacherNotificationPage.tsx
frontend/src/GUIs/pages/teacher/TeachingAssistant/TeachingAssistantNotificationPage.tsx
frontend/src/api/notificationApi.ts
frontend/src/api/teachingApi.ts
frontend/tests/adminStaffDashboardDAL.test.mjs
```

13 file mới, gồm báo cáo này:

```text
backend.Tests/Notifications/Notifications.Tests.csproj
backend.Tests/Notifications/Program.cs
backend/Services/Notifications/NotificationInboxService.cs
frontend/src/BLL/services/notificationInbox.ts
frontend/src/BLL/services/notificationInboxStore.ts
frontend/src/GUIs/hooks/useNotificationInbox.ts
frontend/src/api/notificationInboxApi.ts
frontend/src/GUIs/components/shared/notifications/NotificationInboxPage.tsx
frontend/src/GUIs/components/shared/notifications/NotificationQuickViews.tsx
frontend/src/GUIs/components/shared/notifications/notifications.css
frontend/tests/notificationInbox.test.mjs
frontend/tests/notifications.http.browser.mjs
docs/EDUTRACK_NOTIFICATIONS_DASHBOARD_ACCEPTANCE_REPORT.md       # từ repository root
```

Controllers/service/DTO sửa quyền, UTC và recipient state. Teaching Notification
service bỏ seeding/write ngầm; Teaching API/DAL chỉ sửa nhóm Notifications, bỏ mock
và false success. Các đoạn trước getNotifications và từ getRequests trở đi được
đối chiếu source baseline giữ nguyên sau chuẩn hóa line ending. Repository và entity
không cần thay đổi schema; service mới query/mutate recipient trực tiếp bằng EF.

Dashboard DAL AD bỏ tải Inbox riêng; hai Dashboard chỉ thay section Notifications
và nguồn cũ của section đó. Bốn notification pages là wrappers của trang chung,
không còn ID seed; giữ chức năng gửi/Sent của CM/AD. TopBar changes chỉ ở bell và
Admin account, các component mới có CSS scope riêng. Tests/CI thêm harness độc lập,
loại source test mới khỏi console project Tuition để tránh trùng entrypoint.

## 7. Validation đã chạy

| Kiểm tra | Kết quả thực tế |
|---|---|
| Frontend lint | PASS, exit 0; warnings upstream còn tồn tại, không warning từ file mới Notifications |
| Frontend typecheck | PASS; cũng chạy trong production build cuối |
| Frontend unit/contract | **159 pass, 0 fail/skip**, gồm 8 nhóm Inbox policy/store mới |
| Production frontend build | PASS; bundle warning >500kB hiện có |
| Backend API + Notifications harness build, output Temp | PASS; 3 nullable warnings baseline ở TeachingRequest/LearnerDashboard, không warning Notifications |
| Notifications default offline | **2 checks**, không host/DB |
| Notifications isolated MySQL/service/HTTP/browser harness | **39 assertions**, gồm 2 offline và assertion tổng browser; không cộng lại như tập độc lập |
| Chromium app thật | **24 nhóm**: 4 role × 4 widths Notifications/Bell và 2 Dashboard × 4 widths |
| Existing Tuition console project sau exclude test folder | **27 policy checks**, không DB |
| Git diff --check + file mới | PASS, không whitespace/conflict markers |
| Scope hashes | Baseline 1.054 file; chỉ 25 file cũ được sửa, 1.029 file cũ khác giữ nguyên |

Unit dùng clock điều khiển: trước/sau đúng 300000ms, unread cũ, 20+ records/tie ID,
refill, legacy NULL, reload/restore, invalid UTC/count/IDs, timer cleanup, failure,
role mismatch và response cũ sau stop. Không thay timer policy production bằng mock.

MySQL kiểm tra recipient-only counts, CM/AD/Teacher/TA scope, IDOR, anonymous/inactive,
đọc/đọc lại/legacy NULL, delete unread bị chặn, Trash/restore không đổi ReadAt, user B
giữ nguyên, root/recipient count không tự thay, Sent còn nguyên, Teaching GET không
seed, Teaching mark-read không tạo membership, concurrent read và sender impersonation.

Browser chạy HTTP/MySQL thật ở 1440/768/390/360px, timezone America/Los_Angeles để
kiểm hiển thị UTC+7. Có deep-link Dashboard/Bell, shared count/list, mark/read-all,
F5 giữ ReadAt, failed read/restore và retry, Undo/Trash/restore, privacy, role switch
trong SPA, HTTP 401 clear data, snapshot error/retry, focus nhận delivery mới, compose
→ Sent, active Sent tab, account identity/keyboard/outside/logout. Grace timer được
gia tốc bằng script **chỉ trong browser test**; predicate chính xác biên được kiểm
bằng unit clock. Không chờ năm phút đồng hồ thật trong mọi viewport.

Browser chặn các API ngoài Notifications bằng 503 và chặn tài nguyên ngoài host;
đây là kiểm thử tích hợp Notifications, **không phải nghiệm thu KPI/Class/Tuition
live**. Các error state khác trong screenshots là chủ đích cô lập. Shared icons là
SVG nên vẫn hiện; icon fonts cũ của module ngoài scope có thể không tải.

Các fail trung gian không tính pass: tests Dashboard DAL còn contract nguồn cũ;
Undo biến mất sau lỗi restore; CSS nth-of-type ẩn bell mobile; selector quoting và
DOM loading trong browser script. Đã sửa trước run cuối. Có harness cũ fail giữ DLL
ở Temp; build cuối dùng output riêng, xử lý exception để runner cleanup được. Hai
MySQL test server lỗi trước đó chỉ được shutdown sau khi đối chiếu chính xác datadir
Temp của run; không dừng/restart API hoặc MySQL development của người dùng.

## 8. Database safety và evidence

Harness xác minh `@@port=33308` và datadir của runner riêng trước mọi fixture write.
Sau đó tạo database tên random `edutrack_notify_test_*`; EnsureCreated chỉ cho schema
test này. Không chạy migration hoặc production startup/AutoDetect/DbSeeder. Host
chỉ đăng ký bốn notification controllers, DB test và principal nonce theo từng run.
Fixtures là synthetic, không phải dữ liệu nghiệp vụ hoặc fallback production.

Run cuối: `edutrack_notify_test_df0261da565d4497be6e55568ac3959b`. Schema đã cleanup,
MySQL process riêng đã shutdown. Không truy cập dữ liệu `edutrack_db`.

Evidence ngoài repository:

```text
%TEMP%/edutrack-notifications-9gk92L/
  baseline.json, scope-final.json
  backend-build-final2.log, backend-offline.log, tuition-policy.log
  frontend-lint-final.log, frontend-typecheck-final.log
  frontend-unit-final.log, frontend-build-final.log
  http-browser-accepted.log
%TEMP%/edutrack-notifications-browser-KRQFNL/      # results.json và screenshots
```

Đối chiếu dòng ARTIFACTS và schema ở cuối log khi tái chạy; không dùng logs của lần
fail làm evidence pass.
Không đưa screenshots/dumps/Chrome profiles/build outputs vào repository.

Tái chạy từ repository root (build backend ở source copy Temp nếu API executable
của workspace đang bị process người dùng giữ):

```powershell
npm.cmd run lint --prefix Capstone2/frontend
npm.cmd test --prefix Capstone2/frontend
npm.cmd run typecheck --prefix Capstone2/frontend
npm.cmd run build --prefix Capstone2/frontend
dotnet build <isolated-source>/Capstone2/backend.Tests/Notifications/Notifications.Tests.csproj
dotnet <isolated-source>/Capstone2/backend.Tests/Notifications/bin/Debug/net8.0/Notifications.Tests.dll
powershell.exe -NoProfile -ExecutionPolicy Bypass -File Capstone2/backend.Tests/StudentEnrollment/Run-IsolatedMySql.ps1 -TestAssemblyPath <isolated-source>/Capstone2/backend.Tests/Notifications/bin/Debug/net8.0/Notifications.Tests.dll -Http -FrontendRoot Capstone2/frontend
```

CI đã đối chiếu: frontend tự lấy test mới qua `tests/*.test.mjs`; browser script
không bị chạy như offline unit. Backend thêm build + default offline role checks,
không bật --mysql/--http, không tạo test database trên GitHub Actions. Chưa chạy CI
trên GitHub vì chưa được phép commit/push.

## 9. Auth dependencies và phần chưa nghiệm thu

AuthContext hiện có mock/default user và chưa cung cấp authenticated transport thật.
Không dùng mock user ID đó để cấp quyền API hoặc hiển thị Admin identity. Production
không có principal hợp lệ sẽ thấy 401/error và “Chưa xác minh tài khoản”, thay vì dữ
liệu seed hoặc success giả. Owner Auth cần cung cấp NameIdentifier/sub thống nhất,
transport cookie/token và server logout phù hợp trước nghiệm thu đăng nhập thật.
Nếu dùng cookie khác origin, owner phải hoàn thiện credential/CORS và bảo vệ mutation
theo cơ chế Auth được chọn; task không tự sửa cấu hình Auth/security toàn hệ thống.

Chưa đọc dữ liệu development nên không biết số legacy roots thiếu recipient hay
read rows thiếu timestamp thực tế. Cần kiểm tra dữ liệu và writer cũ trước rollout;
không tự seed/backfill để làm Inbox trông có dữ liệu. Snapshot hiện tải toàn bộ
own recipient payload; dữ liệu lớn cần backend pagination/quick-view query tối ưu
trong một task được duyệt riêng, vẫn phải filter trước take và dùng cùng count rule.

Chưa chạy Safari/thiết bị thật, login/logout server thật, KPI/Teaching/Class/Tuition
end-to-end trên database thật hoặc GitHub-hosted CI. Dashboard Teacher/TA/Student,
Parent pages, Auth/Attendance/Approval/Schedule/Classes/Tuition production, migrations
và DbSeeder đều không sửa. Không dùng build pass làm bằng chứng các workflow đó.

## 10. Git và hướng dẫn nghiệm thu localhost

Branch `Duy`, HEAD vẫn `22a07dc6847abcfb4f1d9789f209f2b853dc3dcf`. Index rỗng,
không conflict. **25 tracked modified + 13 untracked files = 38 đường dẫn** gồm tài
liệu này. Không stage/commit/push hoặc đổi history/refs. Có thể review source/tests
trước khi quyết định commit; report không phải phê duyệt triển khai database.

Localhost với Auth thật do owner cung cấp, dùng dữ liệu kiểm thử riêng được duyệt:

1. Đăng nhập CM, mở dashboard và chuông; đối chiếu unread/quick IDs với Inbox. Mở
   chuông nhiều lần không đổi unread. Kiểm 1440/768/390/360 và dùng Tab/Escape/outside.
2. Chọn notification ở Dashboard/Bell: URL có notificationId, đúng detail mở, unread
   giảm sau backend success. Ghi ReadAt, F5/mở lại: timestamp không đổi.
3. Đọc lúc T: trước T+5m còn trong quick view, từ T+5m mất khỏi cả hai quick views,
   vẫn trong Inbox và DeletedAt=NULL. Thử trên 20+ records để xem older unread refill.
4. CM/AD xóa read item, kiểm Inbox/quick mất và Trash có; thử Undo, Trash Restore.
   Restore sau grace chỉ quay về Inbox. Thử API failure: không success giả, có retry.
5. Dùng AD/Teacher/TA với recipient khác: không thấy CM-only. Thay userId/senderId
   query không truy cập được Inbox/Sent của người khác; unread delete bị server chặn.
6. CM/AD gửi thủ công tới role/user/class trên DB test, kiểm Sent/recipient count và
   recipient nhận qua focus hoặc revalidation. Không làm bước gửi trên edutrack_db
   trong lượt này. Không có cơ chế automatic notification được thêm.
7. Kiểm Admin avatar/name/code/email/role từ server, đóng menu bằng Escape/outside;
   logout dùng Auth dispatch và clear Inbox. Owner kiểm riêng server session revoke.
8. Đổi tài khoản/role, test 401 và lỗi network: không giữ data user cũ, không mock.
   Kiểm Dashboard Teacher/TA/Student và Parent không có thay đổi ngoài bell được duyệt.

## 11. Checklist nghiệm thu

| Hạng mục | Trạng thái |
|---|---|
| CM/AD shared Dashboard, max 5, count, order, clamp, compact/empty | PASS — isolated app |
| Chuông CM/AD/Teacher/TA, không read khi mở, ARIA/keyboard/outside/select | PASS — 4 widths |
| Personal recipient scope, không global IsRead/count/mock/actor authority | PASS — DB/HTTP |
| Grace đúng biên; unread không hết hạn; refill từ tập đủ điều kiện | PASS — unit clock và browser timer |
| F5/reopen/read-all giữ ReadAt; legacy NULL không bị bịa timestamp | PASS |
| Inbox/Sent/Trash, read-only delete, Undo và Restore giữ read state | PASS |
| User A không làm thay đổi recipient B hoặc mất root/Sent | PASS |
| Deep-link đúng detail, không fallback item khác hoặc lộ deleted/foreign item | PASS |
| API error/retry, focus delivery, SPA identity switch, 401 clear | PASS |
| Admin verified identity, menu và existing Auth dispatch logout | PASS — test principal |
| Lint/typecheck/unit/build/backend/integration | PASS — kết quả mục 7 |
| Dashboard Teacher/TA/Student và business ngoài scope giữ source | PASS — hash/source comparison |
| Không migration/seed/write development; không Git write | PASS |
| Login/logout server thật và production Auth transport | NOT TESTED — chờ Auth owner |
| Dữ liệu legacy development thực tế/rollout | NOT TESTED — không được truy cập dữ liệu thật |
| Safari/thiết bị thật/GitHub-hosted CI | NOT TESTED |

Dừng sau implementation, kiểm thử và báo cáo để người dùng nghiệm thu.
