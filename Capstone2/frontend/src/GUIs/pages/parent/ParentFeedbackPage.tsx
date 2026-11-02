import React, { useEffect } from 'react';
import { FeedbackView } from '../../components/student/feedback/FeedbackView';
import { useParent } from '../../../contexts/ParentContext';
import { DEFAULT_PARENT_ID } from '../../../DAL/parentDAL';
import { DEFAULT_STUDENT_ID } from '../../../DAL/learningDAL';

export function ParentFeedbackPage() {
  const { selectedChild } = useParent();
  const targetStudentId = selectedChild?.id || DEFAULT_STUDENT_ID;

  useEffect(() => {
    document.title = 'Phản hồi & Yêu cầu hỗ trợ (Phụ huynh) – EduTrack';
  }, []);

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
