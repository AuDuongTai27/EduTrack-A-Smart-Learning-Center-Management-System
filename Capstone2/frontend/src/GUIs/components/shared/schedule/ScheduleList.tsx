import type {ScheduleRole, ScheduleSession} from '../../../../BLL/models/ScheduleSession';
import ScheduleTable, {type SortField, type SortOrder} from '../../teacher/Teacher/schedule/ScheduleTable';
import ScheduleListPagination from '../../teacher/Teacher/schedule/ScheduleListPagination';
import TaPagination from '../../teacher/TeachingAssistant/schedule/ScheduleListPagination';

// One table renderer and viet's shared pagination; only List slices the filtered set.
export function ScheduleList({sessions, now, role, page, pageSize, sort, onSort, onPage, onOpen}: {
  sessions: ScheduleSession[]; now: Date; role: ScheduleRole; page: number; pageSize: number; sort: string;
  onSort: (field: string) => void; onPage: (page: number) => void; onOpen: (session: ScheduleSession) => void;
}) {
  const [field, order] = sort.split(':');
  const Pagination = role === 'teaching-assistant' ? TaPagination : ScheduleListPagination;
  return <>
    <ScheduleTable sessions={sessions.slice((page - 1) * pageSize, page * pageSize)} now={now} role={role}
      sortField={field as SortField} sortOrder={order as SortOrder} onSort={onSort} onOpen={onOpen} />
    <Pagination totalItems={sessions.length} currentPage={page} rowsPerPage={pageSize} onPageChange={onPage} />
  </>;
}
