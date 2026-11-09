# EduTrack — Schedule Expand development preflight: BLOCKED

Ngày 09/11/2026, Asia/Bangkok. Branch `Duy`, HEAD
`22a07dc6847abcfb4f1d9789f209f2b853dc3dcf`.

**Preflight FAIL: phát hiện data drift trong notification_recipients. Chưa thực
thi bất kỳ migration nào trên edutrack_db.** Dừng theo điều kiện được người dùng
đặt trong yêu cầu phê duyệt; không dùng việc Schedule vẫn khớp để bỏ qua drift.

## 1. Phạm vi được duyệt và điểm dừng

Đã đọc đầy đủ file yêu cầu phê duyệt đính kèm
`b5f645c7-82a4-4193-b461-656745691a06/Pasted text.txt`:
chỉ được chạy `20261109004646_ScheduleVersionExpand` nếu mọi preflight đạt.
Yêu cầu nêu rõ: “Nếu có drift chưa được đánh giá, DỪNG.”

Lượt này chỉ chạy preflight READ ONLY/consistent snapshot, so sánh với snapshot
database gốc của rehearsal đã chứng minh khớp backup. Không chạy migration,
Contract, Phase 3, backfill, DbSeeder, Down, restore, DROP/TRUNCATE hoặc DML nghiệp vụ.
Không khởi động/restart API của người dùng.

## 2. Các điều kiện đã xác minh

| Kiểm tra | Kết quả |
|---|---|
| Branch / HEAD / index | Duy, đúng HEAD trên; index rỗng, không conflict |
| Source chưa commit | 1.076 file đầu lượt giữ nguyên SHA-256; không sửa production/test/frontend |
| Runtime source | EduTrackRuntimeDbContext và DI đăng ký hiện có được giữ nguyên |
| Connection hiệu lực | appsettings.json DefaultConnection; Development/launch/environment không override connection |
| Database thực tế | localhost:3306 / edutrack_db, MySQL 8.0.44 |
| Host / server UUID | DESKTOP-B5RURE3 / 9eb85238-f949-11f0-ad01-9c6b00a7788b; khớp rehearsal |
| Backup | Tồn tại, SHA-256 khớp file đã restore/test trước |
| History | Vẫn 7 migrations, cuối AddStudentGrade; Expand chưa chạy |
| Schema | Vẫn 25 bảng; danh sách cột từng bảng khớp snapshot trước Expand |
| FK / Class consistency | 48 FK, orphan counts đều 0; Class mismatch = 0 |
| Schedule/Attendance | Counts, columns và hashes khớp rehearsal |
| Toàn bộ data fingerprint | **FAIL**, chỉ notification_recipients khác hash |
| Exclusive migration/concurrent schema writers | Chưa mở bước thực thi; chưa xác nhận tiếp vì đã gặp điều kiện dừng |

Không ghi password hoặc full connection string vào evidence/báo cáo. Sandbox gặp
Windows SSL authentication error; lệnh READ ONLY được chạy ngoài sandbox với cùng
connection được cấu hình. Không tắt SSL hoặc đổi appsettings để vượt lỗi đó.

Backup:
`C:\Users\RescueAdmin\Downloads\edutrack_backup_20261109.sql`.

SHA-256:
`43321a36398ac4ce9310b15bbc0974f9b7eef631c70b629347116b43e79f9543`.

## 3. Drift được phát hiện

So sánh dùng cùng chương trình capture, cùng UTC timezone, cùng thứ tự cột/PK và
cùng canonical serialization/hash với rehearsal trước. Danh sách bảng/cột và
counts vẫn giống; dữ liệu của một bảng đã khác:

| Thành phần | Backup/rehearsal | Preflight hiện tại |
|---|---:|---:|
| notification_recipients count | 43 | 43 |
| Danh sách cột | Như hiện tại | Không đổi |
| SHA-256 dữ liệu | 1595bfb212affd36d2134582a09ce56efb15330412737d5df821803399b286bd | b9aa12a8de30ee1d4745a68d92f2c444fdb62ff45a37127e3ebeadf4b037e183 |

Chưa xác định cụ thể row/field hoặc tác nhân đã thay đổi. Không kết luận đây chỉ là
IsRead/ReadAt, không gọi drift là vô hại, không tự khôi phục recipient theo backup.
43 rows bằng nhau không chứng minh nội dung dữ liệu bằng nhau.

24 bảng còn lại, gồm EF history, đều khớp snapshot rehearsal. Ba bảng liên quan
Schedule vẫn nguyên trạng:

| Bảng | Rehearsal | Hiện tại | Hash |
|---|---:|---:|---|
| class_sessions | 10 | 10 | Khớp |
| class_schedules | 4 | 4 | Khớp |
| attendance | 6 | 6 | Khớp |

Sessions 6–10 vẫn có ScheduleId NULL. Chưa có class_schedule_versions hoặc ba cột
occurrence mới. Không có schema sau migration để nghiệm thu trong lượt này.

## 4. Migration history và API/Dashboard

History hiện tại vẫn là:

```text
20261012134022_InitialCreate
20261019061116_AddTitleAndDescriptionToApprovalRequests
20261101011722_AddPaymentAdditionalCharges
20261102032813_AddNotificationRecipientsAndSender
20261102045221_AddNotificationRecipientDeletedAt
20261107002822_AddGradeClassification
20261107061101_AddStudentGrade
```

MigrationApplied = false. Không có bước chuyển history 7 → 8.
Không chạy host/app hoặc gọi API nghiệm thu sau migration vì chưa được qua preflight.
Do đó **chưa có HTTP status mới của /api/classsessions**, chưa đánh dấu Dashboard
Admin Staff/Center Manager hoặc Notifications trên database gốc là đã sửa.
Kết quả 200 trên bản sao ở báo cáo compatibility vẫn là evidence của lượt trước,
không phải kết quả trên database gốc của lượt này.

## 5. Regression và Git

Không chạy lại build/unit/HTTP/browser regressions sau migration trong lượt này:
workflow thực thi đã dừng trước migration. Không sử dụng số pass của lượt trước
như kết quả chạy mới. `git diff --check` đạt; source, migrations, gates, CI,
Notifications/No-Auth và toàn bộ implementation giữ nguyên.

Lượt này chỉ thêm báo cáo này. Git cuối: **56 modified + 2 deleted + 25 untracked**,
bao gồm dirty source từ trước; index rỗng, không conflict, HEAD giữ nguyên.
Không stage/commit/push/merge/rebase/reset/stash/clean hoặc tạo PR.

Chưa đủ điều kiện chốt nhiệm vụ sửa database/Dashboard. Source có thể tiếp tục
review riêng; không coi source đã nghiệm thu là bằng chứng migration gốc đã chạy.

## 6. Blocker và evidence

Cần đối chiếu recipient records thay đổi với nguồn dữ liệu được chủ dự án xác nhận,
đánh giá writer còn hoạt động và cập nhật backup/rehearsal phù hợp trước khi chạy
lại preflight. Không tự chỉnh dữ liệu cũ hoặc lấy lại baseline để làm drift biến mất.
Không cần mở lại architecture hoặc thay business rules Schedule để xử lý blocker này.

Evidence mới ngoài repository:

```text
%TEMP%/edutrack-expand-apply-6d5140f60633463b8613bdd64b0c99e2/
  source-baseline.json
  original-preflight.json
  preflight-summary.json
  preflight.log
  drift.json
  diff-check.log
```

Snapshot đối chiếu:
`%TEMP%/edutrack-expand-rehearsal-Ijhsa3/original-preflight.json`.

Dừng trước mọi thay đổi database gốc. Quyền giới hạn target Expand được ghi nhận,
nhưng điều kiện không có drift chưa đạt; không tự chuyển sang Contract/Phase 3.
