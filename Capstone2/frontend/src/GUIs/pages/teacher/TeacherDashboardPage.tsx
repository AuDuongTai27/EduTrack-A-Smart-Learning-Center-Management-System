export default function TeacherDashboardPage() {
  return (
    <>
      {/* Breadcrumb & Page Title */}
      <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
        <div className="my-auto mb-2">
          <h3 className="page-title mb-1">Teacher Dashboard</h3>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/teacher/dashboard">Dashboard</a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Teacher Dashboard
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Greeting section */}
      <div className="row mb-3">
        <div className="col-md-12 d-flex">
          <div className="card flex-fill bg-info bg-03">
            <div className="card-body">
              <h1 className="text-white mb-1">Good Morning Henriques</h1>
              <p className="text-white mb-3">Have a Good day at work</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-xxl-6 col-xl-12">
          {/* Teacher profile */}
          <div className="card teacher-profile-card border-0 mb-4">
            <div className="card-body d-flex flex-column flex-sm-row align-items-sm-center justify-content-between p-4 gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="profile-avatar-wrap">
                  <img
                    src="/assets/img/profiles/avatar-27.jpg"
                    alt="Henriques Morgan"
                    className="profile-avatar-img"
                  />
                </div>
                <div>
                  <span className="badge bg-primary-subtle text-primary mb-1">
                    #T594651
                  </span>
                  <h4 className="mb-1 text-dark fw-bold">Henriques Morgan</h4>
                  <div className="d-flex align-items-center flex-wrap gap-2 text-muted small">
                    <span className="d-inline-flex align-items-center gap-1">
                      <img
                        src="/assets/img/icons/teacher.svg"
                        alt="Classes"
                        width={16}
                        height={16}
                      />
                      Classes: I-A, V-B
                    </span>
                    <span className="d-inline-flex align-items-center gap-1 ms-2">
                      <img
                        src="/assets/img/icons/subject.svg"
                        alt="Subject"
                        width={16}
                        height={16}
                      />
                      Physics
                    </span>
                  </div>
                </div>
              </div>
              <a
                href="/teacher/profile"
                className="btn btn-primary d-inline-flex align-items-center gap-2"
              >
                <i className="bi bi-pencil-square" /> Edit Profile
              </a>
            </div>
          </div>

          {/* Dashboard KPI Cards */}
          <div className="dashboard-kpis teacher-kpis mb-4">
            {/* Active Assignments */}
            <div className="card dashboard-kpi border-0">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-muted mb-1">Active Assignments</p>
                    <h3 className="mb-0">10</h3>
                  </div>
                  <div className="kpi-icon bg-primary-subtle text-primary">
                    <i className="bi bi-mortarboard-fill" />
                  </div>
                </div>
                <div className="border-top mt-3 pt-3">
                  <span className="text-muted ms-1">7 assignments due today</span>
                </div>
              </div>
            </div>

            {/* Active Classes */}
            <div className="card dashboard-kpi border-0">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-muted mb-1">Active Classes</p>
                    <h3 className="mb-0">6</h3>
                  </div>
                  <div className="kpi-icon bg-info-subtle text-info">
                    <i className="bi bi-collection-fill" />
                  </div>
                </div>
                <div className="border-top mt-3 pt-3">
                  <span className="text-muted">4 classes today</span>
                </div>
              </div>
            </div>
          </div>

          {/* Today's class */}
          <div className="card dashboard-card">
            <div className="card-header dashboard-card-header d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <h5 className="mb-0 me-3">Today's Class</h5>
                <div className="slide-nav2 d-inline-flex align-items-center">
                  <button
                    type="button"
                    className="owl-prev"
                    aria-label="Previous class"
                  >
                    <i className="bi bi-chevron-left" />
                  </button>
                  <button
                    type="button"
                    className="owl-next"
                    aria-label="Next class"
                  >
                    <i className="bi bi-chevron-right" />
                  </button>
                </div>
              </div>
              <div className="d-inline-flex align-items-center class-datepick">
                <span className="icon">
                  <i className="bi bi-chevron-left" />
                </span>
                <input
                  type="text"
                  className="form-control datetimepicker border-0"
                  placeholder="16 May 2024"
                  readOnly
                />
                <span className="icon">
                  <i className="bi bi-chevron-right" />
                </span>
              </div>
            </div>
            <div className="card-body dashboard-card-body">
              <div className="today-classes-grid">
                {/* Class I-A */}
                <a
                  href="/teacher/class-details"
                  className="text-decoration-none text-dark"
                >
                  <div className="today-class-item">
                    <span className="badge badge-primary badge-lg mb-2">
                      <i className="bi bi-clock me-1" />
                      09:00 - 09:45
                    </span>
                    <p className="today-class-name mb-0">Class I-A</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xxl-6 col-xl-12 d-flex flex-column">
          {/* Notifications */}
          <div className="card dashboard-card flex-fill d-flex flex-column">
            <div className="card-header dashboard-card-header d-flex align-items-center justify-content-between">
              <div>
                <h5 className="mb-1">Notifications</h5>
                <small className="text-muted">
                  Latest announcements and updates
                </small>
              </div>
              <a href="/teacher/notifications" className="dashboard-view-all">
                View All
              </a>
            </div>

            <div className="card-body dashboard-card-body d-flex flex-column flex-fill">
              <div className="notice-list d-flex flex-column flex-fill justify-content-between">
                {/* Notice 1 */}
                <div className="notice-item">
                  <div className="notice-icon bg-primary-subtle text-primary">
                    <i className="bi bi-book" />
                  </div>
                  <div className="notice-content">
                    <h6 className="mb-1">New Syllabus Instructions</h6>
                    <p className="mb-0 text-muted">
                      <i className="bi bi-calendar3 me-1" />
                      Added on : 11 Mar 2024
                    </p>
                  </div>
                  <span className="notice-day">20 Days</span>
                </div>

                {/* Notice 2 */}
                <div className="notice-item">
                  <div className="notice-icon bg-success-subtle text-success">
                    <i className="bi bi-megaphone" />
                  </div>
                  <div className="notice-content">
                    <h6 className="mb-1">World Environment Day Program</h6>
                    <p className="mb-0 text-muted">
                      <i className="bi bi-calendar3 me-1" />
                      Added on : 21 Apr 2024
                    </p>
                  </div>
                  <span className="notice-day">15 Days</span>
                </div>

                {/* Notice 3 */}
                <div className="notice-item">
                  <div className="notice-icon bg-danger-subtle text-danger">
                    <i className="bi bi-bell" />
                  </div>
                  <div className="notice-content">
                    <h6 className="mb-1">Exam Preparation Notification</h6>
                    <p className="mb-0 text-muted">
                      <i className="bi bi-calendar3 me-1" />
                      Added on : 13 Mar 2024
                    </p>
                  </div>
                  <span className="notice-day">12 Days</span>
                </div>

                {/* Notice 4 */}
                <div className="notice-item">
                  <div className="notice-icon bg-info-subtle text-info">
                    <i className="bi bi-laptop" />
                  </div>
                  <div className="notice-content">
                    <h6 className="mb-1">Online Classes Preparation</h6>
                    <p className="mb-0 text-muted">
                      <i className="bi bi-calendar3 me-1" />
                      Added on : 24 May 2024
                    </p>
                  </div>
                  <span className="notice-day">02 Days</span>
                </div>

                {/* Notice 5 */}
                <div className="notice-item">
                  <div className="notice-icon bg-warning-subtle text-warning">
                    <i className="bi bi-calendar-event" />
                  </div>
                  <div className="notice-content">
                    <h6 className="mb-1">Exam Time Table Release</h6>
                    <p className="mb-0 text-muted">
                      <i className="bi bi-calendar3 me-1" />
                      Added on : 24 May 2024
                    </p>
                  </div>
                  <span className="notice-day">06 Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
