# Task 02 — Kết quả triển khai: dừng ở lỗi gửi UTF-8, database chưa thay đổi

> Bản dùng để đưa lên repository đã ẩn định danh máy local; bản đầy đủ được giữ trong bằng chứng local đã Git ignore.

Ngày **07/11/2026**, giờ **Asia/Bangkok (UTC+7)**.

**Chưa triển khai thành công.** Người dùng đã phê duyệt Grade Migration và chấp nhận backup local/Desktop
trong môi trường Capstone. Đã thử thực thi đúng file được duyệt **một lần**, nhưng MySQL báo lỗi ở câu đầu
trước mọi ALTER/CREATE/INSERT. Đã dừng theo yêu cầu: không tự chạy lại, không rollback bằng xóa dữ liệu,
không khởi động Backend và không tiếp tục API/UI postflight.

## 1. Kiểm tra ngay trước thực thi

Kiểm tra lúc **08:40:06–08:40:07**:

- Đúng đích `localhost:3306/edutrack_db`, MySQL 8.0.44.
- Hostname `<LOCAL_MYSQL_HOST>`, UUID `<LOCAL_SERVER_UUID>`.
- Backend cổng 5036 vẫn dừng; không có transaction ghi/kết nối database khác được ghi nhận.
- Schema và fingerprint của cả 24 bảng khớp preflight đã duyệt.
- Bảng `grades`, cột `classes.grade_id`, index và FK mới chưa tồn tại; history có 5 dòng.
- SHA-256 file thực tế trùng bản đã thử nghiệm và được phê duyệt:

```text
2f4f1371e913ed1e1224d3d4e7f2a163c0cd9885b4f25530482c5578fa117dd4
```

File SQL được đọc một lần thành buffer, kiểm tra hash ngay trước gửi và lưu nguyên byte vào bằng chứng.
Chỉ file Grade Migration được đưa tới mysql client; không chạy `database update` hay migration khác.

## 2. Backup vẫn nguyên vẹn và phù hợp trạng thái trước thực thi

Hai file sau vẫn cùng dung lượng 52.825 byte và cùng SHA-256:

```text
61138b3565f9cbbd9f8f759e72e077e1f95d120f6c6a1e3c889bd9f35d2236b5
```

```text
Capstone2/db/backups/grade-preflight-maintenance-20261107-012618/edutrack_db.before-grade.sql
%USERPROFILE%/Desktop/EduTrack-Grade-Preflight-20261107-082620/edutrack_db.before-grade.sql
```

Bản backup đã restore-test ở giai đoạn trước cũng giữ nguyên hash. Nội dung SQL của backup hiện tại giống
bản đã khôi phục thành công, ngoại trừ comment thời điểm hoàn tất dump. Dữ liệu/schema ngay trước triển khai
khớp baseline của backup. Không thực hiện restore lên database chính trong lần triển khai này.

## 3. Lỗi thực thi và nguyên nhân

MySQL trả lỗi lúc **08:40:27**:

```text
ERROR 1064 (42000) at line 1:
... right syntax to use near '\uFEFFSTART TRANSACTION' at line 1
```

File SQL gốc có một UTF-8 BOM hợp lệ ở đầu. Công cụ triển khai do mình chuẩn bị đã dùng
`Encoding.UTF8.GetString(rawBytes)`, giữ BOM dưới dạng ký tự U+FEFF trong chuỗi; `StandardInputEncoding = Encoding.UTF8`
lại phát thêm BOM khi ghi chuỗi vào stdin của mysql client. Vì vậy luồng gửi có hai BOM:

| Thành phần | Byte đầu |
| --- | --- |
| File SQL được duyệt | `EF-BB-BF-53-54-41-52-54-20` |
| Luồng gửi gây lỗi | `EF-BB-BF-EF-BB-BF-53-54-41` |
| Luồng gửi đề xuất sau sửa | `53-54-41-52-54-20-54-52-41` |

Lỗi nằm ở cách công cụ gửi file, không phải thay đổi mô hình Grade hoặc nội dung câu SQL được duyệt.
Giai đoạn thử nghiệm trước dùng `File.ReadAllText`, đã loại BOM khi đọc, nên không gặp lỗi gửi hai BOM này.

mysql client dùng chế độ batch, `--skip-reconnect`, không `--force`; lỗi dòng đầu làm lần thực thi dừng.
Marker lưu `failed-stop-no-retry`, số lần thực thi **1**. Không cố gắng gửi lại hoặc sửa schema dở dang.

## 4. Đối chiếu chỉ đọc sau lỗi

Snapshot kiểm tra lúc **08:41:24**, đối chiếu hoàn tất lúc **08:42:20**:

- Không có bảng `grades` hoặc cột `classes.grade_id`.
- Không có index/FK Grade mới.
- Migration history vẫn 5 dòng, chưa có `20261107002822_AddGradeClassification`.
- Số dòng và SHA-256 dữ liệu của **24/24 bảng** trùng snapshot ngay trước thực thi.
- Metadata bảng/cột/index/FK/stored object cũng khớp hoàn toàn.
- Không thay dữ liệu Student, Teacher, TA, lịch, Tuition Invoice hoặc Payment.

| Bảng quan trọng | Trước / sau lỗi |
| --- | ---: |
| classes | 3 / 3 |
| subjects | 4 / 4 |
| users | 11 / 11 |
| student_classes | 5 / 5 |
| teacher_classes | 4 / 4 |
| ta_classes | 3 / 3 |
| class_schedules | 4 / 4 |
| class_sessions | 5 / 5 |
| tuition_invoices | 11 / 11 |
| payment | 9 / 9 |

Không cần thao tác khôi phục dữ liệu cho trạng thái đã quan sát. Backend vẫn dừng, MySQL chính vẫn hoạt động.
File SQL gốc tiếp tục giữ đúng SHA-256 đã phê duyệt.

## 5. Đề xuất sửa cho một lần thực thi lại được cho phép riêng

Đã chuẩn bị đề xuất sửa **phần truyền dữ liệu**, không sửa file migration:

1. Kiểm tra hash file SQL trên raw bytes như cũ.
2. Decode UTF-8 strict, tiêu thụ chữ ký BOM của file đúng một lần.
3. Ghi stdin bằng `new UTF8Encoding(false, true)` để không phát thêm BOM.
4. Giữ nguyên guard server/database, backup, bảo trì, marker một lần và dừng khi lỗi.
5. Trước lần gửi lại, kiểm tra lại đích, trạng thái dữ liệu/schema, backup và bảo trì.

Đã mô phỏng việc encode trong memory stream: payload đề xuất bằng đúng nội dung SQL đã duyệt sau phần
chữ ký encoding. **Kiểm tra này hoàn toàn ngoại tuyến; payload đã sửa chưa được gửi tới MySQL.**
Đề xuất chưa được áp dụng để chạy lại deployment. Do yêu cầu “nếu lỗi, dừng ngay, không tự chạy lại”,
cần người dùng cho phép lần thực thi lại sau khi xem nguyên nhân và phương án này.

## 6. Bằng chứng và trạng thái bàn giao

Thư mục Git ignore:

```text
Capstone2/db/backups/grade-deployment-20261107-014002/
  deployment-observation-before.json
  deployment-before.json
  deployment-before.queries.sql
  executed-approved-migration.sql
  migration-attempt.json
  migration.error.log
  deployment-after-failed-attempt.json
  deployment-after-failed-attempt.queries.sql
  failure-state-verification.json
  verify-failure-state.mjs
  encoding-transport-diagnosis.json
  encoding-fix-proposal.txt
```

Chưa chạy postflight schema Grade, chưa khởi động lại Backend, chưa kiểm tra API/UI chính vì migration chưa thành công.
Không commit, push, merge hoặc thay đổi module ứng dụng khác. Lần này chỉ bổ sung báo cáo và liên kết trạng thái.

**Chưa thể bắt đầu kiểm thử thủ công trên ứng dụng. Backend tiếp tục được giữ dừng theo quy trình xử lý lỗi;
database chính chưa có Grade. Dừng chờ quyết định tiếp theo.**
