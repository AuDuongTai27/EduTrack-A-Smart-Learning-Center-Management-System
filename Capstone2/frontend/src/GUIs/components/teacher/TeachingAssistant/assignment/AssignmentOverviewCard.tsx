function AssignmentOverviewCard() {
  return (
    <div className="card class-list-card border-0 mb-4">
      <div className="card-body p-4">
        {/* Header Top Row */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <span className="badge bg-primary-subtle text-primary fw-medium mb-2 px-2.5 py-1">
              Physics • Class I-A
            </span>
            <h3 className="mb-1 text-dark fw-bold">
              Assignment 1: Kinematics Problem Set
            </h3>
            <p className="text-muted mb-0 small">
              Review and evaluate student submitted files for Kinematics
              Problem Set.
            </p>
          </div>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div className="bg-light p-2.5 px-3 rounded border">
              <small className="text-muted d-block fw-semibold meta-label-xs">
                CREATION DATE
              </small>
              <span className="fw-semibold text-dark">
                <i className="bi bi-calendar-event me-1 text-primary" />
                Aug 04, 2026
              </span>
            </div>
            <div className="bg-light p-2.5 px-3 rounded border">
              <small className="text-muted d-block fw-semibold meta-label-xs">
                DEADLINE
              </small>
              <span className="fw-semibold text-danger">
                <i className="bi bi-clock-history me-1" />
                Aug 11, 2026, 11:59 PM
              </span>
            </div>
          </div>
        </div>
        {/* Attachments Section */}
        <div className="border-top pt-3 mt-3">
          <div className="mb-2">
            <span className="text-muted fw-bold meta-label-xs uppercase">
              ATTACHMENTS (2)
            </span>
          </div>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div className="attachment-chip">
              <i className="bi bi-file-earmark-pdf-fill text-danger fs-5" />
              <div>
                <a
                  href="#"
                  className="text-decoration-none text-dark fw-semibold small d-block mb-0"
                >
                  assignment1.pdf
                </a>
                <small className="text-muted meta-label-xs">2.5 MB</small>
              </div>
              <a
                href="#"
                className="btn btn-sm btn-link text-secondary p-0 ms-2"
                title="Download"
              >
                <i className="bi bi-download" />
              </a>
            </div>
            <div className="attachment-chip">
              <i className="bi bi-file-earmark-zip-fill text-warning fs-5" />
              <div>
                <a
                  href="#"
                  className="text-decoration-none text-dark fw-semibold small d-block mb-0"
                >
                  assignment1.zip
                </a>
                <small className="text-muted meta-label-xs">14.2 MB</small>
              </div>
              <a
                href="#"
                className="btn btn-sm btn-link text-secondary p-0 ms-2"
                title="Download"
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
