import { DataState, dataError } from '../../Common/DataState';
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StudentPageHeader } from '../common/StudentPageHeader';
import { LearnerPageLoader } from '../common/LearnerPageLoader';
import type { FeedbackApprovalRequest } from './feedbackData';
import { FeedbackTable } from './FeedbackTable';
import { NewFeedbackModal } from './NewFeedbackModal';
import { EditFeedbackModal } from './EditFeedbackModal';
import { learningDAL, DEFAULT_STUDENT_ID } from '../../../../DAL/learningDAL';
import { DEFAULT_PARENT_ID } from '../../../../DAL/parentDAL';

export type { FeedbackApprovalRequest };

export interface FeedbackViewProps {
  userRole: 'parent' | 'student';
  userName: string;
  userPhone?: string;
  userId?: number;
  studentId?: number;
}

export function FeedbackView({
  userRole,
  userName,
  userId,
  studentId,
}: FeedbackViewProps) {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);

  const [searchParams] = useSearchParams();
  const isLinkStudentRequest = searchParams.get('type') === 'link_student';

  const resolvedUserId = userId ?? (userRole === 'parent' ? DEFAULT_PARENT_ID : DEFAULT_STUDENT_ID);
  const resolvedStudentId = userRole === 'parent' ? studentId : (studentId ?? DEFAULT_STUDENT_ID);

  const [requests, setRequests] = useState<FeedbackApprovalRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [initialCreateTitle, setInitialCreateTitle] = useState<string>('');
  const [editingItem, setEditingItem] = useState<FeedbackApprovalRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [writeError, setWriteError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isLinkStudentRequest) {
      setInitialCreateTitle('Request to link student profile');
      setIsCreateModalOpen(true);
    }
  }, [isLinkStudentRequest]);

  useEffect(() => {
    let isMounted = true;

    async function loadRequests() {
      setLoading(true);
      setLoadError(null);
      try {
        const list = await learningDAL.getLearnerFeedbacks(
          resolvedUserId,
          userRole,
          userName,
          resolvedStudentId
        );
        if (!isMounted) return;
        setRequests(list);
      } catch (err) {
        if (isMounted) setLoadError(dataError(err));
        console.warn('Lỗi khi tải lịch sử phản hồi:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadRequests();

    return () => {
      isMounted = false;
    };
  }, [retryVersion, resolvedUserId, resolvedStudentId, userName, userRole]);

  // Create feedback handler
  const handleCreateSubmit = async (data: {
    title: string;
    description: string;
    priority: string;
  }) => {
    if (isSubmitting) return;
    setWriteError(null);
    setIsSubmitting(true);
    try {
      const created = await learningDAL.createLearnerFeedback(
        {
          userId: resolvedUserId,
          studentId: resolvedStudentId,
          title: data.title.trim(),
          description: data.description.trim(),
          priority: data.priority,
        },
        userRole,
        userName
      );

      setRequests((prev) => [created, ...prev]);
      setToastMessage(
        `Feedback #${created.requestCode || created.id} submitted successfully to Admin Staff (Pending Review).`
      );
    } catch (err) {
      setWriteError('Feedback was not sent. Please retry.');
      throw new Error('Feedback was not sent. Please retry.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setToastMessage(null), 4500);
    }
  };

  // Update feedback handler
  const handleUpdateSubmit = async (
    id: number,
    data: { title: string; description: string; priority: string }
  ) => {
    if (isSubmitting) return;
    setWriteError(null);
    setIsSubmitting(true);
    try {
      const updated = await learningDAL.updateLearnerFeedback(
        id,
        {
          userId: resolvedUserId,
          title: data.title.trim(),
          description: data.description.trim(),
        },
        userRole,
        userName
      );

      setRequests((prev) =>
        prev.map((item) => (item.id === id ? { ...updated, priority: data.priority } : item))
      );
      setToastMessage(`Feedback #${updated.requestCode || id} updated successfully!`);
    } catch (err) {
      setWriteError('Feedback changes were not saved. Please retry.');
      throw new Error('Feedback changes were not saved. Please retry.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setToastMessage(null), 4500);
    }
  };

  // Filter requests by status
  const filteredRequests = useMemo(() => {
    if (filterStatus === 'all') return requests;
    return requests.filter((r) => {
      const s = (r.status || 'pending').toLowerCase();
      return s === filterStatus;
    });
  }, [requests, filterStatus]);

  // Sort requests by createdAt
  const sortedRequests = useMemo(() => {
    return [...filteredRequests].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime() || 0;
      const dateB = new Date(b.createdAt).getTime() || 0;
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [filteredRequests, sortOrder]);

  if (loadError) return <DataState error message={loadError} onRetry={() => { setLoadError(null); setRetryVersion(v => v + 1); }} />;

  if (loading) {
    return (
      <LearnerPageLoader
        title="Loading feedback & requests..."
        message="The system is loading your feedback history sent to Admin Staff."
      />
    );
  }

  const roleLabel = userRole === 'parent' ? 'Parent' : 'Student';

  return (
    <main className="main-content">
      <div className="content-container">
        {writeError && <div className="alert alert-danger" role="alert">{writeError}</div>}
        {/* Toast Alert */}
        {toastMessage && (
          <div className="alert alert-success border-0 rounded-3 shadow-sm d-flex align-items-center gap-3 mb-3 p-3">
            <i className="bi bi-check-circle-fill fs-5 text-success flex-shrink-0" />
            <div className="flex-grow-1 small">
              <strong>Success!</strong> {toastMessage}
            </div>
            <button
              type="button"
              className="btn-close btn-close-sm"
              onClick={() => setToastMessage(null)}
              aria-label="Close"
            />
          </div>
        )}

        {/* Page Header */}
        <StudentPageHeader
          title="Feedback & Support"
          breadcrumbs={[
            { label: 'Home', href: userRole === 'parent' ? '/parent/dashboard' : '/student/dashboard' },
            { label: 'Feedback & Support' },
          ]}
        />

        {/* Main List Card - Clean unified table card layout */}
        <div className="card border-0 mb-4 shadow-sm bg-white rounded-3 overflow-hidden">
          <FeedbackTable
            requests={sortedRequests}
            onRequestUpdated={(updated) =>
              setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
            }
            onStartEdit={(item) => setEditingItem(item)}
            userRoleName={roleLabel}
            filterStatus={filterStatus}
            onFilterStatusChange={(s) => setFilterStatus(s)}
            sortOrder={sortOrder}
            onSortOrderChange={(o) => setSortOrder(o)}
            onOpenCreateModal={() => {
              setInitialCreateTitle('');
              setIsCreateModalOpen(true);
            }}
          />
        </div>

        {/* Modal: Create New Feedback */}
        <NewFeedbackModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setInitialCreateTitle('');
          }}
          onSubmit={handleCreateSubmit}
          isSubmitting={isSubmitting}
          userRoleName={roleLabel}
          initialTitle={initialCreateTitle}
        />

        {/* Modal: Edit Feedback */}
        <EditFeedbackModal
          isOpen={editingItem !== null}
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSubmit={handleUpdateSubmit}
          isSubmitting={isSubmitting}
          userRoleName={roleLabel}
        />
      </div>
    </main>
  );
}

export default FeedbackView;
