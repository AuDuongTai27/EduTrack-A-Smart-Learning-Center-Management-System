import type { AssignmentDto } from "../../../../../BLL/models/AssignmentDto";
import type { TeachingAssignmentItemDto } from "../../../../../BLL/models/teaching/TeachingAssignmentDto";

export interface AssignmentOverviewCardProps {
  assignment?: AssignmentDto | TeachingAssignmentItemDto | any | null;
  className?: string;
}

function AssignmentOverviewCard({ assignment, className }: AssignmentOverviewCardProps) {
  const displayClass = className || assignment?.className || "Not provided";
  const title = assignment?.title || "Not provided";
  const description = assignment?.description || "Review and evaluate student submitted files for this assignment.";
  const deadline = assignment?.dueDateFormatted || (assignment?.dueDate
    ? new Date(assignment.dueDate).toLocaleString()
    : "Not provided");

  return (
    <div className="card class-list-card border-0 mb-4 shadow-sm">
      <div className="card-body p-4">
        {/* Header Top Row */}
        <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
          <div>
            <span className="badge bg-primary-subtle text-primary fw-medium mb-2 px-2 py-1">
              {displayClass}
            </span>
            <h3 className="mb-1 text-dark fw-bold">
              {title}
            </h3>
            <p className="text-muted mb-2 small">
              {description}
            </p>
            <div className="d-flex align-items-center gap-2 text-muted small flex-wrap" style={{ fontSize: "13px" }}>
              <span className="d-inline-flex align-items-center gap-1 text-danger fw-medium">
                <i className="bi bi-clock" />
                Due: {deadline}
              </span>
              <span>&middot;</span>
              <span className="d-inline-flex align-items-center gap-1 text-success fw-semibold">
                <i className="bi bi-award" />
                Max score: {assignment?.maxScore ?? 10} pts
              </span>
            </div>
          </div>
        </div>

        {/* Attachments Section */}
        <div className="border-top pt-3 mt-3">
          <div className="mb-2">
            <span className="text-muted fw-bold meta-label-xs uppercase">ATTACHMENTS (1)</span>
          </div>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div className="attachment-chip bg-white border rounded p-2 px-3 d-inline-flex align-items-center gap-2">
              <i className="bi bi-file-earmark-pdf-fill text-danger fs-5" />
              <div>
                <a
                  href={assignment?.fileUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-decoration-none text-dark fw-semibold small d-block mb-0"
                >
                  {assignment?.fileUrl ? assignment.fileUrl.split("/").pop() : "assignment1.pdf"}
                </a>
                <small className="text-muted meta-label-xs">Reference Document</small>
              </div>
              <a
                href={assignment?.fileUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-link text-secondary p-0 ms-2"
                title="Download / View"
              >
                <i className="bi bi-download" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssignmentOverviewCard;
