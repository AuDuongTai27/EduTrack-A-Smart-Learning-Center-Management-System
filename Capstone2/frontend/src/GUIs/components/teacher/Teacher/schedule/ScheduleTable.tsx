import { Link } from "react-router-dom";
import type { ClassScheduleDto } from "../../../../../BLL/models/ClassScheduleDto";
import type { TeachingScheduleItemDto } from "../../../../../BLL/models/teaching/TeachingScheduleDto";

export interface ScheduleTableProps {
  schedules?: (ClassScheduleDto | TeachingScheduleItemDto)[];
}

export default function ScheduleTable({ schedules = [] }: ScheduleTableProps) {
  return (
    <div className="table-responsive-container">
      <table className="table custom-table align-middle mb-0" id="scheduleTable">
        <thead>
          <tr>
            <th className="th-checkbox">
              <div className="form-check m-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="selectAllSchedule"
                />
              </div>
            </th>
            <th>Lớp Học <i className="bi bi-arrow-down-up table-sort-icon" /></th>
            <th>Môn Học <i className="bi bi-arrow-down-up table-sort-icon" /></th>
            <th>Phòng Học <i className="bi bi-arrow-down-up table-sort-icon" /></th>
            <th>Thứ / Ngày <i className="bi bi-arrow-down-up table-sort-icon" /></th>
            <th>Giờ Bắt Đầu <i className="bi bi-arrow-down-up table-sort-icon" /></th>
            <th>Giờ Kết Thúc <i className="bi bi-arrow-down-up table-sort-icon" /></th>
            <th>Sĩ Số <i className="bi bi-arrow-down-up table-sort-icon" /></th>
            <th>Trợ Giảng (TA) <i className="bi bi-arrow-down-up table-sort-icon" /></th>
            <th>Trạng Thái <i className="bi bi-arrow-down-up table-sort-icon" /></th>
            <th>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {schedules.length > 0 ? (
            schedules.map((s, idx) => {
              const item = s as any;
              const subject = item.subjectName || (s.className?.toLowerCase().includes("physics")
                ? "Physics"
                : s.className?.toLowerCase().includes("math")
                ? "Mathematics"
                : "Môn học");
              const taName = item.taName || item.partnerName || "Âu Dương Tài";
              const studentCount = item.studentCount ?? 30;
              const statusText = item.status || "Active";
              const taInitials = taName
                .split(" ")
                .map((w: string) => w[0])
                .join("")
                .toUpperCase()
                .slice(-2) || "TA";

              return (
                <tr key={s.scheduleId || idx}>
                  <td>
                    <div className="form-check m-0">
                      <input className="form-check-input row-checkbox" type="checkbox" />
                    </div>
                  </td>
                  <td>
                    <Link to={`/teacher/classes/${s.classId}`} className="class-id-link fw-bold text-dark text-decoration-none">
                      {s.className}
                    </Link>
                  </td>
                  <td>
                    <span className="badge bg-primary bg-opacity-10 text-primary px-2.5 py-1 rounded-pill">
                      {subject}
                    </span>
                  </td>
                  <td>
                    <span className="text-secondary small">
                      <i className="bi bi-geo-alt me-1 text-muted" />
                      {s.room || "Room 101"}
                    </span>
                  </td>
                  <td>
                    <span className="fw-medium text-dark">
                      {s.dayOfWeek ? `Mỗi ${s.dayOfWeek}` : "Thứ Hai"}
                    </span>
                  </td>
                  <td>{s.startTime ? s.startTime.substring(0, 5) : "18:00"}</td>
                  <td>{s.endTime ? s.endTime.substring(0, 5) : "20:00"}</td>
                  <td>
                    <span className="badge bg-light text-dark border px-2 py-1">
                      {studentCount} học viên
                    </span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span className="ta-avatar-initials bg-warning text-dark">
                        {taInitials}
                      </span>
                      <span className="small">{taName}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge-status badge-status-active">
                      {statusText}
                    </span>
                  </td>
                  <td>
                    <Link
                      to={`/teacher/classes/${s.classId}`}
                      className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                    >
                      <i className="bi bi-eye" /> Vào lớp
                    </Link>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={11} className="text-center py-4 text-muted">
                <i className="bi bi-calendar-x fs-3 d-block mb-1 text-secondary" />
                Không tìm thấy ca dạy nào phù hợp với bộ lọc tìm kiếm.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
