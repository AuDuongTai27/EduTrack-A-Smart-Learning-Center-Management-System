import { DataState, dataError } from '../../components/Common/DataState';
import React, { useState, useEffect } from 'react';
import type { StudentProfileData } from '../../components/student/profile/profileData';
import { LearnerPageLoader } from '../../components/student/common/LearnerPageLoader';
import { ProfileHeader } from '../../components/student/profile/ProfileHeader';
import { ProfileViewCard } from '../../components/student/profile/ProfileViewCard';
import { ProfileEditCard } from '../../components/student/profile/ProfileEditCard';
import { ProfileToast } from '../../components/student/profile/ProfileToast';
import { learningDAL, DEFAULT_STUDENT_ID } from '../../../DAL/learningDAL';

export function StudentProfilePage() {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);

  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [formData, setFormData] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<boolean>(false);

  useEffect(() => {
    document.title = 'Profile – EduTrack';
    let isMounted = true;

    async function loadProfile() {
      setLoading(true);
      setLoadError(null);
      try {
        const loaded = await learningDAL.getStudentProfile(DEFAULT_STUDENT_ID);
        if (isMounted && loaded) {
          setProfile(loaded);
          setFormData(loaded);
        }
      } catch (err) {
        if (isMounted) setLoadError(dataError(err));
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
  }, [retryVersion]);

  const handleStartEdit = () => {
    if (!profile) return;
    setFormData(profile);
    setSaveError(null);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData || isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const updated = await learningDAL.updateStudentProfile(formData, DEFAULT_STUDENT_ID);
      setProfile(updated);
      setFormData(updated);
      setIsEditing(false);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3200);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save profile changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setSaveError(null);
    setIsEditing(false);
  };

  if (loadError) return <DataState error message={loadError} onRetry={() => { setLoadError(null); setRetryVersion(v => v + 1); }} />;

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
        <ProfileHeader isEditing={isEditing} />

        {/* 2 & 3. View / Edit Card */}
        {isEditing ? (
          <ProfileEditCard
            formData={formData}
            onChange={setFormData}
            onSave={handleSave}
            onCancel={handleCancel}
            isSaving={isSaving}
            saveError={saveError}
          />
        ) : (
          <ProfileViewCard data={profile} onEdit={handleStartEdit} />
        )}
      </div>

      {/* Success Toast */}
      <ProfileToast show={showToast} />
    </main>
  );
}

export default StudentProfilePage;
