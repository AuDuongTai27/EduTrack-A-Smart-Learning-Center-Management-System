import React, { useState } from 'react';
import { INITIAL_NOTIFICATIONS } from '../../components/student/notifications/notificationsData';
import type { NotifTabType } from '../../components/student/notifications/NotificationsFilterTabs';
import { NotificationsHeader } from '../../components/student/notifications/NotificationsHeader';
import { NotificationsFilterTabs } from '../../components/student/notifications/NotificationsFilterTabs';
import { NotificationsList } from '../../components/student/notifications/NotificationsList';
import { NotificationsPreferencesModal } from '../../components/student/notifications/NotificationsPreferencesModal';

export const StudentNotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NotifTabType>('All');
  const [readIds, setReadIds] = useState<Set<number>>(new Set());
  const [prefsOpen, setPrefsOpen] = useState<boolean>(false);

  const getUnreadCount = (): number => {
    return INITIAL_NOTIFICATIONS.filter((n) => n.unread && !readIds.has(n.id)).length;
  };

  const handleMarkRead = (id: number) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handleMarkAllRead = () => {
    setReadIds(new Set(INITIAL_NOTIFICATIONS.map((n) => n.id)));
  };

  const filteredNotifications = INITIAL_NOTIFICATIONS.filter((n) => {
    const isUnread = n.unread && !readIds.has(n.id);
    if (activeTab === 'Unread') return isUnread;
    if (activeTab === 'Class') return n.category === 'class';
    if (activeTab === 'System') return n.category === 'system' || n.category === 'payment';
    return true;
  });

  const unreadCount = getUnreadCount();

  return (
    <main className="main-content">
      <div className="content-container notifications-container">
        {/* 1. Header with Actions */}
        <NotificationsHeader
          unreadCount={unreadCount}
          onMarkAllRead={handleMarkAllRead}
          onOpenPreferences={() => setPrefsOpen(true)}
        />

        {/* 2. Filter Tabs */}
        <NotificationsFilterTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          unreadCount={unreadCount}
        />

        {/* 3. List / Empty State */}
        <NotificationsList
          notifications={filteredNotifications}
          readIds={readIds}
          onMarkRead={handleMarkRead}
        />
      </div>

      {/* Preferences Modal */}
      <NotificationsPreferencesModal
        isOpen={prefsOpen}
        onClose={() => setPrefsOpen(false)}
      />
    </main>
  );
};

export default StudentNotificationsPage;
