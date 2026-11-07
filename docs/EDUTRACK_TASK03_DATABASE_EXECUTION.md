# Task 03 — Biên bản thao tác database phát triển

**Cập nhật mới nhất 07/11/2026, 16:00:** sau phê duyệt lượt tiếp tục, backup/restore-test và migration đã đạt; history có AddStudentGrade, postflight dữ liệu đạt. Backend đang chạy tại localhost:5036 với seeder được bỏ qua theo tiến trình. Dừng trước API smoke test vì lỗi đọc file log của công cụ. Xem [kết quả migration thực tế](EDUTRACK_TASK03_DATABASE_MIGRATION_RESULT.md). Các phần bên dưới là biên bản lịch sử của những lượt trước.

Thời điểm dừng: 07/11/2026, 15:30, Asia/Bangkok.

**Cập nhật 15:48 cùng ngày:** đã sửa guard quyền và chạy lại preflight chỉ đọc thành công; 59 assertion offline đạt, không phát hiện quyền nguồn còn thiếu. Chưa backup/restore/migration; quyền restore chưa được xác minh, Backend vẫn dừng. Xem [báo cáo validation quyền MySQL](EDUTRACK_TASK03_MYSQL_PRIVILEGE_VALIDATION.md). Nội dung dưới đây giữ nguyên biên bản dừng lúc 15:30.

**Người dùng đã phê duyệt có điều kiện việc áp dụng `20261107061101_AddStudentGrade`. Lượt thực hiện này đã dừng tại preflight, chưa backup hoặc chạy migration. Database chưa bị thay đổi bởi lượt thao tác này. Backend EduTrack đã dừng và hiện không nghe cổng 5036.** Không commit/push/merge.

## Kết quả từng bước

| Bước | Kết quả |
| --- | --- |
| Xác minh đích | Cấu hình ứng dụng trỏ tới MySQL local cổng 3306, schema `edutrack_db`, phiên bản 8.0.44. Hostname/UUID được đối chiếu với preflight trước và lưu trong bằng chứng riêng tư. |
| Xác minh migration | SHA-256 source migration và SQL review vẫn đúng giá trị trong báo cáo quyết định kiến trúc. Không sửa SQL review. |
| Dừng Backend | Chỉ dừng `EduTrack.API`, PID 28668, đường dẫn `Capstone2/backend/bin/Debug/net8.0/EduTrack.API.exe`, sau khi đối chiếu thời điểm khởi động. Cổng 5036 đã ngừng nghe. Không dừng MySQL hoặc dịch vụ khác. |
| Preflight sau khi dừng | Đúng 6 migration nền; cuối cùng `20261107002822_AddGradeClassification`. `users`/`grades` InnoDB; khóa signed INT. Chưa có `users.grade_id`, index hoặc FK mới. |
| Đối chiếu số dòng | users 11; grades 14; student_classes 5; tuition_invoices 11; payment 9 — khớp báo cáo trước. |
| Kiểm tra hoạt động ghi | Không có transaction ghi khác, kết nối khác đang chọn schema hoặc event bật trong schema tại thời điểm kiểm tra. |
| Kiểm tra quyền | Bộ kiểm tra vận hành báo dừng sai do chỉ chấp nhận chuỗi `ALL PRIVILEGES`; chi tiết nguyên nhân ở dưới. |
| Backup toàn database | **Chưa thực hiện.** Chỉ mới tạo thư mục bảo vệ quyền truy cập và xác nhận Git ignore. Không có file dump hoặc checksum backup để chứng nhận. |
| Restore-test backup | **Chưa thực hiện.** Không khởi động instance restore hoặc tạo schema test trong lượt này. |
| Migration | **Chưa thực hiện; không có lần thử DDL nào.** |
| Postflight | Chưa thực hiện vì chưa chạy migration. |
| Khởi động Backend mới / smoke test API | Chưa thực hiện. Backend vẫn dừng; không gọi DbSeeder hoặc tạo dữ liệu mẫu. |

## Nguyên nhân dừng

Bộ kiểm tra vận hành tạm thời yêu cầu kết quả `SHOW GRANTS` chứa `ALL PRIVILEGES ON *.*` hoặc `ALL PRIVILEGES` trên schema. MySQL thực tế trả một danh sách quyền cụ thể trên `*.*`, có `SELECT`, `INSERT`, `ALTER`, `INDEX`, `REFERENCES`, cùng các quyền backup cần thiết. Vì vậy kiểm tra bằng chuỗi `ALL PRIVILEGES` quá hẹp và phát sinh thông báo `Migration privileges require manual review`.

Đây là lỗi của bộ kiểm tra do agent chuẩn bị, **không phải bằng chứng thiếu quyền database hoặc lỗi migration**. Không có lệnh ALTER/CREATE INDEX/INSERT history nào đã được gửi. Theo yêu cầu dừng khi gặp lỗi hoặc điều kiện ngoài dự kiến, agent dừng lượt thực hiện, không sửa guard rồi tự tiếp tục, không thử lại DDL và không rollback.

## Bằng chứng giữ lại và trạng thái Backend

Thư mục riêng tư, được Git ignore:

`Capstone2/db/backups/student-grade-20261107-152731/`

Thư mục này chỉ có định danh Backend trước khi dừng, kết quả preflight, kết quả kiểm tra hoạt động ghi/quyền và biên bản dừng. **Đây chưa phải backup database.** Quyền thư mục được giới hạn cho chủ workspace, tài khoản sandbox, SYSTEM và Administrators. Không đưa credentials vào các file bằng chứng, command line hoặc báo cáo; mật khẩu chỉ được truyền trong environment của tiến trình MySQL client.

Không tự khởi động lại Backend vì schema vẫn thiếu `users.grade_id`; source Backend mới chưa tương thích với schema đó. Ngoài ra `Program.cs` hiện gọi `DbSeeder.SeedAsync` khi startup, nên bước khởi động sau migration phải có phương án vận hành đã kiểm chứng để bỏ qua seeder theo điều kiện không tạo dữ liệu mẫu. Chưa sửa `Program.cs` hoặc Authentication/Authorization.

## Phần còn lại

Trước lượt tiếp theo, sửa bộ kiểm tra vận hành để đánh giá các quyền cụ thể có hiệu lực trên đúng schema, gồm quyền đọc metadata/data, backup và `ALTER`/`INDEX`/`REFERENCES`/`INSERT` history; không suy luận từ một chuỗi trình bày duy nhất. Review lại guard trước khi thực hiện thao tác database.

Lượt tiếp theo vẫn phải chạy lại toàn bộ preflight và đối chiếu trạng thái, sau đó mới backup toàn schema, giữ bản sao/checksum, restore-test trên instance độc lập, đối chiếu schema và fingerprint dữ liệu. Chỉ khi tất cả gate đạt mới được áp dụng đúng migration một lần, postflight và kiểm tra API đọc với seeder bị bỏ qua. Kết quả test tổng hợp trước đây không thay thế backup/restore-test dữ liệu phát triển hiện tại.

Không mở lại thao tác database trong lượt đã dừng này. Chờ người dùng xem biên bản và quyết định tiếp tục.
