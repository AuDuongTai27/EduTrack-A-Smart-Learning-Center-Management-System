import React, { useEffect } from 'react';
import { FeedbackView } from '../../components/student/feedback/FeedbackView';
import { getSelectedUserId } from '../../../BLL/services/userSelection';
import { getAuthUser } from '../../../api/authApi';

export function StudentFeedbackPage() {
  const authUser = getAuthUser();
  const studentId = getSelectedUserId('student');
  const studentName = authUser?.fullName || '';
  const studentPhone = authUser?.phone || '';

  useEffect(() => {
    document.title = 'Feedback & Support – EduTrack';
  }, []);

  return (
    <FeedbackView
      userRole="student"
      userName={studentName}
      userPhone={studentPhone}
      userId={studentId}
      studentId={studentId}
    />
  );
}

export default StudentFeedbackPage;
