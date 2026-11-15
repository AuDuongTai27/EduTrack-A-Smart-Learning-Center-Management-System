import React, { useState } from 'react';
import { teachingDAL } from '../../../../../DAL/teachingDAL';
import type { ApprovalRequestDto } from '../../../../../BLL/models/ApprovalRequestDto';

export interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestCreated?: (newRequest: ApprovalRequestDto) => void;
  defaultRequestedBy?: number;
  userRoleName?: string;
}

export default function NewRequestModal({
  isOpen,
  onClose,
  onRequestCreated,
  defaultRequestedBy = 3,
  userRoleName = "Teacher",
}: NewRequestModalProps) {
  const [requestType, setRequestType] = useState('leave_request');
  const [priority, setPriority] = useState('medium');
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
    setRequestType('leave_request');
    setPriority('medium');
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
        requestType,
        priority,
        requestedBy: defaultRequestedBy,
      });

      if (res && res.data) {
        onRequestCreated?.(res.data);
      }

      handleClose();
    } catch (err: any) {
      console.error('Failed to create teaching request:', err);
      setErrorMsg(err?.message || 'An error occurred while submitting the request. Please try again.');
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
                <span>Create New Request ({userRoleName})</span>
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

                <div className="row g-2 mb-3">
                  <div className="col-md-7">
                    <label htmlFor="requestType" className="form-label fw-semibold text-secondary small">
                      Request Type <span className="text-danger">*</span>
                    </label>
                    <select
                      id="requestType"
                      className="form-select form-select-sm"
                      value={requestType}
                      onChange={(e) => setRequestType(e.target.value)}
                      disabled={isSubmitting}
                    >
                      <option value="leave_request">Leave Request / Session Absence</option>
                      <option value="schedule_change">Schedule Change / Make-up Session</option>
                      <option value="facility_request">Classroom / Equipment Request</option>
                      <option value="teaching_support">Teaching Assistant / Tutoring Request</option>
                      <option value="other">Other Request</option>
                    </select>
                  </div>

                  <div className="col-md-5">
                    <label htmlFor="requestPriority" className="form-label fw-semibold text-secondary small">
                      Priority
                    </label>
                    <select
                      id="requestPriority"
                      className="form-select form-select-sm"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      disabled={isSubmitting}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="requestTitle" className="form-label fw-semibold text-secondary small">
                    Request Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="requestTitle"
                    className="form-control form-control-sm"
                    placeholder="E.g., Leave request for 08/20 due to family matters..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="requestDescription" className="form-label fw-semibold text-secondary small">
                    Detailed Content &amp; Reason <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="requestDescription"
                    className="form-control form-control-sm"
                    rows={4}
                    placeholder="Describe specific requests, make-up plans, or support needed..."
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
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send-fill" />
                      <span>Submit Request</span>
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
