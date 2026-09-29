# EduTrack: Phân tích Xung đột & Các Điểm Cần Thống Nhất Trước Khi Thiết Kế API

> **Tài liệu tham chiếu:**
> 1. Báo cáo đồ án Capstone 1 - Lần nộp 5 (`CSW480_EDUTRACK...docx`)
> 2. Tài liệu đặc tả hợp đồng API (`docs/API_Contract.md`)
> 3. Kịch bản cơ sở dữ liệu MySQL 21 bảng (`db/EduTrack_DB_Script_Lan5.sql`)
>
> **Mục tiêu:** Nhận diện toàn bộ các điểm sai lệch (discrepancies), tính năng ngoài phạm vi (out of scope), và tính năng còn thiếu (missing) giữa Báo cáo và API Contract nhằm thống nhất giải pháp kỹ thuật trước khi bước vào giai đoạn hiện thực hóa mã nguồn (Capstone 2).

---

## MỤC LỤC
1. [Tổng quan Đánh giá Tính Hợp lý](#1-tổng-quan-đánh-giá-tính-hợp-lý)
2. [Bảng Tổng hợp Xung đột & Điểm Lệch (Matrix of Conflicts)](#2-bảng-tổng-hợp-xung-đột--điểm-lệch-matrix-of-conflicts)
3. [Chi tiết Các Điểm Xung đột & Phân tích Nguyên nhân](#3-chi-tiết-các-điểm-xung-đột--phân-tích-nguyên-nhân)
   - [Conflict 01: Thiếu API Xử lý Phản hồi / Feedback (AD-09)](#conflict-01-thiếu-api-xử-lý-phản-hồi--feedback-ad-09)
   - [Conflict 02: Thiếu Cơ chế & API Liên kết Phụ huynh - Học sinh (AD-01)](#conflict-02-thiếu-cơ-chế--api-liên-kết-phụ-huynh---học-sinh-ad-01)
   - [Conflict 03: Thiếu API Chuyển Lớp Học sinh (AD-03 & CM-09)](#conflict-03-thiếu-api-chuyển-lớp-học-sinh-ad-03--cm-09)
   - [Conflict 04: Thiếu API Lấy Lịch Dạy Cá nhân Cho Teacher / TA (Table 30)](#conflict-04-thiếu-api-lấy-lịch-dạy-cá-nhân-cho-teacher--ta-table-30)
   - [Conflict 05: Lệch Phương thức Khôi phục Mật khẩu (ST-01)](#conflict-05-lệch-phương-thức-khôi-phục-mật-khẩu-st-01)
   - [Conflict 06: Phạm vi Thanh toán Online (Scope Clarification - ST-06)](#conflict-06-phạm-vi-thanh-toán-online-scope-clarification---st-06)
   - [Conflict 07: Đồng bộ Enum `request_type` trong `approval_requests`](#conflict-07-đồng-bộ-enum-request_type-trong-approval_requests)
4. [Đề xuất Phương án Giải quyết Chuẩn hóa (Resolution Plan)](#4-đề-xuất-phương-án-giải-quyết-chuẩn-hóa-resolution-plan)
5. [Checklist Quyết định Cho Nhóm Trước Khi Code](#5-checklist-quyết-định-cho-nhóm-trước-khi-code)

---

## 1. Tổng quan Đánh giá Tính Hợp lý

Bản thảo `API_Contract.md` ban đầu đã xây dựng được nền tảng rất tốt:
- **Chuẩn RESTful & Envelope đồng nhất:** Phân tách rõ tài nguyên (`/api/classes`, `/api/tuition`...), áp dụng envelope `{ success, message, data, errors }` và cấu trúc phân trang chuẩn giúp Frontend React TypeScript xử lý dữ liệu nhất quán.
- **Bám sát kiến trúc phân quyền RBAC:** Đã định danh quyền truy cập (`Role`) cho từng endpoint dựa trên 5 vai trò (Center Manager, Admin Staff, Teacher, TA, Student).
- **Luồng xử lý AI bảo mật:** Endpoint `POST /api/submissions/{id}/ai-evaluate` được đóng gói phía Backend, giúp bảo vệ an toàn API Key của dịch vụ AI khỏi bị lộ trên Client.
- **Bổ sung các API Authentication cần thiết:** Các endpoint kỹ thuật như `/api/auth/me`, `/api/auth/logout`, `/api/auth/change-password` tuy không tách thành requirement riêng trong báo cáo nhưng là chuẩn mực bắt buộc cho luồng JWT.

Tuy nhiên, việc đối chiếu chi tiết đã bộc lộ **7 điểm xung đột/thiếu sót** cần xử lý dứt điểm dưới đây.

---

## 2. Bảng Tổng hợp Xung đột & Điểm Lệch (Matrix of Conflicts)

| Mã | Hạng mục | Hiện trạng trong Báo cáo Lần 5 | Hiện trạng trong API Contract / DB | Mức độ ảnh hưởng | Đề xuất hướng xử lý |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **C-01** | **Feedback (Ý kiến phản hồi)** | Yêu cầu `AD-09`: Admin tiếp nhận, ghi nhận và phản hồi ý kiến học sinh/phụ huynh. | Hoàn toàn chưa có bảng DB và chưa có Endpoint API nào cho Feedback. | **Cao** *(Thiếu Requirement)* | Thêm module Feedback vào API Contract hoặc làm rõ luồng tiếp nhận qua Approval / Notification. |
| **C-02** | **Liên kết Phụ huynh - Học sinh** | Yêu cầu `AD-01`: Tạo hồ sơ và "link parents to their children". | DB dùng mô hình Unified Users (bỏ bảng parent riêng); API chưa có cơ chế liên kết. | **Nghiêm trọng** *(Lệch cấu trúc dữ liệu)* | Thống nhất cơ chế: thêm cột `parent_id` trong `users` hoặc dùng chung tài khoản STU/Parent. |
| **C-03** | **Chuyển lớp học sinh (Transfer)** | Yêu cầu `AD-03` & `CM-09`: Chuyển lớp học sinh, duyệt yêu cầu "special class transfers". | API chỉ có Enroll mới và đổi trạng thái (active/dropped); chưa có API Transfer. | **Trung bình** *(Thiếu luồng nghiệp vụ)* | Thêm API `POST /api/students/{id}/transfer` và bổ sung loại đơn chuyển lớp. |
| **C-04** | **Lịch dạy cá nhân (Teacher/TA)** | Bảng 30 (Trang `/cms/schedule`): Xem lịch dạy/trực cá nhân theo tuần/tháng. | API chỉ có lấy lịch chung theo ngày hoặc theo từng lớp, thiếu API lấy lịch của chính mình. | **Thấp** *(Bất tiện cho Frontend)* | Bổ sung `GET /api/sessions/my-schedule`. |
| **C-05** | **Khôi phục mật khẩu học sinh** | Yêu cầu `ST-01`: Học sinh/phụ huynh khôi phục mật khẩu qua SĐT hoặc ứng dụng. | API quy định gửi link qua email (`registered email`), trong khi học sinh có thể không có email. | **Trung bình** *(Trải nghiệm người dùng)* | Hỗ trợ khôi phục qua Phone/OTP hoặc Admin Reset trực tiếp. |
| **C-06** | **Thanh toán Online (Checkout)** | Mục Scope: Capstone 1 tập trung Billing; cổng thanh toán online dành cho giai đoạn sau. | API Contract định nghĩa `POST .../checkout-online` (VNPay/MoMo). | **Thấp** *(Ngoài Scope Capstone 1)* | Giữ lại dạng tính năng nâng cao (Advanced), ưu tiên hoàn thiện ghi nhận thanh toán tiền mặt/chuyển khoản trước. |
| **C-07** | **Đồng bộ loại đơn ngoại lệ** | `CM-09` nhắc đến duyệt chuyển lớp đặc biệt ("special class transfers"). | DB `approval_requests.request_type` chỉ có: tuition_adjustment, refund, credit, due_date_extension, leave_request. | **Trung bình** *(Không đồng bộ giữa DB & Report)* | Bổ sung `'class_transfer'` vào enum `request_type`. |

---

## 3. Chi tiết Các Điểm Xung đột & Phân tích Nguyên nhân

### Conflict 01: Thiếu API Xử lý Phản hồi / Feedback (AD-09)
- **Mô tả trong Báo cáo:**
  > *"AD-09: Feedback Handling - Allows Admin Staff to receive, record, and respond to feedback or requests from students and parents."*
- **Thực tế:**
  - Trong DB 21 bảng (`EduTrack_DB_Script_Lan5.sql`), chỉ có `progress_notes` (nhận xét 1 chiều từ Giáo viên -> Học sinh) và `approval_requests` (đơn từ nội bộ xin duyệt học phí/nghỉ phép).
  - Hoàn toàn **không có bảng `feedbacks`** và **không có API CRUD Feedback** nào trong `API_Contract.md`.
- **Hệ quả:** Nếu phía phản biện hoặc giảng viên hỏi tính năng AD-09 nằm ở đâu thì Backend và Frontend đều chưa có điểm chạm.

---

### Conflict 02: Thiếu Cơ chế & API Liên kết Phụ huynh - Học sinh (AD-01)
- **Mô tả trong Báo cáo:**
  > *"AD-01: Profile Management - Allows Admin Staff to create and update student and parent profiles, and link parents to their children."*
- **Thực tế:**
  - Ở phiên bản DB v2 cũ từng có bảng `parents` và `parent_student`, nhưng sang Báo cáo Lần 5 nhóm đã chuyển sang mô hình **Unified Users** (Table 8) với vai trò `student` dùng chung cho cả Học sinh và Phụ huynh ("Student and Parent Requirements").
  - Do gom chung, bảng `users` hiện tại không có khóa ngoại tự tham chiếu (`parent_id`) và cũng không có bảng trung gian để liên kết 1 phụ huynh quản lý nhiều con.
  - API Contract hiện chỉ có:
    - `POST /api/students`
    - `PUT /api/students/{id}`
    -> Hoàn toàn thiếu endpoint để gán hoặc liên kết phụ huynh với học sinh.

---

### Conflict 03: Thiếu API Chuyển Lớp Học sinh (AD-03 & CM-09)
- **Mô tả trong Báo cáo:**
  > *"AD-03: Enrollment Operations - Allows Admin Staff to enroll students into classes, transfer them, or update their status..."*  
  > *"CM-09: Request Approval - ...special adjustment requests (e.g., fee waivers, refunds, special class transfers)..."*
- **Thực tế:**
  - `API_Contract.md` hiện chỉ có:
    - `POST /api/students/{id}/enroll` (Ghi danh vào lớp mới).
    - `PATCH /api/students/{id}/classes/{classId}/status` (Đổi trạng thái trong lớp cũ sang `dropped` hoặc `completed`).
  - Thiếu một hành động nguyên tử (atomic transaction) để chuyển học sinh từ Lớp A sang Lớp B (đóng lớp cũ, mở lớp mới, chuyển số dư học phí nếu có) hoặc luồng chuyển lớp cần Center Manager phê duyệt.

---

### Conflict 04: Thiếu API Lấy Lịch Dạy Cá nhân Cho Teacher / TA (Table 30)
- **Mô tả trong Báo cáo:**
  > *Table 30 (Màn hình `/cms/schedule` của Teacher/TA): "Weekly/monthly calendar view displaying shifts. Clicking a shift shows details (room, class size, and the assigned main Teacher/TA)."*
- **Thực tế:**
  - Module Sessions trong `API_Contract.md` chỉ có:
    - `GET /api/sessions?startDate=...&endDate=...` (Lấy tất cả các buổi học trung tâm).
    - `GET /api/classes/{classId}/sessions` (Lấy buổi học theo một lớp cụ thể).
  - Khi Teacher hoặc TA đăng nhập vào trang Schedule của họ, Frontend buộc phải tự lọc qua tất cả các lớp của giáo viên đó, gây lãng phí băng thông và xử lý phức tạp ở Client.
  - Cần một endpoint chuyên biệt trả về lịch dạy của chính người dùng đăng nhập.

---

### Conflict 05: Lệch Phương thức Khôi phục Mật khẩu (ST-01)
- **Mô tả trong Báo cáo:**
  > *"ST-01: Account Access - Allows Students/Parents to log in with admin-provided accounts and recover passwords via phone or the parent app."*
- **Thực tế:**
  - `API_Contract.md` khai báo:
    - `POST /api/auth/forgot-password` (Mô tả: *"Send password reset instructions to registered email"*).
  - Trong thực tế tại trung tâm học thêm, học sinh cấp 2 thường không có email riêng hoặc ít khi kiểm tra email; tài khoản chủ yếu quản lý qua mã `user_code` và số điện thoại `phone` của phụ huynh.

---

### Conflict 06: Phạm vi Thanh toán Online (Scope Clarification - ST-06)
- **Mô tả trong Báo cáo:**
  > Báo cáo nêu rõ giới hạn phạm vi (Project Scope) của Capstone 1 là phân tích và thiết kế, quy trình học phí ưu tiên hóa đơn và thu trực tiếp tại quầy; tích hợp cổng thanh toán trực tuyến (VNPay/MoMo) là định hướng mở rộng.
- **Thực tế trong API Contract:**
  - Có endpoint `POST /api/tuition/invoices/{id}/checkout-online`.
  - Nếu làm thật, endpoint này đòi hỏi phải cấu hình Merchant Sandbox (VNPay/MoMo), xử lý URL Return và Webhook (IPN Callback) cập nhật trạng thái thanh toán tự động, tốn nhiều thời gian tích hợp ở Capstone 2.

---

### Conflict 07: Đồng bộ Enum `request_type` trong `approval_requests`
- **Mô tả trong Báo cáo:**
  > Mục CM-09 nêu người quản lý phê duyệt các đơn xin miễn giảm học phí, hoàn phí, và **chuyển lớp đặc biệt (special class transfers)**.
- **Thực tế:**
  - Trong Database Table 26 (`approval_requests`):
    ```sql
    request_type ENUM('tuition_adjustment', 'refund', 'credit', 'due_date_extension', 'leave_request')
    ```
  - Giá trị `'class_transfer'` chưa có trong ENUM của Database, dẫn đến việc nếu viết API tạo đơn chuyển lớp sẽ bị lỗi ràng buộc dữ liệu (DB constraint violation).

---

## 4. Đề xuất Phương án Giải quyết Chuẩn hóa (Resolution Plan)

Để đảm bảo đồng bộ 100% giữa **Báo cáo**, **Cơ sở dữ liệu** và **API Contract**, dưới đây là giải pháp cụ thể:

### Giải pháp 1: Bổ sung Module Feedback vào API Contract & CSDL
- **CSDL:** Bổ sung bảng `feedbacks` (nhẹ nhàng, độc lập):
  - `feedback_id`, `student_id` (FK users), `title`, `content`, `status` (pending, responded), `response_content`, `responded_by` (FK users), `created_at`.
- **API Contract:** Thêm module **Feedbacks**:
  - `POST /api/feedbacks`: Học sinh/Phụ huynh gửi phản ánh.
  - `GET /api/feedbacks`: Admin Staff xem danh sách phản ánh.
  - `PUT /api/feedbacks/{id}/respond`: Admin Staff phản hồi ý kiến.

### Giải pháp 2: Chuẩn hóa quan hệ Phụ huynh - Học sinh
Có 2 phương án khả thi:
- **Phương án A (Khuyên dùng - Tinh gọn theo Báo cáo Lần 5):** Thống nhất trong tài liệu rằng Phụ huynh và Học sinh sử dụng **chung một tài khoản** (`STUxxx`) theo đúng mô hình bảng `users`. Mọi thông tin liên lạc của phụ huynh (tên, SĐT phụ huynh) được lưu trong profile học sinh. Cập nhật lại câu chữ của requirement `AD-01` để tránh hiểu nhầm phải tạo 2 tài khoản riêng.
- **Phương án B (Nếu bắt buộc tách 2 tài khoản):** Thêm trường `parent_id INT NULL REFERENCES users(user_id)` vào bảng `users`. Khi đó thêm API:
  - `POST /api/students/{id}/assign-parent`: Gán phụ huynh cho học sinh.

### Giải pháp 3: Bổ sung API Chuyển lớp học sinh
- Thêm endpoint vào Module Students:
  - `POST /api/students/{id}/transfer`: Body gồm `{ fromClassId, toClassId, reason, transferDate }`.
  - Backend thực hiện transaction: Cập nhật bản ghi lớp cũ thành `dropped`, tạo bản ghi lớp mới `active` trong bảng `student_classes`.

### Giải pháp 4: Bổ sung API Lịch dạy cá nhân
- Thêm endpoint vào Module Schedules & Sessions:
  - `GET /api/sessions/my-schedule`: Nhận `startDate`, `endDate`. Backend tự động lấy `userId` từ JWT token để truy vấn các buổi học mà user đó được phân công làm Main Teacher (`teacher_classes`) hoặc TA (`ta_classes`), hoặc đăng ký học (`student_classes`).

### Giải pháp 5: Chuẩn hóa luồng Quên mật khẩu
- Sửa mô tả endpoint `POST /api/auth/forgot-password`:
  - Cho phép gửi định danh bằng `email` **HOẶC** `phone`.
  - Với môi trường phát triển (Dev/Demo Capstone 2): Hỗ trợ sinh mã OTP mặc định hoặc cho phép Center Manager / Admin Staff dùng API `POST /api/users/{id}/reset-password` để cấp lại mật khẩu trực tiếp tại quầy.

### Giải pháp 6: Phân định mức độ ưu tiên cho Thanh toán Online
- Giữ lại endpoint `POST /api/tuition/invoices/{id}/checkout-online` trong API Contract nhưng gắn trạng thái ⚪ `Not Started` và đánh dấu `[Optional / Phase 2]`.
- Tập trung ưu tiên hoàn thành trước endpoint thu phí trực tiếp: `POST /api/tuition/invoices/{id}/payments` (tiền mặt / chuyển khoản thủ công) để đáp ứng đủ yêu cầu cốt lõi.

### Giải pháp 7: Cập nhật CSDL `approval_requests`
- Bổ sung giá trị `'class_transfer'` vào ENUM của cột `request_type` trong bảng `approval_requests`:
  ```sql
  request_type ENUM('tuition_adjustment', 'refund', 'credit', 'due_date_extension', 'leave_request', 'class_transfer')
  ```

---

## 5. Checklist Quyết định Cho Nhóm Trước Khi Code

Trước khi bắt tay vào viết code Controller/Service ở Backend hay viết Axios Service ở Frontend, nhóm cần thống nhất 4 câu hỏi chốt:

- [ ] **Q1:** Nhóm muốn thêm bảng `feedbacks` vào database để đáp ứng đúng chữ `AD-09`, hay gom tính năng này vào bảng `approval_requests` dưới dạng một loại yêu cầu đơn từ?
- [ ] **Q2:** Thống nhất mô hình Phụ huynh: Dùng chung 1 tài khoản `student` (Phương án A) hay mở rộng bảng `users` thêm `parent_id` (Phương án B)?
- [ ] **Q3:** Cổng thanh toán VNPay/MoMo có bắt buộc phải chạy thật với Sandbox API trong Capstone 2 không, hay chỉ cần mô phỏng (Mock)?
- [ ] **Q4:** Đồng ý cập nhật bổ sung 3 endpoint tiện ích:
  - `POST /api/students/{id}/transfer` (Chuyển lớp)
  - `GET /api/sessions/my-schedule` (Lịch dạy cá nhân)
  - `POST /api/feedbacks` & `GET /api/feedbacks` (Xử lý phản hồi)

---
*Tài liệu này sẽ được dùng làm căn cứ cập nhật phiên bản tiếp theo của `API_Contract.md` và mã nguồn dự án.*
