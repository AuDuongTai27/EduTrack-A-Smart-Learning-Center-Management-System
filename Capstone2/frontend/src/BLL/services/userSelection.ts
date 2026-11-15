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
export async function currentSelectedUser() {
  const role = selectionRole(); await loadSelection(role);
  const state = getSelection(role);
  if (!state.user) throw new Error(state.error || 'Select an account to view data.');
  return state.user;
}
export async function selectedUrl(url: string, selector = 'userId', userId?: number) {
  const id = userId ?? (await currentSelectedUser()).userId;
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Select a valid userId.');
  return url + (url.includes('?') ? '&' : '?') + selector + '=' + id;
}
