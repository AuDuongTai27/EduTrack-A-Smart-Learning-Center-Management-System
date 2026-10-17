export default function RequestListHeader() {
  return (
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
                <button type="button" className="btn btn-sm btn-light" id="resetFilterBtn">Reset</button>
                <button type="submit" className="btn btn-sm btn-primary" id="applyFilterBtn">Apply</button>
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
              <a className="dropdown-item active" href="#" data-sort="desc">Newest First</a>
            </li>
            <li>
              <a className="dropdown-item" href="#" data-sort="asc">Oldest First</a>
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
  );
}
