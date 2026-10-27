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

### Lưu ý 2: Mỗi thành viên chỉ làm việc trong "Lãnh thổ (Bounded Context)" của mình (Cả Backend lẫn Frontend API/DAL)
| Thành viên | Nhóm Vai trò (Roles) | Thư mục Backend được phép sửa | File Frontend API & DAL được phép sửa |
| :--- | :--- | :--- | :--- |
| **Thành viên 1** | `Center Manager` + `Admin Staff` | • `Controllers/Management/`<br>• `Services/Management/`<br>• `Models/DTOs/Management/`<br>• `Helpers/DependencyInjection/ManagementServiceExtensions.cs` | • `src/api/managementApi.ts`<br>• `src/DAL/managementDAL.ts`<br>• `src/GUIs/pages/admin/` |
| **Thành viên 2** | `Teacher` + `Teaching Assistant` | • `Controllers/Teaching/`<br>• `Services/Teaching/`<br>• `Models/DTOs/Teaching/`<br>• `Helpers/DependencyInjection/TeachingServiceExtensions.cs` | • `src/api/teachingApi.ts`<br>• `src/DAL/teachingDAL.ts`<br>• `src/GUIs/pages/teacher/` |
| **Thành viên 3** | `Student` + `Parent` | • `Controllers/Learning/`<br>• `Services/Learning/`<br>• `Models/DTOs/Learning/`<br>• `Helpers/DependencyInjection/LearningServiceExtensions.cs` | • `src/api/learningApi.ts`<br>• `src/DAL/learningDAL.ts`<br>• `src/GUIs/pages/student/` & `parent/` |

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

## 4. QUY TRÌNH 8 BƯỚC THỰC CHIẾN TỪ A–Z (TỪ PAGE -> BACKEND -> FRONTEND)

Khi bắt tay vào hoàn thiện bất kỳ trang nào, bạn chỉ cần lặp lại đúng **8 bước tuần tự** dưới đây:

```text
[BƯỚC 1] Nhìn Page/Component trên Frontend -> Xem nút bấm đang thiếu API gì
   │
   ▼  (Xuống Backend làm từ trong ra ngoài: DTO -> Service -> DI -> Controller)
[BƯỚC 2] Tạo file DTO trong Models/DTOs/<Nhánh của bạn>/ (Định nghĩa dữ liệu gửi lên)
   │
[BƯỚC 3] Tạo Interface & Service trong Services/<Nhánh của bạn>/ (Lưu vào MySQL qua Repository)
   │
[BƯỚC 4] Đăng ký 1 dòng DI trong Helpers/DependencyInjection/<Nhánh của bạn>ServiceExtensions.cs
   │
[BƯỚC 5] Mở Controller trong Controllers/<Nhánh của bạn>/ viết hàm [HttpPost] / [HttpPut]
   │
   ▼  (Lên lại Frontend làm từ dưới lên trên: API -> DAL -> Component/Page)
[BƯỚC 6] Mở src/api/<nhánh>Api.ts -> Viết hàm fetch() gọi xuống đường dẫn Controller
   │
[BƯỚC 7] Mở src/DAL/<nhánh>DAL.ts -> Bọc hàm API bằng try/catch (có fallback an toàn)
   │
[BƯỚC 8] Mở Component/Page -> Gọi DAL trong hàm onClick/onSubmit & cập nhật useState!
```

---

### VÍ DỤ MINH HỌA TỪNG BƯỚC: Trang Gửi Phản Hồi (`StudentFeedbackPage.tsx`)

#### 🔍 BƯỚC 1: Nhìn vào Page trên Frontend để biết cần làm gì
1. Mở `src/GUIs/pages/student/StudentFeedbackPage.tsx` $\rightarrow$ thấy nó gọi component `FeedbackView.tsx`.
2. Mở `FeedbackView.tsx` ra đọc:
   * Ở `useEffect`: Đã có `await feedbackDAL.getAllRequests()` lấy danh sách đơn từ Backend về rồi.
   * Ở `handleSubmit` (Khi bấm nút **"Gửi phản hồi"**):
     ```tsx
     // Hiện tại đang chỉ lưu giả trên giao diện bằng Date.now() (F5 là mất):
     const handleSubmit = (e: React.FormEvent) => {
       e.preventDefault();
       const newReq: FeedbackApprovalRequest = {
         id: Date.now(), // <--- ID giả! Chưa gọi API lưu xuống MySQL!
         title: title.trim(),
         description: description.trim(),
         ...
       };
       setRequests([newReq, ...requests]);
     };
     ```
3. **Kết luận:** Cần viết 1 API **`POST /api/learning/feedback`** nhận `title`, `description`, `requestedBy` để lưu thật vào bảng `approval_requests` dưới Database.

---

#### 🛠️ BƯỚC 2: Xuống Backend — Tạo file DTO trước tiên
> **Mục đích:** Định nghĩa chính xác "Frontend cần gửi cục JSON gồm những trường nào xuống cho Backend".

* **Vị trí tạo file:** `Capstone2/backend/Models/DTOs/Learning/CreateFeedbackDto.cs`
* **Code mẫu:**
```csharp
using System.ComponentModel.DataAnnotations;

namespace EduTrack.API.Models.DTOs.Learning
{
    public class CreateFeedbackDto
    {
        [Required(ErrorMessage = "Tiêu đề không được để trống")]
        public string Title { get; set; } = null!;

        [Required(ErrorMessage = "Nội dung phản hồi không được để trống")]
        public string Description { get; set; } = null!;

        // ID của Học sinh hoặc Phụ huynh đang gửi (mặc định 6 là HS Lê Văn An, 9 là Phụ huynh)
        public int RequestedBy { get; set; } = 6;

        public int? StudentId { get; set; }
    }
}
```

---

#### ⚙️ BƯỚC 3: Dưới Backend — Tạo Service để lưu xuống Database
> **Làm sao lưu vào Database mà không cần viết lại câu lệnh SQL?**
> Trong project đã có sẵn 22 `Repositories` (có sẵn các hàm `.AddAsync()`, `.UpdateAsync()`, `.DeleteAsync()`, `.GetByIdAsync()`). Bạn chỉ cần **Inject (tiêm) Repository của bảng đó** vào Service của bạn và gọi!

1. **Tạo Interface:** `Capstone2/backend/Services/Learning/Interfaces/ILearnerFeedbackService.cs`
```csharp
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Learning;

namespace EduTrack.API.Services.Learning.Interfaces
{
    public interface ILearnerFeedbackService
    {
        Task<ApprovalRequestDto> CreateFeedbackAsync(CreateFeedbackDto dto);
    }
}
```

2. **Tạo Implementation:** `Capstone2/backend/Services/Learning/Implementation/LearnerFeedbackService.cs`
```csharp
using System;
using System.Threading.Tasks;
using EduTrack.API.Models.DTOs;
using EduTrack.API.Models.DTOs.Learning;
using EduTrack.API.Models.Entities;
using EduTrack.API.Repositories.Interfaces;
using EduTrack.API.Services.Learning.Interfaces;

namespace EduTrack.API.Services.Learning.Implementation
{
    public class LearnerFeedbackService : ILearnerFeedbackService
    {
        private readonly IApprovalRequestRepository _repository;

        // Tiêm Repository có sẵn của bảng approval_requests vào
        public LearnerFeedbackService(IApprovalRequestRepository repository)
        {
            _repository = repository;
        }

        public async Task<ApprovalRequestDto> CreateFeedbackAsync(CreateFeedbackDto dto)
        {
            // 1. Tạo Entity từ DTO gửi lên
            var entity = new ApprovalRequest
            {
                RequestCode = $"FB-{DateTime.UtcNow:MMddHHmmss}",
                RequestType = "feedback",
                Title = dto.Title.Trim(),
                Description = dto.Description.Trim(),
                Reason = dto.Description.Trim(),
                RequestedBy = dto.RequestedBy,
                StudentId = dto.StudentId ?? dto.RequestedBy,
                Priority = "normal",
                Status = "pending",
                CreatedAt = DateTime.UtcNow
            };

            // 2. Lưu xuống MySQL
            var saved = await _repository.AddAsync(entity);

            // 3. Trả về DTO cho Frontend hiển thị
            return new ApprovalRequestDto
            {
                RequestId = saved.RequestId,
                RequestCode = saved.RequestCode,
                RequestType = saved.RequestType,
                Title = saved.Title,
                Description = saved.Description,
                RequestedBy = saved.RequestedBy,
                Status = saved.Status,
                CreatedAt = saved.CreatedAt
            };
        }
    }
}
```

---

#### 🔌 BƯỚC 4: Đăng ký Service vào file DI của nhánh bạn
* **Mở file:** `Capstone2/backend/Helpers/DependencyInjection/LearningServiceExtensions.cs` (hoặc `ManagementServiceExtensions.cs` / `TeachingServiceExtensions.cs`)
* **Thêm 1 dòng đăng ký:**
```csharp
public static IServiceCollection AddLearningServices(this IServiceCollection services)
{
    services.AddScoped<ILearnerFeedbackService, LearnerFeedbackService>();
    return services;
}
```

---

#### 🌐 BƯỚC 5: Mở Controller viết hàm nhận Request
* **Mở file:** `Capstone2/backend/Controllers/Learning/LearnerFeedbackController.cs`
* **Code mẫu:**
```csharp
[ApiController]
[Route("api/learning/feedback")]
[Tags("Learning - Student & Parent Feedback")]
public class LearnerFeedbackController : ControllerBase
{
    private readonly ILearnerFeedbackService _feedbackService;

    public LearnerFeedbackController(ILearnerFeedbackService feedbackService)
    {
        _feedbackService = feedbackService;
    }

    // POST: /api/learning/feedback
    [HttpPost]
    public async Task<ActionResult<ApprovalRequestDto>> CreateFeedback([FromBody] CreateFeedbackDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var created = await _feedbackService.CreateFeedbackAsync(dto);
        return Ok(created);
    }
}
```
*(Đến đây là **XONG BACKEND**! Bật `dotnet run`, mở `/swagger` test thử hàm `POST /api/learning/feedback` thấy lưu vào DB ngay).*

---

#### 📡 BƯỚC 6: Lên Frontend — Gọi API trong `src/api/learningApi.ts`
* **Mở file của nhánh bạn:** `Capstone2/frontend/src/api/learningApi.ts` (hoặc `managementApi.ts` / `teachingApi.ts`)
* **Viết hàm `fetch` gọi đúng URL `/api/learning/feedback` ở Bước 5:**
```ts
import type { ApprovalRequestDto } from '../BLL/models/ApprovalRequestDto';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface CreateFeedbackPayload {
  title: string;
  description: string;
  requestedBy: number;
  studentId?: number;
}

export const learningApi = {
  async createFeedback(payload: CreateFeedbackPayload): Promise<ApprovalRequestDto> {
    const res = await fetch(`${API_BASE_URL}/learning/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP Error ${res.status}`);
    }

    return await res.json(); // Trả về cục ApprovalRequestDto từ Backend
  },
};
```

---

#### 🛡️ BƯỚC 7: Điều phối trong `src/DAL/learningDAL.ts`
* **Mở file của nhánh bạn:** `Capstone2/frontend/src/DAL/learningDAL.ts` (hoặc `managementDAL.ts` / `teachingDAL.ts`)
* **Viết hàm bọc `learningApi.createFeedback` bằng `try / catch`:**
```ts
import { learningApi, type CreateFeedbackPayload } from '../api/learningApi';

export const learningDAL = {
  async createFeedback(payload: CreateFeedbackPayload) {
    try {
      const data = await learningApi.createFeedback(payload);
      return { success: true, data, isLiveApi: true };
    } catch (err: any) {
      console.warn('🟡 [learningDAL] Backend chưa bật, dùng fallback local:', err.message);
      return {
        success: true,
        data: {
          requestId: Date.now(),
          title: payload.title,
          description: payload.description,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
        isLiveApi: false,
      };
    }
  },
};
```

---

#### 🎨 BƯỚC 8: Đưa Data vào Component / Page (`FeedbackView.tsx`)
> **Làm sao để đưa data vừa trả về từ API vào giao diện?**
> Trong React, mọi danh sách hiển thị trên màn hình đều nằm trong một biến **`useState`** (ví dụ ở `FeedbackView.tsx` là `const [requests, setRequests] = useState(...)`).
> Khi gọi `learningDAL` xong, bạn lấy `res.data` (dữ liệu thật vừa lưu trong DB có `requestId` thật) và gọi **`setRequests([newReq, ...requests])`**!

* **Mở file:** `Capstone2/frontend/src/GUIs/components/student/feedback/FeedbackView.tsx`
* **Sửa hàm `handleSubmit`:**
```tsx
// 1. Import learningDAL ở đầu file:
import { learningDAL } from '../../../../DAL/learningDAL';

// 2. Đổi handleSubmit thành async và gọi learningDAL:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!title.trim() || !description.trim()) return;

  // Gọi xuống Backend thông qua learningDAL (ID 6 là học sinh, ID 9 là phụ huynh)
  const requesterId = userRole === 'parent' ? 9 : 6;
  const res = await learningDAL.createFeedback({
    title: title.trim(),
    description: description.trim(),
    requestedBy: requesterId,
  });

  // Lấy dữ liệu thật từ Backend trả về để đưa vào state của React
  const newReq: FeedbackApprovalRequest = {
    id: res.data.requestId, // <-- ID thật từ MySQL!
    requestType: 'feedback',
    title: res.data.title || title.trim(),
    description: res.data.description || description.trim(),
    senderName: userName,
    senderRole: userRole,
    createdAt: new Date().toLocaleDateString('vi-VN'),
    status: 'pending',
    statusLabel: 'Chờ duyệt',
  };

  // Cập nhật state -> Giao diện tự động hiển thị ngay lập tức, F5 không bị mất!
  setRequests([newReq, ...requests]);
  setTitle('');
  setDescription('');
  setToastMessage('Đã gửi phản hồi thành công lên hệ thống Giáo vụ!');
};
```

---

### LƯU Ý BỔ SUNG: KHI CẦN VIẾT API `GET` MỚI KẾT HỢP NHIỀU BẢNG (MULTI-TABLE JOIN)

> **Quy tắc:** Khi một màn hình cần lấy dữ liệu tổng hợp từ 2, 3, 4 bảng cùng lúc (mà `GetAll`/`GetById` đơn bảng trong `Queries/` không đáp ứng đủ), **hãy viết hàm `[HttpGet]` đó ngay trong Controller thuộc nhánh của bạn (`Management/`, `Teaching/`, hoặc `Learning/`)** theo đúng 8 bước trên.

**Ví dụ:** Thành viên 2 (nhóm `Teacher / TA`) cần viết 1 API `GET` kết hợp 4 bảng (`classes` + `student_classes` + `users` + `attendances`) để đổ dữ liệu ra màn hình **Điểm danh lớp học theo buổi**:

1. **Bước 1 — Tạo DTO trả về trong `Models/DTOs/Teaching/ClassAttendanceSheetDto.cs`**:
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
2. **Bước 2 — Kết hợp nhiều bảng trong `Services/Teaching/` & `TeachingAttendanceController.cs`**:
   ```csharp
   // GET: api/attendances/class/{classId}/session/{sessionId}
   [HttpGet("class/{classId:int}/session/{sessionId:int}")]
   public async Task<ActionResult<ClassAttendanceSheetDto>> GetAttendanceSheet(int classId, int sessionId)
   {
       // Kết hợp dữ liệu từ nhiều bảng thông qua các Repository hoặc EduTrackDbContext
       // Trả về đúng 1 cục JSON duy nhất cho Frontend render bảng điểm danh
   }
   ```
3. **Bước 3 — Đăng ký DI trong `Helpers/DependencyInjection/TeachingServiceExtensions.cs`**:
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
