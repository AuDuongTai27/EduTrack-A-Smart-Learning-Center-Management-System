# KAN-50 — Landing Page Redesign

> Báo cáo vòng redesign ban đầu. Kết quả mới nhất về Teacher Cards, lịch học, phân trang, 10+ Subjects và typography: [KAN-50 Refinement Result](EDUTRACK_KAN50_REFINEMENT_RESULT.md).

Ngày nghiệm thu kỹ thuật: 2026-11-15 (Asia/Bangkok). Branch: `Duy`.

Đã triển khai giao diện Modern Academy cho trung tâm học tập, với nội dung public tiếng Anh. Git sạch trước khi sửa. Không stage, commit, push, merge hoặc tạo PR.

## Tài liệu và phạm vi

Đã đọc `C:/Users/RescueAdmin/Downloads/EDUTRACK_LANDING_CODEX_PROMPT.md` làm đặc tả chi tiết cho yêu cầu của người dùng và xem `01-full-page-reference.png` làm tham chiếu hình ảnh. Không tìm thấy file có tên chính xác `CODEX_PROMPT_VI.md`, ảnh `02-hero-style-reference.png` hoặc bộ assets rời trong tài liệu được cung cấp. Các dữ liệu minh họa trong ảnh không được đưa vào sản phẩm như dữ liệu thật.

Đã đọc source landing cũ, toàn bộ components/layout, API, DAL, DTO frontend/backend, service/controller landing, landing routes, WorkspaceChooser và student routes trước khi triển khai. Các thay đổi backend giới hạn trong service/DTO trực tiếp phục vụ landing. Không thay đổi schema, migration, database hoặc modules Notifications, Schedule, Tuition, Approval Requests, Authentication/Authorization.

## Giao diện và dữ liệu

Thứ tự: Navbar → Hero → Statistics → Why Choose EduTrack → Programs → Featured Classes → Teachers → Enrollment Steps → FAQ → Contact CTA → Footer.

- Hero, navigation và nội dung tĩnh render độc lập với API. Container tối đa 1220px; xanh lá/trắng/mint; ảnh Hero minh họa; section spacing, card bo tròn, focus visible, reduced motion và hamburger menu.
- Dùng một lần tải `GET /api/landing/overview` chung ở layout cho subjects, classes, teachers và centerInfo. Có cancellation khi unmount/retry, timeout 12 giây, kiểm tra response, skeleton, empty state, error state và retry. Không fallback sang dữ liệu nghiệp vụ mẫu.
- Ba số liệu demo tập trung trong `landingContent.ts`: `1,230+ Students`, `64+ Classes`, `24+ Teachers & Teaching Assistants`; kèm nhãn `Illustrative figures for the demo center`. Bỏ các chỉ số likes/satisfaction/thành tích và fallback số đếm giả trong backend.
- Môn học từ API được map theo subjectCode sang tiếng Anh. Tên lớp tiếng Anh được giữ lại. Tên tiếng Việt không thể dịch chắc chắn được hiển thị bằng môn + ID lớp thật, ví dụ `Mathematics · Class 41`; không tự thêm grade hay curriculum. Tên giáo viên giữ nguyên. Chuyên môn tiếng Anh được giữ lại; chuyên môn tiếng Việt có môn học nhận diện được sẽ hiển thị tên môn tiếng Anh; phần còn lại được lược bỏ thay vì bịa bản dịch.
- Preview tối đa ba lớp; lọc môn hoạt động trên danh sách API trả về. Backend vẫn giới hạn tối đa sáu lớp active như trước. `active` không được diễn giải thành đang tuyển sinh. Học phí lấy nguyên từ API, định dạng `en-US` + `VND`, không thêm `/month`. Không hiển thị lịch vì DTO hiện chưa cung cấp lịch.
- Giáo viên lấy từ API, avatar từ bản ghi người dùng; URL thiếu/không hợp lệ/ảnh lỗi dùng initials. Backend không còn chèn ảnh stock hoặc tên giáo viên giả; response public không trả email/số điện thoại cá nhân giáo viên.
- Contact chỉ dùng email/phone hợp lệ từ center settings qua API. Backend không còn fallback địa chỉ/email/hotline mẫu. Không xuất địa chỉ chưa có bản tiếng Anh. Nếu thiếu contact thì có thông báo trung tính; nếu API lỗi thì có retry.
- Đã bỏ newsletter UI cũ và loại bỏ DAL báo thành công giả. Không tạo backend tư vấn mới hoặc gửi booking giả.

## CTA và routes

| CTA | Đích và hành vi |
| --- | --- |
| Logo, Home, Back to top | `#hero` |
| About Us / Programs / Classes / Teachers / Contact | `#about` / `#programs` / `#classes` / `#teachers` / `#contact` |
| Explore Classes | `#classes` |
| Program card | Chọn subjectId thật và cuộn tới `#classes` |
| Student Login | WorkspaceChooser hiện có, chuyển giao diện sang tiếng Anh; native dialog có focus containment, Escape và khôi phục focus |
| Student Portal trong chooser | `/student/dashboard` hiện có, không thêm auth/JWT |
| Các workspace khác | Giữ `/parent/dashboard`, `/teacher/dashboard`, `/teaching-assistant/dashboard`, `/admin-staff/dashboard`, `/center-manager/dashboard` |
| Book a Consultation ở Navbar/Hero | `#contact` |
| Book a Consultation trong banner | `#contact-details` |
| Contact Us / Ask About More Classes | `#contact`; không có route danh mục lớp public phù hợp nên không dẫn vào trang quản trị hoặc lớp cá nhân |
| Phone / email | `tel:` / `mailto:` sau kiểm tra định dạng |
| FAQ link | `#faq`; accordion dùng native `details/summary` |

No-Auth demo mode được giữ nguyên và chooser có chú thích `Demo access: sign-in is not enabled`. Các trang portal bên trong giữ nguyên nội dung hiện tại; phạm vi English áp dụng cho public landing và chooser.

## Kiểm thử

| Kiểm tra | Kết quả |
| --- | --- |
| `npm.cmd run lint` | Exit 0; 211 warnings ở các file ngoài landing, không có warning mới trong landing hoặc tests mới |
| `npm.cmd run typecheck` | PASS |
| `node --test tests/landing.test.mjs` | 7/7 PASS |
| `npm.cmd test` | 170/174 PASS; 4 FAIL trong `tests/notificationInbox.test.mjs` có sẵn |
| `npm.cmd run build` | PASS; cảnh báo bundle JS chung của ứng dụng lớn hơn 500kB |
| `dotnet build Capstone2/backend/EduTrack.API.csproj --no-restore` | PASS, 0 errors; 3 nullable warnings ngoài landing |
| `node tests/landing.browser.mjs` | PASS trên production build bằng Chrome headless, không cài thêm dependency |
| `git diff --check` | PASS |

Bốn lỗi Notifications: `unread never expires…`, `filter full eligible set…`, `reload/reopen/restore…`, `shared timer expires…`. Test kỳ vọng thông báo đã đọc còn xuất hiện trong khoảng grace 5 phút, trong khi implementation hiện có `quickNotifications` chỉ lấy unread. Những file này không thay đổi trong KAN-50. Không sửa hoặc nới test ngoài phạm vi.

Browser QA kiểm tra 1440/768/390/360px, không tràn ngang, lớp lần lượt 3/2/1/1 cột, ba statistics, English document language, tất cả anchor có target, phone/email đúng đích, subject filters, filtered empty state, FAQ, chooser route và đóng bằng Escape. Kiểm tra API trả danh sách rỗng, HTTP 503, retry thành công bằng một lần fetch chung, API chậm rồi timeout thành error; không có card mock khi empty/error/loading. Fixture chỉ nằm trong script test, không được import vào sản phẩm.

Log lint/typecheck/unit: [checks](kan50/checks/). Kết quả browser: [browser-results.json](kan50/browser-results.json).

## Ảnh chụp giao diện thực tế

Đây là ảnh chụp Chrome của code đã triển khai, không phải ảnh mockup thiết kế.

| Production preview thực tế, backend không hoạt động | Giao diện với API fixture chỉ trong kiểm thử |
| --- | --- |
| [1440px](kan50/screenshots/actual-local-api-unavailable-1440.png) | [1440px](kan50/screenshots/fixture-1440-full.png) |
| [768px](kan50/screenshots/actual-local-api-unavailable-768.png) | [768px](kan50/screenshots/fixture-768-full.png) |
| [390px](kan50/screenshots/actual-local-api-unavailable-390.png) | [390px](kan50/screenshots/fixture-390-full.png) |
| [360px](kan50/screenshots/actual-local-api-unavailable-360.png) | [360px](kan50/screenshots/fixture-360-full.png) |

Ảnh fixture có tên `Nguyễn Test`, class ID 91–94, học phí và contact `example.test` chỉ để kiểm tra rendering; đây không phải dữ liệu database thật và không tồn tại trong UI production khi API lỗi.

Ảnh từng section ở desktop: [Hero](kan50/screenshots/fixture-1440-hero.png), [Why Choose](kan50/screenshots/fixture-1440-about.png), [Programs](kan50/screenshots/fixture-1440-programs.png), [Classes](kan50/screenshots/fixture-1440-classes.png), [Teachers](kan50/screenshots/fixture-1440-teachers.png), [Enrollment](kan50/screenshots/fixture-1440-enrollment.png), [FAQ](kan50/screenshots/fixture-1440-faq.png), [Contact](kan50/screenshots/fixture-1440-contact.png).

Các trạng thái: [Loading](kan50/screenshots/loading-1440-full.png), [Empty](kan50/screenshots/empty-1440-full.png), [Error](kan50/screenshots/error-1440-full.png), [WorkspaceChooser 390px](kan50/screenshots/fixture-390-workspace.png).

## File đã sửa/thêm

Đường dẫn dưới đây tính từ root repository.

| File | Thay đổi |
| --- | --- |
| `Capstone2/backend/Services/Implementation/LandingPortalService.cs` | Loại bỏ fallback dữ liệu giả, giữ số đếm thật, role English, avatar thật, bỏ teacher contact public |
| `Capstone2/backend/Models/DTOs/Landing/LandingOverviewDto.cs` | Loại bỏ defaults contact/image/likes giả |
| `Capstone2/frontend/src/api/landingApi.ts` | Timeout, abort, response validation, lỗi English |
| `Capstone2/frontend/src/DAL/landingDAL.ts` | Loại bỏ mock và thành công giả |
| `Capstone2/frontend/src/GUIs/pages/landing/Landing-page.tsx` | Composition đầy đủ theo thứ tự yêu cầu, bộ lọc môn |
| `Capstone2/frontend/src/GUIs/layouts/landing/Landing-page-layout.tsx` | Shared API state, English metadata/language có cleanup, CSS scope mới |
| `Capstone2/frontend/src/GUIs/layouts/landing/LandingHeader.tsx` | Sticky Navbar, active anchors, hamburger, login và consultation |
| `Capstone2/frontend/src/GUIs/layouts/landing/LandingFooter.tsx` | Footer English, liên kết hoạt động, bỏ mock/newsletter cũ |
| `Capstone2/frontend/src/GUIs/components/landing/HeroSection.tsx` | Hero mới, responsive image và fallback |
| `Capstone2/frontend/src/GUIs/components/landing/CountsSection.tsx` | Ba statistics và disclosure demo |
| `Capstone2/frontend/src/GUIs/components/landing/AboutSection.tsx` | Why Choose EduTrack |
| `Capstone2/frontend/src/GUIs/components/landing/FeaturesSection.tsx` | Programs từ API |
| `Capstone2/frontend/src/GUIs/components/landing/CoursesSection.tsx` | Featured classes từ API, filter, tuition, contact |
| `Capstone2/frontend/src/GUIs/components/landing/TrainersSection.tsx` | Teacher cards thật, initials fallback, presentation English |
| `Capstone2/frontend/src/GUIs/components/landing/WorkspaceChooser.tsx` | Tái sử dụng routes, English, native accessible dialog |
| `Capstone2/frontend/src/GUIs/components/landing/landingContent.ts` (mới) | Statistics tập trung, navigation, subject/name presentation và URL/contact helpers |
| `Capstone2/frontend/src/GUIs/components/landing/LandingUI.tsx` (mới) | SVG icons, section heading, skeleton/empty/error state |
| `Capstone2/frontend/src/GUIs/components/landing/useLandingOverview.ts` (mới) | Shared lifecycle dữ liệu API và retry |
| `Capstone2/frontend/src/GUIs/components/landing/SubjectVisual.tsx` (mới) | Minh họa theo subjectCode, lazy loading, fallback icon |
| `Capstone2/frontend/src/GUIs/components/landing/EnrollmentSection.tsx` (mới) | Ba bước tư vấn/đăng ký |
| `Capstone2/frontend/src/GUIs/components/landing/FaqSection.tsx` (mới) | FAQ keyboard accessible |
| `Capstone2/frontend/src/GUIs/components/landing/ContactSection.tsx` (mới) | Consultation CTA và contact thật |
| `Capstone2/frontend/src/assets/css/landing.css` (mới) | CSS scoped, responsive, reduced motion |
| `Capstone2/frontend/public/assets/landing/hero.webp` (mới) | Hero desktop, khoảng 107KB |
| `Capstone2/frontend/public/assets/landing/hero-mobile.webp` (mới) | Hero mobile, khoảng 50KB |
| `Capstone2/frontend/public/assets/landing/mathematics.webp` (mới) | Minh họa môn Math, khoảng 12KB |
| `Capstone2/frontend/public/assets/landing/physics.webp` (mới) | Minh họa môn Physics, khoảng 13KB |
| `Capstone2/frontend/public/assets/landing/english.webp` (mới) | Minh họa môn English, khoảng 12KB |
| `Capstone2/frontend/tests/landing.test.mjs` (mới) | 7 test DAL/API/presentation |
| `Capstone2/frontend/tests/landing.browser.mjs` (mới) | Database-free browser QA và screenshot capture |
| `docs/EDUTRACK_KAN50_LANDING_REDESIGN_RESULT.md` (mới) | Báo cáo này |
| `docs/kan50/ASSETS.md` (mới) | Nguồn ảnh và prompts |
| `docs/kan50/browser-results.json` (mới) | Browser assertions |
| `docs/kan50/checks/*.txt` (mới) | Log lint, typecheck, frontend tests |
| `docs/kan50/screenshots/*.png` (mới) | 20 ảnh chụp thực tế/fixture/states/sections |

## Giới hạn và cách xem lại

1. Backend `localhost:5036` chưa chạy, nên chưa xác minh GET landing thành công với database thật hoặc contact settings thật. Không khởi động backend vì `Program.cs` hiện tự gọi `DbSeeder.SeedAsync` khi khởi động; người dùng đã cấm seeding. Chỉ build backend, không chạy ứng dụng/database.
2. Chưa có endpoint tiếp nhận consultation; CTA dùng contact links. Không tạo booking/form gửi giả. Chưa có public catalogue/detail route phù hợp; dùng contact CTA thay vì liên kết quản trị.
3. Chưa bật Authentication/Authorization trong dự án; Student Login mở chooser và dẫn sang Student Portal hiện có.
4. Danh sách classes là tập active tối đa sáu bản ghi do endpoint hiện tại trả về, không phải danh mục tuyển sinh đầy đủ. Tên/mô tả không dịch chắc chắn được lược bỏ hoặc dùng nhãn môn + ID; DB không đổi.
5. Do thiếu bộ assets rời, bốn ảnh minh họa mới được tạo bằng built-in image generation theo phong cách reference, rồi tối ưu thành WebP. Chemistry/các môn khác dùng icon/gradient trung tính. Không dùng ảnh stock làm giáo viên. Chi tiết ở [ASSETS.md](kan50/ASSETS.md).
6. Bundle ứng dụng chung vẫn lớn và index dùng font/CDN có sẵn. Không thay đổi hệ thống routes hoặc dependency chung ngoài phạm vi landing. Browser QA dùng CSS Bootstrap local thay CDN để kết quả không phụ thuộc mạng.
7. Production build và preview đã được kiểm tra. Dev-server Vite trong phiên QA có lúc trả root rỗng trong Chrome khi chạy cùng các middleware test servers; chưa xác định nguyên nhân. Không tuyên bố dev-mode browser QA đạt. Dùng production preview để nghiệm thu giao diện.

Chạy trong `Capstone2/frontend`:

```powershell
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1
```

Mở `http://127.0.0.1:4173/`. Production sẽ hiển thị error/retry nếu backend chưa có, không chèn fixture. Để chạy lại browser QA, giữ preview ở terminal riêng và chạy `node tests/landing.browser.mjs`; test tự phục vụ fixture ở cổng tạm và chỉ dùng GET. `CHROME_PATH` và `LANDING_PREVIEW_URL` có thể override đường dẫn Chrome/preview URL.
