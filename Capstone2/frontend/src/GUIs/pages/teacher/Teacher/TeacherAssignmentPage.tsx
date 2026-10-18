export default function TeacherAssignmentPage() {
  return (
    <>
      {/* Breadcrumb & Page Title */}
      <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
        <div className="my-auto mb-2">
          <h3 className="page-title mb-1">Assignment Details</h3>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/teacher/dashboard">Dashboard</a>
              </li>
              <li className="breadcrumb-item">
                <a href="/teacher/classes">My Classes</a>
              </li>
              <li className="breadcrumb-item">
                <a href="/teacher/class-details">Class I-A</a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Assignment 1: Kinematics Problem Set
              </li>
            </ol>
          </nav>
        </div>
        <div className="d-flex align-items-center gap-2">
          <a
            href="/teacher/class-details"
            className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
          >
            <i className="bi bi-arrow-left" /> Back to Class Details
          </a>
        </div>
      </div>
      {/* Assignment Overview Header Card */}
      <div className="card class-list-card border-0 mb-4">
        <div className="card-body p-4">
          {/* Header Top Row */}
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <span className="badge bg-primary-subtle text-primary fw-medium mb-2 px-2.5 py-1">
                Physics • Class I-A
              </span>
              <h3 className="mb-1 text-dark fw-bold">
                Assignment 1: Kinematics Problem Set
              </h3>
              <p className="text-muted mb-0 small">
                Review and evaluate student submitted files for Kinematics
                Problem Set.
              </p>
            </div>
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div className="bg-light p-2.5 px-3 rounded border">
                <small className="text-muted d-block fw-semibold meta-label-xs">
                  CREATION DATE
                </small>
                <span className="fw-semibold text-dark">
                  <i className="bi bi-calendar-event me-1 text-primary" />
                  Aug 04, 2026
                </span>
              </div>
              <div className="bg-light p-2.5 px-3 rounded border">
                <small className="text-muted d-block fw-semibold meta-label-xs">
                  DEADLINE
                </small>
                <span className="fw-semibold text-danger">
                  <i className="bi bi-clock-history me-1" />
                  Aug 11, 2026, 11:59 PM
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <a
                  href="#"
                  className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                >
                  <i className="bi bi-pencil" /> Modify
                </a>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                >
                  <i className="bi bi-trash" /> Delete
                </button>
              </div>
            </div>
          </div>
          {/* Attachments Section */}
          <div className="border-top pt-3 mt-3">
            <div className="mb-2">
              <span className="text-muted fw-bold meta-label-xs uppercase">
                ATTACHMENTS (2)
              </span>
            </div>
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div className="attachment-chip">
                <i className="bi bi-file-earmark-pdf-fill text-danger fs-5" />
                <div>
                  <a
                    href="#"
                    className="text-decoration-none text-dark fw-semibold small d-block mb-0"
                  >
                    assignment1.pdf
                  </a>
                  <small className="text-muted meta-label-xs">2.5 MB</small>
                </div>
                <a
                  href="#"
                  className="btn btn-sm btn-link text-secondary p-0 ms-2"
                  title="Download"
                >
                  <i className="bi bi-download" />
                </a>
              </div>
              <div className="attachment-chip">
                <i className="bi bi-file-earmark-zip-fill text-warning fs-5" />
                <div>
                  <a
                    href="#"
                    className="text-decoration-none text-dark fw-semibold small d-block mb-0"
                  >
                    assignment1.zip
                  </a>
                  <small className="text-muted meta-label-xs">14.2 MB</small>
                </div>
                <a
                  href="#"
                  className="btn btn-sm btn-link text-secondary p-0 ms-2"
                  title="Download"
                >
                  <i className="bi bi-download" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Student List Section */}
      <div className="card class-list-card border-0 mb-4">
        {/* Card Header */}
        <div className="class-list-header d-flex align-items-center justify-content-between flex-wrap gap-3">
          <h4 className="class-list-title">Student Submissions</h4>
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
            <input
              type="search"
              className="table-search-input"
              id="tableSearchInput"
              placeholder="Search..."
            />
          </div>
        </div>
        {/* Table Container */}
        <div className="table-responsive-container">
          <table
            className="table custom-table align-middle"
            id="assignmentTable"
          >
            <thead>
              <tr>
                <th className="th-checkbox">
                  <div className="form-check m-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="selectAll"
                    />
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
              {/* Student 1 */}
              <tr>
                <td>
                  <div className="form-check m-0">
                    <input
                      className="form-check-input row-checkbox"
                      type="checkbox"
                    />
                  </div>
                </td>
                <td>
                  <div className="ta-avatar-initials avatar-initials-sm avatar-initials-indigo">
                    JD
                  </div>
                </td>
                <td className="fw-semibold text-dark">John Doe</td>
                <td>
                  <a
                    href="#"
                    className="text-decoration-none fw-medium text-dark d-inline-flex align-items-center gap-1"
                  >
                    <i className="bi bi-file-earmark-pdf-fill text-danger fs-6" />
                    john_doe_kinematics.pdf
                  </a>
                </td>
                <td>
                  <span className="text-dark fw-medium">
                    10 Aug 2026, 03:45 PM
                  </span>
                  <small className="text-muted ms-1">(2 hours ago)</small>
                </td>
                <td>
                  <span className="fw-bold text-dark">9.0</span>{" "}
                  <small className="text-muted">/ 10</small>
                </td>
                <td className="text-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                  >
                    <i className="bi bi-eye" /> View Submission
                  </button>
                </td>
              </tr>
              {/* Student 2 */}
              <tr>
                <td>
                  <div className="form-check m-0">
                    <input
                      className="form-check-input row-checkbox"
                      type="checkbox"
                    />
                  </div>
                </td>
                <td>
                  <div className="ta-avatar-initials avatar-initials-sm avatar-initials-emerald">
                    AS
                  </div>
                </td>
                <td className="fw-semibold text-dark">Alice Smith</td>
                <td>
                  <a
                    href="#"
                    className="text-decoration-none fw-medium text-dark d-inline-flex align-items-center gap-1"
                  >
                    <i className="bi bi-file-earmark-pdf-fill text-danger fs-6" />
                    alice_smith_assignment1.pdf
                  </a>
                </td>
                <td>
                  <span className="text-dark fw-medium">
                    11 Aug 2026, 09:15 AM
                  </span>
                  <small className="text-muted ms-1">(5 hours ago)</small>
                </td>
                <td>
                  <span className="text-muted fw-semibold">-</span>
                </td>
                <td className="text-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                  >
                    <i className="bi bi-eye" /> View Submission
                  </button>
                </td>
              </tr>
              {/* Student 3 */}
              <tr>
                <td>
                  <div className="form-check m-0">
                    <input
                      className="form-check-input row-checkbox"
                      type="checkbox"
                    />
                  </div>
                </td>
                <td>
                  <div className="ta-avatar-initials avatar-initials-sm avatar-initials-amber">
                    ER
                  </div>
                </td>
                <td className="fw-semibold text-dark">Ethan Roberts</td>
                <td>
                  <a
                    href="#"
                    className="text-decoration-none fw-medium text-dark d-inline-flex align-items-center gap-1"
                  >
                    <i className="bi bi-file-earmark-pdf-fill text-danger fs-6" />
                    ethan_roberts_kinematics.pdf
                  </a>
                </td>
                <td>
                  <span className="text-dark fw-medium">
                    11 Aug 2026, 11:20 AM
                  </span>
                  <small className="text-muted ms-1">(1 day ago)</small>
                </td>
                <td>
                  <span className="fw-bold text-dark">8.5</span>{" "}
                  <small className="text-muted">/ 10</small>
                </td>
                <td className="text-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                  >
                    <i className="bi bi-eye" /> View Submission
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Footer Pagination */}
        <div className="table-pagination-footer">
          <button
            type="button"
            className="pagination-text-btn"
            id="prevPageBtn"
          >
            Prev
          </button>
          <div
            id="paginationContainer"
            className="d-inline-flex align-items-center gap-1"
          >
            <span className="pagination-num-btn">1</span>
          </div>
          <button
            type="button"
            className="pagination-text-btn"
            id="nextPageBtn"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
