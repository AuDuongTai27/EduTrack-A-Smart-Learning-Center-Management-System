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
      {/* New Assignment Button */}
      <div className="px-4 py-3 border-bottom bg-white d-flex align-items-center justify-content-between flex-wrap gap-2">
        <Link
          to={`/teacher/classes/${classId}/assignment/new-assignment`}
          className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"
        >
          <i className="bi bi-plus-lg" /> New Assignment
        </Link>
      </div>
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
                <Link to={`/teacher/classes/${classId}/assignment/1`} className="text-decoration-none text-dark">
                  <i className="bi bi-file-earmark-text me-1 text-primary" />{" "}
                  Assignment 1: Kinematics Problem Set
                </Link>
              </td>
              <td>Aug 04, 2026</td>
              <td>
                Aug 11, 2026
                <span className="badge bg-secondary-subtle text-secondary ms-1 fw-normal">Expired</span>
              </td>
              <td>
                <span className="badge bg-success-subtle text-success fw-medium px-2.5 py-1">Graded</span>
              </td>
              <td>
                <span className="fw-bold text-dark">8.8</span>{" "}
                <small className="text-muted">/ 10</small>
              </td>
              <td className="text-end">
                <Link to={`/teacher/classes/${classId}/assignment/1`} className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
                  <i className="bi bi-eye" /> View
                </Link>
              </td>
            </tr>
            {/* Assignment 2 */}
            <tr>
              <td className="fw-semibold text-dark">
                <a href="/teacher/classes/class-1-a/assignment/assign-2" className="text-decoration-none text-dark">
                  <i className="bi bi-file-earmark-text me-1 text-primary" />{" "}
                  Assignment 2: Quantum Physics
                </a>
              </td>
              <td>Aug 04, 2026</td>
              <td>
                Aug 11, 2026
                <span className="badge bg-secondary-subtle text-secondary ms-1 fw-normal">Expired</span>
              </td>
              <td>
                <span className="badge bg-success-subtle text-success fw-medium px-2.5 py-1">Graded</span>
              </td>
              <td>
                <span className="fw-bold text-dark">9.2</span>{" "}
                <small className="text-muted">/ 10</small>
              </td>
              <td className="text-end">
                <a href="/teacher/classes/class-1-a/assignment/assign-2" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
                  <i className="bi bi-eye" /> View
                </a>
              </td>
            </tr>
            {/* Assignment 3 */}

          </tbody>
        </table>
      </div>
    </details>
  );
}
