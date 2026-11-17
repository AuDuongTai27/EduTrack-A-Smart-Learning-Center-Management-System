import React, { useState, useEffect } from 'react';

export interface NewFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; priority: string }) => Promise<void>;
  isSubmitting?: boolean;
  userRoleName?: string;
  initialTitle?: string;
}

export function NewFeedbackModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  userRoleName = 'Student',
  initialTitle = '',
}: NewFeedbackModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setPriority('medium');
      setDescription('');
      setErrorMsg(null);
    }
  }, [isOpen, initialTitle]);

  if (!isOpen) return null;

  const isFormValid = title.trim().length > 0 && description.trim().length > 0;

  const handleClose = () => {
    if (isSubmitting) return;
    setErrorMsg(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    try {
      setErrorMsg(null);
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
      });
      handleClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit feedback. Please try again.');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        onClick={handleClose}
        style={{ zIndex: 1050 }}
      />

      {/* Modal Dialog */}
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="newFeedbackModalTitle"
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow border-0 rounded-3">
            <div className="modal-header border-bottom py-3 px-4">
              <h5
                className="modal-title fw-bold text-dark d-flex align-items-center gap-2"
                id="newFeedbackModalTitle"
              >
                <i className="bi bi-file-earmark-plus text-primary fs-5" />
                <span>Create New Feedback ({userRoleName})</span>
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
                aria-label="Close"
                disabled={isSubmitting}
              />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body p-4">
                {/* Information hint */}
                <div className="alert alert-info py-2 px-3 small mb-3 border-0 rounded-2 bg-info-subtle text-info-emphasis">
                  <i className="bi bi-info-circle-fill me-1" />
                  Your feedback and inquiries will be sent directly to Admin Staff for review.
                </div>

                {errorMsg && (
                  <div className="alert alert-danger py-2 px-3 small mb-3" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-1" />
                    {errorMsg}
                  </div>
                )}

                {/* Feedback Title */}
                <div className="mb-3">
                  <label htmlFor="feedbackTitleInput" className="form-label small fw-bold text-dark mb-1">
                    Feedback Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="feedbackTitleInput"
                    className="form-control"
                    placeholder="e.g. Inquiry regarding class schedule, learning materials, facilities..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={isSubmitting}
                    maxLength={150}
                  />
                </div>

                {/* Priority */}
                <div className="mb-3">
                  <label htmlFor="feedbackPrioritySelect" className="form-label small fw-bold text-dark mb-1">
                    Priority Level
                  </label>
                  <select
                    id="feedbackPrioritySelect"
                    className="form-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="low">Low (General inquiry, suggestion)</option>
                    <option value="medium">Medium (Standard feedback)</option>
                    <option value="high">High (Urgent issue, immediate assistance)</option>
                  </select>
                </div>

                {/* Description */}
                <div className="mb-2">
                  <label htmlFor="feedbackDescInput" className="form-label small fw-bold text-dark mb-1">
                    Content & Details <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="feedbackDescInput"
                    className="form-control"
                    rows={4}
                    placeholder="Please provide full details so Admin Staff can assist you promptly..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <div className="form-text small text-muted">
                    Be specific about your questions, dates, subjects, or classrooms.
                  </div>
                </div>
              </div>

              <div className="modal-footer border-top py-2 px-4 bg-light rounded-bottom-3">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"
                  disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-1" />
                      Send Feedback
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default NewFeedbackModal;
