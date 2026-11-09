# Task 03 — Sửa đồng bộ Grade và liên kết phụ huynh–học sinh

> Báo cáo này giữ lịch sử bản sửa trước migration. Hiện migration đã được duyệt và áp dụng, HTTP smoke và test end-to-end đã đạt; Backend đang chạy bản mới. Kết quả, file thay đổi và giới hạn mới nhất tại [báo cáo tổng hợp Task 03](EDUTRACK_TASK03_FINAL_REPORT.md).

Ngày kiểm tra: 07/11/2026, Asia/Bangkok.

> Quyết định nghiệp vụ mới nhất: `users.grade_id` là khối phổ thông hiện tại, độc lập với `classes.grade_id` và enrollment. Edit Grade không kiểm tra/chặn theo lịch sử lớp. Xem [quyết định kiến trúc, review migration và kế hoạch triển khai an toàn](EDUTRACK_TASK03_STUDENT_GRADE_DECISION.md). Phê duyệt kiến trúc không đồng nghĩa phê duyệt thao tác database chính.

Đã triển khai và kiểm thử bản sửa trên source. **Database chính chưa được thay đổi. Bản backend này cần migration `20261107061101_AddStudentGrade` trước khi chạy với database hiện tại.** Migration đã được thử trên MySQL độc lập; việc áp dụng vào database chính đang chờ người dùng phê duyệt theo yêu cầu của task. Không commit/push/merge.

## Nguyên nhân và bản sửa

| Vấn đề | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| Edit Student không lưu Grade thực tế | User không có quan hệ với Grade; form sửa trực tiếp `specialty`, DTO/backend chỉ lưu chuỗi. | Thêm `users.grade_id` nullable và FK tới `grades.grade_id`; Add/Edit gửi ID thật, User DTO trả `gradeId` và `gradeName`. |
| Khối trong Add/filter/bảng/chi tiết không đồng nhất | Option và fallback `Class 7/8/9/12` cố định; filter tìm chuỗi trong specialty; enrollment phải suy luận Grade từ tên. | Đọc `GET /api/grades`, chọn/lọc bằng ID; hiển thị tên từ catalogue/quan hệ Grade, sắp xếp theo tên thực tế có numeric collation. Bỏ ánh xạ `Class N` trong frontend. |
| Hai role dễ lệch logic | Hai file Student Management sao chép gần như toàn bộ giao diện và state. | Dùng chung `StudentManagementPage`, hook/catalogue, Grade select và service. Hai file role chỉ còn wrapper truyền role/breadcrumb. |
| Liên kết chọn sẵn một người | Các hàm mở modal lấy `parentsList[0]` hoặc `studentsList[0]`; state số 0 không khớp option giá trị rỗng. | General modal bắt đầu với hai giá trị rỗng; contextual modal chỉ giữ người mà người dùng đã chủ động chọn từ dòng, phía còn lại để trống. |
| Quan hệ mặc định Bố và nguy cơ sửa quan hệ cũ | Tất cả các lần mở dùng `Father`; API upsert có thể ghi đè quan hệ đã lưu bằng default mới. | Liên kết mới mặc định `Mother`; chọn cặp đã có sẽ nạp quan hệ và primary contact thật. API phân biệt tạo/cập nhật bằng `updateExisting`; request cập nhật bỏ qua relationship/contact giữ giá trị cũ. |

## Grade được lưu và đọc như thế nào

- Nguồn dữ liệu khối phổ thông hiện tại là **`users.grade_id`**, không phải tên Grade, `specialty` hoặc khối suy từ enrollment. `classes.grade_id` là khối của lớp học thêm tại trung tâm; hai quan hệ có ý nghĩa độc lập.
- EF mapping: `User.GradeId` nullable, `User.Grade`, index `IX_users_grade_id`, FK `FK_users_grades_grade_id` với `ON DELETE RESTRICT`.
- `GET /api/users` và `GET /api/users/{id}` đọc User kèm Grade và trả `gradeId`, `gradeName`. Đổi tên Grade không cần cập nhật từng Student.
- Add Student tiếp tục dùng `POST /api/users/students` atomic của Task 03, nay lưu Grade ID vào profile bên cạnh enrollment. Chọn khối rỗng vẫn được tạo hồ sơ trước nếu không chọn lớp.
- Edit Student dùng **API có sẵn `PUT /api/users/{id}`**, bổ sung `gradeId` khi người dùng thay đổi trường khối. Grade phải tồn tại; khi đọc lại bằng request/DbContext mới vẫn trả ID đã lưu và tên hiện hành.
- Trường Student hiển thị nhãn **Khối lớp** trong Add/Edit/chi tiết. Không thay nhãn chuyên môn của hồ sơ không phải Student.
- Frontend chỉ báo thành công khi phản hồi Create/Edit xác nhận Grade ID được yêu cầu. Backend cũ bỏ qua field mới hoặc trả sai Grade không được coi là lưu thành công.
- Cùng một catalogue dùng cho Add/Edit/filter/bảng/chi tiết/context liên kết. Tải khi vào màn hình, khi mở Add/Edit và khi cửa sổ lấy lại focus; có nút tải lại khi API lỗi. Phản hồi cũ không ghi đè request catalogue mới hơn.
- Filter đối chiếu ID chính xác; có trạng thái chưa liên kết/khối không hợp lệ. Sorting Khối A–Z/Z–A dùng tên Grade thật và ID làm tie-break, hỗ trợ cả Grade mới; hồ sơ chưa xác định khối nằm cuối.

Ví dụ cập nhật:

```json
{
  "fullName": "Học sinh minh họa",
  "role": "student",
  "gender": "male",
  "status": "active",
  "gradeId": 13
}
```

Các trường phone/email tiếp tục được form gửi như trước. Nếu `gradeId` **không có trong JSON**, backend giữ nguyên Grade; nếu được gửi `null`, trường khối nullable được để trống, không thay đổi enrollment. Không đánh đồng hai trường hợp. Client cũ chỉ sửa thông tin khác sẽ không vô tình xóa Grade đã lưu.

## Dữ liệu cũ và enrollment

- Migration không backfill và không cập nhật `specialty`. Hồ sơ cũ có `grade_id = NULL`, hiển thị **Chưa liên kết khối**, kèm **Dữ liệu cũ: ...** giữ đúng nội dung gốc, kể cả `Class 7`.
- `Class 7` không còn là option Grade hoặc cơ sở filter. Không tự suy đoán Grade ID từ số 7, vị trí catalogue, tên gần giống hoặc enrollment.
- Trong Edit, dữ liệu cũ được ghi chú; người dùng chủ động chọn Grade thực tế để tạo liên kết. Backend vẫn giữ specialty gốc sau khi đã chọn Grade mới.
- ID Grade không có trong catalogue được đánh dấu **Khối không còn hợp lệ (#ID)**. Không thay bằng Grade khác. Khi catalogue chưa tải/không xác minh được, dùng trạng thái chờ/chưa xác minh, không kết luận nhầm Grade bị xóa.
- FK mới và kiểm tra trong GradeRepository ngăn xóa Grade đang được Student sử dụng, kể cả Grade không có Class. Đây là thay đổi tối thiểu cần thiết để bảo vệ quan hệ mới; không thiết kế lại Grade Management.
- Edit User chạy trong transaction `Serializable`, kiểm tra Grade được gửi có tồn tại và hồ sơ là Student. **Không truy vấn, chặn, xóa, chuyển hay sửa enrollment khi đổi khối phổ thông.** Các lớp đang học hoặc lịch sử ở khối khác không cản trở cập nhật hồ sơ.
- Add Student vẫn kiểm tra mọi Class được chọn thuộc Grade đang chọn, tồn tại và có trạng thái nhận ghi danh; lưu Student cùng enrollment trong transaction như Task 03.
- Grade của Student có thể khác Grade của các lớp đã ghi danh sau khi hồ sơ được cập nhật. Đây là kết quả đúng theo hai ý nghĩa Grade đã chốt, không phải lỗi cần tự sửa dữ liệu.

## Liên kết phụ huynh–học sinh

General modal:

- Parent: `-- Chọn phụ huynh --`.
- Student: `-- Chọn học sinh --`.
- Quan hệ mới: **Mẹ (Mother)**; giữ các lựa chọn Bố, người giám hộ và người thân khác.

Mở từ một dòng Student/Parent vẫn giữ đối tượng dòng đó làm ngữ cảnh do người dùng chủ động chọn, không lấy ngẫu nhiên người ở đầu danh sách. Phía còn lại chưa chọn. Không thêm actor Parent hoặc thay Authentication/Authorization.

Khi chọn cặp đã tồn tại, form nạp đúng relationship và isPrimaryContact đã lưu, hiển thị thông báo đang cập nhật liên kết. Quan hệ cũ không nằm trong các option phổ biến vẫn được giữ và hiển thị.

`POST /api/parentstudents` vẫn là API có sẵn:

- `updateExisting: false` hoặc không gửi: tạo liên kết mới. Cặp đã tồn tại trả HTTP 409; không ghi đè quan hệ.
- `updateExisting: true`: cập nhật liên kết được chọn; liên kết bị xóa ở phiên khác sẽ báo xung đột, không âm thầm tạo lại.
- Khi cập nhật mà JSON không có relationship hoặc isPrimaryContact, backend giữ giá trị đã lưu. Default Mother chỉ áp dụng cho tạo mới.
- Frontend bắt buộc chọn đủ hai người trước khi gọi API. Backend kiểm tra ID dương, người tồn tại và đúng role parent/student. Không dùng dữ liệu mẫu thay lựa chọn.
- Transaction và composite PK sẵn có ngăn tạo cặp trùng. Lỗi duplicate báo rõ; lỗi lưu database yêu cầu tải lại/thử lại. Không sửa primary contact của các liên kết khác ngoài cặp đang chọn.

## Migration chờ phê duyệt

Source đã chuẩn bị:

- `Capstone2/backend/Migrations/20261107061101_AddStudentGrade.cs`.
- Designer tương ứng và `EduTrackDbContextModelSnapshot.cs`.

Thay đổi schema duy nhất:

```sql
ALTER TABLE users ADD grade_id int NULL;
CREATE INDEX IX_users_grade_id ON users (grade_id);
ALTER TABLE users ADD CONSTRAINT FK_users_grades_grade_id
  FOREIGN KEY (grade_id) REFERENCES grades (grade_id) ON DELETE RESTRICT;
```

EF còn ghi nhận migration trong `__EFMigrationsHistory`. Không có UPDATE/DELETE dữ liệu User, Grade, enrollment, Tuition hoặc Payment. Nullable giúp hồ sơ cũ được giữ nguyên. Migration được scaffold bằng design-time factory **chỉ trong bản sao tạm**, dùng server version cố định và connection offline; không đọc appsettings thật hoặc khởi động API/DbSeeder. Factory tạm không nằm trong repository.

Trước khi áp dụng database chính cần người dùng phê duyệt sau khi review migration và kết quả test. Khi đó mới thực hiện preflight đúng server/schema, backup, xác minh migration nền `AddGradeClassification`, xác nhận chưa có cột/index/FK trùng, lên lịch cập nhật schema và backend tương ứng. Không chạy source backend mới trên schema cũ vì truy vấn User nay cần `users.grade_id`.

MySQL DDL có implicit commit; không coi transaction SQL là rollback DDL đầy đủ. `Down` sẽ bỏ cột Grade mới, vì vậy không dùng như thao tác rollback mặc định sau khi đã gán Grade cho Student; cần backup/phương án bảo toàn các ID mới trước. Không có bước backfill tự động; nếu muốn backfill hàng loạt phải review mapping và xin phê duyệt riêng.

## File thay đổi trong bản sửa này

Các thay đổi Task 03 ban đầu vẫn đang chưa commit. Danh sách dưới đây mô tả phần sửa thêm so với trạng thái Task 03 khi bắt đầu yêu cầu này.

| File | Nội dung |
| --- | --- |
| `Capstone2/frontend/src/GUIs/pages/admin/CenterManager/CenterManagerStudentPage.tsx` | Wrapper dùng page chung. |
| `Capstone2/frontend/src/GUIs/pages/admin/AdminStaff/AdminStaffStudentPage.tsx` | Wrapper dùng page chung. |
| `Capstone2/frontend/src/GUIs/pages/admin/shared/StudentManagementPage.tsx` | Giữ layout, đồng bộ các vị trí Grade, sửa link defaults và hiển thị lỗi trong modal. |
| `Capstone2/frontend/src/GUIs/components/management/StudentGradeSelect.tsx` | Dropdown Grade động, legacy/unknown/loading/error. |
| `Capstone2/frontend/src/GUIs/hooks/useStudentGrades.ts` | Catalogue chung, refresh/focus, bảo vệ phản hồi cũ. |
| `Capstone2/frontend/src/BLL/services/studentGradeService.ts` | Nhãn Grade, ghi chú dữ liệu cũ, filter ID và sorting. |
| `Capstone2/frontend/src/BLL/services/parentStudentLinkService.ts` | State rỗng, Mother cho tạo mới, nạp quan hệ cũ và validate selection. |
| `Capstone2/frontend/src/GUIs/hooks/useStudentEnrollment.ts` | Nhận Grade ID trực tiếp thay specialty. |
| `Capstone2/frontend/src/BLL/services/studentEnrollmentService.ts` | Bỏ hàm suy luận Grade từ chuỗi. |
| `Capstone2/frontend/src/GUIs/components/management/StudentEnrollmentSection.tsx` | Hướng dẫn chọn Grade khi chưa chọn. |
| `Capstone2/frontend/src/BLL/models/UserDto.ts` | Thêm Grade ID/name. |
| `Capstone2/frontend/src/api/managementApi.ts` | Grade update, xác nhận Grade trong response, cờ updateExisting. |
| `Capstone2/frontend/src/DAL/managementDAL.ts` | Chuyển tiếp Grade ID và cờ cập nhật link. |
| `Capstone2/backend/Models/Entities/User.cs` | Grade ID nullable/navigation. |
| `Capstone2/backend/Models/EF/EduTrackDbContext.cs` | FK restrict và index Grade của User. |
| `Capstone2/backend/Models/DTOs/UserDto.cs` | Trả Grade ID/name. |
| `Capstone2/backend/Models/DTOs/Management/UpdateUserDto.cs` | Phân biệt không gửi Grade và gửi null. |
| `Capstone2/backend/Models/DTOs/Management/AssignParentStudentDto.cs` | Validate ID; Mother default và cờ phân biệt field được gửi khi cập nhật. |
| `Capstone2/backend/Services/Implementation/UserService.cs` | Đọc tên Grade từ quan hệ thật. |
| `Capstone2/backend/Services/Management/Implementation/ManagementUserService.cs` | Lưu Grade, giữ legacy text, bảo vệ default của link cũ. |
| `Capstone2/backend/Repositories/Interfaces/IUserRepository.cs` | Grade update intent. |
| `Capstone2/backend/Repositories/Implementation/UserRepository.cs` | Include Grade, lưu khối phổ thông độc lập; Edit không thay đổi enrollment. |
| `Capstone2/backend/Repositories/Interfaces/IParentStudentRepository.cs` | Create/update intent và giữ field bị bỏ qua. |
| `Capstone2/backend/Repositories/Implementation/ParentStudentRepository.cs` | Validate người/role, chống trùng, bảo vệ quan hệ cũ. |
| `Capstone2/backend/Repositories/Implementation/GradeRepository.cs` | Ngăn xóa Grade đang có Student tham chiếu. |
| `Capstone2/backend/Controllers/Management/ManagementUsersController.cs` | HTTP 409/503 cho xung đột/lỗi liên quan. |
| `Capstone2/backend/Migrations/20261107061101_AddStudentGrade.cs` | Migration chờ phê duyệt. |
| `Capstone2/backend/Migrations/20261107061101_AddStudentGrade.Designer.cs` | Target model của migration. |
| `Capstone2/backend/Migrations/EduTrackDbContextModelSnapshot.cs` | Snapshot khớp User Grade mapping. |
| `Capstone2/frontend/tests/studentManagement.test.mjs` | Grade ID/legacy/filter/sort và link defaults/quan hệ cũ. |
| `Capstone2/frontend/tests/studentEnrollment.test.mjs` | Cập nhật contract Grade và kiểm tra xác nhận từ backend. |
| `Capstone2/frontend/tests/studentEnrollment.browser.mjs` | Enrollment regression + Grade/link cho hai role và ba viewport. |
| `Capstone2/backend.Tests/StudentEnrollment/Program.cs` | DTO, migration, Grade edit/refresh/rename/custom/legacy/enrollment và links. |
| `Capstone2/backend.Tests/StudentEnrollment/Run-IsolatedMySql.ps1` | Tự dựng instance test riêng, xác minh đích và dừng đúng instance sau test. |
| `.gitignore` | Theo dõi script test mới; không đưa bin/obj/data directory vào Git. |
| `docs/EDUTRACK_TASK03_STUDENT_ENROLLMENT.md` | Gắn chú thích báo cáo gốc đã được thay thế ở phần Grade. |
| `docs/EDUTRACK_TASK03_GRADE_LINK_FIX.md` | Báo cáo hiện tại. |

Không sửa source Authentication/Authorization, Tuition, Dashboard, Reports hoặc component liên kết của actor Parent. Workflow CI đã thiết lập từ Task 03 tiếp tục chạy frontend tests và console harness mặc định, không chạy MySQL/migration trong GitHub Actions.

## Kết quả kiểm thử

Frontend được kiểm tra trên bản sao tạm không chứa `.env`, cài sạch từ lockfile; Node 24.19.0, npm 11.17.0. Backend dùng SDK **8.0.427**, build ra thư mục tạm, không restart API chính.

| Kiểm tra | Kết quả |
| --- | --- |
| `npm ci` | Đạt; không đổi lockfile. |
| `npm run lint` | Đạt, 0 error; 190 warning có sẵn, không thêm warning mới. |
| `npm run typecheck` | Đạt. |
| `npm test` | **96 pass**, không fail/skip. |
| `npm run build` | Đạt; còn cảnh báo bundle lớn hơn 500 kB. |
| Chrome browser, intercept API | **12 nhóm kịch bản**: 2 role × 3 viewport × enrollment regression/Grade-link. |
| Restore/build API + hai harness, SDK 8 | Đạt; còn 3 warning CS8601 cũ ở API và NU1900 của bước NuGet audit khi dịch vụ không truy cập được. |
| Tuition harness | **18 assertion đạt**, không database. |
| Enrollment/DTO/migration harness mặc định | **26 assertion đạt**, không database; kiểm tra cả phạm vi Up/Down. |
| Harness `--mysql` | **73 assertion đạt**: migration trên dữ liệu giả có sẵn, fingerprint dữ liệu cũ, Edit Grade độc lập, giữ lịch sử, Down/Up khi chưa gán Grade và native dump/restore với Grade đã gán. |
| `git diff --check` | Đạt. |

Browser dùng API fixture để kiểm tra giao diện và request; MySQL harness dùng production repository/service/controller/User DTO thật. Kiểm tra refresh ở browser nạp lại dữ liệu đã lưu trong fixture; bằng chứng persist thật nằm ở harness MySQL đọc qua DbContext mới. Chưa chạy đăng nhập tài khoản thật hoặc browser qua API HTTP thật; Authentication/Authorization không thuộc bản sửa. Không có GitHub Actions run cho source chưa commit này.

Instance MySQL test được tạo mới ở loopback `127.0.0.1:33308`, data directory `edutrack-enrollment-mysql-*` và schema ngẫu nhiên `edutrack_enrollment_test_*`. Chỉ có dữ liệu giả; không đọc connection string ứng dụng hoặc copy dữ liệu thật. Harness kiểm tra port/data directory trước ghi; runner từ chối dùng port đang có server khác. Schema test được dọn, đúng instance test được dừng sau khi kiểm tra. **Không chạy migration hoặc ghi dữ liệu vào database chính.**

Chạy lại kiểm thử database sau khi build harness trên Windows:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File Capstone2/backend.Tests/StudentEnrollment/Run-IsolatedMySql.ps1 -TestAssemblyPath <absolute-path-to-StudentEnrollment.Tests.dll>
```

Script cần MySQL Server 8 local; có thể truyền `-MySqlBin` và `-DotnetPath`. ExecutionPolicy chỉ áp dụng cho tiến trình chạy script; không sửa policy hệ thống. Mặc định harness không có `--mysql` sẽ chỉ chạy assertion không database.

## Kiểm thử thủ công và phần chờ phê duyệt

Trên môi trường test đã có migration, thực hiện bằng cả Center Manager và Admin Staff:

1. Add Student: Grade chỉ gồm danh mục thật; thêm/đổi tên Grade rồi trở lại Student Management hoặc focus cửa sổ. Kiểm tra mọi vị trí hiển thị cập nhật cùng tên.
2. Edit Student chưa có enrollment: chọn Grade mới, lưu, mở lại và refresh trang; tên/ID phải giữ đúng. Thử Grade custom và Grade ID không bằng số khối.
3. Lọc theo từng ID và sắp xếp Khối A–Z/Z–A, kể cả Grade mới, hồ sơ chưa liên kết và ID không hợp lệ trên fixture/test.
4. Hồ sơ specialty cũ: hiển thị nguyên văn dữ liệu cũ, không tự chọn Grade; sửa thông tin khác không mất specialty. Chọn Grade rõ ràng rồi lưu, kiểm tra Grade ID và specialty gốc trong test DB.
5. Student có enrollment đang học hoặc lịch sử ở khối khác: đổi Grade phải thành công; mở lại/refresh xác nhận Grade mới và đối chiếu mọi trường enrollment không đổi. Add Student chọn Class khác Grade vẫn phải bị từ chối.
6. General link modal: cả hai select trống, mặc định Mẹ; thiếu một bên không gọi API. Contextual modal giữ người đã chọn từ dòng và không chọn sẵn người còn lại.
7. Chọn cặp có liên kết Bố/Guardian/custom và primary contact đã lưu; kiểm tra giá trị cũ, lưu không sửa phải giữ đúng. Tạo cặp mới phải dùng Mẹ; thử request tạo trùng phải bị từ chối, không đổi quan hệ cũ.
8. Kiểm tra Add Parent, unlink và các trường Student không liên quan Grade vẫn như trước; kiểm tra modal trên màn hình hẹp.

**Kiến trúc Student–Grade đã được người dùng chốt. Chờ phê duyệt riêng:** thao tác áp dụng migration vào database chính và, nếu cần, kế hoạch backfill được review riêng. Source đã chuẩn bị và test nhưng chưa triển khai schema/main API; không coi chức năng mới đã chạy được trên schema chính chưa nâng cấp. Người dùng xem [báo cáo quyết định và kế hoạch database](EDUTRACK_TASK03_STUDENT_GRADE_DECISION.md) rồi quyết định bước tiếp theo; không commit/push/merge.
