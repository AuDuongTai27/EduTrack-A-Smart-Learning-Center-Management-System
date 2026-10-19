export default function NotificationsHeader() {
  return (
    <div className="class-list-header d-flex align-items-center justify-content-between flex-wrap gap-3">
      <h4 className="class-list-title">Notifications</h4>
      <div className="d-flex align-items-center gap-2 flex-wrap">
        {/* Filter Dropdown */}
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
                  <option value="all">All Notifications</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>
              <div className="mb-2">
                <label className="form-label small fw-bold">Sender</label>
                <select className="form-select form-select-sm" id="filterSenderSelect">
                  <option value="all">All Senders</option>
                  <option value="staff">EduTrack Staff</option>
                  <option value="manager">EduTrack Center Manager</option>
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

        {/* Mark all as read */}
        <button type="button" className="btn-header-action" id="markAllReadBtn">
          <i className="bi bi-check2-all" />
          <span>Mark all as read</span>
        </button>
      </div>
    </div>
  );
}
