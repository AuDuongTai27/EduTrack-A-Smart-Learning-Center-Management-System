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
        Hôm nay
      </button>

      <div className="week-nav-group d-flex align-items-center">
        <button
          type="button"
          className="btn-week-nav"
          id="btnWeekPrev"
          aria-label="Tuần trước"
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
          aria-label="Tuần sau"
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
          title="Lịch học"
          subtitle="Thời khóa biểu các ca học trong tuần"
          breadcrumbs={[
            { label: 'Trang chủ', href: '/student/dashboard' },
            { label: 'Lịch học' },
          ]}
          actions={navigatorActions}
        />
      </div>
    </header>
  );
}

export default ScheduleHeader;
