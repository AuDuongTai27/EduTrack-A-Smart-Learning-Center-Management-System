import React, { useState } from "react";
import { teachingDAL } from "../../../DAL/teachingDAL";

export interface ChangePasswordModalProps {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export function ChangePasswordModal({
  userId,
  isOpen,
  onClose,
  onSuccess,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    if (loading) return;
    setError(null);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword.trim()) {
      setError("Please enter your current password.");
      return;
    }
    if (!newPassword.trim()) {
      setError("Please enter a new password.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password confirmation does not match the new password.");
      return;
    }
    if (currentPassword === newPassword) {
      setError("New password cannot be the same as the current password.");
      return;
    }

    try {
      setLoading(true);
      const res = await teachingDAL.changePassword(userId, {
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim(),
      });
      onSuccess(res?.message || "Password changed successfully!");
      handleClose();
    } catch (err: any) {
      setError(err?.message || "Failed to change password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1055 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow border-0 rounded-3">
          <div className="modal-header bg-light border-bottom py-3">
            <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
              <i className="bi bi-shield-lock-fill text-primary" />
              Change Account Password
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              disabled={loading}
              onClick={handleClose}
            />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <p className="text-muted small mb-3">
                To protect your teaching account security, please do not share your password with others.
              </p>

              {error && (
                <div className="alert alert-danger py-2 px-3 mb-3 d-flex align-items-center gap-2 small">
                  <i className="bi bi-exclamation-triangle-fill flex-shrink-0" />
                  <div>{error}</div>
                </div>
              )}

              {/* Current Password */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark">
                  Current Password <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-key text-primary" />
                  </span>
                  <input
                    type={showCurrent ? "text" : "password"}
                    className="form-control border-start-0 border-end-0 ps-0"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="input-group-text bg-white"
                    onClick={() => setShowCurrent(!showCurrent)}
                    tabIndex={-1}
                  >
                    <i className={`bi ${showCurrent ? "bi-eye-slash" : "bi-eye"}`} />
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark">
                  New Password <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-lock text-primary" />
                  </span>
                  <input
                    type={showNew ? "text" : "password"}
                    className="form-control border-start-0 border-end-0 ps-0"
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="input-group-text bg-white"
                    onClick={() => setShowNew(!showNew)}
                    tabIndex={-1}
                  >
                    <i className={`bi ${showNew ? "bi-eye-slash" : "bi-eye"}`} />
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-2">
                <label className="form-label small fw-bold text-dark">
                  Confirm New Password <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-check2-circle text-primary" />
                  </span>
                  <input
                    type={showConfirm ? "text" : "password"}
                    className="form-control border-start-0 border-end-0 ps-0"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="input-group-text bg-white"
                    onClick={() => setShowConfirm(!showConfirm)}
                    tabIndex={-1}
                  >
                    <i className={`bi ${showConfirm ? "bi-eye-slash" : "bi-eye"}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light border-top py-2.5 px-4 d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm px-3"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm px-3 d-inline-flex align-items-center gap-1.5"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg" />
                    <span>Save New Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordModal;
