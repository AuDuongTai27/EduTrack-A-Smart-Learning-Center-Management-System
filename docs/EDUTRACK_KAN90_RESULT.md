# EduTrack — KAN-90: Admin Staff Dashboard

Ngày thực hiện: 18/11/2026. Adjustment Phase, cùng KAN-89; chờ người dùng nghiệm thu. Chưa thực hiện Visual Redesign/illustration/hiệu ứng trang trí.

**Hiện hành:** Final Dashboard Adjustment đã thay Tuition Invoices Due bằng Pending Feedback & Requests, đổi tên Active Students/Outstanding Tuition và chuẩn hóa semantic icons. Mục Final Adjustment cuối tài liệu ghi dữ liệu, counting rules, QA và checks mới nhất; các checks/ảnh Adjustment trước được giữ làm lịch sử.

## Preflight và phạm vi

- Branch `Duy`, HEAD `1cca292c481447d721536feeb39221686eb742ef`, không thay đổi trong vòng này.
- Đọc AGENTS.md; kiểm tra docs chưa có báo cáo KAN-90 nên tạo đúng file này. KAN-89 tiếp tục cập nhật `EDUTRACK_KAN53_KAN89_RESULT.md`, không tạo báo cáo adjustment riêng.
- Baseline là working tree đang có KAN-53/KAN-89 chưa commit; snapshot source/hash local trước khi sửa. Không reset/revert/stage công việc có sẵn.
- Chỉ chỉnh hai Dashboard, CSS dành riêng Dashboard, targeted tests và hai tài liệu đúng mã KAN. Không thực hiện lại KAN-53 hoặc sửa sidebar toggle.

## Kết quả KAN-90

- Chuyển nguyên Welcome Banner lên trước KPI. Giữ staff name từ dữ liệu hiện tại, lời chào, current date/timezone và markup banner; không thêm quick actions/illustration.
- Hiện đúng bốn KPI:

| KPI | Nguồn giá trị giữ nguyên |
|---|---|
| Active Students | `dashboard.students.data` |
| Outstanding Tuition | `dashboard.tuition.data.outstanding` |
| Pending Approval Requests | `pendingRequests.length` từ collection đã có của Dashboard |
| Pending Feedback & Requests | `dashboard.incomingPending.data` từ cùng approval response |

- KPI cuối dùng số pending, thay cho tổng requests đã gửi. Giữ nguyên `pendingRequests = requests.filter(status.trim().toLowerCase() === "pending")`, bao gồm cả status pending chưa/đã bắt đầu xem xét. Không đổi definitions/workflow hay phạm vi requester.
- Cả bốn card chỉ có Title, Value, Icon. Bỏ props footer và Link wrappers; không footer/divider/supporting description, click điều hướng, pointer cursor hoặc hover tương tác.
- Tên KPI học phí nêu All Periods vì supporting text đã được bỏ. Không đổi cách tính debt, unpaid count hoặc định dạng đầy đủ VND.
- Khi dữ liệu chưa có/lỗi, KPI giữ `—`, không hiển thị fake 0. Empty thành công hiển thị 0. Giữ loading alert và error handling; lỗi students/tuition trước đây nằm trong footer được chuyển ra alert ngoài KPI để không mất thông tin lỗi.
- Presentation chung với sáu KPI Center Manager: height thực đo 148 px, padding 20 px, radius token EduTrack, icon 32 px, title 13 px, số đếm 26 px, tiền 20 px; đơn vị VND có thể xuống dòng.
- Grid Admin Staff: ≥1200 px 4 cột, 480–1199 px 2 cột, <480 px 1 cột.
- Today's Schedule và Recent Notifications giữ row/columns sẵn có: cạnh nhau ở desktop đủ rộng, tự xếp dọc theo breakpoint hiện có. Recent Requests Table giữ full width và table-responsive.

## Những phần giữ nguyên

- `adminStaffDashboardDAL.getDashboard`, toàn bộ services/API/data scope, công thức tuition và filter requests của tài khoản Admin Staff đang chọn.
- Today's Schedule & Teaching Sessions: query, số hiển thị tối đa 4, class/time/teacher/room/status, Detailed Monitoring, loading/empty/error.
- Recent Notifications: component, dữ liệu, unread counter, read/unread behavior, empty state, View All.
- Recent Requests: tối đa 4 requests, tám cột No./Request Code/Request Type/Title–Subject/Submitted Date/Priority/Status/Action, Details/View All Requests và toàn bộ modal.
- Không thêm Received Feedback section, charts, quick actions hoặc KPI ngoài phạm vi.
- Không sửa Topbar, Sidebar, Teacher/TA/Student/Parent, backend/database/migrations/seeding, auth/authorization, API contract, route definitions, approval workflow, notifications hoặc global branding.

## Files changed trong vòng này

| File | Mục đích |
|---|---|
| `Capstone2/frontend/src/GUIs/pages/admin/AdminStaff/AdminStaffDashboardPage.tsx` | Chuyển banner, bỏ footer/link KPI, dùng pending count, giữ lỗi ngoài card |
| `Capstone2/frontend/src/GUIs/pages/admin/CenterManager/CenterManagerDashboardPage.tsx` | Chuẩn hóa 6 KPI của KAN-89 |
| `Capstone2/frontend/src/assets/css/center-manager.css` | Bỏ presentation của Link/footer KPI đã xóa |
| `Capstone2/frontend/src/assets/css/management-dashboard-kpis.css` | Scoped KPI presentation chung hai Dashboard |
| `Capstone2/frontend/tests/managementDashboardKpis.test.mjs` | 4 targeted rendering tests |
| `docs/EDUTRACK_KAN53_KAN89_RESULT.md` | Cập nhật KAN-89 tại báo cáo đang có |
| `docs/EDUTRACK_KAN90_RESULT.md` | Báo cáo tổng hợp KAN-90 này |

Shared KpiCard không đổi. CSS chỉ import từ hai trang Dashboard; selector `.admin-scope :is(.cm-dashboard, .staff-dashboard)` không tác động các trang/role khác.

## Automated checks — Adjustment trước Final

Chạy binary tương ứng scripts frontend: oxlint, tsc -b, tsc -b + vite build và tất cả test files bằng node --test. Giới hạn mỗi test file 20 giây để test baseline bị treo không chặn các file khác. Không sửa test lỗi cũ.

| Check | Baseline working tree | Sau adjustment |
|---|---|---|
| Frontend lint | PASS, 208 warnings | PASS, 208 warnings |
| Typecheck | PASS | PASS |
| Production build | PASS | PASS |
| Frontend tests hoàn tất | 120 PASS / 34 FAIL | 124 PASS / 34 FAIL |
| notificationInbox.test.mjs | Timeout 20 giây | Cùng timeout |
| Targeted managementDashboardKpis | Chưa có | 4/4 PASS |
| Targeted centerManagerDashboard | 6/6 PASS | 6/6 PASS |
| git diff --check | — | PASS |

- Kết quả code/pass/fail/timeout/warnings của các test files cũ không đổi. Build giữ cảnh báo chunk lớn hơn 500 kB.
- Tests mới render JSX KPI thật của hai trang và shared KpiCard: đủ 6/4 card/icon, không footer/link/button, pending=2 trong 7 requests, đầy đủ số tiền VND, giữ unavailable khi query chưa tải/lỗi, empty thành công là 0.
- Source comparison sau chuẩn hóa line endings xác nhận data/loading effects của Admin Staff, toàn bộ section dưới KPI và hai card dưới của Center Manager giữ nguyên. Hash của Topbar KAN-53, shared KpiCard, API/DAL/services, role ngoài phạm vi không đổi so với preflight.

## Responsive và functional QA local — Adjustment trước Final

- Chrome headless; source/layout thật của cả hai Dashboard. Baseline lấy từ snapshot working tree trước adjustment, không dùng HEAD trước KAN-53/KAN-89.
- 16 specimens trước, 22 sau. Mỗi role chạy 1920, 1440, 1280, 1024, 768, 600, 390, 360 px; thêm loading/empty/error tại 1280 px cho cả hai role.
- Tất cả specimens sau sửa đủ số KPI/icon, không footer/link/button/tab stop trong card; cursor default; click không điều hướng và hover không đổi shadow/transform. Welcome trước KPI ở cả hai role.
- Tất cả KPI đo height 148 px; không horizontal overflow/card clipping. Số tiền thử `122.580.245.802 VND` giữ đủ chữ số tại mọi viewport.
- Admin Staff fixture có tổng 8 requests, chỉ 2 pending: KPI là 2; recent table vẫn 4 dòng. Fixture 5 sessions: list vẫn chỉ 4. Details modal mở/đóng và Detailed Monitoring điều hướng thành công tại tám viewport.
- Loading/error Pending KPI là `—` ở Admin Staff; empty thành công là 0. Center Manager lần lượt Loading…/—/0; các state card hiện có giữ nguyên.
- Source/destination của View All Requests, notification View All, Details và modal giữ nguyên; không gửi approval/notification/user mutations trong QA.

Ảnh before/after local:

- [Before desktop](../tmp/kan89-kan90/screenshots/before-admin-staff-1440-populated.png) · [After desktop](../tmp/kan89-kan90/screenshots/after-admin-staff-1440-populated.png)
- [Before mobile](../tmp/kan89-kan90/screenshots/before-admin-staff-390-populated.png) · [After mobile](../tmp/kan89-kan90/screenshots/after-admin-staff-390-populated.png)
- [After tablet](../tmp/kan89-kan90/screenshots/after-admin-staff-768-populated.png)
- [Loading](../tmp/kan89-kan90/screenshots/after-admin-staff-1280-loading.png) · [Empty](../tmp/kan89-kan90/screenshots/after-admin-staff-1280-empty.png) · [Error](../tmp/kan89-kan90/screenshots/after-admin-staff-1280-error.png)

Logs/scripts/measurements chỉ local trong `tmp/kan89-kan90/`: `baseline/`, `final/`, `before-browser.json`, `after-browser.json`, `preflight-hashes.json`, `safety.json`; không đưa vào commit.

## Known limitations và Git status

- Backend local không chạy. Browser dùng API responses kiểm thử trong harness `tmp/`, không thêm fixture/count vào production. Chưa xác nhận dữ liệu thật, quyền và notification read/unread end-to-end với phiên đăng nhập thật.
- QA dùng icon font local và typography fallback; đây là Adjustment Phase, không phải Visual Redesign.
- Sidebar toggle có lỗi handler từ trước, giữ nguyên theo chỉ dẫn. 34 test failures/1 timeout có sẵn giữ nguyên; không ép suite PASS bằng sửa ngoài phạm vi.
- Vòng này thêm hai production/test files (CSS/test), tạo một báo cáo KAN-90, cập nhật báo cáo KAN-89 và ba source files đã có. Toàn bộ thay đổi KAN-53/KAN-89 trước đó vẫn chưa commit và được bảo toàn ngoài phần KPI được yêu cầu điều chỉnh.
- Branch/HEAD giữ nguyên, index trống, `tmp/` vẫn untracked. Không stage/commit/push/merge/PR.
- Dừng để người dùng nghiệm thu trước Visual Redesign Phase. Các vòng KAN-90 tiếp theo cập nhật đúng tài liệu này.

## Final Dashboard Adjustment — kết quả hiện hành

### Bốn KPI và semantic presentation

| Title | Dữ liệu | Icon | Màu |
|---|---|---|---|
| Active Students | Active student count hiện có | Graduation cap | Green |
| Outstanding Tuition | Outstanding hiện có, mọi kỳ | Wallet | Amber |
| Pending Approval Requests | Outgoing của staff đang chọn, raw pending | Clipboard | Blue |
| Pending Feedback & Requests | Incoming chưa có quyết định cuối cùng | Message square | Amber |

- Chỉ bỏ KPI Tuition Invoices Due; dữ liệu unpaidCount, query invoices/payments và toàn bộ nghiệp vụ hóa đơn vẫn giữ nguyên.
- Dedicated `ManagementDashboardKpi` dùng chung cho hai Dashboard để thống nhất icons/tokens; Common/KpiCard và global branding không đổi. SVG 20 px, container 32 px, cùng vị trí, padding 20 px và card height 148 px như vòng trước.
- Chỉ Title/Value/Icon, không footer/divider/supporting description/link/button. Cursor default, hover không tương tác; click card không điều hướng. formatVND giữ đủ chữ số, không compact hoặc làm tròn display.

### Incoming/outgoing và một response API

- Đã kiểm tra file thực tế: `AdminStaffFeedbackPage.tsx`, `adminStaffDashboardService.ts`, `adminStaffDashboardDAL.ts`, `feedbackDAL.ts`, `ApprovalRequestDto.ts`; kiểm tra aliases trong `JwtAuthHelper.NormalizeRoleName` bằng đọc source, không sửa backend.
- `feedbackDAL.getAllRequests()` → `GET /api/approvalrequests` được gọi **một lần cho mỗi lần load Dashboard** sau khi profile staff được xác minh. Promise response dùng chung cho `requests` và `incomingPending`.
- Outgoing giữ `getMyRequests(response, currentStaffId)` và filter raw status pending của trang hiện tại; chỉ request staff hiện tại gửi, không đếm incoming.
- Incoming dùng `countPendingIncomingRequests(response)`: role `student`, `parent`, `teacher`, `teaching_assistant`; aliases TA hợp lệ `ta`, `teachingassistant`. Trim/lowercase trước khi so sánh.
- Loại `admin_staff`, `center_manager` và aliases hợp lệ `adminstaff`, `centermanager`. Không hardcode requester ID/role ID/seed hoặc suy đoán theo tên.
- Raw `status=pending` được tính cả Waiting (`reviewedBy=null`) lẫn Under Review (`reviewedBy!=null`). Không lọc theo reviewer hiện tại và không giới hạn requestType=feedback; class transfer và các loại request khác trong incoming cũng được tính. Approved/Rejected không tính.
- Nếu một pending record có role thiếu/không hỗ trợ, incoming count unavailable và báo lỗi; không bỏ qua âm thầm để tạo tổng thiếu. Outgoing vẫn được publish độc lập từ cùng response. API failure khiến cả hai section unavailable, không thành 0.
- State `incomingPending` có `{data:null,error:null}` ban đầu; success empty là 0; error là null cùng thông báo ngoài KPI. Giữ nguyên data-owner guard theo staffUserId/today/selectionLoading và cleanup của loading effect để không hiển thị dữ liệu account trước.

### Đối chiếu Received Feedback và legacy limitation

- Khi requesterRole là canonical roles hợp lệ, dashboard incoming khớp phạm vi Received Feedback và hai display states Waiting/Pending. Không giới hạn bởi type hoặc reviewer ID.
- Received Feedback hiện dùng predicate loại Admin Staff/Center Manager, còn fallback theo `requestedBy===2` hoặc selected staff khi role thiếu; role hiển thị còn fallback theo seed IDs. Predicate đó cũng chấp nhận role không biết/aliases quản lý không canonical vào danh sách incoming.
- Dashboard mới không sao chép các legacy fallbacks: pending role thiếu/unknown báo unavailable; aliases quản lý được loại đúng nghĩa. Vì vậy dữ liệu legacy có thể tạo khác biệt với Received Feedback. Đã ghi nhận; **không sửa AdminStaffFeedbackPage hoặc workflow xử lý feedback**.
- API backend hiện cũng có legacy role fallback theo code/ID trong DTO mapping; Dashboard đọc requesterRole được API cung cấp, không thêm fallback mới hoặc thay đổi contract.

### Files của vòng Final

- `Capstone2/frontend/src/GUIs/pages/admin/AdminStaff/AdminStaffDashboardPage.tsx`: bốn KPI cuối cùng; thêm incoming error vào alert ngoài card.
- `Capstone2/frontend/src/DAL/adminStaffDashboardDAL.ts`: incoming section và một shared approval response, giữ outgoing scope.
- `Capstone2/frontend/src/BLL/services/adminStaffDashboardService.ts`: helper incoming count; các helpers tuition/outgoing/schedule hiện có không đổi.
- `Capstone2/frontend/src/GUIs/components/admin/ManagementDashboardKpi.tsx`: component mới chỉ cho hai Dashboard, semantic SVG/color.
- `Capstone2/frontend/src/GUIs/pages/admin/CenterManager/CenterManagerDashboardPage.tsx`: Final KAN-89, đọc overdueAmount thay outstanding và đổi title.
- `Capstone2/frontend/tests/managementDashboardKpis.test.mjs`, `tests/adminStaffDashboardDAL.test.mjs`: cập nhật/bổ sung targeted tests; không sửa tests lỗi ngoài phạm vi.
- Chỉ cập nhật hai tài liệu đang có KAN-53/KAN-89 và KAN-90; không tạo docs mới.

### QA và checks Final

- Baseline lấy working tree sau Adjustment trước: 124 PASS / 34 FAIL / 1 timeout. Sau Final: **133 PASS / 34 FAIL / cùng timeout notificationInbox.test.mjs (20 giây)**. Không có failure mới; hai test files trong phạm vi tăng 9 PASS.
- Lint PASS, vẫn 208 warnings; typecheck PASS; production build PASS, giữ cảnh báo chunk >500 kB; git diff --check PASS.
- Targeted: managementDashboardKpis 10/10, AdminStaffDashboardDAL 9/9, CenterManager pending card/service 6/6. Kiểm tra overdue/outstanding với partial payment và hóa đơn future/today; incoming Waiting/Under Review; excludes resolved/outgoing; role aliases/unknown; API error; một fetch; icon/color; non-click; đủ VND.
- Browser 16 specimens trước / 24 sau: hai role × 1920/1440/1280/1024/768/600/390/360 px, thêm loading/empty/error/missing-role tại 1280 px cho mỗi role. Không horizontal overflow/card clipping; card height 148 px; đủ 6/4 icons; không footer/interactive element; click ở lại trang và hover không đổi shadow/transform.
- Fixture có 8 outgoing (2 pending) và 6 incoming (4 pending, 1 approved, 1 rejected): outgoing KPI **2**, incoming KPI **4**. Browser ghi đúng **một approval API call** mỗi Dashboard load. Incoming role thiếu cho kết quả `—` + alert, trong khi outgoing vẫn 2; empty là 0; API error không fake zero.
- Fixture có invoice tương lai 5.000.000 VND: Outstanding Admin Staff 122.585.245.802 VND; Overdue Manager 122.580.245.802 VND. Toàn bộ số tiền đủ chữ số.
- Details modal và Detailed Monitoring vẫn hoạt động ở tám widths; source sections dưới KPI của cả hai trang giữ nguyên sau chuẩn hóa line endings. Shared KpiCard, Topbar KAN-53, Sidebar, Received Feedback, các role ngoài phạm vi, tuition calculations/policy, notifications và routing giữ nguyên hash preflight.
- [Before Admin Staff](../tmp/kan89-kan90-final/screenshots/before-admin-staff-1440-populated.png) · [After Admin Staff](../tmp/kan89-kan90-final/screenshots/after-admin-staff-1440-populated.png) · [Mobile](../tmp/kan89-kan90-final/screenshots/after-admin-staff-390-populated.png).
- [Loading](../tmp/kan89-kan90-final/screenshots/after-admin-staff-1280-loading.png) · [Empty](../tmp/kan89-kan90-final/screenshots/after-admin-staff-1280-empty.png) · [API error](../tmp/kan89-kan90-final/screenshots/after-admin-staff-1280-error.png) · [Missing role](../tmp/kan89-kan90-final/screenshots/after-admin-staff-1280-missing-role.png).
- Toàn bộ screenshots/log/scripts/snapshot/hash/measurements chỉ local trong `tmp/kan89-kan90-final/`, không đưa vào commit. Không có fixture trong production source.

### Bàn giao và giới hạn

- Backend local chưa chạy; chưa xác nhận số liệu/quyền và read/unread end-to-end với tài khoản thật. Browser UI dùng API responses kiểm thử riêng; typography QA fallback như vòng trước.
- Giữ nguyên sidebar toggle issue, 34 failures/1 timeout baseline và legacy Received Feedback đã mô tả. Không chỉnh workflow, backend/database/API contract/auth/routing hoặc visual redesign.
- Branch/HEAD vẫn `Duy` / `1cca292c481447d721536feeb39221686eb742ef`; toàn bộ thay đổi trước được bảo toàn ngoài các phần Final được yêu cầu thay. Index trống; không stage/commit/push/merge/PR.
- Dừng chờ nghiệm thu và chuẩn bị commit checkpoint theo quyết định người dùng; chưa bắt đầu Visual Redesign Phase.
