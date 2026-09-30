import React from 'react';

export const DashboardStatsGrid: React.FC = () => {
  return (
    <div className="stats-grid">
      {/* Stat 1: Total Classes */}
      <div className="stat-card">
        <div className="stat-icon-wrapper" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
          <i className="bi bi-journal-bookmark-fill"></i>
        </div>
        <div className="stat-info">
          <p className="stat-label">Tổng số lớp đang học</p>
          <div className="stat-value-group">
            <span className="stat-number">6</span>
          </div>
        </div>
      </div>

      {/* Stat 2: Assignments Due Soon */}
      <div className="stat-card">
        <div className="stat-icon-wrapper" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
          <i className="bi bi-clock-fill"></i>
        </div>
        <div className="stat-info">
          <p className="stat-label">Bài tập sắp hết hạn</p>
          <div className="stat-value-group">
            <span className="stat-number" style={{ color: '#D97706' }}>2</span>
            <span className="stat-due-badge">Sắp hết hạn</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStatsGrid;
