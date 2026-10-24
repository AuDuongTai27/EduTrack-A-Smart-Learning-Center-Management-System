import { Link } from "react-router-dom";
import type { ClassScheduleDto } from "../../../../../BLL/models/ClassScheduleDto";

export interface ScheduleTableProps {
  schedules?: ClassScheduleDto[];
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
            <th>Teaching Assistant <i className="bi bi-arrow-down-up table-sort-icon" /></th>
            <th>Status <i className="bi bi-arrow-down-up table-sort-icon" /></th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {schedules.length > 0 ? (
            schedules.map((s, idx) => {
              const subject = s.className?.toLowerCase().includes("physics")
                ? "Physics"
                : s.className?.toLowerCase().includes("math")
                ? "Mathematics"
                : "Môn học";
              const taName = "Âu Dương Tài";

              return (
                <tr key={s.scheduleId || idx}>
                  <td>
                    <div className="form-check m-0">
                      <input className="form-check-input row-checkbox" type="checkbox" />
                    </div>
                  </td>
                  <td>
                    <Link to={`/teacher/classes/${s.classId}`} className="class-id-link fw-bold">
                      {s.className}
                    </Link>
                  </td>
                  <td>{subject}</td>
                  <td>{s.room || "Room 101"}</td>
                  <td>{s.dayOfWeek ? `Every ${s.dayOfWeek}` : "16 Aug 2026"}</td>
                  <td>{s.startTime ? s.startTime.substring(0, 5) : "08:00 AM"}</td>
                  <td>{s.endTime ? s.endTime.substring(0, 5) : "09:30 AM"}</td>
                  <td>30</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span className="ta-avatar-initials bg-warning text-dark">
                        AT
                      </span>
                      <span>{taName}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge-status badge-status-active">
                      Active
                    </span>
                  </td>
                  <td>
                    <Link
                      to={`/teacher/classes/${s.classId}`}
                      className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                    >
                      <i className="bi bi-eye" /> View
                    </Link>
                  </td>
                </tr>
              );
            })
          ) : (
            /* Fallback Mock Rows */
            <>
              <tr>
                <td>
                  <div className="form-check m-0">
                    <input className="form-check-input row-checkbox" type="checkbox" />
                  </div>
                </td>
                <td><Link to="/teacher/classes/1" className="class-id-link">Class 9 - Advanced Mathematics</Link></td>
                <td>Mathematics</td>
                <td>Room 201</td>
                <td>Every Monday</td>
                <td>08:00 AM</td>
                <td>09:30 AM</td>
                <td>30</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <span className="ta-avatar-initials bg-warning text-dark">AT</span>
                    <span>Âu Dương Tài</span>
                  </div>
                </td>
                <td><span className="badge-status badge-status-active">Active</span></td>
                <td>
                  <Link to="/teacher/classes/1" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
                    <i className="bi bi-eye" /> View
                  </Link>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="form-check m-0">
                    <input className="form-check-input row-checkbox" type="checkbox" />
                  </div>
                </td>
                <td><Link to="/teacher/classes/2" className="class-id-link">Class 9 - Intensive Physics</Link></td>
                <td>Physics</td>
                <td>Room 202</td>
                <td>Every Wednesday</td>
                <td>10:00 AM</td>
                <td>11:30 AM</td>
                <td>30</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <span className="ta-avatar-initials bg-warning text-dark">AT</span>
                    <span>Âu Dương Tài</span>
                  </div>
                </td>
                <td><span className="badge-status badge-status-active">Active</span></td>
                <td>
                  <Link to="/teacher/classes/2" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
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
