# EduTrack — KAN-56 / KAN-74 Visual Result

Cập nhật: 17/11/2026 (Asia/Bangkok). Branch: `Duy`.

Đây là tài liệu tổng hợp duy nhất cho KAN-56 và phần nhận diện KAN-74 liên quan. Các lần hoàn thiện tiếp theo cập nhật file này; không tạo báo cáo riêng theo đợt.

## Phạm vi và trạng thái

- Brand checkpoint: `6d7e538` — All Roles - Standardize EduTrack color theme and logo. Dashboard/illustration checkpoint: `253079e` — Student & Parent - Refine dashboards and shared illustrations.
- HEAD trước khi chuẩn bị commit: `e2fa225237f60f42ac0e8e8edcdbfa092e31dc7c`. Lịch sử merge #51/#52/#53 và thay đổi của nhóm đã được kiểm tra; giữ nguyên report export, upload/download, feedback, notifications, pagination và các thay đổi nghiệp vụ.
- Mẫu hiện tại gồm Student/Parent dashboards và Sidebar Modern Academy đã có, ảnh trường mới, bộ 9 subject SVG độc lập, Class Details Hero/summary của Student và Parent, cùng audit màu thương hiệu của sáu role.
- Tất cả thay đổi ứng dụng chỉ thuộc presentation. Không sửa backend, DB/migrations/seeding, API/DAL/BLL, auth/routing, state/data fetching, handlers, calculations, dữ liệu thật/mock data, search/filter/sort/pagination hoặc notifications behavior.
- Chưa stage/commit/push/merge/PR. Đây là bản chuẩn bị commit; artifacts QA giữ local, không đưa vào commit.

## Brand palette và thiết kế chung

Tái sử dụng `brand-tokens.css`: primary #078444, hover #067647, active #05643C, mint #EAF8F1, surface #F7FAF8, white #FFFFFF, navy #142238, border #DCEBE3. Giữ logo cây/mũ/sách và shared BrandIcon đã có. Không tạo hệ màu thương hiệu mới.

Student giữ nền mint/waves, welcome gradient xanh, books/cap, KPI/card trắng và grid hiện tại với hướng tối đa năm card/hàng khi đủ không gian. Parent linked/unlinked welcome giữ bố cục/actions, family PNG trong suốt và waves theo chiều cao nội dung. Đợt subject/banner cuối không redesign Dashboard.

## Sidebar illustration

- Dùng nguyên ảnh trường người dùng cung cấp: `academy-school-mint.png`, 1448×1086, RGB 24-bit, 1,278,910 bytes. Quét alpha toàn ảnh: không có pixel trong suốt.
- Student/Parent dùng chung pseudo-element đã có. Background 112% auto giữ tỉ lệ; radial mask làm mềm bốn cạnh, hòa nền vào Sidebar và tránh khung/đường cắt ngang.
- Dùng khoảng trống sẵn có, không reserve chiều cao mới. Giữ quy tắc ẩn khi dưới 992px hoặc chiều cao <=740px.
- Menu, student selector, footer, vị trí/scroll và handlers giữ nguyên. Đợt Subject/Banner sau đó không chỉnh lại Sidebar.

## Subject Illustration Collection và mapping

SVG tái dựng theo bộ reference: soft mint-green, đường nét mềm đồng nhất, lớp giấy/highlight/bóng nhẹ, nền trong suốt. Không nhúng raster/screenshot, không text phụ thuộc font, không cây/người/phong cảnh hoặc background hình chữ nhật. ABC và code dùng vector paths. Mỗi môn có hình chính riêng; không dùng sách làm nền chung.

| Subject | Asset | Illustration | Aliases |
|---|---|---|---|
| Mathematics | [mathematics.svg](../Capstone2/frontend/src/assets/illustrations/subjects/mathematics.svg) | Compa, thước kẻ, ê-ke | Math, Maths, Mathematics, Toán, Toán học |
| Physics | [physics.svg](../Capstone2/frontend/src/assets/illustrations/subjects/physics.svg) | Nguyên tử, sóng và chuyển động | Physics, Vật lý, Vật lí |
| Chemistry | [chemistry.svg](../Capstone2/frontend/src/assets/illustrations/subjects/chemistry.svg) | Bình thí nghiệm, ống nghiệm, phân tử | Chemistry, Hóa học, Hoá học |
| Biology | [biology.svg](../Capstone2/frontend/src/assets/illustrations/subjects/biology.svg) | DNA, kính hiển vi, tế bào | Biology, Sinh học |
| English | [english.svg](../Capstone2/frontend/src/assets/illustrations/subjects/english.svg) | Hội thoại, dấu trích dẫn, ABC | English, Tiếng Anh, Anh văn |
| Literature | [literature.svg](../Capstone2/frontend/src/assets/illustrations/subjects/literature.svg) | Cuộn giấy, bút lông, lọ mực; sách là chi tiết phụ | Literature, Ngữ văn, Văn |
| Informatics | [informatics.svg](../Capstone2/frontend/src/assets/illustrations/subjects/informatics.svg) | Laptop, code, mạch điện | Informatics, Computer Science, IT, Tin học |
| Natural Science | [natural-science.svg](../Capstone2/frontend/src/assets/illustrations/subjects/natural-science.svg) | Địa cầu, kính hiển vi, khoáng vật | Natural Science, Natural Sciences, KHTN, Khoa học tự nhiên |
| Default Subject | [default-subject.svg](../Capstone2/frontend/src/assets/illustrations/subjects/default-subject.svg) | Sách mở | Unknown/missing/malformed Subject |

- Shared presentation: `SubjectIllustration.tsx`, `subjectIllustrationMapping.ts`. Giữ các code tương thích PHYS/PHY/CHEM/BIO/ENG/LIT/CS/ICT và alias đã có.
- Normalize Unicode NFD, dấu tiếng Việt, hoa/thường, khoảng trắng và dấu gạch chỉ phục vụ lựa chọn asset. Không đổi tên Subject hiển thị, không suy đoán từ seed ID/class title. Recognized code ưu tiên như baseline; unknown code có thể dùng tên chính thức.
- Student Dashboard/Classes reuse ClassItem → SubjectIllustration. Parent Dashboard dùng cùng component với Subject chính thức, fallback badge chỉ khi tên trống như baseline. Parent Child’s Classes chưa có illustration nên giữ nguyên trang đó.
- Math/Mathematics/Toán đã map đúng ở baseline; asset Math cũ có sách nên gần fallback về hình thức. Bản cuối dùng dụng cụ hình học độc lập và specimens xác nhận cùng key/src. Chưa xác minh lỗi riêng của phiên localhost với dữ liệu thật.
- Natural Science chỉ thêm asset/key/aliases, không thêm Subject trong DB/API. Giới hạn upstream default labels vẫn giữ vì không sửa DAL.
- Giữ viewBox 190×75 và object-fit contain; kích thước trên card 175×66 desktop, 145×58 mobile. Không thay card/grid/typography/spacing, attendance progress hoặc buttons/navigation.

## Class Details Hero và summary

- Shared ClassHeroDecoration/CSS chỉ chứa presentation. Dùng gradient xanh, dot pattern, waves mềm ở chân, highlight phải, radius/shadow thống nhất. Reuse academy-books-cap.svg từ Dashboard.
- Watermark dùng SubjectIllustration theo `cls.subject`; không hardcode Mathematics.
- Summary soft glass: lớp mint/white bán trong suốt trên nền xanh đậm để giữ độ tương phản, border sáng, shadow nhẹ, icons nhỏ và divider.
- Student giữ đúng Students / Materials / Assignments và biểu thức số liệu; không thêm Attendance/Session Progress.
- Parent giữ Session Progress / Attendance và phép tính/trạng thái warning/danger. Giữ nguyên Basic Class Information, Teacher Evaluation & Feedback, Attendance Log.
- Giữ back link, breadcrumb, subject badge, title, student/teacher metadata và actions riêng từng role. Route chính Parent `/parent/classes/:id` được xác minh; không sửa routing.
- Desktop có copy/summary riêng cột, illustration ở phải phía trên summary; tablet giảm art/spacing; mobile ẩn art/watermark, summary xuống dòng, tên dài wrap tự nhiên. Decoration aria-hidden, alt rỗng, pointer-events none, không nhận focus.

## Color consistency audit theo role

| Role | Màu thương hiệu cũ phát hiện và vị trí đã xử lý |
|---|---|
| Student | Attendance Summary #2563EB; KPI Total Active Classes; Class Details gradients xanh/tím; loader, metadata icons, download hover, selected progress filter; profile/tuition teal-blue gradients → primary/mint/banner/focus tokens. |
| Parent | Class Details #1e3a8a → #2563eb và shadow xanh; profile avatars; Attendance Summary; Bootstrap primary-subtle defaults → tokens. Dot pattern/text trắng/summary được giữ và hero được hoàn thiện thêm theo shared visual language. |
| Teacher | Accent #5d3fd3, avatar/welcome tím-xanh, class-id links, pagination/search focus, ClassInfo icons, upload modal icon và progress student avatar → tokens; không redesign dashboard. |
| Teaching Assistant | Shared teacher accent/avatar/welcome/pagination/focus, ClassInfo/evaluator icons xanh-tím → tokens; giữ đánh giá/trạng thái nghiệp vụ. |
| Center Manager | User/avatar accent tím, notification decorative icon, schedule line, selected notification, settings/monitoring tabs, welcome/hover → tokens; không thay KPI data/layout. |
| Admin Staff | Shared admin accent/avatar/welcome, pagination, notification selected/unread/focus → tokens; không thay report/export/notifications logic. |
| Shared | Bootstrap primary subtle/emphasis/border, outline-button states, nav-pills, accordion active/focus, pagination focus, calendar today, notification interaction accents được xử lý đúng ngữ cảnh. Không sửa Bootstrap vendor CSS. |

Giữ semantic colors: success/present xanh; warning/late/due-soon vàng cam; absent/error/danger đỏ; calendar scheduled/upcoming xanh dương, ongoing xanh, completed slate, cancelled đỏ, unknown amber. Giữ màu loại tài liệu/PDF/Word/Excel, submitted-file information, notification category/type, subject/progress presets, participant avatar palettes, chart/report series và các status admin có palette riêng.

Residual có chủ đích: ChildSwitcher/account footer/mobile Parent avatar còn một số blue inline gradients theo giới hạn không chỉnh các phần đó. Một số declaration brand cũ còn trong legacy CSS nhưng được shared brand-system override. Không tuyên bố đã xóa mọi màu xanh/tím trong source.

## QA và bằng chứng local

Ảnh QA là **component/CSS specimens**, không phải ứng dụng đăng nhập với dữ liệu thật. Native dashboards, Student ClassHeroBanner và ParentClassDetailPage được mount với fixtures cô lập; Student detail chỉ kiểm tra component banner, nội dung dưới là placeholder QA. Không sửa mock data/DAL/context của ứng dụng.

- Audit màu/Sidebar: 24 cặp Student/Parent tại 1440×1000, 1280×800, 768×1024, 390×844, 360×740, 1440×680, cộng CSS specimens cho bốn role còn lại ở 1440/768/390. Tổng 120 PNG. Menu/footer/selector/card geometry và Information/Warning/Danger giữ nguyên, không tràn ngang.
- Subject/Banner cuối: 42 cặp gồm hai Dashboard, hai Banner, tên lớp/giáo viên dài và gallery/aliases ở sáu kích thước trên. 168 screenshots đầu/cuối vùng cuộn và bốn PNG đặt cạnh nhau, tổng 172 PNG.
- 42 cặp cuối: banner text khớp baseline; không đổi card/menu/footer/selector geometry, không tràn ngang, không chồng summary/illustration, SVG loaded. Back/breadcrumb hit-test PASS, decoration pointer-events none.
- AST hai banner ngoài style/class/decorations giữ nguyên. Hash audit đợt cuối không có tracked source thay đổi ngoài phạm vi. White/primary contrast khoảng 4.78:1; đây không phải chứng nhận WCAG toàn giao diện.
- Bằng chứng local, không thuộc commit: `tmp/kan56/screenshots/index.html`, `tmp/kan56-sp/review.html`, `tmp/kan56-sp/screenshots/pair-portals-desktop.png`, `pair-portals-mobile.png`, `pair-student-banner-before-after.png`, `pair-parent-banner-before-after.png`, browser metrics và safety.json trong các thư mục tương ứng. Các đường dẫn local này không có sẵn trên checkout khác nếu chỉ lấy commit.

## Automated checks

Baseline đầu audit là HEAD sau merge; baseline đợt Subject/Banner là working tree có toàn bộ công việc audit chưa commit.

| Check | Baseline | Final |
|---|---|---|
| Frontend lint (oxlint) | Exit 0; 208 warnings | Exit 0; 208 warnings |
| Typecheck (tsc -b) | PASS | PASS |
| Production build (tsc -b + vite build) | PASS | PASS; chunk-size warning giữ nguyên |
| Subject illustration tests | 5 PASS | 7 PASS |
| 23 frontend test files | 112 PASS / 34 FAIL; 1 timeout | 114 PASS / 34 FAIL; cùng 1 timeout |
| git diff --check | PASS | PASS |

Full suite **không PASS**. Đã giám sát toàn bộ 23 file bằng Node test runner với timeout 20s/file do notificationInbox.test.mjs treo. 22 file ngoài subject suite khớp baseline về exit/timeout/pass/fail/warnings. Subject suite tăng hai test cho Natural Science/Unicode/whitespace và Math/fallback; assertion số SVG cập nhật 8 → 9 theo yêu cầu, giữ các ràng buộc vector/transparent/no remote images. Không sửa business logic hoặc kỳ vọng nghiệp vụ để ép PASS.

| Test file | Final | PASS/FAIL |
|---|---|---|
| adminStaffDashboard.test.mjs | FAIL | 10/5 |
| adminStaffDashboardDAL.test.mjs | PASS | 6/0 |
| classManagement.test.mjs | FAIL | 12/1 |
| classManagementApi.test.mjs | FAIL | 2/4 |
| classStaff.test.mjs | FAIL | 4/4 |
| formatCurrency.test.mjs | PASS | 4/0 |
| gradeManagement.test.mjs | FAIL | 3/3 |
| landing-static.test.mjs | PASS | 2/0 |
| moneyInput.test.mjs | PASS | 6/0 |
| notificationCompose.test.mjs | FAIL | 1/1 |
| notificationInbox.test.mjs | TIMEOUT (20s) | 0/0 |
| scheduleIntegration.test.mjs | PASS | 3/0 |
| scheduleManagement.test.mjs | FAIL | 5/6 |
| scheduleView.test.mjs | FAIL | 0/1 |
| studentCenterEnrollment.test.mjs | FAIL | 3/2 |
| studentEnrollment.test.mjs | FAIL | 5/3 |
| studentManagement.test.mjs | FAIL | 4/2 |
| subjectIllustration.test.mjs | PASS | 7/0 |
| tuitionActions.test.mjs | PASS | 6/0 |
| tuitionGeneration.test.mjs | PASS | 8/0 |
| tuitionMetrics.test.mjs | FAIL | 12/2 |
| tuitionPolicy.test.mjs | PASS | 8/0 |
| userSelection.test.mjs | PASS | 3/0 |

Logs/results local: `tmp/kan56-sp/baseline/` và `tmp/kan56-sp/final/`. Warnings cũ gồm vendor JS, hooks/unused declarations và bundle >500 kB.

## Files chuẩn bị commit

Toàn bộ thay đổi frontend hiện tại: 36 tracked files đã chỉnh và bốn source/assets mới. Một tài liệu tổng hợp này và AGENTS.md ghi quy ước mỗi KAN một docs. Không đưa tmp/, logs, screenshots, QA scripts, caches hoặc build output vào commit.

- Capstone2/frontend/src/GUIs/components/Common/SubjectIllustration.tsx
- Capstone2/frontend/src/GUIs/components/Common/common-pagination.css
- Capstone2/frontend/src/GUIs/components/Common/subjectIllustrationMapping.ts
- Capstone2/frontend/src/GUIs/components/shared/notifications/notifications.css
- Capstone2/frontend/src/GUIs/components/shared/schedule/schedule.css
- Capstone2/frontend/src/GUIs/components/student/assignmentDetail/AssignmentMetaCards.tsx
- Capstone2/frontend/src/GUIs/components/student/classDetail/ClassHeroBanner.tsx
- Capstone2/frontend/src/GUIs/components/student/classDetail/ClassInfoCard.tsx
- Capstone2/frontend/src/GUIs/components/student/common/LearnerPageLoader.tsx
- Capstone2/frontend/src/GUIs/components/student/dashboard/DashboardStatsGrid.tsx
- Capstone2/frontend/src/GUIs/components/student/progress/ProgressStatsGrid.tsx
- Capstone2/frontend/src/GUIs/components/teacher/Teacher/classDetails/AssignmentsSection.tsx
- Capstone2/frontend/src/GUIs/components/teacher/Teacher/classDetails/ClassInfoCard.tsx
- Capstone2/frontend/src/GUIs/components/teacher/Teacher/learningProgress/StudentEvaluationSection.tsx
- Capstone2/frontend/src/GUIs/components/teacher/Teacher/learningProgress/StudentProgressHeroCard.tsx
- Capstone2/frontend/src/GUIs/components/teacher/TeachingAssistant/classDetails/ClassInfoCard.tsx
- Capstone2/frontend/src/GUIs/components/teacher/TeachingAssistant/learningProgress/StudentEvaluationSection.tsx
- Capstone2/frontend/src/GUIs/pages/parent/ParentClassDetailPage.tsx
- Capstone2/frontend/src/GUIs/pages/parent/ParentProfilePage.tsx
- Capstone2/frontend/src/assets/css/admin-shared.css
- Capstone2/frontend/src/assets/css/brand-system.css
- Capstone2/frontend/src/assets/css/center-manager-layout.css
- Capstone2/frontend/src/assets/css/center-manager.css
- Capstone2/frontend/src/assets/css/schedule-calendar.css
- Capstone2/frontend/src/assets/css/student-sidebar-academy.css
- Capstone2/frontend/src/assets/css/student.css
- Capstone2/frontend/src/assets/css/teacher-layout.css
- Capstone2/frontend/src/assets/illustrations/subjects/biology.svg
- Capstone2/frontend/src/assets/illustrations/subjects/chemistry.svg
- Capstone2/frontend/src/assets/illustrations/subjects/default-subject.svg
- Capstone2/frontend/src/assets/illustrations/subjects/english.svg
- Capstone2/frontend/src/assets/illustrations/subjects/informatics.svg
- Capstone2/frontend/src/assets/illustrations/subjects/literature.svg
- Capstone2/frontend/src/assets/illustrations/subjects/mathematics.svg
- Capstone2/frontend/src/assets/illustrations/subjects/physics.svg
- Capstone2/frontend/tests/subjectIllustration.test.mjs
- Capstone2/frontend/src/GUIs/components/Common/ClassHeroDecoration.tsx
- Capstone2/frontend/src/assets/css/class-hero-academy.css
- Capstone2/frontend/src/assets/illustrations/academy-school-mint.png
- Capstone2/frontend/src/assets/illustrations/subjects/natural-science.svg
- docs/EDUTRACK_KAN56_KAN74_VISUAL_RESULT.md
- AGENTS.md

## Giới hạn

- Chưa xác minh authenticated dashboards, real-data interactions, login/logout, authorization, API/data fetching/end-to-end hoặc số liệu attendance/tuition thực tế. Không dùng specimen để tuyên bố các phần đó PASS.
- Student Classes đã xác minh reuse ClassItem qua source, chưa chụp riêng trong đợt cuối; Parent Child’s Classes chưa có illustration nên không thêm.
- Mobile offcanvas/topbar integration, dropdown/modal và keyboard/screen-reader đầy đủ chưa được kiểm thử. QA dùng body font fallback và Bootstrap Icons nhúng local; chưa xác nhận line-wrap với web fonts production tải xong.
- Chưa xác minh remote mới nhất ngoài local tracking refs. Chất lượng SVG tái dựng cần nghiệm thu trực quan; không nhúng PNG để giả SVG.
- Các lỗi/timeouts của tests, lint warnings và bundle warning tồn tại như baseline.

Quy ước lâu dài: mỗi KAN chỉ có một file docs tổng hợp; cập nhật tài liệu này cho công việc tiếp theo của KAN-56/KAN-74.
