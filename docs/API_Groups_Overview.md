# Tổng Quan Các Nhóm API Hệ Thống EduTrack

Tài liệu này tổng hợp toàn bộ hệ thống API của **EduTrack** sau khi rà soát, loại bỏ các API dư thừa và gom nhóm theo đúng miền nghiệp vụ (Domain). Hệ thống hiện tại gồm **19 Controllers** được phân chia rõ ràng theo chức năng và quyền hạn sử dụng, đảm bảo đồng bộ 100% giữa Backend (`Capstone2/backend/Controllers`) và Frontend (`Capstone2/frontend/src/api` & `src/DAL`).

---

## 1. Cấu Trúc Thư Mục Backend Controllers

```text
Capstone2/backend/Controllers/
├── Queries/                       # Nhóm Quản lý Trung tâm & Core Domain (Users, Classes, Grades, Subjects, Tuition, Approvals, Settings)
│   ├── UsersController.cs
│   ├── ClassesController.cs
│   ├── GradesController.cs
│   ├── SubjectsController.cs
│   ├── TuitionInvoicesController.cs
│   ├── ApprovalRequestsController.cs
│   └── CenterSettingsController.cs
├── Schedule/                      # Nhóm Lịch học & Buổi học dùng chung toàn hệ thống
│   └── ScheduleController.cs
├── Management/                    # Nhóm Thông báo (Notifications) & Báo cáo Thống kê (Analytics)
│   └── NotificationInboxController.cs
├── Teaching/                      # Nhóm Nghiệp vụ Giảng dạy (Teacher, TA & Giám sát giảng dạy của Admin/Staff)
│   ├── TeachingClassesController.cs
│   ├── TeachingAttendanceController.cs
│   ├── TeachingAssignmentsController.cs
│   ├── TeachingProfileController.cs
│   ├── TeachingRequestsController.cs
│   └── TeachingUploadController.cs
└── Learning/                      # Nhóm Cổng Học tập & Phụ huynh (Student, Parent & Feedback)
    ├── StudentLearningController.cs
    ├── StudentHomeworkController.cs
    ├── ParentPortalController.cs
    └── LearnerFeedbackController.cs
```

---

## 2. Chi Tiết Các Nhóm API, Chức Năng và Vị Trí Sử Dụng

### 2.1. Nhóm Core Domain & Quản Lý Trung Tâm (`Controllers/Queries`)

Đây là nhóm API cốt lõi phục vụ quản trị dữ liệu nền tảng của trung tâm (Admin, Staff) và cung cấp dữ liệu danh mục cho các phân hệ khác.

| Nhóm / Controller | Vị trí Backend | Các Route API chính | Dùng để làm gì? | Vị trí gọi ở Frontend (`src/api` & `src/DAL`) |
| :--- | :--- | :--- | :--- | :--- |
| **Users & Parent-Student Links**<br>`UsersController` | `Controllers/Queries/UsersController.cs` | • `/api/users`<br>• `/api/users/{studentId}/enrollments`<br>• `/api/parentstudents`<br>• `/api/user-selection` | • Quản lý danh sách người dùng (Admin, Staff, Teacher, TA, Student, Parent), tạo/sửa/xóa tài khoản.<br>• Quản lý ghi danh học sinh vào lớp (`enrollments`).<br>• Quản lý liên kết Phụ huynh - Học sinh (`parentstudents`).<br>• Cung cấp danh sách tài khoản nhanh ở màn hình chọn Role/User (`user-selection`). | • `api/userApi.ts`<br>• `api/studentEnrollmentApi.ts`<br>• `api/parentStudentApi.ts`<br>• `DAL/userDAL.ts`<br>• `DAL/parentStudentDAL.ts` |
| **Classes & Class Staff/Enrollment**<br>`ClassesController` | `Controllers/Queries/ClassesController.cs` | • `/api/classes`<br>• `/api/management/classes`<br>• `/api/studentclasses`<br>• `/api/teacherclasses`<br>• `/api/taclasses` | • Quản lý thông tin lớp học (tạo, cập nhật, đổi trạng thái, xóa lớp).<br>• Phân công Giáo viên (`teacherclasses`) và Trợ giảng (`taclasses`) vào lớp.<br>• Quản lý danh sách học sinh thuộc từng lớp (`studentclasses`). | • `api/classApi.ts`<br>• `api/classManagementApi.ts`<br>• `api/classStaffApi.ts`<br>• `DAL/classDAL.ts`<br>• `DAL/classStaffDAL.ts` |
| **Grades (Khối lớp)**<br>`GradesController` | `Controllers/Queries/GradesController.cs` | • `/api/grades`<br>• `/api/management/grades` | • Tra cứu và quản lý danh mục Khối lớp (Grade 6–12, IELTS, TOEIC...), tạo/sửa/xóa khối lớp. | • `api/gradeApi.ts`<br>• `api/gradeManagementApi.ts`<br>• `DAL/classDAL.ts` |
| **Subjects (Môn học)**<br>`SubjectsController` | `Controllers/Queries/SubjectsController.cs` | • `/api/subjects`<br>• `/api/management/subjects` | • Tra cứu và quản lý danh mục Môn học, cấu hình học phí cơ bản theo môn. | • `api/subjectApi.ts`<br>• `DAL/subjectDAL.ts` |
| **Tuition Invoices (Học phí)**<br>`TuitionInvoicesController` | `Controllers/Queries/TuitionInvoicesController.cs` | • `/api/tuitioninvoices`<br>• `/api/management/tuition` | • Tra cứu hóa đơn học phí, lịch sử thanh toán.<br>• Khởi tạo hóa đơn học phí hàng loạt theo tháng, xác nhận thu tiền, thống kê KPI doanh thu học phí cho Admin/Staff. | • `api/tuitionApi.ts`<br>• `api/tuitionGenerationApi.ts`<br>• `DAL/tuitionDAL.ts` |
| **Approval Requests (Phê duyệt)**<br>`ApprovalRequestsController` | `Controllers/Queries/ApprovalRequestsController.cs` | • `/api/approvalrequests`<br>• `/api/management/approval-requests` | • Quản lý quy trình tạo yêu cầu phê duyệt (từ Staff/Teacher) và duyệt/từ chối yêu cầu (bởi Admin). | • `api/approvalRequestApi.ts`<br>• `api/managementApi.ts`<br>• `DAL/managementDAL.ts` |
| **Center Settings (Cấu hình)**<br>`CenterSettingsController` | `Controllers/Queries/CenterSettingsController.cs` | • `/api/centersettings`<br>• `/api/management/settings` | • Đọc và cập nhật thông tin cấu hình trung tâm (tên trung tâm, hotline, địa chỉ, quy định học vụ...). | • `api/centerSettingApi.ts`<br>• `DAL/centerSettingDAL.ts` |

---

### 2.2. Nhóm Lịch Học & Buổi Học Dùng Chung (`Controllers/Schedule`)

Toàn bộ nghiệp vụ lịch học của tất cả các role (Admin, Staff, Teacher, TA, Student, Parent) được gom về một Controller duy nhất.

| Nhóm / Controller | Vị trí Backend | Các Route API chính | Dùng để làm gì? | Vị trí gọi ở Frontend (`src/api` & `src/DAL`) |
| :--- | :--- | :--- | :--- | :--- |
| **Schedule & Sessions**<br>`ScheduleController` | `Controllers/Schedule/ScheduleController.cs` | • `/api/schedule/sessions`<br>• `/api/schedule/management/*`<br>• `/api/classschedules`<br>• `/api/classsessions` | • **Tra cứu lịch học (`/api/schedule/sessions`)**: Lấy thời khóa biểu theo tuần/tháng cho Student, Parent, Teacher, TA, Admin.<br>• **Quản trị lịch học (`/api/schedule/management/*`)**: Admin/Staff tạo lịch định kỳ, thêm/sửa/hủy buổi học, đổi phòng học hoặc giáo viên trực tiếp và kiểm tra trùng lịch (conflict check).<br>• **Lịch cố định & Buổi học lớp (`/api/classschedules`, `/api/classsessions`)**: Đọc cấu hình ca học trong tuần và danh sách các buổi học cụ thể của từng lớp. | • `api/scheduleSessionApi.ts`<br>• `api/scheduleManagementApi.ts`<br>• `DAL/scheduleSessionDAL.ts`<br>• `DAL/scheduleManagementDAL.ts` |

---

### 2.3. Nhóm Thông Báo & Báo Cáo Thống Kê Dùng Chung (`Controllers/Management`)

Phục vụ hệ thống thông báo toàn cục (cho mọi role) và báo cáo phân tích (Reports & Analytics) cho Admin/Staff.

| Nhóm / Controller | Vị trí Backend | Các Route API chính | Dùng để làm gì? | Vị trí gọi ở Frontend (`src/api` & `src/DAL`) |
| :--- | :--- | :--- | :--- | :--- |
| **Notifications & Analytics**<br>`NotificationInboxController` | `Controllers/Management/NotificationInboxController.cs` | • `/api/notifications/*`<br>• `/api/teaching/notifications`<br>• `/api/reports/overview` | • **Hộp thư thông báo (`/api/notifications`)**: Xem danh sách thông báo, số lượng chưa đọc, đánh dấu đã đọc và gửi thông báo mới (Admin/Staff/Teacher).<br>• **Thông báo giảng dạy (`/api/teaching/notifications`)**: Xem và đánh dấu đã đọc thông báo trên cổng Teacher/TA.<br>• **Báo cáo tổng quan (`/api/reports/overview`)**: Thống kê số lượng học sinh, tỷ lệ chuyên cần, doanh thu và tình hình học tập cho trang Reports & Analytics. | • `api/notificationInboxApi.ts`<br>• `api/teachingApi.ts`<br>• `DAL/managementDAL.ts`<br>• `DAL/adminStaffDashboardDAL.ts` |

---

### 2.4. Nhóm Nghiệp Vụ Giảng Dạy - Teacher, TA & Giám Sát (`Controllers/Teaching`)

Phục vụ cổng **Teacher**, **TA (Trợ giảng)** và chức năng **Teaching Monitoring (Giám sát giảng dạy)** của Admin/Staff.

| Nhóm / Controller | Vị trí Backend | Các Route API chính | Dùng để làm gì? | Vị trí gọi ở Frontend (`src/api` & `src/DAL`) |
| :--- | :--- | :--- | :--- | :--- |
| **Teaching Classes & Curriculum**<br>`TeachingClassesController` | `Controllers/Teaching/TeachingClassesController.cs` | • `/api/teaching/classes`<br>• `/api/teaching/classes/{id}`<br>• `/api/teaching/classes/{id}/students`<br>• `/api/teaching/classes/{id}/curriculum` | • Lấy danh sách lớp đang phụ trách của Giáo viên/TA, chi tiết sĩ số học sinh.<br>• Quản lý khung chương trình học (Curriculum topics) và tiến độ giảng dạy của từng lớp.<br>• Hỗ trợ Admin/Staff giám sát hoạt động giảng dạy của các lớp (`teachingMonitoringApi`). | • `api/teachingApi.ts`<br>• `api/teachingMonitoringApi.ts`<br>• `DAL/teachingDAL.ts` |
| **Attendance & Progress Notes**<br>`TeachingAttendanceController` | `Controllers/Teaching/TeachingAttendanceController.cs` | • `/api/teaching/classes/{id}/sessions`<br>• `/api/teaching/sessions/{id}/attendance`<br>• `/api/teaching/sessions/{id}/notes`<br>• `/api/attendances` | • Điểm danh học sinh theo từng buổi học (`Present`, `Absent`, `Late`, `Excused`).<br>• Ghi chú nhận xét tiến độ học tập (Progress Notes) của từng học sinh trong buổi học.<br>• Tra cứu dữ liệu chuyên cần tổng hợp (`/api/attendances`) cho Dashboard và báo cáo. | • `api/teachingApi.ts`<br>• `api/teachingMonitoringApi.ts`<br>• `DAL/teachingDAL.ts`<br>• `DAL/adminStaffDashboardDAL.ts` |
| **Assignments & Grading**<br>`TeachingAssignmentsController` | `Controllers/Teaching/TeachingAssignmentsController.cs` | • `/api/teaching/classes/{id}/assignments`<br>• `/api/teaching/assignments/{id}`<br>• `/api/teaching/assignments/{id}/submissions`<br>• `/api/assignments` | • Giáo viên tạo/sửa/xóa bài tập (Assignments/Homework) cho lớp học.<br>• Xem danh sách bài nộp của học sinh và chấm điểm, viết nhận xét cho từng bài nộp.<br>• Tra cứu danh sách bài tập chung (`/api/assignments`). | • `api/teachingApi.ts`<br>• `api/assignmentApi.ts`<br>• `DAL/teachingDAL.ts`<br>• `DAL/assignmentDAL.ts` |
| **Teaching Profile**<br>`TeachingProfileController` | `Controllers/Teaching/TeachingProfileController.cs` | • `/api/teaching/profile` | • Xem và cập nhật hồ sơ cá nhân, chuyên môn của Giáo viên và Trợ giảng. | • `api/teachingApi.ts`<br>• `DAL/teachingDAL.ts` |
| **Teaching Requests**<br>`TeachingRequestsController` | `Controllers/Teaching/TeachingRequestsController.cs` | • `/api/teaching/requests` | • Giáo viên/TA gửi và theo dõi các yêu cầu hỗ trợ học vụ lên ban quản lý trung tâm. | • `api/teachingApi.ts`<br>• `DAL/teachingDAL.ts` |
| **Teaching File Upload**<br>`TeachingUploadController` | `Controllers/Teaching/TeachingUploadController.cs` | • `/api/teaching/upload` | • Tải lên tài liệu bài giảng, đề bài tập hoặc file đính kèm trong quá trình giảng dạy. | • `api/teachingApi.ts` |

---

### 2.5. Nhóm Cổng Học Tập Học Sinh & Phụ Huynh (`Controllers/Learning`)

Phục vụ cổng **Student**, **Parent** và hệ thống **Feedback (Đánh giá lớp học)**.

| Nhóm / Controller | Vị trí Backend | Các Route API chính | Dùng để làm gì? | Vị trí gọi ở Frontend (`src/api` & `src/DAL`) |
| :--- | :--- | :--- | :--- | :--- |
| **Student Learning Portal**<br>`StudentLearningController` | `Controllers/Learning/StudentLearningController.cs` | • `/api/student/dashboard`<br>• `/api/student/classes`<br>• `/api/student/classes/{classId}`<br>• `/api/student/grades`<br>• `/api/student/attendance`<br>• `/api/student/profile` | • Cung cấp toàn bộ dữ liệu học tập cho cổng Học sinh: Dashboard tổng quan, danh sách lớp đang theo học, chi tiết tài liệu/chương trình học của lớp, bảng điểm cá nhân, lịch sử điểm danh và hồ sơ học sinh. | • `api/learningApi.ts`<br>• `DAL/learningDAL.ts` |
| **Student Homework & Submissions**<br>`StudentHomeworkController` | `Controllers/Learning/StudentHomeworkController.cs` | • `/api/student/homework`<br>• `/api/student/homework/{id}`<br>• `/api/student/homework/{id}/submit`<br>• `/api/student/homework/upload` | • Học sinh xem danh sách bài tập về nhà, chi tiết đề bài, tải file bài làm lên và nộp bài (`submit`), cũng như xem điểm và lời phê của giáo viên. | • `api/learningApi.ts`<br>• `DAL/learningDAL.ts` |
| **Parent Portal**<br>`ParentPortalController` | `Controllers/Learning/ParentPortalController.cs` | • `/api/parent/children`<br>• `/api/parent/overview`<br>• `/api/parent/classes`<br>• `/api/parent/classes/{classId}`<br>• `/api/parent/attendance`<br>• `/api/parent/grades`<br>• `/api/parent/tuition`<br>• `/api/parent/tuition/{id}/pay` | • Cung cấp dữ liệu cho Phụ huynh theo dõi các con (`children`): tổng quan chuyên cần & điểm số, danh sách lớp học thực tế của từng con, chi tiết bài tập/nhận xét trong từng lớp, bảng điểm, lịch sử điểm danh và thanh toán học phí trực tuyến (`pay`). | • `api/learningApi.ts`<br>• `DAL/parentDAL.ts` |
| **Learner Feedback**<br>`LearnerFeedbackController` | `Controllers/Learning/LearnerFeedbackController.cs` | • `/api/feedback`<br>• `/api/feedback/class/{classId}`<br>• `/api/feedback/summary` | • Học sinh/Phụ huynh gửi đánh giá (rating & nhận xét) về chất lượng lớp học và giáo viên.<br>• Admin/Staff/Teacher xem tổng hợp phản hồi và điểm đánh giá trung bình của từng lớp. | • `api/learningApi.ts`<br>• `DAL/feedbackDAL.ts` |

---

## 3. Ghi Chú Các Phân Hệ Đã Lược Bỏ / Tinh Giản API

1. **Quản lý Yêu cầu Đổi lịch (`ScheduleChangeRequests`) — Đã gỡ bỏ**:
   * Do Admin/Staff đã có toàn quyền chỉnh sửa trực tiếp lịch học và buổi học thông qua `ScheduleController` (`/api/schedule/management/*`), luồng gửi yêu cầu đổi lịch trung gian (`/api/schedule/change-requests`) đã được loại bỏ ở cả Backend và Frontend để tránh trùng lặp nghiệp vụ.
2. **Trang Giới Thiệu (`Landing Page`) — Chuyển sang dữ liệu tĩnh (Static Showcase)**:
   * Trang `Landing-page.tsx` và `LandingFooter.tsx` sử dụng dữ liệu cứng trưng bày trực tiếp trên Frontend, không gọi API `/api/landing` để tối ưu tốc độ tải trang và giảm tải không cần thiết cho Backend.
3. **Các Controller CRUD lẻ không sử dụng — Đã dọn dẹp hoặc gộp chung**:
   * Đã loại bỏ các Controller không có nơi gọi trên Frontend (`Rooms`, `Curriculums`, `StudentSubmissions`, `SubmissionAttachments`, `StudentProgressNotes`, `TeachingConfirmations`, `ApprovalLogs`).
   * Đã gộp toàn bộ các Controller bị tách nhỏ (`Management*`, `StudentClasses`, `TeacherClasses`, `TaClasses`, `ClassSchedules`, `ClassSessions`, `ScheduleManagement`, `UserSelection`, `Attendances`, `Assignments`, `TeachingNotifications`) vào 19 Controllers chính ở trên mà vẫn **giữ nguyên 100% đường dẫn URL (Routes)** để Frontend hoạt động ổn định.
