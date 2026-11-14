import type {ScheduleRole, ScheduleSession} from '../../../../../BLL/models/ScheduleSession';
import {displayScheduleDate, scheduleStatus} from '../../../../../BLL/services/scheduleViewService';

export type SortField = 'className' | 'dayOfWeek' | 'time' | 'studentCount';
export type SortOrder = 'asc' | 'desc';
export interface ScheduleTableProps {
  sessions: ScheduleSession[]; now: Date; role?: ScheduleRole; sortField?: SortField; sortOrder?: SortOrder;
  onSort?: (field: SortField) => void; onOpen: (session: ScheduleSession) => void;
}
// Only the row contract and actions change to actual ClassSessions.
export default function ScheduleTable({sessions, now, role = 'student', sortField, sortOrder, onSort, onOpen}: ScheduleTableProps) {
  const isTa = role === 'teaching-assistant';
  const renderSortIcon = (field: SortField) => <button type="button" className="schedule-sort-button ms-1"
    data-sort={field} disabled={field === 'studentCount'} aria-label={'Sort ' + field}
    title={field === 'studentCount' ? 'Class size data not available in API' : 'Sort'}
    onClick={() => onSort?.(field)}>
    <i className={sortField === field ? 'bi ' + (sortOrder === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down') + ' text-primary table-sort-icon' : 'bi bi-arrow-down-up text-muted table-sort-icon'} />
  </button>;
  const ariaSort = (field: SortField) => sortField === field ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none';

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
        <th scope="col" aria-sort={ariaSort('className')}>Class {renderSortIcon('className')}</th>
        <th scope="col">Subject</th><th scope="col">Room</th>
        <th scope="col" aria-sort={ariaSort('dayOfWeek')}>Day / Date {renderSortIcon('dayOfWeek')}</th>
        <th scope="col" aria-sort={ariaSort('time')}>Time {renderSortIcon('time')}</th>
        <th scope="col">Class Size {renderSortIcon('studentCount')}</th>
        <th scope="col">{isTa ? 'Primary Teacher' : 'Teaching Assistant (TA)'}</th><th scope="col">Status</th><th scope="col">Actions</th>
      </tr></thead>
      <tbody>{sessions.length ? sessions.map(session => {
        const status = scheduleStatus(session, now);
        const teachers = session.teachers.map(p => p.name).join(', '), assistants = session.teachingAssistants.map(p => p.name).join(', ');
        return <tr key={session.sessionId} data-session-id={session.sessionId}>
          <td><button type="button" className="class-id-link schedule-class-link fw-bold text-dark" onClick={() => onOpen(session)}>{session.className}</button>
            <div className="small text-muted schedule-row-staff">{isTa ? 'TA: ' : 'Teacher: '}{(isTa ? assistants : teachers) || 'Unassigned'}</div></td>
          <td><span className="badge bg-primary bg-opacity-10 text-primary px-2 py-1 rounded-pill">{session.subjectName || 'No subject'}</span></td>
          <td><span className="text-secondary small"><i className="bi bi-geo-alt me-1 text-muted" />{session.room || 'Unassigned room'}</span></td>
          <td><span className="fw-medium text-dark">{displayScheduleDate(session.sessionDate)}</span></td>
          <td><span className="fw-medium text-dark">{session.startTime.slice(0, 5)} - {session.endTime.slice(0, 5)}</span></td>
          <td><span className="badge bg-light text-dark border px-2 py-1" title="Class size data not available in API">No data</span></td>
          <td><div className="d-flex align-items-center gap-2">
            {(isTa ? teachers : assistants) && <span className="ta-avatar-initials bg-warning text-dark">{(isTa ? teachers : assistants).split(/\s+/).map(w => w[0]).slice(-2).join('')}</span>}
            <span className="small">{(isTa ? teachers : assistants) || 'Unassigned'}</span>
          </div></td>
          <td><span className={'et-schedule-badge et-status-' + status.key}>{getScheduleStatusLabel(status.key, status.label)}</span></td>
          <td><button type="button" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
            onClick={() => onOpen(session)} aria-label={'View session #' + session.sessionId}><i className="bi bi-eye" />View</button></td>
        </tr>;
      }) : <tr className="schedule-empty-row"><td colSpan={9} className="text-center py-4 text-muted">
        <i className="bi bi-calendar-x fs-3 d-block mb-1 text-secondary" />No matching schedule found.</td></tr>}</tbody>
    </table>
  </div>;
}
