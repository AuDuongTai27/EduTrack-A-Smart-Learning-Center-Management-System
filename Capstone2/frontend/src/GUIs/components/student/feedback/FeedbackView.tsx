import React, { useState, useEffect } from 'react';
import type { FeedbackApprovalRequest } from './feedbackData';
import { INITIAL_FEEDBACK_REQUESTS } from './feedbackData';
import { FeedbackFormCard } from './components/FeedbackFormCard';
import { FeedbackItemCard } from './components/FeedbackItemCard';
import { feedbackDAL } from '../../../../DAL/feedbackDAL';
import type { ApprovalRequestDto } from '../../../../BLL/models/ApprovalRequestDto';

export type { FeedbackApprovalRequest };

interface FeedbackViewProps {
  userRole: 'parent' | 'student';
  userName: string;
  userPhone?: string;
}

export function FeedbackView({
  userRole,
  userName,
}: FeedbackViewProps) {
  const [requests, setRequests] = useState<FeedbackApprovalRequest[]>(INITIAL_FEEDBACK_REQUESTS);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadRequests() {
      try {
        const res = await feedbackDAL.getAllRequests();
        if (isMounted && res.data && res.data.length > 0) {
          const mapped: FeedbackApprovalRequest[] = res.data.map((dto) => {
            const statusMap: Record<string, string> = {
              pending: 'Chờ duyệt',
              approved: 'Đã duyệt',
              rejected: 'Đã từ chối',
            };
            let dateStr = '08/09/2026';
            if (dto.createdAt) {
              try {
                const d = new Date(dto.createdAt);
                if (!isNaN(d.getTime())) {
                  dateStr = d.toLocaleDateString('vi-VN');
                }
              } catch {
                dateStr = dto.createdAt;
              }
            }
            return {
              id: dto.requestId,
              requestType: 'feedback',
              title: dto.title || `Yêu cầu #${dto.requestCode}`,
              description: dto.description || dto.reason || '',
              senderName: dto.requesterName || userName,
              senderRole: userRole,
              createdAt: dateStr,
              status: (dto.status as any) || 'pending',
              statusLabel: statusMap[dto.status?.toLowerCase()] || 'Đang xử lý',
              responseMessage: dto.reviewNotes || undefined,
            };
          });
          setRequests(mapped);
        }
      } catch (err) {
        console.warn('Lỗi khi tải danh sách phản hồi:', err);
      }
    }

    loadRequests();

    return () => {
      isMounted = false;
    };
  }, [userName, userRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newReq: FeedbackApprovalRequest = {
      id: Date.now(),
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
      statusLabel: 'Chờ duyệt',
    };

    setRequests([newReq, ...requests]);
    setTitle('');
    setDescription('');

    setToastMessage(
      'Đã gửi phản hồi thành công lên hệ thống Giáo vụ! Nhân viên sẽ kiểm tra và phản hồi lại sớm nhất.'
    );
    setTimeout(() => setToastMessage(null), 4500);
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
              Phản hồi & Ý kiến đóng góp
            </h1>
            <p className="page-subtitle text-muted mb-0">
              Gửi phản hồi, thắc mắc hoặc yêu cầu hỗ trợ tới ban Giáo vụ trung tâm EduTrack
            </p>
          </div>

          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-semibold">
            <i className="bi bi-person-circle me-1"></i>
            {userName} ({userRole === 'parent' ? 'Phụ huynh' : 'Học sinh'})
          </span>
        </div>

        {/* 2 Cột: Form gửi & Lịch sử */}
        <div className="row g-4">
          <div className="col-lg-6">
            <FeedbackFormCard
              title={title}
              description={description}
              onTitleChange={setTitle}
              onDescriptionChange={setDescription}
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
                <span className="badge bg-light text-muted border">Yêu cầu đã gửi</span>
              </div>

              <div className="d-flex flex-column gap-2.5" style={{ maxHeight: '550px', overflowY: 'auto' }}>
                {requests.map((item) => (
                  <FeedbackItemCard
                    key={item.id}
                    item={item}
                    isSelected={selectedId === item.id}
                    onToggle={() => setSelectedId(selectedId === item.id ? null : item.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default FeedbackView;
