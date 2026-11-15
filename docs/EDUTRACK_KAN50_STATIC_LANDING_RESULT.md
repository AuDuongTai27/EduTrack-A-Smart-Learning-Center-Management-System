# KAN-50 — Static Landing Page

Ngày thực hiện: 2026-11-15. Landing Page dùng dữ liệu frontend ngay khi render, không cần backend/database. Giữ thiết kế Modern Academy và CSS hiện tại, bao gồm Statistics desktop và hover/focus xanh của Class CTA.

## Dữ liệu và nguồn xác minh

Dữ liệu tập trung tại [`landingStaticData.ts`](../Capstone2/frontend/src/GUIs/components/landing/landingStaticData.ts): `centerInfo`, `contactInfo`, `hero`, `DEMO_STATISTICS`, `subjects`, `classes`, `teachers`, `teacherIntroductions`, `benefits`, `enrollmentSteps`, `faqItems`, `NAV_ITEMS`, `footerLinks`. Dùng types rõ ràng từ các interface hiện có và `LandingClass` chỉ chứa các trường public card thực sự cần. Nội dung UI cố định còn lại vẫn là JSX frontend hiện có; không có nguồn nội dung backend. Không import mock data từ module khác.

Ưu tiên snapshot **dữ liệu thật** đã lưu ở vòng refinement, không dùng các ảnh fixture QA làm dữ liệu demo:

- [`actual-classes.png`](kan50-refinement/screenshots/actual-classes.png): chỉ có Class ID 2 — **Class 9 - Intensive Physics**, Grade 9, ThS. Huỳnh Khánh Duy, **1,400,000 VND**; và Class ID 3 — **Class 8 - English Foundation**, Grade 8, ThS. Hoàng Quốc Việt, **1,800,000 VND**. Cả hai giữ **Contact for details**, không tạo buổi học mới.
- [`actual-teacher-cards.png`](kan50-refinement/screenshots/actual-teacher-cards.png): giữ nguyên tên, role, môn được phân công và lời giới thiệu của ba hồ sơ. ThS. Hoàng Quốc Việt: English; ThS. Huỳnh Khánh Duy và Âu Dương Tài: Physics, English. Hai Teacher và một Teaching Assistant. Avatar vẫn dùng initials chuyên nghiệp; không gán ảnh người khác hoặc DiceBear.
- [`actual-readonly-db-1440.png`](kan50-refinement/screenshots/actual-readonly-db-1440.png): 4 môn Mathematics / Physics / Chemistry / English và hotline **1900 6868**.
- [`first_script.sql`](../Capstone2/db/first_script.sql) và [`DbSeeder.cs`](../Capstone2/backend/Models/EF/DbSeeder.cs) chỉ được đọc để đối chiếu ID, tên, học phí, specialty và center settings. Snapshot được ưu tiên hơn trạng thái seed: **không thêm Class 1 Advanced Mathematics** và không đổi giáo viên English về fallback trống của seed. Specialty giữ Mathematics / Physics / Teaching Assistant từ source, không thêm bằng cấp hoặc thành tích.
- Center name/address/academic year giữ giá trị có trong source; address không được thêm vào giao diện vì trước đó UI không hiển thị trường này. Email chưa được xác minh nên để trống, không render `mailto:` giả. Hotline tiếp tục render `tel:19006868`. Không thêm social links.

## Luồng dữ liệu sau sửa

`LandingPage` đọc `subjects`, `teachers`, `contactInfo` từ constants. `LandingPageLayout` không gọi `useLandingOverview` và không truyền API context. `useLandingClasses` chỉ giữ trang local, lọc theo Subject ID rồi lấy 3 lớp/trang; đổi môn hoặc về All Subjects reset trang về 1.

Loại khỏi luồng mounted Landing:

- `GET /api/landing/overview` (overview hook không còn được import).
- `GET /api/landing/classes` (hook danh sách đã chuyển sang local).
- Loading skeleton, error/retry và request lại khi lọc/tải thêm.

Giữ nguyên `landingApi.ts`, `landingDAL.ts`, hook overview cũ chưa được sử dụng và backend endpoints; không refactor ngoài phạm vi. Student Login vẫn mở `WorkspaceChooser` và giữ link `/student/dashboard`; không thay đổi auth hoặc tạo form tư vấn giả.

Dữ liệu thật chỉ có 4 môn / 2 lớp nên Show More và Load More không xuất hiện theo ngưỡng hiện có (8 môn / 3 lớp). Logic và tương tác vẫn được kiểm thử bằng bundle harness riêng trong `tests/landing.static-harness.tsx`: 9 môn, 7 lớp tổng cộng, Show More/Less, tải 3 → 6 → 7, ẩn nút cuối trang và reset pagination khi lọc. Các record tổng hợp này **chỉ tồn tại trong test bundle**, không có trong production entry hoặc dữ liệu public.

## Kiểm thử

Không khởi động backend, không kết nối database, không chạy migration/seeding. Browser QA phục vụ production `dist` trên static HTTP server; mọi `/api/*` đều trả 503 nếu bị gọi, không proxy backend. Chrome Network ghi nhận **0 request `/api/*`**, kể cả lọc, tải thêm và test harness; không có browser exception. CDN fonts được bỏ qua trong QA và Bootstrap dùng bản local để ảnh chụp ổn định.

| Kiểm tra | Kết quả |
| --- | --- |
| Lint | Exit 0; còn warnings có sẵn ở module khác, không có warning Landing |
| Typecheck | Đạt; production build cũng chạy `tsc -b` |
| Production build | Đạt; còn cảnh báo bundle lớn hơn 500 kB |
| Landing tests | **13/13 đạt**, gồm snapshot integrity, filter local, pagination cumulative, empty state và các kiểm tra DAL/presentation cũ |
| Toàn bộ frontend tests | **176/180 đạt**; 4 lỗi trong `notificationInbox.test.mjs`, không sửa Notifications |
| Browser 1440 / 1280 / 768 / 390 / 360px | Đạt; đầy đủ sections, không overflow, grid 3 / 3 / 2 / 1 / 1 cột |
| Tương tác | Đạt: mọi môn + All Subjects, empty state, ba profile modal/Escape/focus return, FAQ mouse/keyboard/260ms/reduced motion, WorkspaceChooser, CTA và Back to Top mouse/keyboard |
| Statistics + Class CTA | Đạt ở 5 viewport: nhãn thứ ba một dòng từ 1200px; nền normal `#078444`, hover/focus `#067647`, active `#05643C`, chữ/icon trắng, transition 200ms |
| `git diff --check` | Đạt |

Bốn lỗi toàn bộ test suite đều thuộc Notifications: unread expiry, filter/top-five/refill, reload/server timestamp và shared expiry timer. File test và implementation Notifications không thay đổi trong vòng này.

Bằng chứng: [Browser results](kan50-static/browser-results.json), [Statistics/hover computed styles](kan50-static/hover/browser-results.json), [logs kiểm tra](kan50-static/checks/).

## Ảnh chụp

- Full page: [1440px desktop](kan50-static/screenshots/static-1440-full.png), [1280px](kan50-static/screenshots/static-1280-full.png), [768px](kan50-static/screenshots/static-768-full.png), [390px mobile](kan50-static/screenshots/static-390-full.png), [360px](kan50-static/screenshots/static-360-full.png).
- Class CTA: [Normal](kan50-static/hover/screenshots/button-1440-normal.png), [Hover](kan50-static/hover/screenshots/button-1440-hover.png), [Keyboard focus](kan50-static/hover/screenshots/button-1440-focus.png).

## File thay đổi/thêm

- `Capstone2/frontend/src/GUIs/components/landing/landingStaticData.ts` — data, types và hàm filter/pagination local.
- Cùng thư mục: `landingContent.ts`, `AboutSection.tsx`, `EnrollmentSection.tsx`, `FaqSection.tsx`, `HeroSection.tsx` — đọc nội dung constants.
- Cùng thư mục: `FeaturesSection.tsx`, `TrainersSection.tsx`, `ContactSection.tsx` — bỏ API status/retry props và trạng thái chờ.
- Cùng thư mục: `CoursesSection.tsx`, `useLandingClasses.ts` — danh sách local, giữ filters, cards, empty state, Load More.
- `Capstone2/frontend/src/GUIs/layouts/landing/Landing-page-layout.tsx` — bỏ overview API dependency.
- `Capstone2/frontend/src/GUIs/layouts/landing/LandingFooter.tsx` — footer links từ constants.
- `Capstone2/frontend/src/GUIs/pages/landing/Landing-page.tsx` — đọc static data.
- `Capstone2/frontend/tests/landing-static.test.mjs`, `landing.static-harness.tsx`, `landing.browser.mjs` — unit/browser QA; browser script mặc định kiểm thử static Landing, mode fixture API lịch sử chuyển sang `--legacy-api-fixtures`.
- Báo cáo này và `docs/kan50-static/` — ảnh/bằng chứng/logs/git status.

Không thay đổi CSS, backend, database, auth, Notifications, Tuition, Schedule hoặc Approval Requests.

Chạy lại từ `Capstone2/frontend`:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
node --test tests/landing*.test.mjs
$env:LANDING_QA_OUTPUT='../../docs/kan50-static/screenshots'
node tests/landing.browser.mjs --static
$env:LANDING_QA_OUTPUT='../../docs/kan50-static/hover/screenshots'
$env:LANDING_QA_BASELINE='0'
node tests/landing.browser.mjs --statistics-hover
git diff --check
```

[Git status cuối cùng](kan50-static/checks/git-status.txt). Không stage, commit, push, merge hoặc tạo PR. Dừng để người dùng nghiệm thu.
