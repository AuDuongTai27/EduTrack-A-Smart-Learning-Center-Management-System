import React, { useState } from 'react';

/**
 * Interface FeedbackItem tương ứng 1-1 với thực thể ApprovalRequest trong Database:
 * - request_type: 'feedback' (cố định trong enum: leave_absence, class_transfer, reschedule, feedback, other)
 * - title: Tiêu đề phản hồi
 * - description: Nội dung phản hồi
 * - status: 'pending' | 'approved' | 'rejected'
 * - review_notes: Ghi chú / Phản hồi từ nhân viên Staff
 */
export interface FeedbackApprovalRequest {
  id: number;
  requestType: 'feedback';
  title: string;
  description: string;
  senderName: string;
  senderRole: 'parent' | 'student';
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  statusLabel: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

interface FeedbackViewProps {
  userRole: 'parent' | 'student';
  userName: string;
  userPhone?: string;
}

import { MOCK_APPROVAL_REQUESTS, MOCK_USERS } from '../../../../DAL';

const getInitialFeedbackRequests = (): FeedbackApprovalRequest[] => {
  return MOCK_APPROVAL_REQUESTS
    .filter((r) => r.requestType === 'feedback')
    .map((r) => {
      const requester = MOCK_USERS.find((u) => u.userId === r.requestedBy);
      const isParent = requester?.userCode?.startsWith('PAR') || false;
      const reviewer = r.reviewedBy ? MOCK_USERS.find((u) => u.userId === r.reviewedBy) : null;
      return {
        id: r.requestId,
        requestType: 'feedback' as const,
        title: r.title || (r.reason && r.reason.includes(']') ? r.reason.split(']')[0].replace('[', '').trim() : 'Phản hồi ý kiến'),
        description: r.description || r.reason || '',
        senderName: requester ? requester.fullName : (isParent ? 'Phụ huynh' : 'Học sinh'),
        senderRole: (isParent ? 'parent' : 'student') as 'parent' | 'student',
        createdAt: new Date(r.createdAt).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: (r.status as 'pending' | 'approved' | 'rejected') || 'pending',
        statusLabel: r.status === 'approved' ? 'Đã giải quyết' : r.status === 'rejected' ? 'Từ chối' : 'Chờ tiếp nhận',
        reviewedBy: reviewer ? `${reviewer.fullName} (${reviewer.specialty || 'Giáo vụ'})` : undefined,
        reviewedAt: r.reviewedAt ? new Date(r.reviewedAt).toLocaleString('vi-VN') : undefined,
        reviewNotes: r.reviewNotes || undefined,
      };
    });
};

export const FeedbackView: React.FC<FeedbackViewProps> = ({
  userRole,
  userName,
}) => {
  const [requests, setRequests] = useState<FeedbackApprovalRequest[]>(getInitialFeedbackRequests());
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung phản hồi.');
      return;
    }

    const newRequest: FeedbackApprovalRequest = {
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

    setRequests([newRequest, ...requests]);
    setTitle('');
    setDescription('');

    setToastMessage(
      'Đã gửi phản hồi thành công lên hệ thống Giáo vụ (Loại: Feedback)! Nhân viên sẽ kiểm tra và phản hồi lại sớm nhất.'
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
          {/* CỘT 1: FORM GỬI PHẢN HỒI (CHỈ TITLE VÀ DESCRIPTION) */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <h2 className="h6 fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-pencil-square text-primary"></i>
                Gửi phản hồi mới
              </h2>

              <form onSubmit={handleSubmit}>
                {/* Tiêu đề */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">
                    Tiêu đề <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    placeholder="VD: Yêu cầu liên kết học sinh, Thắc mắc học phí, Góp ý lớp học..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Nội dung */}
                <div className="mb-4">
                  <label className="form-label small fw-semibold text-secondary">
                    Nội dung <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control rounded-3"
                    rows={6}
                    placeholder="Nhập chi tiết nội dung phản hồi của bạn. Nếu cần liên kết học sinh, vui lòng ghi rõ họ tên con, ngày sinh, trường học và SĐT để giáo vụ đối soát..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  ></textarea>
                </div>

                {/* Nút gửi */}
                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2.5 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                >
                  <i className="bi bi-send-fill"></i>
                  <span>Gửi phản hồi</span>
                </button>
              </form>
            </div>
          </div>

          {/* CỘT 2: DANH SÁCH LỊCH SỬ PHẢN HỒI (APPROVAL REQUESTS) */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                <h2 className="h6 fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                  <i className="bi bi-clock-history text-primary"></i>
                  Lịch sử phản hồi ({requests.length})
                </h2>
                <span className="badge bg-light text-muted border">Yêu cầu đã gửi</span>
              </div>

              {/* Danh sách */}
              <div className="d-flex flex-column gap-2.5" style={{ maxHeight: '550px', overflowY: 'auto' }}>
                {requests.map((item) => {
                  const isSelected = selectedId === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-4 border transition-all ${
                        isSelected
                          ? 'border-primary bg-primary-subtle bg-opacity-20'
                          : 'bg-light hover-bg-white'
                      }`}
                      onClick={() => setSelectedId(isSelected ? null : item.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-1.5">
                        <span className="small text-muted" style={{ fontSize: '11.5px' }}>
                          <i className="bi bi-clock me-1"></i> {item.createdAt}
                        </span>

                        {item.status === 'approved' ? (
                          <span className="badge bg-success text-white rounded-pill">
                            <i className="bi bi-check-circle-fill me-1"></i> Đã giải quyết
                          </span>
                        ) : item.status === 'rejected' ? (
                          <span className="badge bg-danger text-white rounded-pill">
                            <i className="bi bi-x-circle-fill me-1"></i> Từ chối
                          </span>
                        ) : (
                          <span className="badge bg-warning text-dark rounded-pill">
                            <i className="bi bi-hourglass-split me-1"></i> Chờ duyệt
                          </span>
                        )}
                      </div>

                      <h3 className="fw-bold text-dark small mb-1">{item.title}</h3>
                      <p className="text-secondary small mb-2 line-clamp-2">{item.description}</p>

                      <div className="d-flex align-items-center justify-content-end small text-muted border-top pt-2">
                        <span className="text-primary fw-semibold" style={{ fontSize: '11.5px' }}>
                          {isSelected ? 'Thu gọn ▲' : 'Xem phản hồi từ Staff ▼'}
                        </span>
                      </div>

                      {/* Chi tiết phản hồi từ Staff */}
                      {isSelected && (
                        <div className="mt-3 pt-3 border-top">
                          {item.reviewNotes ? (
                            <div className="p-3 rounded-3 bg-success bg-opacity-10 border border-success-subtle">
                              <div className="d-flex align-items-center justify-content-between mb-1">
                                <strong className="text-success small d-flex align-items-center gap-1">
                                  <i className="bi bi-reply-fill"></i>
                                  Phản hồi từ: {item.reviewedBy || 'Giáo vụ EduTrack'}
                                </strong>
                                <small className="text-muted">{item.reviewedAt}</small>
                              </div>
                              <p className="small text-dark mb-0 fst-italic">
                                "{item.reviewNotes}"
                              </p>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-3 bg-warning bg-opacity-10 border border-warning-subtle text-muted small">
                              <i className="bi bi-clock me-1"></i>
                              Phiếu đang được nhân viên Giáo vụ tiếp nhận và xử lý thủ công. Vui lòng kiểm tra lại sau.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default FeedbackView;
