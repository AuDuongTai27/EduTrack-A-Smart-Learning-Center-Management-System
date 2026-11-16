# EduTrack — KAN-56 + KAN-74

Ngày thực hiện: 2026-11-16 (Asia/Bangkok). Branch `Duy`. Đã triển khai visual/branding để review tại local; **chưa đủ bằng chứng nghiệm thu toàn bộ role** do chưa có phiên đăng nhập và môi trường backend kiểm thử. Không stage, commit, push, merge, PR hoặc cập nhật Jira.

## Audit trước sửa

Lệnh đầu tiên xác nhận `Duy`, `git status --short` trống. Không có file thay đổi sẵn cần bảo vệ; không tìm thấy `AGENTS.md` trong checkout. File `checks/initial-status.txt` được ghi sau khi tạo thư mục bằng chứng nên dòng `frontend/docs/` trong file đó là chính artifact tạm của lần ghi log; artifact đã được chuyển về `docs/kan56-kan74/`.

| Khu vực                   | Source hiện tại / nhận xét                                                                                   | Phạm vi sửa                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Landing                   | Modern Academy, `landing.css`, `LandingUI.Brand`, navbar và footer dùng icon mũ                              | Chỉ thay biểu tượng thương hiệu; giữ nguyên nội dung, CSS KAN-50 và tương tác |
| Login / Workspace Chooser | Một dialog `WorkspaceChooser`, không có trang Login riêng hoặc màn chọn role riêng trong source đang mounted | Thêm logo + wordmark, focus input rõ; giữ nguyên form, validation và submit   |
| Center Manager            | `CenterManagerLayout`, `admin-shared.css`, `center-manager.css`; accent tím, greeting gradient tím/xanh      | Token chung, shell/sidebar, banner, card, primary actions, form/modal/table   |
| Admin Staff               | `AdminStaffLayout`, dùng chung Admin CSS, thêm `admin-staff.css`                                             | Như Manager; link/selected styles xanh thương hiệu                            |
| Teacher                   | `TeacherLayout`, `teacher-layout.css`; tím và gradient xanh/tím                                              | Như trên; giữ màu trạng thái và môn học                                       |
| Teaching Assistant        | `TeachingAssistantLayout`, dùng chung Teacher CSS                                                            | Cùng token/logo với Teacher; menu giữ nguyên                                  |
| Student                   | `Student-layout`, `student.css`; primary xanh dương, welcome banner xanh dương/teal                          | Alias token chung, banner xanh, logo desktop/offcanvas/topbar                 |
| Parent                    | Có source và routes riêng; dùng `student.css`, logo cũ là icon nhóm người nền xanh dương                     | Cùng logo gốc và palette Student; giữ child selector, provider và quyền       |

CSS các role được import qua routes và dùng scope `.admin-scope`, `.teacher-scope`, `.student-scope`; Parent dùng scope Student. `brand-system.css` được import sau `App` để áp dụng lớp presentation chung. Các CSS lịch, Notifications, tuition modal và shared components vẫn giữ cấu trúc riêng; không đổi markup dữ liệu, callback, filter hay request. `center-manager-layout.css`, `main.css`, `demo.css` là các stylesheet legacy không cần sửa cho các layout đang mounted.

## KAN-56 — palette và hierarchy

Token tập trung tại [`brand-tokens.css`](../Capstone2/frontend/src/assets/css/brand-tokens.css), áp dụng tại [`brand-system.css`](../Capstone2/frontend/src/assets/css/brand-system.css). Tích hợp với `--accent`, `--page-bg`, các alias Student và Bootstrap custom properties hiện có.

| Token                        | Giá trị                                                              |
| ---------------------------- | -------------------------------------------------------------------- |
| `--et-primary`               | `#078444`                                                            |
| `--et-primary-hover`         | `#067647`                                                            |
| `--et-primary-active`        | `#05643C`                                                            |
| `--et-mint`                  | `#EAF8F1`                                                            |
| `--et-surface`               | `#F7FAF8`                                                            |
| `--et-card`                  | `#FFFFFF`                                                            |
| `--et-heading`               | `#142238`                                                            |
| `--et-border`                | `#DCEBE3`                                                            |
| `--et-muted`                 | `#5B6879`                                                            |
| `--et-radius`                | `12px`                                                               |
| `--et-focus` / `--et-shadow` | Green focus ring / navy shadow opacity thấp                          |
| `--et-brand-banner`          | Green gradient + radial white rất nhẹ, giới hạn trong welcome banner |

Các màu branding được thay tại shell/action selectors:

| Cũ                                                            | Mới / ý nghĩa                           |
| ------------------------------------------------------------- | --------------------------------------- |
| Tím `#5D3FD3`, hover `#4930B5`                                | Primary / hover green                   |
| Lavender `#EDE9FE`, `#F5F3FF`, selected `#F6F4FF`             | Mint ở navigation/selected/hover        |
| Border `#DDD6FE`, action hover `#DCD5FF`                      | Soft green border                       |
| Student primary `#2563EB`, hover `#1D4ED8`                    | Kế thừa primary / hover từ root         |
| Welcome gradient tím/xanh `#7C5CFC`, `#4D8CFF` hoặc blue/cyan | Banner xanh thống nhất                  |
| Nền shell `#F6F7FB`, `#F8FAFC`                                | Light Surface                           |
| Brand gradient Parent `#1E40AF` / `#3B82F6`                   | SVG chung, bỏ nền cũ ở logo             |
| Badge tuition pending tím `#6D28D9` / `#EDE9FE` / `#8B5CF6`   | Amber `#A16207` / `#FEF3C7` / `#F59E0B` |

Không thay toàn bộ màu xanh dương/tím còn lại: các màu semantic, role badges, môn học, chart và avatar không được thay thành logo. Danger vẫn đỏ, Information vẫn xanh dương, warning/pending amber, disabled nền xám. Card/table/form trắng hoặc trung tính; không thêm ảnh, blob hay họa tiết sau dữ liệu. Không đổi kích thước shell hoặc thứ tự menu. Bảng rộng vẫn có vùng cuộn riêng để không che/cắt dữ liệu.

## KAN-74 — SVG và vị trí dùng

Dựng vector thủ công từ ảnh tham chiếu đính kèm, không dùng icon mũ mặc định thay thế. Lục giác mềm, cây năm lá, thân nối với mũ, tassel và sách mở. Giảm chi tiết ở bản favicon; không neon, gradient phức tạp hoặc shadow 3D.

| Asset                                                                                | Sử dụng                                                                            |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| [`edutrack-icon.svg`](../Capstone2/frontend/public/branding/edutrack-icon.svg)       | Biểu tượng chính, xanh `#078444`, trắng, mint phụ `#C5EBD5`; viewBox `0 0 100 112` |
| [`edutrack-primary.svg`](../Capstone2/frontend/public/branding/edutrack-primary.svg) | Asset logo + chữ EduTrack, viewBox `0 0 360 112`                                   |
| [`edutrack-small.svg`](../Capstone2/frontend/public/branding/edutrack-small.svg)     | Ba lá / chi tiết lớn hơn cho 16–32px                                               |
| [`edutrack-mono.svg`](../Capstone2/frontend/public/branding/edutrack-mono.svg)       | Trắng đơn sắc, nền trong suốt, cho nền xanh/tối                                    |
| [`favicon.svg`](../Capstone2/frontend/public/favicon.svg)                            | Cùng hình học với bản small                                                        |

[`BrandIcon.tsx`](../Capstone2/frontend/src/GUIs/components/Common/BrandIcon.tsx) là component presentation dùng chung. Text EduTrack hiện có được giữ cùng icon tại navbar/footer Landing, sáu role sidebar, Student/Parent offcanvas và mobile topbar. Login/Workspace thêm lockup cùng icon. Ảnh có kích thước cố định và `object-fit: contain`; không thay avatar, subject icon, navigation icon hoặc watermark giáo dục.

## Visual QA và screenshots

Chạy Chrome headless trên production `dist` bằng server frontend cô lập; `/api/*` trả 503 nếu bị gọi, không proxy tới backend. Kết quả public và CSS specimen đều **0 API request, 0 browser exception**. Không tạo dữ liệu nghiệp vụ và không khởi động backend/migration/seeding.

| Viewport | Landing / Login-Workspace | CSS Admin / Teacher / Student specimen |
| -------- | ------------------------- | -------------------------------------- |
| 1440     | Đạt                       | Đạt                                    |
| 1280     | Đạt                       | Đạt                                    |
| 768      | Đạt                       | Đạt                                    |
| 390      | Đạt                       | Đạt                                    |
| 360      | Đạt                       | Đạt                                    |

Public QA: không overflow toàn trang; dialog vừa màn hình; Escape đóng; hiện/ẩn mật khẩu và required validation hoạt động, không gửi thông tin đăng nhập; FAQ mở/đóng; ba teacher profile modal mở/đóng; bốn subject filters và All Subjects; link CTA vẫn trỏ Contact.

CSS specimen QA: dùng stylesheet production và selector thật trong markup kiểm tra biệt lập, không có record nghiệp vụ hoặc mock API. Primary computed `rgb(7,132,68)`, hover `rgb(6,118,71)`, pressed `rgb(5,100,60)`; danger/disabled phân biệt với primary; outline focus hiện rõ; card và banner đúng màu. **Specimen không phải dashboard thật và không chứng minh được chức năng của role.**

| Bằng chứng                | Trước                                               | Sau                                                |
| ------------------------- | --------------------------------------------------- | -------------------------------------------------- |
| Landing desktop           | [1440](kan56-kan74/before/landing-1440.png)         | [1440](kan56-kan74/after/landing-1440.png)         |
| Landing laptop            | [1280](kan56-kan74/before/landing-1280.png)         | [1280](kan56-kan74/after/landing-1280.png)         |
| Landing tablet            | [768](kan56-kan74/before/landing-768.png)           | [768](kan56-kan74/after/landing-768.png)           |
| Landing mobile            | [390](kan56-kan74/before/landing-390.png)           | [390](kan56-kan74/after/landing-390.png)           |
| Landing mobile nhỏ        | [360](kan56-kan74/before/landing-360.png)           | [360](kan56-kan74/after/landing-360.png)           |
| Login / Workspace desktop | [1440](kan56-kan74/before/login-workspace-1440.png) | [1440](kan56-kan74/after/login-workspace-1440.png) |
| Login / Workspace mobile  | [360](kan56-kan74/before/login-workspace-360.png)   | [360](kan56-kan74/after/login-workspace-360.png)   |

Thêm ảnh Login 1280/768/390 trong thư mục before/after. [Logo 16/32/40/64px trên nền trắng/xanh](kan56-kan74/after/logo-sizes-white-green.png). Mẫu table/form: [Admin desktop](kan56-kan74/after/admin-scope-specimen-1440.png), [Admin mobile](kan56-kan74/after/admin-scope-specimen-390.png), [Teacher mobile](kan56-kan74/after/teacher-scope-specimen-390.png), [Student/Parent mobile](kan56-kan74/after/student-scope-specimen-390.png). Có đủ năm viewport cho mỗi scope trong thư mục `after/`.

[Kết quả browser trước](kan56-kan74/before/browser-results.json), [kết quả browser sau](kan56-kan74/after/browser-results.json).

### Chưa kiểm thử

Tất cả dashboard thật của Center Manager, Admin Staff, Teacher, Teaching Assistant, Student, Parent và các trang list/detail/form/modal/calendar/profile của từng role: **chưa kiểm thử**, chưa có tài khoản và môi trường backend an toàn được cung cấp. Chỉ xác minh request chưa đăng nhập vào dashboard của cả sáu role vẫn bị guard đưa về `/`; không sửa hoặc bypass auth, không giả token/session.

Login thành công, logout, role navigation, sidebar toggle/collapse, dropdown, search/sort/pagination, calendar navigation, submit nghiệp vụ: **chưa kiểm thử runtime**. Không đánh dấu PASS dựa vào source audit hoặc mẫu CSS. Chưa có ảnh trước/sau dashboard thật; cần tiếp tục QA bằng phiên đăng nhập hợp lệ trước khi nghiệm thu đủ cả hai task.

Môi trường screenshot chặn CDN fonts để kiểm tra ổn định; Bootstrap CSS dùng bản local. Font Bootstrap Icons không có trong checkout và CDN không truy cập được, nên vài icon font trong ảnh là ô vuông; tình trạng này có cả baseline. Logo SVG không phụ thuộc icon font. QA hình dạng icon font và typography khi tải CDN thật: **chưa kiểm thử**. Không đổi dependency/CDN của ứng dụng để khắc phục môi trường QA.

## Automated checks và functional safety

| Check                                                 | Kết quả                                                                                                                     |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Frontend lint                                         | Exit 0, còn warnings có sẵn; không sửa logic để làm sạch lint                                                               |
| Typecheck                                             | Đạt                                                                                                                         |
| Production build                                      | Đạt; còn cảnh báo bundle >500 kB có sẵn                                                                                     |
| `npm test` baseline                                   | Có lỗi và treo tại Notifications; không có kết quả hoàn tất, không ghi PASS                                                 |
| Existing frontend tests, chạy từng file có supervisor | Trước/sau giống nhau: 22 file; 9 file đạt, 12 file lỗi, 1 file Notifications timeout sau 20s                                |
| Các case đã hoàn tất và có summary                    | Trước/sau đều 107 đạt / 34 lỗi; không tính các case chưa tổng kết trong file timeout                                        |
| Browser public + CSS specimen                         | Đạt trong phạm vi nêu trên                                                                                                  |
| AST/diff audit                                        | 11 TSX files có mã ngoài JSX và thuộc tính tương tác được kiểm tra giữ nguyên; không chạm các thư mục chức năng được bảo vệ |
| `git diff --check`                                    | Exit 0                                                                                                                      |

Baseline unit tests được chạy lại trên source `HEAD` xuất bằng `git archive` vào thư mục tạm, dùng dependencies hiện có qua junction; không đổi branch/index. Snapshot và junction đã được dọn sau khi chạy. Supervisor chạy từng file `node --test --test-isolation=none` để tránh port contention và có giới hạn 20s cho file bị treo, không sửa test nghiệp vụ. Không suy diễn rằng suite đạt hoặc chỉ có bốn lỗi Notifications theo báo cáo KAN-50 cũ.

Lỗi có sẵn xuất hiện ở AdminStaffDashboard, ClassManagement/API, ClassStaff, GradeManagement, NotificationCompose, ScheduleManagement/View, StudentCenterEnrollment, StudentEnrollment/Management, TuitionMetrics; Notifications Inbox timeout. Nhiều assertion vẫn mong chuỗi tiếng Việt trong khi source trả tiếng Anh. Không sửa những lỗi này. Danh sách đầy đủ và log từng file: [comparison](kan56-kan74/checks/test-comparison.json), [baseline](kan56-kan74/checks/before-test-summary.json), [after](kan56-kan74/checks/after-test-summary.json).

[Functional diff audit](kan56-kan74/checks/functional-diff-audit.json), [lint](kan56-kan74/checks/after-lint.txt), [typecheck](kan56-kan74/checks/after-typecheck.txt), [build](kan56-kan74/checks/after-build.txt), [diff check](kan56-kan74/checks/diff-check.txt).

Không thay backend/controller/service/repository, API/DAL/BLL, database, auth/JWT, route, context/state hoặc hooks nghiệp vụ. Không đổi handler, input contract, validation, dữ liệu hoặc tính toán. AST audit hỗ trợ review diff; không thay thế functional regression QA khi đăng nhập.

## File thay đổi và Git bàn giao

KAN-56:

- Thêm `src/assets/css/brand-tokens.css`, `brand-system.css`.
- `src/index.css`: import tokens; `src/main.tsx`: import stylesheet presentation.
- `src/assets/css/admin-shared.css`, `admin-staff.css`, `teacher-layout.css`, `student.css`: tích hợp màu brand, giữ semantic và layout.

KAN-74:

- Thêm bốn SVG trong `public/branding/`, thay `public/favicon.svg`.
- Thêm `src/GUIs/components/Common/BrandIcon.tsx`.
- `components/landing/LandingUI.tsx`, `WorkspaceChooser.tsx`.
- `layouts/admin/{CenterManagerSidebar,AdminStaffSidebar}.tsx`.
- `layouts/teacher/{TeacherSidebar,TeachingAssistantSidebar}.tsx`.
- `layouts/student/{StudentSidebar,Student-layout}.tsx`.
- `layouts/parent/{ParentSidebar,ParentLayout}.tsx`.

QA / tài liệu: `tests/brand.browser.mjs`, `tests/brand-checks.mjs`, báo cáo này và `docs/kan56-kan74/` (ảnh, log, kết quả). Không sửa các unit tests cũ.

[Git diff summary](kan56-kan74/checks/final-diff-stat.txt), [Git status cuối](kan56-kan74/checks/final-status.txt), [danh sách file mới](kan56-kan74/checks/new-files.txt). Working tree giữ toàn bộ thay đổi ở trạng thái chưa stage để người dùng review.

Chạy lại từ `Capstone2/frontend`:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
node tests/brand-checks.mjs
node tests/brand-checks.mjs --audit
$env:BRAND_QA_OUTPUT='../../docs/kan56-kan74/after'
node tests/brand.browser.mjs --specimens
git diff --check
```

`brand-checks.mjs` giữ exit 1 khi còn lỗi/timeout có sẵn. `brand.browser.mjs` chỉ phục vụ QA cô lập, không triển khai server hoặc fixture vào ứng dụng.

## Checkpoint được cho phép — 2026-11-17

Người dùng cho phép stage và commit visual baseline trên `Duy` với message `All Roles - Standardize EduTrack color theme and logo`. Các ghi chú “chưa stage/commit” phía trên mô tả lần bàn giao ngày 2026-11-16. Checkpoint này không phải nghiệm thu toàn bộ KAN-56/KAN-74; không bao gồm Visual Enhancement từ demo mới, không push/merge/PR hoặc cập nhật Jira.

Kiểm tra lại: lint, typecheck, production build và audit AST đều exit 0. Build còn cảnh báo bundle >500 kB. Frontend tests chạy lại đủ 22 file với supervisor: **9 file đạt, 12 file lỗi có sẵn, Notifications Inbox timeout 20 giây**; các case đã có tổng kết vẫn **107 đạt / 34 lỗi**, giống baseline đã ghi nhận. Đã đối chiếu kết quả từng file, số case và vị trí các case lỗi; không phát hiện regression mới trong các kiểm tra này. Không ghi toàn bộ test suite là PASS và không sửa chức năng để làm test đạt.

Dashboard thật và các tương tác sau đăng nhập của Center Manager, Admin Staff, Teacher, Teaching Assistant, Student và Parent vẫn **chưa kiểm thử thực tế**. Không thay đổi API/DAL/BLL, auth/permissions, routing, database, validation, filter/sort/pagination hoặc logic Notifications/Tuition/Schedule. Thay đổi các màu semantic trong stylesheet chỉ là hiển thị.

Chỉ đưa 25 file dưới đây vào checkpoint:

```text
Capstone2/frontend/public/branding/edutrack-icon.svg
Capstone2/frontend/public/branding/edutrack-mono.svg
Capstone2/frontend/public/branding/edutrack-primary.svg
Capstone2/frontend/public/branding/edutrack-small.svg
Capstone2/frontend/public/favicon.svg
Capstone2/frontend/src/GUIs/components/Common/BrandIcon.tsx
Capstone2/frontend/src/GUIs/components/landing/LandingUI.tsx
Capstone2/frontend/src/GUIs/components/landing/WorkspaceChooser.tsx
Capstone2/frontend/src/GUIs/layouts/admin/AdminStaffSidebar.tsx
Capstone2/frontend/src/GUIs/layouts/admin/CenterManagerSidebar.tsx
Capstone2/frontend/src/GUIs/layouts/parent/ParentLayout.tsx
Capstone2/frontend/src/GUIs/layouts/parent/ParentSidebar.tsx
Capstone2/frontend/src/GUIs/layouts/student/Student-layout.tsx
Capstone2/frontend/src/GUIs/layouts/student/StudentSidebar.tsx
Capstone2/frontend/src/GUIs/layouts/teacher/TeacherSidebar.tsx
Capstone2/frontend/src/GUIs/layouts/teacher/TeachingAssistantSidebar.tsx
Capstone2/frontend/src/assets/css/admin-shared.css
Capstone2/frontend/src/assets/css/admin-staff.css
Capstone2/frontend/src/assets/css/brand-system.css
Capstone2/frontend/src/assets/css/brand-tokens.css
Capstone2/frontend/src/assets/css/student.css
Capstone2/frontend/src/assets/css/teacher-layout.css
Capstone2/frontend/src/index.css
Capstone2/frontend/src/main.tsx
docs/EDUTRACK_KAN56_KAN74_VISUAL_RESULT.md
```

Hai script `tests/brand-checks.mjs`, `tests/brand.browser.mjs` và toàn bộ `docs/kan56-kan74/` (logs, JSON, ảnh QA, bao gồm kết quả chạy lại trong `checkpoint/`) giữ ngoài commit. Những liên kết bằng chứng phía trên chỉ có sẵn trong workspace local này; không được đóng gói vào checkpoint. Không đưa cache, build artifacts hoặc dữ liệu nhạy cảm vào commit.
