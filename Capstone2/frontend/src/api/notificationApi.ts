import {currentSelectedUser} from '../BLL/services/userSelection';
import type { NotificationDto } from '../BLL/models/NotificationDto';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export type NotificationTargetScope = 'all' | 'role' | 'class' | 'user';
export type NotificationType = 'announcement' | 'system' | 'reminder' | 'tuition' | 'academic' | 'schedule' | 'homework' | 'class';

export interface CreateNotificationPayload {
  senderId?: number; // Compatibility argument ignored by the server; never an actor credential.
  title: string;
  content: string;
  type: NotificationType;
  targetScope: NotificationTargetScope;
  targetRole?: string | null;
  classId?: number | null;
  userId?: number | null;
}

async function readResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data: unknown = await res.json().catch(() => null);
    const message = data && typeof data === 'object' && 'message' in data
      ? String((data as { message: unknown }).message)
      : `HTTP ${res.status}: ${res.statusText}`;
    throw new Error(message);
  }
  return await res.json() as T;
}

export const notificationApi = {
  async getAll(): Promise<NotificationDto[]> {
    const res = await fetch(`${API_BASE_URL}/notifications?userId=${(await currentSelectedUser()).userId}`, { credentials: 'omit', cache: 'no-store' });
    return readResponse<NotificationDto[]>(res);
  },

  async getById(id: number): Promise<NotificationDto> {
    const res = await fetch(`${API_BASE_URL}/notifications/${id}?userId=${(await currentSelectedUser()).userId}`, { credentials: 'omit', cache: 'no-store' });
    return readResponse<NotificationDto>(res);
  },

  async create(payload: CreateNotificationPayload): Promise<NotificationDto> {
    const res = await fetch(`${API_BASE_URL}/management/notifications`, {
      method: 'POST', credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return readResponse<NotificationDto>(res);
  },

  async getSent(senderId: number): Promise<NotificationDto[]> {
    const res = await fetch(`${API_BASE_URL}/management/notifications/sent?senderId=${senderId}`, { credentials: 'omit', cache: 'no-store' });
    return readResponse<NotificationDto[]>(res);
  },

  async getInbox(userId: number): Promise<NotificationDto[]> {
    const res = await fetch(`${API_BASE_URL}/notifications/inbox?userId=${userId}`, { credentials: 'omit', cache: 'no-store' });
    return readResponse<NotificationDto[]>(res);
  },

  async markRead(notificationId: number, userId: number): Promise<NotificationDto> {
    const res = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read?userId=${userId}`, {
      method: 'PATCH', credentials: 'omit',
    });
    return readResponse<NotificationDto>(res);
  },

  async deleteReadFromInbox(notificationId: number, userId: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/notifications/${notificationId}/inbox?userId=${userId}`, {
      method: 'DELETE', credentials: 'omit',
    });
    if (!res.ok) {
      const data: unknown = await res.json().catch(() => null);
      const message = data && typeof data === 'object' && 'message' in data
        ? String((data as { message: unknown }).message)
        : `HTTP ${res.status}: ${res.statusText}`;
      throw new Error(message);
    }
    // Compatibility caller needs no response body; server returns the confirmed Inbox snapshot.
  },
};

export default notificationApi;
