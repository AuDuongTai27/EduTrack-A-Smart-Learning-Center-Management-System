import { useId, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { announceTopbarPanel, useTopbarDismiss } from '../../../hooks/useTopbarDismiss';
import './notifications.css';

/** Presentation only: each caller retains its existing role-specific inbox. */
export function TopbarNotificationPopover({ unreadCount, children }: {
  unreadCount: number | null;
  children: (close: () => void) => ReactNode;
}) {
  const [openAt, setOpenAt] = useState<string | null>(null);
  const location = useLocation();
  const open = openAt === location.key;
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const close = () => setOpenAt(null);
  useTopbarDismiss(open, close, root, trigger);
  return <div ref={root} className="ntf-scope ntf-anchor">
    <button ref={trigger} type="button" className="icon-btn notification-btn position-relative"
      aria-label={`Notifications (${unreadCount ?? 'not loaded'} unread)`}
      aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => {
        if (!open) announceTopbarPanel(root);
        setOpenAt(open ? null : location.key);
      }}>
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
      {unreadCount !== null && unreadCount > 0 && <span className="ntf-count">{unreadCount > 99 ? '99+' : unreadCount}</span>}
    </button>
    {open && <div id={id} className="ntf-popover" role="region" aria-label="Recent notifications">
      <div className="ntf-heading"><h5>Recent Notifications</h5><span>{unreadCount ?? '—'} unread</span></div>
      {children(close)}
    </div>}
  </div>;
}
