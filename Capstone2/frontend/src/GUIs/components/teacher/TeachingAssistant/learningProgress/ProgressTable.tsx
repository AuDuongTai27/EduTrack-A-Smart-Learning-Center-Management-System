export default function ProgressTable() {
  return (
    <>
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
    </>
  );
}
