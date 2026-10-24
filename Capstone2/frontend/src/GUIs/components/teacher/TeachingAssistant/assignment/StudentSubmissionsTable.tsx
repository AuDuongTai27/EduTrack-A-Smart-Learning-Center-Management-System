import type { SubmissionDto } from "../../../../../BLL/models/SubmissionDto";

export interface StudentSubmissionsTableProps {
  submissions?: SubmissionDto[];
}

function StudentSubmissionsTable({ submissions = [] }: StudentSubmissionsTableProps) {
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
    <div className="card class-list-card border-0 mb-4">
      {/* Card Header */}
      <div className="class-list-header d-flex align-items-center justify-content-between flex-wrap gap-3">
        <h4 className="class-list-title">Student Submissions ({submissions.length > 0 ? submissions.length : 3})</h4>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="dropdown">
            <button
              type="button"
              className="btn-header-action"
              id="filterDropdownBtn"
              data-bs-toggle="dropdown"
              data-bs-auto-close="outside"
              aria-expanded="false"
            >
              <i className="bi bi-funnel" />
              Filter
              <i className="bi bi-chevron-down ms-1" />
            </button>
          </div>
          <div className="dropdown">
            <button
              type="button"
              className="btn-header-action"
              id="sortDropdownBtn"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-arrow-down-up" />
              <span id="sortLabel">Sort by A-Z</span>
              <i className="bi bi-chevron-down ms-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="table-responsive-container">
        <table className="table custom-table align-middle" id="submissionsTable">
          <thead>
            <tr>
              <th className="th-checkbox">
                <div className="form-check m-0">
                  <input className="form-check-input" type="checkbox" id="selectAllSubmissions" />
                </div>
              </th>
              <th>Avatar</th>
              <th>Student Name</th>
              <th>Submitted At</th>
              <th>Submission File</th>
              <th>Grade (Out of 10)</th>
              <th>Status</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length > 0 ? (
              submissions.map((sub, idx) => {
                const isGraded = sub.score !== undefined && sub.score !== null;
                const submittedDate = sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : "Aug 10, 2026";
                const studentName = sub.studentName || `Học viên #${sub.studentId}`;

                return (
                  <tr key={sub.submissionId || idx}>
                    <td>
                      <div className="form-check m-0">
                        <input className="form-check-input row-checkbox" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <div className={`ta-avatar-initials avatar-initials-sm ${getAvatarClass(idx)}`}>
                        {getInitials(studentName)}
                      </div>
                    </td>
                    <td className="fw-semibold text-dark">{studentName}</td>
                    <td>
                      <span className="text-dark small">{submittedDate}</span>
                    </td>
                    <td>
                      <a
                        href={sub.fileUrl || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="badge bg-light text-primary border text-decoration-none py-1.5 px-2"
                      >
                        <i className="bi bi-file-earmark-pdf me-1 text-danger" />
                        {sub.fileUrl ? sub.fileUrl.split("/").pop() || "submission_file.pdf" : "submission_file.pdf"}
                      </a>
                    </td>
                    <td>
                      {isGraded ? (
                        <div className="d-flex align-items-center gap-1">
                          <span className="fw-bold text-dark">{sub.score}</span>
                          <span className="text-muted small">/ 10</span>
                        </div>
                      ) : (
                        <span className="text-muted small">Chưa chấm</span>
                      )}
                    </td>
                    <td>
                      {isGraded ? (
                        <span className="badge bg-success-subtle text-success fw-medium px-2.5 py-1">Graded</span>
                      ) : (
                        <span className="badge bg-warning-subtle text-warning-emphasis fw-medium px-2.5 py-1">Submitted</span>
                      )}
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                      >
                        <i className="bi bi-pencil-square" /> Evaluate
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <>
                {/* Fallback Submission 1 */}
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
                    <span className="text-dark small">Aug 10, 2026</span>
                  </td>
                  <td>
                    <span className="badge bg-light text-primary border py-1.5 px-2">
                      <i className="bi bi-file-earmark-pdf me-1 text-danger" /> [FE-Mock] kinematics_solution.pdf
                    </span>
                  </td>
                  <td>
                    <span className="fw-bold text-dark">9.0</span> <span className="text-muted small">/ 10</span>
                  </td>
                  <td>
                    <span className="badge bg-success-subtle text-success fw-medium px-2.5 py-1">Graded</span>
                  </td>
                  <td className="text-end">
                    <button type="button" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
                      <i className="bi bi-pencil-square" /> Evaluate
                    </button>
                  </td>
                </tr>
                {/* Fallback Submission 2 */}
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
                    <span className="text-dark small">Aug 11, 2026</span>
                  </td>
                  <td>
                    <span className="badge bg-light text-primary border py-1.5 px-2">
                      <i className="bi bi-file-earmark-pdf me-1 text-danger" /> [FE-Mock] lab_report_janesmith.pdf
                    </span>
                  </td>
                  <td>
                    <span className="text-muted small">Chưa chấm</span>
                  </td>
                  <td>
                    <span className="badge bg-warning-subtle text-warning-emphasis fw-medium px-2.5 py-1">Submitted</span>
                  </td>
                  <td className="text-end">
                    <button type="button" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
                      <i className="bi bi-pencil-square" /> Evaluate
                    </button>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentSubmissionsTable;
