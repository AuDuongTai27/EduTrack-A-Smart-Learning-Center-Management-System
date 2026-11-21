# KAN-72 — Move Student & Parent Profile to Topbar

## Phạm vi và preflight

- Jira ID được người dùng xác nhận: **KAN-72**.
- Ngày thực hiện: 2026-11-21 (Asia/Bangkok).
- Đã đọc `AGENTS.md`. Không có báo cáo KAN-72 trước đó; đây là tài liệu duy nhất cho task này.
- Branch: `Duy`. HEAD: `4d27731337829fbb2b323f58c63fb786c57628ae` — `CM, AD, TE & TA - Unify dashboard visuals`.
- Working tree trước khi thực hiện sạch; không reset/revert thay đổi của thành viên khác.
- Đã kiểm tra StudentLayout, ParentLayout, hai NavMenu, sidebar, ParentContext, auth account store, Topbar của Center Manager/Admin Staff/Teacher/Teaching Assistant và CSS/avatar hiện hữu.
- Không sửa Dashboard content, backend, database, API contracts, routes, auth/authorization, notification logic hoặc Child Switcher/ParentContext.

## Kết quả triển khai

- Một `LearnerTopbar` dùng chung cho Student và Parent trên desktop/mobile. Header cao 64px, nằm trên main content; profile ở góc phải. Mobile giữ hamburger mở offcanvas và branding, không có hai topbar.
- Nền Elegant Green Waves tái sử dụng `academy-banner-waves.svg`; profile theo Soft Glass Option A (nền trắng trong, viền mint, blur nhẹ, avatar 36px, trigger 46px). CSS mới giới hạn trong `.student-scope` và các class `learner-*`.
- Account lấy từ `getAuthUser`/`subscribeAuth` hiện tại, kiểm tra role phù hợp. Hiển thị full name, user code hoặc role subtitle; dropdown giữ email, role/grade và thông tin `Parent of ...` theo selected child hiện tại.
- Tái sử dụng `CenterManagerTopbarAvatar` và utility avatar hiện hữu, không sửa component hoặc styling của bốn role còn lại. Ảnh thật được ưu tiên; ảnh lỗi hoặc avatar artwork mặc định đã biết chuyển sang initials từ tên tiếng Việt (chuẩn hóa NFC). Thiếu tên dùng `Account` và `?`; thiếu code dùng Student/Parent. Không tạo tên, code hoặc ảnh giả.
- Dropdown hỗ trợ click toggle, pointer ngoài, Tab qua link/button, đóng khi focus rời khỏi, Escape đóng và trả focus về trigger, đóng sau chọn mục hoặc đổi route/account. Dùng disclosure với button native, `aria-expanded`, vùng account có tên truy cập; không áp menu semantics khi không triển khai arrow-key menu.
- Edit Profile giữ `/student/profile` và `/parent/profile`. Logout gọi `authApi.logout()` rồi `navigate('/')`, đúng flow cũ.
- Gỡ toàn bộ sidebar profile chip/dropup, state/ref/handlers dư và CSS chỉ phục vụ phần đã gỡ; bỏ hardcoded MA/VN trên mobile.
- Child Switcher giữ trong sidebar, nguyên component/handlers/context. Topbar chỉ đọc selected child để giữ thông tin tài khoản đã có.

## File thay đổi

| File | Thay đổi |
| --- | --- |
| `Capstone2/frontend/src/GUIs/components/shared/LearnerTopbar.tsx` | Component Topbar/account chung mới |
| `Capstone2/frontend/src/assets/css/learner-topbar.css` | CSS Topbar, Soft Glass, dropdown và responsive |
| `Capstone2/frontend/src/GUIs/layouts/student/Student-layout.tsx` | Thay mobile header cũ bằng Topbar chung |
| `Capstone2/frontend/src/GUIs/layouts/parent/ParentLayout.tsx` | Topbar chung; đọc selected child để hiển thị account detail |
| `Capstone2/frontend/src/GUIs/layouts/student/StudentNavMenu.tsx` | Gỡ profile footer, giữ navigation/unread logic |
| `Capstone2/frontend/src/GUIs/layouts/parent/ParentNavMenu.tsx` | Gỡ profile footer, giữ Child Switcher/navigation/unread logic |
| `Capstone2/frontend/src/GUIs/layouts/student/StudentSidebar.tsx` | Cập nhật comment sau khi bỏ chip |
| `Capstone2/frontend/src/assets/css/student.css` | Gỡ style profile/dropup/mobile header cũ không còn dùng |
| `Capstone2/frontend/src/assets/css/student-sidebar-academy.css` | Gỡ footer override không còn dùng |
| `Capstone2/frontend/src/assets/css/parent-academy.css` | Gỡ avatar footer/mobile selector; giữ nguyên style Child Switcher |
| `docs/EDUTRACK_KAN72_RESULT.md` | Báo cáo hợp nhất này |

## QA trình duyệt

Chạy Chrome headless trên production bundle thực tế, với API/auth fixtures chỉ được inject trong trình duyệt QA. Các tên/code trong ảnh là dữ liệu kiểm thử, không phải hardcode trong source. Bản trước thay đổi được tái dựng từ HEAD trong `tmp/kan72/baseline/`; không checkout hoặc sửa lại working tree để chụp before.

CDN font/icon không truy cập được trong môi trường QA. Server QA thay link Bootstrap CDN bằng CSS local, dùng icon font từ artifact local sẵn có; bỏ external Google Fonts và dùng font fallback. Không sửa index.html hoặc dependencies của ứng dụng.

| Kiểm tra | Kết quả |
| --- | --- |
| Student/Parent: Dashboard, Classes, Schedule, Tuition, Notifications, Feedback, Profile | 28 tổ hợp role/page/viewport: Topbar hiển thị; không horizontal overflow của document/main wrapper |
| Desktop 1440px / mobile 390px | Một Topbar, profile góc phải; sidebar không còn chip/dropup |
| Click, outside pointer, keyboard Space/Tab, Escape | Pass; Escape trả focus về trigger |
| Edit Profile | Đúng route theo role; dropdown đóng |
| Logout | Về `/`; token và auth user được xóa bằng auth flow hiện hữu |
| Avatar hợp lệ / ảnh lỗi / artwork mặc định | Ảnh hợp lệ hiển thị; lỗi/default dùng initials |
| Tên tiếng Việt / một từ / thiếu tên-code / tên dài | `TÁ`, `Đ`, neutral fallback và truncate hoạt động |
| Parent Child Switcher desktop/mobile | Chọn QA Child Two thành công trong sidebar; account detail cập nhật, không chuyển switcher lên Topbar |
| Offcanvas mobile | Hamburger mở; chọn navigation link đóng như trước |
| Dropdown clipping/layering | Nằm trong viewport, hit test xác nhận không bị content che |
| Responsive bổ sung 320 / 768 / 992 / 1280px | Hai role, tên dài: không document overflow; dropdown nằm trong viewport |
| Regression bốn role còn lại | Profile page ở 1440/390px: 7/8 ảnh giống từng pixel; Teacher mobile chỉ khác 1 pixel tại (164,13), không thay đổi geometry/font computed. Không phát hiện visual regression của shell |

Schedule/table trên mobile vẫn có vùng cuộn ngang nội bộ vốn có; document không tràn ngang. QA sử dụng fixtures, chưa xác nhận kết nối backend hoặc tài khoản production; không thay đổi dữ liệu thật.

## Screenshots và artifacts local

Tất cả nằm trong `tmp/kan72/`, được Git ignore, không stage/commit:

| Role | Before desktop/mobile | After desktop/mobile | Dropdown desktop/mobile |
| --- | --- | --- | --- |
| Student | `before-student-1440.png`, `before-student-390.png` | `after-student-1440.png`, `after-student-390.png` | `after-student-1440-dropdown.png`, `after-student-390-dropdown.png` |
| Parent | `before-parent-1440.png`, `before-parent-390.png` | `after-parent-1440.png`, `after-parent-390.png` | `after-parent-1440-dropdown.png`, `after-parent-390-dropdown.png` |

Ảnh bổ sung: `after-{student,parent}-390-offcanvas.png`, `after-{student,parent}-{1440,390}-long.png`, `after-{student,parent}-{320,768,992,1280}-responsive.png`. Regression: `{before,after}-{center-manager,admin-staff,teacher,teaching-assistant}-{1440,390}-regression.png`.

Scripts/logs/results: `qa.mjs`, `qa-before.log`, `qa-after.log`, `after-results.json`, `checks.mjs`, `build.log`, `typecheck.log`, `lint.log`, `targeted-tests.log`, `{before,after}-test-results.json`, `{before,after}-*.test.mjs.log`. Không thêm QA harness/tests tạm vào source hoặc docs.

Kết quả so sánh pixel: `regression-comparison.json`; computed styles account label của bốn role được lưu trong `{before,after}-{role}-{width}-styles.json`. Screenshot regression được chụp sau `document.fonts.ready` và hai animation frames để tránh đo trạng thái render chưa ổn định.

## Validation tự động và lỗi có sẵn

- `npm.cmd run lint`: **PASS**, exit 0; 212 warnings có sẵn ở các file khác. Không có warning trong TSX mới hoặc các layout/NavMenu đã sửa.
- `npm.cmd run typecheck`: **PASS**, exit 0.
- `npm.cmd run build`: **PASS**, exit 0. Có cảnh báo bundle >500 kB, cũng xuất hiện khi build HEAD.
- Targeted: `node --test tests/centerManagerIdentity.test.mjs tests/dashboardNotificationPresentation.test.mjs tests/unifiedTeachingDashboard.test.mjs`: **17/17 PASS**.
- `npm.cmd test`: đã chạy; nhiều failures và treo tại notification tests, dừng tiến trình test do mình khởi chạy. Chạy lại toàn bộ 28 file riêng biệt bằng `node --test --test-isolation=none`, watchdog ngoài 10 giây/file để lấy kết quả đầy đủ.
- Đối chiếu cùng runner trên bản HEAD và bản sau sửa: **kết quả giống nhau** — 15 file pass, 12 file fail, 1 file timeout. Không có regression test mới do KAN-72.
- File fail sẵn: `adminStaffDashboard.test.mjs`, `classManagement.test.mjs`, `classManagementApi.test.mjs`, `classStaff.test.mjs`, `gradeManagement.test.mjs`, `notificationCompose.test.mjs`, `scheduleManagement.test.mjs`, `scheduleView.test.mjs`, `studentCenterEnrollment.test.mjs`, `studentEnrollment.test.mjs`, `studentManagement.test.mjs`, `tuitionMetrics.test.mjs`.
- `notificationInbox.test.mjs` có assertions fail và không tự kết thúc (timeout ở cả HEAD và bản sửa). Các mismatch khác gồm expected Vietnamese labels/messages so với English hiện tại và expectations validation/API cũ. Chi tiết từng assertion giữ trong log local; không sửa logic ngoài scope.
- Thử lint bản sao HEAD dưới tmp bị công cụ ignore toàn bộ path (`No files found to lint`); đây là giới hạn của baseline lint trong thư mục bị ignore, không phải lint failure của working tree.
- `git diff --check`: **PASS**.

## Git và nghiệm thu

Giữ branch `Duy`, HEAD không đổi. Các thay đổi chỉ ở working tree; index không có staged changes. `tmp/kan72/` được ignore. Không stage, commit, push hoặc merge. Dừng để người dùng nghiệm thu.


## Unified Topbar across six roles — KAN-72 / KAN-89 / KAN-90 / KAN-95 (2026-11-21)

### Preflight và phạm vi cập nhật

- Yêu cầu mới mở rộng KAN-72 sang UI consistency của cả sáu role: thêm Bell Student/Parent, chuẩn hóa kích thước và bỏ dòng mã khỏi mọi Profile Trigger. Không thực hiện lại migration profile.
- Đã đọc AGENTS.md, implementation sáu Topbar, shared Bell/inbox/avatars, auth store, Student/Parent notification pages, Learning API/DAL và các báo cáo KAN hiện hữu.
- Branch `Duy`, HEAD `4d27731337829fbb2b323f58c63fb786c57628ae`. Giữ toàn bộ 8 tracked modifications và 3 untracked files từ checkpoint KAN-72 trước vòng này. Snapshot diff/status trước sửa trong `tmp/unified-topbar/preflight*`.
- Phần triển khai ban đầu phía trên là lịch sử checkpoint. Kết quả cuối vòng này thay thế mô tả header 64px, subtitle trên trigger và profile-only Topbar: hiện tại header 58px, trigger một dòng, có Bell cho cả sáu role.

### Kết quả cuối

- Giữ Elegant Green Waves và Soft Glass; chuẩn chính xác theo Center Manager đã có: **header 58px, Bell/Profile 46px, avatar 36px, text 13px, chevron 12–14px, gap 12px, radius 12px, blur 8px**. Design targets 40–42px là gợi ý; ưu tiên accepted Manager dimensions theo yêu cầu.
- `unified-topbar.css` dùng tokens/class opt-in chung, profile width tự nhiên và có max-width thay vì ép mọi username cùng chiều rộng. Tên dài truncate khi cần; giữ đủ chỗ cho hamburger. Dropdown Bell được cố định trong viewport để tránh clipping ở tablet và main wrapper.
- Cả sáu Profile Trigger chỉ còn avatar + full name + chevron. Đã bỏ `identity.userCode` (CM/AD), `#userCode` (Teacher/TA), `subtitle` (Student/Parent) khỏi trigger. Code trong dropdown/data/API/database giữ nguyên; không thêm dòng role thay thế.
- `TopbarNotificationPopover` tái sử dụng presentation Bell/dropdown; bốn role cũ giữ nguyên `useNotificationInbox` và QuickList. `useTopbarDismiss` dùng chung outside pointer, focus, Escape, và phối hợp mở một panel tại một thời điểm, kể cả thao tác keyboard.
- `LearnerNotificationBell` gọi Learning API có sẵn qua `learnerNotificationPreview`: Student lấy đúng authenticated user ID, Parent lấy authenticated parent ID + selected child ID từ ParentLayout. Không hardcode default IDs, không dùng mock fallback của DAL.
- Parent đợi context sẵn sàng. Khi có selected child, adapter xác minh ID còn thuộc response live children-overview của parent trước khi query notifications. Nếu xác minh/tải thất bại, Bell báo lỗi và Retry, không hiển thị inbox tưởng tượng hoặc inbox cũ. Không sửa ParentContext/ChildSwitcher.
- Preview giữ ordering/filtering/eligibility của endpoint; hiển thị tối đa 5 hàng, unread count tính trên toàn bộ response, kết hợp server isRead với local read IDs của đúng account theo cơ chế hiện tại. Không hiển thị badge 0. Không tự áp grace-period rule của management inbox lên learner inbox.
- Đồng bộ `notifications-updated`, focus và storage invalidation/read-cache events. Remount theo account/child scope, hủy hiệu lực request cũ khi đổi scope; response của child trước không ghi đè child mới.
- Chọn notification đi tới Notifications route/query `notificationId` hiện có; trang Notifications tiếp tục quản lý read/unread workflow. Bell không tự thay quy tắc đánh dấu đọc. Giữ nguyên Notifications sidebar item, View All, Edit/View Profile hiện có và auth logout.
- Không sửa Dashboard/KPI/Welcome Banner, sidebar menu/size, business pages, backend, API contracts, authentication/authorization hoặc routing.

### File source/test trong working tree hợp nhất

Danh sách bao gồm thay đổi KAN-72 đã có từ checkpoint trước:

- `Capstone2/frontend/src/GUIs/components/shared/notifications/NotificationQuickViews.tsx`
- `Capstone2/frontend/src/GUIs/layouts/admin/AdminTopBar.tsx`
- `Capstone2/frontend/src/GUIs/layouts/parent/ParentLayout.tsx`
- `Capstone2/frontend/src/GUIs/layouts/parent/ParentNavMenu.tsx`
- `Capstone2/frontend/src/GUIs/layouts/student/Student-layout.tsx`
- `Capstone2/frontend/src/GUIs/layouts/student/StudentNavMenu.tsx`
- `Capstone2/frontend/src/GUIs/layouts/student/StudentSidebar.tsx`
- `Capstone2/frontend/src/GUIs/layouts/teacher/TeacherTopBar.tsx`
- `Capstone2/frontend/src/GUIs/layouts/teacher/TeachingAssistantTopBar.tsx`
- `Capstone2/frontend/src/assets/css/parent-academy.css`
- `Capstone2/frontend/src/assets/css/simplified-topbar.css`
- `Capstone2/frontend/src/assets/css/student-sidebar-academy.css`
- `Capstone2/frontend/src/assets/css/student.css`
- `Capstone2/frontend/src/GUIs/components/shared/LearnerTopbar.tsx`
- `Capstone2/frontend/src/GUIs/components/shared/notifications/LearnerNotificationBell.tsx`
- `Capstone2/frontend/src/GUIs/components/shared/notifications/TopbarNotificationPopover.tsx`
- `Capstone2/frontend/src/GUIs/components/shared/notifications/learnerNotificationPreview.ts`
- `Capstone2/frontend/src/GUIs/hooks/useTopbarDismiss.ts`
- `Capstone2/frontend/src/assets/css/learner-topbar.css`
- `Capstone2/frontend/src/assets/css/unified-topbar.css`
- `Capstone2/frontend/tests/learnerNotificationPreview.test.mjs`

Docs: cập nhật trực tiếp `EDUTRACK_KAN72_RESULT.md`, `EDUTRACK_KAN53_KAN89_RESULT.md`, `EDUTRACK_KAN90_RESULT.md`, `EDUTRACK_KAN95_RESULT.md`; không tạo report mới cho vòng này.

### QA và screenshots

- Functional browser matrix: 6 roles × 1920/1440/1280/1024/768/390px. Header/Bell/Profile/avatar dimensions, một Bell/một Profile, không code trên trigger, Bell quick view, dropdown contained, mở một panel, blur và keyboard Space/Escape đã kiểm tra. Student/Parent offcanvas mở/đóng qua handlers hiện hữu.
- Student/Parent dùng QA accounts không phải default (417/517), kiểm tra badge 7 → 6 khi read event; zero badge, empty/error/Retry, View All/deep link, child 73 → 74 cho count/data mới và ngăn response trễ của child trước.
- Đã click notification trên chính trang Notifications hiện hữu cho cả hai role: PUT read dùng userId 417/517 và Bell giảm 7 → 6. Evidence trong `tmp/unified-topbar/actual-read-sync.json` và `after-{student,parent}-actual-read-sync.png`; không chỉ mô phỏng event để kiểm tra sync.
- Vòng bổ sung trên Dashboard kiểm tra normal/long names, gap 12px, không đè hamburger và dropdown nằm trong viewport ở cùng sáu widths. Screenshots dưới đây là Dashboard thực tế của app với API fixtures local.

| Role | Before desktop | After desktop | Before mobile | After mobile |
| --- | --- | --- | --- | --- |
| center-manager | [Before desktop](../tmp/unified-topbar/before-center-manager-1440-dashboard.png) | [After desktop](../tmp/unified-topbar/after-center-manager-1440-dashboard.png) | [Before mobile](../tmp/unified-topbar/before-center-manager-390-dashboard.png) | [After mobile](../tmp/unified-topbar/after-center-manager-390-dashboard.png) |
| admin-staff | [Before desktop](../tmp/unified-topbar/before-admin-staff-1440-dashboard.png) | [After desktop](../tmp/unified-topbar/after-admin-staff-1440-dashboard.png) | [Before mobile](../tmp/unified-topbar/before-admin-staff-390-dashboard.png) | [After mobile](../tmp/unified-topbar/after-admin-staff-390-dashboard.png) |
| teacher | [Before desktop](../tmp/unified-topbar/before-teacher-1440-dashboard.png) | [After desktop](../tmp/unified-topbar/after-teacher-1440-dashboard.png) | [Before mobile](../tmp/unified-topbar/before-teacher-390-dashboard.png) | [After mobile](../tmp/unified-topbar/after-teacher-390-dashboard.png) |
| teaching-assistant | [Before desktop](../tmp/unified-topbar/before-teaching-assistant-1440-dashboard.png) | [After desktop](../tmp/unified-topbar/after-teaching-assistant-1440-dashboard.png) | [Before mobile](../tmp/unified-topbar/before-teaching-assistant-390-dashboard.png) | [After mobile](../tmp/unified-topbar/after-teaching-assistant-390-dashboard.png) |
| student | [Before desktop](../tmp/unified-topbar/before-student-1440-dashboard.png) | [After desktop](../tmp/unified-topbar/after-student-1440-dashboard.png) | [Before mobile](../tmp/unified-topbar/before-student-390-dashboard.png) | [After mobile](../tmp/unified-topbar/after-student-390-dashboard.png) |
| parent | [Before desktop](../tmp/unified-topbar/before-parent-1440-dashboard.png) | [After desktop](../tmp/unified-topbar/after-parent-1440-dashboard.png) | [Before mobile](../tmp/unified-topbar/before-parent-390-dashboard.png) | [After mobile](../tmp/unified-topbar/after-parent-390-dashboard.png) |

- Tất cả ảnh, profiles Chrome, logs và scripts chỉ ở `tmp/unified-topbar/` được Git ignore. `after-results.json` ghi 36 tổ hợp functional; `after-supplement.json` ghi responsive/long-name và race check. Không stage artifact.
- Môi trường không tải CDN: browser QA thay Bootstrap/icon fonts bằng local assets, dùng font fallback; không đổi source index.html. Fixtures chỉ inject trong trình duyệt QA, không thêm mock notifications vào sản phẩm.

### Automated checks và baseline

- Frontend lint: **PASS**, không warning mới trong files thay đổi; warnings có sẵn giữ nguyên (212).
- Typecheck và production build: **PASS**. Build vẫn cảnh báo chunk >500kB như baseline.
- Targeted `learnerNotificationPreview` + avatar + dashboard notification presentation + teaching dashboard: **25/25 PASS** (8 tests mới về identity/child scope/API ordering/read flags/network failure/validation).
- Toàn bộ frontend suite chạy từng file với external watchdog 10 giây do notificationInbox có thể treo. **29 files: 16 pass, 12 fail, 1 timeout**. So với baseline 28 files, 28 kết quả cũ giống nhau; file mới learnerNotificationPreview pass. Danh sách lỗi cũ và timeout giữ ở phần KAN-72 trước cùng logs local; không sửa để ép PASS.
- `git diff --check`: **PASS**. Không đổi dependencies.

### Giới hạn đã xác nhận

- Browser fixtures kiểm tra UI, requests/scoping/races; chưa xác nhận bằng backend/tài khoản production thật. Quyền truy cập/recipient ownership do backend hiện tại thực thi; UI không mở rộng API contract hoặc quyền.
- Parent endpoint hiện có tổng hợp recipient theo child/parent context. Adapter giữ nguyên response semantics, không tự suy diễn recipient filters mới từ DTO thiếu recipient metadata. Đã xác minh child bằng endpoint live trước khi dùng child scope.
- Bốn role cũ có hamburger/overlay markup nhưng không có handler mobile sidebar trong source hiện tại; click không mở sidebar trong baseline và bản sau sửa. Không tuyên bố PASS cho chức năng này và không tự triển khai sidebar ngoài scope. Student/Parent offcanvas vẫn PASS.
- CM/Admin Staff dropdown hiện có Data Account và Logout; không có View/Edit Profile link hoặc profile route. Giữ nguyên, không thêm route/chức năng mới. Teacher/TA/Student/Parent profile links và logout được kiểm tra.
- Các notification pages và DAL cũ có thể vẫn fallback mock/cache khi API lỗi; không sửa chúng theo strict scope. Bell mới không sử dụng fallback đó. Read-event sync dựa vào server state và per-account cache; không thay cache/auth architecture của pages cũ.

### Git và nghiệm thu

Branch `Duy`, HEAD không đổi; index không có staged changes. Giữ tất cả thay đổi chưa commit của checkpoint trước. Không stage, commit, push, merge hoặc tạo PR. Dừng để nghiệm thu Topbar sáu role.

## Fixed-width Profile và unread-only Quick Notifications — KAN-72 / KAN-89 / KAN-90 / KAN-95

### Preflight và quyết định mới

- Ngày 2026-11-21, tiếp tục trên `Duy`, HEAD `4d27731337829fbb2b323f58c63fb786c57628ae`. Đọc lại AGENTS.md, sáu Topbar, notifications hooks/stores/API/adapters, các trang Notifications, screenshots và bốn báo cáo KAN hiện hữu.
- Bảo toàn toàn bộ 16 modified + 9 untracked paths từ vòng trước. Snapshot working diff/status và production bundle trước sửa nằm ở `tmp/kan72-refinement/`.
- Yêu cầu mới thay thế quyết định trigger co giãn ở phần trước: Profile có chiều rộng cố định, controls gọn 42px. Không làm lại migration sidebar và không redesign Dashboard/Notifications Page.
- Source thực tế của `quickNotifications()` ở bốn role cũ **đã là unread-only, newest-first, tối đa 5**, loại deletedAt. `GRACE_MS`/expiry timer vẫn tồn tại nhưng không đưa read rows trở lại quick list. Không thay store/helper hoặc áp thêm grace period cho learners.

### Profile và shared sizing

- `unified-topbar.css`: Profile **230px desktop**, **206px tại 390px** (`min(230px, 100vw - 184px)` dưới 768px), cùng chiều rộng cho mọi tên ở cùng viewport và cả sáu role.
- Profile/Bell cao **42px**, avatar **34px**, text **13px semibold**, gap **12px**, radius **12px**. Header giữ **58px** cùng Elegant Green Waves/Soft Glass đã có.
- Wrapper và trigger dùng width token; label flex và `min-width: 0`, `overflow: hidden`, `white-space: nowrap`, `text-overflow: ellipsis`. Không dùng JavaScript cắt tên. Avatar/chevron không co hay dịch theo tên ngắn/dài.
- Bỏ truncate khỏi tên trong Teacher/TA dropdown, cho wrap/overflow-wrap khi cần. Full name vẫn hiển thị đầy đủ trong dropdown của sáu role; không phụ thuộc tooltip. Bổ sung accessible account name cho CM/AD/Teacher/TA. Trigger vẫn một dòng, không user code hoặc role subtitle.

### Notification preview, scope và empty state

- Thêm `TopbarNotificationContent` dùng chung cho sáu Bell: title/preview, mint bell icon, sender/class/type metadata, timestamp, unread dot, loading/error/Retry và footer `View All` + cùng arrow-right icon.
- Empty state chung: mint bell/check vector, **You're all caught up!**, **No unread notifications right now.**, white background, padding gọn; View All luôn hiện và đúng route. Đây là markup SVG/CSS trực tiếp, không thêm asset hoặc dependency.
- Learner adapter giữ full API list có read history, loại deletedAt khi metadata có mặt, kiểm tra timestamp hợp lệ và kết hợp local read IDs theo account hiện tại. Bell tái sử dụng `quickNotifications(preview.items)` để chỉ lấy tối đa 5 unread mới nhất. Badge tính toàn bộ unread, không phải số preview rows.
- Case **12 unread → badge 12 / preview 5**; **0 unread + read history → không badge, không read row trong dropdown**. Không xóa hoặc thay đổi full Inbox, read history, backend data hay các quy tắc deletion/visibility hiện hữu.
- Student/Parent tiếp tục dùng Learning API theo authenticated account; Parent kiểm tra live child membership rồi dùng selected child. Giữ generation/remount protection khi đổi account/child. Không dùng DEFAULT IDs hoặc DAL mock fallback trong Bell.
- Loading dùng trạng thái chưa biết, không báo 0 giả; API error giữ thông báo lỗi/Retry, không biến thành empty success. Khi Retry ở learners, chuyển sang loading trước khi nhận kết quả mới.
- Giới hạn dropdown/list height trong viewport, text dài wrap, danh sách cuộn khi cần. CSS thêm chỉ nằm dưới `.et-unified-topbar`. Không sửa Dashboard notification card hoặc `NotificationEmptyState` của Dashboard.

### Các file sửa trong vòng này

| File (dưới `Capstone2/frontend/`) | Mục đích |
| --- | --- |
| `src/assets/css/unified-topbar.css` | Fixed profile width, 42px controls, 34px avatar, shared dropdown/empty typography và spacing |
| `src/GUIs/components/shared/notifications/NotificationQuickViews.tsx` | Bell dùng shared content; accessible account label; Dashboard QuickList giữ nguyên |
| `src/GUIs/components/shared/notifications/TopbarNotificationContent.tsx` | Shared topbar preview/empty/loading/error/View All mới |
| `src/GUIs/components/shared/notifications/LearnerNotificationBell.tsx` | Shared content + unread-only helper, Retry loading |
| `src/GUIs/components/shared/notifications/learnerNotificationPreview.ts` | Giữ read history, loại deleted rows, validate dates |
| `src/GUIs/layouts/teacher/TeacherTopBar.tsx` | Full name trong dropdown và accessible trigger |
| `src/GUIs/layouts/teacher/TeachingAssistantTopBar.tsx` | Full name trong dropdown và accessible trigger |
| `tests/learnerNotificationPreview.test.mjs` | Thêm unread-only/top-five/order/history/visibility/timestamp coverage |
| `tests/topbarNotificationPresentation.test.mjs` | Render shared preview states/footer/timestamp/badge |

Cập nhật trực tiếp bốn báo cáo KAN hiện hữu. Không tạo báo cáo mới cho preflight/QA/final. Working tree tổng hợp vẫn bao gồm các file của những vòng KAN-72 trước; danh sách phía trên chỉ là delta vòng này.

### QA và evidence

- **108 profile cases**: 6 roles × 6 widths (1920/1440/1280/1024/768/390px) × 3 tên `Lê An`, `Trần Thị Nhân Viên`, `Nguyễn Thị Hoàng Ngọc Bảo Châu`. Đạt width cố định, 42px/34px geometry, ellipsis, full name trong dropdown, không code trên trigger, không thay avatar/chevron offsets và dropdown nằm trong viewport. Tên dài truncate ở desktop như dự kiến.
- **42 notification state cases**: 6 roles × normal 12 unread / read history with zero unread / truly empty / 1 unread / 5 unread / loading / API error. Đạt total badge, chỉ 5 newest unread, không backfill read history, Empty/Loading/Error riêng biệt và View All đúng route trong mọi trạng thái. Retry phục hồi dữ liệu.
- **Interactions**: đọc một và đọc tất cả từ Notifications Page thật của app cho cả sáu role; Bell giảm **12 → 11 → 0**, empty state xuất hiện và full Inbox vẫn còn rows đã đọc. View All đóng dropdown và điều hướng đúng.
- Kiểm tra actual management Data Account switch với request cũ đang chờ; auth-account switch cho Student/Parent; Parent child 73 → 74 với response cũ trả muộn. Không thấy inbox của account/child trước trong Bell mới. Role boundaries được kiểm tra qua sáu authenticated role sessions và scope rejection tests.
- Keyboard Space mở Bell, Escape đóng/trả focus, outside pointer đóng, Bell/Profile không mở chồng lên nhau: **6/6 roles PASS**. Mở Bell không phát sinh PUT/PATCH đánh dấu đọc.
- Evidence: `after-results.json`, `interactions.json`, `keyboard.json`, raw logs và scripts trong `tmp/kan72-refinement/`, đều bị Git ignore. Browser fixtures inject vào production app; chưa xác nhận live backend/production accounts. Bootstrap/icon QA assets local thay CDN không truy cập được, không sửa index.html.

### Screenshots trước/sau

Ảnh local, không stage/commit. Mỗi role có short/normal/long và full-name dropdown ở desktop/mobile; bảng dưới chọn ví dụ mobile để so sánh:

| Role | Before short | After short | After long / dropdown |
| --- | --- | --- | --- |
| Center Manager | [Before](../tmp/kan72-refinement/before-center-manager-390-short.png) | [After](../tmp/kan72-refinement/after-center-manager-390-short.png) | [Full name](../tmp/kan72-refinement/after-center-manager-390-full-name.png) |
| Admin Staff | [Before](../tmp/kan72-refinement/before-admin-staff-390-short.png) | [After](../tmp/kan72-refinement/after-admin-staff-390-short.png) | [Full name](../tmp/kan72-refinement/after-admin-staff-390-full-name.png) |
| Teacher | [Before](../tmp/kan72-refinement/before-teacher-390-short.png) | [After](../tmp/kan72-refinement/after-teacher-390-short.png) | [Full name](../tmp/kan72-refinement/after-teacher-390-full-name.png) |
| Teaching Assistant | [Before](../tmp/kan72-refinement/before-teaching-assistant-390-short.png) | [After](../tmp/kan72-refinement/after-teaching-assistant-390-short.png) | [Full name](../tmp/kan72-refinement/after-teaching-assistant-390-full-name.png) |
| Student | [Before](../tmp/kan72-refinement/before-student-390-short.png) | [After](../tmp/kan72-refinement/after-student-390-short.png) | [Full name](../tmp/kan72-refinement/after-student-390-full-name.png) |
| Parent | [Before](../tmp/kan72-refinement/before-parent-390-short.png) | [After](../tmp/kan72-refinement/after-parent-390-short.png) | [Full name](../tmp/kan72-refinement/after-parent-390-full-name.png) |

Notification comparison: [Student zero before](../tmp/kan72-refinement/before-student-390-zero-bell.png) / [after](../tmp/kan72-refinement/after-student-390-zero-bell.png), [Parent zero before](../tmp/kan72-refinement/before-parent-390-zero-bell.png) / [after](../tmp/kan72-refinement/after-parent-390-zero-bell.png), [Manager zero](../tmp/kan72-refinement/after-center-manager-390-zero-bell.png). Data previews: `after-{student,parent,center-manager}-390-normal-bell.png`. Loading/error: `after-{role}-loading.png`, `after-{role}-error.png`. Full read history evidence: `after-{role}-read-all-history.png`. Desktop profile equivalents use `1440` in filenames.

### Validation và known limitations

- Lint **PASS**, giữ **212** warnings baseline; không warning mới. Typecheck **PASS**. Production build **PASS**, vẫn cảnh báo chunk >500kB có sẵn. `git diff --check` **PASS**.
- Targeted suites: **31/31 PASS**; presentation suite được chạy lại **4/4 PASS** sau chỉnh cách truyền children trong test để bỏ lint warning. Không sửa expectations baseline ngoài phạm vi.
- Full suite: **30 files — 17 pass, 12 fail, 1 timeout**. **29 file cũ giữ nguyên exit/timeout so với checkpoint trước**, file presentation mới PASS. Các lỗi baseline/notificationInbox timeout tiếp tục được giữ nguyên và có logs từng file trong tmp; không báo full-suite PASS.
- Không sửa các giới hạn baseline đã ghi ở trên: hamburger bốn role cũ chưa có handler, CM/AD chưa có View/Edit Profile route/link, legacy Notifications pages có fallback/cache riêng. Bell mới vẫn không dùng mock. Recipient ownership cuối cùng do backend hiện hữu quyết định; adapter không tạo thêm API hoặc thay authorization.
- Branch `Duy`, HEAD không đổi, index trống. Không stage, commit, push, merge hoặc tạo PR. Dừng nghiệm thu theo yêu cầu.
