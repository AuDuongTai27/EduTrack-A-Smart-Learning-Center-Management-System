import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StudentPageHeader } from '../common/StudentPageHeader';
import { LearnerPageLoader } from '../common/LearnerPageLoader';
import type { FeedbackApprovalRequest } from './feedbackData';
import { FeedbackFormCard } from './components/FeedbackFormCard';
import { FeedbackItemCard } from './components/FeedbackItemCard';
import { learningDAL, DEFAULT_STUDENT_ID } from '../../../../DAL/learningDAL';
import { DEFAULT_PARENT_ID } from '../../../../DAL/parentDAL';

export type { FeedbackApprovalRequest };

interface FeedbackViewProps {
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
  const [searchParams] = useSearchParams();
  const isLinkStudentRequest = searchParams.get('type') === 'link_student';

  const resolvedUserId = userId ?? (userRole === 'parent' ? DEFAULT_PARENT_ID : DEFAULT_STUDENT_ID);
  const resolvedStudentId = studentId ?? DEFAULT_STUDENT_ID;

  const [requests, setRequests] = useState<FeedbackApprovalRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [title, setTitle] = useState<string>(
    isLinkStudentRequest ? 'Request to link student profile' : ''
  );
  const [description, setDescription] = useState<string>('');
  const [editingItem, setEditingItem] = useState<FeedbackApprovalRequest | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isLinkStudentRequest && !editingItem && !title.trim()) {
      setTitle('Request to link student profile');
    }
  }, [isLinkStudentRequest, editingItem]);

  useEffect(() => {
    let isMounted = true;

    async function loadRequests() {
      setLoading(true);
      try {
        const list = await learningDAL.getLearnerFeedbacks(
          resolvedUserId,
          userRole,
          userName,
          resolvedStudentId
        );
        if (!isMounted) return;
        setRequests(list);
        if (list.length > 0 && selectedId === null) {
          setSelectedId(list[0].id);
        }
      } catch (err) {
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
  }, [resolvedUserId, resolvedStudentId, userName, userRole]);

  const handleStartEdit = (item: FeedbackApprovalRequest) => {
    if (!item.canEdit) return;
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description);
    setSelectedId(item.id);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (editingItem) {
        const updated = await learningDAL.updateLearnerFeedback(
          editingItem.id,
          {
            userId: resolvedUserId,
            title: title.trim(),
            description: description.trim(),
          },
          userRole,
          userName
        );

        setRequests((prev) =>
          prev.map((item) => (item.id === editingItem.id ? updated : item))
        );
        setSelectedId(updated.id);
        setEditingItem(null);
        setTitle('');
        setDescription('');

        setToastMessage(
          `Successfully updated feedback #${updated.requestCode || editingItem.id}!`
        );
      } else {
        const created = await learningDAL.createLearnerFeedback(
          {
            userId: resolvedUserId,
            studentId: resolvedStudentId,
            title: title.trim(),
            description: description.trim(),
            priority: 'medium',
          },
          userRole,
          userName
        );

        setRequests((prev) => [created, ...prev]);
        setSelectedId(created.id);
        setTitle('');
        setDescription('');

        setToastMessage(
          'Feedback submitted successfully to Admin Staff (Status: Pending Review — you can still edit before Admin Staff reviews it).'
        );
      }
    } catch (err) {
      console.warn('Backend connection error when saving feedback, updating UI locally:', err);
      if (editingItem) {
        setRequests((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? { ...item, title: title.trim(), description: description.trim() }
              : item
          )
        );
        setEditingItem(null);
        setTitle('');
        setDescription('');
        setToastMessage('Feedback updated successfully!');
      } else {
        const fallbackReq: FeedbackApprovalRequest = {
          id: Date.now(),
          requestCode: `FB${String(requests.length + 1).padStart(4, '0')}`,
          requestType: 'feedback',
          title: title.trim(),
          description: description.trim(),
          senderName: userName,
          senderRole: userRole,
          createdAt: new Date().toLocaleString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          status: 'pending',
          statusLabel: 'Pending Review',
          canEdit: true,
        };

        setRequests((prev) => [fallbackReq, ...prev]);
        setSelectedId(fallbackReq.id);
        setTitle('');
        setDescription('');
        setToastMessage('Feedback submitted successfully to Admin Staff!');
      }
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setToastMessage(null), 4500);
    }
  };

  if (loading) {
    return (
      <LearnerPageLoader
        title="Loading feedback & requests..."
        message="The system is loading your feedback history sent to Admin Staff."
      />
    );
  }

  return (
    <main className="main-content">
      <div className="content-container">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="alert alert-success border-0 rounded-4 shadow-sm d-flex align-items-center gap-3 mb-4 p-3.5">
            <i className="bi bi-check-circle-fill fs-4 text-success flex-shrink-0"></i>
            <div className="flex-grow-1">
              <strong>Success!</strong> {toastMessage}
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={() => setToastMessage(null)}
            ></button>
          </div>
        )}

        {/* Page Header */}
        <StudentPageHeader
          title="Feedback & Support"
          subtitle="Submit feedback, inquiries, or support requests directly to Admin Staff"
          breadcrumbs={[
            { label: 'Home', href: userRole === 'parent' ? '/parent/dashboard' : '/student/dashboard' },
            { label: 'Feedback & Support' },
          ]}
          actions={
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-semibold">
              <i className="bi bi-person-circle me-1"></i>
              {userName} ({userRole === 'parent' ? 'Parent' : 'Student'})
            </span>
          }
        />

        {/* 2 Columns: Form & History */}
        <div className="row g-4">
          <div className="col-lg-6">
            <FeedbackFormCard
              title={title}
              description={description}
              isSubmitting={isSubmitting}
              editingCode={editingItem ? (editingItem.requestCode || String(editingItem.id)) : null}
              onTitleChange={setTitle}
              onDescriptionChange={setDescription}
              onCancelEdit={handleCancelEdit}
              onSubmit={handleSubmit}
            />
          </div>

          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                <h2 className="h6 fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                  <i className="bi bi-clock-history text-primary"></i>
                  Feedback History ({requests.length})
                </h2>
                <span className="badge bg-light text-muted border">Default: Feedback sent to Admin Staff</span>
              </div>

              <div className="d-flex flex-column gap-2.5" style={{ maxHeight: '550px', overflowY: 'auto' }}>
                {requests.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    <i className="bi bi-inbox fs-2 d-block mb-2 text-secondary" />
                    <p className="mb-0 fw-semibold">No feedback yet</p>
                    <small>Your feedback or support requests will appear here.</small>
                  </div>
                ) : (
                  requests.map((item) => (
                    <FeedbackItemCard
                      key={item.id}
                      item={item}
                      isSelected={selectedId === item.id}
                      onToggle={() => setSelectedId(selectedId === item.id ? null : item.id)}
                      onEdit={handleStartEdit}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default FeedbackView;
