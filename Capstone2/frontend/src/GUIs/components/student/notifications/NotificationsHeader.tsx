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
          <span>Mark all as read</span>
        </button>
      )}
      <button
        type="button"
        className="btn-notification-settings"
        onClick={onOpenPreferences}
      >
        <i className="bi bi-sliders"></i>
        <span>Notification Preferences</span>
      </button>
    </div>
  );

  return (
    <StudentPageHeader
      title="Notifications"
      subtitle={
        unreadCount > 0
          ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
          : 'All notifications read!'
      }
      breadcrumbs={[
        { label: 'Home', href: '/student/dashboard' },
        { label: 'Notifications' },
      ]}
      actions={actions}
    />
  );
}

export default NotificationsHeader;
