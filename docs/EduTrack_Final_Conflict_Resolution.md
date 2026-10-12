# EduTrack: Báo Cáo Tổng Hợp & Thống Nhất Giải Pháp Kỹ Thuật (7 Điểm Xung Đột C1 – C7)

> **Dự án:** EduTrack - A Smart Learning Center Management System  
> **Tài liệu tham chiếu:**  
> 1. Báo cáo đồ án Capstone 1 - Lần nộp 5 (`CSW480_EDUTRACK...docx`)  
> 2. Tài liệu phân tích xung đột nội bộ (`API_Conflicts_and_Resolution.md`)  
> 3. Ý kiến đề xuất của Âu Dương Tài (`Tai_API_Conflict.docx`)  
> 4. Ý kiến đề xuất phản hồi của Huỳnh Khánh Duy (`Conflict_and_Solution_HKD.docx`)  
> 
> **Mục tiêu:** Tổng hợp toàn diện, chuẩn hóa và chốt dứt điểm giải pháp kỹ thuật cho **7 điểm xung đột (Conflicts C1 – C7)** trước khi bước vào giai đoạn hiện thực hóa mã nguồn (Capstone 2).

---

## 1. BẢNG TỔNG HỢP MA TRẬN QUYẾT ĐỊNH CUỐI CÙNG (FINAL DECISION MATRIX)

| Mã | Hạng mục | Quyết định Thống nhất Cuối cùng | Căn cứ Quyết định | Tác động Kỹ thuật (DB & API) |
| :---: | :--- | :--- | :--- | :--- |
| **C-01** | **Feedback (Ý kiến phản hồi - AD-09)** | **BỎ bảng/module Feedback riêng.** Tận dụng bảng `approval_requests` với enum `request_type = 'feedback'`. Áp dụng cho **Student, Parent, Teacher, TA**. Trên UI hiển thị nhãn **"Feedback"**, không cho chọn người nhận. Backend mặc định gán cho **Admin Staff** xử lý. | Chỉ đạo thống nhất của nhóm | Thêm enum `'feedback'` vào `approval_requests.request_type`. Không cần tạo bảng `feedbacks`. |
| **C-02** | **Liên kết Phụ huynh - Học sinh (AD-01)** | **TÁCH RIÊNG tài khoản Phụ huynh và Học sinh.** Bổ sung role `parent` (mã `PAR...`) và bảng quan hệ `parent_students`. 1 Phụ huynh liên kết nhiều Học sinh, mỗi Học sinh có 1 Phụ huynh chính. Bổ sung bảng `trial_registrations` để quản lý học sinh học thử trước khi cấp tài khoản chính thức. | Đề xuất của **Duy (HKD)** | Thêm role `parent` vào `users.role`. Thêm 2 bảng mới: `parent_students` và `trial_registrations`. Thêm API gán phụ huynh. |
| **C-03** | **Chuyển lớp học sinh (AD-03 & CM-09)** | **Bổ sung API `POST /api/students/{id}/transfer`.** Backend bọc Database Transaction (đóng lớp cũ `dropped`, mở lớp mới `active`). Với chuyển lớp đặc biệt cần duyệt, dùng `approval_requests` với `request_type = 'class_transfer'`. | Hướng dẫn **`API_Conflicts_and_Resolution.md`** | Thêm 1 API chuyển lớp nguyên tử (atomic transaction) vào Module Students. |
| **C-04** | **Lịch dạy cá nhân Teacher/TA (Table 30)** | **Bổ sung API `GET /api/sessions/my-schedule`.** Backend tự động đọc JWT Token (`userId` & `role`) để query lịch ca dạy/trực cá nhân (`teacher_classes`, `ta_classes`, hoặc `student_classes`). Frontend không cần lọc thủ công. | Hướng dẫn **`API_Conflicts_and_Resolution.md`** | Thêm 1 API endpoint vào Module Schedules & Sessions. |
| **C-05** | **Vòng đời Mật khẩu & Quên mật khẩu (ST-01)** | **Chuẩn hóa User Code & Password Lifecycle:** Cấp mật khẩu tạm thời (`"Edu@" + 8 ký tự ngẫu nhiên`), cờ `must_change_password = true` bắt buộc đổi mật khẩu ở lần đăng nhập đầu tiên. **Quên mật khẩu đa kênh:** gửi link reset qua email cá nhân; nếu học sinh không có email thì gửi về email của Phụ huynh đã liên kết; hoặc Admin Staff reset tại quầy. | Đề xuất của **Duy (HKD)** | Thêm 2 cột `must_change_password`, `password_changed_at` vào bảng `users`. Thêm luồng tra cứu email phụ huynh khi reset. |
| **C-06** | **Phạm vi Thanh toán Online (ST-06)** | **Phân định Scope rõ ràng:** Đánh dấu endpoint `POST /api/tuition/invoices/{id}/checkout-online` là `[Optional / Phase 2]` (hoặc Mock Sandbox). **Tập trung ưu tiên 100%** hoàn thành luồng thanh toán tại quầy `POST /api/tuition/invoices/{id}/payments` (tiền mặt / chuyển khoản thủ công). | Hướng dẫn **`API_Conflicts_and_Resolution.md`** | Giữ endpoint trong API Contract kèm tag `[Phase 2 - Optional]`. Không phát sinh bảng DB mới. |
| **C-07** | **Đồng bộ Enum `request_type` trong CSDL** | **Bổ sung `'class_transfer'` và `'feedback'` vào ENUM của cột `request_type`** trong bảng `approval_requests`. Đồng bộ hoàn toàn giữa Báo cáo, Nghiệp vụ và Cơ sở dữ liệu. | Hướng dẫn **`API_Conflicts_and_Resolution.md`** + Quyết định C-01 | Chạy lệnh `ALTER TABLE approval_requests MODIFY COLUMN request_type ENUM(...)`. |

---

## 2. CHI TIẾT GIẢI PHÁP KỸ THUẬT CHO TỪNG ĐIỂM XUNG ĐỘT

---

### CONFLICT 01: XỬ LÝ PHẢN HỒI (FEEDBACK - AD-09) THÔNG QUA APPROVAL REQUESTS

#### 1. Nguyên nhân & Bài toán:
* Yêu cầu `AD-09` trong Báo cáo Lần 5 quy định Admin Staff tiếp nhận và phản hồi ý kiến của học sinh/phụ huynh. Tuy nhiên, nếu tạo riêng một bảng `feedbacks` và bộ API CRUD độc lập sẽ làm tăng độ phức tạp của CSDL (lên 22–23 bảng) và gây phân mảnh với hệ thống duyệt đơn `approval_requests` sẵn có.

#### 2. Giải pháp kỹ thuật thống nhất:
* **Kiến trúc dữ liệu:** Không tạo bảng `feedbacks` riêng. Tận dụng trực tiếp bảng `approval_requests`.
* **Mở rộng Enum:** Bổ sung giá trị `'feedback'` vào cột `request_type` của bảng `approval_requests`.
* **Phạm vi áp dụng:** Cả 4 đối tượng người dùng: **Student, Parent, Teacher, TA** đều có quyền tạo yêu cầu loại `feedback`.
* **Trải nghiệm giao diện (UI/UX):**
  * Trên menu của Student / Parent / Teacher / TA, tính năng này được đặt tên thân thiện là **"Feedback"** (Góp ý / Hỗ trợ).
  * **Form gửi phản hồi trên UI:** Chỉ có các trường: *Tiêu đề (Title)*, *Phân loại (Category - tùy chọn: Học tập, Cơ sở vật chất, Học phí, Khác)*, *Nội dung (Content)*.
  * **Tuyệt đối KHÔNG hiển thị ô chọn người nhận trên UI:** Tránh việc người dùng gửi nhầm người hoặc bối rối không biết chọn ai.
* **Cơ chế xử lý phía Backend:**
  * Khi nhận request tạo đơn có `request_type = 'feedback'`, Backend tự động mặc định gán đối tượng tiếp nhận là **Admin Staff** (vai trò lễ tân/hỗ trợ trung tâm).
  * Backend có thể lưu trường `assigned_role = 'admin_staff'` hoặc gán cho Admin Staff trực quầy.
  * Admin Staff đăng nhập vào CMS, màn hình "Quản lý đơn từ & Phản hồi" sẽ lọc các đơn có `request_type = 'feedback'` để trả lời (nhập nội dung `review_notes`) và cập nhật trạng thái `approved` (đổi nhãn hiển thị thành `Responded / Đã giải đáp`).

#### 3. API Contract cho luồng Feedback:
* **Gửi Feedback (Dành cho Student / Parent / Teacher / TA):**
  * `POST /api/requests`
  * **Payload Request:**
    ```json
    {
      "requestType": "feedback",
      "title": "Phòng học 201 điều hòa bị hỏng",
      "reason": "Điều hòa chảy nước và không mát trong buổi học tối qua, mong trung tâm kiểm tra.",
      "evidenceUrl": "https://cdn.edutrack.vn/evidences/dieuhoa201.jpg"
    }
    ```
  * *Lưu ý:* Header chứa JWT Bearer Token, Backend tự trích xuất `requester_id` từ token và tự đặt `assigned_role = 'admin_staff'`.
* **Admin Staff phản hồi Feedback:**
  * `PUT /api/requests/{id}/review`
  * **Payload Request:**
    ```json
    {
      "status": "approved",
      "reviewNotes": "Trung tâm đã ghi nhận và cho kỹ thuật sửa chữa điều hòa phòng 201 trong sáng nay. Cảm ơn em!"
    }
    ```

---

### CONFLICT 02: QUAN HỆ PHỤ HUYNH - HỌC SINH (AD-01) (THEO FILE DUY - HKD)

#### 1. Phân tích nguyên nhân & Lựa chọn:
* Ban đầu, Tài đề xuất thêm cột `parent_id` trực tiếp vào bảng `users` (tự tham chiếu). Tuy nhiên, **Duy (HKD)** đã chỉ ra các hạn chế quan trọng:
  1. Phụ huynh và học sinh có các hành vi và quyền hạn hoàn toàn khác nhau: Học sinh làm bài, nộp bài, xem bài tập; Phụ huynh xem điểm, theo dõi chuyên cần, thanh toán học phí. Nếu dùng chung tài khoản sẽ dẫn đến việc phụ huynh thao tác nhầm vào phần nộp bài của con.
  2. Một phụ huynh có thể có 2–3 con cùng theo học tại trung tâm. Phụ huynh chỉ cần 1 tài khoản duy nhất để chuyển đổi qua lại giữa các con.

#### 2. Giải pháp kỹ thuật thống nhất (Theo đề xuất của Duy):
* **Tách riêng 2 Role:**
  * Role `student`: Dành riêng cho học sinh (Mã tài khoản: `STU...`).
  * Role `parent`: Dành riêng cho phụ huynh (Mã tài khoản: `PAR...`).
* **Bổ sung bảng quan hệ `parent_students`:**
  * Mô hình quan hệ Nhiều - Một (N - 1): Một Phụ huynh quản lý nhiều Học sinh.
  * Khóa chính kết hợp hoặc cột `student_id UNIQUE` đảm bảo mỗi học sinh gắn với một phụ huynh chính (Primary Contact) để nhận thông báo và hóa đơn.
* **Bổ sung bảng `trial_registrations` (Học sinh học thử):**
  * Đáp ứng thực tế tại trung tâm: Học sinh đến học thử 1–2 buổi trước khi quyết định đăng ký chính thức.
  * Chỉ khi học sinh đóng học phí lần đầu hoặc xác nhận đăng ký chính thức thì Admin Staff mới tiến hành tạo hồ sơ `users` chính thức (sinh mã `STU...` và `PAR...`).

#### 3. Cấu trúc CSDL bổ sung:
```sql
-- 1. Bảng quan hệ Phụ huynh - Học sinh
CREATE TABLE parent_students (
    parent_id INT NOT NULL,
    student_id INT NOT NULL,
    relationship VARCHAR(50) DEFAULT 'Parent' COMMENT 'Father, Mother, Guardian',
    is_primary_contact BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (parent_id, student_id),
    CONSTRAINT fk_ps_parent FOREIGN KEY (parent_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_ps_student FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 2. Bảng đăng ký học thử (Trial Registrations)
CREATE TABLE trial_registrations (
    trial_id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    grade VARCHAR(20) NOT NULL,
    parent_name VARCHAR(100) NOT NULL,
    parent_phone VARCHAR(20) NOT NULL,
    class_id INT NOT NULL,
    trial_date DATE NOT NULL,
    status ENUM('scheduled', 'attended', 'cancelled', 'converted') DEFAULT 'scheduled',
    note TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_trial_class FOREIGN KEY (class_id) REFERENCES classes(class_id)
);
```

#### 4. API Endpoints liên quan:
* `POST /api/students/{id}/assign-parent`: Gán phụ huynh cho học sinh (Body: `{ parentId, relationship }`).
* `GET /api/parents/my-children`: Dành cho Phụ huynh đăng nhập, trả về danh sách các con kèm tiến độ học tập và học phí.

---

### CONFLICT 03: NGHIỆP VỤ CHUYỂN LỚP HỌC SINH (AD-03 & CM-09)

#### 1. Nguyên nhân & Bài toán:
* API Contract hiện chỉ có API Ghi danh mới (`POST /api/students/{id}/enroll`) và API Cập nhật trạng thái (`PATCH .../status`). Khi học sinh muốn chuyển từ Lớp A sang Lớp B (ví dụ đổi lịch học), Frontend buộc phải gọi 2 API rời rạc. Nếu API thứ hai thất bại, dữ liệu sẽ bị lỗi không đồng nhất.

#### 2. Giải pháp kỹ thuật thống nhất (Theo `API_Conflicts_and_Resolution.md`):
* **Bổ sung API Chuyển lớp nguyên tử (Atomic Transaction):**
  * Endpoint: `POST /api/students/{id}/transfer`
  * Phân quyền: `Center Manager`, `Admin Staff`.
* **Luồng xử lý Transaction tại Backend ASP.NET Core:**
  1. Kiểm tra sĩ số lớp mới `toClassId` (nếu đã đầy $\rightarrow$ từ chối).
  2. Bắt đầu `using var transaction = await _context.Database.BeginTransactionAsync();`
  3. Cập nhật bản ghi học sinh ở lớp cũ trong `student_classes`: set `status = 'dropped'`, `dropped_at = transferDate`, `drop_reason = reason`.
  4. Tạo bản ghi mới ở lớp mới trong `student_classes`: set `status = 'active'`, `enrolled_at = transferDate`.
  5. Cập nhật số lượng học sinh (`enrolled_students`) của cả 2 lớp trong bảng `classes`.
  6. Commit Transaction an toàn.
* **Luồng Chuyển lớp đặc biệt cần phê duyệt (`CM-09`):**
  * Với các trường hợp chuyển lớp ngoại lệ (lớp đã đầy, chuyển giữa 2 kỳ, đổi học phí), Admin Staff gửi đơn qua hệ thống: `POST /api/requests` với `request_type = 'class_transfer'`.
  * Sau khi Center Manager bấm Duyệt (`approved`), Backend tự động kích hoạt transaction chuyển lớp hoặc thông báo cho Admin Staff xác nhận.

#### 3. API Contract Chuyển lớp:
* `POST /api/students/{id}/transfer`
* **Payload Request:**
  ```json
  {
    "fromClassId": 10,
    "toClassId": 15,
    "transferDate": "2026-10-15",
    "reason": "Học sinh trùng lịch học thêm tại trường vào tối thứ 3, xin chuyển sang lớp tối thứ 5."
  }
  ```
* **Response:** `200 OK`
  ```json
  {
    "success": true,
    "message": "Student transferred successfully from class MAT10-A to MAT10-B.",
    "data": {
      "studentId": 105,
      "previousClassId": 10,
      "currentClassId": 15,
      "transferDate": "2026-10-15"
    }
  }
  ```

---

### CONFLICT 04: API LỊCH DẠY CÁ NHÂN CHO TEACHER / TA (TABLE 30)

#### 1. Nguyên nhân & Bài toán:
* Màn hình `/cms/schedule` (Table 30 trong Báo cáo) yêu cầu hiển thị Thời khóa biểu ca dạy/trực cá nhân của Giảng viên và Trợ giảng.
* Hiện tại hệ thống chỉ có `GET /api/sessions` (lấy toàn bộ buổi học của trung tâm), buộc Frontend phải tự tải hàng trăm buổi học về rồi lọc theo giáo viên. Cách này vừa tốn băng thông, vừa làm chậm ứng dụng.

#### 2. Giải pháp kỹ thuật thống nhất (Theo `API_Conflicts_and_Resolution.md`):
* **Bổ sung Endpoint chuyên biệt:** `GET /api/sessions/my-schedule`
* **Cơ chế phía Backend:**
  * Backend đọc thông tin định danh `userId` và `role` trực tiếp từ JWT Bearer Token của người dùng đang đăng nhập.
  * Tùy theo `role`, Backend tự động thực hiện truy vấn tối ưu:
    * **Nếu là `teacher`:** Lấy các buổi học của các lớp mà giáo viên được gán làm Giảng viên chính (`classes.teacher_id = userId` hoặc bảng `teacher_classes`).
    * **Nếu là `ta` (Trợ giảng):** Lấy các buổi học của các lớp mà trợ giảng được phân công (`ta_classes.ta_id = userId`).
    * **Nếu là `student`:** Lấy các buổi học của các lớp mà học sinh đang học (`student_classes.student_id = userId` và `status = 'active'`).
  * Nhận 2 tham số query để phân trang theo thời gian: `?startDate=2026-10-01&endDate=2026-10-31`.

#### 3. API Contract:
* `GET /api/sessions/my-schedule?startDate=2026-10-12&endDate=2026-10-18`
* **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "sessionId": 1024,
        "classId": 12,
        "classCode": "MAT10-A",
        "className": "Toán Nâng Cao 10",
        "room": "Phòng 201",
        "sessionDate": "2026-10-13",
        "startTime": "18:00:00",
        "endTime": "19:30:00",
        "roleInSession": "Main Teacher",
        "assignedTa": "Nguyễn Văn B (TA)",
        "totalStudents": 25
      }
    ]
  }
  ```

---

### CONFLICT 05: VÒNG ĐỜI MẬT KHẨU & QUÊN MẬT KHẨU (ST-01) (THEO FILE DUY - HKD)

#### 1. Phân tích nguyên nhân:
* Yêu cầu `ST-01` ghi nhận học sinh đăng nhập bằng tài khoản trung tâm cấp và có thể khôi phục mật khẩu.
* Trong thực tế tại trung tâm luyện thi/học thêm, học sinh cấp 2 thường không có email riêng. Nếu chỉ dựa vào email thì học sinh không thể tự lấy lại mật khẩu; còn nếu tích hợp SMS OTP Brandname thì chi phí cao và tốn thời gian đăng ký nhà mạng.

#### 2. Giải pháp kỹ thuật thống nhất (Theo đề xuất của Duy):

##### A. Quy ước Tiền tố Mã Người dùng (User Code Standardization):
Mỗi tài khoản được sinh tự động theo công thức: `[PREFIX][NĂM][STT TĂNG DẦN]`
* `STU26000001`: Học sinh (Student)
* `PAR26000001`: Phụ huynh (Parent)
* `TCH26000001`: Giảng viên (Teacher)
* `TA26000001`: Trợ giảng (Teaching Assistant)
* `ADM26000001`: Nhân viên giáo vụ (Admin Staff)
* `CM26000001`: Quản lý trung tâm (Center Manager)

##### B. Cơ chế Mật khẩu Tạm thời & Bắt buộc Đổi Mật khẩu (Password Lifecycle):
* Khi Admin Staff tạo tài khoản mới:
  * Hệ thống tự sinh **Temporary Password** ngẫu nhiên theo định dạng: `"Edu@" + 8 ký tự ngẫu nhiên` (ví dụ: `Edu@k9x2m4p1`).
  * Lưu mật khẩu đã hash bằng BCrypt vào `users.password_hash`.
  * Đặt cờ `must_change_password = TRUE` và `password_changed_at = NULL`.
* Khi người dùng đăng nhập lần đầu:
  * Đăng nhập thành công với Temporary Password $\rightarrow$ Backend trả về JWT có cờ `mustChangePassword: true`.
  * Frontend chặn truy cập vào Dashboard $\rightarrow$ Chuyển hướng bắt buộc sang trang `/change-password`.
  * Sau khi người dùng đặt mật khẩu mới của riêng mình $\rightarrow$ Backend cập nhật `must_change_password = FALSE`, lưu thời điểm `password_changed_at` $\rightarrow$ Cho phép truy cập Dashboard bình thường.

##### C. Luồng Khôi phục Mật khẩu (Forgot Password Multi-Channel Flow):
Hệ thống xử lý linh hoạt theo thứ tự ưu tiên:
1. **Phụ huynh quên mật khẩu:** Nhập `user_code` hoặc `email` $\rightarrow$ Hệ thống gửi Reset Token Link về email của Phụ huynh $\rightarrow$ Bấm link đổi mật khẩu.
2. **Học sinh có email riêng:** Hệ thống gửi Reset Link trực tiếp về email học sinh.
3. **Học sinh KHÔNG có email:** Hệ thống tra cứu bảng `parent_students` để tìm Phụ huynh liên kết $\rightarrow$ Gửi mã Reset Link về **email của Phụ huynh** (Phụ huynh hỗ trợ con xác nhận lại mật khẩu).
4. **Không có email khả dụng / Xử lý khẩn cấp:** Học sinh/phụ huynh liên hệ quầy lễ tân. Admin Staff dùng API `POST /api/users/{id}/reset-password` để sinh Temporary Password mới và kích hoạt lại `must_change_password = TRUE`.

#### 3. CSDL cập nhật bảng `users`:
```sql
ALTER TABLE users 
ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Bắt buộc đổi mật khẩu ở lần đăng nhập đầu',
ADD COLUMN password_changed_at DATETIME NULL COMMENT 'Thời điểm đổi mật khẩu lần cuối';
```

---

### CONFLICT 06: PHẠM VI THANH TOÁN ONLINE (SCOPE CLARIFICATION - ST-06)

#### 1. Nguyên nhân & Bài toán:
* Tài liệu Báo cáo Capstone 1 quy định rõ: Trọng tâm của đồ án là Quản lý trung tâm học thêm, Quản lý học phí (Invoices, Billing, Tracking công nợ). Việc kết nối cổng thanh toán trực tuyến (VNPay/MoMo/VietQR) là hướng phát triển mở rộng.
* Nếu cố gắng triển khai cổng online thật trong Capstone 2, nhóm sẽ mất rất nhiều thời gian đăng ký Merchant Sandbox, xử lý Webhook IPN, mã hóa checksum SHA256 và xử lý hoàn tiền nếu giao dịch lỗi.

#### 2. Giải pháp kỹ thuật thống nhất (Theo `API_Conflicts_and_Resolution.md`):
* **Phân định rõ ràng trong API Contract:**
  * Giữ nguyên endpoint `POST /api/tuition/invoices/{id}/checkout-online` trong tài liệu nhưng gắn nhãn: `[Optional / Phase 2 - Mock Sandbox]`.
  * Endpoint này trả về URL thanh toán giả lập (Mock Payment Gateway) để phục vụ quay video demo nếu cần.
* **Tập trung ưu tiên số 1 cho nghiệp vụ thực tế tại trung tâm:**
  * Hoàn thiện 100% luồng thu học phí tại quầy qua API `POST /api/tuition/invoices/{id}/payments`.
  * Hỗ trợ 2 phương thức chính:
    1. `CASH`: Tiền mặt nộp tại quầy lễ tân (Admin Staff thu tiền và in phiếu thu).
    2. `BANK_TRANSFER`: Phụ huynh quét mã VietQR chuyển khoản vào tài khoản ngân hàng trung tâm, Admin Staff đối soát sao kê và bấm xác nhận "Đã thanh toán".
  * Luồng này hoàn toàn đáp ứng xuất sắc các tiêu chí chấm điểm của Hội đồng và Thầy hướng dẫn.

---

### CONFLICT 07: ĐỒNG BỘ ENUM `request_type` TRONG `approval_requests`

#### 1. Nguyên nhân:
* Báo cáo nhắc tới các nghiệp vụ cần Center Manager duyệt: Miễn giảm học phí, hoàn phí, bảo lưu, xin nghỉ phép, chuyển lớp đặc biệt (`CM-09`), và tiếp nhận phản hồi (`AD-09` theo giải pháp C-01).
* Nhưng định nghĩa ENUM trong file CSDL cũ chỉ có 5 giá trị: `tuition_adjustment`, `refund`, `credit`, `due_date_extension`, `leave_request` $\rightarrow$ Thiếu `class_transfer` và `feedback`.

#### 2. Giải pháp kỹ thuật thống nhất:
* Cập nhật định nghĩa ENUM của cột `request_type` trong bảng `approval_requests` để bao gồm đầy đủ **7 loại yêu cầu/đơn từ**:
  1. `tuition_adjustment`: Xin miễn giảm / điều chỉnh học phí.
  2. `refund`: Yêu cầu hoàn học phí.
  3. `credit`: Bảo lưu học phí / chuyển số dư sang kỳ sau.
  4. `due_date_extension`: Xin gia hạn thời hạn đóng học phí.
  5. `leave_request`: Đơn xin nghỉ phép của Giảng viên / Trợ giảng / Học sinh.
  6. `class_transfer`: Yêu cầu chuyển lớp học sinh (Theo C-03).
  7. `feedback`: Ý kiến đóng góp, phản ánh của Học sinh / Phụ huynh / Giáo viên / TA (Theo C-01).

#### 3. Câu lệnh SQL Migration:
```sql
ALTER TABLE approval_requests 
MODIFY COLUMN request_type ENUM(
    'tuition_adjustment', 
    'refund', 
    'credit', 
    'due_date_extension', 
    'leave_request', 
    'class_transfer', 
    'feedback'
) NOT NULL COMMENT 'Loại yêu cầu phê duyệt / phản ánh';
```

---

## 3. TỔNG HỢP CÁC THAY ĐỔI CƠ SỞ DỮ LIỆU (DATABASE SCHEMA MIGRATION SCRIPT)

Dưới đây là kịch bản SQL duy nhất dùng để nâng cấp cơ sở dữ liệu `EduTrack_DB_Script_Lan5.sql` lên phiên bản hoàn chỉnh cho Capstone 2:

```sql
-- =============================================================================
-- EDUTRACK: CONSOLIDATED DATABASE MIGRATION SCRIPT (CAPSTONE 2)
-- Đồng bộ hóa giải pháp cho 7 xung đột C1 - C7
-- =============================================================================

USE edutrack_db;

-- 1. [C-02 & C-05] Cập nhật bảng users: Thêm Role 'parent' và Quản lý mật khẩu
ALTER TABLE users 
MODIFY COLUMN role ENUM('center_manager', 'admin_staff', 'teacher', 'ta', 'student', 'parent') NOT NULL,
ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Bắt buộc đổi mật khẩu ở lần đăng nhập đầu tiên',
ADD COLUMN password_changed_at DATETIME NULL COMMENT 'Thời điểm đổi mật khẩu lần gần nhất';

-- 2. [C-02] Tạo bảng liên kết Phụ huynh - Học sinh (Parent - Student Relationship)
CREATE TABLE IF NOT EXISTS parent_students (
    parent_id INT NOT NULL COMMENT 'FK users (role = parent)',
    student_id INT NOT NULL COMMENT 'FK users (role = student)',
    relationship VARCHAR(50) DEFAULT 'Parent' COMMENT 'Father, Mother, Guardian',
    is_primary_contact BOOLEAN DEFAULT TRUE COMMENT 'Là phụ huynh chính nhận liên lạc và hóa đơn',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (parent_id, student_id),
    CONSTRAINT fk_ps_parent FOREIGN KEY (parent_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_ps_student FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. [C-02] Tạo bảng đăng ký học thử (Trial Registrations)
CREATE TABLE IF NOT EXISTS trial_registrations (
    trial_id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    grade VARCHAR(20) NOT NULL,
    parent_name VARCHAR(100) NOT NULL,
    parent_phone VARCHAR(20) NOT NULL,
    class_id INT NOT NULL,
    trial_date DATE NOT NULL,
    status ENUM('scheduled', 'attended', 'cancelled', 'converted') DEFAULT 'scheduled',
    note TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_trial_class FOREIGN KEY (class_id) REFERENCES classes(class_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. [C-01 & C-07] Mở rộng ENUM request_type trong approval_requests
ALTER TABLE approval_requests 
MODIFY COLUMN request_type ENUM(
    'tuition_adjustment', 
    'refund', 
    'credit', 
    'due_date_extension', 
    'leave_request', 
    'class_transfer', 
    'feedback'
) NOT NULL COMMENT 'Các loại đơn phê duyệt và phản ánh nội bộ';

-- 5. [AI Grading - TC-07] Bổ sung Rubric và Đáp án chuẩn cho Assignments & Submissions
ALTER TABLE assignments
ADD COLUMN answer_key_text TEXT NULL COMMENT 'Đáp án chuẩn / Hướng dẫn giải của giáo viên (ẩn với HS)',
ADD COLUMN answer_key_file_url VARCHAR(255) NULL COMMENT 'File đề cương lời giải mẫu (PDF/DOCX)',
ADD COLUMN rubric_json JSON NULL COMMENT 'Bộ tiêu chí chấm điểm và bareme điểm',
ADD COLUMN is_ai_grading_enabled BOOLEAN DEFAULT TRUE COMMENT 'Cho phép kích hoạt AI chấm bài';

ALTER TABLE submissions
ADD COLUMN ai_score DECIMAL(4,2) NULL COMMENT 'Điểm số AI đề xuất (thang 10)',
ADD COLUMN ai_feedback_json JSON NULL COMMENT 'Điểm chi tiết từng tiêu chí và nhận xét từ LLM',
ADD COLUMN final_score DECIMAL(4,2) NULL COMMENT 'Điểm số chính thức giáo viên duyệt',
ADD COLUMN teacher_feedback TEXT NULL COMMENT 'Nhận xét cuối cùng của giáo viên',
ADD COLUMN grading_status ENUM('SUBMITTED', 'QUEUED', 'AI_GRADED', 'PUBLISHED') DEFAULT 'SUBMITTED';
```

---

## 4. TỔNG HỢP CÁC ENDPOINT API CẦN BỔ SUNG VÀO `API_Contract.md`

Dưới đây là danh sách toàn bộ các Endpoint API phát sinh từ quyết định thống nhất:

| STT | Phương thức | Đường dẫn Endpoint | Vai trò truy cập (RBAC) | Mục đích nghiệp vụ | Xung đột liên quan |
| :---: | :---: | :--- | :--- | :--- | :---: |
| 1 | `POST` | `/api/requests` | Student, Parent, Teacher, TA, Staff | Gửi yêu cầu duyệt hoặc **Gửi Feedback** (`requestType = 'feedback'`) | **C-01** |
| 2 | `GET` | `/api/requests` | Admin Staff, Center Manager | Xem danh sách đơn từ và phản ánh (lọc theo `requestType`) | **C-01** |
| 3 | `PUT` | `/api/requests/{id}/review` | Admin Staff, Center Manager | Trả lời Feedback / Duyệt đơn chuyển lớp, học phí | **C-01, C-07** |
| 4 | `POST` | `/api/students/{id}/assign-parent` | Admin Staff, Manager | Gán tài khoản Phụ huynh cho Học sinh | **C-02** |
| 5 | `GET` | `/api/parents/my-children` | Parent | Phụ huynh xem danh sách các con và tiến độ học tập | **C-02** |
| 6 | `POST` | `/api/trial-registrations` | Admin Staff | Đăng ký học thử cho học sinh mới | **C-02** |
| 7 | `POST` | `/api/students/{id}/transfer` | Admin Staff, Manager | Chuyển học sinh sang lớp khác (Transaction) | **C-03** |
| 8 | `GET` | `/api/sessions/my-schedule` | Teacher, TA, Student | Lấy thời khóa biểu ca dạy / ca học của cá nhân từ JWT Token | **C-04** |
| 9 | `POST` | `/api/users/{id}/reset-password` | Admin Staff, Manager | Cấp lại Temporary Password trực tiếp tại quầy | **C-05** |
| 10 | `POST` | `/api/auth/forgot-password` | All | Yêu cầu khôi phục mật khẩu qua Email (tự tìm Email Parent nếu HS không có) | **C-05** |
| 11 | `POST` | `/api/auth/change-password` | All | Đổi mật khẩu bắt buộc ở lần đầu đăng nhập (`must_change_password`) | **C-05** |
| 12 | `POST` | `/api/tuition/invoices/{id}/checkout-online` | Student, Parent | Tạo link thanh toán online `[Optional / Phase 2]` | **C-06** |

---

## 5. KẾ HOẠCH HÀNH ĐỘNG CHO NHÓM (ACTION ITEMS FOR CAPSTONE 2)

1. **Về Database:** Chạy kịch bản migration ở Mục 3 vào cơ sở dữ liệu dùng chung của nhóm.
2. **Về API Contract:** Đồng bộ danh sách 12 endpoint trên vào file tài liệu `docs/API_Contract.md`.
3. **Về Phân công Backend (.NET Core):**
   * Hoàn thiện Auth Service (Cấp Temporary Password, bắt buộc đổi pass lần đầu, reset pass).
   * Viết Service cho `ApprovalRequestService` tích hợp xử lý Feedback mặc định cho Admin Staff.
   * Viết Transaction chuyển lớp trong `StudentService.TransferClassAsync`.
   * Viết Query tối ưu cho `SessionService.GetMyScheduleAsync`.
4. **Về Phân công Frontend (React TypeScript):**
   * Màn hình của Student/Parent/Teacher/TA: Thêm trang Feedback (chỉ gồm tiêu đề, phân loại, nội dung, không có ô chọn người nhận).
   * Màn hình Schedule: Gọi trực tiếp `/api/sessions/my-schedule` để render lịch tuần/tháng.
   * Modal chuyển lớp cho Admin: Chọn lớp đích $\rightarrow$ gọi API chuyển lớp trong 1 click.
