import React, { useEffect } from 'react';
import { FeedbackView } from '../../components/student/feedback/FeedbackView';
import { LearnerPageLoader } from '../../components/student/common/LearnerPageLoader';
import { useParent } from '../../../contexts/ParentContext';
import { getSelectedUserId } from '../../../BLL/services/userSelection';
import { getAuthUser } from '../../../api/authApi';
import { DEFAULT_STUDENT_ID } from '../../../DAL/learningDAL';

export function ParentFeedbackPage() {
  const { selectedChild, loading } = useParent();
  const targetStudentId = selectedChild?.id || DEFAULT_STUDENT_ID;
  const authUser = getAuthUser();
  const parentId = getSelectedUserId('parent');
  const parentName = authUser?.primaryRole === 'parent' ? authUser.fullName : 'Lê Văn Nam';
  const parentPhone = authUser?.primaryRole === 'parent' ? (authUser.phone || '0981 112 233') : '0981 112 233';

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
