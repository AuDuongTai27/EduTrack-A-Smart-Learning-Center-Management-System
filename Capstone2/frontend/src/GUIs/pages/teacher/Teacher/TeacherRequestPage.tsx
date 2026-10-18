export default function TeacherRequestPage() {
  return (
    <>
      {/* Page Header Title & Breadcrumb */}
      <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
        <div className="my-auto mb-2">
          <h3 className="page-title mb-1">Request List</h3>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/teacher/dashboard">Dashboard</a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Request
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Sent Requests List */}
      <div className="card class-list-card border-0 mb-4">
        {/* Card Header */}
        <div className="class-list-header d-flex align-items-center justify-content-between flex-wrap gap-3">
          <h4 className="class-list-title">Sent Requests List</h4>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Status Filter */}
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
                <span id="filterLabel">Filter</span>
                <i className="bi bi-chevron-down ms-1" />
              </button>
              <div className="dropdown-menu dropdown-menu-end p-3 filter-dropdown-menu">
                <form id="filterForm">
                  <div className="mb-2">
                    <label className="form-label small fw-bold">Status</label>
                    <select className="form-select form-select-sm" id="filterStatusSelect">
                      <option value="all">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <button
                      type="button"
                      className="btn btn-sm btn-light"
                      id="resetFilterBtn"
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      className="btn btn-sm btn-primary"
                      id="applyFilterBtn"
                    >
                      Apply
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="dropdown">
              <button
                type="button"
                className="btn-header-action"
                id="sortDropdownBtn"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-arrow-down-up" />
                <span id="sortLabel">Sort by Newest</span>
                <i className="bi bi-chevron-down ms-1" />
              </button>
              <ul className="dropdown-menu dropdown-menu-end" id="sortOptions">
                <li>
                  <a className="dropdown-item active" href="#" data-sort="desc">
                    Newest First
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#" data-sort="asc">
                    Oldest First
                  </a>
                </li>
              </ul>
            </div>

            {/* New Request Button */}
            <button
              type="button"
              className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"
            >
              <i className="bi bi-plus-lg" />
              <span>New Request</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
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
              placeholder="Search requests..."
            />
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive-container">
          <table className="table custom-table align-middle" id="requestsTable">
            <thead>
              <tr>
                <th className="th-checkbox">
                  <div className="form-check m-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="selectAllRequests"
                    />
                  </div>
                </th>
                <th>
                  Request ID <i className="bi bi-arrow-down-up table-sort-icon" />
                </th>
                <th>
                  Title <i className="bi bi-arrow-down-up table-sort-icon" />
                </th>
                <th>
                  Sent Date & Time{" "}
                  <i className="bi bi-arrow-down-up table-sort-icon" />
                </th>
                <th>
                  Status <i className="bi bi-arrow-down-up table-sort-icon" />
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="requestTableBody">
              <tr>
                <td>
                  <div className="form-check m-0">
                    <input
                      className="form-check-input row-checkbox"
                      type="checkbox"
                      defaultValue="#4"
                    />
                  </div>
                </td>
                <td>
                  <a href="#" className="class-id-link">
                    #4
                  </a>
                </td>
                <td>
                  <a href="#" className="text-dark fw-semibold text-decoration-none">
                    Schedule Change Request for Physics Class I-A
                  </a>
                </td>
                <td className="text-muted small">16 Aug 2026, 15:45</td>
                <td>
                  <span className="badge-status badge-status-pending">
                    <i className="bi bi-hourglass-split" /> Pending
                  </span>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-1">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                    >
                      <i className="bi bi-pencil" /> Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                    >
                      <i className="bi bi-trash" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="form-check m-0">
                    <input
                      className="form-check-input row-checkbox"
                      type="checkbox"
                      defaultValue="#3"
                    />
                  </div>
                </td>
                <td>
                  <a href="#" className="class-id-link">
                    #3
                  </a>
                </td>
                <td>
                  <a href="#" className="text-dark fw-semibold text-decoration-none">
                    Additional Teaching Materials Request for English Class II-C
                  </a>
                </td>
                <td className="text-muted small">15 Aug 2026, 09:30</td>
                <td>
                  <span className="badge-status badge-status-pending">
                    <i className="bi bi-hourglass-split" /> Pending
                  </span>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-1">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                    >
                      <i className="bi bi-pencil" /> Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                    >
                      <i className="bi bi-trash" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="form-check m-0">
                    <input
                      className="form-check-input row-checkbox"
                      type="checkbox"
                      defaultValue="#2"
                    />
                  </div>
                </td>
                <td>
                  <a href="#" className="class-id-link">
                    #2
                  </a>
                </td>
                <td>
                  <a href="#" className="text-dark fw-semibold text-decoration-none">
                    Assistant Teacher Allocation for Mathematics Class IV
                  </a>
                </td>
                <td className="text-muted small">10 Aug 2026, 14:15</td>
                <td>
                  <span className="badge-status badge-status-active">
                    <i className="bi bi-check-circle-fill" /> Approved
                  </span>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-1">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                      disabled
                      title="Cannot edit a processed request"
                    >
                      <i className="bi bi-pencil" /> Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                      disabled
                      title="Cannot delete a processed request"
                    >
                      <i className="bi bi-trash" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="form-check m-0">
                    <input
                      className="form-check-input row-checkbox"
                      type="checkbox"
                      defaultValue="#1"
                    />
                  </div>
                </td>
                <td>
                  <a href="#" className="class-id-link">
                    #1
                  </a>
                </td>
                <td>
                  <a href="#" className="text-dark fw-semibold text-decoration-none">
                    Leave Request for 2 Days (August 5 - 6)
                  </a>
                </td>
                <td className="text-muted small">02 Aug 2026, 08:00</td>
                <td>
                  <span className="badge-status badge-status-inactive">
                    <i className="bi bi-x-circle-fill" /> Rejected
                  </span>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-1">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                      disabled
                      title="Cannot edit a processed request"
                    >
                      <i className="bi bi-pencil" /> Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                      disabled
                      title="Cannot delete a processed request"
                    >
                      <i className="bi bi-trash" /> Delete
                    </button>
                  </div>
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
