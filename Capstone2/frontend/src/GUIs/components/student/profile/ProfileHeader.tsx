import React from 'react';
import { StudentPageHeader } from '../common/StudentPageHeader';

interface ProfileHeaderProps {
  isEditing: boolean;
  onEdit: () => void;
}

export function ProfileHeader({ isEditing, onEdit }: ProfileHeaderProps) {
  const breadcrumbs = [
    { label: 'Trang chủ', href: '/student/dashboard' },
    { label: 'Hồ sơ cá nhân', href: isEditing ? '/student/profile' : undefined },
    ...(isEditing ? [{ label: 'Chỉnh sửa' }] : []),
  ];

  const actions = !isEditing ? (
    <button
      type="button"
      className="btn btn-outline-primary d-inline-flex align-items-center gap-2 px-4 py-2 rounded-3 fw-bold"
      id="btnEditProfile"
      onClick={onEdit}
    >
      <i className="bi bi-pencil-square"></i>
      <span>Chỉnh sửa</span>
    </button>
  ) : null;

  return (
    <StudentPageHeader
      title="Hồ sơ cá nhân"
      subtitle="Xem và cập nhật thông tin cá nhân của bạn"
      breadcrumbs={breadcrumbs}
      actions={actions}
    />
  );
}

export default ProfileHeader;
