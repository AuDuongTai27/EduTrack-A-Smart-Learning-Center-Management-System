import React, { useState, useEffect } from 'react';
import { StudentPageHeader } from '../../components/student/common/StudentPageHeader';
import { ScheduleTimetableCard } from '../../components/student/schedule/ScheduleTimetableCard';
import { ScheduleLegendStrip } from '../../components/student/schedule/ScheduleLegendStrip';
import { learningDAL, DEFAULT_STUDENT_ID } from '../../../DAL/learningDAL';
import {
  getMonday,
  addDays,
  fmtDayMon,
  SESSIONS,
  type SessionItem,
} from '../../components/student/schedule/scheduleData';

export function StudentSchedulePage() {
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [sessions, setSessions] = useState<SessionItem[]>(SESSIONS);

  useEffect(() => {
    let isMounted = true;

    async function loadSchedules() {
      try {
        const liveSessions = await learningDAL.getStudentSchedule(DEFAULT_STUDENT_ID);
        if (isMounted && liveSessions && liveSessions.length > 0) {
          setSessions(liveSessions);
        }
      } catch (err) {
        console.warn('Lỗi khi tải thời khóa biểu học sinh:', err);
      }
    }

    loadSchedules();

    return () => {
      isMounted = false;
    };
  }, []);

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

  const weekNavigatorActions = (
    <div className="week-navigator-controls d-flex align-items-center gap-2">
      <button
        type="button"
        className="btn-week-today"
        id="btnWeekToday"
        onClick={() => setWeekOffset(0)}
      >
        Hôm nay
      </button>

      <div className="week-nav-group d-flex align-items-center">
        <button
          type="button"
          className="btn-week-nav"
          id="btnWeekPrev"
          aria-label="Tuần trước"
          onClick={() => setWeekOffset((w) => w - 1)}
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
          onClick={() => setWeekOffset((w) => w + 1)}
        >
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  );

  return (
    <main className="main-content">
      <div className="content-container schedule-container">
        {/* 1. Unified Page Header with Week Navigator */}
        <StudentPageHeader
          title="Lịch học"
          subtitle="Thời khóa biểu các ca học trong tuần của bạn"
          breadcrumbs={[
            { label: 'Trang chủ', href: '/student/dashboard' },
            { label: 'Lịch học' },
          ]}
          actions={weekNavigatorActions}
        />

        {/* 2. Calendar Timetable Card */}
        <ScheduleTimetableCard
          days={days}
          todayIdx={todayIdx}
          weekOffset={weekOffset}
          todayDate={todayDate}
          sessions={sessions}
        />

        {/* 3. Status Legend Strip */}
        <ScheduleLegendStrip />
      </div>
    </main>
  );
}

export default StudentSchedulePage;
