# EduTrack — Schedule Phase 2: Final Database Design Proposal

Ngày: 09/11/2026, Asia/Bangkok (UTC+7). Trạng thái: **đề xuất để duyệt schema**.

Implementation Phase 2 đã được người dùng chấp thuận về chức năng. Tài liệu này
chốt phương án dữ liệu cho versioning và occurrence, không mở lại nghiệm thu chức năng.

Lượt này chỉ thêm tài liệu này. Không tạo file migration, không chạy SQL/EF migration,
không kết nối `edutrack_db`, không sửa implementation Phase 2, Auth, Attendance hoặc
Approval; không commit/push/merge. Báo cáo và kết quả kiểm thử Phase 2 trước giữ nguyên.

## 1. Phương án tối thiểu được đề xuất

Giữ `ClassSchedule.ScheduleId` làm **ID ổn định của một ca lặp hằng tuần**; thêm một
bảng `ClassScheduleVersion` chứa nội dung và khoảng hiệu lực của ca. Mỗi Class có thể
có nhiều ca độc lập, kể cả hai ca cùng thứ. Thay giờ/phòng/thứ của ca phải giữ cùng
ScheduleId; không clone thành một ScheduleId mới để thực hiện thao tác “sửa”.

Giữ `ClassSession` làm record của occurrence và phiên học chính thức, giữ nguyên
SessionId. Thêm version nguồn, ngày dự kiến ban đầu và tuần occurrence. Không cần
bảng PlannedOccurrence riêng, bảng idempotency hay engine Calendar mới: mỗi occurrence
đã materialize có đúng một ClassSession; hủy vẫn giữ record đó làm dấu đã xử lý.

**Khóa occurrence: `UNIQUE (schedule_id, occurrence_week_start)`.** Tuần bắt đầu Thứ
Hai, là ngày DATE cụ thể, không dùng riêng số tuần hoặc YEAR(actual date).
`occurrence_week_start` được DB tính từ **PlannedOccurrenceDate bất biến**, không từ
SessionDate thực tế. Status và version không tham gia unique key.

Quy ước đơn giản để khóa này đúng:

- Một ScheduleId = tối đa một occurrence mỗi tuần Monday–Sunday, không phải một Class.
- EffectiveFrom/EffectiveTo nằm ở đầu tuần Thứ Hai, khoảng `[from, to)`; NULL to là
  chưa định ngày kết thúc. Version tương lai bắt đầu từ tuần sau trở đi theo UTC+7.
- Class.StartDate/EndDate vẫn có thể nằm giữa tuần. Chỉ candidate date thực sự thuộc
  thời gian hoạt động của Class mới được tạo. Không cần đổi ngày bắt đầu của Class.
- Đổi lịch ngay giữa tuần hoặc đổi một buổi đã tạo đi qua Phase 3, không cắt version
  giữa tuần. Thêm ca thứ hai trong cùng tuần là ca độc lập có ScheduleId riêng.

Chọn khóa tuần thay vì chỉ `(ScheduleId, PlannedOccurrenceDate)` vì đổi thứ từ Monday
sang Wednesday làm ngày candidate thay đổi. Hai ngày đó vẫn là **cùng occurrence của
cùng ca trong cùng tuần**, không được generate hai lần. Không dùng ScheduleVersionId
trong unique key vì version mới không tạo ra một occurrence mới cho tuần đã có buổi.

```mermaid
erDiagram
    Class ||--o{ ClassSchedule : contains
    ClassSchedule ||--|{ ClassScheduleVersion : versions
    ClassSchedule ||--o{ ClassSession : owns_occurrence
    ClassScheduleVersion ||--o{ ClassSession : planned_from
    ClassSession ||--o{ Attendance : existing_session_id
```

## 2. Entities, columns, indexes và lý do

### 2.1. ClassSchedule: giữ danh tính ca

| Thành phần | Đề xuất | Lý do |
|---|---|---|
| ScheduleId, ClassId | Giữ nguyên; không chuyển ca sang Class khác | Lineage ổn định cho retry/version/Phase 3 |
| Versions | Navigation mới tới ClassScheduleVersion | Không chép đè lịch sử template |
| AK `(schedule_id, class_id)` | Alternate unique key | Cho composite FK kiểm tra Session và Schedule cùng Class |
| DayOfWeek, StartTime, EndTime, Room hiện có | Chuyển nguồn chuẩn sang Version | Một ca có nhiều nội dung theo thời gian |

Trong bước expand vẫn giữ bốn cột cũ để chuyển đổi có kiểm soát. Sau backfill và khi
mọi consumer đã đọc Version, bước contract bỏ bốn cột đó. Không duy trì thêm một
“current version cache” trên root: có version tương lai thì “current” phụ thuộc ngày.
Không đổi/xóa bảng hoặc PK ClassSchedule; Session.ScheduleId tiếp tục mang cùng nghĩa
lineage ổn định. Không cần thêm IsActive, RootScheduleId hay VersionNumber.

### 2.2. ClassScheduleVersion: một bảng mới

| Column | Kiểu cuối cùng | Lý do |
|---|---|---|
| ScheduleVersionId | INT PK, auto increment | Nhận diện version cụ thể; không dùng làm occurrence key |
| ScheduleId | INT NOT NULL, FK RESTRICT | Version thuộc một ca ổn định |
| EffectiveFrom | DATE NOT NULL, Thứ Hai | Tuần bắt đầu áp dụng, inclusive |
| EffectiveTo | DATE NULL, Thứ Hai, > From | Tuần ngừng áp dụng, exclusive; retire bằng đóng khoảng |
| DayOfWeek | VARCHAR(20) NOT NULL | Giữ contract Monday–Sunday hiện có |
| StartTime / EndTime | TIME(6) NOT NULL | Khung giờ của version; 00:00 <= start < end < 24:00 |
| Room | VARCHAR(50) NULL | Giữ contract phòng hiện tại; không tạo danh mục phòng mới |

Indexes/constraints:

- `UNIQUE (schedule_id, effective_from)`: không có hai version cùng điểm bắt đầu.
- `UNIQUE (schedule_version_id, schedule_id)`: principal key cho composite FK nguồn.
- CHECK khoảng hiệu lực, ngày đầu tuần, weekday hợp lệ và giờ hợp lệ.
- Các version của cùng ScheduleId **không chồng khoảng**. Unique ở trên không tự
  bảo đảm điều này: service phải khóa root và kiểm tra overlap trong transaction.
  Không đề xuất trigger hoặc tuyên bố MySQL có exclusion constraint cho khoảng này.

Definition của version đã phát hành là bất biến: không sửa thứ/giờ/phòng/From.
Cho phép đóng EffectiveTo trong tương lai khi tạo successor hoặc retire, qua cùng
transaction. Không xóa version đã dùng hoặc xóa root để né lịch sử. Một khoảng không
có version nghĩa là ca không nhận occurrence mới; không cần marker string.

### 2.3. ClassSession: planned identity tách khỏi actual booking

| Thành phần | Đề xuất cuối cùng | Lý do |
|---|---|---|
| SessionId | Giữ PK và mọi giá trị hiện có | Attendance vẫn trỏ đúng buổi cũ |
| ClassId | Giữ | Scope Class và conflict thực tế |
| ScheduleId | Chuyển từ nullable sang NOT NULL **sau gate legacy** | Không để NULL bỏ qua unique occurrence |
| ScheduleVersionId | INT NOT NULL mới, composite FK | Version được dùng lúc occurrence được tạo lần đầu |
| PlannedOccurrenceDate | DATE NOT NULL mới, bất biến | Ngày dự kiến gốc có bằng chứng, không thay khi dời/hủy |
| OccurrenceWeekStart | DATE generated STORED từ PlannedOccurrenceDate | Khóa tuần do DB tính, client không tự cung cấp |
| SessionDate / StartTime / EndTime / Room | Giữ các cột actual hiện tại | Nơi lưu lịch thực tế; Phase 3 mới được cập nhật |
| Status | Giữ scheduled/completed/cancelled hiện tại | Hủy giữ record và khóa occurrence |

`ScheduleVersionId` là **provenance ban đầu**, không phải version đang hiệu lực hôm
nay hay version mô tả lịch actual sau reschedule. Không repoint Session cũ sang
version mới để làm dữ liệu “trông khớp”. Session giữ snapshot actual độc lập.

Indexes/FKs:

- `UNIQUE (schedule_id, occurrence_week_start)` trên **mọi status**, kể cả cancelled.
- FK `(schedule_id, class_id)` → ClassSchedule `(schedule_id, class_id)`, RESTRICT.
- FK `(schedule_version_id, schedule_id)` → Version `(schedule_version_id, schedule_id)`,
  RESTRICT. Không cho Session của ca A tham chiếu version của ca B.
- Index không unique `(session_date, start_time)` phục vụ truy vấn actual theo range
  và conflict; giữ các index PK/FK hiện có. Tối ưu thêm chỉ khi có execution plan.
- Không UNIQUE actual date/time làm cơ chế chống trùng occurrence. Không unique có
  Status hoặc chỉ áp dụng cho scheduled; cancel/reschedule không được giải phóng key.

Các mốc ngày planned/effective là civil date UTC+7; không chuyển bằng UTC timestamp.
SessionDate tiếp tục contract actual date hiện có; không đổi kiểu hay backfill giá
trị datetime(6) của cột này trong đề xuất tối thiểu.

Không đặt CHECK rằng mọi PlannedOccurrenceDate phải luôn nằm trong EffectiveTo hiện
tại của version nguồn: đóng version có thể xảy ra **sau** khi các buổi tương lai đã
được tạo. Các buổi đó vẫn có provenance hợp lệ tại lúc tạo và được giữ nguyên.

### 2.4. Ranh giới bảo đảm

| DB bảo đảm sau contract | Service/transaction tiếp tục phải bảo đảm |
|---|---|
| Không INSERT hai record cùng ca/tuần occurrence | Chọn đúng ca, version, ngày planned và tuần theo nghiệp vụ |
| Không lách uniqueness bằng NULL | Không clone ca khi sửa; không đổi identity khi reschedule |
| Version/ca/Class khớp qua FK | Không chồng effective ranges; version áp dụng đúng lúc tạo |
| Tuần được tính từ planned date | Authorization, assignment và conflict Class/Teacher/TA/Room |

Unique không ngăn SQL có quyền UPDATE đổi identity hoặc DELETE record rồi chèn lại.
Tất cả application writers phải giữ identity bất biến, không hard-delete Session;
DB account vận hành phải được quản lý quyền tương ứng. Không tuyên bố schema tối
thiểu bảo vệ được mọi thao tác SQL tùy ý. Legacy writer chưa được chuyển đổi là
dependency cutover, không được giữ chạy song song rồi coi constraint là đủ.

## 3. SQL / EF migration proposal — chỉ nằm trong tài liệu

Tên/type/FK hiện tại đối chiếu source migration và model snapshot, chưa xác minh
schema live. SQL là draft cho MySQL 8.0.16+ có CHECK enforcement; cần thử trên MySQL
độc lập và đối chiếu SHOW CREATE TABLE trong lượt được duyệt. Không chạy ở lượt này.

### 3.1. Expand: thêm cấu trúc, chưa tuyên bố uniqueness hoàn chỉnh

```sql
-- PROPOSAL ONLY. NOT EXECUTED. Không phải script chạy liền A rồi B.
ALTER TABLE class_schedules
  ADD CONSTRAINT AK_schedule_class UNIQUE (schedule_id, class_id);

CREATE TABLE class_schedule_versions (
  schedule_version_id INT NOT NULL AUTO_INCREMENT,
  schedule_id INT NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE NULL,
  day_of_week VARCHAR(20) NOT NULL,
  start_time TIME(6) NOT NULL,
  end_time TIME(6) NOT NULL,
  room VARCHAR(50) NULL,
  CONSTRAINT PK_schedule_versions PRIMARY KEY (schedule_version_id),
  CONSTRAINT UQ_schedule_version_from UNIQUE (schedule_id, effective_from),
  CONSTRAINT AK_version_schedule UNIQUE (schedule_version_id, schedule_id),
  CONSTRAINT FK_version_schedule FOREIGN KEY (schedule_id)
    REFERENCES class_schedules (schedule_id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT CK_version_effective CHECK (
    WEEKDAY(effective_from) = 0 AND
    (effective_to IS NULL OR
      (effective_to > effective_from AND WEEKDAY(effective_to) = 0))),
  CONSTRAINT CK_version_weekday CHECK (
    day_of_week IN ('Monday','Tuesday','Wednesday','Thursday',
                   'Friday','Saturday','Sunday')),
  CONSTRAINT CK_version_times CHECK (
    start_time >= '00:00:00' AND start_time < end_time AND end_time < '24:00:00')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE class_sessions
  ADD COLUMN schedule_version_id INT NULL,
  ADD COLUMN planned_occurrence_date DATE NULL,
  ADD COLUMN occurrence_week_start DATE GENERATED ALWAYS AS (
    DATE_SUB(planned_occurrence_date,
             INTERVAL WEEKDAY(planned_occurrence_date) DAY)
  ) STORED,
  ADD INDEX IX_session_actual_range (session_date, start_time),
  ADD CONSTRAINT FK_session_schedule_class FOREIGN KEY (schedule_id, class_id)
    REFERENCES class_schedules (schedule_id, class_id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT FK_session_version_schedule
    FOREIGN KEY (schedule_version_id, schedule_id)
    REFERENCES class_schedule_versions (schedule_version_id, schedule_id)
    ON DELETE RESTRICT ON UPDATE RESTRICT;
```

Chưa thêm unique để tránh backfill âm thầm “chọn winner”. Composite FK yêu cầu xử
lý các liên kết Class/Schedule sai có sẵn trước bước add FK tương ứng. Mọi writer
Schedule/legacy/seeder phải được dừng trong cửa sổ chuyển đổi; nếu không dừng được
thì chưa triển khai cutover, không chạy app cũ vào schema đang backfill.

### 3.2. Data backfill: mapping được review theo SessionId

Không có lệnh kiểu `UPDATE ... planned_occurrence_date = DATE(session_date)` áp
dụng toàn bảng. Mục 4 quy định bằng chứng/mapping cần có trước khi viết lệnh cập nhật.
Mapping là artifact có version/checksum bên ngoài database nghiệp vụ, gồm:

```text
SessionId, ExistingScheduleId, ResolvedScheduleId, ResolvedVersionId,
OriginalPlannedDate, EvidenceReference, ResolutionDecision
```

Chỉ UPDATE ba metadata được duyệt: ScheduleId nếu đang NULL/sai và có bằng chứng,
ScheduleVersionId, PlannedOccurrenceDate. Không UPDATE SessionId, actual date/time,
Room, Status hoặc bất kỳ Attendance row nào. Không seed dữ liệu mẫu.

### 3.3. Contract: chỉ sau khi mọi gate đã đạt

Các truy vấn dưới là tiêu chí kiểm tra đề xuất, chưa chạy trên database thật:

```sql
-- Cả ba kết quả phải rỗng/0; mapping provenance cũng phải được review xong.
SELECT COUNT(*) AS unresolved
FROM class_sessions
WHERE schedule_id IS NULL OR schedule_version_id IS NULL
   OR planned_occurrence_date IS NULL;

SELECT schedule_id, occurrence_week_start, COUNT(*) AS occurrences
FROM class_sessions
GROUP BY schedule_id, occurrence_week_start
HAVING COUNT(*) > 1;

SELECT a.schedule_version_id, b.schedule_version_id
FROM class_schedule_versions a
JOIN class_schedule_versions b
  ON a.schedule_id = b.schedule_id
 AND a.schedule_version_id < b.schedule_version_id
WHERE (b.effective_to IS NULL OR a.effective_from < b.effective_to)
  AND (a.effective_to IS NULL OR b.effective_from < a.effective_to);

-- CHỈ SAU REVIEW/MAPPING/WRITER CUTOVER, không phải phần auto-fix.
ALTER TABLE class_sessions
  MODIFY COLUMN schedule_id INT NOT NULL,
  MODIFY COLUMN schedule_version_id INT NOT NULL,
  MODIFY COLUMN planned_occurrence_date DATE NOT NULL,
  ADD CONSTRAINT CK_occurrence_week_known CHECK (occurrence_week_start IS NOT NULL),
  ADD CONSTRAINT UQ_schedule_occurrence_week
    UNIQUE (schedule_id, occurrence_week_start);

-- Sau khi toàn bộ consumers đã chuyển nguồn sang Version.
ALTER TABLE class_schedules
  DROP COLUMN day_of_week,
  DROP COLUMN start_time,
  DROP COLUMN end_time,
  DROP COLUMN room;
```

FK đơn ScheduleId hiện tại có thể được giữ trong expand rồi bỏ ở contract vì đã
có FK composite bao phủ; tên source là `FK_class_sessions_class_schedules_schedule_id`.
Thứ tự drop/recreate FK khi ALTER nullability phải theo SQL Pomelo sinh ra và kiểm
thử trên bản sao độc lập. Không sửa migration lịch sử đã có.

Không giữ key nullable ở schema cuối: MySQL UNIQUE cho phép nhiều NULL. Generated
column được index và tính từ planned date; WEEKDAY trả Monday=0. Đây là lý do dùng
NOT NULL + computed week + unique chung, thay vì unique trên actual booking.
Tham khảo [MySQL CREATE TABLE](https://dev.mysql.com/doc/refman/8.0/en/create-table.html),
[generated columns](https://dev.mysql.com/doc/refman/8.0/en/create-table-generated-columns.html)
và [date functions](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html).

### 3.4. EF model/migration sketch

Entity mới và thay đổi property cuối cùng, **không phải source được tạo ở lượt này**:

```csharp
// Existing ClassSchedule giữ ScheduleId, ClassId, navigation Class/Sessions;
// thêm ICollection<ClassScheduleVersion> Versions; bỏ 4 property đã chuyển.
public sealed class ClassScheduleVersion
{
    public int ScheduleVersionId { get; set; }
    public int ScheduleId { get; set; }
    public DateOnly EffectiveFrom { get; set; }
    public DateOnly? EffectiveTo { get; set; }
    public string DayOfWeek { get; set; } = null!;
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string? Room { get; set; }
    public ClassSchedule Schedule { get; set; } = null!;
    public ICollection<ClassSession> ClassSessions { get; set; } = [];
}

// ClassSession additions / change, giữ mọi property actual và SessionId cũ:
// public int ScheduleId { get; private set; } // non-null after legacy gate
// public int ScheduleVersionId { get; private set; }
// public DateOnly PlannedOccurrenceDate { get; private set; }
// public DateOnly OccurrenceWeekStart { get; private set; } // generated
// public ClassScheduleVersion ScheduleVersion { get; private set; } = null!;

modelBuilder.Entity<ClassSchedule>()
    .HasAlternateKey(x => new { x.ScheduleId, x.ClassId })
    .HasName("AK_schedule_class");

modelBuilder.Entity<ClassScheduleVersion>(v =>
{
    v.ToTable("class_schedule_versions");
    v.HasKey(x => x.ScheduleVersionId);
    v.Property(x => x.ScheduleVersionId).HasColumnName("schedule_version_id");
    v.Property(x => x.ScheduleId).HasColumnName("schedule_id");
    v.Property(x => x.EffectiveFrom).HasColumnName("effective_from").HasColumnType("date");
    v.Property(x => x.EffectiveTo).HasColumnName("effective_to").HasColumnType("date");
    v.Property(x => x.DayOfWeek).HasColumnName("day_of_week").HasMaxLength(20).IsRequired();
    v.Property(x => x.StartTime).HasColumnName("start_time").HasColumnType("time(6)");
    v.Property(x => x.EndTime).HasColumnName("end_time").HasColumnType("time(6)");
    v.Property(x => x.Room).HasColumnName("room").HasMaxLength(50);
    v.HasIndex(x => new { x.ScheduleId, x.EffectiveFrom }).IsUnique()
        .HasDatabaseName("UQ_schedule_version_from");
    v.HasAlternateKey(x => new { x.ScheduleVersionId, x.ScheduleId })
        .HasName("AK_version_schedule");
    v.HasOne(x => x.Schedule).WithMany(x => x.Versions)
        .HasForeignKey(x => x.ScheduleId).OnDelete(DeleteBehavior.Restrict);
    // ToTable(..., t => t.HasCheckConstraint(...)): same CHECK definitions as SQL.
});

modelBuilder.Entity<ClassSession>(s =>
{
    s.Property(x => x.ScheduleId).IsRequired();
    s.Property(x => x.ScheduleVersionId).HasColumnName("schedule_version_id").IsRequired();
    s.Property(x => x.PlannedOccurrenceDate).HasColumnName("planned_occurrence_date")
        .HasColumnType("date").IsRequired();
    s.Property(x => x.OccurrenceWeekStart).HasColumnName("occurrence_week_start")
        .HasColumnType("date")
        .HasComputedColumnSql("DATE_SUB(planned_occurrence_date, INTERVAL WEEKDAY(planned_occurrence_date) DAY)", stored: true);
    s.HasIndex(x => new { x.ScheduleId, x.OccurrenceWeekStart }).IsUnique()
        .HasDatabaseName("UQ_schedule_occurrence_week");
    s.HasIndex(x => new { x.SessionDate, x.StartTime })
        .HasDatabaseName("IX_session_actual_range");
    // Thay mapping Schedule hiện tại, không thêm navigation trùng quan hệ.
    s.HasOne(x => x.Schedule).WithMany(x => x.ClassSessions)
        .HasForeignKey(x => new { x.ScheduleId, x.ClassId })
        .HasPrincipalKey(x => new { x.ScheduleId, x.ClassId })
        .OnDelete(DeleteBehavior.Restrict);
    s.HasOne(x => x.ScheduleVersion).WithMany(x => x.ClassSessions)
        .HasForeignKey(x => new { x.ScheduleVersionId, x.ScheduleId })
        .HasPrincipalKey(x => new { x.ScheduleVersionId, x.ScheduleId })
        .OnDelete(DeleteBehavior.Restrict);
});
```

Thêm DbSet<ClassScheduleVersion>; map đầy đủ constraints/names theo SQL. Private
setters hỗ trợ invariant ở application, không thay thế DB permissions hoặc kiểm tra
trong service. Cần kiểm thử mapping DateOnly/computed column trên Pomelo đang dùng.
Tham khảo [EF generated properties](https://learn.microsoft.com/en-us/ef/core/modeling/generated-properties)
và [composite principal/foreign keys](https://learn.microsoft.com/en-us/ef/core/modeling/relationships/foreign-and-principal-keys).

Kế hoạch EF cho lượt sau: một migration expand; backfill được duyệt riêng bằng
mapping; một migration contract. Không generate `Up` tự backfill bằng actual date.
Snapshot/Designer chỉ được sinh sau khi model/schema đã được duyệt. Down của contract
không thể phục hồi trung thực một ca có nhiều version vào một template mutable;
không automatic rollback mất lịch sử. Rollback cần backup/plan được review riêng.
MySQL DDL có implicit commit, nên không hứa toàn bộ expand/backfill/contract rollback
bằng một transaction. [MySQL implicit commits](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html).

## 4. Data migration strategy cho legacy

Chưa đọc database thật, nên **chưa có số lượng NULL/duplicate, chưa có mapping nào
được xác nhận**. Strategy sau chỉ là quy tắc cho lượt migration được duyệt.

1. Tạm dừng mọi writer Session/template, gồm Attendance GET writer và seeder. Backup
   đầy đủ; chụp SessionId, các trường actual, FK Attendance và hashes trước chuyển đổi.
2. Inventory theo SessionId: ScheduleId NULL, Class mismatch, giờ/thứ sai, cùng slot
   actual, cùng ca/tuần candidate, cancelled/completed, có Attendance, có dấu hiệu
   đã dời buổi. Báo cáo duplicate actual chỉ là gợi ý, không xác định planned identity.
3. Tạo versions từ cấu hình/nguồn lịch đã được xác nhận, với effective range có bằng
   chứng. Nếu chỉ biết trạng thái template hiện tại, có thể duyệt nó làm version từ
   cutover week; không tự tuyên bố nó là lịch lịch sử từ Class.StartDate.
4. Xác định original planned date và version nguồn cho từng Session bằng source/audit/
   lịch được CM xác nhận. `ScheduleId != NULL` cũng chưa chứng minh SessionDate chưa
   bị dời hoặc template chưa bị sửa trong quá khứ. Một match actual duy nhất chỉ là
   **candidate mapping**, không tự động là bằng chứng planned date.
5. Với ScheduleId NULL: đối chiếu cùng Class, template, weekday/time/room và lịch sử
   gốc; chỉ gán vào ca/version khi chứng minh được. Nếu xác nhận đó là một buổi độc
   lập đã có thật, CM có thể duyệt một ca riêng hiệu lực một tuần cho record đó;
   đây là phân loại lịch sử có bằng chứng, không tạo template giả cho mọi NULL.
6. Record bị dời/hủy: map theo occurrence gốc, không theo actual destination. Không
   suy luận planned từ Status=cancelled hoặc từ “giờ giống nhau”. Thiếu bằng chứng
   thì giữ unresolved ở bước expand và **chặn contract/cutover**.
7. Nếu hai Session cùng logical occurrence: không tự giữ min(SessionId), xóa, gộp,
   đổi tuần hoặc cấp ca giả để vượt unique. Nếu thực sự là hai ca độc lập, CM xác
   nhận phân loại hai ScheduleId. Nếu là duplicate thật, đặc biệt cả hai có Attendance,
   schema tối thiểu này không tự giải quyết được: dừng để chủ dữ liệu quyết định xử
   lý lịch sử/thiết kế ngoại lệ riêng. Không chuyển Attendance sang Session khác.
8. Apply metadata mapping bằng SessionId trong transaction DML có đối soát. So lại
   toàn bộ SessionId, actual fields/status, Attendance FK/count/hash không đổi.
   Không DELETE/reinsert Session, không sửa hoặc seed Attendance/enrollment.
9. Chỉ khi unresolved=0, logical duplicates=0, version overlap=0 và FKs hợp lệ mới
   áp dụng NOT NULL + unique, cập nhật mọi writer/reader rồi mở lại chức năng.
   Có unresolved thì chưa hoàn tất migration, không để nullable vĩnh viễn rồi báo
   đã bảo đảm duplicate protection. App Phase 2 cũ không chạy nguyên trạng sau contract.

Đây là giới hạn dữ liệu đầu vào, không giải bằng đoán lịch sử. Không thay SessionId
đã có Attendance trong bất kỳ nhánh xử lý nào của đề xuất.

## 5. Quy tắc sửa template và generate sau khi đổi lịch

### 5.1. Thay lịch tương lai / retire

1. CM/AD chọn **cùng ScheduleId**, nội dung mới và EffectiveFrom F là Thứ Hai tương
   lai. Preview trả lịch version cũ/mới và danh sách Session đã materialize có
   occurrence week >= F, bao gồm buổi đã dời ra ngoài tháng, đã hủy hoặc có Attendance.
2. Giữ cơ chế khóa Schedule chung của Phase 2; thêm/giữ khóa root trong transaction.
   Đọc lại fingerprint toàn timeline version, Class dates, assignments và impacted
   Session IDs. Không cho hai thao tác đóng/mở version đồng thời cùng thắng.
3. Thao tác tối thiểu là đóng version cuối tại F và tạo successor `[F, NULL)`; nếu
   đã có version tương lai bắt đầu tại/sau F thì trả lỗi yêu cầu review timeline,
   không tự xóa/đè nó hoặc chồng khoảng. Muốn tiếp tục append thì chọn F sau From
   của version cuối. Chưa cần nhánh version hoặc tự sửa một chuỗi future versions.
4. Kiểm tra không chồng effective range; duplicate/template allocation conflicts
   theo Class, Teacher/TA và Room trong phần date range thực sự giao nhau. Phiên
   actual của **chính cùng occurrence** không bị coi là một buổi khác để self-conflict;
   Session của occurrence khác dù cùng ScheduleId vẫn phải kiểm tra khi đụng actual.
5. Sau Confirm chỉ ghi versions. **Không UPDATE ClassSession**: SessionId,
   ScheduleVersionId nguồn, planned identity, actual fields, status và Attendance
   giữ nguyên. Những buổi đã generate là ngoại lệ được giữ nguyên so với lịch mới.
6. Retire cũng chỉ đóng EffectiveTo tại F, không delete root/version/Session. Không
   tạo occurrence mới cho tuần >= F; record đã tồn tại vẫn hiện trong Calendar/List.
   Nếu muốn hủy/dời những buổi này phải qua Phase 3 từng Session đã chọn.

Preview phải nói rõ số buổi tương lai được giữ lịch cũ. CM xác nhận thay template
không đồng nghĩa duyệt batch reschedule. Các version không còn áp dụng không làm
mất quyền xem/history Session hoặc làm cancelled trở thành eligible.

### 5.2. Generate một buổi / theo tháng

1. Xét version hiệu lực theo **tuần occurrence và ngày planned candidate**, không theo
   actual SessionDate sau reschedule. Với weekly effective ranges, mỗi ca/tuần có
   tối đa một version áp dụng; gap/retired không sinh candidate.
2. Tính proposed planned date từ weekday của version trong tuần; kiểm tra Class dates.
   Lấy key `(ScheduleId, Monday(planned date))` trước khi xét actual time/room.
3. Tìm record đã tồn tại bằng key đó **không lọc status, version hoặc actual month**.
   Có record thì trả `existing` với SessionId, original planned date, actual date/
   time/room/status và version nguồn. Khác lịch mới thì thêm cảnh báo “đã tạo theo
   version trước; giữ nguyên; cần Phase 3 nếu muốn thay đổi”. Không tạo lại.
4. Chưa có record mới được xét eligible/outside_class/conflict. Validate allocated
   template và actual bookings theo Class/Teacher/TA/Room; cancelled không chiếm
   tài nguyên actual nhưng vẫn giữ quyền sở hữu occurrence. Uniqueness không thay
   kiểm tra overlap, assignment hoặc effective date range.
5. Preview theo tháng lấy cả candidate của version mới và các record có original
   planned date trong tháng đó; merge theo occurrence key. Đồng thời lookup mọi
   candidate key dù existing record có planned date ở tháng khác. Nhờ vậy vẫn thấy
   buổi đã dời/hủy, buổi giữ lịch cũ sau retire, và trường hợp đổi thứ qua ranh tháng.
6. Confirm kiểm lại principal/assignment, timeline fingerprint, keys được duyệt và
   conflict trong cùng protocol khóa/transaction như Phase 2. New Session ghi đúng
   ScheduleId, ScheduleVersionId nguồn, PlannedOccurrenceDate; actual lúc đầu bằng
   planned/template snapshot. DB tự tính week, unique là lớp bảo vệ INSERT cuối.
7. Race vi phạm đúng unique occurrence (MySQL 1062) phải rollback rồi đọc lại các
   key đã chọn bằng transaction mới. Chỉ báo existing khi tìm được record đúng key;
   không nuốt mọi lỗi 1062 hoặc báo cả batch thành công khi chưa kiểm tra kết quả.
   Double-submit/mất response rồi retry trả lại cùng SessionId, không một record mới.

### 5.3. Các tình huống quyết định

| Tình huống | Kết quả đúng |
|---|---|
| Jan 2027 đã generate; CM đổi 18–20 thành 19–21 từ 11/01 | Buổi Jan đã có giữ 18–20; buổi chưa tạo mới dùng version mới; Preview liệt kê rõ ngoại lệ |
| Ca S: đã tạo planned Mon 04/01/2027; version mới Wed 06/01, hiệu lực Mon 04/01 | Key vẫn `(S, 04/01)`; không tạo thêm Wed dù planned date candidate khác |
| Buổi trên dời actual sang Sat 09/01 hoặc Tue 12/01 | Planned vẫn 04/01, week vẫn 04/01; generate tuần/tháng gốc thấy existing |
| Buổi trên bị cancelled | Giữ record/key; generate không khôi phục hoặc tạo bù tự động |
| Planned Tue 31/08/2027 đã tạo; đổi ca sang Wed 01/09, hiệu lực Mon 30/08 | Generate Sep tìm key tuần 30/08 và trả buổi Aug đã có; không tạo thêm chỉ vì khác tháng |
| Retire ca sau khi đã generate Feb | Không sinh thêm; các buổi Feb đã tạo giữ nguyên tới khi có yêu cầu Phase 3 |
| Dời occurrence tuần W sang tuần W+1, nơi đã có một buổi thường lệ | Hai occurrence khác key có thể tồn tại trong cùng actual week; nếu actual time/resource overlap phải reject reschedule |

## 6. Tác động tới Phase 3 Schedule Change Requests

Chưa sửa module Approval ở lượt này. Phase 3 cần typed payload/detail do owner duyệt,
liên kết **SessionId** thay vì chỉ ghi ClassId và mô tả tự do. ApprovalRequest hiện tại
chưa có các trường cấu trúc này; không coi status approved là đã apply lịch.

Payload tối thiểu cần: RequestId, SessionId, loại reschedule/cancel/makeup, actual
snapshot/version fingerprint đã review, proposed actual date/start/end/room, lý do
và trạng thái/applied marker phục vụ apply idempotent. Có thể dùng detail 1–1 với
ApprovalRequest; chưa đưa bảng này vào migration Phase 2 tối thiểu.

- **Reschedule:** lock request + Session, kiểm tra approved/current snapshot và
  Attendance policy, revalidate destination Class/Teacher/TA/Room; UPDATE chính
  record actual. Giữ SessionId, ScheduleId, ScheduleVersionId nguồn, PlannedOccurrenceDate.
- **Cancel:** UPDATE Status=cancelled; không DELETE, không giải phóng occurrence key.
- **Makeup thay cho buổi bị hủy/dời:** apply trên cùng record/occurrence theo request
  được duyệt; việc chuyển cancelled về scheduled phải là hành động rõ ràng của Phase 3,
  không phải retry Generate. Nếu muốn thêm một buổi mới độc lập ngoài weekly quota,
  đó là nghiệp vụ khác cần duyệt riêng, không tự cấp ca giả để né unique key.
- **Attendance:** mặc định chặn thay actual/cancel buổi đã có Attendance; không re-key
  hoặc tự chuyển Attendance. Ngoại lệ nghiệp vụ cần owner duyệt sau, ngoài thiết kế này.
- **Template đổi trong lúc request đang pending:** request vẫn trỏ Session cụ thể;
  việc tạo version không đổi actual snapshot đó. Apply vẫn kiểm lại actual/assignment/
  conflicts hiện tại và từ chối stale changes. Thay template không tự approve/apply request.
- **Atomicity:** actual update và request applied marker cùng transaction; retry sau
  approved/applied không thực hiện hai lần. Batch thay các buổi đã generate phải có
  danh sách SessionId và chính sách all-or-nothing rõ ràng trước khi triển khai.

Calendar/List tiếp tục đọc **actual** theo SessionDate. Session detail có thể bổ sung
original planned date/version để giải thích lịch đã thay đổi; không tạo renderer mới.
Teacher/TA vẫn là Class assignments hiện tại: proposal này không thêm historical
staff snapshots hoặc đổi Tuition tháng của Task 04.

## 7. Tests cần bổ sung ở lượt implementation sau

| Nhóm | Acceptance cases |
|---|---|
| Effective ranges | From/To Monday; half-open đúng biên; From < To; Class bắt đầu giữa tuần; gap/retire; concurrent append cùng root; chồng khoảng bị reject dù From khác |
| Preserve history | Đổi thứ/giờ/phòng/retire khi đã generate Jan/Feb; byte/snapshot actual, planned identity, source version, SessionId và Attendance không đổi |
| Occurrence uniqueness | Raw INSERT cùng ScheduleId/tuần bị DB reject dù khác actual date/time, version hay status; ca khác cùng tuần không bị unique này chặn |
| Moved/cancelled | Reschedule trong tuần/qua tuần/qua tháng/qua năm rồi retry single/month; cancelled vẫn existing; không tự tạo makeup |
| Weekday change | Monday → Wednesday cùng tuần không tạo thêm; Tue 31/08 → Wed 01/09 cùng tuần không tạo thêm; year boundary dùng DATE tuần đúng |
| Concurrency | Single vs monthly, nhiều API process/connections, version change vs confirm, Phase 3 apply vs generate; giữ khóa chung, transaction và xử lý 1062 đúng constraint |
| Immutable identity | Service từ chối PATCH identity/đổi Class hoặc source version để dời buổi; actual được đổi chỉ qua Phase 3 đã duyệt; không hard-delete Session |
| FKs/NULL | Version thuộc ca khác, ca thuộc Class khác bị reject; cuối contract NULL bị reject; generated week không thể được client gán tùy ý |
| Legacy mapping | NULL ScheduleId, actual unique nhưng provenance không rõ, ambiguous candidates, cùng ca/tuần có hai Session có Attendance; không tự đoán/gộp/xóa, gate contract dừng |
| Migration safety | Expand/backfill/contract trên MySQL test độc lập; SessionId và Attendance FK/hash giữ nguyên; cột cũ chỉ drop sau cập nhật readers; rollback plan không giả mất version history |
| Conflict validation | Destination Class/Teacher/TA/Room overlap vẫn reject; adjacent slots hợp lệ; occurrence khác bị dời vào cùng actual slot; cancelled không giữ resource nhưng giữ occurrence |
| Preview/UI | Version/timeline đổi invalidates token; existing ở ngoài actual month vẫn xuất hiện; cảnh báo future sessions giữ lịch cũ; không auto-confirm hoặc auto-apply request |
| Regression | Calendar/List actual date, enrollment scoping, Student/TA read-only, Attendance identities, Class/Student/Tuition policies, Auth fail closed |

Đây là **test plan**, chưa chạy các tests mới hoặc kiểm thử SQL/EF proposal trong
lượt tài liệu này. Không dùng kết quả 90 assertions cũ như bằng chứng schema mới đã đạt.

## 8. File production dự kiến phải sửa sau khi được duyệt

Các đường dẫn dưới tính từ `Capstone2/`; là kế hoạch, chưa sửa file nào.

| File / phạm vi | Thay đổi dự kiến |
|---|---|
| backend/Models/Entities/ClassSchedule.cs | Root ổn định + Versions; bỏ definition fields ở contract |
| backend/Models/Entities/ClassScheduleVersion.cs (mới) | Entity version/effective dates |
| backend/Models/Entities/ClassSession.cs | Source version, planned date, computed week, identity bất biến |
| backend/Models/EF/EduTrackDbContext.cs | DbSet, composite FKs, generated column, constraints/indexes |
| backend/Migrations/… (chỉ sinh sau duyệt), EduTrackDbContextModelSnapshot.cs | Expand và contract, không sửa migration cũ |
| backend/Models/DTOs/Schedule/ScheduleManagementDto.cs | Timeline/effective dates, stable key, source vs proposed vs actual, impacted sessions |
| backend/Services/Schedule/ScheduleManagementPolicy.cs | Effective ranges, stable week identity và boundary rules |
| backend/Services/Schedule/ScheduleManagementService.cs | Version append/retire, occurrence lookup, future-session preview, confirm |
| backend/Services/Schedule/ScheduleWriteTransaction.cs | Chung protocol root/session locks cho version/generate/Phase 3 |
| backend/Controllers/Schedule/ScheduleManagementController.cs | Contract version/retire, lỗi stale/1062 có kiểm tra |
| backend/Models/DTOs/Schedule/ScheduleReadDto.cs; Services/Schedule/ScheduleReadService.cs | Bổ sung provenance cho detail khi cần; vẫn query/render actual |
| frontend/src/BLL/models/ScheduleManagement.ts; api/scheduleManagementApi.ts | DTO/version/effective-date/occurrence validation |
| frontend/src/GUIs/components/shared/schedule/ScheduleManagement.tsx | Chọn tuần hiệu lực, xem timeline và cảnh báo Session đã generate; không viết lại chức năng cũ |
| frontend/src/BLL/models/ScheduleSession.ts; GUIs/components/shared/schedule/ScheduleSessionDetail.tsx | Hiển thị planned/actual/source version khi cần; Calendar/List engine giữ nguyên |

Consumers cột template cũ cần chuyển đọc version theo ngày thích hợp trước khi drop
cột, phối hợp owner; không chỉ cập nhật service mới rồi bỏ mặc endpoint cũ:

- `backend/Services/Implementation/ClassScheduleService.cs`,
  `backend/Repositories/Implementation/ClassScheduleRepository.cs`,
  `backend/Models/DTOs/ClassScheduleDto.cs`: query có as-of/effective-date rõ ràng;
  `Controllers/Queries/ClassSchedulesController.cs` và interface nếu thêm tham số.
- `backend/Services/Teaching/Implementation/TeachingScheduleService.cs`,
  `TeachingMyClassService.cs`, `TeachingDashboardService.cs`;
  `backend/Services/Learning/Implementation/LearnerDashboardService.cs`: đổi cách đọc
  ClassSchedules definition, không đổi business rules khác của đồng đội.
- `backend/Services/Implementation/LandingPortalService.cs`: số ca đang áp dụng cần
  xét version theo ngày; không đếm cả root đã retire như một lịch đang hoạt động.
- `backend/Models/EF/DbSeeder.cs`: owner cập nhật fixtures theo schema sau cutover,
  không seed production hoặc tạo default Session thiếu occurrence metadata.
- Attendance GET writer và mọi Session writer phải được owner bỏ/chuyển protocol
  trước cutover. **Không tự sửa Attendance/Auth/Approval** trong lượt thiết kế này.

Phase 3 sẽ cần request detail/service/controller và payload được owner duyệt riêng;
không đưa thay đổi Approval vào migration Phase 2. Tests dự kiến mở rộng
`backend.Tests/ScheduleManagement/Program.cs`, `backend.Tests/ScheduleRead/Program.cs`,
`frontend/tests/scheduleManagement.test.mjs`, `scheduleManagement.http.browser.mjs`
và test host Phase 3 riêng; không chạy production host cho kiểm thử identity.

## 9. Các quyết định đề nghị phê duyệt

1. Một ca ổn định mỗi tuần: giữ ScheduleId, thêm bảng Version, effective ranges đầu
   tuần `[from, to)`; không đổi template bằng cách tạo ca mới.
2. Giữ nguyên SessionId; source version và planned date bất biến; unique theo ca +
   tuần planned, áp dụng cả buổi dời/hủy. Actual date/time là booking riêng.
3. Các buổi tương lai đã generate được giữ nguyên và hiển thị cảnh báo; muốn thay
   chúng phải qua Phase 3, không áp lại template ngầm.
4. Cutover chỉ khi legacy mapping có bằng chứng và không còn NULL/logical duplicates;
   thiếu bằng chứng thì dừng migration, không giả lập kế hoạch gốc hoặc đổi Attendance.

Thiết kế này thay thế đề xuất unique actual-slot và IsActive chung trong báo cáo
Phase 2 trước: actual-slot unique không nhận diện được occurrence sau reschedule;
effective ranges trên Version đã đủ cho retire. Implementation Phase 2 và báo cáo
nghiệm thu trước không bị thay đổi ở lượt này. Dừng để người dùng phê duyệt schema.

Kiểm tra phạm vi lượt thiết kế: SHA-256 của cả 1.026 file có sẵn trước lượt này
không đổi; chỉ có tài liệu mới này. HEAD/index giữ nguyên; diff check và kiểm tra
whitespace của tài liệu đạt. Năm ví dụ mốc tuần/ngày qua năm đã được kiểm tra bằng
phép tính ngày thuần, không truy cập database. Chưa compile/chạy SQL hoặc EF sketch.
