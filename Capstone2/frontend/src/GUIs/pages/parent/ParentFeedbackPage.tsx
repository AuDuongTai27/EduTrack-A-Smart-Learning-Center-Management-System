import React, { useEffect } from 'react';
import { FeedbackView } from '../../components/student/feedback/FeedbackView';

export const ParentFeedbackPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Phản hồi & Yêu cầu hỗ trợ (Phụ huynh) – EduTrack';
  }, []);

  return (
    <FeedbackView
      userRole="parent"
      userName="Lê Văn Nam"
      userPhone="0981 112 233"
    />
  );
};

export default ParentFeedbackPage;
