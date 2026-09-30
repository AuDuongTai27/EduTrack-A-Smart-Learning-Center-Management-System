import React from 'react';
import type { NotificationItem } from './notificationsData';
import { CATEGORY_CONFIG } from './notificationsData';

interface NotificationsListProps {
  notifications: NotificationItem[];
  readIds: Set<number>;
  onMarkRead: (id: number) => void;
}

export const NotificationsList: React.FC<NotificationsListProps> = ({
  notifications,
  readIds,
  onMarkRead,
}) => {
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
          const cfg = CATEGORY_CONFIG[n.category] || CATEGORY_CONFIG.system;

          return (
            <button
              key={n.id}
              type="button"
              className={`notification-item-btn ${isUnread ? 'is-unread' : ''} ${cfg.cls}`}
              onClick={() => onMarkRead(n.id)}
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
        })}
      </div>

      <p className="text-center text-muted small mt-4" id="notifFooterNote">
        Hiển thị {notifications.length} thông báo · Nhấn vào thông báo để đánh dấu đã đọc
      </p>
    </>
  );
};

export default NotificationsList;
