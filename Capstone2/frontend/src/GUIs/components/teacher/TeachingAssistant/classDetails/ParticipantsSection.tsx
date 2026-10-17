export default function ParticipantsSection() {
  return (
    <details className="card class-list-card border-0 mb-4" open>
      <summary className="class-list-header d-flex align-items-center justify-content-between cursor-pointer py-3 px-4">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-people-fill text-primary fs-5" />
          <h4 className="class-list-title mb-0">Class Participants</h4>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small">Toggle Section</span>
          <i className="bi bi-chevron-down details-chevron text-muted" />
        </div>
      </summary>
      <div className="table-responsive-container">
        <table className="table custom-table align-middle mb-0">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Full Name</th>
              <th>Role</th>
              <th>Overall Grade (Out of 10)</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="ta-avatar-initials bg-primary text-white">
                  AM
                </div>
              </td>
              <td className="fw-semibold text-dark">Dr. Alex Morgan</td>
              <td>
                <span className="badge bg-primary-subtle text-primary fw-medium px-2.5 py-1">
                  Teacher
                </span>
              </td>
              <td className="text-muted">-</td>
              <td className="text-end">
                <span className="text-muted small">-</span>
              </td>
            </tr>
            <tr>
              <td>
                <div className="ta-avatar-initials bg-warning text-dark">
                  SJ
                </div>
              </td>
              <td className="fw-semibold text-dark">Sarah Jenkins</td>
              <td>
                <span className="badge bg-warning-subtle text-warning-emphasis fw-medium px-2.5 py-1">
                  Teaching Assistant
                </span>
              </td>
              <td className="text-muted">-</td>
              <td className="text-end">
                <span className="text-muted small">-</span>
              </td>
            </tr>
            <tr>
              <td>
                <div
                  className="ta-avatar-initials"
                  style={{ backgroundColor: "#e0e7ff", color: "#3730a3" }}
                >
                  JD
                </div>
              </td>
              <td className="fw-semibold text-dark">John Doe</td>
              <td>
                <span className="badge bg-info-subtle text-info-emphasis fw-medium px-2.5 py-1">
                  Student
                </span>
              </td>
              <td>
                <span className="fw-bold text-dark">8.5</span>{" "}
                <small className="text-muted">/ 10</small>
              </td>
              <td className="text-end">
                <span className="text-muted small">-</span>
              </td>
            </tr>
            <tr>
              <td>
                <div
                  className="ta-avatar-initials"
                  style={{ backgroundColor: "#dcfce7", color: "#166534" }}
                >
                  AS
                </div>
              </td>
              <td className="fw-semibold text-dark">Alice Smith</td>
              <td>
                <span className="badge bg-info-subtle text-info-emphasis fw-medium px-2.5 py-1">
                  Student
                </span>
              </td>
              <td>
                <span className="fw-bold text-dark">9.2</span>{" "}
                <small className="text-muted">/ 10</small>
              </td>
              <td className="text-end">
                <span className="text-muted small">-</span>
              </td>
            </tr>
            <tr>
              <td>
                <div
                  className="ta-avatar-initials"
                  style={{ backgroundColor: "#fef3c7", color: "#92400e" }}
                >
                  ER
                </div>
              </td>
              <td className="fw-semibold text-dark">Ethan Roberts</td>
              <td>
                <span className="badge bg-info-subtle text-info-emphasis fw-medium px-2.5 py-1">
                  Student
                </span>
              </td>
              <td>
                <span className="fw-bold text-dark">7.8</span>{" "}
                <small className="text-muted">/ 10</small>
              </td>
              <td className="text-end">
                <span className="text-muted small">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  );
}
