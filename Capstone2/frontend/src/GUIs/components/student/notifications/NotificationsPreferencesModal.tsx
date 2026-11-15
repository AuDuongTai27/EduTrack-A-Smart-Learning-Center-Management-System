import React from 'react';

interface NotificationsPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPreferencesModal({
  isOpen,
  onClose,
}: NotificationsPreferencesModalProps) {
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
                  Notification Preferences
                </h5>
                <p className="mb-0 text-white-50 small">
                  Customize the types of notifications you want to receive on the system
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
                    Schedule Reminders & Room Changes
                  </div>
                  <div className="text-muted small">
                    Notify 30 minutes before an upcoming session starts
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
                    Assignment Deadlines & New Materials
                  </div>
                  <div className="text-muted small">
                    Remind when teachers post lessons or assignments are due soon
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
                    Tuition Payment Reminders
                  </div>
                  <div className="text-muted small">
                    Receive notifications when a new tuition invoice is issued
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
                    System Notifications & Maintenance
                  </div>
                  <div className="text-muted small">
                    Maintenance alerts or new feature updates
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
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsPreferencesModal;
