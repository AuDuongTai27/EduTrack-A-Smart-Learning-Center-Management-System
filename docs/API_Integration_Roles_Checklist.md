# BẢNG TỔNG HỢP ĐỐI SOÁT TÍCH HỢP API CỦA CẢ 6 VAI TRÒ (ROLES)
> **Tài liệu tham khảo & Hướng dẫn điền file Excel `Capstone 2 - Page`**  
> Dự án: **EduTrack - A Smart Learning Center Management System**  
> Nhóm thực hiện: Huỳnh Khánh Duy, Hoàng Quốc Việt, Âu Dương Tài  
> Giảng viên hướng dẫn: ThS. Ứng Văn Giàu  

---

## 1. VAI TRÒ STUDENT (HỌC SINH)

| STT | Tên Trang / Chức Năng | URL Route | Cột GetAll() | Cột GetById() | API Service / DAL kết nối thực tế & Ghi chú |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **1** | Student Dashboard | `/student/dashboard` | **x** | | `classDAL.getAllClasses()` - Lấy danh sách lớp học của học sinh |
| **2** | My Classes | `/student/classes` | **x** | | `classDAL.getAllClasses()` - Danh sách toàn bộ lớp đang tham gia |
| **3** | Class Detail | `/student/classes/:id` | | **x** | `classDAL.getClassById(id)` - Chi tiết thông tin 1 lớp học |
| **4** | Assignment Detail | `/student/assignments/:id` | | **x** | `assignmentDAL.getAssignmentById(id)` - Xem đề bài & nộp bài tập |
| **5** | Student Schedule | `/student/schedule` | **x** | | `scheduleDAL.getAllClassSchedules()` - Thời khóa biểu học tập |
| **6** | Student Notifications | `/student/notifications` | **x** | | `notificationDAL.getAllNotifications()` - Toàn bộ thông báo cá nhân & trung tâm |
| **7** | Tuition & Payment | `/student/tuition` | **x** | | `tuitionDAL.getAllInvoices()`, `tuitionDAL.getAllPayments()` - Xem học phí & lịch sử đóng |
| **8** | Student Progress | `/student/progress` | **x** | | `progressDAL.getAllAttendances()`, `progressDAL.getAllProgressNotes()` - Bảng điểm danh & tiến độ |
| **9** | Student Feedback | `/student/feedback` | **x** | | `feedbackDAL.getAllRequests()` - Gửi phản hồi / yêu cầu lên trung tâm |
| **10** | Student Profile | `/student/profile` | | **x** | `userDAL.getUserById(6)` - Xem và cập nhật hồ sơ cá nhân học sinh |

---

## 2. VAI TRÒ PARENT (PHỤ HUYNH)

| STT | Tên Trang / Chức Năng | URL Route | Cột GetAll() | Cột GetById() | API Service / DAL kết nối thực tế & Ghi chú |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **1** | Parent Dashboard | `/parent/dashboard` | **x** | | `classDAL.getAllClasses()` - Tổng quan lớp học và tình hình của con |
| **2** | My Classes (Child's Classes) | `/parent/classes` | **x** | | `classDAL.getAllClasses()` - Danh sách các lớp con đang theo học |
| **3** | Class Detail | `/parent/classes/:id` | | **x** | `classDAL.getClassById(id)` - Xem chi tiết lớp học của con |
| **4** | Parent Schedule | `/parent/schedule` | **x** | | `scheduleDAL.getAllClassSchedules()` - Lịch học hàng tuần của con |
| **5** | Parent Notifications | `/parent/notifications` | **x** | | `notificationDAL.getAllNotifications()` - Thông báo từ trung tâm và giáo viên |
| **6** | Tuition & Payment | `/parent/tuition` | **x** | | `tuitionDAL.getAllInvoices()`, `tuitionDAL.getAllPayments()` - Tra cứu học phí & thanh toán |
| **7** | Child Progress | `/parent/progress` | **x** | | `progressDAL.getAllAttendances()`, `progressDAL.getAllProgressNotes()` - Điểm số & nhận xét giáo viên |
| **8** | Parent Feedback | `/parent/feedback` | **x** | | `feedbackDAL.getAllRequests()` - Đơn kiến nghị / liên hệ trung tâm |
| **9** | Parent Profile | `/parent/profile` | | **x** | `userDAL.getUserById(9)` - Hồ sơ tài khoản phụ huynh |

---

## 3. VAI TRÒ TEACHER (GIÁO VIÊN)

| STT | Tên Trang / Chức Năng | URL Route | Cột GetAll() | Cột GetById() | API Service / DAL kết nối thực tế & Ghi chú |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **1** | Teacher Dashboard | `/teacher/dashboard` | **x** | | `classDAL.getAllClasses()`, `scheduleDAL.getAllClassSchedules()`, `notificationDAL.getAllNotifications()` |
| **2** | My Classes | `/teacher/classes` | **x** | | `classDAL.getAllClasses()` - Danh sách toàn bộ lớp học phụ trách |
| **3** | Class Details | `/teacher/classes/:id` | | **x** | `classDAL.getClassById(id)` - Thông tin chi tiết một lớp cụ thể |
| **4** | Class Attendance | `/teacher/classes/:id/attendance` | **x** | **x** | `classDAL.getClassById(id)` (lấy lớp) + `progressDAL.getAllAttendances()` (danh sách điểm danh) |
| **5** | Assignment Details | `/teacher/classes/:classId/assignment/:id` | **x** | **x** | `assignmentDAL.getById(id)` (đề bài) + `submissionDAL.getSubmissionsByAssignmentId(id)` (danh sách nộp) |
| **6** | Create Assignment | `/teacher/classes/:classId/assignment/new-assignment` | | **x** | `classDAL.getClassById(classId)` - Lấy thông tin lớp đổ vào form tạo bài |
| **7** | Teacher Schedule | `/teacher/schedule` | **x** | | `scheduleDAL.getAllClassSchedules()` - Thời khóa biểu giảng dạy |
| **8** | Learning Progress | `/teacher/learning-progress` | **x** | | `classDAL.getAllClasses()`, `userDAL.getAllUsers()`, `progressDAL.getAllAttendances()`, `assignmentDAL.getAllAssignments()` |
| **9** | Teacher Notifications | `/teacher/notifications` | **x** | | `notificationDAL.getAllNotifications()` - Danh sách thông báo giáo viên |
| **10** | Teacher Requests | `/teacher/request` | **x** | | `feedbackDAL.getAllRequests()` - Quản lý đơn từ, đề xuất giảng dạy |
| **11** | Teacher Profile | `/teacher/profile` | | **x** | `userDAL.getUserById(3)` - Hồ sơ giáo viên ThS. Hoàng Quốc Việt |

---

## 4. VAI TRÒ TEACHING ASSISTANT (TRỢ GIẢNG)

| STT | Tên Trang / Chức Năng | URL Route | Cột GetAll() | Cột GetById() | API Service / DAL kết nối thực tế & Ghi chú |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **1** | TA Dashboard | `/teaching-assistant/dashboard` | **x** | **x** | `userDAL.getUserById(5)`, `classDAL.getAllClasses()`, `scheduleDAL.getAllClassSchedules()`, `notificationDAL.getAllNotifications()` |
| **2** | Danh sách lớp phụ trách | `/teaching-assistant/classes` | **x** | | `classDAL.getAllClasses()` - Danh sách toàn bộ lớp trợ giảng hỗ trợ |
| **3** | Chi tiết lớp học | `/teaching-assistant/classes/:id` | **x** | **x** | `classDAL.getClassById(id)` + `userDAL.getAllUsers()` + `assignmentDAL.getAllAssignments()` |
| **4** | Điểm danh buổi học | `/teaching-assistant/classes/:id/attendance` | **x** | **x** | `classDAL.getClassById(id)` + `progressDAL.getAllAttendances()` + `userDAL.getAllUsers()` |
| **5** | Chi tiết bài tập & nộp bài | `/teaching-assistant/classes/:classId/assignment/:id` | **x** | **x** | `assignmentDAL.getById(id)` + `classDAL.getClassById(classId)` + `submissionDAL.getSubmissionsByAssignmentId(id)` |
| **6** | Lịch trực / Thời khóa biểu | `/teaching-assistant/schedule` | **x** | | `scheduleDAL.getAllClassSchedules()` - Lịch trực và lịch trợ giảng |
| **7** | Tiến độ học tập học viên | `/teaching-assistant/learning-progress` | **x** | | `classDAL.getAllClasses()`, `userDAL.getAllUsers()`, `progressDAL.getAllAttendances()`, `assignmentDAL.getAllAssignments()` |
| **8** | Thông báo trợ giảng | `/teaching-assistant/notifications` | **x** | | `notificationDAL.getAllNotifications()` - Danh sách thông báo công việc |
| **9** | Đơn từ & Yêu cầu | `/teaching-assistant/request` | **x** | | `feedbackDAL.getAllRequests()` - Quản lý yêu cầu hỗ trợ lớp |
| **10** | Hồ sơ trợ giảng | `/teaching-assistant/profile` | | **x** | `userDAL.getUserById(5)` - Xem hồ sơ trợ giảng Âu Dương Tài |

---

## 5. VAI TRÒ ADMIN STAFF (GIÁO VỤ)

| STT | Tên Trang / Chức Năng | URL Route | Cột GetAll() | Cột GetById() | API Service / DAL kết nối thực tế & Ghi chú |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **1** | TopBar Header | Toàn hệ thống | **x** | **x** | `notificationDAL.getAllNotifications()` (chuông) + `userDAL.getUserById(2)` (Trần Thị Nhân Viên) |
| **2** | Admin Staff Dashboard | `/admin-staff` | **x** | **x** | `getAllUsers`, `getAllTuitions`, `getAllClassSchedules`, `getAllNotifications`, `getAllRequests` + Modal GetById |
| **3** | Student Management | `/admin-staff/students` | **x** | **x** | `userDAL.getAllUsers()` (lọc student) + Modal **+ Thêm học viên** + Modal chi tiết `userDAL.getUserById(id)` |
| **4** | Class Management | `/admin-staff/classes` | **x** | **x** | `classDAL.getAllClasses()` + Modal **+ Mở lớp mới** + Modal chi tiết `classDAL.getClassById(id)` |
| **5** | Teaching Monitoring | `/admin-staff/teaching-monitoring` | **x** | **x** | `classDAL.getAllClasses()`, `scheduleDAL.getAllClassSchedules()` + Modal chi tiết phân công `classDAL.getClassById(id)` |
| **6** | Tuition & Fees | `/admin-staff/tuition` | **x** | **x** | `tuitionDAL.getAllTuitions()` + Modal **+ Lập phiếu thu** + Modal biên lai `tuitionDAL.getTuitionById(id)` |
| **7** | My Approval Requests | `/admin-staff/approval-requests` | **x** | **x** | `feedbackDAL.getAllRequests()` + Modal **+ Tạo yêu cầu mới** + Modal chi tiết `feedbackDAL.getRequestById(id)` |
| **8** | Received Feedback (MỚI) | `/admin-staff/feedback` | **x** | **x** | `feedbackDAL.getAllRequests()` - Nhận đơn từ 4 vai trò + Modal xử lý/duyệt/từ chối `feedbackDAL.getRequestById(id)` |
| **9** | Notifications | `/admin-staff/notifications` | **x** | **x** | `notificationDAL.getAllNotifications()` + Modal **+ Tạo thông báo** + Master-Detail `notificationDAL.getNotificationById(id)` |
| **10** | Reports & Analytics | `/admin-staff/reports` | **x** | **x** | `tuitionDAL.getAllTuitions()` + Modal **Xuất Excel/PDF** + Modal chi tiết `tuitionDAL.getTuitionById(id)` |

---

## 6. VAI TRÒ CENTER MANAGER (QUẢN LÝ TRUNG TÂM)

| STT | Tên Trang / Chức Năng | URL Route | Cột GetAll() | Cột GetById() | API Service / DAL kết nối thực tế & Ghi chú |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **1** | TopBar Header | Toàn hệ thống | **x** | **x** | `notificationDAL.getAllNotifications()` (chuông) + `userDAL.getUserById(1)` (Nguyễn Văn Quản Lý) |
| **2** | Center Manager Dashboard | `/center-manager/dashboard` | **x** | **x** | `getAllUsers`, `getAllClasses`, `getAllTuitions`, `getAllNotifications` + Modal Thêm học viên nhanh |
| **3** | User Account Management | `/center-manager/user-accounts` | **x** | **x** | `userDAL.getAllUsers()` + Modal **+ Add User** + Modal hồ sơ `userDAL.getUserById(id)` + Khóa/Mở tài khoản |
| **4** | Student Management | `/center-manager/students` | **x** | **x** | `userDAL.getAllUsers()` (lọc student) + Modal **+ Add Student** + Modal hồ sơ `userDAL.getUserById(id)` |
| **5** | Subject Management | `/center-manager/subjects` | **x** | **x** | `subjectDAL.getAllSubjects()` + Modal **+ Add Subject** + Modal chi tiết `subjectDAL.getSubjectById(id)` |
| **6** | Class Management | `/center-manager/classes` | **x** | **x** | `classDAL.getAllClasses()` + Modal **+ Add Class** + Modal chi tiết `classDAL.getClassById(id)` |
| **7** | Tuition Management | `/center-manager/tuition` | **x** | **x** | `tuitionDAL.getAllTuitions()` + Modal **+ Generate Tuition** + Modal biên lai `tuitionDAL.getTuitionById(id)` |
| **8** | Approval Requests | `/center-manager/approval-requests` | **x** | **x** | `feedbackDAL.getAllRequests()` + Modal Thẩm định phê duyệt/từ chối `feedbackDAL.getRequestById(id)` |
| **9** | Notification Management | `/center-manager/notifications` | **x** | **x** | `notificationDAL.getAllNotifications()` + Modal **+ New Notification** + Master-Detail `notificationDAL.getNotificationById(id)` |
| **10** | Reports & Analytics | `/center-manager/reports` | **x** | **x** | `tuitionDAL.getAllTuitions()` + Modal **Export Excel/PDF** + Modal chi tiết `tuitionDAL.getTuitionById(id)` |
| **11** | Settings | `/center-manager/settings` | **x** | **x** | `centerSettingDAL.getAllSettings()` + Modal/API chi tiết `centerSettingDAL.getSettingById(id)` + Lưu cấu hình 4 tabs |
