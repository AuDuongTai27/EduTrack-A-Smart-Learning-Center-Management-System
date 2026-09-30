import React from 'react';

interface NotificationsPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsPreferencesModal: React.FC<NotificationsPreferencesModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="modal-backdrop fade show"
        onClick={onClose}
        style={{ zIndex: 1050 }}
      />
      <div
        className="modal fade show d-block"
        id="preferencesModal"
        tabIndex={-1}
        aria-labelledby="preferencesModalLabel"
        aria-modal="true"
        role="dialog"
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content payment-modal-card">
            <div className="modal-header payment-modal-header border-0">
              <div>
                <h5 className="modal-title fw-bold" id="preferencesModalLabel">
                  Cài đặt nhận thông báo
                </h5>
                <p className="mb-0 text-white-50 small">
                  Tùy chỉnh các loại thông báo bạn muốn nhận trên hệ thống
                </p>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body p-4">
              <div className="d-flex align-items-center justify-content-between py-3 border-bottom">
                <div>
                  <div className="fw-semibold text-dark">
                    Nhắc nhở lịch học & Đổi phòng
                  </div>
                  <div className="text-muted small">
                    Thông báo trước 30 phút khi có buổi học sắp diễn ra
                  </div>
                </div>
                <div className="form-check form-switch fs-5">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    defaultChecked
                  />
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between py-3 border-bottom">
                <div>
                  <div className="fw-semibold text-dark">
                    Hạn nộp bài tập & Tài liệu mới
                  </div>
                  <div className="text-muted small">
                    Nhắc nhở khi giáo viên đăng bài hoặc bài tập sắp hết hạn
                  </div>
                </div>
                <div className="form-check form-switch fs-5">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    defaultChecked
                  />
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between py-3 border-bottom">
                <div>
                  <div className="fw-semibold text-dark">
                    Nhắc hạn đóng học phí
                  </div>
                  <div className="text-muted small">
                    Nhận thông báo khi phát hành hóa đơn học phí mới
                  </div>
                </div>
                <div className="form-check form-switch fs-5">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    defaultChecked
                  />
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between py-3">
                <div>
                  <div className="fw-semibold text-dark">
                    Thông báo hệ thống & Bảo trì
                  </div>
                  <div className="text-muted small">
                    Cảnh báo bảo trì hoặc cập nhật tính năng mới
                  </div>
                </div>
                <div className="form-check form-switch fs-5">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    defaultChecked
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer border-0 bg-light p-3">
              <button
                type="button"
                className="btn btn-primary px-4 fw-semibold w-100"
                onClick={onClose}
              >
                Lưu tùy chọn
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsPreferencesModal;
