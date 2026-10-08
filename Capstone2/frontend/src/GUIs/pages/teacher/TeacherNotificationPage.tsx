export default function TeacherNotificationPage() {
  return (
    <>
      {/* Breadcrumb & Page Title */}
      <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
        <div className="my-auto mb-2">
          <h3 className="page-title mb-1">Notifications</h3>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/teacher/dashboard">Dashboard</a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Notifications
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Notification */}
      <div className="card class-list-card border-0 mb-4">
        {/* Card Header */}
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

            {/* Mark all as read Button */}
            <button
              type="button"
              className="btn-header-action"
              id="markAllReadBtn"
            >
              <i className="bi bi-check2-all" />
              <span>Mark all as read</span>
            </button>
          </div>
        </div>

        {/* Notification List Body */}
        <div className="p-0">
          <div className="list-group list-group-flush">
            {/* Notification Item 1 (Unread) */}
            <div className="list-group-item p-3 d-flex align-items-start gap-3 border-bottom">
              <img
                src="/assets/img/profiles/avatar-27.jpg"
                className="rounded-circle flex-shrink-0"
                width={42}
                height={42}
                alt="EduTrack Center Manager"
              />
              <div className="flex-grow-1 min-w-0">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-dark small">
                      EduTrack Center Manager
                    </span>
                    <span className="badge bg-danger">New!</span>
                  </div>
                  <small className="text-muted">
                    <i className="bi bi-clock me-1" />
                    10 minutes ago
                  </small>
                </div>
                <h6 className="mb-1 text-dark fw-semibold">
                  Updated Teaching Schedule for Academic Term 2026/2027
                </h6>
                <p className="text-muted small mb-0">
                  Please review your updated class room allocations and time slots
                  for the upcoming term starting next Monday.
                </p>
              </div>
            </div>

            {/* Notification Item 2 (Unread) */}
            <div className="list-group-item p-3 d-flex align-items-start gap-3 border-bottom">
              <span
                className="ta-avatar-initials bg-primary-subtle text-primary fw-bold flex-shrink-0"
                style={{ width: 42, height: 42, fontSize: 14 }}
              >
                ES
              </span>
              <div className="flex-grow-1 min-w-0">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-dark small">
                      EduTrack Staff
                    </span>
                    <span className="badge bg-danger">New!</span>
                  </div>
                  <small className="text-muted">
                    <i className="bi bi-clock me-1" />2 hours ago
                  </small>
                </div>
                <h6 className="mb-1 text-dark fw-semibold">
                  New Teaching Assistant Assigned to Mathematics Class IV
                </h6>
                <p className="text-muted small mb-0">
                  Teaching Assistant Sarah Jenkins has been assigned to support your
                  Mathematics Class IV sessions.
                </p>
              </div>
            </div>

            {/* Notification Item 3 (Unread) */}
            <div className="list-group-item p-3 d-flex align-items-start gap-3 border-bottom">
              <img
                src="/assets/img/profiles/avatar-27.jpg"
                className="rounded-circle flex-shrink-0"
                width={42}
                height={42}
                alt="EduTrack Center Manager"
              />
              <div className="flex-grow-1 min-w-0">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-dark small">
                      EduTrack Center Manager
                    </span>
                    <span className="badge bg-danger">New!</span>
                  </div>
                  <small className="text-muted">
                    <i className="bi bi-clock me-1" />5 hours ago
                  </small>
                </div>
                <h6 className="mb-1 text-dark fw-semibold">
                  Leave Request Approved
                </h6>
                <p className="text-muted small mb-0">
                  Your request for leave on August 20, 2026 has been approved by the
                  management team.
                </p>
              </div>
            </div>

            {/* Notification Item 4 (Read) */}
            <div className="list-group-item p-3 d-flex align-items-start gap-3 border-bottom bg-light-subtle">
              <span
                className="ta-avatar-initials bg-info-subtle text-info fw-bold flex-shrink-0"
                style={{ width: 42, height: 42, fontSize: 14 }}
              >
                ES
              </span>
              <div className="flex-grow-1 min-w-0">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-dark small">
                      EduTrack Staff
                    </span>
                  </div>
                  <small className="text-muted">
                    <i className="bi bi-clock me-1" />1 day ago
                  </small>
                </div>
                <h6 className="mb-1 text-dark fw-semibold">
                  Monthly Learning Progress Assessment Submission Reminder
                </h6>
                <p className="text-muted small mb-0">
                  Reminder to submit monthly learning progress evaluations for
                  Physics Class I-A by August 18.
                </p>
              </div>
            </div>

            {/* Notification Item 5 (Read) */}
            <div className="list-group-item p-3 d-flex align-items-start gap-3">
              <img
                src="/assets/img/profiles/avatar-27.jpg"
                className="rounded-circle flex-shrink-0"
                width={42}
                height={42}
                alt="EduTrack Center Manager"
              />
              <div className="flex-grow-1 min-w-0">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-dark small">
                      EduTrack Center Manager
                    </span>
                  </div>
                  <small className="text-muted">
                    <i className="bi bi-clock me-1" />3 days ago
                  </small>
                </div>
                <h6 className="mb-1 text-dark fw-semibold">
                  Upcoming Staff Development & Training Session
                </h6>
                <p className="text-muted small mb-0">
                  Join us for the quarterly teacher workshop scheduled for Friday,
                  August 22 at 14:00 in Hall B.
                </p>
              </div>
            </div>
          </div>
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
