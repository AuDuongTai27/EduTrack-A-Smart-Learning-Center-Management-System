import { Link } from 'react-router-dom';
import type { NotificationDto } from '../../../../BLL/models/NotificationDto';
import { notificationTime } from '../../../../BLL/services/notificationInbox';
import { notificationTypeLabel } from '../../../../BLL/services/notificationPresentation';

/** Topbar-only presentation. Callers retain account scope and the full inbox. */
export function TopbarNotificationContent({ items, loading, error, retry, basePath, close }: {
  items: NotificationDto[] | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
  basePath: string;
  close: () => void;
}) {
  return <>
    {error ? <div className="ntf-preview-status text-danger" role="alert">{error}
      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={retry}>Retry</button>
    </div> : items === null ? <p className="ntf-preview-status" role="status">{loading ? 'Loading notifications...' : 'Notifications are waiting for your account context.'}</p>
      : items.length ? <ul className="ntf-quick-list">{items.map(item => <li key={item.notificationId}>
        <Link className="ntf-item ntf-unread" to={`${basePath}?notificationId=${item.notificationId}`} onClick={close}>
          <span className="ntf-preview-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
          </span>
          <div><strong>{item.title}</strong><p className="ntf-clamp">{item.content}</p>
            <small>{item.senderName || item.className || notificationTypeLabel(item.type)} · <time dateTime={item.createdAt}>{notificationTime(item.createdAt)}</time></small>
          </div>
          <span className="ntf-dot" aria-label="Unread" />
        </Link>
      </li>)}</ul> : <div className="ntf-preview-empty" role="status">
        <svg className="ntf-preview-empty-icon" aria-hidden="true" width="52" height="52" viewBox="0 0 52 52" fill="none">
          <circle cx="26" cy="26" r="26" fill="currentColor" opacity=".1" />
          <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M34 23a8 8 0 0 0-16 0c0 9-3 9-3 11h15M23 39h4" /><circle cx="36" cy="34" r="7" fill="white" /><path d="m33 34 2 2 4-4" /></g>
        </svg>
        <h6>You're all caught up!</h6><p>No unread notifications right now.</p>
      </div>}
    <Link className="ntf-view-all" to={basePath} onClick={close}>View All <i className="bi bi-arrow-right" aria-hidden="true" /></Link>
  </>;
}
