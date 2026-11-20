# EduTrack — KAN-95 Result

## Unified Dashboard Visual Design — Teacher & Teaching Assistant

### Preflight và phạm vi

- Đọc AGENTS.md và implementation hiện hành của cả bốn Dashboard, layouts, topbars, sidebars, notification presentation, CSS và illustrations. Không có screenshot tham chiếu mới trong attachment; đối chiếu source CM/Admin Staff hiện hành và chụp baseline trước sửa.
- Branch `Duy`; HEAD `8ae52ff0fe7336e022f02044a9936ff61c7ebc1d`. Workspace đã có thay đổi chưa commit của KAN-89/90. Snapshot source trước vòng này nằm local tại `tmp/kan95-unified/baseline-source.json`.
- Bảo toàn công việc trước đó. Không sửa Teacher/TA functional pages, DAL/API/services, KPI calculations, attendance, routing, auth, approval hoặc notification rules. Không triển khai KAN-72; profile vẫn ở Topbar.
- `tmp/` được xác nhận Git ignore trước QA. Screenshots/profiles/logs/scripts/caches chỉ local; không tạo tài liệu QA/preflight/final riêng.

### Visual changes theo role

| Role | Thay đổi |
|---|---|
| Teacher | Academy Topbar waves/Soft Glass; initials fallback; dynamic center card/school sidebar; compact teaching banner với books/cap; KPI mint/cyan/green/amber và watermark; Today's Classes/calendar empty state; notification rows/header; responsive composition |
| Teaching Assistant | Cùng academy shell và shared KPI/banner presentation; illustration checklist/schedule phù hợp learning support; giữ title Active Classes và toàn bộ nội dung riêng của TA |
| Center Manager | Chỉ chuẩn hóa hai header links View All với Arrow Right, spacing/color/weight/focus; không redesign các phần đã duyệt |
| Admin Staff | Chuẩn hóa ba header links: Detailed Monitoring, Recent Notifications View All, View all requests; giữ nguyên layout/banner/KPI/panels đã duyệt |

- Màu chuẩn: primary #078444, mint #EAF8F1, page #F7FAF8, ink #142238, muted #64748B, border #DCEBE3. Màu semantic theo dữ liệu vẫn riêng biệt; pending attendance dùng amber có độ tương phản rõ.
- Teacher/TA giữ đúng bốn KPI và sáu input figures. Teacher giữ `Assigned Classes`; TA giữ `Active Classes`. Supporting information về grading/classes today/student scope/pending attendance còn đầy đủ, không đổi công thức hoặc thêm navigation.
- Giữ greeting theo thời gian, tên từ dashboard profile và subtitle riêng của role. Loại tên người dùng hardcoded ở fallback presentation, dùng nhãn role khi chưa có profile; không sửa cách DAL chọn user hoặc mock fallback hiện hành.
- Banner desktop 146px, responsive; không thêm quick actions. School illustration dùng khoảng trống còn lại trong sidebar và ẩn trên viewport thấp, không đẩy dài menu.
- Page title và breadcrumb hierarchy thống nhất, destinations và labels breadcrumb giữ nguyên.
- Today's Classes giữ current date, filters/sort, tối đa ba displayed classes, remaining count, statuses, Take Attendance/View Class routes và mọi data bindings. Calendar empty state có min-height hợp lý; grid align-start không kéo panel rỗng theo notifications.
- Teaching notifications giữ API/store/quick list/unread filter/count, New badges, sender, dates và visibility. Chỉ sửa header icon/link và CSS presentation; không dùng empty state thay dữ liệu.
- Header navigation dùng `academy-dashboard-link`, #078444, 12px/600, gap 5px và một `bi bi-arrow-right` aria-hidden. Không dùng Unicode arrows, không duplicate icons, không đổi href/handlers; action buttons giữ nguyên.

### Shared components, CSS và assets

- Mở rộng opt-in `center-manager-academy.css` cho `.teaching-academy` và `.teaching-dashboard`, giữ selectors/specificity cho CM/Admin Staff. File giữ tên lịch sử để không di chuyển/xóa file đang được phát triển trong working tree.
- `teaching-academy.css` là composition chung Teacher/TA và các overrides cần thiết cho legacy Teacher CSS; không tạo stylesheet gần giống riêng cho từng role. Dashboard additions dùng `.teaching-dashboard`; shell additions chỉ nằm trong `.teacher-scope.teaching-academy`.
- Dùng lại CenterManagerTopbarAvatar + initials/default-avatar helper, CenterSchoolIcon và CenterSettingsProvider. GET center settings hiện hữu được phép đọc theo controller hiện hành; không thêm endpoint hoặc đổi backend.
- Hai presentation components mới: `TeachingWelcomeBanner` và `TeachingDashboardKpis`; wrappers public của mỗi role vẫn giữ interfaces/default values hiện hữu.
- Assets reused: `academy-banner-waves.svg`, `academy-school-mint.png`, `academy-books-cap.svg` (Teacher banner), `staff-welcome.svg` (TA banner), `manager-notifications-empty.svg`. Không tạo visual asset mới.

### Files thay đổi trong vòng này

Các đường dẫn frontend dưới `Capstone2/frontend/`:

| Files | Mục đích |
|---|---|
| src/GUIs/layouts/teacher/TeacherLayout.tsx; TeachingAssistantLayout.tsx | Opt-in academy styles và center settings provider |
| src/GUIs/layouts/teacher/TeacherSidebar.tsx; TeachingAssistantSidebar.tsx | Center name động và school icon; menu/routes/order giữ nguyên |
| src/GUIs/layouts/teacher/TeacherTopBar.tsx; TeachingAssistantTopBar.tsx | Soft Glass trigger markup và shared initials/image fallback; giữ profile links/logout/outside-click handlers |
| src/GUIs/pages/teacher/Teacher/TeacherDashboardPage.tsx; ../TeachingAssistant/TeachingAssistantDashboardPage.tsx | Dashboard wrapper, composition và tên fallback theo role; giữ load/filter/map/sort/KPI props |
| src/GUIs/components/teacher/Teacher/dashboard/GreetingSection.tsx; ../TeachingAssistant/dashboard/GreetingSection.tsx | Dùng shared banner; giữ greeting logic |
| src/GUIs/components/teacher/Teacher/dashboard/TeacherKpiCards.tsx; ../TeachingAssistant/dashboard/TeachingAssistantKpiCards.tsx | Shared KPI presentation; giữ titles/data/supporting information |
| src/GUIs/components/teacher/Teacher/dashboard/TodayClassesSection.tsx; ../TeachingAssistant/dashboard/TodayClassesSection.tsx | Header icon, single arrow, calendar empty state; không đổi class logic |
| src/GUIs/components/teacher/shared/TeachingWelcomeBanner.tsx; TeachingDashboardKpis.tsx | Hai shared presentation components mới |
| src/GUIs/components/shared/notifications/TeachingDashboardNotifications.tsx | Header bell/arrow; notification data logic giữ nguyên |
| src/assets/css/center-manager-academy.css; teaching-academy.css | Shared academy opt-in, navigation standard và teaching composition |
| src/GUIs/components/admin/CenterManager/PendingApprovalRequestsCard.tsx | Header navigation only |
| src/GUIs/components/shared/notifications/NotificationQuickViews.tsx | Header View All navigation only |
| src/GUIs/pages/admin/AdminStaff/AdminStaffDashboardPage.tsx | Header navigation classes/icon spacing only |
| tests/dashboardNotificationPresentation.test.mjs | Expect single library arrow và giữ count/destination/states |
| tests/unifiedTeachingDashboard.test.mjs | Bảy targeted presentation/regression tests mới |

Docs: cập nhật báo cáo KAN-89 và KAN-90 hiện hữu; tạo đúng một báo cáo KAN-95 này sau khi kiểm tra không có báo cáo KAN-95 khác. Không sửa báo cáo KAN-72.

### Visual và responsive QA

- Browser API fixtures local, đồng hồ cố định để so sánh. **40 baseline specimens**, **56 final specimens**: bốn roles × sáu widths populated; thêm loading/empty/error/missing-role tại 1280px cho cả bốn; năm avatar cases tại 1440px cho Teacher/TA; notification loading/error và viewport thấp 1440×640 cho Teacher/TA.
- Sáu widths: **1920, 1440, 1280, 1024, 768, 390px**. Không horizontal overflow toàn trang hoặc KPI clipping. KPI grid 4 cột ở desktop đủ rộng, 2 cột ở 1024/768, 1 cột ở 390. Supporting information đọc đầy đủ; panels stack khi hẹp.
- Các populated specimens Teacher/TA có KPI values `12 / 4 / 126 / 2`, cùng supporting text và cùng danh sách href như baseline. Notification list hiển thị năm records từ snapshot fixture với count, sender, dates, New badges. Fixtures không được đưa vào production source.
- Tất cả final header links có đúng một `.bi-arrow-right`, không Unicode arrow và computed primary color đúng #078444. Desktop/mobile không có duplicate arrow.
- Avatar: không có ảnh/default cartoon/broken image dùng initials; personal image được giữ và load thành công; tên một từ `Đức` → `Đ`, thiếu tên → `?`. Component/helper tiếng Việt tái sử dụng từ vòng trước, không sửa dữ liệu profile.
- Profile dropdown và bell mở được, không vượt viewport. Outside mousedown đóng profile đúng handler hiện hữu. Bell Escape behavior giữ nguyên. Teacher/TA profile không được bổ sung Escape behavior mới.
- Bốn focused browser runs (Teacher/TA × 1440/390) kiểm tra thực tế trong fixture router: View Profile, View Schedule, Take Attendance (có sessionId), View Class, View All, notification row và Logout navigation đều hoạt động; bell có đủ năm rows. Item cuối sidebar tiếp cận được sau scroll/direct open class.
- Kiểm tra riêng classes-empty + năm notifications: classes panel **354px**, notifications khoảng **623px desktop / 836px mobile**; panel rỗng không bị kéo theo chiều cao notifications. Không thêm widget hoặc record giả.
- Sidebar toggle/collapse buttons vẫn không hoạt động trong isolated preview cả baseline/final (không có handler được nối trong preview). Không đánh dấu PASS; không bổ sung behavior ngoài scope.

### Regression và preservation

- CM/Admin Staff ở cả sáu widths: welcome geometry, toàn bộ KPI metrics/computed presentation và shell signatures (Sidebar/center card/Topbar/content) khớp baseline. Header links thay đổi theo yêu cầu, vì vậy không tuyên bố toàn ảnh trùng pixel.
- Source safety kiểm tra chính xác: phần load/filter/map/sort trước return của hai Dashboard giữ nguyên sau khi bỏ khác biệt nhãn tên fallback; class-processing arrow functions trong hai TodayClassesSection giữ nguyên; profile outside-click/logout handlers giữ nguyên.
- Manager dashboard/layout/sidebar/topbar, Staff layout/sidebar, ManagementDashboardKpi và các source ngoài danh sách vòng này khớp snapshot preflight. Student, Parent, Landing và các Teacher/TA functional pages không sửa. Không thay đổi routing/auth/attendance/notification workflows.
- Chưa thực hiện full browser regression trên các functional pages hoặc Student/Parent; preservation ở đó được xác nhận bằng source scope/snapshot, không gán browser PASS.

### Screenshots local

| Role | Before 1440 | After 1440 | Mobile 390 |
|---|---|---|---|
| Teacher | [Before](../tmp/kan95-unified/screenshots/before-teacher-1440-populated.png) | [After](../tmp/kan95-unified/screenshots/after-teacher-1440-populated.png) | [Mobile](../tmp/kan95-unified/screenshots/after-teacher-390-populated.png) |
| Teaching Assistant | [Before](../tmp/kan95-unified/screenshots/before-teaching-assistant-1440-populated.png) | [After](../tmp/kan95-unified/screenshots/after-teaching-assistant-1440-populated.png) | [Mobile](../tmp/kan95-unified/screenshots/after-teaching-assistant-390-populated.png) |
| Center Manager | [Before](../tmp/kan95-unified/screenshots/before-center-manager-1440-populated.png) | [Regression](../tmp/kan95-unified/screenshots/after-center-manager-1440-populated.png) | [Mobile](../tmp/kan95-unified/screenshots/after-center-manager-390-populated.png) |
| Admin Staff | [Before](../tmp/kan95-unified/screenshots/before-admin-staff-1440-populated.png) | [Regression](../tmp/kan95-unified/screenshots/after-admin-staff-1440-populated.png) | [Mobile](../tmp/kan95-unified/screenshots/after-admin-staff-390-populated.png) |

- [Teacher classes-empty, notifications populated](../tmp/kan95-unified/screenshots/focused-teacher-1440-schedule-empty.png) · [TA classes-empty](../tmp/kan95-unified/screenshots/focused-teaching-assistant-1440-schedule-empty.png)
- [Teacher mobile Profile](../tmp/kan95-unified/screenshots/focused-teacher-390-profile.png) · [TA mobile Bell](../tmp/kan95-unified/screenshots/focused-teaching-assistant-390-bell.png)
- Mọi viewport và states còn lại lưu cùng thư mục local, không commit screenshots/logs/cache/profile.

### Automated validation

| Check | Baseline | Final |
|---|---|---|
| Frontend lint | PASS, 212 warnings | PASS, 212 warnings |
| Typecheck | PASS | PASS |
| Production build | PASS | PASS |
| Existing frontend suite, per-file timeout 20s | 142 PASS / 34 FAIL / 1 timeout | 149 PASS / 34 FAIL / cùng 1 timeout |
| Targeted teaching + notification presentation | — | 9/9 PASS (7 mới + 2 hiện hữu) |
| git diff --check | — | PASS |

- Không có failure mới trong final. Giữ nguyên 34 failures ở các suites nghiệp vụ có sẵn và timeout `notificationInbox.test.mjs`; không sửa lỗi ngoài phạm vi để ép PASS. Số PASS/FAIL là summaries của files hoàn tất; timed-out file được báo riêng và có failing assertions trước timeout như baseline.
- Build vẫn cảnh báo chunk >500kB. Preview config local cảnh báo optional esbuild import; production build thành công. Không cài dependency mới.
- Evidence: `tmp/kan95-unified/evidence.log`, `browser-evidence.log`, `safety.log`, `focused-behaviors.json`, các baseline/final test logs và browser JSON.

### Known limitations và nghiệm thu

- Không có backend/tài khoản thật được kiểm thử end-to-end trong vòng này. Browser data là controlled API snapshots, không phải chứng minh dữ liệu thật trên môi trường triển khai. Chưa xác nhận server-side permissions, read mutations/auto-hide hoặc token invalidation khi logout.
- `teachingDAL.getDashboard` vốn có mock fallback khi API lỗi và các fallback dữ liệu hiện hữu; giữ nguyên vì ngoài phạm vi visual. Error specimen Teacher/TA phản ánh behavior đó, không được coi là error handling mới đã sửa. Topbar và Dashboard vẫn dùng identity sources hiện hữu, không đồng bộ lại authentication/data selection trong task này.
- Dynamic center card đọc settings thật khi chạy app; fixture QA dùng center name kiểm thử. Fonts/icons trong QA dùng assets local, chưa xác nhận CDN môi trường thật.
- Branch/HEAD giữ nguyên; index trống. Working tree chứa cả thay đổi KAN-89/90 có sẵn và vòng unified visual này. Không stage/commit/push/merge/PR; không xóa artifacts cũ. Dừng để người dùng nghiệm thu bốn role trước commit checkpoint.

## Teacher & TA Dashboard Final Adjustments — kết quả hiện hành

Phần này thay thế yêu cầu giữ supporting information trong KPI presentation của vòng unified ở trên. Chỉ thực hiện hai điều chỉnh được yêu cầu; không redesign mới.

### Preflight và files changed

- Đã đọc AGENTS.md, kiểm tra implementation Teacher/TA, tham chiếu KPI và date badge của CM/Admin Staff.
- Branch `Duy`, HEAD `8ae52ff0fe7336e022f02044a9936ff61c7ebc1d`. Bảo toàn toàn bộ working tree chưa commit từ các vòng trước; snapshot source đầu vòng lưu local tại `tmp/kan95-final-adjustments/baseline-source.json`.
- `tmp/` được Git ignore trước QA. Không tạo report phụ, không sửa báo cáo KAN-89/90 trong vòng này.

Chỉ thay đổi năm files trong vòng adjustments:

| File | Thay đổi |
|---|---|
| Capstone2/frontend/src/GUIs/components/teacher/shared/TeachingDashboardKpis.tsx | Bỏ supporting text/footer/divider khỏi presentation; giữ bốn titles/values/icons/watermarks và semantic classes |
| Capstone2/frontend/src/GUIs/components/teacher/shared/TeachingWelcomeBanner.tsx | Thêm Current Date badge và cơ chế cập nhật theo giờ trung tâm |
| Capstone2/frontend/src/assets/css/teaching-academy.css | KPI min-height 154 → 136px, bỏ CSS footer; scoped date badge và vị trí illustration để tránh overlap |
| Capstone2/frontend/tests/unifiedTeachingDashboard.test.mjs | Cập nhật assertions KPI display-only; thêm hai timezone/midnight date tests |
| docs/EDUTRACK_KAN95_RESULT.md | Cập nhật duy nhất báo cáo KAN-95 này |

Source snapshot xác nhận chỉ ba production files ở bảng trên thay đổi. Hai Dashboard pages, KPI wrappers/interfaces/props, layouts, topbars, sidebars, data sources, API/services/calculations, attendance, auth, routes và mọi role khác giữ nguyên so với đầu vòng.

### KPI presentation

- Teacher: Active Assignments, Assigned Classes, My Students, Pending Attendance. TA: Active Assignments, Active Classes, My Students, Pending Attendance.
- Mỗi card chỉ còn title, value, icon và decorative watermark; không supporting text, divider, footer hoặc khoảng đệm footer riêng, không chart/navigation/action mới.
- Bỏ binding presentation cho assignmentsDueToday/classesToday nhưng giữ các fields, props và nguồn dữ liệu hiện hữu; không xóa dữ liệu hoặc sửa calculations.
- Giữ backgrounds, borders, semantic colors, icons và watermark styling. Dùng padding hiện hữu, giảm min-height về 136px tương ứng management KPI presentation.

### Current Date badge

- Dùng `Intl.DateTimeFormat('en-US', ...)` với constant `CENTER_TIME_ZONE` và helper `centerDateKey` hiện hữu từ adminStaffDashboardService; service không sửa. Định dạng weekday/month/day/year đầy đủ, `time` có machine-readable center date.
- Giá trị từ `new Date()` thực tế, không hardcode. Timer căn mốc phút cập nhật state, bao gồm mốc midnight theo Asia/Ho_Chi_Minh; focus/visibilitychange lấy lại thời gian và căn timer. Cleanup gỡ listeners và timer khi unmount.
- Desktop badge ở góc trên phải, nền trắng bán trong suốt, viền trắng nhẹ, calendar icon, white text, pill shape, typography/padding tương ứng management style.
- Illustration giữ nguyên asset và kích thước 250×106px hoặc 210×106px theo breakpoint hiện hữu; chỉ dịch xuống trong banner để không chồng badge. Gradient, greeting, dynamic name, subtitle và cơ chế ẩn illustration trên mobile không đổi.
- Mobile badge chuyển xuống dưới text trong banner với khoảng trống phù hợp; không thêm picker/modal hoặc chức năng lịch.

### Responsive và regression QA

- **20 before / 20 after screenshots**: Teacher, TA, CM và Admin Staff tại **1920, 1440, 1280, 768, 390px**. Browser QA dùng controlled API snapshots local, không đưa fixtures vào production.
- Teacher/TA: bốn values giữ `12 / 4 / 126 / 2` trong fixture; titles riêng đúng, không còn supporting text/divider; tất cả cards cao **136px**. Không horizontal overflow hoặc KPI clipping.
- Banner geometry giữ nguyên tại cả năm widths, cao **146px**; badge không overlap copy hoặc illustration theo DOM rectangle measurements. Illustration dimensions không đổi.
- CM/Admin Staff: cả **10 ảnh PNG trước/sau trùng pixel**. Các source của hai role không thay đổi trong vòng này.
- Date browser QA bổ sung cho cả Teacher/TA, đặt browser timezone thành **UTC**: clock đi từ `2026-11-20T16:59:59Z` qua `17:00:00Z`, badge tự đổi Friday November 20 → Saturday November 21 đúng giờ Việt Nam mà không reload. Cả focus refresh, visibility refresh và reload sau midnight đều đúng. Đây là clock simulation kiểm thử, production vẫn đọc thời gian thực.
- Targeted render tests cũng kiểm tra hai instants trước/sau center midnight cùng `dateTime`, giữ greeting/name/subtitle và không thêm actions.

### Screenshots trước/sau

| Role | Before desktop | After desktop | After mobile |
|---|---|---|---|
| Teacher | [Before 1440](../tmp/kan95-final-adjustments/screenshots/before-teacher-1440-populated.png) | [After 1440](../tmp/kan95-final-adjustments/screenshots/after-teacher-1440-populated.png) | [After 390](../tmp/kan95-final-adjustments/screenshots/after-teacher-390-populated.png) |
| Teaching Assistant | [Before 1440](../tmp/kan95-final-adjustments/screenshots/before-teaching-assistant-1440-populated.png) | [After 1440](../tmp/kan95-final-adjustments/screenshots/after-teaching-assistant-1440-populated.png) | [After 390](../tmp/kan95-final-adjustments/screenshots/after-teaching-assistant-390-populated.png) |

Các widths khác và regression screenshots CM/Admin Staff nằm cùng thư mục local. Logs, browser profiles, source snapshot, measurements và date simulation results chỉ trong `tmp/kan95-final-adjustments/`, không stage/commit.

### Automated checks và known limitations

| Check | Kết quả vòng này |
|---|---|
| Frontend lint | PASS, giữ 212 warnings có sẵn |
| Typecheck | PASS |
| Targeted teaching + notification presentation | Baseline 9/9 PASS; final 11/11 PASS |
| Production build | PASS; chunk warning >500kB có sẵn |
| git diff --check | PASS |

- Full frontend suite không chạy lại ở vòng nhỏ này. Kết quả full suite gần nhất ở vòng unified vẫn được ghi nhận: 149 PASS / 34 FAIL / notificationInbox timeout, không được diễn giải thành full-suite PASS cho vòng adjustments. Các failures ngoài phạm vi không sửa.
- Browser fixtures xác nhận presentation/clock behavior, không chứng minh dữ liệu backend hoặc end-to-end tài khoản thật. Known legacy DAL mock fallback và sidebar toggle limitation đã ghi ở vòng trước giữ nguyên, không xử lý trong scope này.
- Chỉ cập nhật báo cáo này. Branch/HEAD giữ nguyên, index trống, working tree vẫn bao gồm thay đổi có sẵn và adjustments nêu trên. Không stage, commit, push, merge hoặc tạo PR. Dừng để người dùng nghiệm thu.
