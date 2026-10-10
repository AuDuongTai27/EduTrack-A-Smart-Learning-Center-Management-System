import { Link } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";

export default function AdminStaffApprovalRequestPage() {
  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="My Approval Requests"
        breadcrumbItems={[
          {
            label: "Admin Staff",
            path: "/admin-staff",
          },
          {
            label: "My Approval Requests",
          },
        ]}
        action={
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center"
          >
            <i className="bi bi-plus-square me-2" />
            New Request
          </button>
        }
      />
      {/* Approval Request Filters */}
      <div className="card user-list-card mb-4">
        <div className="card-header user-list-header">
          <div className="row g-3 align-items-center">
            <div className="col-xl-3 col-lg-6">
              <div className="user-search">
                <i className="bi bi-search" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by request code..."
                />
              </div>
            </div>
            <div className="col-xl col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Request Types</option>
                <option>Tuition Adjustment</option>
                <option>Due Date Extension</option>
                <option>Refund Request</option>
                <option>Student Information Change</option>
              </select>
            </div>
            <div className="col-xl col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Priorities</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div className="col-xl col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Statuses</option>
                <option>Draft</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>
            </div>
            <div className="col-xl col-lg-3 col-md-6">
              <input
                type="date"
                className="form-control"
                title="Submitted Date"
              />
            </div>
            <div className="col-xl col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>Sort by Newest</option>
                <option>Sort by Oldest</option>
                <option>Priority High-Low</option>
                <option>Priority Low-High</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      {/* Approval Request List */}
      <div className="card user-list-card">
        <div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom">
          <div>
            <h5 className="mb-1 fw-bold">Approval Request List</h5>
            <small className="text-muted">
              Track requests submitted for Center Manager approval
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
            Total Requests:
            <strong className="text-dark">12</strong>
          </span>
        </div>
        {/* Table */}
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0">
            <thead>
              <tr>
                <th>No.</th>
                <th>Request Code</th>
                <th>Request Type</th>
                <th>Related To</th>
                <th>Request Content</th>
                <th>Submitted Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Draft */}
              <tr>
                <td>1</td>
                <td>
                  <strong>AR0012</strong>
                </td>
                <td>Tuition Adjustment</td>
                <td>Nguyen Minh An</td>
                <td>Request 20% tuition discount for August.</td>
                <td>—</td>
                <td>
                  <span className="priority-badge priority-medium">Medium</span>
                </td>
                <td>
                  <span className="approval-status approval-draft">Draft</span>
                </td>
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="View Details"
                    >
                      <i className="bi bi-eye" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Edit Draft"
                    >
                      <i className="bi bi-pencil-square" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Submit Request"
                    >
                      <i className="bi bi-send" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn text-danger"
                      title="Delete Draft"
                    >
                      <i className="bi bi-trash" />
                    </button>
                  </div>
                </td>
              </tr>
              {/* Pending */}
              <tr>
                <td>2</td>
                <td>
                  <strong>AR0011</strong>
                </td>
                <td>Due Date Extension</td>
                <td>Tran Gia Huy</td>
                <td>Extend tuition due date to 25 Aug 2026.</td>
                <td>17 Aug 2026</td>
                <td>
                  <span className="priority-badge priority-high"> High </span>
                </td>
                <td>
                  <span className="approval-status approval-pending">
                    Pending
                  </span>
                </td>
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="View Details"
                    >
                      <i className="bi bi-eye" />
                    </button>
                    <button
                      type="button"
                      className="btn table-action-btn"
                      title="Withdraw Request"
                    >
                      <i className="bi bi-arrow-counterclockwise" />
                    </button>
                  </div>
                </td>
              </tr>
              {/* Approved */}
              <tr>
                <td>3</td>
                <td>
                  <strong>AR0010</strong>
                </td>
                <td>Tuition Adjustment</td>
                <td>Le Minh Long</td>
                <td>Request tuition adjustment for Physics - 9.</td>
                <td>15 Aug 2026</td>
                <td>
                  <span className="priority-badge priority-medium">Medium</span>
                </td>
                <td>
                  <span className="approval-status approval-approved">
                    Approved
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
              {/* Rejected */}
              <tr>
                <td>4</td>
                <td>
                  <strong>AR0009</strong>
                </td>
                <td>Refund Request</td>
                <td>Pham Hoang Nam</td>
                <td>Request refund for duplicated tuition payment.</td>
                <td>12 Aug 2026</td>
                <td>
                  <span className="priority-badge priority-low"> Low </span>
                </td>
                <td>
                  <span className="approval-status approval-rejected">
                    Rejected
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
            Showing 1 to 4 of 12 requests
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
