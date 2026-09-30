import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  ASSIGNMENTS_DB,
  DEFAULT_ASG,
} from '../../components/student/assignmentDetail/assignmentDetailData';
import type { SubmissionStatus } from '../../components/student/assignmentDetail/assignmentDetailData';
import { AssignmentDetailHeader } from '../../components/student/assignmentDetail/AssignmentDetailHeader';
import { AssignmentMetaCards } from '../../components/student/assignmentDetail/AssignmentMetaCards';
import { AssignmentInstructions } from '../../components/student/assignmentDetail/AssignmentInstructions';
import { AssignmentAttachedFiles } from '../../components/student/assignmentDetail/AssignmentAttachedFiles';
import { AssignmentSubmissionSection } from '../../components/student/assignmentDetail/AssignmentSubmissionSection';

export const StudentAssignmentDetailPage: React.FC = () => {
  const { id: paramId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  const rawId = paramId || searchParams.get('id') || '1';
  const asgId = parseInt(rawId, 10) || 1;
  const asg = ASSIGNMENTS_DB[asgId] || DEFAULT_ASG;

  const [status, setStatus] = useState<SubmissionStatus>(asg.defaultStatus || 'not-submitted');
  const [submittedFileName, setSubmittedFileName] = useState('Bai_lam_PT_bac2_NguyenHai.pdf');
  const [submittedMeta, setSubmittedMeta] = useState('Đã nộp lúc 18:42, Thứ Tư 19/08/2026 • 3.1 MB');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = `${asg.title} – EduTrack`;
    setStatus(asg.defaultStatus || 'not-submitted');
  }, [asg]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleDownload = (fileName: string) => {
    showToast(`Đang tải xuống tài liệu: ${fileName}`);
  };

  const handleSubmit = (file: File | null) => {
    const name = file ? file.name : 'Bai_lam_PT_bac2_NguyenHai.pdf';
    const sizeMb = file ? (file.size / (1024 * 1024)).toFixed(1) : '3.1';
    setSubmittedFileName(name);
    setSubmittedMeta(`Đã nộp lúc vừa xong • ${sizeMb} MB`);
    setStatus('submitted');
    showToast('Nộp bài tập thành công!');
  };

  const handleEdit = () => {
    setStatus('not-submitted');
    showToast('Chọn file mới để cập nhật bài nộp');
  };

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài nộp này không?')) {
      setStatus('not-submitted');
      showToast('Đã xóa bài nộp');
    }
  };

  return (
    <main className="main-content">
      <div className="content-container assignment-detail-container">
        {/* Toast Feedback */}
        {toastMessage && (
          <div
            className="position-fixed top-0 start-50 translate-middle-x p-3"
            style={{ zIndex: 1090, marginTop: '16px' }}
          >
            <div className="toast show align-items-center text-bg-primary border-0 shadow" role="alert">
              <div className="d-flex">
                <div className="toast-body d-flex align-items-center gap-2">
                  <i className="bi bi-info-circle fs-6"></i>
                  <span>{toastMessage}</span>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white me-2 m-auto"
                  onClick={() => setToastMessage(null)}
                ></button>
              </div>
            </div>
          </div>
        )}

        {/* 1, 2. Header & Back Link */}
        <AssignmentDetailHeader
          asg={asg}
          currentStatus={status}
        />

        {/* 4. Meta Cards Row */}
        <AssignmentMetaCards asg={asg} currentStatus={status} />

        {/* 5. Instructions Section */}
        <AssignmentInstructions />

        {/* 6. Attached Files Section */}
        <AssignmentAttachedFiles onDownload={handleDownload} />

        {/* 7. Submission Section */}
        <AssignmentSubmissionSection
          status={status}
          submittedFileName={submittedFileName}
          submittedMeta={submittedMeta}
          dueDate={asg.dueDate}
          onSubmit={handleSubmit}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </main>
  );
};

export default StudentAssignmentDetailPage;
