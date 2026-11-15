import React from 'react';
import type { NotificationItem } from './notificationsData';
import { NotificationCardItem } from './components/NotificationCardItem';

interface NotificationsListProps {
  notifications: NotificationItem[];
  readIds: Set<number>;
  onMarkRead: (id: number) => void;
}

export function NotificationsList({
  notifications,
  readIds,
  onMarkRead,
}: NotificationsListProps) {
  if (notifications.length === 0) {
    return (
      <div className="notif-empty-state" id="notifEmptyState">
        <div className="notif-empty-icon-box">
          <i className="bi bi-bell-slash"></i>
        </div>
        <h3 className="notif-empty-title">No notifications</h3>
        <p className="notif-empty-desc">
          You are all caught up, or try selecting a different filter.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="notification-list-card" id="notifListContainer">
        {notifications.map((n) => {
          const isUnread = n.unread && !readIds.has(n.id);
          return (
            <NotificationCardItem
              key={n.id}
              notification={n}
              isUnread={isUnread}
              onMarkRead={() => onMarkRead(n.id)}
            />
          );
        })}
      </div>

      <p className="text-center text-muted small mt-4" id="notifFooterNote">
        Showing {notifications.length} notifications &middot; Click on a notification to mark as read
      </p>
    </>
  );
};

export default NotificationsList;
