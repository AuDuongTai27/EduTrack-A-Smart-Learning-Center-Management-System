import React from 'react';
import { StudentPageHeader } from '../common/StudentPageHeader';

interface ProfileHeaderProps {
  isEditing: boolean;
}

export function ProfileHeader({ isEditing }: ProfileHeaderProps) {
  const breadcrumbs = [
    { label: 'Dashboard', href: '/student/dashboard' },
    { label: 'Personal Profile', href: isEditing ? '/student/profile' : undefined },
    ...(isEditing ? [{ label: 'Edit' }] : []),
  ];

  return (
    <StudentPageHeader
      title="Personal Profile"
      breadcrumbs={breadcrumbs}
    />
  );
}

export default ProfileHeader;
