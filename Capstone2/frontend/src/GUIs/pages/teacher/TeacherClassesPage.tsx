export default function TeacherClassesPage() {
  return (
    <>
      {/* Breadcrumb & Page Title */}
      <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
        <div className="my-auto mb-2">
          <h3 className="page-title mb-1">My Classes</h3>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/teacher/dashboard">Dashboard</a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                My Classes
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Class list section */}
      <div className="card class-list-card border-0 mb-4">
        {/* Card Header */}
        <div className="class-list-header d-flex align-items-center justify-content-between flex-wrap gap-3">
          <h4 className="class-list-title">Classes List</h4>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button type="button" className="btn-header-action" id="dateRangeBtn">
              <i className="bi bi-calendar3" />
              <span id="dateRangeText">08/09/2026 - 08/15/2026</span>
              <i className="bi bi-chevron-down ms-1" />
            </button>
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
              <div className="dropdown-menu dropdown-menu-end p-3 filter-dropdown-menu">
                <form id="filterForm">
                  <div className="mb-2">
                    <label className="form-label small fw-bold">Class</label>
                    <select className="form-select form-select-sm" id="filterClassSelect">
                      <option value="all">All Classes</option>
                      <option value="Class I">Class I</option>
                      <option value="Class II">Class II</option>
                      <option value="Class III">Class III</option>
                      <option value="Class IV">Class IV</option>
                      <option value="Class V">Class V</option>
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-bold">Status</label>
                    <select className="form-select form-select-sm" id="filterStatusSelect">
                      <option value="all">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
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
              <ul className="dropdown-menu dropdown-menu-end" id="sortOptions">
                <li>
                  <a className="dropdown-item active" href="#" data-sort="asc">
                    Ascending (A-Z)
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#" data-sort="desc">
                    Descending (Z-A)
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Toolbar: Entries select & Search */}
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
              placeholder="Search..."
            />
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive-container">
          <table className="table custom-table align-middle" id="classesTable">
            <thead>
              <tr>
                <th className="th-checkbox">
                  <div className="form-check m-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="selectAllClasses"
                    />
                  </div>
                </th>
                <th>
                  Class Name <i className="bi bi-arrow-down-up table-sort-icon" />
                </th>
                <th>
                  Subject <i className="bi bi-arrow-down-up table-sort-icon" />
                </th>
                <th>
                  Teaching Assistant{" "}
                  <i className="bi bi-arrow-down-up table-sort-icon" />
                </th>
                <th>
                  Status <i className="bi bi-arrow-down-up table-sort-icon" />
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr data-class="Class I" data-status="Active">
                <td>
                  <div className="form-check m-0">
                    <input
                      className="form-check-input row-checkbox"
                      type="checkbox"
                    />
                  </div>
                </td>
                <td>Class I-A</td>
                <td>Physics</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <img
                      src="/assets/img/profiles/avatar-27.jpg"
                      className="ta-avatar-img"
                      alt="Sarah Jenkins"
                    />
                    <span>Sarah Jenkins</span>
                  </div>
                </td>
                <td>
                  <span className="badge-status badge-status-active">Active</span>
                </td>
                <td>
                  <a
                    href="/teacher/class-details"
                    className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                  >
                    <i className="bi bi-eye" /> View
                  </a>
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
