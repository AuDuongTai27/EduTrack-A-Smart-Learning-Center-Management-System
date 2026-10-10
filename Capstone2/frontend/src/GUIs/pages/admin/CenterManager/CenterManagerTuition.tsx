import { Link } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";

export default function CenterManagerTuitionPage() {
  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="Tuition Management"
        breadcrumbItems={[
          { label: "Center Manager", path: "/center-manager" },
          { label: "Tuition Management" },
        ]}
        action={
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center"
          >
            <i className="bi bi-plus-square me-2" />
            Generate Tuition
          </button>
        }
      />

      {/* Tuition Summary */}
      <div className="row g-3 mb-4">
        {/* Total Tuition Due */}
        <div className="col-xl-3 col-md-6">
          <div className="card dashboard-kpi h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-1">Total Tuition Due</p>
                  <h3 className="mb-0">125M</h3>
                </div>
                <div className="kpi-icon bg-primary-subtle text-primary">
                  <i className="bi bi-receipt" />
                </div>
              </div>
              <div className="border-top mt-3 pt-3">
                <span className="text-muted">August 2026</span>
              </div>
            </div>
          </div>
        </div>
        {/* Collected */}
        <div className="col-xl-3 col-md-6">
          <div className="card dashboard-kpi h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-1">Collected</p>
                  <h3 className="mb-0">85M</h3>
                </div>
                <div className="kpi-icon bg-success-subtle text-success">
                  <i className="bi bi-cash-stack" />
                </div>
              </div>
              <div className="border-top mt-3 pt-3">
                <span className="text-success">68% collected</span>
              </div>
            </div>
          </div>
        </div>
        {/* Outstanding */}
        <div className="col-xl-3 col-md-6">
          <div className="card dashboard-kpi h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-1">Outstanding</p>
                  <h3 className="mb-0">40M</h3>
                </div>
                <div className="kpi-icon bg-warning-subtle text-warning">
                  <i className="bi bi-hourglass-split" />
                </div>
              </div>
              <div className="border-top mt-3 pt-3">
                <span className="text-muted">32% remaining</span>
              </div>
            </div>
          </div>
        </div>
        {/* Overdue */}
        <div className="col-xl-3 col-md-6">
          <div className="card dashboard-kpi h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-1">Overdue</p>
                  <h3 className="mb-0">12M</h3>
                </div>
                <div className="kpi-icon bg-danger-subtle text-danger">
                  <i className="bi bi-exclamation-circle" />
                </div>
              </div>
              <div className="border-top mt-3 pt-3">
                <span className="text-danger">18 students</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Tuition List */}
      <div className="card user-list-card">
        {/* Filter */}
        <div className="card-header user-list-header">
          <div className="row g-3 align-items-center">
            {/* Search */}
            <div className="col-xl-3 col-lg-6">
              <div className="user-search">
                <i className="bi bi-search" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search student..."
                />
              </div>
            </div>
            {/* Tuition Period */}
            <div className="col-xl col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Periods</option>
                <option>August 2026</option>
                <option>September 2026</option>
                <option>October 2026</option>
              </select>
            </div>
            {/* Class */}
            <div className="col-xl col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Classes</option>
                <option>Class 7</option>
                <option>Class 8</option>
                <option>Class 9</option>
              </select>
            </div>
            {/* Subject */}
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
            {/* Status */}
            <div className="col-xl col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Statuses</option>
                <option>Paid</option>
                <option>Partially Paid</option>
                <option>Unpaid</option>
                <option>Overdue</option>
                <option>Pending Adjustment</option>
              </select>
            </div>
            {/* Sort */}
            <div className="col-xl col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>Sort by Newest</option>
                <option>Sort by Oldest</option>
                <option>Amount High-Low</option>
                <option>Amount Low-High</option>
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
            Total records:
            <strong className="text-dark">128</strong>
          </span>
        </div>
        {/* Tuition Table */}
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0">
            <thead>
              <tr>
                <th className="fw-bold">No.</th>
                <th className="fw-bold">Student</th>
                <th className="fw-bold">Class</th>
                <th className="fw-bold">Subjects</th>
                <th className="fw-bold">Period</th>
                <th className="fw-bold">Total Due</th>
                <th className="fw-bold">Due Date</th>
                <th className="fw-bold">Status</th>
                <th className="text-center fw-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Tuition 1 */}
              <tr>
                <td>1</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div className="user-avatar">NA</div>
                    <h6 className="mb-0">Nguyen Minh An</h6>
                  </div>
                </td>
                <td>Class 7</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <span className="specialty-badge"> Mathematics - 7 </span>
                    <span className="specialty-badge"> English - 7 </span>
                  </div>
                </td>
                <td>August 2026</td>
                <td>
                  <strong>1,000,000 VND</strong>
                </td>
                <td>15 Aug 2026</td>
                <td>
                  <span className="tuition-status tuition-partial">
                    <span />
                    Partially Paid
                  </span>
                </td>
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    {/* View / Edit */}
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="View / Edit"
                      data-bs-toggle="modal"
                      data-bs-target="#tuitionDetailModal"
                    >
                      <i className="bi bi-pencil-square" />
                    </button>
                    {/* Record Payment */}
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Record Payment"
                    >
                      <i className="bi bi-cash-stack" />
                    </button>
                    {/* Change Status */}
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Change Status"
                    >
                      <i className="bi bi-arrow-repeat" />
                    </button>
                    {/* More */}
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
                            <i className="bi bi-bell me-2" />
                            Send Reminder
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-calendar-plus me-2" />
                            Extend Due Date
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </td>
              </tr>
              {/* Tuition 2 */}
              <tr>
                <td>2</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div className="user-avatar">TH</div>
                    <h6 className="mb-0">Tran Gia Huy</h6>
                  </div>
                </td>
                <td>Class 8</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <span className="specialty-badge"> Chemistry - 8 </span>
                    <span className="specialty-badge"> Mathematics - 8 </span>
                  </div>
                </td>
                <td>August 2026</td>
                <td>
                  <strong>1,100,000 VND</strong>
                </td>
                <td>15 Aug 2026</td>
                <td>
                  <span className="tuition-status tuition-paid">
                    <span />
                    Paid
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
                      title="Record Payment"
                    >
                      <i className="bi bi-cash-stack" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Change Status"
                    >
                      <i className="bi bi-arrow-repeat" />
                    </button>
                    <div className="dropdown">
                      <button
                        className="btn table-action-btn"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i className="bi bi-three-dots-vertical" />
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-bell me-2" />
                            Send Reminder
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-calendar-plus me-2" />
                            Extend Due Date
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </td>
              </tr>
              {/* Tuition 3 */}
              <tr>
                <td>3</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div className="user-avatar">ML</div>
                    <h6 className="mb-0">Le Minh Long</h6>
                  </div>
                </td>
                <td>Class 9</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <span className="specialty-badge"> Physics - 9 </span>
                    <span className="specialty-badge"> English - 9 </span>
                  </div>
                </td>
                <td>August 2026</td>
                <td>
                  <strong>1,200,000 VND</strong>
                </td>
                <td>10 Aug 2026</td>
                <td>
                  <span className="tuition-status tuition-overdue">
                    <span />
                    Overdue
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
                      title="Record Payment"
                    >
                      <i className="bi bi-cash-stack" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Change Status"
                    >
                      <i className="bi bi-arrow-repeat" />
                    </button>
                    <div className="dropdown">
                      <button
                        className="btn table-action-btn"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i className="bi bi-three-dots-vertical" />
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-bell me-2" />
                            Send Reminder
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-calendar-plus me-2" />
                            Extend Due Date
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </td>
              </tr>
              {/* Tuition 4 */}
              <tr>
                <td>4</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div className="user-avatar">PN</div>
                    <h6 className="mb-0">Pham Hoang Nam</h6>
                  </div>
                </td>
                <td>Class 8</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <span className="specialty-badge"> Mathematics - 8 </span>
                  </div>
                </td>
                <td>August 2026</td>
                <td>
                  <strong>550,000 VND</strong>
                </td>
                <td>20 Aug 2026</td>
                <td>
                  <span className="tuition-status tuition-pending">
                    <span />
                    Pending Adjustment
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
                      title="Record Payment"
                    >
                      <i className="bi bi-cash-stack" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Change Status"
                    >
                      <i className="bi bi-arrow-repeat" />
                    </button>
                    <div className="dropdown">
                      <button
                        className="btn table-action-btn"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i className="bi bi-three-dots-vertical" />
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-bell me-2" />
                            Send Reminder
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="#">
                            <i className="bi bi-calendar-plus me-2" />
                            Extend Due Date
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
            Showing 1 to 4 of 128 records
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
