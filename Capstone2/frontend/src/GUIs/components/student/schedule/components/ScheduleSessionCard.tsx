import type {SessionSlot} from '../scheduleData';
import {fmtTime} from '../scheduleData';
import type {ScheduleSession} from '../../../../../BLL/models/ScheduleSession';

export type CalendarCardItem = Omit<SessionSlot, 'status'> & {
  status: SessionSlot['status'] | 'unknown'; actual?: ScheduleSession; statusLabel?: string; staffLabel?: string;
};
export interface ScheduleSessionCardProps {
  session: CalendarCardItem; topPx: number; heightPx: number; isCompact: boolean; statusCls: string;
  lane?: number; laneCount?: number; onOpen?: (session: ScheduleSession) => void;
}
// Original Student/Teacher card markup is retained. Extra props apply only to official sessions.
export function ScheduleSessionCard({session: s, topPx, heightPx, isCompact, statusCls, lane = 0, laneCount = 1, onOpen}: ScheduleSessionCardProps) {
  const open = () => {if (s.actual) onOpen?.(s.actual);};
  return <div className={'session-card ' + statusCls + (s.actual ? ' et-schedule-session' : '')}
    style={{top: topPx, height: heightPx, ...(s.actual ? {left: 'calc(' + lane * 100 / laneCount + '% + 4px)',
      width: 'calc(' + 100 / laneCount + '% - 8px)', right: 'auto'} : {})}}
    data-session-id={s.actual?.sessionId} data-lane={s.actual ? lane : undefined} data-lanes={s.actual ? laneCount : undefined}
    role={s.actual ? 'button' : undefined} tabIndex={s.actual ? 0 : undefined} onClick={s.actual ? open : undefined}
    onKeyDown={s.actual ? e => {if (e.key === 'Enter' || e.key === ' ') {e.preventDefault(); open();}} : undefined}
    aria-label={s.actual ? s.className + ', ' + s.actual.sessionDate + ', ' + s.actual.startTime + '–' + s.actual.endTime + ', ' + s.statusLabel : undefined}
    title={s.className + ' — ' + s.subject + ' (' + fmtTime(s.startH, s.startM) + '—' + fmtTime(s.endH, s.endM) + ')'}>
    <div className="session-card-time">{fmtTime(s.startH, s.startM)} — {fmtTime(s.endH, s.endM)}</div>
    <div className="session-card-title">{s.className} — {s.subject}</div>
    {!isCompact && <div className="session-card-footer"><div className="session-card-teacher">
      {(!s.actual || s.initials) && <div className="session-teacher-avatar" style={{backgroundColor: s.avatarBg}}>{s.initials}</div>}
      <span>{s.staffLabel ? s.staffLabel + ': ' : ''}{s.teacher}</span></div>
      <div className="session-card-room">{s.room}</div></div>}
    {s.actual && <span className="session-card-state">{s.statusLabel}</span>}
  </div>;
}
export default ScheduleSessionCard;
