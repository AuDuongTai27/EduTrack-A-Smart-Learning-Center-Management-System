import {selectedUrl} from '../BLL/services/userSelection.ts';
import type { ScheduleClassSummary, ScheduleSession } from '../BLL/models/ScheduleSession.ts';
import { dateOnly } from '../BLL/services/scheduleViewService.ts';

function isClassSummary(value: unknown): value is ScheduleClassSummary {
  if (!value || typeof value !== 'object') return false;
  const row = value as ScheduleClassSummary;
  try {
    dateOnly(row.startDate);
    if (row.endDate !== null) dateOnly(row.endDate);
  } catch {
    return false;
  }
  return Number.isInteger(row.classId) && row.classId > 0 && typeof row.className === 'string' && typeof row.status === 'string';
}

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

export function createScheduleSessionApi(baseUrl: string, selectedUserId?: number) {
  return {
    async getWeek(from: string, toExclusive: string, signal?: AbortSignal, userIdOverride?: number): Promise<ScheduleSession[]> {
      const query = new URLSearchParams({from: dateOnly(from), toExclusive: dateOnly(toExclusive)});
      const response = await fetch(await selectedUrl(`${baseUrl}/schedule/sessions?${query}`, 'userId', userIdOverride ?? selectedUserId), {credentials: 'omit', cache: 'no-store', signal, headers: {Accept: 'application/json'}});
      if (!response.ok) {
        throw new Error(`Failed to load schedule (HTTP ${response.status}). Please try again.`);
      }
      const data: unknown = await response.json();
      if (!Array.isArray(data) || !data.every(isSession) || new Set(data.map(s => s.sessionId)).size !== data.length)
        throw new Error('Invalid schedule data from server. Please try again.');
      return data;
    },
    async getClasses(signal?: AbortSignal, userIdOverride?: number): Promise<ScheduleClassSummary[]> {
      const response = await fetch(await selectedUrl(`${baseUrl}/schedule/classes`, 'userId', userIdOverride ?? selectedUserId), {credentials: 'omit', cache: 'no-store', signal, headers: {Accept: 'application/json'}});
      if (!response.ok) {
        throw new Error(`Failed to load classes (HTTP ${response.status}). Please try again.`);
      }
      const data: unknown = await response.json();
      if (!Array.isArray(data) || !data.every(isClassSummary)) {
        throw new Error('Invalid class data from server. Please try again.');
      }
      return data;
    },
  };
}

export const scheduleSessionApi = createScheduleSessionApi(import.meta.env?.VITE_API_URL || '/api');
