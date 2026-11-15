# KAN-50 — Kết quả UI/UX Refinement & Dynamic Data

Ngày kiểm tra: 2026-11-15, Asia/Bangkok. Branch `Duy`. Chưa stage, commit, push, merge hoặc tạo PR. Tiếp tục trên các thay đổi chưa commit của vòng redesign trước; không reset hoặc ghi đè các thay đổi ngoài phạm vi.

## Kết quả triển khai

Teacher Cards theo mẫu D là thay đổi UI chính: ảnh lớn trên nền mint, tên rõ, badge `Teacher`/`Teaching Assistant`, môn học, giới thiệu ngắn và nút `View Profile` hoạt động. Card có padding, bo góc, border/shadow nhẹ, hover nhẹ; ba cột desktop, hai cột tablet, một cột mobile. Tên dài xuống dòng, mô tả preview tối đa hai dòng; modal có nội dung đầy đủ hơn. Không dùng ảnh mẫu đính kèm hoặc chân dung AI làm ảnh giáo viên thật.

Giữ Modern Academy và cấu trúc các section đã chốt. Tăng typography theo cấp độ: Hero desktop 52px, section heading 36px, card title 20–22px, body 16px, description 15–16px, metadata/badge 13–14px. Các breakpoint giảm có chọn lọc để không tràn nội dung. CSS mới vẫn nằm trong Landing scope; document class được gỡ khi rời landing.

Nguồn khoảng trắng dư trước đây là padding trên/dưới 88px của hai section liên tiếp, tạo khoảng cách khoảng 176px. Điều chỉnh padding section và riêng Teachers/Enrollment; không dùng margin âm để che lỗi. Browser đo khoảng cách từ teacher grid đến heading Enrollment: 64px ở 1440px, 68px ở 768px, 56px ở 390/360px.

Back to Top hình tròn xanh xuất hiện sau khi cuộn hơn 600px. Nút hỗ trợ chuột, Enter, focus visible, aria-label English, reduced motion; listener scroll/resize được cleanup. Vị trí nâng lên khi góc mặc định trùng CTA/control; nếu không có vị trí phù hợp thì tạm ẩn. Không thêm animation loop hoặc dependency UI mới.

## Giáo viên, avatar và View Profile

Đã kiểm tra source `User.AvatarUrl`, seeder, service landing và database thật. Kết quả: ba giáo viên/TA trong database đều có URL DiceBear, không có ảnh chân dung thật khác để kiểm chứng.

`teacherImageUrl` chỉ xử lý presentation: chặn DiceBear/avataaars, các nguồn avatar mặc định đã biết, emoji/robohash và ảnh stock trainer mặc định của repo. URL ảnh hợp lệ khác tiếp tục được dùng; thiếu URL/URL không phù hợp/ảnh lỗi chuyển sang initials trên nền mint. Không thay đổi bất kỳ AvatarUrl trong DB.

Môn học của giáo viên được bổ sung từ các phân công TeacherClass/TaClass active và lớp active, trả về subjectId/code/name thật. `specialty` gốc giữ nguyên. Card dùng mô tả English thực có nếu là câu giới thiệu; nếu chỉ có tên môn/chức danh hoặc không đủ dữ liệu, dùng câu trung tính đúng vai trò. Modal hiển thị thêm specialty nếu có bản trình bày an toàn. Không suy diễn bằng cấp, chứng chỉ, số năm dạy hoặc thành tích.

Các route profile tìm được đều là trang nội bộ của workspace; không có public teacher profile route phù hợp. Vì vậy `View Profile` mở native dialog chỉ gồm ảnh/placeholder, tên, chức danh, môn và specialty/giới thiệu công khai, kèm `Ask About Classes` dẫn tới Contact. Modal có focus containment, đóng bằng close/Escape, trả focus về nút đã mở. Không hiển thị email/số điện thoại cá nhân; response teacher contact vẫn trống.

Lưu ý dữ liệu development: môn được phân công có thể khác specialty lưu trong hồ sơ. UI không tự sửa hoặc “đồng bộ” lại dữ liệu đó; modal phân biệt Subject và Specialty.

## Classes, Schedule và Subjects động

Thêm endpoint **GET** `/api/landing/classes?subjectId={id}&page={n}&pageSize={size}` trực tiếp trong module Landing. Chỉ đọc bằng `AsNoTracking`; không dùng endpoint quản trị chứa dữ liệu không cần công khai.

- Validate subjectId dương, page 1–10000, pageSize 1–12 ở controller và service. Response gồm `items`, `page`, `pageSize`, `totalCount`, `hasMore`. Frontend tải ba lớp/trang; API lọc subject trước khi Skip/Take, sắp xếp classId ổn định.
- Overview giữ preview ba lớp cho tương thích; danh sách UI sử dụng endpoint phân trang riêng, không lọc trên sáu bản ghi của overview. Không giới hạn Subject nào chỉ vì môn không nằm trong preview.
- `Load More Classes` tải trang tiếp theo, không lặp ID. Khi trang sau lỗi, giữ các kết quả đã xác nhận và cho retry; không thay bằng mock. Khi đổi Subject, hủy request cũ và reset trang. Đã test phản hồi cũ về chậm không ghi đè bộ lọc mới.
- Programs hiển thị tám môn ban đầu, `Show More` mở toàn bộ; không mất môn thứ 9 trở đi. Grid desktop bốn cột, tablet hai, mobile một/hai theo chiều rộng. Mọi card chọn đúng subjectId thật.
- Có hơn sáu môn thì bộ lọc lớp chuyển sang dropdown; danh sách options động từ API. Mã môn có mapping dùng tên English xác định. Môn chưa map dùng tên English từ nguồn nếu có; nếu không, dùng `Subject CODE` hoặc `Subject ID` với icon trung tính, không biến mất hoặc đổi dữ liệu gốc.
- Class Card gồm Subject, tên lớp, Grade từ quan hệ `Grade` nếu có nhãn hợp lệ, Teacher thật, Schedule, Tuition và `Ask About This Class`. Không tự thêm `/month`, không gắn nhãn đang tuyển sinh chỉ từ `active`.

Đã đọc schema/service Schedule hiện tại: `class_sessions` là buổi thực tế, `class_schedule_versions` có khoảng `[effective_from, effective_to)`, nhận diện buổi gốc qua PlannedOccurrenceDate. Không sửa các file nghiệp vụ Schedule.

Lịch trên landing là **tối đa hai buổi đã công bố sắp tới trong 60 ngày**, kèm ngày cụ thể và giờ Vietnam (UTC+7), không được trình bày như lịch tuần cố định vô thời hạn. Chỉ lấy session `scheduled`, sau thời điểm hiện tại, trong ngày bắt đầu/kết thúc lớp, giờ hợp lệ. Buổi có version phải có version được tham chiếu và PlannedOccurrenceDate thuộc hiệu lực version đó. Bỏ session đã qua, cancelled, version không khớp hiệu lực hoặc dữ liệu không đủ. Buổi đổi lịch giữ ngày/giờ thực tế của session; không gộp các phiên bản thành `Mon & Wed` giả. Buổi riêng lẻ không có version dùng lịch thực tế đã lưu. Nếu không có thông tin đủ tin cậy: `Schedule: Contact for details`.

Ví dụ fixture thể hiện hai thời điểm khác nhau: `Mon, Nov 16 · 6:00 PM–7:30 PM` và `Thu, Nov 19 · 7:00 PM–8:30 PM`. Đây là dữ liệu kiểm thử, không phải lịch database thật. Giao diện có chú thích rõ phạm vi ngày, múi giờ và khả năng thay đổi.

## Kiểm tra database an toàn

Không chạy `Capstone2/backend/Program.cs`: startup hiện vẫn gọi `DbSeeder.SeedAsync`. Thay vào đó dùng executable QA riêng trong `backend.Tests/Landing`, gọi service trực tiếp.

Trước truy vấn: giới hạn đích ở localhost/127.0.0.1:3306, schema `edutrack_db`; đặt `SET SESSION TRANSACTION READ ONLY`, mở transaction READ ONLY, xác minh `@@transaction_read_only = 1`; EF dùng chính connection/transaction đó. Mỗi lần đọc kết thúc bằng rollback. Không có nhánh nào gọi production startup, seeder, migration hoặc SaveChanges. Chế độ host QA chỉ đăng ký hai route GET Landing, không đăng ký POST.

Kết quả đọc thật: bốn Subjects; ba giáo viên/TA đều DiceBear; hai lớp active (một Physics, một English); không có buổi sắp tới đủ điều kiện hiển thị trên các class cards đã đọc. Vì vậy ảnh dữ liệu thật dùng initials và `Contact for details`. Không thêm dữ liệu để làm đẹp ảnh nghiệm thu. Bản ghi tổng hợp không chứa dữ liệu riêng tư: [database-inspection.json](kan50-refinement/checks/database-inspection.json).

## Kiểm thử

| Kiểm tra | Kết quả |
| --- | --- |
| `npm.cmd run lint` | PASS, exit 0; 211 warnings có sẵn ở file ngoài Landing, không có warning trong Landing/test mới |
| `npm.cmd run typecheck` | PASS |
| `node --test tests/landing.test.mjs` | 11/11 PASS |
| `npm.cmd test` | 174/178 PASS; bốn lỗi Notifications có sẵn, xem bên dưới |
| `npm.cmd run build` | PASS; bundle chung của ứng dụng vẫn có cảnh báo >500kB |
| Backend build `dotnet build .../EduTrack.API.csproj --no-restore` | PASS |
| `dotnet run --no-build --project Capstone2/backend.Tests/Landing/Landing.Tests.csproj` | 18/18 kiểm tra PASS, mặc định không dùng DB |
| Backend read-only integration inspection | PASS với database development thật, không chạy startup/seeder |
| `node tests/landing.browser.mjs` | PASS: 1440, 768, 390, 360px; fixture + dữ liệu thật qua host READ ONLY |
| `git diff --check` | PASS |

Browser acceptance bao gồm: ảnh tải thành công, ảnh lỗi, thiếu avatar, DiceBear, tên dài, profile modal/focus, 12 Subjects, Show More/Less, dropdown, đúng subjectId ngoài overview preview, Subject rỗng, bảy lớp cùng môn qua ba trang, lỗi trang sau/retry giữ kết quả, stale request, missing/present schedule, hai giờ theo ngày khác nhau, mouse/keyboard Back to Top, reduced motion, CTA/anchors/Student Login và không tràn ngang. Các kiểm tra backend bổ sung lịch hết hiệu lực, biên exclusive effectiveTo, cancelled, past time, thiếu version, giờ sai, phạm vi ngày lớp, loại trùng và validation endpoint.

Ảnh nhánh photo success dùng một bản ghi QA có tên `Photo Rendering Test`, không phải giáo viên thật. Ảnh test không được lưu vào hồ sơ DB hoặc danh sách sản phẩm. Fixture chỉ tồn tại trong tiến trình test.

Logs: [lint](kan50-refinement/checks/lint.txt), [typecheck](kan50-refinement/checks/typecheck.txt), [frontend tests](kan50-refinement/checks/frontend-tests.txt), [backend tests](kan50-refinement/checks/backend-tests.txt), [backend build](kan50-refinement/checks/backend-build.txt), [browser results](kan50-refinement/browser-results.json).

### Bốn lỗi Notifications có sẵn

Không phát sinh lỗi mới trong Landing. Vẫn đúng bốn test lỗi của vòng trước trong `tests/notificationInbox.test.mjs`:

1. `unread never expires; read hides at exactly ReadAt + five minutes and remains in Inbox`.
2. `filter full eligible set before top five, tie-break ID, and refill with older unread`.
3. `reload/reopen/restore use original server timestamp; read legacy NULL is never invented`.
4. `shared timer expires without network, unread refills, cleanup stops timer`.

Nguyên nhân: các assertions kỳ vọng read notifications còn trong quick list trong grace period năm phút; implementation hiện có `quickNotifications` lọc `!isRead` ngay từ đầu. Test đầu mong `[2,1]`, implementation trả `[1]`; timer case mong hai items, nhận một. Đã xác nhận Git diff trống cho policy/store/test Notifications và toàn bộ `Services/Schedule`, Entities, Migrations. Không sửa implementation hoặc nới test ngoài phạm vi.

## Ảnh nghiệm thu

Các ảnh sau đều chụp từ Chrome của production build. Phân biệt rõ ảnh dữ liệu thật và fixture.

| Kích thước | Database thật, qua host READ ONLY | Fixture 12 môn và lịch minh họa |
| --- | --- | --- |
| 1440px | [Desktop thật](kan50-refinement/screenshots/actual-readonly-db-1440.png) | [Desktop fixture](kan50-refinement/screenshots/fixture-1440-full.png) |
| 768px | [Tablet thật](kan50-refinement/screenshots/actual-readonly-db-768.png) | [Tablet fixture](kan50-refinement/screenshots/fixture-768-full.png) |
| 390px | [Mobile thật](kan50-refinement/screenshots/actual-readonly-db-390.png) | [Mobile fixture](kan50-refinement/screenshots/fixture-390-full.png) |
| 360px | [Mobile thật](kan50-refinement/screenshots/actual-readonly-db-360.png) | [Mobile fixture](kan50-refinement/screenshots/fixture-360-full.png) |

- [Teacher Cards mới — dữ liệu thật](kan50-refinement/screenshots/actual-teacher-cards.png).
- [Teacher Cards — ảnh hợp lệ, DiceBear, ảnh lỗi, tên dài](kan50-refinement/screenshots/fixture-1440-teachers.png).
- [Teacher Cards — thiếu avatar](kan50-refinement/screenshots/fixture-missing-avatars.png).
- [Public profile modal](kan50-refinement/screenshots/fixture-profile-modal.png).
- [Featured Classes có Schedule — fixture](kan50-refinement/screenshots/fixture-1440-classes.png).
- [Featured Classes thật — Schedule chưa đủ dữ liệu](kan50-refinement/screenshots/actual-classes.png).
- Các ảnh từng section, loading/empty/error và WorkspaceChooser cũng nằm trong [screenshots](kan50-refinement/screenshots/).

## File sửa/thêm trong vòng refinement

Danh sách này là phần thay đổi thêm so với vòng redesign trước. Git status cuối cùng bao gồm cả các file chưa commit từ vòng trước, không có nghĩa toàn bộ được sửa mới trong vòng này.

| File | Thay đổi |
| --- | --- |
| `Capstone2/backend/Controllers/Queries/LandingPortalController.cs` | GET public classes, validation và cancellation |
| `Capstone2/backend/Models/DTOs/Landing/LandingOverviewDto.cs` | Page DTO, grade, upcoming sessions và teacher subjects |
| `Capstone2/backend/Services/Interfaces/ILandingPortalService.cs` | Contract truy vấn lớp có phân trang |
| `Capstone2/backend/Services/Implementation/LandingPortalService.cs` | Lọc/phân trang trước query, chỉ đọc session thật, subject assignments |
| `Capstone2/backend/Services/Implementation/LandingSchedulePresentation.cs` (mới) | Presentation lịch ngày/giờ và kiểm tra hiệu lực |
| `Capstone2/backend.Tests/Landing/Landing.Tests.csproj` (mới) | Executable QA/test, dùng dependency đã có trong repo |
| `Capstone2/backend.Tests/Landing/Program.cs` (mới) | 18 checks, inspection/host READ ONLY tùy chọn, không seeder |
| `Capstone2/frontend/src/BLL/models/LandingOverviewDto.ts` | Contracts frontend tương ứng DTO |
| `Capstone2/frontend/src/api/landingApi.ts` | API classes và response validation |
| `Capstone2/frontend/src/DAL/landingDAL.ts` | Expose read-only classes query |
| `Capstone2/frontend/src/GUIs/components/landing/TrainersSection.tsx` | Teacher Card D, photo policy, neutral copy, profile modal |
| `Capstone2/frontend/src/GUIs/components/landing/CoursesSection.tsx` | Server filter, pagination, schedule, grade, CTA |
| `Capstone2/frontend/src/GUIs/components/landing/FeaturesSection.tsx` | Programs động và Show More/Less |
| `Capstone2/frontend/src/GUIs/components/landing/landingContent.ts` | Unknown subject labels, grade/schedule formatting, avatar policy |
| `Capstone2/frontend/src/GUIs/components/landing/useLandingClasses.ts` (mới) | Filter/page lifecycle, cancellation, retry, giữ dữ liệu trang trước |
| `Capstone2/frontend/src/GUIs/components/landing/BackToTop.tsx` (mới) | Floating button và cleanup |
| `Capstone2/frontend/src/GUIs/components/landing/LandingUI.tsx` | Icon up/star |
| `Capstone2/frontend/src/GUIs/pages/landing/Landing-page.tsx` | Đấu nối danh sách lớp độc lập |
| `Capstone2/frontend/src/GUIs/layouts/landing/Landing-page-layout.tsx` | Gắn Back to Top |
| `Capstone2/frontend/src/assets/css/landing.css` | Typography/spacing/teacher cards và responsive scope Landing |
| `Capstone2/frontend/tests/landing.test.mjs` | Mở rộng thành 11 tests |
| `Capstone2/frontend/tests/landing.browser.mjs` | Acceptance fixture + read-only DB, screenshot capture |
| `docs/EDUTRACK_KAN50_REFINEMENT_RESULT.md` (mới) | Báo cáo vòng này |
| `docs/EDUTRACK_KAN50_LANDING_REDESIGN_RESULT.md` | Link đến báo cáo mới; giữ nội dung vòng cũ như lịch sử |
| `docs/kan50-refinement/` (mới) | 24 screenshots, checks, database summary và browser results |

Không tạo/thay ảnh minh họa hoặc dependency frontend mới trong vòng này. Statistics giữ nguyên đúng ba số liệu demo đã chốt và disclosure. Authentication/WorkspaceChooser giữ cơ chế demo.

## Giới hạn còn lại và chạy lại QA

- Database hiện chưa có chân dung thật để nghiệm thu bằng hồ sơ thật. Nhánh image success/error đã kiểm tra bằng fixture; bản thật dùng placeholder đúng quy tắc.
- Database hiện không có upcoming sessions phù hợp trên hai lớp active đã kiểm tra. Nhánh lịch có dữ liệu và đổi phiên bản được kiểm thử riêng; không seed lịch để tạo ảnh.
- Landing công bố các session đã lưu, không tự materialize tuần mới hoặc suy diễn recurring schedule. Lớp chỉ có recurring configuration nhưng chưa có session sắp tới sẽ dùng Contact for details. Điều này tránh quảng cáo một lịch cố định sai.
- Không thêm public profile route, booking backend hoặc authentication. Consultation tiếp tục dùng Contact/tel/mail có thật trong settings.
- Giữ cảnh báo bundle chung >500kB và các lint warnings ngoài phạm vi.

Kiểm tra offline, không DB:

```powershell
dotnet run --project Capstone2/backend.Tests/Landing/Landing.Tests.csproj -p:NuGetAudit=false
```

Inspection/host tùy chọn cho development đã kiểm tra:

```powershell
dotnet run --no-build --project Capstone2/backend.Tests/Landing/Landing.Tests.csproj -- --inspect-development <repo-root>
dotnet run --no-build --project Capstone2/backend.Tests/Landing/Landing.Tests.csproj -- --serve-readonly <repo-root>
```

Trong `Capstone2/frontend`: `npm.cmd run build`, sau đó `node tests/landing.browser.mjs` khi host READ ONLY đang chạy. Script tự phục vụ production dist và fixture ở cổng tạm; cuối cùng relay hai GET tới host READ ONLY để chụp dữ liệu thật. Không có request ghi database. Host QA là công cụ kiểm thử local, không phải thay đổi cách chạy backend production.

Git status chi tiết tại thời điểm kết thúc: [git-status.txt](kan50-refinement/checks/git-status.txt). Không có staged changes. Chờ người dùng nghiệm thu trước mọi Git workflow.
