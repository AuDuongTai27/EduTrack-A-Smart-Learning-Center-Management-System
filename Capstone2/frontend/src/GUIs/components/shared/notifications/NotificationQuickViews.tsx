import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useNotificationInbox, clearNotificationInbox } from '../../../hooks/useNotificationInbox';
import { useSelectedUser } from '../../../hooks/useSelectedUser';
import { notificationTime } from '../../../../BLL/services/notificationInbox';
import { notificationRoleLabel, notificationTypeLabel } from '../../../../BLL/services/notificationPresentation';
import './notifications.css';
import NotificationEmptyState from './NotificationEmptyState';

function TypeIcon({ type }: { type: string }) {
  const path = type === 'schedule' ? 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2'
    : type === 'tuition' ? 'M3 5h16v14H3zM15 10h7v5h-7z'
    : type === 'reminder' ? 'M12 8v5l3 2M5 3 2 6m17-3 3 3M12 5a8 8 0 1 1 0 16 8 8 0 0 1 0-16'
    : 'M3 10v4h4l12 5V5L7 10zM7 14l2 7h4';
  return <svg className="ntf-type-icon" aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><path d={path} /></svg>;
}
function useDismiss(open: boolean, close: () => void, root: React.RefObject<HTMLDivElement | null>, trigger: React.RefObject<HTMLButtonElement | null>) {
  useEffect(() => {
    if (!open) return;
    function outside(e: PointerEvent) { if (!root.current?.contains(e.target as Node)) close(); }
    function keyboard(e: KeyboardEvent) { if (e.key === 'Escape') { close(); trigger.current?.focus(); } }
    document.addEventListener('pointerdown', outside); document.addEventListener('keydown', keyboard);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', keyboard); };
  }, [open, close, root, trigger]);
}
function QuickList({ close, dashboard = false }: { close?: () => void; dashboard?: boolean }) {
  const { data, quick, error, loading, store, basePath } = useNotificationInbox();
  return <>
    {error ? <div role="alert" className="p-3 text-danger">{error} <button type="button" className="btn btn-sm btn-outline-secondary" onClick={store.refresh}>Retry</button></div>
      : !data && loading ? <p role="status" className="p-3">Loading notifications...</p>
      : quick.length ? <ul className="ntf-quick-list">{quick.map(n => <li key={n.notificationId}>
        <Link to={`${basePath}?notificationId=${n.notificationId}`} onClick={close} className={`ntf-item ${!n.isRead ? 'ntf-unread' : ''}`}>
          <TypeIcon type={n.type} />
          <div><strong>{n.title}</strong><p className="ntf-clamp">{n.content}</p>
            <small>{notificationTypeLabel(n.type)} · {n.senderName || 'No sender information'} · {notificationTime(n.createdAt)}</small>
          </div>{!n.isRead && <span className="ntf-dot" aria-label="Unread" />}
        </Link></li>)}</ul>
      : dashboard && data ? <NotificationEmptyState /> : <p className="p-3 text-muted">You're all caught up with new notifications.</p>}
    <Link className="ntf-view-all" to={basePath} onClick={close}>View All</Link>
  </>;
}
export function DashboardNotificationsCard() {
  const { data } = useNotificationInbox();
  return <section className="ntf-scope card dashboard-card border-0 shadow-sm ntf-dashboard" aria-label="Recent notifications">
    <div className="ntf-heading"><h5>Recent Notifications</h5><span aria-label="Unread notifications count">{data ? data.unreadCount : '—'}</span></div>
    <QuickList dashboard />
  </section>;
}
export function NotificationBellDropdown() {
  const { data } = useNotificationInbox(); const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null); const trigger = useRef<HTMLButtonElement>(null); const id = useId();
  useDismiss(open, () => setOpen(false), root, trigger);
  return <div ref={root} className="ntf-scope ntf-anchor">
    <button ref={trigger} type="button" className="icon-btn notification-btn position-relative" aria-label={`Notifications (${data?.unreadCount ?? 'not loaded'} unread)`}
      aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>{data && data.unreadCount > 0 && <span className="ntf-count">{data.unreadCount > 99 ? '99+' : data.unreadCount}</span>}
    </button>
    {open && <div id={id} className="ntf-popover" role="region" aria-label="Recent notifications">
      <div className="ntf-heading"><h5>Recent Notifications</h5><span>{data ? data.unreadCount : '—'} unread</span></div><QuickList close={() => setOpen(false)} />
    </div>}
  </div>;
}
export function AdminAccountDropdown() {
  const selection = useSelectedUser(); const { user: identity, error, loading } = selection;
  const [open, setOpen] = useState(false); const [imageError, setImageError] = useState(false);
  const root = useRef<HTMLDivElement>(null); const trigger = useRef<HTMLButtonElement>(null); const id = useId();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useDismiss(open, () => setOpen(false), root, trigger);
  const initials = identity?.fullName.split(' ').filter(Boolean).slice(-2).map(w => w[0]).join('') || '?';
  return <div ref={root} className="ntf-scope ntf-anchor">
    <button ref={trigger} className="ntf-account-trigger" type="button" aria-label="Account" aria-controls={id} aria-expanded={open} onClick={() => setOpen(!open)}>
      {identity?.avatarUrl && !imageError ? <img src={identity.avatarUrl} alt="" onError={() => setImageError(true)} /> : <span className="ntf-avatar">{initials}</span>}
      <span className="ntf-account-label"><strong>{identity?.fullName || (loading ? 'Loading account...' : 'No account selected')}</strong><small>{identity?.userCode || 'Select from system data'}</small></span>
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
    </button>
    {open && <div className="ntf-popover ntf-account-menu" id={id} role="region" aria-label="Account information">
      {identity ? <div><strong>{identity.fullName}</strong><p>{identity.email || 'No email'}</p><small>{identity.userCode} · {identity.roles?.map(notificationRoleLabel).join(', ')}</small></div>
        : <p>{error || 'No account available to select.'}</p>}
      <label className="d-block mt-2">Data Account<select className="form-select" value={identity?.userId ?? ''} onChange={e => { if (pathname.endsWith('/notifications')) navigate({ search: '' }, { replace: true }); clearNotificationInbox(); selection.select(Number(e.target.value)); }}><option value="" disabled>Select account</option>{selection.users.map(u => <option key={u.userId} value={u.userId}>{u.fullName} ({u.userCode})</option>)}</select></label>
      <button type="button" className="btn btn-outline-secondary mt-3" onClick={() => { setOpen(false); clearNotificationInbox(); navigate('/'); }}>Back to Home</button>
    </div>}
  </div>;
}
