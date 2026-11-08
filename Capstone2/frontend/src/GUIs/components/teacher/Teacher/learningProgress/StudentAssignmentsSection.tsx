import React from "react";
import type { TeachingStudentAssignmentDetailItemDto } from "../../../../../BLL/models/teaching";

export interface StudentAssignmentsSectionProps {
  assignments: TeachingStudentAssignmentDetailItemDto[];
}

export default function StudentAssignmentsSection({
  assignments,
}: StudentAssignmentsSectionProps) {
  return (
    <div className="card border-0 mb-4 shadow-sm rounded-4 overflow-hidden">
      <div className="card-header bg-white py-3 px-4 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
            <i className="bi bi-journals text-primary" />
            1. Bảng Tổng Hợp Bài Tập Trong Môn Học
          </h5>
          <small className="text-muted">
            Theo dõi chi tiết tất cả các bài tập theo tuần, trạng thái nộp bài, điểm số và nhận xét giáo viên
          </small>
        </div>
        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1.5 rounded-pill">
          Tổng cộng: {assignments.length} bài tập
        </span>
      </div>

      <div className="table-responsive">
        <table className="table custom-table align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th style={{ width: "26%" }}>Tên Bài Tập &amp; Tuần Học</th>
              <th style={{ width: "16%" }}>Hạn Nộp / Ngày Nộp</th>
              <th style={{ width: "14%" }}>Trạng Thái</th>
              <th style={{ width: "12%" }}>Điểm Số</th>
              <th style={{ width: "32%" }}>Nhận Xét &amp; Đánh Giá Bài Làm</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length > 0 ? (
              assignments.map((item) => {
                const statusBadge =
                  item.status === "graded" ? (
                    <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-2">
                      <i className="bi bi-check-circle-fill me-1" /> Đã chấm điểm
                    </span>
                  ) : item.status === "submitted" ? (
                    <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1 rounded-2">
                      <i className="bi bi-file-earmark-check me-1" /> Đã nộp (Chờ chấm)
                    </span>
                  ) : item.status === "late" ? (
                    <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 rounded-2">
                      <i className="bi bi-clock-history me-1" /> Nộp trễ hạn
                    </span>
                  ) : item.status === "missing" ? (
                    <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 rounded-2">
                      <i className="bi bi-x-circle-fill me-1" /> Chưa nộp
                    </span>
                  ) : (
                    <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1 rounded-2">
                      <i className="bi bi-hourglass-split me-1" /> Đang giao
                    </span>
                  );

                return (
                  <tr key={item.assignmentId}>
                    <td>
                      <span className="badge bg-light text-secondary border small mb-1 d-inline-block">
                        {item.weekTitle}
                      </span>
                      <strong className="d-block text-dark">{item.title}</strong>
                      {item.submissionFileUrl && (
                        <a
                          href={item.submissionFileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="small text-primary text-decoration-none d-inline-flex align-items-center gap-1 mt-1"
                        >
                          <i className="bi bi-paperclip" /> Xem bài nộp của học sinh
                        </a>
                      )}
                    </td>

                    <td>
                      <small className="text-muted d-block">
                        Hạn: <span className="text-dark fw-medium">{item.dueDate}</span>
                      </small>
                      {item.submittedAt ? (
                        <small className="text-success d-block mt-0.5">
                          <i className="bi bi-check2 me-1" />
                          Nộp lúc: {item.submittedAt}
                        </small>
                      ) : (
                        <small className="text-muted fst-italic d-block mt-0.5">Chưa có bài nộp</small>
                      )}
                    </td>

                    <td>{statusBadge}</td>

                    <td>
                      {item.score != null ? (
                        <div>
                          <span className="fs-5 fw-bold text-primary">{item.score}</span>
                          <span className="text-muted small">/{item.maxScore}</span>
                          {item.aiScore != null && (
                            <small className="d-block text-muted" style={{ fontSize: "11px" }}>
                              AI chấm: {item.aiScore}đ
                            </small>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted small">--</span>
                      )}
                    </td>

                    <td>
                      {item.teacherFeedback ? (
                        <div className="p-2 rounded-2 bg-light border small text-dark mb-1">
                          <strong className="text-primary d-block mb-0.5">
                            <i className="bi bi-chat-quote-fill me-1" /> Giáo viên:
                          </strong>
                          {item.teacherFeedback}
                        </div>
                      ) : (
                        <span className="text-muted small fst-italic">Chưa có nhận xét bài tập.</span>
                      )}

                      {item.aiFeedback && (
                        <div
                          className="p-2 rounded-2 border small mt-1"
                          style={{ backgroundColor: "#F0FDF4", borderColor: "#DCFCE7", color: "#166534" }}
                        >
                          <strong className="d-block mb-0.5 text-success">
                            <i className="bi bi-robot me-1" /> AI Review:
                          </strong>
                          {item.aiFeedback}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4 text-muted">
                  Chưa có bài tập nào được giao cho lớp này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
