import { Link } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";

export default function AdminStaffClassPage() {
  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="Class Management"
        breadcrumbItems={[
          {
            label: "Admin Staff",
            path: "/admin-staff",
          },
          {
            label: "Classes",
          },
        ]}
        action={
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center"
          >
            <i className="bi bi-plus-square me-2" />
            Add Class
          </button>
        }
      />

      {/* Class Filters */}
      <div className="card user-list-card mb-4">
        <div className="card-header user-list-header">
          <div className="row g-3 align-items-center">
            <div className="col-xl-3 col-lg-6">
              <div className="user-search">
                <i className="bi bi-search" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by class name..."
                />
              </div>
            </div>
            <div className="col-xl col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Grades</option>
                <option>Grade 7</option>
                <option>Grade 8</option>
                <option>Grade 9</option>
              </select>
            </div>
            <div className="col-xl col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Subjects</option>
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Chemistry</option>
                <option>English</option>
                <option>Biology</option>
              </select>
            </div>
            <div className="col-xl col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Teachers</option>
                <option>Nguyen Van An</option>
                <option>Tran Minh Hoa</option>
                <option>Le Thu Trang</option>
                <option>Pham Minh Duc</option>
              </select>
            </div>
            <div className="col-xl col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>Sort by A-Z</option>
                <option>Sort by Z-A</option>
                <option>Newest</option>
                <option>Oldest</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      {/* Class List */}
      <div className="card user-list-card">
        <div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom">
          <div>
            <h5 className="mb-1 fw-bold">Class List</h5>
            <small className="text-muted">
              Manage classes, teachers and enrolled students
            </small>
          </div>
        </div>
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
            Total Classes:
            <strong className="text-dark">24</strong>
          </span>
        </div>
        {/* Table */}
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0">
            <thead>
              <tr>
                <th>No.</th>
                <th>Class Subject</th>
                <th>Teacher</th>
                <th>Teaching Assistant</th>
                <th>Students</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>
                  <strong>Mathematics - 7</strong>
                </td>
                <td>Nguyen Van An</td>
                <td>Le Minh Khoa</td>
                <td>
                  <span className="class-student-count">
                    <i className="bi bi-people me-1" />
                    25 Students
                  </span>
                </td>
                <td>01 Aug 2026</td>
                <td>31 May 2027</td>
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
                  </div>
                </td>
              </tr>
              <tr>
                <td>2</td>
                <td>
                  <strong>English - 7</strong>
                </td>
                <td>Le Thu Trang</td>
                <td>Tran Gia Bao</td>
                <td>
                  <span className="class-student-count">
                    <i className="bi bi-people me-1" />
                    21 Students
                  </span>
                </td>
                <td>01 Aug 2026</td>
                <td>31 May 2027</td>
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
                  </div>
                </td>
              </tr>
              <tr>
                <td>3</td>
                <td>
                  <strong>Physics - 8</strong>
                </td>
                <td>Tran Minh Hoa</td>
                <td>Nguyen Thanh Nam</td>
                <td>
                  <span className="class-student-count">
                    <i className="bi bi-people me-1" />
                    28 Students
                  </span>
                </td>
                <td>05 Aug 2026</td>
                <td>31 May 2027</td>
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
                  </div>
                </td>
              </tr>
              <tr>
                <td>4</td>
                <td>
                  <strong>Chemistry - 9</strong>
                </td>
                <td>Pham Minh Duc</td>
                <td>Hoang Gia Huy</td>
                <td>
                  <span className="class-student-count">
                    <i className="bi bi-people me-1" />
                    23 Students
                  </span>
                </td>
                <td>05 Aug 2026</td>
                <td>31 May 2027</td>
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
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="user-table-footer d-flex align-items-center justify-content-between flex-wrap gap-3">
          <span className="text-muted small">Showing 1 to 4 of 24 classes</span>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className="page-item disabled">
                <Link className="page-link" to="/admin-staff/classes">
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
