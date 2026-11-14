import React, { useSyncExternalStore } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAuthUser, subscribeAuth } from '../../../api/authApi';

function resolveDashboardPath(role?: string): string {
  const norm = (role || '').trim().toLowerCase();
  switch (norm) {
    case 'center_manager':
      return '/center-manager/dashboard';
    case 'admin_staff':
      return '/admin-staff/dashboard';
    case 'teacher':
      return '/teacher/dashboard';
    case 'teaching_assistant':
    case 'ta':
      return '/teaching-assistant/dashboard';
    case 'parent':
      return '/parent/dashboard';
    case 'student':
    default:
      return '/student/dashboard';
  }
}

export function NotFoundPage() {
  const location = useLocation();
  const authUser = useSyncExternalStore(subscribeAuth, getAuthUser);

  const targetPath = authUser
    ? authUser.redirectPath || resolveDashboardPath(authUser.primaryRole)
    : '/';

  const buttonLabel = authUser ? 'Quay về Dashboard' : 'Quay về Trang chủ';

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100 px-3"
      style={{ background: '#f8fafc' }}
    >
      <div
        className="card border-0 shadow-sm rounded-4 p-4 p-md-5 text-center"
        style={{ maxWidth: '520px', width: '100%' }}
      >
        <div
          className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
          style={{
            width: '72px',
            height: '72px',
            background: 'rgba(22, 163, 74, 0.1)',
            color: '#16a34a',
          }}
        >
          <i className="bi bi-Compass fs-1 bi-exclamation-octagon-fill" />
        </div>

        <span
          className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3 py-1 mx-auto mb-2 fw-semibold"
          style={{ fontSize: '12px' }}
        >
          Lỗi 404 · Không tìm thấy trang
        </span>

        <h3 className="fw-bold text-dark mb-2">Trang này không tồn tại</h3>

        <p className="text-muted mb-4" style={{ fontSize: '14.5px', lineHeight: 1.6 }}>
          Đường dẫn <code className="px-1.5 py-0.5 bg-light rounded text-danger">{location.pathname}</code> không tồn tại hoặc đã bị thay đổi trong hệ thống EduTrack.
        </p>

        <div className="d-flex justify-content-center gap-2">
          <Link
            to={targetPath}
            replace
            className="btn btn-success rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 text-white text-decoration-none shadow-sm"
          >
            <i className="bi bi-grid-1x2-fill" />
            <span>{buttonLabel}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
