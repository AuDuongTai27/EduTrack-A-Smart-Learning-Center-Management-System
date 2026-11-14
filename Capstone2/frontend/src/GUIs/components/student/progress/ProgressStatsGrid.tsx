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
  // Total sessions attended to date = Present + Absent + Late
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
        {/* Card 1: Present */}
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
            <div className="progress-stat-title">Present on Time</div>
            <div className="progress-stat-sublabel">
              out of {currentTotalSessions} past sessions ({presentPct}%)
            </div>
          </div>
        </div>

        {/* Card 2: Absent */}
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
            <div className="progress-stat-title">Absent</div>
            <div className="progress-stat-sublabel">
              out of {currentTotalSessions} past sessions ({absentPct}%)
            </div>
          </div>
        </div>

        {/* Card 3: Late */}
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
            <div className="progress-stat-title">Late</div>
            <div className="progress-stat-sublabel">
              out of {currentTotalSessions} past sessions ({latePct}%)
            </div>
          </div>
        </div>

        {/* Card 4: Total sessions attended to date */}
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
            <div className="progress-stat-title">Past Sessions to Date</div>
            <div className="progress-stat-sublabel">
              {presentCount} present + {absentCount} absent + {lateCount} late &middot; {enrolledClassesCount} {enrolledClassesCount === 1 ? 'class' : 'classes'}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProgressStatsGrid;
