import React, { useState } from 'react';
import { ScheduleHeader } from '../../components/student/schedule/ScheduleHeader';
import { ScheduleTimetableCard } from '../../components/student/schedule/ScheduleTimetableCard';
import { ScheduleLegendStrip } from '../../components/student/schedule/ScheduleLegendStrip';
import {
  getMonday,
  addDays,
  fmtDayMon,
} from '../../components/student/schedule/scheduleData';

export const StudentSchedulePage: React.FC = () => {
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Reference date aligned with prototype (or current date)
  const todayDate = new Date('2026-08-15T15:20:00');
  const todayRef = new Date(todayDate.toDateString());

  const monday = addDays(getMonday(todayRef), weekOffset * 7);
  const sunday = addDays(monday, 6);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const todayIdx = days.findIndex(
    (d) => d.toDateString() === todayRef.toDateString()
  );

  const weekRangeText = `${fmtDayMon(monday)} – ${fmtDayMon(sunday)}`;

  return (
    <>
      {/* Schedule Topbar Header with Navigator */}
      <ScheduleHeader
        weekRangeText={weekRangeText}
        onToday={() => setWeekOffset(0)}
        onPrev={() => setWeekOffset((w) => w - 1)}
        onNext={() => setWeekOffset((w) => w + 1)}
      />

      {/* Main Schedule Content Area */}
      <main className="schedule-panel-body">
        {/* 1. Calendar Timetable Card */}
        <ScheduleTimetableCard
          days={days}
          todayIdx={todayIdx}
          weekOffset={weekOffset}
          todayDate={todayDate}
        />

        {/* 2. Status Legend Strip */}
        <ScheduleLegendStrip />
      </main>
    </>
  );
};

export default StudentSchedulePage;
