import { learningApi, type LearnerNotificationItemApiDto } from '../../../../api/learningApi';
import type { AuthUserDto } from '../../../../api/authApi';
import type { NotificationDto } from '../../../../BLL/models/NotificationDto';

export type LearnerNotificationScope = { role: 'student' | 'parent'; userId: number; studentId?: number };

export function learnerNotificationScope(role: 'student' | 'parent', user: AuthUserDto | null, selectedChildId?: number, parentLoading = false): LearnerNotificationScope | null {
  if (!user || !Number.isSafeInteger(user.userId) || user.userId <= 0 || !(user.primaryRole === role || user.roles?.includes(role))) return null;
  if (role === 'parent' && (parentLoading || selectedChildId !== undefined && (!Number.isSafeInteger(selectedChildId) || selectedChildId <= 0))) return null;
  return { role, userId: user.userId, ...(role === 'parent' && selectedChildId !== undefined ? { studentId: selectedChildId } : {}) };
}

/** Keep the full API inbox; the Bell applies the shared unread-only preview rule. */
export async function loadLearnerNotificationPreview(scope: LearnerNotificationScope, readIds: Set<number>, api = learningApi) {
  if (scope.role === 'parent' && scope.studentId !== undefined) {
    // Revalidate the selected child against current backend links before querying the inbox.
    const children = await api.getParentChildrenOverview(scope.userId);
    if (!Array.isArray(children) || !children.some(child => child.id === scope.studentId)) {
      throw new Error('Selected child scope is unavailable.');
    }
  }
  const rows = scope.role === 'student'
    ? await api.getStudentNotifications(scope.userId)
    : await api.getParentNotifications(scope.userId, scope.studentId);
  if (!Array.isArray(rows) || rows.some(row => !row || !Number.isSafeInteger(row.notificationId) || row.notificationId <= 0 || typeof row.title !== 'string' || typeof row.content !== 'string' || typeof row.isRead !== 'boolean' || !Number.isFinite(Date.parse(row.createdAt)))) {
    throw new Error('Notification data is unavailable.');
  }
  const items: NotificationDto[] = rows.map((row: LearnerNotificationItemApiDto) => ({ ...row, isRead: row.isRead || readIds.has(row.notificationId) })).filter(row => !(row as NotificationDto).deletedAt);
  return { items, unreadCount: items.filter(row => !row.isRead).length };
}
