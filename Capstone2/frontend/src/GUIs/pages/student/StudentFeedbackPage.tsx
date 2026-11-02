import React, { useEffect } from 'react';
import { FeedbackView } from '../../components/student/feedback/FeedbackView';
import { DEFAULT_STUDENT_ID } from '../../../DAL/learningDAL';

export function StudentFeedbackPage() {
  useEffect(() => {
    document.title = 'Phản hồi & Góp ý – EduTrack';
  }, []);

  return (
    <FeedbackView
      userRole="student"
      userName="Lê Văn An"
      userPhone="0956 789 012"
      userId={DEFAULT_STUDENT_ID}
      studentId={DEFAULT_STUDENT_ID}
    />
  );
}

export default StudentFeedbackPage;
