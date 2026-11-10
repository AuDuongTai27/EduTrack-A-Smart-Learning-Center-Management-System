import {selectedUrl, currentSelectedUser} from '../BLL/services/userSelection';
import { validateSnapshot, validateRows, type InboxSnapshot } from '../BLL/services/notificationInbox';
const base = import.meta.env.VITE_API_URL || '/api';
export async function notificationRequest(path: string, method = 'GET', signal?: AbortSignal, body?: unknown): Promise<unknown> {
  if (body && path === 'management/notifications') body = { ...body as object, senderId: (await currentSelectedUser()).userId };
  const url = await selectedUrl(`${base}/${path}`, path.endsWith('/sent') ? 'senderId' : 'userId');
  const response = await fetch(url, { method, signal, credentials: 'omit', cache: 'no-store',
    headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}) });
  const value: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = value && typeof value === 'object' && 'message' in value ? String(value.message) : `HTTP ${response.status}`;
    const error = new Error(message) as Error & { status: number }; error.status = response.status; throw error;
  }
  return value;
}
export const notificationInboxApi = {
  async snapshot(signal?: AbortSignal) { return validateSnapshot(await notificationRequest('notifications/inbox/snapshot', 'GET', signal)); },
  async mutate(operation: 'read' | 'read-all' | 'delete' | 'restore', id?: number, signal?: AbortSignal): Promise<InboxSnapshot> {
    const path = operation === 'read-all' ? 'read-all' : operation === 'delete' ? `${id}/inbox` : `${id}/${operation}`;
    return validateSnapshot(await notificationRequest(`notifications/${path}${operation === 'read' ? '?snapshot=true' : ''}`,
      operation === 'delete' ? 'DELETE' : operation === 'restore' ? 'POST' : 'PATCH', signal));
  },
  async sent(signal?: AbortSignal) { return validateRows(await notificationRequest('management/notifications/sent', 'GET', signal)); },
};
