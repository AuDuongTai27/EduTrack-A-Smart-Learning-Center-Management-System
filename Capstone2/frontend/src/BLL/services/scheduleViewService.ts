import type { ScheduleFilters, ScheduleSession } from '../models/ScheduleSession.ts';

export const SCHEDULE_TIMEZONE = 'Asia/Ho_Chi_Minh';
export const WEEKDAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
export const emptyScheduleFilters = (): ScheduleFilters => ({search: '', weekday: '', classId: '', subjectId: '', teacherId: '', taId: '', room: '', status: ''});

export function vietnamClock(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {timeZone: SCHEDULE_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'}).formatToParts(now);
  const get = (type: string) => parts.find(p => p.type === type)!.value;
  return {date: `${get('year')}-${get('month')}-${get('day')}`, minutes: Number(get('hour')) * 60 + Number(get('minute'))};
}

export function dateOnly(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Ngày lịch học không hợp lệ.');
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new Error('Ngày lịch học không tồn tại.');
  return value;
}

export function addScheduleDays(value: string, days: number): string {
  const date = new Date(`${dateOnly(value)}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function mondayOf(value: string): string {
  const weekday = new Date(`${dateOnly(value)}T00:00:00Z`).getUTCDay();
  return addScheduleDays(value, -((weekday + 6) % 7));
}

export function displayScheduleDate(value: string): string {
  const [year, month, day] = dateOnly(value).split('-');
  return `${day}/${month}/${year}`;
}

export function timeMinutes(value: string): number {
  const match = /^(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/.exec(value);
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59 || Number(match[3] ?? 0) > 59) return NaN;
  return Number(match[1]) * 60 + Number(match[2]) + Number(match[3] ?? 0) / 60;
}

export function validCalendarTime(session: ScheduleSession): boolean {
  const start = timeMinutes(session.startTime), end = timeMinutes(session.endTime);
  return Number.isFinite(start) && Number.isFinite(end) && start < end;
}

export function scheduleStatus(session: ScheduleSession, now = new Date()) {
  if (session.status === 'cancelled') return {key: 'cancelled', label: 'Đã hủy'};
  if (session.status === 'completed') return {key: 'completed', label: 'Đã hoàn thành'};
  if (session.status === 'scheduled' || session.status === 'in_progress') {
    const clock = vietnamClock(now);
    if (session.sessionDate === clock.date && clock.minutes >= timeMinutes(session.startTime) && clock.minutes < timeMinutes(session.endTime))
      return {key: 'ongoing', label: 'Đang trong giờ học'};
    return {key: 'scheduled', label: 'Đã xếp lịch'};
  }
  return {key: 'unknown', label: `Trạng thái khác: ${session.status || 'Chưa xác định'}`};
}

export function filterSchedule(sessions: ScheduleSession[], from: string, toExclusive: string, filters: ScheduleFilters): ScheduleSession[] {
  const search = filters.search.trim().toLocaleLowerCase('vi');
  return sessions.filter(s => s.sessionDate >= from && s.sessionDate < toExclusive &&
    (!filters.weekday || String((new Date(s.sessionDate + 'T00:00:00Z').getUTCDay() + 6) % 7) === filters.weekday) &&
    (!filters.classId || String(s.classId) === filters.classId) &&
    (!filters.subjectId || String(s.subjectId) === filters.subjectId) &&
    (!filters.teacherId || s.teachers.some(p => String(p.userId) === filters.teacherId)) &&
    (!filters.taId || s.teachingAssistants.some(p => String(p.userId) === filters.taId)) &&
    (!filters.room || s.room === filters.room) && (!filters.status || s.status === filters.status) &&
    (!search || [s.className, s.subjectName, s.room, ...s.teachers.map(p => p.name), ...s.teachingAssistants.map(p => p.name)]
      .some(value => value?.toLocaleLowerCase('vi').includes(search))));
}

export function sortSchedule(sessions: ScheduleSession[], sort: string): ScheduleSession[] {
  return [...sessions].sort((a, b) => {
    const chronological = a.sessionDate.localeCompare(b.sessionDate) || a.startTime.localeCompare(b.startTime) || a.sessionId - b.sessionId;
    if (sort === 'latest') return -chronological;
    if (sort === 'class') return a.className.localeCompare(b.className, 'vi', {numeric: true}) || chronological;
    const [field, order] = sort.split(':');
    if (order === 'asc' || order === 'desc') {
      const comparison = field === 'className' ? a.className.localeCompare(b.className, 'vi', {numeric: true}) :
        field === 'time' ? timeMinutes(a.startTime) - timeMinutes(b.startTime) : chronological;
      return (order === 'desc' ? -1 : 1) * comparison || chronological;
    }
    return chronological;
  });
}

export function schedulePageNumber(value: string, totalPages: number): number | null {
  const page = Number(value);
  return value.trim() !== '' && Number.isInteger(page) && page >= 1 && page <= totalPages ? page : null;
}

export interface CalendarPlacement { session: ScheduleSession; lane: number; laneCount: number }

// Interval partitioning per connected overlap group; touching endpoints share a lane.
export function placeDaySessions(sessions: ScheduleSession[]): CalendarPlacement[] {
  const sorted = sessions.filter(validCalendarTime).sort((a, b) => timeMinutes(a.startTime) - timeMinutes(b.startTime) ||
    timeMinutes(a.endTime) - timeMinutes(b.endTime) || a.sessionId - b.sessionId);
  const result: CalendarPlacement[] = [];
  let group: CalendarPlacement[] = [], laneEnds: number[] = [], groupEnd = -1;
  const finish = () => { group.forEach(p => {p.laneCount = laneEnds.length;}); result.push(...group); group = []; laneEnds = []; };
  for (const session of sorted) {
    const start = timeMinutes(session.startTime), end = timeMinutes(session.endTime);
    if (start >= groupEnd) finish();
    let lane = laneEnds.findIndex(value => value <= start);
    if (lane < 0) lane = laneEnds.length;
    laneEnds[lane] = end;
    group.push({session, lane, laneCount: 0});
    groupEnd = group.length === 1 ? end : Math.max(groupEnd, end);
  }
  finish();
  return result;
}

export function calendarHours(sessions: ScheduleSession[]) {
  const valid = sessions.filter(validCalendarTime);
  return {start: Math.min(7, ...valid.map(s => Math.floor(timeMinutes(s.startTime) / 60))),
    end: Math.max(21, ...valid.map(s => Math.ceil(timeMinutes(s.endTime) / 60)))};
}
