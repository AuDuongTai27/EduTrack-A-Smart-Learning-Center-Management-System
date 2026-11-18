# EduTrack — KAN-53 & KAN-89

Ngày thực hiện: 18/11/2026. Trạng thái: đã triển khai frontend, chờ nghiệm thu giao diện; chưa stage/commit/push/merge/PR.

**Cập nhật hiện hành:** Final Dashboard Adjustment đã hoàn tất: `Monthly Tuition Collected`, `Overdue Tuition = overdueAmount`, icon/màu semantic thống nhất và KPI chỉ Title–Value–Icon. Chi tiết mới nhất ở mục Final Adjustment cuối tài liệu; các phần QA/checks trước đó được giữ làm lịch sử. KAN-53 không được thực hiện lại.

## Preflight

- Branch `Duy`, HEAD `1cca292c481447d721536feeb39221686eb742ef`.
- Các commit gần nhất: `1cca292` (All Roles UI consistency), `e2fa225` (merge PR #53), `f629e91` (landing footer), `0da37b8` (merge main), `f7d6b87` (merge PR #52).
- Ban đầu chỉ có `?? tmp/`; không có thay đổi tracked của thành viên khác. Giữ nguyên các QA artifacts có sẵn.
- Đọc `AGENTS.md`, kiểm tra `docs/`: chưa có báo cáo KAN-53/KAN-89. Đây là tài liệu tổng hợp duy nhất của hai task; các vòng sau cập nhật tại đây.
- Bổ sung vào `AGENTS.md` quy tắc hỏi KAN khi chưa được cung cấp, cho phép báo cáo chung, không tạo báo cáo theo từng giai đoạn, không xóa docs ngoài phạm vi, QA local trong `tmp/`.

## KAN-53 — Simplify Topbar

- AdminTopBar dùng chung cho Center Manager/Admin Staff: bỏ Global Search, Academic Year và Theme button khỏi JSX; bỏ các import/context chỉ phục vụ những mục này.
- Teacher/Teaching Assistant: chỉ bỏ Academic Year và Theme button khỏi Topbar.
- Giữ nguyên component NotificationBellDropdown, unread counter, dropdown; giữ nguyên profile/avatar/user information, account menu, handlers và logout hiện có.
- CSS opt-in `et-simplified-topbar` chỉ áp dụng trong `.admin-scope`/`.teacher-scope`: căn actions sang phải, gap thống nhất, giữ chiều cao hiện tại. Ghi đè selector mobile cũ ẩn icon theo vị trí để bảo đảm bell tiếp tục hiển thị.
- Giữ nguyên mobile menu button và ID; không thay đổi Sidebar hoặc desktop collapse button.
- Student/Parent Topbar, global theme, search của các trang khác và Academic Year trong Settings/business logic không thay đổi.

## KAN-89 — Center Manager Dashboard

Thứ tự: Page Title/Breadcrumb → Welcome Banner với Add Student/Tuition Details → sáu KPI → Pending Approval Requests/Recent Notifications.

- Bỏ thanh Center Name–Academic Year phía trên KPI và toàn bộ Tuition Overview khỏi Dashboard.
- Welcome giữ tên manager từ selected user, center name trong lời chào, nội dung chào mừng và ngày hiện tại. Chuyển quick actions vào banner, giữ handler mở modal và đường dẫn tuition. Không thêm/thay illustration.
- Năm KPI cũ giữ nguyên nguồn và công thức, bao gồm monthly collection và tổng outstanding. Adjustment bỏ phần footer overdue; không thay đổi tuition calculations. Dùng khả năng `currencyUnitOnNewLine` sẵn có của KpiCard để hiện đầy đủ tiền, không viết tắt; scoped CSS cho phép xuống dòng khi cần.
- KPI thứ sáu: Pending Approval Requests. Sau Adjustment, chỉ hiển thị số liệu, không còn Link/click điều hướng; View All trong card yêu cầu vẫn đến `/center-manager/approval-requests`.
- KPI/list dùng chung một collection đã lọc/sắp xếp. KPI đếm toàn bộ collection; card chỉ lấy tối đa 5. Loading/error hiển thị giá trị chưa có dữ liệu thay vì giả định 0.
- Card có code, title (fallback reason/type khi title trống), type, requester name/role, submitted date, priority và status. Tiêu đề dài được wrap đầy đủ và React escape nội dung.
- Có View All và Retry khi lỗi; loading/empty/error riêng biệt. Không có Approve/Reject trên Dashboard.
- Grid: ≥1700 px có 6 KPI/hàng; desktop/tablet 3; dưới 768 px 2; dưới 480 px 1. Hai card dưới dùng 60:40 desktop, một cột dưới 992 px.
- Recent Notifications dùng nguyên DashboardNotificationsCard, chỉ đổi vị trí wrapper; không sửa notification state/data/read-unread logic.

## API, schema và phạm vi dữ liệu tái sử dụng

- `feedbackDAL.getAllRequests()` → `approvalRequestApi.getAll()` → `GET /api/approvalrequests`. API hiện trả toàn bộ danh sách, không phân trang; tính tổng client-side trên cùng dữ liệu với list.
- Kiểm tra frontend/backend ApprovalRequestDto, ApprovalRequest entity, query controller/service/repository và ManagementApprovalRequestService.ReviewAsync; chỉ đọc backend, không sửa.
- Repository include Requester → UserRoles → Role; DTO có `requesterRole`, `requestedBy`, `status`, `reviewedBy`, `priority`, `createdAt`, `requestCode`, `title`, `reason`, `requestType`.
- Phạm vi Dashboard theo trang Approval Requests hiện tại của Center Manager: yêu cầu từ `requesterRole=admin_staff`, `status=pending`, không phải yêu cầu do manager đang chọn tự gửi. Không thêm lọc requester theo tên hoặc hardcode ID.
- `pending` gồm cả chưa bắt đầu xem xét (`reviewedBy=null`, trang hiện tại gọi là Waiting) và đang xem xét (`reviewedBy!=null`). Không loại yêu cầu đang được manager khác xem xét vì workflow hiện tại không đặt quyền sở hữu độc quyền theo reviewer.
- Backend hiện có mức `high`, `medium`, `low`; sắp high → medium → low, cùng priority thì createdAt cũ trước, requestId làm tie-breaker. Không sửa workflow.
- API không có `canReview`/centerId cho từng request; dùng đúng phạm vi Admin Staff của trang Center Manager hiện có, không tự thêm giả định multi-center hay quyền mới.
- Nếu API cũ thiếu requesterRole ở yêu cầu pending liên quan, Dashboard báo lỗi tổng không khả dụng, không đoán role từ tên/ID. Lưu ý backend hiện có legacy role fallback theo code/ID; frontend mới không bổ sung hoặc sửa fallback này.
- Dữ liệu được tải lại khi đổi selected manager hoặc Retry. Kết quả cũ/response đã unmount không ghi đè account mới; không thêm polling ngoài yêu cầu.
- Các nguồn khác giữ nguyên: userDAL, classDAL, useTuitionData/calculateTuitionMetrics, CenterSettingsProvider/useSelectedUser và notification inbox hiện tại.

## Files changed

| File | Thay đổi |
|---|---|
| `AGENTS.md` | Quy tắc tài liệu KAN |
| `Capstone2/frontend/src/GUIs/layouts/admin/AdminTopBar.tsx` | Topbar hai role quản lý |
| `Capstone2/frontend/src/GUIs/layouts/teacher/TeacherTopBar.tsx` | Chỉ Topbar Teacher |
| `Capstone2/frontend/src/GUIs/layouts/teacher/TeachingAssistantTopBar.tsx` | Chỉ Topbar TA |
| `Capstone2/frontend/src/assets/css/simplified-topbar.css` | CSS opt-in Topbar |
| `Capstone2/frontend/src/GUIs/pages/admin/CenterManager/CenterManagerDashboardPage.tsx` | Bố cục, dữ liệu và KPI mới |
| `Capstone2/frontend/src/assets/css/center-manager.css` | CSS riêng `.cm-dashboard`/các class `cm-*` |
| `Capstone2/frontend/src/BLL/services/centerManagerDashboardService.ts` | Lọc/sắp xếp dữ liệu đọc |
| `Capstone2/frontend/src/GUIs/components/admin/CenterManager/PendingApprovalRequestsCard.tsx` | Card và các trạng thái |
| `Capstone2/frontend/tests/centerManagerDashboard.test.mjs` | 6 targeted tests |
| `docs/EDUTRACK_KAN53_KAN89_RESULT.md` | Báo cáo tổng hợp này |

## Automated checks và baseline — giai đoạn triển khai đầu

Chạy binary của các scripts frontend hiện có; test files chạy riêng bằng `node --test` để giới hạn test bị treo ở 20 giây và vẫn kiểm tra được các file khác. Không sửa test ngoài phạm vi.

| Check | Baseline | Sau sửa |
|---|---|---|
| Frontend lint / oxlint | PASS, 208 warnings | PASS, 208 warnings |
| Typecheck / tsc -b | PASS | PASS |
| Production build / tsc -b + vite build | PASS | PASS |
| Frontend tests, tổng các file hoàn tất | 114 PASS, 34 FAIL | 120 PASS, 34 FAIL |
| notificationInbox.test.mjs | Timeout 20 giây | Timeout 20 giây |
| Targeted centerManagerDashboard tests | Chưa có | 6/6 PASS |
| git diff --check | — | PASS |

- Tất cả kết quả code/pass/fail/timeout của test files cũ giữ nguyên baseline; không có test cũ phát sinh failure mới.
- Các file test cũ có FAIL: adminStaffDashboard, classManagement, classManagementApi, classStaff, gradeManagement, notificationCompose, scheduleManagement, scheduleView, studentCenterEnrollment, studentEnrollment, studentManagement, tuitionMetrics.
- Build giữ nguyên cảnh báo chunk lớn hơn 500 kB; không thay đổi bundling ngoài phạm vi.
- Logs và kết quả máy đọc được: `tmp/kan53-kan89/baseline/`, `tmp/kan53-kan89/final/`, `tmp/kan53-kan89/compare.mjs`.

## Browser QA và screenshots local — giai đoạn triển khai đầu

Chrome headless, layout/component thật; baseline lấy nội dung từ HEAD, không reset working tree. Harness/fixtures chỉ nằm trong `tmp/`, không được import vào ứng dụng. Vì backend local không chạy, đây là UI/interaction QA với API responses kiểm thử, chưa phải xác nhận production data/quyền với phiên đăng nhập thật. Các trang role ngoài Center Manager được thay nội dung Outlet bằng nhãn QA để kiểm tra Topbar và giữ nguyên mã Dashboard của thành viên khác.

- Trước: 16 specimens; sau: 19 specimens, gồm bốn role × 1920/1280/768/390 px và ba trạng thái loading/empty/error riêng cho Center Manager.
- Không tràn ngang; bell hiện trên mobile; bỏ đúng search/year/theme trong cả 16 trường hợp role/viewport sau sửa.
- Bell và account dropdown mở được trong tất cả 19 specimens sau sửa và 16 baseline; unread badge hiển thị. Không gọi mutation đọc/xóa thông báo trong QA.
- Add Student mở đúng modal tại bốn viewport trước/sau; không gửi tạo user. KPI mới điều hướng được tại bốn viewport sau sửa. Link View All/Tuition Details giữ đúng destination hiện có.
- KPI pending là 8 trong fixture có 8 request, list hiện 5; empty là 0; loading/error không giả định 0. Loading/empty/error text phân biệt đúng.
- Kiểm tra số tiền dài `122.580.245.802 VND` và `876.543.210 VND`: đủ chữ số, không bị cắt ở các viewport đã chạy. Xem trực tiếp ảnh desktop và mobile.
- Desktop panels cạnh nhau, mobile xếp dọc; long title không tràn card.

Ảnh và kết quả local:

- [Before desktop](../tmp/kan53-kan89/screenshots/before-center-manager-1920-populated.png)
- [After desktop](../tmp/kan53-kan89/screenshots/after-center-manager-1920-populated.png)
- [After tablet](../tmp/kan53-kan89/screenshots/after-center-manager-768-populated.png)
- [After mobile](../tmp/kan53-kan89/screenshots/after-center-manager-390-populated.png)
- [Loading](../tmp/kan53-kan89/screenshots/after-center-manager-1280-loading.png), [Empty](../tmp/kan53-kan89/screenshots/after-center-manager-1280-empty.png), [Error](../tmp/kan53-kan89/screenshots/after-center-manager-1280-error.png)
- Các role khác: `tmp/kan53-kan89/screenshots/{before|after}-{admin-staff|teacher|teaching-assistant}-{width}-populated.png`.
- Measurements/interaction results: `tmp/kan53-kan89/before-browser.json`, `tmp/kan53-kan89/after-browser.json`.

## Functional safety và known limitations

- Không sửa backend/database/migrations/seeding, auth/authorization, route definitions, tuition calculations, approval workflow, shared notifications hoặc Sidebar.
- Không sửa Admin Staff/Teacher/TA Dashboard, Student/Parent source files hoặc global branding. Topbar teaching chỉ thay JSX các mục được phép và import CSS opt-in.
- **Sidebar toggle là lỗi có sẵn:** baseline và sau sửa đều không mở sidebar khi click mobile button. `mobileMenuBtn` và `sidebarCollapseBtn` hiện không có click handler trong source; desktop collapse cũng chưa được nối behavior. Giữ nguyên nút/ID, không sửa Sidebar theo giới hạn task. Vì vậy chưa đánh dấu sidebar interaction PASS; cần xử lý trong phạm vi được cho phép riêng.
- Chưa xác nhận với backend đang chạy/tài khoản thật: số request thực tế, quyền trả dữ liệu, notification read/unread end-to-end, nội dung mọi trang thuộc bốn role. API contract/code đã được kiểm tra; production Dashboard không chứa fixtures hoặc fake count.
- Toàn bộ frontend suite chưa PASS do 34 failures và timeout có sẵn; không sửa các module đó để ép PASS.
- QA icon font dùng tài nguyên local từ QA trước; typography harness dùng system fallback. Ảnh là kiểm tra layout, không phải nâng cấp illustration/trang trí.

## Git status và bàn giao — giai đoạn triển khai đầu

- HEAD/branch giữ nguyên `Duy` / `1cca292`; index không có staged files.
- 6 tracked files modified: AGENTS.md, ba Topbar, CenterManagerDashboardPage.tsx, center-manager.css.
- 5 file mới cho task: service, card, CSS Topbar, targeted test và báo cáo này.
- `tmp/` vẫn untracked, chứa cả artifacts có sẵn và artifacts lần này; không đưa vào commit.
- Không stage, commit, push, merge hoặc tạo PR. Dừng để người dùng nghiệm thu giao diện.

## KAN-89 Adjustment Phase cùng KAN-90 — 18/11/2026 (trước Final Adjustment)

### Kết quả hiện hành

- Giữ đúng sáu KPI và toàn bộ nguồn dữ liệu/phạm vi/công thức hiện có.
- Bỏ mọi footerValue/footerLabel/footerLayout, supporting description và divider khỏi KPI; không chỉ ẩn bằng CSS.
- Bỏ Link wrapper cùng CSS hover/focus của Pending Approval Requests KPI. KPI không phải phần tử tương tác và không có tab stop điều hướng.
- Hiện icon cho cả hai KPI học phí. Title ghi rõ `Tuition Collected (This Month)` và `Outstanding Tuition (All Periods)` sau khi bỏ thông tin phạm vi khỏi footer.
- Shared KpiCard không thay đổi. CSS mới chỉ được import từ hai Dashboard, selector giới hạn `.admin-scope :is(.cm-dashboard, .staff-dashboard)`; chuẩn hóa padding 20 px, radius token EduTrack, icon 32 px, title 13 px, số đếm 26 px và tiền 20 px. Chiều cao thực đo 148 px cho tất cả KPI trong QA.
- Giữ đầy đủ số tiền VND; đơn vị xuống dòng bằng prop có sẵn. Không compact/round/cắt chữ số.
- Loading Pending KPI dùng `Loading…`, lỗi dùng `—`; empty thành công mới là 0. Card Pending Approval Requests và Recent Notifications không thay đổi, bao gồm Retry/View All, dữ liệu và states.
- Welcome Banner và hai quick actions giữ nguyên. Không sửa Topbar KAN-53, Sidebar, illustration hoặc global branding.

### Files của vòng điều chỉnh liên quan KAN-89

- `Capstone2/frontend/src/GUIs/pages/admin/CenterManager/CenterManagerDashboardPage.tsx`: KPI props/Link wrapper; bỏ import định dạng tiền và collectionLabel không còn dùng.
- `Capstone2/frontend/src/assets/css/center-manager.css`: bỏ CSS riêng của Link KPI và footer đã xóa; giữ CSS grid và card yêu cầu.
- `Capstone2/frontend/src/assets/css/management-dashboard-kpis.css`: presentation chung cho hai Dashboard, không sửa shared KpiCard.
- `Capstone2/frontend/tests/managementDashboardKpis.test.mjs`: 4 targeted rendering tests cho cả hai role.
- Báo cáo này được cập nhật tại chỗ. KAN-90 có tài liệu riêng duy nhất [EDUTRACK_KAN90_RESULT.md](EDUTRACK_KAN90_RESULT.md).

### QA và checks của vòng điều chỉnh

- Baseline lấy từ working tree sau KAN-53/KAN-89, không lấy HEAD cũ để ghi đè công việc chưa commit. Branch/HEAD vẫn `Duy` / `1cca292c481447d721536feeb39221686eb742ef`.
- Browser: 16 specimens trước và 22 sau, gồm Center Manager/Admin Staff ở 1920, 1440, 1280, 1024, 768, 600, 390, 360 px; thêm loading/empty/error tại 1280 px cho mỗi role.
- Center Manager luôn đủ 6 KPI/icons; tất cả card không footer/divider/link, không pointer cursor, không hover tương tác; click KPI không điều hướng. Welcome trước KPI, không tràn ngang hoặc cắt số tiền.
- Pending Card/Recent Notifications markup, source và data service giữ nguyên. KAN-53 Topbar/CSS và source các role ngoài phạm vi giữ nguyên hash so với preflight.
- Lint PASS (208 warnings như baseline); typecheck PASS; production build PASS (giữ cảnh báo chunk >500 kB); git diff --check PASS.
- Frontend tests: baseline 120 PASS/34 FAIL và 1 timeout; sau sửa 124 PASS/34 FAIL và cùng timeout `notificationInbox.test.mjs` (20 giây). Kết quả các test files cũ giữ nguyên. Targeted dashboard tests: 6 test KAN-89 trước + 4 test mới = 10/10 PASS.
- Tests mới render JSX KPI thật từ hai trang và shared KpiCard, kiểm tra số card/icons, không điều hướng/footer, pending thay vì total, đầy đủ VND, không fake zero khi thiếu dữ liệu.
- [Before desktop](../tmp/kan89-kan90/screenshots/before-center-manager-1920-populated.png), [After desktop](../tmp/kan89-kan90/screenshots/after-center-manager-1920-populated.png), [After mobile](../tmp/kan89-kan90/screenshots/after-center-manager-390-populated.png).
- Tất cả ảnh/log/script chỉ local: `tmp/kan89-kan90/`. Có `baseline/`, `final/`, `before-browser.json`, `after-browser.json`, `preflight-hashes.json`, `safety.json`. Không đưa QA artifacts vào commit.

### Giới hạn và bàn giao hiện hành

- Backend local chưa chạy; browser dùng responses kiểm thử trong harness local, không chứa fixture trong production source. Chưa xác nhận dữ liệu/quyền thực tế với phiên đăng nhập thật.
- Sidebar toggle và 34 failures/1 timeout baseline giữ nguyên; người dùng yêu cầu không sửa chúng trong Adjustment Phase.
- Vòng này chỉ đổi ba source files đã có (hai Dashboard và center-manager.css), thêm CSS Dashboard/test mới, cập nhật báo cáo này và tạo đúng một báo cáo KAN-90. Toàn bộ thay đổi chưa commit của vòng trước được giữ lại, trừ phần KPI KAN-89 được yêu cầu điều chỉnh.
- Index trống; không stage/commit/push/merge/PR. Dừng để người dùng nghiệm thu trước Visual Redesign Phase.

## Final Dashboard Adjustment KAN-89/KAN-90 — kết quả hiện hành

### Sáu KPI Center Manager

| Title | Dữ liệu | Icon | Màu |
|---|---|---|---|
| Active Students | Existing active student count | Graduation cap | Green |
| Active Classes | Existing active class count | Book | Blue |
| Active Staff | Existing active staff count | Users | Amber |
| Monthly Tuition Collected | Existing monthlyCollected | Banknote | Green |
| Overdue Tuition | `tuitionMetrics?.overdueAmount` | Circle alert | Red |
| Pending Approval Requests | Existing manager pending collection length | Clipboard | Blue |

- Overdue Tuition **không dùng outstanding**. Tái sử dụng kết quả `calculateTuitionMetrics(tuitions, payments, now)` đang có; chỉ đổi field đọc từ `outstanding` sang `overdueAmount`, không sửa service/policy học phí.
- Targeted test dùng hóa đơn quá hạn, đến hạn hôm nay và tương lai: outstanding = 2.100, overdueAmount = 600. Partial payment được xử lý bởi công thức hiện có; hai hóa đơn chưa quá hạn không góp vào overdue.
- `ManagementDashboardKpi.tsx` là component riêng cho hai Dashboard. Component Common/KpiCard không đổi. Icon SVG semantic dùng currentColor và các Bootstrap/EduTrack semantic tokens, không phụ thuộc thay đổi icon toàn cục.
- Active Students/Pending Approval Requests dùng cùng tên, icon và màu giữa hai role. Outstanding của Admin Staff dùng Wallet/Amber, Overdue của Manager dùng Circle alert/Red.
- Card chỉ Title/Value/Icon, không footer/divider/link/button/handler điều hướng. Currency dùng formatVND, đủ chữ số và VND cả khi unavailable. Kích thước/padding/radius/typography/grid giữ quy chuẩn của Adjustment trước.
- Welcome, quick actions, Pending Approval Requests Card, Recent Notifications và các section dưới KPI không thay đổi. Topbar KAN-53, Sidebar và các role khác giữ nguyên hash preflight.

### Files và nguồn dữ liệu trong vòng Final

- `Capstone2/frontend/src/GUIs/pages/admin/CenterManager/CenterManagerDashboardPage.tsx`: tên/field KPI và semantic kind.
- `Capstone2/frontend/src/GUIs/pages/admin/AdminStaff/AdminStaffDashboardPage.tsx`, `src/DAL/adminStaffDashboardDAL.ts`, `src/BLL/services/adminStaffDashboardService.ts`: Final KAN-90, incoming/outgoing từ cùng response; chi tiết trong báo cáo KAN-90 hiện có.
- Thêm `Capstone2/frontend/src/GUIs/components/admin/ManagementDashboardKpi.tsx`: presentation riêng hai Dashboard.
- Cập nhật `Capstone2/frontend/tests/managementDashboardKpis.test.mjs` và `tests/adminStaffDashboardDAL.test.mjs`: đúng phạm vi Final KPI/counting/DAL.
- Chỉ cập nhật hai docs đang có; không tạo file docs mới. Các CSS Dashboard/Topbar đã làm trước được giữ nguyên trong vòng Final.

### Validation mới nhất

| Check | Baseline trước Final | Sau Final |
|---|---|---|
| Lint | PASS, 208 warnings | PASS, 208 warnings |
| Typecheck | PASS | PASS |
| Production build | PASS, cảnh báo chunk >500 kB | Giữ nguyên |
| Frontend tests hoàn tất | 124 PASS / 34 FAIL | 133 PASS / 34 FAIL |
| notificationInbox.test.mjs | Timeout 20 giây | Giữ nguyên |
| Targeted Dashboard rendering/counting/tuition | 4 PASS | 10 PASS |
| Targeted Admin Staff DAL | 6 PASS | 9 PASS |
| Targeted Manager pending card/service | 6 PASS | 6 PASS |
| git diff --check | — | PASS |

- Chín tests bổ sung xác nhận semantic icon/color, overdue khác outstanding, chưa đến hạn không overdue, Waiting/Under Review, loại Approved/Rejected và outgoing, aliases hợp lệ, không đoán role, lỗi không thành 0 và một approval fetch cho hai luồng. Không sửa failures ngoài phạm vi.
- Browser: 16 specimens trước / 24 sau, hai role × tám widths 1920/1440/1280/1024/768/600/390/360 px; thêm loading/empty/error/missing-role tại 1280 px. Mọi card cao 148 px, không overflow/clipping/footer/interaction, click không điều hướng và hover không đổi shadow/transform. Các SVG đều 20 px trong container 32 px.
- Fixture có hóa đơn tương lai 5.000.000 VND: Outstanding Admin Staff = 122.585.245.802 VND, Overdue Manager = 122.580.245.802 VND; không mất chữ số ở các viewport.
- [Before Manager](../tmp/kan89-kan90-final/screenshots/before-center-manager-1920-populated.png) · [After Manager](../tmp/kan89-kan90-final/screenshots/after-center-manager-1920-populated.png) · [Mobile](../tmp/kan89-kan90-final/screenshots/after-center-manager-390-populated.png).
- Local QA: `tmp/kan89-kan90-final/` gồm screenshots, before/after-browser.json, baseline/final logs, snapshot/hash và safety.json; không đưa vào commit.

### Giới hạn và Git

- Backend local chưa chạy; UI QA dùng responses kiểm thử ngoài production. Chưa xác nhận số liệu/permission bằng phiên backend thật.
- Incoming KAN-90 thiếu/unknown requesterRole sẽ unavailable; Received Feedback legacy fallback theo ID được ghi nhận và không sửa. Sidebar toggle, 34 failures và 1 timeout giữ nguyên.
- Branch `Duy`, HEAD `1cca292c481447d721536feeb39221686eb742ef`, index trống. Giữ thay đổi các vòng trước ngoài phần Final được chỉ định; không stage/commit/push/merge/PR. Dừng chờ nghiệm thu checkpoint, chưa làm Visual Redesign.
