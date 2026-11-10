import {selectedUrl} from '../BLL/services/userSelection.ts';
import type {DirectSessionCreateInput, DirectSessionUpdateInput, ScheduleCapabilities, ScheduleGenerationInput, ScheduleGenerationPreview, ScheduleTemplate, ScheduleTemplateInput, ScheduleTemplatePreview, ScheduleVersion} from '../BLL/models/ScheduleManagement';
import type {ScheduleSession} from '../BLL/models/ScheduleSession';
import {dateOnly, mondayOf} from '../BLL/services/scheduleViewService';

const positive = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n > 0;
const text = (s: unknown): s is string => typeof s === 'string';
const room = (s: unknown) => s === null || text(s);
const token = (s: unknown) => text(s) && /^[A-F0-9]{64}$/.test(s);
const validTime = (s: unknown) => text(s) && /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,7})?$/.test(s);
const validDate = (s: unknown): s is string => {try {return text(s) && dateOnly(s) === s;} catch {return false;}};
const validWeek = (s: unknown) => validDate(s) && mondayOf(s) === s;
const weekdays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
function version(v: ScheduleVersion) {
  return v && positive(v.scheduleVersionId) && validWeek(v.effectiveFrom) && (v.effectiveTo === null || (validWeek(v.effectiveTo) && v.effectiveTo > v.effectiveFrom)) &&
    weekdays.includes(v.dayOfWeek) && validTime(v.startTime) && validTime(v.endTime) && v.startTime < v.endTime && room(v.room);
}
function template(value: unknown): value is ScheduleTemplate {
  if (!value || typeof value !== 'object') return false;
  const s = value as ScheduleTemplate;
  return positive(s.scheduleId) && positive(s.classId) && text(s.dayOfWeek) && validTime(s.startTime) && validTime(s.endTime) && room(s.room) &&
    typeof s.hasSessions === 'boolean' && token(s.version) && Array.isArray(s.versions) && s.versions.length > 0 && s.versions.every(version) &&
    new Set(s.versions.map(v => v.scheduleVersionId)).size === s.versions.length && s.versions.every((v,i) => i === 0 ||
      (s.versions[i-1].effectiveTo !== null && s.versions[i-1].effectiveTo! <= v.effectiveFrom && s.versions[i-1].effectiveFrom < v.effectiveFrom));
}
function readTemplatePreview(value: unknown, input: ScheduleTemplateInput, confirmed: boolean): ScheduleTemplatePreview {
  const p = value as ScheduleTemplatePreview;
  if (!p || !token(p.previewToken) || p.operation !== input.operation || p.effectiveFrom !== input.effectiveFrom || !text(p.message) ||
      !Array.isArray(p.retainedSessions) || new Set(p.retainedSessions.map(s => s?.sessionId)).size !== p.retainedSessions.length ||
      !p.retainedSessions.every(s => s && positive(s.sessionId) && positive(s.scheduleVersionId) && validDate(s.plannedOccurrenceDate) && validWeek(s.occurrenceWeekStart) &&
        mondayOf(s.plannedOccurrenceDate) === s.occurrenceWeekStart && s.occurrenceWeekStart >= input.effectiveFrom && validDate(s.sessionDate) &&
        validTime(s.startTime) && validTime(s.endTime) && room(s.room) && text(s.status) && typeof s.hasAttendance === 'boolean') ||
      (confirmed && (!template(p.template) || p.template.classId !== input.classId || (input.scheduleId && p.template.scheduleId !== input.scheduleId) || p.previewToken !== input.previewToken)))
    throw new Error('Dữ liệu Preview timeline từ máy chủ không hợp lệ. Tải lại trước khi xác nhận.');
  return p;
}
export function readScheduleGeneration(value: unknown, input: ScheduleGenerationInput): ScheduleGenerationPreview {
  const p = value as ScheduleGenerationPreview;
  const monthPrefix = `${input.year}-${String(input.month).padStart(2,'0')}-`;
  if (!p || !token(p.previewToken) || !Array.isArray(p.rows) || !Number.isInteger(p.created) || p.created < 0 ||
      new Set(p.rows.map(r => r?.key)).size !== p.rows.length || !p.rows.every(r => r && positive(r.scheduleId) && r.classId === input.classId &&
        positive(r.scheduleVersionId) && validDate(r.sessionDate) && validDate(r.plannedOccurrenceDate) && validWeek(r.occurrenceWeekStart) &&
        mondayOf(r.plannedOccurrenceDate) === r.occurrenceWeekStart && (r.proposedPlannedDate === null ||
          (validDate(r.proposedPlannedDate) && mondayOf(r.proposedPlannedDate) === r.occurrenceWeekStart)) &&
        validTime(r.startTime) && validTime(r.endTime) && r.startTime < r.endTime && room(r.room) && text(r.reason) && text(r.status) &&
        r.key === `${r.scheduleId}:${r.occurrenceWeekStart}` && ['eligible','existing','conflict','outside_class','created'].includes(r.outcome) &&
        (r.sessionId === null || positive(r.sessionId)) && (!['created','existing'].includes(r.outcome) || positive(r.sessionId)) &&
        (input.mode === 'single' ? r.scheduleId === input.scheduleId && validDate(input.sessionDate) && r.occurrenceWeekStart === mondayOf(input.sessionDate) :
          r.plannedOccurrenceDate.startsWith(monthPrefix) || r.proposedPlannedDate?.startsWith(monthPrefix))) ||
      p.created !== p.rows.filter(r => r.outcome === 'created').length)
    throw new Error('Dữ liệu occurrence từ máy chủ không hợp lệ. Tải lại để kiểm tra.');
  return p;
}
export function createScheduleManagementApi(baseUrl: string, selectedUserId?: number) {
  async function request(path: string, method = 'GET', body?: unknown, signal?: AbortSignal): Promise<unknown> {
    let response: Response;
    try {response = await fetch(await selectedUrl(`${baseUrl}/schedule/management${path}`, 'userId', selectedUserId), {method, credentials:'omit', cache:'no-store', signal,
      headers:{Accept:'application/json', ...(body === undefined ? {} : {'Content-Type':'application/json'})}, ...(body === undefined ? {} : {body:JSON.stringify(body)})});}
    catch (error) {
      if (signal?.aborted) throw error;
      throw new Error(method === 'GET' || path.endsWith('/preview') ? 'Không kết nối được máy chủ. Vui lòng thử lại.' :
        'Chưa xác định được kết quả lưu. Tải lại timeline/Preview để kiểm tra trước khi thử lại.');
    }
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.message || `Không thực hiện được yêu cầu (HTTP ${response.status}).`);
    }
    return response.json();
  }
  return {
    async capabilities(signal?: AbortSignal): Promise<ScheduleCapabilities> {
      const data = await request('/capabilities','GET',undefined,signal) as ScheduleCapabilities;
      if (!data || typeof data.canManageTemplates !== 'boolean' || typeof data.canCreateSessions !== 'boolean' || !validWeek(data.earliestEffectiveFrom) || !Array.isArray(data.classes) ||
          new Set(data.classes.map(c => c?.classId)).size !== data.classes.length || !data.classes.every(c => positive(c?.classId) && text(c.className) && text(c.status) &&
            validDate(c.startDate) && (c.endDate === null || validDate(c.endDate)))) throw new Error('Thông tin phân quyền/Class từ máy chủ không hợp lệ.');
      return data;
    },
    async templates(classId: number, signal?: AbortSignal): Promise<ScheduleTemplate[]> {
      const data = await request(`/templates?classId=${classId}`,'GET',undefined,signal);
      if (!Array.isArray(data) || !data.every(s => template(s) && s.classId === classId) || new Set(data.map(s => s.scheduleId)).size !== data.length)
        throw new Error('Danh sách timeline template không hợp lệ.');
      return data;
    },
    async previewTemplate(input: ScheduleTemplateInput): Promise<ScheduleTemplatePreview> {
      return readTemplatePreview(await request('/templates/preview','POST',input),input,false);
    },
    async confirmTemplate(input: ScheduleTemplateInput): Promise<ScheduleTemplatePreview> {
      return readTemplatePreview(await request('/templates/confirm','POST',input),input,true);
    },
    async preview(input: ScheduleGenerationInput): Promise<ScheduleGenerationPreview> {
      return readScheduleGeneration(await request('/sessions/preview','POST',input),input);
    },
    async confirm(input: ScheduleGenerationInput): Promise<ScheduleGenerationPreview> {
      const result = readScheduleGeneration(await request('/sessions/confirm','POST',input),input);
      if (result.previewToken !== input.previewToken || result.rows.some(r => r.outcome === 'created' && !input.selectedKeys?.includes(r.key)))
        throw new Error('Xác nhận trả về khác Preview đã chọn. Tải lại lịch để kiểm tra kết quả.');
      return result;
    },
    async createSessionDirect(input: DirectSessionCreateInput): Promise<ScheduleSession> {
      return await request('/sessions/direct', 'POST', input) as ScheduleSession;
    },
    async updateSessionDirect(sessionId: number, input: DirectSessionUpdateInput): Promise<ScheduleSession> {
      return await request(`/sessions/${sessionId}`, 'PUT', input) as ScheduleSession;
    },
    async deleteSessionDirect(sessionId: number): Promise<{deleted: boolean; sessionId: number}> {
      return await request(`/sessions/${sessionId}`, 'DELETE') as {deleted: boolean; sessionId: number};
    },
  };
}
export const scheduleManagementApi = createScheduleManagementApi(import.meta.env?.VITE_API_URL || '/api');
