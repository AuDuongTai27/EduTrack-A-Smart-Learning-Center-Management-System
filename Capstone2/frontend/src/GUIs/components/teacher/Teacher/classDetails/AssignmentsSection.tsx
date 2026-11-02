import { useState } from "react";
import { Link } from "react-router-dom";
import type { AssignmentDto } from "../../../../../BLL/models/AssignmentDto";
import type { TeachingAssignmentItemDto } from "../../../../../BLL/models/teaching/TeachingAssignmentDto";
import teachingDAL from "../../../../../DAL/teachingDAL";

export interface AssignmentsSectionProps {
  classId?: string | number;
  assignments?: (AssignmentDto | TeachingAssignmentItemDto | any)[];
  onAssignmentDeleted?: (deletedId: number) => void;
}

export default function AssignmentsSection({
  classId = "1",
  assignments = [],
  onAssignmentDeleted,
}: AssignmentsSectionProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (asgId: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete assignment "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(asgId);
      await teachingDAL.deleteAssignment(asgId);
      if (onAssignmentDeleted) {
        onAssignmentDeleted(asgId);
      }
    } catch (err: any) {
      alert(err?.message || "Failed to delete assignment.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <details className="card class-list-card border-0 mb-4" open>
      <summary className="class-list-header d-flex align-items-center justify-content-between cursor-pointer py-3 px-4">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-journal-text text-primary fs-5" />
          <h4 className="class-list-title mb-0">Class Assignments ({assignments.length})</h4>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small">Toggle Section</span>
          <i className="bi bi-chevron-down details-chevron text-muted" />
        </div>
      </summary>

      {/* New Assignment Button */}
      <div className="px-4 py-3 border-bottom bg-white d-flex align-items-center justify-content-between flex-wrap gap-2">
        <span className="text-muted small">Manage class problem sets, homework, and quizzes</span>
        <Link
          to={`/teacher/classes/${classId}/assignment/new-assignment`}
          className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1 shadow-sm"
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
              <th>Deadline</th>
              <th>Submissions &amp; Grading</th>
              <th>Max Score</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length > 0 ? (
              assignments.map((asg: any, idx: number) => {
                const isOverdue = asg.dueDate ? new Date(asg.dueDate) < new Date() : false;
                const submissionCount = asg.submissionCount ?? 0;
                const gradedCount = asg.gradedCount ?? 0;
                const asgId = asg.assignmentId || idx;

                return (
                  <tr key={asgId}>
                    <td className="fw-semibold text-dark">
                      <Link
                        to={`/teacher/classes/${classId}/assignment/${asg.assignmentId}`}
                        className="text-decoration-none text-dark"
                      >
                        <i className="bi bi-file-earmark-text me-1 text-primary" />{" "}
                        {asg.title}
                      </Link>
                      {asg.assignmentType && (
                        <span className="d-block text-muted small fw-normal">
                          {asg.assignmentType}
                        </span>
                      )}
                    </td>
                    <td>{asg.createdAt || "08/09/2026"}</td>
                    <td>
                      <div>
                        {asg.dueDateFormatted || (asg.dueDate ? new Date(asg.dueDate).toLocaleDateString() : "No deadline")}
                      </div>
                      <span className={`badge ${isOverdue ? "bg-danger-subtle text-danger" : "bg-success-subtle text-success"} fw-normal`}>
                        {isOverdue ? "Overdue" : "Active"}
                      </span>
                    </td>
                    <td>
                      {submissionCount > 0 ? (
                        <div>
                          <span className={`badge ${gradedCount === submissionCount ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"} fw-medium px-2 py-1`}>
                            {gradedCount === submissionCount ? "Graded" : "Pending"} ({gradedCount}/{submissionCount})
                          </span>
                        </div>
                      ) : (
                        <span className="badge bg-secondary-subtle text-secondary fw-normal">No submissions yet</span>
                      )}
                    </td>
                    <td>
                      <span className="fw-bold text-dark">{asg.maxScore ?? "10.0"}</span>{" "}
                      <small className="text-muted">pts</small>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex align-items-center gap-1">
                        <Link
                          to={`/teacher/classes/${classId}/assignment/${asg.assignmentId}`}
                          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                        >
                          <i className="bi bi-eye" /> View
                        </Link>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger d-inline-flex align-items-center"
                          title="Delete assignment"
                          disabled={deletingId === asg.assignmentId}
                          onClick={() => handleDelete(asg.assignmentId, asg.title)}
                        >
                          {deletingId === asg.assignmentId ? (
                            <span className="spinner-border spinner-border-sm" role="status" />
                          ) : (
                            <i className="bi bi-trash" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4 text-muted">
                  <i className="bi bi-inbox fs-3 d-block mb-1 text-secondary" />
                  No assignments created for this class yet. Click <strong>"New Assignment"</strong> above to assign work.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </details>
  );
}
