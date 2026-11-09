# Task 03 — Kết quả backup, restore-test và migration phát triển

**Cập nhật sau lượt hoàn tất end-to-end:** HTTP smoke development đã đạt 8/8 API đọc (200); integration/HTTP test đạt 85 assertion và browser API thật đạt 6 nhóm trên MySQL riêng. Backend bản sửa mã Parent hiện chạy localhost:5036, PID **34752**, seeder opt-out; schema và fingerprint 25 bảng development không đổi sau restart/smoke. Không chạy lại migration. Xem [báo cáo tổng hợp Task 03](EDUTRACK_TASK03_FINAL_REPORT.md). Nội dung dưới đây giữ biên bản migration và điểm dừng lịch sử của lượt trước.

Ngày thực hiện: 07/11/2026, Asia/Bangkok. Migration hoàn tất lúc **15:57:55**; Backend khởi động lúc **15:58:57**. Kiểm tra dữ liệu sau startup đạt lúc **15:59:41**.

**Đã áp dụng đúng `20261107061101_AddStudentGrade` một lần trên database phát triển `edutrack_db`, sau backup và restore-test đạt. Postflight đạt; dữ liệu cũ giữ nguyên. Backend đang chạy tại `http://localhost:5036` với seeder được bỏ qua riêng cho tiến trình này. Chưa gọi API smoke test: thao tác đã dừng ở bước xác minh log do lỗi đọc file của công cụ, theo điều kiện dừng khi có lỗi của người dùng.** Không retry DDL, rollback, restore đè main, backfill hoặc commit/push/merge.

## Kết quả từng bước

| Bước | Kết quả thực tế |
| --- | --- |
| Phê duyệt và đích | Đúng phê duyệt backup, restore-test và duy nhất AddStudentGrade trên development `edutrack_db`. MySQL 8.0.44, local cổng 3306; UUID/hostname đối chiếu với đích đã review, không suy ra từ tên schema đơn thuần. |
| Preflight ban đầu | Đúng 6 migration nền, cuối cùng AddGradeClassification; chưa có cột/index/FK Student–Grade. InnoDB, kiểu khóa phù hợp. Đủ 11 điều kiện quyền nguồn. Không có session khác chọn schema, transaction ghi khác hoặc event bật tại snapshot; Backend đã dừng từ lượt trước và không có instance mới chiếm cổng 5036. |
| Snapshot trước backup | Audit metadata và SHA-256 trên mọi giá trị của 25 bảng, gồm history. users 11; grades 14; student_classes 5; tuition_invoices 11; payment 9. Không log bản ghi cá nhân. |
| Full backup | Đạt. Dump toàn schema/data/history; bật routines/triggers/events, hex-blob, single-transaction, GTID OFF, no-tablespaces, skip-lock-tables/skip-add-locks. Kiểm tra đủ 25 CREATE TABLE, dấu hoàn tất, không có USE/CREATE DATABASE/DROP DATABASE chọn lại đích. |
| Checksum và bản sao | Đạt. File gốc và bản sao riêng cùng SHA-256; kiểm tra lại trước DDL. Không overwrite/xóa backup cũ. |
| Instance restore | Instance mới trên **127.0.0.1:33308**, schema `edutrack_student_grade_restore`, data directory mới nằm dưới thư mục backup riêng tư. UUID khác main, port/datadir đúng, binlog tắt. Không tái sử dụng server không rõ nguồn gốc. |
| Quyền restore | Đạt 6 điều kiện CREATE/DROP/INSERT/ALTER/REFERENCES/SELECT trên schema test qua grants thực tế của tài khoản tại instance test; đọc enabled roles và partial_revokes trên cùng connection READ ONLY. Không suy quyền restore từ tài khoản main. Schema đích chưa tồn tại trước restore. |
| Restore-test | **Đạt**: metadata schema, migration history, số dòng và fingerprint của toàn bộ 25 bảng khớp snapshot main. Schema hiện tại không có view/trigger/routine/event; không cần xử lý DEFINER của các đối tượng đó trong dump này. |
| Kết thúc instance test | Dừng đúng instance restore bằng mysqladmin sau khi kiểm tra lại UUID/port/datadir; không dừng MySQL chính. Giữ nguyên data directory và backup/bằng chứng. |
| Preflight ngay trước DDL | Chạy lại đầy đủ và đạt. Snapshot ngay trước migration vẫn khớp snapshot backup cả schema lẫn dữ liệu. Hash migration source, SQL review, backup và bản sao đều đúng; backup đã được restore-test đúng checksum. |
| Migration | **Đạt, đúng một lần**, dùng SQL review theo hash đã chốt. Không gọi EF database update toàn bộ pending migrations hoặc first_script.sql. Có marker lần thử trước khi gửi SQL; không có retry. |
| Postflight schema/history | Đạt. Đúng một cột, một index và một FK mới; history tăng từ 6 lên 7, giữ nguyên 6 dòng cũ và chỉ thêm AddStudentGrade, ProductVersion 8.0.8. |
| Postflight dữ liệu | **Đạt** cho mọi cột cũ của cả 24 bảng nghiệp vụ; giữ nguyên row count/fingerprint. Mọi User cũ có grade_id NULL. Không thay đổi Grade/enrollment/Invoice/Payment, không seed hoặc backfill. |
| Backend build | Đạt, SDK 8.0.427; 0 error, 3 warning CS8601 cũ. Build từ bản sao source hiện tại riêng trong thư mục private, không copy appsettings/credentials; lưu hash từng file source. NuGetAudit=false dùng package cache, không phải kiểm chứng bảo mật dependency. |
| Backend startup | Tiến trình PID **34604**, chạy bản build mới bằng runtime SDK 8, content root là backend repository. Log xác nhận bỏ qua seeder và listening tại localhost:5036; stderr trống khi kiểm tra. Không start API cũ. |
| Lỗi công cụ và điểm dừng | Lệnh ReadAllText dùng để xác minh readiness không mở được stdout log vì file đang được bộ redirect giữ mở. Dừng smoke test tại đây, chưa gọi HTTP API. Sau đó chỉ chẩn đoán bằng đọc log chia sẻ file và postflight READ ONLY; không restart Backend hoặc chạy lại DDL. |
| Kiểm tra sau startup | Đạt: log xác nhận seeder bị bỏ qua; mọi fingerprint/cột cũ, history và Grade NULL vẫn như postflight trước startup. Backend được giữ chạy để người dùng biết trạng thái thực tế; không tuyên bố API/UI đã kiểm thử đạt. |

## Backup được giữ lại

Thư mục riêng tư, được Git ignore:

`Capstone2/db/backups/student-grade-approved-20261107-155452/`

File backup chính:

`edutrack_db.before-AddStudentGrade.sql`

Bản sao:

`verified-copy/edutrack_db.before-AddStudentGrade.sql`

Kích thước mỗi file: **58.647 byte**. SHA-256 chung:

```text
0830445301BC8E7CB21886096FC18755290ED13FFEF140CB3E5E2F33FD035353
```

ACL giới hạn cho chủ workspace, tài khoản sandbox, SYSTEM và Administrators. Password chỉ truyền qua child environment của native client hoặc nằm trong memory của MySqlConnector; không đưa vào command line, source vận hành, manifest hoặc báo cáo. Backup chứa dữ liệu phát triển thật nên không đưa vào Git. Bản sao nằm cùng ổ với backup chính; chưa tạo bản sao ngoài máy.

Các bằng chứng chính cùng thư mục:

- `backup-manifest.json`: file/size/hash/phạm vi và bản sao.
- `main-before.json`, `main-immediately-before.json`: schema, row count, fingerprint trước backup/DDL.
- `restore-privileges.json`, `restore-audit.json`, `restore-verification.json`: quyền instance test và đối chiếu dữ liệu phục hồi.
- `preflight-approved-maintenance*`, `preflight-final*`, `privilege-guard-*`: hai lượt preflight và effective grants.
- `migration-attempt.json`, `migration-execution.json`: đúng một lần thử và xác nhận SQL client thành công.
- `main-after-migration.json`, `main-after-startup-diagnostic.json`, `postflight-verification.json`: dữ liệu và schema sau migration/startup.
- `backend-start.json`, `backend.stdout.log`, `backend.stderr.log`, `api-source-manifest.json`: định danh tiến trình/binary/source và seeder opt-out.
- `operation-stop.json`: lỗi đọc file log và giới hạn các bước đã/chưa thực hiện.
- `operations-source/`: source runner đúng lúc thực hiện; runner tạm sau đó được khóa lại chỉ cho audit/postflight chỉ đọc.

Không xóa dump, bản sao, restored data directory hoặc bằng chứng. Đây là full logical backup của database ứng dụng; không bao gồm tài khoản server MySQL hay các file ngoài database.

## Schema thực tế và tính toàn vẹn

Thành phần mới duy nhất:

```text
users.grade_id: signed INT, nullable, default NULL
IX_users_grade_id: nonunique, duy nhất grade_id
FK_users_grades_grade_id: users.grade_id -> grades.grade_id
ON DELETE RESTRICT; ON UPDATE NO ACTION (default của SQL đã review)
__EFMigrationsHistory: thêm 20261107061101_AddStudentGrade / 8.0.8
```

Guard postflight được đối chiếu trước DDL để kiểm tra đúng UPDATE_RULE=NO ACTION, vì SQL review không chỉ định ON UPDATE; cùng kiểu FK classes–grades hiện có cũng trả metadata này. Không thay đổi SQL để ép một hành vi mới. MySQL NO ACTION với InnoDB kiểm tra ngay; không có thao tác cập nhật khóa Grade trong lượt này.

Hash SQL review không đổi:

```text
D89212879757F4AEE0A326839D7341691C5EDC446F88CEA8E276A43C6C0508EA
```

Hash source migration không đổi:

```text
AFE6E7C2232E3679C2F61A37E06EFC38AF583F69550B3B407ED5405A2A0C6A2F
```

Fingerprint gồm mọi giá trị NULL/non-NULL của từng cột gốc, hash từng row và hash tập row đã sắp xếp; metadata kiểm tra cả auto-increment, column/index/FK. Postflight chỉ loại phần bổ sung có chủ đích: cột grade_id mới khi so dữ liệu User và dòng history mới khi so history. Không chỉ dựa trên row count để kết luận dữ liệu nguyên vẹn. Các cột Grade mới được kiểm tra NULL riêng.

## Bỏ qua seeder và lỗi kiểm tra log

Chỉ sửa cục bộ vùng startup seeding trong `Capstone2/backend/Program.cs`: đọc cờ bool `Seeding:SkipSampleData`. Khi true thì log việc bỏ qua; nếu thiếu cờ hoặc false, nhánh gọi DbSeeder cũ vẫn được giữ. Không thay DI, route, Authentication/Authorization hoặc middleware.

Tiến trình đã khởi động nhận argument:

```text
--Seeding:SkipSampleData=true
```

Không sửa appsettings hoặc đặt cờ vào cấu hình toàn máy. Cờ nằm trong argument của riêng tiến trình này, không vô hiệu hóa vĩnh viễn seeder. Log thực tế có `Sample data seeding skipped for this process`, `Now listening on: http://localhost:5036` và `Application started`; kiểm tra database sau startup chứng minh dữ liệu cũ không đổi.

Lỗi readiness là lỗi I/O của bộ kiểm tra do agent chuẩn bị, không phải lỗi khởi động API hoặc migration: ReadAllText không dùng cơ chế chia sẻ phù hợp với file redirect đang mở. Get-Content đọc chia sẻ file đã xác minh được log khi chẩn đoán; không dùng kết quả chẩn đoán để tự tiếp tục pipeline sau điểm dừng. **Không có API HTTP nào được gọi trong lượt này.** Bước smoke API Users/Grades/Classes/CenterSettings/TuitionInvoices/Payments còn lại chưa thực hiện; không gọi GET Teaching có khả năng tự seed.

Để tránh tái diễn trong lần tiếp theo, bộ đọc readiness cần dùng Get-Content hoặc FileStream có FileShare.ReadWrite; không cần restart Backend đang chạy để thay cách đọc log. Không gọi lại migration/preflight baseline cũ vốn được thiết kế cho trạng thái chưa áp dụng migration.

## File source/tài liệu thay đổi trong lượt này

- `Capstone2/backend/Program.cs`: thêm cờ bỏ qua sample seeding theo tiến trình và log, giữ nguyên nhánh seeder mặc định.
- `docs/EDUTRACK_TASK03_DATABASE_MIGRATION_RESULT.md`: báo cáo này.
- `docs/EDUTRACK_TASK03_DATABASE_EXECUTION.md`, `docs/EDUTRACK_TASK03_MYSQL_PRIVILEGE_VALIDATION.md`, `docs/EDUTRACK_TASK03_STUDENT_GRADE_DECISION.md`: gắn cập nhật kết quả mới; giữ báo cáo lịch sử để truy nguyên.

Runner vận hành tạm được cập nhật trong `%TEMP%/EduTrack-StudentGrade-Operations` để thực hiện các bước đã duyệt, xác minh quyền restore riêng, đối chiếu backup lineage và marker chống retry. Source thực hiện được lưu vào bằng chứng private. Không sửa migration, frontend hoặc business logic trong lượt này. Không chạy lại toàn bộ frontend/harness không thay đổi; đã build runner và API cần cho thao tác, kiểm chứng backup/restore/migration/data trên database được duyệt. `git diff --check` đạt.

## Cần kiểm thử thủ công / phần chưa hoàn tất

Backend hiện chạy ở **http://localhost:5036**, PID 34604; frontend có thể tiếp tục dùng API local. Không chạy thêm Backend trên cùng cổng. Nếu đổi tiến trình chạy API thì cần giữ cờ skip seeder cho phiên kiểm thử không tạo dữ liệu mẫu; không mặc định normal dotnet run sẽ bỏ qua seeder.

1. Kiểm tra API đọc và refresh giao diện, đặc biệt Student Management và các vùng từng báo HTTP 500 vì thiếu users.grade_id. **Chưa có kết quả HTTP smoke test tự động**, không coi startup và SQL postflight là bằng chứng API trả 200.
2. Dùng cả Center Manager và Admin Staff: Grade động trong Add/Edit/bảng/filter/sort/details; Grade custom và đổi tên; refresh vẫn hiển thị đúng ID/tên đã lưu.
3. Hồ sơ cũ vẫn giữ specialty và hiển thị chưa liên kết khối; không tự backfill. Khi người dùng chủ động chọn Grade rồi lưu, kiểm tra mở lại/refresh.
4. Edit Grade khác khối các enrollment lịch sử: Grade profile đổi nhưng không xóa/chuyển/sửa enrollment. Add Student có thể chỉ chọn Grade hoặc chọn nhiều Class cùng Grade; trường hợp khác Grade phải bị từ chối.
5. Link modal mới có Parent/Student chưa chọn, default Mẹ; chọn cặp đã liên kết phải giữ relationship và primary contact thật. Không tạo trùng cặp.

Các thao tác tạo/sửa ở trên do người dùng chủ động kiểm thử với dữ liệu và môi trường phù hợp; agent chưa tạo Student/Class/Invoice/Payment test trên development. Nếu phát hiện lỗi ứng dụng sau migration, ưu tiên giữ schema nullable và backup để chẩn đoán; **không tự Down, DROP cột hoặc restore đè main**, vì các Grade mới do người dùng gán sau thời điểm này cần được bảo toàn.
