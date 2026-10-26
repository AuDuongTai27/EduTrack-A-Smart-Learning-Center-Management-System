import type { UserDto } from "../../../../../BLL/models/UserDto";
import type { AttendanceDto } from "../../../../../BLL/models/ProgressDto";

export interface ProgressTableProps {
  students?: UserDto[];
  attendances?: AttendanceDto[];
  latestAssignmentTitle?: string;
}

export default function ProgressTable({
  students = [],
  attendances = [],
  latestAssignmentTitle = "Homework 01: Quadratic Equations",
}: ProgressTableProps) {
  const getInitials = (name?: string) => {
    if (!name) return "ST";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarClass = (idx: number) => {
    const classes = [
      "avatar-initials-indigo",
      "avatar-initials-emerald",
      "avatar-initials-amber",
      "avatar-initials-rose",
    ];
    return classes[idx % classes.length];
  };

  return (
    <>
      {/* Toolbar */}
      <div className="table-toolbar">
        <div className="table-entries-select">
          <span>Row Per Page</span>
          <select className="form-select form-select-sm" id="entriesSelect" defaultValue="10">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <span>Entries</span>
        </div>
        <div>
          <input
            type="search"
            className="table-search-input"
            id="tableSearchInput"
            placeholder="Search student..."
          />
        </div>
      </div>

      {/* Student List Table */}
      <div className="table-responsive-container">
        <table className="table custom-table align-middle" id="progressTable">
          <thead>
            <tr>
              <th className="th-checkbox">
                <div className="form-check m-0">
                  <input className="form-check-input" type="checkbox" id="selectAllStudents" />
                </div>
              </th>
              <th>Student Name <i className="bi bi-arrow-down-up table-sort-icon" /></th>
              <th>Attendance (Days Present / Total) <i className="bi bi-arrow-down-up table-sort-icon" /></th>
              <th>Latest Assignment <i className="bi bi-arrow-down-up table-sort-icon" /></th>
              <th>Latest Assignment Status <i className="bi bi-arrow-down-up table-sort-icon" /></th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map((stu, idx) => {
                // Compute attendance rate for this student
                const studentAtts = attendances.filter((a) => a.studentId === stu.userId);
                const totalDays = studentAtts.length > 0 ? studentAtts.length : 20;
                const presentDays = studentAtts.length > 0
                  ? studentAtts.filter((a) => a.status === "present").length
                  : 18 + (idx % 3);
                const pct = Math.round((presentDays / totalDays) * 100);

                const statusBadges = [
                  { label: "Submitted", cls: "badge-status-active", icon: "bi-check-circle-fill" },
                  { label: "Late", cls: "bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 rounded-2 fw-semibold", icon: "bi-exclamation-triangle-fill" },
                  { label: "Submitted", cls: "badge-status-active", icon: "bi-check-circle-fill" },
                ];
                const badge = statusBadges[idx % statusBadges.length];

                return (
                  <tr key={stu.userId || idx}>
                    <td>
                      <div className="form-check m-0">
                        <input className="form-check-input row-checkbox" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className={`ta-avatar-initials avatar-initials-sm ${getAvatarClass(idx)}`}>
                          {getInitials(stu.fullName)}
                        </div>
                        <div>
                          <span className="fw-semibold d-block text-dark">{stu.fullName}</span>
                          <small className="text-muted">{stu.userCode || `#STU-100${idx + 1}`}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold text-dark">{presentDays}/{totalDays} Days</span>
                        <span className={`badge ${pct >= 90 ? "bg-success-subtle text-success border border-success-subtle" : "bg-primary-subtle text-primary border border-primary-subtle"}`}>
                          {pct}%
                        </span>
                      </div>
                    </td>
                    <td><span className="fw-medium text-dark">{latestAssignmentTitle}</span></td>
                    <td>
                      <span className={badge.cls}>
                        <i className={`bi ${badge.icon} me-1`} />{badge.label}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
                        <i className="bi bi-eye" /> View
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              /* Fallback Student 1 */
              <tr>
                <td>
                  <div className="form-check m-0">
                    <input className="form-check-input row-checkbox" type="checkbox" />
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div className="ta-avatar-initials avatar-initials-sm avatar-initials-indigo">LA</div>
                    <div>
                      <span className="fw-semibold d-block text-dark">[FE-Mock] Lê Văn An</span>
                      <small className="text-muted">#STU001</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-dark">19/20 Days</span>
                    <span className="badge bg-success-subtle text-success border border-success-subtle">95%</span>
                  </div>
                </td>
                <td><span className="fw-medium text-dark">Homework 01: Quadratic Equations</span></td>
                <td>
                  <span className="badge-status badge-status-active">
                    <i className="bi bi-check-circle-fill me-1" />Submitted
                  </span>
                </td>
                <td>
                  <button type="button" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
                    <i className="bi bi-eye" /> View
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
