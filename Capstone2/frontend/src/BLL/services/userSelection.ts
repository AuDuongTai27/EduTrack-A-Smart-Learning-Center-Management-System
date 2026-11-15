import type { UserDto } from '../models/UserDto';
const base = import.meta.env?.VITE_API_URL || '/api';
export type SelectionState = { users: UserDto[]; user: UserDto | undefined; loading: boolean; error: string | null };
const states = new Map<string, SelectionState>();
const pending = new Map<string, Promise<void>>();
const listeners = new Set<() => void>();
const empty: SelectionState = { users: [], user: undefined, loading: true, error: null };
export function selectionRole() {
  return typeof window === 'undefined' ? '' : window.location.pathname.split('/')[1]?.replaceAll('-', '_') || '';
}
export const getSelection = (role: string) => states.get(role) ?? empty;
export const subscribeSelection = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
function publish(role: string, state: SelectionState) { states.set(role, state); listeners.forEach(l => l()); }
export async function loadSelection(role: string, force = false) {
  if (!force && states.get(role)?.user) return;
  if (pending.has(role)) return pending.get(role);
  const task = (async () => {
    try {
      const response = await fetch(`${base}/user-selection?role=${encodeURIComponent(role)}`, { cache: 'no-store', credentials: 'omit' });
      if (!response.ok) throw new Error(`Failed to load ${role} accounts (HTTP ${response.status}).`);
      const users: unknown = await response.json();
      if (!Array.isArray(users) || users.some(u => !Number.isSafeInteger(u.userId) || u.userId <= 0 || typeof u.fullName !== 'string' || typeof u.userCode !== 'string' || !Array.isArray(u.roles) || u.status !== 'active'
        || !u.roles.some((r: string) => r === role || role === 'teaching_assistant' && r === 'ta')))
        throw new Error('Invalid account list.');
      let preferred = 0;
      try { preferred = Number(localStorage.getItem(`edutrack-selected-user:${role}`)); } catch { /* Storage optional. */ }
      const user = users.find(u => u.userId === preferred) ?? users[0];
      publish(role, { users, user, loading: false, error: user ? null : `No active accounts found for ${role}.` });
    } catch (error) { publish(role, { users: [], user: undefined, loading: false, error: error instanceof Error ? error.message : 'Failed to load accounts.' }); }
    finally { pending.delete(role); }
  })();
  pending.set(role, task); return task;
}
export function chooseUser(role: string, userId: number) {
  const state = getSelection(role); const user = state.users.find(u => u.userId === userId);
  if (!user) throw new Error('Account not found in data list.');
  try { localStorage.setItem(`edutrack-selected-user:${role}`, String(userId)); } catch { /* Storage optional. */ }
  publish(role, { ...state, user });
}
export function applyLoggedInUser(role: string, loggedInUser: UserDto) {
  try { localStorage.setItem(`edutrack-selected-user:${role}`, String(loggedInUser.userId)); } catch { /* Storage optional. */ }
  const current = states.get(role);
  const existingUsers = current?.users?.length ? current.users : [loggedInUser];
  const mergedUsers = existingUsers.some(u => u.userId === loggedInUser.userId)
    ? existingUsers.map(u => u.userId === loggedInUser.userId ? { ...u, ...loggedInUser } : u)
    : [loggedInUser, ...existingUsers];
  publish(role, { users: mergedUsers, user: loggedInUser, loading: false, error: null });
}
export async function currentSelectedUser() {
  const role = selectionRole(); await loadSelection(role);
  const state = getSelection(role);
  if (!state.user) throw new Error(state.error || 'Select an account to view data.');
  return state.user;
}
const DEFAULT_USER_IDS: Record<string, number> = {
  center_manager: 1,
  admin_staff: 2,
  teacher: 3,
  teaching_assistant: 5,
  ta: 5,
  student: 6,
  parent: 9,
};

export function getSelectedUserId(role?: string): number {
  const targetRole = (role || selectionRole() || 'student').trim().toLowerCase();
  const normalizedRole = targetRole === 'ta' ? 'teaching_assistant' : targetRole;

  try {
    const rawAuth = localStorage.getItem('edutrack_auth_user');
    if (rawAuth) {
      const authUser = JSON.parse(rawAuth);
      if (authUser && typeof authUser.userId === 'number' && authUser.userId > 0) {
        const pRole = (authUser.primaryRole || '').toLowerCase();
        const uRoles: string[] = Array.isArray(authUser.roles)
          ? authUser.roles.map((r: string) => (r.toLowerCase() === 'ta' ? 'teaching_assistant' : r.toLowerCase()))
          : [];
        if (pRole === normalizedRole || uRoles.includes(normalizedRole)) {
          return authUser.userId;
        }
      }
    }
  } catch {
    // ignore
  }

  const stateUser = states.get(normalizedRole)?.user;
  if (stateUser && stateUser.userId > 0) {
    return stateUser.userId;
  }

  try {
    const stored = Number(localStorage.getItem(`edutrack-selected-user:${normalizedRole}`));
    if (Number.isSafeInteger(stored) && stored > 0) {
      return stored;
    }
  } catch {
    // ignore
  }

  return DEFAULT_USER_IDS[normalizedRole] || 6;
}

export async function selectedUrl(url: string, selector = 'userId', userId?: number) {
  const id = userId ?? (await currentSelectedUser()).userId;
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Select a valid userId.');
  return url + (url.includes('?') ? '&' : '?') + selector + '=' + id;
}
