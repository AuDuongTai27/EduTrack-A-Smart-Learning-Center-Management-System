# Schedule Phase 0/1 — patch proposals cho module phối hợp

Ngày 08/11/2026, UTC+7. **Chỉ là proposal, chưa áp dụng lên Attendance, Approval hoặc Auth.**
Số dòng tham chiếu baseline; xác định lại theo tên method trước khi áp dụng.

## 1. Attendance GET tự ghi — chặn hoàn tất Phase 0

File: Capstone2/backend/Services/Teaching/Implementation/TeachingAttendanceService.cs.

### Patch A — GetClassSessionsAsync, dòng 31–35

~~~diff
@@ public async Task<List<TeachingSessionItemDto>> GetClassSessionsAsync(int classId)
-            // Nếu lớp chưa có buổi học nào trong DB, tự động sinh các buổi học chuẩn và lưu vào DB
-            if (sessions.Count == 0)
-            {
-                sessions = await EnsureDefaultSessionsCreatedAsync(classId);
-            }
+            // A GET only returns persisted sessions. Empty is a valid result.
~~~

Giữ projection: danh sách rỗng đi qua vòng lặp và trả []. Không generate trong GET.

### Patch B — GetAttendanceSheetAsync, dòng 122–126

~~~diff
@@ public async Task<TeachingClassAttendanceSheetDto?> GetAttendanceSheetAsync(...)
-            // Nếu lớp chưa có học sinh nào gán, đảm bảo gán tối thiểu các học sinh mẫu
-            if (studentClasses.Count == 0)
-            {
-                studentClasses = await EnsureStudentsEnrolledAsync(classId);
-            }
+            // Do not invent enrollment when the real roster is empty.
~~~

Giữ zero roster/zero stats; không chọn tài khoản theo STU/email hoặc Users.Take(3).
Sau hai patch, xóa hai helper không còn tham chiếu:
EnsureDefaultSessionsCreatedAsync (dòng 285–343),
EnsureStudentsEnrolledAsync (dòng 345–378).
Không đổi dữ liệu enrollment/session/Attendance đã tồn tại.

### Patch C — không đổi session khi SessionId gửi lên sai

Dòng 103–113: khi client truyền SessionId, chỉ chọn đúng SessionId thuộc Class.
Nếu không tìm thấy, trả NotFound qua controller; chỉ chọn mặc định khi không truyền ID.
Không tự chuyển điểm danh sang một buổi khác.

### Tác động và acceptance tests

| Case | Kết quả bắt buộc |
|---|---|
| Class chưa có session, GET sessions hai lần | Hai response rỗng; mọi bảng giữ nguyên |
| GET sheet của Class chưa có session | Không tạo sheet/session; controller trả trạng thái đã thống nhất |
| Class có session nhưng chưa có enrollment | Roster rỗng; StudentClass/Users/Attendance không tăng |
| GET sheet với SessionId thuộc Class khác | 404; không chọn fallback |
| GET sheet thật đã có Attendance | Giữ IDs, roster, records và timestamp |
| SaveBulk trả lại sheet sau lưu | Bước đọc không thêm enrollment/session |
| Concurrent GET trên Class trống | Không tạo record |

Harness ScheduleRead hiện tái hiện **hai dependency GET tự ghi** bằng interceptor
SELECT-only trên MySQL test độc lập. Interceptor chặn SQL ghi; snapshot mọi bảng giữ
nguyên. Đây là bằng chứng lỗi còn tồn tại, không phải xác nhận Attendance đã sửa.

## 2. Auth — dependency để đăng nhập thật

Baseline:

- frontend/src/contexts/AuthContext.tsx: init user/permission từ mock.
- backend/Program.cs: chưa đăng ký authentication handler/UseAuthentication.
- Legacy controllers còn nhận identity qua query/body.
- Approval role projection/review còn nhánh nhận diện theo ID mẫu.

Không chỉnh các file này trong lượt Schedule.

Contract cần Auth owner cung cấp:

1. Principal do handler kiểm chứng, có subject ID dương qua ClaimTypes.NameIdentifier
   hoặc sub; nếu cả hai có mặt phải cùng giá trị.
2. User active trong DB, đúng một hoặc nhiều trong 5 role: center_manager,
   admin_staff, teacher, teaching_assistant, student.
3. Thống nhất cookie/bearer transport. Schedule hiện dùng credentials: include,
   chưa tự đọc token từ storage hoặc tạo bearer giả.
4. Context logout/login phải cập nhật để Schedule xóa cache. Context change chỉ dùng
   cho invalidation, không coi context mock là bằng chứng xác thực.
5. Bảo vệ cả legacy /api/classsessions, /api/classschedules,
   /api/teaching/classes/my-schedule, /api/learning/student/{id}/schedule và resource
   dùng chung. API mới không thay thế security của URL cũ.

API mới /api/schedule/sessions và /{id} kiểm tra principal trong read boundary:
thiếu authentication trả 401, thiếu quyền trả 403. Không đăng ký test auth hoặc
header/cookie bypass trong development/production.

Acceptance: unauthenticated → 401; inactive/unknown/Parent → 403; query userId/studentId
không thay actor; detail ngoài scope → 404; Teacher/TA theo assigned Class; Student
theo thời điểm enrollment.

## 3. Seeder/shared startup

backend/Program.cs:62–75 vẫn gọi DbSeeder nếu không đặt Seeding:SkipSampleData.
Proposal cho owner startup: chuyển sang opt-in trong môi trường demo riêng,
không chạy trên DB nghiệp vụ mặc định. Giữ SkipSampleData là kill switch.

Không chạy production startup trong lượt này. Test host chỉ đăng ký ScheduleController,
không chạy Program/DbSeeder hoặc đọc appsettings thật. Không xác định/xóa mock record
theo ID/tên/ngày.

## 4. Approval/legacy frontend

Không sửa TeachingRequestService, ManagementApprovalRequestService,
teachingDAL.createRequest hoặc request modal.
createRequest còn catch lỗi API rồi trả success giả; owner cần bỏ nhánh đó.
getMySchedule legacy còn mock fallback nhưng không còn được Schedule page mới gọi.
Parent Schedule/learningDAL legacy giữ nguyên, ngoài scope mới.

Phase sau cần typed Schedule request + apply transaction; generic Approved hiện tại
chưa là bằng chứng đã đổi lịch. Chưa tạo schema/migration/approval handler.
