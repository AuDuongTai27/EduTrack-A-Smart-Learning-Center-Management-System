# EduTrack — Notifications UI/UX và NTF-01

Ngày kiểm tra: 10/11/2026 (Asia/Bangkok). Branch: `Duy`.

Đã tích hợp tiếp ba yêu cầu UI bổ sung. Kết quả riêng: [CM/AD Empty State, Teacher/TA item tương tác và nhãn Student/Parent](EDUTRACK_NOTIFICATIONS_UI_SUPPLEMENT_RESULT.md). Lượt kiểm thử tích hợp sau bổ sung đạt 115 assertions backend/HTTP và 58 nhóm browser; các yêu cầu NTF-01 dưới đây tiếp tục được giữ và kiểm tra lại.

## 1. UI/UX đã triển khai

- Chuyển form gửi sang native Compose Modal rộng 740px, thích ứng viewport; header/footer cố định trong modal, phần nội dung cuộn riêng.
- Trang chính ưu tiên Inbox/Sent/Trash, toolbar tìm kiếm/lọc, danh sách và chi tiết; desktop hai cột, màn hình hẹp một cột.
- Mapping dùng chung cho tám loại thông báo và năm role chính; giữ nguyên API value. Áp dụng trong form, bộ lọc, danh sách, chi tiết, quick views và thông tin role của tài khoản.
- Parent không có trong dropdown role chính. Tài khoản Parent legacy vẫn nhận thông báo, được chọn cá nhân khi hợp lệ và xem Inbox của chính tài khoản đó.
- Cá nhân chọn đúng một người qua combobox. Tìm họ tên/UserCode qua API, debounce 300ms, tối đa 20 kết quả, hủy request cũ và bỏ kết quả lỗi thời; không tải toàn bộ Users cho form này.
- Có loading/empty/error/retry; không tự chọn người đầu tiên. Hiển thị tên, mã, role; cho xóa/thay đổi lựa chọn.
- Required fields có dấu sao, label liên kết input, required/aria-required, mô tả lỗi và aria-invalid. Giới hạn 200/4000 ký tự, chặn chỉ có khoảng trắng; nút gửi chỉ bật khi hợp lệ.
- Escape, phím mũi tên, Enter hoạt động cho combobox; modal quản lý focus, Tab/Shift+Tab, nền inert và trả focus khi đóng. Không đóng khi đang gửi.
- Hủy, nút đóng và Escape giữ cùng bản nháp trong phiên của người gửi. Gửi thành công xóa draft; đổi selected-user hủy draft và bỏ detail/deep-link đang chọn, tránh tự đọc thông báo trong tài khoản vừa chuyển sang. Draft không lưu qua F5.
- Có khóa đồng bộ chống submit hai lần. Chỉ thông báo thành công sau response thành công của backend; đóng modal, tải lại Inbox và lịch sử Sent.
- CSS thay đổi được giới hạn trong Notifications. Không thêm thư viện UI.

## 2. File frontend

Đường dẫn tương đối từ repository root:

| File | Thay đổi |
|---|---|
| `Capstone2/frontend/src/BLL/services/notificationPresentation.ts` | Mapping loại/role/phạm vi và validation draft dùng chung |
| `Capstone2/frontend/src/GUIs/components/shared/notifications/ComposeNotificationModal.tsx` | Modal, draft, validation, focus, submit |
| `Capstone2/frontend/src/GUIs/components/shared/notifications/RecipientCombobox.tsx` | Tìm kiếm người nhận qua API và bàn phím |
| `Capstone2/frontend/src/GUIs/components/shared/notifications/NotificationInboxPage.tsx` | Tích hợp modal, nhãn và selected-account Student/Parent |
| `Capstone2/frontend/src/GUIs/components/shared/notifications/NotificationQuickViews.tsx` | Nhãn hiển thị dùng chung |
| `Capstone2/frontend/src/GUIs/components/shared/notifications/notifications.css` | Layout, modal, responsive, trạng thái focus/read |
| `Capstone2/frontend/src/GUIs/pages/student/StudentNotificationsPage.tsx` | Dùng Inbox theo recipient/selected-user thay ID cố định và local read state |
| `Capstone2/frontend/src/GUIs/pages/parent/ParentNotificationsPage.tsx` | Dùng Inbox theo tài khoản Parent, độc lập với con đang chọn |
| `Capstone2/frontend/src/GUIs/layouts/parent/ParentLayout.tsx` | Cho trang Notifications hoạt động độc lập với gate tải/chọn con của portal cũ |
| `Capstone2/frontend/src/GUIs/layouts/student/StudentNavMenu.tsx` | Badge unread dùng cùng notification store/selected-user với Inbox |
| `Capstone2/frontend/src/GUIs/layouts/parent/ParentNavMenu.tsx` | Badge unread theo tài khoản Parent, không theo ID cố định/con đang chọn |
| `Capstone2/frontend/src/api/notificationInboxApi.ts` | Recipient search, sender selector, lỗi validation tiếng Việt |
| `Capstone2/frontend/src/BLL/models/NotificationDto.ts` | Metadata avatar người gửi tùy chọn |
| `Capstone2/frontend/src/GUIs/components/shared/notifications/NotificationEmptyState.tsx` | Empty State dấu tích xanh dùng chung |
| `Capstone2/frontend/src/GUIs/components/shared/notifications/TeachingDashboardNotifications.tsx` | Avatar/badge Teaching, toàn item click/Enter/Space, store chung |
| `Capstone2/frontend/src/GUIs/components/teacher/Teacher/dashboard/NotificationsSection.tsx` | Tích hợp card Teaching dùng chung |
| `Capstone2/frontend/src/GUIs/components/teacher/TeachingAssistant/dashboard/NotificationsSection.tsx` | Tích hợp card Teaching dùng chung |
| `Capstone2/frontend/src/GUIs/pages/teacher/Teacher/TeacherDashboardPage.tsx` | Bỏ request/filter Notifications riêng bằng ID cố định |
| `Capstone2/frontend/src/GUIs/pages/teacher/TeachingAssistant/TeachingAssistantDashboardPage.tsx` | Bỏ request/filter Notifications riêng bằng ID cố định |

Sau bổ sung, riêng option Student của phạm vi Theo vai trò hiển thị **Học viên / Phụ huynh (Student / Parent)**, value vẫn là `student`. Role của tài khoản trong combobox/thông tin người dùng vẫn có nhãn Học viên (Student). Không thêm lựa chọn Parent riêng.

## 3. File backend

| File | Thay đổi |
|---|---|
| `Capstone2/backend/Repositories/Implementation/NotificationRepository.cs` | Mở rộng phụ huynh sau khi resolve phạm vi, UNION và kiểm tra trùng/self trước lưu |
| `Capstone2/backend/Repositories/Interfaces/INotificationRepository.cs` | Thêm excludedUserId tùy chọn khi resolve |
| `Capstone2/backend/Services/Management/Implementation/ManagementNotificationService.cs` | Truyền sender cần loại trừ; role scope giới hạn năm role chính |
| `Capstone2/backend/Services/Notifications/NotificationRecipientSearchService.cs` | Search có giới hạn tại SQL, tài khoản active, không trả password/contact |
| `Capstone2/backend/Controllers/Management/ManagementNotificationsController.cs` | GET recipient search |
| `Capstone2/backend/Services/Learning/Implementation/LearnerDashboardService.cs` | Chỉ sửa các hàm Notifications: GET theo recipient, bỏ seeding mẫu, đọc không tạo recipient/reset ReadAt, Read All không thay trạng thái tài khoản con |
| `Capstone2/backend/Models/DTOs/NotificationDto.cs` | Trường SenderAvatarUrl tùy chọn |
| `Capstone2/backend/Services/Notifications/NotificationInboxService.cs` | Bổ sung map avatar từ Sender cho UI Teaching; giữ nghiệp vụ Inbox/ReadAt/DeletedAt |

Các hàm Approval Requests và Schedule không được sửa. Entity, giới hạn Title/Content và migration hiện có không thay đổi.

## 4. Student–Parent propagation

Đã kiểm tra read-only database development: cả `parent_students.parent_id` và `student_id` có khóa ngoại tới `users.user_id`; có 3 liên kết và 1 tài khoản Parent active có liên kết tại thời điểm kiểm tra. Không suy luận quan hệ qua tên, mã hay lớp.

Luồng gửi mới:

1. Xác thực dữ liệu selector/sender theo cơ chế hiện có, validation Title/Content/type/phạm vi.
2. Xác định người nhận active theo logic `user`, `role`, `class`, `all` hiện tại. Giữ nguyên điều kiện membership active của học viên, giáo viên và trợ giảng trong lớp.
3. Loại sender khỏi tập này. Lấy những người nhận có role `student`.
4. Truy vấn `parent_students`, chỉ bổ sung tài khoản phụ huynh tồn tại, active, có role legacy `parent` và liên kết với những Student vừa xác định. Không bổ sung liên kết của người không phải Student.
5. UNION các user ID, loại sender và distinct lần nữa trước khi lưu. Tập rỗng trả lỗi tiếng Việt, không lưu Notification.
6. Một Notification và nhiều `notification_recipients` được lưu trong một SaveChanges/transaction. Mỗi recipient có IsRead/ReadAt/DeletedAt riêng.

API tìm kiếm mới: `GET /api/management/notifications/recipients?senderId=...&query=...&limit=20`. Từ khóa tối thiểu 2, tối đa 100 ký tự, limit bị chặn trong khoảng 1–20; tìm tên hoặc UserCode, không trả người gửi/inactive/role ngoài phạm vi hỗ trợ. Endpoint là chọn dữ liệu công khai trong kiến trúc hiện tại, không phải cơ chế authentication/authorization.

## 5. Kết quả theo phạm vi gửi

Kiểm tra trên MySQL độc lập, dữ liệu tổng hợp, schema ngẫu nhiên; có cả service/repository và HTTP thật.

| Phạm vi | Kết quả |
|---|---|
| Cá nhân Student có nhiều phụ huynh | PASS: Student 507 + Parent 601/602; Parent inactive, sai role, không có role và sender bị loại |
| Cá nhân Student có một phụ huynh | PASS: Student 508 + Parent 601 |
| Cá nhân Student không có phụ huynh | PASS: chỉ Student 509 |
| Theo role Student | PASS: tất cả Student active và phụ huynh hợp lệ; không phụ thuộc enrollment của lớp |
| Theo lớp | PASS: giữ học viên/Teacher/TA active theo membership, thêm phụ huynh; loại học viên dropped/inactive và nhân sự inactive |
| Toàn trung tâm | PASS: người nhận hợp lệ theo tập all hiện có và phụ huynh, không trùng khi Parent đã có trong tập all |
| Cá nhân không phải Student | PASS: không mở rộng phụ huynh, kể cả có bản ghi liên kết legacy sai role phía Student |
| Cá nhân Parent legacy | PASS: nhận trực tiếp một recipient |
| CM → CM khác; AD → CM | PASS: gửi thông tin bình thường, loại sender |
| Self-only, inactive-only, Parent role chính | PASS: từ chối rõ ràng, không ghi dữ liệu |

HTTP kiểm tra bốn scope lần lượt có 3/6/7/36 recipient trong fixture tương ứng. Mỗi HTTP response được đối chiếu với Inbox Student/Parent bằng cùng NotificationId; không dùng response thành công giả.

## 6. Chống duplicate và độc lập trạng thái

- PASS: Parent có nhiều con chỉ nhận một recipient trong role/class/all.
- PASS: Parent vừa có trong tập all vừa được thêm qua Student chỉ có một recipient.
- PASS: không có recipient thuộc sender; thử cả sender có role/link Parent.
- PASS: mỗi lần gửi chỉ thêm một Notification, mọi recipient khởi tạo unread/null ReadAt/null DeletedAt.
- PASS: Student đọc/xóa không thay đổi Inbox/ReadAt của Parent; Parent đọc/xóa không thay đổi Student hoặc Parent khác.
- PASS: Inbox lọc theo user, không suy ra quyền nhận từ root UserId/ClassId hay trạng thái đọc của người khác.
- PASS: legacy GET không seed/backfill, legacy mark-read không tạo recipient, Parent Read All không đọc thay tài khoản con.
- PASS: không thay đổi recipient của Notification cũ và không tạo Approval Request khi gửi.

## 7. Responsive và accessibility

Chrome headless với API và MySQL thật: CM/AD/Teacher/TA tại 1440, 768, 390 và 360px; Student/Parent tại 1440, 768 và 390px.

58 nhóm browser test sau bổ sung đã kiểm tra:

- Page, detail và modal không vượt ngang viewport; modal giữ thao tác footer, cuộn riêng nội dung; đã xem ảnh desktop/mobile.
- Label/required/aria-invalid, giới hạn ký tự, whitespace, target động và đúng năm role/tám loại.
- Search loading/empty/error/retry, limit 20, debounce, bỏ response cũ, khoảng trắng cuối từ khóa, chọn/đổi/xóa bằng bàn phím.
- Focus ban đầu, nền inert, Tab trong modal, Escape dropdown/modal, focus trở về nút mở, giữ draft khi Hủy/Escape, reset sau thành công.
- Chặn đóng khi request gửi còn pending; hai submit chỉ tạo một HTTP POST.
- Student/Parent Inbox/deep-link và đọc độc lập; badge sidebar đồng bộ khi đọc/đổi tài khoản; Teacher/TA chỉ nhận thông báo của mình.
- Inbox/Sent/Trash, read/read-all/delete/restore/undo; deep-link độc lập trang phân trang; user switching.
- Bell/Dashboard dùng cùng tập tối đa 5; mở Bell không đánh dấu đọc; ReadAt giữ qua F5/restore; hết 5 phút chỉ loại khỏi quick views và không ghi DeletedAt.
- Teacher/TA Dashboard giữ avatar tròn, ảnh người gửi, initials, badge Mới!, hỗ trợ click toàn hàng/Enter/Space và cùng store với Bell/Inbox.
- CM/AD/Teacher/TA dùng Empty State dấu tích xanh; unread = 0 vẫn giữ item trong grace, chỉ hiện empty khi quick view thật sự rỗng.

Các tình huống lỗi có chủ động chặn/trả lỗi request để kiểm tra UX; dữ liệu thành công của Notifications luôn đi qua API/MySQL thật. GET của module khác không nằm trong fixture bị chặn hoặc trả lỗi, vì vậy ảnh có thể hiển thị lỗi tên trung tâm/năm học hoặc thông tin con/profile fallback của sidebar legacy; không coi đó là nghiệm thu các module đó. Notifications không dùng các dữ liệu fallback này để chọn người nhận, Inbox hoặc unread count. Quy tắc 5 phút dùng clock/timer được điều khiển trong test để kiểm tra biên thời gian, không sửa clock production.

Đây là browser acceptance tự động và kiểm tra ảnh; chưa phải kiểm toán WCAG bằng screen reader trên nhiều trình duyệt.

## 8. Builds và tests

| Lệnh/nhóm | Kết quả |
|---|---|
| `npm.cmd run lint` | PASS, exit 0; warning sẵn có ngoài phần Notifications mới |
| `npm.cmd run typecheck` | PASS |
| `npm.cmd test` | PASS: 164 tests, 0 fail/skip |
| `npm.cmd run build` | PASS; Vite còn cảnh báo kích thước bundle lớn |
| `dotnet build Capstone2/backend.Tests/Notifications/Notifications.Tests.csproj --no-restore` | PASS, gồm build backend; không có error |
| MySQL isolated + HTTP + Chrome | PASS: 115 assertions backend/HTTP/harness và 58 nhóm browser |
| `git diff --check` | PASS |

Backend full compile đầu tiên có 3 nullable warning tại TeachingRequestService và phần khác của LearnerDashboardService; build incremental sau đó không có warning. Không mở rộng sửa các phần này.

Chạy integration từ repository root:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File Capstone2/backend.Tests/StudentEnrollment/Run-IsolatedMySql.ps1 -TestAssemblyPath Capstone2/backend.Tests/Notifications/bin/Debug/net8.0/Notifications.Tests.dll -Http -FrontendRoot Capstone2/frontend
```

Runner tạo MySQL riêng port 33308, kiểm tra port/datadir trước ghi, schema random; harness xóa schema test rồi runner dừng đúng server test. Không đọc connection string development trong harness. Cần MySQL Server 8 local và Google Chrome theo đường dẫn hiện có của runner/browser test.

Test files:

- `Capstone2/backend.Tests/Notifications/Program.cs`
- `Capstone2/backend.Tests/Notifications/PropagationChecks.cs`
- `Capstone2/frontend/tests/notifications.http.browser.mjs`
- `Capstone2/frontend/tests/notificationCompose.test.mjs`

Bằng chứng lượt nghiệm thu task gốc, giữ ngoài Git:

- Browser JSON/ảnh: `%TEMP%/edutrack-notifications-browser-ceWVj3/` — `results.json` có 38 nhóm PASS, `failures: []`; ảnh theo role/viewport và Compose Modal.
- Integration log: `%TEMP%/edutrack-notification-http-final.log` — 114 assertions PASS; schema test `edutrack_notify_test_e41a83a81c4f4dc2bfe662b11785409c` đã được dọn.
- Log frontend: `%TEMP%/edutrack-notification-lint.log`, `edutrack-notification-unit.log`, `edutrack-notification-build.log`.
- Log backend build: `%TEMP%/edutrack-notification-backend-build.log`.
- MySQL riêng: `%TEMP%/edutrack-enrollment-mysql-00c1e75d37874b5189d491e10ed51ee5/`; runner xác nhận dừng process test 11296.

Bằng chứng lượt chốt sau ba yêu cầu UI bổ sung:

- `%TEMP%/edutrack-notifications-browser-jayRwl/results.json`: 58 nhóm PASS, không có failure; ảnh và kiểm tra CM/AD/Teacher/TA Dashboard, empty state, avatar/link/keyboard và form Student/Parent.
- `%TEMP%/edutrack-notification-supplement-http.log`: 115 assertions backend/HTTP/harness PASS; schema random `edutrack_notify_test_db67f980571448ebb83de8ac174685a1` đã dọn, process MySQL test 8008 đã dừng.
- Logs frontend/backend build và tests có prefix `%TEMP%/edutrack-notification-supplement-`; chi tiết trong báo cáo bổ sung.

## 9. Hạn chế

- Draft giữ trong bộ nhớ của trang, không tồn tại sau F5/chuyển trang; có nhãn hướng dẫn rõ trong modal.
- Chưa benchmark hiệu năng trên hàng nghìn tài khoản; đã kiểm tra giới hạn tại SQL và chỉ trả 20 trong tập lớn hơn 20 kết quả. Không thêm index/migration mới.
- Chưa nghiệm thu Firefox/Safari hay screen reader thủ công. Đã kiểm tra Chrome và bàn phím thật qua CDP.
- Không gửi thử trên database development; trên development chỉ SELECT cấu trúc/đếm liên kết. Việc ghi và nghiệm thu giao nhận dùng fixture MySQL cô lập.
- Các Notification cũ không có recipient vẫn không được backfill. Parent legacy mới nhận qua recipient được tạo đúng ở lần gửi mới hoặc recipient đã tồn tại.
- Không thêm quyền Trash cho Student/Parent/Teacher/TA. Độc lập DeletedAt được kiểm thử tại repository; các nút Trash vẫn theo scope đã có.

## 10. Git status và danh sách thay đổi

Branch `Duy`; working tree ban đầu sạch trước task gốc. Sau ba yêu cầu UI bổ sung, tổng cộng 33 file thay đổi/thêm: 19 file frontend source ở mục 2, 8 file backend source ở mục 3, 4 file tests ở mục 8 và 2 báo cáo Markdown Notifications. 23 file tracked được sửa, 10 file mới chưa tracked (gồm báo cáo).

Không stage/commit/push/merge/tạo PR. Log, screenshot, dist, bin/obj và dữ liệu fixture không đưa vào Git.

## 11. Database migration

**Không cần migration.** Sử dụng các bảng, quan hệ và unique constraint `(notification_id, user_id)` đã có. Không sửa database development, không chạy EF migrations trên `edutrack_db`, không reset/recreate database hiện có.

## 12. Trạng thái nghiệm thu

Đã triển khai và kiểm thử các yêu cầu Notifications trong phạm vi được giao, không có blocker còn lại. Không thêm Authentication/Authorization, JWT/session/principal giả, Email/SMS, Approval Request tự động hoặc Parent account/portal mới. Các giới hạn kiểm thử được ghi riêng ở mục 9.
