import ModalIcon from '../../../Common/ModalIcon';
import ModalSurface from '../../../Common/ModalSurface';
import { useState, useEffect } from "react";
import type { AssignmentDto } from "../../../../../BLL/models/AssignmentDto";
import type { TeachingAssignmentItemDto } from "../../../../../BLL/models/teaching/TeachingAssignmentDto";
import teachingDAL from "../../../../../DAL/teachingDAL";

export interface AssignmentOverviewCardProps {
  assignment?: AssignmentDto | TeachingAssignmentItemDto | any | null;
  className?: string;
  readOnly?: boolean;
  onAssignmentUpdated?: (updated: TeachingAssignmentItemDto) => void;
  onAssignmentDeleted?: () => void;
}

function AssignmentOverviewCard({
  assignment,
  className,
  readOnly = false,
  onAssignmentUpdated,
  onAssignmentDeleted,
}: AssignmentOverviewCardProps) {
  const displayClass = className || assignment?.className || "Not provided";
  const title = assignment?.title || "Not provided";
  const description = assignment?.description || "Review and evaluate student submitted files for this assignment.";
  const deadline = assignment?.dueDateFormatted || (assignment?.dueDate
    ? new Date(assignment.dueDate).toLocaleString()
    : "Not provided");

  // Modal states
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Edit form states
  const [editTitle, setEditTitle] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [editDueDate, setEditDueDate] = useState<string>("");
  const [editFileUrl, setEditFileUrl] = useState<string>("");
  const [editMaxScore, setEditMaxScore] = useState<number>(10);
  const [uploadingEditFile, setUploadingEditFile] = useState<boolean>(false);

  // Rubric modal states (Teacher only)
  const [showRubricModal, setShowRubricModal] = useState<boolean>(false);
  const [rubricFileUrl, setRubricFileUrl] = useState<string>("");
  const [rubricNotes, setRubricNotes] = useState<string>("");
  const [uploadingRubricFile, setUploadingRubricFile] = useState<boolean>(false);
  const [savingRubric, setSavingRubric] = useState<boolean>(false);
  const [rubricError, setRubricError] = useState<string | null>(null);

  const handleEditFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        setUploadingEditFile(true);
        setErrorMsg(null);
        const res = await teachingDAL.uploadFile(file);
        setEditFileUrl(res.fileUrl);
      } catch (err: any) {
        setErrorMsg(err?.message || "Error uploading file to server.");
      } finally {
        setUploadingEditFile(false);
      }
    }
  };

  useEffect(() => {
    if (assignment) {
      setEditTitle(assignment.title || "");
      setEditDescription(assignment.description || "");
      if (assignment.dueDate) {
        try {
          const d = new Date(assignment.dueDate);
          const pad = (n: number) => String(n).padStart(2, "0");
          setEditDueDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
        } catch {
          setEditDueDate("");
        }
      }
      setEditFileUrl(assignment.fileUrl || "");
      setEditMaxScore(assignment.maxScore ?? 10);
      setRubricFileUrl(assignment.answerKeyFileUrl || "");
      setRubricNotes(assignment.answerKeyText || "");
    }
  }, [assignment]);

  const handleRubricFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        setUploadingRubricFile(true);
        setRubricError(null);
        const res = await teachingDAL.uploadFile(file);
        setRubricFileUrl(res.fileUrl);
      } catch (err: any) {
        setRubricError(err?.message || "Failed to upload Rubric file to server.");
      } finally {
        setUploadingRubricFile(false);
      }
    }
  };

  const handleSaveRubric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignment?.assignmentId) return;
    if (!rubricFileUrl.trim()) {
      setRubricError("Please upload a Rubric / Answer Key file (PDF, Word, or Image) before saving.");
      return;
    }

    try {
      setSavingRubric(true);
      setRubricError(null);
      const updated = await teachingDAL.updateAssignmentRubric(assignment.assignmentId, {
        answerKeyFileUrl: rubricFileUrl.trim(),
        answerKeyText: rubricNotes.trim() || undefined,
      });
      setShowRubricModal(false);
      if (onAssignmentUpdated) {
        onAssignmentUpdated(updated);
      }
    } catch (err: any) {
      setRubricError(err?.message || "Failed to save Rubric.");
    } finally {
      setSavingRubric(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignment?.assignmentId) return;
    if (!editTitle.trim()) {
      setErrorMsg("Please provide an assignment title.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);
      const updated = await teachingDAL.updateAssignment(assignment.assignmentId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : undefined,
        fileUrl: editFileUrl.trim(),
        maxScore: editMaxScore > 0 ? editMaxScore : 10,
      });

      setShowEditModal(false);
      if (onAssignmentUpdated) {
        onAssignmentUpdated(updated);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to update assignment.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!assignment?.assignmentId) return;
    try {
      setDeleting(true);
      setErrorMsg(null);
      await teachingDAL.deleteAssignment(assignment.assignmentId);
      setShowDeleteModal(false);
      if (onAssignmentDeleted) {
        onAssignmentDeleted();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to delete assignment.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
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
            {!readOnly && (
              <div className="d-flex align-items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 rounded-2 px-3"
                >
                  <i className="bi bi-pencil" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="btn btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center rounded-2 px-2"
                  title="Delete assignment"
                  aria-label="Delete assignment"
                >
                  <i className="bi bi-trash" />
                </button>
              </div>
            )}
          </div>

          {/* Attachments & AI Rubric Section */}
          <div className="border-top pt-3 mt-3">
            <div className="row g-3 align-items-stretch">
              <div className={readOnly ? "col-12" : "col-lg-6"}>
                <div className="mb-2">
                  <span className="text-muted fw-bold meta-label-xs uppercase">ASSIGNMENT QUESTION FILE</span>
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
                      <small className="text-muted meta-label-xs">Question Document</small>
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

              {!readOnly && (
                <div className="col-lg-6">
                  <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
                    <span className="text-muted fw-bold meta-label-xs uppercase">
                      <i className="bi bi-stars text-primary me-1" />
                      AI GRADING RUBRIC / ANSWER KEY (PDF / WORD / IMAGE)
                    </span>
                    {assignment?.answerKeyFileUrl ? (
                      <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-1">
                        <i className="bi bi-check-circle-fill me-1" />
                        AI Grading Ready
                      </span>
                    ) : (
                      <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-2 py-1">
                        <i className="bi bi-lock-fill me-1" />
                        Rubric Required for AI Grading
                      </span>
                    )}
                  </div>

                  {assignment?.answerKeyFileUrl ? (
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 bg-light border rounded p-2 px-3">
                      <div className="d-flex align-items-center gap-2 min-w-0">
                        <i className="bi bi-file-earmark-check-fill text-success fs-5 flex-shrink-0" />
                        <div className="min-w-0">
                          <a
                            href={assignment.answerKeyFileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-decoration-none text-dark fw-semibold small d-block text-truncate"
                          >
                            {assignment.answerKeyFileUrl.split("/").pop()}
                          </a>
                          <small className="text-muted meta-label-xs d-block text-truncate">
                            {assignment.answerKeyText
                              ? `Note: ${assignment.answerKeyText}`
                              : "Solution & Grading Rubric"}
                          </small>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                        onClick={() => {
                          setRubricError(null);
                          setRubricFileUrl(assignment.answerKeyFileUrl || "");
                          setRubricNotes(assignment.answerKeyText || "");
                          setShowRubricModal(true);
                        }}
                      >
                        <i className="bi bi-upload" />
                        Update Rubric
                      </button>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 bg-light border border-dashed rounded p-2 px-3">
                      <small className="text-muted">
                        Upload the solution &amp; grading rubric (PDF, Word, or PNG/JPG) to unlock AI-assisted grading.
                      </small>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-xs"
                        onClick={() => {
                          setRubricError(null);
                          setRubricFileUrl("");
                          setRubricNotes("");
                          setShowRubricModal(true);
                        }}
                      >
                        <i className="bi bi-file-earmark-plus" />
                        Add Rubric
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add / Update Rubric Modal (Teacher Only) */}
      {showRubricModal && !readOnly && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <ModalSurface className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-light border-bottom">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <ModalIcon name="sparkles" />
                  <span>{assignment?.answerKeyFileUrl ? "Update AI Grading Rubric" : "Add AI Grading Rubric"}</span>
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowRubricModal(false)} />
              </div>
              <form onSubmit={handleSaveRubric}>
                <div className="modal-body p-4">
                  {rubricError && (
                    <div className="alert alert-danger py-2 small mb-3">
                      <i className="bi bi-exclamation-triangle-fill me-1" /> {rubricError}
                    </div>
                  )}
                  <div className="alert alert-info py-2 px-3 small mb-3">
                    <i className="bi bi-lightbulb-fill me-1" />
                    <strong>Tip:</strong> Upload a PDF, Word, or Image (<code>.pdf</code>, <code>.docx</code>, <code>.doc</code>, <code>.png</code>, <code>.jpg</code>) containing the final answers and solution steps so AI can accurately evaluate student methods and partial credit.
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark">
                      Rubric / Answer Key File (PDF, Word, or Image) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,image/png,image/jpeg"
                      onChange={handleRubricFileUpload}
                      disabled={savingRubric || uploadingRubricFile}
                    />
                    {uploadingRubricFile && (
                      <div className="small text-primary mt-1">
                        <span className="spinner-border spinner-border-sm me-1" role="status" />
                        Uploading Rubric file...
                      </div>
                    )}
                    {rubricFileUrl && !uploadingRubricFile && (
                      <div className="small text-success fw-medium mt-1">
                        <i className="bi bi-check-circle-fill me-1" />
                        Attached: {rubricFileUrl.split("/").pop()}
                      </div>
                    )}
                  </div>
                  <div className="mb-2">
                    <label className="form-label fw-semibold text-dark">
                      Additional Grading Notes for AI (Optional)
                    </label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="e.g. Award 50% partial credit if the method is right but final calculation is off; deduct 0.25 pts for missing units..."
                      value={rubricNotes}
                      onChange={(e) => setRubricNotes(e.target.value)}
                      disabled={savingRubric || uploadingRubricFile}
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm px-3"
                    onClick={() => setShowRubricModal(false)}
                    disabled={savingRubric || uploadingRubricFile}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm px-3 d-inline-flex align-items-center gap-1"
                    disabled={savingRubric || uploadingRubricFile || !rubricFileUrl}
                  >
                    {savingRubric ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg" />
                        <span>Save Rubric &amp; Enable AI</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </ModalSurface>
          </div>
        </div>
      )}

      {/* Edit Assignment Modal */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <ModalSurface className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  <ModalIcon name="edit" /> Modify Assignment
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)} />
              </div>
              <form onSubmit={handleSaveEdit}>
                <div className="modal-body p-4">
                  {errorMsg && (
                    <div className="alert alert-danger py-2 small mb-3">
                      <i className="bi bi-exclamation-triangle-fill me-1" /> {errorMsg}
                    </div>
                  )}
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label fw-semibold text-dark">Assignment Title <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        required
                        disabled={saving}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold text-dark">Max Score</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editMaxScore}
                        onChange={(e) => setEditMaxScore(Number(e.target.value))}
                        min={1}
                        max={100}
                        step="0.5"
                        disabled={saving}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark">Deadline</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        disabled={saving}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark">File / Document URL</label>
                      <div className="input-group">
                        <label
                          className={`input-group-text btn btn-outline-secondary ${
                            saving || uploadingEditFile ? "disabled" : ""
                          }`}
                          htmlFor="editAssignmentFileInput"
                          title="Upload new attached file"
                        >
                          {uploadingEditFile ? (
                            <span className="spinner-border spinner-border-sm" role="status" />
                          ) : (
                            <i className="bi bi-paperclip" />
                          )}
                        </label>
                        <input
                          type="file"
                          id="editAssignmentFileInput"
                          className="d-none"
                          disabled={saving || uploadingEditFile}
                          onChange={handleEditFileUpload}
                        />
                        <input
                          type="text"
                          className="form-control"
                          value={editFileUrl}
                          onChange={(e) => setEditFileUrl(e.target.value)}
                          placeholder="e.g. /uploads/teaching/sample.pdf"
                          disabled={saving || uploadingEditFile}
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold text-dark">Description &amp; Instructions</label>
                      <textarea
                        className="form-control"
                        rows={4}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowEditModal(false)} disabled={saving}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1" disabled={saving}>
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </ModalSurface>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <ModalSurface className="modal-content">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-danger">
                  <ModalIcon name="warning" /> Delete Assignment
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)} />
              </div>
              <div className="modal-body p-4 text-center">
                <i className="bi bi-trash3 text-danger fs-1 d-block mb-3" />
                <p className="text-dark fw-medium mb-1">
                  Are you sure you want to delete assignment <strong>"{title}"</strong>?
                </p>
                <p className="text-muted small mb-0">
                  This action cannot be undone. All student submissions and grades tied to this assignment will also be permanently removed.
                </p>
                {errorMsg && (
                  <div className="alert alert-danger py-2 small mt-3">
                    {errorMsg}
                  </div>
                )}
              </div>
              <div className="modal-footer border-top-0 pt-0 justify-content-center pb-4">
                <button type="button" className="btn btn-outline-secondary btn-sm px-4" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm px-4 d-inline-flex align-items-center gap-1"
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-trash" />
                      <span>Yes, Delete</span>
                    </>
                  )}
                </button>
              </div>
            </ModalSurface>
          </div>
        </div>
      )}
    </>
  );
}

export default AssignmentOverviewCard;
