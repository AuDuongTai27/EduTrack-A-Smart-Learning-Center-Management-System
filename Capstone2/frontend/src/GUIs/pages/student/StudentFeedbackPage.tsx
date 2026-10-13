import React, { useEffect } from 'react';
import { FeedbackView } from '../../components/student/feedback/FeedbackView';

export const StudentFeedbackPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Phản hồi & Góp ý – EduTrack';
  }, []);

  return (
    <FeedbackView
      userRole="student"
      userName="Nguyễn Minh Anh"
      userPhone="0912 345 678"
    />
  );
};

export default StudentFeedbackPage;
