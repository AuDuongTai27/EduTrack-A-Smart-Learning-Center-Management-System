export default function TeacherNewAssignmentPage() {
  return (
    <>
      {/* Breadcrumb & Page Title */}
      <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
        <div className="my-auto mb-2">
          <h3 className="page-title mb-1">New Assignment</h3>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/teacher/dashboard">Dashboard</a>
              </li>
              <li className="breadcrumb-item">
                <a href="/teacher/classes">My Classes</a>
              </li>
              <li className="breadcrumb-item">
                <a href="/teacher/class-details">Class I-A</a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                New Assignment
              </li>
            </ol>
          </nav>
        </div>
        <div className="d-flex align-items-center gap-2">
          <a
            href="/teacher/class-details"
            className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
          >
            <i className="bi bi-arrow-left" /> Back to Class Details
          </a>
        </div>
      </div>

      {/* New Assignment Form Card */}
      <div className="card class-list-card border-0 mb-4">
        <div className="class-list-header py-3 px-4 border-bottom">
          <h4 className="class-list-title mb-0">Create Assignment</h4>
        </div>
        <div className="card-body p-4">
          <form>
            <div className="row g-3">
              {/* Assignment Title */}
              <div className="col-md-8">
                <label
                  htmlFor="assignmentTitle"
                  className="form-label fw-semibold text-dark"
                >
                  Assignment Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="assignmentTitle"
                  placeholder="e.g. Assignment 4: Momentum & Impulse"
                />
              </div>

              {/* Deadline */}
              <div className="col-md-4">
                <label
                  htmlFor="assignmentDeadline"
                  className="form-label fw-semibold text-dark"
                >
                  Deadline <span className="text-danger">*</span>
                </label>
                <input
                  type="datetime-local"
                  className="form-control"
                  id="assignmentDeadline"
                />
              </div>

              {/* Assignment Type Radio Buttons */}
              <div className="col-12 mt-3">
                <label className="form-label fw-semibold text-dark d-block">
                  Assignment Type <span className="text-danger">*</span>
                </label>
                <div className="d-flex align-items-center gap-4 flex-wrap">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="assignmentType"
                      id="typeMultipleChoice"
                      defaultChecked
                    />
                    <label
                      className="form-check-label text-dark cursor-pointer fw-medium"
                      htmlFor="typeMultipleChoice"
                    >
                      Multiple Choice Questions
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="assignmentType"
                      id="typeWritten"
                    />
                    <label
                      className="form-check-label text-dark cursor-pointer fw-medium"
                      htmlFor="typeWritten"
                    >
                      Written Assignment
                    </label>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="col-12 mt-3">
                <label
                  htmlFor="assignmentDescription"
                  className="form-label fw-semibold text-dark"
                >
                  Description
                </label>
                <textarea
                  className="form-control"
                  id="assignmentDescription"
                  rows={4}
                  placeholder="Provide instructions or details for this assignment..."
                />
              </div>

              {/* Attachment */}
              <div className="col-12 mt-3">
                <label
                  htmlFor="assignmentAttachment"
                  className="form-label fw-semibold text-dark"
                >
                  Attachment
                </label>
                <textarea
                  className="form-control"
                  id="assignmentAttachment"
                  rows={3}
                />
              </div>
            </div>

            {/* Form Actions (Cancel & Save) */}
            <div className="d-flex align-items-center justify-content-end gap-2 mt-4 pt-3 border-top">
              <a
                href="/teacher/class-details"
                className="btn btn-outline-secondary btn-sm"
              >
                Cancel
              </a>
              <button
                type="button"
                className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"
              >
                <i className="bi bi-check-lg" /> Save Assignment
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
