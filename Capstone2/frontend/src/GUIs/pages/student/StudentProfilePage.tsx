import React, { useState } from 'react';
import type { StudentProfileData } from '../../components/student/profile/profileData';
import { INITIAL_PROFILE } from '../../components/student/profile/profileData';
import { ProfileHeader } from '../../components/student/profile/ProfileHeader';
import { ProfileViewCard } from '../../components/student/profile/ProfileViewCard';
import { ProfileEditCard } from '../../components/student/profile/ProfileEditCard';
import { ProfileToast } from '../../components/student/profile/ProfileToast';

export const StudentProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfileData>(INITIAL_PROFILE);
  const [formData, setFormData] = useState<StudentProfileData>(INITIAL_PROFILE);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);

  const handleStartEdit = () => {
    setFormData(profile);
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfile(formData);
    setIsEditing(false);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3200);
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  return (
    <main className="main-content">
      <div className="content-container profile-container">
        {/* 1. Breadcrumbs & Header Row */}
        <ProfileHeader isEditing={isEditing} onEdit={handleStartEdit} />

        {/* 2 & 3. View / Edit Card */}
        {isEditing ? (
          <ProfileEditCard
            formData={formData}
            onChange={setFormData}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <ProfileViewCard data={profile} />
        )}

        {/* 4. Mode Status Badge */}
        <div className="d-flex justify-content-center mt-4">
          {isEditing ? (
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]"
              id="profileModeBadge"
            >
              <i className="bi bi-pencil-fill me-1"></i>
              <span>Chế độ chỉnh sửa</span>
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]"
              id="profileModeBadge"
            >
              <i className="bi bi-check-circle-fill me-1"></i>
              <span>Chế độ xem</span>
            </span>
          )}
        </div>
      </div>

      {/* Success Toast */}
      <ProfileToast show={showToast} />
    </main>
  );
};

export default StudentProfilePage;
