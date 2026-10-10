import { Link } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";

export default function CenterManagerClassPage() {
  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="Class Management"
        breadcrumbItems={[
          { label: "Center Manager", path: "/center-manager" },
          { label: "Classes" },
        ]}
        action={
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
            <div className="mb-2">
              <button
                type="button"
                className="btn btn-primary d-flex align-items-center"
              >
                <i className="bi bi-plus-square me-2" />
                Add Class
              </button>
            </div>
          </div>
        }
      />

      {/* Class List */}
      <div className="card user-list-card">
        {/* Filter */}
        <div className="card-header user-list-header">
          <div className="row g-3 align-items-center">
            {/* Search */}
            <div className="col-xl-6 col-lg-6">
              <div className="user-search">
                <i className="bi bi-search" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by class name..."
                />
              </div>
            </div>
            {/* Status */}
            <div className="col-xl-3 col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Statuses</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            {/* Sort */}
            <div className="col-xl-3 col-lg-3 col-md-6">
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
            Total classes:
            <strong className="text-dark">6</strong>
          </span>
        </div>
        {/* Class Table */}
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0">
            <thead>
              <tr>
                <th className="fw-bold">No.</th>
                <th className="fw-bold">Class Name</th>
                <th className="fw-bold">Subjects</th>
                <th className="fw-bold">Students</th>
                <th className="fw-bold">Start Date</th>
                <th className="fw-bold">End Date</th>
                <th className="fw-bold">Status</th>
                <th className="text-center fw-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Class 1 */}
              <tr>
                <td>1</td>
                <td>
                  <h6 className="mb-0">Class 7</h6>
                </td>
                <td>4 Subjects</td>
                <td>25 Students</td>
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
                      data-bs-toggle="modal"
                      data-bs-target="#classDetailModal"
                    >
                      <i className="bi bi-pencil-square" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Change Status"
                      data-bs-toggle="modal"
                      data-bs-target="#changeClassStatusModal"
                    >
                      <i className="bi bi-arrow-repeat" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Manage Subjects"
                    >
                      <i className="bi bi-journals" />
                    </button>
                  </div>
                </td>
              </tr>
              {/* Class 2 */}
              <tr>
                <td>2</td>
                <td>
                  <h6 className="mb-0">Class 8</h6>
                </td>
                <td>5 Subjects</td>
                <td>30 Students</td>
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
                      data-bs-toggle="modal"
                      data-bs-target="#classDetailModal"
                    >
                      <i className="bi bi-pencil-square" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Change Status"
                      data-bs-toggle="modal"
                      data-bs-target="#changeClassStatusModal"
                    >
                      <i className="bi bi-arrow-repeat" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Manage Subjects"
                    >
                      <i className="bi bi-journals" />
                    </button>
                  </div>
                </td>
              </tr>
              {/* Class 3 */}
              <tr>
                <td>3</td>
                <td>
                  <h6 className="mb-0">Class 9</h6>
                </td>
                <td>4 Subjects</td>
                <td>22 Students</td>
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
                      data-bs-toggle="modal"
                      data-bs-target="#classDetailModal"
                    >
                      <i className="bi bi-pencil-square" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Change Status"
                      data-bs-toggle="modal"
                      data-bs-target="#changeClassStatusModal"
                    >
                      <i className="bi bi-arrow-repeat" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Manage Subjects"
                    >
                      <i className="bi bi-journals" />
                    </button>
                  </div>
                </td>
              </tr>
              {/* Class 4 */}
              <tr>
                <td>4</td>
                <td>
                  <h6 className="mb-0">Class 10</h6>
                </td>
                <td>5 Subjects</td>
                <td>28 Students</td>
                <td>10 Aug 2026</td>
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
                      data-bs-toggle="modal"
                      data-bs-target="#classDetailModal"
                    >
                      <i className="bi bi-pencil-square" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Change Status"
                      data-bs-toggle="modal"
                      data-bs-target="#changeClassStatusModal"
                    >
                      <i className="bi bi-arrow-repeat" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Manage Subjects"
                    >
                      <i className="bi bi-journals" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="user-table-footer d-flex align-items-center justify-content-between flex-wrap gap-3">
          <span className="text-muted small">Showing 1 to 4 of 6 classes</span>
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
