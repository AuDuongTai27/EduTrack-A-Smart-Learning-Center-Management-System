import { Link } from "react-router-dom";

export default function AdminStaffStudentPage() {
  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
        <div className="my-auto mb-2">
          <h3 className="page-title mb-1">Students</h3>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/admin-staff/dashboard">Dashboard</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Students
              </li>
            </ol>
          </nav>
        </div>
        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
          <div className="mb-2">
            <button
              type="button"
              className="btn btn-primary d-flex align-items-center"
            >
              <i className="bi bi-plus-square me-2" />
              Add Student
            </button>
          </div>
        </div>
      </div>
      {/* Student List */}
      <div className="card user-list-card">
        {/* Filter */}
        <div className="card-header user-list-header">
          <div className="row g-3 align-items-center">
            {/* Search */}
            <div className="col-xl-4 col-lg-6">
              <div className="user-search">
                <i className="bi bi-search" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by student name or parent phone..."
                />
              </div>
            </div>
            {/* Class */}
            <div className="col-xl-2 col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Classes</option>
                <option>Class 7</option>
                <option>Class 8</option>
                <option>Class 9</option>
              </select>
            </div>
            {/* Subject */}
            <div className="col-xl-2 col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Subjects</option>
                <option>Mathematics</option>
                <option>Chemistry</option>
                <option>Physics</option>
                <option>English</option>
              </select>
            </div>
            {/* Status */}
            <div className="col-xl-2 col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Statuses</option>
                <option>Active</option>
                <option>On Hold</option>
                <option>Inactive</option>
              </select>
            </div>
            {/* Sort */}
            <div className="col-xl-2 col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>Sort by A-Z</option>
                <option>Sort by Z-A</option>
                <option>Newest</option>
                <option>Oldest</option>
              </select>
            </div>
          </div>
        </div>
        {/* Table Controls */}
        <div className="user-table-toolbar d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted">Show</span>
            <select className="form-select form-select-sm user-page-size">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
            <span className="text-muted">entries</span>
          </div>
          <span className="text-muted small">
            Total students:
            <strong className="text-dark">128</strong>
          </span>
        </div>
        {/* Student Table */}
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0">
            <thead>
              <tr>
                <th className="fw-bold">No.</th>
                <th className="fw-bold">Student Name</th>
                <th className="fw-bold">Parent Name</th>
                <th className="fw-bold">Parent Phone</th>
                <th className="fw-bold">Class</th>
                <th className="fw-bold">Subjects</th>
                <th className="fw-bold">Status</th>
                <th className="text-center fw-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div className="user-avatar">NA</div>
                    <h6 className="mb-0">Nguyen Minh An</h6>
                  </div>
                </td>
                <td>Nguyen Van Binh</td>
                <td>0901 234 567</td>
                <td>Class 7</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <span className="specialty-badge">Mathematics - 7</span>
                    <span className="specialty-badge">English - 7</span>
                  </div>
                </td>
                <td>
                  <span className="status-badge status-active">
                    <span />
                    Active
                  </span>
                </td>
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="View / Edit"
                    >
                      <i className="bi bi-pencil-square" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Change Status"
                    >
                      <i className="bi bi-arrow-repeat" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Record Tuition Payment"
                    >
                      <i className="bi bi-cash-stack" />
                    </button>
                    <div className="dropdown">
                      <button
                        className="btn table-action-btn"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        title="More actions"
                      >
                        <i className="bi bi-three-dots-vertical" />
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-person-lines-fill me-2" />
                            Parent Information
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-receipt me-2" />
                            Tuition Details
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td>2</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div className="user-avatar">TH</div>
                    <h6 className="mb-0">Tran Gia Huy</h6>
                  </div>
                </td>
                <td>Tran Quoc Minh</td>
                <td>0912 345 678</td>
                <td>Class 8</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <span className="specialty-badge">Chemistry - 8</span>
                    <span className="specialty-badge">Mathematics - 8</span>
                  </div>
                </td>
                <td>
                  <span className="status-badge status-active">
                    <span />
                    Active
                  </span>
                </td>
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="View / Edit"
                    >
                      <i className="bi bi-pencil-square" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Change Status"
                    >
                      <i className="bi bi-arrow-repeat" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Record Tuition Payment"
                    >
                      <i className="bi bi-cash-stack" />
                    </button>
                    <div className="dropdown">
                      <button
                        className="btn table-action-btn"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        title="More actions"
                      >
                        <i className="bi bi-three-dots-vertical" />
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-person-lines-fill me-2" />
                            Parent Information
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-receipt me-2" />
                            Tuition Details
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td>3</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div className="user-avatar">ML</div>
                    <h6 className="mb-0">Le Minh Long</h6>
                  </div>
                </td>
                <td>Le Thanh Ha</td>
                <td>0988 765 432</td>
                <td>Class 9</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <span className="specialty-badge">Physics - 9</span>
                    <span className="specialty-badge">English - 9</span>
                  </div>
                </td>
                <td>
                  <span className="status-badge status-locked">
                    <span />
                    On Hold
                  </span>
                </td>
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="View / Edit"
                    >
                      <i className="bi bi-pencil-square" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Change Status"
                    >
                      <i className="bi bi-arrow-repeat" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Record Tuition Payment"
                    >
                      <i className="bi bi-cash-stack" />
                    </button>
                    <div className="dropdown">
                      <button
                        className="btn table-action-btn"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        title="More actions"
                      >
                        <i className="bi bi-three-dots-vertical" />
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-person-lines-fill me-2" />
                            Parent Information
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-receipt me-2" />
                            Tuition Details
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td>4</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div className="user-avatar">PN</div>
                    <h6 className="mb-0">Pham Hoang Nam</h6>
                  </div>
                </td>
                <td>Pham Van Hung</td>
                <td>0934 567 890</td>
                <td>Class 8</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <span className="specialty-badge">Mathematics - 8</span>
                    <span className="specialty-badge">Physics - 8</span>
                    <span className="specialty-badge">Chemistry - 8</span>
                    <span className="specialty-badge">English - 8</span>
                  </div>
                </td>
                <td>
                  <span className="status-badge status-inactive">
                    <span />
                    Inactive
                  </span>
                </td>
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="View / Edit"
                    >
                      <i className="bi bi-pencil-square" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Change Status"
                    >
                      <i className="bi bi-arrow-repeat" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Record Tuition Payment"
                    >
                      <i className="bi bi-cash-stack" />
                    </button>
                    <div className="dropdown">
                      <button
                        className="btn table-action-btn"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        title="More actions"
                      >
                        <i className="bi bi-three-dots-vertical" />
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-person-lines-fill me-2" />
                            Parent Information
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-receipt me-2" />
                            Tuition Details
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="user-table-footer d-flex align-items-center justify-content-between flex-wrap gap-3">
          <span className="text-muted small">
            Showing 1 to 4 of 128 students
          </span>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className="page-item disabled">
                <Link className="page-link" to="#">
                  <i className="bi bi-chevron-left" />
                </Link>
              </li>
              <li className="page-item active">
                <Link className="page-link" to="#">
                  1
                </Link>
              </li>
              <li className="page-item">
                <Link className="page-link" to="#">
                  2
                </Link>
              </li>
              <li className="page-item">
                <Link className="page-link" to="#">
                  3
                </Link>
              </li>
              <li className="page-item">
                <Link className="page-link" to="#">
                  <i className="bi bi-chevron-right" />
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
