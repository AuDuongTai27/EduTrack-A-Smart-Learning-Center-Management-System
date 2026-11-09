# EduTrack — Schedule Phase 0/1

Cập nhật 08/11/2026, Asia/Bangkok (UTC+7). Không commit/push/merge.

## 1. Trạng thái

**Phase 0 CHƯA hoàn tất.** Luồng Schedule mới không dùng mock, hardcoded actor hoặc
Attendance read service. Attendance GET tự tạo ClassSession/StudentClass vẫn tồn tại;
Auth thật, legacy endpoints và startup seeder còn dependency. Không sửa module đồng đội.

**Phase 1 đã triển khai source read-only cho 5 actor; nghiệm thu đăng nhập thật còn
phụ thuộc Auth.** Test principal không chứng minh Auth development đã hoàn tất.

Không tạo/sửa/hủy/generate Session, không approval/apply, không migration/schema change
nghiệp vụ, không sửa Invoice/Payment hoặc lịch sử nghi là mock. Parent ngoài scope.

## 2. File thay đổi và chức năng

### Backend mới

- Capstone2/backend/Models/DTOs/Schedule/ScheduleReadDto.cs
- Capstone2/backend/Services/Schedule/ScheduleReadService.cs
- Capstone2/backend/Controllers/Schedule/ScheduleController.cs

GET /api/schedule/sessions?from=yyyy-MM-dd&toExclusive=yyyy-MM-dd:
range bắt buộc, tối đa 93 ngày; hỗ trợ ClassId/SubjectId/TeacherId/TaId/Room/Status.
GET /{id} dùng cùng scope, che session ngoài phạm vi bằng 404.
Response là toàn bộ tập trong range, không phân trang ngầm.

Subject chỉ từ principal đã xác thực; DB kiểm tra user active và role.
CM/AD xem toàn trung tâm hiện tại (schema chưa có tenant/center scope khác).
Teacher/TA theo assignment active. Student có EnrolledDate trước session start UTC+7,
trước DroppedAt nếu có; historical dropped cần DroppedAt, completed cần Class.EndDate.
Unknown/missing evidence bị loại thay vì đoán.

Subject từ Class.Subject, room từ ClassSession.Room, không fallback Class.Room.
Trả tất cả Teacher/TA active của Class; không giả định người đầu tiên là người thực
dạy lịch sử. Không gọi TeachingAttendanceService, SaveChanges hoặc lấy identity từ
query/body/header.

### Frontend mới/refactor

Các đường dẫn sau tính từ Capstone2/:

- frontend/src/BLL/models/ScheduleSession.ts
- frontend/src/BLL/services/scheduleViewService.ts
- frontend/src/api/scheduleSessionApi.ts
- frontend/src/DAL/scheduleSessionDAL.ts
- frontend/src/GUIs/components/shared/schedule/: ScheduleWorkspace.tsx,
  ScheduleCalendar.tsx, ScheduleList.tsx, ScheduleSessionDetail.tsx, schedule.css.
- frontend/src/GUIs/pages/student/StudentSchedulePage.tsx
- frontend/src/GUIs/pages/teacher/Teacher/TeacherSchedulePage.tsx
- frontend/src/GUIs/pages/teacher/TeachingAssistant/TeachingAssistantSchedulePage.tsx
- frontend/src/GUIs/pages/admin/shared/ManagementSchedulePage.tsx
- frontend/src/routes/centerManager.routes.tsx, adminStaff.routes.tsx
- frontend/src/GUIs/layouts/admin/CenterManagerSidebar.tsx, AdminStaffSidebar.tsx

Giữ role layout/header. CM/AD thêm route /schedule và menu.
Student/Teacher/TA giữ route, chuyển sang Schedule API mới.

Shared implementation giữ cấu trúc Student timetable: day header, time gutter,
absolute time placement; Teacher List: table/filter/pagination. Thay DTO weekday/mock
bằng session thật, thêm date grouping, overlap lanes và scoped CSS.
Không sửa Calendar legacy còn được Parent sử dụng.

Calendar: Monday–Sunday, UTC+7, tuần trước/sau/Hôm nay, SessionDate thật, mở detail,
overlap lanes, giờ mở rộng theo dữ liệu, vùng cuộn ngang/dọc riêng.
List: ngày/giờ/Class/Subject/Teacher/TA/Room/status, search, filters, sort, pagination,
cùng detail. Giữ filter/sort/page khi đổi view; Calendar không bị pagination cắt.

Status mapping chung; không tự completed khi đã qua giờ học.
Empty giữ empty; lỗi/401/403/malformed response hiện lỗi/retry, không fallback mock.
Không có action ghi. AuthContext change chỉ để cache invalidation, không xác định
identity/permission; refresh khi tab lấy focus.

### Test source

- Capstone2/backend.Tests/ScheduleRead/: ScheduleRead.Tests.csproj, Program.cs.
- Capstone2/backend.Tests/TuitionPolicy.Tests.csproj: loại folder test mới khỏi
  default Compile glob để không làm hỏng harness cũ.
- Capstone2/frontend/tests/scheduleView.test.mjs
- Capstone2/frontend/tests/schedule.http.browser.mjs
- .github/workflows/ci.yml: thêm restore/build/offline Schedule checks; không chạy
  MySQL, test host, seeder hoặc migration trong hosted CI.

## 3. Kiểm thử

Kết quả cuối cùng ở mục 6. Lỗi trung gian về SQL translation/test host/browser không
được coi là pass.

Offline frontend: npm.cmd run typecheck; npm.cmd run lint; npm.cmd test; npm.cmd run build.
Offline backend: dotnet run --project Capstone2/backend.Tests/ScheduleRead/ScheduleRead.Tests.csproj.

MySQL/HTTP/browser, chạy từ repository root:

~~~powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File Capstone2/backend.Tests/StudentEnrollment/Run-IsolatedMySql.ps1 -TestAssemblyPath Capstone2/backend.Tests/ScheduleRead/bin/Debug/net8.0/ScheduleRead.Tests.dll -Http -FrontendRoot Capstone2/frontend
~~~

Runner kiểm tra port 33308 trống, tạo mysqld riêng trong Temp; harness kiểm tra port và
datadir trước khi ghi synthetic fixtures vào schema random edutrack_schedule_test_*.
EnsureCreated chỉ tạo schema test; không chạy EF migrations/DbSeeder.
Không đọc appsettings/connection string thật, không truy cập edutrack_db.

Test host chỉ expose ScheduleController, bind loopback random port, có nonce identity
chỉ tồn tại trong test assembly. Frontend không có bypass. Browser chặn network ngoài
origin test và mọi request ghi. Lỗi/empty/loading fault-inject riêng rồi retry HTTP thật.
API/layout ngoài scope trả lỗi, không proxy development.

SELECT-only interceptor chặn non-SELECT; snapshot tất cả bảng kiểm chứng GET không đổi
dữ liệu. Reproduction Attendance dùng interceptor riêng để chặn trước SQL ghi.

## 4. Dependencies/rủi ro

Xem [patch proposals](EDUTRACK_SCHEDULE_PHASE01_DEPENDENCY_PROPOSALS.md) để review
file/dòng/diff, tác động và acceptance tests.

- Attendance GET writers chưa sửa: chặn đóng Phase 0.
- AuthContext/pipeline còn mock/chưa authenticate: app thật trả 401 ở Schedule mới.
- Legacy Schedule/Attendance/query endpoints còn security debt; API mới không bảo vệ
  thay toàn bộ API cũ.
- Seeder startup chưa đổi; không chạy production host để smoke-test.
- Không phân biệt được dữ liệu mock đã ghi: UI hiển thị record thật đang tồn tại,
  không tự gán nhãn/xóa theo ID/tên/null ScheduleId.
- Teacher/TA là phân công Class hiện tại, chưa là snapshot từng buổi.
- Room là chuỗi legacy; chưa thêm danh mục/schema chuẩn hóa.
- Không hỗ trợ session qua nửa đêm; giờ không hợp lệ có cảnh báo và vẫn xem được qua
  List/detail, không đặt sai lên Calendar.
- Chưa server pagination/index mới; range tối đa 93 ngày, UI dùng tuần.
- Full transaction regression Attendance/Approval và login thật chưa nghiệm thu.

## 5. Phase 2 đề xuất

Trước Phase 2: phối hợp Attendance GET patches, chốt Auth transport/principal, bảo vệ
legacy endpoints; preflight chỉ đọc schema/data để hiểu lịch sử hiện hữu.
Sau đó triển khai CM/AD quản lý template, Teacher tạo/generate tháng với Preview/Confirm,
conflict chung và idempotency. Schema occurrence/revision cần review riêng; chưa tạo
migration. Schedule Change Request/apply transaction để phase sau nữa.

## 6. Kết quả kiểm thử cuối cùng

| Kiểm tra | Kết quả và giới hạn |
|---|---|
| Frontend typecheck / production build | Đạt; giữ cảnh báo bundle lớn hơn 500 kB |
| Frontend lint | 0 error, 188 warning hiện hữu; không có warning ở file Schedule mới |
| Frontend unit/contract | 124 pass, gồm 8 test Schedule mới; 0 fail/skip |
| Backend API + Schedule harness build | Đạt; API có 3 nullable warning baseline, không sửa module khác để dọn warning |
| Schedule offline | 10 assertion identity/range, không truy cập DB |
| Schedule MySQL + HTTP | 62 assertion tổng cộng (bao gồm 10 offline và các check tích hợp/browser/dependency); đạt |
| Read safety | 193 SELECT trên luồng Schedule mới, 0 lần thử ghi; snapshot mọi bảng trước/sau giống nhau |
| Attendance dependency reproduction | Cả GET sessions và GET enrollment cố ghi; interceptor riêng chặn trước SQL. Dependency CHƯA sửa |
| Schedule browser HTTP thật | 20 nhóm: 5 actor × 1440/768/390/360 px; overlap, detail chung, giữ filter/page, Calendar không bị pagination cắt, tuần giao năm, today UTC+7 trong browser Los Angeles |
| Fault handling browser | Empty/error/retry/loading/401 đạt; sau retry đọc lại Schedule HTTP thật |
| Regression Class | 42 nhóm browser fixture; CM/AD × desktop/tablet/mobile, CRUD/filter/details/error/responsive |
| Regression Student/enrollment | 12 nhóm browser fixture; Grade/enrollment/Edit/error/race/parent-link regression có sẵn, không mở Parent Schedule mới |
| Regression Tuition/KPI | 300 page scenario browser fixture; 27 Tuition policy + 18 generation policy offline; không ghi Invoice/Payment |
| Enrollment policy offline | 26 assertion đạt |
| Protected files | Auth/Attendance/Approval source, Program/DbSeeder, Entities/DbContext/migrations, db/, Task04 report không thay đổi |
| Whitespace | git diff --check đạt |

Backend test dùng .NET SDK 10.0.301, target/runtime .NET 8; frontend Node 24.19.0.
Không nâng dependency production hay đổi lockfile. CI mới chưa có hosted run vì chưa
commit/push. Kiểm thử browser chạy headless với profile Temp mới và network giới hạn;
Bootstrap CSS lấy từ bản local trong repo, không cần CDN. Các icon/font bên ngoài bị
chặn trong test nên screenshot có thể thiếu glyph; đây không phải dữ liệu lịch giả.
Tuition browser harness cũ được chạy từ bản sao Temp chỉ thêm Chrome no-sandbox flag,
không sửa source kiểm thử Tuition.

Artifacts local:

- %TEMP%/edutrack-schedule-phase01-validation/: frontend-lint.log,
  schedule-integration-final.log, source-sha256.json.
- %TEMP%/edutrack-schedule-browser-GxoTLH/: results.json, 20 screenshots role/viewport.
- %TEMP%/edutrack-enrollment-mysql-00c04694260c46e7815ad0d2734e8c07/: MySQL diagnostics.
- %TEMP%/edutrack-class-management-TK4iBP/: Class regression.
- %TEMP%/edutrack-student-enrollment-iT6TBU/: Student regression.
- %TEMP%/edutrack-tuition-kpi-GzsZeS/: Tuition/KPI regression.

Schema synthetic cuối: edutrack_schedule_test_4665acd401f54fc88a52e46bba128e1d;
đã cleanup và dừng đúng MySQL instance của runner. Không chạm development DB.

Qua kiểm tra screenshot, đã loại padding section của Landing ảnh hưởng Calendar;
mobile có nút Bộ lọc mở/thu gọn để ưu tiên diện tích xem lịch. Filter state vẫn giữ
khi đóng panel hoặc đổi Calendar/List.

**Kết luận nghiệm thu:** shared read-only Schedule đã được kiểm thử chức năng trên
môi trường độc lập. Phase 0 và việc sử dụng bằng đăng nhập thật vẫn chưa hoàn tất cho
đến khi các owner xử lý dependency Attendance/Auth/startup/legacy API. Không dùng các
kết quả trên để tuyên bố toàn bộ GET trong hệ thống đã an toàn.
