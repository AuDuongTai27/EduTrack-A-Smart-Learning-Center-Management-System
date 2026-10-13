import React, { useEffect } from 'react';
import { FeedbackView } from '../../components/student/feedback/FeedbackView';

export const ParentFeedbackPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Phản hồi & Yêu cầu hỗ trợ (Phụ huynh) – EduTrack';
  }, []);

  return (
    <FeedbackView
      userRole="parent"
      userName="Nguyễn Văn Bình"
      userPhone="0903 123 456"
    />
  );
};

export default ParentFeedbackPage;
