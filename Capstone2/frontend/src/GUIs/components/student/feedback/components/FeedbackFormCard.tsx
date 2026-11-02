import React from 'react';

export interface FeedbackFormCardProps {
  title: string;
  description: string;
  isSubmitting?: boolean;
  editingCode?: string | null;
  onTitleChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  onCancelEdit?: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function FeedbackFormCard({
  title,
  description,
  isSubmitting = false,
  editingCode = null,
  onTitleChange,
  onDescriptionChange,
  onCancelEdit,
  onSubmit,
}: FeedbackFormCardProps) {
  const isEditing = Boolean(editingCode);

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="h6 fw-bold text-dark mb-0 d-flex align-items-center gap-2">
          <i className={`bi ${isEditing ? 'bi-pencil-fill text-warning' : 'bi-pencil-square text-primary'}`}></i>
          {isEditing ? `Chỉnh sửa phản hồi (#${editingCode})` : 'Gửi phản hồi mới về Giáo vụ (Admin Staff)'}
        </h2>
        {isEditing && (
          <span className="badge bg-warning-subtle text-dark border border-warning-subtle">
            Đang chỉnh sửa
          </span>
        )}
      </div>

      {isEditing && (
        <div className="alert alert-warning border-0 rounded-3 py-2 px-3 small mb-3">
          <i className="bi bi-info-circle-fill me-1"></i>
          Bạn có thể chỉnh sửa nội dung khi đơn đang ở trạng thái <strong>Chưa xem xét giải quyết</strong>. Khi Admin Staff đã tiếp nhận (Chờ duyệt), đơn sẽ bị khóa chỉnh sửa.
        </div>
      )}

      <form onSubmit={onSubmit}>
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
            onChange={(e) => onTitleChange(e.target.value)}
            disabled={isSubmitting}
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
            placeholder="Nhập chi tiết nội dung phản hồi của bạn gửi tới Admin Staff. Nếu cần liên kết học sinh, vui lòng ghi rõ họ tên con, ngày sinh, trường học và SĐT để giáo vụ đối soát..."
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            disabled={isSubmitting}
            required
          ></textarea>
        </div>

        {/* Nút gửi / Lưu chỉnh sửa */}
        <div className="d-flex gap-2">
          {isEditing && onCancelEdit && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onCancelEdit}
              className="btn btn-outline-secondary w-50 py-2.5 rounded-3 fw-semibold"
            >
              Hủy chỉnh sửa
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-100 py-2.5 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
          >
            <i className={`bi ${isSubmitting ? 'bi-hourglass-split' : isEditing ? 'bi-check2-circle' : 'bi-send-fill'}`}></i>
            <span>
              {isSubmitting
                ? 'Đang lưu...'
                : isEditing
                ? 'Lưu chỉnh sửa'
                : 'Gửi phản hồi'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default FeedbackFormCard;
