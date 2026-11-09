# EduTrack — Schedule: tích hợp code mới nhất của nhóm

Ngày review: 08/11/2026, UTC+7. Repository AuDuongTai27/EduTrack-A-Smart-Learning-Center-Management-System.

## 1. Quyết định cho lượt này

**Chọn UI Teacher/TA trên origin/viet làm nền tích hợp tiếp theo.** Giữ Schedule Read
API và logic SessionDate/UTC+7/filter/scope của Phase 0/1 làm data boundary.
Không tiếp tục phát triển một thiết kế Teacher/TA song song.

Chưa đưa code viet vào working branch vì người dùng yêu cầu duyệt kế hoạch/phạm vi
file trước. Không merge/rebase/cherry-pick, không checkout đè file. **Toàn bộ 28 file
Phase 0/1 ban đầu vẫn khớp SHA-256**, bao gồm hai page Teacher/TA, tests, CI và tài liệu.
HEAD, tracked diff và index không đổi. Task 04 vẫn ở commit bdd7bf0.

Thay đổi mới trong lượt này chỉ gồm:

- Báo cáo này.
- Capstone2/frontend/tests/scheduleTeammateCompatibility.audit.mjs: công cụ audit
  component upstream qua git archive riêng, không phải production entry point.

Các kết quả Phase 0/1 trước đây là kiểm thử trên Duy, chưa phải kiểm thử phiên bản đã
tích hợp viet. Báo cáo này cập nhật hướng phát triển; không sửa/xóa báo cáo lịch sử.

## 2. Kết quả fetch và lịch sử

Đã fetch origin --no-tags hai lần, lần cuối trước khi chốt kế hoạch; các tip không đổi
giữa hai lần. Không có commit mới hơn 5512b64 trên origin/viet tại thời điểm fetch cuối.

| Ref | Tip đầy đủ | Commit time UTC+7 | Nội dung |
|---|---|---|---|
| Duy local / origin/Duy | bdd7bf04b9c824a422307faed026078402e86c65 | 08/11 09:11:01 | Complete tuition management and invoice lifecycle |
| origin/main | 957306a46b9c0a78ca69a99e76984311d2c46788 | 07/11 14:33:32 | Merge PR #35 từ Tai |
| origin/Tai | 94dfbda66fd95478cef41e780c482df0c1951c4d | 07/11 14:32:09 | Progress evaluation note types/feedback |
| origin/viet | 5512b64f45a59cb41f347958c149c31a9337d4de | 08/11 20:46:46 | Smart pagination/jump input |

Quan hệ đã kiểm tra bằng merge-base --is-ancestor:

- Tai 94dfbda là tổ tiên của main 957306a.
- main 957306a là tổ tiên của viet 5512b64.
- 8365e46 là tổ tiên trực tiếp của 5512b64.
- Main đã có Calendar ban đầu từ f91181f, nhưng chưa có cải tiến 8365e46/5512b64.
- Merge base Duy với main/Tai/viet: 1a525d97cc7416fa2e3e6371dcafe2b79e2864a1.

Số commit chỉ có ở từng phía so với HEAD, bao gồm merge commits:

| So sánh | Chỉ Duy | Chỉ remote ref |
|---|---:|---:|
| HEAD...origin/main | 7 | 12 |
| HEAD...origin/Tai | 7 | 11 |
| HEAD...origin/viet | 7 | 28 |
| HEAD...origin/Duy | 0 | 0 |

Vì vậy không thể dùng main làm đại diện cho mọi cập nhật của thành viên, hoặc thay Duy
bằng bản sao nguyên nhánh mới hơn.

## 3. Thay đổi Schedule của đồng đội

Nguồn commit:
[f91181f](https://github.com/AuDuongTai27/EduTrack-A-Smart-Learning-Center-Management-System/commit/f91181f),
[ab8fb00](https://github.com/AuDuongTai27/EduTrack-A-Smart-Learning-Center-Management-System/commit/ab8fb00),
[8365e46](https://github.com/AuDuongTai27/EduTrack-A-Smart-Learning-Center-Management-System/commit/8365e46),
[5512b64](https://github.com/AuDuongTai27/EduTrack-A-Smart-Learning-Center-Management-System/commit/5512b64).

| Commit | Phần nên giữ |
|---|---|
| f91181f, đã có trong main | Teacher/TA dùng Student timetable; stylesheet schedule-calendar.css dùng chung; Calendar/List |
| ab8fb00 trên viet | Toggle Calendar/List gọn ở header; bố trí week navigator |
| 8365e46 | Status mapping cho Calendar, căn header/body bằng scrollbar gutter; toolbar day/status/search gọn; bỏ checkbox; gộp giờ; sort Class/day/time/studentCount hoạt động; header giản lược |
| 5512b64 | CommonPaginationUtils/PaginationNavGroup; nhảy trang qua input, nhánh đầu/giữa/cuối; Teacher/TA Schedule pagination dùng component này; CSS tương ứng |

5512b64 còn sửa Classes, Requests và Learning Progress. Không lấy nguyên commit này
để tránh thay đổi các trang ngoài phạm vi. CommonPaginationUtils có thể tái sử dụng
nguyên logic; mọi thay đổi lên component chung cần kiểm tra người dùng ở module khác.

### Những điểm data contract chưa thể dùng nguyên trạng

Trong snapshot viet 5512b64:

- Teacher/TA page gọi getMySchedule bằng DEFAULT_TEACHER_ID/DEFAULT_TA_ID.
- TeachingScheduleItemDto vẫn là ClassSchedule, chưa có SessionId/SessionDate.
- scheduleData.ts chuyển weekday thành day index; Calendar vẫn lọc s.day === di.
- Mapper suy completed khi đã qua giờ/thứ hiện tại, kể cả chưa có Attendance.
- Status inactive của Class bị ánh xạ cancelled của session.
- Teacher/TA dùng new Date/getDay/getHours theo timezone trình duyệt, dù UI ghi GMT+7.
- State filter được giữ trong page nhưng chỉ áp vào List; Calendar dùng toàn schedules.
- Toolbar filter active/inactive là trạng thái Class; không phải trạng thái ClassSession.
- Table còn fallback Teacher/TA/phòng/giờ/sĩ số; không thể đưa dữ liệu thiếu vào mà giữ
  các giá trị này như dữ liệu thật.
- Timetable còn default sessions = SESSIONS, chưa có date grouping, overlap lanes,
  session detail hay mobile week scroll theo contract Phase 0/1.

Các điểm này cần sửa ở boundary/props/mapper với review của owner, đồng thời giữ bố
cục, màu sắc, sort affordance và pagination mới. Không có kết luận rằng cần xây UI mới.

## 4. File trùng và phân loại

Phạm vi đường dẫn dưới đây tính từ Capstone2/frontend/src nếu không ghi rõ.

### Trùng trực tiếp giữa 28 file local Phase 0/1 và incoming changes từ merge base

1. GUIs/pages/teacher/Teacher/TeacherSchedulePage.tsx
2. GUIs/pages/teacher/TeachingAssistant/TeachingAssistantSchedulePage.tsx

Đây là điểm có nguy cơ conflict lớn nhất: local là wrapper SharedWorkspace, còn viet
là page Calendar/List mới. Đề xuất dùng cấu trúc page/header của viet, gắn data hook
đúng scope; không chọn nguyên bản local wrapper để ghi đè UI mới.

Shared Schedule mới, ReadService/Controller, API/DAL/BLL, Management Schedule, tests,
CI và tài liệu không trùng đường dẫn với incoming changes của viet.

### Phân loại cho kế hoạch tích hợp

| Nhóm | File/nhóm file | Xử lý đề xuất |
|---|---|---|
| 1 — Giữ code đồng đội | GUIs/components/teacher/CommonPaginationUtils.tsx | Giữ renderer/jump behavior, không chép thuật toán mới song song |
| 1 — Giữ code đồng đội | Teacher và TeachingAssistant/schedule/ScheduleListHeader.tsx, index.ts | Giữ UI/export mới, chỉ điều chỉnh export khi contract buộc phải đổi |
| 2 — Tái sử dụng/refactor | Hai ScheduleListPagination.tsx | Giữ UI/CommonPaginationUtils; shared controller cung cấp count/page/callback, clamp page khi dataset đổi |
| 2 — Tái sử dụng/refactor | Hai ScheduleListToolbar.tsx | Giữ bố cục; tham số hóa trạng thái session; dùng chung filter với Calendar |
| 2 — Tái sử dụng/refactor | Hai ScheduleTable.tsx | Giữ cột giờ gộp/sort; dùng SessionDate thật, SessionId key, actual teacher/TA và detail callback; bỏ fallback giả |
| 2/4 — Shared nhiều actor | student/schedule/ScheduleTimetableCard.tsx và components/ScheduleSessionCard.tsx | Giữ markup/màu gốc; bổ sung contract date/lane/detail/dynamic hours; cần review owner, không đổi luồng Parent |
| 2/4 — Mapper | student/schedule/scheduleData.ts | Bypass mapper ClassSchedule cho lịch chính thức; projection từ ClassSession sau lọc range, không suy completed hoặc actor |
| 2/4 — CSS | assets/css/schedule-calendar.css; các block pagination trong teacher-layout.css | Giữ style/scrollbar alignment; thêm containment/mobile theo review; không thay nguyên teacher-layout.css |
| 3 — Conflict trực tiếp | Hai Teacher/TA Schedule pages ở trên | Review từng hunk trước khi thay kết nối state/data |
| 4 — Boundary shared local | GUIs/components/shared/schedule/* | Giữ bản hiện tại trong backup; sau duyệt, hợp nhất renderer với thiết kế gốc, không duy trì hai hệ UI lâu dài |
| 1 — Giữ Phase 0/1 | Backend ScheduleReadService/Controller/DTO; scheduleSessionApi/DAL; ScheduleSession model; scheduleViewService; CM/AD routes/pages | Giữ security/date/read behavior, chỉ mở rộng contract khi thật sự cần |
| 4 — Ownership khác | Attendance/Auth/Approval và Teacher/TA unrelated pages | Không sửa, không kéo kèm commit |

### Trùng file giữa các commit đã có trên Duy và incoming viet

Chỉ có Capstone2/backend/Services/Learning/Implementation/LearnerDashboardService.cs
trong giao của hai tập thay đổi kể từ merge base:

- Tai/main bổ sung nhãn feedback và note-type aliases.
- Duy Task 04 bỏ GET tạo invoice, fake gateway payment và reset financial history.

Trùng file không đồng nghĩa chắc chắn conflict text; chưa chạy merge. Khi tích hợp
toàn nhánh sau này phải review các hunk và giữ guard Task 04. Không thay file bằng bản
upstream nguyên vẹn.

Khác biệt cần bảo vệ thêm:

- Program.cs trên Duy có Seeding:SkipSampleData; snapshot main/viet chưa có guard này.
  Không chạy backend upstream để smoke-test hoặc copy Program.cs đè Duy.
- package.json trên Duy có scripts typecheck/test; snapshot viet chưa có. Giữ scripts,
  CI và test harness Duy. Package-lock/runtime dependency không cần đổi cho phạm vi này.

## 5. Kiến trúc đích và phạm vi cần duyệt

~~~mermaid
flowchart TD
    A[UI Teacher/TA mới nhất của viet] --> S[Shared query/filter/selection state]
    B[Student và Management layouts] --> S
    S --> D[ScheduleSession API/DAL/BLL hiện có]
    D --> R[ScheduleReadService: principal và role scope]
    R --> DB[ClassSession thật]
    S --> C[Calendar gốc được bổ sung date/lane/detail props]
    S --> L[List gốc và CommonPaginationUtils]
~~~

Quy tắc giữ nguyên:

- ClassSchedule chỉ là template, không tự hiển thị thành buổi học chính thức.
- SessionId/SessionDate là căn cứ đọc, lọc tuần và mở detail.
- Giữ màu/badge gốc; scheduled ánh xạ visual upcoming, ongoing tính UTC+7,
  completed/cancelled theo trạng thái thật; unknown cần hiển thị rõ, không ép upcoming.
- Shared state lọc trước khi đưa dữ liệu vào cả Calendar/List; pagination chỉ cắt List.
- Teacher/TA partner display dùng tên thật theo Class assignment; không default tên.
- Sĩ số không có trong DTO mới: owner cần chọn hiển thị chưa có dữ liệu, hoặc thống
  nhất query count thật; không fallback 30. StudentCount sort chỉ dùng khi có dữ liệu.
- Layout không phải bằng chứng quyền; dữ liệu vẫn do authenticated principal quyết định.
- Không tạo/generate session, request/apply hoặc mở quyền Parent.

### Trình tự sau khi người dùng duyệt

1. Chốt tip nguồn 5512b64 và scope với owner viet; fetch lại nếu đầu nhánh đã đổi.
2. Làm trên bản sao/worktree cô lập bắt đầu từ Duy bdd7bf0 + 28 file local đã sao lưu.
   Không tích hợp vào working tree đang dùng trước khi kết quả cụ thể được review.
3. Lấy đúng các file Schedule của viet, CommonPaginationUtils và CSS phụ thuộc.
   Không cherry-pick nguyên 5512b64/8365e46 vì phạm vi hai commit rộng hơn thay đổi cần.
4. Dùng page/header/toolbar/table/pagination của viet làm presentation; nối shared data
   controller với Schedule Read API. Chỉ refactor props/hook và sửa giả định dữ liệu.
5. Hợp nhất Calendar markup/card/style gốc và phần date/overlap/detail/mobile đã có;
   không thay thế bằng thiết kế Codex riêng. Giữ facade legacy nếu cần tránh đổi Parent.
6. Chạy tests với UI đã tích hợp: Calendar/List cùng filter, sort header thật, jump-page
   Enter/blur/invalid input, UTC+7, overlap/alignment/mobile, error/empty/401 và role scope.
7. Review patch theo file, kiểm tra Task 04/Student/Attendance dependencies; khi đạt mới
   quyết định đưa patch vào Duy. Không tự commit/push/merge.

Phạm vi production dự kiến cần duyệt:

- 2 page Teacher/TA Schedule.
- 2 thư mục Teacher/TA schedule components (header/toolbar/table/pagination/index).
- CommonPaginationUtils.tsx (ưu tiên lấy nguyên trạng, không sửa behavior chung).
- 2 Student/shared timetable/card files và scheduleData contract.
- schedule-calendar.css và chỉ các CSS import/pagination block cần thiết.
- Shared Schedule state/render adapters, tests tương ứng; không đổi Auth/Attendance/Approval.

Không nhập thay đổi main/Tai không liên quan chỉ để đủ một nhánh. Main đã là tổ tiên
của viet; việc tích hợp toàn main, note-type changes hoặc layout Student cần review
riêng. Chọn đúng hunks không đồng nghĩa đã merge toàn bộ lịch sử nhánh.

## 6. Phần đã làm an toàn trong lượt này

- Sao lưu 28 file với manifest SHA-256, tracked binary patch và index patch.
- Git archive frontend đúng tip viet vào Temp riêng; không dùng stash/reset/clean.
- Load/transpile/render trực tiếp component gốc từ snapshot cho compatibility audit;
  không copy source đồng đội vào production hoặc tạo renderer mới.
- 21 case kiểm tra PaginationNavGroup đầu/giữa/cuối, callback số trang, hai paginator
  Teacher/TA, callback sort, toolbar contract, CSS status/alignment và khác biệt mapper.
- Xác minh 10 file upstream được đọc khớp Git blob sau chuẩn hóa EOL theo core.autocrlf.
- Giữ nguyên production/shared/backend Phase 0/1; kiểm thử lại chức năng độc lập.

Chưa tích hợp runtime UI viet vào Duy. Không tuyên bố audit SSR là full build hoặc
end-to-end của nhánh viet; tests HTTP/browser dưới đây chạy bản Duy được bảo toàn.

## 7. Kết quả validation

| Kiểm tra trong lượt này | Kết quả |
|---|---|
| Frontend lint | Đạt, 0 error, 188 warning baseline; audit tool không thêm warning |
| Frontend typecheck / production build | Đạt; bundle warning lớn hơn 500 kB vẫn còn |
| Frontend unit/contract | 124 pass, 0 fail/skip |
| Backend + Schedule harness build | Đạt |
| Schedule MySQL/HTTP | 62 assertion tổng cộng, 193 SELECT, 0 lần thử ghi ở luồng Schedule mới |
| Schedule browser | 20 nhóm: 5 actor × desktop/tablet/390px/360px; empty/error/retry/loading/401 |
| Incoming component audit | 21 check đạt; không phải tích hợp production |
| Student/enrollment policy | 26 assertion offline đạt |
| Tuition policy/generation | 27 + 18 assertion offline đạt, không ghi Invoice/Payment |
| Class browser regression | 42 nhóm fixture đạt |
| Student browser regression | 12 nhóm fixture đạt |
| Tuition/KPI browser regression | 300 page scenarios fixture đạt; browser Los Angeles, kỳ theo Việt Nam |
| Bảo toàn local | 28/28 SHA-256 khớp; HEAD/tracked patch/index không đổi |
| Schema/teammate modules | Không sửa migration, Entities/DbContext, Auth, Attendance, Approval hoặc trang unrelated |

Schedule integration test dùng MySQL instance mới tại 127.0.0.1:33308, datadir Temp
được kiểm tra trước khi tạo synthetic schema. Không chạy production Program/DbSeeder;
không đọc appsettings thật, không truy cập edutrack_db, không migration.
Attendance GET tự ghi vẫn được tái hiện bằng interceptor riêng và bị chặn trước SQL;
đây tiếp tục là dependency chưa sửa, không phải Phase 0 đã hoàn tất.

## 8. Artifacts và cách chạy lại

Root backup/evidence:
%TEMP%/edutrack-schedule-integration-45d90d59ab914f7fbeb58ef54ffd55ab/

- local-files/, local-manifest.json, tracked-working.patch, index.patch, HEAD.txt.
- refs-before.txt, status-before.txt, preservation-check.json.
- viet-frontend.zip và viet-snapshot/ (nguồn riêng, không ghi đè working tree).
- teammate-compatibility.json: 21 kết quả và SHA-256 các source đã đọc.
- frontend-*.log, backend-build.log, schedule-integration.log, policy/browser logs.
- Schedule browser: %TEMP%/edutrack-schedule-browser-u6PYLR/.
- MySQL diagnostics: %TEMP%/edutrack-enrollment-mysql-468a5d66f4474483a43e7facf2baf0c5/.
- Class regression: %TEMP%/edutrack-class-management-U1UpwQ/.
- Student regression: %TEMP%/edutrack-student-enrollment-mc98jd/.
- Tuition/KPI regression: %TEMP%/edutrack-tuition-kpi-k0Vz2o/.

Tuition browser harness được chạy từ bản sao Temp chỉ thêm Chrome no-sandbox flag
cho môi trường headless; không sửa file test Tuition gốc. Artifacts/snapshot ở Temp
không được stage hoặc thêm vào repository.

Chạy incoming component audit từ Capstone2/frontend:

~~~powershell
$env:EDUTRACK_TEAMMATE_FRONTEND='<backup-root>/viet-snapshot/Capstone2/frontend'
$env:EDUTRACK_SCHEDULE_AUDIT_OUTPUT='<backup-root>/teammate-compatibility.json'
node tests/scheduleTeammateCompatibility.audit.mjs
~~~

## 9. Dependency trước Phase 2

Giữ [proposal Attendance/Auth](EDUTRACK_SCHEDULE_PHASE01_DEPENDENCY_PROPOSALS.md).
Latest viet chưa giải quyết backend GET tự tạo dữ liệu hoặc authenticated principal.
Cần owner phối hợp xử lý, không đưa các fallback/identity cũ vào API mới.
Sau khi UI hợp nhất được duyệt và các data-safety dependencies được đóng, mới triển
khai template/session generation Preview/Confirm; approval/apply transaction ở phase
tiếp theo. Không tạo migration trong lượt integration review này.
