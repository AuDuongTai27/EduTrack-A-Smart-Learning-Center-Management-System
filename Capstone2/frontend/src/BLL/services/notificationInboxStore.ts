import { nextExpiry, quickNotifications, type InboxSnapshot } from './notificationInbox';
import { notificationInboxApi } from '../../api/notificationInboxApi';
import type { NotificationDto } from '../models/NotificationDto';

export interface InboxState { data: InboxSnapshot | null; quick: NotificationDto[]; loading: boolean; error: string | null; busy: boolean }
// One store per local identity/role boundary; only the server establishes identity.
export class NotificationInboxStore {
  private state: InboxState = { data: null, quick: [], loading: true, error: null, busy: false };
  private listeners = new Set<() => void>();
  private controller: AbortController | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private poll: ReturnType<typeof setInterval> | undefined;
  private generation = 0;
  private serverTime = 0;
  private monotonic = 0;
  private role: string;
  private api: typeof notificationInboxApi;
  private elapsed: () => number;
  constructor(role: string, api = notificationInboxApi, elapsed = () => performance.now()) {
    this.role = role; this.api = api; this.elapsed = elapsed;
  }
  getSnapshot = () => this.state;
  private publish(patch: Partial<InboxState>) { this.state = { ...this.state, ...patch }; this.listeners.forEach(l => l()); }
  private now = () => this.serverTime + this.elapsed() - this.monotonic;
  private updateQuick = () => {
    clearTimeout(this.timer);
    const rows = this.state.data?.inbox ?? []; const now = this.now();
    this.publish({ quick: quickNotifications(rows, now) });
    const expiry = nextExpiry(rows, now);
    if (Number.isFinite(expiry) && this.listeners.size)
      this.timer = setTimeout(this.updateQuick, Math.max(1, Math.min(2147483647, expiry - now)));
  };
  private accept(data: InboxSnapshot) {
    const roles = this.role === 'teaching_assistant' ? ['teaching_assistant', 'ta'] : [this.role];
    if (!data.identity.roles.some(r => roles.includes(r))) throw new Error('Tài khoản không có vai trò của trang hiện tại.');
    this.serverTime = Date.parse(data.serverNowUtc); this.monotonic = this.elapsed();
    this.publish({ data, loading: false, error: null }); this.updateQuick();
  }
  private fail(error: unknown) {
    // Failed identity verification must never leave the preceding user's inbox visible.
    clearTimeout(this.timer);
    this.publish({ data: null, quick: [], loading: false, error: error instanceof Error ? error.message : 'Không tải được thông báo.' });
  }
  refresh = async () => {
    if (this.state.busy) return;
    this.controller?.abort(); const controller = this.controller = new AbortController(); const generation = ++this.generation;
    this.publish({ loading: true });
    try { const data = await this.api.snapshot(controller.signal); if (generation === this.generation) this.accept(data); }
    catch (error) { if (!controller.signal.aborted && generation === this.generation) this.fail(error); }
  };
  mutate = async (operation: 'read' | 'read-all' | 'delete' | 'restore', id?: number) => {
    if (this.state.busy) throw new Error('Đang xử lý thông báo.');
    this.controller?.abort(); const controller = this.controller = new AbortController(); const generation = ++this.generation;
    this.publish({ busy: true });
    try {
      const data = await this.api.mutate(operation, id, controller.signal);
      if (generation !== this.generation) throw new Error('Danh tính đã thay đổi.');
      this.accept(data);
      try { localStorage.setItem('edutrack-notifications-invalidated', String(Date.now())); } catch { /* Storage may be disabled; same-tab state is already shared. */ }
    } catch (error) {
      if (generation === this.generation) {
        const status = (error as { status?: number })?.status;
        if (status === 401 || status === 403) this.fail(error);
        else this.publish({ error: error instanceof Error ? error.message : 'Thao tác thất bại.' });
      }
      throw error;
    } finally { if (generation === this.generation) this.publish({ busy: false }); }
  };
  private focus = () => { if (document.visibilityState === 'visible') void this.refresh(); };
  private storage = (e: StorageEvent) => { if (e.key === 'edutrack-notifications-invalidated') void this.refresh(); };
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    if (this.listeners.size === 1) {
      void this.refresh(); window.addEventListener('focus', this.focus); document.addEventListener('visibilitychange', this.focus);
      window.addEventListener('storage', this.storage); this.poll = setInterval(this.focus, 60000);
    }
    return () => {
      this.listeners.delete(listener);
      if (!this.listeners.size) this.stop();
    };
  };
  stop() {
    this.controller?.abort(); ++this.generation; clearTimeout(this.timer); clearInterval(this.poll);
    window.removeEventListener('focus', this.focus); document.removeEventListener('visibilitychange', this.focus);
    window.removeEventListener('storage', this.storage);
    this.state = { data: null, quick: [], loading: true, error: null, busy: false };
  }
}
