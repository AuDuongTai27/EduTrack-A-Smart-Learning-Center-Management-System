import React from 'react';

export const ProgressStatsGrid: React.FC = () => {
  return (
    <>
{/* 2. 4-Stats Cards Grid */}
          <div className="progress-stats-grid">
            {/* Card 1: Có mặt */}
            <div className="progress-stat-card" style={{ borderColor: '#A7F3D0' }}>
              <div className="progress-stat-icon-box" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
                <i className="bi bi-check-circle-fill"></i>
              </div>
              <div>
                <div className="progress-stat-num" style={{ color: '#047857' }}>35</div>
                <div className="progress-stat-title">Có mặt</div>
                <div className="progress-stat-sublabel">buổi học</div>
              </div>
            </div>

            {/* Card 2: Vắng mặt */}
            <div className="progress-stat-card" style={{ borderColor: '#FECACA' }}>
              <div className="progress-stat-icon-box" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
                <i className="bi bi-x-circle-fill"></i>
              </div>
              <div>
                <div className="progress-stat-num" style={{ color: '#B91C1C' }}>4</div>
                <div className="progress-stat-title">Vắng mặt</div>
                <div className="progress-stat-sublabel">buổi học</div>
              </div>
            </div>

            {/* Card 3: Đi trễ */}
            <div className="progress-stat-card" style={{ borderColor: '#FDE68A' }}>
              <div className="progress-stat-icon-box" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
                <i className="bi bi-clock-fill"></i>
              </div>
              <div>
                <div className="progress-stat-num" style={{ color: '#B45309' }}>5</div>
                <div className="progress-stat-title">Đi trễ</div>
                <div className="progress-stat-sublabel">buổi học</div>
              </div>
            </div>

            {/* Card 4: Tổng số buổi học */}
            <div className="progress-stat-card" style={{ borderColor: '#BFDBFE' }}>
              <div className="progress-stat-icon-box" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
                <i className="bi bi-calendar2-range-fill"></i>
              </div>
              <div>
                <div className="progress-stat-num" style={{ color: '#1D4ED8' }}>44</div>
                <div className="progress-stat-title">Tổng số buổi</div>
                <div className="progress-stat-sublabel">3 lớp học</div>
              </div>
            </div>
          </div>
    </>
  );
};

export default ProgressStatsGrid;
