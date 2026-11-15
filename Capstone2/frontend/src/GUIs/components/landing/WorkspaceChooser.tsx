import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../../api/authApi';
import { applyLoggedInUser } from '../../../BLL/services/userSelection';
import { clearNotificationInbox } from '../../hooks/useNotificationInbox';

interface DemoAccountItem {
  roleLabel: string;
  fullName: string;
  phone: string;
  userCode: string;
  badgeColor: string;
  icon: string;
}

const DEMO_ACCOUNTS: DemoAccountItem[] = [
  {
    roleLabel: 'Phụ huynh',
    fullName: 'Lê Văn Nam (PH em An)',
    phone: '0981112233',
    userCode: 'PAR001',
    badgeColor: '#0284c7',
    icon: 'bi-people-fill',
  },
  {
    roleLabel: 'Học sinh',
    fullName: 'Lê Văn An (Lớp 9)',
    phone: '0956789012',
    userCode: 'STU001',
    badgeColor: '#16a34a',
    icon: 'bi-mortarboard-fill',
  },
  {
    roleLabel: 'Giáo viên',
    fullName: 'ThS. Hoàng Quốc Việt',
    phone: '0923456789',
    userCode: 'TC001',
    badgeColor: '#2563eb',
    icon: 'bi-person-workspace',
  },
  {
    roleLabel: 'Trợ giảng',
    fullName: 'Âu Dương Tài',
    phone: '0945678901',
    userCode: 'TA001',
    badgeColor: '#7c3aed',
    icon: 'bi-person-badge-fill',
  },
  {
    roleLabel: 'Giáo vụ',
    fullName: 'Trần Thị Nhân Viên',
    phone: '0912345678',
    userCode: 'ADM001',
    badgeColor: '#d97706',
    icon: 'bi-briefcase-fill',
  },
  {
    roleLabel: 'Quản lý TT',
    fullName: 'Nguyễn Văn Quản Lý',
    phone: '0901234567',
    userCode: 'MGR001',
    badgeColor: '#dc2626',
    icon: 'bi-shield-lock-fill',
  },
];

export function WorkspaceChooser({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Vui lòng nhập Số điện thoại, Email hoặc Mã số tài khoản.');
      return;
    }
    if (!password) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await authApi.login(identifier, password);
      const loggedInUser = result.user!;
      clearNotificationInbox();

      applyLoggedInUser(loggedInUser.primaryRole, {
        userId: loggedInUser.userId,
        userCode: loggedInUser.userCode,
        fullName: loggedInUser.fullName,
        email: loggedInUser.email || undefined,
        phone: loggedInUser.phone || undefined,
        avatarUrl: loggedInUser.avatarUrl || undefined,
        status: loggedInUser.status,
        gradeId: loggedInUser.gradeId ?? null,
        gradeName: loggedInUser.gradeName ?? null,
        specialty: loggedInUser.specialty || undefined,
        createdAt: new Date().toISOString(),
        roles: loggedInUser.roles,
      });

      onClose();
      navigate(loggedInUser.redirectPath || '/student/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Đăng nhập không thành công. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (acc: DemoAccountItem) => {
    setIdentifier(acc.phone);
    setPassword('123456');
    setError(null);
  };

  return (
    <div
      className="modal d-block"
      style={{ background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1055 }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: '480px' }}
        role="dialog"
        aria-modal="true"
        aria-label="Đăng nhập hệ thống"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div
            className="modal-header border-0 text-white px-4 py-3"
            style={{ background: 'linear-gradient(135deg, #15803d, #16a34a)' }}
          >
            <div className="d-flex align-items-center gap-2">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle bg-white bg-opacity-25"
                style={{ width: '38px', height: '38px' }}
              >
                <i className="bi bi-mortarboard-fill fs-5 text-white" />
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0">Đăng nhập EduTrack</h5>
                <small className="opacity-75" style={{ fontSize: '12px' }}>
                  Hệ thống tự động chuyển vào cổng theo vai trò của bạn
                </small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Đóng"
              onClick={onClose}
            />
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            {error && (
              <div
                className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-3 rounded-3"
                role="alert"
                style={{ fontSize: '13.5px' }}
              >
                <i className="bi bi-exclamation-triangle-fill flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: '13.5px' }}>
                  Số điện thoại / Email / Mã số <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-secondary">
                    <i className="bi bi-telephone-fill" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Nhập SĐT (vd: 0981112233), Email hoặc Mã số..."
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoFocus
                    disabled={loading}
                  />
                </div>
                <small className="text-muted d-block mt-1" style={{ fontSize: '11.5px' }}>
                  <i className="bi bi-info-circle me-1" />
                  Phụ huynh &amp; Học sinh có thể dùng trực tiếp <strong>Số điện thoại</strong> đã đăng ký.
                </small>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: '13.5px' }}>
                  Mật khẩu <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-secondary">
                    <i className="bi bi-lock-fill" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control border-start-0 border-end-0 ps-0"
                    placeholder="Nhập mật khẩu..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="input-group-text bg-white border-start-0 text-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-success w-100 py-2 fw-semibold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right" />
                    <span>Đăng nhập vào hệ thống</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick fill demo accounts */}
            <div className="mt-4 pt-3 border-top">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-semibold text-secondary" style={{ fontSize: '12px' }}>
                  <i className="bi bi-lightning-charge-fill text-warning me-1" />
                  Tài khoản mẫu (Bấm để điền nhanh SĐT &amp; MK <code>123456</code>):
                </span>
              </div>
              <div className="row g-2">
                {DEMO_ACCOUNTS.map((acc) => {
                  const isSelected = identifier === acc.phone;
                  return (
                    <div className="col-6" key={acc.userCode}>
                      <button
                        type="button"
                        onClick={() => handleFillDemo(acc)}
                        className={`btn w-100 text-start p-2 rounded-3 border transition-all ${
                          isSelected ? 'border-success bg-success bg-opacity-10' : 'bg-light border-light-subtle'
                        }`}
                        style={{ fontSize: '12px' }}
                      >
                        <div className="d-flex align-items-center gap-1.5 mb-0.5">
                          <i className={`bi ${acc.icon}`} style={{ color: acc.badgeColor }} />
                          <span className="fw-bold text-dark">{acc.roleLabel}</span>
                          <span className="ms-auto badge bg-white text-secondary border" style={{ fontSize: '10px' }}>
                            {acc.phone}
                          </span>
                        </div>
                        <div className="text-muted text-truncate" style={{ fontSize: '11px' }}>
                          {acc.fullName}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkspaceChooser;
