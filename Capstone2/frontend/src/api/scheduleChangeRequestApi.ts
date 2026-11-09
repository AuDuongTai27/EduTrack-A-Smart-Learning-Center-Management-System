import {selectedUrl} from '../BLL/services/userSelection.ts';
import type {ScheduleChangeActual, ScheduleChangeCapabilities, ScheduleChangeInput, ScheduleChangePreview, ScheduleChangeRequest, ScheduleDecisionInput} from '../BLL/models/ScheduleChangeRequest';
const id = (x: unknown): x is number => typeof x === 'number' && Number.isSafeInteger(x) && x > 0;
const date = (x: unknown): x is string => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x) && !isNaN(Date.parse(x)) && new Date(x).toISOString().slice(0,10) === x;
const room = (x: unknown) => x === null || typeof x === 'string' && x.length <= 50;
const time = (x: unknown) => typeof x === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,7})?$/.test(x);
const actual = (x: ScheduleChangeActual | null) => !!x && date(x.sessionDate) && time(x.startTime) && time(x.endTime) && x.startTime < x.endTime && room(x.room) && ['scheduled','cancelled','completed'].includes(x.status);
const instant = (x: unknown) => typeof x === 'string' && !isNaN(Date.parse(x));
const uuid = (x: unknown) => typeof x === 'string' && /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(x);
export class ScheduleChangeApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {super(message);this.name = 'ScheduleChangeApiError';this.status = status;}
}
function session(x: ScheduleChangeRequest['session']) {
  if (!x || !id(x.sessionId) || !id(x.classId) || !id(x.scheduleId) || !id(x.scheduleVersionId) || typeof x.className !== 'string' || !date(x.plannedOccurrenceDate) || !date(x.occurrenceWeekStart) ||
      !actual(x.actual) || typeof x.hasAttendance !== 'boolean') return false;
  const monday = new Date(x.plannedOccurrenceDate); monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7);
  return monday.toISOString().slice(0,10) === x.occurrenceWeekStart;
}
export function readScheduleChange(value: unknown): ScheduleChangeRequest {
  const x = value as ScheduleChangeRequest;
  if (!x || !id(x.requestId) || typeof x.requestCode !== 'string' || !id(x.requestedBy) || !(x.reviewedBy === null || id(x.reviewedBy)) || !['pending','approved','rejected'].includes(x.status) ||
      !['reschedule','cancel','makeup'].includes(x.changeKind) || typeof x.reason !== 'string' || !(x.reviewNotes === null || typeof x.reviewNotes === 'string') || !uuid(x.clientRequestKey) ||
      !instant(x.createdAt) || !(x.reviewedAt === null || instant(x.reviewedAt)) || !(x.appliedAt === null || instant(x.appliedAt)) || (x.status === 'approved') !== (x.appliedAt !== null) ||
      !actual(x.original) || !session(x.session) || (x.changeKind === 'cancel' ? x.proposed !== null : !actual(x.proposed))) throw new Error('Typed Schedule request từ máy chủ không hợp lệ.');
  return x;
}
export function readScheduleChangePreview(value: unknown): ScheduleChangePreview {
  const x = value as ScheduleChangePreview;
  if (!x || !/^[\da-f]{64}$/i.test(x.previewToken) || typeof x.allowed !== 'boolean' || !Array.isArray(x.reasons) || !x.reasons.every(s => typeof s === 'string') ||
      x.allowed !== (x.reasons.length === 0) || !session(x.session) || !(x.proposed === null || actual(x.proposed))) throw new Error('Preview đổi lịch không hợp lệ.');
  if (x.request !== null) {const request = readScheduleChange(x.request); if (request.session.sessionId !== x.session.sessionId) throw new Error('Preview không khớp Session.');}
  return x;
}
export function createScheduleChangeRequestApi(baseUrl: string, selectedUserId?: number) {
  async function request(path: string, method = 'GET', body?: unknown, signal?: AbortSignal): Promise<unknown> {
    let response: Response;
    try {response = await fetch(await selectedUrl(`${baseUrl}/schedule/change-requests${path}`, 'userId', selectedUserId), {method, signal, credentials:'omit', cache:'no-store', headers:{Accept:'application/json',...(body === undefined ? {} : {'Content-Type':'application/json'})},...(body === undefined ? {} : {body:JSON.stringify(body)})});}
    catch (cause) {if (signal?.aborted) throw cause; throw new Error(method === 'GET' || path.endsWith('preview') ? 'Không kết nối được máy chủ.' : 'Chưa xác định kết quả lưu. Tải lại request; retry phải dùng cùng key/quyết định.');}
    if (!response.ok) {const data = await response.json().catch(() => null); throw new ScheduleChangeApiError(response.status,data?.message || `Không thực hiện được yêu cầu (HTTP ${response.status}).`);}
    return response.json();
  }
  return {
    async capabilities(signal?: AbortSignal) {const x = await request('/capabilities','GET',undefined,signal) as ScheduleChangeCapabilities;
      if (!x || !id(x.currentUserId) || !['canPreview','canSubmit','canReview','canApply','canViewAll'].every(k => typeof x[k as keyof ScheduleChangeCapabilities] === 'boolean') || !(x.blocker === null || typeof x.blocker === 'string')) throw new Error('Capabilities đổi lịch không hợp lệ.'); return x;},
    async list(signal?: AbortSignal) {const x = await request('','GET',undefined,signal); if (!Array.isArray(x)) throw new Error('Danh sách typed requests không hợp lệ.'); const rows = x.map(readScheduleChange); if (new Set(rows.map(r => r.requestId)).size !== rows.length) throw new Error('RequestId bị trùng.'); return rows;},
    async get(id: number) {const x = readScheduleChange(await request(`/${id}`)); if (x.requestId !== id) throw new Error('RequestId không khớp.'); return x;},
    async preview(input: ScheduleChangeInput) {const x = readScheduleChangePreview(await request('/preview','POST',input)); if (x.session.sessionId !== input.sessionId) throw new Error('Preview sai Session.'); return x;},
    async submit(input: ScheduleChangeInput) {const x = readScheduleChange(await request('','POST',input)); if (x.session.sessionId !== input.sessionId || x.clientRequestKey !== input.clientRequestKey || x.changeKind !== input.changeKind) throw new Error('Kết quả submit không khớp yêu cầu.'); return x;},
    async claim(id: number) {const x = readScheduleChange(await request(`/${id}/claim`,'POST')); if (x.requestId !== id) throw new Error('RequestId không khớp.'); return x;},
    async decisionPreview(id: number, input: ScheduleDecisionInput) {const x = readScheduleChangePreview(await request(`/${id}/decision-preview`,'POST',input)); if (x.request?.requestId !== id) throw new Error('Decision Preview sai request.'); return x;},
    async decide(id: number, input: ScheduleDecisionInput) {const x = readScheduleChange(await request(`/${id}/decision`,'POST',input)); if (x.requestId !== id || x.status !== input.decision) throw new Error('Kết quả quyết định không khớp request.'); return x;},
  };
}
export const scheduleChangeRequestApi = createScheduleChangeRequestApi(import.meta.env?.VITE_API_URL || '/api');
