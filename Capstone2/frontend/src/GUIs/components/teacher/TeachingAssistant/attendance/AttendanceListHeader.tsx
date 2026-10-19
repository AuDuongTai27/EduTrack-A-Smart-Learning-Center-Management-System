function AttendanceListHeader() {
  return (
    <div className="class-list-header d-flex align-items-center justify-content-between flex-wrap gap-3">
      <h4 className="class-list-title">Student Attendance List</h4>
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
  );
}

export default AttendanceListHeader;
