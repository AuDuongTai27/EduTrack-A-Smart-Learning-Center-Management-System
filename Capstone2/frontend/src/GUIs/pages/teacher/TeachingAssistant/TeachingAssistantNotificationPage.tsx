import { useEffect, useState } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import {
  NotificationList,
  NotificationPagination,
  NotificationsHeader,
} from "../../../components/teacher/TeachingAssistant/notifications";
import notificationDAL from "../../../../DAL/notificationDAL";
import type { NotificationDto } from "../../../../BLL/models/NotificationDto";

export default function TeachingAssistantNotificationPage() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadNotifications() {
      try {
        setLoading(true);
        const res = await notificationDAL.getAllNotifications();
        if (isMounted && res.data) {
          setNotifications(res.data);
        }
      } catch (err) {
        console.warn("Lỗi tải thông báo TA:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadNotifications();
    return () => {
      isMounted = false;
    };
  }, []);

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

      {loading && (
        <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>Đang tải thông báo mới nhất...</span>
        </div>
      )}

      {/* Notification */}
      <div className="card class-list-card border-0 mb-4">
        {/* Card Header */}
        <NotificationsHeader />
        {/* Notification List Body */}
        <NotificationList notifications={notifications} />
        {/* Footer Pagination */}
        <NotificationPagination />
      </div>
    </>
  );
}
