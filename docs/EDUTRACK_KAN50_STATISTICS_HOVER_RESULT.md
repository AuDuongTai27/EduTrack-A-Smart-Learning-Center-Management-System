# KAN-50 — Statistics Layout & Class Button Hover

Ngày kiểm tra: 2026-11-15. Branch `Duy`. Vòng này chỉ sửa CSS Landing và browser QA liên quan; không thay đổi component, API, backend, database hoặc các module khác.

## Nguyên nhân và cách sửa

**Statistics:** `.et-stat span` bị giới hạn `max-width: 175px`. Đo trước sửa ở 1440/1280px: nhãn thứ ba hai dòng, font 14px, trong khi ô rộng khoảng 394–406px. Đã override cap bằng rule scoped `.et-landing`, dùng grid `minmax(0, 1fr)`, cho text wrapper `min-width: 0` và đặt `white-space: nowrap` từ 1200px. Không giảm font hoặc thay nhãn/số liệu. Tablet/mobile vẫn được wrap tự nhiên.

**Hover:** nền bình thường là gradient với `background-color: transparent`, còn `:hover` đổi sang màu đặc bằng shorthand `background`. Khi transition chạy, gradient biến mất ngay và màu nền nội suy từ trong suốt, khiến nền card trắng lộ ra. Baseline đo sau khoảng 35ms có `background-image: none` và `background-color: rgba(0,109,53,0.263)`. Không ghi nhận Bootstrap/global ghi đè nền sang trắng trong bản kiểm thử; màu cuối transition cũ vẫn là màu xanh của rule Landing.

Đã tách style riêng cho CTA trong Class Card, giữ nền đặc và chữ/icon trắng trong mọi trạng thái:

| Trạng thái | Background computed | Chữ / icon |
| --- | --- | --- |
| Normal | `rgb(7,132,68)` — `#078444` | Trắng |
| Hover / focus-visible | `rgb(6,118,71)` — `#067647` | Trắng |
| Active | `rgb(5,100,60)` — `#05643C` | Trắng |

Transition 200ms cho background-color, border-color, shadow và transform. Hover nâng 1px, active trở về vị trí gốc; giữ radius 9px và focus outline rõ. Tỷ lệ tương phản chữ trắng lần lượt khoảng 4.78:1, 5.69:1 và 7.25:1. Nền trung gian hover đo được `rgb(7,126,69)` hoặc `rgb(7,129,69)`, hoàn toàn đục, không còn pha trong suốt.

CTA hiện là link `<a href="#contact">`, không có trạng thái disabled trong luồng hiện tại; không thêm cơ chế vô hiệu hóa hoặc thay đổi click. Nút Load More và các nút ngoài Class Card không chịu rule mới. Hero/Nav giữ style hiện có.

## Kết quả kiểm tra

| Viewport | Số dòng nhãn thứ ba | Font giữ nguyên | Overflow |
| --- | --- | --- | --- |
| 1440px | 1 | 14px | Không |
| 1280px | 1 | 14px | Không |
| 768px | 2 | 14px | Không |
| 390px | 3 | 11px như trước | Không |
| 360px | 3 | 11px như trước | Không |

- Đủ ba nhãn và ba số liệu giữ nguyên; icon/text nằm trong cell. Desktop label dùng khoảng 191px thay vì bị chặn ở 175px.
- Hover bằng CDP `Input.dispatchMouseEvent`, đo computed styles giữa transition và sau 260ms, ở đủ năm viewport. Chữ/icon trắng, không gradient hoặc alpha trong suốt.
- Keyboard Tab/Shift+Tab tạo `:focus-visible`; Enter và mouse press/release đều dẫn tới `#contact`. Kiểm tra active trong lúc giữ chuột; radius và destination giữ nguyên.
- Lint, typecheck, production build: **PASS**. Lint warnings ngoài Landing và cảnh báo bundle lớn giữ nguyên; không có warning ở test vừa chỉnh.
- Frontend tests: **174/178 PASS**; đúng bốn lỗi Notifications có sẵn về read-notification grace period. Không sửa Notifications.
- `git diff --check`: **PASS**. Browser dùng production build và API fixture kiểm thử, không kết nối DB.

[Computed styles sau sửa](kan50-statistics-hover/browser-results.json) · [Baseline trước sửa](kan50-statistics-hover/baseline/browser-results.json) · [Logs](kan50-statistics-hover/checks/).

## Ảnh chụp sau sửa

- Statistics: [1440px](kan50-statistics-hover/screenshots/statistics-1440.png) · [1280px](kan50-statistics-hover/screenshots/statistics-1280.png) · [768px](kan50-statistics-hover/screenshots/statistics-768.png) · [390px](kan50-statistics-hover/screenshots/statistics-390.png) · [360px](kan50-statistics-hover/screenshots/statistics-360.png).
- CTA desktop: [Normal](kan50-statistics-hover/screenshots/button-1440-normal.png) · [Hover](kan50-statistics-hover/screenshots/button-1440-hover.png) · [Keyboard focus](kan50-statistics-hover/screenshots/button-1440-focus.png). Nút đầu tiên là nút được tương tác/đo.
- CTA mobile: [Normal](kan50-statistics-hover/screenshots/button-390-normal.png) · [Hover](kan50-statistics-hover/screenshots/button-390-hover.png).

## File sửa/thêm

- `Capstone2/frontend/src/assets/css/landing.css`: hai sửa UI, chỉ áp dụng trong `.et-landing`.
- `Capstone2/frontend/tests/landing.browser.mjs`: mode `--statistics-hover` đo baseline/after, native mouse/keyboard và screenshot ở năm viewport.
- `docs/EDUTRACK_KAN50_STATISTICS_HOVER_RESULT.md`, `docs/kan50-statistics-hover/`: báo cáo, ảnh và bằng chứng kiểm thử.

Chạy lại sau build trong `Capstone2/frontend`:

```powershell
$env:LANDING_QA_OUTPUT='../../docs/kan50-statistics-hover/screenshots'
$env:LANDING_QA_BASELINE='0'
node tests/landing.browser.mjs --statistics-hover
```

[Git status cuối cùng](kan50-statistics-hover/checks/git-status.txt) bao gồm các thay đổi chưa commit của những vòng KAN-50 trước. **Không stage, commit, push, merge hoặc tạo PR.** Dừng tại đây để người dùng nghiệm thu.
