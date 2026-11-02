import { Link } from "react-router-dom";
import type { ClassScheduleDto } from "../../../../../BLL/models/ClassScheduleDto";
import type { TeachingScheduleItemDto } from "../../../../../BLL/models/TeachingScheduleDto";

export interface ScheduleTableProps {
  schedules?: (ClassScheduleDto | TeachingScheduleItemDto)[];
}

export default function ScheduleTable({ schedules = [] }: ScheduleTableProps) {
  return (
    <div className="table-responsive-container">
      <table className="table custom-table align-middle" id="scheduleTable">
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
            <th>Class <i className="bi bi-arrow-down-up table-sort-icon" /></th>
            <th>Subject <i className="bi bi-arrow-down-up table-sort-icon" /></th>
            <th>Location <i className="bi bi-arrow-down-up table-sort-icon" /></th>
            <th>Day / Date <i className="bi bi-arrow-down-up table-sort-icon" /></th>
            <th>Start Time <i className="bi bi-arrow-down-up table-sort-icon" /></th>
            <th>End Time <i className="bi bi-arrow-down-up table-sort-icon" /></th>
            <th>Students <i className="bi bi-arrow-down-up table-sort-icon" /></th>
            <th>Teacher <i className="bi bi-arrow-down-up table-sort-icon" /></th>
            <th>Status <i className="bi bi-arrow-down-up table-sort-icon" /></th>
            <th>Action</th>
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
              const teacherName = item.teacherName || item.partnerName || "ThS. Hoàng Quốc Việt";
              const studentCount = item.studentCount ?? 25;
              const statusText = item.status || "Active";
              const teacherInitials = teacherName
                .split(" ")
                .map((w: string) => w[0])
                .join("")
                .toUpperCase()
                .slice(-2) || "GV";

              return (
                <tr key={s.scheduleId || idx}>
                  <td>
                    <div className="form-check m-0">
                      <input className="form-check-input row-checkbox" type="checkbox" />
                    </div>
                  </td>
                  <td>
                    <Link to={`/teaching-assistant/classes/${s.classId}`} className="class-id-link fw-bold">
                      {s.className}
                    </Link>
                  </td>
                  <td>{subject}</td>
                  <td>{s.room || "Room 101"}</td>
                  <td>{s.dayOfWeek ? `Every ${s.dayOfWeek}` : "16 Aug 2026"}</td>
                  <td>{s.startTime ? s.startTime.substring(0, 5) : "08:00 AM"}</td>
                  <td>{s.endTime ? s.endTime.substring(0, 5) : "09:45 AM"}</td>
                  <td>{studentCount}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center"
                        style={{ width: "28px", height: "28px", fontSize: "11px" }}
                      >
                        {teacherInitials}
                      </div>
                      <span>{teacherName}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge-status badge-status-active">{statusText}</span>
                  </td>
                  <td>
                    <Link
                      to={`/teaching-assistant/classes/${s.classId}`}
                      className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                    >
                      <i className="bi bi-eye" /> View
                    </Link>
                  </td>
                </tr>
              );
            })
          ) : (
            <>
              {/* Fallback Schedule 1 */}
              <tr>
                <td>
                  <div className="form-check m-0">
                    <input className="form-check-input row-checkbox" type="checkbox" />
                  </div>
                </td>
                <td>
                  <Link to="/teaching-assistant/classes/1" className="class-id-link fw-bold">
                    Class 9 - Advanced Mathematics
                  </Link>
                </td>
                <td>Mathematics</td>
                <td>Room 201</td>
                <td>Every Monday</td>
                <td>18:00</td>
                <td>20:00</td>
                <td>30</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center"
                      style={{ width: "28px", height: "28px", fontSize: "11px" }}
                    >
                      TC
                    </div>
                    <span>ThS. Hoàng Quốc Việt</span>
                  </div>
                </td>
                <td>
                  <span className="badge-status badge-status-active">Active</span>
                </td>
                <td>
                  <Link
                    to="/teaching-assistant/classes/1"
                    className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                  >
                    <i className="bi bi-eye" /> View
                  </Link>
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
