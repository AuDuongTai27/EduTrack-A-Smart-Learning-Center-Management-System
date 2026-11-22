import type {ScheduleRole, ScheduleSession} from '../../../../../BLL/models/ScheduleSession';
import {displayScheduleDate, scheduleStatus} from '../../../../../BLL/services/scheduleViewService';

export interface ScheduleTableProps {
  sessions: ScheduleSession[]; now: Date; role?: ScheduleRole; onOpen: (session: ScheduleSession) => void;
}
// Only the row contract and actions change to actual ClassSessions.
export default function ScheduleTable({sessions, now, role = 'student', onOpen}: ScheduleTableProps) {
  const isTa = role === 'teaching-assistant';
  const showSelfStaff = role !== 'teacher' && role !== 'teaching-assistant';

  const getScheduleStatusLabel = (key: string, defaultLabel: string) => {
    switch (key) {
      case 'cancelled': return 'Cancelled';
      case 'completed': return 'Completed';
      case 'ongoing': return 'Ongoing';
      case 'scheduled': return 'Scheduled';
      default: return defaultLabel;
    }
  };

  return <div className="table-responsive-container et-schedule-table-scroll" tabIndex={0} aria-label="Session list">
    <table className="table custom-table align-middle mb-0 et-schedule-table" id="scheduleTable">
      <thead><tr>
        <th scope="col">Class</th>
        <th scope="col">Subject</th>
        <th scope="col">Date &amp; Time</th>
        <th scope="col">Room</th>
        <th scope="col">{isTa ? 'Primary Teacher' : 'Teaching Assistant (TA)'}</th>
        <th scope="col">Status</th>
        <th scope="col">Actions</th>
      </tr></thead>
      <tbody>{sessions.length ? sessions.map(session => {
        const status = scheduleStatus(session, now);
        const teachers = session.teachers.map(p => p.name).join(', '), assistants = session.teachingAssistants.map(p => p.name).join(', ');
        return <tr key={session.sessionId} data-session-id={session.sessionId}>
          <td><div className="fw-bold text-dark">{session.className}</div>
            {showSelfStaff && <div className="small text-muted schedule-row-staff">{isTa ? 'TA: ' : 'Teacher: '}{(isTa ? assistants : teachers) || 'Unassigned'}</div>}</td>
          <td><span className="badge bg-primary bg-opacity-10 text-primary px-2 py-1 rounded-pill">{session.subjectName || 'No subject'}</span></td>
          <td><div className="fw-medium text-dark">{displayScheduleDate(session.sessionDate)}</div>
            <div className="small text-muted" style={{fontVariantNumeric: 'tabular-nums'}}>{session.startTime.slice(0, 5)} - {session.endTime.slice(0, 5)}</div></td>
          <td><span className="text-secondary small"><i className="bi bi-geo-alt me-1 text-muted" />{session.room || 'Unassigned room'}</span></td>
          <td><span className="small text-dark">{(isTa ? teachers : assistants) || 'Unassigned'}</span></td>
          <td><span className={'et-schedule-badge et-status-' + status.key}>{getScheduleStatusLabel(status.key, status.label)}</span></td>
          <td><button type="button" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
            onClick={() => onOpen(session)} aria-label={'View session #' + session.sessionId}><i className="bi bi-eye" />View</button></td>
        </tr>;
      }) : <tr className="schedule-empty-row"><td colSpan={7} className="text-center py-4 text-muted">
        <i className="bi bi-calendar-x fs-3 d-block mb-1 text-secondary" />No matching schedule found.</td></tr>}</tbody>
    </table>
  </div>;
}
