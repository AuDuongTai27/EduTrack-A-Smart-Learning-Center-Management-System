import React from 'react';

export interface FeedbackFormCardProps {
  title: string;
  description: string;
  onTitleChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function FeedbackFormCard({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onSubmit,
}: FeedbackFormCardProps) {
  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
      <h2 className="h6 fw-bold text-dark mb-3 d-flex align-items-center gap-2">
        <i className="bi bi-pencil-square text-primary"></i>
        Gửi phản hồi mới
      </h2>

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
            onChange={(e) => onDescriptionChange(e.target.value)}
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
  );
};

export default FeedbackFormCard;
