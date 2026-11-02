import React, { useEffect, useState, useMemo } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import {
  NotificationList,
  NotificationPagination,
  NotificationsHeader,
} from "../../../components/teacher/Teacher/notifications";
import teachingDAL from "../../../../DAL/teachingDAL";
import type { TeachingNotificationDto } from "../../../../BLL/models/teaching/TeachingNotificationDto";

const DEFAULT_TEACHER_ID = 3; // ThS. Hoàng Quốc Việt

export default function TeacherNotificationPage() {
  const [notifications, setNotifications] = useState<TeachingNotificationDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "read">("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Tải danh sách thông báo
  useEffect(() => {
    let isMounted = true;
    async function fetchNotifications() {
      try {
        setLoading(true);
        const res = await teachingDAL.getNotifications(DEFAULT_TEACHER_ID, filterStatus);
        if (isMounted && res.data) {
          setNotifications(res.data);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách thông báo giáo viên:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchNotifications();
    return () => {
      isMounted = false;
    };
  }, [filterStatus]);

  // Đánh dấu 1 thông báo là đã đọc
  const handleMarkItemAsRead = async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.notificationId === id ? { ...n, isRead: true, isNew: false } : n))
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
      prev.map((n) => ({ ...n, isRead: true, isNew: false }))
    );
    try {
      await teachingDAL.markAllNotificationsAsRead(DEFAULT_TEACHER_ID);
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
        title="Thông Báo Giảng Dạy"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teacher/dashboard" },
          { label: "Thông báo" },
        ]}
      />

      {/* Notification Card */}
      <div className="card class-list-card border-0 mb-4 shadow-sm">
        {/* Card Header & Actions */}
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
            <p className="text-muted mb-0">Đang tải thông báo...</p>
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
