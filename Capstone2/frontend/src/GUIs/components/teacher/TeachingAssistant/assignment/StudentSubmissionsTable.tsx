import { useState } from "react";
import type { SubmissionDto } from "../../../../../BLL/models/SubmissionDto";
import type { TeachingSubmissionItemDto } from "../../../../../BLL/models/teaching/TeachingAssignmentDto";
import teachingDAL, { DEFAULT_TA_ID } from "../../../../../DAL/teachingDAL";

export interface StudentSubmissionsTableProps {
  assignmentId?: number;
  submissions?: (TeachingSubmissionItemDto | SubmissionDto | any)[];
  onSubmissionGraded?: (updated: TeachingSubmissionItemDto) => void;
}

function StudentSubmissionsTable({
  assignmentId = 1,
  submissions = [],
  onSubmissionGraded,
}: StudentSubmissionsTableProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedSub, setSelectedSub] = useState<any | null>(null);

  // Grade Modal State
  const [gradeScore, setGradeScore] = useState<number | string>("");
  const [gradeFeedback, setGradeFeedback] = useState<string>("");
  const [submittingGrade, setSubmittingGrade] = useState<boolean>(false);
  const [gradeError, setGradeError] = useState<string | null>(null);
  const [gradeSuccess, setGradeSuccess] = useState<string | null>(null);

  const getInitials = (name?: string) => {
    if (!name) return "ST";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarClass = (idx: number) => {
    const classes = [
      "avatar-initials-indigo",
      "avatar-initials-emerald",
      "avatar-initials-amber",
      "avatar-initials-rose",
    ];
    return classes[idx % classes.length];
  };

  const openGradeModal = (sub: any) => {
    setSelectedSub(sub);
    setGradeScore(sub.score !== null && sub.score !== undefined ? sub.score : "");
    setGradeFeedback(sub.feedback || "");
    setGradeError(null);
    setGradeSuccess(null);
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    const numScore = Number(gradeScore);
    if (isNaN(numScore) || numScore < 0 || numScore > 10) {
      setGradeError("Please enter a valid score between 0 and 10.");
      return;
    }

    try {
      setSubmittingGrade(true);
      setGradeError(null);
      const res = await teachingDAL.gradeSubmission(assignmentId, selectedSub.submissionId, {
        score: numScore,
        feedback: gradeFeedback.trim(),
        gradedBy: DEFAULT_TA_ID,
      });

      setGradeSuccess("Grade and remarks submitted successfully!");
      if (onSubmissionGraded) {
        onSubmissionGraded(res);
      }
      setTimeout(() => {
        setSelectedSub(null);
      }, 1000);
    } catch (err: any) {
      setGradeError(err?.message || "Failed to grade submission.");
    } finally {
      setSubmittingGrade(false);
    }
  };

  const filteredSubmissions = submissions.filter((sub: any) => {
    const nameMatch = (sub.studentName || "").toLowerCase().includes(searchTerm.toLowerCase());
    const codeMatch = (sub.studentCode || "").toLowerCase().includes(searchTerm.toLowerCase());
    const fileMatch = (sub.fileUrl || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSearch = nameMatch || codeMatch || fileMatch;
    if (filterStatus === "graded") {
      return matchesSearch && (sub.score !== null && sub.score !== undefined);
    }
    if (filterStatus === "pending") {
      return matchesSearch && (sub.score === null || sub.score === undefined);
    }
    return matchesSearch;
  });

  return (
    <>
      <div className="card class-list-card border-0 mb-4 shadow-sm">
        {/* Card Header */}
        <div className="class-list-header d-flex align-items-center justify-content-between flex-wrap gap-3">
          <h4 className="class-list-title">Student Submissions ({submissions.length})</h4>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <div className="btn-group btn-group-sm">
              <button
                type="button"
                className={`btn ${filterStatus === "all" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setFilterStatus("all")}
              >
                All
              </button>
              <button
                type="button"
                className={`btn ${filterStatus === "graded" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setFilterStatus("graded")}
              >
                Graded
              </button>
              <button
                type="button"
                className={`btn ${filterStatus === "pending" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setFilterStatus("pending")}
              >
                Pending
              </button>
            </div>
          </div>
        </div>

        {/* Table toolbar */}
        <div className="table-toolbar p-3 bg-light border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="text-muted small">
            Showing <strong>{filteredSubmissions.length}</strong> of {submissions.length} student submissions
          </div>
          <div>
            <input
              type="search"
              className="form-control form-control-sm table-search-input"
              placeholder="Search student or file..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="table-responsive-container">
          <table className="table custom-table align-middle" id="assignmentTable">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Student Name</th>
                <th>Submission File</th>
                <th>Submission Date</th>
                <th>Score</th>
                <th>Remarks</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((sub: any, idx: number) => {
                  const hasSubmitted = Boolean(sub.fileUrl && sub.fileUrl !== "#" && sub.submissionId && sub.submissionId > 0);
                  const fileName = hasSubmitted && sub.fileUrl ? sub.fileUrl.split("/").pop() : "";
                  const dateStr = hasSubmitted
                    ? (sub.submittedAtFormatted || (sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : ""))
                    : "";

                  return (
                    <tr key={sub.submissionId || sub.studentId || idx}>
                      <td>
                        <div className={`ta-avatar-initials avatar-initials-sm ${getAvatarClass(idx)}`}>
                          {getInitials(sub.studentName)}
                        </div>
                      </td>
                      <td className="fw-semibold text-dark">
                        {sub.studentName}
                        {sub.studentCode && (
                          <small className="text-muted d-block fw-normal">{sub.studentCode}</small>
                        )}
                      </td>
                      <td>
                        {hasSubmitted ? (
                          <a
                            href={sub.fileUrl || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="text-decoration-none fw-medium text-dark d-inline-flex align-items-center gap-1"
                          >
                            <i className="bi bi-file-earmark-pdf-fill text-danger fs-6" />
                            {fileName}
                          </a>
                        ) : (
                          <span className="text-muted small fst-italic">Not submitted</span>
                        )}
                      </td>
                      <td>
                        {hasSubmitted ? (
                          <span className="text-dark fw-medium">{dateStr}</span>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td>
                        {hasSubmitted ? (
                          sub.score !== null && sub.score !== undefined ? (
                            <span className="badge bg-success-subtle text-success fs-6 fw-bold px-2.5 py-1">
                              {sub.score} / 10
                            </span>
                          ) : (
                            <span className="badge bg-warning-subtle text-warning fw-normal">Pending</span>
                          )
                        ) : (
                          <span className="badge bg-secondary-subtle text-secondary fw-normal">Not submitted</span>
                        )}
                      </td>
                      <td>
                        {sub.feedback ? (
                          <span className="small text-muted text-truncate d-inline-block" style={{ maxWidth: 200 }} title={sub.feedback}>
                            <i className="bi bi-chat-left-quote me-1 text-primary" />
                            {sub.feedback}
                          </span>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td className="text-end">
                        {hasSubmitted ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                            onClick={() => openGradeModal(sub)}
                          >
                            <i className="bi bi-pencil-square" />
                            {sub.score !== null && sub.score !== undefined ? "Update Grade" : "Grade"}
                          </button>
                        ) : (
                          <span className="badge bg-light text-muted border px-2 py-1 small fw-normal">
                            No submission
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">
                    <i className="bi bi-inbox fs-3 d-block mb-1 text-secondary" />
                    No submissions found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Submission Modal */}
      {selectedSub && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-award-fill me-2 text-warning" />
                  Evaluate Submission: {selectedSub.studentName}
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedSub(null)} />
              </div>
              <form onSubmit={handleSaveGrade}>
                <div className="modal-body p-4">
                  {gradeSuccess && (
                    <div className="alert alert-success py-2 small mb-3">
                      <i className="bi bi-check-circle-fill me-1" /> {gradeSuccess}
                    </div>
                  )}
                  {gradeError && (
                    <div className="alert alert-danger py-2 small mb-3">
                      <i className="bi bi-exclamation-triangle-fill me-1" /> {gradeError}
                    </div>
                  )}

                  <div className="bg-light p-3 rounded border mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted small">Student:</span>
                      <strong className="text-dark small">{selectedSub.studentName} ({selectedSub.studentCode})</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted small">Submitted File:</span>
                      <a
                        href={selectedSub.fileUrl || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="small text-primary text-decoration-none fw-medium"
                      >
                        <i className="bi bi-download me-1" /> View/Download File
                      </a>
                    </div>
                    {selectedSub.aiScore !== null && selectedSub.aiScore !== undefined && (
                      <div className="d-flex justify-content-between">
                        <span className="text-muted small">AI Suggested Score:</span>
                        <span className="badge bg-info-subtle text-info fw-bold">{selectedSub.aiScore} / 10</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark">
                      Score (out of 10) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={gradeScore}
                      onChange={(e) => setGradeScore(e.target.value)}
                      placeholder="e.g. 9.5"
                      min={0}
                      max={10}
                      step="0.25"
                      required
                      disabled={submittingGrade}
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label fw-semibold text-dark">
                      Assistant's Remarks &amp; Feedback
                    </label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={gradeFeedback}
                      onChange={(e) => setGradeFeedback(e.target.value)}
                      placeholder="Provide helpful feedback or guidance for the student..."
                      disabled={submittingGrade}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedSub(null)} disabled={submittingGrade}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1" disabled={submittingGrade}>
                    {submittingGrade ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" />
                        <span>Saving Grade...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg" />
                        <span>Save Grade &amp; Remarks</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default StudentSubmissionsTable;
