import React from 'react';
import type { FeedbackApprovalRequest } from '../feedbackData';

export interface FeedbackItemCardProps {
  item: FeedbackApprovalRequest;
  isSelected: boolean;
  onToggle: () => void;
}

export function FeedbackItemCard({
  item,
  isSelected,
  onToggle,
}: FeedbackItemCardProps) {
  return (
    <div
      className={`p-3 rounded-3 border transition-all ${
        isSelected ? 'bg-primary-subtle border-primary' : 'bg-light border-light-subtle'
      }`}
      style={{ cursor: 'pointer' }}
      onClick={onToggle}
    >
      <div className="d-flex align-items-center justify-content-between mb-2">
        <span
          className={`badge rounded-pill ${
            item.status === 'approved'
              ? 'bg-success'
              : item.status === 'rejected'
              ? 'bg-danger'
              : 'bg-warning text-dark'
          }`}
        >
          {item.statusLabel}
        </span>
        <small className="text-muted">{item.createdAt}</small>
      </div>

      <h3 className="h6 fw-bold mb-1 text-dark">{item.title}</h3>
      <p className="text-muted small mb-2 line-clamp-2">{item.description}</p>

      {/* Hiển thị chi tiết phản hồi nếu được chọn */}
      {isSelected && (
        <div className="mt-3 pt-3 border-top border-secondary-subtle">
          <div className="small mb-1">
            <span className="fw-semibold text-dark">Người gửi: </span>
            <span className="text-secondary">{item.senderName} ({item.senderRole === 'parent' ? 'Phụ huynh' : 'Học sinh'})</span>
          </div>

          {item.reviewedBy && (
            <div className="alert alert-light border rounded-3 p-2.5 mt-2 mb-0">
              <div className="d-flex align-items-center gap-2 mb-1 text-success fw-semibold small">
                <i className="bi bi-person-check-fill"></i>
                Phản hồi từ: {item.reviewedBy}
              </div>
              {item.reviewedAt && (
                <div className="text-muted small mb-1">Thời gian: {item.reviewedAt}</div>
              )}
              {item.reviewNotes && (
                <div className="small text-dark fst-italic">"{item.reviewNotes}"</div>
              )}
            </div>
          )}

          {!item.reviewedBy && (
            <div className="text-muted small fst-italic mt-2">
              <i className="bi bi-hourglass-split me-1"></i>
              Ban Giáo vụ đang tiếp nhận và sẽ phản hồi sớm nhất.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackItemCard;
