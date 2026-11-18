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
          <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
            <div className="modal-header border-bottom py-3 px-4 bg-white">
              <h5
                className="modal-title fw-bold text-dark d-flex align-items-center gap-2"
                id="newFeedbackModalTitle"
                style={{ fontSize: '17px' }}
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
                <div className="alert alert-info py-2.5 px-3 small mb-3 border-0 rounded-2 bg-info-subtle text-info-emphasis d-flex align-items-center gap-2">
                  <i className="bi bi-info-circle-fill flex-shrink-0" />
                  <div>
                    Your feedback and inquiries will be sent directly to Learning Center Staff for review and assistance.
                  </div>
                </div>

                {errorMsg && (
                  <div className="alert alert-danger py-2.5 px-3 small mb-3 border-0 rounded-2 d-flex align-items-center gap-2" role="alert">
                    <i className="bi bi-exclamation-triangle-fill flex-shrink-0" />
                    <div>{errorMsg}</div>
                  </div>
                )}

                {/* Feedback Title */}
                <div className="mb-3">
                  <label htmlFor="feedbackTitleInput" className="form-label small fw-semibold text-dark mb-1.5">
                    Feedback Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="feedbackTitleInput"
                    className="form-control rounded-2"
                    placeholder="e.g. Inquiry regarding class schedule, learning materials, facilities..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={isSubmitting}
                    maxLength={150}
                    style={{ fontSize: '13.5px' }}
                  />
                </div>

                {/* Priority */}
                <div className="mb-3">
                  <label htmlFor="feedbackPrioritySelect" className="form-label small fw-semibold text-dark mb-1.5">
                    Priority Level
                  </label>
                  <select
                    id="feedbackPrioritySelect"
                    className="form-select rounded-2"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    disabled={isSubmitting}
                    style={{ fontSize: '13.5px' }}
                  >
                    <option value="low">Low (General inquiry, suggestion)</option>
                    <option value="medium">Medium (Standard feedback)</option>
                    <option value="high">High (Urgent issue, immediate assistance)</option>
                  </select>
                </div>

                {/* Description */}
                <div className="mb-1">
                  <label htmlFor="feedbackDescInput" className="form-label small fw-semibold text-dark mb-1.5">
                    Content & Details <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="feedbackDescInput"
                    className="form-control rounded-2"
                    rows={4}
                    placeholder="Please provide full details so Staff can assist you promptly..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    disabled={isSubmitting}
                    style={{ fontSize: '13.5px', lineHeight: 1.5 }}
                  />
                  <div className="form-text small text-muted mt-1" style={{ fontSize: '12px' }}>
                    Be specific about your questions, dates, subjects, or classrooms.
                  </div>
                </div>
              </div>

              <div className="modal-footer border-top py-2.5 px-4 bg-light">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm rounded-2 px-3 py-1.5"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  style={{ fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1.5 rounded-2 px-3 py-1.5 fw-medium shadow-sm"
                  disabled={!isFormValid || isSubmitting}
                  style={{ fontSize: '13px' }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send-fill" />
                      <span>Send Feedback</span>
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
