import React from "react";
import { Link } from "react-router-dom";
import type { ClassScheduleDto } from "../../../../../BLL/models/ClassScheduleDto";
import type { TeachingScheduleItemDto } from "../../../../../BLL/models/teaching/TeachingScheduleDto";

export type SortField = "className" | "dayOfWeek" | "time" | "studentCount";
export type SortOrder = "asc" | "desc";

export interface ScheduleTableProps {
  schedules?: (ClassScheduleDto | TeachingScheduleItemDto)[];
  sortField?: SortField;
  sortOrder?: SortOrder;
  onSort?: (field: SortField) => void;
}

export default function ScheduleTable({
  schedules = [],
  sortField,
  sortOrder,
  onSort,
}: ScheduleTableProps) {
  const renderSortIcon = (field: SortField) => {
    let iconClass = "bi bi-arrow-down-up text-muted";
    if (sortField === field) {
      iconClass = sortOrder === "asc" ? "bi bi-arrow-up text-primary" : "bi bi-arrow-down text-primary";
    }
    return (
      <span
        role="button"
        className="ms-1 cursor-pointer select-none"
        onClick={() => onSort && onSort(field)}
        title="Sắp xếp"
      >
        <i className={`${iconClass} table-sort-icon`} />
      </span>
    );
  };

  return (
    <div className="table-responsive-container">
      <table className="table custom-table align-middle mb-0" id="scheduleTable">
        <thead>
          <tr>
            <th>
              Lớp Học {renderSortIcon("className")}
            </th>
            <th>Môn Học</th>
            <th>Phòng Học</th>
            <th>
              Thứ / Ngày {renderSortIcon("dayOfWeek")}
            </th>
            <th>
              Thời Gian {renderSortIcon("time")}
            </th>
            <th>
              Sĩ Số {renderSortIcon("studentCount")}
            </th>
            <th>Trợ Giảng (TA)</th>
            <th>Trạng Thái</th>
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

              const startTimeFormatted = s.startTime ? s.startTime.substring(0, 5) : "18:00";
              const endTimeFormatted = s.endTime ? s.endTime.substring(0, 5) : "20:00";

              return (
                <tr key={s.scheduleId || idx}>
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
                  <td>
                    <span className="fw-medium text-dark">
                      {startTimeFormatted} - {endTimeFormatted}
                    </span>
                  </td>
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
              <td colSpan={9} className="text-center py-4 text-muted">
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
