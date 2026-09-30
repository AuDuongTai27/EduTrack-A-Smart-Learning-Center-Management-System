import React from 'react';

interface ScheduleHeaderProps {
  weekRangeText: string;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  weekRangeText,
  onToday,
  onPrev,
  onNext,
}) => {
  return (
    <header className="schedule-header">
      <h1 className="schedule-page-title">Lịch học</h1>

      {/* Week Navigator Controls */}
      <div className="week-navigator-controls">
        <button type="button" className="btn-week-today" id="btnWeekToday" onClick={onToday}>
          Hôm nay
        </button>

        <div className="week-nav-group">
          <button
            type="button"
            className="btn-week-nav"
            id="btnWeekPrev"
            aria-label="Tuần trước"
            onClick={onPrev}
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          <span className="week-range-text" id="weekRangeText">
            {weekRangeText}
          </span>
          <button
            type="button"
            className="btn-week-nav"
            id="btnWeekNext"
            aria-label="Tuần sau"
            onClick={onNext}
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default ScheduleHeader;
