import { Link } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";

export default function CenterManagerNotificationPage() {
  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="Notification Management"
        breadcrumbItems={[
          { label: "Center Manager", path: "/center-manager" },
          { label: "Notification Management" },
        ]}
        action={
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center"
          >
            <i className="bi bi-plus-square me-2" />
            New Notification
          </button>
        }
      />

      {/* Filter */}
      <div className="card user-list-card mb-4">
        <div className="card-header user-list-header">
          <div className="row g-3 align-items-center">
            <div className="col-xl-4 col-lg-6">
              <div className="user-search">
                <i className="bi bi-search" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search notifications..."
                />
              </div>
            </div>
            <div className="col-xl-2 col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Types</option>
                <option>Announcement</option>
                <option>Tuition Reminder</option>
                <option>Schedule Update</option>
                <option>Academic Notice</option>
              </select>
            </div>
            <div className="col-xl-2 col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Recipients</option>
                <option>Entire Center</option>
                <option>Role</option>
                <option>Class</option>
                <option>Class Subject</option>
                <option>Specific Users</option>
              </select>
            </div>
            <div className="col-xl-2 col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>All Statuses</option>
                <option>Draft</option>
                <option>Scheduled</option>
                <option>Sent</option>
                <option>Cancelled</option>
              </select>
            </div>
            <div className="col-xl-2 col-lg-3 col-md-6">
              <select className="form-select">
                <option selected>Sort by Newest</option>
                <option>Sort by Oldest</option>
                <option>Title A-Z</option>
                <option>Title Z-A</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      {/* Notification Content */}
      <div className="row g-4">
        {/* Notification List */}
        <div className="col-xl-5">
          <div className="card notification-card">
            <div className="notification-card-header">
              <div>
                <h5 className="mb-1">Notification List</h5>
                <small>12 notifications</small>
              </div>
            </div>
            <div className="notification-list">
              <div className="notification-item active">
                <div className="notification-item-top">
                  <h6>Tuition Payment Reminder</h6>
                  <span className="notification-status status-scheduled">
                    Scheduled
                  </span>
                </div>
                <p className="notification-summary">
                  Reminder for students with outstanding tuition payments.
                </p>
                <div className="notification-meta">
                  <span>
                    <i className="bi bi-people me-1" />
                    Parents
                  </span>
                  <span>
                    <i className="bi bi-clock me-1" />
                    18 Aug 2026
                  </span>
                </div>
              </div>
              <div className="notification-item">
                <div className="notification-item-top">
                  <h6>Class Schedule Updated</h6>
                  <span className="notification-status status-sent">Sent</span>
                </div>
                <p className="notification-summary">
                  Updated schedule for Mathematics - 7.
                </p>
                <div className="notification-meta">
                  <span>
                    <i className="bi bi-people me-1" />
                    Mathematics - 7
                  </span>
                  <span>
                    <i className="bi bi-clock me-1" />
                    16 Aug 2026
                  </span>
                </div>
              </div>
              <div className="notification-item">
                <div className="notification-item-top">
                  <h6>September Academic Notice</h6>
                  <span className="notification-status status-draft">
                    Draft
                  </span>
                </div>
                <p className="notification-summary">
                  General academic announcement for the entire center.
                </p>
                <div className="notification-meta">
                  <span>
                    <i className="bi bi-people me-1" />
                    Entire Center
                  </span>
                  <span>
                    <i className="bi bi-clock me-1" />
                    15 Aug 2026
                  </span>
                </div>
              </div>
              <div className="notification-item">
                <div className="notification-item-top">
                  <h6>Physics Class Cancellation</h6>
                  <span className="notification-status status-cancelled">
                    Cancelled
                  </span>
                </div>
                <p className="notification-summary">
                  Previous scheduled notice for Physics - 9.
                </p>
                <div className="notification-meta">
                  <span>
                    <i className="bi bi-people me-1" />
                    Physics - 9
                  </span>
                  <span>
                    <i className="bi bi-clock me-1" />
                    14 Aug 2026
                  </span>
                </div>
              </div>
            </div>
            <div className="notification-list-footer d-flex align-items-center justify-content-between">
              <small className="text-muted">Showing 1 to 4 of 12</small>
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
        </div>
        {/* Notification Preview */}
        <div className="col-xl-7">
          <div className="card notification-card">
            <div className="notification-preview-header">
              <div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <h5 className="mb-0">Tuition Payment Reminder</h5>
                  <span className="notification-status status-scheduled">
                    Scheduled
                  </span>
                </div>
                <small className="text-muted">
                  Created on 17 Aug 2026 at 10:30 AM
                </small>
              </div>
              <button
                type="button"
                className="btn table-action-btn"
                title="More actions"
              >
                <i className="bi bi-three-dots-vertical" />
              </button>
            </div>
            <div className="notification-preview-body">
              <div className="notification-info-grid">
                <div>
                  <span className="notification-label">Type</span>
                  <strong>Tuition Reminder</strong>
                </div>
                <div>
                  <span className="notification-label">Sender</span>
                  <strong>Center Manager</strong>
                </div>
                <div>
                  <span className="notification-label">Recipients</span>
                  <strong>Parents</strong>
                </div>
                <div>
                  <span className="notification-label">Scheduled Time</span>
                  <strong>18 Aug 2026 - 08:00 AM</strong>
                </div>
              </div>
              <hr />
              <div className="notification-message">
                <span className="notification-label">Message</span>
                <p>Dear Parent,</p>
                <p>
                  This is a reminder that the tuition payment for August 2026 is
                  currently outstanding. Please complete the payment before the
                  due date to avoid an overdue status.
                </p>
                <p className="mb-0">Thank you for your cooperation.</p>
              </div>
              <hr />
              <div>
                <span className="notification-label">Attachment</span>
                <div className="notification-attachment">
                  <div>
                    <strong>tuition-notice.pdf</strong>
                    <small>248 KB</small>
                  </div>
                  <button
                    type="button"
                    className="btn table-action-btn"
                    title="View Attachment"
                  >
                    <i className="bi bi-eye" />
                  </button>
                </div>
              </div>
            </div>
            <div className="notification-preview-footer">
              <button type="button" className="btn btn-outline-danger">
                Cancel Schedule
              </button>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-light border">
                  Edit
                </button>
                <button type="button" className="btn btn-primary">
                  Send Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
