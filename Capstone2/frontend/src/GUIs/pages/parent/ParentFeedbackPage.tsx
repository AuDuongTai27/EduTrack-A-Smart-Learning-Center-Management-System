import React, { useEffect } from 'react';
import { FeedbackView } from '../../components/student/feedback/FeedbackView';
import { LearnerPageLoader } from '../../components/student/common/LearnerPageLoader';
import { useParent } from '../../../contexts/ParentContext';
import { DEFAULT_PARENT_ID } from '../../../DAL/parentDAL';
import { DEFAULT_STUDENT_ID } from '../../../DAL/learningDAL';

export function ParentFeedbackPage() {
  const { selectedChild, loading } = useParent();
  const targetStudentId = selectedChild?.id || DEFAULT_STUDENT_ID;

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
      userName="Lê Văn Nam"
      userPhone="0981 112 233"
      userId={DEFAULT_PARENT_ID}
      studentId={targetStudentId}
    />
  );
}

export default ParentFeedbackPage;
