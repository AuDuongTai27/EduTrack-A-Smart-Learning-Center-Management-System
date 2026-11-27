import { downloadFile } from '../../../api/downloadFile';
import { DataState, dataError } from '../../components/Common/DataState';
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);

  const { id: paramId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  const rawId = paramId || searchParams.get('id') || '';
  const asgId = Number(rawId);

  const [asg, setAsg] = useState<AssignmentDetailItem | null>(null);
  const [status, setStatus] = useState<SubmissionStatus>('not-submitted');
  const [submittedFileName, setSubmittedFileName] = useState('');
  const [submittedMeta, setSubmittedMeta] = useState('');
  const [submission, setSubmission] = useState<StudentSubmissionDetailApiDto | null>(null);
  const actionLock = React.useRef(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAssignmentDetail() {
      setLoading(true);
      setLoadError(null);
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
        if (isMounted) setLoadError(dataError(err));
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
  }, [retryVersion, asgId]);

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

  const handleDownload = async (fileName: string, url?: string) => {
    try { await downloadFile(url || asg?.fileUrl, fileName); showToast('File downloaded.'); }
    catch { setActionError('Unable to download this file. It may be unavailable.'); }
  };

  const handleSubmit = async (file: File | null) => {
    if (actionLock.current) return;
    if (!file || file.size === 0 || file.size > 25 * 1024 * 1024) {
      setActionError('Please select a valid file up to 25 MB.'); return;
    }
    actionLock.current = true; setBusy(true); setActionError(null);
    try {
      const uploaded = await learningDAL.uploadSubmissionFile(file);
      const saved = await learningDAL.submitHomework(asgId, file.name,
        (file.size / (1024 * 1024)).toFixed(2), DEFAULT_STUDENT_ID, uploaded.fileUrl);
      setSubmittedFileName(saved.fileName || file.name);
      setSubmittedMeta(saved.submittedAt ? 'Submitted at ' + saved.submittedAt : '');
      setSubmission(saved); setStatus('submitted');
      showToast('Assignment submitted successfully!');
    } catch {
      setActionError('Submission was not confirmed. Please retry or refresh to check its status.');
    } finally { actionLock.current = false; setBusy(false); }
  };

  const handleEdit = () => {
    setStatus('not-submitted');
    showToast('Select a new file to update your submission');
  };

  const handleDelete = async () => {
    if (actionLock.current || !window.confirm('Are you sure you want to delete this submission?')) return;
    actionLock.current = true; setBusy(true); setActionError(null);
    try {
      const deleted = await learningDAL.deleteSubmission(asgId, DEFAULT_STUDENT_ID);
      if (!deleted) throw new Error('Deletion was not confirmed.');
      setSubmission(null); setSubmittedFileName(''); setSubmittedMeta('');
      setStatus('not-submitted'); showToast('Submission deleted successfully');
    } catch { setActionError('Deletion was not confirmed. Your submission has been kept. Please retry.'); }
    finally { actionLock.current = false; setBusy(false); }
  };

  if (loadError) return <DataState error message={loadError} onRetry={() => { setLoadError(null); setRetryVersion(v => v + 1); }} />;

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
        <AssignmentAttachedFiles
          onDownload={handleDownload}
          fileUrl={asg.fileUrl}
          fileName={asg.title}
        />

        {/* 7. Submission Section */}
        {actionError && <div className="alert alert-danger" role="alert">{actionError}</div>}
        <fieldset disabled={busy} className="border-0 p-0 m-0">
        <AssignmentSubmissionSection
          status={status}
          submittedFileName={submittedFileName}
          submittedMeta={submittedMeta}
          dueDate={asg.dueDate}
          maxScore={asg.maxScore}
          submission={submission}
          onSubmit={handleSubmit}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        </fieldset>
      </div>
    </main>
  );
}

export default StudentAssignmentDetailPage;
