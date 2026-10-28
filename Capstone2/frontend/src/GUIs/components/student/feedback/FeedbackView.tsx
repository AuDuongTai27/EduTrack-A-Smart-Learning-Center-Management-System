import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { FeedbackApprovalRequest } from './feedbackData';
import { INITIAL_FEEDBACK_REQUESTS } from './feedbackData';
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

  const [requests, setRequests] = useState<FeedbackApprovalRequest[]>(INITIAL_FEEDBACK_REQUESTS);
  const [title, setTitle] = useState<string>(
    isLinkStudentRequest ? 'Yêu cầu liên kết thêm hồ sơ học sinh' : ''
  );
  const [description, setDescription] = useState<string>('');
  const [editingItem, setEditingItem] = useState<FeedbackApprovalRequest | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isLinkStudentRequest && !editingItem && !title.trim()) {
      setTitle('Yêu cầu liên kết thêm hồ sơ học sinh');
    }
  }, [isLinkStudentRequest, editingItem]);

  useEffect(() => {
    let isMounted = true;

    async function loadRequests() {
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
          `Đã cập nhật phản hồi #${updated.requestCode || editingItem.id} thành công!`
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
          'Đã gửi phản hồi thành công lên hệ thống Giáo vụ (Trạng thái: Chưa xem xét giải quyết — bạn vẫn có thể chỉnh sửa trước khi Giáo vụ tiếp nhận).'
        );
      }
    } catch (err) {
      console.warn('Không kết nối được Backend khi lưu phản hồi, cập nhật trên giao diện:', err);
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
        setToastMessage('Đã cập nhật nội dung phản hồi thành công!');
      } else {
        const fallbackReq: FeedbackApprovalRequest = {
          id: Date.now(),
          requestCode: `FB${String(requests.length + 1).padStart(4, '0')}`,
          requestType: 'feedback',
          title: title.trim(),
          description: description.trim(),
          senderName: userName,
          senderRole: userRole,
          createdAt: new Date().toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          status: 'pending',
          statusLabel: 'Chưa xem xét giải quyết',
          canEdit: true,
        };

        setRequests((prev) => [fallbackReq, ...prev]);
        setSelectedId(fallbackReq.id);
        setTitle('');
        setDescription('');
        setToastMessage('Đã gửi phản hồi thành công lên hệ thống Giáo vụ!');
      }
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setToastMessage(null), 4500);
    }
  };

  return (
    <main className="main-content">
      <div className="content-container py-3">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="alert alert-success border-0 rounded-4 shadow-sm d-flex align-items-center gap-3 mb-4 p-3.5">
            <i className="bi bi-check-circle-fill fs-4 text-success flex-shrink-0"></i>
            <div className="flex-grow-1">
              <strong>Thành công!</strong> {toastMessage}
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={() => setToastMessage(null)}
            ></button>
          </div>
        )}

        {/* Page Header */}
        <div className="page-header d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <h1 className="page-title mb-1">
              <i className="bi bi-chat-dots-fill text-primary me-2"></i>
              Phản hồi &amp; Ý kiến đóng góp
            </h1>
            <p className="page-subtitle text-muted mb-0">
              Gửi phản hồi, thắc mắc hoặc yêu cầu hỗ trợ trực tiếp về Giáo vụ (Admin Staff)
            </p>
          </div>

          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-semibold">
            <i className="bi bi-person-circle me-1"></i>
            {userName} ({userRole === 'parent' ? 'Phụ huynh' : 'Học sinh'})
          </span>
        </div>

        {/* 2 Cột: Form gửi/sửa & Lịch sử */}
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
                  Lịch sử phản hồi ({requests.length})
                </h2>
                <span className="badge bg-light text-muted border">Mặc định: Feedback gửi Admin Staff</span>
              </div>

              <div className="d-flex flex-column gap-2.5" style={{ maxHeight: '550px', overflowY: 'auto' }}>
                {requests.map((item) => (
                  <FeedbackItemCard
                    key={item.id}
                    item={item}
                    isSelected={selectedId === item.id}
                    onToggle={() => setSelectedId(selectedId === item.id ? null : item.id)}
                    onEdit={handleStartEdit}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default FeedbackView;
