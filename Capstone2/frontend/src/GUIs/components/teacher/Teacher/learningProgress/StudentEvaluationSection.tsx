import React from "react";
import type { TeachingStudentEvaluationItemDto } from "../../../../../BLL/models/teaching";

export interface StudentEvaluationSectionProps {
  evaluations: TeachingStudentEvaluationItemDto[];
  onOpenEvaluationModal: () => void;
}

export default function StudentEvaluationSection({
  evaluations,
  onOpenEvaluationModal,
}: StudentEvaluationSectionProps) {
  return (
    <div className="card border-0 mb-4 shadow-sm rounded-4 overflow-hidden">
      <div className="card-header bg-white py-3 px-4 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div>
          <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
            <i className="bi bi-chat-square-heart text-warning" />
            2. Đánh Giá Cá Nhân Của Giáo Viên &amp; Trợ Giảng
          </h5>
          <small className="text-muted">
            Đánh giá độc lập về thái độ, tư duy, sự tiến bộ và nhắn nhủ phụ huynh (không phụ thuộc vào điểm số bài tập)
          </small>
        </div>

        {/* Nút tạo đánh giá bên trong (ngay trong section) */}
        <button
          type="button"
          className="btn btn-primary d-inline-flex align-items-center gap-1.5 shadow-xs px-3 py-2 fw-semibold"
          onClick={onOpenEvaluationModal}
        >
          <i className="bi bi-plus-circle" /> Tạo đánh giá mới
        </button>
      </div>

      {/* Danh sách các đánh giá cá nhân đã ghi nhận */}
      <div className="p-4 bg-light-subtle d-flex flex-column gap-3">
        {evaluations.length > 0 ? (
          evaluations.map((item) => {
            const ratingBadge =
              item.rating === "excellent"
                ? "bg-success-subtle text-success border border-success-subtle"
                : item.rating === "good"
                ? "bg-primary-subtle text-primary border border-primary-subtle"
                : item.rating === "needs_improvement"
                ? "bg-warning-subtle text-warning border border-warning-subtle"
                : "bg-danger-subtle text-danger border border-danger-subtle";

            return (
              <div key={item.id} className="p-3 bg-white rounded-3 border shadow-xs">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pb-2 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-primary"
                      style={{ width: "36px", height: "36px", backgroundColor: "#EFF6FF" }}
                    >
                      <i className="bi bi-person-fill fs-6" />
                    </div>
                    <div>
                      <strong className="text-dark small d-block">{item.evaluatorName}</strong>
                      <span className="badge bg-secondary-subtle text-secondary small py-0.5">
                        {item.evaluatorRole}
                      </span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-light text-secondary border small">{item.typeLabel}</span>
                    <span className={`badge ${ratingBadge} small`}>{item.ratingLabel}</span>
                    <small className="text-muted">{item.createdAt}</small>
                  </div>
                </div>

                <p className="text-dark mb-0 ps-1" style={{ fontSize: "14px", lineHeight: "1.6" }}>
                  "{item.content}"
                </p>

                {item.suggestions && (
                  <div className="mt-3.5 px-3 py-2 rounded-2 bg-light-subtle border small text-muted d-flex align-items-center gap-2" style={{ marginTop: "14px" }}>
                    <i className="bi bi-lightbulb text-warning fs-6" />
                    <div>
                      <strong className="text-secondary">Đề xuất rèn luyện: </strong>
                      <span>{item.suggestions}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-muted bg-white rounded-3 border">
            <i className="bi bi-chat-left-text fs-3 d-block mb-1 text-secondary" />
            Chưa có đánh giá cá nhân nào cho học sinh này. Nhấn{" "}
            <strong>"Tạo đánh giá mới"</strong> ở góc phải để thêm nhận xét.
          </div>
        )}
      </div>
    </div>
  );
}

