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
            <th>Teacher <i className="bi bi-arrow-down-up table-sort-icon" /></th>
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
              const teacherName = "ThS. Hoàng Quốc Việt";

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
                  <td>25</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center"
                        style={{ width: "28px", height: "28px", fontSize: "11px" }}
                      >
                        TC
                      </div>
                      <span>{teacherName}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge-status badge-status-active">Active</span>
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
                    [FE-Mock] Class I-A
                  </Link>
                </td>
                <td>Physics</td>
                <td>Room 101</td>
                <td>16 Aug 2026</td>
                <td>09:00 AM</td>
                <td>09:45 AM</td>
                <td>25</td>
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
                  <Link to="/teaching-assistant/classes/1" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
                    <i className="bi bi-eye" /> View
                  </Link>
                </td>
              </tr>
              {/* Fallback Schedule 2 */}
              <tr>
                <td>
                  <div className="form-check m-0">
                    <input className="form-check-input row-checkbox" type="checkbox" />
                  </div>
                </td>
                <td>
                  <Link to="/teaching-assistant/classes/2" className="class-id-link fw-bold">
                    [FE-Mock] Class II-B
                  </Link>
                </td>
                <td>Chemistry</td>
                <td>Lab 2</td>
                <td>17 Aug 2026</td>
                <td>10:00 AM</td>
                <td>10:45 AM</td>
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
                  <Link to="/teaching-assistant/classes/2" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
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
