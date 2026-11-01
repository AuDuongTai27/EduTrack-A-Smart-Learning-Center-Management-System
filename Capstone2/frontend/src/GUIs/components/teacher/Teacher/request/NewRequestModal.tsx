import React, { useState } from 'react';
import { teachingDAL } from '../../../../../DAL/teachingDAL';
import type { ApprovalRequestDto } from '../../../../../BLL/models/ApprovalRequestDto';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestCreated?: (newRequest: ApprovalRequestDto) => void;
}

export default function NewRequestModal({
  isOpen,
  onClose,
  onRequestCreated,
}: NewRequestModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isFormValid = title.trim().length > 0 && description.trim().length > 0;

  const handleClose = () => {
    if (isSubmitting) return;
    setTitle('');
    setDescription('');
    setErrorMsg(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const res = await teachingDAL.createRequest({
        title: title.trim(),
        description: description.trim(),
        requestType: 'teaching_support',
        priority: 'medium',
        requestedBy: 2, // Default ID của giáo viên
      });

      if (res && res.data) {
        onRequestCreated?.(res.data);
      }

      handleClose();
    } catch (err: any) {
      console.error('Failed to create teaching request:', err);
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
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
        aria-labelledby="newRequestModalTitle"
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow border-0 rounded-3">
            <div className="modal-header border-bottom py-3 px-4">
              <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2" id="newRequestModalTitle">
                <i className="bi bi-file-earmark-plus text-primary fs-5" />
                <span>Create New Request</span>
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
                  <div className="alert alert-danger py-2 px-3 small mb-3 d-flex align-items-center gap-2">
                    <i className="bi bi-exclamation-triangle-fill flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="requestTitle" className="form-label fw-semibold text-secondary small">
                    Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="requestTitle"
                    className="form-control"
                    placeholder="Enter request title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="requestDescription" className="form-label fw-semibold text-secondary small">
                    Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="requestDescription"
                    className="form-control"
                    rows={4}
                    placeholder="Describe your request in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer border-top py-2 px-4 d-flex justify-content-end gap-2 bg-light rounded-bottom-3">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm px-3"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm px-3 d-inline-flex align-items-center gap-1"
                  disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send-fill" />
                      <span>Submit</span>
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

