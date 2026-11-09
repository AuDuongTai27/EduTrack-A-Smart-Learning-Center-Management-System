# EduTrack — Schedule Phase 2 implementation and acceptance limits

Ngày: 09/11/2026, Asia/Bangkok (UTC+7). Working branch: `Duy`.

Đã commit Phase 1 và đồng bộ lịch sử nhóm. Source Phase 2 đã triển khai, kiểm thử
trong isolated host/MySQL và để trong working tree để nghiệm thu. **Chưa tuyên bố
Phase 2 hoàn tất đầy đủ; chưa commit Phase 2**, vì invariant chống trùng ở database
và Auth/Attendance dependency chưa được giải quyết trong phạm vi được phép.

Không push, force push hoặc merge vào main. Không migration/schema change; không
đọc/ghi/seed `edutrack_db`. Không sửa AuthContext/Login/JWT/middleware, Attendance,
Tuition business rules, Entities hoặc DbContext.

## 1. Phase 1 và đồng bộ nhóm

Phase 1 commit:
`2f1065dd1de3ba363b72117f2bf94d925c6b5062`

Message:
`Center Manager, Admin Staff, Teacher, Teaching Assistant, Student - Complete shared schedule calendar and list management`

Đã kiểm tra đủ 48 đường dẫn: 22 tracked modified, 26 untracked source/test/docs.
Toàn bộ 1.000 file sau apply khớp manifest nghiệm thu trước; không có file lạ hoặc
Temp/screenshots/dumps. Lint/typecheck/127 unit/build, backend build, Schedule 62
assertions + 20 nhóm browser, Student 26, Tuition 27 + 18 assertions được chạy lại
trước commit. Commit này chốt nền tảng read-only, không xác nhận Auth/Attendance đã xong.

Sau `git fetch origin --prune`, các remote tips:

| Ref | Hash |
|---|---|
| origin/main | 957306a46b9c0a78ca69a99e76984311d2c46788 |
| origin/Tai | 94dfbda66fd95478cef41e780c482df0c1951c4d |
| origin/viet | 5512b64f45a59cb41f347958c149c31a9337d4de |
| origin/Duy | bdd7bf04b9c824a422307faed026078402e86c65 |

`origin/main` và `origin/Tai` đều là ancestor của `origin/viet`. `origin/Duy` không
là ancestor của viet. Đã merge `origin/viet` vào Duy bằng merge commit hai parent:

`2ee1c99543d7d982e0bec036b3c461487a09da96`

11 file conflict đều thuộc Schedule UI/pagination đã tích hợp từ chính tip viet
trong Phase 1. Đã đối chiếu từng hunk: giữ UI/header, toolbar, table, pagination
của Việt qua adapter ClassSession thật; giữ shared state, strict jump input,
TA re-export và CSS scope cho Parent. Không checkout/ghi đè nguyên file để giải
conflict. Không có conflict Finance/schema/Auth.

Regression phát hiện upstream `userDAL` đưa mock fallback trở lại. Đã bỏ riêng
fallback này, giữ lỗi API như Duy; 2 test lỗi trở lại pass. Dọn trailing whitespace/
EOF whitespace của file mới từ upstream để staged diff check đạt. Các cải tiến
dashboard, profile, progress, lớp và layout của nhóm được giữ trong merge.

Task 04 `bdd7bf0`, Phase 1 `2f1065d` và tip viet đều còn nguyên trong lịch sử Duy.
Sau merge đã chạy lại frontend/backend build, 127 unit, policy, Schedule HTTP/browser,
Class 42 nhóm, Student 12 nhóm và Tuition 300 scenarios trước khi triển khai Phase 2.

## 2. File Phase 2

17 file source/test/CI và báo cáo này, tổng cộng 18 đường dẫn; không có artifacts:

```text
M .github/workflows/ci.yml
M Capstone2/backend.Tests/TuitionPolicy.Tests.csproj
A Capstone2/backend.Tests/ScheduleManagement/Program.cs
A Capstone2/backend.Tests/ScheduleManagement/ScheduleManagement.Tests.csproj
A Capstone2/backend/Controllers/Schedule/ScheduleManagementController.cs
A Capstone2/backend/Models/DTOs/Schedule/ScheduleManagementDto.cs
A Capstone2/backend/Services/Schedule/ScheduleManagementPolicy.cs
A Capstone2/backend/Services/Schedule/ScheduleManagementService.cs
A Capstone2/backend/Services/Schedule/ScheduleWriteTransaction.cs
A Capstone2/frontend/src/BLL/models/ScheduleManagement.ts
A Capstone2/frontend/src/DAL/scheduleManagementDAL.ts
A Capstone2/frontend/src/api/scheduleManagementApi.ts
A Capstone2/frontend/src/GUIs/components/shared/schedule/ScheduleManagement.tsx
M Capstone2/frontend/src/GUIs/components/shared/schedule/ScheduleWorkspace.tsx
M Capstone2/frontend/src/GUIs/components/shared/schedule/schedule.css
A Capstone2/frontend/tests/scheduleManagement.test.mjs
A Capstone2/frontend/tests/scheduleManagement.http.browser.mjs
A docs/EDUTRACK_SCHEDULE_PHASE2_REPORT.md
```

## 3. Chức năng source đã triển khai

CM/AD chọn Class active/upcoming hợp lệ; xem/thêm/sửa/xóa template chưa có Session.
Validate thứ Monday–Sunday, giờ trong ngày và StartTime < EndTime, phòng nullable
theo contract chuỗi tối đa 50 ký tự. Kiểm tra duplicate và overlap theo Class,
tập Teacher/TA active, phòng (trim/case-insensitive), ngày hoạt động của Class.
Hai lịch cố định chỉ conflict nếu date ranges thực sự có chung một ngày học.
Kiểm tra cả template và Session thật. Dữ liệu liên quan có thứ/giờ legacy không
hợp lệ bị chặn để kiểm tra, không giả định là rảnh.

Sửa/xóa có version fingerprint để chặn stale form. **Template có bất kỳ Session
tham chiếu nào bị chặn sửa/xóa**, kể cả chưa Attendance. Không cascade, detach FK,
sửa ngày/giờ/phòng hoặc SessionId của buổi đã tồn tại. Nút ngừng áp dụng dùng bước
xác nhận inline và chỉ xóa template chưa được dùng.

Teacher active có assignment active với Class mới được tạo Session. Backend kiểm
tra principal và DB role/assignment hiện tại ở cả Preview và Confirm. Một buổi dùng
ngày thực tế đúng thứ; giờ/phòng lấy từ template trên server, không nhận các giá trị
này từ client. Không có actor/user ID từ body/query hoặc development bypass.

Theo tháng: tính ngày thật từ mọi template của Class và trả bốn nhóm `eligible`,
`existing`, `conflict`, `outside_class`, với lý do/ID phiên hiện có. Kể cả template
đã từng generate vẫn được dùng cho những ngày mới. Legacy Session null ScheduleId
vẫn được nhận diện theo Class/ngày/giờ; slot đã cancelled/completed vẫn là existing,
không bị tái tạo. Dời/hủy/bù/approval không thuộc Phase 2.

Confirm gửi fingerprint nguồn và danh sách key đã Preview là hợp lệ. Backend đọc
lại toàn bộ dữ liệu cần kiểm tra trong transaction, kiểm lại quyền, template,
Class dates, duplicates và conflict. Chỉ tạo key đã duyệt; key chuyển sang conflict/
outside làm toàn bộ batch rollback. Key đã tồn tại trả lại ID, không tạo lại.
Template/Class/phân công thay đổi làm Preview cũ bị từ chối. Không âm thầm thêm
những key vừa trở nên hợp lệ sau Preview.

Calendar/List dùng engine và read model Phase 1 hiện có. Sau Confirm chỉ refresh
nguồn ClassSession thật. Giữ filter/sort/pagination/detail và responsive. Panel
quản lý inline chỉ mở khi bấm; Preview không tự Confirm. Teacher không có form cấp
template; TA/Student không có action ghi. Capabilities từ server quyết định quyền
thực tế; route role chỉ quyết định trình bày. Identity thay đổi làm bỏ mutation state.

Không ghi trong GET/Preview, không gọi Attendance service trong production Schedule,
không tạo enrollment/Attendance mẫu, không sửa học phí hoặc tạo invoice/payment.

## 4. API và transaction

Base: `/api/schedule/management`.

| Method/path | Quyền |
|---|---|
| GET capabilities | CM/AD, Teacher; scope theo DB |
| GET templates?classId=... | CM/AD hoặc Teacher được phân công |
| POST templates | CM/AD |
| PUT templates/{id} | CM/AD, version đúng, chưa có Session |
| DELETE templates/{id}?version=... | CM/AD, version đúng, chưa có Session |
| POST sessions/preview | Teacher được phân công |
| POST sessions/confirm | Teacher được phân công; Preview/key hợp lệ |

Tất cả service methods fail closed nếu principal chưa xác thực, tài khoản inactive
hoặc role không phù hợp. Response no-store. Không thay Auth module để tạo principal.

Các lệnh ghi Phase 2 dùng cùng database-scoped MySQL `GET_LOCK` trên chính connection
của transaction. Sau khi có khóa, mở transaction Serializable, đọc lại/validate,
SaveChanges và commit. Giải phóng khóa trong finally, kể cả rollback/cancellation;
cũng xử lý trường hợp server vừa cấp khóa nhưng client chưa nhận response.
Khóa hoạt động giữa các connection/API process cùng MySQL database, bao phủ cả
template writes lẫn single/month confirms. Đây không phải lock trong RAM.

MySQL quy định named lock thuộc connection và cần RELEASE_LOCK; COMMIT/ROLLBACK
không tự giải phóng nó. Tham khảo [MySQL locking functions](https://dev.mysql.com/doc/refman/8.0/en/locking-functions.html)
và [InnoDB locks by SQL statement](https://dev.mysql.com/doc/refman/8.0/en/innodb-locks-set.html).

## 5. Giới hạn bắt buộc trước khi chốt đầy đủ

1. **Auth thật chưa có trong pipeline hiện tại.** Production endpoints mới trả 401
   khi không có authenticated principal. Chỉ kiểm thử mutation bằng principal do
   isolated test assembly cấp theo nonce từng run. Không dùng test cookie trong
   production, không tuyên bố đã chạy luồng login thật.
2. **Không có DB unique constraint cho business slot.** Named lock bảo vệ các API
   Phase 2 tham gia protocol. Attendance GET legacy, seeder hoặc SQL/writer khác
   có thể bỏ qua protocol. Integration test đã chèn trực tiếp hai Session cùng
   Class/date/start/end trong database test và xác nhận schema hiện tại chấp nhận.
   Đây là test tái hiện giới hạn, không phải bằng chứng toàn hệ thống đã chống trùng.
3. **Attendance GET tự ghi vẫn tồn tại**, được harness Phase 1 tái hiện bằng
   interceptor chặn trước SQL write. Không sửa module đồng đội. Không thể xác nhận
   integrity toàn hệ thống trong khi writer này vẫn bỏ qua kiểm tra/khóa Schedule.
4. **Chưa thể ngừng template đã được Session tham chiếu mà vẫn giữ template/history**:
   entity không có active/effective dates. Chức năng này bị chặn rõ ràng, không
   dùng sửa weekday/giờ, xóa FK, marker string hay xóa Session làm workaround.
5. Assignment là active Class assignment hiện tại, chưa có lịch sử Teacher/TA theo
   từng Session. Phòng là chuỗi nullable; không thể kiểm tra một phòng chưa biết.
   Management hiện tải snapshot classes/templates/sessions toàn trung tâm để kiểm
   tra conflict; dữ liệu lớn cần tối ưu truy vấn/index sau khi được duyệt.

Đề xuất cho lượt được duyệt riêng, **chưa tạo/chạy migration**:

- Rà duplicate hiện có và chuẩn hóa contract ngày mà không tự xóa/đổi SessionId có
  Attendance. Thêm invariant date-only hoặc generated session-day, rồi unique
  `(class_id, session_day, start_time, end_time)` bảo vệ mọi writer khỏi slot trùng.
  Chỉ index ScheduleId không đủ vì ScheduleId nullable và legacy có thể khác/null.
- Unique template business slot `(class_id, day_of_week, start_time, end_time)` sau
  chuẩn hóa weekday. Unique exact slot không ngăn mọi overlap Class/staff/room;
  mọi writer vẫn cần dùng conflict protocol chung và kiểm tra current assignments.
- Thêm `is_active` hoặc effective range/version cho ClassSchedule để retire template
  đã dùng mà giữ liên kết Session lịch sử. API/owners cần định nghĩa ngày hiệu lực.
- Auth owner cấp principal/transport thật; Attendance owner bỏ GET writers và mọi
  đường tạo Session phải dùng cùng quy tắc transaction/conflict. Không dùng migration
  như lời giải thay thế cho các writer còn bỏ qua overlap validation.

Vì các giới hạn trên còn tồn tại, điều kiện commit Phase 2 “hoàn thành đầy đủ” chưa
đạt. Không tạo commit Phase 2 với message được duyệt hoặc tên Complete.

## 6. Validation

| Kiểm tra | Kết quả |
|---|---|
| Frontend lint/typecheck/build | Đạt; lint warnings từ upstream và bundle >500 kB còn tồn tại |
| Frontend unit/contract | 135 pass, 0 fail/skip; thêm 8 nhóm API management |
| Backend build / management harness | Đạt; 3 nullable warnings baseline sau merge ở module nhóm; không warning mới trong Schedule |
| Management offline policy | 25 assertions, không DB |
| Management MySQL/HTTP/browser | 90 assertions, gồm test tái hiện giới hạn unique; 3 viewport browser groups |
| Schedule Read MySQL/HTTP/browser | 62 assertions, 193 SELECT, 0 write attempts; snapshot tất cả bảng không đổi |
| Calendar/List regression | 20 nhóm: 5 role × desktop/tablet/390px/360px |
| Class regression browser | 42 nhóm, fixtures; không live development API/DB |
| Student regression browser | 12 nhóm, fixtures; không live development API/DB |
| Tuition/KPI regression browser | 300 scenarios, fixtures; không live development API/DB |
| Student / Tuition offline | 26 / 27 + 18 assertions |
| Attendance boundary | SessionId/Attendance giữ nguyên; template đã tham chiếu bị chặn; GET writer dependency được tái hiện/chặn trước SQL ghi |
| Git diff --check | Đạt; kiểm tra riêng file mới không có trailing whitespace/conflict marker |

Management tests gồm quyền/IDOR, actual dates/leap day, Class validity, template
duplicate và optimistic version, recurring/actual Class/Teacher/TA/Room conflicts,
monthly boundaries, stale Preview, revoked assignment, single/month race, năm
confirm đồng thời, retry, rollback sau INSERT trước COMMIT, legacy cancelled slot,
malformed legacy times và bảo toàn Tuition/enrollment/Attendance. Student có enrollment
fixture thấy Session mới qua scoped read API. Chưa có full Attendance workflow/login thật.

Browser management dùng HTTP/MySQL thật trong isolated host, kiểm tra CM/AD/Teacher,
Preview/Confirm riêng, double-click, actual SessionId ở Calendar/List, template có
Session bị disable actions, TA/Student/401/403 và containment desktop/390px/360px.
Đây là Chromium, chưa thay nghiệm thu thiết bị thật/Safari. Icon fonts có thể không
tải trong môi trường test; giữ nguyên icon classes của nhóm.

Các lỗi trung gian đã sửa không được tính là pass: thiếu explicit EF Relational
reference trong test project, tên schema test quá dài, escaping selector browser
và assertion tên Room thay vì nhãn tiếng Việt. Production code không dùng fallback
để làm test qua. Restore từng gặp NU1900 do NuGet network; build cuối dùng packages
đã restore/cache, không thay package production hoặc cấu hình audit repository.

Tái chạy từ repository root:

```powershell
dotnet run --project Capstone2/backend.Tests/ScheduleManagement/ScheduleManagement.Tests.csproj
powershell.exe -NoProfile -ExecutionPolicy Bypass -File Capstone2/backend.Tests/StudentEnrollment/Run-IsolatedMySql.ps1 -TestAssemblyPath Capstone2/backend.Tests/ScheduleManagement/bin/Debug/net8.0/ScheduleManagement.Tests.dll -Http -FrontendRoot Capstone2/frontend
```

Build frontend trước HTTP/browser. Runner yêu cầu port 33308 trống, tạo process
mysqld riêng trong Temp, kiểm tra port/datadir trước mọi fixture write; tạo schema
random `edutrack_schedule_mgmt_test_*`, cleanup schema và shutdown đúng server.
Test host không chạy production Program/DbSeeder hoặc đọc appsettings thật.
Không ghi/seed vào `edutrack_db`. Test-created schema không phải migration nghiệp vụ.

Evidence nằm trong `%TEMP%`, các log `edutrack-finalize-p1-*`, `edutrack-sync-*`,
`edutrack-p2-*`; browser artifacts trong `edutrack-schedule-management-browser-*`,
`edutrack-schedule-browser-*`, `edutrack-class-management-*`,
`edutrack-student-enrollment-*`, `edutrack-tuition-kpi-*`. Không commit artifacts.
Tuition browser chạy bản sao script Temp chỉ thêm Chrome --no-sandbox; không sửa
source Tuition. CI mới chỉ chạy offline policy, không tự khởi tạo database.

Evidence cuối cùng của Phase 2:

```text
%TEMP%\edutrack-p2-http-final.log
%TEMP%\edutrack-schedule-management-browser-toMFPp\results.json
%TEMP%\edutrack-schedule-management-browser-toMFPp\month-preview-small-mobile.png
%TEMP%\edutrack-p2-read-browser.log
%TEMP%\edutrack-p2-class-browser.log
%TEMP%\edutrack-p2-student-browser.log
%TEMP%\edutrack-p2-tuition-browser.log
%TEMP%\edutrack-p2-unit.log
%TEMP%\edutrack-p2-lint-final.log
%TEMP%\edutrack-p2-build.log
```

## 7. Git cuối cùng

Branch `Duy`; HEAD sau đồng bộ vẫn `2ee1c99543d7d982e0bec036b3c461487a09da96`.
Phase 2 chưa commit: 4 tracked modified + 14 untracked source/test/report files;
index không có staged changes, không merge conflict. Không đổi remote Duy/main.
Không push. Dừng để người dùng nghiệm thu implementation và quyết định dependency
trước khi chốt Phase 2/chuẩn bị Phase 3.
