import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('student01');
  const [password, setPassword] = useState('••••••••');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
    navigate('/student/dashboard');
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} onClick={onClose} />
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4">
            <div className="modal-header border-0 bg-success bg-gradient text-white rounded-top-4 py-3">
              <h5 className="modal-title fw-bold" id="loginModalLabel">
                <i className="bi bi-person-lock me-2"></i>Đăng nhập EduTrack
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body p-4">
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label htmlFor="loginUsername" className="form-label fw-semibold">
                    Username
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-person"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      id="loginUsername"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Tên đăng nhập"
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="loginPassword" className="form-label fw-semibold">
                    Mật khẩu
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-key"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      id="loginPassword"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="rememberMe"
                      defaultChecked
                    />
                    <label
                      className="form-check-label text-secondary small"
                      htmlFor="rememberMe"
                    >
                      Ghi nhớ đăng nhập
                    </label>
                  </div>
                  <a href="#forgot" className="text-success text-decoration-none small">
                    Quên mật khẩu?
                  </a>
                </div>

                <button
                  type="submit"
                  className="btn btn-success w-100 py-2 fw-semibold shadow-sm"
                >
                  <i className="bi bi-box-arrow-in-right me-2"></i>Đăng nhập (Học sinh)
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginModal;
