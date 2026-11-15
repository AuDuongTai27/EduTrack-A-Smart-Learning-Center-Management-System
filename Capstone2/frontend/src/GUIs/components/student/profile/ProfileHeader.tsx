import React from 'react';
import { StudentPageHeader } from '../common/StudentPageHeader';

interface ProfileHeaderProps {
  isEditing: boolean;
  onEdit: () => void;
}

export function ProfileHeader({ isEditing, onEdit }: ProfileHeaderProps) {
  const breadcrumbs = [
    { label: 'Home', href: '/student/dashboard' },
    { label: 'Personal Profile', href: isEditing ? '/student/profile' : undefined },
    ...(isEditing ? [{ label: 'Edit' }] : []),
  ];

  const actions = !isEditing ? (
    <button
      type="button"
      className="btn btn-outline-primary d-inline-flex align-items-center gap-2 px-4 py-2 rounded-3 fw-bold"
      id="btnEditProfile"
      onClick={onEdit}
    >
      <i className="bi bi-pencil-square"></i>
      <span>Edit</span>
    </button>
  ) : null;

  return (
    <StudentPageHeader
      title="Personal Profile"
      subtitle="View and update your personal information"
      breadcrumbs={breadcrumbs}
      actions={actions}
    />
  );
}

export default ProfileHeader;
