# EduTrack: API Contract & Specifications
> **Project:** EduTrack - A Smart Learning Center Management System  
> **Course:** CSW480 - Capstone Project 2  
> **Reference Document:** Capstone Report (Lan 5) & EduTrack_Final_Conflict_Resolution.md  
> **Database Scope:** 22 Tables (21 Bảng gốc đã tối ưu + 1 Bảng mới `parent_students`)  
> **Standard Response Format:** JSON  
> **Base URL:** `/api`  
> **Version:** 2.0 (Master Unified API Contract)

---

## 1. General Conventions & Standard Formats

### Standard Response Envelope
Tất cả phản hồi từ API Backend ASP.NET Core đều tuân thủ envelope JSON đồng nhất:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "errors": null
}
```

### Pagination Query Parameters & Response Structure
Đối với các endpoint danh sách có phân trang và tìm kiếm:
- **Query Params:** `?page=1&pageSize=10&search=keyword&sortBy=created_at&order=desc`
- **Data Envelope:**
```json
{
  "items": [],
  "page": 1,
  "pageSize": 10,
  "totalRecords": 100,
  "totalPages": 10
}
```

### Hệ thống Phân quyền Truy cập (Role-Based Access Control - RBAC)
Hệ thống hỗ trợ 6 vai trò người dùng được mã hóa trong JWT Claims:
1. `Center Manager` (`center_manager`): Quản lý toàn diện trung tâm, phê duyệt ngoại lệ tài chính & chuyển lớp.
2. `Admin Staff` (`admin_staff`): Giáo vụ, tiếp nhận học sinh, lập hóa đơn, thu học phí, tiếp nhận & trả lời **Feedback**.
3. `Teacher` (`teacher`): Giảng viên bộ môn, quản lý bài giảng, đề bài tập, Rubric, chấm điểm & duyệt điểm AI.
4. `Teaching Assistant` (`teaching_assistant` / `ta`): Trợ giảng hỗ trợ điểm danh, chấm bài, nhập nhận xét.
5. `Student` (`student`): Học sinh xem thời khóa biểu, làm bài tập, xem điểm & gửi phản hồi.
6. `Parent` (`parent`): Phụ huynh học sinh [C-02], theo dõi tiến độ của các con, xem học phí, gửi phản hồi.

### Status Legend
- ⚪ `Not Started`
- 🟡 `In Progress`
- 🟢 `Completed`
- 🔵 `Optional / Phase 2`

---

## 2. API Contract Master Table

### Module: Auth (Authentication & Password Lifecycle)
*Liên quan: ST-01, Conflict C-02, C-05*
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Auth | POST | `/api/auth/login` | Đăng nhập bằng user code / email & password. Trả về JWT token kèm thông tin role và cờ `mustChangePassword`. Hỗ trợ mã `MGR...`, `ADM...`, `TC...`, `TA...`, `STU...`, `PAR...` | All | 🟡 |
| Auth | POST | `/api/auth/logout` | Đăng xuất và vô hiệu hóa JWT token | Authenticated | ⚪ |
| Auth | GET | `/api/auth/me` | Lấy thông tin cá nhân và quyền hạn của người dùng đang đăng nhập | Authenticated | ⚪ |
| Auth | POST | `/api/auth/forgot-password` | [C-05] Yêu cầu khôi phục mật khẩu. Tự động gửi email reset token; nếu học sinh không có email, tự động gửi về email của Phụ huynh đã liên kết | All | ⚪ |
| Auth | POST | `/api/auth/reset-password` | Đặt lại mật khẩu mới bằng reset token từ email | All | ⚪ |
| Auth | PUT | `/api/auth/change-password` | [C-05] Đổi mật khẩu tài khoản. Bắt buộc thực hiện ở lần đăng nhập đầu tiên nếu `mustChangePassword = true` | Authenticated | ⚪ |

---

### Module: Users (Staff, Teachers & Account Administration)
*Liên quan: CM-01, AD-01, AD-02, Conflict C-05*
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Users | GET | `/api/users` | Danh sách nhân sự, giáo viên, quản lý kèm bộ lọc (role, status, keyword) | Center Manager, Admin Staff | ⚪ |
| Users | GET | `/api/users/{id}` | Xem chi tiết hồ sơ tài khoản người dùng | Center Manager, Admin Staff | ⚪ |
| Users | POST | `/api/users` | Tạo tài khoản nhân sự/giảng viên mới, sinh Temporary Password (`Edu@...`) | Center Manager | ⚪ |
| Users | PUT | `/api/users/{id}` | Cập nhật thông tin cá nhân, chuyên môn và phân quyền | Center Manager | ⚪ |
| Users | PATCH | `/api/users/{id}/status` | Khóa, mở khóa tài khoản (active, inactive, locked) | Center Manager | ⚪ |
| Users | POST | `/api/users/{id}/reset-password` | [C-05] Admin/Manager cấp lại mật khẩu tạm thời trực tiếp tại quầy / Hotline và bật cờ `must_change_password = true` | Center Manager, Admin Staff | ⚪ |
| Users | GET | `/api/users/teachers` | Danh sách giảng viên đang hoạt động phục vụ phân công lớp | Center Manager, Admin Staff | ⚪ |
| Users | GET | `/api/users/teaching-assistants`| Danh sách trợ giảng đang hoạt động phục vụ phân công lớp | Center Manager, Admin Staff | ⚪ |
| Users | GET | `/api/users/profile` | Xem thông tin cá nhân của chính mình | Authenticated | ⚪ |
| Users | PUT | `/api/users/profile` | Tự cập nhật số điện thoại, avatar, thông tin liên lạc | Authenticated | ⚪ |

---

### Module: Students & Parents (Directory, Enrollment & Family Linkage)
*Liên quan: CM-02, AD-01, AD-02, AD-03, ST-01, Conflict C-02, C-03*
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Students | GET | `/api/students` | Tìm kiếm và lọc danh sách học sinh theo tên, mã `STU...`, lớp, trạng thái | Center Manager, Admin Staff | ⚪ |
| Students | GET | `/api/students/{id}` | Chi tiết học sinh, các lớp đang học, thông tin phụ huynh liên kết | Center Manager, Admin Staff, Student (Self), Parent | ⚪ |
| Students | POST | `/api/students` | Tạo hồ sơ học sinh mới (sinh mã `STU...` và temporary password) | Center Manager, Admin Staff | ⚪ |
| Students | PUT | `/api/students/{id}` | Cập nhật thông tin hồ sơ học sinh | Center Manager, Admin Staff | ⚪ |
| Students | POST | `/api/students/{id}/enroll` | Ghi danh học sinh vào lớp học mới (`student_classes`) | Center Manager, Admin Staff | ⚪ |
| Students | PATCH | `/api/students/{id}/classes/{classId}/status` | Đổi trạng thái học lớp (active, dropped, completed) | Center Manager, Admin Staff | ⚪ |
| Students | POST | `/api/students/{id}/transfer` | [C-03] Chuyển lớp học sinh nguyên tử (Atomic transaction: set lớp cũ `dropped` kèm ngày & lý do, tạo bản ghi lớp mới `active`) | Center Manager, Admin Staff | ⚪ |
| Parents | POST | `/api/students/{id}/assign-parent` | [C-02] Gán tài khoản Phụ huynh cho Học sinh (`parent_students`: parentId, relationship, isPrimaryContact) | Center Manager, Admin Staff | ⚪ |
| Parents | GET | `/api/parents/my-children` | [C-02] Phụ huynh xem danh sách các con đang theo học, tiến độ học tập và học phí | Parent | ⚪ |

---

### Module: Subjects (Curriculum Subjects)
*Liên quan: CM-02*
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Subjects | GET | `/api/subjects` | Danh sách các môn học tại trung tâm (Toán, Lý, Hóa, Anh...) | Authenticated | ⚪ |
| Subjects | GET | `/api/subjects/{id}` | Chi tiết môn học và danh sách lớp trực thuộc | Authenticated | ⚪ |
| Subjects | POST | `/api/subjects` | Tạo môn học mới | Center Manager | ⚪ |
| Subjects | PUT | `/api/subjects/{id}` | Cập nhật thông tin môn học | Center Manager | ⚪ |
| Subjects | DELETE | `/api/subjects/{id}` | Xóa môn học (khi chưa có lớp học nào liên kết) | Center Manager | ⚪ |

---

### Module: Classes (Class Management & Cohorts)
*Liên quan: CM-02, AD-04, TC-02, TA-02, ST-02*
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Classes | GET | `/api/classes` | Danh sách lớp học kèm bộ lọc (môn học, giáo viên, trạng thái) | Center Manager, Admin Staff | ⚪ |
| Classes | GET | `/api/classes/{id}` | Chi tiết lớp (phòng học, học phí, GV chính, TA, lịch học, đề cương) | Authenticated | ⚪ |
| Classes | POST | `/api/classes` | Tạo lớp học mới | Center Manager | ⚪ |
| Classes | PUT | `/api/classes/{id}` | Cập nhật thông tin lớp (phòng, học phí, ngày bắt đầu/kết thúc) | Center Manager, Admin Staff | ⚪ |
| Classes | POST | `/api/classes/{id}/teachers` | Phân công Giảng viên chính cho lớp (`teacher_classes`) | Center Manager | ⚪ |
| Classes | DELETE | `/api/classes/{id}/teachers/{teacherId}` | Hủy phân công giảng viên | Center Manager | ⚪ |
| Classes | POST | `/api/classes/{id}/tas` | Phân công Trợ giảng cho lớp (`ta_classes`) | Center Manager | ⚪ |
| Classes | DELETE | `/api/classes/{id}/tas/{taId}` | Hủy phân công trợ giảng | Center Manager | ⚪ |
| Classes | GET | `/api/classes/{id}/students` | Danh sách học sinh đang ghi danh trong lớp | Center Manager, Admin Staff, Teacher, TA | ⚪ |
| Classes | GET | `/api/classes/my-classes` | Lấy danh sách các lớp của chính người dùng (GV dạy, TA hỗ trợ, HS học, Con của PH) | Teacher, TA, Student, Parent | ⚪ |

---

### Module: Schedules & Sessions (Timetable & Calendar)
*Liên quan: AD-04, TC-02, TA-02, ST-02, Conflict C-04*
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Schedules | GET | `/api/classes/{classId}/schedules` | Danh sách khung giờ học định kỳ trong tuần của lớp | Authenticated | ⚪ |
| Schedules | POST | `/api/classes/{classId}/schedules` | Thêm khung giờ học định kỳ (`class_schedules`) | Center Manager, Admin Staff | ⚪ |
| Schedules | PUT | `/api/classes/{classId}/schedules/{id}` | Cập nhật khung giờ học định kỳ | Center Manager, Admin Staff | ⚪ |
| Schedules | DELETE | `/api/classes/{classId}/schedules/{id}` | Xóa khung giờ học định kỳ | Center Manager, Admin Staff | ⚪ |
| Sessions | GET | `/api/sessions` | Lấy danh sách các buổi học toàn trung tâm theo khoảng ngày | Authenticated | ⚪ |
| Sessions | GET | `/api/classes/{classId}/sessions` | Lấy toàn bộ các buổi học của một lớp cụ thể | Authenticated | ⚪ |
| Sessions | POST | `/api/classes/{classId}/sessions` | Sinh tự động hoặc tạo buổi học bổ sung (`class_sessions`) | Center Manager, Admin Staff | ⚪ |
| Sessions | PATCH | `/api/sessions/{id}/status` | Cập nhật trạng thái buổi học (scheduled, completed, cancelled) | Center Manager, Admin Staff, Teacher | ⚪ |
| Sessions | GET | `/api/sessions/my-schedule` | [C-04] Lấy lịch dạy / lịch trực / lịch học cá nhân từ JWT Token trong khoảng thời gian `?startDate=...&endDate=...` | Teacher, TA, Student, Parent | ⚪ |

---

### Module: Attendance (Attendance Tracking)
*Liên quan: CM-04, AD-11, TC-03, TA-03, ST-04*
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Attendance | GET | `/api/sessions/{sessionId}/attendance` | Lấy danh sách điểm danh của buổi học | Center Manager, Admin Staff, Teacher, TA | ⚪ |
| Attendance | POST | `/api/sessions/{sessionId}/attendance` | Điểm danh hàng loạt học sinh trong buổi học (present, late, absent, excused) | Teacher, TA, Admin Staff | ⚪ |
| Attendance | PUT | `/api/sessions/{sessionId}/attendance/{studentId}` | Cập nhật điểm danh và lý do nghỉ cho 1 học sinh | Teacher, TA, Admin Staff | ⚪ |
| Attendance | GET | `/api/classes/{classId}/students/{studentId}/attendance` | Lịch sử chuyên cần và tỷ lệ đi học của học sinh | Center Manager, Admin Staff, Teacher, TA, Student, Parent | ⚪ |

---

### Module: Curriculum (Hierarchical Content Units)
*Liên quan: CM-02, TC-04, ST-03*
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Curriculum | GET | `/api/classes/{classId}/content-units` | Lấy cây đề cương môn học theo phân cấp (Chương, Bài học) | Authenticated | ⚪ |
| Curriculum | POST | `/api/classes/{classId}/content-units` | Tạo bài học/chương mới trong đề cương (`content_units`) | Teacher, Center Manager | ⚪ |
| Curriculum | PUT | `/api/content-units/{id}` | Cập nhật tiêu đề, mô tả và thứ tự bài học | Teacher, Center Manager | ⚪ |
| Curriculum | DELETE | `/api/content-units/{id}` | Xóa bài học khỏi đề cương | Teacher, Center Manager | ⚪ |

---

### Module: Assignments & Submissions (Homework, Rubric & AI Grading)
*Liên quan: TC-04, TC-07, TA-05, ST-03, ST-04*
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Assignments | GET | `/api/classes/{classId}/assignments` | Danh sách bài tập được giao cho lớp | Authenticated | ⚪ |
| Assignments | GET | `/api/assignments/{id}` | Chi tiết bài tập, tệp đính kèm và Rubric tiêu chí (ẩn đáp án chuẩn với HS/PH) | Authenticated | ⚪ |
| Assignments | POST | `/api/classes/{classId}/assignments` | [TC-07] Tạo bài tập mới kèm Rubric tiêu chí chấm (`rubricJson`), Đáp án chuẩn (`answerKeyText`), file đáp án và cờ bật AI | Teacher | ⚪ |
| Assignments | POST | `/api/assignments/generate-rubric` | [TC-07] AI gợi ý tự động bảng tiêu chí Rubric từ đề bài và nội dung bài học | Teacher | ⚪ |
| Assignments | PUT | `/api/assignments/{id}` | Cập nhật đề bài tập, Rubric, đáp án mẫu và hạn nộp | Teacher | ⚪ |
| Assignments | DELETE | `/api/assignments/{id}` | Xóa bài tập | Teacher | ⚪ |
| Submissions | GET | `/api/assignments/{id}/submissions` | Danh sách bài nộp của cả lớp kèm điểm số và trạng thái chấm | Teacher, TA, Admin Staff | ⚪ |
| Submissions | GET | `/api/assignments/{id}/submissions/my` | Lấy bài làm và kết quả điểm/nhận xét của chính mình | Student, Parent | ⚪ |
| Submissions | POST | `/api/assignments/{id}/submissions` | Học sinh nộp bài tập (tải lên file PDF/Word/ảnh bài làm viết tay) | Student | ⚪ |
| Submissions | PUT | `/api/submissions/{id}/grade` | [TC-07] Giáo viên chốt điểm chính thức và nhận xét sau khi kiểm duyệt gợi ý của AI | Teacher, TA | ⚪ |
| Submissions | POST | `/api/submissions/{id}/ai-evaluate` | [TC-07] Kích hoạt mô hình AI Gemini Flash chấm bài tự động theo Rubric, trả về gợi ý điểm (`aiScore`) và nhận xét chi tiết từng tiêu chí (`aiFeedbackJson`) | Teacher | ⚪ |

---

### Module: Progress Notes (Student Academic Feedback)
*Liên quan: CM-04, AD-11, TC-05, TA-04, ST-04*
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Progress | GET | `/api/classes/{classId}/students/{studentId}/notes` | Danh sách nhận xét định kỳ về học sinh trong lớp | Center Manager, Admin Staff, Teacher, TA, Student, Parent | ⚪ |
| Progress | POST | `/api/classes/{classId}/students/{studentId}/notes` | Tạo nhận xét học tập mới (khen ngợi, cảnh báo, góp ý, cột mốc) | Teacher, TA | ⚪ |
| Progress | PUT | `/api/progress-notes/{id}` | Cập nhật nội dung nhận xét | Author Teacher/TA, Center Manager | ⚪ |
| Progress | DELETE | `/api/progress-notes/{id}` | Xóa nhận xét | Author Teacher/TA, Center Manager | ⚪ |

---

### Module: Tuition & Payments (Billing, Counter Payments & VietQR)
*Liên quan: CM-05, CM-06, AD-05, AD-06, ST-06, Conflict C-06*
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Tuition | GET | `/api/tuition/invoices` | Danh sách hóa đơn học phí kèm bộ lọc (tháng, năm, lớp, trạng thái nợ) | Center Manager, Admin Staff | ⚪ |
| Tuition | GET | `/api/tuition/invoices/{id}` | Chi tiết hóa đơn và lịch sử các đợt thanh toán | Center Manager, Admin Staff, Student, Parent | ⚪ |
| Tuition | POST | `/api/tuition/invoices/generate` | Sinh hóa đơn học phí hàng loạt đầu tháng cho học sinh đang học | Center Manager, Admin Staff | ⚪ |
| Tuition | GET | `/api/tuition/my-invoices` | Học sinh / Phụ huynh xem danh sách hóa đơn học phí của con | Student, Parent | ⚪ |
| Tuition | POST | `/api/tuition/invoices/{id}/payments` | [C-06 Core] Ghi nhận thu học phí tại quầy bằng Tiền mặt (`cash`) hoặc Chuyển khoản ngân hàng (`bank_transfer` qua mã VietQR) | Admin Staff, Center Manager | ⚪ |
| Tuition | POST | `/api/tuition/invoices/{id}/checkout-online` | [C-06 Phase 2] Tạo liên kết thanh toán trực tuyến qua cổng VNPay/MoMo Sandbox | Student, Parent | 🔵 |
| Tuition | GET | `/api/tuition/payments` | Nhật ký các giao dịch thu tiền học phí toàn trung tâm | Center Manager, Admin Staff | ⚪ |

---

### Module: Approvals & Feedback (Exception Workflow & User Feedback)
*Liên quan: CM-09, AD-09, AD-10, TC-06, TA-06, Conflict C-01, C-07*
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Approvals | GET | `/api/approvals` | Danh sách đơn từ và phản hồi theo bộ lọc `requestType` (7 loại: tuition_adjustment, refund, credit, due_date_extension, leave_request, class_transfer, feedback) | Center Manager, Admin Staff | ⚪ |
| Approvals | GET | `/api/approvals/{id}` | Xem chi tiết nội dung đơn / ý kiến phản hồi | Center Manager, Admin Staff, Requester | ⚪ |
| Approvals | POST | `/api/approvals` | [C-01 & C-07] Gửi đơn xin duyệt hoặc Gửi **Feedback** (`requestType = 'feedback'`). Áp dụng cho cả Student, Parent, Teacher, TA. Trên UI không cho chọn người nhận, Backend mặc định chuyển cho Admin Staff | Student, Parent, Teacher, TA, Staff | ⚪ |
| Approvals | PUT | `/api/approvals/{id}/review` | [C-01 & C-07] Admin Staff trả lời Feedback (`requestType = 'feedback'`) hoặc Center Manager phê duyệt/từ chối đơn ngoại lệ | Center Manager, Admin Staff | ⚪ |
| Approvals | DELETE | `/api/approvals/{id}` | Rút lại hoặc hủy đơn khi chưa được xử lý | Requester | ⚪ |

---

### Module: Notifications (Announcements & Alerts)
*Liên quan: CM-07, AD-07, ST-05*
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Notifications | GET | `/api/notifications` | Danh sách thông báo gửi đến người dùng đang đăng nhập | Authenticated | ⚪ |
| Notifications | PATCH | `/api/notifications/{id}/read` | Đánh dấu một thông báo đã đọc | Authenticated | ⚪ |
| Notifications | PATCH | `/api/notifications/read-all` | Đánh dấu tất cả thông báo là đã đọc | Authenticated | ⚪ |
| Notifications | POST | `/api/notifications` | Phát thông báo (toàn hệ thống, toàn lớp hoặc cá nhân cụ thể) | Center Manager, Admin Staff | ⚪ |
| Notifications | DELETE | `/api/notifications/{id}` | Xóa thông báo | Center Manager, Admin Staff | ⚪ |

---

### Module: Dashboard & Reports (KPIs & Statistics)
*Liên quan: CM-03, CM-05, AD-08, AD-11*
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Dashboard | GET | `/api/dashboard/manager` | Thống kê tổng quan trung tâm: doanh thu, học sinh hoạt động, đơn chờ duyệt | Center Manager, Admin Staff | ⚪ |
| Dashboard | GET | `/api/dashboard/teacher` | Thống kê giảng viên: ca dạy hôm nay, số bài tập chờ chấm | Teacher, TA | ⚪ |
| Dashboard | GET | `/api/dashboard/student` | Thống kê học sinh: lớp đang học, bài tập sắp đến hạn, học phí cần đóng | Student | ⚪ |
| Dashboard | GET | `/api/dashboard/parent` | [C-02] Thống kê phụ huynh: tình hình học tập và công nợ của các con | Parent | ⚪ |
| Reports | GET | `/api/reports/revenue` | Báo cáo doanh thu học phí theo tháng, quý, năm | Center Manager | ⚪ |
| Reports | GET | `/api/reports/students` | Thống kê số lượng ghi danh, chuyển lớp, nghỉ học và hoàn thành | Center Manager, Admin Staff | ⚪ |
| Reports | GET | `/api/reports/export` | Xuất dữ liệu báo cáo thống kê ra tệp Excel / PDF | Center Manager, Admin Staff | ⚪ |

---

### Module: Settings & Files (Configuration & Uploads)
*Liên quan: CM-08*
| Module | Method | Endpoint | Description | Role | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Settings | GET | `/api/settings` | Lấy các tham số cấu hình trung tâm (hotline, địa chỉ, niên khóa, hạn đóng học phí) | Authenticated | ⚪ |
| Settings | PUT | `/api/settings` | Cập nhật giá trị cấu hình hệ thống | Center Manager | ⚪ |
| Files | POST | `/api/files/upload` | Tải lên tệp ảnh đại diện, bài tập, bài làm hoặc chứng từ đính kèm | Authenticated | ⚪ |

---

## 3. Đặc Tả Chi Tiết Payload Cho Các Endpoint Trọng Tâm

### 1. Endpoint: `POST /api/students/{id}/transfer` (Chuyển lớp học sinh - C-03)
* **Quyền:** `Center Manager`, `Admin Staff`
* **Request Body:**
```json
{
  "fromClassId": 1,
  "toClassId": 2,
  "transferDate": "2026-10-15",
  "reason": "Học sinh đổi lịch học chính khóa tại trường THCS, xin chuyển từ Lớp Toán 9A sang Lớp Toán 9B."
}
```
* **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Student transferred successfully",
  "data": {
    "studentId": 6,
    "fromClassId": 1,
    "toClassId": 2,
    "transferDate": "2026-10-15",
    "status": "active"
  },
  "errors": null
}
```

---

### 2. Endpoint: `POST /api/students/{id}/assign-parent` (Gán Phụ huynh - C-02)
* **Quyền:** `Center Manager`, `Admin Staff`
* **Request Body:**
```json
{
  "parentId": 9,
  "relationship": "Father",
  "isPrimaryContact": true
}
```
* **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Parent linked to student successfully",
  "data": {
    "parentId": 9,
    "studentId": 6,
    "relationship": "Father",
    "isPrimaryContact": true
  },
  "errors": null
}
```

---

### 3. Endpoint: `GET /api/sessions/my-schedule` (Lịch dạy / Lịch học cá nhân - C-04)
* **Quyền:** `Teacher`, `TA`, `Student`, `Parent`
* **Query Params:** `?startDate=2026-10-12&endDate=2026-10-18`
* **Response `200 OK`:**
```json
{
  "success": true,
  "message": "My schedule retrieved successfully",
  "data": [
    {
      "sessionId": 1,
      "classId": 1,
      "className": "Class 9 - Advanced Mathematics",
      "sessionDate": "2026-10-15",
      "startTime": "18:00:00",
      "endTime": "20:00:00",
      "room": "Room 201",
      "roleInSession": "Main Teacher",
      "status": "scheduled"
    }
  ],
  "errors": null
}
```

---

### 4. Endpoint: `POST /api/approvals` (Gửi Feedback hoặc Đơn duyệt - C-01 & C-07)
* **Quyền:** `Student`, `Parent`, `Teacher`, `TA`, `Admin Staff`
* **Ví dụ gửi Feedback (Giao diện hiển thị là "Feedback", không chọn người nhận, Backend mặc định gán Admin Staff):**
```json
{
  "requestType": "feedback",
  "title": "Góp ý về phòng học 201",
  "reason": "Điều hòa phòng 201 bị chảy nước và hơi lạnh trong buổi học tối qua, mong trung tâm bảo trì lại.",
  "classId": 1
}
```
* **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Feedback submitted successfully to admin staff",
  "data": {
    "requestId": 5,
    "requestCode": "AR0005",
    "requestType": "feedback",
    "status": "pending",
    "createdAt": "2026-10-12T17:00:00Z"
  },
  "errors": null
}
```

---

### 5. Endpoint: `PUT /api/approvals/{id}/review` (Trả lời Feedback / Duyệt đơn - C-01)
* **Quyền:** `Admin Staff` (đối với feedback), `Center Manager` (đối với đơn tài chính, chuyển lớp)
* **Request Body:**
```json
{
  "status": "approved",
  "reviewNotes": "Trung tâm đã tiếp nhận và cho kỹ thuật bảo trì điều hòa phòng 201 trong sáng nay. Cảm ơn em!"
}
```
* **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Feedback responded successfully",
  "data": {
    "requestId": 5,
    "status": "approved",
    "reviewNotes": "Trung tâm đã tiếp nhận và cho kỹ thuật bảo trì điều hòa phòng 201 trong sáng nay. Cảm ơn em!",
    "reviewedAt": "2026-10-12T17:15:00Z"
  },
  "errors": null
}
```

---

### 6. Endpoint: `POST /api/submissions/{id}/ai-evaluate` (AI Chấm bài tự động - TC-07)
* **Quyền:** `Teacher`
* **Request Body:**
```json
{
  "submissionId": 1
}
```
* **Response `200 OK`:**
```json
{
  "success": true,
  "message": "AI grading completed successfully",
  "data": {
    "submissionId": 1,
    "suggestedScore": 9.5,
    "aiFeedback": "High accuracy across all 15 solutions. Clear step-by-step logic.",
    "criteriaScores": [
      {
        "criterionId": "crit_1",
        "criterionName": "Tính chính xác của kết quả",
        "maxScore": 5.0,
        "score": 5.0,
        "comment": "Đúng đáp số 15/15 bài."
      },
      {
        "criterionId": "crit_2",
        "criterionName": "Phương pháp giải & Lập luận",
        "maxScore": 3.0,
        "score": 2.8,
        "comment": "Áp dụng định lý Viète chuẩn xác."
      },
      {
        "criterionId": "crit_3",
        "criterionName": "Trình bày & Ký hiệu",
        "maxScore": 2.0,
        "score": 1.7,
        "comment": "Trình bày sạch sẽ, rõ ràng."
      }
    ]
  },
  "errors": null
}
```

---

*Tài liệu này là hợp đồng chuẩn mực kỹ thuật duy nhất giữa Backend (.NET Core) và Frontend (React TSX) cho đồ án Capstone 2 EduTrack.*
