import React, { useSyncExternalStore } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuthToken, getAuthUser, subscribeAuth } from '../api/authApi';

interface RoleRouteGuardProps {
  allowedRole:
    | 'center_manager'
    | 'admin_staff'
    | 'teacher'
    | 'teaching_assistant'
    | 'student'
    | 'parent';
  children: React.ReactElement;
}

function normalizeRole(role: string): string {
  const trimmed = (role || '').trim().toLowerCase();
  return trimmed === 'ta' ? 'teaching_assistant' : trimmed;
}

export function resolveDashboardPath(role: string): string {
  switch (normalizeRole(role)) {
    case 'center_manager':
      return '/center-manager/dashboard';
    case 'admin_staff':
      return '/admin-staff/dashboard';
    case 'teacher':
      return '/teacher/dashboard';
    case 'teaching_assistant':
      return '/teaching-assistant/dashboard';
    case 'parent':
      return '/parent/dashboard';
    case 'student':
    default:
      return '/student/dashboard';
  }
}

/**
 * Bảo vệ trang Landing ('/'):
 * Nếu đã đăng nhập rồi thì tự động chuyển thẳng vào Dashboard của Role đó,
 * chỉ hiển thị Landing Page khi chưa đăng nhập (hoặc sau khi đã ấn Đăng xuất).
 */
export function PublicOnlyRouteGuard({ children }: { children: React.ReactElement }) {
  const authUser = useSyncExternalStore(subscribeAuth, getAuthUser);

  if (authUser && authUser.userId > 0 && getAuthToken()) {
    const targetPath = authUser.redirectPath || resolveDashboardPath(authUser.primaryRole);
    return <Navigate to={targetPath} replace />;
  }

  return children;
}

/**
 * Bảo vệ các nhánh Route theo Role đã đăng nhập:
 * 1. Nếu chưa đăng nhập -> đẩy về trang chủ Landing Page ('/')
 * 2. Nếu đã đăng nhập nhưng sửa URL sang cổng của Role khác -> tự động đẩy ngược về đúng cổng của Role đang đăng nhập.
 */
export function RoleRouteGuard({ allowedRole, children }: RoleRouteGuardProps) {
  const authUser = useSyncExternalStore(subscribeAuth, getAuthUser);

  if (!authUser || !authUser.userId || !getAuthToken()) {
    return <Navigate to="/" replace />;
  }

  const normalizedAllowed = normalizeRole(allowedRole);
  const userPrimaryRole = normalizeRole(authUser.primaryRole);
  const userRoles = (authUser.roles || []).map(normalizeRole);

  const hasAccess =
    userPrimaryRole === normalizedAllowed || userRoles.includes(normalizedAllowed);

  if (!hasAccess) {
    const targetPath = authUser.redirectPath || resolveDashboardPath(userPrimaryRole);
    return <Navigate to={targetPath} replace />;
  }

  return React.cloneElement(children, { key: `${normalizedAllowed}:${authUser.userId}` });
}

export default RoleRouteGuard;
