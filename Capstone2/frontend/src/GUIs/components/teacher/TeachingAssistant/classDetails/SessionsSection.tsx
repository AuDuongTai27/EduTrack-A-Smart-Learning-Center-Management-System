import { Link } from "react-router-dom";

export default function SessionsSection() {
  return (
    <details className="card class-list-card border-0 mb-4" open>
      <summary className="class-list-header d-flex align-items-center justify-content-between cursor-pointer py-3 px-4">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-calendar-week-fill text-primary fs-5" />
          <h4 className="class-list-title mb-0">Class Sessions</h4>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small">Toggle Section</span>
          <i className="bi bi-chevron-down details-chevron text-muted" />
        </div>
      </summary>
      <div className="table-responsive-container">
        <table className="table custom-table align-middle mb-0">
          <thead>
            <tr>
              <th>Lesson Title</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Note</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {/* Lesson 1 */}
            <tr className="session-row-ended">
              <td className="fw-semibold text-dark">
                <i className="bi bi-book me-1 text-muted" /> Lesson 1:
                Introduction to Motion &amp; Kinematics
              </td>
              <td>Aug 03, 2026</td>
              <td>08:00 AM - 10:00 AM</td>
              <td>
                <span className="badge bg-secondary-subtle text-secondary-emphasis fw-medium px-2.5 py-1">
                  Ended
                </span>
              </td>
              <td className="text-muted small" />
              <td className="text-end">
                <Link
                  to="/teaching-assistant/classes/class-1-a/attendance"
                  className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                >
                  <i className="bi bi-clipboard-check" /> Attendance
                </Link>
              </td>
            </tr>
            <tr className="session-row-ended session-docs-row">
              <td colSpan={6} className="pt-0 pb-3 px-4">
                <details
                  className="session-docs-details fw-normal"
                  open
                >
                  <summary className="cursor-pointer d-inline-flex align-items-center gap-1 text-primary small">
                    <i className="bi bi-paperclip" /> Learning Documents
                    (1)
                    <i className="bi bi-chevron-down details-chevron text-muted small ms-1" />
                  </summary>
                  <div className="session-docs-container">
                    <div className="session-docs-header">
                      <span className="session-docs-title">
                        Documents
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <a href="#" className="session-doc-link">
                        <i className="bi bi-file-earmark-pdf-fill text-danger fs-6" />
                        Lesson1.pdf
                      </a>
                      <small className="text-muted ms-auto">2.4 MB</small>
                    </div>
                  </div>
                </details>
              </td>
            </tr>
            {/* Lesson 2 */}
            <tr className="session-row-cancelled">
              <td className="fw-semibold text-dark">
                <i className="bi bi-book me-1 text-muted" /> Lesson 2:
                Forces and Newton's Laws
              </td>
              <td>Aug 07, 2026</td>
              <td>08:00 AM - 10:00 AM</td>
              <td>
                <span className="badge bg-danger-subtle text-danger fw-medium px-2.5 py-1">
                  Cancelled
                </span>
              </td>
              <td>
                <span className="text-danger small">
                  <i className="bi bi-info-circle me-1" />
                  Class cancelled due to storm. Rescheduled to Aug 21,
                  2026.
                </span>
              </td>
              <td className="text-end">
                <Link
                  to="/teaching-assistant/classes/class-1-a/attendance"
                  className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                >
                  <i className="bi bi-clipboard-check" /> Attendance
                </Link>
              </td>
            </tr>
            <tr className="session-row-cancelled session-docs-row">
              <td colSpan={6} className="pt-0 pb-3 px-4">
                <details
                  className="session-docs-details fw-normal"
                  open
                >
                  <summary className="cursor-pointer d-inline-flex align-items-center gap-1 text-primary small">
                    <i className="bi bi-paperclip" /> Learning Documents
                    (1)
                    <i className="bi bi-chevron-down details-chevron text-muted small ms-1" />
                  </summary>
                  <div className="session-docs-container">
                    <div className="session-docs-header">
                      <span className="session-docs-title">
                        Documents
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <a href="#" className="session-doc-link">
                        <i className="bi bi-file-earmark-pdf-fill text-danger fs-6" />
                        Lesson2.pdf
                      </a>
                      <small className="text-muted ms-auto">1.8 MB</small>
                    </div>
                  </div>
                </details>
              </td>
            </tr>
            {/* Lesson 3 */}
            <tr>
              <td className="fw-semibold text-dark">
                <i className="bi bi-book me-1 text-primary" /> Lesson 3:
                Work, Energy and Power
              </td>
              <td>Aug 17, 2026</td>
              <td>02:00 PM - 04:00 PM</td>
              <td>
                <span className="badge bg-success-subtle text-success fw-medium px-2.5 py-1">
                  Ongoing
                </span>
              </td>
              <td className="text-muted small" />
              <td className="text-end">
                <Link
                  to="/teaching-assistant/classes/class-1-a/attendance"
                  className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                >
                  <i className="bi bi-clipboard-check" /> Attendance
                </Link>
              </td>
            </tr>
            <tr className="session-docs-row">
              <td colSpan={6} className="pt-0 pb-3 px-4">
                <details
                  className="session-docs-details fw-normal"
                  open
                >
                  <summary className="cursor-pointer d-inline-flex align-items-center gap-1 text-primary small">
                    <i className="bi bi-paperclip" /> Learning Documents
                    (1)
                    <i className="bi bi-chevron-down details-chevron text-muted small ms-1" />
                  </summary>
                  <div className="session-docs-container">
                    <div className="session-docs-header">
                      <span className="session-docs-title">
                        Documents
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <a href="#" className="session-doc-link">
                        <i className="bi bi-file-earmark-pdf-fill text-danger fs-6" />
                        Lesson3.pdf
                      </a>
                      <small className="text-muted ms-auto">3.1 MB</small>
                    </div>
                  </div>
                </details>
              </td>
            </tr>
            <tr>
              <td className="fw-semibold text-dark">
                <i className="bi bi-book me-1 text-warning" /> Lesson 2
                (Make-up): Forces and Newton's Laws
              </td>
              <td>Aug 21, 2026</td>
              <td>08:00 AM - 10:00 AM</td>
              <td>
                <span className="badge bg-warning-subtle text-warning-emphasis fw-medium px-2.5 py-1">
                  Re-scheduled
                </span>
              </td>
              <td className="text-muted small">
                Make-up session replacing Aug 07 class
              </td>
              <td className="text-end">
                <Link
                  to="/teaching-assistant/classes/class-1-a/attendance"
                  className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                >
                  <i className="bi bi-clipboard-check" /> Attendance
                </Link>
              </td>
            </tr>
            <tr>
              <td className="fw-semibold text-dark">
                <i className="bi bi-book me-1 text-info" /> Lesson 4:
                Momentum and Impulse
              </td>
              <td>Aug 24, 2026</td>
              <td>08:00 AM - 10:00 AM</td>
              <td>
                <span className="badge bg-info-subtle text-info-emphasis fw-medium px-2.5 py-1">
                  Scheduled
                </span>
              </td>
              <td className="text-muted small" />
              <td className="text-end">
                <Link
                  to="/teaching-assistant/classes/class-1-a/attendance"
                  className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                >
                  <i className="bi bi-clipboard-check" /> Attendance
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  );
}
