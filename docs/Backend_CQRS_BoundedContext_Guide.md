# HƯỚNG DẪN KIẾN TRÚC BACKEND: CQRS LITE & BOUNDED CONTEXTS (ZERO-CONFLICT TEAMWORK GUIDE)

> **Dự án:** EduTrack - A Smart Learning Center Management System  
> **Phạm vi áp dụng:** `Capstone2/backend/` (.NET 8 Web API)  
> **Mục tiêu:** Chuẩn hóa kiến trúc Backend theo mô hình Doanh nghiệp (Enterprise Architecture), giải quyết triệt để bài toán xung đột code (Git Merge Conflict) khi nhóm 3 thành viên cùng phát triển song song 6 vai trò (Roles), đồng thời bảo toàn 100% tính tương thích với Frontend hiện tại.

---

## 1. TỔNG QUAN KIẾN TRÚC MỚI

Thay vì để cả 3 thành viên cùng chỉnh sửa chung trên 22 file Controllers/Services ánh xạ 1-1 từ 22 bảng CSDL (dễ gây xung đột Git và tạo ra các "God Class"), hệ thống Backend được tổ chức theo sự kết hợp của **2 mô hình kiến trúc hiện đại**:

1. **CQRS Lite (Command Query Responsibility Segregation)**:
   * **Tầng Queries (`Controllers/Queries/`)**: Đảm nhận các truy vấn đọc cơ bản (`GetAll`, `GetById`) dùng chung cho toàn hệ thống và phục vụ trực tiếp cho các trang Frontend đã kết nối.
   * **Tầng Commands & Role-Specific Queries (`Management/`, `Teaching/`, `Learning/`)**: Đảm nhận toàn bộ các thao tác thay đổi dữ liệu (`POST`, `PUT`, `PATCH`, `DELETE`) và các truy vấn phức tạp kết hợp nhiều bảng (`GET` nâng cao) theo từng nhóm vai trò.
2. **DDD Bounded Contexts (Phân tách theo Ngữ cảnh Nghiệp vụ / Nhóm Vai trò)**:
   * Chia không gian làm việc của 3 thành viên thành **3 phân khu độc lập 100%** từ `Controllers` $\rightarrow$ `Services` $\rightarrow$ `DTOs` $\rightarrow$ `Dependency Injection`.

---

## 2. SƠ ĐỒ CẤU TRÚC THƯ MỤC BACKEND (`Capstone2/backend/`)

```text
Capstone2/backend/
├── Controllers/
│   ├── Queries/                         # 🔒 [ĐÓNG BĂNG] 22 Controllers chỉ chứa GET (GetAll, GetById) dùng chung
│   │
│   ├── Management/                      # 👤 THÀNH VIÊN 1 (Center Manager & Admin Staff)
│   │   ├── ManagementUsersController.cs     # Tạo/Sửa/Xóa/Khóa User, Gán Phụ huynh - Học sinh
│   │   ├── ManagementClassesController.cs   # Tạo/Sửa/Xóa Lớp học, Xếp lớp, Gán GV/TA, Lịch học
│   │   ├── ManagementSubjectsController.cs  # Tạo/Sửa/Xóa Môn học
│   │   ├── ManagementTuitionController.cs   # Phát hành Hóa đơn, Lập Phiếu thu tại quầy, Báo cáo
│   │   ├── ManagementRequestsController.cs  # Duyệt đơn (Approve/Reject), Trả lời Feedback, Thông báo
│   │   └── ManagementSettingsController.cs  # Lưu Cấu hình trung tâm (4 Tabs Settings)
│   │
│   ├── Teaching/                        # 👤 THÀNH VIÊN 2 (Teacher & Teaching Assistant)
│   │   ├── TeachingClassesController.cs     # Lớp phụ trách, Lịch dạy cá nhân, Tài liệu (ContentUnits)
│   │   ├── TeachingAssignmentsController.cs # Giao bài tập, Sửa/Xóa bài tập, Chấm điểm bài nộp
│   │   ├── TeachingAttendanceController.cs  # Điểm danh buổi học, Ghi nhận xét tiến độ (ProgressNotes)
│   │   └── TeachingRequestsController.cs    # Giáo viên / Trợ giảng gửi đơn kiến nghị, xin nghỉ
│   │
│   └── Learning/                        # 👤 THÀNH VIÊN 3 (Student & Parent)
│       ├── StudentHomeworkController.cs     # Học sinh nộp bài tập (Submissions), Xem điểm chấm
│       ├── StudentLearningController.cs     # Xem lớp đang học, Lịch học, Tiến độ & Sửa Profile cá nhân
│       ├── ParentPortalController.cs        # Phụ huynh xem thông tin các con, Đóng học phí
│       └── LearnerFeedbackController.cs     # Học sinh & Phụ huynh gửi Feedback / Đơn xin phép
│
├── Services/
│   ├── Interfaces/ & Implementation/    # 🔒 [ĐÓNG BĂNG] 22 Base Services phục vụ tầng Queries
│   ├── Management/                      # 👤 THÀNH VIÊN 1: Interfaces/ & Implementation/
│   ├── Teaching/                        # 👤 THÀNH VIÊN 2: Interfaces/ & Implementation/
│   └── Learning/                        # 👤 THÀNH VIÊN 3: Interfaces/ & Implementation/
│
├── Models/
│   ├── Entities/ & EF/                  # Thực thể Database & EduTrackDbContext
│   └── DTOs/
│       ├── (Các DTO gốc dùng chung)     # 🔒 [ĐÓNG BĂNG]
│       ├── Management/                  # 👤 THÀNH VIÊN 1: Chứa Request/Response DTOs của CM & Admin Staff
│       ├── Teaching/                    # 👤 THÀNH VIÊN 2: Chứa Request/Response DTOs của Teacher & TA
│       └── Learning/                    # 👤 THÀNH VIÊN 3: Chứa Request/Response DTOs của Student & Parent
│
├── Helpers/
│   └── DependencyInjection/             # Đăng ký DI tách biệt để KHÔNG BAO GIỜ conflict file Program.cs
│       ├── CoreInfrastructureExtensions.cs  # 🔒 [ĐÓNG BĂNG] Đăng ký Repositories & Base Services
│       ├── ManagementServiceExtensions.cs   # 👤 THÀNH VIÊN 1 tự đăng ký Service mới tại đây
│       ├── TeachingServiceExtensions.cs     # 👤 THÀNH VIÊN 2 tự đăng ký Service mới tại đây
│       └── LearningServiceExtensions.cs     # 👤 THÀNH VIÊN 3 tự đăng ký Service mới tại đây
│
├── Repositories/                        # Tầng truy xuất CSDL dùng chung (Generic & Specific Repositories)
└── Program.cs                           # 🔒 [ĐÓNG BĂNG] Đã cấu hình gọn, không cần chỉnh sửa thêm
```

---

## 3. PHÂN CÔNG TRÁCH NHIỆM & QUY TẮC "BẤT KHẢ XÂM PHẠM" (LƯU Ý QUAN TRỌNG)

Để đảm bảo **0% Git Merge Conflict** trong suốt quá trình hoàn thiện đồ án, cả 3 thành viên cần tuân thủ 4 lưu ý sau:

### Lưu ý 1: Không chỉnh sửa vào thư mục `Controllers/Queries/`
* Toàn bộ 22 Controllers trong `Controllers/Queries/` hiện đang cung cấp các API `GET /api/{table}` và `GET /api/{table}/{id}` cho 12 file trong `frontend/src/api/`.
* Giữ nguyên thư mục này giúp **100% các trang trên React Frontend luôn chạy ổn định**. Không ai cần mở các file trong `Controllers/Queries/` ra sửa nữa.

### Lưu ý 2: Mỗi thành viên chỉ làm việc trong "Lãnh thổ (Bounded Context)" của mình
| Thành viên | Nhóm Vai trò (Roles) | Chỉ tạo/sửa file trong các thư mục sau |
| :--- | :--- | :--- |
| **Thành viên 1** | `Center Manager` + `Admin Staff` | • `Controllers/Management/`<br>• `Services/Management/`<br>• `Models/DTOs/Management/`<br>• `Helpers/DependencyInjection/ManagementServiceExtensions.cs` |
| **Thành viên 2** | `Teacher` + `Teaching Assistant` | • `Controllers/Teaching/`<br>• `Services/Teaching/`<br>• `Models/DTOs/Teaching/`<br>• `Helpers/DependencyInjection/TeachingServiceExtensions.cs` |
| **Thành viên 3** | `Student` + `Parent` | • `Controllers/Learning/`<br>• `Services/Learning/`<br>• `Models/DTOs/Learning/`<br>• `Helpers/DependencyInjection/LearningServiceExtensions.cs` |

### Lưu ý 3: Không sửa trực tiếp vào `Program.cs` khi thêm Service mới
* File `Program.cs` đã gọi sẵn 3 hàm mở rộng: `.AddManagementServices()`, `.AddTeachingServices()`, `.AddLearningServices()`.
* Khi bạn viết thêm một Service mới (ví dụ `ITeacherGradingService` và `TeacherGradingService`), hãy mở đúng file `Helpers/DependencyInjection/TeachingServiceExtensions.cs` của mình để thêm dòng `services.AddScoped<...>()` thay vì sửa vào `Program.cs`.

### Lưu ý 4: Cách đặt Route URL trong ASP.NET Core để không bị trùng lặp
* Trong ASP.NET Core, nhiều Controller khác nhau **có thể dùng chung tiền tố `[Route("api/classes")]` hoặc `[Route("api/assignments")]`**, miễn là **cặp (HTTP Method + Đường dẫn con)** không trùng nhau.
* Ví dụ:
  * `Controllers/Queries/AssignmentsController.cs` đã giữ:
    * `GET /api/assignments`
    * `GET /api/assignments/{id:int}`
  * `Controllers/Teaching/TeachingAssignmentsController.cs` có thể đặt `[Route("api/assignments")]` và viết tiếp:
    * `POST /api/assignments` (Tạo bài tập)
    * `PUT /api/assignments/{id:int}` (Sửa bài tập)
    * `DELETE /api/assignments/{id:int}` (Xóa bài tập)
    * `GET /api/assignments/{id:int}/submissions` (Lấy danh sách bài nộp của bài tập đó)

---

## 4. HƯỚNG DẪN SỬ DỤNG THỰC CHIẾN (COOKBOOK)

### Trường hợp A: Viết API Thêm / Sửa / Xóa (`POST`, `PUT`, `PATCH`, `DELETE`)

**Ví dụ:** Thành viên 3 (nhóm `Student / Parent`) cần viết API cho Học sinh nộp bài tập (`POST /api/submissions`).

1. **Bước 1 — Tạo DTO Request trong `Models/DTOs/Learning/`**:
   Tạo file `Models/DTOs/Learning/SubmitHomeworkDto.cs`:
   ```csharp
   namespace EduTrack.API.Models.DTOs.Learning
   {
       public class SubmitHomeworkDto
       {
           public int AssignmentId { get; set; }
           public int StudentId { get; set; }
           public string? FileUrl { get; set; }
           public string? Content { get; set; }
       }
   }
   ```

2. **Bước 2 — Viết Endpoint trong `Controllers/Learning/StudentHomeworkController.cs`**:
   Bạn có thể gọi Service sẵn có hoặc tạo Service riêng trong `Services/Learning/` (tiêm `ISubmissionRepository` hoặc `EduTrackDbContext` vào):
   ```csharp
   [HttpPost]
   public async Task<ActionResult<SubmissionDto>> SubmitHomework([FromBody] SubmitHomeworkDto dto)
   {
       // Gọi Service xử lý lưu vào bảng submissions và trả về kết quả
   }
   ```

---

### Trường hợp B: Viết API `GET` mới kết hợp dữ liệu từ nhiều bảng (Multi-Table Join)

> **Quy tắc:** Khi một màn hình cần lấy dữ liệu tổng hợp từ 2, 3, 4 bảng cùng lúc (mà `GetAll`/`GetById` đơn bảng trong `Queries/` không đáp ứng đủ), **hãy viết hàm `[HttpGet]` đó ngay trong Controller thuộc nhánh của bạn (`Management/`, `Teaching/`, hoặc `Learning/`)**.

**Ví dụ:** Thành viên 2 (nhóm `Teacher / TA`) cần viết 1 API `GET` kết hợp 4 bảng (`classes` + `student_classes` + `users` + `attendances`) để đổ dữ liệu ra màn hình **Điểm danh lớp học theo buổi**.

1. **Bước 1 — Tạo DTO trả về trong `Models/DTOs/Teaching/`**:
   Tạo file `Models/DTOs/Teaching/ClassAttendanceSheetDto.cs`:
   ```csharp
   using System.Collections.Generic;

   namespace EduTrack.API.Models.DTOs.Teaching
   {
       public class ClassAttendanceSheetDto
       {
           public int ClassId { get; set; }
           public string ClassName { get; set; } = string.Empty;
           public int SessionId { get; set; }
           public List<StudentAttendanceRowDto> Students { get; set; } = new();
       }

       public class StudentAttendanceRowDto
       {
           public int StudentId { get; set; }
           public string StudentCode { get; set; } = string.Empty;
           public string FullName { get; set; } = string.Empty;
           public string Status { get; set; } = "present"; // present, absent, late
           public string? Note { get; set; }
       }
   }
   ```

2. **Bước 2 — Kết hợp nhiều bảng bằng `EduTrackDbContext` hoặc nhiều Repositories**:
   Trong `Services/Teaching/` (hoặc inject trực tiếp vào `TeachingAttendanceController.cs`), bạn có thể truy vấn nhiều bảng cùng lúc bằng Entity Framework LINQ:
   ```csharp
   // Ví dụ viết trong TeachingAttendanceController.cs
   // GET: api/attendances/class/{classId}/session/{sessionId}
   [HttpGet("class/{classId:int}/session/{sessionId:int}")]
   public async Task<ActionResult<ClassAttendanceSheetDto>> GetAttendanceSheet(int classId, int sessionId)
   {
       // Kết hợp dữ liệu từ nhiều bảng thông qua các Service/Repository hoặc DbContext
       // Trả về đúng 1 cục JSON duy nhất cho Frontend render bảng điểm danh
   }
   ```

3. **Bước 3 — Đăng ký Service (nếu có tạo Service mới)**:
   Mở `Helpers/DependencyInjection/TeachingServiceExtensions.cs`:
   ```csharp
   public static IServiceCollection AddTeachingServices(this IServiceCollection services)
   {
       services.AddScoped<ITeachingAttendanceService, TeachingAttendanceService>();
       return services;
   }
   ```

---

## 5. KIỂM TRA TRÊN SWAGGER UI (`/swagger`)

Nhờ thuộc tính `[Tags("...")]` đã được gắn sẵn trên các Controllers mới, khi chạy lệnh:
```bash
cd Capstone2/backend
dotnet run
```
Giao diện Swagger sẽ tự động gom nhóm các API mới một cách khoa học theo đúng 3 phân khu:
* **Management - Users & Parent Links**
* **Management - Classes & Schedules**
* **Management - Subjects**
* **Management - Tuition & Billing**
* **Management - Requests Review & Notifications**
* **Management - Center Settings**
* **Teaching - Classes & Schedules**
* **Teaching - Assignments & Grading**
* **Teaching - Attendance & Progress Notes**
* **Teaching - Teacher & TA Requests**
* **Learning - Student Homework & Submissions**
* **Learning - Student Portal**
* **Learning - Parent Portal & Tuition Payment**
* **Learning - Student & Parent Feedback**
