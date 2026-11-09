import React from 'react';

export function ScheduleLegendStrip({official = false}: {official?: boolean} = {}) {
  return (
    <div className="schedule-legend-strip">
      <span className="legend-title">Chú thích</span>

      <div className="legend-item">
        <div className="legend-dot" style={{ backgroundColor: '#3B82F6' }}></div>
        <span className="legend-label">{official ? 'Đã xếp lịch' : 'Sắp diễn ra'}</span>
      </div>

      <div className="legend-item">
        <div className="legend-dot" style={{ backgroundColor: '#10B981' }}></div>
        <span className="legend-label">{official ? 'Đang trong giờ học' : 'Đang diễn ra'}</span>
      </div>

      <div className="legend-item">
        <div className="legend-dot" style={{ backgroundColor: '#94A3B8' }}></div>
        <span className="legend-label">Đã hoàn thành</span>
      </div>

      <div className="legend-item">
        <div className="legend-dot" style={{ backgroundColor: official ? '#EF4444' : '#F43F5E' }}></div>
        <span className="legend-label">Đã hủy</span>
      </div>

      <div className="legend-now-indicator">
        <div className="legend-now-bar"></div>
        <span>Hiện tại</span>
      </div>
    </div>
  );
};

export default ScheduleLegendStrip;
