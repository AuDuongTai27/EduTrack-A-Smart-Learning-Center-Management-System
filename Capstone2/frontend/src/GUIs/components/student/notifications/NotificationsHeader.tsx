import React from 'react';
import { StudentPageHeader } from '../common/StudentPageHeader';

interface NotificationsHeaderProps {
  unreadCount: number;
  onMarkAllRead: () => void;
  onOpenPreferences: () => void;
}

export function NotificationsHeader({
  unreadCount,
  onMarkAllRead,
  onOpenPreferences,
}: NotificationsHeaderProps) {
  const actions = (
    <div className="notifications-actions-group d-flex align-items-center gap-2">
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
  );

  return (
    <StudentPageHeader
      title="Thông báo"
      subtitle={
        unreadCount > 0
          ? `Bạn có ${unreadCount} thông báo chưa đọc`
          : 'Đã đọc hết tất cả thông báo!'
      }
      breadcrumbs={[
        { label: 'Trang chủ', href: '/student/dashboard' },
        { label: 'Thông báo' },
      ]}
      actions={actions}
    />
  );
}

export default NotificationsHeader;
