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
    document.title = 'Phản hồi & Yêu cầu hỗ trợ (Phụ huynh) – EduTrack';
  }, []);

  if (loading) {
    return (
      <LearnerPageLoader
        title="Đang tải phản hồi & yêu cầu hỗ trợ..."
        message="Hệ thống đang đồng bộ hồ sơ phụ huynh và lịch sử phản hồi gửi tới Giáo vụ."
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
