import React from 'react';
import type { NotificationItem } from '../notificationsData';
import { CATEGORY_CONFIG } from '../notificationsData';

export interface NotificationCardItemProps {
  notification: NotificationItem;
  isUnread: boolean;
  onMarkRead: () => void;
}

export function NotificationCardItem({
  notification: n,
  isUnread,
  onMarkRead,
}: NotificationCardItemProps) {
  const cfg = CATEGORY_CONFIG[n.category] || CATEGORY_CONFIG.system;

  return (
    <button
      type="button"
      className={`notification-item-btn ${isUnread ? 'is-unread' : ''} ${cfg.cls}`}
      onClick={onMarkRead}
    >
      <div className="notif-category-icon-box">
        <i className={`bi ${cfg.icon}`}></i>
      </div>
      <div className="notif-main-content">
        <div className="notif-title-row">
          <span className="notif-title-text">{n.title}</span>
          <span className="notif-category-badge">{cfg.label}</span>
        </div>
        <p className="notif-summary-text">{n.summary}</p>
      </div>
      <div className="notif-right-meta">
        <div className="notif-time-text">
          <i className="bi bi-clock"></i>
          <span>{n.timestamp}</span>
        </div>
        {isUnread && <span className="notif-unread-dot"></span>}
      </div>
    </button>
  );
};

export default NotificationCardItem;
