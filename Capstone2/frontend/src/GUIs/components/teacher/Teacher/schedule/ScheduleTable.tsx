import type {ScheduleRole, ScheduleSession} from '../../../../../BLL/models/ScheduleSession';
import {displayScheduleDate, scheduleStatus} from '../../../../../BLL/services/scheduleViewService';

export type SortField = 'className' | 'dayOfWeek' | 'time' | 'studentCount';
export type SortOrder = 'asc' | 'desc';
export interface ScheduleTableProps {
  sessions: ScheduleSession[]; now: Date; role?: ScheduleRole; sortField?: SortField; sortOrder?: SortOrder;
  onSort?: (field: SortField) => void; onOpen: (session: ScheduleSession) => void;
}
// Presentation from viet@5512b64: consolidated time, no checkboxes, sortable headers.
// Only the row contract and actions change to actual ClassSessions.
export default function ScheduleTable({sessions, now, role = 'student', sortField, sortOrder, onSort, onOpen}: ScheduleTableProps) {
  const isTa = role === 'teaching-assistant';
  const renderSortIcon = (field: SortField) => <button type="button" className="schedule-sort-button ms-1"
    data-sort={field} disabled={field === 'studentCount'} aria-label={'Sắp xếp ' + field}
    title={field === 'studentCount' ? 'Chưa có dữ liệu sĩ số trong API' : 'Sắp xếp'}
    onClick={() => onSort?.(field)}>
    <i className={sortField === field ? 'bi ' + (sortOrder === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down') + ' text-primary table-sort-icon' : 'bi bi-arrow-down-up text-muted table-sort-icon'} />
  </button>;
  const ariaSort = (field: SortField) => sortField === field ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none';
  return <div className="table-responsive-container et-schedule-table-scroll" tabIndex={0} aria-label="Danh sách phiên học">
    <table className="table custom-table align-middle mb-0 et-schedule-table" id="scheduleTable">
      <thead><tr>
        <th scope="col" aria-sort={ariaSort('className')}>Lớp Học {renderSortIcon('className')}</th>
        <th scope="col">Môn Học</th><th scope="col">Phòng Học</th>
        <th scope="col" aria-sort={ariaSort('dayOfWeek')}>Thứ / Ngày {renderSortIcon('dayOfWeek')}</th>
        <th scope="col" aria-sort={ariaSort('time')}>Thời Gian {renderSortIcon('time')}</th>
        <th scope="col">Sĩ Số {renderSortIcon('studentCount')}</th>
        <th scope="col">{isTa ? 'Giáo Viên Chính' : 'Trợ Giảng (TA)'}</th><th scope="col">Trạng Thái</th><th scope="col">Thao Tác</th>
      </tr></thead>
      <tbody>{sessions.length ? sessions.map(session => {
        const status = scheduleStatus(session, now);
        const teachers = session.teachers.map(p => p.name).join(', '), assistants = session.teachingAssistants.map(p => p.name).join(', ');
        return <tr key={session.sessionId} data-session-id={session.sessionId}>
          <td><button type="button" className="class-id-link schedule-class-link fw-bold text-dark" onClick={() => onOpen(session)}>{session.className}</button>
            <div className="small text-muted schedule-row-staff">{isTa ? 'TA: ' : 'GV: '}{(isTa ? assistants : teachers) || 'Chưa phân công'}</div></td>
          <td><span className="badge bg-primary bg-opacity-10 text-primary px-2 py-1 rounded-pill">{session.subjectName || 'Chưa có môn học'}</span></td>
          <td><span className="text-secondary small"><i className="bi bi-geo-alt me-1 text-muted" />{session.room || 'Chưa xếp phòng'}</span></td>
          <td><span className="fw-medium text-dark">{displayScheduleDate(session.sessionDate)}</span></td>
          <td><span className="fw-medium text-dark">{session.startTime.slice(0, 5)} - {session.endTime.slice(0, 5)}</span></td>
          <td><span className="badge bg-light text-dark border px-2 py-1" title="Schedule Read API chưa cung cấp sĩ số">Chưa có dữ liệu</span></td>
          <td><div className="d-flex align-items-center gap-2">
            {(isTa ? teachers : assistants) && <span className="ta-avatar-initials bg-warning text-dark">{(isTa ? teachers : assistants).split(/\s+/).map(w => w[0]).slice(-2).join('')}</span>}
            <span className="small">{(isTa ? teachers : assistants) || 'Chưa phân công'}</span>
          </div></td>
          <td><span className={'et-schedule-badge et-status-' + status.key}>{status.label}</span></td>
          <td><button type="button" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
            onClick={() => onOpen(session)} aria-label={'Xem phiên #' + session.sessionId}><i className="bi bi-eye" />Xem phiên</button></td>
        </tr>;
      }) : <tr className="schedule-empty-row"><td colSpan={9} className="text-center py-4 text-muted">
        <i className="bi bi-calendar-x fs-3 d-block mb-1 text-secondary" />Chưa có lịch học phù hợp.</td></tr>}</tbody>
    </table>
  </div>;
}
