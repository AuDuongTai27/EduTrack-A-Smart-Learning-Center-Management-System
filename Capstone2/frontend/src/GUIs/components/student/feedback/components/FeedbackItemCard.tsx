import React from 'react';
import type { FeedbackApprovalRequest } from '../feedbackData';

export interface FeedbackItemCardProps {
  item: FeedbackApprovalRequest;
  isSelected: boolean;
  onToggle: () => void;
  onEdit?: (item: FeedbackApprovalRequest) => void;
}

export function FeedbackItemCard({
  item,
  isSelected,
  onToggle,
  onEdit,
}: FeedbackItemCardProps) {
  const getBadgeStyle = () => {
    if (item.status === 'approved') return 'bg-success text-white';
    if (item.status === 'rejected') return 'bg-danger text-white';
    if (item.canEdit) return 'bg-secondary text-white';
    return 'bg-warning text-dark';
  };

  return (
    <div
      className={`p-3 rounded-3 border transition-all ${
        isSelected ? 'bg-primary-subtle border-primary' : 'bg-light border-light-subtle'
      }`}
      style={{ cursor: 'pointer' }}
      onClick={onToggle}
    >
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
        <div className="d-flex align-items-center gap-2">
          <span className={`badge rounded-pill ${getBadgeStyle()}`}>
            {item.statusLabel}
          </span>
          {item.requestCode && (
            <span className="text-muted small fw-semibold">#{item.requestCode}</span>
          )}
        </div>

        <div className="d-flex align-items-center gap-2">
          {item.canEdit && onEdit ? (
            <button
              type="button"
              className="btn btn-sm btn-outline-primary py-0 px-2 rounded-pill small fw-semibold"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              title="Chỉnh sửa phản hồi (Đơn chưa được Admin Staff xem xét)"
            >
              <i className="bi bi-pencil-square me-1"></i>
              Chỉnh sửa
            </button>
          ) : (
            <span className="badge bg-white text-muted border" title="Đơn đã được Admin Staff tiếp nhận hoặc xử lý nên không thể chỉnh sửa">
              <i className="bi bi-lock-fill me-1"></i>
              Đã khóa sửa
            </span>
          )}
          <small className="text-muted">{item.createdAt}</small>
        </div>
      </div>

      <h3 className="h6 fw-bold mb-1 text-dark">{item.title}</h3>
      <p className="text-muted small mb-2 line-clamp-2">{item.description}</p>

      {/* Hiển thị chi tiết phản hồi nếu được chọn */}
      {isSelected && (
        <div className="mt-3 pt-3 border-top border-secondary-subtle">
          <div className="small mb-1">
            <span className="fw-semibold text-dark">Người gửi: </span>
            <span className="text-secondary">
              {item.senderName} ({item.senderRole === 'parent' ? 'Phụ huynh' : 'Học sinh'})
            </span>
          </div>

          {item.status === 'pending' && item.canEdit && (
            <div className="text-muted small fst-italic mt-2">
              <i className="bi bi-clock me-1"></i>
              Đơn đang ở trạng thái <strong>Chưa xem xét giải quyết</strong>. Bạn vẫn có thể bấm <strong>Chỉnh sửa</strong> để cập nhật nội dung trước khi Giáo vụ (Admin Staff) tiếp nhận.
            </div>
          )}

          {item.status === 'pending' && !item.canEdit && (
            <div className="text-primary small fst-italic mt-2">
              <i className="bi bi-hourglass-split me-1"></i>
              Giáo vụ ({item.reviewedBy || 'Admin Staff'}) đã ấn xem và chuyển sang trạng thái <strong>Chờ duyệt</strong>. Đơn đã khóa quyền chỉnh sửa.
            </div>
          )}

          {(item.status === 'approved' || item.status === 'rejected') && (
            <div className="alert alert-light border rounded-3 p-2.5 mt-2 mb-0">
              <div className="d-flex align-items-center gap-2 mb-1 text-success fw-semibold small">
                <i className="bi bi-person-check-fill"></i>
                Phản hồi từ: {item.reviewedBy || 'Admin Staff (Giáo vụ)'}
              </div>
              {item.reviewedAt && (
                <div className="text-muted small mb-1">Thời gian xử lý: {item.reviewedAt}</div>
              )}
              {item.reviewNotes && (
                <div className="small text-dark fst-italic">"{item.reviewNotes}"</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FeedbackItemCard;
