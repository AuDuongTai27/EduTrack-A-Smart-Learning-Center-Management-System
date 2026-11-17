import React, { useState, useEffect } from 'react';
import type { FeedbackApprovalRequest } from './feedbackData';

export interface EditFeedbackModalProps {
  isOpen: boolean;
  item: FeedbackApprovalRequest | null;
  onClose: () => void;
  onSubmit: (id: number, data: { title: string; description: string; priority: string }) => Promise<void>;
  isSubmitting?: boolean;
  userRoleName?: string;
}

export function EditFeedbackModal({
  isOpen,
  item,
  onClose,
  onSubmit,
  isSubmitting = false,
  userRoleName = 'Student',
}: EditFeedbackModalProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setTitle(item.title || '');
      setPriority(item.priority || 'medium');
      setDescription(item.description || '');
      setErrorMsg(null);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const isFormValid = title.trim().length > 0 && description.trim().length > 0;

  const handleClose = () => {
    if (isSubmitting) return;
    setErrorMsg(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting || !item) return;

    try {
      setErrorMsg(null);
      await onSubmit(item.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
      });
      handleClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update feedback. Please try again.');
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
        aria-labelledby="editFeedbackModalTitle"
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow border-0 rounded-3">
            <div className="modal-header border-bottom py-3 px-4">
              <h5
                className="modal-title fw-bold text-dark d-flex align-items-center gap-2"
                id="editFeedbackModalTitle"
              >
                <i className="bi bi-pencil-square text-warning fs-5" />
                <span>
                  Edit Feedback: {item.requestCode || `#${item.id}`} ({userRoleName})
                </span>
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
                <div className="alert alert-warning py-2 px-3 small mb-3 border-0 rounded-2 bg-warning-subtle text-warning-emphasis">
                  <i className="bi bi-info-circle-fill me-1" />
                  You are editing feedback while it is still in <strong>Pending Review</strong> status.
                </div>

                {errorMsg && (
                  <div className="alert alert-danger py-2 px-3 small mb-3" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-1" />
                    {errorMsg}
                  </div>
                )}

                {/* Feedback Title */}
                <div className="mb-3">
                  <label htmlFor="editFeedbackTitleInput" className="form-label small fw-bold text-dark mb-1">
                    Feedback Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="editFeedbackTitleInput"
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
                  <label htmlFor="editFeedbackPrioritySelect" className="form-label small fw-bold text-dark mb-1">
                    Priority Level
                  </label>
                  <select
                    id="editFeedbackPrioritySelect"
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
                  <label htmlFor="editFeedbackDescInput" className="form-label small fw-bold text-dark mb-1">
                    Content & Details <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="editFeedbackDescInput"
                    className="form-control"
                    rows={4}
                    placeholder="Please provide full details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
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
                  className="btn btn-warning btn-sm d-inline-flex align-items-center gap-1 text-dark fw-semibold"
                  disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2-circle me-1" />
                      Save Changes
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

export default EditFeedbackModal;
