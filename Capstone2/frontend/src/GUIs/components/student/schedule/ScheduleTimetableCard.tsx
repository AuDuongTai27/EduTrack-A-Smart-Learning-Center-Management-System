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
  fmtTime,
} from './scheduleData';

interface ScheduleTimetableCardProps {
  days: Date[];
  todayIdx: number;
  weekOffset: number;
  todayDate: Date;
}

export const ScheduleTimetableCard: React.FC<ScheduleTimetableCardProps> = ({
  days,
  todayIdx,
  weekOffset,
  todayDate,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [weekOffset]);

  // Now line calculations
  const nowH = todayDate.getHours();
  const nowM = todayDate.getMinutes();
  const showNowLine = weekOffset === 0 && nowH >= GRID_START && nowH < GRID_END;
  const nowPx = ((nowH - GRID_START) * 60 + nowM) / 60 * HOUR_PX;

  return (
    <div className="schedule-calendar-card">
      {/* Sticky Day Header Row */}
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

      {/* Scrollable Time Grid */}
      <div className="timetable-grid-scroll" id="timetableGridScroll" ref={scrollRef}>
        <div className="timetable-grid-wrapper">
          {/* Time Gutter Column (07:00 -> 20:00) */}
          <div className="time-gutter-col" id="timeGutterCol">
            {Array.from({ length: TOTAL_H }, (_, i) => (
              <div key={i} className="time-hour-slot">
                <span>{pad2(GRID_START + i)}:00</span>
              </div>
            ))}
          </div>

          {/* Day Columns Container */}
          <div className="timetable-days-container" id="timetableDaysContainer">
            {days.map((_, di) => {
              const isToday = di === todayIdx && weekOffset === 0;
              const colSessions = SESSIONS.filter((s) => s.day === di);

              return (
                <div
                  key={di}
                  className={`grid-day-col${isToday ? ' is-today' : ''}`}
                >
                  {/* Hour Lines */}
                  {Array.from({ length: TOTAL_H }, (_, i) => (
                    <div key={i} className="grid-hour-line"></div>
                  ))}

                  {/* Session Cards */}
                  {colSessions.map((s) => {
                    const statusCls = STATUS_CLASS[s.status] || STATUS_CLASS.upcoming;
                    const topPx = ((s.startH - GRID_START) * 60 + s.startM) / 60 * HOUR_PX;
                    const heightPx = ((s.endH - s.startH) * 60 + (s.endM - s.startM)) / 60 * HOUR_PX;
                    const isCompact = heightPx < 76;

                    return (
                      <div
                        key={s.id}
                        className={`session-card ${statusCls}`}
                        style={{ top: `${topPx}px`, height: `${heightPx}px` }}
                        title={`${s.className} – ${s.subject} (${fmtTime(s.startH, s.startM)}–${fmtTime(s.endH, s.endM)})`}
                      >
                        <div className="session-card-time">
                          {fmtTime(s.startH, s.startM)} – {fmtTime(s.endH, s.endM)}
                        </div>
                        <div className="session-card-title">
                          {s.className} – {s.subject}
                        </div>
                        {!isCompact && (
                          <div className="session-card-footer">
                            <div className="session-card-teacher">
                              <div
                                className="session-teacher-avatar"
                                style={{ backgroundColor: s.avatarBg }}
                              >
                                {s.initials}
                              </div>
                              <span>{s.teacher}</span>
                            </div>
                            <div className="session-card-room">{s.room}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Real-time Indicator Line */}
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
