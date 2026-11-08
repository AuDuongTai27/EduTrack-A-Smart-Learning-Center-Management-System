# Task 04 — Tuition Management: chính sách học phí tháng cuối cùng

Cập nhật 08/11/2026, Asia/Bangkok. Nhánh `Duy`, nền Task 03 `0541983`. Người dùng đã nghiệm thu và phê duyệt một local commit Task 04; không push/merge/rebase hoặc thao tác database phát triển. Các ghi chú chưa commit ở từng lượt bên dưới là lịch sử trước phê duyệt này.

**Đã khôi phục phát hành Invoice mới thành công theo học phí tháng, qua cả service và API HTTP production trên MySQL test độc lập.** Entire Grade, Entire Class, Individual, Preview/Confirm, Payment, filter và KPI tiếp tục hoạt động. Không còn chặn vì thiếu ClassSession. Ngoại lệ phí thỏa thuận của tháng nhập học giữa kỳ chưa có luồng ghi nhận/kiểm chứng minh bạch trong schema/API hiện tại nên vẫn được tách riêng và báo giới hạn, không gộp vào kỳ sau hoặc coi là miễn phí. Chưa nghiệm thu production Auth/online gateway/unique database constraint.

**UX modal đã được tinh gọn:** cấu hình → xem trước → kết quả; nút tạo chỉ xuất hiện sau Preview, có số lượng cụ thể. Chi tiết nghiệm thu UX và kết quả kiểm thử mới nhất ở mục 11; không đổi nghiệp vụ/API/Backend/database.

**Bản sửa mới nhất về trạng thái và hành động tài chính ở mục 12:** trạng thái do hệ thống tính; không sửa tiền/kỳ/hạn sau khi có Payment; hóa đơn tất toán không mở lại bằng phụ phí. Đã kiểm thử HTTP/MySQL và browser CM/AD, không sửa dữ liệu phát triển hoặc schema. Câu “không đổi Backend” ở mục 11 chỉ mô tả lượt UX trước bản sửa này.

## 1. Quyết định nghiệp vụ có hiệu lực

Quyết định **Final Business Decision: Simplified Monthly Tuition** thay thế hoàn toàn Session-Based Tuition Calculation trước đó.

- Thu cố định theo tháng từ `classes.tuition_fee`; Class khác nhau dùng fee riêng. Không nhân/chia theo buổi hoặc ngày.
- Student có enrollment đủ căn cứ từ đầu kỳ hoặc trước đó được lập hóa đơn cho kỳ đã chọn. Không cần đợi cuối tháng/session completed. Không có job tự phát hành; CM/AD chọn kỳ, Preview rồi Confirm, có thể dùng đầu kỳ thu.
- DueDate theo `tuition_due_day` trong **chính tháng/năm thu**; setting 10 => ngày 10. Ngày 31 chặn cuối tháng theo lịch, gồm năm nhuận. Thiếu setting giữ fallback hiện hành creation day UTC+7 + một tháng lịch; setting sai hoặc Quarterly không bị âm thầm đổi policy.
- Attendance absent/present/late/excused và ClassSession thiếu/cancelled không thay AmountDue hoặc điều kiện Confirm. Hủy buổi/miễn giảm/hoàn phí/đặc biệt do CM xử lý theo quy trình đang có, không tự tạo workflow mới.
- Bulk bỏ qua Student ghi danh giữa tháng trong kỳ nhập học, kèm lý do. Không tự chia tiền, miễn phí hoặc tự gộp khoản đó sang Invoice tháng sau.
- Individual giữ số tiền thủ công hợp lệ theo luồng hiện có nhưng không bỏ qua Student role, Class/StudentClass, kỳ, trạng thái, duplicate hoặc approval guards. Không tự sửa Invoice/Payment cũ.

Timestamp ghi danh/drop UTC đổi UTC+7 trước khi đối chiếu ngày kỳ thu. Ghi danh ngày đầu tháng thuộc đầu kỳ; từ ngày thứ hai trong tháng không tự tính đủ tháng. Các kỳ sau xét enrollment như bình thường. Class bắt đầu/kết thúc giữa kỳ, dropped trong kỳ và legacy thiếu căn cứ vẫn cần xử lý riêng, không tự phát minh proration/refund.

## 2. Architecture audit và Capstone I

Đã đối chiếu báo cáo CSW480 `.docx` trong `docs`, CM-06, CM-09, hình 5 **Academic Structure and Class Enrollment ERD**, hình 8 **Tuition Payment and Approval Management ERD**, thiết kế Tuition/Payment/CenterSettings, `docs/EduTrack_Database_ERD_Visual.md`, source Task 01–03 và `first_script.sql` dưới dạng tài liệu. Không thực thi script khởi tạo.

| Quan hệ/nghiệp vụ | Kết quả |
| --- | --- |
| Grade → Class → StudentEnrollment; mỗi Class một Subject | Giữ nguyên. Không đổi Teacher/TA, Class đa môn hoặc Attendance. |
| `users.grade_id` | Khối phổ thông Student, độc lập lớp học thêm; không dùng để quyết định thu học phí Class. |
| Invoice = Student + Class + Month + Year; Payment → Invoice | Giữ nguyên. Grade chỉ phân loại/filter theo Class, không thêm grade_id vào Invoice hoặc Invoice tổng Grade. |
| CM-06: cấu hình fee/deadline | Dùng fee của Class và setting thật; phù hợp phạm vi monthly đã chốt, không còn yêu cầu kế hoạch/session snapshot. |
| CM-09: điều chỉnh đặc biệt cần approval | Giữ guard pending adjustment và lịch sử. Approved Request không tự biến thành phép tính/đổi tiền Invoice. |
| Schema tiền/bảng | Giữ decimal(12,2), năm short và bảng `payment` hiện có; không rename hoặc đổi kiểu tiền. |

## 3. Phần session-based đã loại bỏ

Đã loại khỏi source `SessionTuitionPolicy.cs`, `SessionPolicyChecks.cs`; bỏ query ClassSchedule/ClassSession, công thức số buổi, session evidence/blocker, điều kiện chờ hết tháng, deadline tháng đầu tự động sang tháng sau và session data trong Preview token. DTO/UI không còn Planned/Billable Sessions, verified/makeup counts, calculation snapshot, Estimated/Needs review hoặc manual-fee lock vì thiếu session.

Không còn đề xuất triển khai Monthly Session Plan, Session Verification hoặc Tuition Calculation Snapshot trong Task 04. Không tạo Entity/DbContext/EF migration tương ứng. Preview dùng version `monthly-fixed-v1`, frontend từ chối backend chính sách session cũ để tránh nhầm phiên bản.

Nguy cơ read path Attendance tự sinh session/enrollment đã được ghi nhận nhưng **không sửa module đồng đội**. Tuition không gọi `TeachingAttendanceService`, `TeachingScheduleService` hoặc Teaching APIs. Việc tính/ghi Invoice không tạo Session, Attendance hoặc StudentClass.

## 4. Ba mode và giao diện CM/AD

Hai route dùng chung `TuitionManagementPage`, giữ bảng/pagination/chi tiết/Payment và layout cơ bản.

| Mode | Hành vi |
| --- | --- |
| Entire Grade | Xét Class thật thuộc Grade; tạo Invoice riêng Student–Class–Period, dùng fee riêng từng Class. Student học nhiều Class có nhiều Invoice. |
| Entire Class | Chỉ xét enrollment thật của Class; không lấy toàn bộ Student trung tâm. |
| Individual | Grade → Class → Student đủ điều kiện; amount mặc định tham khảo fee Class, có thể nhập mức thủ công dương theo nghiệp vụ hiện có. Không có nút +/- số tiền. |

Preview backend hiển thị Grade/Class/kỳ, Class count, Student duy nhất (khác Invoice count), Invoice mới/đã có/không đủ điều kiện, tổng tiền và tổng từng Class, từng Student–Class kèm Monthly Fee, AmountDue, DueDate và lý do. Ineligible count có thể gồm một dòng Class không có enrollment. Legacy nhiều Invoice cùng khóa được cảnh báo, giữ nguyên.

Mở modal/Preview không ghi dữ liệu. Confirm riêng, khóa double-submit khi đang xử lý. Kết quả phân biệt Created / Already exists–Skipped / Ineligible / Failed; không báo tất cả thành công nếu có dòng bị loại. Mất response sau commit yêu cầu Preview lại để đối chiếu các Invoice đã tồn tại. Lỗi 503 không bị biến thành Created=0 thành công giả.

Đổi mode/Grade/Class/kỳ reset Preview/lựa chọn phụ thuộc. Amount thủ công reset về fee tham khảo khi đổi Student/kỳ để tránh giữ ngoại lệ nhầm người. Loading/error/empty/retry vẫn có; lỗi API giữ form để xử lý. Các enrollment bị loại có lý do, kể cả trường hợp nhập học giữa tháng không nằm trong Student dropdown.

## 5. Xử lý phí thỏa thuận tháng nhập học

Ví dụ ghi danh 15/10/2026, thỏa thuận phí tháng 10 là 300.000 VND, thu trong tháng 11:

- Không tạo tự động Invoice tháng 10 từ bulk, không suy mức 300.000 từ fee/Attendance/Session.
- Invoice tháng 11 thông thường chỉ chứa fee **tháng 11**, không tự cộng 300.000. Payment của Invoice tháng 11 không dùng thu quá số dư để bù khoản tháng 10.
- Không đổi Period sang tháng 11 để giả ghi khoản tháng 10; không tạo Invoice trùng khóa tháng 10, Invoice 0 hoặc Invoice full-fee giả chỉ để mở approval; không dùng AdditionalChargeAmount để che khoản nợ khác kỳ.

**Audit hiện trạng:** `TuitionInvoice` có Student/Class/Period/AmountDue/DueDate/Status, không có thỏa thuận/reference/reason. Create DTO nhận amount nhưng deadline do server tính, không có agreement record được kiểm tra. ApprovalRequest có Student/Class/Invoice, Reason/Description/ReviewNotes và reviewer; service tài chính (`tuition_adjustment`, `due_date_extension`, `refund_request`) bắt buộc **Invoice đã có**, reviewer theo role và không tự phê duyệt. Review chỉ lưu quyết định, không tự đổi Invoice. Vì vậy chưa có workflow tài chính trước phát hành để xác minh đồng thời mức phí tháng 10 và hạn thu tháng 11.

Không parse số tiền/ngày từ Description/ReviewNotes thành lệnh tạo Invoice, không dùng request loại `other` để vượt kiểm tra financial approval, không thêm caller boolean “đã duyệt”. Individual manual amount vẫn dùng được cho enrollment/kỳ đủ điều kiện như trước; **không dùng nó để tự bỏ qua tháng nhập học giữa kỳ**. Cả API individual cũ cũng giữ guard này. Hệ thống chưa chứng minh được thỏa thuận chỉ từ việc nhập AmountDue.

**Phương án thủ công trong phạm vi hiện tại:** CM/nhân viên lập và lưu chứng từ thỏa thuận riêng, ghi rõ Student ID, Class ID, kỳ dịch vụ 10/2026, mức 300.000, kỳ/ngày thu trong 11/2026, lý do, người duyệt và mã tham chiếu để đối soát. Khoản chưa được ghi vào Invoice hợp lệ vẫn là khoản cần theo dõi/đối soát riêng, **chưa nằm trong công nợ/KPI của ứng dụng và không được coi đã miễn/đã thu**. Nếu có Invoice hợp lệ từ trước, xử lý qua approval tài chính hiện có; không tự sửa/xóa lịch sử hoặc gỡ pending để vượt guard. Chưa có Invoice thì chưa ghi Payment rời/nhầm kỳ vào ứng dụng.

Để ghi khoản đầu tháng này hoàn toàn trong phần mềm cần một quyết định riêng về chứng từ thỏa thuận trước phát hành và cách xác nhận kỳ/hạn thu; hiện chưa triển khai hoặc tạo schema mới. Đây là giới hạn được giữ rõ, không chặn generation monthly thông thường hoặc tự áp cơ chế tài chính chưa được duyệt.

## 6. Validation, transaction, duplicate và retry

Backend kiểm tra Student tồn tại/có role student, Class thật và đúng Grade chọn, StudentClass đúng cặp, trạng thái active/completed/dropped có ngày phù hợp; unknown/legacy thiếu ngày bị loại. Chỉ xét kỳ có căn cứ trọn kỳ; không tự chuyển/xóa/sửa enrollment. Số tiền dương, độ chính xác/range decimal(12,2); bulk Class fee thiếu/0 bị loại, không Invoice miễn phí. Individual có thể nhập mức hợp lệ riêng cho enrollment đủ điều kiện.

Preview Repeatable Read. Confirm Serializable, khóa Grade rồi Class theo ID, đọc lại toàn bộ dữ liệu/giá/kỳ/setting và Invoice hiện có. Token chứa version monthly, request, Class fee/Grade/ngày/status, enrollment/role và deadline; không chứa Attendance/Session. Thay fee/enrollment/setting sau Preview => 409 trước ghi. Missing/cancelled session không làm token stale hoặc chặn Confirm.

Mọi Invoice mới cùng batch trong một transaction, lỗi rollback toàn bộ phần ghi. Giới hạn 100 Class/2000 enrollment; vượt thì từ chối, không tự chia ghi từng phần. Không tạo Payment. Invoice đã có trả ID/tiền/hạn thật, không overwrite status/Payments hoặc tính lại. Retry/concurrent request qua các writer ứng dụng dùng chung khóa không tạo business key trùng trong ca đã kiểm thử.

PUT Invoice và POST Payment khóa Class, đọc lại công nợ; giữ pending adjustment, chống đổi kỳ trùng/thu quá tiền. Delete User có tài chính bị chặn để không cascade mất Invoice/Payment hoặc danh tính người ghi. Guard xóa Class có tài chính từ trước vẫn giữ.

**Giới hạn:** chưa có unique constraint; chưa bảo đảm trước SQL trực tiếp/seeder/phiên bản cũ không dùng khóa. Baseline audit chỉ đọc từng thấy 0 nhóm trùng, PK và hai index FK nonunique; không chạy audit ghi hoặc DDL development trong lượt này. `Capstone2/db/migrations/TuitionInvoiceBusinessKey.proposal.sql` vẫn chỉ là đề xuất unique StudentId/ClassId/Month/Year, DDL được comment, chưa có EF migration/HasIndex mới.

Nếu sau này được duyệt index: preflight đúng target/history/index/duplicate, full backup riêng tư + hash, restore-test độc lập, maintenance đúng writer, migration riêng đúng index, postflight dữ liệu/history. Có duplicate phải dừng đối soát Invoice/Payment/Approval, không tự xóa/gộp. MySQL DDL implicit commit: không tự retry/Down/DROP/restore đè main khi lỗi; rollback phải được duyệt và bảo toàn dữ liệu.

## 7. Payment, KPI, lịch sử và Auth

Cash mặc định/đầu tiên, giữ Bank/MoMo/VNPay. Non-cash cần TransactionCode và xác nhận đối soát thủ công; không giả callback online. Amount > 0, không vượt dư nợ cộng phụ phí hợp lệ, phụ phí cần lý do/cộng một lần; không dùng phụ phí để gộp học phí khác kỳ. Pending adjustment không bị tự bỏ qua. Mất response khóa submit để đối soát Payments trước retry; chưa có payment idempotency key riêng ở DB.

KPI theo cùng tập Invoice đã lọc trước pagination: Total Due = AmountDue; Paid = Payments hợp lệ; Outstanding/Overdue theo phần còn nợ từng Invoice; Collected theo PaidAt trong tháng UTC+7. Không trừ tiền thu riêng tháng khỏi Due tất cả kỳ; không cộng phụ phí hai lần. Payment API lỗi => chưa xác định, không số 0 giả. BLL tiền dùng đơn vị 1/100 VND, không làm tròn/sửa tiền lịch sử. Filter Grade dùng Grade Class, không Grade hiện tại Student; đổi Grade reset Class không hợp lệ. Không redesign Dashboard/Reports.

Giữ chặn writer demo Parent/Learning từ baseline: GET không tự tạo Invoice, online demo trả 501 không giả Payment thành công, reset trả 409 không xóa Payments. Các thay đổi tối thiểu này bảo vệ dữ liệu Tuition dùng chung, không mở actor/gateway mới.

Auth audit chưa thay đổi: Invoice/Payment/Preview/Confirm thiếu `[Authorize]`/role policy/fallback; RecordedBy từ body chưa phải claims tin cậy. Không sửa Auth hoặc thêm bypass/fake principal production. Test CM/AD chứng minh chức năng, không chứng minh JWT/role/ownership hoặc quyền phê duyệt mức tiền thủ công. Phải phối hợp thành viên Auth trước production; gateway online chưa được xác minh.

## 8. Kết quả kiểm thử hiện tại

Node 24.19.0/npm 11.17.0, SDK 8.0.427; source test copy không `.env`/appsettings thật, không đổi lockfile/runtime dependency. MySQL mới bind 127.0.0.1:33308, datadir `edutrack-enrollment-mysql-*`, schema ngẫu nhiên `edutrack_enrollment_test_*`, dữ liệu tổng hợp. Guard kiểm tra port/datadir trước ghi; API child content root trống, environment test connection, skip seeder. Browser bắt buộc marker Grade test, chặn API ngoài proxy riêng. Không dùng backup development làm fixture.

| Kiểm tra | Kết quả |
| --- | --- |
| Frontend lint / typecheck / production build | Đạt; 0 lint error, 188 warning cũ, bundle >500 kB. |
| Frontend unit/contract | **116 pass**, 0 fail/skip; gồm 6 tests mới cho trạng thái, partial balance và điều kiện Sửa/Thanh toán. |
| API + Tuition harness build | Đạt, 0 error, 3 CS8601 cũ. |
| Tuition policy | **27 assertion**, không DB; bổ sung AmountDue không hợp lệ không được Paid và stored Paid không thay thế khoản thu. |
| Monthly generation policy mặc định | **18 assertion**, không DB; enrollment/legacy/status/money và mốc ngày UTC+7. |
| Tuition MySQL + HTTP | **76 assertion tổng cộng: 18 offline + 58 integration/HTTP/harness**, ngoài kiểm tra status từng HTTP call. Có generation thật, khóa Edit, chống Paid giả, chống phụ phí mở lại Paid, partial/overdue và concurrent Payment. |
| Tuition browser HTTP thật | **6 nhóm CM/AD × desktop/tablet/mobile**; Grade preview, Class/Individual Confirm ghi DB thật, phí thủ công 1.250.000, lý do bỏ qua kỳ nhập học giữa tháng, không gộp phí vào kỳ sau, mất response/retry, Payment và KPI. |
| Task 03 regression MySQL/HTTP/browser | **104 assertion + 6 nhóm browser thật**, Add/Edit/Grade/enrollment/link; kết quả lượt monthly trước UX, không chạy lại trong lượt chỉ sửa modal vì source Student/Backend không đổi. |
| KPI Tuition/Dashboard/Reports CM/AD | **300 browser scenarios fixture**, timezone browser America/Los_Angeles, KPI Việt Nam; không dùng fixture làm bằng chứng ghi Invoice. |
| actionlint / git diff --check | Đạt. CI chạy policy offline mặc định, không MySQL/migration/seeder trên hosted runner. |

Ví dụ đã kiểm tra: Entire Grade kỳ 11/2026 tạo 3 Invoice cho 2 Student ở 2 Class với fee 1.000.000/1.500.000, tổng 3.500.000; Student vào 15/11 bị loại. Individual cho enrollment đủ điều kiện lưu 900.000 dù fee tham khảo 1.000.000. HTTP Grade khác kỳ tạo 4 Invoice. Concurrent service/HTTP giữ mỗi khóa một Invoice; tiêm lỗi INSERT thứ hai xác nhận INSERT đầu cũng rollback. Session cancelled/Attendance absent thêm sau Preview không đổi token/fee hoặc chặn Confirm. Không tự tạo Payment; giữ mọi field enrollment và profile khác Grade.

Payment HTTP kiểm tra Cash/Bank/MoMo, partial/multiple/full, phụ phí/lý do/overpayment và pending adjustment. Retry sau Payment giữ đúng AmountDue, deadline, status và toàn bộ receipts. Browser mô phỏng mất Confirm response sau commit; Preview lại nhận Already exists, không tạo trùng. Payment double-submit/mất response không tự gửi lại.

Bằng chứng local: `%TEMP%/edutrack-task04-fa930f55602a4f71ba8991001298b57c/`, các log `monthly-build`, `monthly-policy`, `monthly-lint`, `monthly-typecheck`, `monthly-tests`, `monthly-frontend-build`, `monthly-integration-final`, `monthly-student-regression`, `monthly-kpi-browser`. `monthly-source-verification.json` đối chiếu SHA-256 của 31 file source/test với bản sao đã test, 5 file Entity/DbContext/migration/snapshot trọng yếu khớp HEAD, tổng Task 04 có 35 file thay đổi/chưa theo dõi và index chưa staged. Browser screenshot/traffic ở thư mục Temp được log chỉ ra, không đưa vào Git. Không giữ assertion/test session cũ như bằng chứng monthly mới. Một lần chạy bị lỗi chuỗi tiếng Việt trong test, đã sửa encoding và chạy lại đạt; không sửa business rule để che lỗi test.

Chạy offline: `dotnet run --project Capstone2/backend.Tests/TuitionIntegration/TuitionIntegration.Tests.csproj`. Full test: runner `Capstone2/backend.Tests/StudentEnrollment/Run-IsolatedMySql.ps1 -TestAssemblyPath <TuitionIntegration.Tests.dll> -DotnetPath <dotnet8.exe> -Http -FrontendRoot <frontend test copy>`. Runner từ chối cổng test đang bị chiếm. NuGetAudit=false/cache restore không phải dependency security audit; MySqlConnector cần review riêng. Chưa có GitHub Actions run cho source chưa commit.

## 9. File và API

Lượt đổi chính sách sửa: `TuitionGenerationPolicy.cs`, `TuitionGenerationService.cs`, `GenerateTuitionDto.cs`, comment deadline `CreateTuitionInvoiceDto.cs`, `tuitionGenerationApi.ts`, `GenerateTuitionModal.tsx`, `TuitionIntegration/Program.cs`, `tuitionGeneration.test.mjs`, `tuitionGeneration.http.browser.mjs`, báo cáo này. Loại hai file session policy/tests đã bổ sung ở lượt trước; không revert các sửa tốt khác của Task 04.

Tổng Task 04 gồm các nhóm file sau, đường dẫn tính từ root repository:

- `.github/workflows/ci.yml`, `.gitignore`.
- `Capstone2/backend.Tests/TuitionPolicy.Tests.csproj`, `Capstone2/backend.Tests/TuitionIntegration/{Program.cs,TuitionIntegration.Tests.csproj}`.
- `Capstone2/backend/Controllers/Learning/ParentPortalController.cs`, `Capstone2/backend/Controllers/Management/{ManagementTuitionController.cs,ManagementUsersController.cs}`.
- `Capstone2/backend/Models/DTOs/Management/{CreatePaymentDto.cs,CreateTuitionInvoiceDto.cs,GenerateTuitionDto.cs}`, `Capstone2/backend/Models/DTOs/TuitionInvoiceDto.cs`.
- `Capstone2/backend/Repositories/Implementation/{TuitionInvoiceRepository.cs,UserRepository.cs}`.
- `Capstone2/backend/Services/Implementation/TuitionInvoiceService.cs`, `Capstone2/backend/Services/Learning/Implementation/LearnerDashboardService.cs`.
- `Capstone2/backend/Services/Management/Implementation/{ManagementTuitionService.cs,TuitionGenerationService.cs}`, `Capstone2/backend/Services/Management/Interfaces/IManagementTuitionService.cs`, `Capstone2/backend/Services/Management/TuitionGenerationPolicy.cs`.
- `Capstone2/db/migrations/TuitionInvoiceBusinessKey.proposal.sql`.
- `Capstone2/frontend/src/BLL/models/TuitionDto.ts`, `Capstone2/frontend/src/BLL/services/{tuitionFilterService.ts,tuitionMetricsService.ts}`.
- `Capstone2/frontend/src/GUIs/components/management/GenerateTuitionModal.tsx`, `Capstone2/frontend/src/GUIs/pages/admin/{AdminStaff/AdminStaffTuitionPage.tsx,CenterManager/CenterManagerTuition.tsx,shared/TuitionManagementPage.tsx}`.
- `Capstone2/frontend/src/GUIs/components/management/GenerateTuitionModal.css` — styling riêng bổ sung ở lượt UX.
- `Capstone2/frontend/src/api/{managementApi.ts,tuitionGenerationApi.ts}`, `Capstone2/frontend/tests/{tuitionGeneration.http.browser.mjs,tuitionGeneration.test.mjs,tuitionKpi.browser.mjs,tuitionMetrics.test.mjs}`.
- `docs/EDUTRACK_TASK04_FINAL_REPORT.md`.

Giữ API: POST `/api/tuitioninvoices/generation/preview`, POST `/generation/confirm`, POST individual `/api/tuitioninvoices`, PUT `/{id}`, POST `/{id}/payments`, GET Invoice/Payment. Query Invoice có classGradeId/classGradeName từ Class/Grade thật, không thêm cột. Không thêm route session verification hoặc agreement bypass; không sửa Approval/Auth/Attendance.

## 10. Safety, giới hạn và nghiệm thu

Không migration/schema change development, không chạy lại AddStudentGrade, không ghi/seed/test vào `edutrack_db`, không restore/reset/drop development. Entity/DbContext/EF migrations/snapshot giữ nguyên. Unique index vẫn cần phê duyệt riêng, không còn kế hoạch session/snapshot cần triển khai. Không dừng/restart tiến trình development không thuộc test; API/MySQL test riêng được dừng/dọn schema sau kiểm tra. Không chạm backup Task 03, credentials hoặc `.env`, không stage/commit/push/merge.

Giới hạn: phí thỏa thuận tháng nhập học chưa có workflow ghi trong phần mềm minh bạch; Auth/ownership/RecordedBy và gateway còn cần phối hợp; chưa có unique constraint bảo vệ ngoài writer hiện hành; kỳ quý, Class kỳ lẻ, dropped giữa kỳ, tự áp approval/hoàn phí không được tự mở rộng.

Checklist cả CM và AD, thao tác ghi trên môi trường test riêng:

1. Grade/Class/Student thật, filter/kỳ/status, pagination và KPI cùng tập; Student chuyển Grade/ngừng học không làm mất Invoice cũ.
2. Entire Grade nhiều fee/Student nhiều Class: Preview đúng số Student/Invoice/tổng từng lớp, deadline ngày cấu hình trong kỳ; Confirm thực sự tạo Invoice, không tạo Payment.
3. Entire Class và Individual: chỉ enrollment phù hợp, manual amount hợp lệ; đổi mode/Grade/Class/Student/kỳ reset đúng. Missing/cancelled Session hoặc absent không chặn/giảm monthly fee.
4. Student vào giữa tháng: kỳ nhập học bị loại có lý do, kỳ sau thu fee thường không tự cộng khoản cũ; không dùng Payment phụ phí đổi kỳ để thu hộ khoản chưa có Invoice.
5. Double-click/retry/mất mạng, stale fee/setting/enrollment: không trùng hoặc overwrite. Kiểm tra tiền/hạn/status/Payments cũ giữ nguyên.
6. Cash mặc định, Bank cần mã/đối soát, partial/nhiều lần/phụ phí có lý do, overpayment bị chặn, pending adjustment giữ workflow; mất response phải đối soát trước thử tiếp.
7. Desktop/tablet/mobile; Payment API lỗi không hiện 0 giả. Review quyền thật sau Auth tích hợp, unique index và cách ghi nhận thỏa thuận tháng đầu trước khi nghiệm thu các phần đó.

## 11. Final UX Polish — Generate Tuition Modal

Mục này lưu phạm vi/kết quả của lượt UX trước khi sửa trạng thái. Kết quả cuối cùng và thay đổi Backend mới được bổ sung ở mục 12.

Lượt này chỉ sửa **5 file**, không sửa source Backend, API contract, BLL tài chính, Entity/DbContext/migration hoặc dữ liệu phát triển:

| File | Thay đổi |
| --- | --- |
| `Capstone2/frontend/src/GUIs/components/management/GenerateTuitionModal.tsx` | Form hai cột desktop, một cột mobile; thứ tự chế độ/khối/lớp/học sinh/kỳ/số tiền; ba trạng thái UI rõ; tóm tắt nhỏ, chi tiết thu gọn, thông báo và nhãn tiếng Việt. |
| `Capstone2/frontend/src/GUIs/components/management/GenerateTuitionModal.css` | CSS scoped, rộng tối đa 960px, một vùng cuộn trong body, header/footer luôn thao tác được. Gỡ khoảng trắng do CSS section chung, không sửa stylesheet toàn ứng dụng. |
| `Capstone2/frontend/src/GUIs/pages/admin/shared/TuitionManagementPage.tsx` | Đổi nhãn nút mở thành **Lập hóa đơn**, dùng chung CM/AD. |
| `Capstone2/frontend/tests/tuitionGeneration.http.browser.mjs` | Cập nhật selectors/labels và bổ sung kiểm thử trạng thái, summary, details, loading/retry, zero eligible, footer/scroll, Grade Confirm và số HTTP request khi double-click. |
| `docs/EDUTRACK_TASK04_FINAL_REPORT.md` | Báo cáo UX và bằng chứng mới nhất. |

Trước Preview chỉ hiện cấu hình, trợ giúp thu gọn khi cần và hai nút **Đóng / Xem trước**; không có bảng thống kê hoặc Confirm. Sau Preview có ô hóa đơn có thể tạo mới, đã có, không đủ điều kiện nếu có, tổng tiền dự kiến và hạn thanh toán; nút chính **Tạo X hóa đơn**. X = 0 bị khóa, có giải thích phân biệt đã có và không đủ điều kiện. **Đã tạo / Thất bại chỉ hiện ở kết quả sau Backend xác nhận**, không trong Preview.

**Chi tiết theo lớp và học sinh** mặc định thu gọn, nhóm theo Class và giữ Student, fee tham khảo, AmountDue, DueDate thật, mã hóa đơn đã có, trạng thái và lý do không đủ điều kiện. Không còn bảng rộng hoặc danh sách có scrollbar riêng. Giải thích policy dài được chuyển vào **Cách tính học phí**; không thêm cảnh báo không liên quan. Các lý do Backend trả về được giữ để đối soát.

Giữ dependent dropdown, nguồn enrollment, token, amount validation, transaction/retry và kết quả API như trước. Đổi mode/Grade/Class/Student/kỳ/amount xóa Preview không còn phù hợp. Pending request khóa input/nút; ref guard chống gửi hai lần. Lỗi giữ form, bỏ Preview không còn xác nhận được và cho xem trước lại; không hiện thành công giả. Khi có summary/error, đưa nội dung vào vùng nhìn thấy và focus để hỗ trợ bàn phím/screen reader. Mở modal khóa cuộn nền, đóng khôi phục trạng thái cuộn trước đó; modal chỉ có body cuộn, footer luôn hiển thị.

### Kiểm thử UX thực tế

| Kiểm tra chạy lại | Kết quả |
| --- | --- |
| Frontend lint/typecheck/tests/build | Đạt; **110 tests pass**, 0 fail/skip, 0 lint error; 188 warning cũ, không warning trong file UX thay đổi; bundle >500 kB vẫn là cảnh báo. |
| Harness có sẵn + MySQL test/API HTTP thật | **63 assertion đạt** (18 offline + 45 integration/harness), dùng binary Backend đã kiểm chứng, không thay source Backend. Invoice/Payment ghi thật chỉ trong schema test tổng hợp. |
| Browser CM/AD | **6 nhóm** × 1440/768/390. Trước Preview chỉ hai nút; summary hiện đúng sau Preview; không hiện Created/Failed trước thực hiện; chi tiết mặc định đóng/mở được, giữ thông tin đối soát. |
| Ba mode và tương tác | UI Confirm thật cho Grade/Class/Individual; zero eligible do đã có và do không có học sinh; lý do ghi danh giữa tháng; reset khi đổi lựa chọn; loading; Preview 503/retry; Confirm stale 409; mất response sau commit; result không có nút gửi lại khi chưa Preview mới. |
| Double-submit | Hai lần click liên tiếp cho mỗi hành động chỉ gửi **một HTTP Confirm**; đếm request tại proxy ngoài việc kiểm tra dữ liệu không trùng. |
| Responsive | Không tràn ngang; footer trong viewport cả khi mở chi tiết dài; chỉ modal body cuộn. Đã xem ảnh desktop/mobile và sửa khoảng trắng CSS chung làm đẩy summary xuống dưới. |
| Payment/KPI | Browser HTTP giữ thu Cash/Bank, lỗi/mất response, double-submit và số dư đúng. **300 kịch bản KPI fixture** của Tuition/Dashboard/Reports CM/AD chạy lại trên bundle UX. |
| Scope | 18 file Backend source/test trong manifest monthly giữ SHA-256; Entity/DbContext/migration không đổi. Không build lại Backend do không sửa source; chạy lại API binary thật trong test riêng. |

Các lỗi 503/stale/lost-response được mô phỏng tại proxy test cho UX; các lần phát hành/Payment thành công vẫn đi qua production HTTP controller và MySQL riêng, không trả Invoice giả bằng fixture. API/MySQL/browser do test tạo được dừng sau khi kiểm tra, không dừng/restart development. Không có đăng nhập JWT/ownership mới được xác minh; giới hạn Auth ở mục 7 vẫn giữ nguyên.

Bằng chứng cùng test root: `ux-lint.log`, `ux-typecheck.log`, `ux-tests.log`, `ux-build.log`, `ux-http-browser.log`, `ux-kpi-browser.log`, `ux-source-verification.json`; screenshot Preview/result và traffic ở thư mục browser Temp do log chỉ ra. Không thêm artifacts vào repository. Manifest monthly 35 file ở mục 8 là baseline trước UX; lượt UX thêm CSS nên toàn Task 04 hiện có **36 file thay đổi/chưa theo dõi**, không staged/commit.

Checklist UX cho cả CM/AD trên môi trường test riêng:

1. Mở **Lập hóa đơn**: chỉ form và Đóng/Xem trước; thử ba chế độ, kiểm tra thứ tự field và reset lựa chọn.
2. Xem trước: đối chiếu số lượng, tổng tiền và hạn; mở chi tiết để đối soát từng Student–Class, rồi đóng lại. Chỉ sau bước này mới có nút Tạo X hóa đơn.
3. X = 0: xem lý do đã có/không đủ điều kiện, không thể tạo. Lỗi API/stale Preview: form còn nguyên, cần xem trước mới, không có thông báo thành công.
4. Confirm/double-click: chỉ tạo một lần, kết quả hiển thị Đã tạo/Thất bại thực tế; đối soát Invoice/Payment và KPI như checklist nghiệp vụ.
5. Tablet/mobile: mở chi tiết dài, kiểm tra một vùng cuộn, nút footer dễ bấm, không bị bảng/dropdown che; đóng modal rồi kiểm tra cuộn nền/Payment vẫn hoạt động.

## 12. Fix Tuition Status, Invoice Editing & Payment Actions

### Nguyên nhân và quy tắc sau sửa

Backend trước đây đã từ chối PUT Paid nếu chưa thu đủ, nhưng UI vẫn cho chọn trạng thái; API cho sửa tiền/kỳ/hạn sau khi đã có Payment nếu không thấp hơn tổng đã thu. Payment chỉ chặn dư nợ 0 khi phụ phí cũng bằng 0, nên có thể thu phụ phí để tăng AmountDue của hóa đơn đã tất toán. UI luôn hiện nút Sửa/Thanh toán, không phân biệt có receipt/đã tất toán. Chi tiết dùng paidAmount từ danh sách cũ và chưa hiện lịch sử receipts.

Đã sửa:

- `TuitionPolicy.ResolveStatus`: Paid chỉ khi AmountDue dương, đúng precision/range hiện hành và tổng đã thu >= AmountDue. Còn nợ => Unpaid/Overdue theo ngày UTC+7; ngày đến hạn vẫn được thanh toán hết ngày. Pending Adjustment giữ ưu tiên của workflow đang có. Không tạo status DB “partial”.
- GET Invoice vẫn tính trạng thái hiệu lực từ receipts, không tin stored Paid/Unpaid. Không UPDATE/chuẩn hóa hàng loạt status cũ khi đọc. Test cố ý để stored Paid trong DB test lúc mới thu 600.000: GET trả Unpaid và raw DB vẫn giữ nguyên đến thao tác thanh toán thật.
- Update DTO cho phép **không gửi Status**. Field cũ vẫn nhận cho compatibility, nhưng nếu khác trạng thái hiện hành Backend tính thì trả 400, không cho nhập/gỡ pending hoặc Paid giả. Client mới không gửi Status; modal hiển thị read-only.
- Có **bất kỳ Payment nào**, hoặc đang Pending Adjustment/đã tất toán: không thay AmountDue, PeriodMonth/Year hay DueDate bằng PUT thông thường. Áp dụng cả partial receipts. PUT không đổi trường tài chính chỉ trả dữ liệu/trạng thái hiệu lực, không ghi lại lịch sử để sửa status stale. Invoice chưa có receipt vẫn sửa các trường hợp lệ, kiểm tra kỳ trùng/tiền/ngày như trước.
- RecordPayment khóa Class, đọc lại Invoice/receipts **sau khóa**, kiểm tra tiền và dư nợ. Dư nợ bằng 0 bị từ chối dù có AdditionalChargeAmount/lý do; không tăng AmountDue hay insert Payment mới. Nếu dữ liệu tiền cũ không hợp lệ thì chặn thu tiếp để đối soát, không sửa/xóa receipt.
- Dư nợ > 0 vẫn cho thu partial/full và phụ phí hợp lệ có lý do theo policy hiện có; phụ phí chỉ cộng một lần. Pending Adjustment còn dư nợ vẫn nhận khoản thu như trước nhưng không tự thoát workflow; đã hết dư nợ thì không nhận thêm khoản thu/phụ phí.

`TuitionInvoiceRepository` đã Include Payments và AsNoTracking; sau parent-row lock lấy lại dữ liệu thật. Bỏ tải toàn bộ Payment trung tâm khi ghi thu, chỉ tính collection của Invoice đã đọc lại. PaymentRepository/PaymentService không đổi: đọc nguyên receipts để giữ lịch sử, không xóa/gộp hoặc tự đánh dấu gateway. Lock dùng chung với Edit/generation bảo vệ các writer hiện hành; không suy ra idempotency Payment cho mọi client hoặc quyền gọi API đã đạt.

### Frontend CM và AD

Service nhỏ dùng chung tính khả năng hành động từ paidAmount/dư nợ đã tải và sự tồn tại receipt, không dựa riêng nhãn Paid:

| Invoice | Hành động thường |
| --- | --- |
| Chưa thu, còn nợ, không pending | Sửa / Thanh toán / Xem hóa đơn. |
| Đã thu một phần | Thanh toán / Xem hóa đơn; không Sửa tài chính. Hiện “Thanh toán một phần”, số đã thu/còn nợ, giữ badge Unpaid hoặc Overdue đúng hạn. |
| Đã tất toán | Chỉ **Xem hóa đơn**, không nút Sửa/Thanh toán, handler cũng không mở Payment modal. |
| Pending Adjustment | Không Sửa trực tiếp; Thanh toán chỉ khi còn dư nợ hợp lệ, không thoát pending bằng thu tiền. |
| Payment data chưa sẵn sàng/lỗi | Không mở Edit/Payment bằng giả định đã thu bằng 0. Vẫn có đường xem/đối soát dữ liệu. |

Chi tiết tải lại Invoice và Payments, tính cùng một tổng đã thu/còn nợ để không ghép status mới với paidAmount cũ. Paid hiển thị Total Due, Paid Amount và Remaining = 0; có danh sách từng receipt, ngày giờ Việt Nam, phương thức/mã giao dịch/phụ phí đã lưu. Ngày legacy không đọc được ghi cần đối soát thay vì làm lỗi cả màn hình. Nếu fetch detail/receipts lỗi, hiện cảnh báo và chưa xác định tiền; không giả số 0. Đóng khi đang tải sẽ bỏ qua response cũ, không tự mở lại modal; có browser test với API receipt trả chậm. Không redesign page hoặc đổi monthly policy/filter/generation/KPI.

### Kiểm thử mới nhất

| Kiểm tra | Kết quả |
| --- | --- |
| Frontend lint/typecheck/test/build | Đạt; **116 tests**, không fail/skip. 188 lint warning cũ; bundle >500 kB. |
| Backend API + integration harness build | Đạt, 0 error, 3 CS8601 cũ. |
| Pure Tuition policy | **27 assertion**, không DB; giữ timezone/deadline/pending và thêm guard Paid, gồm AmountDue không hợp lệ ở trước/sau hạn. |
| Monthly policy | **18 assertion**, không DB, không đổi business monthly. |
| Tuition MySQL/HTTP/browser harness | **76 assertion** tổng cộng (18 offline + 58 integration/harness), cùng kiểm tra status từng HTTP call. MySQL test riêng, không development. |
| Browser CM/AD | **6 nhóm** desktop/tablet/mobile: edit no-payment thành công không gửi Status, không dropdown trạng thái; partial không Sửa nhưng còn Thanh toán; thu đủ tự Paid; chỉ còn Xem; lịch sử 2 receipts, Remaining = 0. Giữ ba modes/Preview/Confirm/zero/retry/double-submit và Payment/KPI. |
| Dashboard/Reports/Tuition KPI | **300 browser scenarios fixture** đạt trên bundle mới; không dùng fixture làm bằng chứng lưu tiền. |

HTTP ca chuẩn: Invoice 1.000.000 chưa thu = Unpaid; PUT Paid bị từ chối; sửa hợp lệ khi chưa thu thành công. Thu 600.000 => chưa Paid, dư 400.000; PUT giảm tiền bằng đã thu/đổi kỳ/đổi hạn đều bị chặn. Sau khi tạo stored Paid stale trong fixture, GET vẫn Unpaid và không sửa raw data. Thu 400.000 => tự Paid. POST tiếp/POST kèm phụ phí và PUT tăng AmountDue đều thất bại, giữ đúng 2 receipts và AmountDue 1.000.000.

Invoice quá hạn thu 600.000 vẫn Overdue. Hai request đồng thời mỗi khoản 400.000 tranh dư nợ 400.000: đúng 1 HTTP 201, 1 HTTP 400; chỉ thêm 1 receipt, tổng không vượt 1.000.000. Pending Adjustment giữ trạng thái khi nhận khoản thu hợp lệ và từ chối chuyển trạng thái thủ công. Test phụ phí cũ được chuyển sang lúc **còn nợ**, không giữ expectation sai rằng có thể thêm phí sau tất toán.

### File sửa và giới hạn

Lượt này có 13 file thay đổi/thêm:

- `Capstone2/backend/Services/Management/TuitionPolicy.cs`.
- `Capstone2/backend/Services/Management/Implementation/ManagementTuitionService.cs`.
- `Capstone2/backend/Models/DTOs/Management/UpdateTuitionInvoiceDto.cs`.
- `Capstone2/backend.Tests/Program.cs`, `Capstone2/backend.Tests/TuitionIntegration/Program.cs`.
- `Capstone2/frontend/src/BLL/services/tuitionPolicyService.ts`, `Capstone2/frontend/src/BLL/services/tuitionActionService.ts` (mới).
- `Capstone2/frontend/src/BLL/models/TuitionDto.ts`, `Capstone2/frontend/src/api/managementApi.ts`.
- `Capstone2/frontend/src/GUIs/pages/admin/shared/TuitionManagementPage.tsx`.
- `Capstone2/frontend/tests/tuitionActions.test.mjs` (mới), `Capstone2/frontend/tests/tuitionGeneration.http.browser.mjs`.
- `docs/EDUTRACK_TASK04_FINAL_REPORT.md`.

Không thêm schema/migration, không chạy lại AddStudentGrade, không ghi/xóa/sửa Invoice/Payment phát triển hoặc seed. Test dùng instance/schema MySQL tổng hợp đã xác minh; API/MySQL test do runner tạo được dừng sau kiểm tra. Không sửa Auth/Attendance/Approval source, không commit/push/merge.

**Cần Approval/đối soát riêng:** chỉnh tiền/kỳ/hạn sau receipt, phí phát sinh sau tất toán, hoàn/miễn giảm và thay đổi khi pending. Không thêm workflow mới hoặc tự cho Admin Staff sửa tài chính hoàn tất. Service Approval hiện chỉ lưu review, chưa tự áp thay đổi Invoice; bản sửa này không mở một endpoint để bypass hạn chế sau khi Request approved. Cách áp điều chỉnh tài chính được duyệt cần quyết định/tích hợp riêng, không tự sửa SQL/status để làm tắt.

Auth gaps/RecordedBy/online gateway và unique index vẫn như mục 6–7; các test không chứng minh JWT/role/ownership production. Nguồn dữ liệu lịch sử vẫn được bảo toàn; không cố sửa status raw stale hoặc tự diễn giải receipt lịch sử thành hoàn phí. Nếu mất response Payment, vẫn phải đối soát trước retry, không coi guard dư nợ là idempotency key.

Bằng chứng cùng test root ở mục 8: `status-build.log`, `status-policy-build.log`, `status-policy.log`, `status-lint.log`, `status-typecheck.log`, `status-tests.log`, `status-frontend-build.log`, `status-integration.log`, `status-kpi-browser.log`, `status-source-verification.json`. Manifest xác nhận 38 file source/test khớp bản sao đã kiểm thử, 12 source/test đổi so với bản UX (cộng báo cáo là 13 file trong lượt này), 5 file Entity/DbContext/migration/snapshot trọng yếu khớp HEAD. Toàn Task 04 hiện có **42 file thay đổi/chưa theo dõi, 0 staged**; các con số monthly/UX ở trên là lịch sử từng lượt, không phải danh sách commit đã tạo.

Checklist nghiệm thu cả CM/AD trên môi trường test:

1. Invoice chưa thu: mở Sửa, trạng thái read-only; lưu tiền/kỳ/hạn hợp lệ được, không gửi Status từ UI.
2. Thu 600.000/1.000.000: hiện đã thu/còn 400.000 và partial; không Sửa tài chính, vẫn thu được phần còn lại. Quá hạn còn nợ phải Overdue theo UTC+7.
3. Thu đủ: badge Paid, chỉ Xem hóa đơn, Remaining = 0 và mọi receipts còn đủ. Gửi trực tiếp PUT/POST Payment/phụ phí không mở lại được hóa đơn.
4. Pending Adjustment không gỡ/đặt bằng Edit, không dùng Payment để thoát workflow; trường hợp cần điều chỉnh chuyển đúng người/quy trình xử lý.
5. Kiểm tra desktop/tablet/mobile, lỗi Payment API không giả PaidAmount=0, KPI/filter và các modes generation vẫn như trước.

## 13. Kiểm tra trước local commit được phê duyệt

Người dùng cho phép tạo một commit trên `Duy` với message `feat(tuition): complete tuition management and invoice lifecycle`. Đã đối chiếu toàn bộ 42 file Task 04 với manifest nghiệm thu; 38 source/test giữ nguyên SHA-256, không có source mới chưa kiểm thử hoặc thay đổi của task khác. Các thay đổi ở User deletion và Parent/Learning chỉ là guard tài chính đã review, không sửa Auth/Attendance. Không có Entity/DbContext/EF migration/schema change; SQL proposal chỉ có SELECT và DDL comment, không thêm UNIQUE constraint.

Chạy lại trước commit trên bản sao source không `.env`/appsettings thật: frontend lint/typecheck/build đạt, **116 tests** đạt; API Release build đạt; policy harness **27 assertion**, generation policy **18 assertion** đạt. Integration/MySQL/HTTP chạy lại đạt **76 assertion** cùng **6 nhóm browser CM/AD desktop/tablet/mobile**, có phát hành Invoice và ghi Payment thật chỉ trong schema tổng hợp độc lập. `actionlint` và `git diff --check` đạt. Còn 188 lint warning, cảnh báo bundle và 3 CS8601 cũ; không tuyên bố các warning đã được xử lý hoặc đã có GitHub Actions run.

Nguồn/bằng chứng kiểm tra lưu riêng ở test root: `precommit-files.json`, `precommit-api-build.log`, `precommit-lint.log`, `precommit-typecheck.log`, `precommit-tests.log`, `precommit-frontend-build.log`, `precommit-policy.log`, `precommit-generation-policy.log`, `precommit-integration.log`. Đã kiểm tra danh sách file và mẫu secret; không đưa `.env`, credentials, dump/backup, dữ liệu cá nhân, logs, screenshots, bin/obj/node_modules/dist hoặc artifacts vào danh sách commit. Instance/API/browser test đã dừng; không đọc/ghi hoặc chạy migration trên `edutrack_db` trong lượt này.

Trước lệnh commit còn kiểm tra nội dung index, `git diff --cached --check`, đúng danh sách 42 file và các blob staged khớp working tree đã review. Sau local commit, hash thực tế và trạng thái working tree được báo từ Git; không push, merge hoặc rebase. Giới hạn Auth/gateway, unique constraint, phí thỏa thuận giữa tháng và việc áp Approval tài chính ở mục 5–7/12 vẫn giữ nguyên.
