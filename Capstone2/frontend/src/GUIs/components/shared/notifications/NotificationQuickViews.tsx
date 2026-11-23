import { TopbarNotificationPopover } from './TopbarNotificationPopover';
import { TopbarNotificationContent } from './TopbarNotificationContent';
import { announceTopbarPanel, useTopbarDismiss as useDismiss } from '../../../hooks/useTopbarDismiss';
import { useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotificationInbox, clearNotificationInbox } from '../../../hooks/useNotificationInbox';
import { useSelectedUser } from '../../../hooks/useSelectedUser';
import { authApi, getAuthUser, getStaffWorkspaces, switchActiveWorkspace } from '../../../../api/authApi';
import { notificationTime } from '../../../../BLL/services/notificationInbox';
import { notificationRoleLabel, notificationTypeLabel } from '../../../../BLL/services/notificationPresentation';
import './notifications.css';
import NotificationEmptyState from './NotificationEmptyState';
import CenterManagerTopbarAvatar from '../../admin/CenterManager/CenterManagerTopbarAvatar';

function TypeIcon({ type }: { type: string }) {
  const path = type === 'schedule' ? 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2'
    : type === 'tuition' ? 'M3 5h16v14H3zM15 10h7v5h-7z'
    : type === 'reminder' ? 'M12 8v5l3 2M5 3 2 6m17-3 3 3M12 5a8 8 0 1 1 0 16 8 8 0 0 1 0-16'
    : 'M3 10v4h4l12 5V5L7 10zM7 14l2 7h4';
  return <svg className="ntf-type-icon" aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><path d={path} /></svg>;
}
function QuickList({ close, dashboard = false, showViewAll = true }: { close?: () => void; dashboard?: boolean; showViewAll?: boolean }) {
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
    {showViewAll && <Link className="ntf-view-all" to={basePath} onClick={close}>View All</Link>}
  </>;
}
export function DashboardNotificationsCard({ viewAllInHeader = false }: { viewAllInHeader?: boolean }) {
  const { data, basePath } = useNotificationInbox();
  return <section className="ntf-scope card dashboard-card border-0 shadow-sm ntf-dashboard" aria-label="Recent notifications">
    <div className="ntf-heading"><h5>{viewAllInHeader && <svg className="cm-panel-icon" aria-hidden="true" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>}Recent Notifications</h5>
      {viewAllInHeader ? <div className="cm-panel-actions"><span aria-label="Unread notifications count">{data ? data.unreadCount : '—'}</span><Link className="cm-panel-view-all academy-dashboard-link" to={basePath}>View All <i className="bi bi-arrow-right" aria-hidden="true" /></Link></div>
        : <span aria-label="Unread notifications count">{data ? data.unreadCount : '—'}</span>}
    </div>
    <QuickList dashboard showViewAll={!viewAllInHeader} />
  </section>;
}
export function NotificationBellDropdown() {
  const { data, quick, error, loading, store, basePath } = useNotificationInbox();
  return <TopbarNotificationPopover unreadCount={error ? null : data?.unreadCount ?? null}>{close =>
    <TopbarNotificationContent items={data ? quick : null} loading={loading} error={error} retry={store.refresh} basePath={basePath} close={close} />
  }</TopbarNotificationPopover>;
}
export function AdminAccountDropdown({ centerManager = false, adminStaff = false }: { centerManager?: boolean; adminStaff?: boolean }) {
  const selection = useSelectedUser(); const { user: identity, error, loading } = selection;
  const [open, setOpen] = useState(false); const [imageError, setImageError] = useState(false);
  const root = useRef<HTMLDivElement>(null); const trigger = useRef<HTMLButtonElement>(null); const id = useId();
  const navigate = useNavigate();
  useDismiss(open, () => setOpen(false), root, trigger);
  const initials = (centerManager || adminStaff) ? '' : identity?.fullName.split(' ').filter(Boolean).slice(-2).map(w => w[0]).join('') || '?';
  return <div ref={root} className="ntf-scope ntf-anchor">
    <button ref={trigger} className="ntf-account-trigger" type="button" aria-label={`Account: ${identity?.fullName || 'Account information'}`} aria-controls={id} aria-expanded={open} onClick={() => { if (!open) announceTopbarPanel(root); setOpen(!open); }}>
      {(centerManager || adminStaff) ? <CenterManagerTopbarAvatar key={`${identity?.userId}:${identity?.avatarUrl}`} name={identity?.fullName} url={identity?.avatarUrl} />
        : identity?.avatarUrl && !imageError ? <img src={identity.avatarUrl} alt="" onError={() => setImageError(true)} /> : <span className="ntf-avatar">{initials}</span>}
      <span className="ntf-account-label"><strong>{identity?.fullName || (loading ? 'Loading account...' : 'No account selected')}</strong></span>
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
    </button>
    {open && <div className="ntf-popover ntf-account-menu" id={id} role="region" aria-label="Account information">
      {identity ? <div><strong>{identity.fullName}</strong><p>{identity.email || 'No email'}</p><small>{identity.roles?.map(notificationRoleLabel).join(', ')}</small></div>
        : <p>{error || 'No account available to select.'}</p>}
      {(() => {
        const effectiveRoles = identity?.roles?.length ? identity.roles : getAuthUser()?.roles;
        const workspaces = getStaffWorkspaces(effectiveRoles);
        const currentKey = centerManager ? 'center_manager' : adminStaff ? 'admin_staff' : 'teaching';
        if (workspaces.length < 2) return null;
        return (
          <div className="mt-3 pt-2 border-top">
            <small className="text-muted fw-semibold d-block mb-1" style={{ fontSize: '11.5px' }}>
              Switch Workspace
            </small>
            <div className="d-flex flex-column gap-1">
              {workspaces.map((ws) => {
                const isCurrent = ws.key === currentKey;
                return (
                  <button
                    key={ws.key}
                    type="button"
                    disabled={isCurrent}
                    className={`btn btn-sm d-flex align-items-center justify-content-between text-start ${
                      isCurrent ? 'btn-primary fw-semibold' : 'btn-outline-secondary'
                    }`}
                    onClick={() => {
                      setOpen(false);
                      switchActiveWorkspace(ws.role, ws.path);
                      navigate(ws.path);
                    }}
                  >
                    <span>{ws.label}</span>
                    {isCurrent ? (
                      <span className="badge bg-white text-primary">Active</span>
                    ) : (
                      <i className="bi bi-box-arrow-up-right small" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}
      <button type="button" className="btn btn-outline-danger mt-3 w-100" onClick={() => { setOpen(false); clearNotificationInbox(); authApi.logout(); navigate('/'); }}>Logout</button>
    </div>}
  </div>;
}
