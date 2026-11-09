# Task 03 — Đăng ký lớp khi thêm học sinh

> Kết quả mới nhất: migration development đã áp dụng ở lượt được duyệt; HTTP smoke, integration và browser với API/MySQL thật đã đạt. Xem [báo cáo tổng hợp Task 03](EDUTRACK_TASK03_FINAL_REPORT.md). Các trạng thái chờ phê duyệt/chưa triển khai bên dưới thuộc báo cáo lịch sử.

> Báo cáo dưới đây ghi nhận phiên bản Task 03 ban đầu. Bản sửa Grade động, lưu Grade ID trong Student và mặc định liên kết phụ huynh–học sinh được mô tả tại [EDUTRACK_TASK03_GRADE_LINK_FIX.md](EDUTRACK_TASK03_GRADE_LINK_FIX.md). Phương án ánh xạ `Class N` ở báo cáo cũ đã được thay thế; migration Student Grade đang chờ phê duyệt trước khi áp dụng database chính.

> Quy tắc mới nhất đã được chốt tại [Student Grade Decision](EDUTRACK_TASK03_STUDENT_GRADE_DECISION.md): Grade hồ sơ là khối phổ thông hiện tại, độc lập với enrollment. Chỉ Add Student kiểm tra các Class được chọn cùng Grade; Edit Grade không điều chỉnh các enrollment đã có.

Ngày kiểm tra: 07/11/2026, Asia/Bangkok.

Đã bổ sung section **Đăng ký lớp học** cho Add Student của Center Manager và Admin Staff. Các trường, nhãn, lựa chọn và bố cục form cũ được giữ nguyên; section mới nằm ngay dưới Khối lớp / Chương trình học. Không mở rộng Edit Student, quản lý phụ huynh, Authentication/Authorization, Grade/Class Management, Tuition, Dashboard hoặc Reports.

## API và service

| API | Sử dụng |
| --- | --- |
| `GET /api/grades` | Dùng `gradeApi.getAll()` hiện có để xác định Grade thật từ trường khối đang chọn. |
| `GET /api/classes` | Dùng `classApi.getAll()` hiện có; lọc theo `gradeId` thật và trạng thái nhận ghi danh. Không suy đoán khối từ tên Class. |
| **`POST /api/users/students`** | Endpoint mới: tạo Student, vai trò student và toàn bộ `student_classes` trong một transaction. |
| `GET /api/users/{id}` | Khi yêu cầu gửi lại xung đột, nút **Xem hồ sơ đã lưu** lấy hồ sơ thật để người dùng kiểm tra. |
| `POST /api/users` | Luồng Add Parent và các màn hình tạo User khác tiếp tục dùng API cũ. |
| `GET /api/studentclasses` | API có sẵn chỉ hỗ trợ đọc; không thêm chuỗi request ghi danh từng lớp từ frontend. |

`IManagementUserService.CreateStudentAsync()` dùng lại cách xây dựng User/ánh xạ UserDto hiện có. `IUserRepository.CreateStudentWithClassesAsync()` bổ sung thao tác lưu graph User–UserRole–StudentClass. Không gọi API tạo Invoice/Payment/Class/Subject.

Ví dụ body endpoint mới:

```json
{
  "userCode": "STU0123456789ABCDEF0",
  "fullName": "Học sinh minh họa",
  "role": "student",
  "specialty": "Class 7",
  "gender": "male",
  "gradeId": 7,
  "classIds": [101, 102]
}
```

`userCode` dài tối đa 20 ký tự, được frontend tạo một lần cho yêu cầu và giữ nguyên khi thử lại. Có thể gửi `classIds: []`; `gradeId` có thể null khi chỉ tạo hồ sơ. Khi có lớp, backend bắt buộc Grade tồn tại và mỗi Class thuộc Grade đó. `role` phải là student.

## Luồng giao diện

1. Mở Add Student: tải catalogue Grade và danh sách Class thật, hiển thị loading.
2. Trường khối cũ vẫn có các giá trị `Class 7`, `Class 8`, `Class 9`, `Class 12`. Ánh xạ tên tương ứng `Class/Grade/Khối/Lớp N` sang **bản ghi trong catalogue**, không mặc định Grade ID bằng N. Ví dụ `Khối 7` có ID 70 thì gửi 70.
3. Chỉ hiện Class của Grade đó, có trạng thái `active` hoặc `upcoming`. API hiện tại chưa có command ghi danh hay policy ghi danh riêng; whitelist này theo các trạng thái Class đang hoạt động/sắp mở. Các trạng thái inactive/completed/cancelled/không biết và Class chưa phân khối đều bị loại.
4. Checkbox từng lớp, Chọn tất cả/bỏ chọn tất cả, trạng thái chọn một phần và số lớp đã chọn dùng chung cho hai vai trò. Danh sách dài cuộn trong section.
5. Đổi khối sẽ xóa lựa chọn ngay và tải lại dữ liệu. Phản hồi cũ đến muộn không được ghi đè Grade mới. Đóng/mở lại form hoặc tải lại danh sách cũng xóa lựa chọn.
6. API lỗi, danh sách trống và không xác định được Grade có thông báo riêng. Có nút tải lại. Vẫn có thể tạo hồ sơ không chọn lớp khi catalogue lỗi.
7. Chỉ sau khi endpoint atomic xác nhận kết quả hợp lệ mới đóng form và báo thành công. Lỗi lưu nằm ngay trong modal; dữ liệu form và lựa chọn được giữ lại để xử lý.

**Giới hạn có chủ đích do yêu cầu giữ nguyên trường cũ:** không thêm option Grade mới hoặc dropdown thứ hai. Nếu Grade được đổi sang tên không còn tương ứng với option cũ, hoặc có nhiều tên tương ứng gây mơ hồ, section báo không xác định được Grade và không cho chọn nhầm lớp. Tạo hồ sơ không chọn lớp vẫn dùng specialty cũ. Việc chuyển trường khối sang danh mục động cần task riêng.

## Transaction, lỗi và gửi lại

- Transaction `Serializable` bao phủ đọc/kiểm tra và toàn bộ ghi dữ liệu. Trên MySQL/InnoDB, shared lock từ các truy vấn Class/Grade được giữ đến commit, ngăn đổi khối/trạng thái giữa kiểm tra và ghi danh.
- Backend kiểm tra Class tồn tại, đúng Grade, trạng thái đủ điều kiện; loại ID trùng bằng `Distinct()`. Dùng unique index `(student_id, class_id)` và `user_code` đã có trong model/database, không cần migration mới.
- Tạo graph User + vai trò student + các StudentClass rồi `SaveChangesAsync()` và commit. StudentClass có `status = active` và ngày ghi danh UTC. Lỗi sẽ rollback toàn bộ, không để lại Student riêng lẻ.
- HTTP 400: dữ liệu/Grade/Class không hợp lệ; thông báo nêu lớp thiếu, sai khối hoặc ngừng nhận ghi danh.
- HTTP 503 hoặc lỗi kết nối: chưa xác nhận kết quả; giữ nguyên form, bấm Lưu hồ sơ để gửi lại cùng mã. Không thông báo đã lưu thành công một phần.
- Mã yêu cầu được giữ trong bộ nhớ và `sessionStorage` của tab; chỉ lưu mã, không lưu tên/điện thoại/email vào storage mới. Nếu storage bị chặn, form đang mở vẫn giữ mã trong bộ nhớ.
- Nếu mã đã tồn tại và hồ sơ cùng tập lớp khớp, trả lại cùng Student ID, không insert User hay quan hệ mới. Thứ tự Class và ID lặp không ảnh hưởng phép đối chiếu.
- Nếu mã đã tồn tại nhưng nội dung khác: HTTP 409 với `code = student_creation_conflict` và định danh hồ sơ đã lưu. Không áp dụng thay đổi mới. Nút **Xem hồ sơ đã lưu** lấy lại User thật, hiển thị bằng modal chi tiết sẵn có rồi kết thúc yêu cầu cũ và dọn form. Nếu tải hồ sơ lỗi, vẫn giữ mã và cho thử xem lại.
- Hai request đồng thời được unique index bảo vệ. Một request có thể gặp deadlock/unique-key conflict và nhận lỗi để thử lại; kiểm thử xác nhận chỉ có một Student và một quan hệ cho mỗi Class sau khi gửi lại.
- Đây là cơ chế chống lặp cho luồng tạo mới, không phải endpoint chỉnh sửa Student đã tồn tại. Không tự gửi tiếp sang Add Student API cũ nếu endpoint mới lỗi.

## File thay đổi

Các đường dẫn dưới đây tính từ root repository.

| File | Nội dung |
| --- | --- |
| `Capstone2/frontend/src/GUIs/pages/admin/CenterManager/CenterManagerStudentPage.tsx` | Gắn section mới, gọi lưu atomic, hiển thị lỗi và mở hồ sơ đã lưu khi xung đột. |
| `Capstone2/frontend/src/GUIs/pages/admin/AdminStaff/AdminStaffStudentPage.tsx` | Cùng chức năng cho Admin Staff. |
| `Capstone2/frontend/src/GUIs/components/management/StudentEnrollmentSection.tsx` | Checkbox, chọn tất cả, đếm, loading/empty/error, danh sách responsive. |
| `Capstone2/frontend/src/GUIs/hooks/useStudentEnrollment.ts` | Tải catalogue, bảo vệ phản hồi cũ, reset lựa chọn và giữ mã yêu cầu. |
| `Capstone2/frontend/src/BLL/services/studentEnrollmentService.ts` | Ánh xạ khối, lọc lớp đủ điều kiện, chọn/bỏ chọn không trùng. |
| `Capstone2/frontend/src/api/managementApi.ts` | Request atomic, kiểm tra phản hồi, lỗi kết nối và xung đột có thể phục hồi. |
| `Capstone2/frontend/src/DAL/managementDAL.ts` | Thêm `createStudent()` dùng API thật. |
| `Capstone2/backend/Models/DTOs/Management/CreateStudentDto.cs` | Profile hiện có + `GradeId` + `ClassIds`. |
| `Capstone2/backend/Controllers/Management/ManagementUsersController.cs` | Endpoint mới và phản hồi 400/409/503. |
| `Capstone2/backend/Services/Management/Interfaces/IManagementUserService.cs` | Khai báo tạo Student atomic. |
| `Capstone2/backend/Services/Management/Implementation/ManagementUserService.cs` | Validate Student request, dùng lại xây dựng User và ánh xạ DTO. |
| `Capstone2/backend/Services/Management/StudentEnrollmentPolicy.cs` | Policy Grade/Class/status và lỗi xung đột có định danh Student. |
| `Capstone2/backend/Repositories/Interfaces/IUserRepository.cs` | Khai báo lưu Student cùng nhiều lớp. |
| `Capstone2/backend/Repositories/Implementation/UserRepository.cs` | Transaction, kiểm tra backend, chống lặp và lưu graph. |
| `Capstone2/frontend/tests/studentEnrollment.test.mjs` | Unit/contract tests mới. |
| `Capstone2/frontend/tests/studentEnrollment.browser.mjs` | Browser tests với API giả lập, không truy cập API/database thật. |
| `Capstone2/backend.Tests/StudentEnrollment/Program.cs` | Policy checks mặc định; `--mysql` chạy integration trên database test độc lập. |
| `Capstone2/backend.Tests/StudentEnrollment/StudentEnrollment.Tests.csproj` | Console harness tham chiếu production code; EF Relational 8.0.8 khớp API. |
| `Capstone2/backend.Tests/TuitionPolicy.Tests.csproj` | Loại source harness mới khỏi compile của Tuition harness cũ. |
| `.gitignore` | Cho phép theo dõi source/csproj harness mới; bin/obj vẫn bị ignore. |
| `.github/workflows/ci.yml` | Thêm restore/build/chạy enrollment policy harness không database vào Backend CI. Frontend tự nhận test mới qua glob có sẵn. |
| `docs/EDUTRACK_TASK03_STUDENT_ENROLLMENT.md` | Báo cáo này. |

## Kết quả kiểm tra

Frontend được kiểm tra trên bản sao source riêng trong thư mục tạm, không sao chép `.env`; cài sạch từ lockfile. Node 24.19.0, npm 11.17.0. Backend build bằng SDK **8.0.427**; không khởi động API chính hoặc DbSeeder.

| Kiểm tra | Kết quả |
| --- | --- |
| `npm ci` | Đạt; lockfile không thay đổi. |
| `npm run lint` | Đạt, 0 error; 190 warning hiện có, không thêm warning trong file mới. |
| `npm run typecheck` | Đạt. |
| `npm test` | 90 test đạt, không fail/skip; gồm 8 test enrollment mới. |
| `npm run build` | Đạt; còn cảnh báo bundle trên 500 kB. |
| Browser Chrome, API intercept | 6 nhóm kịch bản: Center Manager/Admin Staff × desktop 1440, tablet 768, mobile 390. Kiểm tra fields cũ, chọn 1/nhiều/tất cả/bỏ tất cả, đổi khối, phản hồi cũ, empty/error, gửi lại, mở hồ sơ đã lưu, cuộn đến nút Save và Add Parent. |
| Restore/build API + hai console harness bằng SDK 8 | Đạt. API còn 3 warning CS8601 cũ; NuGet NU1900 vì không truy cập được dịch vụ dữ liệu lỗ hổng, không coi đây là kiểm chứng dependency security. |
| Tuition harness hiện có | 18 assertion đạt, không database. |
| Enrollment harness mặc định | 19 assertion policy đạt, không database. |
| Enrollment harness `--mysql` | 36 assertion đạt, gồm controller, dữ liệu quan hệ, chống trùng/retry, concurrent submit và rollback. |
| Workflow `actionlint` | Đạt sau khi thêm bước enrollment. |
| `git diff --check` | Đạt. |

Browser tests dùng fixture để kiểm tra React và request; MySQL tests dùng repository/service/controller thật để kiểm tra tính nhất quán. Chưa chạy browser qua API HTTP thật hoặc đăng nhập tài khoản thật. Chưa có GitHub Actions run cho thay đổi chưa commit này.

MySQL test dùng **instance riêng** bind `127.0.0.1:33308`, data directory tạm mới và schema tên ngẫu nhiên `edutrack_enrollment_test_*`, chỉ có dữ liệu tổng hợp. Harness kiểm tra port/data directory trước ghi, không đọc connection string ứng dụng. `EnsureCreated`/`EnsureDeleted` chỉ tạo/dọn schema test này; không chạy EF migration hay SQL migration sản phẩm. Kiểm thử tiêm lỗi sau INSERT User và khi INSERT StudentClass để chứng minh rollback thực tế; TuitionInvoice/Payment đều giữ 0. Instance test được tắt sau kiểm tra.

## Cần kiểm thử thủ công

Trên môi trường test được cấu hình riêng, thực hiện bằng cả tài khoản Center Manager và Admin Staff:

1. Chọn Class 7 (khối 7); đối chiếu danh sách với Grade–Class thật. Xác nhận lớp inactive/completed/cancelled/chưa phân khối không xuất hiện.
2. Chọn một, nhiều, chọn tất cả và bỏ tất cả; kiểm tra số lượng. Chuyển sang khối 8 rồi về khối 7; lựa chọn cũ phải được xóa.
3. Lưu hồ sơ không chọn lớp và hồ sơ chọn nhiều lớp. Kiểm tra `users`, `user_roles`, `student_classes` trong **database test**, bảo đảm không có cặp Student–Class trùng và không phát sinh TuitionInvoice/Payment.
4. Khi form đang mở, đổi trạng thái/Grade hoặc xóa Class ở phiên test khác rồi Save; backend phải từ chối và không để lại hồ sơ một phần.
5. Giả lập mất mạng/API 503 và mất phản hồi sau commit; giữ form, gửi lại. Phải chỉ có một Student. Thay đổi nội dung sau lần lưu đã commit rồi gửi lại: phải báo xung đột và mở được đúng hồ sơ bằng **Xem hồ sơ đã lưu**.
6. Kiểm tra danh sách lớp dài, màn hình hẹp và cuộn đến nút Save. Kiểm tra Add Parent/Edit Student/liên kết phụ huynh vẫn hoạt động như trước.

Không migration, commit, push, merge hoặc ghi dữ liệu thử vào database chính trong task này.
