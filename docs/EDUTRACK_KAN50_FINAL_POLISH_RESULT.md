# KAN-50 — Final UI Polish

Ngày kiểm tra: 2026-11-15, branch `Duy`. Tiếp tục trên toàn bộ thay đổi KAN-50 chưa commit. Không thay đổi backend, schema, migration, seeding, auth hoặc Notifications; vòng này không đọc/ghi database.

## Những phần đã polish

- Bỏ toàn bộ eyebrow phía trên section headings: Why Choose EduTrack, Find Your Direction, Make Room for Your Potential, People Behind the Progress, Your Next Chapter Starts Here, A Little Clarity Goes a Long Way. Giữ main headings, nội dung chính và CTA.
- Bỏ `A little guidance. A world of possibility.`, `Learning together · Illustrative image`, `Illustrative figures for the demo center` và disclaimer dài dưới class cards. Bỏ prefix trang trí ở Contact, Footer, Teacher Profile và WorkspaceChooser. Giữ thông báo demo access trong chooser vì có ích cho luồng sử dụng.
- Ba statistics vẫn là **số liệu demo được duyệt**, không phải số đếm database: `1,230+ Students`, `64+ Classes`, `24+ Teachers & Teaching Assistants`. Disclosure được giữ trong cấu hình/comment và báo cáo, theo feedback mới; không còn note hiển thị trên giao diện chính. Hero vẫn là ảnh minh họa. Schedule vẫn là tối đa hai buổi đã công bố trong 60 ngày, giờ Vietnam UTC+7; không thay đổi cách lấy dữ liệu hoặc suy diễn enrollment/billing period.
- Badge Teacher/Teaching Assistant dùng `inline-flex`, `flex-wrap: nowrap`, `white-space: nowrap`, font 13px, gap 7px và padding 6px/12px. Kiểm tra không tràn ở cả bốn viewport; giữ style D và luồng View Profile.
- FAQ dùng button chuẩn với `aria-expanded`, `aria-controls` và answer region có nhãn. CSS grid co giãn theo chiều cao nội dung, opacity và dịch nhẹ 3px trong **260ms**; icon cộng chuyển thành trừ. Nội dung đóng có `inert`/`aria-hidden`; hỗ trợ chuột, Enter/Space, focus và reduced motion. Không dùng timer hoặc animation loop.
- Step 01/02/03 chuyển thành chip mint có border, chữ xanh đậm `#066536`, font 15–16px, weight 750. Desktop giữ số phía trên icon; mobile đặt chip cạnh icon trong grid. Mũi tên lớn/rõ hơn, bố cục vẫn thoáng.

Dynamic Subjects, phân trang lớp, schedule/contact fallback, typography, spacing tổng thể và Back to Top được giữ nguyên và đã kiểm tra hồi quy bằng browser.

## File sửa trong vòng này

Trong `Capstone2/frontend/src/GUIs/components/landing/`:

- `LandingUI.tsx`, `AboutSection.tsx`, `FeaturesSection.tsx`, `CoursesSection.tsx`, `TrainersSection.tsx`, `EnrollmentSection.tsx`: bỏ eyebrow props; Courses bỏ disclaimer; Trainers bỏ prefix modal.
- `HeroSection.tsx`, `CountsSection.tsx`: bỏ note, giữ comment minh bạch dữ liệu demo/minh họa.
- `ContactSection.tsx`, `WorkspaceChooser.tsx`: bỏ prefix trang trí, giữ chức năng.
- `FaqSection.tsx`: accordion có transition và accessibility.

Các file khác:

- `Capstone2/frontend/src/GUIs/layouts/landing/LandingFooter.tsx`: bỏ eyebrow trang trí.
- `Capstone2/frontend/src/assets/css/landing.css`: badge, FAQ, step indicators và responsive scoped trong Landing.
- `Capstone2/frontend/tests/landing.browser.mjs`: kiểm tra UI polish; thêm `--fixtures-only` và biến `LANDING_QA_OUTPUT` để QA không cần backend và không ghi đè ảnh vòng trước.
- `docs/EDUTRACK_KAN50_FINAL_POLISH_RESULT.md`, `docs/kan50-polish/`: báo cáo, logs, browser results và ảnh chụp mới.

## Kết quả kiểm thử

| Kiểm tra | Kết quả |
| --- | --- |
| Lint | PASS, exit 0; không có warning ở các file Landing/test đã chỉnh; warnings ngoài phạm vi giữ nguyên |
| Typecheck | PASS |
| Frontend tests | **174/178 PASS**; đúng bốn lỗi Notifications có sẵn |
| Production build | PASS; cảnh báo bundle chung >500kB giữ nguyên |
| Browser 1440/768/390/360px | PASS: badge một dòng, step chips, không overflow, microcopy đã bỏ |
| FAQ | PASS: chuột mở, Enter đóng, Space mở; đo opacity trung gian khi mở/đóng, chiều cao đóng bằng 0; reduced motion tắt transition |
| Hồi quy | PASS: View Profile/focus, Student Login, CTA, 12 Subjects, phân trang bảy lớp, error/retry/stale request, Back to Top |
| Spacing Teachers → Enrollment | Giữ 64px / 68px / 56px / 56px theo bốn viewport |
| `git diff --check` | PASS |

Bốn lỗi Notifications vẫn do test kỳ vọng read notifications còn trong grace period, còn `quickNotifications` hiện chỉ lọc unread. Không thay đổi policy/store/test Notifications và không sửa lỗi ngoài phạm vi. [Log frontend tests](kan50-polish/checks/frontend-tests.txt).

Các logs khác: [lint](kan50-polish/checks/lint.txt), [typecheck](kan50-polish/checks/typecheck.txt), [build](kan50-polish/checks/build.txt), [browser results](kan50-polish/browser-results.json).

## Ảnh chụp nghiệm thu

Ảnh chụp Chrome từ production build với **API fixture kiểm thử**, không phải dữ liệu giáo viên/lớp thật trong database.

- [Teacher Cards mới](kan50-polish/screenshots/fixture-1440-teachers.png).
- [FAQ đang mở — desktop](kan50-polish/screenshots/fixture-1440-faq-open.png) · [mobile](kan50-polish/screenshots/fixture-390-faq-open.png).
- [Get Started — chip 01/02/03](kan50-polish/screenshots/fixture-1440-enrollment.png).
- Full page: [1440px](kan50-polish/screenshots/fixture-1440-full.png) · [768px](kan50-polish/screenshots/fixture-768-full.png) · [390px](kan50-polish/screenshots/fixture-390-full.png) · [360px](kan50-polish/screenshots/fixture-360-full.png).

Chạy lại sau production build, trong `Capstone2/frontend`:

```powershell
$env:LANDING_QA_OUTPUT='../../docs/kan50-polish/screenshots'
node tests/landing.browser.mjs --fixtures-only
```

[Git status cuối cùng](kan50-polish/checks/git-status.txt) bao gồm thay đổi chưa commit của các vòng KAN-50 trước. **Không có staged changes; không commit, push, merge hoặc PR.**
