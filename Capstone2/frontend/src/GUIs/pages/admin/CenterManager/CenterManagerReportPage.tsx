import { Link } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";

export default function CenterManagerReportPage() {
  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="Reports"
        breadcrumbItems={[
          { label: "Center Manager", path: "/center-manager" },
          { label: "Reports" },
        ]}
        action={
          <div className="d-flex align-items-center gap-2 mb-2">
            <button
              type="button"
              className="btn btn-outline-primary d-flex align-items-center"
            >
              <i className="bi bi-file-earmark-excel me-2" />
              Export Excel
            </button>
            <button
              type="button"
              className="btn btn-outline-danger d-flex align-items-center"
            >
              <i className="bi bi-file-earmark-pdf me-2" />
              Export PDF
            </button>
          </div>
        }
      />

      {/* Report Filter */}
      <div className="card user-list-card mb-4">
        <div className="card-header user-list-header">
          <div className="row g-3 align-items-center">
            {/* Report Type */}
            <div className="col-xl-3 col-lg-4 col-md-6">
              <label className="form-label fw-semibold">Report Type</label>
              <select className="form-select">
                <option>Student Report</option>
                <option>Class Report</option>
                <option>Teaching Report</option>
                <option>Attendance &amp; Progress Report</option>
                <option selected>Tuition Report</option>
                <option>Revenue Report</option>
              </select>
            </div>
            {/* Time Range */}
            <div className="col-xl-2 col-lg-4 col-md-6">
              <label className="form-label fw-semibold">Time Range</label>
              <select className="form-select">
                <option>This Month</option>
                <option selected>August 2026</option>
                <option>Last Month</option>
                <option>This Quarter</option>
                <option>This Year</option>
              </select>
            </div>
            {/* Class */}
            <div className="col-xl-2 col-lg-4 col-md-6">
              <label className="form-label fw-semibold">Class</label>
              <select className="form-select">
                <option selected>All Classes</option>
                <option>Class 7</option>
                <option>Class 8</option>
                <option>Class 9</option>
              </select>
            </div>
            {/* Subject */}
            <div className="col-xl-2 col-lg-4 col-md-6">
              <label className="form-label fw-semibold">Subject</label>
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
            <div className="col-xl-2 col-lg-4 col-md-6">
              <label className="form-label fw-semibold">Status</label>
              <select className="form-select">
                <option selected>All Statuses</option>
                <option>Paid</option>
                <option>Partially Paid</option>
                <option>Unpaid</option>
                <option>Overdue</option>
              </select>
            </div>
            {/* Apply */}
            <div className="col-xl-1 col-lg-4 col-md-6">
              <label className="form-label d-block">&nbsp;</label>
              <button type="button" className="btn btn-primary w-100">
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Report Title */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h4 className="mb-1 fw-bold">Tuition Report</h4>
          <p className="text-muted mb-0">Tuition overview for August 2026</p>
        </div>
      </div>
      {/* Summary Cards */}
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
                <span className="text-muted">128 tuition records</span>
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
      {/* Report Charts */}
      <div className="row g-4 mb-4">
        {/* Tuition by Month */}
        <div className="col-xl-7">
          <div className="card dashboard-card h-100">
            <div className="dashboard-card-header">
              <div>
                <h5>Tuition by Month</h5>
                <small>Collected and outstanding tuition</small>
              </div>
            </div>
            <div className="dashboard-card-body">
              <div className="report-chart-container">
                <canvas id="tuitionReportChart" />
              </div>
            </div>
          </div>
        </div>
        {/* Payment Status */}
        <div className="col-xl-5">
          <div className="card dashboard-card h-100">
            <div className="dashboard-card-header">
              <div>
                <h5>Payment Status</h5>
                <small>Distribution of tuition records</small>
              </div>
            </div>
            <div className="dashboard-card-body">
              <div className="report-doughnut-container">
                <canvas id="paymentStatusChart" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Detailed Data */}
      <div className="card user-list-card">
        <div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom">
          <div>
            <h5 className="mb-1 fw-bold">Detailed Data</h5>
            <small className="text-muted">
              Tuition records included in this report
            </small>
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
        {/* Report Table */}
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
              <tr>
                <td>1</td>
                <td>
                  <h6 className="mb-0">Nguyen Minh An</h6>
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
                  <button
                    type="button"
                    className="btn table-action-btn"
                    title="View Details"
                  >
                    <i className="bi bi-eye" />
                  </button>
                </td>
              </tr>
              <tr>
                <td>2</td>
                <td>
                  <h6 className="mb-0">Tran Gia Huy</h6>
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
                  <button
                    type="button"
                    className="btn table-action-btn"
                    title="View Details"
                  >
                    <i className="bi bi-eye" />
                  </button>
                </td>
              </tr>
              <tr>
                <td>3</td>
                <td>
                  <h6 className="mb-0">Le Minh Long</h6>
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
                  <button
                    type="button"
                    className="btn table-action-btn"
                    title="View Details"
                  >
                    <i className="bi bi-eye" />
                  </button>
                </td>
              </tr>
              <tr>
                <td>4</td>
                <td>
                  <h6 className="mb-0">Pham Hoang Nam</h6>
                </td>
                <td>Class 8</td>
                <td>
                  <span className="specialty-badge"> Mathematics - 8 </span>
                </td>
                <td>August 2026</td>
                <td>
                  <strong>550,000 VND</strong>
                </td>
                <td>20 Aug 2026</td>
                <td>
                  <span className="tuition-status tuition-unpaid">
                    <span />
                    Unpaid
                  </span>
                </td>
                <td className="text-center">
                  <button
                    type="button"
                    className="btn table-action-btn"
                    title="View Details"
                  >
                    <i className="bi bi-eye" />
                  </button>
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
