import React from 'react';
import { StudentPageHeader } from '../common/StudentPageHeader';

interface ScheduleHeaderProps {
  weekRangeText: string;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function ScheduleHeader({
  weekRangeText,
  onToday,
  onPrev,
  onNext,
}: ScheduleHeaderProps) {
  const navigatorActions = (
    <div className="week-navigator-controls d-flex align-items-center gap-2">
      <button type="button" className="btn-week-today" id="btnWeekToday" onClick={onToday}>
        Today
      </button>

      <div className="week-nav-group d-flex align-items-center">
        <button
          type="button"
          className="btn-week-nav"
          id="btnWeekPrev"
          aria-label="Previous week"
          onClick={onPrev}
        >
          <i className="bi bi-chevron-left"></i>
        </button>
        <span className="week-range-text px-2" id="weekRangeText">
          {weekRangeText}
        </span>
        <button
          type="button"
          className="btn-week-nav"
          id="btnWeekNext"
          aria-label="Next week"
          onClick={onNext}
        >
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  );

  return (
    <header
      className="schedule-header border-bottom bg-white"
      style={{ minHeight: 'var(--et-topbar-height)', height: 'auto', padding: '14px 32px' }}
    >
      <div className="w-100">
        <StudentPageHeader
          className="mb-0"
          title="Schedule"
          subtitle="Weekly class timetable"
          breadcrumbs={[
            { label: 'Home', href: '/student/dashboard' },
            { label: 'Schedule' },
          ]}
          actions={navigatorActions}
        />
      </div>
    </header>
  );
}

export default ScheduleHeader;
