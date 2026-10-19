# KIẾN TRÚC 3 TẦNG VÀ CHI TIẾT REPOSITORY - DTOs TOÀN BỘ CÁC BẢNG (EDUTRACK)

---

## PHẦN 1: CẤU TRÚC KIẾN TRÚC 3-TIER (CONTROLLER -> SERVICE -> REPOSITORY)

Hệ thống Backend **EduTrack API** (.NET 8 Web API + Entity Framework Core + MySQL Pomelo) được tổ chức theo chuẩn kiến trúc phân tầng (N-Tier / Layered Architecture) nhằm đảm bảo nguyên lý **Separation of Concerns (SoC)**, khả năng mở rộng (Scalability) và dễ dàng kiểm thử (Testability).

Theo yêu cầu chuẩn hóa giai đoạn thử nghiệm: **Mỗi Controller chỉ cung cấp đúng 2 API cơ bản: `GetAll` và `GetById`**. Mọi hàm dư thừa khác đã được tinh giản triệt để.

```
                      ┌─────────────────────────────────────────┐
                      │             CLIENT / FRONTEND           │
                      │       (React, Next.js, Mobile App)      │
                      └────────────────────┬────────────────────┘
                                           │ HTTP Request (GET /api/...)
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. CONTROLLERS LAYER (EduTrack.API.Controllers)                                        │
│    - Tiếp nhận HTTP Request:                                                           │
│      + GET /api/{resource}        -> Lấy danh sách toàn bộ                             │
│      + GET /api/{resource}/{id}   -> Lấy chi tiết theo ID                              │
│    - Validate các tham số đầu vào (Route Params).                                      │
│    - Ủy quyền xử lý cho Service tương ứng qua Dependency Injection (DI).               │
│    - Định dạng và trả về HTTP Response (200 OK, 404 Not Found, ...)                    │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │ Gọi Interface Service (GetAll...Async, Get...ByIdAsync)
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 2. SERVICES LAYER (EduTrack.API.Services.Interfaces & Implementation)                  │
│    - Trung tâm xử lý Logic nghiệp vụ (Business Logic).                                 │
│    - Gọi Repository để lấy dữ liệu thô (Entities).                                     │
│    - Thực hiện chuyển đổi và ánh xạ (Mapping) từ Entity sang DTO (Data Transfer Object).│
│    - Tính toán các trường phụ thuộc (tổng số lượng, tính điểm trung bình, công nợ,...).│
│    - Loại bỏ các trường nhạy cảm (PasswordHash, Salt) và triệt tiêu Circular Reference.│
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │ Gọi Interface Repository (GetAllAsync, GetByIdAsync)
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 3. REPOSITORIES LAYER (EduTrack.API.Repositories.Interfaces & Implementation)          │
│    - Tầng trừu tượng hóa truy cập cơ sở dữ liệu (Data Access Layer).                  │
│    - IGenericRepository<T>: Chứa đúng 2 hàm Task<IEnumerable<T>> GetAllAsync()         │
│                             và Task<T?> GetByIdAsync(int id).                          │
│    - Specific Repositories kế thừa GenericRepository<T> để mở rộng:                   │
│      + Tối ưu nạp dữ liệu liên kết bằng Eager Loading (.Include, .ThenInclude).        │
│      + Sử dụng .AsNoTracking() để tối đa tốc độ đọc (Read-only performance).           │
│      + Riêng ParentStudent xử lý khóa kép GetByIdsAsync(parentId, studentId).          │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │ DbContext / LINQ Query
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 4. DATABASE CONTEXT & DATABASE (MySQL Pomelo)                                          │
│    - EduTrackDbContext: Định cấu hình Fluent API, Foreign Keys, Indexes, Composite Keys │
│    - Bảng vật lý (22 Tables) trong cơ sở dữ liệu MySQL                                 │
│    - DbSeeder: Nạp dữ liệu mẫu tự động cho 22 bảng khi khởi động                       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## PHẦN 2: CHI TIẾT 22 BẢNG - REPOSITORY CHỨA GÌ & DTOs LẤY NHỮNG GÌ

Dưới đây là chi tiết cụ thể của toàn bộ **22 Entities/Tables** trong hệ sinh thái EduTrack (đều chỉ chứa duy nhất `GetAll` và `GetById`).

---

### Nhóm 1: Xác thực, Người dùng & Phân quyền (Core Identity & Roles)

#### 1. Table: `users`
- **Entity**: `User` (Khóa chính đơn: `UserId`)
- **Repository chứa gì (`UserRepository`)**:
  - Kế thừa: `GenericRepository<User>`, `IUserRepository`.
  - Override `GetAllAsync()` & `GetByIdAsync(int id)`: nạp kèm `.Include(u => u.UserRoles).ThenInclude(ur => ur.Role)`.
- **DTO sử dụng (`UserDto`)**:
  - **Lấy những trường từ Entity**: `UserId`, `UserCode`, `FullName`, `Email`, `Phone`, `Status`, `AvatarUrl`, `CreatedAt`.
  - **Lấy từ quan hệ**: `Roles` (danh sách `List<string>` tên các vai trò như `["Admin", "Teacher"]`).
  - **Bỏ đi những gì**: Loại bỏ hoàn toàn `PasswordHash`, `ResetToken`, `RefreshToken` để bảo mật an toàn tuyệt đối.

#### 2. Table: `roles`
- **Entity**: `Role` (Khóa chính đơn: `RoleId`)
- **Repository chứa gì (`GenericRepository<Role>`)**:
  - Kế thừa trực tiếp `GenericRepository<Role>`: cung cấp `GetAllAsync()` và `GetByIdAsync(int id)`.
- **DTO sử dụng (`RoleDto`)**:
  - **Lấy những trường**: `RoleId`, `RoleName`, `Description`.

#### 3. Table: `user_roles`
- **Entity**: `UserRole` (Khóa chính đơn: `UserRoleId`, Unique Index: `(UserId, RoleId)`)
- **Repository chứa gì (`UserRoleRepository`)**:
  - Kế thừa: `GenericRepository<UserRole>`, `IUserRoleRepository`.
  - Override `GetAllAsync()` & `GetByIdAsync(int id)`: nạp kèm `.Include(ur => ur.User)` và `.Include(ur => ur.Role)`.
- **DTO sử dụng (`UserRoleDto`)**:
  - **Lấy những trường**: `UserRoleId`, `UserId`, `UserCode`, `FullName`, `UserEmail`, `RoleId`, `RoleName`, `AssignedAt`.

#### 4. Table: `parent_students`
- **Entity**: `ParentStudent` (**Composite Key**: `ParentId` + `StudentId`)
- **Repository chứa gì (`ParentStudentRepository`)**:
  - Kế thừa: `GenericRepository<ParentStudent>`, `IParentStudentRepository`.
  - Cung cấp:
    - `GetAllAsync()`: Lấy toàn bộ quan hệ kèm `.Include(ps => ps.Parent)` và `.Include(ps => ps.Student)`.
    - `GetByIdsAsync(int parentId, int studentId)`: GetById theo cặp 2 khóa chính.
- **DTO sử dụng (`ParentStudentDto`)**:
  - **Lấy những trường**: `ParentId`, `ParentName`, `ParentPhone`, `ParentEmail`, `StudentId`, `StudentName`, `StudentCode`, `Relationship` (Bố, Mẹ, Người giám hộ), `IsPrimaryContact`, `CreatedAt`.

---

### Nhóm 2: Học thuật & Lớp học (Academics & Classes)

#### 5. Table: `subjects`
- **Entity**: `Subject` (Khóa chính đơn: `SubjectId`)
- **Repository chứa gì (`SubjectRepository`)**:
  - Override nạp `.Include(s => s.Classes)` trong `GetAllAsync` và `GetByIdAsync`.
- **DTO sử dụng (`SubjectDto`)**:
  - **Lấy những trường**: `SubjectId`, `SubjectCode`, `SubjectName`, `Description`, `TotalClasses` (được đếm tự động từ `Classes.Count`).

#### 6. Table: `classes`
- **Entity**: `Class` (Khóa chính đơn: `ClassId`)
- **Repository chứa gì (`ClassRepository`)**:
  - Override nạp `.Include(c => c.Subject)`.
- **DTO sử dụng (`ClassDto`)**:
  - **Lấy những trường**: `ClassId`, `ClassName`, `SubjectId`, `SubjectName`, `SubjectCode`, `Room`, `TuitionFee`, `StartDate`, `EndDate`, `Status`.

#### 7. Table: `teacher_classes`
- **Entity**: `TeacherClass` (Khóa chính đơn: `TeacherClassId`)
- **Repository chứa gì (`TeacherClassRepository`)**:
  - Override nạp `.Include(tc => tc.Teacher)` và `.Include(tc => tc.Class)`.
- **DTO sử dụng (`TeacherClassDto`)**:
  - **Lấy những trường**: `TeacherClassId`, `TeacherId`, `TeacherName`, `TeacherCode`, `ClassId`, `ClassName`, `AssignedAt`, `Status`.

#### 8. Table: `ta_classes`
- **Entity**: `TaClass` (Khóa chính đơn: `TaClassId`)
- **Repository chứa gì (`TaClassRepository`)**:
  - Override nạp `.Include(tc => tc.Ta)` và `.Include(tc => tc.Class)`.
- **DTO sử dụng (`TaClassDto`)**:
  - **Lấy những trường**: `TaClassId`, `TaId`, `TaName`, `TaCode`, `ClassId`, `ClassName`, `AssignedAt`, `Status`.

#### 9. Table: `student_classes`
- **Entity**: `StudentClass` (Khóa chính đơn: `ScId`)
- **Repository chứa gì (`StudentClassRepository`)**:
  - Override nạp `.Include(sc => sc.Student)` và `.Include(sc => sc.Class)`.
- **DTO sử dụng (`StudentClassDto`)**:
  - **Lấy những trường**: `ScId`, `StudentId`, `StudentName`, `StudentCode`, `ClassId`, `ClassName`, `EnrolledAt`, `Status`.

#### 10. Table: `class_schedules`
- **Entity**: `ClassSchedule` (Khóa chính đơn: `ScheduleId`)
- **Repository chứa gì (`ClassScheduleRepository`)**:
  - Override nạp `.Include(cs => cs.Class)`.
- **DTO sử dụng (`ClassScheduleDto`)**:
  - **Lấy những trường**: `ScheduleId`, `ClassId`, `ClassName`, `DayOfWeek`, `StartTime`, `EndTime`, `Room`.

#### 11. Table: `class_sessions`
- **Entity**: `ClassSession` (Khóa chính đơn: `SessionId`)
- **Repository chứa gì (`ClassSessionRepository`)**:
  - Override nạp `.Include(cs => cs.Class)`.
- **DTO sử dụng (`ClassSessionDto`)**:
  - **Lấy những trường**: `SessionId`, `ClassId`, `ClassName`, `SessionDate`, `StartTime`, `EndTime`, `Room`, `Topic`, `Status`.

#### 12. Table: `content_units`
- **Entity**: `ContentUnit` (Khóa chính đơn: `UnitId`)
- **Repository chứa gì (`ContentUnitRepository`)**:
  - Override nạp `.Include(cu => cu.Subject)`.
- **DTO sử dụng (`ContentUnitDto`)**:
  - **Lấy những trường**: `UnitId`, `SubjectId`, `SubjectName`, `UnitNumber`, `Title`, `Description`, `DurationMinutes`.

---

### Nhóm 3: Điểm danh, Bài tập & Đánh giá AI (Attendance & AI Grading)

#### 13. Table: `attendances`
- **Entity**: `Attendance` (Khóa chính đơn: `AttendanceId`)
- **Repository chứa gì (`AttendanceRepository`)**:
  - Override nạp `.Include(a => a.Session).ThenInclude(s => s.Class)`, `.Include(a => a.Student)`, `.Include(a => a.Recorder)`.
- **DTO sử dụng (`AttendanceDto`)**:
  - **Lấy những trường**: `AttendanceId`, `SessionId`, `ClassName`, `SessionDate`, `StudentId`, `StudentName`, `StudentCode`, `Status`, `Note`, `RecordedById`, `RecordedByName`, `RecordedAt`.

#### 14. Table: `assignments`
- **Entity**: `Assignment` (Khóa chính đơn: `AssignmentId`)
- **Repository chứa gì (`AssignmentRepository`)**:
  - Override nạp `.Include(a => a.Class)`, `.Include(a => a.Creator)`.
- **DTO sử dụng (`AssignmentDto`)**:
  - **Lấy những trường**: `AssignmentId`, `ClassId`, `ClassName`, `Title`, `Description`, `DueDate`, `MaxScore`, `CreatedById`, `CreatorName`, `CreatedAt`.

#### 15. Table: `submissions`
- **Entity**: `Submission` (Khóa chính đơn: `SubmissionId`)
- **Repository chứa gì (`SubmissionRepository`)**:
  - Override nạp `.Include(s => s.Assignment)`, `.Include(s => s.Student)`, `.Include(s => s.Grader)`.
- **DTO sử dụng (`SubmissionDto`)**:
  - **Lấy những trường**: `SubmissionId`, `AssignmentId`, `AssignmentTitle`, `StudentId`, `StudentName`, `StudentCode`, `SubmissionUrl`, `SubmittedAt`, `Score`, `Feedback`, `GradedById`, `GraderName`, `GradedAt`, `Status`.

#### 16. Table: `ai_evaluations`
- **Entity**: `AiEvaluation` (Khóa chính đơn: `EvaluationId`)
- **Repository chứa gì (`AiEvaluationRepository`)**:
  - Override nạp `.Include(ae => ae.Submission).ThenInclude(s => s.Assignment)`.
- **DTO sử dụng (`AiEvaluationDto`)**:
  - **Lấy những trường**: `EvaluationId`, `SubmissionId`, `AssignmentTitle`, `PredictedScore`, `ConfidenceScore`, `AiFeedback`, `CriteriaBreakdown`, `Status`, `EvaluatedAt`.

#### 17. Table: `progress_notes`
- **Entity**: `ProgressNote` (Khóa chính đơn: `NoteId`)
- **Repository chứa gì (`ProgressNoteRepository`)**:
  - Override nạp `.Include(pn => pn.Student)`, `.Include(pn => pn.Class)`, `.Include(pn => pn.Author)`.
- **DTO sử dụng (`ProgressNoteDto`)**:
  - **Lấy những trường**: `NoteId`, `StudentId`, `StudentName`, `ClassId`, `ClassName`, `AuthorId`, `AuthorName`, `Note`, `CreatedAt`.

---

### Nhóm 4: Tài chính, Phê duyệt, Cài đặt & Thông báo (Finance & System)

#### 18. Table: `tuition_invoices`
- **Entity**: `TuitionInvoice` (Khóa chính đơn: `InvoiceId`)
- **Repository chứa gì (`TuitionInvoiceRepository`)**:
  - Override nạp `.Include(ti => ti.Student)`, `.Include(ti => ti.Class)`.
- **DTO sử dụng (`TuitionInvoiceDto`)**:
  - **Lấy những trường**: `InvoiceId`, `InvoiceCode`, `StudentId`, `StudentName`, `ClassId`, `ClassName`, `Amount`, `PaidAmount`, `RemainingAmount`, `DueDate`, `Status`, `CreatedAt`.

#### 19. Table: `payments`
- **Entity**: `Payment` (Khóa chính đơn: `PaymentId`)
- **Repository chứa gì (`PaymentRepository`)**:
  - Override nạp `.Include(p => p.Invoice)`, `.Include(p => p.Receiver)`.
- **DTO sử dụng (`PaymentDto`)**:
  - **Lấy những trường**: `PaymentId`, `InvoiceId`, `InvoiceCode`, `Amount`, `PaymentMethod`, `TransactionCode`, `ReceivedById`, `ReceiverName`, `PaidAt`.

#### 20. Table: `approval_requests`
- **Entity**: `ApprovalRequest` (Khóa chính đơn: `RequestId`)
- **Repository chứa gì (`ApprovalRequestRepository`)**:
  - Override nạp `.Include(ar => ar.Requester)`, `.Include(ar => ar.Reviewer)`.
- **DTO sử dụng (`ApprovalRequestDto`)**:
  - **Lấy những trường**: `RequestId`, `RequestCode`, `RequestType`, `Title`, `Description`, `StudentId`, `StudentName`, `InvoiceId`, `ClassId`, `ClassName`, `RequestedBy`, `RequesterName`, `ReviewedBy`, `ReviewerName`, `Priority`, `Status`, `Reason`, `CreatedAt`, `ReviewedAt`, `ReviewNotes`.

#### 21. Table: `notifications`
- **Entity**: `Notification` (Khóa chính đơn: `NotificationId`)
- **Repository chứa gì (`NotificationRepository`)**:
  - Override nạp `.Include(n => n.User)`.
- **DTO sử dụng (`NotificationDto`)**:
  - **Lấy những trường**: `NotificationId`, `UserId`, `UserName`, `Title`, `Content`, `IsRead`, `CreatedAt`.

#### 22. Table: `center_settings`
- **Entity**: `CenterSetting` (Khóa chính đơn: `SettingId`)
- **Repository chứa gì (`CenterSettingRepository`)**:
  - Kế thừa: `GenericRepository<CenterSetting>`.
- **DTO sử dụng (`CenterSettingDto`)**:
  - **Lấy những trường**: `SettingId`, `SettingKey`, `SettingValue`, `Description`, `UpdatedAt`.

---

## PHẦN 3: BẢNG TỔNG HỢP CÁC ENDPOINT API (CHỈ DUY NHẤT GETALL VÀ GETBYID)

| # | Bảng / Module | Entity | Route Controller | GET All | GET By ID |
|---|---|---|---|---|---|
| 1 | Users | `User` | `/api/users` | `GET /api/users` | `GET /api/users/{id}` |
| 2 | Roles | `Role` | `/api/roles` | `GET /api/roles` | `GET /api/roles/{id}` |
| 3 | User Roles | `UserRole` | `/api/userroles` | `GET /api/userroles` | `GET /api/userroles/{id}` |
| 4 | Parent Students | `ParentStudent` | `/api/parentstudents` | `GET /api/parentstudents` | `GET /api/parentstudents/{parentId}/{studentId}` |
| 5 | Subjects | `Subject` | `/api/subjects` | `GET /api/subjects` | `GET /api/subjects/{id}` |
| 6 | Classes | `Class` | `/api/classes` | `GET /api/classes` | `GET /api/classes/{id}` |
| 7 | Teacher Classes | `TeacherClass` | `/api/teacherclasses` | `GET /api/teacherclasses` | `GET /api/teacherclasses/{id}` |
| 8 | TA Classes | `TaClass` | `/api/taclasses` | `GET /api/taclasses` | `GET /api/taclasses/{id}` |
| 9 | Student Classes | `StudentClass` | `/api/studentclasses` | `GET /api/studentclasses` | `GET /api/studentclasses/{id}` |
| 10 | Class Schedules | `ClassSchedule` | `/api/classschedules` | `GET /api/classschedules` | `GET /api/classschedules/{id}` |
| 11 | Class Sessions | `ClassSession` | `/api/classsessions` | `GET /api/classsessions` | `GET /api/classsessions/{id}` |
| 12 | Content Units | `ContentUnit` | `/api/contentunits` | `GET /api/contentunits` | `GET /api/contentunits/{id}` |
| 13 | Attendances | `Attendance` | `/api/attendances` | `GET /api/attendances` | `GET /api/attendances/{id}` |
| 14 | Assignments | `Assignment` | `/api/assignments` | `GET /api/assignments` | `GET /api/assignments/{id}` |
| 15 | Submissions | `Submission` | `/api/submissions` | `GET /api/submissions` | `GET /api/submissions/{id}` |
| 16 | AI Evaluations | `AiEvaluation` | `/api/aievaluations` | `GET /api/aievaluations` | `GET /api/aievaluations/{id}` |
| 17 | Progress Notes | `ProgressNote` | `/api/progressnotes` | `GET /api/progressnotes` | `GET /api/progressnotes/{id}` |
| 18 | Tuition Invoices | `TuitionInvoice` | `/api/tuitioninvoices` | `GET /api/tuitioninvoices` | `GET /api/tuitioninvoices/{id}` |
| 19 | Payments | `Payment` | `/api/payments` | `GET /api/payments` | `GET /api/payments/{id}` |
| 20 | Approval Requests | `ApprovalRequest` | `/api/approvalrequests` | `GET /api/approvalrequests` | `GET /api/approvalrequests/{id}` |
| 21 | Notifications | `Notification` | `/api/notifications` | `GET /api/notifications` | `GET /api/notifications/{id}` |
| 22 | Center Settings | `CenterSetting` | `/api/centersettings` | `GET /api/centersettings` | `GET /api/centersettings/{id}` |
