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
        <h3 className="notif-empty-title">Không có thông báo nào</h3>
        <p className="notif-empty-desc">
          Bạn đã cập nhật hết mọi thông tin hoặc thử chọn bộ lọc khác.
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
        Hiển thị {notifications.length} thông báo &middot; Nhấn vào thông báo để đánh dấu đã đọc
      </p>
    </>
  );
};

export default NotificationsList;
