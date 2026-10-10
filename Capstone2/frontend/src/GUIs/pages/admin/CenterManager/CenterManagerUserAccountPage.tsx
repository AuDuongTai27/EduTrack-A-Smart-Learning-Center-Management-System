import { Link } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";

export default function CenterManagerUserAccountPage() {
  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="User Account Management"
        breadcrumbItems={[
          { label: "Center Manager", path: "/center-manager" },
          { label: "User Accounts" },
        ]}
        action={
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center"
          >
            <i className="bi bi-plus-square me-2" />
            Add User
          </button>
        }
      />

      {/* User Accounts List */}
      <div className="card user-list-card">
        {/* Filter */}
        <div className="card-header user-list-header">
          <div className="row g-3 align-items-center">
            <div className="col-xl-4 col-lg-6">
              <div className="user-search">
                <i className="bi bi-search" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or phone..."
                />
              </div>
            </div>
            <div className="col-xl-2 col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Specialties</option>
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Chemistry</option>
                <option>English</option>
              </select>
            </div>
            <div className="col-xl-2 col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Roles</option>
                <option>Center Manager</option>
                <option>Admin Staff</option>
                <option>Teacher</option>
                <option>Teaching Assistant</option>
              </select>
            </div>
            <div className="col-xl-2 col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Statuses</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Locked</option>
              </select>
            </div>
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
            Total users:
            <strong className="text-dark">24</strong>
          </span>
        </div>
        {/* User Table */}
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0">
            <thead>
              <tr>
                <th className="fw-bold">No.</th>
                <th className="fw-bold">Full Name</th>
                <th className="fw-bold">Phone</th>
                <th className="fw-bold">Specialty</th>
                <th className="fw-bold">Role</th>
                <th className="fw-bold">Note</th>
                <th className="fw-bold">Status</th>
                <th className="text-center fw-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div className="user-avatar">HD</div>
                    <h6 className="mb-0">Huỳnh Khánh Duy</h6>
                  </div>
                </td>
                <td>0901 234 567</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <span className="specialty-badge">Mathematics</span>
                    <span className="specialty-badge">Chemistry</span>
                    <span className="specialty-badge">Physics</span>
                  </div>
                </td>
                <td>
                  <span className="role-badge role-teacher">Teacher</span>
                </td>
                <td>
                  <span className="user-note">Main teacher - Grade 12</span>
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
                      data-bs-toggle="modal"
                      data-bs-target="#userDetailModal"
                    >
                      <i className="bi bi-pencil-square" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Change Status"
                      data-bs-toggle="modal"
                      data-bs-target="#changeStatusModal"
                    >
                      <i className="bi bi-arrow-repeat" />
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
                            <i className="bi bi-person-gear me-2" />
                            Edit Role
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-key me-2" />
                            Reset Password
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
                    <div className="user-avatar">AT</div>
                    <h6 className="mb-0">Âu Dương Tài</h6>
                  </div>
                </td>
                <td>0912 456 789</td>
                <td>
                  <span className="specialty-badge">Chemistry</span>
                </td>
                <td>
                  <span className="role-badge role-ta">Teaching Assistant</span>
                </td>
                <td>
                  <span className="user-note">Supports Grade 11</span>
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
                      data-bs-toggle="modal"
                      data-bs-target="#userDetailModal"
                    >
                      <i className="bi bi-pencil-square" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Change Status"
                      data-bs-toggle="modal"
                      data-bs-target="#changeStatusModal"
                    >
                      <i className="bi bi-arrow-repeat" />
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
                            <i className="bi bi-person-gear me-2" />
                            Edit Role
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-key me-2" />
                            Reset Password
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
                    <div className="user-avatar">HV</div>
                    <h6 className="mb-0">Hoàng Quốc Việt</h6>
                  </div>
                </td>
                <td>0988 765 432</td>
                <td>
                  <span className="text-muted">—</span>
                </td>
                <td>
                  <span className="role-badge role-admin">Admin Staff</span>
                </td>
                <td>
                  <span className="user-note">Tuition management</span>
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
                      data-bs-toggle="modal"
                      data-bs-target="#userDetailModal"
                    >
                      <i className="bi bi-pencil-square" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Change Status"
                      data-bs-toggle="modal"
                      data-bs-target="#changeStatusModal"
                    >
                      <i className="bi bi-arrow-repeat" />
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
                            <i className="bi bi-person-gear me-2" />
                            Edit Role
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-key me-2" />
                            Reset Password
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
                    <div className="user-avatar">NA</div>
                    <h6 className="mb-0">No Name ABC</h6>
                  </div>
                </td>
                <td>0934 111 222</td>
                <td>
                  <span className="specialty-badge">English</span>
                </td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <span className="role-badge role-teacher">Teacher</span>
                    <span className="role-badge role-manager">
                      Center Manager
                    </span>
                  </div>
                </td>
                <td>
                  <span className="user-note">Center owner</span>
                </td>
                <td>
                  <span className="status-badge status-locked">
                    <span />
                    Locked
                  </span>
                </td>
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="View / Edit"
                      data-bs-toggle="modal"
                      data-bs-target="#userDetailModal"
                    >
                      <i className="bi bi-pencil-square" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Change Status"
                      data-bs-toggle="modal"
                      data-bs-target="#changeStatusModal"
                    >
                      <i className="bi bi-arrow-repeat" />
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
                            <i className="bi bi-person-gear me-2" />
                            Edit Role
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-key me-2" />
                            Reset Password
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
          <span className="text-muted small">Showing 1 to 4 of 24 users</span>
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
