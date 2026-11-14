import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import type {
  AssignmentDetailItem,
  SubmissionStatus,
} from '../../components/student/assignmentDetail/assignmentDetailData';
import { learningDAL, DEFAULT_STUDENT_ID } from '../../../DAL/learningDAL';
import type { StudentSubmissionDetailApiDto } from '../../../api/learningApi';
import { LearnerPageLoader } from '../../components/student/common/LearnerPageLoader';
import { AssignmentDetailHeader } from '../../components/student/assignmentDetail/AssignmentDetailHeader';
import { AssignmentMetaCards } from '../../components/student/assignmentDetail/AssignmentMetaCards';
import { AssignmentInstructions } from '../../components/student/assignmentDetail/AssignmentInstructions';
import { AssignmentAttachedFiles } from '../../components/student/assignmentDetail/AssignmentAttachedFiles';
import { AssignmentSubmissionSection } from '../../components/student/assignmentDetail/AssignmentSubmissionSection';

export function StudentAssignmentDetailPage() {
  const { id: paramId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  const rawId = paramId || searchParams.get('id') || '1';
  const asgId = parseInt(rawId, 10) || 1;

  const [asg, setAsg] = useState<AssignmentDetailItem | null>(null);
  const [status, setStatus] = useState<SubmissionStatus>('not-submitted');
  const [submittedFileName, setSubmittedFileName] = useState('');
  const [submittedMeta, setSubmittedMeta] = useState('');
  const [submission, setSubmission] = useState<StudentSubmissionDetailApiDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAssignmentDetail() {
      setLoading(true);
      try {
        const vm = await learningDAL.getStudentAssignmentDetail(asgId, DEFAULT_STUDENT_ID);
        if (isMounted && vm) {
          setAsg(vm.asg);
          setStatus(vm.status);
          setSubmittedFileName(vm.submittedFileName);
          setSubmittedMeta(vm.submittedMeta);
          setSubmission(vm.submission || null);
        }
      } catch (err) {
        console.warn('Lỗi khi tải chi tiết bài tập:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAssignmentDetail();

    return () => {
      isMounted = false;
    };
  }, [asgId]);

  useEffect(() => {
    if (asg?.title) {
      document.title = `${asg.title} – EduTrack`;
    }
  }, [asg?.title]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleDownload = (fileName: string) => {
    showToast(`Downloading material: ${fileName}`);
  };

  const handleSubmit = async (file: File | null) => {
    const name = file ? file.name : 'Bai_lam_LeVanAn.pdf';
    const sizeMb = file ? (file.size / (1024 * 1024)).toFixed(1) : '2.4';

    try {
      const savedSub = await learningDAL.submitHomework(
        asgId,
        name,
        sizeMb,
        DEFAULT_STUDENT_ID
      );

      setSubmittedFileName(savedSub.fileName || name);
      setSubmittedMeta(`Submitted at ${savedSub.submittedAt} • ${sizeMb} MB`);
      setSubmission(savedSub);
      setStatus('submitted');

      if (savedSub.score !== null && savedSub.score !== undefined) {
        setAsg((prev) => (prev ? { ...prev, score: `${savedSub.score} / 10 (Graded by Teacher)` } : prev));
      } else if (savedSub.aiScore !== null && savedSub.aiScore !== undefined) {
        setAsg((prev) => (prev ? { ...prev, score: `${savedSub.aiScore} / 10 (AI Preliminary Grading)` } : prev));
      }

      showToast('Assignment submitted successfully! AI has provided preliminary grading.');
    } catch (err) {
      console.warn('Không kết nối được Backend khi nộp bài, cập nhật local state:', err);
      setSubmittedFileName(name);
      setSubmittedMeta(`Submitted just now • ${sizeMb} MB`);
      setStatus('submitted');
      showToast('Assignment submitted successfully!');
    }
  };

  const handleEdit = () => {
    setStatus('not-submitted');
    showToast('Select a new file to update your submission');
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      try {
        await learningDAL.deleteSubmission(asgId, DEFAULT_STUDENT_ID);
      } catch (err) {
        console.warn('Lỗi khi xóa bài nộp trên Backend:', err);
      }
      setSubmission(null);
      setStatus('not-submitted');
      showToast('Submission deleted successfully');
    }
  };

  if (loading || !asg) {
    return (
      <LearnerPageLoader
        title="Loading assignment details..."
        message="The system is loading the prompt, instructions, and your submission status."
      />
    );
  }

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
        <AssignmentInstructions description={asg.description} />

        {/* 6. Attached Files Section */}
        <AssignmentAttachedFiles onDownload={handleDownload} />

        {/* 7. Submission Section */}
        <AssignmentSubmissionSection
          status={status}
          submittedFileName={submittedFileName}
          submittedMeta={submittedMeta}
          dueDate={asg.dueDate}
          submission={submission}
          onSubmit={handleSubmit}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </main>
  );
}

export default StudentAssignmentDetailPage;
