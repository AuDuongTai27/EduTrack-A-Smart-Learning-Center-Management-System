import type { NotificationDto } from '../models/NotificationDto';

export const GRACE_MS = 5 * 60 * 1000;
export interface NotificationIdentity {
  userId: number; userCode: string; fullName: string; email: string | null;
  avatarUrl: string | null; roles: string[];
}
export interface InboxSnapshot {
  identity: NotificationIdentity; serverNowUtc: string;
  inbox: NotificationDto[]; trash: NotificationDto[]; unreadCount: number;
}
export function newest(a: NotificationDto, b: NotificationDto) {
  return Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.notificationId - a.notificationId;
}
export function quickNotifications(rows: NotificationDto[], now: number) {
  return rows.filter(n => !n.deletedAt && (!n.isRead ||
    (n.readAt != null && now < Date.parse(n.readAt) + GRACE_MS))).sort(newest).slice(0, 5);
}
export function nextExpiry(rows: NotificationDto[], now: number) {
  return Math.min(...rows.filter(n => !n.deletedAt && n.isRead && n.readAt)
    .map(n => Date.parse(n.readAt!) + GRACE_MS).filter(t => t > now));
}
const utcDate = (x: unknown): x is string => typeof x === 'string'
  && /(?:Z|\+00:00)$/.test(x) && Number.isFinite(Date.parse(x));
export function validateRows(value: unknown): NotificationDto[] {
  if (!Array.isArray(value) || value.some(n => !n || !Number.isSafeInteger(n.notificationId)
    || n.notificationId <= 0 || typeof n.title !== 'string' || typeof n.content !== 'string'
    || typeof n.type !== 'string' || typeof n.isRead !== 'boolean' || !utcDate(n.createdAt)
    || (n.readAt != null && !utcDate(n.readAt)) || (n.deletedAt != null && !utcDate(n.deletedAt)))
    || new Set(value.map(n => n.notificationId)).size !== value.length)
    throw new Error('Dữ liệu thông báo không hợp lệ.');
  return value;
}
export function validateSnapshot(value: unknown): InboxSnapshot {
  const s = value as InboxSnapshot;
  if (!s || !s.identity || !Number.isSafeInteger(s.identity.userId) || s.identity.userId <= 0
    || typeof s.identity.fullName !== 'string' || typeof s.identity.userCode !== 'string'
    || !Array.isArray(s.identity.roles) || s.identity.roles.some(r => typeof r !== 'string') || !utcDate(s.serverNowUtc))
    throw new Error('Tài khoản được chọn hoặc dữ liệu thông báo không hợp lệ.');
  validateRows(s.inbox); validateRows(s.trash);
  if (s.inbox.some(n => n.deletedAt) || s.trash.some(n => !n.deletedAt)
    || s.unreadCount !== s.inbox.filter(n => !n.isRead).length
    || s.trash.some(n => s.inbox.some(i => i.notificationId === n.notificationId)))
    throw new Error('Trạng thái hộp thư không nhất quán.');
  return s;
}
export const notificationTime = (date: string) => new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'short',
}).format(new Date(date));
