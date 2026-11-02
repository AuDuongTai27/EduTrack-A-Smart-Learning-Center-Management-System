import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  ASSIGNMENTS_DB,
  DEFAULT_ASG,
  type AssignmentDetailItem,
  type SubmissionStatus,
} from '../../components/student/assignmentDetail/assignmentDetailData';
import { learningDAL, DEFAULT_STUDENT_ID } from '../../../DAL/learningDAL';
import type { StudentSubmissionDetailApiDto } from '../../../api/learningApi';
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
  const initialAsg = ASSIGNMENTS_DB[asgId] || DEFAULT_ASG;

  const [asg, setAsg] = useState<AssignmentDetailItem>(initialAsg);
  const [status, setStatus] = useState<SubmissionStatus>(initialAsg.defaultStatus || 'not-submitted');
  const [submittedFileName, setSubmittedFileName] = useState('Bai_lam_PT_bac2_LeVanAn.pdf');
  const [submittedMeta, setSubmittedMeta] = useState('Đã nộp lúc 20:30, 13/09/2026 • Đã lưu trên hệ thống');
  const [submission, setSubmission] = useState<StudentSubmissionDetailApiDto | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAssignmentDetail() {
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
      }
    }

    loadAssignmentDetail();

    return () => {
      isMounted = false;
    };
  }, [asgId]);

  useEffect(() => {
    document.title = `${asg.title} – EduTrack`;
  }, [asg.title]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleDownload = (fileName: string) => {
    showToast(`Đang tải xuống tài liệu: ${fileName}`);
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
      setSubmittedMeta(`Đã nộp lúc ${savedSub.submittedAt} • ${sizeMb} MB`);
      setSubmission(savedSub);
      setStatus('submitted');

      if (savedSub.score !== null && savedSub.score !== undefined) {
        setAsg((prev) => ({ ...prev, score: `${savedSub.score} / 10 (GV đã chấm)` }));
      } else if (savedSub.aiScore !== null && savedSub.aiScore !== undefined) {
        setAsg((prev) => ({ ...prev, score: `${savedSub.aiScore} / 10 (AI chấm sơ bộ)` }));
      }

      showToast('Nộp bài tập lên hệ thống thành công! AI đã chấm sơ bộ bài làm.');
    } catch (err) {
      console.warn('Không kết nối được Backend khi nộp bài, cập nhật local state:', err);
      setSubmittedFileName(name);
      setSubmittedMeta(`Đã nộp lúc vừa xong • ${sizeMb} MB`);
      setStatus('submitted');
      showToast('Nộp bài tập thành công!');
    }
  };

  const handleEdit = () => {
    setStatus('not-submitted');
    showToast('Chọn file mới để cập nhật bài nộp');
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài nộp này không?')) {
      try {
        await learningDAL.deleteSubmission(asgId, DEFAULT_STUDENT_ID);
      } catch (err) {
        console.warn('Lỗi khi xóa bài nộp trên Backend:', err);
      }
      setSubmission(null);
      setStatus('not-submitted');
      showToast('Đã xóa bài nộp trên hệ thống');
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
