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
      title={`Overall Attendance = ${attendedSessionsCount} sessions present / ${totalSessionsCount} sessions to date`}
    >
      <div>
        <div className="overall-label">Overall Attendance</div>
        <div className="overall-value">{computedRate}%</div>
      </div>
      <div className="overall-divider"></div>
      <div>
        <div className="overall-label">Present / Completed</div>
        <div className="overall-value">
          {attendedSessionsCount}/{totalSessionsCount}
        </div>
      </div>
    </div>
  );

  return (
    <StudentPageHeader
      title="Learning Progress"
      subtitle="Summary of attendance and feedback to date"
      breadcrumbs={[
        { label: 'Home', href: '/student/dashboard' },
        { label: 'Learning Progress' },
      ]}
      actions={attendanceActions}
    />
  );
}

export default ProgressPageHeader;
