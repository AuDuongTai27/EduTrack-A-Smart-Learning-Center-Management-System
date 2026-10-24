import type { AssignmentDto } from "../../../../../BLL/models/AssignmentDto";

export interface AssignmentOverviewCardProps {
  assignment?: AssignmentDto | null;
  className?: string;
}

function AssignmentOverviewCard({ assignment, className }: AssignmentOverviewCardProps) {
  const displayClass = className || assignment?.className || "Class 9 - Advanced Mathematics";
  const title = assignment?.title || "Assignment 1: Kinematics Problem Set";
  const description = assignment?.description || "Review and evaluate student submitted files for this assignment.";
  const deadline = assignment?.dueDate
    ? new Date(assignment.dueDate).toLocaleString()
    : "Aug 11, 2026, 11:59 PM";

  return (
    <div className="card class-list-card border-0 mb-4">
      <div className="card-body p-4">
        {/* Header Top Row */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <span className="badge bg-primary-subtle text-primary fw-medium mb-2 px-2.5 py-1">
              {displayClass}
            </span>
            <h3 className="mb-1 text-dark fw-bold">
              {title}
            </h3>
            <p className="text-muted mb-0 small">
              {description}
            </p>
          </div>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div className="bg-light p-2.5 px-3 rounded border">
              <small className="text-muted d-block fw-semibold meta-label-xs">CREATION DATE</small>
              <span className="fw-semibold text-dark">
                <i className="bi bi-calendar-event me-1 text-primary" />
                Aug 04, 2026
              </span>
            </div>
            <div className="bg-light p-2.5 px-3 rounded border">
              <small className="text-muted d-block fw-semibold meta-label-xs">DEADLINE</small>
              <span className="fw-semibold text-danger">
                <i className="bi bi-clock-history me-1" />
                {deadline}
              </span>
            </div>
            <div className="bg-light p-2.5 px-3 rounded border">
              <small className="text-muted d-block fw-semibold meta-label-xs">MAX SCORE</small>
              <span className="fw-bold text-success">
                <i className="bi bi-award me-1" />
                {assignment?.maxScore ?? 10} pts
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssignmentOverviewCard;
