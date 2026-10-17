export default function ScheduleListHeader() {
  return (
    <div className="class-list-header d-flex align-items-center justify-content-between flex-wrap gap-3">
      <h4 className="class-list-title">Schedule Classes</h4>
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
                <button type="button" className="btn btn-sm btn-light" id="resetFilterBtn">
                  Reset
                </button>
                <button type="submit" className="btn btn-sm btn-primary" id="applyFilterBtn">
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
  );
}
