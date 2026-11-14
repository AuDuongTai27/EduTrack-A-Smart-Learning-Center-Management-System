import React, { useState, useEffect } from 'react';
import type { StudentProfileData } from '../../components/student/profile/profileData';
import { LearnerPageLoader } from '../../components/student/common/LearnerPageLoader';
import { ProfileHeader } from '../../components/student/profile/ProfileHeader';
import { ProfileViewCard } from '../../components/student/profile/ProfileViewCard';
import { ProfileEditCard } from '../../components/student/profile/ProfileEditCard';
import { ProfileToast } from '../../components/student/profile/ProfileToast';
import { learningDAL, DEFAULT_STUDENT_ID } from '../../../DAL/learningDAL';

export function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [formData, setFormData] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);

  useEffect(() => {
    document.title = 'Profile – EduTrack';
    let isMounted = true;

    async function loadProfile() {
      setLoading(true);
      try {
        const loaded = await learningDAL.getStudentProfile(DEFAULT_STUDENT_ID);
        if (isMounted && loaded) {
          setProfile(loaded);
          setFormData(loaded);
        }
      } catch (err) {
        console.warn('Lỗi khi tải hồ sơ học sinh:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleStartEdit = () => {
    if (!profile) return;
    setFormData(profile);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData) return;
    try {
      const updated = await learningDAL.updateStudentProfile(formData, DEFAULT_STUDENT_ID);
      setProfile(updated);
      setFormData(updated);
    } catch (err) {
      console.warn('Không kết nối được Backend khi lưu hồ sơ học sinh, cập nhật tạm trên UI:', err);
      setProfile(formData);
    }
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

  if (loading || !profile || !formData) {
    return (
      <LearnerPageLoader
        title="Loading profile..."
        message="The system is loading your student information."
        containerClassName="profile-container"
      />
    );
  }

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
              <span>Edit Mode</span>
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]"
              id="profileModeBadge"
            >
              <i className="bi bi-check-circle-fill me-1"></i>
              <span>View Mode</span>
            </span>
          )}
        </div>
      </div>

      {/* Success Toast */}
      <ProfileToast show={showToast} />
    </main>
  );
}

export default StudentProfilePage;
