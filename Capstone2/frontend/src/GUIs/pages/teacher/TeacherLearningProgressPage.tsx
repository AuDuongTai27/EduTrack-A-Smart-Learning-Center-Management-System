export default function TeacherLearningProgressPage() {
  return (
    <>
      <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
        <div className="my-auto mb-2">
          <h3 className="page-title mb-1">Learning Progress</h3>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/teacher/dashboard">Dashboard</a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Learning Progress
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Learning Progress Card */}
      <div className="card class-list-card border-0 mb-4">
        {/* Card Header & Class Selector */}
        <div className="class-list-header d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h4 className="class-list-title mb-1">Student Progress List</h4>
            <small className="text-muted">
              Track attendance and assignment status by class
            </small>
          </div>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            {/* Class Selector */}
            <div className="d-flex align-items-center gap-2">
              <label
                htmlFor="filterClassSelect"
                className="form-label mb-0 small fw-bold text-nowrap"
              >
                Select Class:
              </label>
              <select
                className="form-select form-select-sm"
                id="filterClassSelect"
                style={{ minWidth: 150 }}
                defaultValue="Class I-A"
              >
                <option value="Class I-A">Class I-A</option>
                <option value="Class I-B">Class I-B</option>
                <option value="Class II-C">Class II-C</option>
                <option value="Class V-B">Class V-B</option>
              </select>
            </div>
          </div>
        </div>

        {/* Toolbar: Entries select & Search */}
        <div className="table-toolbar">
          <div className="table-entries-select">
            <span>Row Per Page</span>
            <select
              className="form-select form-select-sm"
              id="entriesSelect"
              defaultValue="10"
            >
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
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="selectAllStudents"
                    />
                  </div>
                </th>
                <th>
                  Student Name <i className="bi bi-arrow-down-up table-sort-icon" />
                </th>
                <th>
                  Attendance (Days Present / Total){" "}
                  <i className="bi bi-arrow-down-up table-sort-icon" />
                </th>
                <th>
                  Latest Assignment{" "}
                  <i className="bi bi-arrow-down-up table-sort-icon" />
                </th>
                <th>
                  Latest Assignment Status{" "}
                  <i className="bi bi-arrow-down-up table-sort-icon" />
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Student 1 */}
              <tr data-class="Class I-A">
                <td>
                  <div className="form-check m-0">
                    <input
                      className="form-check-input row-checkbox"
                      type="checkbox"
                    />
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <img
                      src="/assets/img/profiles/avatar-27.jpg"
                      className="ta-avatar-img"
                      alt="Nguyen Van An"
                    />
                    <div>
                      <span className="fw-semibold d-block text-dark">
                        Nguyen Van An
                      </span>
                      <small className="text-muted">#STU-1001</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-dark">19/20 Days</span>
                    <span className="badge bg-success-subtle text-success border border-success-subtle">
                      95%
                    </span>
                  </div>
                </td>
                <td>
                  <span className="fw-medium text-dark">
                    Quantum Physics 101
                  </span>
                </td>
                <td>
                  <span className="badge-status badge-status-active">
                    <i className="bi bi-check-circle-fill me-1" />
                    Submitted
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                  >
                    <i className="bi bi-eye" /> View
                  </button>
                </td>
              </tr>

              {/* Student 2 */}
              <tr data-class="Class I-A">
                <td>
                  <div className="form-check m-0">
                    <input
                      className="form-check-input row-checkbox"
                      type="checkbox"
                    />
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <span className="ta-avatar-initials bg-primary-subtle text-primary">
                      TM
                    </span>
                    <div>
                      <span className="fw-semibold d-block text-dark">
                        Tran Thi Mai
                      </span>
                      <small className="text-muted">#STU-1002</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-dark">18/20 Days</span>
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                      90%
                    </span>
                  </div>
                </td>
                <td>
                  <span className="fw-medium text-dark">
                    Quantum Physics 101
                  </span>
                </td>
                <td>
                  <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 rounded-2 fw-semibold">
                    <i className="bi bi-exclamation-triangle-fill me-1" />
                    Late
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                  >
                    <i className="bi bi-eye" /> View
                  </button>
                </td>
              </tr>

              {/* Student 3 */}
              <tr data-class="Class I-A">
                <td>
                  <div className="form-check m-0">
                    <input
                      className="form-check-input row-checkbox"
                      type="checkbox"
                    />
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <span className="ta-avatar-initials bg-info-subtle text-info">
                      LN
                    </span>
                    <div>
                      <span className="fw-semibold d-block text-dark">
                        Le Hoang Nam
                      </span>
                      <small className="text-muted">#STU-1003</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-dark">20/20 Days</span>
                    <span className="badge bg-success-subtle text-success border border-success-subtle">
                      100%
                    </span>
                  </div>
                </td>
                <td>
                  <span className="fw-medium text-dark">
                    Quantum Physics 101
                  </span>
                </td>
                <td>
                  <span className="badge-status badge-status-active">
                    <i className="bi bi-check-circle-fill me-1" />
                    Submitted
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                  >
                    <i className="bi bi-eye" /> View
                  </button>
                </td>
              </tr>

              {/* Student 4 */}
              <tr data-class="Class I-A">
                <td>
                  <div className="form-check m-0">
                    <input
                      className="form-check-input row-checkbox"
                      type="checkbox"
                    />
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <span className="ta-avatar-initials bg-danger-subtle text-danger">
                      PH
                    </span>
                    <div>
                      <span className="fw-semibold d-block text-dark">
                        Pham Thu Ha
                      </span>
                      <small className="text-muted">#STU-1004</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-dark">15/20 Days</span>
                    <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                      75%
                    </span>
                  </div>
                </td>
                <td>
                  <span className="fw-medium text-dark">
                    Quantum Physics 101
                  </span>
                </td>
                <td>
                  <span className="badge-status badge-status-inactive">
                    <i className="bi bi-x-circle-fill me-1" />
                    Not Submitted
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                  >
                    <i className="bi bi-eye" /> View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="table-pagination-footer">
          <button type="button" className="pagination-text-btn" id="prevPageBtn">
            Prev
          </button>
          <div
            id="paginationContainer"
            className="d-inline-flex align-items-center gap-1"
          >
            <span className="pagination-num-btn">1</span>
          </div>
          <button type="button" className="pagination-text-btn" id="nextPageBtn">
            Next
          </button>
        </div>
      </div>
    </>
  );
}
