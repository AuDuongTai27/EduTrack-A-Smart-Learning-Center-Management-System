import React from 'react';
import { StudentPageHeader } from '../common/StudentPageHeader';

export interface ProgressPageHeaderProps {
  overallAttendanceRate?: number;
  attendedSessionsCount?: number;
  totalSessionsCount?: number;
}

export function ProgressPageHeader({
  overallAttendanceRate = 80,
  attendedSessionsCount = 35,
  totalSessionsCount = 44,
}: ProgressPageHeaderProps) {
  const attendanceActions = (
    <div className="overall-attendance-pill shadow-sm">
      <div>
        <div className="overall-label">Điểm danh chung</div>
        <div className="overall-value">{overallAttendanceRate}%</div>
      </div>
      <div className="overall-divider"></div>
      <div>
        <div className="overall-label">Tổng buổi học</div>
        <div className="overall-value">
          {attendedSessionsCount}/{totalSessionsCount}
        </div>
      </div>
    </div>
  );

  return (
    <StudentPageHeader
      title="Tiến độ học tập"
      subtitle="Năm học 2025–2026 · Học kỳ 1"
      breadcrumbs={[
        { label: 'Trang chủ', href: '/student/dashboard' },
        { label: 'Tiến độ học tập' },
      ]}
      actions={attendanceActions}
    />
  );
}

export default ProgressPageHeader;
