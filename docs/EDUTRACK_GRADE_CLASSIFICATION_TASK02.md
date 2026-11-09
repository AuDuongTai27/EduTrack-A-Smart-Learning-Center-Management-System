# EduTrack — Task 02: Grade Classification & Class Management

Triển khai trên nhánh `Duy`. Đã áp dụng Grade Migration lên database chính sau phê duyệt rõ ràng; không commit, push hoặc merge.

Cập nhật kiểm chứng ngày 07/11/2026: đã backup, restore và chạy migration/API/UI trên MySQL thử nghiệm riêng.
Xem [báo cáo an toàn database](EDUTRACK_TASK02_DATABASE_SAFETY_REVIEW.md) để biết kết quả mới nhất.
Kết quả kiểm thử và các giới hạn ở mục 5 dưới đây ghi nhận giai đoạn triển khai ban đầu.

Trạng thái chờ phê duyệt triển khai mới nhất: [preflight cuối cùng](EDUTRACK_TASK02_FINAL_PREFLIGHT.md).

Kết quả hiện tại: [triển khai thành công, postflight/API/UI đạt và Backend đang chạy](EDUTRACK_TASK02_DEPLOYMENT_RESULT.md).
Các phần migration “chưa áp dụng” bên dưới mô tả giai đoạn triển khai source ban đầu.

## 1. Tính năng đã triển khai

- Danh mục Grade dùng chung: Khối 1–12, đọc bằng `GET /api/grades`. Không có trang hay API CRUD Grade.
- `GET /api/classes` và `GET /api/classes/{id}` bổ sung `gradeId`, `gradeName`.
- Form Create/Edit dùng danh mục Grade từ API thật. Thứ tự nhập: tên lớp → khối → một môn → thông tin còn lại.
- Create yêu cầu Grade hợp lệ ở cả frontend, DTO và service; service kiểm tra bản ghi thực sự tồn tại.
- Edit cho phép phân loại hoặc đổi khối. Lớp cũ có `grade_id = NULL` vẫn sửa được thông tin khác mà không bị tự gán khối.
  Lớp đã phân loại phải giữ một Grade hợp lệ, không chuyển ngược về NULL.
- Tab **Theo khối lớp** nhóm toàn bộ kết quả đã lọc, có mở/thu từng khối và nhóm **Chưa phân loại**.
  Không chỉ nhóm các dòng trên trang hiện tại của bảng. Khối không có kết quả không xuất hiện.
- Tab **Tất cả lớp** giữ bảng, tìm kiếm, lọc môn/trạng thái, sắp xếp, phân trang và CRUD; thêm cột và bộ lọc khối.
  Bộ lọc khối có lựa chọn **Chưa phân loại**. Bộ lọc được giữ khi chuyển tab.
- Hai tab sử dụng cùng danh sách từ `GET /api/classes`; chuyển tab không dùng nguồn dữ liệu khác.
- Card lớp và liên kết trong bảng mở Class Details hiện có. Card nhóm cũng có Edit/Delete.
- Class Details thêm Grade ở phần đầu và Overview; giữ Overview, Subjects, Students, Schedule và phân công Teacher/TA.
- Center Manager và Admin Staff tiếp tục dùng chung component, route và layout hiện tại.

Không thay đổi Add/Edit Student, Enrollment, Tuition Management, Dashboard/Reports, Authentication/Authorization,
Sidebar/TopBar, quy tắc Teacher/TA hay chức năng của Teacher/TA/Student. Giữ nguyên MoneyInput và cách gợi ý
ngày kết thúc sau một tháng, kể cả giới hạn ngày cuối tháng và quyền sửa ngày gợi ý.

## 2. Cấu trúc Grade và quan hệ với Class

| Thành phần | Cấu trúc |
| --- | --- |
| `grades.grade_id` | INT, khóa chính ổn định 1–12, không AUTO_INCREMENT |
| `grades.grade_name` | VARCHAR(50), bắt buộc, `Khối 1` … `Khối 12` |
| `classes.grade_id` | INT NULL, có index, FK tới `grades.grade_id`, ON DELETE RESTRICT |
| Quan hệ | Một Grade có nhiều Class; một Class có tối đa một Grade |
| Subject | Giữ nguyên `classes.subject_id`, một môn cho mỗi Class |
| Student | Giữ nguyên quan hệ nhiều lớp qua `student_classes`; Grade không sở hữu học sinh |

Bảng tham chiếu riêng phù hợp mô hình entity/repository/DTO và MySQL hiện có: có FK kiểm tra toàn vẹn,
danh mục dùng chung từ Backend và không phụ thuộc tên lớp/môn. ID được sắp số để Khối 2 đứng trước Khối 10.
NULL phục vụ tương thích dữ liệu cũ; quy tắc tạo mới bắt buộc Grade được kiểm tra ở service thay vì ép NOT NULL
lên toàn bộ các lớp đang tồn tại. Không suy diễn hoặc backfill Grade bằng tên Class/Subject.

Ví dụ payload Create:

```json
{
  "className": "Lớp 7 – Toán",
  "gradeId": 7,
  "subjectId": 42,
  "room": null,
  "tuitionFee": 1250000,
  "startDate": "2026-11-07",
  "endDate": "2026-12-07",
  "status": "upcoming"
}
```

`subjectId` trong ví dụ phải được thay bằng ID môn thực tế. Không có `subjectIds`, Class Subject hay lớp cha theo khối.
Với lớp cũ chưa phân loại, Edit gửi `gradeId: null` để tiếp tục giữ trạng thái đó.

## 3. Quy tắc Delete Class

Backend chỉ xóa lớp hoàn toàn chưa có liên kết cần giữ. `ClassDeletionPolicy` kiểm tra bằng truy vấn EXISTS,
không tải toàn bộ collection và không lọc theo trạng thái:

- Mọi đăng ký học sinh, kể cả inactive/dropped.
- Buổi học, kể cả buổi hủy; qua buổi học bảo vệ cả điểm danh.
- Bài tập; qua bài tập bảo vệ submission và đánh giá.
- Hóa đơn, kể cả đã thanh toán; qua hóa đơn bảo vệ giao dịch thanh toán và yêu cầu liên quan.
- Nội dung học, nhận xét tiến độ, yêu cầu phê duyệt, thông báo và người nhận thông báo.
- Lịch tuần và bản ghi phân công Teacher/TA, kể cả inactive.

Chọn bảo toàn cả lịch tuần/phân công để không xóa nhầm dấu vết liên quan của lớp. Vì vậy lớp mới chỉ thiết lập
lịch/phân công cũng có thể bị chặn xóa; có thể chuyển Inactive hoặc Completed. Không tự gỡ liên kết để vượt kiểm tra.

`ClassRepository.DeleteAsync` mở transaction Serializable và khóa dòng Class bằng `SELECT ... FOR UPDATE`
trước kiểm tra. Với InnoDB và các FK đúng như schema, bản ghi con tham chiếu Class phải chờ khóa này;
tránh khoảng trống giữa kiểm tra và DELETE. Chỉ xóa Class sau khi tất cả kiểm tra đều rỗng.
Không còn RemoveRange các phân công/lịch tuần trong Delete. Không thay đổi cấu hình cascade của các bảng lịch sử.

Nếu bị chặn, API trả lỗi và thông báo hướng dẫn chuyển **Inactive hoặc Completed**. Modal giữ nguyên lớp/lỗi để
người dùng đọc hoặc hủy. Không sửa dữ liệu lịch sử khi từ chối xóa.

## 4. Migration đã chuẩn bị, chưa áp dụng

- `Capstone2/backend/Migrations/20261107002822_AddGradeClassification.cs`
- Designer tương ứng và `EduTrackDbContextModelSnapshot.cs`.
- SQL để review: [AddGradeClassification.review.sql](../Capstone2/db/migrations/AddGradeClassification.review.sql).

Up chỉ thực hiện:

1. Thêm `classes.grade_id` nullable, không có default.
2. Tạo bảng `grades` với charset utf8mb4 và chèn 12 dòng danh mục.
3. Thêm index `IX_classes_grade_id` và FK `FK_classes_grades_grade_id` với RESTRICT.
4. Ghi lịch sử migration khi script được áp dụng sau này.

Không UPDATE/DELETE dữ liệu cũ, không thay ID lớp/môn, học phí, học sinh, phân công hay lịch học.
Các Class hiện có đều giữ `grade_id = NULL` đến khi người quản lý phân loại rõ ràng.
Down bỏ bảng/cột/index/FK mới nên sẽ làm mất thông tin phân loại đã nhập sau triển khai; không chạy Down tự động.

Tooling mặc định gặp lỗi SSL ở bước runtime `ServerVersion.AutoDetect`. Sau đó migration/SQL được sinh bằng
factory và host tạm dành riêng cho design-time, dùng phiên bản MySQL 8 cố định để không khởi động runtime host.
File factory/host tạm đã được loại khỏi source. Không chạy `database update` và không thực thi SQL review.
Kiểm tra `has-pending-model-changes` ngoại tuyến đã đạt trước khi bỏ factory tạm.

**Cần duyệt trước khi triển khai:** đối chiếu phiên bản MySQL, charset/collation, InnoDB, FK và migration history thật;
backup và thử trên bản sao database; đánh giá thời gian ALTER TABLE/index. SQL review bắt đầu từ migration
`20261102045221_AddNotificationRecipientDeletedAt`, không dùng để khởi tạo database chưa có các migration trước.

API và Backend mới cần schema này. Chưa thể coi bản đang chạy trên database cũ là đã được nâng cấp chỉ vì build đạt.
Sau khi được cho phép, cần phối hợp áp dụng migration và khởi động lại Backend. Không thêm tự động migrate/seed Grade vào startup.

Một số truy vấn **chỉ đọc**, để người vận hành đối chiếu sau khi chọn đúng database:

```sql
SELECT VERSION();
SELECT * FROM __EFMigrationsHistory ORDER BY MigrationId;
SHOW CREATE TABLE classes;
SHOW CREATE TABLE student_classes;
SHOW CREATE TABLE class_sessions;
SHOW CREATE TABLE assignments;
SHOW CREATE TABLE tuition_invoices;
SELECT TABLE_NAME, ENGINE
FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE();
```

Các truy vấn trên chưa được chạy trên database thật trong task này.

## 5. Build và kiểm thử

| Kiểm tra | Kết quả |
| --- | --- |
| Frontend `npm.cmd run build` | Đạt; còn cảnh báo bundle >500 kB |
| Backend build `--no-restore -p:UseAppHost=false --output <temp>` | Đạt; 3 warning CS8601 đã có trong TeachingRequestService/LearnerDashboardService |
| Toàn bộ `node --test tests/*.test.mjs` | 76/76 đạt, gồm hồi quy học phí, dashboard và class staff |
| Trong đó Class Management/Grade unit + API | 19/19 đạt |
| Backend DTO/service/retention policy/SQL translation | 60 kiểm tra đạt; harness ở thư mục tạm |
| Browser Class Management | 42 nhóm kịch bản đạt; 2 vai trò × desktop 1440×1000, tablet 768×1024, mobile 390×844 |
| SQL/model | Migration Up chỉ thêm schema/danh mục; EF báo model không còn pending changes |
| Oxlint trên 11 file TypeScript thay đổi | Không có lỗi; 3 cảnh báo `react(set-state-in-effect)` ở hook/form |
| `git diff --check` | Đạt |

Browser xác minh: CRUD và lỗi giữ draft, Grade bắt buộc, lớp cũ NULL vẫn sửa được, thay Grade, lọc theo Grade/NULL,
đổi tab giữ bộ lọc, nhóm đủ lớp qua mọi trang, mở/thu nhóm, liên kết Details hiển thị Grade, lỗi danh mục không
che mất danh sách, retry, bốn tab Details, phân trang sau Delete và kích thước form/viewport.

**Giới hạn bằng chứng:** browser chặn API bằng fixture riêng trong test, 48 request CRUD được interceptor xử lý;
không gọi Backend/MySQL thật. Source ứng dụng dùng API thật, không dùng fixture thay API.
Backend service dùng repository trong bộ nhớ; retention test chạy expression thật trên các loại lịch sử,
đồng thời dùng Pomelo thật để dịch expression thành SQL mà không kết nối DB. Chưa thực thi transaction/DELETE
hay chứng minh hành vi khóa/FK trên MySQL thật. Ảnh browser cô lập tài nguyên ngoài nên không xác nhận tải font/icon từ CDN.

Chạy lại từ `Capstone2/frontend`:

```powershell
npm.cmd run build
node --test tests/*.test.mjs
node tests/classManagement.browser.mjs
```

Trong môi trường Windows hạn chế hiện tại, Chrome mặc định không khởi tạo được renderer (`Page.enable` timeout).
Lần kiểm thử thành công dùng tùy chọn chỉ cho tiến trình test:

```powershell
$env:CHROME_ARGS_JSON = '["--no-sandbox"]'
node tests/classManagement.browser.mjs
```

Không thay đổi cờ Chrome mặc định của người dùng hay cấu hình ứng dụng. Browser ghi ảnh list/groups/form và
`results.json` vào `%TEMP%/edutrack-class-management-8CbQR7/` cho lần chạy đã đối chiếu.

Build Backend và chạy lại harness có sẵn trên máy này, từ gốc repo:

```powershell
$gradeBuildOutput = Join-Path $env:TEMP 'EduTrack-GradeClassification-Build'
dotnet build Capstone2/backend/EduTrack.API.csproj --no-restore -p:UseAppHost=false --output $gradeBuildOutput
dotnet run --project "$env:TEMP/EduTrack-GradeClassification-Checks/GradeChecks.csproj" --no-restore
```

Harness/ảnh là artifact tạm, không thuộc Git và có thể bị hệ điều hành dọn. Không thêm project test Backend
vào vị trí khác trong repo để thay đổi phạm vi đã có từ Task 01.

## 6. Các bước cần end-to-end sau khi duyệt database

1. Trên database kiểm thử có backup, áp dụng migration đã duyệt và đối chiếu đủ 12 Grade;
   số Class/Subject/TeacherClass/TaClass/Schedule/StudentClass/TuitionInvoice/Payment trước và sau không giảm.
   Lớp cũ vẫn NULL, không có lớp bị suy diễn khối từ tên.
2. Dùng tài khoản thật của cả Center Manager và Admin Staff. Tạo lớp với một Grade/một Subject thực tế,
   tải lại trình duyệt và SQL SELECT để xác nhận lưu thật. POST thiếu/NULL/0/13/Grade không tồn tại phải bị từ chối.
3. Sửa Grade của lớp có học sinh/phân công/lịch/học phí; so sánh các bảng liên kết trước và sau.
   Sửa riêng trạng thái của lớp cũ chưa phân loại phải giữ NULL. Kiểm tra list, nhóm, bộ lọc và Details cùng giá trị.
4. Gọi DELETE trực tiếp lên lớp có từng loại lịch sử, kể cả dropped/cancelled/paid/inactive:
   API phải từ chối và mọi bản ghi phụ thuộc phải còn nguyên. Chỉ thử với dữ liệu kiểm thử.
5. Xác nhận lớp thực sự rỗng được xóa; lớp chỉ có lịch tuần/phân công bị chặn theo chính sách bảo toàn đã nêu.
   Chuyển Inactive/Completed phải tiếp tục hoạt động.
6. Dùng hai kết nối trên database kiểm thử để kiểm tra thêm enrollment/session/invoice đồng thời với DELETE:
   không được xóa dây chuyền bản ghi vừa tạo. Kiểm tra rollback/deadlock và đối chiếu FK InnoDB thực tế.
7. Kiểm tra quyền theo cơ chế hiện có, font/icon trên môi trường thật, mobile/tablet, và hiệu năng khi số lớp lớn.

## 7. Danh sách file thay đổi

Các đường dẫn dưới đây tính từ gốc repo. Có 33 file triển khai/test/schema và báo cáo này.

### Backend

```text
Capstone2/backend/Controllers/Queries/GradesController.cs (mới)
Capstone2/backend/Helpers/DependencyInjection/CoreInfrastructureExtensions.cs
Capstone2/backend/Models/Entities/Grade.cs (mới)
Capstone2/backend/Models/Entities/Class.cs
Capstone2/backend/Models/DTOs/GradeDto.cs (mới)
Capstone2/backend/Models/DTOs/ClassDto.cs
Capstone2/backend/Models/DTOs/Management/CreateClassDto.cs
Capstone2/backend/Models/DTOs/Management/UpdateClassDto.cs
Capstone2/backend/Models/EF/EduTrackDbContext.cs
Capstone2/backend/Repositories/ClassDeletionPolicy.cs (mới)
Capstone2/backend/Repositories/Implementation/ClassRepository.cs
Capstone2/backend/Services/Interfaces/IGradeService.cs (mới)
Capstone2/backend/Services/Implementation/GradeService.cs (mới)
Capstone2/backend/Services/Implementation/ClassService.cs
Capstone2/backend/Services/Management/Implementation/ManagementClassService.cs
```

### Migration/SQL

```text
Capstone2/backend/Migrations/20261107002822_AddGradeClassification.cs (mới)
Capstone2/backend/Migrations/20261107002822_AddGradeClassification.Designer.cs (mới)
Capstone2/backend/Migrations/EduTrackDbContextModelSnapshot.cs
Capstone2/db/migrations/AddGradeClassification.review.sql (mới, chưa thực thi)
```

### Frontend và test

```text
Capstone2/frontend/src/BLL/models/GradeDto.ts (mới)
Capstone2/frontend/src/BLL/models/ClassDto.ts
Capstone2/frontend/src/BLL/models/ClassManagement.ts
Capstone2/frontend/src/BLL/services/classManagementService.ts
Capstone2/frontend/src/api/gradeApi.ts (mới)
Capstone2/frontend/src/api/managementApi.ts
Capstone2/frontend/src/GUIs/hooks/useClassManagement.ts
Capstone2/frontend/src/GUIs/components/management/classes/GradeClassGroups.tsx (mới)
Capstone2/frontend/src/GUIs/components/management/classes/ClassFormModal.tsx
Capstone2/frontend/src/GUIs/pages/admin/shared/ClassManagementPage.tsx
Capstone2/frontend/src/GUIs/pages/admin/shared/ClassDetailsPage.tsx
Capstone2/frontend/tests/classManagement.test.mjs
Capstone2/frontend/tests/classManagementApi.test.mjs
Capstone2/frontend/tests/classManagement.browser.mjs
```
