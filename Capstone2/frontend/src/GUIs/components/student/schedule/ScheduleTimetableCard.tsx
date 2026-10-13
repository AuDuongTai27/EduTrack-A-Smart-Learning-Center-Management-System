import React, { useRef, useEffect } from 'react';
import {
  GRID_START,
  GRID_END,
  TOTAL_H,
  HOUR_PX,
  DAY_LABELS,
  STATUS_CLASS,
  SESSIONS,
  pad2,
} from './scheduleData';
import { ScheduleSessionCard } from './components/ScheduleSessionCard';

interface ScheduleTimetableCardProps {
  days: Date[];
  todayIdx: number;
  weekOffset: number;
  todayDate: Date;
}

export function ScheduleTimetableCard({
  days,
  todayIdx,
  weekOffset,
  todayDate,
}: ScheduleTimetableCardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [weekOffset]);

  const nowH = todayDate.getHours();
  const nowM = todayDate.getMinutes();
  const showNowLine = weekOffset === 0 && nowH >= GRID_START && nowH < GRID_END;
  const nowPx = ((nowH - GRID_START) * 60 + nowM) / 60 * HOUR_PX;

  return (
    <div className="schedule-calendar-card">
      <div className="day-header-row" id="dayHeaderRow">
        <div className="day-header-corner"></div>
        {days.map((date, i) => {
          const isToday = i === todayIdx && weekOffset === 0;
          return (
            <div
              key={i}
              className={`day-header-col${isToday ? ' is-today' : ''}`}
            >
              <div className="day-name-label">{DAY_LABELS[i]}</div>
              <div className="day-num-bubble">{pad2(date.getDate())}</div>
            </div>
          );
        })}
      </div>

      <div className="timetable-grid-scroll" id="timetableGridScroll" ref={scrollRef}>
        <div className="timetable-grid-wrapper">
          <div className="time-gutter-col" id="timeGutterCol">
            {Array.from({ length: TOTAL_H }, (_, i) => (
              <div key={i} className="time-hour-slot">
                <span>{pad2(GRID_START + i)}:00</span>
              </div>
            ))}
          </div>

          <div className="timetable-days-container" id="timetableDaysContainer">
            {days.map((_, di) => {
              const isToday = di === todayIdx && weekOffset === 0;
              const colSessions = SESSIONS.filter((s) => s.day === di);

              return (
                <div
                  key={di}
                  className={`grid-day-col${isToday ? ' is-today' : ''}`}
                >
                  {Array.from({ length: TOTAL_H }, (_, i) => (
                    <div key={i} className="grid-hour-line"></div>
                  ))}

                  {colSessions.map((s) => {
                    const statusCls = STATUS_CLASS[s.status] || STATUS_CLASS.upcoming;
                    const topPx = ((s.startH - GRID_START) * 60 + s.startM) / 60 * HOUR_PX;
                    const heightPx = ((s.endH - s.startH) * 60 + (s.endM - s.startM)) / 60 * HOUR_PX;
                    const isCompact = heightPx < 76;

                    return (
                      <ScheduleSessionCard
                        key={s.id}
                        session={s}
                        topPx={topPx}
                        heightPx={heightPx}
                        isCompact={isCompact}
                        statusCls={statusCls}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>

          {showNowLine && (
            <div
              className="now-time-line"
              id="nowTimeLine"
              style={{ top: `${nowPx}px` }}
            >
              <div className="now-time-dot"></div>
              <div className="now-time-bar"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleTimetableCard;
