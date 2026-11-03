import React from 'react';

export interface ProgressStatsGridProps {
  presentCount?: number;
  absentCount?: number;
  lateCount?: number;
  totalSessionsCount?: number;
  enrolledClassesCount?: number;
}

export function ProgressStatsGrid({
  presentCount = 35,
  absentCount = 4,
  lateCount = 5,
  enrolledClassesCount = 3,
}: ProgressStatsGridProps) {
  // Tổng số buổi đã học tính đến hiện tại = Có mặt + Vắng mặt + Đi trễ
  const currentTotalSessions = presentCount + absentCount + lateCount;
  const presentPct =
    currentTotalSessions > 0
      ? Math.round((presentCount * 100) / currentTotalSessions)
      : 100;
  const absentPct =
    currentTotalSessions > 0
      ? Math.round((absentCount * 100) / currentTotalSessions)
      : 0;
  const latePct =
    currentTotalSessions > 0
      ? Math.round((lateCount * 100) / currentTotalSessions)
      : 0;

  return (
    <>
      {/* 2. 4-Stats Cards Grid */}
      <div className="progress-stats-grid">
        {/* Card 1: Có mặt */}
        <div className="progress-stat-card" style={{ borderColor: '#A7F3D0' }}>
          <div
            className="progress-stat-icon-box"
            style={{ backgroundColor: '#ECFDF5', color: '#059669' }}
          >
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div>
            <div className="progress-stat-num" style={{ color: '#047857' }}>
              {presentCount}
            </div>
            <div className="progress-stat-title">Có mặt đúng giờ</div>
            <div className="progress-stat-sublabel">
              trên {currentTotalSessions} buổi đã học ({presentPct}%)
            </div>
          </div>
        </div>

        {/* Card 2: Vắng mặt */}
        <div className="progress-stat-card" style={{ borderColor: '#FECACA' }}>
          <div
            className="progress-stat-icon-box"
            style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}
          >
            <i className="bi bi-x-circle-fill"></i>
          </div>
          <div>
            <div className="progress-stat-num" style={{ color: '#B91C1C' }}>
              {absentCount}
            </div>
            <div className="progress-stat-title">Vắng mặt</div>
            <div className="progress-stat-sublabel">
              trên {currentTotalSessions} buổi đã học ({absentPct}%)
            </div>
          </div>
        </div>

        {/* Card 3: Đi trễ */}
        <div className="progress-stat-card" style={{ borderColor: '#FDE68A' }}>
          <div
            className="progress-stat-icon-box"
            style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}
          >
            <i className="bi bi-clock-fill"></i>
          </div>
          <div>
            <div className="progress-stat-num" style={{ color: '#B45309' }}>
              {lateCount}
            </div>
            <div className="progress-stat-title">Đi trễ</div>
            <div className="progress-stat-sublabel">
              trên {currentTotalSessions} buổi đã học ({latePct}%)
            </div>
          </div>
        </div>

        {/* Card 4: Tổng số buổi đã học tính đến hiện tại */}
        <div className="progress-stat-card" style={{ borderColor: '#BFDBFE' }}>
          <div
            className="progress-stat-icon-box"
            style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}
          >
            <i className="bi bi-calendar2-check-fill"></i>
          </div>
          <div>
            <div className="progress-stat-num" style={{ color: '#1D4ED8' }}>
              {currentTotalSessions}
            </div>
            <div className="progress-stat-title">Buổi đã học đến hiện tại</div>
            <div className="progress-stat-sublabel">
              {presentCount} có mặt + {absentCount} vắng + {lateCount} trễ &middot; {enrolledClassesCount} lớp
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProgressStatsGrid;
