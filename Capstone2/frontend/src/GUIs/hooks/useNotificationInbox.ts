import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import {useSelectedUser} from './useSelectedUser';
import { NotificationInboxStore } from '../../BLL/services/notificationInboxStore';

const stores = new Map<string, NotificationInboxStore>();
export function clearNotificationInbox() {
  stores.forEach(store => store.stop()); stores.clear();
}
export function useNotificationInbox() {
  const { user, permission } = useSelectedUser();
  const { pathname } = useLocation();
  const prefix = pathname.split('/')[1];
  const role = prefix.replaceAll('-', '_');
  const key = `${user?.userId ?? 'none'}:${permission?.join(',') ?? 'none'}:${role}`;
  const store = useMemo(() => {
    let current = stores.get(key);
    if (!current) { current = new NotificationInboxStore(role); stores.set(key, current); }
    return current;
  }, [key, role]);
  // New key renders an empty store immediately. Dispose old identities after commit,
  // never while React may still be rendering/abandoning a different route.
  useEffect(() => {
    for (const [cachedKey, cachedStore] of stores) {
      if (cachedKey !== key) { cachedStore.stop(); stores.delete(cachedKey); }
    }
  }, [key]);
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);
  return { ...state, store, basePath: `/${prefix}/notifications`, role,
    manager: role === 'center_manager' || role === 'admin_staff' };
}
