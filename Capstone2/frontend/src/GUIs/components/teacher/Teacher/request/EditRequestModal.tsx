import React, { useState, useEffect } from 'react';
import { teachingDAL } from '../../../../../DAL/teachingDAL';
import type { ApprovalRequestDto } from '../../../../../BLL/models/ApprovalRequestDto';

export interface EditRequestModalProps {
  isOpen: boolean;
  request: ApprovalRequestDto | null;
  onClose: () => void;
  onRequestUpdated?: (updatedRequest: ApprovalRequestDto) => void;
  userRoleName?: string;
}

export default function EditRequestModal({
  isOpen,
  request,
  onClose,
  onRequestUpdated,
  userRoleName = 'Teacher',
}: EditRequestModalProps) {
  const [requestType, setRequestType] = useState('leave_request');
  const [priority, setPriority] = useState('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (request) {
      setTitle(request.title || '');
      setDescription(request.description || request.reason || '');
      setRequestType(request.requestType || 'leave_request');
      setPriority(request.priority || 'medium');
      setErrorMsg(null);
    }
  }, [request]);

  if (!isOpen || !request) return null;

  const isFormValid = title.trim().length > 0 && description.trim().length > 0;

  const handleClose = () => {
    if (isSubmitting) return;
    setErrorMsg(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting || !request) return;

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const res = await teachingDAL.updateRequest(request.requestId, {
        title: title.trim(),
        description: description.trim(),
        requestType,
        priority,
        classId: request.classId ?? undefined,
        studentId: request.studentId ?? undefined,
        reason: description.trim(),
      });

      if (res && res.data) {
        onRequestUpdated?.(res.data);
      }

      handleClose();
    } catch (err: any) {
      console.error('Failed to update teaching request:', err);
      setErrorMsg(err?.message || 'An error occurred while updating the request. Please try again.');
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
        aria-labelledby="editRequestModalTitle"
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow border-0 rounded-3">
            <div className="modal-header border-bottom py-3 px-4">
              <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2" id="editRequestModalTitle">
                <i className="bi bi-pencil-square text-warning fs-5" />
                <span>Edit Request #{request.requestCode || request.requestId}</span>
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
                {/* Status Notice */}
                <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center gap-2 small">
                  <i className="bi bi-info-circle-fill fs-6 text-info flex-shrink-0" />
                  <div>
                    The request is currently <strong>Pending Review</strong> (not yet claimed by a reviewer). You can edit the details below.
                  </div>
                </div>

                {errorMsg && (
                  <div className="alert alert-danger py-2 px-3 mb-3 d-flex align-items-center gap-2 small">
                    <i className="bi bi-exclamation-triangle-fill text-danger flex-shrink-0" />
                    <div>{errorMsg}</div>
                  </div>
                )}

                {/* Request Type & Priority */}
                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label htmlFor="editRequestType" className="form-label small fw-semibold text-secondary">
                      Request Type <span className="text-danger">*</span>
                    </label>
                    <select
                      id="editRequestType"
                      className="form-select form-select-sm"
                      value={requestType}
                      onChange={(e) => setRequestType(e.target.value)}
                      disabled={isSubmitting}
                    >
                      <option value="leave_request">Leave Request / Absence</option>
                      <option value="schedule_change">Teaching / Duty Schedule Change</option>
                      <option value="facility_request">Equipment &amp; Room Request</option>
                      <option value="teaching_support">Teaching Support Proposal</option>
                      <option value="other">Other Feedback / Proposal</option>
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label htmlFor="editPriority" className="form-label small fw-semibold text-secondary">
                      Priority
                    </label>
                    <select
                      id="editPriority"
                      className="form-select form-select-sm"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      disabled={isSubmitting}
                    >
                      <option value="low">Low (Non-urgent)</option>
                      <option value="medium">Medium</option>
                      <option value="high">High (Urgent)</option>
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div className="mb-3">
                  <label htmlFor="editTitle" className="form-label small fw-semibold text-secondary">
                    Request Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="editTitle"
                    className="form-control form-control-sm"
                    placeholder="E.g., Leave request for 10/25/2026..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSubmitting}
                    maxLength={250}
                    required
                  />
                </div>

                {/* Description */}
                <div className="mb-2">
                  <label htmlFor="editDescription" className="form-label small fw-semibold text-secondary">
                    Detailed Content &amp; Reason <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="editDescription"
                    className="form-control form-control-sm"
                    rows={4}
                    placeholder="State the reason or details for management/admin staff support..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                  <small className="text-muted fst-italic">
                    Tip: Provide relevant time and assigned classes for faster approval.
                  </small>
                </div>
              </div>

              <div className="modal-footer border-top py-2 px-4 bg-light">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-warning d-inline-flex align-items-center gap-2 text-dark fw-semibold"
                  disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
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
    </>
  );
}

