# EduTrack — KAN-53 & KAN-89

Ngày thực hiện: 18/11/2026. Trạng thái: đã triển khai frontend, chờ nghiệm thu giao diện; chưa stage/commit/push/merge/PR.

**Cập nhật hiện hành:** Center Identity & Topbar Profile Refinement đã triển khai; xem phần cuối để có kết quả và ảnh mới nhất. Giữ nguyên kết quả Final Dashboard Adjustment, nguồn dữ liệu và nghiệp vụ. Chờ nghiệm thu Center Manager trước khi triển khai Admin Staff Visual Redesign. Các phần trước được giữ làm lịch sử; KAN-53 không được thực hiện lại.

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

## Visual Redesign Phase — KAN-89 — 18/11/2026

### Preflight và phạm vi

- Đã đọc `AGENTS.md` và yêu cầu đính kèm. Branch `Duy`, HEAD và local remote-tracking ref `origin/Duy` cùng `8ae52ff0fe7336e022f02044a9936ff61c7ebc1d`; working tree sạch khi bắt đầu. Không reset/checkout commit cũ, không fetch/pull hoặc sửa công việc của thành viên khác.
- Snapshot source hiện tại được lưu tại `tmp/kan89-visual/baseline-source.json` để phục vụ QA baseline, không thay thế source trong working tree. `git check-ignore tmp/` xác nhận thư mục đã được ignore.
- Chỉ nâng cấp shell Center Manager và nội dung Dashboard. Các trang Schedule, User Accounts, Students, Subjects, Grades, Classes, Tuition, Approval Requests, Notifications, Reports, Settings kế thừa shell qua `CenterManagerLayout`; không chỉnh nội dung từng trang.
- Không sửa backend/database/migrations, API, auth, routes, permissions, công thức KPI, currency formatter hoặc các workflow hiện có. Không redesign Admin Staff hay các vai trò khác.

### Kết quả thiết kế

- Thêm variant `cm-academy` tại layout và stylesheet riêng; toàn bộ selector CSS được giới hạn theo variant này. Không sửa shared Topbar, notification components hoặc các stylesheet Student/Parent.
- Topbar nền trắng–mint, waves nhẹ và academic line-art trong vùng trống. Giữ branding, bell/badge, account dropdown/logout và các nút sidebar; không thêm search/year/theme. Dropdown trên mobile được căn cố định trong viewport bằng CSS riêng Center Manager.
- Sidebar nền trắng chuyển mint, center card bo góc, icons/spacings đồng nhất, active state mint với dấu nhấn xanh. Tái sử dụng illustration trường học mờ và waves dưới chân sidebar; không dành khoảng trống bắt buộc, không chặn menu. Ẩn illustration khi chiều cao ≤850 px, mobile hoặc trạng thái collapsed.
- Dashboard nền mint-white với sóng nhẹ phía dưới. Giữ title và breadcrumb; cải thiện typography/spacing.
- Welcome dùng gradient dark green–emerald, layered waves và minh họa vector laptop/dashboard, sách, mũ tốt nghiệp, văn phòng phẩm, cây xanh. Tên manager, center name, ngày và hai quick actions được giữ nguyên. Illustration nằm trong cột riêng, ẩn dưới 768 px; hai nút cùng padding/radius/min-height.
- Sáu KPI giữ đúng title/value/data source; nền tint và border theo Green/Cyan/Amber/Green/Red/Cyan. Icon phía trên, số lớn hơn, watermark decorative tái sử dụng đúng path icon. Card không có footer/divider/description/chart/link hoặc hover tương tác. Giữ nguyên định dạng VND và đầy đủ chữ số.
- Grid có sáu KPI trên một hàng từ 1500 px, ba dưới ngưỡng này, hai dưới 768 px và một dưới 480 px. Hai panel dưới giữ 60/40 từ 992 px, sau đó xếp dọc. Panel populated được phép có chiều cao tự nhiên để tránh kéo giãn notification thành khoảng trắng lớn.
- Approval panel có header icon và clipboard/checklist empty illustration. Notification panel có header decoration và bell/envelope empty illustration bằng scoped CSS. Giữ toàn bộ empty text và nội dung populated; không sửa sorting, priority/status, limit 5, count, Retry, read/unread, auto-hide hoặc API.
- Decorative images có `alt=""`/`aria-hidden`, pseudo-elements và SVG watermark không nhận pointer events; bổ sung focus outline. Không thêm dependencies/icon libraries, external image URLs hoặc dữ liệu mẫu vào production.

### Files thay đổi và assets

| File dưới `Capstone2/frontend/` | Nội dung |
|---|---|
| `src/GUIs/layouts/admin/CenterManagerLayout.tsx` | Opt-in variant và import CSS |
| `src/GUIs/pages/admin/CenterManager/CenterManagerDashboardPage.tsx` | Welcome illustration/column và bật KPI watermark |
| `src/GUIs/components/admin/CenterManager/PendingApprovalRequestsCard.tsx` | Header icon, empty illustration; giữ data/state branches |
| `src/GUIs/components/admin/ManagementDashboardKpi.tsx` | Prop optional `decorativeWatermark`, mặc định false; Admin Staff không truyền prop nên giữ nguyên markup |
| `src/assets/css/center-manager-academy.css` | Toàn bộ shell/dashboard visual riêng Center Manager |
| `src/assets/illustrations/manager-welcome.svg` | Asset mới, 3.114 bytes |
| `src/assets/illustrations/manager-approvals-empty.svg` | Asset mới, 1.002 bytes |
| `src/assets/illustrations/manager-notifications-empty.svg` | Asset mới, 898 bytes |
| `tests/centerManagerDashboard.test.mjs` | Hỗ trợ SVG import trong Node harness; kiểm tra illustration chỉ có ở empty state |
| `tests/managementDashboardKpis.test.mjs` | Xác nhận Manager có 6 decorative watermarks, Admin Staff không có |

Tái sử dụng `academy-school.svg`, `academy-page-waves.svg`, `academy-banner-waves.svg`, `academy-study-lineart.svg`, BrandIcon, Bootstrap Icons, KPI icon paths và các component hiện có. Ba SVG mới tổng cộng khoảng 5 KB. Tài liệu được cập nhật duy nhất tại file này; không tạo report khác.

### Visual và functional QA

Chrome headless dùng layout/components thật, responses kiểm thử được inject chỉ trong harness local. Chưa xác nhận backend thật hoặc số liệu tài khoản thực tế. Baseline và final gồm 20 specimens mỗi bên: Manager/Admin Staff ở sáu viewport populated, cộng loading/empty/error/missing-role ở 1280 px. Thêm 5 specimens Manager để kiểm tra desktop empty, chiều cao thấp 720 px và mobile empty/error/loading; có ảnh collapsed riêng.

| Viewport | KPI/hàng | Overflow ngang | Bell/Profile trong viewport | Add Student mở/đóng | Tuition link điều hướng |
|---|---|---|---|---|---|
| 1920 px | 6 | Không | PASS | PASS | PASS |
| 1440 px | 3 | Không | PASS | PASS | PASS |
| 1280 px | 3 | Không | PASS | PASS | PASS |
| 1024 px | 3 | Không | PASS | PASS | PASS |
| 768 px | 3 | Không | PASS | PASS | PASS |
| 390 px | 1 | Không | PASS | PASS | PASS |

- Sáu KPI cùng cao 184 px trong các specimens, không clipping. Kiểm tra đầy đủ `876.543.210 VND` và `122.580.245.802 VND`; hover không đổi shadow/transform, click không điều hướng.
- Populated fixture: count pending 8, danh sách chỉ 5, title dài wrap, badges và thứ tự giữ nguyên. Empty hiển thị 0 và minh họa riêng. Loading/error/missing-role phân biệt, không giả count 0. Notification empty count 0, populated count 1. Fixtures không được import vào ứng dụng.
- Bell/Profile mở được, Escape đóng được, modal nằm trong viewport; không submit tạo student, logout hoặc gửi mutation notification. View All giữ href hiện có; chưa kiểm tra click sâu vào nội dung notification hoặc read/unread end-to-end. Retry được giữ nguyên handler, chưa kiểm tra phục hồi lỗi với backend thật.
- Scroll sidebar tới Settings được tại viewport thường và 1280×720. Ép class trong harness để kiểm tra presentation collapsed 74 px, expanded 248 px và mobile drawer. **Nút mở/thu sidebar vẫn không hoạt động ở cả baseline/final do thiếu handler từ trước; không đánh dấu toggle behavior PASS.**
- Baseline mobile có dropdown tràn mép trái; final Center Manager đã nằm trong viewport bằng scoped CSS. Không sửa notification logic hoặc dropdown Admin Staff.
- Admin Staff: card content/geometry, styles đo được và welcome geometry giống baseline trong toàn bộ 10 specimens. Các role khác không chỉnh source; chưa chạy browser QA toàn bộ Student/Parent/Teacher/TA trong vòng này.
- Đã xem ảnh desktop populated/empty, mobile populated và collapsed; text/illustration không chồng nhau. Chưa audit contrast tự động hoặc kiểm tra bằng screen reader.

Screenshots local (không commit):

- [Before desktop](../tmp/kan89-visual/screenshots/before-center-manager-1920-populated.png) · [After desktop](../tmp/kan89-visual/screenshots/after-center-manager-1920-populated.png).
- [After desktop empty](../tmp/kan89-visual/screenshots-focused/after-center-manager-1920-empty.png) · [Tablet](../tmp/kan89-visual/screenshots/after-center-manager-768-populated.png) · [Mobile](../tmp/kan89-visual/screenshots/after-center-manager-390-populated.png).
- [Mobile empty](../tmp/kan89-visual/screenshots-focused/after-center-manager-390-empty.png) · [Loading](../tmp/kan89-visual/screenshots/after-center-manager-1280-loading.png) · [Error](../tmp/kan89-visual/screenshots/after-center-manager-1280-error.png).
- [Collapsed](../tmp/kan89-visual/screenshots-focused/after-collapsed-1280.png). JSON measurements tại `tmp/kan89-visual/{before,after}-browser.json`, `after-focused-browser.json`, `summary.json`; logs/scripts/cache/browser profiles đều trong thư mục QA đã ignore, không stage.

### Automated checks và baseline hiện tại

| Check | Baseline `8ae52ff` | Final |
|---|---|---|
| Frontend lint (`oxlint`) | PASS, 212 warnings | PASS, 212 warnings |
| Typecheck (`tsc -b`) | PASS | PASS |
| Production build (`tsc -b` + `vite build`) | PASS | PASS |
| Existing frontend tests, các file hoàn tất | 133 PASS / 34 FAIL | 134 PASS / 34 FAIL |
| `notificationInbox.test.mjs` | Timeout 20 giây | Cùng timeout 20 giây |
| Targeted Manager + management KPI tests | 16/16 PASS | 17/17 PASS |
| `git diff --check` | Working tree sạch | PASS |

Suite chạy từng test file bằng Node với timeout để file notification treo không chặn các file khác. Mọi file test cũ giữ nguyên pass/fail/exit/timeout; chỉ thêm một assertion group cho empty illustration. 34 failures có sẵn không sửa. Build giữ cảnh báo chunk >500 KB; không đổi bundling. Logs baseline/final nằm trong `tmp/kan89-visual/`; các ảnh và JSON chỉ là chứng cứ UI với fixtures, không tuyên bố integration/backend PASS.

### Git và bàn giao

- Branch/HEAD giữ nguyên `Duy` / `8ae52ff`; 7 tracked files modified (gồm báo cáo), 4 file mới (CSS và 3 SVG); index trống. `tmp/` không xuất hiện trong git status.
- Không stage, commit, push, merge hoặc tạo PR. Không triển khai Admin Staff Visual Redesign.
- Dừng chờ người dùng nghiệm thu Center Manager. Giới hạn còn lại: sidebar toggle có sẵn, 34 test failures và notification test timeout có sẵn, chưa QA bằng backend/session thật.

## Visual Refinement — Post-review Improvements

Ngày thực hiện: 18/11/2026. Đã hoàn thành triển khai và QA local, chờ nghiệm thu giao diện.

### Preflight và baseline

- Đọc lại AGENTS.md, implementation, báo cáo và feedback đính kèm. Branch `Duy`, HEAD `8ae52ff0fe7336e022f02044a9936ff61c7ebc1d` không đổi. Giữ nguyên toàn bộ thay đổi chưa commit của Visual Redesign.
- Baseline vòng này là **working tree sau Visual Redesign**, không phải HEAD trước redesign. Snapshot source tại `tmp/kan89-refinement/baseline-source.json`; không revert/checkout/reset source.
- `git check-ignore tmp/` xác nhận ignore trước khi tạo artifacts. Không xóa artifacts các vòng trước.
- Đọc CSS Student/Parent và xem `academy-school-mint.png`; tái sử dụng cách đặt illustration trong phần không gian dư và mask mềm, không sửa source hai role này.

### Các vấn đề đã xử lý

1. **Topbar:** thay SVG nhỏ đơn độc bằng một composition có sách mở, graduation cap, sách xếp, bút, academic symbols và đường nối mờ trên nhiều lớp wave. Gradient white–mint chạy xuyên topbar, fade trước vùng tài khoản; chiều cao vẫn 58 px. Giữ nguyên JSX/handlers của AdminTopBar, bell/dropdowns/logout/toggle.
2. **Sidebar:** nguyên nhân overlap là `sidebar::after` neo tuyệt đối vào chân sidebar nên trường học nằm sau Settings. Xóa hai lớp absolute cũ, chuyển `academy-school-mint.png` vào `sidebar-nav::after` có flex basis 0, min-height 0 và các nhóm menu không shrink. Illustration chỉ dùng phần dư sau toàn bộ menu; không ép thêm scroll để dành chỗ cho ảnh. PNG được mask radial trên bốn cạnh, hòa cùng white-to-mint gradient. Không còn block wave hình chữ nhật. Scrollbar chuyển sang mint nhạt, vẫn có thumb hover rõ hơn. Ẩn illustration khi chiều cao ≤1000 px, mobile hoặc collapsed.
3. **Welcome:** chiều cao desktop đủ rộng giảm từ khoảng 263 px xuống **146 px**. Heading 22 px (mobile 20 px), subtitle 13 px, hai button 36 px, radius 14 px. Chuyển ngày sang hàng thông tin bên trái; illustration dùng cột riêng và tỷ lệ lớn hơn tương đối với banner, không quyết định chiều cao. Giữ laptop/books/cap/stationery/plants asset hiện có; tự wrap ở màn hình hẹp.
4. **Màu banner:** sáng hơn với #078444 ở vùng chữ và #149D61 → #28B77A ở vùng minh họa. Waves được fade khỏi vùng chữ; mobile dùng dải xanh hẹp hơn để giữ white-text readability. Không đổi global branding.
5. **Hai panel:** chuẩn hóa header 65 px, icon 32 px, title 14 px, padding 16×20 px, View All ở trên bên phải. Notification count đứng cạnh link trong header. Title có thể wrap trong header hẹp mà không đẩy link xuống footer. Empty body cùng min-height 210 px, minh họa 132×88 px, spacing và typography giống nhau. Empty desktop hai card cùng cao **277 px**; grid stretch cho cả populated/loading/error, không hardcode chiều cao tối đa hoặc cắt nội dung. Giữ 60/40 khi hai card cạnh nhau, stack ở tablet/mobile.
6. **Notification View All:** thêm prop presentation optional `viewAllInHeader`, chỉ Center Manager truyền. Header vẫn dùng `basePath` từ inbox hiện tại. QuickList chỉ bỏ footer link khi variant này được bật; default Admin Staff và bell dropdown vẫn giữ link/footer cũ. Không thay API/store/count/read-unread/auto-hide/navigation behavior.
7. **Nền dashboard:** lớp wave trước neo vào `.cm-dashboard` với inset âm và đáy riêng, dễ lộ cạnh khi container kết thúc. Nay nền neo vào toàn bộ `.page-content` có Dashboard, phủ padding và chiều cao viewport/content; wave ở đáy được mask fade cả mép trên/dưới. Không có inset âm hoặc tạo scrollbar mới; không áp dụng decoration vào nội dung các trang chức năng khác.
8. **KPI:** giữ nguyên thiết kế đã nghiệm thu, sáu semantic colors/title/icon/value/currency formatting/data sources/calculations. Không thêm descriptions/chart/footer hoặc tương tác.

### Files và assets của riêng vòng refinement

| File dưới `Capstone2/frontend/` | Thay đổi |
|---|---|
| `src/assets/css/center-manager-academy.css` | Tinh chỉnh shell, banner, panels và background; toàn bộ selector scoped Center Manager |
| `src/GUIs/pages/admin/CenterManager/CenterManagerDashboardPage.tsx` | Đặt lại date và bật notification header-link variant |
| `src/GUIs/components/shared/notifications/NotificationQuickViews.tsx` | Optional presentation variant; default giữ nguyên |
| `src/assets/illustrations/manager-topbar-academy.svg` | SVG composition mới, 1.772 bytes |
| `tests/dashboardNotificationPresentation.test.mjs` | Hai rendering tests cho variant và default, gồm empty/loading/error/populated |

File thứ sáu là báo cáo hiện có này. Source comparison với snapshot đầu vòng xác nhận chỉ ba source files hiện có ở bảng trên thay đổi; các file của vòng trước được giữ lại. Không sửa backend, business services, routes/auth, Admin Staff page, Teacher/TA/Student/Parent/Landing Page.

Assets tái sử dụng: `academy-school-mint.png`, `academy-banner-waves.svg`, `manager-welcome.svg`, `manager-approvals-empty.svg`, `manager-notifications-empty.svg`; không tạo raster/dependency mới. Các asset outline cũ không còn dùng trong shell Manager được giữ nguyên trên disk để các role khác tiếp tục sử dụng.

### Responsive và functional QA

Chrome headless, components/layout thật, responses kiểm thử inject ngoài ứng dụng. Chụp **20 specimens trước và 20 sau**: hai role × sáu widths populated, cộng loading/empty/error/missing-role ở 1280 px. Thêm **9 specimens trước và 9 sau** cho notification loading/error, desktop empty ở height 1000/1080/1200, viewport thấp 1280×720 và mobile empty/error/loading. Có screenshot collapsed riêng.

| Width | Banner sau refinement | KPI/hàng | Panel headers | Tràn ngang / clipping KPI |
|---|---|---|---|---|
| 1920 px | 146 px | 6 | 65/65 px | Không |
| 1440 px | 146 px | 3 | 65/65 px | Không |
| 1280 px | 146 px | 3 | 65/65 px | Không |
| 1024 px | 173 px, wrap tự nhiên | 3 | 65/65 px | Không |
| 768 px | 173 px, wrap tự nhiên | 3 | 65/65 px | Không |
| 390 px | 191 px, wrap tự nhiên | 1 | 65/65 px | Không |

- Hai panels có chiều cao bằng nhau khi cùng hàng trong tất cả specimens, gồm populated và empty. View All đều nằm trong header; không có footer link Notifications ở Center Manager. Header/footer mặc định Admin Staff không đổi.
- Sidebar 1920×1200: illustration dùng 180 px dư, bắt đầu sau menu; 1440×1080: tự giảm xuống 89 px, không overlap. Height 1000/900/720 và mobile: illustration ẩn. Scroll tới Settings thành công, collapsed presentation 74 px kiểm tra qua class trong harness. **Nút toggle vẫn thiếu handler từ trước, baseline và final đều không hoạt động; không đánh dấu toggle PASS.**
- Bell/profile mở được và nằm trong viewport; Escape đóng. Add Student modal mở/đóng và nằm trong viewport. Tuition Details điều hướng đúng. Kiểm tra đầy đủ `876.543.210 VND`, `122.580.245.802 VND`, sáu KPI không click/hover tương tác, và data/title/icon/semantic classes giống baseline.
- Approval Retry trong error specimen thực sự phát sinh lại request. Notification loading/error và Retry control được render; chưa xác nhận notification Retry phục hồi thành công qua backend thật.
- Hai rendering tests mới kiểm tra đúng một View All, đúng destination, count, notification detail URL/unread class và bốn states; default Admin Staff giữ footer. Browser comparison xác nhận card content/geometry/styles và welcome của Admin Staff giống baseline ở toàn bộ 10 specimens.
- Đã xem trực tiếp full desktop populated/empty, desktop cao có school illustration và mobile. Đối chiếu before/after với các vấn đề trong feedback: banner gọn hơn, panel đồng nhất, không school chồng menu hoặc đường cắt ngang ở nền. Không có ảnh thiết kế tham chiếu mới riêng ngoài yêu cầu văn bản trong vòng này.
- Assertions tự động về panel headers/heights, placement View All, no overflow, sidebar artwork separation, banner/topbar dimensions và role isolation đều PASS; kết quả tại `tmp/kan89-refinement/verified.json`.
- Chưa kiểm thử bằng backend/session thật; không submit tạo học viên, logout hoặc mutation notification. Chưa kiểm tra notification read/unread end-to-end, screen reader hoặc audit contrast toàn bộ ứng dụng. Các role ngoài Admin Staff không chạy lại browser QA trong vòng này.

Ảnh local, không commit:

- Desktop empty đầy đủ: [Before 1920×1200](../tmp/kan89-refinement/screenshots-focused/before-center-manager-1920x1200-empty.png) · [After 1920×1200](../tmp/kan89-refinement/screenshots-focused/after-center-manager-1920x1200-empty.png).
- Desktop populated: [Before](../tmp/kan89-refinement/screenshots/before-center-manager-1920-populated.png) · [After](../tmp/kan89-refinement/screenshots/after-center-manager-1920-populated.png).
- Mobile: [Before](../tmp/kan89-refinement/screenshots/before-center-manager-390-populated.png) · [After](../tmp/kan89-refinement/screenshots/after-center-manager-390-populated.png) · [Empty](../tmp/kan89-refinement/screenshots-focused/after-center-manager-390x844-empty.png).
- [Sidebar 1080 px cao](../tmp/kan89-refinement/screenshots-focused/after-center-manager-1440x1080-empty.png) · [Collapsed](../tmp/kan89-refinement/screenshots-focused/after-collapsed-1280.png).
- [Notification error](../tmp/kan89-refinement/screenshots-focused/after-center-manager-1280x900-notification-error.png) · [Notification loading](../tmp/kan89-refinement/screenshots-focused/after-center-manager-1280x900-notification-loading.png).
- Toàn bộ ảnh của sáu viewport, JSON measurements, snapshots, logs, cache và scripts nằm trong `tmp/kan89-refinement/`, đã ignore. Artifacts các vòng cũ giữ nguyên.

### Automated checks và giới hạn

| Check | Baseline sau Visual Redesign | Sau refinement |
|---|---|---|
| Frontend lint | PASS, 212 warnings | PASS, 212 warnings |
| Typecheck | PASS | PASS |
| Production build | PASS, chunk warning >500 KB | PASS, cùng warning |
| Frontend test files hoàn tất | 134 PASS / 34 FAIL | 136 PASS / 34 FAIL |
| Notification inbox test | Timeout 20 giây | Cùng timeout 20 giây |
| Targeted Manager/KPI/notification presentation | 17/17 PASS | 19/19 PASS |
| `git diff --check` | PASS | PASS |

Suite chạy từng file với timeout như vòng trước; mọi file test cũ giữ nguyên pass/fail/exit/timeout. Hai tests mới PASS, không sửa 34 failures hoặc test timeout ngoài phạm vi. Logs nằm tại `tmp/kan89-refinement/{baseline,final}/`; build được chạy lại sau chỉnh CSS cuối cùng. Không tuyên bố full suite hoặc backend integration PASS.

### Git và bàn giao sau refinement

- `Duy` / `8ae52ff` giữ nguyên. Working tree tổng hợp cả hai vòng: **8 tracked files modified, 6 file mới**, index trống; không stage/commit/push/merge/PR. `tmp/` không nằm trong git status.
- Vòng refinement chỉ thêm/thay sáu files nêu trên, gồm báo cáo. Không tạo report mới hoặc xóa docs cũ.
- Dừng chờ nghiệm thu Center Manager; chưa triển khai Admin Staff Visual Redesign. Giới hạn còn lại: sidebar toggle thiếu handler, 34 failures/1 timeout có sẵn và chưa QA backend thật.

## Final Visual Polish — Center Manager

Ngày thực hiện: 18/11/2026. Hoàn tất polish và QA local; chờ nghiệm thu Center Manager.

### Preflight và phạm vi

- Đã đọc AGENTS.md, yêu cầu Final Visual Polish, source và báo cáo hai vòng trước; đối chiếu với ba ảnh tham chiếu người dùng cung cấp. Branch `Duy`, HEAD `8ae52ff0fe7336e022f02044a9936ff61c7ebc1d` giữ nguyên.
- Baseline là working tree sau Visual Refinement, gồm toàn bộ thay đổi chưa commit từ các vòng trước. Snapshot tại `tmp/kan89-polish/baseline-source.json`; không revert/reset/checkout hoặc ghi đè thay đổi khác.
- Xác nhận `tmp/` đã được ignore trước QA. Không xóa artifacts cũ. Kiểm tra lại `academy-school-mint.png`, assets Student/Parent và các minh họa Manager hiện có trước khi tạo asset mới.
- Chỉ thay visual Center Manager; không sửa shared component trong vòng này, không thay nghiệp vụ/API/auth/route/KPI calculations hoặc các role khác.

### Kết quả polish

- **Topbar:** bỏ composition line-art cũ khỏi CSS. Tạo một still life soft 3D thống nhất gồm sách mint/ivory, graduation cap sage, bút và kính, cùng phối cảnh/chất liệu/ánh sáng/contact shadow. PNG trong suốt, được đặt ở vùng trống phía trái actions với opacity .36 desktop/.22 mobile; nhiều lớp waves trắng–mint ở nền, không dotted connectors hoặc icon collage. Chiều cao topbar vẫn 58 px; không sửa branding/bell/profile/logout/toggle handlers.
- **Sidebar:** xác nhận ảnh bị ẩn bởi breakpoint ≤1000 px và menu gần chiếm hết chiều cao. Tối ưu spacing thành menu item 38 px, giữ font 13 px và icon 28 px; khoảng cách nhóm 10 px, giảm padding dư. Giữ nguyên mọi menu/order/routes/permissions và scroll container. `sidebar-nav::after` vẫn chỉ dùng không gian dư, nay neo về chân bằng margin auto, scale theo chiều cao thực tế và cap 150 px. Giữ mask radial, không có cạnh PNG; không đặt ảnh sau Settings hoặc tạo spacer bắt buộc.
- **Điều kiện school illustration:** desktop 1000/1080/1200 px cao hiển thị 150 px; height 920 px co còn 104 px, 900 px còn 84 px. Ẩn khi height ≤880 px, mobile hoặc collapsed; ưu tiên menu khi không đủ chỗ. Trong các specimens hiển thị, ảnh luôn bắt đầu sau toàn bộ menu.
- **Welcome:** giữ desktop 146 px và heading 22 px; mobile heading 20 px. Gradient tối vừa đủ ở vùng chữ, chuyển #078B55 → #21AD75 → #65D5A3 về phía phải; waves mềm hơn. Date badge chuyển về góc trên phải, cách top 12 px/right 22 px, nền badge tăng tương phản. Illustration management giữ nguyên asset, nằm dưới date trong cột riêng; QA xác nhận hai bounding boxes không giao nhau. Mobile date về flow sau quick actions, banner tự nở khoảng 197 px.
- **KPI:** giảm 184 → **136 px** với padding 16×18 px, icon 32 px, label 13 px, số đếm 27 px và tiền 24 px. Label phía trên/value phía dưới; số tiền vẫn hiển thị đủ VND. Watermark giữ đúng path/semantic color, chuyển lên vùng trên với opacity .045, tách hoàn toàn khỏi vùng value. Không đổi sáu definitions/data sources/calculations, không footer/divider/supporting text/chart/link hoặc hover tương tác.
- **Panels:** giữ cấu trúc header 65 px, icon/count/View All, 60/40 desktop, stretch cùng chiều cao và không footer riêng. Đặt min-height 316 px, không max-height. Minh họa empty tăng 132×88 → **156×104 px** (+18,2%), gap 8 px, description 13 px; căn giữa body tự nhiên. Populated tiếp tục mở rộng theo tối đa 5 requests hiện có và nội dung thật, không cắt.
- **Nền/breadcrumb:** giảm opacity bottom waves .28 → .16, giữ lớp background xuyên content và mask fade. Scoped breadcrumb links trong Center Manager dùng #078444, hover #05643C; màu current page và logic breadcrumb không đổi.

### Files và assets của riêng vòng này

| File | Thay đổi |
|---|---|
| `Capstone2/frontend/src/assets/css/center-manager-academy.css` | Toàn bộ visual polish scoped Center Manager |
| `Capstone2/frontend/src/GUIs/pages/admin/CenterManager/CenterManagerDashboardPage.tsx` | Di chuyển date khỏi hàng center/subtitle, giữ nguyên data và handlers |
| `Capstone2/frontend/src/assets/illustrations/manager-topbar-still-life.png` | Asset soft 3D mới, PNG alpha 640×213, 194.451 bytes |
| `docs/EDUTRACK_KAN53_KAN89_RESULT.md` | Cập nhật duy nhất báo cáo tổng hợp này |

Tái sử dụng `academy-school-mint.png`, `academy-banner-waves.svg`, `manager-welcome.svg`, `manager-approvals-empty.svg`, `manager-notifications-empty.svg`, KPI SVG paths và Bootstrap Icons. Không thêm library hoặc external image URL. `manager-topbar-academy.svg` của vòng trước được giữ trên disk nhưng không còn được CSS Manager sử dụng.

PNG mới được tạo bằng **built-in image_gen**, không dùng CLI/API fallback; tối ưu kích thước bằng resampling và giữ alpha (kiểm tra corner alpha = 0). Source gốc chỉ lưu local trong `tmp/kan89-polish/imagegen/` và thư mục mặc định của tool, không đưa vào Git. Asset ứng dụng được lưu tại đường dẫn trong bảng, không tham chiếu file bên ngoài repository.

Prompt tạo ảnh cuối cùng:

> Use case: stylized-concept. Asset type: a production transparent raster illustration for the 58px-high topbar of EduTrack, a professional academy management app. Create ONE cohesive, elegant soft 3D educational still life, inspired by pastel mint academic still-life photography: a low, horizontal stack of three substantial hardcover books, a graduation cap with a delicate pale-gold tassel resting naturally on the right side of the books, and two pencils plus subtle translucent eyeglasses arranged on the left against the same stack. Objects overlap naturally as a single scene with consistent perspective, bevels, paper edges, ambient occlusion and soft shared ground shadow. Color palette: pastel mint, sage green, warm ivory paper, muted teal, very small pale-gold accents; cap should be deep muted sage rather than black. Wide, low composition, approximately 3:1 width to height, suitable for being displayed around 250–320px wide by 50px high. All objects fully inside frame with small breathing room. Very clean professional studio lighting, refined materials, recognizable substantial shapes even at low opacity. Actual transparent background, retain natural soft contact shadow. No text, no letters, no labels, no logos, no dotted connectors, no floating icons, no UI screenshot, no decorative background. This must read as a composed miniature academy still life, never as a row or collage of disconnected icons.

### Browser QA và screenshots

**20 specimens trước/20 sau**, gồm Manager/Admin Staff tại 1920/1440/1280/1024/768/390 px populated và các trạng thái loading/empty/error/missing-role ở 1280 px. Thêm **13 specimens trước/13 sau** cho desktop height 880/900/920/1000/1080/1200, 1280×720, mobile states, notification loading/error và số tiền rất dài ở 1024 px. Fixtures chỉ inject trong harness local; ứng dụng không import dữ liệu mẫu.

| Width | Banner | KPI thông thường | Hai panel empty | Overflow ngang |
|---|---|---|---|---|
| 1920 px | 146 px | 136 px | 316/316 px | Không |
| 1440 px | 146 px | 136 px | Stretch cùng chiều cao khi cùng hàng | Không |
| 1280 px | 146 px | 136 px | 316/316 px | Không |
| 1024 px | 146 px | 136 px | Stretch cùng chiều cao khi cùng hàng | Không |
| 768 px | 146 px | 136 px | Stack theo nội dung | Không |
| 390 px | ~197 px | 136 px | 316/316 px khi empty, stack | Không |

- Đã xem trực tiếp full desktop populated/empty, sidebar height 900 px và mobile; đánh giá composition ảnh, tỷ lệ banner/KPI/panels, vị trí ngày, menu/image separation và background transitions. Không chỉ dùng DOM assertions.
- Bell/profile mở, nằm trong viewport và đóng bằng Escape; Add Student modal mở/đóng và nằm trong viewport; Tuition Details điều hướng đúng trong toàn bộ specimens sau sửa. Decoration không chặn vùng tương tác.
- View All cả hai card vẫn trong header; header cùng 65 px, không footer link Notifications. Notification count/unread/detail href và Approval limit/sorting giữ nguyên. Approval Retry phát sinh lại request trong error specimen. Notification loading/error render đúng; chưa xác nhận Retry phục hồi với backend thật.
- KPI data/title/icon/semantic classes giống baseline. Không hover/click navigation hoặc clipping. Các số `876.543.210 VND`, `122.580.245.802 VND` hiển thị đủ. Thêm invoice ~1,2 triệu tỷ VND ở 1024 px: số tiền wrap và hàng KPI tự tăng lên khoảng **158 px**, không ép target 136 px gây mất chữ số; watermark không giao vùng value.
- Desktop date top/right đúng 12/22 px và không overlap illustration; mobile date nằm trong flow, không tạo overflow. Breadcrumb link đúng rgb(7,132,68), current page giữ màu cũ.
- Sidebar scroll tới Settings thành công; collapsed presentation 74 px được kiểm tra bằng class trong harness. **Sidebar toggle vẫn thiếu handler từ trước: baseline/final đều không hoạt động; không đánh dấu behavior PASS.**
- Admin Staff card content/geometry/styles và welcome geometry giống baseline trong cả 10 specimens. Source comparison xác nhận chỉ hai source files hiện có nêu trong bảng thay đổi; không sửa role khác hoặc service/business code.
- Assertions tổng hợp PASS tại `tmp/kan89-polish/verified.json`. Chưa test backend/session thật, create-student submission, logout, notification read/unread mutation end-to-end, screen reader hoặc contrast audit toàn ứng dụng.

Ảnh local (không commit):

- Full desktop empty: [Before](../tmp/kan89-polish/screenshots-focused/before-center-manager-1920x1000-empty.png) · [After](../tmp/kan89-polish/screenshots-focused/after-center-manager-1920x1000-empty.png).
- Full desktop populated: [Before](../tmp/kan89-polish/screenshots/before-center-manager-1920-populated.png) · [After](../tmp/kan89-polish/screenshots/after-center-manager-1920-populated.png).
- Mobile: [Before](../tmp/kan89-polish/screenshots/before-center-manager-390-populated.png) · [After](../tmp/kan89-polish/screenshots/after-center-manager-390-populated.png) · [Empty](../tmp/kan89-polish/screenshots-focused/after-center-manager-390x844-empty.png).
- [Sidebar 900 px cao](../tmp/kan89-polish/screenshots-focused/after-center-manager-1920x900-empty.png) · [Collapsed](../tmp/kan89-polish/screenshots-focused/after-collapsed-1280.png) · [Long currency](../tmp/kan89-polish/screenshots-focused/after-center-manager-1024x1000-long-currency.png).
- Các viewport/states còn lại, JSON measurements, baseline source, imagegen original, logs, scripts/cache/browser profiles đều nằm trong `tmp/kan89-polish/`, đã ignore.

### Automated checks và Git

| Check | Baseline sau Refinement | Final Visual Polish |
|---|---|---|
| Frontend lint | PASS, 212 warnings | PASS, 212 warnings |
| Typecheck | PASS | PASS |
| Production build | PASS, chunk warning >500 KB | PASS, cùng warning |
| Existing frontend test files hoàn tất | 136 PASS / 34 FAIL | 136 PASS / 34 FAIL |
| Notification inbox test | Timeout 20 giây | Cùng timeout 20 giây |
| Targeted Manager/KPI/notification presentation | 19/19 PASS | 19/19 PASS |
| `git diff --check` | PASS | PASS |

- Không thêm test chỉ để kiểm tra CSS hoặc sửa test ngoài phạm vi. Từng file test giữ nguyên pass/fail/exit/timeout; không có regression mới. Toàn bộ suite chưa PASS vì 34 failures và notification timeout có sẵn.
- Build đã chạy lại sau CSS cuối cùng, emit asset PNG local mới. Logs baseline/final tại `tmp/kan89-polish/{baseline,final}/`.
- Branch/HEAD `Duy` / `8ae52ff` không đổi. Working tree tổng hợp các vòng có **8 tracked files modified và 7 file mới**, index trống; `tmp/` không xuất hiện trong status. Riêng vòng này thay/thêm 4 files trong bảng.
- Không stage, commit, push, merge hoặc tạo PR. Không tạo report khác, không triển khai Admin Staff. Dừng để người dùng nghiệm thu Center Manager.

## Layout/UI — Topbar phương án C

Ngày thực hiện: 18–19/11/2026. Tiếp tục trên `Duy`, HEAD `8ae52ff`; bảo toàn toàn bộ thay đổi các vòng trước.

### Phạm vi và thay đổi

- Vòng này **chỉ sửa** `Capstone2/frontend/src/assets/css/center-manager-academy.css` và cập nhật báo cáo đã được chỉ định này. Source snapshot trước vòng tại `tmp/kan89-option-c/baseline-source.json` xác nhận tất cả TS/TSX, business services, routes và các role khác giữ nguyên từng byte.
- **Topbar phương án C:** bỏ still-life illustration khỏi CSS; giữ nền white-to-mint và Elegant Green Waves mờ (opacity .28 desktop/.20 mobile), fade ngang. Không thêm text/thông tin/widget hoặc biến topbar thành banner. Chiều cao vẫn 58 px; bên phải giữ bell và profile block, mobile menu hiện có giữ nguyên.
- **Welcome:** chuyển gradient sang green–sage–mint dịu hơn: #176E50 → #267D5B → #529B78 → #99C8AC, giảm waves .30 → .16; mobile dùng dải xanh trầm vừa đủ cho chữ trắng. Date badge dùng nền xanh dịu hơn. Giữ nguyên asset, kích thước/vị trí illustration, heading, nội dung, date position, CTA và kích thước banner.
- **KPI:** giữ sáu card 136 px và cách thể hiện số liệu. Watermark chuyển về góc dưới bên phải (32 px, right 10 px/bottom 2 px, opacity .055); kiểm tra trực tiếp glyph rectangles của số và đơn vị tiền thay vì chỉ bounding box toàn bộ heading. Giữ nguyên icon/title/value spacing và semantic colors; giảm nhẹ độ đỏ của nền/border Overdue Tuition.
- **Panels:** tăng nhẹ min-height desktop 316 → **344 px**, giữ stretch cùng chiều cao và 60/40. Tablet/mobile vẫn 316 px để không tạo khoảng trống lớn. Header 65 px, icon/count/View All, padding, illustration và empty composition đồng nhất; không thêm footer, không đặt max-height. Nội dung populated vẫn mở rộng tự nhiên.
- **Sidebar:** giữ cấu trúc và menu spacing hiện có; active state nhẹ hơn. School illustration giảm opacity .85 → .62, giới hạn 128 px, inset hai bên và thêm khoảng cách chân 6 px; vẫn co theo phần dư, không che menu hoặc ép scroll. Không tạo/xóa asset; PNG topbar của vòng trước được giữ trên disk, hiện không dùng trong layout.

### Kiểm tra

- Đọc AGENTS.md; xác nhận `tmp/` được ignore trước QA. Artifacts cũ giữ nguyên; toàn bộ artifacts mới nằm trong `tmp/kan89-option-c/`.
- Browser: **20 specimens trước/20 sau**, gồm Center Manager/Admin Staff tại 1920/1440/1280/1024/768/390 px, thêm loading/empty/error/missing-role ở 1280 px. Thêm **13 specimens trước/13 sau** cho viewport thấp/cao, mobile states, notification loading/error và số tiền rất dài.
- Đã xem ảnh desktop empty/populated, mobile và long-currency. Không overflow ngang, clipping số liệu hoặc decoration che nội dung; không có footer trắng riêng trong Notifications. KPI đồng đều; panel empty desktop cùng 344 px, mobile cùng 316 px. Welcome vẫn 146 px desktop/~197 px mobile; illustration không tăng kích thước.
- Watermark không giao với các glyph số tiền, số đếm hoặc VND trong mọi specimen, kể cả số tiền nhiều dòng ở 1024 px. Card tự nở khi cần, không truncate hoặc thay formatter/data.
- Bell/profile mở và đóng bằng Escape, dropdown/modal nằm trong viewport; Add Student mở/đóng; Tuition Details điều hướng đúng. Approval Retry vẫn phát sinh request. Sidebar scroll tới Settings được; collapsed presentation giữ 74 px. **Toggle sidebar vẫn thiếu handler từ trước, không sửa hoặc đánh dấu PASS.**
- Admin Staff card content/styles/geometry và welcome giống baseline ở cả 10 specimens. Không có thay đổi behavior trong production: toàn bộ component, hook, data, API/auth/backend/database/routing giữ nguyên.
- Assertions tại `tmp/kan89-option-c/verified.json` PASS. UI QA sử dụng responses kiểm thử ngoài production; chưa xác nhận backend/session thật hoặc mutation read/unread/create student/logout end-to-end.

| Check | Baseline | Sau chỉnh |
|---|---|---|
| Lint | PASS, 212 warnings | PASS, 212 warnings |
| Typecheck | PASS | PASS |
| Production build | PASS, chunk warning >500 KB | PASS, cùng warning |
| Targeted tests | 19/19 PASS | 19/19 PASS |
| Frontend test files hoàn tất | 136 PASS / 34 FAIL | 136 PASS / 34 FAIL |
| Notification inbox test | Timeout 20 giây | Cùng timeout 20 giây |
| `git diff --check` | PASS | PASS |

Không thêm tests chỉ để kiểm tra CSS; mọi test file giữ nguyên pass/fail/exit/timeout so với baseline. Không sửa lỗi ngoài phạm vi.

### Ảnh và bàn giao

- Desktop empty: [Before](../tmp/kan89-option-c/screenshots-focused/before-center-manager-1920x1000-empty.png) · [After](../tmp/kan89-option-c/screenshots-focused/after-center-manager-1920x1000-empty.png).
- Desktop populated: [Before](../tmp/kan89-option-c/screenshots/before-center-manager-1920-populated.png) · [After](../tmp/kan89-option-c/screenshots/after-center-manager-1920-populated.png).
- Mobile: [Before](../tmp/kan89-option-c/screenshots/before-center-manager-390-populated.png) · [After](../tmp/kan89-option-c/screenshots/after-center-manager-390-populated.png).
- [Long currency](../tmp/kan89-option-c/screenshots-focused/after-center-manager-1024x1000-long-currency.png). Các ảnh/JSON/logs/scripts/cache khác nằm trong cùng thư mục QA đã ignore.
- Không tạo docs mới. Branch/HEAD, index và các thay đổi trước vòng được giữ nguyên; không stage/commit/push/merge/PR. Working tree tổng hợp vẫn 8 tracked files modified và 7 file mới từ các vòng trước; vòng này không thêm source file hoặc asset.
- Dừng chờ nghiệm thu giao diện Center Manager; chưa triển khai Admin Staff.

## Center Identity & Topbar Profile Refinement

Ngày thực hiện: 19/11/2026. Đã triển khai Option 1 cho center card và Option A cho topbar, chờ nghiệm thu.

### Preflight và phạm vi

- Đọc AGENTS.md, kiểm tra `Duy` / HEAD `8ae52ff0fe7336e022f02044a9936ff61c7ebc1d` và working tree. Bảo toàn implementation/chưa commit từ mọi vòng trước. Không checkout/reset/revert/fetch/pull.
- Xác nhận `tmp/` được ignore trước QA; snapshot baseline working tree tại `tmp/kan89-identity/baseline-source.json`. Không xóa artifacts cũ hoặc tạo report mới.
- Đối chiếu hai ảnh tham chiếu School Icon Option 1 / Soft Glass Option A. Kiểm tra Bootstrap Icons hiện có: không có một school glyph đáp ứng đầy đủ clock–flag–symmetrical wings, nên tạo SVG inline nhẹ, không thêm library.
- Đọc source avatar/defaults: seed hiện tại dùng `api.dicebear.com/.../avataaars/...`; placeholder local đã có là `/assets/img/profiles/avatar-27.jpg`. Chỉ đọc để xác định artwork mặc định, không sửa backend/seed/database/profile data.

### Visual và avatar presentation

- **Center Information Card:** white-to-mint gradient, border #D0E6D9, radius 13 px và shadow nhẹ. Padding 7×8 px, căn giữa nội dung. Chiều cao thực đo **56 px như baseline**, không đẩy navigation hoặc school illustration bên dưới.
- **School Icon Option 1:** SVG duotone green với hai cánh đối xứng, central clock và small flag; icon 30 px trong mint square 40×40 px/radius 11 px, nền #DDF4E7, màu #078444. SVG decorative, `aria-hidden` và không nhận focus.
- **Typography:** tên trung tâm dynamic 14 px/weight 650/line-height 19 px; Learning Center 11 px/15 px, cách 4 px, màu #64748B. Tên dài ellipsis một dòng để giữ card gọn; full name vẫn trong DOM và `title` để xem đầy đủ. Giữ nguyên loading/error/not-configured fallback; không hardcode center name hoặc thêm click/dropdown.
- **Soft Glass Profile:** nền rgba(255,255,255,.65), border #D0E5D9, blur 8 px, radius 12 px, shadow rất nhẹ. Profile và bell cùng cao **46 px** trong topbar vẫn **58 px**, gap **12 px** ở cả desktop/tablet/mobile. Name semibold 13 px, employee code 11 px; chevron và toàn bộ trigger/dropdown giữ nguyên.
- **Initials Avatar:** circular 36 px, nền #DDF4E7, chữ #078444/weight 650. Variant chỉ bật qua `CenterManagerLayout → AdminTopBar → AdminAccountDropdown`; mặc định false nên các role khác giữ presentation cũ.
- Initials dùng hai thành phần cuối sau trim/split whitespace và normalize Unicode NFC; uppercase locale tiếng Việt. `Nguyễn Văn Quản Lý → QL`, `Nguyễn Văn An → VA`, `Trần Minh Anh → MA`, `Đức → Đ`, thiếu/rỗng tên → `?`. Không sửa tên/URL nguồn.
- Không có URL, known system Avataaars artwork hoặc placeholder local → initials. Các image URL khác giữ nguyên; `onError` chỉ thay presentation sang initials. Component được key theo user ID/URL, tránh mang trạng thái lỗi ảnh sang tài khoản hoặc URL mới. Không ghi avatar URL vào store/database hoặc sửa profile settings.
- **Bell:** cùng Soft Glass, icon/alignment hiện có, hover/focus nhẹ. Không overflow hidden nên unread badge không bị cắt; giữ count và toàn bộ callback/dropdown.
- Source/CSS comparison xác nhận Elegant Green Waves, Sidebar navigation/school illustration, Welcome Banner, KPI, hai panels và dashboard background giữ nguyên. Source của `NotificationBellDropdown`, `QuickList`, `DashboardNotificationsCard`, `useDismiss` giống baseline từng byte. Không sửa auth/API/routes/business services.

### Files thay đổi riêng vòng này

| File dưới `Capstone2/frontend/` | Nội dung |
|---|---|
| `src/GUIs/layouts/admin/CenterManagerSidebar.tsx` | School SVG và full dynamic-name tooltip |
| `src/GUIs/layouts/admin/CenterManagerLayout.tsx` | Bật variant Manager |
| `src/GUIs/layouts/admin/AdminTopBar.tsx` | Optional variant, default false |
| `src/GUIs/components/shared/notifications/NotificationQuickViews.tsx` | Optional avatar presentation, giữ callbacks và variant mặc định |
| `src/assets/css/center-manager-academy.css` | Chỉ center card và Soft Glass profile/bell |
| `src/GUIs/components/admin/CenterManager/CenterSchoolIcon.tsx` | SVG Option 1 inline mới |
| `src/GUIs/components/admin/CenterManager/CenterManagerTopbarAvatar.tsx` | Avatar presentation/error fallback riêng Manager |
| `src/GUIs/utils/centerManagerAvatar.ts` | Helpers Unicode initials và known-default detection |
| `tests/centerManagerIdentity.test.mjs` | Sáu targeted tests cho initials/default/personal avatar rendering |

File thứ mười là báo cáo tổng hợp này. Tái sử dụng BrandIcon, shared bell SVG, Bootstrap Icons, existing dropdowns và toàn bộ illustrations đang có. Asset mới duy nhất là school SVG inline; không tạo raster image, thêm icon library hoặc external image URL cho production.

### Visual & functional QA

- **20 specimens trước / 20 sau:** Center Manager và Admin Staff ở 1920/1440/1280/1024/768/390 px populated; thêm loading/empty/error/missing-role ở 1280 px. Card/KPI/welcome/panel geometry và sidebar navigation/illustration geometry giữ nguyên.
- **12 identity specimens trước / 12 sau:** desktop/tablet/mobile với default cartoon; personal image, broken image, tên một từ, tên thiếu, VA/MA, tên người/trung tâm rất dài; thêm Admin Staff/default cartoon để kiểm tra variant isolation.
- **13 focused specimens sau:** viewport thấp/cao, collapsed presentation, long currency, notification loading/error và mobile states. Artifacts chỉ trong `tmp/kan89-identity/`.
- Initials đúng QL/VA/MA/Đ/?, không request default cartoon ở Manager. Valid personal image fixture giữ đúng source và load được; broken URL thực sự trả 404 rồi fallback QL. Đổi account từ ảnh lỗi sang account có ảnh hợp lệ hiển thị ảnh trở lại; không thay dữ liệu ảnh nguồn.
- Fixtures ảnh cá nhân/cartoon được phục vụ local/qua interception trong QA, không phải xác nhận ảnh hoặc tài khoản production. Không phát sinh external avatar traffic để dựng baseline. Fixtures không được import vào ứng dụng.
- Profile/bell cao 46 px, topbar 58 px, gap 12 px, badge nằm trong viewport và không bị che. Long name ellipsis không làm card/topbar tăng chiều cao hoặc tạo horizontal overflow. Mobile giữ behavior ẩn label profile như trước.
- Bell/profile dropdown mở được, Escape đóng, dropdown/modal nằm trong viewport ở Manager. Profile account selector vẫn hoạt động. Logout được click thật trong isolated QA browser: xóa token thử nghiệm, clear session và điều hướng `/` tới outlet QA signed-out; không dùng cookie/session người dùng thật hoặc sửa auth code.
- Add Student mở/đóng, Tuition Details điều hướng đúng, sidebar scroll tới Settings được; collapsed style 74 px vẫn đúng. **Nút sidebar toggle vẫn thiếu handler từ baseline, không sửa hoặc đánh dấu behavior PASS.**
- Admin Staff giữ avatar cartoon, layout/style/default behavior như baseline. Dropdown mobile Admin Staff vẫn có vấn đề tràn mép có sẵn; không mở rộng scope để sửa. Các role khác không chỉnh source; chưa chạy lại browser toàn bộ Teacher/TA/Student/Parent.
- Đã xem trực tiếp detail crops của center card/profile và full desktop/mobile screenshots. Protected CSS ngoài hai vùng cho phép giữ nguyên; main matrix có no overflow, data/KPI/panel geometry giống baseline. Kết quả assertions: `tmp/kan89-identity/verified.json` PASS.
- Chưa xác nhận backend/session thật, ảnh cá nhân thực tế, notification read/unread end-to-end hoặc screen reader/contrast audit toàn ứng dụng. Default detection chỉ nhận diện các artwork/asset đã biết của hệ thống, không phân loại nội dung ảnh tùy ý.

### Before/after screenshots local

- Center card detail: [Before](../tmp/kan89-identity/identity-screenshots/before-center-detail.png) · [After](../tmp/kan89-identity/identity-screenshots/after-center-detail.png).
- Soft Glass profile detail: [Before](../tmp/kan89-identity/identity-screenshots/before-profile-detail.png) · [After](../tmp/kan89-identity/identity-screenshots/after-profile-detail.png).
- Full desktop với default avatar: [Before](../tmp/kan89-identity/identity-screenshots/before-center-manager-1920-cartoon.png) · [After](../tmp/kan89-identity/identity-screenshots/after-center-manager-1920-cartoon.png).
- [Tablet](../tmp/kan89-identity/identity-screenshots/after-center-manager-768-cartoon.png) · [Mobile](../tmp/kan89-identity/identity-screenshots/after-center-manager-390-cartoon.png) · [Personal image](../tmp/kan89-identity/identity-screenshots/after-center-manager-1280-photo.png) · [Broken-image fallback](../tmp/kan89-identity/identity-screenshots/after-center-manager-1280-broken.png) · [Long names](../tmp/kan89-identity/identity-screenshots/after-center-manager-1280-long.png).
- Các screenshots/states khác, source snapshots, JSON measurements, browser profiles, logs/scripts/caches đều ở `tmp/kan89-identity/`, đã ignore và không stage.

### Automated checks và Git

| Check | Baseline | Sau refinement |
|---|---|---|
| Frontend lint | PASS, 212 warnings | PASS, 212 warnings |
| Typecheck | PASS | PASS |
| Production build | PASS, chunk warning >500 KB | PASS, cùng warning |
| Targeted Manager/KPI/notification/identity tests | 19/19 PASS | 25/25 PASS |
| Frontend test files hoàn tất | 136 PASS / 34 FAIL | 142 PASS / 34 FAIL |
| Notification inbox test | Timeout 20 giây | Cùng timeout 20 giây |
| `git diff --check` | PASS | PASS |

- Sáu tests mới kiểm tra Vietnamese initials/Unicode/missing name, known defaults, personal URLs và actual Avatar rendering. Browser kiểm tra error/recovery với `onError` thật. Tất cả test files cũ giữ nguyên pass/fail/exit/timeout; không sửa 34 failures hoặc timeout ngoài scope. Logs baseline/final nằm trong `tmp/kan89-identity/{baseline,final}/`.
- Branch/HEAD vẫn `Duy` / `8ae52ff`, index trống. Working tree tổng hợp mọi vòng có **10 tracked files modified và 11 file mới**; riêng vòng này 10 files nêu trên (gồm report), không có QA artifacts trong status.
- Không stage, commit, push, merge hoặc tạo PR. Không tạo report mới. Dừng chờ người dùng nghiệm thu giao diện.

## Unified Dashboard Visual Design — KAN-89 / KAN-90 / KAN-95

- Vòng unified giữ nguyên visual baseline Center Manager. Chỉ chuẩn hóa header links Pending Approval Requests và Recent Notifications thành Text + một `bi bi-arrow-right`, #078444, 12px/600, gap 5px và focus/hover thống nhất; giữ nguyên destinations/handlers.
- Mở rộng academy CSS opt-in cho Teacher/TA để tái sử dụng, không redesign Manager. Manager dashboard/layout/sidebar/topbar và KPI component giữ nguyên so với snapshot đầu vòng unified.
- Regression ở 1920/1440/1280/1024/768/390px: welcome geometry, KPI metrics/computed styles và shell signatures khớp baseline. Ảnh chỉ khác navigation theo scope; không tuyên bố toàn ảnh trùng pixel.
- [Before Manager](../tmp/kan95-unified/screenshots/before-center-manager-1440-populated.png) · [After Manager](../tmp/kan95-unified/screenshots/after-center-manager-1440-populated.png) · [Mobile](../tmp/kan95-unified/screenshots/after-center-manager-390-populated.png).
- Lint/typecheck/build/diff check PASS; 212 lint warnings và build chunk warning giữ nguyên. Full suite: baseline 142 PASS / 34 FAIL / 1 timeout; final 149 PASS / cùng 34 FAIL / cùng notificationInbox timeout. Targeted teaching + notification presentation 9/9 PASS.
- Chi tiết shared files, responsive/functional QA, screenshots và giới hạn backend/preview: [báo cáo KAN-95](EDUTRACK_KAN95_RESULT.md). Không chỉnh KAN-72 hoặc workflows ngoài scope.
- Branch `Duy`, HEAD `8ae52ff0fe7336e022f02044a9936ff61c7ebc1d`; bảo toàn toàn bộ thay đổi có sẵn, index trống, không stage/commit/push/merge/PR. Dừng chờ nghiệm thu.
