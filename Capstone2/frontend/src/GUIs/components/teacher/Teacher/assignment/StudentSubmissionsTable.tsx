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
      {/* Table toolbar */}
      <div className="table-toolbar">
        <div className="table-entries-select">
          <span>Row Per Page</span>
          <select className="form-select form-select-sm" id="entriesSelect" defaultValue={10}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>Entries</span>
        </div>
        <div>
          <input type="search" className="table-search-input" id="tableSearchInput" placeholder="Search student or file..." />
        </div>
      </div>
      {/* Table Container */}
      <div className="table-responsive-container">
        <table className="table custom-table align-middle" id="assignmentTable">
          <thead>
            <tr>
              <th className="th-checkbox">
                <div className="form-check m-0">
                  <input className="form-check-input" type="checkbox" id="selectAll" />
                </div>
              </th>
              <th>Avatar</th>
              <th>Student Name</th>
              <th>Submission</th>
              <th>Submission Date</th>
              <th>Grade</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length > 0 ? (
              submissions.map((sub, idx) => {
                const fileName = sub.fileUrl ? sub.fileUrl.split("/").pop() : `submission_${sub.studentCode || idx + 1}.pdf`;
                const dateStr = sub.submittedAt
                  ? new Date(sub.submittedAt).toLocaleString()
                  : "10 Aug 2026, 03:45 PM";

                return (
                  <tr key={sub.submissionId || idx}>
                    <td>
                      <div className="form-check m-0">
                        <input className="form-check-input row-checkbox" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <div className={`ta-avatar-initials avatar-initials-sm ${getAvatarClass(idx)}`}>
                        {getInitials(sub.studentName)}
                      </div>
                    </td>
                    <td className="fw-semibold text-dark">
                      {sub.studentName}
                      {sub.studentCode && (
                        <small className="text-muted d-block fw-normal">{sub.studentCode}</small>
                      )}
                    </td>
                    <td>
                      <a
                        href={sub.fileUrl || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="text-decoration-none fw-medium text-dark d-inline-flex align-items-center gap-1"
                      >
                        <i className="bi bi-file-earmark-pdf-fill text-danger fs-6" />
                        {fileName}
                      </a>
                    </td>
                    <td>
                      <span className="text-dark fw-medium">{dateStr}</span>
                    </td>
                    <td>
                      {sub.score !== null && sub.score !== undefined ? (
                        <>
                          <span className="fw-bold text-dark">{sub.score}</span>{" "}
                          <small className="text-muted">/ 10</small>
                        </>
                      ) : (
                        <span className="text-muted fw-semibold">-</span>
                      )}
                    </td>
                    <td className="text-end">
                      <button type="button" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
                        <i className="bi bi-eye" /> View Submission
                      </button>
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
                  <td>
                    <div className="ta-avatar-initials avatar-initials-sm avatar-initials-indigo">LA</div>
                  </td>
                  <td className="fw-semibold text-dark">[FE-Mock] Lê Văn An</td>
                  <td>
                    <a href="#" className="text-decoration-none fw-medium text-dark d-inline-flex align-items-center gap-1">
                      <i className="bi bi-file-earmark-pdf-fill text-danger fs-6" />
                      an_le_hw01.pdf
                    </a>
                  </td>
                  <td>
                    <span className="text-dark fw-medium">10 Aug 2026, 03:45 PM</span>
                    <small className="text-muted ms-1">(2 hours ago)</small>
                  </td>
                  <td>
                    <span className="fw-bold text-dark">9.5</span>{" "}
                    <small className="text-muted">/ 10</small>
                  </td>
                  <td className="text-end">
                    <button type="button" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
                      <i className="bi bi-eye" /> View Submission
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="form-check m-0">
                      <input className="form-check-input row-checkbox" type="checkbox" />
                    </div>
                  </td>
                  <td>
                    <div className="ta-avatar-initials avatar-initials-sm avatar-initials-emerald">PB</div>
                  </td>
                  <td className="fw-semibold text-dark">[FE-Mock] Phạm Thị Bích</td>
                  <td>
                    <a href="#" className="text-decoration-none fw-medium text-dark d-inline-flex align-items-center gap-1">
                      <i className="bi bi-file-earmark-pdf-fill text-danger fs-6" />
                      bich_pham_hw01.pdf
                    </a>
                  </td>
                  <td>
                    <span className="text-dark fw-medium">11 Aug 2026, 09:15 AM</span>
                    <small className="text-muted ms-1">(5 hours ago)</small>
                  </td>
                  <td>
                    <span className="fw-bold text-dark">8.0</span>{" "}
                    <small className="text-muted">/ 10</small>
                  </td>
                  <td className="text-end">
                    <button type="button" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
                      <i className="bi bi-eye" /> View Submission
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="form-check m-0">
                      <input className="form-check-input row-checkbox" type="checkbox" />
                    </div>
                  </td>
                  <td>
                    <div className="ta-avatar-initials avatar-initials-sm avatar-initials-amber">DC</div>
                  </td>
                  <td className="fw-semibold text-dark">[FE-Mock] Đặng Minh Cường</td>
                  <td>
                    <a href="#" className="text-decoration-none fw-medium text-dark d-inline-flex align-items-center gap-1">
                      <i className="bi bi-file-earmark-pdf-fill text-danger fs-6" />
                      cuong_dang_hw01.pdf
                    </a>
                  </td>
                  <td>
                    <span className="text-dark fw-medium">11 Aug 2026, 11:20 AM</span>
                    <small className="text-muted ms-1">(1 day ago)</small>
                  </td>
                  <td>
                    <span className="text-muted fw-semibold">-</span>
                  </td>
                  <td className="text-end">
                    <button type="button" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
                      <i className="bi bi-eye" /> View Submission
                    </button>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
      {/* Footer Pagination */}
      <div className="table-pagination-footer">
        <button type="button" className="pagination-text-btn" id="prevPageBtn">Prev</button>
        <div id="paginationContainer" className="d-inline-flex align-items-center gap-1">
          <span className="pagination-num-btn">1</span>
        </div>
        <button type="button" className="pagination-text-btn" id="nextPageBtn">Next</button>
      </div>
    </div>
  );
}
export default StudentSubmissionsTable;
