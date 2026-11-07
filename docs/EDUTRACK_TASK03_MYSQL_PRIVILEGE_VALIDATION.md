# Task 03 — Sửa kiểm tra quyền MySQL

**Cập nhật sau lượt được phê duyệt:** quyền restore đã được xác minh trên instance riêng, backup/restore-test và AddStudentGrade đã hoàn tất; postflight đạt. Backend đang chạy với seeder opt-out; API smoke test chưa thực hiện do điểm dừng đọc log. Xem [kết quả migration](EDUTRACK_TASK03_DATABASE_MIGRATION_RESULT.md). Báo cáo dưới đây giữ nguyên snapshot kiểm tra quyền lúc 15:48, trước migration.

Kiểm tra ngày 07/11/2026, Asia/Bangkok; preflight tích hợp đạt lúc 15:48.

**Đã sửa validation và xác minh chỉ đọc: chưa phát hiện quyền nguồn nào còn thiếu cho preflight, cấu hình mysqldump đã review và migration AddStudentGrade. Chưa backup, restore hoặc chạy migration. Quyền tài khoản restore chưa được xác minh. Backend vẫn dừng; không sửa Authentication/Authorization, không commit/push/merge.**

## Nguyên nhân lỗi và cách sửa

Guard tạm trước đây chỉ tìm chuỗi `ALL PRIVILEGES`. MySQL 8.0 hiển thị các quyền global thành danh sách quyền cụ thể, nên guard từ chối sai một tài khoản có đủ các quyền đang cần. Đây là lỗi kiểm tra của agent, không phải lỗi migration hoặc thiếu quyền đã được chứng minh. [Tài liệu MySQL SHOW GRANTS](https://dev.mysql.com/doc/refman/8.0/en/show-grants.html).

Đã đưa logic vào công cụ vận hành riêng có source trong repository, dùng lại từ runner tạm. Công cụ đánh giá từng quyền và phạm vi/đối tượng áp dụng, không còn suy luận từ một chuỗi duy nhất:

- Kết hợp quyền riêng lẻ từ global, schema và bảng; ALL được hiểu trong đúng cấp quyền. Quyền schema khác không được tính cho schema đích. Quyền theo cột không bị nâng thành quyền toàn bảng. Không tự suy ra dynamic privilege hoặc GRANT OPTION từ ALL.
- Đối chiếu `partial_revokes`, quy tắc wildcard/escape tên schema và `lower_case_table_names`. Restriction REVOKE giới hạn quyền global trên đúng schema; syntax chưa hỗ trợ khiến kết quả bị chặn, không mặc định PASS. [MySQL partial revokes](https://dev.mysql.com/doc/refman/8.0/en/partial-revokes.html).
- Lấy `CURRENT_ROLE()` và `information_schema.ENABLED_ROLES`, rồi để MySQL mở rộng quyền qua `SHOW GRANTS FOR CURRENT_USER() USING ...` trên **cùng một connection**. Không tính role chỉ được gán nhưng chưa bật, không tự SET ROLE. Nếu không đọc hoặc mở rộng được role thì chặn kiểm tra.
- Mỗi quyền đạt có bằng chứng scope tương ứng; quyền thiếu được trả về kèm bước, schema/bảng và lý do cần. Lỗi đọc metadata/grants không biến thành kết quả đủ quyền.
- Công cụ mới chỉ có self-test và inspect-development. Runner tạm cũng đã khóa các action ngoài preflight/audit chỉ đọc trong lúc chờ phê duyệt lượt thao tác database mới.

## Quyền cần xác minh theo thao tác

| Thao tác | Quyền/phạm vi đã xác định | Kết quả hiện tại |
| --- | --- | --- |
| Preflight | SELECT toàn schema để quan sát đầy đủ danh mục/dữ liệu; PROCESS global cho INNODB_TRX và quan sát session khác. SHOW GRANTS của chính tài khoản không cần cấp quyền đọc mysql.* riêng. | Đạt 2 yêu cầu; query chỉ đọc thực tế chạy được. |
| mysqldump đã review | SELECT global theo yêu cầu `--routines`; TRIGGER và EVENT trên schema để bảo đảm không bỏ sót đối tượng. SHOW VIEW trên từng view nếu có. | Đạt 3 yêu cầu của inventory hiện tại; không chạy mysqldump ngoài `--version`. |
| AddStudentGrade | ALTER/CREATE/INSERT trên users; INDEX trên users; REFERENCES trên grades; INSERT trên __EFMigrationsHistory. | Đạt 6 yêu cầu từ effective grants; không thử DDL hoặc INSERT. |
| Restore-test sau này | CREATE/DROP/INSERT/ALTER/REFERENCES/SELECT trên schema restore riêng; thêm CREATE VIEW/SHOW VIEW/TRIGGER/EVENT/CREATE ROUTINE/ALTER ROUTINE khi có đối tượng tương ứng. | **Chỉ xác định policy, chưa xác minh tài khoản restore hoặc thực thi restore.** |

CREATE và INSERT trên users là các điều kiện ALTER TABLE được tài liệu MySQL nêu; REFERENCES áp dụng cho bảng cha grades. Migration này không cần DROP, DELETE, UPDATE hoặc GRANT OPTION. Đây là bộ điều kiện theo tài liệu, không phải thử nghiệm DDL tối thiểu với từng thuật toán ALTER. [MySQL privilege definitions](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html).

Profile backup gắn với `--single-transaction --quick --skip-lock-tables --routines --triggers --events --hex-blob --set-gtid-purged=OFF --no-tablespaces --skip-add-locks`. Với profile này không yêu cầu LOCK TABLES, không yêu cầu PROCESS riêng cho dump tablespaces và không yêu cầu RELOAD/FLUSH_TABLES để dump GTID; PROCESS vẫn cần cho preflight đang dùng. Nếu đổi option thì phải review lại policy. [MySQL mysqldump](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html).

Restore phải xác minh trên instance/tài khoản đích riêng, không suy từ quyền main. Khi có dump thật, phải review thêm câu lệnh thực tế, DEFINER, stored function/binlog, SQL_LOG_BIN và GTID nếu xuất hiện. Hiện schema không có view, trigger, routine hoặc event; không coi điều này là cam kết cho snapshot ở lượt sau. Không cấp thêm quyền hoặc tạo user/role để kiểm thử trong lượt này.

## File/script thay đổi

| File | Nội dung |
| --- | --- |
| `Capstone2/db/tools/MySqlPrivilegeCheck/MySqlPrivilegeCheck.csproj` | Console .NET 8 riêng, MySqlConnector 2.3.5 khớp dependency hiện có; không tham chiếu/chạy API. |
| `Capstone2/db/tools/MySqlPrivilegeCheck/PrivilegePolicy.cs` | Parser, evaluator phạm vi/quyền, partial revokes, profile source/migration và kế hoạch restore. |
| `Capstone2/db/tools/MySqlPrivilegeCheck/LiveInspection.cs` | Connection riêng READ ONLY, role/grant expansion, metadata/read probes và bằng chứng riêng tư. |
| `Capstone2/db/tools/MySqlPrivilegeCheck/PolicyTests.cs` | 59 assertion offline, không tạo tài khoản hoặc dữ liệu test. |
| `Capstone2/db/tools/MySqlPrivilegeCheck/Program.cs` | Chỉ hỗ trợ hai chế độ self-test và kiểm tra development chỉ đọc. |
| `Capstone2/db/tools/MySqlPrivilegeCheck/README.md` | Cách chạy, phạm vi, các điều kiện quyền và giới hạn. |
| `docs/EDUTRACK_TASK03_DATABASE_EXECUTION.md` | Gắn cập nhật kết quả sửa guard, giữ nguyên biên bản dừng lịch sử. |
| `docs/EDUTRACK_TASK03_STUDENT_GRADE_DECISION.md` | Gắn trạng thái kiểm tra quyền mới, migration vẫn chưa chạy. |
| `docs/EDUTRACK_TASK03_MYSQL_PRIVILEGE_VALIDATION.md` | Báo cáo này. |

Ngoài repository, đã sửa `%TEMP%/EduTrack-StudentGrade-Operations/Program.cs` để thay guard cũ bằng `LiveInspection.Run`, khóa các action ghi và sửa `StudentGradeOps.csproj` tham chiếu công cụ mới. Bản source trước sửa được giữ trong file `.txt` riêng; không xóa bằng chứng cũ. Không sửa schema/model/migration, code tính năng hoặc dependency của frontend/backend API trong lượt này.

## Kết quả kiểm thử

| Kiểm tra | Kết quả |
| --- | --- |
| Build validator + runner, SDK 8.0.427 | Đạt, 0 warning/0 error. Restore từ package cache với NuGetAudit=false; không coi là kiểm chứng bảo mật dependency. |
| Self-test | **59 assertion đạt**, không kết nối database. Bao gồm ALL global/schema/table; quyền riêng lẻ đủ/thiếu/sai schema; gộp global/schema/table; column grants; role assignment so với expanded role; partial revoke; wildcard/escape/case; unknown syntax; profile dump/migration/restore. |
| Inspect development chỉ đọc | Đạt 11 điều kiện quyền nguồn: preflight 2, dump 3, migration 6; 0 quyền thiếu, 0 parser error. |
| Read probes thực tế | SELECT LIMIT 0 và SHOW CREATE TABLE cho 25 bảng; SHOW FULL TABLES/TRIGGERS/EVENTS/PROCEDURE STATUS/FUNCTION STATUS; INNODB_TRX và PROCESSLIST; đọc migration history/counts. Không xuất bản ghi cá nhân. |
| Runner preflight tích hợp guard mới | Đạt đúng server/schema/history, trạng thái schema/counts và không có session khác/transaction ghi/event bật tại snapshot. |
| Migration source và SQL review | SHA-256 không đổi so với báo cáo trước. |
| git diff --check | Đạt. |

Kết nối MySqlConnector từ sandbox ban đầu bị chặn (1042); MySQL service vẫn chạy, native client đọc preflight thành công. Cùng inspector đã chạy thành công với quyền truy cập localhost ngoài sandbox; không sửa cấu hình MySQL hoặc quyền tài khoản để khắc phục. Chỉ đọc SELECT/SHOW trong transaction READ ONLY, kết thúc ROLLBACK.

MySQL hiện tại: 8.0.44, local cổng 3306, schema edutrack_db; UUID khớp đích đã review. `partial_revokes=OFF`, `gtid_mode=OFF`, binlog bật. Có 25 bảng gồm migration history; 0 view/trigger/routine/event. `CURRENT_ROLE()=NONE`, không có enabled role. **Chức năng role được kiểm thử bằng fixture, chưa kiểm thử role end-to-end trên server thật** vì lượt này không được tạo hoặc sửa user/role.

Snapshot vẫn có 6 migration nền, chưa có AddStudentGrade; users 11, grades 14, student_classes 5, tuition_invoices 11, payment 9. Cột/index/FK mới đều chưa tồn tại. Không có thao tác ghi dữ liệu/schema. Không chạy lại build frontend/backend API vì chúng không thay đổi; đã build và test đúng công cụ vận hành thay đổi.

## Bằng chứng và bước chờ phê duyệt

Kết quả inspect riêng: `Capstone2/db/backups/student-grade-20261107-152731/privilege-review-20261107-154732/privilege-inspection.json`.

Kết quả guard tích hợp: `Capstone2/db/backups/student-grade-20261107-152731/privilege-guard-20261107084840235/privilege-inspection.json` và các file `preflight-privileges-corrected*` cùng thư mục cha. Các file nằm dưới thư mục đã giới hạn ACL và được Git ignore; chỉ có metadata/grants/query audit, không có password/connection string hoặc dump dữ liệu cá nhân. Bin/obj được ignore.

Không phát hiện quyền nguồn cần bổ sung. **Chưa thể kết luận quyền tài khoản restore đủ hay thiếu** cho tới khi xác minh riêng trên instance restore trong lượt được duyệt. Kết quả này không thay thế backup/restore-test hoặc cho phép chạy migration.

Chờ người dùng phê duyệt lượt tiếp tục: preflight mới, full backup, restore-test độc lập, đối chiếu dữ liệu/schema, áp dụng đúng migration một lần nếu mọi điều kiện đạt, postflight và khởi động Backend theo phương án không seed. Backend vẫn dừng; không có backup mới cần xóa hoặc dữ liệu thử phát sinh trong lượt này.
