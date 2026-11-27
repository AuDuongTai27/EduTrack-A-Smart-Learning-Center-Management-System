import ModalIcon from '../../Common/ModalIcon';
import ModalSurface from '../../Common/ModalSurface';
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
  initialTitle = '',
}: NewFeedbackModalProps) {
  const mutationLock = React.useRef(false);
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
    if (mutationLock.current) return;
    if (!isFormValid || isSubmitting) return;

    mutationLock.current = true;
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
    } finally { mutationLock.current = false; }
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
          <ModalSurface className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
            <div className="modal-header border-bottom py-3 px-4 bg-white">
              <h5
                className="modal-title fw-bold text-dark d-flex align-items-center gap-2"
                id="newFeedbackModalTitle"
                style={{ fontSize: '17px' }}
              >
                <ModalIcon name="feedback" />
                <span>Create Feedback</span>
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
                {errorMsg && (
                  <div className="alert alert-danger py-2 px-3 small mb-3 border-0 rounded-2 d-flex align-items-center gap-2" role="alert">
                    <i className="bi bi-exclamation-triangle-fill flex-shrink-0" />
                    <div>{errorMsg}</div>
                  </div>
                )}

                {/* Feedback Title */}
                <div className="mb-3">
                  <label htmlFor="feedbackTitleInput" className="form-label small fw-semibold text-dark mb-1">
                    Feedback Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="feedbackTitleInput"
                    className="form-control rounded-2"
                    placeholder="Enter feedback title..."
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
                  <label htmlFor="feedbackPrioritySelect" className="form-label small fw-semibold text-dark mb-1">
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
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Description */}
                <div className="mb-1">
                  <label htmlFor="feedbackDescInput" className="form-label small fw-semibold text-dark mb-1">
                    Content & Details <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="feedbackDescInput"
                    className="form-control rounded-2"
                    rows={4}
                    placeholder="Enter details and support needed..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    disabled={isSubmitting}
                    style={{ fontSize: '13.5px', lineHeight: 1.5 }}
                  />
                </div>
              </div>

              <div className="modal-footer border-top py-2 px-4 d-flex justify-content-end gap-2 bg-light">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm rounded-2 px-3 py-1"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  style={{ fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1 rounded-2 px-3 py-1 fw-medium shadow-sm"
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
          </ModalSurface>
        </div>
      </div>
    </>
  );
}

export default NewFeedbackModal;
