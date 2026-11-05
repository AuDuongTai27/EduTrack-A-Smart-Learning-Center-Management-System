import React from "react";
import type { TeachingStudentProgressDetailDto } from "../../../../../BLL/models/teaching";

export interface StudentProgressHeroCardProps {
  student: TeachingStudentProgressDetailDto;
  onOpenEvaluationModal: () => void;
}

export default function StudentProgressHeroCard({
  student,
  onOpenEvaluationModal,
}: StudentProgressHeroCardProps) {
  const completedAssignmentsCount = student.assignments.filter(
    (a) => a.status === "graded" || a.status === "submitted"
  ).length;

  return (
    <div className="card border-0 mb-4 shadow-sm rounded-4 overflow-hidden">
      <div className="p-4 bg-white">
        <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
              style={{
                width: "64px",
                height: "64px",
                fontSize: "22px",
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              }}
            >
              {student.avatarInitials}
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <h4 className="fw-bold text-dark mb-0">{student.fullName}</h4>
                <span className="badge bg-emerald-subtle text-success border border-success-subtle px-2 py-1">
                  #{student.studentCode}
                </span>
                <span className="badge bg-light text-secondary border">
                  {student.className}
                </span>
              </div>
              <div className="text-muted small mt-1 d-flex align-items-center gap-3 flex-wrap">
                <span>
                  <i className="bi bi-envelope me-1" />
                  {student.email}
                </span>
                <span>
                  <i className="bi bi-telephone me-1" />
                  {student.phone}
                </span>
                <span>
                  <i className="bi bi-book me-1" />
                  Môn: <strong>{student.subjectName}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1 shadow-xs"
              onClick={onOpenEvaluationModal}
            >
              <i className="bi bi-pencil-square" /> Viết nhận xét trợ giảng
            </button>
          </div>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="bg-light px-4 py-3 border-top d-flex align-items-center justify-content-around flex-wrap gap-3">
        <div className="d-flex align-items-center gap-2">
          <div className="rounded-2 p-2 bg-primary-subtle text-primary">
            <i className="bi bi-calendar2-check-fill fs-5" />
          </div>
          <div>
            <span className="small text-muted d-block">Tỷ lệ chuyên cần</span>
            <strong className="fs-6 text-dark">
              {student.attendancePercentage}% ({student.presentDays}/{student.totalDays} buổi)
            </strong>
          </div>
        </div>

        <div className="vr d-none d-md-block opacity-25" style={{ height: "30px" }} />

        <div className="d-flex align-items-center gap-2">
          <div className="rounded-2 p-2 bg-success-subtle text-success">
            <i className="bi bi-journal-check fs-5" />
          </div>
          <div>
            <span className="small text-muted d-block">Bài tập đã hoàn thành</span>
            <strong className="fs-6 text-dark">
              {completedAssignmentsCount}/{student.assignments.length} bài
            </strong>
          </div>
        </div>

        <div className="vr d-none d-md-block opacity-25" style={{ height: "30px" }} />

        <div className="d-flex align-items-center gap-2">
          <div className="rounded-2 p-2 bg-info-subtle text-info">
            <i className="bi bi-award-fill fs-5" />
          </div>
          <div>
            <span className="small text-muted d-block">Điểm trung bình bài tập</span>
            <strong className="fs-6 text-primary">{student.avgScore} / 10</strong>
          </div>
        </div>

        <div className="vr d-none d-md-block opacity-25" style={{ height: "30px" }} />

        <div className="d-flex align-items-center gap-2">
          <div className="rounded-2 p-2 bg-warning-subtle text-warning">
            <i className="bi bi-chat-heart-fill fs-5" />
          </div>
          <div>
            <span className="small text-muted d-block">Đánh giá cá nhân</span>
            <strong className="fs-6 text-dark">{student.evaluations.length} lượt đánh giá</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

