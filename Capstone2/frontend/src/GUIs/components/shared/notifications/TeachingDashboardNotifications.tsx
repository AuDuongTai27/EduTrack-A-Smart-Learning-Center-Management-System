import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotificationInbox } from '../../../hooks/useNotificationInbox';
import { notificationTime } from '../../../../BLL/services/notificationInbox';
import NotificationEmptyState from './NotificationEmptyState';
import './notifications.css';

function SenderAvatar({ url, type }: { url?: string | null; type: string }) {
  const [failed, setFailed] = useState(false);
  // Preserve the initials/color choices of the existing Teaching notification UI.
  const initials = type === 'leave' ? 'HC' : type === 'schedule' ? 'ĐT' : type === 'system' ? 'ET' : 'ES';
  const color = type === 'leave' ? 'warning' : type === 'schedule' ? 'info' : type === 'system' ? 'primary' : 'success';
  return url && !failed ? <img src={url} alt="" width={38} height={38} className="ntf-sender-avatar rounded-circle flex-shrink-0" onError={() => setFailed(true)} />
    : <span aria-hidden="true" className={`notice-icon ntf-sender-avatar bg-${color}-subtle text-${color} rounded-circle d-flex align-items-center justify-content-center flex-shrink-0`}>
      <span className="fw-bold small">{initials}</span>
    </span>;
}

export default function TeachingDashboardNotifications() {
  const { data, quick, loading, error, store, basePath } = useNotificationInbox();
  const unreadQuick = quick.filter(n => !n.isRead);
  return <section className="ntf-scope ntf-dashboard ntf-teaching-dashboard card dashboard-card d-flex flex-column" aria-label="Recent Notifications">
    <div className="card-header dashboard-card-header d-flex align-items-center justify-content-between gap-2">
      <div><h5 className="mb-1 d-flex align-items-center gap-2 flex-wrap"><span>New Notifications</span>
        <span className="badge bg-danger rounded-pill px-2 py-1 small fw-semibold" aria-label="Unread notifications count">{data ? data.unreadCount : '—'} new</span>
      </h5><small className="text-muted">Recent notifications from EduTrack Center</small></div>
      <Link to={basePath} className="dashboard-view-all">View All</Link>
    </div>
    <div className="card-body dashboard-card-body">
      {error ? <div role="alert" className="text-danger">{error} <button type="button" className="btn btn-sm btn-outline-secondary" onClick={store.refresh}>Retry</button></div>
        : loading && !data ? <p role="status">Loading notifications...</p>
        : !data ? <p role="status">Select an account to view notifications.</p>
        : !unreadQuick.length ? <NotificationEmptyState />
        : <ul className="ntf-quick-list notice-list d-flex flex-column gap-3">{unreadQuick.map(n => <li key={n.notificationId}>
          <Link to={`${basePath}?notificationId=${n.notificationId}`} className="ntf-teaching-item notice-item d-flex align-items-start gap-3 p-2 rounded-2"
            onKeyDown={e => { if (e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}>
            <SenderAvatar key={n.senderAvatarUrl ?? ''} url={n.senderAvatarUrl} type={n.type} />
            <div className="notice-content flex-grow-1">
              <div className="ntf-teaching-title d-flex align-items-start justify-content-between gap-2 mb-1">
                <h6 className="mb-0 fw-semibold text-dark">{n.title}</h6>
                {!n.isRead && <span className="ntf-new-badge badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2 small">New!</span>}
              </div>
              <p className="mb-1 text-muted small ntf-clamp">{n.content}</p>
              <div className="ntf-teaching-meta d-flex align-items-center flex-wrap gap-2 text-muted small">
                <span className="fw-medium text-secondary">{n.senderName || 'No sender information'}</span>
                <span aria-hidden="true">•</span><time dateTime={n.createdAt}>{notificationTime(n.createdAt)}</time>
              </div>
            </div>
          </Link>
        </li>)}</ul>}
    </div>
  </section>;
}
