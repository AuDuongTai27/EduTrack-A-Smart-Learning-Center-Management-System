import type { ScheduleSession } from '../BLL/models/ScheduleSession.ts';
import { dateOnly } from '../BLL/services/scheduleViewService.ts';

function isSession(value: unknown): value is ScheduleSession {
  if (!value || typeof value !== 'object') return false;
  const row = value as ScheduleSession;
  const people = (list: unknown) => Array.isArray(list) && list.every(p => Number.isInteger(p?.userId) && p.userId > 0 && typeof p.name === 'string');
  try { dateOnly(row.sessionDate); } catch { return false; }
  return Number.isInteger(row.sessionId) && row.sessionId > 0 && Number.isInteger(row.classId) && row.classId > 0 &&
    Number.isInteger(row.subjectId) && typeof row.className === 'string' && (row.subjectName === null || typeof row.subjectName === 'string') &&
    typeof row.startTime === 'string' && typeof row.endTime === 'string' && (row.room === null || typeof row.room === 'string') &&
    typeof row.status === 'string' && typeof row.hasAttendance === 'boolean' && people(row.teachers) && people(row.teachingAssistants);
}

export function createScheduleSessionApi(baseUrl: string) {
  return {
    async getWeek(from: string, toExclusive: string, signal?: AbortSignal): Promise<ScheduleSession[]> {
      const query = new URLSearchParams({from: dateOnly(from), toExclusive: dateOnly(toExclusive)});
      const response = await fetch(`${baseUrl}/schedule/sessions?${query}`, {credentials: 'include', cache: 'no-store', signal, headers: {Accept: 'application/json'}});
      if (!response.ok) {
        if (response.status === 401) throw new Error('Chưa xác thực. Vui lòng đăng nhập để xem lịch học.');
        if (response.status === 403) throw new Error('Tài khoản không có quyền xem lịch học.');
        throw new Error(`Không tải được lịch học (HTTP ${response.status}). Vui lòng thử lại.`);
      }
      const data: unknown = await response.json();
      if (!Array.isArray(data) || !data.every(isSession) || new Set(data.map(s => s.sessionId)).size !== data.length)
        throw new Error('Dữ liệu lịch học từ máy chủ không hợp lệ. Vui lòng thử lại.');
      return data;
    },
  };
}

export const scheduleSessionApi = createScheduleSessionApi(import.meta.env?.VITE_API_URL || '/api');
