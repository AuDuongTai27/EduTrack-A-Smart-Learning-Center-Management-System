import { Link } from "react-router-dom";

export interface AssignmentsSectionProps {
  classId?: string | number;
}

export default function AssignmentsSection({ classId = "1" }: AssignmentsSectionProps) {
  return (
    <details className="card class-list-card border-0 mb-4" open>
      <summary className="class-list-header d-flex align-items-center justify-content-between cursor-pointer py-3 px-4">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-journal-text text-primary fs-5" />
          <h4 className="class-list-title mb-0">Class Assignments</h4>
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
              <th>Title</th>
              <th>Creation Date</th>
              <th>Deadline &amp; Estimated Time</th>
              <th>Grading Status</th>
              <th>Overall Grade (Out of 10)</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {/* Assignment 1 */}
            <tr>
              <td className="fw-semibold text-dark">
                <Link
                  to={`/teaching-assistant/classes/${classId}/assignment/1`}
                  className="text-decoration-none text-dark"
                >
                  <i className="bi bi-file-earmark-text me-1 text-primary" />{" "}
                  Assignment 1: Kinematics Problem Set
                </Link>
              </td>
              <td>Aug 04, 2026</td>
              <td>
                Aug 11, 2026
                <span className="badge bg-secondary-subtle text-secondary ms-1 fw-normal">
                  Expired
                </span>
              </td>
              <td>
                <span className="badge bg-success-subtle text-success fw-medium px-2.5 py-1">
                  Graded
                </span>
              </td>
              <td>
                <span className="fw-bold text-dark">8.8</span>{" "}
                <small className="text-muted">/ 10</small>
              </td>
              <td className="text-end">
                <Link
                  to={`/teaching-assistant/classes/${classId}/assignment/1`}
                  className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                >
                  <i className="bi bi-eye" /> View
                </Link>
              </td>
            </tr>
            {/* Assignment 2 */}
            <tr>
              <td className="fw-semibold text-dark">
                <i className="bi bi-file-earmark-text me-1 text-primary" />{" "}
                Assignment 2: Newton's Laws Lab Report
              </td>
              <td>Aug 12, 2026</td>
              <td>
                Aug 18, 2026
                <span className="text-danger fw-semibold small ms-1">
                  (10 hours remaining)
                </span>
              </td>
              <td>
                <span className="badge bg-warning-subtle text-warning-emphasis fw-medium px-2.5 py-1">
                  Ungraded
                </span>
              </td>
              <td className="text-muted">-</td>
              <td className="text-end">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                >
                  <i className="bi bi-eye" /> View
                </button>
              </td>
            </tr>
            {/* Assignment 3 */}
            <tr>
              <td className="fw-semibold text-dark">
                <i className="bi bi-file-earmark-text me-1 text-primary" />{" "}
                Assignment 3: Energy Conservation Quiz
              </td>
              <td>Aug 16, 2026</td>
              <td>
                Aug 23, 2026
                <span className="text-primary fw-medium small ms-1">
                  (6 days remaining)
                </span>
              </td>
              <td>
                <span className="badge bg-warning-subtle text-warning-emphasis fw-medium px-2.5 py-1">
                  Ungraded
                </span>
              </td>
              <td className="text-muted">-</td>
              <td className="text-end">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                >
                  <i className="bi bi-eye" /> View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  );
}
