import React from 'react';
import { Link } from 'react-router-dom';
import type { EnrolledClassItem } from '../classes/classesData';

export interface ClassItemProps {
  classItem: EnrolledClassItem;
}

/**
 * ClassItem - Component nguyên tử (Atomic / Item) hiển thị một thẻ lớp học
 * Tái sử dụng đồng nhất giữa Student Dashboard và Student Classes
 */
export function ClassItem({ classItem: cls }: ClassItemProps) {
  return (
    <Link
      to={`/student/classes/${cls.classId}`}
      className={`class-card ${cls.subjectThemeClass}`}
    >
      <div className="card-accent-bar"></div>
      <div className="class-card-body">
        <div className="class-card-header">
          <span className="subject-badge">{cls.badge}</span>
          <div className="subject-icon-box">
            <i className="bi bi-book"></i>
          </div>
        </div>
        <h3 className="class-name">{cls.className}</h3>
        <div className="card-spacer"></div>
        <div className="card-divider"></div>
        <div className="teacher-row">
          <div className="teacher-avatar-mini">{cls.teacherInitials}</div>
          <span className="teacher-name">
            <span className="teacher-label">GV:</span> {cls.teacherName || 'Chưa phân công'}
          </span>
        </div>
        <div className="meta-row">
          <i className="bi bi-calendar-event"></i>
          <span>{cls.scheduleText}</span>
        </div>
        <div className="meta-row room">
          <i className="bi bi-geo-alt"></i>
          <span>{cls.room || 'Chưa xếp phòng'}</span>
        </div>
      </div>
      <div className="class-card-footer">
        <span>Xem chi tiết</span>
        <i className="bi bi-chevron-right"></i>
      </div>
    </Link>
  );
};

export default ClassItem;
