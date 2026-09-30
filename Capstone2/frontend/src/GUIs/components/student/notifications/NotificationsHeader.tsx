import React from 'react';

interface NotificationsHeaderProps {
  unreadCount: number;
  onMarkAllRead: () => void;
  onOpenPreferences: () => void;
}

export const NotificationsHeader: React.FC<NotificationsHeaderProps> = ({
  unreadCount,
  onMarkAllRead,
  onOpenPreferences,
}) => {
  return (
    <div className="notifications-topbar-header">
      <div>
        <h1 className="page-title fs-3 fw-bold">Thông báo</h1>
        <p className="page-subtitle" id="unreadSubtitle">
          {unreadCount > 0
            ? `Bạn có ${unreadCount} thông báo chưa đọc`
            : 'Đã đọc hết tất cả thông báo!'}
        </p>
      </div>
      <div className="notifications-actions-group">
        {unreadCount > 0 && (
          <button
            type="button"
            className="btn-mark-all-read"
            id="btnMarkAllRead"
            onClick={onMarkAllRead}
          >
            <i className="bi bi-check2-all fs-6 text-primary"></i>
            <span>Đánh dấu đã đọc tất cả</span>
          </button>
        )}
        <button
          type="button"
          className="btn-notification-settings"
          onClick={onOpenPreferences}
        >
          <i className="bi bi-sliders"></i>
          <span>Tùy chọn nhận tin</span>
        </button>
      </div>
    </div>
  );
};

export default NotificationsHeader;
