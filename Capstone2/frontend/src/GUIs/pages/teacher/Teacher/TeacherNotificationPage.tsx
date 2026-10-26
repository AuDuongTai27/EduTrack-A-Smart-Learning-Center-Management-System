import { useEffect, useState } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import {
  NotificationList,
  NotificationPagination,
  NotificationsHeader
} from "../../../components/teacher/Teacher/notifications";
import notificationDAL from "../../../../DAL/notificationDAL";
import type { NotificationDto } from "../../../../BLL/models/NotificationDto";

export default function TeacherNotificationPage() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchNotifications() {
      try {
        setLoading(true);
        // GetAll: Fetch all notifications
        const res = await notificationDAL.getAllNotifications();
        if (isMounted) {
          setNotifications(res.data);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchNotifications();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title="Notifications"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teacher/dashboard" },
          { label: "Notifications" },
        ]}
      />

      {/* Notification */}
      <div className="card class-list-card border-0 mb-4">
        {/* Card Header */}
        <NotificationsHeader />

        {loading ? (
          <div className="p-5 text-center">
            <div className="spinner-border text-primary mx-auto mb-2" role="status" />
            <p className="text-muted mb-0">Loading notifications...</p>
          </div>
        ) : (
          <>
            {/* Notification List Body */}
            <NotificationList notifications={notifications} />
            {/* Footer Pagination */}
            <NotificationPagination />
          </>
        )}
      </div>
    </>
  );
}
