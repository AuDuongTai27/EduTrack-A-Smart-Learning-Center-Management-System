import { Link } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";

export default function AdminStaffDashboardPage() {
  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="Admin Staff Dashboard"
        breadcrumbItems={[
          { label: "Admin Staff", path: "/admin-staff" },
          { label: "Dashboard" },
        ]}
      />
      {/* Dashboard Summary */}
      <div className="row g-3 mb-4">
        {/* New Students */}
        <div className="col-xl-3 col-md-6">
          <div className="card dashboard-kpi h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-1">New Students</p>
                  <h3 className="mb-0">8</h3>
                </div>
                <div className="kpi-icon bg-primary-subtle text-primary">
                  <i className="bi bi-person-plus-fill" />
                </div>
              </div>
              <div className="border-top mt-3 pt-3">
                <span className="text-primary fw-semibold">
                  Pending processing
                </span>
                <span className="text-muted ms-2"> +5 this week </span>
              </div>
            </div>
          </div>
        </div>
        {/* Unpaid Students */}
        <div className="col-xl-3 col-md-6">
          <div className="card dashboard-kpi h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-1">Unpaid Students</p>
                  <h3 className="mb-0">24</h3>
                </div>
                <div className="kpi-icon bg-warning-subtle text-warning">
                  <i className="bi bi-person-exclamation" />
                </div>
              </div>
              <div className="border-top mt-3 pt-3">
                <span className="text-muted"> August 2026 </span>
              </div>
            </div>
          </div>
        </div>
        {/* Outstanding Tuition */}
        <div className="col-xl-3 col-md-6">
          <div className="card dashboard-kpi h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-1">Outstanding Tuition</p>
                  <h3 className="mb-0">18.5M</h3>
                </div>
                <div className="kpi-icon bg-danger-subtle text-danger">
                  <i className="bi bi-cash-stack" />
                </div>
              </div>
              <div className="border-top mt-3 pt-3">
                <span className="text-muted"> VND · August 2026 </span>
              </div>
            </div>
          </div>
        </div>
        {/* My Approval Requests */}
        <div className="col-xl-3 col-md-6">
          <div className="card dashboard-kpi h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-1">My Requests</p>
                  <h3 className="mb-0">3</h3>
                </div>
                <div className="kpi-icon bg-info-subtle text-info">
                  <i className="bi bi-send-check-fill" />
                </div>
              </div>
              <div className="border-top mt-3 pt-3">
                <span className="text-warning fw-semibold"> 3 Pending </span>
                <span className="text-muted ms-2"> 2 updated this week </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Welcome */}
      <div className="card dashboard-welcome mb-4">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <p className="welcome-subtitle mb-1">Welcome back</p>
              <h3 className="welcome-title mb-2">Admin Staff</h3>
              <p className="welcome-text mb-0">
                Here is an overview of today's tasks and activities.
              </p>
            </div>
            <div className="welcome-date">
              <i className="bi bi-calendar3 me-2" />
              Monday, 17 August 2026
            </div>
          </div>
        </div>
      </div>
      {/* Today's Schedule and Latest Notifications */}
      <div className="row g-4 mb-4">
        {/* Today's Schedule */}
        <div className="col-xl-7">
          <div className="card dashboard-card h-100">
            <div className="dashboard-card-header">
              <div>
                <h5>Today's Schedule</h5>
                <small>Monday, 17 August 2026</small>
              </div>
              <Link to="/admin-staff/schedule" className="dashboard-view-link">
                View Full Schedule
                <i className="bi bi-arrow-right ms-1" />
              </Link>
            </div>
            <div className="dashboard-card-body p-0">
              <div className="schedule-list">
                <div className="schedule-item">
                  <div className="schedule-time">
                    <strong>08:00</strong>
                    <span>09:30</span>
                  </div>
                  <div className="schedule-line" />
                  <div className="schedule-info">
                    <h6>Mathematics - 7</h6>
                    <div className="schedule-meta">
                      <span>
                        <i className="bi bi-person" />
                        Nguyen Van An
                      </span>
                      <span>
                        <i className="bi bi-geo-alt" />
                        Room 201
                      </span>
                    </div>
                  </div>
                  <span className="schedule-status schedule-ongoing">
                    Ongoing
                  </span>
                </div>
                <div className="schedule-item">
                  <div className="schedule-time">
                    <strong>10:00</strong>
                    <span>11:30</span>
                  </div>
                  <div className="schedule-line" />
                  <div className="schedule-info">
                    <h6>Physics - 8</h6>
                    <div className="schedule-meta">
                      <span>
                        <i className="bi bi-person" />
                        Tran Minh Hoa
                      </span>
                      <span>
                        <i className="bi bi-geo-alt" />
                        Room 305
                      </span>
                    </div>
                  </div>
                  <span className="schedule-status schedule-upcoming">
                    Upcoming
                  </span>
                </div>
                <div className="schedule-item">
                  <div className="schedule-time">
                    <strong>14:00</strong>
                    <span>15:30</span>
                  </div>
                  <div className="schedule-line" />
                  <div className="schedule-info">
                    <h6>English - 9</h6>
                    <div className="schedule-meta">
                      <span>
                        <i className="bi bi-person" />
                        Le Thu Trang
                      </span>
                      <span>
                        <i className="bi bi-geo-alt" />
                        Room 204
                      </span>
                    </div>
                  </div>
                  <span className="schedule-status schedule-upcoming">
                    Upcoming
                  </span>
                </div>
                <div className="schedule-item">
                  <div className="schedule-time">
                    <strong>18:00</strong>
                    <span>19:30</span>
                  </div>
                  <div className="schedule-line" />
                  <div className="schedule-info">
                    <h6>Chemistry - 8</h6>
                    <div className="schedule-meta">
                      <span>
                        <i className="bi bi-person" />
                        Pham Minh Duc
                      </span>
                      <span>
                        <i className="bi bi-geo-alt" />
                        Room 302
                      </span>
                    </div>
                  </div>
                  <span className="schedule-status schedule-upcoming">
                    Upcoming
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Latest Notifications */}
        <div className="col-xl-5">
          <div className="card dashboard-card h-100">
            <div className="dashboard-card-header">
              <div>
                <h5>Latest Notifications</h5>
                <small>Recent center updates</small>
              </div>
              <Link
                to="/admin-staff/notifications"
                className="dashboard-view-link"
              >
                View All
                <i className="bi bi-arrow-right ms-1" />
              </Link>
            </div>
            <div className="dashboard-card-body p-0">
              <div className="staff-notification-list">
                <div className="staff-notification-item">
                  <div className="staff-notification-icon">
                    <i className="bi bi-cash-stack" />
                  </div>
                  <div className="staff-notification-content">
                    <h6>Tuition Payment Reminder</h6>
                    <p>August tuition reminder has been scheduled.</p>
                    <small>30 minutes ago</small>
                  </div>
                </div>
                <div className="staff-notification-item">
                  <div className="staff-notification-icon">
                    <i className="bi bi-calendar-event" />
                  </div>
                  <div className="staff-notification-content">
                    <h6>Class Schedule Updated</h6>
                    <p>Mathematics - 7 schedule has been updated.</p>
                    <small>2 hours ago</small>
                  </div>
                </div>
                <div className="staff-notification-item">
                  <div className="staff-notification-icon">
                    <i className="bi bi-person-plus" />
                  </div>
                  <div className="staff-notification-content">
                    <h6>New Student Registered</h6>
                    <p>A new student registration requires processing.</p>
                    <small>4 hours ago</small>
                  </div>
                </div>
                <div className="staff-notification-item">
                  <div className="staff-notification-icon">
                    <i className="bi bi-check2-square" />
                  </div>
                  <div className="staff-notification-content">
                    <h6>Approval Request Updated</h6>
                    <p>Request AR0008 has been approved.</p>
                    <small>Yesterday</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Recent Approval Requests */}
      <div className="card user-list-card">
        <div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom">
          <div>
            <h5 className="mb-1 fw-bold">Recent Approval Requests</h5>
            <small className="text-muted">
              Latest requests submitted by you
            </small>
          </div>
          <a
            href="admin-staff-approval-requests.html"
            className="dashboard-view-link"
          >
            View All
            <i className="bi bi-arrow-right ms-1" />
          </a>
        </div>
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0">
            <thead>
              <tr>
                <th>No.</th>
                <th>Request Code</th>
                <th>Request Type</th>
                <th>Related To</th>
                <th>Submitted Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>
                  <strong>AR0008</strong>
                </td>
                <td>Tuition Adjustment</td>
                <td>Nguyen Minh An</td>
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
                  <strong>AR0007</strong>
                </td>
                <td>Due Date Extension</td>
                <td>Tran Gia Huy</td>
                <td>16 Aug 2026</td>
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
              <tr>
                <td>3</td>
                <td>
                  <strong>AR0006</strong>
                </td>
                <td>Tuition Adjustment</td>
                <td>Le Minh Long</td>
                <td>15 Aug 2026</td>
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
      </div>
    </>
  );
}
