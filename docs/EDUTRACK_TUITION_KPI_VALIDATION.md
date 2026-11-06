# EduTrack — Đối chiếu KPI học phí (06/11/2026)

## Phạm vi và phiên bản

Đã kiểm tra nhánh `Duy`, commit gốc `a2226571d0c432d9c08a9a2f2cadf2093b0c98b7`
(`Center Manager, Admin Staff - Standardize VND display and one-month tuition deadlines`).
HEAD local trùng HEAD nhánh `Duy` trên GitHub lúc bắt đầu công việc.

Thay đổi chỉ phục vụ KPI học phí của Center Manager/Admin Staff và dữ liệu dùng để đối chiếu KPI.
Không thay schema, deadline một tháng, chính sách nhận thanh toán, phụ phí, Authentication/Authorization hay Export.
`Capstone2/backend.Tests/` vẫn bị loại trừ bằng `.git/info/exclude`, chỉ dùng kiểm thử local.

## Công thức và phạm vi

Với mỗi hóa đơn `i`:

- `due(i) = amountDue` (đã bao gồm phụ phí được Backend ghi nhận, không cộng thêm lần nữa).
- `paid(i) = tổng payment.amount có invoiceId = i.invoiceId`.
- `remaining(i) = max(0, due(i) - paid(i))`.
- Quá hạn khi `remaining(i) > 0`, ngày Việt Nam hiện tại **sau** ngày `dueDate`, và trạng thái không phải `pending_adjustment`.
- Cờ `paid` trên hóa đơn không thay thế lịch sử Payments; giao dịch trả dư của một hóa đơn không bù công nợ hóa đơn khác.

| Trang / KPI | Công thức | Phạm vi |
| --- | --- | --- |
| Center Manager Dashboard / Tuition Collected | Tổng `payment.amount` theo tháng Việt Nam của `paidAt` | Tháng hiện tại; gồm cả trả nợ hóa đơn cũ |
| Center Manager Dashboard / Outstanding Tuition và ô công nợ trong Tuition Overview | Tổng `remaining(i)` | Tất cả kỳ hóa đơn, công nợ hiện tại |
| Center Manager Dashboard / Overdue (footer) | Tổng `remaining(i)` của hóa đơn quá hạn | Tập con của công nợ, không cộng lần hai |
| Center Manager Dashboard / Tuition Overview, Đã thu | Cùng tiền thực thu tháng của Dashboard | Tháng hiện tại, không dùng tổng lũy kế |
| Admin Staff Dashboard / Công Nợ Học Phí | Tổng `remaining(i)` | Tất cả kỳ hóa đơn |
| Admin Staff Dashboard / Khoản Học Phí Cần Thu | Đếm hóa đơn `remaining(i) > 0` | Tất cả kỳ; đếm hóa đơn, không đếm học viên duy nhất |
| Cả hai Tuition Management và cả hai Reports / Total Tuition Due | Tổng `due(i)` | Nhóm hóa đơn theo bộ lọc hiện tại, tất cả kỳ |
| Bốn trang trên / Collected | Tổng Payment của nhóm hóa đơn đang lọc, chỉ lấy `paidAt` thuộc tháng hiện tại theo giờ Việt Nam | Tháng hiện tại; vẫn gồm giao dịch trả nợ kỳ trước |
| Bốn trang trên / Outstanding | Tổng `remaining(i)` của đúng nhóm trên | Công nợ hiện tại của nhóm hóa đơn |
| Cả hai Tuition Management và cả hai Reports / Overdue Amount | Tổng số dư của hóa đơn quá hạn thuộc nhóm trên | Tập con của Outstanding |
| Dòng nhỏ trong card Overdue | Đếm hóa đơn quá hạn còn nợ thuộc nhóm trên | Số hóa đơn, không phải số học viên |
| Logic tỷ lệ đã thu và còn lại (không hiển thị trên card) | `round(100 × Σpaid(i) / TotalDue)` và `round(100 × Outstanding / TotalDue)` | Tỷ lệ dùng tổng đã trả mọi thời điểm của cùng nhóm hóa đơn, không lấy tiền thu riêng tháng chia tổng phải thu mọi kỳ; mẫu bằng 0 trả null |

Dashboard bỏ footer tỷ lệ thu vốn trộn thời điểm thanh toán với kỳ hóa đơn; thay bằng nhãn `Tháng M/YYYY`.
Card Tuition Collected giữ số tiền hiện tại; footer chỉ ghi `Tháng M/YYYY`, không có khoảng ngày hoặc icon.
Tiêu đề và chú thích dùng cùng font, cỡ chữ, độ đậm, màu và khoảng cách với KPI bên cạnh.
Card công nợ dùng nhãn gọn `Outstanding Tuition` và `Overdue`;
phạm vi vẫn là toàn bộ công nợ, không thay đổi công thức.
Bốn trang Tuition Management/Reports dùng `TuitionOverview` để tái sử dụng bốn `KpiCard` có sẵn,
giữ bóng, góc bo, icon có nền màu và bố cục độc lập ban đầu. Không thêm khung bao hoặc tiêu đề Tuition Overview.
Tên KPI thống nhất tiếng Anh; số tiền đầy đủ, chỉ đưa VND xuống dòng qua tùy chọn `currencyUnitOnNewLine`.
Phạm vi `Tất cả kỳ học phí` nằm ở footer Total Tuition Due và Outstanding (thêm `Đang lọc` khi có bộ lọc).
Theo lựa chọn đã chốt, Collected tính tiền thu **tháng hiện tại** và có footer `Tháng M/YYYY` tự cập nhật.
Công nợ vẫn trừ toàn bộ Payments ở mọi thời điểm; không lấy Total Due trừ Collected tháng để suy ra Outstanding.
Bỏ footer phần trăm và câu giải thích lặp lại; card Overdue giữ số hóa đơn tại footer.
Admin Staff Tuition hiện cả số tiền quá hạn lẫn số hóa đơn, thay vì chỉ hiện số hóa đơn như trước.
Desktop bốn cột, tablet hai cột, mobile một cột.
Hiện bốn trang **chưa có bộ lọc tháng/năm hóa đơn**; Total Due/Outstanding vẫn là tất cả kỳ hóa đơn,
còn Collected giới hạn theo tháng thanh toán.
Bộ lọc lớp dùng ID và tên lớp thực từ API. KPI tính trên toàn bộ kết quả lọc trước phân trang.
Bộ lọc “Partially Paid” đã có được tính theo `0 < paid(i) < due(i)`; đây là đối chiếu dữ liệu, không mở chính sách nhận thanh toán một phần.

## Trạng thái tải và lỗi

| Tình huống | Total Due | Collected / Outstanding / Overdue tại Tuition/Reports | Thực thu tháng tại Dashboard CM |
| --- | --- | --- | --- |
| Hai API thành công, không có bản ghi | `0 VND` | `0 VND` / số hóa đơn 0 | `0 VND` |
| Payments đang tải hoặc lỗi | Hiện nếu hóa đơn đã tải; riêng lọc “Partially Paid” cần Payments nên `—` | `—`, thông báo lỗi nếu request thất bại | `—` |
| Hóa đơn đang tải hoặc lỗi, Payments thành công | `—` | `—` | Vẫn hiện tiền thực thu tháng |
| Một `paidAt` không hợp lệ | Không ảnh hưởng tổng hóa đơn | Số dư vẫn tính từ giao dịch | `—` và thông báo không xác định được ngày thu |

Số học viên/lớp không bị phụ thuộc Payments. Admin Staff Dashboard công bố từng phần ngay khi tải xong,
không chờ toàn bộ API. Thông tin cá nhân vẫn tuân theo luồng danh tính hiện có.

## Múi giờ

Các luồng ghi Payment hiện có trong `ManagementTuitionService` và `LearnerDashboardService` dùng `DateTime.UtcNow`.
MySQL `DATETIME` không lưu `DateTime.Kind`; DTO Payment đọc ra và DTO sau ghi thanh toán được gắn UTC để JSON có hậu tố `Z`.
Không đổi giờ lưu, không cập nhật dữ liệu cũ. Frontend cũng hiểu chuỗi ISO cũ thiếu offset theo quy ước UTC của luồng ghi hiện tại.
Tháng thống kê và ngày quá hạn dùng `Asia/Ho_Chi_Minh`, độc lập múi giờ máy người dùng.

## Kiểm thử đã chạy

- `npm.cmd run build`: thành công. Vite vẫn cảnh báo bundle lớn hơn 500 kB.
- 43 bài Node test: tiền tệ, deadline, DAL Dashboard, công thức KPI; không truy cập DB.
- 300 tình huống Chrome headless trên bản build: sáu trang tại desktop 1440×1000, tablet 768×1024,
  mobile 390×844 và kiểm tra thêm 320×812 với số tiền 10.010.899.999 VND.
  Kiểm tra số tiền chính xác, không tràn/cắt/đè icon; 0, thanh toán một phần, nhiều lần, trả nợ cũ,
  quá hạn, chờ điều chỉnh, ranh giới tháng, Payments 503, hóa đơn 503, tải chậm từng API,
  bộ lọc cùng nhóm hóa đơn, Collected theo tháng, nhãn thời gian, ngày thu không hợp lệ,
  không còn footer phần trăm và bố cục 4/2/1 cột.
  Trình duyệt đặt `America/Los_Angeles`; KPI vẫn dùng tháng Việt Nam.
- Backend build ra thư mục tạm với `UseAppHost=false`: thành công, ba cảnh báo CS8601 đã có tại
  `TeachingRequestService.cs:167`, `LearnerDashboardService.cs:1307` và `LearnerDashboardService.cs:1561`.
- 18 kiểm tra deadline Backend local: đạt. Không thay đổi hoặc đưa `backend.Tests` vào Git.

Chạy lại từ `Capstone2/frontend`:

```powershell
npm.cmd run build
node --test tests/adminStaffDashboard.test.mjs tests/adminStaffDashboardDAL.test.mjs tests/formatCurrency.test.mjs tests/tuitionPolicy.test.mjs tests/tuitionMetrics.test.mjs
node tests/tuitionKpi.browser.mjs
```

Browser test dùng Chrome tại đường dẫn mặc định Windows, có thể đặt `$env:CHROME_PATH` nếu máy dùng đường dẫn khác.
Test tự phục vụ `dist` trên cổng loopback ngẫu nhiên, chặn mọi API bằng fixture, chỉ cho GET, không gọi Backend/MySQL.
Kết quả JSON và ảnh được ghi vào thư mục tạm `edutrack-tuition-kpi-*` được in cuối lệnh.

Backend build tránh file exe của Backend đang chạy, thực hiện từ gốc repo:

```powershell
$kpiBuildOutput = Join-Path $env:TEMP 'EduTrack-TuitionKpi-Build'
dotnet build Capstone2/backend/EduTrack.API.csproj --no-restore -p:UseAppHost=false --output $kpiBuildOutput
dotnet run --project Capstone2/backend.Tests/TuitionPolicy.Tests.csproj -p:UseAppHost=false
```

## Đối chiếu với Backend và MySQL thật

Các kiểm tra tự động trên **không chứng minh dữ liệu MySQL hiện tại đã chính xác**. Quy trình thủ công:

1. Khởi động MySQL và Backend theo cấu hình máy bạn. Profile HTTP hiện tại nghe cổng 5036:
   `dotnet run --project Capstone2/backend/EduTrack.API.csproj --launch-profile http`.
   Trong terminal khác, vào `Capstone2/frontend` và chạy `npm.cmd run dev`.
   Vite hiện proxy `/api` tới `http://localhost:5036`; nếu đã có Backend chạy, dùng phiên đó.
2. Trong Network hoặc Swagger, kiểm tra GET `/api/tuitioninvoices` và `/api/payments` trả 200,
   `amountDue`, `invoiceId`, `periodMonth/year`, `dueDate`, `amount`, `paidAt` có dữ liệu đúng.
   Sau khi dùng Backend mới, `paidAt` phải có `Z` (hoặc offset rõ ràng).
3. Giữ bộ lọc “All” khi đối chiếu sáu trang. Dashboard hai vai trò phải có cùng công nợ.
   Tuition/Reports hai vai trò phải có cùng Total Due, Collected và Outstanding.
   Collected tại CM Dashboard và Tuition/Reports đều theo tháng thanh toán Việt Nam;
   nếu Payments gắn với hóa đơn hợp lệ và chưa lọc, các giá trị phải khớp.
   Khi lọc lớp/trạng thái/từ khóa, Collected tại Tuition/Reports chỉ lấy giao dịch tháng hiện tại của nhóm hóa đơn đó.
4. Chọn cùng một lớp hoặc cùng từ khóa tại Tuition/Reports, kiểm tra số tiền và số hóa đơn quá hạn thay đổi theo nhóm lọc,
   không chỉ theo trang phân trang. Nhóm rỗng phải hiện `0 VND` và 0 hóa đơn. Các card không còn hiện tỷ lệ.
5. Dùng Request blocking trong DevTools chặn riêng `*/api/payments*`, tải lại trang.
   Tiền thực thu/công nợ/quá hạn phải `—`, không tự hiện 0 hóa đơn quá hạn; Total Due và số học viên vẫn hiện nếu API tương ứng thành công.
   Bỏ chặn và tải lại để khôi phục. Thử tương tự với `*/api/tuitioninvoices*`: CM Dashboard vẫn có thể hiện thực thu tháng.
6. Trong cơ sở dữ liệu **kiểm thử**, dùng các giao dịch đã có để đối chiếu ca một phần/nhiều lần.
   Không sửa validation Backend hoặc ghi thêm dữ liệu trực tiếp vào MySQL sản xuất chỉ để chạy test.
   Deadline: 06/12 vẫn chưa quá hạn; sang 07/12 theo giờ Việt Nam mới quá hạn nếu còn nợ.

SQL dưới đây chỉ đọc dữ liệu và đặt biến phiên; tên bảng Payment trong source là **`payment`**, không phải `payments`.
Truy vấn tiền tháng áp dụng khi `paid_at` tuân theo UTC như luồng ghi hiện tại:

```sql
SET @today_vn = DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+07:00'));
SET @month_start_vn = CAST(DATE_FORMAT(@today_vn, '%Y-%m-01') AS DATETIME);
SET @month_start_utc = CONVERT_TZ(@month_start_vn, '+07:00', '+00:00');
SET @next_month_utc = CONVERT_TZ(DATE_ADD(@month_start_vn, INTERVAL 1 MONTH), '+07:00', '+00:00');

SELECT COALESCE(SUM(amount), 0) AS dashboard_collected_this_month
FROM payment
WHERE paid_at >= @month_start_utc AND paid_at < @next_month_utc;

-- Chi tiết để thấy giao dịch thanh toán kỳ trước trong tháng hiện tại.
SELECT p.payment_id, p.invoice_id, i.period_month, i.period_year,
       p.amount, p.paid_at AS paid_at_utc,
       CONVERT_TZ(p.paid_at, '+00:00', '+07:00') AS paid_at_vn
FROM payment p
JOIN tuition_invoices i ON i.invoice_id = p.invoice_id
ORDER BY p.paid_at DESC;
```

Đối chiếu công nợ bằng cách tổng hợp Payment **trước** khi JOIN để không nhân đôi tiền hóa đơn:

```sql
-- NULL = tất cả. Chỉ đổi sang ID/kỳ thật khi cần kiểm tra nhóm tương ứng.
SET @class_id = NULL;
SET @period_month = NULL;
SET @period_year = NULL;

WITH paid AS (
  SELECT invoice_id, SUM(amount) AS paid_amount,
         SUM(CASE WHEN paid_at >= @month_start_utc AND paid_at < @next_month_utc
             THEN amount ELSE 0 END) AS paid_this_month
  FROM payment GROUP BY invoice_id
), balances AS (
  SELECT i.*, COALESCE(p.paid_amount, 0) AS paid_amount,
         COALESCE(p.paid_this_month, 0) AS paid_this_month,
         GREATEST(0, i.amount_due - COALESCE(p.paid_amount, 0)) AS remaining
  FROM tuition_invoices i
  LEFT JOIN paid p ON p.invoice_id = i.invoice_id
  WHERE (@class_id IS NULL OR i.class_id = @class_id)
    AND (@period_month IS NULL OR i.period_month = @period_month)
    AND (@period_year IS NULL OR i.period_year = @period_year)
)
SELECT COALESCE(SUM(amount_due), 0) AS total_due,
       COALESCE(SUM(paid_amount), 0) AS collected_for_invoice_cohort,
       COALESCE(SUM(paid_this_month), 0) AS collected_this_month_for_invoice_cohort,
       COALESCE(SUM(remaining), 0) AS outstanding,
       COALESCE(SUM(remaining > 0), 0) AS unpaid_invoice_count,
       COALESCE(SUM(CASE WHEN remaining > 0 AND DATE(due_date) < @today_vn
         AND LOWER(TRIM(status)) <> 'pending_adjustment' THEN remaining ELSE 0 END), 0) AS overdue_amount,
       COALESCE(SUM(remaining > 0 AND DATE(due_date) < @today_vn
         AND LOWER(TRIM(status)) <> 'pending_adjustment'), 0) AS overdue_invoice_count,
       ROUND(100 * SUM(paid_amount) / NULLIF(SUM(amount_due), 0)) AS collected_percent
FROM balances;
```

## Điểm chưa thể xác minh

- Seeder dùng `new DateTime(...)` không khai báo múi giờ; dữ liệu nhập tay hoặc lịch sử có thể không tuân UTC.
  Cần chủ dữ liệu xác nhận nguồn giờ trước khi kết luận số liệu ở sát ranh giới tháng. Không tự đổi dữ liệu cũ.
- Chưa đối chiếu với Backend/MySQL thật đang chạy trên máy bạn; các kiểm tra trình duyệt dùng fixture được nêu rõ ở trên.
- Chưa có quyết định chính thức về chấp nhận thanh toán một phần, hoàn tiền hoặc hủy/đảo giao dịch.
  KPI hiện tổng hợp các bản ghi Payment thực tế theo cấu trúc hiện có, không tự suy diễn một chính sách mới.
- Các trang đang đọc toàn bộ API, chưa có bộ lọc kỳ hóa đơn trên UI hay API snapshot nguyên tử.
  Nếu dữ liệu thay đổi giữa hai GET hóa đơn/Payments, tải lại để đối chiếu tại cùng thời điểm.
- Luồng đăng nhập/quyền hiện có chưa được sửa. Mục cá nhân Admin Staff có thể vẫn yêu cầu danh tính giáo vụ hợp lệ;
  điều đó độc lập với tính toán KPI học phí.

## File thay đổi

| File | Nội dung |
| --- | --- |
| `Capstone2/frontend/src/BLL/services/tuitionMetricsService.ts` (mới) | Công thức chung, số dư từng hóa đơn, thực thu tháng Việt Nam, phạm vi và bộ lọc |
| `Capstone2/frontend/src/BLL/services/tuitionPolicyService.ts` | Xuất khóa tháng Việt Nam; kiểm tra quá hạn theo số dư thực và ngoại lệ hiện có |
| `Capstone2/frontend/src/BLL/services/adminStaffDashboardService.ts` | Dashboard Admin Staff gọi lại công thức chung |
| `Capstone2/frontend/src/DAL/adminStaffDashboardDAL.ts` | Công bố từng phần tải xong, tránh Payments giữ các KPI khác ở trạng thái chờ |
| `Capstone2/frontend/src/GUIs/hooks/useTuitionData.ts` (mới) | Tách lỗi/tải hóa đơn và Payments, tái dùng ở các trang |
| `Capstone2/frontend/src/GUIs/components/Common/KpiCard.tsx` | Dùng cùng kiểu chữ giữa các KPI; tùy chọn ẩn icon và đưa VND xuống dòng |
| `Capstone2/frontend/src/GUIs/components/Common/TuitionOverview.tsx` (mới) | Tái sử dụng bốn KpiCard cũ, VND xuống dòng, footer phạm vi và số hóa đơn quá hạn; không thêm khung bao |
| `Capstone2/frontend/src/GUIs/pages/admin/CenterManager/CenterManagerDashboardPage.tsx` | Thực thu tháng, công nợ mọi kỳ, footer rõ phạm vi, tải độc lập; bỏ tra người quản lý bằng ID cố định |
| `Capstone2/frontend/src/GUIs/pages/admin/CenterManager/CenterManagerTuition.tsx` | KPI từ công thức chung, cùng nhóm lọc, bỏ suy đoán đã thu từ cờ paid, đọc lại sau thao tác thành công |
| `Capstone2/frontend/src/GUIs/pages/admin/CenterManager/CenterManagerReportPage.tsx` | Đọc Payments, cùng công thức/nhóm lọc, kỳ thật từ hóa đơn |
| `Capstone2/frontend/src/GUIs/pages/admin/AdminStaff/AdminStaffDashboardPage.tsx` | Hiện dữ liệu từng phần, nhãn tổng công nợ mọi kỳ |
| `Capstone2/frontend/src/GUIs/pages/admin/AdminStaff/AdminStaffTuitionPage.tsx` | Bỏ tính theo cờ paid/unpaid; công nợ gồm số dư quá hạn và thanh toán nhiều lần |
| `Capstone2/frontend/src/GUIs/pages/admin/AdminStaff/AdminStaffReportPage.tsx` | Đọc Payments, cùng công thức/nhóm lọc, kỳ thật từ hóa đơn |
| `Capstone2/backend/Services/Implementation/PaymentService.cs` | DTO đọc `paidAt` khai báo UTC rõ ràng |
| `Capstone2/backend/Services/Management/Implementation/ManagementTuitionService.cs` | DTO sau thanh toán khai báo UTC rõ ràng; không sửa nhận tiền/phụ phí |
| `Capstone2/frontend/tests/tuitionMetrics.test.mjs` (mới) | 13 ca công thức, phạm vi, giao dịch, tháng thu và ranh giới tháng |
| `Capstone2/frontend/tests/tuitionKpi.browser.mjs` (mới) | Kiểm tra 6 trang, lỗi/tải từng API, bộ lọc, responsive, không ghi dữ liệu |
| `Capstone2/frontend/tests/adminStaffDashboardDAL.test.mjs` | Thêm ca Payments chậm nhưng số học viên đã tải vẫn xuất hiện |
| `Capstone2/frontend/tests/tuitionPolicy.test.mjs` | Đối chiếu số dư thực thay cờ paid và ngoại lệ chờ điều chỉnh |
| `docs/EDUTRACK_TUITION_KPI_VALIDATION.md` (mới) | Công thức, phạm vi, kết quả kiểm thử và hướng dẫn đối chiếu SQL |
