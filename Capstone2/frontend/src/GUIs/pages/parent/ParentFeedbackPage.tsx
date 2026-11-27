import React, { useEffect } from 'react';
import { FeedbackView } from '../../components/student/feedback/FeedbackView';
import { LearnerPageLoader } from '../../components/student/common/LearnerPageLoader';
import { useParent } from '../../../contexts/ParentContext';
import { getSelectedUserId } from '../../../BLL/services/userSelection';
import { getAuthUser } from '../../../api/authApi';

export function ParentFeedbackPage() {
  const { selectedChild, loading } = useParent();
  const targetStudentId = selectedChild?.id;
  const authUser = getAuthUser();
  const parentId = getSelectedUserId('parent');
  const parentName = authUser?.fullName || '';
  const parentPhone = authUser?.phone || '';

  useEffect(() => {
    document.title = 'Feedback & Support (Parent) – EduTrack';
  }, []);

  if (loading) {
    return (
      <LearnerPageLoader
        title="Loading feedback & support..."
        message="The system is synchronizing parent profile and feedback history sent to Admin Staff."
      />
    );
  }

  return (
    <FeedbackView
      userRole="parent"
      userName={parentName}
      userPhone={parentPhone}
      userId={parentId}
      studentId={targetStudentId}
    />
  );
}

export default ParentFeedbackPage;
