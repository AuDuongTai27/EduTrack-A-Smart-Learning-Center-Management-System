import React from 'react';

export type NotifTabType = 'All' | 'Unread' | 'Class' | 'System';

interface NotificationsFilterTabsProps {
  activeTab: NotifTabType;
  onTabChange: (tab: NotifTabType) => void;
  unreadCount: number;
}

export const NotificationsFilterTabs: React.FC<NotificationsFilterTabsProps> = ({
  activeTab,
  onTabChange,
  unreadCount,
}) => {
  return (
    <div className="notification-filter-tabs">
      <button
        type="button"
        className={`btn-notif-tab ${activeTab === 'All' ? 'active' : ''}`}
        onClick={() => onTabChange('All')}
      >
        <span>Tất cả</span>
      </button>

      <button
        type="button"
        className={`btn-notif-tab ${activeTab === 'Unread' ? 'active' : ''}`}
        onClick={() => onTabChange('Unread')}
      >
        <span>Chưa đọc</span>
        {unreadCount > 0 && (
          <span className="tab-unread-counter" id="unreadTabCounter">
            {unreadCount}
          </span>
        )}
      </button>

      <button
        type="button"
        className={`btn-notif-tab ${activeTab === 'Class' ? 'active' : ''}`}
        onClick={() => onTabChange('Class')}
      >
        <span>Lớp học</span>
      </button>

      <button
        type="button"
        className={`btn-notif-tab ${activeTab === 'System' ? 'active' : ''}`}
        onClick={() => onTabChange('System')}
      >
        <span>Hệ thống</span>
      </button>
    </div>
  );
};

export default NotificationsFilterTabs;
