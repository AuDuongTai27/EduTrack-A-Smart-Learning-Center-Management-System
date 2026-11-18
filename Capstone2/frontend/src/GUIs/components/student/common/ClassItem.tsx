import React from 'react';
import { Link } from 'react-router-dom';
import type { EnrolledClassItem } from '../classes/classesData';

export interface ClassItemProps {
  classItem: EnrolledClassItem;
}

/**
 * ClassItem - Thẻ lớp học tối giản, gọn gàng cho Student
 * Giữ lại: Tên lớp, Tên môn, Thanh điểm danh % đi học, và View Detail
 */
export function ClassItem({ classItem: cls }: ClassItemProps) {
  const attendanceRate = cls.attendanceRate ?? 95;

  return (
    <Link
      to={`/student/classes/${cls.classId}`}
      className={`class-card ${cls.subjectThemeClass} ${cls.isCompleted ? 'is-completed-card' : ''}`}
    >
      <div className="card-accent-bar"></div>
      <div className="class-card-body et-subject-card-body d-flex flex-column justify-content-between p-3.5" style={{ minHeight: 180 }}>
        <div>
          {/* Header: Tên môn & Badge hoàn thành */}
          <div className="class-card-header d-flex align-items-center justify-content-between mb-2">
            <div className="d-flex align-items-center gap-1.5 flex-nowrap flex-shrink-0">
              <span className="subject-badge flex-shrink-0" style={{ whiteSpace: 'nowrap' }}>{cls.badge}</span>
              {cls.isCompleted && (
                <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle rounded-pill px-2 py-0.5 fw-medium flex-shrink-0" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                  <i className="bi bi-check2-circle me-1"></i>Completed
                </span>
              )}
            </div>
            <div className="subject-icon-box flex-shrink-0">
              <i className="bi bi-book"></i>
            </div>
          </div>

          {/* Tên lớp */}
          <h3 className="class-name mb-0" style={{ fontSize: '16px', fontWeight: 650, lineHeight: 1.45 }}>
            {cls.className}
          </h3>
        </div>

        {/* Thanh điểm danh % đi học - Cố định màu xanh dương cho thấy số lớp đã tham gia */}
        <div className="class-attendance-bar mt-3 pt-2.5 border-top">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="small text-muted" style={{ fontSize: '11.5px', fontWeight: 500 }}>
              Attendance Rate
            </span>
            <span
              className="small fw-bold text-primary"
              style={{ fontSize: '12px', color: '#2563EB' }}
            >
              {attendanceRate}% {cls.totalSessions ? `(${cls.attendedSessions ?? 0}/${cls.totalSessions})` : ''}
            </span>
          </div>
          <div className="progress" style={{ height: 6, backgroundColor: '#eef2f6', borderRadius: 4 }}>
            <div
              className="progress-bar bg-primary"
              style={{ width: `${attendanceRate}%`, borderRadius: 4, backgroundColor: '#2563EB' }}
              role="progressbar"
            />
          </div>
        </div>
      </div>

      {/* View Detail Footer */}
      <div className="class-card-footer">
        <span>View Details</span>
        <i className="bi bi-chevron-right"></i>
      </div>
    </Link>
  );
};

export default ClassItem;
