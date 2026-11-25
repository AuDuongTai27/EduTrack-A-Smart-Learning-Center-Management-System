import ModalIcon from '../../../Common/ModalIcon';
import ModalSurface from '../../../Common/ModalSurface';
import { useState } from "react";
import type { SubmissionDto } from "../../../../../BLL/models/SubmissionDto";
import type { TeachingSubmissionItemDto } from "../../../../../BLL/models/teaching/TeachingAssignmentDto";
import teachingDAL, { DEFAULT_TEACHER_ID } from "../../../../../DAL/teachingDAL";

export interface StudentSubmissionsTableProps {
  assignmentId?: number;
  submissions?: (TeachingSubmissionItemDto | SubmissionDto | any)[];
  hasRubric?: boolean;
  rubricFileName?: string;
  readOnly?: boolean;
  onSubmissionGraded?: (updated: TeachingSubmissionItemDto) => void;
  onAiEvaluated?: (submissionId: number, aiScore: number, aiFeedback: string) => void;
}

function StudentSubmissionsTable({
  assignmentId = 1,
  submissions = [],
  hasRubric = false,
  rubricFileName,
  readOnly = false,
  onSubmissionGraded,
  onAiEvaluated,
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

  // AI Grading Assistant State (Human-in-the-loop, Teacher only)
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{ aiScore: number; aiFeedback: string } | null>(null);

  const getInitials = (name?: string) => {
    if (!name) return "ST";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarBg = (idx: number) => {
    const bgs = [
      { bg: "#e0e7ff", color: "#3730a3" },
      { bg: "#dcfce7", color: "#166534" },
      { bg: "#fef3c7", color: "#92400e" },
      { bg: "#fee2e2", color: "#991b1b" },
    ];
    return bgs[idx % bgs.length];
  };

  const openGradeModal = (sub: any) => {
    setSelectedSub(sub);
    setGradeScore(sub.score !== null && sub.score !== undefined ? sub.score : "");
    setGradeFeedback(sub.feedback || "");
    setGradeError(null);
    setGradeSuccess(null);
    setAiError(null);
    if (sub.aiScore !== null && sub.aiScore !== undefined) {
      setAiResult({
        aiScore: Number(sub.aiScore),
        aiFeedback: sub.aiFeedback || "AI evaluated this submission based on the assignment rubric.",
      });
    } else {
      setAiResult(null);
    }
  };

  const handleRunAiGrading = async () => {
    if (!selectedSub || !selectedSub.submissionId || readOnly || !hasRubric) return;
    try {
      setAiLoading(true);
      setAiError(null);
      const res = await teachingDAL.aiGradeSubmission(assignmentId, selectedSub.submissionId);
      setAiResult({
        aiScore: res.aiScore,
        aiFeedback: res.aiFeedback,
      });
      // Pre-fill form fields for Teacher to review and confirm (Human-in-the-loop)
      setGradeScore(res.aiScore);
      setGradeFeedback(res.aiFeedback);
      setSelectedSub((prev: any) =>
        prev ? { ...prev, aiScore: res.aiScore, aiFeedback: res.aiFeedback } : prev
      );
      if (onAiEvaluated) {
        onAiEvaluated(selectedSub.submissionId, res.aiScore, res.aiFeedback);
      }
    } catch (err: any) {
      setAiError(
        err?.message ||
          "Could not complete AI grading at this time. You can continue grading manually below."
      );
    } finally {
      setAiLoading(false);
    }
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
        gradedBy: DEFAULT_TEACHER_ID,
      });

      setGradeSuccess("Grade and feedback saved successfully!");
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

  // Filtered rows
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
                <th><span style={{ marginLeft: "36px" }}>Student Name</span></th>
                <th>Submission File</th>
                <th>Submission Date</th>
                <th>Score</th>
                <th>Feedback</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((sub: any, idx: number) => {
                  const style = getAvatarBg(idx);
                  const hasSubmitted = Boolean(sub.fileUrl && sub.fileUrl !== "#" && sub.submissionId && sub.submissionId > 0);
                  const fileName = hasSubmitted && sub.fileUrl ? sub.fileUrl.split("/").pop() : "";
                  const dateStr = hasSubmitted
                    ? (sub.submittedAtFormatted || (sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : ""))
                    : "";

                  return (
                    <tr key={sub.submissionId || sub.studentId || idx}>
                      <td className="fw-semibold text-dark">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="ta-avatar-initials flex-shrink-0"
                            style={{ backgroundColor: style.bg, color: style.color }}
                          >
                            {getInitials(sub.studentName)}
                          </div>
                          <span>{sub.studentName}</span>
                        </div>
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
                            <span className="badge bg-success-subtle text-success fs-6 fw-bold px-2 py-1">
                              {sub.score} / 10
                            </span>
                          ) : (
                            <div className="d-flex flex-column align-items-start gap-1">
                              <span className="badge bg-warning-subtle text-warning fw-normal">
                                Pending grading
                              </span>
                              {!readOnly && sub.aiScore !== null && sub.aiScore !== undefined && (
                                <span
                                  className="badge bg-primary-subtle text-primary border border-primary-subtle fw-semibold"
                                  style={{ fontSize: "11px" }}
                                  title="AI estimated score — waiting for Teacher confirmation"
                                >
                                  <i className="bi bi-stars me-1" />
                                  AI Est: {sub.aiScore}/10
                                </span>
                              )}
                            </div>
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
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted">
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
            <ModalSurface className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  <ModalIcon name="award" />
                  Grade Submission: {selectedSub.studentName}
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
                    <div className="d-flex justify-content-between align-items-center gap-2">
                      <span className="text-muted small">Submitted File:</span>
                      <a
                        href={selectedSub.fileUrl || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="small text-primary text-decoration-none fw-medium text-truncate"
                        style={{ maxWidth: "70%" }}
                      >
                        <i className="bi bi-download me-1" />
                        {selectedSub.fileUrl ? selectedSub.fileUrl.split("/").pop() : "View/Download File"}
                      </a>
                    </div>
                  </div>

                  {/* AI Grading Assistant Section (Strictly Teacher Only — Hidden for TA) */}
                  {!readOnly && (
                    <div className="p-3 rounded-3 border mb-3" style={{ backgroundColor: "#F8FAFC", borderColor: "#CBD5E1" }}>
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <div>
                          <div className="fw-bold text-dark small d-flex align-items-center gap-1">
                            <i className="bi bi-stars text-primary" />
                            <span>AI Grading Assistant (Human-in-the-Loop)</span>
                          </div>
                          <small className="text-muted d-block">
                            {hasRubric
                              ? `Evaluates submission against Rubric (${rubricFileName || "Answer Key"})`
                              : "Add a Rubric (PDF/Word/Image) to this assignment first to unlock AI grading"}
                          </small>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-xs"
                          disabled={!hasRubric || aiLoading || submittingGrade}
                          onClick={handleRunAiGrading}
                        >
                          {aiLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm" role="status" />
                              <span>Analyzing...</span>
                            </>
                          ) : (
                            <>
                              <i className="bi bi-stars" />
                              <span>{aiResult ? "Re-run AI Assist" : "AI Assist Grade"}</span>
                            </>
                          )}
                        </button>
                      </div>

                      {aiError && (
                        <div className="alert alert-warning py-2 px-3 small mt-2 mb-0" role="alert">
                          <i className="bi bi-exclamation-circle-fill me-1" />
                          {aiError}
                        </div>
                      )}

                      {aiResult && (
                        <div className="mt-3 pt-2 border-top">
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <span className="small fw-semibold text-primary">
                              AI Estimated Score (Draft):
                            </span>
                            <span className="badge bg-primary text-white fw-bold px-2 py-1">
                              {aiResult.aiScore} / 10
                            </span>
                          </div>
                          <div className="small text-dark bg-white p-2 rounded border mb-2" style={{ whiteSpace: "pre-line", maxHeight: 150, overflowY: "auto" }}>
                            {aiResult.aiFeedback}
                          </div>
                          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                            <small className="text-muted fst-italic" style={{ fontSize: "11.5px" }}>
                              Review the AI suggestion &amp; student work, adjust below if needed, then confirm.
                            </small>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary py-0 px-2"
                              style={{ fontSize: "12px" }}
                              onClick={() => {
                                setGradeScore(aiResult.aiScore);
                                setGradeFeedback(aiResult.aiFeedback);
                              }}
                            >
                              Apply AI Suggestion
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark">
                      {!readOnly && aiResult ? "Confirmed Official Score (out of 10)" : "Score (out of 10)"}{" "}
                      <span className="text-danger">*</span>
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
                      {!readOnly && aiResult ? "Confirmed Official Feedback" : "Feedback"}
                    </label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={gradeFeedback}
                      onChange={(e) => setGradeFeedback(e.target.value)}
                      placeholder="Provide helpful feedback, corrections, or encouragement..."
                      disabled={submittingGrade}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={() => setSelectedSub(null)} disabled={submittingGrade}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2 px-3" disabled={submittingGrade}>
                    {submittingGrade ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg" />
                        <span>{!readOnly && aiResult ? "Confirm & Save Grade" : "Save Grade"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </ModalSurface>
          </div>
        </div>
      )}
    </>
  );
}

export default StudentSubmissionsTable;
