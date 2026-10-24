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
                  <input className="form-check-input" type="checkbox" id="selectAllProgress" />
                </div>
              </th>
              <th>Avatar</th>
              <th>Student Name <i className="bi bi-arrow-down-up table-sort-icon" /></th>
              <th>Student ID <i className="bi bi-arrow-down-up table-sort-icon" /></th>
              <th>Attendance Status</th>
              <th>Latest Assignment Status</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map((stu, idx) => {
                const attRecord = attendances.find((a) => a.studentId === stu.userId);
                const attStatus = attRecord?.status?.toLowerCase() || (idx % 3 === 0 ? "late" : "present");

                return (
                  <tr key={stu.userId || idx}>
                    <td>
                      <div className="form-check m-0">
                        <input className="form-check-input row-checkbox" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <div className={`ta-avatar-initials avatar-initials-sm ${getAvatarClass(idx)}`}>
                        {getInitials(stu.fullName)}
                      </div>
                    </td>
                    <td className="fw-semibold text-dark">{stu.fullName}</td>
                    <td>
                      <span className="text-muted small">#{stu.userCode || `STU${stu.userId}`}</span>
                    </td>
                    <td>
                      {attStatus === "present" ? (
                        <span className="badge-status badge-status-active">Present (100%)</span>
                      ) : attStatus === "late" ? (
                        <span className="badge-status badge-status-pending">Late (90%)</span>
                      ) : (
                        <span className="badge-status badge-status-inactive">Absent</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-success-subtle text-success fw-medium px-2 py-1">Submitted</span>
                        <small className="text-muted d-none d-md-inline">({latestAssignmentTitle})</small>
                      </div>
                    </td>
                    <td className="text-end">
                      <button type="button" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
                        <i className="bi bi-eye" /> View
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <>
                {/* Fallback Student 1 */}
                <tr>
                  <td>
                    <div className="form-check m-0">
                      <input className="form-check-input row-checkbox" type="checkbox" />
                    </div>
                  </td>
                  <td>
                    <div className="ta-avatar-initials avatar-initials-sm avatar-initials-indigo">JD</div>
                  </td>
                  <td className="fw-semibold text-dark">[FE-Mock] John Doe</td>
                  <td>
                    <span className="text-muted small">#STU001</span>
                  </td>
                  <td>
                    <span className="badge-status badge-status-active">Present (100%)</span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-success-subtle text-success fw-medium px-2 py-1">Submitted</span>
                      <small className="text-muted d-none d-md-inline">(Homework 01: Quadratic Equations)</small>
                    </div>
                  </td>
                  <td className="text-end">
                    <button type="button" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
                      <i className="bi bi-eye" /> View
                    </button>
                  </td>
                </tr>
                {/* Fallback Student 2 */}
                <tr>
                  <td>
                    <div className="form-check m-0">
                      <input className="form-check-input row-checkbox" type="checkbox" />
                    </div>
                  </td>
                  <td>
                    <div className="ta-avatar-initials avatar-initials-sm avatar-initials-emerald">JS</div>
                  </td>
                  <td className="fw-semibold text-dark">[FE-Mock] Jane Smith</td>
                  <td>
                    <span className="text-muted small">#STU002</span>
                  </td>
                  <td>
                    <span className="badge-status badge-status-pending">Late (85%)</span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-warning-subtle text-warning fw-medium px-2 py-1">Pending</span>
                      <small className="text-muted d-none d-md-inline">(Homework 01: Quadratic Equations)</small>
                    </div>
                  </td>
                  <td className="text-end">
                    <button type="button" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
                      <i className="bi bi-eye" /> View
                    </button>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
