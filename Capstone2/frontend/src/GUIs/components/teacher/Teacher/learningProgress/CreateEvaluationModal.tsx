import ModalIcon from '../../../Common/ModalIcon';
import ModalSurface from '../../../Common/ModalSurface';
import React, { useState } from "react";
import type { CreateTeachingEvaluationPayload } from "../../../../../BLL/models/teaching";

export interface CreateEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number;
  studentName: string;
  studentCode: string;
  classId?: number;
  className?: string;
  evaluatorName?: string;
  evaluatorRole?: string;
  onSubmit: (data: CreateTeachingEvaluationPayload) => void | Promise<void>;
}

export default function CreateEvaluationModal({
  isOpen,
  onClose,
  studentId,
  studentName,
  classId,
  className = "Not provided",
  evaluatorName = "Not provided",
  evaluatorRole = "Teacher",
  onSubmit,
}: CreateEvaluationModalProps) {
  const mutationLock = React.useRef(false);
  const [evaluationType, setEvaluationType] = useState<string>("attitude");
  const [rating, setRating] = useState<"excellent" | "good" | "needs_improvement" | "concern">("good");
  const [content, setContent] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string>("");
  const [contentError, setContentError] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const typeLabels: Record<string, string> = {
    attitude: "Learning Attitude & Spirit",
    academic: "Critical Thinking & Academic Ability",
    progress: "Periodic Progress",
    parent_note: "Notes to Parents",
  };

  const ratingLabels: Record<string, string> = {
    excellent: "Excellent / Very Positive",
    good: "Good / Satisfactory",
    needs_improvement: "Needs Improvement",
    concern: "Needs Attention / Reminder",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mutationLock.current) return;
    if (submitting) return;
    if (!classId || !studentId) { setContentError("Select a valid class and student."); return; }
    if (!content.trim()) {
      setContentError("Please enter evaluation content.");
      return;
    }

    mutationLock.current = true;
    try {
      setSubmitting(true);
      await onSubmit({
        studentId,
        classId,
        evaluatorName,
        evaluatorRole,
        evaluationType,
        typeLabel: typeLabels[evaluationType] || "General Evaluation",
        rating,
        ratingLabel: ratingLabels[rating] || "Good",
        content: content.trim(),
        suggestions: suggestions.trim() || undefined,
      });

      setContent("");
      setSuggestions("");
      setContentError("");
      onClose();
    } catch {
      setContentError("Evaluation was not saved. Please retry.");
    } finally {
      mutationLock.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", zIndex: 1080 }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <ModalSurface className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Modal Header */}
          <div className="modal-header bg-white border-bottom py-3 px-4">
            <h5 className="modal-title d-flex align-items-center gap-2 fs-6 fw-bold text-dark mb-0">
              <ModalIcon name="edit" />
              Create Student Evaluation
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
              disabled={submitting}
            />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="modal-body p-4">
              {/* Student Target Summary Bar */}
              <div className="p-3 bg-light rounded-3 mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2 border">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold"
                    style={{ width: "42px", height: "42px" }}
                  >
                    <i className="bi bi-person-fill fs-5" />
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold text-dark">{studentName}</h6>
                    <small className="text-muted">
                      Class: <strong className="text-dark">{className}</strong>
                    </small>
                  </div>
                </div>

                <div className="text-end small">
                  <span className="text-muted d-block">Evaluator:</span>
                  <span className="badge bg-secondary-subtle text-secondary fw-semibold">
                    {evaluatorName} ({evaluatorRole})
                  </span>
                </div>
              </div>

              <div className="row g-3 mb-3">
                {/* Evaluation Aspect */}
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-dark mb-1">
                    Evaluation Aspect <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select form-select-sm"
                    style={{ fontSize: "13.5px" }}
                    value={evaluationType}
                    onChange={(e) => setEvaluationType(e.target.value)}
                  >
                    <option value="attitude">Learning Attitude &amp; Spirit</option>
                    <option value="academic">Critical Thinking &amp; Academic Ability</option>
                    <option value="progress">Periodic Progress</option>
                    <option value="parent_note">Notes to Parents</option>
                  </select>
                </div>

                {/* Rating Level */}
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-dark mb-1">
                    Rating Level <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select form-select-sm"
                    style={{ fontSize: "13.5px" }}
                    value={rating}
                    onChange={(e) => setRating(e.target.value as any)}
                  >
                    <option value="excellent">Excellent / Very Positive</option>
                    <option value="good">Good / Satisfactory</option>
                    <option value="needs_improvement">Needs Improvement</option>
                    <option value="concern">Needs Attention / Reminder</option>
                  </select>
                </div>
              </div>

              {/* Detailed Evaluation Content */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark mb-1">
                  Detailed Evaluation Content <span className="text-danger">*</span>
                </label>
                <textarea
                  className={`form-control form-control-sm ${contentError ? "is-invalid" : ""}`}
                  style={{ fontSize: "13.5px" }}
                  rows={4}
                  placeholder="Enter notes on focus, participation, and progress..."
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (contentError) setContentError("");
                  }}
                  required
                />
                {contentError && <div className="invalid-feedback">{contentError}</div>}
              </div>

              {/* Recommendations / Remarks */}
              <div className="mb-1">
                <label className="form-label small fw-bold text-dark mb-1">
                  Recommendations / Remarks (Optional)
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  style={{ fontSize: "13.5px" }}
                  placeholder="E.g., Review key concepts or practice exercises..."
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer bg-light px-4 py-3">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm px-3"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2 px-3"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" />
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg" />
                    Save Evaluation
                  </>
                )}
              </button>
            </div>
          </form>
        </ModalSurface>
      </div>
    </div>
  );
}
