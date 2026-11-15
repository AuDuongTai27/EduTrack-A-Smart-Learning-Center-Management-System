import {useRef, useEffect} from 'react';
import {GRID_START, GRID_END, TOTAL_H, HOUR_PX, DAY_LABELS, STATUS_CLASS, SESSIONS, pad2, type SessionItem} from './scheduleData';
import {ScheduleSessionCard, type CalendarCardItem} from './components/ScheduleSessionCard';
import type {ScheduleSession} from '../../../../BLL/models/ScheduleSession';
import {addScheduleDays, calendarHours, displayScheduleDate, placeDaySessions, scheduleStatus, timeMinutes,
  validCalendarTime, vietnamClock} from '../../../../BLL/services/scheduleViewService';

interface LegacyProps {days: Date[]; todayIdx: number; weekOffset: number; todayDate: Date; sessions?: SessionItem[]}
interface OfficialInput {sessions: ScheduleSession[]; monday: string; now: Date; onOpen: (session: ScheduleSession) => void; partner?: 'teacher' | 'ta'}
type Props = LegacyProps | {official: OfficialInput};

// One timetable renderer. Parent keeps the unchanged legacy props/data path;
// official consumers must provide dated ClassSessions and never use SESSIONS.
export function ScheduleTimetableCard(props: Props) {
  const official = 'official' in props ? props.official : undefined;
  const legacy = 'days' in props ? props : undefined;
  const dateKeys = official ? Array.from({length: 7}, (_, index) => addScheduleDays(official.monday, index)) : [];
  const days = legacy?.days ?? dateKeys.map(date => new Date(date + 'T00:00:00Z'));
  const clock = official ? vietnamClock(official.now) : undefined;
  const todayIdx = clock ? dateKeys.indexOf(clock.date) : legacy!.todayIdx;
  const hours = official ? calendarHours(official.sessions) : {start: GRID_START, end: GRID_END};
  const totalHours = official ? hours.end - hours.start : TOTAL_H;
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!scrollRef.current) return;
    if (official && official.sessions.length > 0) {
      const validStarts = official.sessions.filter(validCalendarTime).map(s => Math.floor(timeMinutes(s.startTime) / 60));
      if (validStarts.length > 0) {
        const earliestHour = Math.min(...validStarts);
        scrollRef.current.scrollTop = Math.max(0, (earliestHour - hours.start - 1) * HOUR_PX);
        return;
      }
    }
    scrollRef.current.scrollTop = 0;
  }, [legacy?.weekOffset, official?.monday, official?.sessions, hours.start]);
  const nowMinutes = clock ? clock.minutes : legacy!.todayDate.getHours() * 60 + legacy!.todayDate.getMinutes();
  const showNowLine = (official ? todayIdx >= 0 : legacy!.weekOffset === 0) && nowMinutes >= hours.start * 60 && nowMinutes < hours.end * 60;
  const nowPx = (nowMinutes - hours.start * 60) / 60 * HOUR_PX;
  const items: CalendarCardItem[] = official ? official.sessions.filter(validCalendarTime).map(session => {
    const status = scheduleStatus(session, official.now);
    const visual: CalendarCardItem['status'] = status.key === 'scheduled' ? 'upcoming' : status.key === 'ongoing' ? 'ongoing' :
      status.key === 'completed' ? 'completed' : status.key === 'cancelled' ? 'cancelled' : 'unknown';
    const people = official.partner === 'ta' ? session.teachingAssistants : session.teachers;
    const name = people.map(p => p.name).join(', ');
    const start = timeMinutes(session.startTime), end = timeMinutes(session.endTime);
    return {id: String(session.sessionId), className: session.className, subject: session.subjectName || 'No subject assigned',
      startH: Math.floor(start / 60), startM: start % 60, endH: Math.floor(end / 60), endM: end % 60,
      teacher: name || 'Unassigned', initials: name ? name.trim().split(/\s+/).map(word => word[0]).slice(-2).join('') : '',
      avatarBg: '#2563EB', room: session.room || 'No room assigned', day: dateKeys.indexOf(session.sessionDate),
      actual: session, status: visual, statusLabel: status.label, staffLabel: official.partner === 'ta' ? 'TA' : 'Teacher'};
  }) : (legacy?.sessions ?? SESSIONS);
  const invalidCount = official?.sessions.filter(s => !validCalendarTime(s)).length ?? 0;
  return <>
    {invalidCount > 0 && <p className="et-schedule-warning" role="alert">{invalidCount} session(s) have invalid time. View data in List.</p>}
    <div className={'schedule-calendar-card' + (official ? ' schedule-calendar-official et-schedule-scroll' : '')}
      ref={official ? scrollRef : undefined} tabIndex={official ? 0 : undefined}
      aria-label={official ? 'Weekly schedule, scroll horizontally and vertically to view dates and times' : undefined}>
      <div className="day-header-row" id={official ? undefined : 'dayHeaderRow'}>
        <div className="day-header-corner" />
        {days.map((date, index) => {
          const isToday = index === todayIdx && (official || legacy!.weekOffset === 0);
          return <div key={index} className={'day-header-col' + (isToday ? ' is-today' : '') + (official ? ' et-schedule-day-heading' + (isToday ? ' et-today' : '') : '')}>
            <div className="day-name-label">{DAY_LABELS[index]}</div>
            <div className="day-num-bubble">{pad2(official ? Number(dateKeys[index].slice(8, 10)) : date.getDate())}</div>
            {official && <span className="day-date-label">{displayScheduleDate(dateKeys[index])}</span>}
          </div>;
        })}
      </div>
      <div className="timetable-grid-scroll" id={official ? undefined : 'timetableGridScroll'} ref={official ? undefined : scrollRef}>
        <div className={'timetable-grid-wrapper' + (official ? ' et-schedule-grid' : '')} style={official ? {minHeight: totalHours * HOUR_PX} : undefined}>
          <div className="time-gutter-col" id={official ? undefined : 'timeGutterCol'}>
            {Array.from({length: totalHours}, (_, index) => <div key={index} className="time-hour-slot"><span>{pad2(hours.start + index)}:00</span></div>)}
          </div>
          <div className="timetable-days-container" id={official ? undefined : 'timetableDaysContainer'}>
            {days.map((_, index) => {
              const isToday = index === todayIdx && (official || legacy!.weekOffset === 0);
              const column = items.filter(s => official ? s.actual?.sessionDate === dateKeys[index] : s.day === index);
              const placements = official ? new Map(placeDaySessions(official.sessions.filter(s => s.sessionDate === dateKeys[index])).map(p => [p.session.sessionId, p])) : undefined;
              return <div key={index} className={'grid-day-col' + (isToday ? ' is-today' : '')} data-date={official ? dateKeys[index] : undefined}>
                {Array.from({length: totalHours}, (_, hour) => <div key={hour} className="grid-hour-line" />)}
                {column.map(s => {
                  const placement = s.actual ? placements?.get(s.actual.sessionId) : undefined;
                  const height = ((s.endH - s.startH) * 60 + s.endM - s.startM) / 60 * HOUR_PX;
                  return <ScheduleSessionCard key={s.id} session={s}
                    topPx={((s.startH - hours.start) * 60 + s.startM) / 60 * HOUR_PX}
                    heightPx={height} isCompact={height < 76}
                    statusCls={s.status === 'unknown' ? 'session-card-unknown' : STATUS_CLASS[s.status] || STATUS_CLASS.upcoming}
                    lane={placement?.lane} laneCount={placement?.laneCount} onOpen={official?.onOpen} />;
                })}
              </div>;
            })}
          </div>
          {showNowLine && <div className="now-time-line" id={official ? undefined : 'nowTimeLine'} style={{top: nowPx}}><div className="now-time-dot" /><div className="now-time-bar" /></div>}
        </div>
      </div>
    </div>
  </>;
}
export default ScheduleTimetableCard;
