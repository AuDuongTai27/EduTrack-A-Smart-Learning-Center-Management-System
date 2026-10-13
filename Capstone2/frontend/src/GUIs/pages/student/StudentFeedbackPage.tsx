import React, { useEffect } from 'react';
import { FeedbackView } from '../../components/student/feedback/FeedbackView';

export function StudentFeedbackPage() {
  useEffect(() => {
    document.title = 'Phản hồi & Góp ý – EduTrack';
  }, []);

  return (
    <FeedbackView
      userRole="student"
      userName="Lê Văn An"
      userPhone="0956 789 012"
    />
  );
};

export default StudentFeedbackPage;
