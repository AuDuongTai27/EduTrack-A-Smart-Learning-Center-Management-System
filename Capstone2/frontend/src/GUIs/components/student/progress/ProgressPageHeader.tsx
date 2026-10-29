import React from 'react';

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
  return (
    <>
      {/* 1. Page Header with Overall Attendance */}
      <div className="progress-header-row">
        <div>
          <div className="progress-breadcrumbs">
            <span className="bc-primary">Học sinh</span>
            <span className="bc-sep">/</span>
            <span className="bc-muted">Tiến độ học tập</span>
          </div>
          <h1 className="progress-page-title">Tiến độ học tập</h1>
          <p className="progress-page-subtitle">Năm học 2025–2026 &middot; Học kỳ 1</p>
        </div>

        {/* Overall Attendance Hero Pill */}
        <div className="overall-attendance-pill">
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
      </div>
    </>
  );
}

export default ProgressPageHeader;
