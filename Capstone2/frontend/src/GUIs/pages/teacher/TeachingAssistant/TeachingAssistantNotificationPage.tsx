import React, { useEffect, useState, useMemo } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import {
  NotificationList,
  NotificationPagination,
  NotificationsHeader,
} from "../../../components/teacher/TeachingAssistant/notifications";
import teachingDAL from "../../../../DAL/teachingDAL";
import type { TeachingNotificationDto } from "../../../../BLL/models/teaching/TeachingNotificationDto";

const DEFAULT_TA_ID = 5; // Trợ giảng Âu Dương Tài

export default function TeachingAssistantNotificationPage() {
  const [notifications, setNotifications] = useState<TeachingNotificationDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "read">("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Tải danh sách thông báo của Trợ giảng
  useEffect(() => {
    let isMounted = true;
    async function loadNotifications() {
      try {
        setLoading(true);
        const res = await teachingDAL.getNotifications(DEFAULT_TA_ID, filterStatus);
        if (isMounted && res.data) {
          setNotifications(res.data);
        }
      } catch (err) {
        console.warn("Lỗi tải thông báo trợ giảng:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadNotifications();
    return () => {
      isMounted = false;
    };
  }, [filterStatus]);

  // Đánh dấu 1 thông báo là đã đọc
  const handleMarkItemAsRead = async (id: number) => {
    setNotifications((prev) =>
      prev
        .map((n) => (n.notificationId === id ? { ...n, isRead: true, isNew: false } : n))
        .filter((n) => (filterStatus === "unread" ? !n.isRead : true))
    );
    try {
      await teachingDAL.markNotificationAsRead(id);
    } catch (err) {
      console.warn(`Lỗi khi đánh dấu đã đọc thông báo #${id}:`, err);
    }
  };

  // Đánh dấu tất cả thông báo là đã đọc
  const handleMarkAllAsRead = async () => {
    setNotifications((prev) =>
      filterStatus === "unread"
        ? []
        : prev.map((n) => ({ ...n, isRead: true, isNew: false }))
    );
    try {
      await teachingDAL.markAllNotificationsAsRead(DEFAULT_TA_ID);
    } catch (err) {
      console.warn("Lỗi khi đánh dấu đọc tất cả thông báo:", err);
    }
  };

  // Sắp xếp danh sách thông báo theo ngày tạo
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [notifications, sortOrder]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title="Thông Báo &amp; Cập Nhật Trợ Giảng"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teaching-assistant/dashboard" },
          { label: "Thông báo" },
        ]}
      />

      {/* Notification Card */}
      <div className="card class-list-card border-0 mb-4 shadow-sm">
        {/* Card Header */}
        <NotificationsHeader
          filterStatus={filterStatus}
          onFilterStatusChange={(status) => setFilterStatus(status)}
          sortOrder={sortOrder}
          onSortOrderChange={(order) => setSortOrder(order)}
          onMarkAllAsRead={handleMarkAllAsRead}
          unreadCount={unreadCount}
        />

        {loading ? (
          <div className="p-5 text-center">
            <div className="spinner-border text-primary mx-auto mb-2" role="status" />
            <p className="text-muted mb-0">Đang tải thông báo mới nhất...</p>
          </div>
        ) : (
          <>
            {/* Notification List Body */}
            <NotificationList
              notifications={sortedNotifications}
              onMarkItemAsRead={handleMarkItemAsRead}
            />

            {/* Footer Pagination */}
            <NotificationPagination />
          </>
        )}
      </div>
    </>
  );
}
