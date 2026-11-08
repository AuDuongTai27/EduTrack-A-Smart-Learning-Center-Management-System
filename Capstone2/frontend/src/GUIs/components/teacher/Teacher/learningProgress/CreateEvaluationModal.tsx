import React, { useState } from "react";
import type { CreateTeachingEvaluationPayload } from "../../../../../BLL/models/teaching";

export interface CreateEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number;
  studentName: string;
  studentCode: string;
  classId?: number;
  className?: string;
  evaluatorName?: string;
  evaluatorRole?: string;
  onSubmit: (data: CreateTeachingEvaluationPayload) => void | Promise<void>;
}

export default function CreateEvaluationModal({
  isOpen,
  onClose,
  studentId,
  studentName,
  studentCode,
  classId = 1,
  className = "Lớp 9A1 - Toán Nâng Cao",
  evaluatorName = "ThS. Hoàng Quốc Việt",
  evaluatorRole = "Giáo viên",
  onSubmit,
}: CreateEvaluationModalProps) {
  const [evaluationType, setEvaluationType] = useState<string>("attitude");
  const [rating, setRating] = useState<"excellent" | "good" | "needs_improvement" | "concern">("good");
  const [content, setContent] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const typeLabels: Record<string, string> = {
    attitude: "Thái độ & Tinh thần học tập",
    academic: "Tư duy & Năng lực chuyên môn",
    progress: "Sự tiến bộ theo giai đoạn",
    parent_note: "Nhận xét gửi Phụ huynh",
  };

  const ratingLabels: Record<string, string> = {
    excellent: "Xuất sắc / Rất tích cực",
    good: "Tốt / Đạt yêu cầu",
    needs_improvement: "Cần cải thiện thêm",
    concern: "Cần lưu ý / Nhắc nhở",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert("Vui lòng nhập nội dung đánh giá cá nhân.");
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        studentId,
        classId,
        evaluatorName,
        evaluatorRole,
        evaluationType,
        typeLabel: typeLabels[evaluationType] || "Đánh giá chung",
        rating,
        ratingLabel: ratingLabels[rating] || "Tốt",
        content: content.trim(),
        suggestions: suggestions.trim() || undefined,
      });

      setContent("");
      setSuggestions("");
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", zIndex: 1080 }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Modal Header */}
          <div className="modal-header bg-primary text-white py-3 px-4">
            <h5 className="modal-title d-flex align-items-center gap-2 fs-6 fw-bold mb-0">
              <i className="bi bi-pencil-square" />
              Tạo Đánh Giá Cá Nhân Học Viên
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
              disabled={submitting}
            />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {/* Student Target Summary Bar */}
              <div className="p-3 bg-light rounded-3 mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2 border">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold"
                    style={{ width: "42px", height: "42px" }}
                  >
                    <i className="bi bi-person-fill fs-5" />
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold text-dark">{studentName}</h6>
                    <small className="text-muted">
                      Mã HV: <strong className="text-primary">{studentCode}</strong> &bull; Lớp:{" "}
                      <strong>{className}</strong>
                    </small>
                  </div>
                </div>

                <div className="text-end small">
                  <span className="text-muted d-block">Người đánh giá:</span>
                  <span className="badge bg-secondary-subtle text-secondary fw-semibold">
                    {evaluatorName} ({evaluatorRole})
                  </span>
                </div>
              </div>

              <div className="row g-3 mb-3">
                {/* 1. Loại đánh giá */}
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-dark mb-1">
                    1. Khía cạnh đánh giá <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={evaluationType}
                    onChange={(e) => setEvaluationType(e.target.value)}
                  >
                    <option value="attitude">Thái độ &amp; Tinh thần học tập</option>
                    <option value="academic">Tư duy &amp; Năng lực chuyên môn</option>
                    <option value="progress">Sự tiến bộ theo giai đoạn</option>
                    <option value="parent_note">Nhận xét gửi Phụ huynh</option>
                  </select>
                  <small className="text-muted" style={{ fontSize: "11px" }}>
                    Đánh giá độc lập, không phụ thuộc vào điểm số bài tập.
                  </small>
                </div>

                {/* 2. Mức độ / Xếp loại */}
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-dark mb-1">
                    2. Mức độ ghi nhận <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={rating}
                    onChange={(e) => setRating(e.target.value as any)}
                  >
                    <option value="excellent">Xuất sắc / Rất tích cực</option>
                    <option value="good">Tốt / Đạt yêu cầu</option>
                    <option value="needs_improvement">Cần cải thiện thêm</option>
                    <option value="concern">Cần lưu ý / Nhắc nhở</option>
                  </select>
                  <small className="text-muted" style={{ fontSize: "11px" }}>
                    Mức độ đánh giá chung cho giai đoạn này.
                  </small>
                </div>
              </div>

              {/* 3. Nội dung nhận xét chi tiết */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark mb-1">
                  3. Nội dung đánh giá chi tiết <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control form-control-sm"
                  rows={4}
                  placeholder="Ghi nhận cụ thể về sự tập trung, khả năng tiếp thu, tinh thần phát biểu, làm việc nhóm hoặc điểm cần khắc phục của học sinh..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>

              {/* 4. Đề xuất cải thiện hoặc nhắn nhủ */}
              <div className="mb-2">
                <label className="form-label small fw-bold text-dark mb-1">
                  4. Đề xuất rèn luyện / Nhắn nhủ (Tùy chọn)
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ví dụ: Cần rèn thêm kỹ năng vẽ đồ thị, nên ôn tập lại công thức Viète..."
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer bg-light px-4 py-2.5">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onClose}
                disabled={submitting}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1.5 px-3"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg" />
                    Lưu đánh giá
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
