import React, { useState, useEffect } from 'react';
import {
  INITIAL_NOTIFICATIONS,
  type NotificationItem,
} from '../../components/student/notifications/notificationsData';
import type { NotifTabType } from '../../components/student/notifications/NotificationsFilterTabs';
import { NotificationsHeader } from '../../components/student/notifications/NotificationsHeader';
import { NotificationsFilterTabs } from '../../components/student/notifications/NotificationsFilterTabs';
import { NotificationsList } from '../../components/student/notifications/NotificationsList';
import { NotificationsPreferencesModal } from '../../components/student/notifications/NotificationsPreferencesModal';
import { learningDAL, DEFAULT_STUDENT_ID } from '../../../DAL/learningDAL';

export function StudentNotificationsPage() {
  const [activeTab, setActiveTab] = useState<NotifTabType>('All');
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [readIds, setReadIds] = useState<Set<number>>(new Set());
  const [prefsOpen, setPrefsOpen] = useState<boolean>(false);

  useEffect(() => {
    document.title = 'Thông báo học tập – EduTrack';
    let isMounted = true;

    async function loadNotifications() {
      const items = await learningDAL.getStudentNotifications(DEFAULT_STUDENT_ID);
      if (isMounted && items.length > 0) {
        setNotifications(items);
      }
    }

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  const getUnreadCount = (): number => {
    return notifications.filter((n) => n.unread && !readIds.has(n.id)).length;
  };

  const handleMarkRead = async (id: number) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
    await learningDAL.markNotificationRead(id);
  };

  const handleMarkAllRead = async () => {
    setReadIds(new Set(notifications.map((n) => n.id)));
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    await learningDAL.markAllNotificationsRead(DEFAULT_STUDENT_ID, DEFAULT_STUDENT_ID);
  };

  const filteredNotifications = notifications.filter((n) => {
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
}

export default StudentNotificationsPage;
