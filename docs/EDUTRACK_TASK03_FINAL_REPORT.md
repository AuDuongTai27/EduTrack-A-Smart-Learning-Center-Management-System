# Task 03 — Báo cáo tổng hợp triển khai và kiểm thử

Ngày kiểm tra: 07/11/2026, Asia/Bangkok.

**Cập nhật mới nhất — quản lý enrollment trong Edit Student:** đã bổ sung section **Lớp học tại trung tâm**, xem toàn bộ lịch sử, đăng ký thêm và xác nhận ngừng học riêng. Frontend 101 test, backend/integration/HTTP 104 assertion và browser thật 6 nhóm đạt. Chi tiết thao tác, API và các giới hạn giữ lịch sử tại mục 7 bên dưới.

**Phần triển khai Task 03 và các kịch bản kiểm thử dưới đây đã đạt. HTTP smoke test còn thiếu đã hoàn tất; browser đã chạy qua API HTTP thật và MySQL test độc lập. Không còn lỗi Task 03 đã biết trong các kịch bản đã kiểm tra. Chưa coi đây là nghiệm thu 100%: chưa kiểm thử đăng nhập/phân quyền bằng tài khoản thật hoặc chạy GitHub Actions từ một commit.** Không commit/push/merge.

Backend bản mới đang chạy ở **http://localhost:5036**, PID **29376**, bỏ qua sample seeder theo tiến trình. Tiến trình smoke cũ đã không còn chạy; cổng 5036 được xác minh trống trước khi khởi động bản mới, không dừng tiến trình khác. Database phát triển không nhận dữ liệu thử hoặc thay đổi schema trong lượt hoàn tất này; migration AddStudentGrade đã chạy ở lượt được duyệt trước, **không chạy lại**.

## 1. Chức năng đã hoàn thành

| Phần | Hành vi cuối cùng và bằng chứng |
| --- | --- |
| Add Student | Giữ các trường/layout hiện có; dropdown Khối lớp dùng Grade thật. Section Đăng ký lớp học có checkbox một/nhiều/tất cả, đếm, loading/empty/error/retry, loại lớp không đủ trạng thái và xóa lựa chọn khi đổi khối. Có thể tạo hồ sơ không chọn Class, kể cả có Grade nhưng chưa enrollment. |
| Lưu Student và enrollment | POST `/api/users/students` tạo User/vai trò/StudentClass trong transaction Serializable. Backend kiểm tra Grade/Class/status, loại ID lặp, chống trùng quan hệ. Lỗi ghi danh rollback toàn bộ. Không tạo Invoice/Payment/Class/Subject. |
| Retry và lỗi lưu | Giữ mã yêu cầu khi chưa xác nhận kết quả. Gửi lại cùng nội dung trả đúng Student ID; nội dung khác trả 409 với định danh hồ sơ đã lưu để xem lại. Không báo thành công khi mới lưu được một phần; không fallback sang luồng tạo User cũ. |
| Student Grade | Nguồn dữ liệu là users.grade_id nullable. GET User trả gradeId/gradeName từ quan hệ thật; Grade độc lập với student_classes. Specialty cũ được giữ, không dùng làm nguồn Grade hoặc suy ID. |
| Edit Student | Hiển thị/lưu Grade ID thật bằng PUT `/api/users/{id}`, mở lại/refresh vẫn đúng. Omit gradeId giữ giá trị cũ; null có thể gỡ Grade. PUT hồ sơ không query/chuyển/xóa enrollment. Section Lớp học tại trung tâm đọc toàn bộ lịch sử và dùng command riêng để thêm/ngừng học có chủ đích. |
| Đồng bộ Grade | Add/Edit/bảng/filter/sort/details dùng chung catalogue GET `/api/grades`. Thêm/đổi tên Grade được phản ánh khi refresh catalogue/focus. Filter theo ID; sort theo tên thực tế và numeric collation. Legacy/Grade không xác định có nhãn riêng, không tự ánh xạ. |
| Parent–Student Linking | Modal chung bắt đầu chưa chọn Parent/Student; Mother cho liên kết mới. Contextual modal chỉ giữ đối tượng dòng do người dùng chọn. Cặp đã có nạp relationship/contact thật; thiếu ID, sai role hoặc tạo trùng bị từ chối. Update bỏ field giữ dữ liệu cũ. |
| Hai role | Center Manager/Admin Staff dùng chung StudentManagementPage, hook, component và service. Cả hai route đã qua browser giả lập và browser với API thật ở desktop/tablet/mobile. |
| Regression Add Parent | Giữ form/API hiện có; sửa mã Parent tự sinh để hai lần tạo liên tiếp không đụng unique user_code. Hai Parent được tạo thành công qua HTTP thật trong test. |

Mỗi Class vẫn có một Subject và một Grade; không tạo Class đa môn. Không mở rộng sang Tuition, Attendance, Dashboard hoặc Reports; các API đọc liên quan chỉ được dùng để xác nhận lỗi thiếu cột đã hết.

## 2. Lỗi phát hiện và khắc phục

| Lỗi | Nguyên nhân | Xử lý |
| --- | --- | --- |
| Add Parent lần thứ hai cùng phút thất bại | Mã mặc định PARMMddHHmm trùng unique index users.user_code. HTTP test thật tái hiện được duplicate entry. | Chỉ khi role=parent và caller không gửi userCode: sinh PAR + phần GUID, tối đa 20 ký tự. Mã caller gửi và cách sinh mã của role khác được giữ. Hai request liên tiếp đã đạt. |
| Browser HTTP test chọn cặp trước khi danh sách tải xong | Test đợi toolbar render, rồi gán value cho select khi option chưa tồn tại sau reload. Đây là lỗi đồng bộ trong test, không phải quan hệ đã lưu bị mất. | Đợi row dữ liệu thật sau reload trước khi chọn cặp; xác minh Father và primary-contact từ API thật, rồi lưu lại và kiểm tra không trùng. |
| Không thấy lỗi stdout/stderr của tiến trình browser con | Console harness trước đó không thu hai stream riêng của Node. | Đọc stdout/stderr bất đồng bộ, xuất kết quả khi tiến trình kết thúc; giữ artifacts khi fail. Không dừng task vì lỗi công cụ thông thường. |
| Nguy cơ test browser dùng nhầm VITE_API_URL của development | Dist do người chạy tự build có thể chứa URL API tuyệt đối. | Trước mọi ghi, đòi API loopback cổng test và Grade marker riêng; CDP chặn API ngoài proxy test. Các request application API được tiếp tục qua HTTP thật, không fulfill bằng fixture. |
| Smoke test trước đây bị dừng khi đọc log mở | ReadAllText không chia sẻ file với writer redirect. | Dùng Get-Content đọc chia sẻ file khi xác minh startup; đã cập nhật đúng tiến trình smoke do agent tạo và hoàn tất HTTP smoke. Không sửa rộng startup hoặc vô hiệu hóa seeder mặc định. |

Các lỗi Grade/enrollment/link của các lượt đầu đã được sửa trong source và kiểm tra lại trong regression: Grade hardcode/specialty, validation Edit chặn theo lịch sử, dropdown chọn người đầu tiên, default Father và upsert ghi đè quan hệ cũ.

## 3. File thay đổi

Thay đổi của bản nền Task 03; các file mới cho Edit enrollment được liệt kê tại mục 7:

| File | Nội dung |
| --- | --- |
| `Capstone2/backend/Services/Management/Implementation/ManagementUserService.cs` | Mã Parent tự sinh không còn dựa vào phút. |
| `Capstone2/backend.Tests/StudentEnrollment/HttpStudentManagementChecks.cs` | Khởi chạy API production với connection test riêng; test HTTP/DB, retry, Grade độc lập, linking, Add Parent và gọi browser. |
| `Capstone2/backend.Tests/StudentEnrollment/Program.cs` | Tùy chọn --http sau integration; mặc định CI vẫn chỉ chạy policy không DB. |
| `Capstone2/backend.Tests/StudentEnrollment/Run-IsolatedMySql.ps1` | Tùy chọn -Http/-FrontendRoot, giữ kiểm tra port/datadir và dừng đúng instance test. |
| `Capstone2/frontend/tests/studentManagement.http.browser.mjs` | Proxy tới API thật, guard không trỏ main, CDP 2 role × 3 viewport, API/DOM assertions và screenshots. |
| `docs/EDUTRACK_TASK03_FINAL_REPORT.md` | Báo cáo tổng hợp này. |
| `docs/EDUTRACK_TASK03_DATABASE_MIGRATION_RESULT.md` | Cập nhật smoke test đã hoàn tất và PID Backend mới; giữ biên bản migration lịch sử. |
| `docs/EDUTRACK_TASK03_STUDENT_ENROLLMENT.md`, `docs/EDUTRACK_TASK03_GRADE_LINK_FIX.md`, `docs/EDUTRACK_TASK03_STUDENT_GRADE_DECISION.md` | Đánh dấu báo cáo lịch sử và dẫn tới kết quả tổng hợp mới nhất. |

Những file tính năng Task 03 đã có trước lượt này và được kiểm thử lại, đường dẫn tính từ repository root:

- `Capstone2/frontend/src/GUIs/pages/admin/{CenterManager/CenterManagerStudentPage.tsx,AdminStaff/AdminStaffStudentPage.tsx,shared/StudentManagementPage.tsx}`: hai wrapper và page dùng chung.
- `Capstone2/frontend/src/GUIs/components/management/{StudentEnrollmentSection.tsx,StudentGradeSelect.tsx}`; `Capstone2/frontend/src/GUIs/hooks/{useStudentEnrollment.ts,useStudentGrades.ts}`.
- `Capstone2/frontend/src/BLL/services/{studentEnrollmentService.ts,studentGradeService.ts,parentStudentLinkService.ts}`; `Capstone2/frontend/src/BLL/models/UserDto.ts`.
- `Capstone2/frontend/src/api/managementApi.ts`; `Capstone2/frontend/src/DAL/managementDAL.ts`.
- `Capstone2/backend/Controllers/Management/ManagementUsersController.cs`; `Capstone2/backend/Services/Management/Interfaces/IManagementUserService.cs`; `Capstone2/backend/Services/Management/StudentEnrollmentPolicy.cs`; `Capstone2/backend/Services/Implementation/UserService.cs`.
- `Capstone2/backend/Models/DTOs/Management/{CreateStudentDto.cs,UpdateUserDto.cs,AssignParentStudentDto.cs}`; `Capstone2/backend/Models/DTOs/UserDto.cs`; `Capstone2/backend/Models/Entities/User.cs`; `Capstone2/backend/Models/EF/EduTrackDbContext.cs`.
- `Capstone2/backend/Repositories/Interfaces/{IUserRepository.cs,IParentStudentRepository.cs}`; `Capstone2/backend/Repositories/Implementation/{UserRepository.cs,ParentStudentRepository.cs,GradeRepository.cs}`.
- `Capstone2/backend/Program.cs`: cờ Seeding:SkipSampleData theo tiến trình, mặc định giữ nhánh seeder cũ.
- `Capstone2/backend/Migrations/{20261107061101_AddStudentGrade.cs,20261107061101_AddStudentGrade.Designer.cs,EduTrackDbContextModelSnapshot.cs}`: schema đã được duyệt ở lượt trước, không chỉnh/chạy lại trên development.
- `Capstone2/frontend/tests/{studentEnrollment.test.mjs,studentManagement.test.mjs,studentEnrollment.browser.mjs}`; `Capstone2/backend.Tests/StudentEnrollment/StudentEnrollment.Tests.csproj`; `Capstone2/backend.Tests/TuitionPolicy.Tests.csproj` (chỉ loại source enrollment khỏi harness Tuition cũ).
- `.github/workflows/ci.yml`; `.gitignore`: enrollment policy trong CI, theo dõi source test và ignore backup/bin/obj.

Các SQL review/preflight ở `Capstone2/db/migrations/AddStudentGrade.*.sql`, công cụ `Capstone2/db/tools/MySqlPrivilegeCheck/` và báo cáo Task 03 trước đó được giữ để truy nguyên; lượt này không xây thêm công cụ vận hành hoặc thay đổi migration. Không sửa source Authentication/Authorization hoặc logic Tuition/Attendance/Dashboard/Reports.

## 4. Kết quả kiểm thử

Frontend cài sạch trên bản sao tạm **không có .env**, từ lockfile: Node 24.19.0, npm 11.17.0. Backend build bằng SDK **8.0.427**. Không dùng API startup/DbSeeder để chuẩn bị dữ liệu development.

| Kiểm tra | Kết quả |
| --- | --- |
| npm ci --offline --no-audit --no-fund | Đạt; lockfile không đổi, dùng package cache. Không coi là dependency security audit. |
| npm run lint | Đạt, 0 error; **190 warning có sẵn**, không thêm warning mới. |
| npm run typecheck | Đạt. |
| npm test | **101 pass**, không fail/skip, gồm 5 test Edit enrollment mới. |
| npm run build | Đạt; 386 module, còn cảnh báo bundle >500 kB. |
| API và harness build Release | Đạt; API có 3 warning CS8601 cũ, harness không có warning mới. |
| Enrollment policy mặc định | **26 assertion** không DB, cũng nằm trong integration run. |
| Tuition harness | **18 assertion đạt**, không DB, không đổi logic module. |
| MySQL repository/service/controller + HTTP | **104 assertion đạt**, gồm regression cũ và thêm lớp trong Edit, duplicate/history, Grade cũ/mới, ngừng học, lỗi INSERT thứ hai rollback, concurrent submit. Không sinh Invoice/Payment. |
| Browser API giả lập | **12 nhóm đạt**, 2 role × 3 viewport × enrollment/Grade-link. Bổ sung lỗi API đọc enrollment trong Edit, khóa thao tác khi chưa biết lịch sử và tải lại thành công. |
| Browser → HTTP production API → MySQL test | **6 nhóm đạt**, 2 role × desktop 1440/tablet 768/mobile 390. Bao gồm regression trước và Edit enrollment: đủ active/completed/dropped khác khối; thêm lớp theo Grade đã lưu; hủy/xác nhận ngừng học; ngày/lý do còn sau reload; nút Save cuộn tới được. |
| HTTP development chỉ đọc | **8 API cũ + 1 query StudentClass scoped đều trả 200**: users (11), grades (14), classes (3), parentstudents (3), studentclasses (5), centersettings (10), tuitioninvoices (11), payments (9), query riêng cho một Student trả đúng 1 dòng của người đó. Swagger có POST/PATCH mới nhưng không gọi command trên development. |
| Sau restart/no-seed + smoke development | **25 bảng giữ nguyên fingerprint và schema metadata** so với snapshot trước restart; history không đổi. Không tạo/sửa dữ liệu test trên development. |
| CI/actionlint | Đạt actionlint; các lệnh lint/typecheck/test/build và console harness tương ứng workflow chạy được local. GitHub Actions chưa chạy vì chưa commit/push. |
| git diff --check | Đạt. |

Trong browser HTTP thật, application API không được giả lập. Proxy chuyển method/body/status tới API test; chỉ CSS/assets từ CDN dùng bản local. Có guard marker, port và chặn request ngoài test để tránh dist cấu hình nhầm development. Thực tế đủ 6 nhóm, không có lỗi proxy hoặc response >=400 trong các request qua proxy ở lần chạy đạt. Các response 400/409 mong đợi được kiểm tra riêng trong HTTP harness.

API test chạy với content root tạm rỗng, connection chỉ có server test 127.0.0.1:33308 và schema `edutrack_enrollment_test_<GUID>`. Runner xác minh datadir prefix `edutrack-enrollment-mysql-*` trước ghi. Migration/Down/Up trong harness **chỉ xảy ra trên schema test mới** để regression; không kết nối cấu hình appsettings development. Test chỉ có dữ liệu tổng hợp, không restore/copy dữ liệu development. Schema được dọn và đúng API/MySQL/Chrome test do harness tạo được dừng; Backend development PID 29376 được giữ chạy.

## 5. CI, bằng chứng và giới hạn còn lại

Workflow hiện tại tương thích: frontend glob chỉ nhận `*.test.mjs`, loại browser khỏi job offline; backend build enrollment harness mới nhưng không chạy --mysql/--http. Vì vậy CI không tự đọc appsettings hoặc cần MySQL/Chrome. Browser/HTTP integration được chạy riêng local, không tuyên bố đã có hosted CI run.

Chạy lại integration + browser trên Windows sau khi build frontend trong bản sao không có .env và build enrollment harness:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File Capstone2/backend.Tests/StudentEnrollment/Run-IsolatedMySql.ps1 -TestAssemblyPath <absolute-StudentEnrollment.Tests.dll> -DotnetPath <dotnet8.exe> -Http -FrontendRoot <absolute-frontend-copy-with-dist>
```

Script cần MySQL Server 8 local và Chrome/Node. `-Http` không có `-FrontendRoot` chạy HTTP checks; bỏ `-Http` giữ integration harness cũ. Không gọi runner này trỏ main: connection test được cố định và guard từ chối sai port/datadir/schema. Production API test nhận sample-seeding opt-out riêng, không sửa seeder toàn máy.

Bằng chứng bản nền giữ trong `edutrack-task03-e2e-49d644ed3ed843e4a9ecb01557cbee06`. Bản Edit enrollment mới nằm trong thư mục tạm `edutrack-edit-enrollment-f805e250c4d24dbb8b36b2ce5eb60323`: log lint/typecheck/test/build, `integration-http-verified.log`, `development-read-smoke.json`, source/binary test và log Backend đang chạy. Browser fixture: `edutrack-student-enrollment-pOb7SC` (12 nhóm); browser HTTP cuối: `edutrack-http-browser-gIFf1R` có `results.json`, traffic và ảnh Edit theo role/viewport; API logs: `edutrack-http-e2e-96104e94060c4df999c3e439fab6da81`. Instance test `edutrack-enrollment-mysql-7f24a5e4f5164163a0cbc68087fffa9e` đã dừng. Tất cả dữ liệu test là tổng hợp; smoke development chỉ lưu status/count, không lưu profile thật.

Snapshot đọc development và định danh Backend mới nằm dưới thư mục backup private đã Git ignore: `Capstone2/db/backups/student-grade-approved-20261107-155452/`, file `main-before-edit-enrollment-refresh.json`, `main-after-edit-enrollment-refresh.json`, `backend-edit-enrollment.json`. Backup migration đã được duyệt trước vẫn nguyên vẹn; không backup/restore hoặc DDL development mới trong lượt này. Metadata và fingerprint cả 25 bảng không đổi sau startup/GET smoke.

Giới hạn:

- Đã kiểm tra hai route Center Manager/Admin Staff với synthetic staff profile và API thật; **chưa đăng nhập tài khoản thật hoặc kiểm chứng enforcement authorization**. AuthContext/routing hiện có thuộc phần của thành viên khác, không thay đổi hoặc tự thêm bypass.
- Chưa chạy trình duyệt tương tác trên dữ liệu development thật hoặc kiểm thử ghi với tài khoản thật; mọi ghi tự động nằm trên database test. Người dùng vẫn cần nghiệm thu UI/role thực tế.
- Lint còn warning cũ; API còn 3 CS8601 cũ và frontend bundle >500 kB. Không mở rộng task để sửa các module không liên quan. NuGetAudit/npm audit không được dùng làm bằng chứng bảo mật dependency trong lượt này.
- Backend hiện chạy từ bản build test được giữ tại thư mục tạm. Nếu dọn thư mục này hoặc đổi tiến trình, build lại source và dùng `--Seeding:SkipSampleData=true` cho phiên không tạo mẫu. Không chạy thêm Backend trên cổng 5036 đang có tiến trình.

## 6. Checklist nghiệm thu ngắn

Thực hiện bằng cả Center Manager và Admin Staff trên môi trường/dữ liệu người dùng chọn:

1. Add Student: Grade thật; chọn một/nhiều/tất cả/bỏ tất cả, đổi Grade xóa lớp cũ; lưu hồ sơ không Class và hồ sơ có nhiều Class.
2. Edit Grade, mở lại và refresh; Grade mới phải giữ đúng, mọi enrollment/lịch sử vẫn nguyên vẹn. Legacy specialty không mất hoặc bị tự ánh xạ.
3. Tạo/đổi tên Grade từ Grade Management, quay lại/focus Student Management; kiểm tra tên, filter ID và sort ở mọi vị trí.
4. Tạo liên kết mới: hai select trống, Mother; thử thiếu một bên. Chọn cặp đã có: relationship/primary contact đúng, không tạo trùng hoặc ghi đè mặc định.
5. Tạo hai Parent liên tiếp để xác nhận sửa trùng mã; kiểm tra Add Parent/Edit/chi tiết/unlink, màn hình nhỏ và cuộn đến nút Save.

Task 03 sẵn sàng để người dùng nghiệm thu trong phạm vi triển khai đã kiểm tra; không tự commit/push/merge hoặc mở rộng nghiệp vụ.

## 7. Bổ sung Lớp học tại trung tâm trong Edit Student

Section mới nằm ngay dưới Khối lớp trên page dùng chung cho Center Manager/Admin Staff; không sửa/xóa các trường Edit hiện có. Hiển thị toàn bộ StudentClass, không lọc lịch sử theo Grade đang chọn. Nhãn Đang học/Đã hoàn thành/Đã nghỉ lấy từ StudentClass.status; trạng thái khác được giữ và không có nút ngừng học. Thông tin khối/môn lấy từ catalogue Class thật. Nếu Class đã kết thúc nhưng StudentClass cũ vẫn active, UI nêu riêng trạng thái Class, không âm thầm viết lại enrollment.

Các thao tác được lưu riêng, có giải thích ngay trong section:

- **Cập nhật hồ sơ** chỉ gọi PUT User như trước. Đổi Grade không thêm, chuyển hoặc ngừng bất kỳ lớp nào.
- **Đăng ký các lớp đã chọn** chỉ thêm enrollment. Gợi ý dùng Grade trên form; nếu khác Grade đã lưu thì checkbox/nút đăng ký bị khóa, yêu cầu lưu hồ sơ rồi mở lại. Backend đối chiếu Grade đã lưu nên request cũ hoặc giả mạo Grade bị từ chối.
- **Ngừng học → Xác nhận ngừng học** là thao tác riêng cho enrollment active, có nút hủy và lý do tùy chọn tối đa 500 ký tự. Chỉ cập nhật status=dropped, dropped_at UTC và drop_reason; ScId, ngày đăng ký, các enrollment khác và hồ sơ Student được giữ. Các thời điểm UTC mới hiển thị theo múi giờ trình duyệt.
- Thay đổi lớp đã bấm xác nhận có hiệu lực ngay; bấm Hủy bỏ modal sau đó không hoàn tác command đã xác nhận. Dữ liệu hồ sơ chưa lưu vẫn độc lập. Trong lúc command đang lưu, nút Save/đóng modal/Grade và command khác được khóa để tránh gửi chồng.

API tối thiểu, tái sử dụng StudentClassRepository/StudentClassService và DI hiện có:

| API | Chức năng |
| --- | --- |
| GET `/api/studentclasses?studentId={id}` | Mở rộng API đọc cũ bằng filter optional; không truyền query vẫn giữ hành vi cũ. Không bỏ active/completed/dropped hoặc khối khác. |
| GET `/api/classes` | Catalogue thật để lấy tên/khối/môn và gợi ý; lỗi catalogue không xóa lịch sử đã tải. |
| POST `/api/users/{studentId}/enrollments` | Body `{gradeId, classIds}`. Transaction Serializable, Student phải có role student và Grade hiện tại phải khớp request; lớp mới phải tồn tại, thuộc Grade đó, active/upcoming. Ghi nhiều lớp trong một transaction. |
| PATCH `/api/users/{studentId}/enrollments/{scId}/drop` | Body `{reason}`. Kiểm tra đúng Student/ScId, chỉ active được ngừng, completed/unknown bị từ chối. Không có DELETE enrollment. |

Chống trùng và giữ lịch sử:

- Distinct ClassIds trong request, unique `(student_id,class_id)` hiện có là rào chắn cuối. Active đã có được trả lại nguyên vẹn để retry sau mất response không tạo trùng hoặc đổi ngày đăng ký.
- Class có bản ghi completed/dropped không được đăng ký lại trong task này. Nếu một batch chứa lịch sử như vậy, từ chối toàn bộ batch; không tự reset dòng cũ, không tạo dòng trùng. Schema hiện tại chỉ có một dòng cho mỗi cặp Student–Class nên nghiệp vụ tái học cùng Class cần quyết định riêng để bảo toàn lịch sử.
- Retry ngừng học một dòng đã dropped giữ ngày/lý do ngừng đầu tiên. Sai Student/ScId trả 404; dữ liệu/Grade/Class không hợp lệ trả 400 hoặc 409; xung đột ghi đồng thời yêu cầu tải lại. Lỗi chưa xác nhận kết quả trả 503, frontend giữ danh sách cũ và bắt tải lại trước khi thử tiếp.
- Không tạo Invoice/Payment hoặc chạm Attendance. Không sửa Entity/DbContext/migration; HasPendingModelChanges regression vẫn đạt.

File mới/thay đổi riêng cho phần bổ sung:

| File | Nội dung |
| --- | --- |
| `Capstone2/backend/Controllers/Management/ManagementStudentEnrollmentsController.cs` | Hai command, thông báo và HTTP error status rõ ràng. |
| `Capstone2/backend/Models/DTOs/Management/ManageStudentEnrollmentDto.cs` | DTO thêm nhiều lớp và lý do ngừng học, validation. |
| `Capstone2/backend/Controllers/Queries/StudentClassesController.cs` | Query studentId optional, validate ID dương. |
| `Capstone2/backend/Repositories/Interfaces/IStudentClassRepository.cs`, `Capstone2/backend/Repositories/Implementation/StudentClassRepository.cs` | Scoped read, transaction thêm/ngừng, idempotency và lịch sử. |
| `Capstone2/backend/Services/Interfaces/IStudentClassService.cs`, `Capstone2/backend/Services/Implementation/StudentClassService.cs` | Tái sử dụng mapping StudentClassDto và service đã đăng ký. |
| `Capstone2/frontend/src/api/studentEnrollmentApi.ts` | Scoped GET và hai command; kiểm tra response đúng Student, unique và kết quả đã xác nhận. |
| `Capstone2/frontend/src/BLL/services/studentCenterEnrollmentService.ts` | Nhãn trạng thái, gợi ý theo Grade thật và loại mọi Class đã có lịch sử. |
| `Capstone2/frontend/src/GUIs/components/management/StudentCenterClassesSection.tsx` | Section responsive, lỗi/loading/reload, nhiều checkbox, xác nhận ngừng học. |
| `Capstone2/frontend/src/GUIs/pages/admin/shared/StudentManagementPage.tsx` | Gắn section chung và khóa thao tác hồ sơ khi command đang chạy. |
| `Capstone2/frontend/tests/studentCenterEnrollment.test.mjs` | 5 unit/contract test mới. |
| `Capstone2/frontend/tests/studentEnrollment.browser.mjs`, `Capstone2/frontend/tests/studentManagement.http.browser.mjs` | Regression lỗi đọc lịch sử/retry và Edit thêm/ngừng học trên API thật ở 6 tổ hợp role/viewport. |
| `Capstone2/backend.Tests/StudentEnrollment/EditStudentEnrollmentChecks.cs`, `Capstone2/backend.Tests/StudentEnrollment/HttpStudentManagementChecks.cs` | HTTP/database assertions mới, tiêm lỗi INSERT thứ hai, concurrent add, history và browser output. |
| `docs/EDUTRACK_TASK03_FINAL_REPORT.md` | Cập nhật kết quả và checklist mới nhất. |

Trong kiểm thử đã sửa lỗi bắt exception của bộ tiêm lỗi (EF bọc lỗi giả lập thành DbUpdateException), output stderr rỗng bị PowerShell hiểu nhầm và khoảng đệm section từ CSS global làm modal dài không cần thiết. Đây là các sửa kỹ thuật trong phạm vi, không đổi nghiệp vụ.

Đã đối chiếu SHA-256 của StudentClass entity, EduTrackDbContext, model snapshot và AddStudentGrade migration với manifest source trước khi bổ sung; tất cả vẫn khớp. Lượt này không sửa schema source, chạy migration hoặc ghi dữ liệu thử lên development. Auth vẫn chưa kiểm chứng bằng phiên đăng nhập thật như giới hạn ở mục 5.

Checklist bổ sung cho cả hai role:

1. Mở Edit Student có lớp ở nhiều khối/trạng thái: kiểm tra đủ active/completed/dropped và ngày/lý do nghỉ, không bị ẩn khi đổi Grade.
2. Chọn thêm một/nhiều lớp phù hợp khối đã lưu và bấm nút đăng ký riêng; reload phải còn đúng lớp, không đổi hồ sơ hoặc lịch sử cũ. Thử request/lựa chọn cũ: không tạo trùng.
3. Đổi Grade nhưng chưa lưu: thêm lớp bị khóa, lịch sử vẫn còn; lưu hồ sơ rồi mở lại sẽ gợi ý khối mới. Profile update không chuyển lớp.
4. Bấm Ngừng học rồi hủy: không có thay đổi. Xác nhận kèm lý do: giữ nguyên ScId/ngày đăng ký, có ngày/lý do nghỉ; reload vẫn còn bản ghi. Completed/dropped không có thao tác ngừng lại/tự tái ghi danh.
5. Ngắt API/tải lại danh sách, kiểm tra thông báo và form còn nguyên; màn hình hẹp cuộn được danh sách và tới nút Cập nhật hồ sơ.

## 8. Review tr??c local commit Task 03

Ng?y review: 07/11/2026, Asia/Bangkok. Ng??i d?ng ?? cho ph?p t?o **m?t local commit** tr?n nh?nh **Duy**, message `feat(student): complete student management and enrollment`. C?c c?u ?kh?ng commit? ? nh?ng bi?n b?n tr??c m? t? quy?n t?i th?i ?i?m ??; l??t n?y ch? b? sung quy?n local commit. Push/merge/rebase/force v?n ch?a ???c ph?p.

Dependency: commit n?n `5cff404` ?? ch?a Task 02, Task 02.1 v? c?u h?nh CI. Diff CI hi?n t?i ch? th?m restore/build/run enrollment harness kh?ng database; Tuition harness ch? lo?i source enrollment m?i kh?i glob compile. Kh?ng c?n dependency c?a task kh?c ?ang ch?a commit v? kh?ng ??a thay ??i module kh?c v?o phi?n b?n n?y. MySqlPrivilegeCheck, SQL review/preflight v? bi?n b?n database l? c?ng c?/t?i li?u ?? ???c y?u c?u trong Task 03; kh?ng c? dump ho?c k?t qu? inspect ri?ng t? trong danh s?ch commit.

??i chi?u tr??c stage: **54 file source/test thay ??i kh?p SHA-256** v?i b?n sao d?ng cho ki?m th? m?i nh?t; **796 file d? ?n ?? tracked c? trong b?n sao ??** c?ng kh?p. Kh?ng c? thay ??i ch?c n?ng m?i trong l??t review. K?t qu? 104 assertion integration/HTTP v? 6 nh?m browser HTTP th?t t? l??t tr??c v?n ?p d?ng cho c?ng source. Kh?ng ch?y l?i migration, integration ghi d? li?u ho?c thao t?c database ph?t tri?n trong l??t commit.

Ki?m tra ch?y l?i tr??c commit:

| Ki?m tra | K?t qu? |
| --- | --- |
| Frontend lint / typecheck / build | ??t; lint c?n 190 warning c? s?n, build c?n c?nh b?o bundle l?n. |
| Frontend unit/contract tests | 101 pass, 0 fail/skip. |
| Backend API build SDK 8 | ??t; l?n build incremental tr? 0 warning/0 error, kh?ng thay th? ghi nh?n 3 CS8601 c? t? clean build. |
| Enrollment harness m?c ??nh | 26 assertion ??t, kh?ng database. |
| Tuition harness | 18 assertion ??t, kh?ng database. |
| MySqlPrivilegeCheck build / self-test | ??t; 59 assertion, kh?ng database; c? NU1902 nh? b?n d??i. |
| Workflow actionlint | ??t. |

Qu?t ???ng d?n v? n?i dung d? ki?n stage kh?ng ph?t hi?n .env, private key, token, connection string c? m?t kh?u, dump ho?c d? li?u c? nh?n. Hai c?u INSERT fixture trong harness l? d? li?u t?ng h?p, n?m sau guard instance loopback 33308/data directory ri?ng, kh?ng ph?i dump ?ng d?ng. ?? ki?m tra ignore th?c t? cho .env, bin/obj, node_modules, dist v? backup. C?c backup/b?ng ch?ng/screenshot/log v?n n?m ngo?i Git. Staged blob v? to?n b? staged diff ???c ki?m tra ri?ng tr??c khi commit; ch? commit sau khi `git diff --cached --check` ??t v? danh s?ch staged ??ng danh s?ch b?n d??i.

**C?nh b?o dependency c?n theo d?i ri?ng:** build c?ng c? MySqlPrivilegeCheck t? assets hi?n t?i b?o NU1902 cho MySqlConnector 2.3.5; backend hi?n c? c?ng resolve phi?n b?n n?y qua Pomelo 8.0.2, kh?ng c? thay ??i package backend trong Task 03. [Advisory GHSA-473q-m89c-ghf8](https://github.com/advisories/GHSA-473q-m89c-ghf8) m? t? r?i ro g?i m?t kh?u tr??c khi ki?m tra ch?ng ch? trong m?t s? c?u h?nh VerifyCA/VerifyFull thi?u SslCa; phi?n b?n s?a l? 2.6.1. Advisory ghi r? k?t n?i local/loopback kh?ng b? ?nh h??ng; inspector Task 03 b?t bu?c loopback. Ch?a n?ng dependency ho?c k?t lu?n to?n b? ?ng d?ng ?? ???c security audit. C?n review n?ng c?p d?ng chung v? regression ri?ng tr??c khi s? d?ng c?u h?nh k?t n?i t? xa li?n quan.

Ki?m tra staged l?n ??u ph?t hi?n m?t d?ng tr?ng th?a cu?i file SQL review (file m?i ch?a tracked n?n ki?m tra working-tree tr??c ??y kh?ng th?y). ?? ch? b? d?ng tr?ng cu?i `Capstone2/db/migrations/AddStudentGrade.review.sql`, ki?m tra n?i dung tr??c/sau sau khi b? whitespace cu?i file gi?ng h?t; kh?ng ??i b?t k? c?u SQL ho?c migration source n?o v? kh?ng th?c thi SQL. SHA-256 file review trong commit l? `FBD220C93412A34ED4B02C41AED99C5FA8F2A50021704155250852214CD0E7DA`; hash `D89212879757F4AEE0A326839D7341691C5EDC446F88CEA8E276A43C6C0508EA` trong bi?n b?n migration c? v?n m? t? ??ng b?n ?? th?c thi v? l?u trong b?ng ch?ng ri?ng t?.

Danh s?ch **71 file** trong ph?m vi local commit (???ng d?n t? repository root):

```text
.github/workflows/ci.yml
.gitignore
Capstone2/backend.Tests/StudentEnrollment/EditStudentEnrollmentChecks.cs
Capstone2/backend.Tests/StudentEnrollment/HttpStudentManagementChecks.cs
Capstone2/backend.Tests/StudentEnrollment/Program.cs
Capstone2/backend.Tests/StudentEnrollment/Run-IsolatedMySql.ps1
Capstone2/backend.Tests/StudentEnrollment/StudentEnrollment.Tests.csproj
Capstone2/backend.Tests/TuitionPolicy.Tests.csproj
Capstone2/backend/Controllers/Management/ManagementStudentEnrollmentsController.cs
Capstone2/backend/Controllers/Management/ManagementUsersController.cs
Capstone2/backend/Controllers/Queries/StudentClassesController.cs
Capstone2/backend/Migrations/20261107061101_AddStudentGrade.Designer.cs
Capstone2/backend/Migrations/20261107061101_AddStudentGrade.cs
Capstone2/backend/Migrations/EduTrackDbContextModelSnapshot.cs
Capstone2/backend/Models/DTOs/Management/AssignParentStudentDto.cs
Capstone2/backend/Models/DTOs/Management/CreateStudentDto.cs
Capstone2/backend/Models/DTOs/Management/ManageStudentEnrollmentDto.cs
Capstone2/backend/Models/DTOs/Management/UpdateUserDto.cs
Capstone2/backend/Models/DTOs/UserDto.cs
Capstone2/backend/Models/EF/EduTrackDbContext.cs
Capstone2/backend/Models/Entities/User.cs
Capstone2/backend/Program.cs
Capstone2/backend/Repositories/Implementation/GradeRepository.cs
Capstone2/backend/Repositories/Implementation/ParentStudentRepository.cs
Capstone2/backend/Repositories/Implementation/StudentClassRepository.cs
Capstone2/backend/Repositories/Implementation/UserRepository.cs
Capstone2/backend/Repositories/Interfaces/IParentStudentRepository.cs
Capstone2/backend/Repositories/Interfaces/IStudentClassRepository.cs
Capstone2/backend/Repositories/Interfaces/IUserRepository.cs
Capstone2/backend/Services/Implementation/StudentClassService.cs
Capstone2/backend/Services/Implementation/UserService.cs
Capstone2/backend/Services/Interfaces/IStudentClassService.cs
Capstone2/backend/Services/Management/Implementation/ManagementUserService.cs
Capstone2/backend/Services/Management/Interfaces/IManagementUserService.cs
Capstone2/backend/Services/Management/StudentEnrollmentPolicy.cs
Capstone2/db/migrations/AddStudentGrade.preflight.readonly.sql
Capstone2/db/migrations/AddStudentGrade.review.sql
Capstone2/db/tools/MySqlPrivilegeCheck/LiveInspection.cs
Capstone2/db/tools/MySqlPrivilegeCheck/MySqlPrivilegeCheck.csproj
Capstone2/db/tools/MySqlPrivilegeCheck/PolicyTests.cs
Capstone2/db/tools/MySqlPrivilegeCheck/PrivilegePolicy.cs
Capstone2/db/tools/MySqlPrivilegeCheck/Program.cs
Capstone2/db/tools/MySqlPrivilegeCheck/README.md
Capstone2/frontend/src/BLL/models/UserDto.ts
Capstone2/frontend/src/BLL/services/parentStudentLinkService.ts
Capstone2/frontend/src/BLL/services/studentCenterEnrollmentService.ts
Capstone2/frontend/src/BLL/services/studentEnrollmentService.ts
Capstone2/frontend/src/BLL/services/studentGradeService.ts
Capstone2/frontend/src/DAL/managementDAL.ts
Capstone2/frontend/src/GUIs/components/management/StudentCenterClassesSection.tsx
Capstone2/frontend/src/GUIs/components/management/StudentEnrollmentSection.tsx
Capstone2/frontend/src/GUIs/components/management/StudentGradeSelect.tsx
Capstone2/frontend/src/GUIs/hooks/useStudentEnrollment.ts
Capstone2/frontend/src/GUIs/hooks/useStudentGrades.ts
Capstone2/frontend/src/GUIs/pages/admin/AdminStaff/AdminStaffStudentPage.tsx
Capstone2/frontend/src/GUIs/pages/admin/CenterManager/CenterManagerStudentPage.tsx
Capstone2/frontend/src/GUIs/pages/admin/shared/StudentManagementPage.tsx
Capstone2/frontend/src/api/managementApi.ts
Capstone2/frontend/src/api/studentEnrollmentApi.ts
Capstone2/frontend/tests/studentCenterEnrollment.test.mjs
Capstone2/frontend/tests/studentEnrollment.browser.mjs
Capstone2/frontend/tests/studentEnrollment.test.mjs
Capstone2/frontend/tests/studentManagement.http.browser.mjs
Capstone2/frontend/tests/studentManagement.test.mjs
docs/EDUTRACK_TASK03_DATABASE_EXECUTION.md
docs/EDUTRACK_TASK03_DATABASE_MIGRATION_RESULT.md
docs/EDUTRACK_TASK03_FINAL_REPORT.md
docs/EDUTRACK_TASK03_GRADE_LINK_FIX.md
docs/EDUTRACK_TASK03_MYSQL_PRIVILEGE_VALIDATION.md
docs/EDUTRACK_TASK03_STUDENT_ENROLLMENT.md
docs/EDUTRACK_TASK03_STUDENT_GRADE_DECISION.md
```
