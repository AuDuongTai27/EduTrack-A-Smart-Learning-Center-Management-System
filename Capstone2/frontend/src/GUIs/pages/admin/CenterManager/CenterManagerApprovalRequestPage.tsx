import { Link } from "react-router-dom";

export default function CenterManagerApprovalRequestPage() {
  return (
    <>
      {/* Breadcrumb */}
      <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
        <div className="my-auto mb-2">
          <h3 className="page-title mb-1">Approval Requests</h3>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/center-manager/dashboard">Dashboard</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Approval Requests
              </li>
            </ol>
          </nav>
        </div>
      </div>
      {/* Approval Request List */}
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
                  placeholder="Search request code or student..."
                />
              </div>
            </div>
            {/* Request Type */}
            <div className="col-xl-2 col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Request Types</option>
                <option>Tuition Adjustment</option>
                <option>Refund</option>
                <option>Credit</option>
                <option>Due Date Extension</option>
                <option>Student Information Change</option>
              </select>
            </div>
            {/* Status */}
            <div className="col-xl-2 col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Statuses</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
                <option>Cancelled</option>
              </select>
            </div>
            {/* Priority */}
            <div className="col-xl-2 col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Priorities</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            {/* Sort */}
            <div className="col-xl-2 col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>Sort by Newest</option>
                <option>Sort by Oldest</option>
                <option>Priority High-Low</option>
                <option>Priority Low-High</option>
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
            Total requests:
            <strong className="text-dark">12</strong>
          </span>
        </div>
        {/* Approval Request Table */}
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0">
            <thead>
              <tr>
                <th className="fw-bold">No.</th>
                <th className="fw-bold">Request Code</th>
                <th className="fw-bold">Request Type</th>
                <th className="fw-bold">Related To</th>
                <th className="fw-bold">Requested By</th>
                <th className="fw-bold">Submitted Date</th>
                <th className="fw-bold">Priority</th>
                <th className="fw-bold">Status</th>
                <th className="text-center fw-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Request 1 */}
              <tr>
                <td>1</td>
                <td>
                  <strong>AR0001</strong>
                </td>
                <td>Tuition Adjustment</td>
                <td>
                  <div>
                    <h6 className="mb-1">Nguyen Minh An</h6>
                  </div>
                </td>
                <td>Admin Staff</td>
                <td>17 Aug 2026</td>
                <td>
                  <span className="priority-badge priority-high"> High </span>
                </td>
                <td>
                  <span className="approval-status approval-pending">
                    <span />
                    Pending
                  </span>
                </td>
                <td className="text-center">
                  <button
                    type="button"
                    className="btn table-action-btn"
                    title="View Request"
                    data-bs-toggle="modal"
                    data-bs-target="#approvalRequestModal"
                  >
                    <i className="bi bi-eye" />
                  </button>
                </td>
              </tr>
              {/* Request 2 */}
              <tr>
                <td>2</td>
                <td>
                  <strong>AR0002</strong>
                </td>
                <td>Refund</td>
                <td>
                  <div>
                    <h6 className="mb-1">Tran Gia Huy</h6>
                  </div>
                </td>
                <td>Admin Staff</td>
                <td>16 Aug 2026</td>
                <td>
                  <span className="priority-badge priority-medium">Medium</span>
                </td>
                <td>
                  <span className="approval-status approval-approved">
                    <span />
                    Approved
                  </span>
                </td>
                <td className="text-center">
                  <button
                    type="button"
                    className="btn table-action-btn"
                    title="View Request"
                    data-bs-toggle="modal"
                    data-bs-target="#approvalRequestModal"
                  >
                    <i className="bi bi-eye" />
                  </button>
                </td>
              </tr>
              {/* Request 3 */}
              <tr>
                <td>3</td>
                <td>
                  <strong>AR0003</strong>
                </td>
                <td>Due Date Extension</td>
                <td>
                  <div>
                    <h6 className="mb-1">Le Minh Long</h6>
                  </div>
                </td>
                <td>Admin Staff</td>
                <td>15 Aug 2026</td>
                <td>
                  <span className="priority-badge priority-low"> Low </span>
                </td>
                <td>
                  <span className="approval-status approval-rejected">
                    <span />
                    Rejected
                  </span>
                </td>
                <td className="text-center">
                  <button
                    type="button"
                    className="btn table-action-btn"
                    title="View Request"
                    data-bs-toggle="modal"
                    data-bs-target="#approvalRequestModal"
                  >
                    <i className="bi bi-eye" />
                  </button>
                </td>
              </tr>
              {/* Request 4 */}
              <tr>
                <td>4</td>
                <td>
                  <strong>AR0004</strong>
                </td>
                <td>Credit</td>
                <td>
                  <div>
                    <h6 className="mb-1">Pham Hoang Nam</h6>
                  </div>
                </td>
                <td>Admin Staff</td>
                <td>14 Aug 2026</td>
                <td>
                  <span className="priority-badge priority-medium">Medium</span>
                </td>
                <td>
                  <span className="approval-status approval-pending">
                    <span />
                    Pending
                  </span>
                </td>
                <td className="text-center">
                  <button
                    type="button"
                    className="btn table-action-btn"
                    title="View Request"
                    data-bs-toggle="modal"
                    data-bs-target="#approvalRequestModal"
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
            Showing 1 to 4 of 12 requests
          </span>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className="page-item disabled">
                <Link
                  className="page-link"
                  to="/center-manager/approval-requests"
                >
                  <i className="bi bi-chevron-left" />
                </Link>
              </li>
              <li className="page-item active">
                <Link
                  className="page-link"
                  to="/center-manager/approval-requests"
                >
                  1
                </Link>
              </li>
              <li className="page-item">
                <Link
                  className="page-link"
                  to="/center-manager/approval-requests"
                >
                  2
                </Link>
              </li>
              <li className="page-item">
                <Link
                  className="page-link"
                  to="/center-manager/approval-requests"
                >
                  3
                </Link>
              </li>
              <li className="page-item">
                <Link
                  className="page-link"
                  to="/center-manager/approval-requests"
                >
                  <i className="bi bi-chevron-right" />
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      {/* Approval Request Modal */}
      <div
        className="modal fade"
        id="approvalRequestModal"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h5 className="modal-title">Approval Request</h5>
                <small className="text-muted">Request Code: AR0001</small>
              </div>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label text-muted">Request Type</label>
                  <p className="fw-semibold mb-0">Tuition Adjustment</p>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">Priority</label>
                  <div>
                    <span className="priority-badge priority-high">High</span>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">Student</label>
                  <p className="fw-semibold mb-0">Nguyen Minh An</p>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">Subject</label>
                  <p className="fw-semibold mb-0">Mathematics - 7</p>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">
                    Current Tuition
                  </label>
                  <p className="fw-semibold mb-0">500,000 VND</p>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">
                    Requested Tuition
                  </label>
                  <p className="fw-semibold text-primary mb-0">300,000 VND</p>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">Requested By</label>
                  <p className="fw-semibold mb-0">Admin Staff</p>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">
                    Submitted Date
                  </label>
                  <p className="fw-semibold mb-0">17 Aug 2026</p>
                </div>
                <div className="col-12">
                  <label className="form-label text-muted">Reason</label>
                  <div className="border rounded p-3 bg-light">
                    Parent requested a tuition reduction due to temporary
                    financial difficulties.
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label text-muted">
                    Request Status
                  </label>
                  <div>
                    <span className="approval-status approval-pending">
                      <span />
                      Pending
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button type="button" className="btn btn-outline-danger">
                Reject
              </button>
              <button type="button" className="btn btn-success">
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
