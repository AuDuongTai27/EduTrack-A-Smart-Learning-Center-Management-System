import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { getAuthUser, subscribeAuth } from '../../../../api/authApi';
import { getLocalReadNotificationIds } from '../../../../DAL/learningDAL';
import { learnerNotificationScope, loadLearnerNotificationPreview, type LearnerNotificationScope } from './learnerNotificationPreview';
import { TopbarNotificationPopover } from './TopbarNotificationPopover';
import { TopbarNotificationContent } from './TopbarNotificationContent';
import { quickNotifications } from '../../../../BLL/services/notificationInbox';

type Preview = Awaited<ReturnType<typeof loadLearnerNotificationPreview>>;

function ScopedBell({ scope, role }: { scope: LearnerNotificationScope | null; role: 'student' | 'parent' }) {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!scope) return;
    let active = true, request = 0;
    const refresh = async () => {
      const sequence = ++request;
      try {
        const result = await loadLearnerNotificationPreview(scope, getLocalReadNotificationIds(scope.userId));
        if (active && sequence === request) { setPreview(result); setError(null); }
      } catch {
        if (active && sequence === request) { setPreview(null); setError('Unable to load notifications. Please try again.'); }
      }
    };
    const update = () => { void refresh(); };
    const storage = (event: StorageEvent) => {
      if (!event.key || event.key === 'edutrack-notifications-invalidated' || event.key === `edutrack_read_notification_ids_${scope.userId}`) update();
    };
    update();
    window.addEventListener('notifications-updated', update);
    window.addEventListener('focus', update);
    window.addEventListener('storage', storage);
    return () => { active = false; window.removeEventListener('notifications-updated', update); window.removeEventListener('focus', update); window.removeEventListener('storage', storage); };
  }, [scope, retry]);
  return <TopbarNotificationPopover unreadCount={error ? null : preview?.unreadCount ?? null}>{close =>
    <TopbarNotificationContent items={preview ? quickNotifications(preview.items) : null} loading={!!scope && !preview && !error}
      error={error} retry={() => { setError(null); setRetry(value => value + 1); }} basePath={`/${role}/notifications`} close={close} />
  }</TopbarNotificationPopover>;
}

export function LearnerNotificationBell({ role, selectedChildId, parentLoading = false }: {
  role: 'student' | 'parent'; selectedChildId?: number; parentLoading?: boolean;
}) {
  const user = useSyncExternalStore(subscribeAuth, getAuthUser);
  const scope = useMemo(() => learnerNotificationScope(role, user, selectedChildId, parentLoading), [role, user, selectedChildId, parentLoading]);
  // Identity/child transitions remount immediately, before any previous request can resolve.
  const key = `${role}:${scope?.userId ?? 'none'}:${scope?.studentId ?? 'all'}:${parentLoading}`;
  return <ScopedBell key={key} scope={scope} role={role} />;
}
