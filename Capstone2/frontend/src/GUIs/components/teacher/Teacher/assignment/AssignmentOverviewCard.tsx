import { useState, useEffect } from "react";
import type { AssignmentDto } from "../../../../../BLL/models/AssignmentDto";
import type { TeachingAssignmentItemDto } from "../../../../../BLL/models/teaching/TeachingAssignmentDto";
import teachingDAL from "../../../../../DAL/teachingDAL";

export interface AssignmentOverviewCardProps {
  assignment?: AssignmentDto | TeachingAssignmentItemDto | any | null;
  className?: string;
  onAssignmentUpdated?: (updated: TeachingAssignmentItemDto) => void;
  onAssignmentDeleted?: () => void;
}

function AssignmentOverviewCard({
  assignment,
  className,
  onAssignmentUpdated,
  onAssignmentDeleted,
}: AssignmentOverviewCardProps) {
  const displayClass = className || assignment?.className || "Class 9 - Advanced Mathematics";
  const title = assignment?.title || "Assignment 1: Kinematics Problem Set";
  const description = assignment?.description || "Review and evaluate student submitted files for this assignment.";
  const deadline = assignment?.dueDateFormatted || (assignment?.dueDate
    ? new Date(assignment.dueDate).toLocaleString()
    : "Aug 11, 2026, 11:59 PM");

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

  const handleEditFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        setUploadingEditFile(true);
        setErrorMsg(null);
        const res = await teachingDAL.uploadFile(file);
        setEditFileUrl(res.fileUrl);
      } catch (err: any) {
        setErrorMsg(err?.message || "Lỗi khi tải tệp tin lên máy chủ.");
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
      setEditFileUrl(assignment.fileUrl || "/assets/docs/assignment_default.pdf");
      setEditMaxScore(assignment.maxScore ?? 10);
    }
  }, [assignment]);

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
                  {assignment?.createdAt || "Aug 04, 2026"}
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
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 shadow-sm"
                >
                  <i className="bi bi-pencil" /> Modify
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 shadow-sm"
                >
                  <i className="bi bi-trash" /> Delete
                </button>
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

      {/* Edit Assignment Modal */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-pencil-square me-2 text-primary" /> Modify Assignment
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
                          title="Tải tệp tin đính kèm mới"
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
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-danger">
                  <i className="bi bi-exclamation-triangle-fill me-2" /> Delete Assignment
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
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AssignmentOverviewCard;
