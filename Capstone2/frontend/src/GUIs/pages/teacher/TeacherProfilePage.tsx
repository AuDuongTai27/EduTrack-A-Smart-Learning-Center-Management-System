export default function TeacherProfilePage() {
  return (
    <>
      {/* Breadcrumb & Page Title */}
      <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
        <div className="my-auto mb-2">
          <h3 className="page-title mb-1">Profile</h3>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/teacher/dashboard">Dashboard</a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Profile
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Profile */}
      <div className="card class-list-card border-0 mb-4">
        <div className="class-list-header d-flex align-items-center justify-content-between">
          <h4 className="class-list-title">Profile Information</h4>
        </div>
        <div className="card-body p-4">
          {/* Avatar & Primary Info */}
          <div className="d-flex align-items-center gap-3 pb-4 mb-4 border-bottom">
            <div className="profile-avatar-wrap" style={{ width: 80, height: 80 }}>
              <img
                src="/assets/img/profiles/avatar-27.jpg"
                alt="Henriques Morgan"
                className="profile-avatar-img"
              />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h4 className="mb-0 text-dark fw-bold">Henriques Morgan</h4>
                <span className="badge bg-primary">Teacher</span>
                <span className="badge bg-primary-subtle text-primary">
                  #T594651
                </span>
              </div>
              <p className="text-muted mb-0 small">
                <i className="bi bi-buildings me-1" />
                EduTrack Learning Center
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="row g-4 mb-4">
            <div className="col-md-6 col-lg-4">
              <div className="p-3 bg-light rounded-3 border">
                <small className="text-muted d-block mb-1">
                  <i className="bi bi-person me-1 text-primary" />
                  Full Name
                </small>
                <span className="fw-semibold text-dark">Henriques Morgan</span>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="p-3 bg-light rounded-3 border">
                <small className="text-muted d-block mb-1">
                  <i className="bi bi-briefcase me-1 text-primary" />
                  Role
                </small>
                <span className="fw-semibold text-dark">Teacher</span>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="p-3 bg-light rounded-3 border">
                <small className="text-muted d-block mb-1">
                  <i className="bi bi-calendar-event me-1 text-primary" />
                  Date of Birth
                </small>
                <span className="fw-semibold text-dark">May 14, 1988</span>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="p-3 bg-light rounded-3 border">
                <small className="text-muted d-block mb-1">
                  <i className="bi bi-gender-ambiguous me-1 text-primary" />
                  Gender
                </small>
                <span className="fw-semibold text-dark">Male</span>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="p-3 bg-light rounded-3 border">
                <small className="text-muted d-block mb-1">
                  <i className="bi bi-calendar-check me-1 text-primary" />
                  Start Work Date
                </small>
                <span className="fw-semibold text-dark">
                  September 01, 2021
                </span>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="p-3 bg-light rounded-3 border">
                <small className="text-muted d-block mb-1">
                  <i className="bi bi-telephone me-1 text-primary" />
                  Phone Number
                </small>
                <span className="fw-semibold text-dark">+84 912 345 678</span>
              </div>
            </div>
            <div className="col-md-6 col-lg-6">
              <div className="p-3 bg-light rounded-3 border">
                <small className="text-muted d-block mb-1">
                  <i className="bi bi-envelope me-1 text-primary" />
                  Email
                </small>
                <span className="fw-semibold text-dark">example@abc.com</span>
              </div>
            </div>
            <div className="col-md-6 col-lg-6">
              <div className="p-3 bg-light rounded-3 border">
                <small className="text-muted d-block mb-1">
                  <i className="bi bi-geo-alt me-1 text-primary" />
                  Address
                </small>
                <span className="fw-semibold text-dark">
                  123 Education St, District 1, Ho Chi Minh City
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="d-flex justify-content-end pt-3 border-top">
            <button
              type="button"
              className="btn btn-primary d-inline-flex align-items-center gap-2"
            >
              <i className="bi bi-pencil-square" /> Edit Profile
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
