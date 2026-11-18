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
          <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
            <div className="modal-header border-bottom py-3 px-4 bg-white">
              <h5
                className="modal-title fw-bold text-dark d-flex align-items-center gap-2"
                id="editFeedbackModalTitle"
                style={{ fontSize: '17px' }}
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
                <div className="alert alert-warning py-2.5 px-3 small mb-3 border-0 rounded-2 bg-warning-subtle text-warning-emphasis d-flex align-items-center gap-2">
                  <i className="bi bi-info-circle-fill flex-shrink-0" />
                  <div>
                    You are editing this request while it is in <strong>Pending Review</strong> status. Once claimed by Staff, editing will be locked.
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
                  <label htmlFor="editFeedbackTitleInput" className="form-label small fw-semibold text-dark mb-1.5">
                    Feedback Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="editFeedbackTitleInput"
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
                  <label htmlFor="editFeedbackPrioritySelect" className="form-label small fw-semibold text-dark mb-1.5">
                    Priority Level
                  </label>
                  <select
                    id="editFeedbackPrioritySelect"
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
                  <label htmlFor="editFeedbackDescInput" className="form-label small fw-semibold text-dark mb-1.5">
                    Content & Details <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="editFeedbackDescInput"
                    className="form-control rounded-2"
                    rows={4}
                    placeholder="Please provide full details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    disabled={isSubmitting}
                    style={{ fontSize: '13.5px', lineHeight: 1.5 }}
                  />
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
                  className="btn btn-warning btn-sm d-inline-flex align-items-center gap-1.5 rounded-2 px-3 py-1.5 text-dark fw-semibold shadow-sm"
                  disabled={!isFormValid || isSubmitting}
                  style={{ fontSize: '13px' }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2-circle" />
                      <span>Save Changes</span>
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
