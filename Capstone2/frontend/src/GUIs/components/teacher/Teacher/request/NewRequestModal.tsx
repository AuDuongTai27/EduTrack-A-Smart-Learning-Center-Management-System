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
  userRoleName = "Giáo viên",
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
                <span>Tạo Đơn &amp; Yêu Cầu Mới ({userRoleName})</span>
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
                      Loại đơn <span className="text-danger">*</span>
                    </label>
                    <select
                      id="requestType"
                      className="form-select form-select-sm"
                      value={requestType}
                      onChange={(e) => setRequestType(e.target.value)}
                      disabled={isSubmitting}
                    >
                      <option value="leave_request">Xin nghỉ phép / Vắng buổi</option>
                      <option value="schedule_change">Đề xuất đổi lịch học / Dạy bù</option>
                      <option value="facility_request">Đề xuất phòng học / Thiết bị</option>
                      <option value="teaching_support">Yêu cầu trợ giảng / Phụ đạo</option>
                      <option value="other">Yêu cầu khác</option>
                    </select>
                  </div>

                  <div className="col-md-5">
                    <label htmlFor="requestPriority" className="form-label fw-semibold text-secondary small">
                      Mức độ ưu tiên
                    </label>
                    <select
                      id="requestPriority"
                      className="form-select form-select-sm"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      disabled={isSubmitting}
                    >
                      <option value="low">Thấp</option>
                      <option value="medium">Trung bình</option>
                      <option value="high">Khẩn cấp</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="requestTitle" className="form-label fw-semibold text-secondary small">
                    Tiêu đề yêu cầu <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="requestTitle"
                    className="form-control form-control-sm"
                    placeholder="Ví dụ: Xin phép nghỉ dạy ngày 20/08 do việc gia đình..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="requestDescription" className="form-label fw-semibold text-secondary small">
                    Nội dung chi tiết &amp; Lý do <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="requestDescription"
                    className="form-control form-control-sm"
                    rows={4}
                    placeholder="Mô tả cụ thể nguyện vọng, phương án dạy bù hoặc hỗ trợ..."
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
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm px-3 d-inline-flex align-items-center gap-1"
                  disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send-fill" />
                      <span>Gửi yêu cầu</span>
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
