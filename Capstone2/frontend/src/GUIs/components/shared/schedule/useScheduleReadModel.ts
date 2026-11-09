import {useEffect, useMemo, useState} from 'react';
import type {ScheduleFilters, ScheduleRole, ScheduleSession} from '../../../../BLL/models/ScheduleSession';
import {addScheduleDays, emptyScheduleFilters, filterSchedule, mondayOf, sortSchedule, vietnamClock} from '../../../../BLL/services/scheduleViewService';
import {scheduleSessionDAL} from '../../../../DAL/scheduleSessionDAL';
import {useSelectedUser} from '../../../hooks/useSelectedUser';

// Role chooses presentation; selected database userId chooses timetable business scope.
export function useScheduleReadModel(role: ScheduleRole) {
  const {user: selectedUserKey} = useSelectedUser();
  const [now, setNow] = useState(() => new Date());
  const [monday, setMonday] = useState(() => mondayOf(vietnamClock().date));
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [filters, setFilters] = useState<ScheduleFilters>(emptyScheduleFilters);
  const [sort, setSort] = useState(role === 'teacher' ? 'className:asc' : 'dayOfWeek:asc');
  const [requestedPage, setPage] = useState(1);
  const [selection, setSelection] = useState<{id: number; key: string; actor: typeof selectedUserKey} | null>(null);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<{key: string; actor: typeof selectedUserKey; sessions: ScheduleSession[]; error: string | null} | null>(null);
  const toExclusive = addScheduleDays(monday, 7);
  const requestKey = monday + '/' + retry;
  const pageSize = 10;
  useEffect(() => {const timer = window.setInterval(() => setNow(new Date()), 30000); return () => window.clearInterval(timer);}, []);
  useEffect(() => {
    const refresh = () => {if (document.visibilityState === 'visible') setRetry(value => value + 1);};
    window.addEventListener('focus', refresh); document.addEventListener('visibilitychange', refresh);
    return () => {window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh);};
  }, []);
  useEffect(() => {
    const abort = new AbortController();
    scheduleSessionDAL.getWeek(monday, toExclusive, abort.signal).then(sessions => {
      if (!abort.signal.aborted) setResult({key: requestKey, actor: selectedUserKey, sessions, error: null});
    }).catch((cause: unknown) => {
      if (!abort.signal.aborted) setResult({key: requestKey, actor: selectedUserKey, sessions: [],
        error: cause instanceof Error ? cause.message : 'Không tải được lịch học. Vui lòng thử lại.'});
    });
    return () => abort.abort();
  }, [monday, toExclusive, requestKey, selectedUserKey]);
  const loading = result?.key !== requestKey || result?.actor !== selectedUserKey;
  const error = !loading ? result?.error : null;
  const sessions = useMemo(() => !loading ? result!.sessions : [], [loading, result]);
  const filtered = useMemo(() => sortSchedule(filterSchedule(sessions, monday, toExclusive, filters), sort),
    [sessions, monday, toExclusive, filters, sort]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(requestedPage, pageCount);
  const selected = selection?.key === requestKey && selection.actor === selectedUserKey ? sessions.find(s => s.sessionId === selection.id) : undefined;
  const updateFilter = (key: keyof ScheduleFilters, value: string) => {setFilters(previous => ({...previous, [key]: value})); setPage(1);};
  const navigate = (date: string) => {setMonday(date); setPage(1); setSelection(null);};
  const handleSort = (field: string) => {
    const [current, order] = sort.split(':'); setSort(field + ':' + (current === field && order === 'asc' ? 'desc' : 'asc'));
  };
  return {now, monday, view, setView, filters, updateFilter, sort, handleSort, sessions, filtered, page, pageSize, pageCount,
    setPage: (value: number) => {if (Number.isInteger(value)) setPage(Math.max(1, Math.min(value, pageCount)));},
    navigate, loading, error, selected, retry: () => setRetry(value => value + 1),
    clear: () => {setFilters(emptyScheduleFilters()); setPage(1);},
    open: (session: ScheduleSession) => setSelection({id: session.sessionId, key: requestKey, actor: selectedUserKey}),
    close: () => setSelection(null)};
}
