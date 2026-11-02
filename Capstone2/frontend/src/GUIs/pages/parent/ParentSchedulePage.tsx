import React, { useState, useEffect } from 'react';
import { useParent } from '../../../contexts/ParentContext';
import { ScheduleHeader } from '../../components/student/schedule/ScheduleHeader';
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

export function ParentSchedulePage() {
  const { selectedChild } = useParent();
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [sessions, setSessions] = useState<SessionItem[]>(SESSIONS);

  useEffect(() => {
    let isMounted = true;

    async function loadSchedules() {
      const studentId = selectedChild?.id || DEFAULT_STUDENT_ID;
      try {
        const liveSessions = await learningDAL.getStudentSchedule(studentId);
        if (isMounted && liveSessions && liveSessions.length > 0) {
          setSessions(liveSessions);
        }
      } catch (err) {
        console.warn('Lỗi khi tải thời khóa biểu phụ huynh:', err);
      }
    }

    loadSchedules();

    return () => {
      isMounted = false;
    };
  }, [selectedChild?.id]);

  // Reference date aligned with prototype
  const todayDate = new Date('2026-08-15T15:20:00');
  const todayRef = new Date(todayDate.toDateString());

  const monday = addDays(getMonday(todayRef), weekOffset * 7);
  const sunday = addDays(monday, 6);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const todayIdx = days.findIndex(
    (d) => d.toDateString() === todayRef.toDateString()
  );

  const weekRangeText = `${fmtDayMon(monday)} – ${fmtDayMon(sunday)}`;

  if (!selectedChild) {
    return null;
  }

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
        {/* Child Indicator Strip */}
        <div className="d-flex align-items-center justify-content-between p-3 mb-3 bg-white rounded-4 border shadow-xs">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1.5 rounded-pill fw-semibold">
              <i className="bi bi-calendar-event me-1"></i> Lịch học của bé {selectedChild.name}
            </span>
            <span className="small text-muted">{selectedChild.grade} · {selectedChild.classesCount} môn học</span>
          </div>
          <span className="small text-muted d-none d-md-inline">
            Giờ học hiển thị theo múi giờ Việt Nam (GMT+7)
          </span>
        </div>

        {/* 1. Calendar Timetable Card */}
        <ScheduleTimetableCard
          days={days}
          todayIdx={todayIdx}
          weekOffset={weekOffset}
          todayDate={todayDate}
          sessions={sessions}
        />

        {/* 2. Status Legend Strip */}
        <ScheduleLegendStrip />
      </main>
    </>
  );
}

export default ParentSchedulePage;
