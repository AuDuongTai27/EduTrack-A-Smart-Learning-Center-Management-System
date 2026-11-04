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
  const computedRate =
    totalSessionsCount > 0
      ? Math.round((attendedSessionsCount * 100) / totalSessionsCount)
      : overallAttendanceRate;

  const attendanceActions = (
    <div
      className="overall-attendance-pill shadow-sm"
      title={`Điểm danh chung = ${attendedSessionsCount} buổi có mặt / ${totalSessionsCount} buổi đã học tính đến hiện tại`}
    >
      <div>
        <div className="overall-label">Điểm danh chung</div>
        <div className="overall-value">{computedRate}%</div>
      </div>
      <div className="overall-divider"></div>
      <div>
        <div className="overall-label">Có mặt / Đã học</div>
        <div className="overall-value">
          {attendedSessionsCount}/{totalSessionsCount}
        </div>
      </div>
    </div>
  );

  return (
    <StudentPageHeader
      title="Tiến độ học tập"
      subtitle="Tổng hợp điểm danh và nhận xét tính đến thời điểm hiện tại"
      breadcrumbs={[
        { label: 'Trang chủ', href: '/student/dashboard' },
        { label: 'Tiến độ học tập' },
      ]}
      actions={attendanceActions}
    />
  );
}

export default ProgressPageHeader;
